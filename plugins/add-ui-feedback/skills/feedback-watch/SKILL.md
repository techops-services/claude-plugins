---
name: feedback-watch
description: |
  Watch for UI feedback annotations from the browser via the MCP bridge.
  Processes incoming annotations, makes code changes, and responds back
  to the browser. Runs in a loop until the user stops.
---

<objective>
Wait for UI feedback from the browser, process annotations, make changes,
and respond back. Continue listening until the user says to stop.
</objective>

<trigger_conditions>
Activate when ANY of these are true:
- User says "watch for feedback", "wait for annotations", "listen for feedback"
- User says "start feedback loop" or "feedback mode"
- After running /add-feedback, if the MCP bridge is available
</trigger_conditions>

<do_not_trigger>
Do NOT activate when:
- The feedback_watch MCP tool is not available
- User is asking about feedback in a general sense (not the UI annotation system)
</do_not_trigger>

<process>
1. **Start watching**: Call the `feedback_watch` MCP tool (timeout: 300s)
   - Tell the user: "Watching for feedback from the browser. Annotate elements on the page and click 'Send to Claude'."

2. **Process feedback**: When feedback arrives:
   - Parse the annotations (section, label, selector, HTML, feedback text)
   - Read the source file from the feedback entry
   - For each annotation, determine what change is needed based on the feedback text
   - Make the requested code changes to the source file
   - Summarize what was changed

3. **Respond to browser**: Call `feedback_respond` MCP tool with:
   - The feedback_id from the received feedback
   - A message summarizing what changes were made

4. **Continue loop**: Call `feedback_watch` again to wait for more feedback
   - If user says "stop", "done", "exit", or "quit", stop the loop
   - Otherwise, continue processing feedback as it arrives

5. **Cleanup**: When stopping, tell the user:
   "Stopped watching for feedback. Your changes have been saved."
</process>

<success_criteria>
- Feedback received and processed within the watch timeout
- Source file changes match the annotation requests
- Response sent back to browser via feedback_respond
- Loop continues until user explicitly stops
</success_criteria>
