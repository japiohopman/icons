# AGENTS.md

## Purpose

This repository is a full application under active development. Agents must treat `icons` as a real, maintainable product — not as a disposable prototype or experiment.

## Source of truth

Before starting work, read:

1. `AGENTS.md`
2. `ROADMAP.md`
3. `docs/TASKBOARD.md`
4. relevant project documentation
5. the existing implementation around the task

The taskboard defines the currently authorized work. The roadmap defines product direction.

## Core rules

- Work only on the assigned task.
- Do not expand scope without explicit approval.
- Inspect before modifying.
- Prefer the existing architecture and conventions.
- Do not introduce dependencies unless they are justified.
- Do not perform unrelated refactors.
- Keep TypeScript strongly typed.
- Preserve existing functionality.
- Add or update tests where appropriate.
- Run the project's available lint, typecheck, test, and build checks before opening a PR.
- Update documentation when behavior or architecture changes.
- Never commit secrets, API keys, tokens, or local environment files.

## PR discipline

Every task should normally be implemented on its own feature/fix/chore branch and delivered as a focused PR.

A PR should explain:

- what changed
- why it changed
- how it was tested
- limitations or known issues
- any follow-up work discovered

Agents may identify and propose future work, but they must not implement that future work unless it is explicitly assigned.

## Photopea architecture rule

Photopea is an engine used by the Icons application. It is not the application's primary UI.

The intended direction is:

```text
Icons UI
  -> application logic
  -> Photopea engine/bridge
  -> Photopea scripting/API
  -> result/data
  -> Icons UI
```

Do not use the full Photopea editor UI as a shortcut for application functionality. If an iframe is required internally, it must remain an implementation detail behind the Photopea integration boundary.

Application-owned controls should invoke Photopea capabilities programmatically.

## Scope protection

Do not create speculative systems such as generic asset pipelines, DevKit modules, plugin frameworks, databases, batch systems, or large abstractions unless they are explicitly assigned.

Build the smallest maintainable solution that satisfies the current task.

## When blocked

If the requested architecture conflicts with the existing codebase or an external API behaves differently from the assumptions, stop and document the constraint. Do not silently choose an easier architecture that changes the product requirement.
