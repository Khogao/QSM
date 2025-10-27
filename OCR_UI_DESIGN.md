# 🎨 QSM OCR PRO - UI/UX DESIGN

## 📊 SO SÁNH: QSM (RAG) vs OCR APP

### QSM QueryMaster (Hiện tại - PHỨC TẠP):
```
┌─────────────────────────────────────────────────────────────┐
│ Header: QueryMaster + Settings                             │
├─────────────┬───────────────────────────────────────────────┤
│             │ [Documents] [Organization] ← Tabs             │
│ SIDEBAR     ├───────────────────────────────────────────────┤
│ - Folders   │                                               │
│ - Models    │  Document Management:                         │
│ - Embedding │  - Upload files                               │
│ - OCR Cfg   │  - Folder structure                           │
│             │  - Vector embeddings                          │
│             │  - Query interface                            │
│             │  - Advanced settings                          │
└─────────────┴───────────────────────────────────────────────┘

Features:
❌ Too many options (folders, embeddings, queries)
❌ Complex sidebar (models, OCR, organization)
❌ Multiple tabs and panels
❌ Heavy focus on AI/RAG features
```

### QSM OCR Pro (Mới - ĐƠN GIẢN):
```
┌─────────────────────────────────────────────────────────────┐
│ QSM OCR Pro          [Settings ⚙️] [License 🔑] [Help ❓]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│              🖼️ Drag & Drop Images Here                     │
│                   or click to browse                        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📄 image-page-001.jpg          [Remove ✕]          │   │
│  │  📄 image-page-002.jpg          [Remove ✕]          │   │
│  │  📄 scan-page-003.png           [Remove ✕]          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Export Format:                                             │
│  ◉ Word (.docx)  ○ Markdown  ○ PDF Image  ○ PDF Text       │
│  ○ EPUB ebook                                               │
│                                                             │
│  ☑ Auto-sort by page number                                │
│  ☑ Merge into single document                              │
│                                                             │
│  [Process OCR] ──────────────────────────────── 🚀          │
│                                                             │
│  ████████████████░░░░░░░░ 65%  Processing...                │
│  File: image-page-003.png (3/5)                             │
└─────────────────────────────────────────────────────────────┘

Features:
✅ Single purpose: OCR images → documents
✅ Drag & drop interface
✅ Simple export options
✅ Progress indicator
✅ No complex sidebar
```

---

## 🎯 THIẾT KẾ CHI TIẾT

### 1. Main Screen (Idle State):

```tsx
┌───────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────┐   │
│ │  QSM OCR Pro v1.0                                       │   │
│ │  ────────────────                                       │   │
│ │  [⚙️ Settings] [🔑 License] [❓ Help] [📊 History]      │   │
│ └─────────────────────────────────────────────────────────┘   │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│    ╔═══════════════════════════════════════════════════╗     │
│    ║                                                   ║     │
│    ║        🖼️                                         ║     │
│    ║     Drop Images Here                              ║     │
│    ║                                                   ║     │
│    ║   Support: JPG, PNG, BMP, TIFF                    ║     │
│    ║   Multiple files OK                               ║     │
│    ║                                                   ║     │
│    ║   [📁 Browse Files] [📂 Browse Folder]            ║     │
│    ║                                                   ║     │
│    ╚═══════════════════════════════════════════════════╝     │
│                                                               │
│    Quick Actions:                                             │
│    ┌────────────┐ ┌────────────┐ ┌────────────┐             │
│    │ 📸 Recent  │ │ 📋 Samples │ │ 🔄 Batch   │             │
│    │ Files      │ │ Test       │ │ Process    │             │
│    └────────────┘ └────────────┘ └────────────┘             │
│                                                               │
│    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                               │
│    💡 Tips:                                                   │
│    • Drag multiple images at once for batch processing       │
│    • Images will be auto-sorted by page numbers              │
│    • Supported languages: Vietnamese + English               │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

### 2. Processing Screen:

```tsx
┌───────────────────────────────────────────────────────────────┐
│ QSM OCR Pro v1.0                    [⚙️] [🔑] [❓] [📊]       │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  📄 Files Ready (5 images)                  [+ Add More]      │
│  ┌─────────────────────────────────────────────────────┐     │
│  │ ✓ image-page-001.jpg    1.2 MB         [Preview] [✕]│     │
│  │ ✓ image-page-002.jpg    1.5 MB         [Preview] [✕]│     │
│  │ ⏳ image-page-003.jpg   1.8 MB         [Preview] [✕]│     │
│  │ ⏸️ scan-page-004.png    2.1 MB         [Preview] [✕]│     │
│  │ ⏸️ scan-page-005.png    1.9 MB         [Preview] [✕]│     │
│  └─────────────────────────────────────────────────────┘     │
│                                                               │
│  🎯 Export Settings                                           │
│  ┌─────────────────────────────────────────────────────┐     │
│  │ Format:                                             │     │
│  │ ● Word (.docx)  ○ Markdown  ○ PDF-Image  ○ PDF-Text│     │
│  │ ○ EPUB ebook                                        │     │
│  │                                                     │     │
│  │ Options:                                            │     │
│  │ ☑ Auto-sort by page number                         │     │
│  │ ☑ Merge into single document                       │     │
│  │ ☑ Include original images (for PDF/EPUB)           │     │
│  │                                                     │     │
│  │ Output Name: [my_document_ocr        ] [📁 Browse] │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │ 📊 Processing Progress                              │     │
│  │                                                     │     │
│  │ ████████████████████░░░░░░ 65%                      │     │
│  │                                                     │     │
│  │ Current: image-page-003.jpg (3/5)                   │     │
│  │ Status: Extracting text... 🔍                       │     │
│  │ Elapsed: 00:01:23 | Remaining: ~00:00:45            │     │
│  │                                                     │     │
│  │ [⏸️ Pause] [⏹️ Stop]                                │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                               │
│  [🚀 Start Processing]                                        │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

