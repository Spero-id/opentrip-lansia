# Jira Skills & Script — Hermes Agent

## Files Included:

### 1. jira.py — CLI Script
Python script untuk operasi Jira lewat terminal.
- Commands: project, issues, issue, epic-tree, board, transitions, transition, status
- Auth via base64-encoded `.jira_auth` file (email:token)
- Instant: fikrihasani471.atlassian.net
- Projects: EA (Event Attendance), OTL (Open Trip Lansia), VBO (Vbook)

Cara pakai:
```bash
python3 jira.py status
python3 jira.py epic-tree EA
python3 jira.py issue EA-8
```

Setup auth:
```bash
echo -n 'email@company.com:APITOKEN' | base64
```
Simpan hasilnya ke file `.jira_auth` di folder yang sama dengan jira.py.

### 2. skill-jira-cloud-rest.md
Curl-based REST API patterns. Covers:
- Epic creation & linking (next-gen parent field)
- Subtask creation (note: "Subtask" bukan "Sub-task" di team-managed)
- Issue assignment, priority, transitions
- JQL queries, ADF description format
- Common pitfalls

### 3. skill-jira-expert.md
Atlassian Jira Expert — master-level guide:
- MCP transport vs REST API
- Workflow design
- JQL examples (overdue, sprint, velocity)
- Custom fields, dashboard, automation

### 4. skill-jira-cli-script.md
Dokumentasi untuk jira.py script:
- Semua commands & examples
- Cara update auth token
- Technical details (API endpoints, auth mechanism)
