#!/bin/bash
# Enforces: NEVER use explicit `any` (coding-principles.md, typescript.md)
# Checks Write content and Edit new_string for explicit `any` usage.
# Adapted for Nx monorepo — checks all packages.

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only check .ts and .tsx files
if [[ "$FILE_PATH" != *.ts && "$FILE_PATH" != *.tsx ]]; then
  exit 0
fi

# Skip test, spec, and story files — they may use `any` in mocks
if [[ "$FILE_PATH" == *.test.* || "$FILE_PATH" == *.spec.* || "$FILE_PATH" == *.stories.* || "$FILE_PATH" == */test/* ]]; then
  exit 0
fi

if [[ "$TOOL_NAME" == "Write" ]]; then
  CONTENT=$(echo "$INPUT" | jq -r '.tool_input.content // empty')
elif [[ "$TOOL_NAME" == "Edit" ]]; then
  CONTENT=$(echo "$INPUT" | jq -r '.tool_input.new_string // empty')
else
  exit 0
fi

# Check for explicit `any` patterns — requires any to be followed by a terminator or EOL
# Uses POSIX ERE: ] is first in [...] for compatibility. Also catches any[] via :\s*any\[
VIOLATIONS=$(echo "$CONTENT" | grep -nE ':\s*any\s*[];,=)|&}>]|:\s*any\s*$|:\s*any\[|as\s+any\s*[];,=)|&}>]|as\s+any\s*$|<any>' | grep -vE '^\s*//' | grep -vE '^\s*\*' | grep -vE '^\s*/\*' || true)

if [[ -n "$VIOLATIONS" ]]; then
  echo "BLOCKED: Explicit 'any' type detected in $FILE_PATH." >&2
  echo "Violations:" >&2
  echo "$VIOLATIONS" >&2
  echo "" >&2
  echo "Rule: NEVER use explicit any. Use specific types or 'unknown'." >&2
  echo "Source: coding-principles.md, typescript.md" >&2
  exit 2
fi

exit 0
