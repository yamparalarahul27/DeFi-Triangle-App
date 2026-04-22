#!/usr/bin/env bash
# PostToolUse hook: run `npm audit --audit-level=high` after an npm install/add/remove.
# Fires on every Bash tool call but only runs the audit when the command was a dep change.
# Non-blocking: exits 0 unless vulns found, in which case exits 2 so Claude sees the alert.

set -uo pipefail

PAYLOAD="$(cat)"

COMMAND="$(printf '%s' "$PAYLOAD" | node -e "
let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{
  try { const p=JSON.parse(d); process.stdout.write((p.tool_input&&p.tool_input.command)||''); }
  catch { process.stdout.write(''); }
});" 2>/dev/null || echo "")"

if [[ -z "$COMMAND" ]]; then
  exit 0
fi

if ! echo "$COMMAND" | grep -qE '(^|[[:space:]&;|])(npm[[:space:]]+(install|i|add|uninstall|remove|rm|update|up)|pnpm[[:space:]]+(add|install|remove|rm|update|up)|yarn[[:space:]]+(add|install|remove|upgrade))([[:space:]]|$)'; then
  exit 0
fi

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"

if [[ ! -f "$PROJECT_DIR/package.json" ]]; then
  exit 0
fi

cd "$PROJECT_DIR" || exit 0

AUDIT_OUTPUT="$(npm audit --audit-level=high --json 2>/dev/null || true)"

if [[ -z "$AUDIT_OUTPUT" ]]; then
  exit 0
fi

HIGH_OR_CRITICAL="$(printf '%s' "$AUDIT_OUTPUT" | node -e "
let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{
  try {
    const a = JSON.parse(d);
    const v = (a.metadata && a.metadata.vulnerabilities) || {};
    const n = (v.high || 0) + (v.critical || 0);
    process.stdout.write(String(n));
  } catch { process.stdout.write('0'); }
});" 2>/dev/null || echo "0")"

if [[ "$HIGH_OR_CRITICAL" != "0" && -n "$HIGH_OR_CRITICAL" ]]; then
  >&2 echo "ALERT from .claude/hooks/audit-if-deps-changed.sh"
  >&2 echo "npm audit reports $HIGH_OR_CRITICAL high/critical vulnerabilities after: $COMMAND"
  >&2 echo "Run 'npm audit' to see details, then propose a fix to the user before proceeding."
  exit 2
fi

exit 0
