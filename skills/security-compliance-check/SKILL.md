---
name: security-compliance-check
description: "Check a change against the OWASP Top 10 and the project's data-handling rules (e.g. SOC 2, DPA): no personal data in logs, access checked through the project's auth roles, encryption, retention and deletion, audit trail. Reports findings with file:line; proves them with a test where it can. Use when a change touches personal data, auth, permissions, payments or file uploads, or when asked for a security or compliance check."
---

# Security and compliance check

Checks one change (a PR or the working diff), not the whole codebase. It points at problems; it is not an audit.

## Steps

1. **Scope.** Get the diff (`git diff main...HEAD`, or `gh pr diff <n>`). List what it touches: endpoints, data fields, roles, storage, logs, third-party calls.
2. **Load the project's rules.** Read the Compliance and Hard rules sections of `CLAUDE.md`, and `docs/environments.md` for auth, database and services.
3. **OWASP pass.** Go through [reference/owasp-top10.md](reference/owasp-top10.md) for the touched code only. Skip items that clearly don't apply, and say which you skipped.
4. **Data-handling pass.** Go through [reference/data-handling.md](reference/data-handling.md) for every personal data field the change reads, writes, logs or sends.
5. **Prove what you can.** For each finding a test can show (missing role check, personal data in a log line, delete that doesn't delete), write a failing test following the project's test patterns.
6. **Report**, most serious first:

   ```
   Result: <N> findings (<blocking count> blocking)
   - [BLOCKING|ADVISORY] <title>. Where: file:line. Rule: <OWASP item or project rule>.
     Why: <one or two sentences>. Proof: <test name> | not proved: <why>.
   Checked, nothing found: <list>
   Skipped (not touched by this change): <list>
   ```

   Blocking = breaks a project rule or an OWASP item with a concrete way to exploit or leak. Paste the result into the PR's "Security and compliance" section.

## Rules

- Never read `.env` files or real secrets. Never use PROD.
- Compliance is mostly process; flag anything that needs a human decision (retention period, lawful basis, new data processor) instead of guessing.
