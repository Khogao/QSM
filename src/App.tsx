import { useState } from 'react';
import { PageHeader } from './components/PageHeader';
import { ResizableSidebar } from './components/ResizableSidebar';
import { SidebarContent } from './components/SidebarContent';
import { DocumentManagement } from './components/DocumentManagement';
import { OrganizationPanel } from './components/OrganizationPanel';
import { useDocuments } from './hooks/useDocuments';
import { useOcrConfig } from './hooks/useOcrConfig';
import useAiModel from './hooks/useAiModel';
import { Sparkles, FileText } from 'lucide-react';

function App() {
  // Active view: 'documents' or 'organization'
  const [activeView, setActiveView] = useState<'documents' | 'organization'>('documents');
  
  // Documents and folders
  const {
    // documents,
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
        <main className="flex-1 bg-gray-50 overflow-auto flex flex-col">
          {/* View Tabs */}
          <div className="bg-white border-b flex gap-2 px-4 py-2">
            <button
              onClick={() => setActiveView('documents')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                activeView === 'documents'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <FileText className="h-4 w-4" />
              Documents
            </button>
            <button
              onClick={() => setActiveView('organization')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                activeView === 'organization'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              Organization
            </button>
          </div>
          
          {/* Content Area */}
          <div className="flex-1 overflow-auto">
            {activeView === 'documents' ? (
              <div className="p-6 h-full">
                <DocumentManagement
                  selectedFolderId={selectedFolderId}
                  folderPath={folderPath}
                  currentFolderDocuments={currentFolderDocuments}
                  addDocument={addDocument}
                  deleteDocument={deleteDocument}
                  getFolderPath={getFolderPath}
                  folders={folders}
                  // embeddingPipeline={aiModelHook.embeddingPipeline}
                />
              </div>
            ) : (
              <OrganizationPanel />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
