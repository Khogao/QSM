/**
 * QSM - Document Organization Service
 * 
 * Features:
 * 1. Summarization: Generate summaries for documents
 * 2. Smart Grouping: Cluster similar documents
 * 3. Deduplication: Find and mark duplicate files
 * 4. Auto-organization: Suggest folder structure and auto-move
 */

import crypto from 'crypto';
import fs from 'fs-extra';
import path from 'path';

export interface DocumentSummary {
  documentId: string;
  fileName: string;
  shortSummary: string; // 2-3 sentences
  fullSummary: string; // Detailed summary
  keywords: string[]; // Extracted keywords
  topics: string[]; // Detected topics
  language: string;
}

export interface DocumentCluster {
  id: number;
  name: string;
  type: 'content' | 'date' | 'type' | 'custom';
  description: string;
  suggestedFolder: string;
  documentCount: number;
  avgSimilarity: number;
}

export interface DuplicateInfo {
  originalId: string;
  duplicateId: string;
  detectionType: 'hash' | 'content' | 'fuzzy';
  similarityScore: number;
  hashMatch: boolean;
  contentMatch: boolean;
  sizeDiff: number;
}

export interface FolderSuggestion {
  folderPath: string;
  folderName: string;
  description: string;
  category: string;
  confidence: number;
  documentCount: number;
}

export class OrganizationService {
  private db: any; // SQLite database instance
  
  constructor(db: any) {
    this.db = db;
  }
  
  /**
   * Generate file hash for deduplication
   */
  async generateFileHash(filePath: string): Promise<string> {
    const buffer = await fs.readFile(filePath);
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }
  
