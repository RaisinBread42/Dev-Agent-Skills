# Test policy

Few tests that each prove a business rule beat a hundred that prove nothing. This cap stops the "101 tests" problem.

## How many

| Kind | How many | When |
| --- | --- | --- |
| Acceptance criterion | Exactly 1 per criterion | Always |
| Edge case | 2–4 in total | Always: pick the ones that could really happen |
| Security case | 1 per rule touched | Only when personal data, auth or permissions are touched |

If you want more than this, the feature is too big: say so and split it.

## What a good test looks like

- Named after the rule, in business words: `refund is refused after 30 days`, not `test_refund_3`.
- Tests behaviour through the public function or service, not private helpers.
- Uses realistic values: odd amounts, real-looking dates, the boundary itself (`30 days` and `31 days`).
- Follows the project's existing test files: same folder, naming, setup and helpers.
- Runs locally with the project's test command, fast, no network.

## Picking edge cases

Choose from what could actually go wrong for this rule:

- The boundary (exactly at the limit, one past it).
- Empty, zero or missing input.
- The smallest or largest realistic value (1 cent, a very long name).
- Two things at once (same record updated twice, same user in two roles).

## Security cases (only when data or auth is touched)

- A user without the role is refused.
- A user can't read or change another user's / tenant's records.
- Personal data does not appear in logs or error messages.
- Deletion really deletes (or anonymises, per the project's rules).

## Don't

- Test the framework, the ORM, or a mock's return value.
- Snapshot whole pages or large objects.
- Write one test per line of code or per getter.
- Loosen an assertion or skip a test to get green.