### 3. Results Screen:

```tsx
┌───────────────────────────────────────────────────────────────┐
│ QSM OCR Pro v1.0                    [⚙️] [🔑] [❓] [📊]       │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ✅ OCR Complete!                                             │
│  ┌─────────────────────────────────────────────────────┐     │
│  │ 🎉 Successfully processed 5 images                  │     │
│  │                                                     │     │
│  │ Total time: 2 minutes 15 seconds                    │     │
│  │ Words extracted: 1,247                              │     │
│  │ Accuracy: 98.5%                                     │     │
│  │                                                     │     │
│  │ Output file:                                        │     │
│  │ 📄 my_document_ocr.docx (485 KB)                    │     │
│  │                                                     │     │
│  │ [📂 Open File] [📁 Open Folder] [👁️ Preview]        │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                               │
│  📋 Details                                                   │
│  ┌─────────────────────────────────────────────────────┐     │
│  │ ✓ image-page-001.jpg → 245 words (5 sec)           │     │
│  │ ✓ image-page-002.jpg → 312 words (6 sec)           │     │
│  │ ✓ image-page-003.jpg → 189 words (4 sec)           │     │
│  │ ✓ scan-page-004.png → 278 words (7 sec)            │     │
│  │ ✓ scan-page-005.png → 223 words (5 sec)            │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                               │
│  [🔄 Process More] [💾 Save Settings] [🏠 Home]               │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

### 4. Settings Dialog:

```tsx
┌───────────────────────────────────────────────────────────────┐
│ ⚙️ Settings                                          [✕ Close]│
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  🌐 Language                                                  │
│  ┌─────────────────────────────────────────────────────┐     │
│  │ OCR Languages:                                      │     │
│  │ ☑ Vietnamese (Tiếng Việt)                          │     │
│  │ ☑ English                                           │     │
│  │ ☐ Chinese (简体中文)                                │     │
│  │ ☐ Japanese (日本語)                                 │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                               │
│  🎨 Output Preferences                                        │
│  ┌─────────────────────────────────────────────────────┐     │
│  │ Default Format: [Word (.docx) ▼]                   │     │
│  │                                                     │     │
│  │ ☑ Auto-sort by page number (default ON)            │     │
│  │ ☑ Merge into single document (default ON)          │     │
│  │ ☐ Include OCR metadata in output                   │     │
│  │                                                     │     │
│  │ Output Folder:                                      │     │
│  │ [C:\Users\...\Documents\OCR Results] [📁 Change]   │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                               │
│  ⚡ Performance                                                │
│  ┌─────────────────────────────────────────────────────┐     │
│  │ Processing Mode:                                    │     │
│  │ ● Balanced (Recommended)                            │     │
│  │ ○ Fast (Lower quality)                              │     │
│  │ ○ High Quality (Slower)                             │     │
│  │                                                     │     │
│  │ ☑ Use GPU acceleration (if available)              │     │
│  │ ☐ Download AI models on startup                    │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                               │
│  [💾 Save Settings] [🔄 Reset to Defaults]                    │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## 📁 CẤU TRÚC COMPONENT MỚI

