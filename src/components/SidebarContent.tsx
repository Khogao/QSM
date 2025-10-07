import { UnifiedFileFolderSelector } from './UnifiedFileFolderSelector';
import { ModelSelectionPanel } from './ModelSelectionPanel';
import { OcrConfigPanel } from './OcrConfigPanel';
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
    <div className="h-full flex flex-col overflow-hidden">
      {/* Unified File & Folder Section - Fixed height with internal scroll */}
      <div className="flex-shrink-0 border-b border-gray-200">
        <div className="p-4 max-h-[300px] overflow-y-auto">
          <UnifiedFileFolderSelector
            folders={folders}
            selectedFolderId={selectedFolderId}
            onFolderSelect={onFolderSelect}
            onAddFolder={onAddFolder}
            onToggleFolderSelection={onToggleFolderSelection}
            onToggleAllFolders={onToggleAllFolders}
            getSubFolders={getSubFolders}
            getMainFolders={getMainFolders}
          />
        </div>
      </div>

      {/* Model Selection Panel - Compact with scroll */}
      <div className="flex-shrink-0 border-b border-gray-200">
        <div className="p-4 max-h-[250px] overflow-y-auto">
          <ModelSelectionPanel />
        </div>
      </div>

      {/* OCR Config Section - Collapsible */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <OcrConfigPanel
            config={ocrConfig}
            onConfigUpdate={onOcrConfigUpdate}
            readableConfig={readableOcrConfig}
          />
        </div>
      </div>
    </div>
  );
};
