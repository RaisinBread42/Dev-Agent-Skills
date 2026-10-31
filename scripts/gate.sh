#!/usr/bin/env bash
# Lint + type check + tests, one command. Exit 0 only when all pass.
# Commands come from .claude/gate.conf (written by the project-setup skill):
#   LINT_CMD="npm run lint"
#   TYPECHECK_CMD="npx tsc --noEmit"
#   TEST_CMD="npm test"
# Leave a command empty to skip that check.

set -u
cd "$(git rev-parse --show-toplevel 2>/dev/null || pwd)" || exit 1

conf=".claude/gate.conf"
if [ ! -f "$conf" ]; then
  echo "gate: $conf not found. Run the project-setup skill first."
  exit 1
fi

LINT_CMD="" TYPECHECK_CMD="" TEST_CMD=""
# shellcheck disable=SC1090
. "./$conf"

failed=""

run_check() {
  name="$1" cmd="$2"
  if [ -z "$cmd" ]; then
    echo "gate: $name skipped (no command set)"
    return
  fi
  echo "gate: $name → $cmd"
  out="$(bash -c "$cmd" 2>&1)"
  if [ $? -ne 0 ]; then
    echo "gate: $name FAILED. Last 40 lines:"
    echo "$out" | tail -n 40
    failed="$failed $name"
  else
    echo "gate: $name passed"
  fi
}

run_check lint "$LINT_CMD"
run_check typecheck "$TYPECHECK_CMD"
run_check tests "$TEST_CMD"

if [ -n "$failed" ]; then
  echo "gate: FAILED:$failed"
  exit 1
fi
echo "gate: all checks passed"
