#!/bin/bash
# QSM Linux Build Script for Lenovo X220

set -e  # Exit on error

echo "🚀 QSM Linux Build Script"
echo "=========================="
echo ""
echo "📍 Working directory: $(pwd)"
echo "💻 System: $(lsb_release -d | cut -f2)"
echo "🖥️  RAM: $(free -h | awk '/^Mem:/ {print $2}')"
echo ""

# Ensure we're in QSM directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found!"
    echo "   Please run this script from /home/phi/QSM directory"
    exit 1
fi

echo "✅ Found package.json"
echo ""

# Step 1: TypeScript compilation
echo "📝 Step 1/3: Compiling TypeScript..."
npm run tsc || npx tsc
echo "✅ TypeScript compilation complete"
echo ""

# Step 2: Vite build
echo "🏗️  Step 2/3: Building Vite frontend..."
npm run vite build || npx vite build
echo "✅ Vite build complete"
echo ""

# Step 3: Electron Builder
echo "📦 Step 3/3: Building Linux AppImage..."
npx electron-builder --linux AppImage

echo ""
echo "🎉 Build complete!"
echo ""
echo "📂 Output location:"
ls -lh release/*.AppImage 2>/dev/null || echo "   Check ./release/ directory"
echo ""
echo "🚀 To run: ./release/QSM-QueryMaster-1.0.0.AppImage"
echo ""
