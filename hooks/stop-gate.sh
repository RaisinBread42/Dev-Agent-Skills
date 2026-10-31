#!/usr/bin/env bash
# Stop hook: Claude can't finish while files are changed and the gate fails.
# Exit 2 sends the gate output back to Claude so it keeps fixing.
# After 3 failed attempts in a row it lets Claude stop, but tells you the work is NOT done.

input="$(cat)"
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

# Nothing changed (e.g. Claude only answered a question): nothing to check.
if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
  exit 0
fi

session="$(printf '%s' "$input" | grep -oE '"session_id" *: *"[^"]*"' | head -1 | sed -E 's/.*"([^"]*)"$/\1/')"
counter="${TMPDIR:-/tmp}/claude-gate-${session:-default}"

# A fresh stop (not a retry caused by this hook) resets the counter.
if ! printf '%s' "$input" | grep -qE '"stop_hook_active" *: *true'; then
  rm -f "$counter"
fi

if out="$(bash scripts/gate.sh 2>&1)"; then
  rm -f "$counter"
  exit 0
fi

tries=$(( $(cat "$counter" 2>/dev/null || echo 0) + 1 ))
echo "$tries" > "$counter"

if [ "$tries" -ge 3 ]; then
  rm -f "$counter"
  echo '{"systemMessage": "Gate still failing after 3 attempts. The work is NOT done: run bash scripts/gate.sh to see why."}'
  exit 0
fi

{
  echo "You are not done: bash scripts/gate.sh failed. Fix the cause (not the check) and try again."
  echo "$out"
} >&2
exit 2