### Simplified Architecture:

```
src/
├── App.tsx                    ← Main OCR app (simple!)
├── main.tsx
├── index.css
│
├── components/
│   ├── ocr/                   ← NEW: OCR-specific components
│   │   ├── DropZone.tsx       ← Drag & drop area
│   │   ├── FileList.tsx       ← List of selected images
│   │   ├── ExportSettings.tsx ← Format options
│   │   ├── ProcessingView.tsx ← Progress bar & status
│   │   ├── ResultsView.tsx    ← Success screen
│   │   └── PreviewDialog.tsx  ← Image preview
│   │
│   ├── layout/                ← Layout components
│   │   ├── Header.tsx         ← Simple header
│   │   └── Footer.tsx         ← Optional footer
│   │
│   ├── dialogs/               ← Settings & modals
│   │   ├── SettingsDialog.tsx
│   │   ├── LicenseDialog.tsx
│   │   └── HelpDialog.tsx
│   │
│   └── ui/                    ← Reuse existing
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── progress.tsx
│       └── ...
│
├── hooks/
│   ├── useOCR.ts              ← Main OCR logic
│   ├── useFileHandler.ts      ← File selection & drag-drop
│   ├── useExportSettings.ts   ← Export preferences
│   └── useLicense.ts          ← License validation
│
├── services/
│   ├── ocrService.ts          ← Docling + EasyOCR wrapper
│   ├── exportService.ts       ← Word/PDF/EPUB export
│   └── licenseService.ts      ← License key validation
│
└── types/
    ├── ocr.ts                 ← OCR-related types
    └── export.ts              ← Export format types
```

---

## 🎨 REACT COMPONENTS CODE

### 1. New App.tsx (OCR Version):

```tsx
import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { DropZone } from '@/components/ocr/DropZone';
import { FileList } from '@/components/ocr/FileList';
import { ExportSettings } from '@/components/ocr/ExportSettings';
import { ProcessingView } from '@/components/ocr/ProcessingView';
import { ResultsView } from '@/components/ocr/ResultsView';
import { useFileHandler } from '@/hooks/useFileHandler';
import { useOCR } from '@/hooks/useOCR';
import { useExportSettings } from '@/hooks/useExportSettings';

type ViewState = 'idle' | 'ready' | 'processing' | 'complete';

function App() {
  const [viewState, setViewState] = useState<ViewState>('idle');
  
  const { 
    files, 
    addFiles, 
    removeFile, 
    clearFiles 
  } = useFileHandler();
  
  const {
    isProcessing,
    progress,
    currentFile,
    results,
    processFiles,
    cancelProcessing
  } = useOCR();
  
  const {
    format,
    autoSort,
    mergeDocuments,
    outputName,
    updateSettings
  } = useExportSettings();

  const handleFilesSelected = (newFiles: File[]) => {
    addFiles(newFiles);
    setViewState('ready');
  };

  const handleStartProcessing = async () => {
    setViewState('processing');
    await processFiles(files, { format, autoSort, mergeDocuments, outputName });
    setViewState('complete');
  };

  const handleProcessMore = () => {
    clearFiles();
    setViewState('idle');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Idle State: Show drop zone */}
        {viewState === 'idle' && (
          <DropZone onFilesSelected={handleFilesSelected} />
        )}
        
        {/* Ready State: Files selected, show export settings */}
        {viewState === 'ready' && (
          <div className="space-y-6">
            <FileList 
              files={files} 
              onRemove={removeFile}
              onAddMore={handleFilesSelected}
            />
            
            <ExportSettings
              format={format}
              autoSort={autoSort}
              mergeDocuments={mergeDocuments}
              outputName={outputName}
              onUpdateSettings={updateSettings}
            />
            
            <button
              onClick={handleStartProcessing}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 
                       text-white py-4 rounded-lg font-semibold text-lg
                       hover:from-blue-700 hover:to-indigo-700 
                       transition-all shadow-lg hover:shadow-xl"
            >
              🚀 Start Processing
            </button>
          </div>
        )}
        
        {/* Processing State: Show progress */}
        {viewState === 'processing' && (
          <ProcessingView
            progress={progress}
            currentFile={currentFile}
            totalFiles={files.length}
            onCancel={cancelProcessing}
          />
        )}
        
        {/* Complete State: Show results */}
        {viewState === 'complete' && (
          <ResultsView
            results={results}
            outputPath={results.outputPath}
            onProcessMore={handleProcessMore}
          />
        )}
      </main>
    </div>
  );
}

export default App;
```

