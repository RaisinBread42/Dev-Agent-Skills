#!/usr/bin/env bash
# List likely magic strings in the lines this branch adds (committed or not), compared with a base branch.
# Flags string literals that are compared against (== "paid", case 'admin':) and literals repeated in the change.
# It's a heuristic: fix each finding with a named constant, or say in the PR why it's fine.
# Usage: bash scripts/magic-strings.sh [base-branch]   (default: origin/main, then main)
# Exit 1 when it finds something, 0 when clean.

set -u
cd "$(git rev-parse --show-toplevel 2>/dev/null || pwd)" || exit 1

base="${1:-}"
if [ -z "$base" ]; then
  for b in origin/main main origin/master master; do
    git rev-parse --verify -q "$b" >/dev/null && base="$b" && break
  done
fi
from="$(git merge-base "$base" HEAD 2>/dev/null)" || { echo "magic-strings: can't find base branch '$base'"; exit 1; }

{
  git diff -U0 --no-color "$from"
  # New files not added to git yet.
  git ls-files --others --exclude-standard | while IFS= read -r f; do
    git diff -U0 --no-color --no-index /dev/null "$f"
  done
} | awk -v Q="'" '
  BEGIN {
    lit    = "[\"" Q "`][^\"" Q "`]+[\"" Q "`]"
    cmpR   = "(===?|!==?)[ \t]*" lit
    cmpL   = lit "[ \t]*(===?|!==?)"
    caseR  = "case[ \t]+[\"" Q "][^\"" Q "]+[\"" Q "][ \t]*:"
    keyLit = "[\"" Q "][A-Za-z0-9_.:/-][A-Za-z0-9_.:/-]+[\"" Q "]"
  }
  # Files where literals are expected: tests, docs, config, styles, migrations, the kit itself.
  function skipped(f) {
    return f ~ /(^|\/)(tests?|__tests__|spec|e2e|fixtures?|migrations?|\.claude|\.github)\// ||
           f ~ /\.(test|spec)\.[a-z]+$/ ||
           f ~ /\.(md|json|ya?ml|lock|toml|ini|env[a-z.]*|css|scss|html|svg|txt|csv|sql)$/
  }
  /^\+\+\+ / { file = substr($0, 7); next }
  /^@@/      { match($0, /\+[0-9]+/); ln = substr($0, RSTART + 1, RLENGTH - 1) + 0; next }
  /^\+/ {
    line = substr($0, 2); n = ln++
    if (skipped(file)) next
    if (line ~ /^[ \t]*(\/\/|#|\*|\/\*|--)/) next                        # comments
    if (line ~ /^[ \t]*(import|from|require|using|#include|export \* from)[ \t(]/) next
    if (line ~ /(require|import)\(/) next
    # 1. A literal being compared or switched on: the classic magic string.
    if (line ~ cmpR || line ~ cmpL || line ~ caseR) {
      gsub(/^[ \t]+/, "", line)
      printf "%s:%d  compared literal  %s\n", file, n, line
      found++
    }
    # 2. Key-like literals (no spaces) used more than once in the change.
    rest = line
    while (match(rest, keyLit)) {
      lit = substr(rest, RSTART, RLENGTH); rest = substr(rest, RSTART + RLENGTH)
      count[lit]++
      if (!(lit in where)) where[lit] = file ":" n
    }
  }
  END {
    for (lit in count) if (count[lit] > 1) { printf "%s  repeated %dx  %s\n", where[lit], count[lit], lit; found++ }
    if (found) { printf "\nmagic-strings: %d finding(s). Use a named constant/enum (see CLAUDE.md), or justify each in the PR.\n", found; exit 1 }
    print "magic-strings: none found in this change"
  }
'
