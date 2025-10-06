/**
 * QSM - Document Organization Panel
 * 
 * Features:
 * 1. Batch summarization
 * 2. Smart folder suggestions
 * 3. Duplicate detection & removal
 * 4. Clustering & grouping
 */

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { 
  Sparkles, FolderTree, Copy, Grid3X3, 
  PlayCircle, CheckCircle, XCircle, AlertTriangle,
  FileText, Trash2, MoveRight, BarChart3
} from 'lucide-react';

interface OrganizationStats {
  totalDocuments: number;
  summarized: number;
  duplicates: number;
  clusters: number;
  suggestions: number;
}

interface DuplicateGroup {
  originalId: string;
  originalName: string;
  duplicates: Array<{
    id: string;
    name: string;
    similarity: number;
  }>;
}

interface FolderSuggestion {
  id: number;
  name: string;
  description: string;
  category: string;
  confidence: number;
  documentCount: number;
}

export const OrganizationPanel: React.FC = () => {
  // TODO: Add toast notifications
  const toast = (msg: any) => console.log('Toast:', msg);
  
  const [stats, setStats] = useState<OrganizationStats>({
    totalDocuments: 0,
    summarized: 0,
    duplicates: 0,
    clusters: 0,
    suggestions: 0
  });
  
  const [activeTab, setActiveTab] = useState<'summarize' | 'duplicates' | 'folders' | 'clusters'>('summarize');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [folderSuggestions, setFolderSuggestions] = useState<FolderSuggestion[]>([]);
  
  // Load stats on mount
  useEffect(() => {
    loadStats();
  }, []);
  
  const loadStats = async () => {
    // TODO: Implement IPC call to get stats
    // const result = await window.electronAPI.getOrganizationStats();
    // setStats(result);
  };
  
  const handleBatchSummarize = async () => {
    setIsProcessing(true);
    setProgress(0);
    
    try {
      toast({
        title: "Đang tạo tóm tắt",
        description: "Đang phân tích và tóm tắt tất cả tài liệu...",
      });
      
      // TODO: Implement IPC call
      // await window.electronAPI.batchSummarize((current, total) => {
      //   setProgress((current / total) * 100);
      // });
      
      toast({
        title: "Hoàn thành!",
        description: `Đã tạo tóm tắt cho ${stats.totalDocuments} tài liệu`,
      });
      
      await loadStats();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể tạo tóm tắt",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };
  
  const handleDetectDuplicates = async () => {
    setIsProcessing(true);
    
    try {
      toast({
        title: "Đang tìm trùng lặp",
        description: "Đang phân tích hash và nội dung...",
      });
      
      // TODO: Implement IPC call
      // const duplicates = await window.electronAPI.detectDuplicates();
      // setDuplicateGroups(duplicates);
      
      toast({
        title: "Hoàn thành!",
        description: `Tìm thấy ${stats.duplicates} file trùng lặp`,
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể tìm trùng lặp",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleSuggestFolders = async () => {
    setIsProcessing(true);
    
    try {
      toast({
        title: "Đang phân tích",
        description: "AI đang đề xuất cấu trúc thư mục...",
      });
      
      // TODO: Implement IPC call
      // const suggestions = await window.electronAPI.suggestFolders();
      // setFolderSuggestions(suggestions);
      
      toast({
        title: "Hoàn thành!",
        description: `Đã tạo ${stats.suggestions} đề xuất thư mục`,
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể đề xuất thư mục",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleDeleteDuplicate = async (duplicateId: string) => {
    try {
      // TODO: Implement IPC call
      // await window.electronAPI.deleteDuplicate(duplicateId);
      
      toast({
        title: "Đã xóa",
        description: "File trùng lặp đã được xóa",
      });
      
      await handleDetectDuplicates();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa file",
        variant: "destructive",
      });
    }
  };
  
  const handleApplyFolderSuggestion = async (suggestion: FolderSuggestion) => {
    try {
      // TODO: Implement IPC call
      // await window.electronAPI.applyFolderSuggestion(suggestion.id);
      
      toast({
        title: "Đã áp dụng",
        description: `Đã tạo thư mục "${suggestion.name}"`,
      });
      
      await loadStats();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tạo thư mục",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-600" />
              Tổ chức Tự động
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              AI-powered document organization & deduplication
            </p>
          </div>
          
          {/* Stats */}
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalDocuments}</div>
              <div className="text-xs text-gray-500">Tổng số</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.summarized}</div>
              <div className="text-xs text-gray-500">Đã tóm tắt</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.duplicates}</div>
              <div className="text-xs text-gray-500">Trùng lặp</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.suggestions}</div>
              <div className="text-xs text-gray-500">Đề xuất</div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 mt-4">
          <Button
            variant={activeTab === 'summarize' ? 'default' : 'outline'}
            onClick={() => setActiveTab('summarize')}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Tóm tắt
          </Button>
          <Button
            variant={activeTab === 'duplicates' ? 'default' : 'outline'}
            onClick={() => setActiveTab('duplicates')}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Trùng lặp ({stats.duplicates})
          </Button>
          <Button
            variant={activeTab === 'folders' ? 'default' : 'outline'}
            onClick={() => setActiveTab('folders')}
            className="flex items-center gap-2"
          >
            <FolderTree className="h-4 w-4" />
            Đề xuất thư mục
          </Button>
          <Button
            variant={activeTab === 'clusters' ? 'default' : 'outline'}
            onClick={() => setActiveTab('clusters')}
            className="flex items-center gap-2"
          >
            <Grid3X3 className="h-4 w-4" />
            Nhóm tương tự
          </Button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {/* Summarize Tab */}
        {activeTab === 'summarize' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    Tạo tóm tắt hàng loạt
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Sử dụng AI để tạo tóm tắt ngắn gọn cho tất cả tài liệu. 
                    Bao gồm: keywords, topics, language detection.
                  </p>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Tóm tắt ngắn (2-3 câu)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Tóm tắt chi tiết (5-8 câu)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Trích xuất keywords & topics</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Phát hiện ngôn ngữ tự động</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleBatchSummarize}
                  disabled={isProcessing}
                  size="lg"
                  className="ml-4"
                >
                  <PlayCircle className="h-5 w-5 mr-2" />
                  {isProcessing ? 'Đang xử lý...' : 'Bắt đầu'}
                </Button>
              </div>
              
              {isProcessing && progress > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Tiến trình</span>
                    <span>{progress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      data-progress={progress}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <BarChart3 className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900">Thống kê</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    {stats.summarized}/{stats.totalDocuments} tài liệu đã được tóm tắt (
                    {stats.totalDocuments > 0 
                      ? ((stats.summarized / stats.totalDocuments) * 100).toFixed(1) 
                      : 0}%)
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Duplicates Tab */}
        {activeTab === 'duplicates' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Copy className="h-5 w-5 text-red-600" />
                    Phát hiện trùng lặp
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Tìm và đánh dấu các file giống nhau để tiết kiệm dung lượng.
                  </p>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Hash-based: File hoàn toàn giống nhau</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Content-based: Nội dung tương tự (&gt;85%)</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleDetectDuplicates}
                  disabled={isProcessing}
                  size="lg"
                  className="ml-4 bg-red-600 hover:bg-red-700 text-white"
                >
                  <PlayCircle className="h-5 w-5 mr-2" />
                  Quét trùng lặp
                </Button>
              </div>
            </div>
            
            {/* Duplicate List */}
            {duplicateGroups.length > 0 && (
              <div className="space-y-3">
                {duplicateGroups.map((group, idx) => (
                  <div key={idx} className="bg-white rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{group.originalName}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          Gốc • {group.duplicates.length} bản sao
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 space-y-2">
                      {group.duplicates.map((dup, dupIdx) => (
                        <div
                          key={dupIdx}
                          className="flex items-center justify-between bg-red-50 border border-red-200 rounded p-3"
                        >
                          <div className="flex-1">
                            <div className="text-sm font-medium">{dup.name}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              Độ tương tự: {(dup.similarity * 100).toFixed(1)}%
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteDuplicate(dup.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Xóa
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {duplicateGroups.length === 0 && !isProcessing && (
              <div className="text-center py-12 bg-white rounded-lg border">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Chưa tìm thấy file trùng lặp</p>
                <p className="text-sm text-gray-400 mt-1">
                  Nhấn "Quét trùng lặp" để bắt đầu phân tích
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Folder Suggestions Tab */}
        {activeTab === 'folders' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FolderTree className="h-5 w-5 text-blue-600" />
                    Đề xuất thư mục thông minh
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    AI phân tích nội dung và đề xuất cấu trúc thư mục hợp lý.
                  </p>
                </div>
                <Button
                  onClick={handleSuggestFolders}
                  disabled={isProcessing}
                  size="lg"
                  className="ml-4"
                >
                  <PlayCircle className="h-5 w-5 mr-2" />
                  Phân tích
                </Button>
              </div>
            </div>
            
            {/* Folder Suggestions List */}
            {folderSuggestions.length > 0 && (
              <div className="space-y-3">
                {folderSuggestions.map((suggestion) => (
                  <div key={suggestion.id} className="bg-white rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <FolderTree className="h-5 w-5 text-blue-600" />
                          <div className="font-semibold text-lg">{suggestion.name}</div>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                            {suggestion.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          {suggestion.description}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          <span>📊 ~{suggestion.documentCount} tài liệu</span>
                          <span>✨ {(suggestion.confidence * 100).toFixed(0)}% tin cậy</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleApplyFolderSuggestion(suggestion)}
                        className="ml-4"
                      >
                        <MoveRight className="h-4 w-4 mr-1" />
                        Áp dụng
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Clusters Tab */}
        {activeTab === 'clusters' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border p-6 text-center py-12">
              <Grid3X3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Tính năng Clustering đang được phát triển</p>
              <p className="text-sm text-gray-400 mt-1">
                Sẽ có trong phiên bản tiếp theo
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationPanel;
