## Requirement

<!-- What was asked, in one or two sentences. Link the issue. -->

## Plan

<!-- The short plan that was approved (or, in an unattended run, the plan the agent followed). -->

## Acceptance criteria → tests

| # | Business rule / acceptance criterion | Test (file › name) |
| --- | --- | --- |
| 1 |  |  |

Edge cases tested:
-

## Risk tier

<!-- Pick one and say why in one line. -->
- [ ] **Low**: UI text, styling, internal tooling. Easy to undo.
- [ ] **Medium**: new behaviour in existing flows, no data model or auth change.
- [ ] **High**: money, personal data, auth/permissions, migrations, anything hard to undo.

Why:

## Migrations

- [ ] No database migrations
- [ ] **Migrations included**, a human must review them: <!-- list files and what they change -->

## Security and compliance

<!--
Result of the security-compliance-check skill, or "Not needed: no data or auth touched."
Write it as markdown, NOT inside a code block (``` renders as one unwrapped line). Use this shape:

**Result:** N findings (N blocking)

| Severity | Finding | Where | Rule |
| --- | --- | --- | --- |
| Advisory | What is wrong, one line | `path/file.ts` | DPA / OWASP A01 |

- **Checked, nothing found:** A01 …, A05 …
- **Skipped (not touched):** A02 …, A03 …
-->

**Result:**

| Severity | Finding | Where | Rule |
| --- | --- | --- | --- |
|  |  |  |  |

## Adversarial review

<!-- Result of the adversarial-tester skill (run in a fresh agent before the PR was opened). Markdown, not a code block. -->

**Verdict:**

| Type | Finding | Where | Status |
| --- | --- | --- | --- |
| PROVED / REASONED |  | `file:line` | Fixed / Not fixed: why |

## Gate

- [ ] `bash scripts/gate.sh` passes locally
- [ ] `bash scripts/magic-strings.sh` is clean, or each finding left is listed here with why it's fine:

## Tour

<!-- Link or path to the pr-tour HTML, and the files it says to read first. -->
