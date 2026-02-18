#!/bin/bash
# Launch the keeperhub-mcp server.
# Reads configuration from env vars or ~/.claude/keeperhub/config.json.
# Used by .mcp.json as the MCP server entrypoint.

set -euo pipefail

CONFIG_FILE="$HOME/.claude/keeperhub/config.json"

# Read API key: env var first, then config file
API_KEY="${KEEPERHUB_API_KEY:-}"
if [ -z "$API_KEY" ] && [ -f "$CONFIG_FILE" ]; then
  API_KEY=$(grep -o '"apiKey"[[:space:]]*:[[:space:]]*"[^"]*"' "$CONFIG_FILE" | head -1 | sed 's/.*"apiKey"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
fi

if [ -z "$API_KEY" ]; then
  echo "ERROR: No API key found. Run /keeperhub:login to set up." >&2
  exit 1
fi

# Read MCP directory: env var first, then config file, then default install location
MCP_DIR="${KEEPERHUB_MCP_DIR:-}"
if [ -z "$MCP_DIR" ] && [ -f "$CONFIG_FILE" ]; then
  MCP_DIR=$(grep -o '"mcpDir"[[:space:]]*:[[:space:]]*"[^"]*"' "$CONFIG_FILE" | head -1 | sed 's/.*"mcpDir"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
fi
MCP_DIR="${MCP_DIR:-$HOME/.claude/keeperhub/mcp-server}"

# Read base URL
BASE_URL="${KEEPERHUB_API_URL:-}"
if [ -z "$BASE_URL" ] && [ -f "$CONFIG_FILE" ]; then
  BASE_URL=$(grep -o '"baseUrl"[[:space:]]*:[[:space:]]*"[^"]*"' "$CONFIG_FILE" | head -1 | sed 's/.*"baseUrl"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
fi
BASE_URL="${BASE_URL:-https://app.keeperhub.com}"

# Auto-install if MCP server not found
if [ ! -f "$MCP_DIR/src/index.ts" ]; then
  echo "Installing keeperhub-mcp..." >&2
  mkdir -p "$HOME/.claude/keeperhub"
  curl -fsSL https://github.com/techops-services/keeperhub-mcp/archive/refs/heads/main.tar.gz | tar xz -C "$HOME/.claude/keeperhub/"
  rm -rf "$HOME/.claude/keeperhub/mcp-server"
  mv "$HOME/.claude/keeperhub/keeperhub-mcp-main" "$HOME/.claude/keeperhub/mcp-server"
  (cd "$HOME/.claude/keeperhub/mcp-server" && npm install --production 2>&1) >&2
  MCP_DIR="$HOME/.claude/keeperhub/mcp-server"

  if [ ! -f "$MCP_DIR/src/index.ts" ]; then
    echo "ERROR: Failed to install keeperhub-mcp. Run /keeperhub:login for help." >&2
    exit 1
  fi
  echo "keeperhub-mcp installed at $MCP_DIR" >&2
fi

# Export for the MCP server process
export KEEPERHUB_API_KEY="$API_KEY"
export KEEPERHUB_API_URL="$BASE_URL"

# Run the MCP server
exec npx tsx "$MCP_DIR/src/index.ts"
