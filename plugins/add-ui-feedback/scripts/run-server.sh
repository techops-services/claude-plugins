#!/usr/bin/env bash
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DIST="$SCRIPT_DIR/server/dist/cli.js"

if [ ! -f "$DIST" ]; then
  echo "Error: MCP bridge not built. Run: cd $SCRIPT_DIR/server && npm run build" >&2
  exit 1
fi

exec node "$DIST" --port "${UI_FEEDBACK_PORT:-4243}"
