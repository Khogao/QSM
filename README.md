# ðŸš€ QSM - QueryMaster

**Q**uery**S**ystem**M**aster - Intelligent Document Query System with Advanced RAG Capabilities

Powered by Electron + React + IBM Docling + HuggingFace Transformers

## âœ¨ Core Features

- ðŸ“„ **Advanced Document Processing** - PDF, DOCX, Images with IBM Docling integration
- ðŸŽ¯ **Smart Table Extraction** - TableFormer for perfect table structure recognition
- ï¿½ **RAG-Powered Search** - Vector embeddings with semantic search (384D MiniLM)
- ðŸ“ **Universal Folder Structure** - Industry-agnostic organization system
- ðŸŒ **Vietnamese OCR Support** - EasyOCR, Tesseract, RapidOCR integration
- ï¿½ **Local-First** - All data stored securely in SQLite
- ï¿½ **Optional Encryption** - AES-256 for sensitive documents
- âš™ï¸ **Configurable Storage** - Custom paths for models, data, backups

## ðŸŽ¯ Advanced Capabilities

- ðŸ¤– **Document Intelligence** - Layout analysis, code/formula recognition
- ï¿½ **Production-Ready** - Enterprise-grade quality from IBM Research
- ðŸ”§ **Drag-to-Resize UI** - Flexible sidebar with persistent width
- ðŸ“ˆ **Quality Metrics** - Confidence scores and validation

---

## ðŸ› ï¸ Development

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
â”œâ”€â”€ electron/
â”‚   â”œâ”€â”€ main.ts              # Main process
â”‚   â”œâ”€â”€ preload.ts           # IPC bridge
â”‚   â””â”€â”€ services/
â”‚       â”œâ”€â”€ localStorage.ts  # SQLite storage
â”‚       â””â”€â”€ fileImport.ts    # File import logic
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ App.tsx              # React app
â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”œâ”€â”€ DocumentManagement.tsx
â”‚   â”‚   â””â”€â”€ DocumentList.tsx
â”‚   â””â”€â”€ types/
â”‚       â””â”€â”€ electron.d.ts    # TypeScript definitions
â”œâ”€â”€ public/
â”‚   â””â”€â”€ index.html
â”œâ”€â”€ package.json
â”œâ”€â”€ vite.config.ts           # Vite + Electron config
â””â”€â”€ README.md
```

---

## ðŸ“Š Data Storage

### Free Version

All data is stored locally in:

**Windows:**
```
C:\Users\<username>\AppData\Local\archi-query-electron\
â”œâ”€â”€ data\
â”‚   â””â”€â”€ archi-query.db       # SQLite database
â””â”€â”€ documents\
    â”œâ”€â”€ imported\            # Copied files
    â””â”€â”€ organized\           # Organized files
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

## ðŸ§ª Testing

### Manual Test

1. Run app: `npm run dev`
2. Click "ðŸ“„ Import Files"
3. Select 5-10 PDF files
4. Verify:
   - âœ… Files imported successfully
   - âœ… Document list populated
   - âœ… File count correct
5. Click "ðŸ’¾ Export Database"
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

## ðŸš€ Building

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

## ðŸ› Troubleshooting

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

## ðŸ“ License

MIT

## ðŸ‘¨â€ðŸ’» Author

Khogao

---

## ðŸŽ¯ Roadmap

### Phase 1: âœ… Foundation (CURRENT)
- [x] Electron boilerplate
- [x] Local storage (SQLite)
- [x] File import (manual)
- [x] Document list UI
- [x] Export/backup

### Phase 2: ðŸ”„ RAG Engine (Next)
- [ ] Integrate LM Studio
- [ ] Embedding generation
- [ ] Vector storage
- [ ] Query interface
- [ ] Search results UI

### Phase 3: ðŸ“… Organization
- [ ] Auto-classification
- [ ] Batch operations
- [ ] Folder structure
- [ ] Undo/redo

### Phase 4: ðŸ’Ž Pro Version
- [ ] Network drive support
- [ ] Auto-watch folders
- [ ] Multi-PC sync
- [ ] Team collaboration

---

**Status:** âœ… Prototype Ready!

**Next:** Test import â†’ Integrate RAG â†’ Ship it! ðŸš€


---

## Multi-Machine Sync Setup

This repository is part of the **Khogao Coding Workspace** synchronized across 3 machines (Windows, macOS, Linux Mint).

### Quick Sync Instructions

#### Windows (PowerShell)
```powershell
cd D:\Work\Coding
git clone https://github.com/Khogao/QSM.git
code QSM
```

#### macOS / Linux
```bash
cd ~/Work/Coding
git clone https://github.com/Khogao/QSM.git
code QSM
```

### Daily Workflow
1. Morning: Pull latest changes
2. Work: Edit, commit, push
3. Evening: Verify all pushed

See [CLOUD_WORKSPACE_SETUP.md](../workspace-config/CLOUD_WORKSPACE_SETUP.md) and [SUPREME_YOLO_GUIDELINES.md](../workspace-config/.vscode/SUPREME_YOLO_GUIDELINES.md) for details.

---