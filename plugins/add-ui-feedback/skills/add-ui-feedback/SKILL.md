---
name: add-ui-feedback
description: |
  Detect when a complete HTML page has been written and offer to add a visual
  feedback/annotation overlay. The overlay lets users click UI elements to
  annotate them, then copy structured feedback for Claude with element location
  and selector info.
---

<objective>
After Claude writes a complete HTML page, offer to inject the UI feedback system.
When the user accepts, read the injectable bundle from the plugin assets and inject
it into the HTML file.
</objective>

<trigger_conditions>
Activate when ANY of these are true:
- Claude just wrote an .html file that contains `<!DOCTYPE` or `<html` tag
- User says "add feedback", "add annotations", "let me annotate this", "I want to give feedback on this page"
- User says "watch for feedback", "wait for annotations"
</trigger_conditions>

<do_not_trigger>
Do NOT activate when:
- The HTML file already contains `ui-feedback-system` (already injected)
- The file is a template, partial, or component (no doctype/html tag)
- The file is inside `node_modules/`, `.git/`, `__tests__/`, or `test/` directories
- The user already declined to add feedback for this file in the current session
- The file was read but not written by Claude in this session
</do_not_trigger>

<process>
1. **Detect HTML file creation**: After writing an .html file, check if it looks like a complete page
   and does NOT already contain the feedback system.

2. **Offer to add feedback**:
   ```
   I created an HTML page. Want me to add a feedback overlay so you can annotate
   UI elements and copy structured feedback?
   ```

3. **If user accepts**: Run `/add-feedback <path>` to inject the feedback system.

4. **If user declines**: Acknowledge and do not offer again for this file.

5. **Listen for feedback** (if MCP bridge available):
   - Call the `feedback_watch` MCP tool to wait for annotations from the browser
   - When feedback arrives, process the annotations:
     - Read the source file mentioned in the feedback
     - Apply the requested changes based on annotation text and element selectors
     - Call `feedback_respond` MCP tool with a summary of changes made
   - After responding, call `feedback_watch` again to continue listening for more feedback
   - If the user says they're done, stop the watch loop
</process>

<success_criteria>
- Only offer for complete HTML pages, not fragments
- Never offer if already injected
- Offer exactly once per file per session
- If accepted, feedback system works immediately on page load
</success_criteria>
