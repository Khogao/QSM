import { useState, useEffect } from 'react';
import { Settings, FolderOpen, Key, Save, RotateCcw, Lock, HardDrive, Database, Package } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';

interface StorageConfig {
  modelCachePath: string;
  ragDataPath: string;
  databasePath: string;
  encryptData: boolean;
  encryptionKey: string;
  autoBackup: boolean;
  backupInterval: number;
  backupPath: string;
  // RAG Parameters
  chunkSize: number;
  chunkOverlap: number;
  ragMode: 'notebook' | 'survey' | 'general' | 'code' | 'legal' | 'custom';
  // Hardware Acceleration
  hardwareAccel: 'cpu' | 'amd' | 'nvidia' | 'apple' | 'auto';
}

const DEFAULT_CONFIG: StorageConfig = {
  modelCachePath: '~/.cache/querymaster/models',
  ragDataPath: '~/Documents/QueryMaster/rag-data',
  databasePath: '~/Documents/QueryMaster/database.db',
  encryptData: false,
  encryptionKey: '',
  autoBackup: true,
  backupInterval: 24,
  backupPath: '~/Documents/QueryMaster/backups',
  // RAG Parameters
  chunkSize: 320,
  chunkOverlap: 50,
  ragMode: 'general',
  // Hardware Acceleration
  hardwareAccel: 'auto'
};

// RAG Mode Presets
const RAG_MODE_PRESETS = {
  notebook: { chunkSize: 512, chunkOverlap: 100, description: 'NotebookLM-style: Tổng hợp, tổng quan (512 tokens)' },
  survey: { chunkSize: 256, chunkOverlap: 50, description: 'Khảo sát dữ liệu: Phân tích chi tiết (256 tokens)' },
  general: { chunkSize: 320, chunkOverlap: 50, description: 'Hỏi đáp chung: Cân bằng (320 tokens)' },
  code: { chunkSize: 128, chunkOverlap: 20, description: 'Tìm kiếm code: Chính xác (128 tokens)' },
  legal: { chunkSize: 384, chunkOverlap: 80, description: 'Hợp đồng/Pháp lý: Duy trì ngữ cảnh (384 tokens)' },
  custom: { chunkSize: 320, chunkOverlap: 50, description: 'Tùy chỉnh: Tự đặt tham số' }
};

