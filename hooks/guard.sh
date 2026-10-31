#!/usr/bin/env bash
# PreToolUse hook: block reading or editing .env files (secrets).
# Allowed: .env.example, .env.sample, .env.template, .env.dist
# Exit 2 blocks the tool call and tells Claude why.

input="$(cat)"

is_secret_env() {
  case "$1" in
    .env.example|.env.sample|.env.template|.env.dist) return 1 ;;
    .env|.env.*) return 0 ;;
  esac
  return 1
}

block() {
  echo "Blocked: $1 Use .env.example and the variable names in docs/environments.md instead." >&2
  exit 2
}

# Read / Edit / Write / NotebookEdit: check the file name.
path="$(printf '%s' "$input" | grep -oE '"(file_path|notebook_path)" *: *"[^"]*"' | head -1 | sed -E 's/^[^:]*: *"//; s/"$//')"
if [ -n "$path" ]; then
  name="${path##*/}"
  name="${name##*\\}"
  is_secret_env "$name" && block "$name is a secrets file."
fi

# Bash: check every .env-like word in the command.
cmd="$(printf '%s' "$input" | grep -oE '"command" *: *"([^"\\]|\\.)*"' | head -1)"
if [ -n "$cmd" ]; then
  # Split on anything that can't be part of a file name, so "config/.env" yields ".env".
  for word in $(printf '%s' "$cmd" | tr -c 'A-Za-z0-9_.-' '\n' | grep -E '^\.env(\..+)?$'); do
    is_secret_env "$word" && block "the command touches $word."
  done
fi

exit 0
