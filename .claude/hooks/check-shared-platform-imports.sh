#!/bin/bash
# Enforces: Golden Rule #1 — shared/ must NEVER import react-dom, react-native, or @mui/*
# This is the most critical monorepo boundary rule.
# Blocks Write/Edit to shared/src/ files that contain platform-specific imports.

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only check files in shared/src/
if [[ "$FILE_PATH" != */shared/src/* ]]; then
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

# Check for platform-specific imports AND app workspace alias imports, excluding comment lines
# Catches: react-dom, react-native, @mui/*, @org/web, @org/mobile
VIOLATIONS=$(echo "$CONTENT" | grep -nE "from\s+['\"]react-dom|from\s+['\"]react-native|from\s+['\"]@mui/|import\s+['\"]@mui/|from\s+['\"]@org/web|from\s+['\"]@org/mobile|import\s+['\"]@org/web|import\s+['\"]@org/mobile" | grep -vE '^\s*//' | grep -vE '^\s*\*' | grep -vE '^\s*/\*' || true)

if [[ -n "$VIOLATIONS" ]]; then
  echo "BLOCKED: Platform-specific import found in shared/ file: $FILE_PATH" >&2
  echo "Violations:" >&2
  echo "$VIOLATIONS" >&2
  echo "" >&2
  echo "Rule: shared/ must NEVER import react-dom, react-native, @mui/*, or app packages (@org/web, @org/mobile)." >&2
  echo "If this code needs platform-specific modules, move it to the app package (apps/web/ or apps/mobile/)." >&2
  echo "Source: CLAUDE.md Golden Rule #1, architecture.md" >&2
  exit 2
fi

exit 0
