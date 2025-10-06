// Document processing utilities for PDF, DOCX, TXT files
// Uses IBM Docling for enhanced PDF/DOCX processing with table extraction

import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { chunkText } from './vectorUtils';
import { doclingService } from '../services/doclingService';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

// Configure PDF.js worker (fallback only)
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ProcessingResult {
  text: string;
  chunks: number;
  metadata: {
    pageCount?: number;
    wordCount: number;
    fileName: string;
    tableCount?: number;
    processingMethod?: 'docling' | 'legacy';
  };
}

// Extract text from PDF
export async function extractTextFromPDF(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    const totalPages = pdf.numPages;
    
    for (let i = 1; i <= totalPages; i++) {
      if (onProgress) {
        onProgress((i / totalPages) * 100);
      }
      
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n\n';
    }
    
    return fullText;
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error(`Failed to extract PDF text: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Extract text from DOCX
export async function extractTextFromDOCX(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    if (onProgress) onProgress(20);
    
    const arrayBuffer = await file.arrayBuffer();
    
    if (onProgress) onProgress(50);
    
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    if (onProgress) onProgress(100);
    
    return result.value;
  } catch (error) {
    console.error('Error extracting DOCX text:', error);
    throw new Error(`Failed to extract DOCX text: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Extract text from TXT
export async function extractTextFromTXT(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    if (onProgress) onProgress(50);
    
    const text = await file.text();
    
    if (onProgress) onProgress(100);
    
    return text;
  } catch (error) {
    console.error('Error reading TXT file:', error);
    throw new Error(`Failed to read TXT file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Main document processor with Docling-first, legacy-fallback strategy
 * 
 * Processing Strategy:
 * 1. Try IBM Docling first (if available) for PDF/DOCX files
 *    - Enhanced table extraction (95%+ accuracy with TableFormer)
 *    - Multi-engine OCR support (Vietnamese, English, etc.)
 *    - Formula to LaTeX conversion
 *    - Code block recognition
 * 
 * 2. Fallback to legacy parsers if:
 *    - Docling not installed (Python/pip dependencies missing)
 *    - Docling processing fails
 *    - User preference set to "Legacy Only" (future feature)
 * 
 * 3. Always use legacy for TXT files (no Docling needed)
 * 
 * @param file - File object to process (PDF, DOCX, TXT)
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
 * console.log(result.metadata.processingMethod); // 'docling' or 'legacy'
 * console.log(result.metadata.tableCount); // Number of tables extracted (Docling only)
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
    const fileType = file.name.toLowerCase();
    
    // Try Docling first for PDF/DOCX (enhanced extraction with tables)
    if (fileType.endsWith('.pdf') || fileType.endsWith('.docx')) {
      try {
        if (onProgress) onProgress(10);
        
        // Save file to temp location
        const tempDir = os.tmpdir();
        const tempFilePath = path.join(tempDir, `qsm_${Date.now()}_${file.name}`);
        const buffer = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(tempFilePath, buffer);
        
        if (onProgress) onProgress(20);
        
        // Process with Docling
        const doclingResult = await doclingService.processDocument(tempFilePath, {
          enableOcr: true,
          enableTables: true,
          ocrLanguages: ['en', 'vi'],
          outputFormat: 'markdown'
        });
        
        if (onProgress) onProgress(40);
        
        // Clean up temp file
        await fs.remove(tempFilePath);
        
        if (doclingResult.status === 'success' && doclingResult.content) {
          text = doclingResult.content;
          
          // Include extracted tables in the text
          if (doclingResult.tables && doclingResult.tables.length > 0) {
            text += '\n\n## Extracted Tables\n\n';
            doclingResult.tables.forEach((table, idx) => {
              text += `\n### Table ${idx + 1}\n${table.markdown}\n`;
            });
          }
          
          pageCount = doclingResult.metadata?.pages;
          console.log('✅ Docling processed successfully:', {
            pages: pageCount,
            tables: doclingResult.tables?.length || 0,
            confidence: doclingResult.metadata?.confidence
          });
        } else {
          throw new Error('Docling processing failed, falling back to legacy parser');
        }
      } catch (doclingError) {
        console.warn('Docling not available or failed, using fallback parser:', doclingError);
        
        // Fallback to legacy parsers
        if (fileType.endsWith('.pdf')) {
          text = await extractTextFromPDF(file, (progress) => {
            if (onProgress) onProgress(progress * 0.5);
          });
        } else if (fileType.endsWith('.docx')) {
          text = await extractTextFromDOCX(file, (progress) => {
            if (onProgress) onProgress(progress * 0.5);
          });
        }
      }
    } else if (fileType.endsWith('.txt')) {
      text = await extractTextFromTXT(file, (progress) => {
        if (onProgress) onProgress(progress * 0.5);
      });
    } else if (fileType.endsWith('.doc')) {
      // For .doc files, try Docling first, then fallback
      console.warn('Legacy .doc format detected, attempting parsers');
      try {
        text = await extractTextFromDOCX(file, (progress) => {
          if (onProgress) onProgress(progress * 0.5);
        });
      } catch {
        throw new Error('Failed to process .doc file. Please convert to .docx format.');
      }
    } else {
      throw new Error(`Unsupported file type: ${file.name}`);
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
    
    // Detect if Docling was used (presence of pageCount means Docling succeeded)
    const processingMethod = pageCount !== undefined ? 'docling' : 'legacy';
    
    return {
      text,
      chunks: chunks.length,
      metadata: {
        wordCount,
        fileName,
        pageCount,
        processingMethod
      }
    };
  } catch (error) {
    console.error('Error processing document:', error);
    throw error;
  }
}
