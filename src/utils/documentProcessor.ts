// Document processing utilities - SIMPLIFIED BROWSER VERSION
// Basic text extraction - works in Electron renderer without Node.js APIs

import { chunkText } from './vectorUtils';

export interface ProcessingResult {
  text: string;
  chunks: number;
  metadata: {
    pageCount?: number;
    wordCount: number;
    fileName: string;
    tableCount?: number;
    confidence?: number;
  };
}

/**
 * Simplified document processor - Browser-compatible
 * Supports TXT files directly, other formats via Electron IPC (future)
 */
export async function processDocument(
  file: File,
  fileName: string,
  onProgress?: (progress: number) => void,
  embeddingPipeline?: any,
  chunkSize: number = 512,
  chunkOverlap: number = 50
): Promise<ProcessingResult> {
  try {
    let text = '';
    const fileType = file.name.toLowerCase();
    
    // TXT files - read directly
    if (fileType.endsWith('.txt')) {
      if (onProgress) onProgress(20);
      text = await file.text();
      if (onProgress) onProgress(50);
    }
    // PDF/DOCX - Use browser FileReader API (basic extraction)
    else if (fileType.endsWith('.pdf') || fileType.endsWith('.docx')) {
      if (onProgress) onProgress(20);
      
      // For now, extract as text (basic - no tables/formatting)
      // TODO: Use Electron IPC to call main process for advanced processing
      const arrayBuffer = await file.arrayBuffer();
      const textDecoder = new TextDecoder('utf-8');
      text = textDecoder.decode(arrayBuffer);
      
      // Clean up binary junk (PDF/DOCX have binary data)
      text = text.replace(/[^\x20-\x7E\n\r\t\u00A0-\uFFFF]/g, ' ');
      text = text.replace(/\s+/g, ' ');
      
      if (onProgress) onProgress(50);
      
      console.warn('⚠️ Basic text extraction - tables/formatting may be lost');
      console.warn('💡 For better results, process documents via Electron main process');
    }
    else {
      throw new Error(`Unsupported file type: ${file.name}. Currently supported: TXT, PDF (basic), DOCX (basic)`);
    }
    
    // Clean up text
    text = text.trim();
    
    if (!text || text.length === 0) {
      throw new Error('No text extracted from document');
    }
    
    // Split into chunks
    const chunks = chunkText(text, chunkSize, chunkOverlap);
    
    if (onProgress) onProgress(60);
    
    // Generate embeddings if pipeline available
    if (embeddingPipeline) {
      const embeddings = [];
      const batchSize = 10;
      
      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        const batchEmbeddings = await Promise.all(
          batch.map(chunk => embeddingPipeline(chunk))
        );
        embeddings.push(...batchEmbeddings);
        
        const progress = 60 + Math.floor((i / chunks.length) * 30);
        if (onProgress) onProgress(progress);
      }
      
      if (onProgress) onProgress(90);
    }
    
    // Calculate statistics
    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    const pageCount = Math.ceil(text.length / 3000); // Rough estimate
    
    if (onProgress) onProgress(100);
    
    return {
      text,
      chunks: chunks.length,
      metadata: {
        fileName,
        wordCount,
        pageCount,
        tableCount: 0,
        confidence: 0.8
      }
    };
  } catch (error) {
    console.error('❌ Document processing error:', error);
    throw error;
  }
}

/**
 * Extract text from various file types - SIMPLIFIED
 */
export async function extractText(file: File): Promise<string> {
  const fileType = file.name.toLowerCase();
  
  if (fileType.endsWith('.txt')) {
    return await file.text();
  }
  
  if (fileType.endsWith('.pdf') || fileType.endsWith('.docx')) {
    const arrayBuffer = await file.arrayBuffer();
    const textDecoder = new TextDecoder('utf-8');
    let text = textDecoder.decode(arrayBuffer);
    
    // Clean binary junk
    text = text.replace(/[^\x20-\x7E\n\r\t\u00A0-\uFFFF]/g, ' ');
    text = text.replace(/\s+/g, ' ');
    
    return text.trim();
  }
  
  throw new Error(`Unsupported file type: ${file.name}`);
}