  /**
   * Generate summary for a document using LLM
   */
  async generateSummary(
    documentId: string,
    content: string,
    fileName: string,
    callModel: (prompt: string) => Promise<string | null>
  ): Promise<DocumentSummary> {
    // Truncate content if too long (max 8000 chars for LLM)
    const truncatedContent = content.length > 8000 
      ? content.substring(0, 8000) + '...' 
      : content;
    
    const prompt = `Phân tích và tóm tắt tài liệu sau:

Tên file: ${fileName}

Nội dung:
${truncatedContent}

Yêu cầu:
1. Tóm tắt ngắn (2-3 câu): Tóm tắt chính của tài liệu
2. Tóm tắt chi tiết (5-8 câu): Mô tả chi tiết nội dung
3. Từ khóa: 5-10 từ khóa quan trọng (cách nhau bởi dấu phẩy)
4. Chủ đề: 2-5 chủ đề chính (cách nhau bởi dấu phẩy)
5. Ngôn ngữ: Phát hiện ngôn ngữ chính (vi, en, fr, etc.)

Định dạng trả về (JSON):
{
  "short_summary": "...",
  "full_summary": "...",
  "keywords": ["...", "..."],
  "topics": ["...", "..."],
  "language": "vi"
}`;

    try {
      const response = await callModel(prompt);
      if (!response) {
        throw new Error('No response from LLM');
      }
      
      // Parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from LLM');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      const summary: DocumentSummary = {
        documentId,
        fileName,
        shortSummary: parsed.short_summary || '',
        fullSummary: parsed.full_summary || '',
        keywords: parsed.keywords || [],
        topics: parsed.topics || [],
        language: parsed.language || 'unknown'
      };
      
      // Store in database
      await this.saveSummary(summary);
      
      return summary;
    } catch (error) {
      console.error('Error generating summary:', error);
      
      // Fallback: Basic extraction
      const words = content.split(/\s+/).slice(0, 100).join(' ');
      const summary: DocumentSummary = {
        documentId,
        fileName,
        shortSummary: words.substring(0, 200) + '...',
        fullSummary: words,
        keywords: [],
        topics: [],
        language: 'unknown'
      };
      
      await this.saveSummary(summary);
      return summary;
    }
  }
  
  /**
   * Save summary to database
   */
  private async saveSummary(summary: DocumentSummary): Promise<void> {
    await this.db.run(`
      INSERT OR REPLACE INTO document_summaries (
        document_id, file_name, short_summary, full_summary,
        keywords, topics, language, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [
      summary.documentId,
      summary.fileName,
      summary.shortSummary,
      summary.fullSummary,
      JSON.stringify(summary.keywords),
      JSON.stringify(summary.topics),
      summary.language
    ]);
  }
  
  /**
   * Find duplicate documents by hash
   */
  async findDuplicatesByHash(documentId: string, fileHash: string): Promise<DuplicateInfo[]> {
    const duplicates = await this.db.all(`
      SELECT DISTINCT
        s1.document_id as original_id,
        s2.document_id as duplicate_id,
        s1.file_size,
        s2.file_size as dup_size,
        s1.file_name as original_name,
        s2.file_name as duplicate_name
      FROM document_summaries s1
      JOIN document_summaries s2 ON s1.file_hash = s2.file_hash
      WHERE s1.file_hash = ?
        AND s1.document_id != s2.document_id
        AND s1.document_id = ?
    `, [fileHash, documentId]);
    
    return duplicates.map((dup: any) => ({
      originalId: dup.original_id,
      duplicateId: dup.duplicate_id,
      detectionType: 'hash' as const,
      similarityScore: 1.0, // Exact match
      hashMatch: true,
      contentMatch: true,
      sizeDiff: Math.abs(dup.file_size - dup.dup_size)
    }));
  }
  
  /**
   * Find similar documents by content (embedding similarity)
   */
  async findSimilarDocuments(
    documentId: string,
    embedding: number[],
    threshold: number = 0.85
  ): Promise<DuplicateInfo[]> {
    // Get all document embeddings from vector database
    // Calculate cosine similarity
    // Return documents above threshold
    
    // TODO: Implement with actual vector database
    // For now, return empty array
    return [];
  }
  
  /**
   * Cluster documents by content similarity
   */
  async clusterDocuments(
    documentIds: string[],
    embeddings: Map<string, number[]>,
    numClusters: number = 5
  ): Promise<DocumentCluster[]> {
    // Implement K-means or hierarchical clustering
    // Group similar documents together
    
    // TODO: Implement clustering algorithm
    // For now, return empty array
    return [];
  }
  
  /**
   * Suggest folder structure based on document analysis
   */
  async suggestFolders(
    documentIds: string[],
    callModel: (prompt: string) => Promise<string | null>
  ): Promise<FolderSuggestion[]> {
    // Get summaries for all documents
    const summaries = await this.db.all(`
      SELECT document_id, file_name, short_summary, topics, keywords
      FROM document_summaries
      WHERE document_id IN (${documentIds.map(() => '?').join(',')})
    `, documentIds);
    
    // Prepare prompt for LLM
    const summaryText = summaries.map((s: any) => 
      `- ${s.file_name}: ${s.short_summary} (Topics: ${s.topics})`
    ).join('\n');
    
    const prompt = `Phân tích danh sách tài liệu sau và đề xuất cấu trúc thư mục hợp lý:

Tài liệu (${summaries.length} files):
${summaryText}

Yêu cầu:
1. Đề xuất 3-7 thư mục chính để tổ chức
2. Mỗi thư mục phải có tên rõ ràng và mô tả ngắn gọn
3. Phân loại theo: chủ đề, dự án, ngày tháng, hoặc mục đích sử dụng
4. Ước tính số lượng file cho mỗi thư mục

Định dạng trả về (JSON array):
[
  {
    "folder_name": "Tên thư mục",
    "description": "Mô tả mục đích",
    "category": "project|archive|reference|work|personal",
    "confidence": 0.85,
    "estimated_docs": 10
  }
]`;

    try {
      const response = await callModel(prompt);
      if (!response) return [];
      
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return [];
      
      const suggestions = JSON.parse(jsonMatch[0]);
      
      // Store suggestions in database
      for (const sug of suggestions) {
        await this.db.run(`
          INSERT INTO folder_suggestions (
            folder_path, folder_name, description, category,
            confidence_score, document_count, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `, [
          `/${sug.folder_name}`,
          sug.folder_name,
          sug.description,
          sug.category,
          sug.confidence,
          sug.estimated_docs
        ]);
      }
      
      return suggestions.map((s: any) => ({
        folderPath: `/${s.folder_name}`,
        folderName: s.folder_name,
        description: s.description,
        category: s.category,
        confidence: s.confidence,
        documentCount: s.estimated_docs
      }));
    } catch (error) {
      console.error('Error suggesting folders:', error);
      return [];
    }
  }
  
  /**
   * Batch summarize all documents in folder
   */
  async batchSummarize(
    documents: Array<{ id: string; name: string; content: string }>,
    callModel: (prompt: string) => Promise<string | null>,
    onProgress?: (current: number, total: number) => void
  ): Promise<DocumentSummary[]> {
    const summaries: DocumentSummary[] = [];
    
    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      try {
        const summary = await this.generateSummary(
          doc.id,
          doc.content,
          doc.name,
          callModel
        );
        summaries.push(summary);
        
        if (onProgress) {
          onProgress(i + 1, documents.length);
        }
      } catch (error) {
        console.error(`Error summarizing ${doc.name}:`, error);
      }
    }
    
    return summaries;
  }
  
  /**
   * Batch detect duplicates
   */
  async batchDetectDuplicates(
    documents: Array<{ id: string; filePath: string }>
  ): Promise<DuplicateInfo[]> {
    const allDuplicates: DuplicateInfo[] = [];
    const hashMap = new Map<string, string[]>(); // hash -> [documentIds]
    
    // Calculate hashes
    for (const doc of documents) {
      try {
        const hash = await this.generateFileHash(doc.filePath);
        
        // Update summary with hash
        await this.db.run(`
          UPDATE document_summaries
          SET file_hash = ?
          WHERE document_id = ?
        `, [hash, doc.id]);
        
        // Track hash collisions
        if (!hashMap.has(hash)) {
          hashMap.set(hash, []);
        }
        hashMap.get(hash)!.push(doc.id);
      } catch (error) {
        console.error(`Error hashing ${doc.filePath}:`, error);
      }
    }
    
    // Find duplicates (hash collisions)
    for (const [hash, docIds] of hashMap.entries()) {
      if (docIds.length > 1) {
        // Mark as duplicates
        const original = docIds[0];
        for (let i = 1; i < docIds.length; i++) {
          const duplicate = docIds[i];
          
          const duplicateInfo: DuplicateInfo = {
            originalId: original,
            duplicateId: duplicate,
            detectionType: 'hash',
            similarityScore: 1.0,
            hashMatch: true,
            contentMatch: true,
            sizeDiff: 0
          };
          
          allDuplicates.push(duplicateInfo);
          
          // Store in database
          await this.db.run(`
            INSERT OR IGNORE INTO document_duplicates (
              original_id, duplicate_id, detection_type,
              similarity_score, hash_match, content_match, size_diff
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [
            original, duplicate, 'hash', 1.0, 1, 1, 0
          ]);
        }
      }
    }
    
    return allDuplicates;
  }
  
  /**
   * Get organization statistics
   */
  async getStats(): Promise<{
    totalDocuments: number;
    summarized: number;
    duplicates: number;
    clusters: number;
    suggestions: number;
  }> {
    const stats = await this.db.get(`
      SELECT
        (SELECT COUNT(*) FROM documents) as total_documents,
        (SELECT COUNT(*) FROM document_summaries) as summarized,
        (SELECT COUNT(*) FROM document_duplicates WHERE status = 'pending') as duplicates,
        (SELECT COUNT(*) FROM document_clusters) as clusters,
        (SELECT COUNT(*) FROM folder_suggestions WHERE status = 'suggested') as suggestions
    `);
    
    return {
      totalDocuments: stats.total_documents || 0,
      summarized: stats.summarized || 0,
      duplicates: stats.duplicates || 0,
      clusters: stats.clusters || 0,
      suggestions: stats.suggestions || 0
    };
  }
}

export default OrganizationService;
