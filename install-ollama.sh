#!/bin/bash
# Quick Ollama Installation for QSM
# For Lenovo X220 (Linux Mint 22.2)

set -e

echo "🦙 Ollama Installation Script for QSM"
echo "======================================"
echo ""

# Check if already installed
if command -v ollama &> /dev/null; then
    echo "✅ Ollama is already installed!"
    ollama --version
    echo ""
    read -p "Reinstall anyway? (y/N): " reinstall
    if [[ ! $reinstall =~ ^[Yy]$ ]]; then
        echo "Skipping installation..."
        exit 0
    fi
fi

# Install Ollama
echo "📥 Downloading and installing Ollama..."
curl -fsSL https://ollama.com/install.sh | sh

echo ""
echo "✅ Ollama installed successfully!"
echo ""

# Start Ollama service
echo "🚀 Starting Ollama service..."
ollama serve > /dev/null 2>&1 &
OLLAMA_PID=$!
echo "   Ollama running on PID: $OLLAMA_PID"
sleep 5

# Download recommended models
echo ""
echo "📦 Downloading recommended models..."
echo "   (This will take 5-10 minutes depending on internet speed)"
echo ""

# Model 1: Llama3.2 3B (Best for X220)
echo "1️⃣  Downloading Llama3.2:3b (~2GB) - Recommended for X220"
ollama pull llama3.2:3b

echo ""
echo "2️⃣  Downloading Llama3.2:1b (~700MB) - Fastest option"
ollama pull llama3.2:1b

# Optional: Offer larger model
echo ""
read -p "Download Qwen2.5:7b (~4.5GB) for better quality? (y/N): " install_qwen
if [[ $install_qwen =~ ^[Yy]$ ]]; then
    echo "3️⃣  Downloading Qwen2.5:7b (~4.5GB)"
    ollama pull qwen2.5:7b
fi

echo ""
echo "✅ Models downloaded successfully!"
echo ""

# List installed models
echo "📋 Installed models:"
ollama list

echo ""
echo "🎉 Ollama setup complete!"
echo ""
echo "📝 Configuration for QSM:"
echo "   1. Open QSM"
echo "   2. Click ⚙️  Settings"
echo "   3. Select 'Ollama' provider"
echo "   4. Base URL: http://localhost:11434"
echo "   5. Model: llama3.2:3b (or llama3.2:1b for speed)"
echo ""
echo "💡 Tips:"
echo "   • llama3.2:1b - Fastest, uses ~1GB RAM"
echo "   • llama3.2:3b - Best balance, uses ~3GB RAM"
echo "   • qwen2.5:7b  - Best quality, uses ~6GB RAM"
echo ""
echo "🚀 Test Ollama:"
echo "   ollama run llama3.2:3b \"Hello, how are you?\""
echo ""
echo "🛑 Stop Ollama:"
echo "   kill $OLLAMA_PID"
echo ""
