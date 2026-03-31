#!/bin/bash
# Warns when a source file is written without a co-located test file.
# PostToolUse — warning only (exit 0).

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only check .ts and .tsx source files
if [[ "$FILE_PATH" != *.ts && "$FILE_PATH" != *.tsx ]]; then
  exit 0
fi

# Only check files in src/ directories
if [[ "$FILE_PATH" != */src/* ]]; then
  exit 0
fi

# Skip files that don't need tests: test files themselves, stories, styles, types, barrel exports, theme
BASENAME=$(basename "$FILE_PATH")
if [[ "$BASENAME" == *.test.* || "$BASENAME" == *.spec.* || "$BASENAME" == *.stories.* ]]; then
  exit 0
fi
if [[ "$BASENAME" == "index.ts" || "$BASENAME" == "styles.ts" || "$BASENAME" == "types.ts" ]]; then
  exit 0
fi
if [[ "$FILE_PATH" == */theme/* || "$FILE_PATH" == */test/* || "$FILE_PATH" == */mocking/* ]]; then
  exit 0
fi

# Only warn on Write (new file creation), not Edit (existing file modification)
if [[ "$TOOL_NAME" != "Write" ]]; then
  exit 0
fi

# Derive expected test file path
DIR=$(dirname "$FILE_PATH")
NAME_NO_EXT="${BASENAME%.*}"
EXT="${BASENAME##*.}"

TEST_FILE="$DIR/$NAME_NO_EXT.test.$EXT"

if [[ ! -f "$TEST_FILE" ]]; then
  echo "WARNING: No co-located test file found for $FILE_PATH" >&2
  echo "Expected: $TEST_FILE" >&2
  echo "Rule: Every source file should have a co-located test file." >&2
  echo "Source: testing.md" >&2
fi

exit 0
