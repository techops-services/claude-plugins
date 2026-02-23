---
description: Add a visual feedback/annotation overlay to an HTML page.
argument-hint: [file.html]
allowed-tools: [Bash, Glob, Read, Write, Edit]
---

<objective>
Inject the UI feedback system into an HTML page so the user can visually annotate
UI elements and copy structured feedback for Claude.

Arguments:
- (no args) -- find and inject into the most recently modified .html file
- `path/to/file.html` -- inject into the specified file
</objective>

<context>
Plugin root: ${CLAUDE_PLUGIN_ROOT}
Bundle path: ${CLAUDE_PLUGIN_ROOT}/assets/ui-feedback.js
</context>

<process>
1. **Determine the target file**:
   - If a file path is provided via $ARGUMENTS, use it
   - Otherwise, use Glob to find `**/*.html` files, pick the most recently modified one
   - Exclude files inside `node_modules/`, `.git/`, `dist/`, `build/`, `__tests__/`
   - If no .html files found, tell the user

2. **Check if already injected**:
   - Read the target file
   - If it contains `id="ui-feedback-system"`, tell the user it already has the feedback system and stop

3. **Read the bundle**:
   - Read `${CLAUDE_PLUGIN_ROOT}/assets/ui-feedback.js`

4. **Inject the bundle**:
   - Find the `</body>` tag in the HTML file
   - Insert before it (note the `data-source-file` attribute with the absolute file path):
     ```html
     <!-- UI Feedback System -->
     <script id="ui-feedback-system" data-source-file="ABSOLUTE_PATH_TO_FILE" data-bridge-port="4243">
     [contents of ui-feedback.js]
     </script>
     ```
   - Replace `ABSOLUTE_PATH_TO_FILE` with the actual absolute path of the HTML file
   - If no `</body>` tag exists, append the script at the end of the file
   - Write the modified file

5. **Confirm**:
   - Tell the user: "Added feedback overlay to <path>. Open the page and click 'Feedback' to start annotating. If the MCP bridge is running, annotations send directly to Claude; otherwise use 'Copy for Claude'. Use `/remove-feedback` to remove it when done."
</process>

<success_criteria>
- Bundle injected before </body>
- No duplicate injection
- File not corrupted
- Feedback system works on page load
</success_criteria>
