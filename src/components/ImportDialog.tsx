import { useState } from 'react';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (options: ImportOptions) => Promise<void>;
  importing: boolean;
}

export interface ImportOptions {
  files?: FileList;
  isFolder?: boolean;
  includeSubfolders?: boolean;
  // Pro features (locked in Free version)
  modelId?: string;
  chunkSize?: number;
  chunkOverlap?: number;
  topK?: number;
  ocrLanguage?: string;
  ocrDpi?: number;
}

const AI_MODELS = [
  { id: 'gpt-4', name: 'GPT-4 Turbo', provider: 'OpenAI', locked: true },
  { id: 'gpt-3.5', name: 'GPT-3.5 Turbo', provider: 'OpenAI', locked: true },
  { id: 'claude-3', name: 'Claude 3 Opus', provider: 'Anthropic', locked: true },
  { id: 'llama-3', name: 'Llama 3 70B', provider: 'Local', locked: true },
];

export const ImportDialog: React.FC<ImportDialogProps> = ({
  isOpen,
  onClose,
  onImport,
  importing
}) => {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [importType, setImportType] = useState<'files' | 'folder'>('files');
  const [includeSubfolders, setIncludeSubfolders] = useState(true);
  
  // Pro features (locked)
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [chunkSize, setChunkSize] = useState(512);
  const [chunkOverlap, setChunkOverlap] = useState(50);
  const [topK, setTopK] = useState(5);
  const [ocrLanguage, setOcrLanguage] = useState('vie+eng');
  const [ocrDpi, setOcrDpi] = useState(300);

  if (!isOpen) return null;

  const handleFileSelect = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf,.docx,.doc,.txt';
    
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        setSelectedFiles(files);
      }
    };
    
    input.click();
  };

  const handleFolderSelect = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.setAttribute('webkitdirectory', '');
    input.setAttribute('directory', '');
    input.multiple = true;
    
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        setSelectedFiles(files);
      }
    };
    
    input.click();
  };

  const handleSubmit = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      alert('⚠️ Vui lòng chọn file hoặc folder trước khi import!');
      return;
    }

    await onImport({
      files: selectedFiles,
      isFolder: importType === 'folder',
      includeSubfolders: importType === 'folder' ? includeSubfolders : undefined,
      // Pro features (sẽ không được xử lý trong bản Free)
      modelId: selectedModel,
      chunkSize,
      chunkOverlap,
      topK,
      ocrLanguage,
      ocrDpi
    });

    // Reset state
    setSelectedFiles(null);
    setImportType('files');
    onClose();
  };

  const totalSize = selectedFiles
    ? Array.from(selectedFiles).reduce((sum, file) => sum + file.size, 0)
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">📥 Import Documents</h2>
          <button
            onClick={onClose}
            disabled={importing}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Import Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📂 Loại Import
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setImportType('files')}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                  importType === 'files'
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-lg font-semibold">📄 Import Files</div>
                <div className="text-xs text-gray-600 mt-1">Chọn nhiều file cùng lúc</div>
              </button>
              
              <button
                onClick={() => setImportType('folder')}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                  importType === 'folder'
                    ? 'border-green-500 bg-green-50 text-green-900'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-lg font-semibold">📁 Import Folder</div>
                <div className="text-xs text-gray-600 mt-1">Quét toàn bộ thư mục</div>
              </button>
            </div>
          </div>

          {/* File/Folder Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {importType === 'files' ? '📄 Chọn Files' : '📁 Chọn Folder'}
            </label>
            
            <button
              onClick={importType === 'files' ? handleFileSelect : handleFolderSelect}
              disabled={importing}
              className="w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-center">
                <div className="text-4xl mb-2">{importType === 'files' ? '📄' : '📁'}</div>
                <div className="text-gray-700 font-medium">
                  Click để chọn {importType === 'files' ? 'files' : 'folder'}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Hỗ trợ: PDF, DOCX, DOC, TXT
                </div>
              </div>
            </button>

            {/* Selected Files Preview */}
            {selectedFiles && selectedFiles.length > 0 && (
              <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-semibold text-green-800">
                    ✅ Đã chọn {selectedFiles.length} file(s)
                  </div>
                  <div className="text-sm text-green-700">
                    Tổng: {(totalSize / (1024 * 1024)).toFixed(2)} MB
                  </div>
                </div>
                
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {Array.from(selectedFiles).slice(0, 10).map((file, idx) => (
                    <div key={idx} className="text-xs text-green-700 flex justify-between">
                      <span>• {file.name}</span>
                      <span className="text-green-600">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                  ))}
                  {selectedFiles.length > 10 && (
                    <div className="text-xs text-green-600 italic">
                      ... và {selectedFiles.length - 10} files khác
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Subfolder Option (for folder import only) */}
          {importType === 'folder' && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <input
                type="checkbox"
                id="includeSubfolders"
                checked={includeSubfolders}
                onChange={(e) => setIncludeSubfolders(e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="includeSubfolders" className="text-sm font-medium text-gray-700 cursor-pointer">
                📂 Bao gồm thư mục con (recursive scan)
              </label>
            </div>
          )}

          {/* AI Model Selection (LOCKED - Pro Feature) */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🤖 AI Model <span className="text-xs text-red-600 font-bold">🔒 PRO</span>
            </label>
            <div className="opacity-50 pointer-events-none">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
              >
                {AI_MODELS.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name} ({model.provider})
                  </option>
                ))}
              </select>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="px-4 py-2 bg-yellow-100 border-2 border-yellow-400 rounded-lg shadow-lg">
                <div className="text-sm font-bold text-yellow-900">
                  🔒 Chức năng RAG/AI chỉ có trong bản Pro
                </div>
              </div>
            </div>
          </div>

          {/* RAG Parameters (LOCKED - Pro Feature) */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ⚙️ RAG Configuration <span className="text-xs text-red-600 font-bold">🔒 PRO</span>
            </label>
            <div className="opacity-50 pointer-events-none grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Chunk Size (tokens)</label>
                <input
                  type="number"
                  value={chunkSize}
                  onChange={(e) => setChunkSize(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Overlap (tokens)</label>
                <input
                  type="number"
                  value={chunkOverlap}
                  onChange={(e) => setChunkOverlap(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Top-K Results</label>
                <input
                  type="number"
                  value={topK}
                  onChange={(e) => setTopK(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="px-4 py-2 bg-yellow-100 border-2 border-yellow-400 rounded-lg shadow-lg">
                <div className="text-sm font-bold text-yellow-900">
                  🔒 RAG parameters chỉ có trong bản Pro
                </div>
              </div>
            </div>
          </div>

          {/* OCR Settings (LOCKED - Pro Feature) */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📷 OCR Settings <span className="text-xs text-red-600 font-bold">🔒 PRO</span>
            </label>
            <div className="opacity-50 pointer-events-none grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Language</label>
                <select
                  value={ocrLanguage}
                  onChange={(e) => setOcrLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="vie+eng">Tiếng Việt + English</option>
                  <option value="vie">Tiếng Việt</option>
                  <option value="eng">English</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">DPI Quality</label>
                <select
                  value={ocrDpi}
                  onChange={(e) => setOcrDpi(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value={300}>300 DPI (Standard)</option>
                  <option value={600}>600 DPI (High)</option>
                </select>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="px-4 py-2 bg-yellow-100 border-2 border-yellow-400 rounded-lg shadow-lg">
                <div className="text-sm font-bold text-yellow-900">
                  🔒 OCR chỉ có trong bản Pro
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between items-center">
          <button
            onClick={onClose}
            disabled={importing}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            ❌ Hủy
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={importing || !selectedFiles || selectedFiles.length === 0}
            className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            {importing ? '⏳ Đang import...' : '✅ Import Now'}
          </button>
        </div>
      </div>
    </div>
  );
};
