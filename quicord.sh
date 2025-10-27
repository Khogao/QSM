#!/bin/bash
# Quicord OCR Launcher for Mac OS / Linux
# Vietnamese Document Intelligence

echo "======================================================================"
echo "📄 Quicord v3.0 - Quick OCR Documents"
echo "======================================================================"

# Detect OS
OS="$(uname -s)"
case "$OS" in
    Darwin*)    PLATFORM="Mac OS";;
    Linux*)     PLATFORM="Linux";;
    *)          PLATFORM="Unknown";;
esac

echo "🖥️  Platform: $PLATFORM"
echo ""

# Check if Python 3.11+ is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 not found!"
    echo "   Please install Python 3.11 or higher:"
    echo "   - Mac: brew install python@3.11"
    echo "   - Linux: sudo apt install python3.11"
    exit 1
fi

# Check Python version
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
echo "🐍 Python version: $PYTHON_VERSION"

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$SCRIPT_DIR/python/venv"

# Check if venv exists
if [ ! -d "$VENV_DIR" ]; then
    echo ""
    echo "⚠️  Virtual environment not found!"
    echo "📦 Creating virtual environment..."
    python3 -m venv "$VENV_DIR"
    
    if [ $? -eq 0 ]; then
        echo "✅ Virtual environment created"
    else
        echo "❌ Failed to create virtual environment"
        exit 1
    fi
    
    echo ""
    echo "📦 Installing dependencies..."
    source "$VENV_DIR/bin/activate"
    pip install --upgrade pip
    pip install -r "$SCRIPT_DIR/python/requirements.txt"
    
    if [ $? -eq 0 ]; then
        echo "✅ Dependencies installed"
    else
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi

# Activate venv
echo "🔧 Activating virtual environment..."
source "$VENV_DIR/bin/activate"

# Set UTF-8 encoding
export PYTHONIOENCODING=utf-8
export LC_ALL=en_US.UTF-8
export LANG=en_US.UTF-8

# Run OCR script
echo "🚀 Launching Quicord..."
echo ""
python3 "$SCRIPT_DIR/ocr_complete.py"

# Deactivate venv
deactivate

echo ""
echo "✅ Quicord finished"
echo "======================================================================"
