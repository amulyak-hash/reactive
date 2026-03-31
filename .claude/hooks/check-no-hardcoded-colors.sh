#!/bin/bash
# Enforces: NEVER hardcode hex, rgb, rgba, hsl colors (coding-principles.md, styling.md)
# Checks web app styles.ts and .tsx files.

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only check files in web app src/
if [[ "$FILE_PATH" != */apps/web/src/* ]]; then
  exit 0
fi

if [[ "$FILE_PATH" != *styles.ts && "$FILE_PATH" != *.tsx ]]; then
  exit 0
fi

# Skip test files, story files, and theme files
if [[ "$FILE_PATH" == *.test.* || "$FILE_PATH" == *.spec.* || "$FILE_PATH" == *.stories.* || "$FILE_PATH" == */test/* || "$FILE_PATH" == */theme/* ]]; then
  exit 0
fi

if [[ "$TOOL_NAME" == "Write" ]]; then
  CONTENT=$(echo "$INPUT" | jq -r '.tool_input.content // empty')
elif [[ "$TOOL_NAME" == "Edit" ]]; then
  CONTENT=$(echo "$INPUT" | jq -r '.tool_input.new_string // empty')
else
  exit 0
fi

# Check for hardcoded color values: #hex, rgb(), rgba(), hsl(), hsla()
# Exclude import statements, comments, and common non-color hex patterns
VIOLATIONS=$(echo "$CONTENT" | grep -nE '(#[0-9a-fA-F]{3,8}\b|rgba?\s*\(|hsla?\s*\()' | grep -vE '^\s*//' | grep -vE '^\s*\*' | grep -vE 'import\b' || true)

if [[ -n "$VIOLATIONS" ]]; then
  echo "BLOCKED: Hardcoded color values found in $FILE_PATH." >&2
  echo "Violations:" >&2
  echo "$VIOLATIONS" >&2
  echo "" >&2
  echo "Rule: NEVER hardcode colors. Use theme.palette.*, or other theme tokens." >&2
  echo "Source: coding-principles.md, styling.md" >&2
  exit 2
fi

exit 0
