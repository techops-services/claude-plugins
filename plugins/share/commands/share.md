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
Go installed: !`which go 2>/dev/null || echo "NOT_INSTALLED"`
Platform: !`uname -s`
Arch: !`uname -m`
Config exists: !`test -f ~/.config/share/config.toml && echo "YES" || echo "NO"`
</context>

<process>
1. **Auto-install share CLI if missing** by examining the context above
   - If share CLI is `NOT_INSTALLED`:
     a. **Try Go first** (if Go is available):
        ```
        go install github.com/techops-services/share/cmd/share@latest
        ```
     b. **Otherwise download the binary** from GitHub releases:
        - Determine OS: `Darwin` = `darwin`, `Linux` = `linux`
        - Determine arch: `arm64` or `aarch64` = `arm64`, `x86_64` = `amd64`
        - Run:
          ```
          curl -fsSL "https://github.com/techops-services/share/releases/latest/download/share_0.1.0_${OS}_${ARCH}.tar.gz" | tar xz -C /usr/local/bin share
          ```
        - If `/usr/local/bin` needs sudo, try `$HOME/.local/bin` instead (create if needed, and note it must be in PATH)
     c. Verify install: `share version`
     d. If install fails, show the error and stop

2. **Auto-configure if no config exists**
   - If config is `NO`, run `share init` non-interactively by creating a default config:
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
