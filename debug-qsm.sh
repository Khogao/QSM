#!/bin/bash
# QSM Debug Launch Script - Shows detailed console logs

echo "🐛 QSM DEBUG MODE"
echo "================="
echo ""

APPIMAGE="/home/phi/QSM/release/QSM - QueryMaster-1.0.0.AppImage"

# Check AppImage
if [ ! -f "$APPIMAGE" ]; then
    echo "❌ AppImage not found!"
    exit 1
fi

# Check Ollama
echo "📡 Checking Ollama..."
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "✅ Ollama running on port 11434"
    
    # List available models
    echo ""
    echo "Available models:"
    curl -s http://localhost:11434/api/tags | grep -o '"name":"[^"]*"' | cut -d'"' -f4
    echo ""
else
    echo "⚠️  Ollama not responding on port 11434"
    echo ""
fi

# Check if model is working
echo "🧪 Testing llama3.2 model..."
TEST_RESPONSE=$(curl -s -X POST http://localhost:11434/api/chat \
    -d '{"model":"llama3.2","messages":[{"role":"user","content":"hello"}],"stream":false}' 2>&1)

if echo "$TEST_RESPONSE" | grep -q "error"; then
    echo "❌ Model test FAILED:"
    echo "$TEST_RESPONSE" | head -5
    echo ""
    echo "💡 Try these fixes:"
    echo "   1. Stop Ollama: pkill ollama"
    echo "   2. Start fresh: ollama serve &"
    echo "   3. Pull model: ollama pull llama3.2:3b"
    echo ""
else
    echo "✅ Model responding OK"
    echo ""
fi

# Launch with debug
echo "🚀 Launching QSM with console output..."
echo "   (Press Ctrl+C to stop)"
echo ""

# Set environment for debug
export ELECTRON_ENABLE_LOGGING=1
export DEBUG=*

# Launch and capture output
"$APPIMAGE" 2>&1 | tee /tmp/qsm-debug.log &

PID=$!
echo ""
echo "✅ QSM started with PID: $PID"
echo "📋 Logs being saved to: /tmp/qsm-debug.log"
echo ""
echo "💡 If white screen appears:"
echo "   1. Open DevTools: Ctrl+Shift+I"
echo "   2. Check Console tab for errors"
echo "   3. Check Network tab for failed requests"
echo ""
echo "🛑 To stop: kill $PID"
echo ""

# Wait a bit and check if still running
sleep 5
if ps -p $PID > /dev/null; then
    echo "✅ QSM still running after 5 seconds"
    echo ""
    echo "📊 If you see white screen, check:"
    echo "   • Settings → Configure Ollama URL"
    echo "   • Should be: http://localhost:11434"
    echo "   • Select model: llama3.2 or qwen2.5:3b"
else
    echo "❌ QSM crashed! Check logs:"
    echo ""
    tail -20 /tmp/qsm-debug.log
fi