export const SettingsDialog = () => {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<StorageConfig>(DEFAULT_CONFIG);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Load saved config from localStorage
    const savedConfig = localStorage.getItem('storageConfig');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, [open]);

  const handleSave = () => {
    localStorage.setItem('storageConfig', JSON.stringify(config));
    setHasChanges(false);
    setOpen(false);
    // TODO: Notify main process to apply new config
    console.log('💾 Configuration saved:', config);
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
    setHasChanges(true);
  };

  const updateConfig = (key: keyof StorageConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleBrowseFolder = async (configKey: keyof StorageConfig) => {
    // TODO: Integrate with Electron dialog API
    console.log(`📁 Browse for ${configKey}`);
    // For now, show alert
    alert('Tính năng chọn thư mục sẽ được tích hợp với Electron dialog API');
  };

  const generateEncryptionKey = () => {
    const key = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    updateConfig('encryptionKey', key);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Cài đặt">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Cài đặt Hệ thống
          </DialogTitle>
          <DialogDescription>
            Cấu hình đường dẫn lưu trữ, mã hóa và sao lưu dữ liệu
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Storage Locations */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <HardDrive className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-lg">Vị trí Lưu trữ</h3>
            </div>

            {/* Model Cache Path */}
            <div className="space-y-2">
              <Label htmlFor="modelCache" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Model Cache (Bộ nhớ đệm Model)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="modelCache"
                  value={config.modelCachePath}
                  onChange={(e) => updateConfig('modelCachePath', e.target.value)}
                  placeholder="Đường dẫn lưu model đã tải"
                  className="flex-1 font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleBrowseFolder('modelCachePath')}
                  title="Chọn thư mục"
                >
                  <FolderOpen className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Nơi lưu trữ các model AI đã tải về (HuggingFace, Ollama, etc.)
              </p>
            </div>

            {/* RAG Data Path */}
            <div className="space-y-2">
              <Label htmlFor="ragData" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                RAG Data (Dữ liệu RAG)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="ragData"
                  value={config.ragDataPath}
                  onChange={(e) => updateConfig('ragDataPath', e.target.value)}
                  placeholder="Đường dẫn lưu embeddings và chunks"
                  className="flex-1 font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleBrowseFolder('ragDataPath')}
                  title="Chọn thư mục"
                >
                  <FolderOpen className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Nơi lưu trữ vector embeddings và text chunks
              </p>
            </div>

            {/* Database Path */}
            <div className="space-y-2">
              <Label htmlFor="database" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Database (Cơ sở dữ liệu)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="database"
                  value={config.databasePath}
                  onChange={(e) => updateConfig('databasePath', e.target.value)}
                  placeholder="Đường dẫn file SQLite database"
                  className="flex-1 font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleBrowseFolder('databasePath')}
                  title="Chọn thư mục"
                >
                  <FolderOpen className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                File SQLite chứa metadata và mapping documents ↔ embeddings
              </p>
            </div>
          </div>

          {/* RAG Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Package className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-lg">Tham số RAG/Indexing</h3>
            </div>

            {/* RAG Mode Preset */}
            <div className="space-y-2">
              <Label htmlFor="ragMode">
                Chế độ RAG (Presets)
              </Label>
              <select
                id="ragMode"
                value={config.ragMode}
                onChange={(e) => {
                  const mode = e.target.value as typeof config.ragMode;
                  updateConfig('ragMode', mode);
                  // Auto-apply preset if not custom
                  if (mode !== 'custom') {
                    const preset = RAG_MODE_PRESETS[mode];
                    updateConfig('chunkSize', preset.chunkSize);
                    updateConfig('chunkOverlap', preset.chunkOverlap);
                  }
                }}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="notebook">📔 NotebookLM-style (512 tokens)</option>
                <option value="survey">📊 Khảo sát dữ liệu (256 tokens)</option>
                <option value="general">💬 Hỏi đáp chung (320 tokens)</option>
                <option value="code">💻 Tìm kiếm code (128 tokens)</option>
                <option value="legal">⚖️ Hợp đồng/Pháp lý (384 tokens)</option>
                <option value="custom">⚙️ Tùy chỉnh</option>
              </select>
              <p className="text-xs text-gray-500">
                {RAG_MODE_PRESETS[config.ragMode].description}
              </p>
            </div>

            {/* Chunk Size */}
            <div className="space-y-2">
              <Label htmlFor="chunkSize">
                Chunk Size (Kích thước khối văn bản)
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  id="chunkSize"
                  type="number"
                  min="64"
                  max="2048"
                  step="64"
                  value={config.chunkSize}
                  onChange={(e) => {
                    updateConfig('chunkSize', parseInt(e.target.value));
                    updateConfig('ragMode', 'custom'); // Switch to custom when manually changed
                  }}
                  className="w-32"
                  disabled={config.ragMode !== 'custom'}
                />
                <span className="text-sm text-gray-600">tokens</span>
                <input
                  type="range"
                  min="64"
                  max="2048"
                  step="64"
                  value={config.chunkSize}
                  onChange={(e) => {
                    updateConfig('chunkSize', parseInt(e.target.value));
                    updateConfig('ragMode', 'custom');
                  }}
                  className="flex-1"
                  disabled={config.ragMode !== 'custom'}
                />
              </div>
              <p className="text-xs text-gray-500">
                Độ dài văn bản mỗi chunk. Nhỏ hơn = chính xác, lớn hơn = ngữ cảnh rộng.
              </p>
            </div>

            {/* Chunk Overlap */}
            <div className="space-y-2">
              <Label htmlFor="chunkOverlap">
                Chunk Overlap (Độ trùng lặp)
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  id="chunkOverlap"
                  type="number"
                  min="0"
                  max="512"
                  step="10"
                  value={config.chunkOverlap}
                  onChange={(e) => {
                    updateConfig('chunkOverlap', parseInt(e.target.value));
                    updateConfig('ragMode', 'custom');
                  }}
                  className="w-32"
                  disabled={config.ragMode !== 'custom'}
                />
                <span className="text-sm text-gray-600">tokens</span>
              </div>
              <p className="text-xs text-gray-500">
                Số tokens trùng lặp giữa các chunk. Tránh mất ngữ cảnh ở biên chunk.
              </p>
            </div>

            {/* Hardware Acceleration */}
            <div className="space-y-2">
              <Label htmlFor="hardwareAccel">
                Tăng tốc phần cứng (Docling)
              </Label>
              <select
                id="hardwareAccel"
                value={config.hardwareAccel}
                onChange={(e) => updateConfig('hardwareAccel', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="auto">🤖 Tự động (khuyến nghị)</option>
                <option value="cpu">🖥️ CPU only (universal)</option>
                <option value="amd">🔴 AMD GPU (ROCm) - RX 580 8GB</option>
                <option value="nvidia">🟢 NVIDIA GPU (CUDA)</option>
                <option value="apple">🍎 Apple Silicon (MPS)</option>
              </select>
              <p className="text-xs text-gray-500">
                Chọn phần cứng để xử lý Docling. <strong>Auto</strong> sẽ tự phát hiện tốt nhất.
                {config.hardwareAccel === 'amd' && (
                  <span className="block mt-1 text-amber-600">
                    ⚠️ ROCm yêu cầu driver AMD hỗ trợ. Fallback CPU nếu không khả dụng.
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Security Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Lock className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-lg">Bảo mật</h3>
            </div>

            {/* Encryption Toggle */}
            <div className="flex items-start space-x-3 space-y-0">
              <input
                type="checkbox"
                id="encryptData"
                checked={config.encryptData}
                onChange={(e) => updateConfig('encryptData', e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300"
              />
              <div className="space-y-1">
                <Label
                  htmlFor="encryptData"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Mã hóa dữ liệu RAG
                </Label>
                <p className="text-xs text-gray-500">
                  Mã hóa nội dung tài liệu và lịch sử truy vấn bằng AES-256
                </p>
              </div>
            </div>

            {/* Encryption Key */}
            {config.encryptData && (
              <div className="space-y-2 ml-6">
                <Label htmlFor="encryptionKey" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Khóa mã hóa (64 ký tự hex)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="encryptionKey"
                    type="password"
                    value={config.encryptionKey}
                    onChange={(e) => updateConfig('encryptionKey', e.target.value)}
                    placeholder="Nhập khóa mã hóa hoặc tạo tự động"
                    className="flex-1 font-mono text-xs"
                    maxLength={64}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateEncryptionKey}
                    title="Tạo khóa ngẫu nhiên"
                  >
                    <Key className="h-4 w-4 mr-1" />
                    Tạo
                  </Button>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs text-yellow-800">
                  ⚠️ <strong>Quan trọng:</strong> Lưu khóa này an toàn. Mất khóa = mất dữ liệu!
                </div>
              </div>
            )}
          </div>

          {/* Backup Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Save className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-lg">Sao lưu Tự động</h3>
            </div>

            <div className="flex items-start space-x-3 space-y-0">
              <input
                type="checkbox"
                id="autoBackup"
                checked={config.autoBackup}
                onChange={(e) => updateConfig('autoBackup', e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300"
              />
              <div className="space-y-1">
                <Label htmlFor="autoBackup">
                  Bật sao lưu tự động
                </Label>
                <p className="text-xs text-gray-500">
                  Tự động sao lưu database và cấu hình theo định kỳ
                </p>
              </div>
            </div>

            {config.autoBackup && (
              <div className="ml-6 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="backupInterval">
                    Chu kỳ sao lưu (giờ)
                  </Label>
                  <Input
                    id="backupInterval"
                    type="number"
                    min="1"
                    max="168"
                    value={config.backupInterval}
                    onChange={(e) => updateConfig('backupInterval', parseInt(e.target.value))}
                    className="w-32"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backupPath">
                    Thư mục sao lưu
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="backupPath"
                      value={config.backupPath}
                      onChange={(e) => updateConfig('backupPath', e.target.value)}
                      className="flex-1 font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleBrowseFolder('backupPath')}
                    >
                      <FolderOpen className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleReset}
            className="mr-auto"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Khôi phục Mặc định
          </Button>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            Lưu Cài đặt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
