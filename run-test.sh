#!/bin/bash

# Photoshop Test Simulator 실행 스크립트

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SCRIPT_PATH="$SCRIPT_DIR/test-simulator.jsx"

echo "Running test-simulator.jsx in Photoshop..."
echo "Script path: $SCRIPT_PATH"

# macOS에서 Photoshop으로 스크립트 실행
osascript <<EOF
tell application "Adobe Photoshop 2024"
    activate
    do javascript file "$SCRIPT_PATH"
end tell
EOF

echo "Test completed. Check Photoshop for results."