import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Info, Download, Loader2, Server, FileText, AlertCircle } from 'lucide-react';

// Import types from useAiModel
type AiModelType = 'llama3:8b' | 'llama-3.1-sonar-small-128k-online';
type PlatformType = 'huggingface' | 'ollama' | 'llamacpp';
type EmbeddingModelType = 'Xenova/all-MiniLM-L6-v2' | 'mixedbread-ai/mxbai-embed-small-v1';

interface ModelSelectorProps {
  value: AiModelType;
  onValueChange: (value: AiModelType) => void;
  embeddingModel?: EmbeddingModelType;
  onEmbeddingModelChange?: (value: EmbeddingModelType) => void;
  useAiModel: any; // Pass the hook result as prop
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ 
  value, 
  onValueChange,
  embeddingModel,
  onEmbeddingModelChange,
  useAiModel: aiModelHook
}) => {
  const { 
    // models, 
    embeddingModels,
    getModelInfo, 
    isLoading, 
    loadModel,
    loadEmbeddingModel,
    selectedPlatform, 
    setSelectedPlatform, 
    getAvailablePlatforms,
    getModelsByPlatform,
    lastError,
    isLargeModel
  } = aiModelHook;

  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [selectedModelInfo, setSelectedModelInfo] = useState(getModelInfo(value));
  const [showRamWarning, setShowRamWarning] = useState(false);
  const [showLoadError, setShowLoadError] = useState(false);
  const [ramCheckResult, setRamCheckResult] = useState<{totalRAM: number, warning: boolean}>({ totalRAM: 8, warning: false });

  const availablePlatforms = getAvailablePlatforms();
  const filteredModels = getModelsByPlatform(selectedPlatform);

  const handleInfoClick = (modelId: AiModelType) => {
    setSelectedModelInfo(getModelInfo(modelId));
    setIsInfoOpen(true);
  };

  const handlePlatformChange = (platform: PlatformType) => {
    setSelectedPlatform(platform);
    const modelsForPlatform = getModelsByPlatform(platform);
    
    if (!modelsForPlatform.some((model: any) => model.id === value) && modelsForPlatform.length > 0) {
      onValueChange(modelsForPlatform[0].id);
    }
  };

  useEffect(() => {
    const checkRam = () => {
      // Simple RAM check
      const ramInfo = { totalRAM: 8, warning: false };
      try {
        if (typeof navigator !== 'undefined' && 'deviceMemory' in navigator) {
          ramInfo.totalRAM = (navigator as any).deviceMemory || 8;
          ramInfo.warning = ramInfo.totalRAM < 8;
        }
      } catch (error) {
        console.error('RAM check error:', error);
      }
      
      setRamCheckResult(ramInfo);
      setShowRamWarning(ramInfo.warning && isLargeModel(value));
    };
    
    checkRam();
  }, [value, isLargeModel]);

  useEffect(() => {
    setShowLoadError(!!lastError);
  }, [lastError]);

  useEffect(() => {
    setSelectedModelInfo(getModelInfo(value));
  }, [value, getModelInfo]);

  const handleLoadModel = async () => {
    if (!value) return;
    await loadModel(value);
  };

  const handleLoadEmbeddingModel = async () => {
    if (!embeddingModel) return;
    await loadEmbeddingModel(embeddingModel);
  };

  return (
    <div className="space-y-2">
      <div className="mb-2">
        <label className="text-sm font-medium mb-1 block">Nền tảng AI</label>
        <Select
          value={selectedPlatform}
          onValueChange={handlePlatformChange}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Chọn nền tảng" />
          </SelectTrigger>
          <SelectContent>
            {availablePlatforms.map((platform: string) => {
              const platformInfo = {
                huggingface: { name: 'Hugging Face', desc: 'Chạy trên trình duyệt' },
                ollama: { name: 'Ollama', desc: 'Chạy trên máy cục bộ' },
                llamacpp: { name: 'LlamaCPP', desc: 'Server cục bộ' }
              };
              const info = platformInfo[platform as keyof typeof platformInfo] || { name: platform, desc: '' };
              
              return (
                <SelectItem key={platform} value={platform}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <Server className="h-4 w-4 mr-2" />
                      <span className="font-medium">{info.name}</span>
                    </div>
                    <span className="text-xs text-gray-500 ml-2">{info.desc}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium mb-1 block">Mô hình Ngôn ngữ (LLM)</label>
        <div className="flex items-center gap-2">
          <Select
            value={value}
            onValueChange={onValueChange}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn mô hình LLM" />
            </SelectTrigger>
            <SelectContent>
              {filteredModels.length > 0 ? (
                filteredModels.map((model: any) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex justify-between items-center w-full">
                      <span className="font-medium">{model.name}</span>
                      <span className="text-gray-500 text-xs ml-2 bg-gray-100 px-2 py-0.5 rounded">{model.parameters}</span>
                    </div>
                  </SelectItem>
                ))
              ) : (
                <div className="px-2 py-4 text-sm text-gray-500 text-center">
                  Không có model khả dụng cho nền tảng này
                </div>
              )}
            </SelectContent>
          </Select>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => handleInfoClick(value)}
            disabled={isLoading}
            title="Xem thông tin chi tiết model"
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {onEmbeddingModelChange && embeddingModel && (
        <div className="space-y-1">
          <label className="text-sm font-medium mb-1 block">Mô hình Vector Embedding</label>
          <div className="flex items-center gap-2">
            <Select
              value={embeddingModel}
              onValueChange={onEmbeddingModelChange}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn mô hình embedding" />
              </SelectTrigger>
              <SelectContent>
                {embeddingModels.map((model: any) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{model.name}</span>
                      <span className="text-xs text-gray-500">{model.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="ghost" 
              size="icon" 
              disabled={isLoading}
              title="Embedding models chuyển văn bản thành vector để tìm kiếm"
            >
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {showRamWarning && (
        <Alert variant="default" className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Cảnh báo RAM</AlertTitle>
          <AlertDescription className="text-amber-700">
            Máy tính của bạn chỉ có {ramCheckResult.totalRAM}GB RAM. Model này yêu cầu nhiều RAM hơn để chạy hiệu quả.
          </AlertDescription>
        </Alert>
      )}

      {showLoadError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Lỗi khi tải model</AlertTitle>
          <AlertDescription>
            {lastError || "Không thể tải model. Model dự phòng sẽ được sử dụng."}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={handleLoadModel}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Đang tải...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Tải LLM
            </>
          )}
        </Button>
        
        {onEmbeddingModelChange && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={handleLoadEmbeddingModel}
            disabled={isLoading || !embeddingModel}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang tải...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Tải Embedding
              </>
            )}
          </Button>
        )}
      </div>

      <Dialog open={isInfoOpen} onOpenChange={setIsInfoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedModelInfo?.name || 'Model Information'}
            </DialogTitle>
          </DialogHeader>
          {selectedModelInfo && (
            <div className="space-y-4 pt-2">
              <div>
                <h4 className="font-medium">Mô tả</h4>
                <p className="text-sm text-gray-600">{selectedModelInfo.description}</p>
              </div>
              <div>
                <h4 className="font-medium">Thông số</h4>
                <p className="text-sm text-gray-600">Số tham số: {selectedModelInfo.parameters}</p>
              </div>
              <div>
                <h4 className="font-medium">Yêu cầu</h4>
                <p className="text-sm text-gray-600">{selectedModelInfo.requirements}</p>
              </div>
              <div>
                <h4 className="font-medium">Platform</h4>
                <p className="text-sm text-gray-600 capitalize">{selectedModelInfo.platform}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
