---
name: release-notes
description: "Write business-only release notes for stakeholders: walk through the change in a browser on UAT, take screenshots, and explain what changed, who it affects and how to use it, with no technical terms. Use when asked for release notes, a stakeholder update, a client-facing summary of a release or PR, or 'what's new' notes."
---

# Release notes

For people who use the product, not people who build it. No code, file names, frameworks or ticket jargon.

## Steps

1. **Collect the changes.** The PRs or commits in this release (`gh pr list --state merged --search "merged:>=<date>"`, or `git log <last-tag>..HEAD`). For each, note the user-visible change. Drop purely internal changes (refactors, test-only, dependency bumps) unless users will notice.
2. **Find UAT.** Read `docs/environments.md` for the UAT URL and where test accounts are documented. Never use PROD. If you need a password, ask the user to sign in for you.
3. **Walk through it in the browser.** For each user-visible change, do what a user would do and take a screenshot at each meaningful step (before/after where it helps). Use whatever browser tool is available. Save screenshots to `release-notes/<date>/`.
4. **Write the report** using [reference/stakeholder-report.md](reference/stakeholder-report.md). Plain words, short sentences. Explain each change by what the user can now do.
5. **Check the words.** Remove anything a non-technical reader wouldn't understand: API, endpoint, database, migration, deploy, refactor, bug fix IDs, component names. Say "fixed a problem where…" instead of "bug".
6. **Hand over** the report path and the screenshots folder. Don't send it anywhere yourself.