---

### 2. DropZone.tsx:

```tsx
import { useCallback } from 'react';
import { Upload, Image, FileText } from 'lucide-react';

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFilesSelected }) => {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    const imageFiles = droppedFiles.filter(f => 
      f.type.startsWith('image/')
    );
    onFilesSelected(imageFiles);
  }, [onFilesSelected]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-4 border-dashed border-blue-300 rounded-2xl 
                 bg-white/80 backdrop-blur p-16 text-center
                 hover:border-blue-500 hover:bg-blue-50/50
                 transition-all cursor-pointer group"
      >
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <Image className="h-24 w-24 text-blue-400 group-hover:text-blue-600 transition-colors" />
            <Upload className="h-12 w-12 text-blue-600 absolute -top-2 -right-2 
                             group-hover:animate-bounce" />
          </div>
          
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Drop Images Here
            </h2>
            <p className="text-gray-600 text-lg">
              or click to browse files
            </p>
          </div>

          <div className="flex gap-4">
            <label className="btn-primary">
              📁 Browse Files
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
            
            <label className="btn-secondary">
              📂 Browse Folder
              <input
                type="file"
                webkitdirectory="true"
                directory="true"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>

          <div className="text-sm text-gray-500 space-y-1">
            <p>✓ Supported: JPG, PNG, BMP, TIFF</p>
            <p>✓ Multiple files OK</p>
            <p>✓ Vietnamese + English text</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-3 gap-4">
        <button className="quick-action-card">
          <FileText className="h-8 w-8 text-blue-600" />
          <span className="font-semibold">Recent Files</span>
        </button>
        
        <button className="quick-action-card">
          <Image className="h-8 w-8 text-green-600" />
          <span className="font-semibold">Sample Test</span>
        </button>
        
        <button className="quick-action-card">
          <Upload className="h-8 w-8 text-purple-600" />
          <span className="font-semibold">Batch Process</span>
        </button>
      </div>

      {/* Tips */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">💡 Pro Tips:</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Drag multiple images at once for batch processing</li>
          <li>• Images will be auto-sorted by page numbers (if detected)</li>
          <li>• Best results with clear, well-lit images</li>
          <li>• Supported languages: Vietnamese + English</li>
        </ul>
      </div>
    </div>
  );
};
```

---

### 3. ExportSettings.tsx:

