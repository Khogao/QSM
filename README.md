# 🚀 QSM - QueryMaster

**Q**uery**S**ystem**M**aster - Intelligent Document Query System with Advanced RAG Capabilities

Powered by Electron + React + IBM Docling + HuggingFace Transformers

## ✨ Core Features

- 📄 **Advanced Document Processing** - PDF, DOCX, Images with IBM Docling integration
- 🎯 **Smart Table Extraction** - TableFormer for perfect table structure recognition
- � **RAG-Powered Search** - Vector embeddings with semantic search (384D MiniLM)
- 📁 **Universal Folder Structure** - Industry-agnostic organization system
- 🌐 **Vietnamese OCR Support** - EasyOCR, Tesseract, RapidOCR integration
- � **Local-First** - All data stored securely in SQLite
- � **Optional Encryption** - AES-256 for sensitive documents
- ⚙️ **Configurable Storage** - Custom paths for models, data, backups

## 🎯 Advanced Capabilities

- 🤖 **Document Intelligence** - Layout analysis, code/formula recognition
- � **Production-Ready** - Enterprise-grade quality from IBM Research
- 🔧 **Drag-to-Resize UI** - Flexible sidebar with persistent width
- 📈 **Quality Metrics** - Confidence scores and validation

---

## 🛠️ Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build portable executable
npm run build:portable
```

### Project Structure

```
archi-query-electron/
├── electron/
│   ├── main.ts              # Main process
│   ├── preload.ts           # IPC bridge
│   └── services/
│       ├── localStorage.ts  # SQLite storage
│       └── fileImport.ts    # File import logic
├── src/
│   ├── App.tsx              # React app
│   ├── components/
│   │   ├── DocumentManagement.tsx
│   │   └── DocumentList.tsx
│   └── types/
│       └── electron.d.ts    # TypeScript definitions
├── public/
│   └── index.html
├── package.json
├── vite.config.ts           # Vite + Electron config
└── README.md
```

---

## 📊 Data Storage

### Free Version

All data is stored locally in:

**Windows:**
```
C:\Users\<username>\AppData\Local\archi-query-electron\
├── data\
│   └── archi-query.db       # SQLite database
└── documents\
    ├── imported\            # Copied files
    └── organized\           # Organized files
```

**macOS (Future):**
```
~/Library/Application Support/archi-query-electron/
```

**Linux (Future):**
```
~/.local/share/archi-query-electron/
```

---

## 🧪 Testing

### Manual Test

1. Run app: `npm run dev`
2. Click "📄 Import Files"
3. Select 5-10 PDF files
4. Verify:
   - ✅ Files imported successfully
   - ✅ Document list populated
   - ✅ File count correct
5. Click "💾 Export Database"
6. Verify JSON file created

### Database Verification

Check SQLite database:

```bash
# Windows
cd %LOCALAPPDATA%\archi-query-electron\data
dir archi-query.db

# Open with SQLite browser (optional)
```

---

## 🚀 Building

### Portable Executable

```bash
npm run build:portable
```

Output: `release/ArchiQuery-Free-Portable-1.0.0.exe`

### Installer (Future)

```bash
npm run build
```

---

## 🐛 Troubleshooting

### Issue: "Cannot find module"

```bash
npm install
npm rebuild better-sqlite3
```

### Issue: Window doesn't open

Check console for errors:
- Open DevTools: Ctrl+Shift+I
- Check main process logs in terminal

### Issue: Import fails

- Check file permissions
- Try smaller files first
- Check console for specific error

### Issue: Database locked

- Close all app instances
- Delete `%LOCALAPPDATA%\archi-query-electron\data\` to reset

---

## 📝 License

MIT

## 👨‍💻 Author

Khogao

---

## 🎯 Roadmap

### Phase 1: ✅ Foundation (CURRENT)
- [x] Electron boilerplate
- [x] Local storage (SQLite)
- [x] File import (manual)
- [x] Document list UI
- [x] Export/backup

### Phase 2: 🔄 RAG Engine (Next)
- [ ] Integrate LM Studio
- [ ] Embedding generation
- [ ] Vector storage
- [ ] Query interface
- [ ] Search results UI

### Phase 3: 📅 Organization
- [ ] Auto-classification
- [ ] Batch operations
- [ ] Folder structure
- [ ] Undo/redo

### Phase 4: 💎 Pro Version
- [ ] Network drive support
- [ ] Auto-watch folders
- [ ] Multi-PC sync
- [ ] Team collaboration

---

**Status:** ✅ Prototype Ready!

**Next:** Test import → Integrate RAG → Ship it! 🚀
