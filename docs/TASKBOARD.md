# Icons — Agent Taskboard

This is the operational taskboard for AI-assisted development.

## Status definitions

- `READY` — explicitly authorized and ready to implement
- `IN PROGRESS` — currently being worked on
- `BLOCKED` — work cannot continue without a decision or dependency
- `REVIEW` — implementation is complete and awaiting human review
- `DONE` — merged and verified

## Current priority

### IN PROGRESS

None. The next implementation task begins after the agentic foundation PR is reviewed and merged.

### READY

#### PHOTOPEA-001 — Establish the Photopea engine boundary

**Goal**

Replace the current iframe-first approach with an application-owned Photopea engine/bridge.

**Requirements**

- Inspect the existing Photopea implementation before changing it.
- Use the official Photopea Live Messaging/API and scripting capabilities.
- Keep Photopea-specific messaging behind a dedicated integration boundary.
- Do not make the Photopea editor UI the application's editing interface.
- Prove one real operation from Icons UI → engine → Photopea → result → Icons UI.
- Keep the implementation small, typed, testable, and extensible.

**Acceptance criteria**

- The user interacts with Icons-owned UI.
- At least one meaningful Photopea operation is triggered programmatically.
- The operation does not require the user to operate Photopea's toolbar/menu.
- The application receives the result.
- Message/event listeners are cleaned up correctly.
- Existing functionality remains intact.
- Documentation describes the engine architecture.

**Out of scope**

- Full image editor implementation
- Generic asset pipeline
- DevKit integration
- Batch processing
- Database/storage system
- Authentication
- Large state-management changes
- Unrelated refactors

### READY — Future Photopea tasks

These are intentionally not assigned yet:

- PHOTOPEA-002 — Import/open workflow
- PHOTOPEA-003 — Export/result abstraction
- PHOTOPEA-004 — Resize controls
- PHOTOPEA-005 — Canvas/crop controls
- PHOTOPEA-006 — Transform controls
- PHOTOPEA-007 — Layer inspection and operations

Do not implement these until they are explicitly moved into `IN PROGRESS` or assigned directly.

## Completed

None yet.

## Agent workflow

1. Read `AGENTS.md`.
2. Read `ROADMAP.md`.
3. Read this taskboard.
4. Take exactly one assigned task.
5. Inspect the existing implementation.
6. Implement the smallest maintainable solution.
7. Run checks.
8. Update relevant documentation.
9. Open a focused PR.
10. Report what was tested and any limitations.

## Human decision points

Architecture changes, scope expansion, new infrastructure, new external services, and security/configuration decisions require explicit human approval.
