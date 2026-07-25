#!/usr/bin/env python3
"""
Jira CLI Tool — reusable script for common Jira operations.
Usage: python3 /home/ubuntu/.hermes/scripts/jira.py <command> [args]

Commands:
  project [KEY]        — List project(s) or get project details
  issues [JQL]         — Search issues by JQL (default: project=EA)
  issue KEY            — Get issue details
  epic-tree [KEY]      — Show epic + child issues for a project
  board [KEY]          — List boards for a project
  transitions KEY      — List available transitions for an issue
  transition KEY DONE|IN_PROGRESS|TO_DO — Move issue to a status
  assign KEY user      — Assign issue to a user
  status               — Summary of project status

Examples:
  python3 jira.py project EA
  python3 jira.py issues "project=EA AND status='To Do'"
  python3 jira.py issue EA-8
  python3 jira.py epic-tree EA
  python3 jira.py status
  python3 jira.py transition EA-37 DONE
"""

import json
import subprocess
import sys
from collections import Counter
from pathlib import Path
from urllib.parse import quote, unquote

# ── Config ──────────────────────────────────────────────────────────────
JIRA_BASE = "https://fikrihasani471.atlassian.net"

# Auth: read base64-encoded "email:api_token" from .jira_auth file
AUTH_FILE = Path(__file__).parent / ".jira_auth"

# ── Helpers ─────────────────────────────────────────────────────────────

def get_auth():
    """Read auth from .jira_auth file and decode to 'email:token'."""
    import base64
    raw = AUTH_FILE.read_text().strip()
    return base64.b64decode(raw).decode()

def jira_post(path, body=None):
    """POST to Jira REST API (new /search/jql endpoint)."""
    auth = get_auth()
    url = f"{JIRA_BASE}{path}"
    cmd = ["curl", "-s", "-u", auth, "-X", "POST", url,
           "-H", "Content-Type: application/json"]
    if body:
        cmd += ["-d", json.dumps(body)]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    try:
        data = json.loads(r.stdout)
    except json.JSONDecodeError:
        print(f"ERROR: Invalid JSON response\n{r.stdout[:500]}", file=sys.stderr)
        sys.exit(1)
    if "errorMessages" in data:
        print(f"ERROR: {data['errorMessages']}", file=sys.stderr)
        sys.exit(1)
    return data

def jira_get(path):
    """GET to Jira REST API."""
    auth = get_auth()
    url = f"{JIRA_BASE}{path}"
    cmd = ["curl", "-s", "-u", auth, url]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    return json.loads(r.stdout)

def search(jql, fields=None, max_results=50):
    """Search issues using the /rest/api/3/search/jql endpoint."""
    if fields is None:
        fields = ["summary", "status", "issuetype", "assignee", "priority", "created", "updated"]
    return jira_post("/rest/api/3/search/jql", {
        "jql": jql,
        "maxResults": max_results,
        "fields": fields
    })


# ── Commands ────────────────────────────────────────────────────────────

def cmd_project(args):
    """Show project(s)."""
    if args:
        key = args[0]
        data = jira_get(f"/rest/api/3/project/{key}")
        lead = data.get("lead", {}).get("displayName", "Unknown")
        print(f"Project: {data.get('key')} — {data.get('name')}")
        print(f"  Lead:     {lead}")
        print(f"  Type:     {data.get('projectTypeKey')}")
        print(f"  ID:       {data.get('id')}")
        print(f"  URL:      {JIRA_BASE}/projects/{key}")
        print(f"  Issue Types:")
        for it in data.get("issueTypes", []):
            print(f"    - {it['name']} (subtask={it.get('subtask', False)})")
    else:
        data = jira_get("/rest/api/3/project")
        print("Projects:")
        for p in data:
            print(f"  {p.get('key')}: {p.get('name')} [{p.get('projectTypeKey')}]")

def cmd_issues(args):
    """Search issues by JQL."""
    jql = " ".join(args) if args else "project=EA ORDER BY created DESC"
    data = search(jql)
    issues = data.get("issues", [])
    total = data.get("total", len(issues))
    print(f"Total: {total}  |  Showing: {len(issues)}")

    if not issues:
        return

    # Summary stats
    tc, sc = Counter(), Counter()
    for i in issues:
        f = i["fields"]
        tc[f["issuetype"]["name"]] += 1
        sc[f["status"]["name"]] += 1

    print(f"  Types:  {', '.join(f'{k}={v}' for k,v in tc.most_common())}")
    print(f"  Status: {', '.join(f'{k}={v}' for k,v in sc.most_common())}")
    print()

    # List
    for i in issues:
        f = i["fields"]
        key = i["key"]
        t = f["issuetype"]["name"]
        s = f["status"]["name"]
        a = f["assignee"]["displayName"] if f.get("assignee") else "-"
        p = f["priority"]["name"] if f.get("priority") else "None"
        print(f"{key} [{t}] {s}")
        print(f"  {f['summary'][:70]}")
        print(f"  {a} | {p} | {f['created'][:10]}")
        print()

