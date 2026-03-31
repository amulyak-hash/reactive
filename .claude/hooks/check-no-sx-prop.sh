#!/bin/bash
# Enforces: NEVER use inline sx for production component styling (styling.md, mui-usage.md)
# Only checks web app .tsx files (apps/web/src/).

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only check .tsx files in web app
if [[ "$FILE_PATH" != *.tsx ]]; then
  exit 0
fi

if [[ "$FILE_PATH" != */apps/web/src/* ]]; then
  exit 0
fi

# Skip test and story files
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

# Check for sx={{ or sx={ patterns in JSX, excluding comment lines
VIOLATIONS=$(echo "$CONTENT" | grep -nE '\bsx=\{' | grep -vE '^\s*//' | grep -vE '^\s*\*' | grep -vE '^\s*/\*' || true)

if [[ -n "$VIOLATIONS" ]]; then
  echo "BLOCKED: Production sx prop found in $FILE_PATH." >&2
  echo "Violations:" >&2
  echo "$VIOLATIONS" >&2
  echo "" >&2
  echo "Rule: NEVER use sx in production code. Use styled() in styles.ts instead." >&2
  echo "Source: styling.md, mui-usage.md" >&2
  exit 2
fi

exit 0
