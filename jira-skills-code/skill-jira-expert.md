---
name: "jira-expert"
description: "Atlassian Jira expert for creating and managing projects, planning, product discovery, JQL queries, workflows, custom fields, automation, reporting, and all Jira features."
---

# Atlassian Jira Expert

## Quick Start

Jira operations use one of two transports: **MCP** (when Atlassian Remote MCP server is configured) or **REST API with Basic Auth**.

### MCP Transport

`mcp__atlassian__createJiraIssue (cloudId, projectKey="MYPROJ", issueTypeName="Story", summary="My new story")`
`mcp__atlassian__searchJiraIssuesUsingJql (cloudId, jql="project = MYPROJ AND status != Done")`

### REST API with Basic Auth

```bash
AUTH="email:ATATT3x..."
BASE="https://instance.atlassian.net"

# List projects
curl -s -u "$AUTH" "$BASE/rest/api/3/project"

# Search issues
curl -s -u "$AUTH" "$BASE/rest/api/3/search/jql?jql=project%3DVBO&fields=summary,status,assignee,issuetype,priority"
```

**Transition an issue:**
```bash
# Step 1: Get available transitions
curl -s -u "$AUTH" "$BASE/rest/api/3/issue/VBO-101/transitions"

# Step 2: Execute transition
curl -s -X POST -u "$AUTH" -H "Content-Type: application/json" \
  -d '{"transition":{"id":"41"}}' \
  "$BASE/rest/api/3/issue/VBO-101/transitions"
```

## Workflows

### Workflow Design
1. Map out process states (To Do → In Progress → Done)
2. Define transitions and conditions
3. Configure workflow scheme (web UI)
4. Test with sample issues

### JQL Examples

```jql
# Overdue issues
dueDate < now() AND status != Done

# Sprint burndown
sprint = 23 AND status changed TO "Done" DURING (startOfSprint(), endOfSprint())

# Stale issues
updated < -30d AND status != Done

# Cross-project epic tracking
"Epic Link" = PROJ-123 ORDER BY rank
```

### Custom Fields
- Track data not in standard fields
- Capture process-specific information
- Types: Text, Numeric, Date, Select, User picker

## JQL Functions
- **Date**: `startOfDay()`, `endOfDay()`, `startOfWeek()`, `startOfMonth()`, `startOfYear()`
- **Sprint**: `openSprints()`, `closedSprints()`, `futureSprints()`
- **User**: `currentUser()`, `membersOf("group")`
- **Advanced**: `issueHistory()`, `linkedIssues()`

## Best Practices
- Enforce required fields with validation rules
- Avoid leading wildcards in JQL
- Use saved filters instead of re-running complex JQL
- Archive completed projects rather than deleting