def cmd_issue(args):
    """Get single issue details."""
    if not args:
        print("Usage: jira issue KEY", file=sys.stderr)
        sys.exit(1)
    key = args[0]
    data = jira_get(f"/rest/api/3/issue/{key}")
    f = data["fields"]
    print(f"{key}: {f['summary']}")
    print(f"  Type:      {f['issuetype']['name']}")
    print(f"  Status:    {f['status']['name']}")
    print(f"  Priority:  {f['priority']['name'] if f.get('priority') else '-'}")
    print(f"  Assignee:  {f['assignee']['displayName'] if f.get('assignee') else 'Unassigned'}")
    print(f"  Created:   {f['created']}")
    print(f"  Updated:   {f['updated']}")
    if f.get("description"):
        desc = f["description"]
        if isinstance(desc, str):
            print(f"  Description: {desc[:200]}")
        else:
            # ADF format
            try:
                text = json.dumps(desc)[:200]
                print(f"  Description: (ADF) {text}")
            except:
                pass
    # Parent epic if any
    if f.get("parent"):
        print(f"  Epic:      {f['parent']['key']} — {f['parent']['fields']['summary'][:50]}")
    # Sub-tasks
    if f.get("subtasks"):
        print(f"  Subtasks ({len(f['subtasks'])}):")
        for st in f["subtasks"]:
            sf = st["fields"]
            print(f"    {st['key']} [{sf['status']['name']}] {sf['summary'][:60]}")

def cmd_epic_tree(args):
    """Show epic + child issues."""
    project = args[0] if args else "EA"
    # Get epics
    epics = search(f"project={project} AND issuetype=Epic ORDER BY priority DESC",
                   max_results=20)["issues"]
    if not epics:
        print(f"No epics found in project {project}")
        return
    for ep in epics:
        ef = ep["fields"]
        print(f"\n{'='*60}")
        print(f"{ep['key']}: {ef['summary']} [{ef['status']['name']}] ({ef['priority']['name']})")
        print(f"{'='*60}")
        # Get child stories via parent link
        children = search(f"project={project} AND parent={ep['key']}",
                          max_results=30)["issues"]
        if not children:
            # Also try external epic link
            children = search(f"project={project} AND cf[10014]={ep['key']}",
                              max_results=30)["issues"]
        for c in children:
            cf = c["fields"]
            a = cf["assignee"]["displayName"] if cf.get("assignee") else "-"
            print(f"  {c['key']} [{cf['status']['name']}]  {cf['summary'][:60]}")
            print(f"    → {a} | {cf['priority']['name']}")
        if not children:
            print("  (no child issues found via parent or Epic Link)")

def cmd_board(args):
    """List boards for a project."""
    project = args[0] if args else "EA"
    data = jira_get(f"/rest/agile/1.0/board?projectKeyOrId={project}")
    boards = data.get("values", [])
    if not boards:
        print(f"No boards found for {project}")
    for b in boards:
        print(f"  Board #{b['id']}: {b['name']} (type: {b['type']})")
        print(f"    URL: {JIRA_BASE}/jira/software/projects/{project}/boards/{b['id']}")

def cmd_transitions(args):
    """List available transitions for an issue."""
    if not args:
        print("Usage: jira transitions KEY", file=sys.stderr)
        sys.exit(1)
    data = jira_get(f"/rest/api/3/issue/{args[0]}/transitions")
    transitions = data.get("transitions", [])
    if not transitions:
        print(f"No transitions available for {args[0]}")
    for t in transitions:
        print(f"  {t['id']}: {t['name']} → {t['to']['statusCategory']['name']}")

