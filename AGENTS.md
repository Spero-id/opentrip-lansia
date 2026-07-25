# AGENTS.md

Project harness for reliable agent-assisted development in the OpenTrip Lansia (OTL) codebase.

## Startup Workflow

Before writing code:

1. **Confirm working directory** with `pwd`
2. **Read this file** completely
3. **Read project docs** — start with `docs/index.md` (central index), then `docs/PRD.md` for requirements, `docs/flow.md` for user flows, and `design.md` for UI specs
4. **Run `./init.sh`** to verify environment is healthy
5. **Read `feature_list.json`** to see current feature state
6. **Review recent commits** with `git log --oneline -5`

If baseline verification is failing, repair that first before adding new scope.

## Project Overview

**OpenTrip Lansia** is a Next.js 16 + Drizzle ORM + Neon PostgreSQL platform for senior-focused open trip booking.

**Key paths:**
- `src/app/` — Next.js App Router pages
- `src/modules/` — Feature modules (controller/service/repository pattern)
- `src/db/schema/` — Drizzle schema (11 files)
- `src/components/` — Shared UI components
- `src/lib/` — Utilities (auth-client, helpers)
- `docs/` — Product & architecture docs (PRD, flows, ERD)

**Architecture:** Each module under `src/modules/` follows: `*.schema.ts` → `*.repository.ts` → `*.service.ts` → `*.controller.ts` → `index.ts`

## Working Rules

- **One feature at a time**: Pick exactly one unfinished feature from `feature_list.json`
- **Verification required**: Don't claim done without running verification commands
- **Update artifacts**: Before ending session, update `progress.md` and `feature_list.json`
- **Stay in scope**: Don't modify files unrelated to the current feature
- **Leave clean state**: Next session must be able to run `./init.sh` immediately
- **Follow conventions**: Match the existing module pattern (controller/service/repository/schema) and code style
- **Use existing libs**: Check `src/lib/`, `src/shared/`, and `package.json` before adding new dependencies

## Required Artifacts

- `feature_list.json` — Feature state tracker (source of truth)
- `progress.md` — Session continuity log
- `init.sh` — Standard startup and verification path
- `session-handoff.md` — Optional, for larger sessions

## Definition of Done

A feature is done only when ALL of the following are true:

- [ ] Target behavior is implemented
- [ ] Required verification actually ran (`npm run lint`)
- [ ] Evidence recorded in `feature_list.json` or `progress.md`
- [ ] Repository remains restartable from standard startup path
- [ ] Code follows existing module conventions

## End of Session

Before ending a session:

1. Update `progress.md` with current state
2. Update `feature_list.json` with new feature status
3. Record any unresolved risks or blockers
4. Commit with descriptive message once work is in safe state
5. Leave repo clean enough for next session to run `./init.sh` immediately

## Verification Commands

```bash
# Full verification (recommended)
./init.sh

# Individual checks
npm run lint
```

## Escalation

If you encounter:
- **Architecture decisions**: Consult `docs/index.md` and `docs/PRD.md`, otherwise ask user
- **Unclear requirements**: Check `docs/PRD.md` and `design.md`, otherwise ask user
- **Repeated verification failures**: Update progress, flag for human review
- **Scope ambiguity**: Re-read `feature_list.json` and PRD epics for definition of done
- **Database constraints**: Refer to `docs/database/PANDUAN_DATABASE.md` for critical rules (atomic quotas, money types, encryption)
