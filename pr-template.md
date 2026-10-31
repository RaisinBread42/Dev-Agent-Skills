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

<!-- Result of the security-compliance-check skill, or "not needed: no data or auth touched". -->

## Gate

- [ ] `bash scripts/gate.sh` passes locally

## Tour

<!-- Link or path to the pr-tour HTML, and the files it says to read first. -->
