#!/bin/bash
# Verify KeeperHub API authentication.
# Reads the API key from KEEPERHUB_API_KEY env var or ~/.claude/keeperhub/config.json.
# Exits 0 on success, 1 on failure.
# SECURITY: Never echo or log the API key, even partially.
# Only confirm the prefix type (kh_) without revealing key characters.

set -euo pipefail

API_KEY="${KEEPERHUB_API_KEY:-}"
BASE_URL="${KEEPERHUB_API_URL:-https://app.keeperhub.com}"
CONFIG_FILE="$HOME/.claude/keeperhub/config.json"

# Try config file if env var is not set
if [ -z "$API_KEY" ] && [ -f "$CONFIG_FILE" ]; then
  API_KEY=$(grep -o '"apiKey"[[:space:]]*:[[:space:]]*"[^"]*"' "$CONFIG_FILE" | head -1 | sed 's/.*"apiKey"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
fi

if [ -z "$API_KEY" ]; then
  echo "ERROR: No API key found. Run /keeperhub:login to set up."
  exit 1
fi

# Validate key prefix
if [[ ! "$API_KEY" == kh_* ]]; then
  echo "WARNING: Key does not start with kh_ (organization key required)"
  echo "User-scoped wfb_ keys will not work with KeeperHub MCP"
  echo "Run /keeperhub:login to create an organization API key"
  exit 1
fi

# Read base URL from config if not in env
if [ "$BASE_URL" = "https://app.keeperhub.com" ] && [ -f "$CONFIG_FILE" ]; then
  CONF_URL=$(grep -o '"baseUrl"[[:space:]]*:[[:space:]]*"[^"]*"' "$CONFIG_FILE" | head -1 | sed 's/.*"baseUrl"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
  if [ -n "$CONF_URL" ]; then
    BASE_URL="$CONF_URL"
  fi
fi

# Show key prefix
echo "Using key: kh_*** (masked)"

# Test connection
HTTP_CODE=$(curl -sf -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $API_KEY" \
  "$BASE_URL/api/workflows?limit=1" 2>/dev/null || echo "000")

case "$HTTP_CODE" in
  200)
    echo "OK: Authenticated successfully"
    exit 0
    ;;
  401|403)
    echo "ERROR: API key is invalid or revoked (HTTP $HTTP_CODE)"
    exit 1
    ;;
  000)
    echo "ERROR: Could not connect to $BASE_URL"
    exit 1
    ;;
  *)
    echo "ERROR: Unexpected response (HTTP $HTTP_CODE)"
    exit 1
    ;;
esac
