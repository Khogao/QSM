import { useState } from 'react';

export interface DocumentItem {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'txt' | 'doc';
  size: number;
  dateAdded: string;
  folderId: string;
  localPath?: string;
  originalPath?: string;
  content?: string;
  metadata?: any;
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  children?: string[];
  isSelected?: boolean;
}

export const useDocuments = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  
  const [folders, setFolders] = useState<Folder[]>([
    // Main categories - Universal structure for all industries
    { 
      id: 'technical', 
      name: 'Tài liệu Kỹ thuật', 
      children: ['tech-standards', 'tech-procedures', 'tech-reports'], 
      isSelected: true 
    },
    { 
      id: 'legal', 
      name: 'Pháp lý & Tuân thủ', 
      children: ['legal-laws', 'legal-contracts', 'legal-compliance'], 
      isSelected: false 
    },
    { 
      id: 'reference', 
      name: 'Tài liệu Tham khảo', 
      children: ['ref-cases', 'ref-practices', 'ref-research'], 
      isSelected: false 
    },
    { 
      id: 'internal', 
      name: 'Kiến thức Nội bộ', 
      children: ['int-policies', 'int-training', 'int-projects'], 
      isSelected: false 
    },
    { 
      id: 'regional', 
      name: 'Theo Khu vực', 
      children: ['reg-region1', 'reg-region2', 'reg-region3'], 
      isSelected: false 
    },
    
    // Subfolders for Technical Documents
    { id: 'tech-standards', name: 'Tiêu chuẩn & Quy chuẩn', parentId: 'technical', isSelected: false },
    { id: 'tech-procedures', name: 'Quy trình & Hướng dẫn', parentId: 'technical', isSelected: false },
    { id: 'tech-reports', name: 'Báo cáo Kỹ thuật', parentId: 'technical', isSelected: false },
    
    // Subfolders for Legal & Compliance
    { id: 'legal-laws', name: 'Luật & Quy định', parentId: 'legal', isSelected: false },
    { id: 'legal-contracts', name: 'Hợp đồng & Thỏa thuận', parentId: 'legal', isSelected: false },
    { id: 'legal-compliance', name: 'Yêu cầu Tuân thủ', parentId: 'legal', isSelected: false },
    
    // Subfolders for Reference Materials
    { id: 'ref-cases', name: 'Nghiên cứu Điển hình', parentId: 'reference', isSelected: false },
    { id: 'ref-practices', name: 'Thực hành Tốt nhất', parentId: 'reference', isSelected: false },
    { id: 'ref-research', name: 'Nghiên cứu Ngành', parentId: 'reference', isSelected: false },
    
    // Subfolders for Internal Knowledge
    { id: 'int-policies', name: 'Chính sách Công ty', parentId: 'internal', isSelected: false },
    { id: 'int-training', name: 'Tài liệu Đào tạo', parentId: 'internal', isSelected: false },
    { id: 'int-projects', name: 'Tài liệu Dự án', parentId: 'internal', isSelected: false },
    
    // Subfolders for Regional (customizable by user)
    { id: 'reg-region1', name: 'Khu vực 1', parentId: 'regional', isSelected: false },
    { id: 'reg-region2', name: 'Khu vực 2', parentId: 'regional', isSelected: false },
    { id: 'reg-region3', name: 'Khu vực 3', parentId: 'regional', isSelected: false },
  ]);

  const [selectedFolderId, setSelectedFolderId] = useState<string>('technical');

  const addDocument = (document: Omit<DocumentItem, 'id' | 'dateAdded'>) => {
    const newDoc: DocumentItem = {
      ...document,
      id: Date.now().toString(),
      dateAdded: new Date().toISOString(),
    };
    
    setDocuments(prev => [...prev, newDoc]);
    return newDoc;
  };

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const addFolder = (name: string, parentId?: string) => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      name,
      isSelected: false,
      ...(parentId && { parentId }),
    };
    
    setFolders(prev => {
      const updatedFolders = [...prev, newFolder];
      
      if (parentId) {
        return updatedFolders.map(folder => {
          if (folder.id === parentId) {
            return {
              ...folder,
              children: folder.children ? [...folder.children, newFolder.id] : [newFolder.id]
            };
          }
          return folder;
        });
      }
      
      return updatedFolders;
    });
    
    return newFolder;
  };

  const renameFolder = (id: string, newName: string) => {
    setFolders(prev => prev.map(folder => 
      folder.id === id ? { ...folder, name: newName } : folder
    ));
  };

  const deleteFolder = (id: string) => {
    const descendantIds = getAllDescendantIds(id);
    
    setFolders(prev => prev.filter(folder => 
      folder.id !== id && !descendantIds.includes(folder.id)
    ));
    
    const allFolderIds = [id, ...descendantIds];
    setDocuments(prev => prev.filter(doc => 
      !allFolderIds.includes(doc.folderId)
    ));
    
    const folderToDelete = getFolderById(id);
    if (folderToDelete?.parentId) {
      setFolders(prev => prev.map(folder => {
        if (folder.id === folderToDelete.parentId) {
          return {
            ...folder,
            children: folder.children?.filter(childId => childId !== id)
          };
        }
        return folder;
      }));
    }
  };

  const getAllDescendantIds = (folderId: string): string[] => {
    const result: string[] = [];
    const folder = getFolderById(folderId);
    
    if (folder?.children) {
      for (const childId of folder.children) {
        result.push(childId);
        result.push(...getAllDescendantIds(childId));
      }
    }
    
    return result;
  };

  const toggleFolderSelection = (folderId: string) => {
    const folder = getFolderById(folderId);
    if (!folder) return;
    
    const newIsSelected = !folder.isSelected;
    
    setFolders(prev => prev.map(f => 
      f.id === folderId ? { ...f, isSelected: newIsSelected } : f
    ));
    
    const childrenIds = getAllDescendantIds(folderId);
    if (childrenIds.length) {
      setFolders(prev => prev.map(f => 
        childrenIds.includes(f.id) ? { ...f, isSelected: newIsSelected } : f
      ));
    }
  };

  const toggleAllFolders = (selected: boolean) => {
    setFolders(prev => prev.map(folder => ({ ...folder, isSelected: selected })));
  };

  const getSelectedFolderIds = (): string[] => {
    return folders.filter(f => f.isSelected).map(f => f.id);
  };

  const getDocumentsByFolder = (folderId: string) => {
    return documents.filter(doc => doc.folderId === folderId);
  };

  const getMainFolders = () => {
    return folders.filter(folder => !folder.parentId);
  };

  const getSubFolders = (parentId: string) => {
    return folders.filter(folder => folder.parentId === parentId);
  };

  const getFolderById = (id: string) => {
    return folders.find(folder => folder.id === id);
  };

  const getFolderPath = (folderId: string): Folder[] => {
    const result: Folder[] = [];
    let currentFolder = getFolderById(folderId);
    
    while (currentFolder) {
      result.unshift(currentFolder);
      if (currentFolder.parentId) {
        currentFolder = getFolderById(currentFolder.parentId);
      } else {
        break;
      }
    }
    
    return result;
  };

  return {
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
    getSelectedFolderIds,
    getDocumentsByFolder,
    getMainFolders,
    getSubFolders,
    getFolderById,
    getFolderPath,
  };
};
