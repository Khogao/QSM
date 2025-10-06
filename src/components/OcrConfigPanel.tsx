import { useState } from 'react';
import { Button } from './ui/button';
import { Settings, ChevronDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface OcrConfig {
  resolution: 'low' | 'medium' | 'high';
  language: 'vietnamese' | 'english' | 'mixed';
  accuracy: 'speed' | 'balanced' | 'accuracy';
}

interface OcrConfigPanelProps {
  config: OcrConfig;
  onConfigUpdate: (config: Partial<OcrConfig>) => void;
  readableConfig: {
    resolution: string;
    language: string;
    accuracy: string;
  };
}

export const OcrConfigPanel: React.FC<OcrConfigPanelProps> = ({
  config,
  onConfigUpdate,
  readableConfig
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [localConfig, setLocalConfig] = useState(config);

  const handleSubmit = () => {
    onConfigUpdate(localConfig);
    setIsDialogOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-semibold">Cấu hình OCR</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button variant="ghost" size="sm" onClick={() => setIsDialogOpen(true)}>
            <Settings className="h-4 w-4" />
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cấu hình OCR</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Độ phân giải quét</label>
                <div className="space-y-2">
                  {[
                    { value: 'low', label: 'Thấp', desc: '(Nhanh, 150 DPI)' },
                    { value: 'medium', label: 'Trung bình', desc: '(Cân bằng, 300 DPI)' },
                    { value: 'high', label: 'Cao', desc: '(Chính xác, 600 DPI)' }
                  ].map((res) => (
                    <label key={res.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="resolution"
                        value={res.value}
                        checked={localConfig.resolution === res.value}
                        onChange={(e) => setLocalConfig({ ...localConfig, resolution: e.target.value as any })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">
                        <span className="font-medium">{res.label}</span>
                        <span className="text-gray-500 ml-1">{res.desc}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ngôn ngữ nhận diện</label>
                <select
                  value={localConfig.language}
                  onChange={(e) => setLocalConfig({ ...localConfig, language: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  title="Chọn ngôn ngữ chính trong tài liệu"
                >
                  <option value="vietnamese">🇻🇳 Tiếng Việt</option>
                  <option value="english">🇬🇧 Tiếng Anh</option>
                  <option value="mixed">🌐 Hỗn hợp (Việt + Anh)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Chế độ xử lý</label>
                <select
                  value={localConfig.accuracy}
                  onChange={(e) => setLocalConfig({ ...localConfig, accuracy: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  title="Chọn ưu tiên giữa tốc độ và độ chính xác"
                >
                  <option value="speed">⚡ Tốc độ (Xử lý nhanh)</option>
                  <option value="balanced">⚖️ Cân bằng (Khuyến nghị)</option>
                  <option value="accuracy">🎯 Độ chính xác (Chậm hơn)</option>
                </select>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSubmit}>Lưu cấu hình</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex justify-between items-center w-full text-sm py-2"
        >
          <span>Xem cấu hình hiện tại</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="text-sm mt-2 space-y-1 text-gray-600">
            <div>Độ phân giải: {readableConfig.resolution}</div>
            <div>Ngôn ngữ: {readableConfig.language}</div>
            <div>Ưu tiên: {readableConfig.accuracy}</div>
          </div>
        )}
      </div>
    </div>
  );
};
