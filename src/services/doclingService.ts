/**
 * QSM - QueryMaster: Docling Service
 * 
 * TypeScript service to interface with IBM Docling Python processor.
 * Handles document processing with advanced features:
 * - Table structure recognition (TableFormer)
 * - OCR for scanned documents
 * - Formula to LaTeX conversion
 * - Code block recognition
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs-extra';

export interface DoclingOptions {
  enableOcr?: boolean;
  enableTables?: boolean;
  enableFormulas?: boolean;
  enableCode?: boolean;
  ocrLanguages?: string[];
  outputFormat?: 'markdown' | 'json' | 'html';
  forceOcr?: boolean;
}

export interface DoclingTable {
  index: number;
  markdown: string;
  html: string;
  rows: number;
  cols: number;
  error?: string;
}

export interface DoclingMetadata {
  pages: number;
  has_tables: boolean;
  table_count: number;
  confidence: {
    mean: number;
    low: number;
  };
  processing_time: number;
  file_size: number;
}

export interface DoclingResult {
  status: 'success' | 'error';
  content?: string;
  tables?: DoclingTable[];
  metadata?: DoclingMetadata;
  features?: {
    ocr_enabled: boolean;
    tables_enabled: boolean;
    formulas_enabled: boolean;
    code_enabled: boolean;
  };
  error?: string;
  error_type?: string;
}

export class DoclingService {
  private pythonPath: string;
  private scriptPath: string;
  private isAvailable: boolean = false;

  constructor() {
    // Detect Python interpreter
    this.pythonPath = this.detectPython();
    this.scriptPath = path.join(__dirname, '../../python/docling_processor.py');
  }

  /**
   * Detect Python interpreter on system
   */
  private detectPython(): string {
    // For now, use 'python' and let user configure if needed
    // Future: Could check PATH for python3, py, etc.
    return 'python';
  }

  /**
   * Check if Docling is available
   */
  async checkAvailability(): Promise<boolean> {
    try {
      // Check if Python script exists
      const scriptExists = await fs.pathExists(this.scriptPath);
      if (!scriptExists) {
        console.warn('Docling Python script not found:', this.scriptPath);
        this.isAvailable = false;
        return false;
      }

      // Try to import docling in Python
      const testResult = await this.runPythonCommand([
        '-c',
        'import docling; print("OK")'
      ]);

      this.isAvailable = testResult.trim() === 'OK';
      return this.isAvailable;
    } catch (error) {
      console.warn('Docling not available:', error);
      this.isAvailable = false;
      return false;
    }
  }

  /**
   * Run Python command and return output
   */
  private runPythonCommand(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const process = spawn(this.pythonPath, args);

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python process exited with code ${code}: ${stderr}`));
          return;
        }
        resolve(stdout);
      });

      process.on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * Process a document using Docling
   */
  async processDocument(
    filePath: string,
    options: DoclingOptions = {}
  ): Promise<DoclingResult> {
    // Check if file exists
    const fileExists = await fs.pathExists(filePath);
    if (!fileExists) {
      return {
        status: 'error',
        error: `File not found: ${filePath}`,
        error_type: 'FileNotFoundError'
      };
    }

    // Check Docling availability
    if (!this.isAvailable) {
      const available = await this.checkAvailability();
      if (!available) {
        return {
          status: 'error',
          error: 'Docling is not available. Please install: pip install docling',
          error_type: 'DoclingNotAvailableError'
        };
      }
    }

    // Build command arguments
    const args = [
      this.scriptPath,
      filePath,
      '--output-format', options.outputFormat || 'markdown'
    ];

    if (options.enableOcr) {
      args.push('--enable-ocr');
    }

    if (options.enableTables !== false) {
      args.push('--enable-tables');
    }

    if (options.enableFormulas) {
      args.push('--enable-formulas');
    }

    if (options.enableCode) {
      args.push('--enable-code');
    }

    if (options.forceOcr) {
      args.push('--force-ocr');
    }

    if (options.ocrLanguages && options.ocrLanguages.length > 0) {
      args.push('--ocr-lang', options.ocrLanguages.join(','));
    }

    try {
      // Run Python script
      const output = await this.runPythonCommand(args);

      // Parse JSON output
      const result: DoclingResult = JSON.parse(output);

      return result;
    } catch (error: any) {
      return {
        status: 'error',
        error: error.message || 'Unknown error',
        error_type: error.name || 'UnknownError'
      };
    }
  }

  /**
   * Process document with automatic feature detection
   */
  async processDocumentAuto(filePath: string): Promise<DoclingResult> {
    // Detect if document is scanned (heuristic: check file size vs page count)
    const fileExt = path.extname(filePath).toLowerCase();
    
    const options: DoclingOptions = {
      enableTables: true,
      outputFormat: 'markdown'
    };

    // Enable OCR for images and potentially scanned PDFs
    if (['.png', '.jpg', '.jpeg', '.tiff', '.bmp'].includes(fileExt)) {
      options.enableOcr = true;
      options.ocrLanguages = ['en', 'vi'];
    }

    return this.processDocument(filePath, options);
  }

  /**
   * Batch process multiple documents
   */
  async processDocuments(
    filePaths: string[],
    options: DoclingOptions = {}
  ): Promise<DoclingResult[]> {
    const results: DoclingResult[] = [];

    for (const filePath of filePaths) {
      try {
        const result = await this.processDocument(filePath, options);
        results.push(result);
      } catch (error: any) {
        results.push({
          status: 'error',
          error: error.message,
          error_type: 'ProcessingError'
        });
      }
    }

    return results;
  }
}

// Export singleton instance
export const doclingService = new DoclingService();
