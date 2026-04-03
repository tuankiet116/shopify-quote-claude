#!/bin/bash
# Hook: Block modifications to existing test files.
# Allows creating NEW test files, blocks editing EXISTING ones.

FILE=$(jq -r '.tool_input.file_path // empty')

if [ -z "$FILE" ]; then
  echo '{"decision":"allow"}'
  exit 0
fi

# Check if file matches test patterns AND already exists on disk
if echo "$FILE" | grep -qE '\.(spec|test)\.(ts|tsx|php)$' && [ -f "$FILE" ]; then
  echo "{\"decision\":\"block\",\"reason\":\"Test file modification blocked: $FILE — Do not modify tests to make them pass. Fix the production code instead.\"}"
else
  echo '{"decision":"allow"}'
fi
