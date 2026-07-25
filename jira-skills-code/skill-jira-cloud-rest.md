---
name: "jira-cloud-rest"
description: "Jira Cloud REST API via curl with Basic Auth — next-gen/team-managed project quirks, Epic-Story linking, issue CRUD, assignment, JQL, and common pitfalls."
---

# Jira Cloud REST API (Basic Auth + Next-Gen)

Authenticated REST API patterns for Jira Cloud instances.

## Authentication

```bash
BASE="https://instance.atlassian.net"
AUTH="email@company.com:ATATT3xFfGF0..."
```

## Pitfall: Old Search Endpoint

The legacy `GET /rest/api/3/search?jql=...` is **dead**. Always use `GET /rest/api/3/search/jql?jql=...` (note `/jql`).

## Next-Gen (Simplified/Team-Managed) Project Quirks

### Epic Creation
In classic projects, Epics need `customfield_10011` (Epic Name). In next-gen projects, create Epics with just the `summary`:

```bash
curl -s -X POST -u "$AUTH" -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "project": {"key": "EA"},
      "summary": "Epic Title Here",
      "description": {"type": "doc", "version": 1,
        "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Description"}]}]},
      "issuetype": {"name": "Epic"}
    }
  }' \
  "$BASE/rest/api/3/issue"
```

### Linking Stories to Epics (Next-Gen)
DO NOT use `customfield_10014` (Epic Link). Use the `parent` field:

```bash
curl -s -X POST -u "$AUTH" -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "project": {"key": "EA"},
      "summary": "Story summary",
      "issuetype": {"name": "Story"},
      "parent": {"key": "EA-4"}
    }
  }' \
  "$BASE/rest/api/3/issue"
```

### Assigning Issues
Use the dedicated `/assignee` endpoint:

```bash
curl -s -X PUT -u "$AUTH" -H "Content-Type: application/json" \
  -d '{"accountId": "70121:1189f5df-75b5-496a-81ca-62fd55d58571"}' \
  "$BASE/rest/api/3/issue/PROJ-42/assignee"
```

### Subtask Issue Type Naming
In team-managed projects, the sub-task issue type is **`"Subtask"`** (no hyphen). Classic projects use `"Sub-task"`.

### Creating Sub-tasks
Use the `parent` field (same pattern as Epic-Story linking):

```bash
curl -s -X POST -u "$AUTH" -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "project": {"key": "EA"},
      "summary": "Buat migration & model Event",
      "issuetype": {"name": "Subtask"},
      "priority": {"name": "Highest"},
      "parent": {"key": "EA-8"}
    }
  }' \
  "$BASE/rest/api/3/issue"
```

### Sprint Management in Team-Managed Boards
Team-managed "simple" boards (Kanban template) do not support sprints via REST API. Workaround: Use Fix Versions.

### Setting Priority
```bash
curl -s -X PUT -u "$AUTH" -H "Content-Type: application/json" \
  -d '{"fields":{"priority":{"id":"2"}}}' \
  "$BASE/rest/api/3/issue/PROJ-42"
```

### User Lookups
```bash
curl -s -u "$AUTH" "$BASE/rest/api/3/user/assignable/search?project=PROJ&maxResults=50"
```

### Common JQL Queries
```bash
# Issues created on a specific date
curl -s -u "$AUTH" "$BASE/rest/api/3/search/jql?jql=created%20%3E%3D%202026-07-20%20AND%20created%20%3C%202026-07-21&fields=summary,status,issuetype,priority,assignee,created,project"

# All issues in a project
curl -s -u "$AUTH" "$BASE/rest/api/3/search/jql?jql=project%3DPROJ&maxResults=100&fields=summary,status,issuetype,priority,assignee,created"
```

### ADF Description Format
```json
"description": {
  "type": "doc", "version": 1,
  "content": [
    {"type": "paragraph", "content": [
      {"type": "text", "text": "Description text here"}
    ]}
  ]
}
```

## Common Pitfalls

| Pitfall | Symptom | Fix |
|---------|---------|-----|
| `&` in summary string | Bash backgrounds the process | Use Python with `json.dumps` |
| Too many requests | Silent drops | Add `time.sleep(0.25)` between POSTs |
| Missing global admin | 403 on project creation | Route to web UI |
| Non-existent parent key | Stories created without epic link | Create epics first |
