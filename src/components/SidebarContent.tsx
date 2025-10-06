import { FolderList } from './FolderList';
import { ModelSelector } from './ModelSelector';
import { OcrConfigPanel } from './OcrConfigPanel';
import { ModelSelectionPanel } from './ModelSelectionPanel';
import { Folder as FolderType } from '../hooks/useDocuments';

interface SidebarContentProps {
  folders: FolderType[];
  selectedFolderId: string;
  onFolderSelect: (folderId: string) => void;
  onAddFolder: (name: string, parentId?: string) => void;
  onRenameFolder: (id: string, newName: string) => void;
  onDeleteFolder: (id: string) => void;
  onToggleFolderSelection: (id: string) => void;
  onToggleAllFolders: (selected: boolean) => void;
  getSubFolders: (parentId: string) => FolderType[];
  getMainFolders: () => FolderType[];
  
  // AI Model props
  selectedModel: any;
  onModelChange: (model: any) => void;
  embeddingModel: any;
  onEmbeddingModelChange: (model: any) => void;
  useAiModel: any;
  
  // OCR props
  ocrConfig: any;
  onOcrConfigUpdate: (config: any) => void;
  readableOcrConfig: any;
}

export const SidebarContent: React.FC<SidebarContentProps> = ({
  folders,
  selectedFolderId,
  onFolderSelect,
  onAddFolder,
  onRenameFolder,
  onDeleteFolder,
  onToggleFolderSelection,
  onToggleAllFolders,
  getSubFolders,
  getMainFolders,
  selectedModel,
  onModelChange,
  embeddingModel,
  onEmbeddingModelChange,
  useAiModel: aiModelHook,
  ocrConfig,
  onOcrConfigUpdate,
  readableOcrConfig
}) => {
  return (
    <div className="h-full flex flex-col">
      {/* Folder List Section */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold mb-2">Thư mục tài liệu</h2>
        <FolderList
          folders={folders}
          selectedFolderId={selectedFolderId}
          onFolderSelect={onFolderSelect}
          onAddFolder={onAddFolder}
          onRenameFolder={onRenameFolder}
          onDeleteFolder={onDeleteFolder}
          onToggleFolderSelection={onToggleFolderSelection}
          onToggleAllFolders={onToggleAllFolders}
          getSubFolders={getSubFolders}
          getMainFolders={getMainFolders}
        />
      </div>

      {/* Model Selection Panel (New AI Integration) */}
      <div className="p-4 border-b border-gray-200 overflow-y-auto">
        <ModelSelectionPanel />
      </div>

      {/* Legacy Model Selector (Keep for backward compatibility) */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold mb-2">Mô hình AI (Legacy)</h2>
        <ModelSelector
          value={selectedModel}
          onValueChange={onModelChange}
          embeddingModel={embeddingModel}
          onEmbeddingModelChange={onEmbeddingModelChange}
          useAiModel={aiModelHook}
        />
      </div>

      {/* OCR Config Section */}
      <div className="p-4 border-b border-gray-200">
        <OcrConfigPanel
          config={ocrConfig}
          onConfigUpdate={onOcrConfigUpdate}
          readableConfig={readableOcrConfig}
        />
      </div>
    </div>
  );
};
