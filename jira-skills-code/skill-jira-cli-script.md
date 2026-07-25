---
name: jira-cli-script
description: Reusable Python CLI for Jira operations (project info, issues, epics, status)
---

# Jira CLI Script

A Python script at `/home/ubuntu/.hermes/scripts/jira.py` that wraps Jira REST API calls.

## Setup

- Script: `jira.py` (executable)
- Auth file: `.jira_auth` (base64-encoded `email:token`)

### How to update auth
```bash
echo -n 'email:new_token' | base64
cat > /home/ubuntu/.hermes/scripts/.jira_auth << 'EOF'
<base64_string>
EOF
```

## Usage
```bash
python3 /home/ubuntu/.hermes/scripts/jira.py <command> [args]
```

## Commands

| Command | Description | Example |
|---------|-------------|---------|
| `project [KEY]` | List projects or show project details | `jira.py project EA` |
| `issues [JQL]` | Search issues by JQL | `jira.py issues "project=EA AND status='To Do'"` |
| `issue KEY` | Get full issue details | `jira.py issue EA-8` |
| `epic-tree [KEY]` | Show epics + child stories | `jira.py epic-tree EA` |
| `board [KEY]` | List boards | `jira.py board EA` |
| `transitions KEY` | Available workflow transitions | `jira.py transitions EA-8` |
| `transition KEY DONE|IN_PROGRESS|TO_DO` | Move issue to a status | `jira.py transition EA-37 DONE` |
| `assign KEY user` | Assign issue to a user | `jira.py assign EA-8 user@email.com` |
| `status [KEY]` | Project status summary | `jira.py status` |

## Key Technical Details
- Uses `/rest/api/3/search/jql` POST endpoint (old GET is deprecated)
- Auth via Basic auth: `email:api_token` base64-encoded
- Issue hierarchy: Epic → Story (via `parent` field)
