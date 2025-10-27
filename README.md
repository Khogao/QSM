# 🚀 QSM - QuerySystemMaster# ðŸš€ QSM - QueryMaster



> **Intelligent Document Query System with Advanced RAG Capabilities**  **Q**uery**S**ystem**M**aster - Intelligent Document Query System with Advanced RAG Capabilities

> Powered by Electron + React + IBM Docling + HuggingFace Transformers

Powered by Electron + React + IBM Docling + HuggingFace Transformers

---

## âœ¨ Core Features

## 🔗 **RELATED PROJECTS:**

- ðŸ“„ **Advanced Document Processing** - PDF, DOCX, Images with IBM Docling integration

- **[Quicord](https://github.com/Khogao/Quicord)** - Vietnamese OCR specialist (spin-off from QSM)- ðŸŽ¯ **Smart Table Extraction** - TableFormer for perfect table structure recognition

- Specialized in Vietnamese document OCR with 80+ Vietnamese keywords- ï¿½ **RAG-Powered Search** - Vector embeddings with semantic search (384D MiniLM)

- ðŸ“ **Universal Folder Structure** - Industry-agnostic organization system

---- ðŸŒ **Vietnamese OCR Support** - EasyOCR, Tesseract, RapidOCR integration

- ï¿½ **Local-First** - All data stored securely in SQLite

## ✨ **CORE FEATURES:**- ï¿½ **Optional Encryption** - AES-256 for sensitive documents

- âš™ï¸ **Configurable Storage** - Custom paths for models, data, backups

### **📄 Advanced Document Processing**

- IBM Docling integration (16 figure types)## ðŸŽ¯ Advanced Capabilities

- Formats: PDF, DOCX, Images

- TableFormer for table extraction- ðŸ¤– **Document Intelligence** - Layout analysis, code/formula recognition

- ï¿½ **Production-Ready** - Enterprise-grade quality from IBM Research

### **🎯 Smart RAG Search**- ðŸ”§ **Drag-to-Resize UI** - Flexible sidebar with persistent width

- Vector embeddings (384D MiniLM)- ðŸ“ˆ **Quality Metrics** - Confidence scores and validation

- Semantic search capabilities

- Local-first architecture---



### **📁 Universal Organization**## ðŸ› ï¸ Development

- Industry-agnostic folder structure

- Auto-classification (future)### Prerequisites

- Batch operations (future)

- Node.js 18+ 

### **🔒 Security & Privacy**- npm or yarn

- All data stored locally (SQLite)

- Optional AES-256 encryption### Setup

- No cloud dependency

```bash

### **⚙️ Configurable**# Install dependencies

- Custom storage pathsnpm install

- Configurable models

- Flexible UI (drag-to-resize)# Run in development mode

npm run dev

---

# Build portable executable

## 🛠️ **DEVELOPMENT:**npm run build:portable

```

### **Prerequisites:**

```bash### Project Structure

Node.js 18+

npm or yarn```

```archi-query-electron/

â”œâ”€â”€ electron/

### **Setup:**â”‚   â”œâ”€â”€ main.ts              # Main process

```bashâ”‚   â”œâ”€â”€ preload.ts           # IPC bridge

# Clone repoâ”‚   â””â”€â”€ services/

git clone https://github.com/Khogao/QSM.gitâ”‚       â”œâ”€â”€ localStorage.ts  # SQLite storage

cd QSMâ”‚       â””â”€â”€ fileImport.ts    # File import logic

â”œâ”€â”€ src/

# Install dependenciesâ”‚   â”œâ”€â”€ App.tsx              # React app

npm installâ”‚   â”œâ”€â”€ components/

â”‚   â”‚   â”œâ”€â”€ DocumentManagement.tsx

# Run in development modeâ”‚   â”‚   â””â”€â”€ DocumentList.tsx

npm run devâ”‚   â””â”€â”€ types/

â”‚       â””â”€â”€ electron.d.ts    # TypeScript definitions

# Build portable executableâ”œâ”€â”€ public/

npm run build:portableâ”‚   â””â”€â”€ index.html

```â”œâ”€â”€ package.json

â”œâ”€â”€ vite.config.ts           # Vite + Electron config

### **Project Structure:**â””â”€â”€ README.md

``````

QSM/

├── electron/---

│   ├── main.ts              # Main process

│   ├── preload.ts           # IPC bridge## ðŸ“Š Data Storage

│   └── services/

│       ├── localStorage.ts  # SQLite storage### Free Version

│       └── fileImport.ts    # File import logic

├── src/All data is stored locally in:

│   ├── App.tsx              # React app

│   ├── components/**Windows:**

│   │   ├── DocumentManagement.tsx```

│   │   └── DocumentList.tsxC:\Users\<username>\AppData\Local\archi-query-electron\

│   └── types/â”œâ”€â”€ data\

│       └── electron.d.ts    # TypeScript definitionsâ”‚   â””â”€â”€ archi-query.db       # SQLite database

├── public/â””â”€â”€ documents\

│   └── index.html    â”œâ”€â”€ imported\            # Copied files

├── package.json    â””â”€â”€ organized\           # Organized files

├── vite.config.ts           # Vite + Electron config```

└── README.md

```**macOS (Future):**

```

---~/Library/Application Support/archi-query-electron/

```

## 📊 **DATA STORAGE:**

**Linux (Future):**

### **Windows:**```

```~/.local/share/archi-query-electron/

C:\Users\<username>\AppData\Local\archi-query-electron\```

├── data\

│   └── archi-query.db       # SQLite database---

└── documents\

    ├── imported\            # Copied files## ðŸ§ª Testing

    └── organized\           # Organized files

```### Manual Test



### **macOS:**1. Run app: `npm run dev`

```2. Click "ðŸ“„ Import Files"

~/Library/Application Support/archi-query-electron/3. Select 5-10 PDF files

```4. Verify:

   - âœ… Files imported successfully

### **Linux:**   - âœ… Document list populated

```   - âœ… File count correct

~/.local/share/archi-query-electron/5. Click "ðŸ’¾ Export Database"

```6. Verify JSON file created



---### Database Verification



## 🧪 **TESTING:**Check SQLite database:



### **Manual Test:**```bash

1. Run: `npm run dev`# Windows

2. Click "📄 Import Files"cd %LOCALAPPDATA%\archi-query-electron\data

3. Select 5-10 PDF filesdir archi-query.db

4. Verify import & document list

5. Test export: "💾 Export Database"# Open with SQLite browser (optional)

```

### **Database Verification:**

```bash---

# Windows

cd %LOCALAPPDATA%\archi-query-electron\data## ðŸš€ Building

dir archi-query.db

```### Portable Executable



---```bash

npm run build:portable

## 🚀 **BUILDING:**```



### **Portable Executable:**Output: `release/ArchiQuery-Free-Portable-1.0.0.exe`

```bash

npm run build:portable### Installer (Future)

# Output: release/ArchiQuery-Free-Portable-1.0.0.exe

``````bash

npm run build

### **Installer (Future):**```

```bash

npm run build---

```

## ðŸ› Troubleshooting

---

### Issue: "Cannot find module"

## 🛠️ **TROUBLESHOOTING:**

```bash

### **"Cannot find module":**npm install

```bashnpm rebuild better-sqlite3

npm install```

npm rebuild better-sqlite3

```### Issue: Window doesn't open



### **Window doesn't open:**Check console for errors:

- Open DevTools: Ctrl+Shift+I- Open DevTools: Ctrl+Shift+I

- Check main process logs in terminal- Check main process logs in terminal



### **Import fails:**### Issue: Import fails

- Check file permissions

- Try smaller files first- Check file permissions

- Check console for errors- Try smaller files first

- Check console for specific error

### **Database locked:**

- Close all app instances### Issue: Database locked

- Delete `%LOCALAPPDATA%\archi-query-electron\data\` to reset

- Close all app instances

---- Delete `%LOCALAPPDATA%\archi-query-electron\data\` to reset



## 🎯 **ROADMAP:**---



### **Phase 1: ✅ Foundation (CURRENT)**## ðŸ“ License

- [x] Electron boilerplate

- [x] Local storage (SQLite)MIT

- [x] File import (manual)

- [x] Document list UI## ðŸ‘¨â€ðŸ’» Author

- [x] Export/backup

Khogao

### **Phase 2: 🔄 RAG Engine (Next)**

- [ ] Integrate LM Studio---

- [ ] Embedding generation

- [ ] Vector storage## ðŸŽ¯ Roadmap

- [ ] Query interface

- [ ] Search results UI### Phase 1: âœ… Foundation (CURRENT)

- [x] Electron boilerplate

### **Phase 3: 📅 Organization**- [x] Local storage (SQLite)

- [ ] Auto-classification- [x] File import (manual)

- [ ] Batch operations- [x] Document list UI

- [ ] Folder structure- [x] Export/backup

- [ ] Undo/redo

### Phase 2: ðŸ”„ RAG Engine (Next)

### **Phase 4: 💎 Pro Version**- [ ] Integrate LM Studio

- [ ] Network drive support- [ ] Embedding generation

- [ ] Auto-watch folders- [ ] Vector storage

- [ ] Multi-PC sync- [ ] Query interface

- [ ] Team collaboration- [ ] Search results UI



---### Phase 3: ðŸ“… Organization

- [ ] Auto-classification

## 🌐 **MULTI-MACHINE SYNC:**- [ ] Batch operations

- [ ] Folder structure

This repository is part of the **Khogao Coding Workspace** synchronized across 3 machines.- [ ] Undo/redo



### **Quick Sync:**### Phase 4: ðŸ’Ž Pro Version

- [ ] Network drive support

**Windows:**- [ ] Auto-watch folders

```powershell- [ ] Multi-PC sync

cd D:\Work\Coding- [ ] Team collaboration

git clone https://github.com/Khogao/QSM.git

code QSM---

```

**Status:** âœ… Prototype Ready!

**macOS / Linux:**

```bash**Next:** Test import â†’ Integrate RAG â†’ Ship it! ðŸš€

cd ~/Work/Coding

git clone https://github.com/Khogao/QSM.git

code QSM---

```

## Multi-Machine Sync Setup

### **Daily Workflow:**

1. Morning: Pull latest changesThis repository is part of the **Khogao Coding Workspace** synchronized across 3 machines (Windows, macOS, Linux Mint).

2. Work: Edit, commit, push

3. Evening: Verify all pushed### Quick Sync Instructions



---#### Windows (PowerShell)

```powershell

## 📝 **LICENSE:**cd D:\Work\Coding

git clone https://github.com/Khogao/QSM.git

MIT Licensecode QSM

```

---

#### macOS / Linux

## 👨‍💻 **AUTHOR:**```bash

cd ~/Work/Coding

[@Khogao](https://github.com/Khogao)git clone https://github.com/Khogao/QSM.git

code QSM

---```



## 📞 **CONTACT:**### Daily Workflow

1. Morning: Pull latest changes

- GitHub: https://github.com/Khogao/QSM2. Work: Edit, commit, push

- Issues: https://github.com/Khogao/QSM/issues3. Evening: Verify all pushed



---See [CLOUD_WORKSPACE_SETUP.md](../workspace-config/CLOUD_WORKSPACE_SETUP.md) and [SUPREME_YOLO_GUIDELINES.md](../workspace-config/.vscode/SUPREME_YOLO_GUIDELINES.md) for details.



**Status:** ✅ Prototype Ready!  ---
**Next:** Test import → Integrate RAG → Ship it! 🚀