def cmd_transition(args):
    """Move an issue to a target status by name."""
    if len(args) < 2:
        print("Usage: jira transition KEY DONE|IN_PROGRESS|TO_DO", file=sys.stderr)
        sys.exit(1)
    key, target = args[0], args[1].upper()
    name_map = {"DONE": "Done", "IN_PROGRESS": "In Progress", "TO_DO": "To Do"}
    target_name = name_map.get(target, args[1])

    data = jira_get(f"/rest/api/3/issue/{key}/transitions")
    transitions = data.get("transitions", [])
    found = None
    for t in transitions:
        if t["to"]["name"].lower() == target_name.lower():
            found = t
            break

    if not found:
        print(f"No transition found to '{target_name}' for {key}")
        print("Available transitions:")
        for t in transitions:
            print(f"  {t['id']}: {t['name']} → {t['to']['name']}")
        sys.exit(1)

    auth = get_auth()
    cmd = ["curl", "-s", "-u", auth, "-X", "POST",
           f"{JIRA_BASE}/rest/api/3/issue/{key}/transitions",
           "-H", "Content-Type: application/json",
           "-d", json.dumps({"transition": {"id": found["id"]}})]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    if r.stderr and "error" in r.stderr.lower():
        print(f"ERROR: {r.stderr.strip()}")
        sys.exit(1)
    print(f"{key} → {target_name} ✅")


def cmd_assign(args):
    """Assign issue to a user."""
    if len(args) < 2:
        print("Usage: jira assign KEY user-email", file=sys.stderr)
        sys.exit(1)
    key, user = args[0], args[1]
    auth = get_auth()
    cmd = ["curl", "-s", "-u", auth, "-X", "PUT",
           f"{JIRA_BASE}/rest/api/3/issue/{key}/assignee",
           "-H", "Content-Type: application/json",
           "-d", json.dumps({"accountId": user})]
    print(f"To assign {key} to {user}, use the Jira UI or update via API with accountId")

def cmd_status(args):
    """Project status summary."""
    project = args[0] if args else "EA"
    data = search(f"project={project} ORDER BY created DESC")
    issues = data.get("issues", [])
    total = data.get("total", len(issues))

    print(f"{'='*60}")
    print(f"  PROJECT: {project} — Event Attendance")
    print(f"{'='*60}")
    print(f"  Total Issues: {total}")
    print()

    # By type
    tc = Counter()
    sc = Counter()
    ac = Counter()
    pc = Counter()
    for i in issues:
        f = i["fields"]
        tc[f["issuetype"]["name"]] += 1
        sc[f["status"]["name"]] += 1
        a = f["assignee"]["displayName"] if f.get("assignee") else "Unassigned"
        ac[a] += 1
        pc[f["priority"]["name"] if f.get("priority") else "None"] += 1

    print("  By Type:")
    for t, c in tc.most_common():
        bar = "█" * min(c, 30)
        print(f"    {t:12s}  {c:2d}  {bar}")
    print()
    print("  By Status:")
    for s, c in sc.most_common():
        print(f"    {s:12s}  {c}")
    print()
    print("  By Priority:")
    for p, c in pc.most_common():
        print(f"    {p:12s}  {c}")
    print()
    print("  By Assignee:")
    for a, c in ac.most_common():
        print(f"    {a:20s}  {c}")
    print()
    print(f"  Epics:")
    epics = search(f"project={project} AND issuetype=Epic ORDER BY priority DESC")["issues"]
    for ep in epics:
        ef = ep["fields"]
        children = search(f"project={project} AND parent={ep['key']}", max_results=20)["issues"]
        done = sum(1 for c in children if c["fields"]["status"]["statusCategory"]["key"] == "done")
        print(f"    {ep['key']}  {ef['summary'][:50]:50s}  {ef['status']['name']:8s}  [{done}/{len(children)} stories]")

    print()
    print(f"  Link: {JIRA_BASE}/jira/software/projects/{project}/boards/439")


# ── Main ────────────────────────────────────────────────────────────────

COMMANDS = {
    "project": cmd_project,
    "issues": cmd_issues,
    "issue": cmd_issue,
    "epic-tree": cmd_epic_tree,
    "epic": cmd_epic_tree,
    "board": cmd_board,
    "transitions": cmd_transitions,
    "assign": cmd_assign,
    "transition": cmd_transition,
    "status": cmd_status,
}

def main():
    if len(sys.argv) < 2 or sys.argv[1] in ("-h", "--help", "help"):
        print(__doc__)
        return

    cmd = sys.argv[1]
    args = sys.argv[2:]

    if cmd in COMMANDS:
        COMMANDS[cmd](args)
    else:
        print(f"Unknown command: {cmd}\n", file=sys.stderr)
        print(__doc__, file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
