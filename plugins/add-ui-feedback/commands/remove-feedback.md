---
description: Remove the UI feedback overlay from an HTML page.
argument-hint: [file.html]
allowed-tools: [Bash, Glob, Read, Edit]
---

<objective>
Remove the injected UI feedback system from an HTML page, restoring it to its
original state.

Arguments:
- (no args) -- find and clean the most recently modified .html file that contains the feedback system
- `path/to/file.html` -- remove from the specified file
</objective>

<process>
1. **Determine the target file**:
   - If a file path is provided via $ARGUMENTS, use it
   - Otherwise, use Grep to find files containing `id="ui-feedback-system"`, pick the most recently modified one
   - If no files found, tell the user no feedback system was found to remove

2. **Read the file** and verify it contains the feedback system marker `id="ui-feedback-system"`

3. **Remove the injected block**:
   - Find the `<!-- UI Feedback System -->` comment and the `<script id="ui-feedback-system">...</script>` block
   - Remove both the comment and the entire script tag (everything from `<!-- UI Feedback System -->` through `</script>`)
   - Use Edit tool to replace the block with empty string

4. **Confirm**: Tell the user "Removed feedback overlay from <path>."
</process>

<success_criteria>
- Script block fully removed, no leftover fragments
- File is valid HTML after removal
- data-fb attributes added by auto-tagging are NOT removed (they are in localStorage, not in the file)
</success_criteria>
