#!/bin/bash
# Extract console errors from QSM

echo "🔍 QSM Console Error Analysis"
echo "=============================="
echo ""

LOG_FILE="/tmp/qsm-fixed-test.log"

if [ ! -f "$LOG_FILE" ]; then
    echo "❌ No log file found"
    exit 1
fi

echo "📋 JavaScript Errors:"
echo "--------------------"
grep -i "CONSOLE" "$LOG_FILE" | tail -20
echo ""

echo "📋 Failed Fetches:"
echo "-----------------"
grep -i "failed to fetch\|fetch error\|network error" "$LOG_FILE" | tail -20
echo ""

echo "📋 React/Mount Errors:"
echo "---------------------"
grep -i "react\|mount\|render\|root" "$LOG_FILE" | tail -20
echo ""

echo "📋 Asset Loading:"
echo "----------------"
grep -i "\.js\|\.css\|asset\|bundle" "$LOG_FILE" | tail -20
echo ""

echo "📋 Recent Errors (last 50 lines):"
echo "---------------------------------"
tail -50 "$LOG_FILE" | grep -i "error\|failed\|exception"
echo ""

echo "💡 To see full logs:"
echo "   cat $LOG_FILE"
echo ""
