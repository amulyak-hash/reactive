#!/bin/bash
# Enforces: Golden Rule #4 — apps must NEVER import from each other.
# Blocks apps/web/ from importing @org/mobile and vice versa.

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only check app source files
if [[ "$FILE_PATH" != */apps/web/src/* && "$FILE_PATH" != */apps/mobile/src/* ]]; then
  exit 0
fi

# Only check .ts and .tsx files
if [[ "$FILE_PATH" != *.ts && "$FILE_PATH" != *.tsx ]]; then
  exit 0
fi

# Skip test and spec files
if [[ "$FILE_PATH" == *.test.* || "$FILE_PATH" == *.spec.* || "$FILE_PATH" == */test/* ]]; then
  exit 0
fi

if [[ "$TOOL_NAME" == "Write" ]]; then
  CONTENT=$(echo "$INPUT" | jq -r '.tool_input.content // empty')
elif [[ "$TOOL_NAME" == "Edit" ]]; then
  CONTENT=$(echo "$INPUT" | jq -r '.tool_input.new_string // empty')
else
  exit 0
fi

VIOLATIONS=""

# Web app must not import from mobile
if [[ "$FILE_PATH" == */apps/web/src/* ]]; then
  VIOLATIONS=$(echo "$CONTENT" | grep -nE "from\s+['\"]@org/mobile|import\s+['\"]@org/mobile" | grep -vE '^\s*//' | grep -vE '^\s*\*' | grep -vE '^\s*/\*' || true)
fi

# Mobile app must not import from web
if [[ "$FILE_PATH" == */apps/mobile/src/* ]]; then
  VIOLATIONS=$(echo "$CONTENT" | grep -nE "from\s+['\"]@org/web|import\s+['\"]@org/web" | grep -vE '^\s*//' | grep -vE '^\s*\*' | grep -vE '^\s*/\*' || true)
fi

if [[ -n "$VIOLATIONS" ]]; then
  echo "BLOCKED: Cross-app import detected in $FILE_PATH." >&2
  echo "Violations:" >&2
  echo "$VIOLATIONS" >&2
  echo "" >&2
  echo "Rule: Apps must NEVER import from each other. Use shared/ for cross-app code." >&2
  echo "Source: CLAUDE.md Golden Rule #4, architecture.md" >&2
  exit 2
fi

exit 0
