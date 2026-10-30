# ppal-api

The business-logic and REST API component for PantryPal. It exposes domain operations and is the only application component allowed to read or write PostgreSQL.

Part of **PantryPal** (`ppal`) — Mobile Development Engineering (graduate program) · CORHUILA 2026-B.

| | |
|---|---|
| Role | Business logic and REST API |
| Containerization | Yes; the repository contains a `Dockerfile` |
| Project governance and documentation | [`ppal-docs`](https://github.com/code-corhuila/ppal-docs) |
| Backlog | GitHub Project `ppal-backlog` |

## Branches

| Branch | Purpose |
|---|---|
| `develop` | Integration and default branch |
| `qa` | Quality assurance |
| `main` | Production/release baseline |

**All changes to `develop`, `qa`, or `main` must go through a pull request.** Direct commits, force-pushes, and branch deletion are disabled for these branches, including for administrators.

1. Daily work: create a `feat/<topic>` or `fix/<topic>` branch from `develop`, then open a PR to `develop`.
2. Promotion: open a PR from `develop` to `qa`, then from `qa` to `main`.
3. A PR to `main` requires instructor approval. Delete a working branch after its PR is merged.

## Project repositories

| Repository | Role |
|---|---|
| [`ppal-docs`](https://github.com/code-corhuila/ppal-docs) | Project governance and documentation source of truth |
| [`ppal-api`](https://github.com/code-corhuila/ppal-api) | Business logic and REST API |
| [`ppal-app`](https://github.com/code-corhuila/ppal-app) | Mobile application |
| [`ppal-portal`](https://github.com/code-corhuila/ppal-portal) | Optional web portal |
| [`ppal-db`](https://github.com/code-corhuila/ppal-db) | PostgreSQL schema and migrations |
| [`ppal-infra`](https://github.com/code-corhuila/ppal-infra) | Infrastructure and orchestration |
| [`ppal-tools`](https://github.com/code-corhuila/ppal-tools) | Shared development tooling |
