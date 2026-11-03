---
name: release-notes
description: "Write business-only release notes for stakeholders as one HTML page: a step-by-step walkthrough on UAT where each step says what was done and shows its screenshot, plus what changed, who it affects and how to use it, with no technical terms. Use when asked for release notes, a stakeholder update, a client-facing summary of a release or PR, or 'what's new' notes."
---

# Release notes

For people who use the product, not people who build it. The output is **one HTML file** a reader scrolls top to bottom: each change, then numbered steps, each step with its screenshot inline. Never hand over a folder or zip of loose screenshots.

## Steps

1. **Collect the changes.** The PRs or commits in this release (`gh pr list --state merged --search "merged:>=<date>"`, or `git log <last-tag>..HEAD`). For each, note the user-visible change. Drop purely internal changes (refactors, test-only, dependency bumps) unless users will notice.
2. **Find UAT.** Read `docs/environments.md` for the UAT URL and where test accounts are documented. Never use PROD. If you need a password, ask the user to sign in for you.
3. **Walk through it and record each step as you go.** For each change, do what a user would do in the browser (any browser tool). After each meaningful action, take one screenshot and write down, right then: the action ("Click **Change dates** on the booking"), what the user now sees, and a caption pointing at what to look at. Save screenshots as `release-notes/<date>/screenshots/<change>-<step>.png`. Aim for 3–8 steps per change.
4. **Find the branding.** Brand guidelines win if the project has them (a `brand`/`branding`/`style-guide` doc in `docs/` or the repo root). Otherwise read it from the code: theme colours (Tailwind config, CSS variables on `:root`, a theme file), the font family, and the logo (`public/`, `assets/`, `static/`; prefer SVG). Record what you used and where you found it; never invent a brand.
5. **Write `release-notes/<date>/report.json`** in the format in [reference/stakeholder-report.md](reference/stakeholder-report.md). Every step has an action and a screenshot, in the order you did them.
6. **Check the words.** Remove anything a non-technical reader wouldn't understand: API, endpoint, database, migration, deploy, refactor, ticket IDs, component names. Say "fixed a problem where…" instead of "bug".
7. **Build the page.** `node .claude/skills/release-notes/scripts/build-report.mjs release-notes/<date>/report.json`. It writes `release-notes/<date>/release-notes.html` with the screenshots embedded, and fails on a missing screenshot or a step without one. Fix and rebuild.
8. **Look at it.** Open the HTML in the browser and scroll through: each step's text must match its screenshot, in order, and the page must look like the product (logo, colours). Fix mismatches.
9. **Hand over** the path to the single HTML file. If your environment can publish an HTML page (e.g. an Artifact), offer to. Don't send it anywhere yourself.
