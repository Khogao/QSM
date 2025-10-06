export interface ElectronAPI {
  importFiles: () => Promise<{ success: number; failed: number; error?: string }>;
  importFolder: () => Promise<{ success: number; failed: number; error?: string }>;
  getDocuments: () => Promise<Document[]>;
  deleteDocument: (docId: string) => Promise<{ success: boolean; error?: string }>;
  exportDatabase: () => Promise<string | null>;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  dateAdded: number;
  folderId?: string;
  localPath: string;
  originalPath: string;
  content?: string;
  metadata?: string;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
