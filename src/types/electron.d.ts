export interface OrganizationStats {
  totalDocuments: number;
  summarized: number;
  duplicates: number;
  clusters: number;
  suggestions: number;
}

export interface DuplicateGroup {
  originalId: string;
  originalName: string;
  duplicates: Array<{
    id: string;
    name: string;
    similarity: number;
  }>;
}

export interface FolderSuggestion {
  id: number;
  name: string;
  description: string;
  category: string;
  confidence: number;
  documentCount: number;
}

export interface ElectronAPI {
  importFiles: () => Promise<{ success: number; failed: number; error?: string }>;
  importFolder: () => Promise<{ success: number; failed: number; error?: string }>;
  getDocuments: () => Promise<Document[]>;
  deleteDocument: (docId: string) => Promise<{ success: boolean; error?: string }>;
  exportDatabase: () => Promise<string | null>;
  
  // Organization features
  getOrganizationStats?: () => Promise<OrganizationStats>;
  batchSummarize?: (onProgress?: (current: number, total: number) => void) => Promise<{ success: number; failed: number }>;
  detectDuplicates?: () => Promise<DuplicateGroup[]>;
  suggestFolders?: () => Promise<FolderSuggestion[]>;
  deleteDuplicate?: (duplicateId: string) => Promise<void>;
  applyFolderSuggestion?: (suggestionId: number) => Promise<void>;
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