```tsx
import { useState } from 'react';
import { FileText, Image, FileType, BookOpen } from 'lucide-react';

export type ExportFormat = 'docx' | 'markdown' | 'pdf-image' | 'pdf-text' | 'epub';

interface ExportSettingsProps {
  format: ExportFormat;
  autoSort: boolean;
  mergeDocuments: boolean;
  outputName: string;
  onUpdateSettings: (settings: any) => void;
}

export const ExportSettings: React.FC<ExportSettingsProps> = ({
  format,
  autoSort,
  mergeDocuments,
  outputName,
  onUpdateSettings
}) => {
  const formats = [
    { value: 'docx', label: 'Word (.docx)', icon: FileText, color: 'blue' },
    { value: 'markdown', label: 'Markdown (.md)', icon: FileType, color: 'gray' },
    { value: 'pdf-image', label: 'PDF (Images)', icon: Image, color: 'red' },
    { value: 'pdf-text', label: 'PDF (Text)', icon: FileText, color: 'red' },
    { value: 'epub', label: 'EPUB ebook', icon: BookOpen, color: 'purple' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      <h3 className="text-xl font-bold text-gray-800">🎯 Export Settings</h3>

      {/* Format Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Output Format:
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {formats.map(({ value, label, icon: Icon, color }) => (
            <button
              key={value}
              onClick={() => onUpdateSettings({ format: value })}
              className={`
                p-4 rounded-lg border-2 transition-all
                ${format === value
                  ? `border-${color}-500 bg-${color}-50`
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <Icon className={`h-6 w-6 mx-auto mb-2 text-${color}-600`} />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={autoSort}
            onChange={(e) => onUpdateSettings({ autoSort: e.target.checked })}
            className="w-5 h-5 rounded border-gray-300"
          />
          <span className="text-sm font-medium text-gray-700">
            ✨ Auto-sort by page number
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={mergeDocuments}
            onChange={(e) => onUpdateSettings({ mergeDocuments: e.target.checked })}
            className="w-5 h-5 rounded border-gray-300"
          />
          <span className="text-sm font-medium text-gray-700">
            📄 Merge into single document
          </span>
        </label>
      </div>

      {/* Output Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Output Filename:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={outputName}
            onChange={(e) => onUpdateSettings({ outputName: e.target.value })}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="my_document_ocr"
          />
          <button className="btn-secondary">
            📁 Browse
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

### 4. ProcessingView.tsx:

```tsx
interface ProcessingViewProps {
  progress: number;
  currentFile: string;
  totalFiles: number;
  onCancel: () => void;
}

export const ProcessingView: React.FC<ProcessingViewProps> = ({
  progress,
  currentFile,
  totalFiles,
  onCancel
}) => {
  const currentIndex = Math.floor((progress / 100) * totalFiles);
  const elapsed = "00:01:23"; // TODO: Calculate from start time
  const remaining = "00:00:45"; // TODO: Estimate based on progress

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
            <div className="animate-spin h-12 w-12 border-4 border-blue-600 
                          border-t-transparent rounded-full" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Processing Your Images...
          </h2>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress</span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 
                       transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Current File */}
        <div className="bg-blue-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">
              Current File:
            </span>
            <span className="text-sm text-gray-600">
              {currentIndex}/{totalFiles}
            </span>
          </div>
          <p className="font-semibold text-blue-900 truncate">
            📄 {currentFile}
          </p>
          <p className="text-sm text-blue-700">
            Status: Extracting text... 🔍
          </p>
        </div>

        {/* Time Info */}
        <div className="flex justify-between text-sm text-gray-600">
          <span>⏱️ Elapsed: {elapsed}</span>
          <span>⏳ Remaining: ~{remaining}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button className="flex-1 btn-secondary">
            ⏸️ Pause
          </button>
          <button 
            onClick={onCancel}
            className="flex-1 btn-danger"
          >
            ⏹️ Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

## 🎨 TAILWIND CUSTOM CLASSES

Add to `index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn-primary {
    @apply px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 
           text-white font-semibold rounded-lg
           hover:from-blue-700 hover:to-indigo-700 
           transition-all shadow-md hover:shadow-lg
           cursor-pointer inline-flex items-center gap-2;
  }

  .btn-secondary {
    @apply px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg
           hover:bg-gray-200 transition-all shadow-sm
           cursor-pointer inline-flex items-center gap-2;
  }

  .btn-danger {
    @apply px-6 py-3 bg-red-100 text-red-700 font-semibold rounded-lg
           hover:bg-red-200 transition-all shadow-sm
           cursor-pointer inline-flex items-center gap-2;
  }

  .quick-action-card {
    @apply bg-white rounded-lg p-6 flex flex-col items-center gap-3
           border-2 border-gray-200 hover:border-blue-400
           hover:shadow-lg transition-all cursor-pointer;
  }
}
```

---

## 📊 KEY DIFFERENCES SUMMARY

| Feature | QSM QueryMaster | QSM OCR Pro |
|---------|-----------------|-------------|
| **Purpose** | RAG document queries | Simple OCR processing |
| **Complexity** | High (AI, embeddings, queries) | Low (just OCR) |
| **Sidebar** | Yes (models, folders, settings) | No sidebar |
| **Tabs** | Multiple (Documents, Organization) | Single view |
| **Main Action** | Query documents | OCR images |
| **File Management** | Folders & organization | Simple file list |
| **AI Features** | Embeddings, vector search | OCR only |
| **Export** | Query results | Word/PDF/EPUB |
| **Target User** | Advanced (researchers) | Everyone (simple) |

---

## ✅ NEXT STEPS

Want me to:
1. **Create full component files** (DropZone, FileList, etc.)?
2. **Implement hooks** (useOCR, useFileHandler)?
3. **Setup routing** (if multiple pages needed)?
4. **Add animations** (Framer Motion for smooth transitions)?
5. **Create Electron main process** for OCR app?

Choose and I'll build it! 🚀
