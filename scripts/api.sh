#!/bin/bash

set -e

BIN_DIR="./bin"
BUILD_OUTPUT="$BIN_DIR/api"

# Define source-destination pairs
declare -A FILES_TO_COPY=(
  [".env"]="$BIN_DIR/.env"
)

# Check if swag is installed
if ! command -v swag &> /dev/null
then
    echo "❌ swag command could not be found. Please install it first."
    exit 1
fi

clean() {
  echo -e "🧹 Cleaning bin directory..."
  rm -rf "$BIN_DIR"
  echo -e "✅ Cleaned."
}

build() {
  clean  # Clean before building

  echo -e "🔄 Generating Swagger docs..."
  swag init -g ./cmd/api/main.go -o ./docs/swagger
  echo -e "✅ Swagger docs generated."

  echo -e "🔨 Building the project..."
  go build -o "$BUILD_OUTPUT" ./cmd/api
  echo -e "✅ Build complete."

  echo -e "📁 Copying necessary files to bin/..."
  for src in "${!FILES_TO_COPY[@]}"; do
    dest="${FILES_TO_COPY[$src]}"
    dest_dir=$(dirname "$dest")

    mkdir -p "$dest_dir"

    if [ -f "$src" ]; then
      cp "$src" "$dest"
      echo -e "✅ Copied $src to $dest"
    else
      echo -e "⚠️ Skipped missing file: $src"
    fi
  done
}

case "$1" in
  build)
    build
    ;;
  clean)
    clean
    ;;
  *)
    echo -e "❌ Usage: $0 {build|clean}"
    exit 1
    ;;
esac
