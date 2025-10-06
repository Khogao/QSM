import { useState } from 'react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Folder, FolderPlus, ChevronRight, ChevronDown } from 'lucide-react';
import { Folder as FolderType } from '../hooks/useDocuments';

interface FolderListProps {
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
}

export const FolderList: React.FC<FolderListProps> = ({ 
  folders, 
  selectedFolderId, 
  onFolderSelect,
  onAddFolder,
  onToggleFolderSelection,
  onToggleAllFolders,
  getSubFolders,
  getMainFolders
}) => {
  const [isAddFolderOpen, setIsAddFolderOpen] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['standards', 'local-regulations']);
  const [currentParentId, setCurrentParentId] = useState<string | undefined>(undefined);
  const [folderName, setFolderName] = useState('');
  
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
            className="flex-1 justify-start text-left"
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
      <div className="flex items-center space-x-2 mb-4 p-2 bg-gray-50 rounded border">
        <Checkbox 
          id="select-all-folders"
          checked={areAllFoldersSelected}
          onChange={(e: any) => onToggleAllFolders(e.target.checked)}
        />
        <label 
          htmlFor="select-all-folders" 
          className="text-sm font-medium leading-none cursor-pointer"
        >
          Tất cả Thư mục
        </label>
      </div>
      
      <div className="space-y-1">
        {getMainFolders().map(folder => renderFolder(folder))}
      </div>
      
      <Dialog open={isAddFolderOpen} onOpenChange={setIsAddFolderOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => handleOpenAddFolder()}
          >
            <FolderPlus className="mr-2 h-4 w-4" />
            Thêm thư mục mới
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentParentId ? "Thêm thư mục con" : "Thêm thư mục mới"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tên thư mục</label>
              <Input 
                placeholder="Nhập tên thư mục" 
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
              />
              {folderName.length > 0 && folderName.length < 3 && (
                <p className="text-xs text-red-600 mt-1">Tên thư mục phải có ít nhất 3 ký tự</p>
              )}
            </div>
            <div className="flex justify-end">
              <Button onClick={handleAddSubmit} disabled={folderName.length < 3}>
                Thêm thư mục
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
