# Dev Agent Kit

One template for running Claude Code on any project: master rules, skills, hooks and CI. Copy it in once, run the setup skill, review, and switch the gates on. Everything is plain markdown and small shell scripts, easy to edit by hand.

## What's inside

```
CLAUDE.template.md       master rules (KISS, workflow, test policy, hard rules) with {{placeholders}}
docs-templates/          architecture.md, environments.md (UAT + PROD), filled during setup
skills/
  project-setup/         one-time setup: detect, ask, write CLAUDE.md + docs + gate.conf
  implement-feature/     requirement → plan → tests → services → UI → gate → PR
  security-compliance-check/   OWASP Top 10 + the project's data-handling rules
  release-notes/         browser walkthrough on UAT → business-only report
  pr-triage/ pr-tour/ adversarial-tester/   from RaisinBread42/skills (MIT, see each LICENSE)
scripts/
  gate.sh                lint + type check + tests, one command (reads .claude/gate.conf)
  magic-strings.sh       lists likely magic strings the current change adds (compared or repeated literals)
  e2e-summary.mjs        Playwright JSON report → the pass/fail table posted on the PR
  sync.sh                install the kit into a project, or pull template updates
hooks/
  stop-gate.sh           Claude can't finish while gate.sh fails
  guard.sh               blocks reading or editing .env files
  settings.json          wires both hooks into .claude/settings.json
ci/
  pr-checks.yml          gate.sh + magic-string and migration warnings on every PR (+ optional throwaway-DB itest and browser click-through jobs)
  agent-on-ready.yml     Phase 4: "ready" label on an issue → Claude builds, self-attacks (adversarial-tester), opens a PR
pr-template.md           requirement, criteria → tests, risk tier, migrations, tour
```

## Adopt into a project

Needs Git Bash (Windows) or any bash, and `gh` + Node ≥ 18 for the PR skills.

1. **Install.** From the project root (no clone of the kit needed):
   ```bash
   curl -sSL https://raw.githubusercontent.com/RaisinBread42/Dev-Agent-Skills/main/scripts/sync.sh | bash
   ```
   To install from a local copy instead (e.g. while editing the kit): `bash path/to/Dev-Agent-Skills/scripts/sync.sh path/to/Dev-Agent-Skills`.
   This copies skills to `.claude/skills/`, hooks to `.claude/hooks/`, `gate.sh` and `sync.sh` to `scripts/`, and reference copies of the templates to `.claude/kit/`.
2. **Set up.** Ask Claude: *"run the project-setup skill"*. It detects the stack and test commands, asks you only about hosting, auth, database and compliance for UAT and PROD, and writes `CLAUDE.md`, `docs/architecture.md`, `docs/environments.md` and `.claude/gate.conf`.
3. **Review** those files and edit anything wrong. This is the highest-value step.
4. **Switch on.** Tell Claude you approve; it adds the hooks to `.claude/settings.json`, the CI workflow and the PR template to `.github/`.
5. **Commit** `.claude/`, `scripts/`, `CLAUDE.md`, `docs/` and `.github/`. Skills must live in the repo so cloud and CI runs see them.

## Rollout phases

| Phase | What | Files |
| --- | --- | --- |
| 1. Project setup | One-page `CLAUDE.md` + two docs | `project-setup` skill |
| 2. Skills | Build, check, review, report | `implement-feature`, `security-compliance-check`, `release-notes`, `pr-triage`, `pr-tour`, `adversarial-tester` |
| 3. Automatic gates | Hooks, CI, PR template, hard rules | `hooks/`, `ci/pr-checks.yml`, `pr-template.md` |
| 4. Always-on | Email → issue → **you** label `ready` → PR waiting | `ci/agent-on-ready.yml` |

Phase 4 only after 1–3 work. The `ready` label is the safety gate: client emails are untrusted input. Repo secrets must be UAT-only; the agent never gets PROD credentials.

## Hard rules (enforced where possible)

| Rule | Enforced by |
| --- | --- |
| Not done until lint, types and tests pass | `hooks/stop-gate.sh` locally, `ci/pr-checks.yml` on PRs |
| No `.env` reads or edits | `hooks/guard.sh` |
| Migrations always flagged | PR template section + CI warning (`MIGRATIONS_PATH` in `gate.conf`) |
| No magic strings | `CLAUDE.md` rule, `implement-feature` step, PR template checkbox, CI warning (`scripts/magic-strings.sh`) |
| No PROD credentials | Process: keep PROD secrets out of the repo and the agent's environment |

## Keeping projects up to date

```bash
bash scripts/sync.sh
```

Pulls the latest kit from GitHub (or from the source last used, remembered in `.claude/kit-source`). It replaces the kit's skills, hooks and scripts only. It never touches `CLAUDE.md`, `docs/`, `.claude/gate.conf`, `.claude/settings.json`, `.github/`, or skills the project added itself. Review with `git diff` before committing.

Improved a skill inside a project? Copy it back here so every project gets it on the next sync.

## Writing skills here

- `SKILL.md` stays short (about 50 lines): when to use, numbered steps, links.
- Detail goes in `reference/`, read only by the step that needs it.
- Repeatable mechanics go in scripts, not prose.
- No project facts in skills: they read `CLAUDE.md` and `docs/`.

## Browser click-through (optional)

Agent PRs used to end with "please click through on a preview deploy". With the optional `e2e` job, the agent does it:

- **In CI, never against real environments.** The app runs on the runner against a throwaway database; nothing touches UAT, PROD or the real identity provider.
- **Login without a backdoor.** The tests sign a test session with a throwaway secret that only the runner has (for Auth.js JWT sessions: `encode()` with the session-cookie salt). No auth code in the app changes, and the token is useless against any real server.
- **A guard** in the test setup refuses any non-local database URL, because the tests write data.
- **On UI PRs**, `pr-checks.yml`'s `e2e` job posts one PR comment with a pass/fail table (updated on each push) and uploads screenshots of every step as an artifact. GitHub's API can't put images inline in a comment, so the comment links to the artifact.
- **The agent runs it first.** With the optional test database in `agent-on-ready.yml`, step 2b has the agent write one click-through test per user-visible acceptance criterion, run it, check the screenshots and fix the code before opening the PR.

Reference implementation: RaisinBread42/letsstay (`playwright.config.ts`, `e2e/support/`).

## Caveats

- Compliance (SOC 2, DPA) is mostly process and controls. Tests can prove specific controls; this kit is not an audit.
- Verdicts are only as good as the tests. Weak coverage means building that safety net first.
- `guard.sh` matches the text `.env` anywhere in a Bash command, including a commit message or a heredoc. Reword the command (or use the Edit tool) rather than weakening the guard.
- `pr-triage` and `pr-tour` ship a minified vendor bundle. Exclude the synced kit skills and `.claude/kit/` from the project's linter, or lint reports thousands of warnings and can run out of memory. Kit files are overwritten on every sync, so fix them here, not in the project.
- In CI, Claude cannot ask for permission: a tool missing from `--allowedTools` in `agent-on-ready.yml` is denied and the run still shows green, with no PR. `show_full_output: true` puts the transcript in the job log; on a public repo anyone can read it.
