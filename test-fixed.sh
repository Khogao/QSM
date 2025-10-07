#!/bin/bash
# Quick test script with console logging

echo "🧪 Testing FIXED QSM Build"
echo "=========================="
echo ""

APPIMAGE="/home/phi/QSM/release/QSM - QueryMaster-1.0.0.AppImage"

# Check Ollama first
echo "📡 Checking Ollama..."
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "✅ Ollama is running"
else
    echo "⚠️  Starting Ollama..."
    ollama serve > /tmp/ollama.log 2>&1 &
    sleep 3
fi

echo ""
echo "🚀 Launching FIXED QSM..."
echo "   Console logs will show in terminal"
echo ""

# Launch with full console output
"$APPIMAGE" 2>&1 | tee /tmp/qsm-fixed-test.log &

PID=$!

echo "✅ Started with PID: $PID"
echo ""
echo "📋 Logs: /tmp/qsm-fixed-test.log"
echo ""
echo "🔍 Watch for these messages:"
echo "   ✅ '📦 Loading from production build: /path/to/index.html'"
echo "   ✅ '✅ Page loaded successfully'"
echo "   ❌ Any errors about failed paths"
echo ""
echo "🛑 To stop: kill $PID"
echo ""
echo "💡 If UI appears, try uploading a document!"
echo ""
