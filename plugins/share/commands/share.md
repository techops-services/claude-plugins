---
description: Share an HTML file as a live page via the share CLI. Returns a short URL.
argument-hint: [file.html | --clipboard]
allowed-tools: [Bash, Glob, Read]
---

<objective>
Upload an HTML file using the `share` CLI and return the live URL. Supports sharing a specific file, the most recently modified .html file, or HTML content from the system clipboard.

Arguments:
- (no args) -- find and share the most recently modified .html file in the working directory
- `path/to/file.html` -- share the specified file
- `--clipboard` -- share HTML content from the system clipboard via `pbpaste | share`
</objective>

<context>
Share CLI installed: !`which share 2>/dev/null || echo "NOT_INSTALLED"`
Config exists: !`test -f ~/.config/share/config.toml && echo "YES" || echo "NO"`
</context>

<process>
1. **Auto-install share CLI if missing** by examining the context above
   - If share CLI is `NOT_INSTALLED`, run the install script:
     ```
     curl -fsSL https://raw.githubusercontent.com/techops-services/share/main/install.sh | bash
     ```
   - Verify install: `share version`
   - If install fails, show the error and stop

2. **Auto-configure if no config exists**
   - If config is `NO`, create a default config:
     ```
     mkdir -p ~/.config/share && cat > ~/.config/share/config.toml << 'CONF'
     endpoint = "https://share.techops.services"
     default_ttl = "24h"
     clipboard = true
     CONF
     ```

3. **Determine the target** based on $ARGUMENTS:
   - If `--clipboard`: run `pbpaste | share` via Bash
   - If a file path is provided: verify the file exists, then run `share <path>`
   - If no arguments: use Glob to find `**/*.html` files in the working directory, pick the most recently modified one (first result from Glob, which sorts by modification time). Exclude files inside `node_modules/`, `.git/`, `dist/`, `build/`, and `__tests__/` directories. If no .html files found, tell the user.

4. **Run the share command** via Bash:
   ```
   share <file>
   ```
   The CLI prints the URL to stdout and copies it to the clipboard automatically.

5. **Parse and present the result**:
   - The first line of stdout is the URL
   - Present: `Shared at <url> (copied to clipboard)`
   - If the command fails, show the error message
</process>

<success_criteria>
- Binary auto-installed if missing
- Config auto-created if missing
- URL returned and displayed to user
- If no HTML file found, user informed with helpful context
</success_criteria>
