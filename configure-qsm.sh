#!/bin/bash
# QSM Quick Configuration Helper

echo "🔧 QSM Configuration Helper"
echo "============================"
echo ""

# Check if QSM is running
QSM_PID=$(ps aux | grep "QSM - QueryMaster" | grep -v grep | awk '{print $2}')

if [ -n "$QSM_PID" ]; then
    echo "✅ QSM is running (PID: $QSM_PID)"
else
    echo "⚠️  QSM not running"
    echo "   Start with: ./run-qsm.sh"
    echo ""
fi

# Check Ollama
echo "📡 Checking Ollama..."
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "✅ Ollama is running on port 11434"
    echo ""
    echo "Available models:"
    curl -s http://localhost:11434/api/tags | grep -o '"name":"[^"]*"' | cut -d'"' -f4 | while read model; do
        echo "   • $model"
    done
else
    echo "❌ Ollama not running!"
    echo "   Start with: ollama serve &"
    exit 1
fi

echo ""
echo "🎯 Recommended Configuration for X220:"
echo ""
echo "┌─────────────────────────────────────┐"
echo "│ Ollama Settings:                    │"
echo "│   URL: http://localhost:11434       │"
echo "│   Model: llama3.2 or qwen2.5:3b    │"
echo "│   Temperature: 0.7                  │"
echo "│   Max Tokens: 2048                  │"
echo "├─────────────────────────────────────┤"
echo "│ Chunking Settings:                  │"
echo "│   Chunk Size: 500 chars             │"
echo "│   Overlap: 50 chars                 │"
echo "│   Top K Results: 5                  │"
echo "├─────────────────────────────────────┤"
echo "│ Embedding Model:                    │"
echo "│   nomic-embed-text (already loaded) │"
echo "└─────────────────────────────────────┘"
echo ""

# Create config directory if not exists
CONFIG_DIR="$HOME/.config/QSM"
if [ ! -d "$CONFIG_DIR" ]; then
    echo "📁 Creating config directory..."
    mkdir -p "$CONFIG_DIR"
    echo "✅ Created: $CONFIG_DIR"
fi

# Check if config exists
if [ -f "$CONFIG_DIR/settings.json" ]; then
    echo "✅ Config file exists: $CONFIG_DIR/settings.json"
    echo ""
    echo "Current config:"
    cat "$CONFIG_DIR/settings.json" | head -20
else
    echo "⚠️  No config file found"
    echo ""
    read -p "Create default config? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cat > "$CONFIG_DIR/settings.json" << 'EOF'
{
  "ollama": {
    "baseUrl": "http://localhost:11434",
    "model": "llama3.2",
    "temperature": 0.7,
    "maxTokens": 2048
  },
  "embedding": {
    "model": "nomic-embed-text"
  },
  "chunking": {
    "size": 500,
    "overlap": 50,
    "topK": 5
  },
  "performance": {
    "batchSize": 10,
    "maxConcurrent": 2
  }
}
EOF
        echo "✅ Default config created!"
        echo ""
        echo "🔄 Restart QSM to apply:"
        if [ -n "$QSM_PID" ]; then
            echo "   kill $QSM_PID"
            echo "   ./run-qsm.sh"
        else
            echo "   ./run-qsm.sh"
        fi
    fi
fi

echo ""
echo "💡 TESTING CHECKLIST:"
echo ""
echo "1. ✓ Check UI is visible (not white screen)"
echo "2. ☐ Configure Ollama in Settings (if needed)"
echo "3. ☐ Upload a test PDF document"
echo "4. ☐ Run a query: 'What is this document about?'"
echo "5. ☐ Verify results appear within 10 seconds"
echo ""
echo "🆘 If stuck, check:"
echo "   • Console: Ctrl+Shift+I"
echo "   • Logs: /tmp/qsm-fixed-test.log"
echo "   • Ollama: curl http://localhost:11434/api/tags"
echo ""
