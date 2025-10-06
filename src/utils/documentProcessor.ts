// Document processing utilities - Docling-only architecture
// Uses IBM Docling exclusively for all document formats (PDF, DOCX, images)

import { chunkText } from './vectorUtils';
import { doclingService } from '../services/doclingService';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

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
 * Main document processor - Docling-only architecture
 * 
 * Processing Strategy:
 * - Uses IBM Docling exclusively for all document formats
 * - Enhanced table extraction (95%+ accuracy with TableFormer)
 * - Multi-engine OCR support (Vietnamese, English, 100+ languages)
 * - Formula to LaTeX conversion
 * - Code block recognition
 * - Supports: PDF, DOCX, XLSX, PPTX, Images, HTML
 * 
 * @param file - File object to process
 * @param fileName - Name of the file (for metadata)
 * @param onProgress - Progress callback function (0-100)
 * @param embeddingPipeline - HuggingFace embedding pipeline
 * @param chunkSize - Text chunk size in characters (default: 512)
 * @param chunkOverlap - Overlap between chunks in characters (default: 50)
 * @returns ProcessingResult with text, chunks, and metadata
 * 
 * @example
 * ```typescript
 * const result = await processDocument(file, 'contract.pdf', (progress) => {
 *   console.log(`Processing: ${progress}%`);
 * });
 * console.log(result.metadata.tableCount); // Number of tables extracted
 * console.log(result.metadata.confidence); // Confidence score (0-1)
 * ```
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
    let pageCount: number | undefined;
    let tableCount = 0;
    let confidence: number | undefined;
    const fileType = file.name.toLowerCase();
    
    // Special case: TXT files (read directly, no Docling needed)
    if (fileType.endsWith('.txt')) {
      if (onProgress) onProgress(20);
      text = await file.text();
      if (onProgress) onProgress(50);
    } 
    // All other formats: Use Docling
    else if (
      fileType.endsWith('.pdf') ||
      fileType.endsWith('.docx') ||
      fileType.endsWith('.doc') ||
      fileType.endsWith('.xlsx') ||
      fileType.endsWith('.pptx') ||
      fileType.match(/\.(jpg|jpeg|png|tiff|bmp)$/i)
    ) {
      if (onProgress) onProgress(10);
      
      // Save file to temp location
      const tempDir = os.tmpdir();
      const tempFilePath = path.join(tempDir, `qsm_${Date.now()}_${file.name}`);
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(tempFilePath, buffer);
      
      if (onProgress) onProgress(20);
      
      // Determine if OCR needed (scanned PDFs, images)
      const needsOCR = fileType.match(/\.(jpg|jpeg|png|tiff|bmp)$/i) !== null;
      
      // Process with Docling
      const doclingResult = await doclingService.processDocument(tempFilePath, {
        enableOcr: needsOCR,
        enableTables: true,
        ocrLanguages: ['en', 'vi'],
        outputFormat: 'markdown'
      });
      
      if (onProgress) onProgress(60);
      
      // Clean up temp file
      await fs.remove(tempFilePath);
      
      if (doclingResult.status === 'success' && doclingResult.content) {
        text = doclingResult.content;
        pageCount = doclingResult.metadata?.pages;
        tableCount = doclingResult.metadata?.table_count || 0;
        confidence = doclingResult.metadata?.confidence?.mean;
        
        // Include extracted tables in the text
        if (doclingResult.tables && doclingResult.tables.length > 0) {
          text += '\n\n## Extracted Tables\n\n';
          doclingResult.tables.forEach((table, idx) => {
            text += `\n### Table ${idx + 1}\n${table.markdown}\n`;
          });
        }
        
        console.log('✅ Docling processed:', {
          file: fileName,
          pages: pageCount,
          tables: tableCount,
          confidence: confidence,
          size: `${(text.length / 1024).toFixed(1)} KB`
        });
      } else {
        throw new Error(`Docling failed: ${doclingResult.error || 'Unknown error'}`);
      }
    } else {
      throw new Error(`Unsupported file type: ${file.name}. Supported: PDF, DOCX, XLSX, PPTX, TXT, Images`);
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
      for (let i = 0; i < chunks.length; i++) {
        try {
          const embedding = await embeddingPipeline(chunks[i], { 
            pooling: 'mean', 
            normalize: true 
          });
          embeddings.push(embedding.data);
          
          if (onProgress) {
            const progress = 60 + ((i + 1) / chunks.length) * 40;
            onProgress(progress);
          }
        } catch (error) {
          console.error(`Error generating embedding for chunk ${i}:`, error);
        }
      }
      
      // Store embeddings in vector database (would be done via IPC in production)
      console.log(`Generated ${embeddings.length} embeddings for ${fileName}`);
    }
    
    if (onProgress) onProgress(100);
    
    // Count words
    const wordCount = text.split(/\s+/).length;
    
    return {
      text,
      chunks: chunks.length,
      metadata: {
        wordCount,
        fileName,
        pageCount,
        tableCount,
        confidence
      }
    };
  } catch (error) {
    console.error('Error processing document:', error);
    throw error;
  }
}
