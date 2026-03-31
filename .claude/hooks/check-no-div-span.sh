#!/bin/bash
# Enforces: NEVER use raw HTML elements in web component JSX (coding-principles.md, styling.md)
# Catches: <div>, <span>, <p>, <h1>-<h6>
# Only checks web app .tsx files (apps/web/src/).

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only check .tsx files in the web app
if [[ "$FILE_PATH" != *.tsx ]]; then
  exit 0
fi

if [[ "$FILE_PATH" != */apps/web/src/* ]]; then
  exit 0
fi

# Skip test files, spec files, and story files
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

# Check for raw HTML elements, excluding comment lines
VIOLATIONS=$(echo "$CONTENT" | grep -nE '<div\b|<span\b|<p\b|<h[1-6]\b' | grep -vE '^\s*//' | grep -vE '^\s*\*' | grep -vE '^\s*/\*' || true)

if [[ -n "$VIOLATIONS" ]]; then
  echo "BLOCKED: Raw HTML element(s) found in $FILE_PATH." >&2
  echo "Violations:" >&2
  echo "$VIOLATIONS" >&2
  echo "" >&2
  echo "Rule: NEVER use <div>, <span>, <p>, or <h1>-<h6>. Use MUI components (Box, Stack, Typography, etc.)." >&2
  echo "Source: coding-principles.md, styling.md, mui-usage.md" >&2
  exit 2
fi

exit 0
