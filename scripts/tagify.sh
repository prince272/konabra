#!/bin/bash

set -e

echo "🔍 Searching for Go files to normalize JSON struct tags..."

# Find all .go files excluding vendor/, testdata/, and bin/
GO_FILES=$(find . -type f -name "*.go" \
  -not -path "./vendor/*" \
  -not -path "./testdata/*" \
  -not -path "./bin/*")

# Check if gomodifytags is installed
if ! command -v gomodifytags &> /dev/null; then
    echo "❌ gomodifytags is not installed. Please install it with:"
    echo "   go install github.com/fatih/gomodifytags@latest"
    exit 1
fi

# Apply gomodifytags to each .go file
for file in $GO_FILES; do
  echo "✨ Processing $file"

  # Check if the file contains any struct definitions
  if grep -qE 'type [A-Z][A-Za-z0-9_]* struct' "$file"; then
    gomodifytags -file "$file" -add-tags json -transform camelcase -override -all -w && \
      echo "✅ Updated $file" || \
      echo "⚠️ Skipped $file (gomodifytags failed)"
  else
    echo "🚫 Skipped $file (no struct found)"
  fi
done

echo "✅ All struct tags have been normalized to camelCase."
