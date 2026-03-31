#!/bin/bash
# Enforces: NEVER use raw numeric dimensions in styles (styling.md)
# Checks web app styles.ts for hardcoded px values and .tsx for raw numeric dimension props.

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only check web app src/
if [[ "$FILE_PATH" != */apps/web/src/* ]]; then
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

# For styles.ts files: check for raw unit strings AND bare numeric dimension properties
if [[ "$FILE_PATH" == *styles.ts ]]; then
  # Pass 1: catches "16px", "1rem", "0.5em" string literals
  STRING_VIOLATIONS=$(echo "$CONTENT" | grep -nE '"[0-9]+\.?[0-9]*(px|r?em)"' | grep -vE '^\s*//' | grep -vE '^\s*\*' | grep -vE '^\s*/\*' || true)

  # Pass 2: catches bare numeric dimension properties (fontSize: 14, width: 368)
  # lineHeight excluded — unitless lineHeight (1.5) is valid CSS multiplier
  # Lines with theme. or spacing references are excluded to prevent false positives
  PROP_VIOLATIONS=$(echo "$CONTENT" | grep -nE '(width|height|fontSize|minWidth|maxWidth|minHeight|maxHeight|margin|marginTop|marginBottom|marginLeft|marginRight|padding|paddingTop|paddingBottom|paddingLeft|paddingRight|gap|rowGap|columnGap|borderRadius|top|right|bottom|left):\s*[0-9]' | grep -vE '^\s*//' | grep -vE '^\s*\*' | grep -vE '^\s*/\*' | grep -vE 'theme\.' | grep -vE 'spacing' || true)

  # Combine violations with proper newline handling
  VIOLATIONS=$(printf '%s\n%s' "$STRING_VIOLATIONS" "$PROP_VIOLATIONS" | sed '/^$/d')

  if [[ -n "$VIOLATIONS" ]]; then
    echo "BLOCKED: Raw dimension values found in $FILE_PATH." >&2
    echo "Violations:" >&2
    echo "$VIOLATIONS" >&2
    echo "" >&2
    echo "Rule: Use theme.spacing(), theme.customSpacing, or other theme tokens instead of raw values." >&2
    echo "Source: styling.md" >&2
    exit 2
  fi
fi

# For .tsx files: check for MUI component props with raw numeric dimensions
if [[ "$FILE_PATH" == *.tsx ]]; then
  VIOLATIONS=$(echo "$CONTENT" | grep -nE '\b(width|height|size|minWidth|maxWidth|minHeight|maxHeight|margin|marginTop|marginBottom|marginLeft|marginRight|padding|paddingTop|paddingBottom|paddingLeft|paddingRight|gap|rowGap|columnGap)=\{[0-9]+\}' | grep -vE '^\s*//' | grep -vE '^\s*\*' | grep -vE '^\s*/\*' || true)
  if [[ -n "$VIOLATIONS" ]]; then
    echo "BLOCKED: Raw numeric dimension props found in $FILE_PATH." >&2
    echo "Violations:" >&2
    echo "$VIOLATIONS" >&2
    echo "" >&2
    echo "Rule: Create a styled component in styles.ts with theme.spacing() instead of raw numeric MUI props." >&2
    echo "Source: styling.md" >&2
    exit 2
  fi
fi

exit 0
