/**
 * Unified File & Folder Selector
 * - Upload files
 * - Select folders
 * - Checkbox: Include subfolders
 */

import { useState } from 'react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { 
  Folder, FolderPlus, ChevronRight, ChevronDown, 
  Upload, FileText, CheckSquare, Square
} from 'lucide-react';
import { Folder as FolderType } from '../hooks/useDocuments';

interface UnifiedFileFolderSelectorProps {
  folders: FolderType[];
  selectedFolderId: string;
  onFolderSelect: (folderId: string) => void;
  onAddFolder: (name: string, parentId?: string) => void;
  onToggleFolderSelection: (id: string) => void;
  onToggleAllFolders: (selected: boolean) => void;
  getSubFolders: (parentId: string) => FolderType[];
  getMainFolders: () => FolderType[];
  onFileUpload?: (files: FileList) => void;
}

export const UnifiedFileFolderSelector: React.FC<UnifiedFileFolderSelectorProps> = ({ 
  folders, 
  selectedFolderId, 
  onFolderSelect,
  onAddFolder,
  onToggleFolderSelection,
  onToggleAllFolders,
  getSubFolders,
  getMainFolders,
  onFileUpload
}) => {
  const [isAddFolderOpen, setIsAddFolderOpen] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['standards', 'local-regulations']);
  const [currentParentId, setCurrentParentId] = useState<string | undefined>(undefined);
  const [folderName, setFolderName] = useState('');
  const [includeSubfolders, setIncludeSubfolders] = useState(false);
  
  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => 
      prev.includes(folderId) 
        ? prev.filter(id => id !== folderId) 
        : [...prev, folderId]
    );
  };

  const handleOpenAddFolder = (parentId?: string) => {
    setCurrentParentId(parentId);
    setFolderName('');
    setIsAddFolderOpen(true);
  };

  const handleAddSubmit = () => {
    if (folderName.trim().length >= 3) {
      onAddFolder(folderName, currentParentId);
      setFolderName('');
      setIsAddFolderOpen(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0 && onFileUpload) {
      onFileUpload(files);
    }
  };

  const areAllFoldersSelected = folders.length > 0 && folders.every(folder => folder.isSelected);
  
  const renderFolder = (folder: FolderType) => {
    const hasChildren = folder.children && folder.children.length > 0;
    const isExpanded = expandedFolders.includes(folder.id);
    const subFolders = hasChildren ? getSubFolders(folder.id) : [];
    
    return (
      <div key={folder.id} className="space-y-1">
        <div className="flex items-center">
          <div className="flex items-center mr-1">
            <Checkbox 
              id={`checkbox-${folder.id}`} 
              checked={folder.isSelected}
              onChange={() => onToggleFolderSelection(folder.id)}
            />
          </div>
          
          {hasChildren && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5 p-0 mr-1"
              onClick={() => toggleFolder(folder.id)}
            >
              {isExpanded ? 
                <ChevronDown className="h-4 w-4" /> : 
                <ChevronRight className="h-4 w-4" />
              }
            </Button>
          )}
          {!hasChildren && <div className="w-6"></div>}
          
          <Button 
            variant={folder.id === selectedFolderId ? "default" : "ghost"}
            className="flex-1 justify-start text-left text-sm"
            onClick={() => onFolderSelect(folder.id)}
          >
            <Folder className="mr-2 h-4 w-4" />
            <span className="truncate">{folder.name}</span>
          </Button>
        </div>

        {isExpanded && hasChildren && (
          <div className="pl-4 border-l border-gray-200 ml-3 space-y-1">
            {subFolders.map(subFolder => renderFolder(subFolder))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Header: Files & Folders */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">📁 Files & Folders</h3>
      </div>

      {/* Upload Files Button */}
      <div className="space-y-2">
        <input
          type="file"
          id="file-upload"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          accept=".pdf,.txt,.docx,.doc"
        />
        <Button 
          variant="default" 
          className="w-full"
          size="sm"
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload Files
        </Button>
        <p className="text-xs text-gray-500 text-center">
          PDF, TXT, DOCX supported
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-2"></div>

      {/* Select All Folders */}
      <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded border">
        <Checkbox 
          id="select-all-folders"
          checked={areAllFoldersSelected}
          onChange={(e: any) => onToggleAllFolders(e.target.checked)}
        />
        <label 
          htmlFor="select-all-folders" 
          className="text-sm font-medium leading-none cursor-pointer flex-1"
        >
          Select All Folders
        </label>
      </div>

      {/* Include Subfolders Checkbox */}
      <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded border border-blue-200">
        <Checkbox 
          id="include-subfolders"
          checked={includeSubfolders}
          onChange={(e: any) => setIncludeSubfolders(e.target.checked)}
        />
        <label 
          htmlFor="include-subfolders" 
          className="text-sm leading-none cursor-pointer flex items-center gap-1"
        >
          {includeSubfolders ? (
            <CheckSquare className="h-3 w-3 text-blue-600" />
          ) : (
            <Square className="h-3 w-3 text-gray-400" />
          )}
          Include Subfolders
        </label>
      </div>
      
      {/* Folder Tree */}
      <div className="space-y-1">
        {getMainFolders().map(folder => renderFolder(folder))}
      </div>
      
      {/* Add New Folder */}
      <Dialog open={isAddFolderOpen} onOpenChange={setIsAddFolderOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full"
            size="sm"
            onClick={() => handleOpenAddFolder()}
          >
            <FolderPlus className="mr-2 h-4 w-4" />
            New Folder
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentParentId ? "Add Subfolder" : "Add New Folder"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Folder Name</label>
              <Input 
                placeholder="Enter folder name (min 3 chars)" 
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
              />
              {folderName.length > 0 && folderName.length < 3 && (
                <p className="text-xs text-red-600 mt-1">
                  Folder name must be at least 3 characters
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddFolderOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSubmit} disabled={folderName.length < 3}>
                Add Folder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Info Box */}
      {includeSubfolders && (
        <div className="text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded p-2">
          <FileText className="h-3 w-3 inline mr-1" />
          Queries will search in selected folders <strong>and all subfolders</strong>
        </div>
      )}
    </div>
  );
};

export default UnifiedFileFolderSelector;
