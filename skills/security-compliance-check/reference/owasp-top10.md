# OWASP Top 10 (2025) checklist for a change

Check only the code the change touches. One question per line; a "no" is a finding.

## A01 Broken access control
- Every new endpoint, action or query checks the user's role through the project's auth (not only the UI hiding a button)?
- Records are filtered by owner / tenant on the server, so changing an ID in the URL or body can't reach someone else's data?
- No new CORS, redirect or file path built from user input without an allow-list?

## A02 Security misconfiguration
- No debug mode, verbose errors, default credentials or open admin routes added?
- Security headers and cookie flags (HttpOnly, Secure, SameSite) unchanged or stronger?

## A03 Software supply chain failures
- New dependencies are needed, maintained, pinned in the lockfile, and from the official registry?
- No scripts piped from the internet in CI or build steps?

## A04 Cryptographic failures
- Personal and secret data encrypted in transit (HTTPS) and at rest where the project requires it?
- Passwords hashed with the framework's standard (bcrypt / argon2), never home-made crypto?
- No secrets in code, tests, fixtures or logs?

## A05 Injection
- Database access uses parameters / the ORM, never string-built queries?
- User input rendered in HTML is escaped by the framework (no raw HTML from user input)?
- No user input in shell commands, file paths or template names?

## A06 Insecure design
- Limits on things that can be abused: rate limits, max sizes, max counts, money amounts?
- Business rules enforced on the server, not only in the client?

## A07 Authentication failures
- Login, reset and session code uses the project's auth provider, not new custom code?
- Sessions and tokens expire, and are invalidated on logout / password change?

## A08 Software or data integrity failures
- Uploaded files checked for type and size, stored outside the web root?
- Webhooks and callbacks verify signatures?

## A09 Logging and alerting failures
- Security-relevant events (login failure, permission denied, data export, deletion) are logged?
- Logs contain IDs, not personal data or secrets?

## A10 Mishandling of exceptional conditions
- Errors fail closed (deny access) rather than open?
- No empty catch blocks that hide failures; users see a generic message, details go to the log?
