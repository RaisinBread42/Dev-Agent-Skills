#!/usr/bin/env bash
# Copy the Dev Agent Kit into a project, or pull template updates into it.
# Run from the project root:
#   curl -sSL https://raw.githubusercontent.com/RaisinBread42/Dev-Agent-Skills/main/scripts/sync.sh | bash   # first time
#   bash scripts/sync.sh                                                                                       # later
# Optional argument: another source (a local folder or git URL). The last source used is remembered.
#
# Updates:  .claude/skills/<kit skills>, .claude/hooks/, scripts/gate.sh, scripts/sync.sh,
#           .claude/kit/ (reference copies of CLAUDE.template.md, docs-templates, ci, pr-template, settings)
# Never touches: CLAUDE.md, docs/, .claude/gate.conf, .claude/settings.json, .github/,
#           or skills the project added itself.

set -eu

main() {
  src="${1:-$(cat .claude/kit-source 2>/dev/null || true)}"
  src="${src:-https://github.com/RaisinBread42/Dev-Agent-Skills.git}"

  tpl="$src"
  case "$src" in
    *://*|git@*|*.git)
      tpl="$(mktemp -d)"
      trap 'rm -rf "$tpl"' EXIT
      git clone --quiet --depth 1 "$src" "$tpl"
      ;;
  esac

  if [ ! -f "$tpl/CLAUDE.template.md" ]; then
    echo "sync: $tpl does not look like the Dev Agent Kit (no CLAUDE.template.md)"
    exit 1
  fi

  mkdir -p .claude/skills .claude/hooks .claude/kit scripts

  for dir in "$tpl"/skills/*/; do
    name="$(basename "$dir")"
    rm -rf ".claude/skills/$name"
    cp -R "$dir" ".claude/skills/$name"
    echo "sync: skill $name"
  done

  cp "$tpl"/hooks/*.sh .claude/hooks/
  cp "$tpl"/scripts/gate.sh "$tpl"/scripts/sync.sh scripts/

  rm -rf .claude/kit
  mkdir -p .claude/kit
  cp -R "$tpl/CLAUDE.template.md" "$tpl/docs-templates" "$tpl/ci" "$tpl/pr-template.md" .claude/kit/
  cp "$tpl/hooks/settings.json" .claude/kit/settings.json

  echo "$src" > .claude/kit-source

  echo
  echo "sync: done. Review the changes with: git diff --stat"
  if [ ! -f .claude/gate.conf ]; then
    echo "sync: first install. Next: ask Claude to run the project-setup skill."
  fi
}

# Everything runs inside main so the script can safely overwrite itself.
main "$@"
exit
