# QSM Quick Build Instructions

## ⚠️ IMPORTANT: Always run from /home/phi/QSM directory!

```bash
# Navigate to QSM directory FIRST
cd /home/phi/QSM

# Verify you're in the right place
pwd
# Should output: /home/phi/QSM
```

---

## Build Commands

### Full Build (All Steps)

```bash
cd /home/phi/QSM

# Clean previous builds
rm -rf dist dist-electron release

# Install dependencies (first time only)
npm install

# Build TypeScript
npx tsc

# Build Vite frontend
npx vite build

# Build AppImage (skip native rebuild to avoid errors)
npx electron-builder --linux AppImage --config.npmRebuild=false

# Check output
ls -lh release/*.AppImage
```

### Quick Rebuild (After code changes)

```bash
cd /home/phi/QSM

# Only rebuild changed parts
npx vite build
npx electron-builder --linux AppImage --dir

# Test run
./release/linux-unpacked/qsm
```

---

## Known Issues & Solutions

### Issue: sqlite3 native module rebuild fails

**Solution**: Skip native rebuild
```bash
npx electron-builder --linux AppImage --config.npmRebuild=false
```

### Issue: Wrong directory error

**Solution**: Always `cd /home/phi/QSM` first!

### Issue: Build very slow on X220

**Solution**: Use faster build options
```bash
# Skip compression for faster builds during development
npx electron-builder --linux dir

# This creates: release/linux-unpacked/qsm (not compressed)
# Run directly: ./release/linux-unpacked/qsm
```

---

## Alternative: Use pre-built from local node_modules

If AppImage build keeps failing, run directly from node_modules:

```bash
cd /home/phi/QSM

# Build frontend only
npx vite build

# Run with local Electron
npx electron .
```

This runs QSM without packaging it into AppImage.

---

## Estimated Build Times on X220

- TypeScript compile: ~30 seconds
- Vite build: ~2 minutes
- Electron Builder (AppImage): ~3-5 minutes
- **Total**: ~6-8 minutes

---

## Next Steps After Build

1. **Run AppImage**:
   ```bash
   cd /home/phi/QSM/release
   chmod +x QSM-QueryMaster-1.0.0.AppImage
   ./QSM-QueryMaster-1.0.0.AppImage
   ```

2. **Install Ollama** (for local LLM):
   ```bash
   cd /home/phi/QSM
   chmod +x install-ollama.sh
   ./install-ollama.sh
   ```

3. **Configure QSM**:
   - Open QSM
   - Settings → Provider: Ollama
   - Model: llama3.2:3b
   - Save

4. **Test**:
   - Upload a document
   - Type a question
   - Get answer with citations!

---

## Directory Structure After Build

```
/home/phi/QSM/
├── dist/                          # Vite output (frontend)
│   ├── index.html
│   └── assets/
├── dist-electron/                 # Electron output (main/preload)
│   ├── main.js
│   └── preload.js
└── release/                       # Final build output
    ├── QSM-QueryMaster-1.0.0.AppImage  (~150-200MB)
    ├── builder-effective-config.yaml
    └── linux-unpacked/            # Uncompressed version
        └── qsm                    # Executable
```

---

## Cleanup After Build

```bash
cd /home/phi/QSM

# Remove build artifacts (keep AppImage)
rm -rf dist dist-electron release/linux-unpacked release/*.yaml

# Or clean everything and rebuild
rm -rf dist dist-electron release node_modules
npm install
# ... rebuild ...
```

---

**Pro Tip**: Bookmark this file for quick reference!

Save to: `/home/phi/QSM/BUILD_QUICK_REFERENCE.md`
