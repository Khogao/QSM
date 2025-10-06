import { contextBridge, ipcRenderer } from 'electron';

const electronAPI = {
  // File operations
  importFiles: () => ipcRenderer.invoke('files:import'),
  importFolder: () => ipcRenderer.invoke('files:importFolder'),
  
  // Database operations
  getDocuments: () => ipcRenderer.invoke('db:getDocuments'),
  deleteDocument: (docId: string) => ipcRenderer.invoke('db:deleteDocument', docId),
  
  // Export
  exportDatabase: () => ipcRenderer.invoke('db:export'),
  
  // Organization features
  getOrganizationStats: () => ipcRenderer.invoke('organization:get-stats'),
  batchSummarize: (onProgress?: (current: number, total: number) => void) => {
    if (onProgress) {
      const listener = (_event: any, current: number, total: number) => onProgress(current, total);
      ipcRenderer.on('organization:summarize-progress', listener);
    }
    return ipcRenderer.invoke('organization:batch-summarize');
  },
  detectDuplicates: () => ipcRenderer.invoke('organization:detect-duplicates'),
  suggestFolders: () => ipcRenderer.invoke('organization:suggest-folders'),
  deleteDuplicate: (duplicateId: string) => ipcRenderer.invoke('organization:delete-duplicate', duplicateId),
  applyFolderSuggestion: (suggestionId: number) => ipcRenderer.invoke('organization:apply-folder-suggestion', suggestionId),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

export type ElectronAPI = typeof electronAPI;
