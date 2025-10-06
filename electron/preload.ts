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
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

export type ElectronAPI = typeof electronAPI;
