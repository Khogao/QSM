// Document processing utilities for PDF, DOCX, TXT files

import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { chunkText } from './vectorUtils';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ProcessingResult {
  text: string;
  chunks: number;
  metadata: {
    pageCount?: number;
    wordCount: number;
    fileName: string;
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

// Main document processor
export async function processDocument(
  file: File,
  folderId: string,
  fileName: string,
  onProgress?: (progress: number) => void,
  embeddingPipeline?: any,
  chunkSize: number = 512,
  chunkOverlap: number = 50
): Promise<ProcessingResult> {
  try {
    let text = '';
    const fileType = file.name.toLowerCase();
    
    // Extract text based on file type
    if (fileType.endsWith('.pdf')) {
      text = await extractTextFromPDF(file, (progress) => {
        if (onProgress) onProgress(progress * 0.5); // First 50% for extraction
      });
    } else if (fileType.endsWith('.docx')) {
      text = await extractTextFromDOCX(file, (progress) => {
        if (onProgress) onProgress(progress * 0.5);
      });
    } else if (fileType.endsWith('.txt')) {
      text = await extractTextFromTXT(file, (progress) => {
        if (onProgress) onProgress(progress * 0.5);
      });
    } else if (fileType.endsWith('.doc')) {
      // For .doc files, show warning but try DOCX parser
      console.warn('Legacy .doc format detected, attempting DOCX parser');
      text = await extractTextFromDOCX(file, (progress) => {
        if (onProgress) onProgress(progress * 0.5);
      });
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
    
    return {
      text,
      chunks: chunks.length,
      metadata: {
        wordCount,
        fileName,
        pageCount: fileType.endsWith('.pdf') ? undefined : undefined
      }
    };
  } catch (error) {
    console.error('Error processing document:', error);
    throw error;
  }
}
