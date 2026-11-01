---
name: project-setup
description: "One-time setup of the Dev Agent Kit in a project. Detects the stack and test runner, asks only what it can't detect (hosting, auth, database, compliance for UAT and PROD), then writes CLAUDE.md, docs/architecture.md, docs/environments.md and .claude/gate.conf for the user to review, and switches on hooks and CI after approval. Use when the user says 'set up the kit', 'run project setup', or after a first scripts/sync.sh install."
---

# Project setup

Turns the kit's templates in `.claude/kit/` into this project's own files. Run it once; after that the files belong to the project and are edited by hand.

## Steps

1. **Check the install.** `.claude/kit/CLAUDE.template.md` must exist. If not, tell the user to run `bash path/to/dev-agent-kit/scripts/sync.sh path/to/dev-agent-kit` from the project root, and stop.
2. **Detect what you can** from the codebase, don't ask about it:
   - Stack and framework (`package.json`, `pyproject.toml`, `*.csproj`, `go.mod`, `Gemfile`…).
   - Lint, type check and test commands (scripts in the manifest, config files). Run each once to confirm it works locally.
   - Folder structure, naming, and one example file per kind of code (service, component, test, document, template).
   - Request flow, migrations folder, auth library and roles if visible in code.
3. **Ask only what you couldn't detect**, in one message: for UAT and PROD, the hosting, auth provider, database and other services, URLs, deploy flow; and compliance needs (e.g. SOC 2, DPA, GDPR): which data is personal, who may see it, retention and deletion rules. Every project has UAT and PROD.
4. **Write the files** (if one already exists, merge into it; never drop the user's content):
   - `CLAUDE.md` from `.claude/kit/CLAUDE.template.md`. Fill every `{{placeholder}}`. Keep it to about a page; detail goes in the docs.
   - `docs/architecture.md` and `docs/environments.md` from `.claude/kit/docs-templates/`. Variable names only, never values. Never open `.env` files; read `.env.example` if present.
   - `.claude/gate.conf`:
     ```
     LINT_CMD="..."
     TYPECHECK_CMD="..."
     TEST_CMD="..."
     MIGRATIONS_PATH="..."   # e.g. prisma/migrations, empty if none
     ```
   - Add `.pr-review/` to `.gitignore`.
5. **Run `bash scripts/gate.sh`.** If it fails on existing code, report it; don't fix code in setup.
6. **Stop for review.** List the files written and every guess you made. Wait for the user to approve or edit.
7. **After approval, switch on the gates:**
   - Merge `.claude/kit/settings.json` hooks into `.claude/settings.json` (keep existing settings).
   - Copy `.claude/kit/ci/pr-checks.yml` to `.github/workflows/pr-checks.yml`; replace `{{CI_SETUP_STEPS}}` with the toolchain install steps. If the project has DB-backed tests, uncomment the optional `itest` job and adapt it (throwaway database service, schema step, test command). If the project has a UI and the user wants the browser click-through, uncomment the optional `e2e` job too and set up Playwright (`e2e/`, a local-database guard, a test-session login signed with a throwaway secret; see the README section). Add the same test database to `agent-on-ready.yml` so the agent can run both before opening a PR.
   - Copy `.claude/kit/pr-template.md` to `.github/pull_request_template.md`.
   - Exclude the synced kit skills and `.claude/kit/` from the project's linter (they include a minified vendor bundle).
   - Only if the user asks for Phase 4: copy `.claude/kit/ci/agent-on-ready.yml` the same way, and replace the `npm`/`npx`/`node` entries in `--allowedTools` with the project's toolchain commands (a tool not listed is silently denied in CI and the run ends with no PR). Tell them to create the `ready` label and the API key secret (UAT-only secrets).

## Done means

- No `{{` left in `CLAUDE.md` or `docs/`.
- `bash scripts/gate.sh` runs (pass, or failures reported to the user).
- Hooks and CI are on only after the user approved the files.
