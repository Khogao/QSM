#!/bin/bash
# QSM Quick Launch Script for Lenovo X220

echo "🚀 Launching QSM - QueryMaster..."
echo ""

# Check if AppImage exists
APPIMAGE="/home/phi/QSM/release/QSM - QueryMaster-1.0.0.AppImage"

if [ ! -f "$APPIMAGE" ]; then
    echo "❌ Error: AppImage not found!"
    echo "   Expected: $APPIMAGE"
    echo ""
    echo "💡 Did you build QSM yet?"
    echo "   Run: cd /home/phi/QSM && ./build-linux.sh"
    exit 1
fi

# Make executable if needed
if [ ! -x "$APPIMAGE" ]; then
    echo "🔧 Making AppImage executable..."
    chmod +x "$APPIMAGE"
fi

# Check if Ollama is running
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "✅ Ollama is running on port 11434"
else
    echo "⚠️  Ollama is not running"
    echo "   Start with: ollama serve &"
    echo "   Or install: ./install-ollama.sh"
fi

echo ""
echo "🎯 Starting QSM..."
echo ""

# Launch QSM
"$APPIMAGE" &

PID=$!
echo "✅ QSM launched with PID: $PID"
echo ""
echo "💡 Tips:"
echo "   • First run takes ~60 seconds (YOLO mode)"
echo "   • Upload documents via 'Upload Files' button"
echo "   • Configure Ollama in Settings if not already done"
echo ""
echo "🛑 To stop QSM:"
echo "   kill $PID"
echo ""
