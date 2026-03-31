#!/bin/bash
# Enforces: TypeScript type check must pass (execution-flow.md)
# Runs after Write/Edit on .ts/.tsx files. Warning only — does not block.
# Debounced: only runs if 30+ seconds have passed since last check.
# Adapted for Nx monorepo — runs nx typecheck for the affected project.

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only check .ts and .tsx files in src directories
if [[ "$FILE_PATH" != */src/*.ts && "$FILE_PATH" != */src/*.tsx ]]; then
  exit 0
fi

# Skip test, spec, and story files
if [[ "$FILE_PATH" == *.test.* || "$FILE_PATH" == *.spec.* || "$FILE_PATH" == *.stories.* || "$FILE_PATH" == */test/* ]]; then
  exit 0
fi

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"

# Debounce: skip if last check was less than 30 seconds ago
STAMP_FILE="/tmp/.claude-tsc-last-run-$(echo "$PROJECT_DIR" | md5 2>/dev/null || echo "$PROJECT_DIR" | md5sum 2>/dev/null | cut -d' ' -f1)"
if [[ -f "$STAMP_FILE" ]]; then
  LAST_RUN=$(cat "$STAMP_FILE" 2>/dev/null || echo 0)
  NOW=$(date +%s)
  ELAPSED=$((NOW - LAST_RUN))
  if [[ $ELAPSED -lt 30 ]]; then
    exit 0
  fi
fi

# Update timestamp
date +%s > "$STAMP_FILE" 2>/dev/null

# Determine which Nx project to typecheck based on file path
NX_PROJECT=""
if [[ "$FILE_PATH" == */apps/web/* ]]; then
  NX_PROJECT="@org/web"
elif [[ "$FILE_PATH" == */apps/mobile/* ]]; then
  NX_PROJECT="@org/mobile"
elif [[ "$FILE_PATH" == */shared/* ]]; then
  NX_PROJECT="@people-parley/shared"
fi

# Run typecheck for the specific project (faster than full pnpm typecheck)
if [[ -n "$NX_PROJECT" ]]; then
  TSC_OUTPUT=$(cd "$PROJECT_DIR" && npx nx typecheck "$NX_PROJECT" 2>&1)
else
  TSC_OUTPUT=$(cd "$PROJECT_DIR" && pnpm typecheck 2>&1)
fi
TSC_EXIT=$?

if [[ $TSC_EXIT -ne 0 ]]; then
  ERROR_COUNT=$(echo "$TSC_OUTPUT" | grep -c "error TS" || true)
  echo "WARNING: TypeScript type check found $ERROR_COUNT error(s) in $NX_PROJECT." >&2
  echo "$TSC_OUTPUT" | grep "error TS" | head -15 >&2
  if [[ $ERROR_COUNT -gt 15 ]]; then
    echo "... and $((ERROR_COUNT - 15)) more error(s). Run 'nx typecheck $NX_PROJECT' to see all." >&2
  fi
  echo "" >&2
  echo "Source: execution-flow.md (step 7)" >&2
fi

exit 0
