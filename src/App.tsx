import { useState } from 'react';
import { PageHeader } from './components/PageHeader';
import { ResizableSidebar } from './components/ResizableSidebar';
import { SidebarContent } from './components/SidebarContent';
import { DocumentManagement } from './components/DocumentManagement';
import { useDocuments } from './hooks/useDocuments';
import { useOcrConfig } from './hooks/useOcrConfig';
import useAiModel from './hooks/useAiModel';

function App() {
  // Documents and folders
  const {
    documents,
    folders,
    selectedFolderId,
    setSelectedFolderId,
    addDocument,
    deleteDocument,
    addFolder,
    renameFolder,
    deleteFolder,
    toggleFolderSelection,
    toggleAllFolders,
    getSubFolders,
    getMainFolders,
    getFolderPath,
    getDocumentsByFolder
  } = useDocuments();

  // AI Model
  const [selectedModel, setSelectedModel] = useState<any>('llama3:8b');
  const [embeddingModel, setEmbeddingModel] = useState<any>('Xenova/all-MiniLM-L6-v2');
  const aiModelHook = useAiModel(selectedModel, 'ollama', embeddingModel);

  // OCR Config
  const { config: ocrConfig, updateConfig: updateOcrConfig, readableConfig } = useOcrConfig();

  // Current folder documents
  const currentFolderDocuments = getDocumentsByFolder(selectedFolderId);
  const folderPath = getFolderPath(selectedFolderId);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <PageHeader title="QueryMaster" />

      {/* Main Layout */}
      <div className="flex-1 overflow-hidden flex">
        {/* Resizable Sidebar */}
        <ResizableSidebar defaultWidth={320} minWidth={250} maxWidth={500}>
          <SidebarContent
            folders={folders}
            selectedFolderId={selectedFolderId}
            onFolderSelect={setSelectedFolderId}
            onAddFolder={addFolder}
            onRenameFolder={renameFolder}
            onDeleteFolder={deleteFolder}
            onToggleFolderSelection={toggleFolderSelection}
            onToggleAllFolders={toggleAllFolders}
            getSubFolders={getSubFolders}
            getMainFolders={getMainFolders}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            embeddingModel={embeddingModel}
            onEmbeddingModelChange={setEmbeddingModel}
            useAiModel={aiModelHook}
            ocrConfig={ocrConfig}
            onOcrConfigUpdate={updateOcrConfig}
            readableOcrConfig={readableConfig}
          />
        </ResizableSidebar>

        {/* Main Content */}
        <main className="flex-1 bg-gray-50 overflow-auto">
          <div className="p-6 h-full">
            <DocumentManagement
              selectedFolderId={selectedFolderId}
              folderPath={folderPath}
              currentFolderDocuments={currentFolderDocuments}
              addDocument={addDocument}
              deleteDocument={deleteDocument}
              getFolderPath={getFolderPath}
              folders={folders}
              embeddingPipeline={aiModelHook.embeddingPipeline}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
