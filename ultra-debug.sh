#!/bin/bash
# Ultra verbose QSM launch for debugging

echo "🐛 ULTRA VERBOSE QSM DEBUG"
echo "==========================="
echo ""

# Kill existing
pkill -f "QSM - QueryMaster" 2>/dev/null
sleep 1

APPIMAGE="/home/phi/QSM/release/QSM - QueryMaster-1.0.0.AppImage"

echo "🚀 Launching with ALL debug flags..."
echo ""

# Maximum verbosity
export ELECTRON_ENABLE_LOGGING=1
export ELECTRON_ENABLE_STACK_DUMPING=1
export DEBUG=*
export NODE_ENV=development

# Launch and capture EVERYTHING
"$APPIMAGE" --enable-logging --v=1 --vmodule=*/renderer/*=3 2>&1 | tee /tmp/qsm-ultra-verbose.log &

PID=$!

echo "✅ Started (PID: $PID)"
echo "📋 Ultra-verbose logs: /tmp/qsm-ultra-verbose.log"
echo ""
echo "⏳ Waiting 10 seconds for app to initialize..."
sleep 10

echo ""
echo "🔍 Checking for React/JavaScript errors..."
grep -i "react\|mount\|render\|uncaught\|exception" /tmp/qsm-ultra-verbose.log | tail -20

echo ""
echo "💡 Now open DevTools in QSM and check Console tab!"
echo "   Press: Ctrl+Shift+I"
echo "   Go to: Console tab"
echo ""
echo "🛑 To stop: kill $PID"
echo ""
