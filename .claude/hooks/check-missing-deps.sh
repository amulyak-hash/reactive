#!/bin/bash
# Enforces: All third-party imports must reference packages installed in package.json.
# Adapted for pnpm monorepo — checks root package.json and app-level package.json.

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only check .ts and .tsx files
if [[ "$FILE_PATH" != *.ts && "$FILE_PATH" != *.tsx ]]; then
  exit 0
fi

if [[ "$TOOL_NAME" == "Write" ]]; then
  CONTENT=$(echo "$INPUT" | jq -r '.tool_input.content // empty')
elif [[ "$TOOL_NAME" == "Edit" ]]; then
  CONTENT=$(echo "$INPUT" | jq -r '.tool_input.new_string // empty')
else
  exit 0
fi

# Find root package.json
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
ROOT_PKG="$PROJECT_DIR/package.json"

if [[ ! -f "$ROOT_PKG" ]]; then
  exit 0
fi

# Determine which app-level package.json to also check
APP_PKG=""
if [[ "$FILE_PATH" == */apps/web/* ]]; then
  APP_PKG="$PROJECT_DIR/apps/web/package.json"
elif [[ "$FILE_PATH" == */apps/mobile/* ]]; then
  APP_PKG="$PROJECT_DIR/apps/mobile/package.json"
elif [[ "$FILE_PATH" == */shared/* ]]; then
  APP_PKG="$PROJECT_DIR/shared/package.json"
fi

# Extract all third-party imports
IMPORTS=$(echo "$CONTENT" | grep -oE '(from|import)\s+"[^".][^"]*"' | grep -oE '"[^"]*"' | tr -d '"' || true)
IMPORTS="$IMPORTS"$'\n'$(echo "$CONTENT" | grep -oE "(from|import)\s+'[^'.][^']*'" | grep -oE "'[^']*'" | tr -d "'" || true)

# Deduplicate and filter empties
IMPORTS=$(echo "$IMPORTS" | sort -u | sed '/^$/d')

if [[ -z "$IMPORTS" ]]; then
  exit 0
fi

MISSING=""
while IFS= read -r pkg; do
  # Skip relative paths and workspace aliases
  if [[ "$pkg" == .* || "$pkg" == /* ]]; then
    continue
  fi

  # Skip workspace package aliases
  if [[ "$pkg" == @people-parley/* || "$pkg" == @org/* ]]; then
    continue
  fi

  # Get the npm package name (scoped: @scope/name, unscoped: first segment)
  if [[ "$pkg" == @* ]]; then
    NPM_PKG=$(echo "$pkg" | cut -d'/' -f1-2)
  else
    NPM_PKG=$(echo "$pkg" | cut -d'/' -f1)
  fi

  # Skip Node built-ins
  case "$NPM_PKG" in
    fs|path|os|url|util|http|https|stream|events|child_process|crypto|buffer|querystring|assert|net|tls|dns|readline|zlib|cluster|worker_threads|perf_hooks|async_hooks|module|vm|inspector)
      continue
      ;;
  esac

  # Skip React built-ins
  case "$NPM_PKG" in
    react|react-dom|react-native|react/jsx-runtime)
      continue
      ;;
  esac

  # Check root package.json first
  FOUND=false
  if jq -e "(.dependencies[\"$NPM_PKG\"] // .devDependencies[\"$NPM_PKG\"]) // empty" "$ROOT_PKG" 2>/dev/null | grep -q .; then
    FOUND=true
  fi

  # Check app-level package.json if exists
  if [[ "$FOUND" == "false" && -n "$APP_PKG" && -f "$APP_PKG" ]]; then
    if jq -e "(.dependencies[\"$NPM_PKG\"] // .devDependencies[\"$NPM_PKG\"]) // empty" "$APP_PKG" 2>/dev/null | grep -q .; then
      FOUND=true
    fi
  fi

  if [[ "$FOUND" == "false" ]]; then
    MISSING="$MISSING  - $NPM_PKG\n"
  fi
done <<< "$IMPORTS"

if [[ -n "$MISSING" ]]; then
  echo "BLOCKED: File imports packages not found in package.json:" >&2
  echo -e "$MISSING" >&2
  echo "Install missing packages:" >&2
  echo "  pnpm add <package-name>              (production dep)" >&2
  echo "  pnpm add -D <package-name>           (dev dep)" >&2
  exit 2
fi

exit 0
