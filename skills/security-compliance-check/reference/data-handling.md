# Data-handling checklist

Generic controls that SOC 2, DPAs and GDPR-style rules usually ask for. The project's own specifics (which fields are personal, roles, retention periods, frameworks) are in the Compliance section of `CLAUDE.md`; they win over this list.

For every personal data field the change reads, writes, logs or sends:

## Minimise
- Is the field needed for this feature? If it is new, is it listed as personal data in `CLAUDE.md`? If not, flag it for a human.

## Access
- Only the roles named in `CLAUDE.md` can read or change it, checked on the server.
- Admin or support access is logged.

## Logs and errors
- Not written to logs, analytics, error trackers or error messages. Use an ID instead.
- Not put in URLs or query strings (they end up in logs).

## Storage and transfer
- Stored only in the database / services listed in `docs/environments.md`.
- Sent to a new third party? That is a new data processor: flag it for a human, don't decide.
- Encrypted at rest where `CLAUDE.md` says so; always over HTTPS.

## Retention and deletion
- When the user or account is deleted, this field is deleted or anonymised as `CLAUDE.md` requires, including copies (search indexes, caches, exports, files).
- A test proves the delete actually removes it.

## Audit trail
- Creating, changing, exporting or deleting personal data records who did it and when, if `CLAUDE.md` requires an audit trail.

## Test data
- Tests and fixtures use fake data, never copies of real records.
