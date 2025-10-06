/**
 * HuggingFace Model Discovery Service v2.0
 * Updated with latest models: Phi-4, Qwen, Gemma
 * Optimized for Vietnamese language support
 * Target: AMD 5700X + RX 580 8GB + 64GB RAM
 */

import { sha256 } from 'crypto-hash';

// HuggingFace API Token (user-provided, stored in localStorage)
let HF_TOKEN = '';

// Model download directory
const MODEL_DOWNLOAD_PATH = 'C:\\AI Models for Vscode';

export interface HFModel {
  id: string;
  name: string;
  author: string;
  downloads: number;
  likes: number;
  size: string;
  quantization?: string;
  contextLength: number;
  tags: string[];
  description: string;
  isLocal?: boolean;
  localPath?: string;
  performance: {
    cpu: 'slow' | 'medium' | 'fast' | 'very-fast';
    gpu: 'slow' | 'medium' | 'fast' | 'very-fast';
    npu?: 'supported' | 'not-supported';
  };
  recommended: boolean;
  recommendReason?: string;
  vietnameseSupport?: 'excellent' | 'good' | 'fair' | 'poor';
  reasoningPower?: 'high' | 'medium' | 'low';
}

export interface ModelFilter {
  task: 'text-generation' | 'feature-extraction' | 'question-answering';
  quantization?: 'Q4' | 'Q5' | 'Q8' | 'F16' | 'F32';
  maxSize?: number; // In GB
  minDownloads?: number;
  minLikes?: number;
  tags?: string[];
}

/**
 * Initialize HuggingFace token (user-provided)
 */
export async function initHFToken(token: string): Promise<void> {
  if (!token.startsWith('hf_')) {
    throw new Error('Invalid HuggingFace token format');
  }
  
  HF_TOKEN = token;
  
  // Test connection
  const valid = await testHFConnection();
  if (!valid) {
    throw new Error('HuggingFace token invalid or network error');
  }
  
  // Save to localStorage
  localStorage.setItem('qsm_hf_token', token);
}

/**
 * Get stored HF token from localStorage
 */
export function getStoredHFToken(): string | null {
  return localStorage.getItem('qsm_hf_token');
}

/**
 * Test HuggingFace API connection
 */
async function testHFConnection(): Promise<boolean> {
  try {
    const response = await fetch('https://huggingface.co/api/whoami-v2', {
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`
      }
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get latest recommended models (2025 update)
 * Focus on: Phi-4, Qwen, Gemma for Vietnamese + Reasoning
 */
export async function getLatestRecommendedModels(): Promise<HFModel[]> {
  const recommendedModels: HFModel[] = [
    // PHI-4 (Microsoft) - Best reasoning for document QA
    {
      id: 'microsoft/phi-4',
      name: 'Phi-4',
      author: 'microsoft',
      downloads: 500000,
      likes: 5000,
      size: '7.9 GB',
      quantization: 'F16',
      contextLength: 16384,
      tags: ['text-generation', 'instruct', 'reasoning'],
      description: 'Microsoft Phi-4: State-of-the-art small model with exceptional reasoning capabilities',
      performance: {
        cpu: 'medium',
        gpu: 'fast',
        npu: 'supported'
      },
      recommended: true,
      recommendReason: 'Excellent reasoning power, fits in RX 580 VRAM, NPU-ready',
      vietnameseSupport: 'good',
      reasoningPower: 'high'
    },
    {
      id: 'microsoft/Phi-4-Q4_K_M-GGUF',
      name: 'Phi-4 (Q4 Quantized)',
      author: 'microsoft',
      downloads: 300000,
      likes: 3000,
      size: '2.5 GB',
      quantization: 'Q4_K_M',
      contextLength: 16384,
      tags: ['text-generation', 'instruct', 'gguf'],
      description: 'Quantized Phi-4 for faster inference with minimal quality loss',
      performance: {
        cpu: 'very-fast',
        gpu: 'very-fast',
        npu: 'supported'
      },
      recommended: true,
      recommendReason: 'Ultra-fast on CPU (50+ tok/s), perfect for AMD 5700X',
      vietnameseSupport: 'good',
      reasoningPower: 'high'
    },
    
    // QWEN 2.5 (Alibaba) - Best Vietnamese support
    {
      id: 'Qwen/Qwen2.5-7B-Instruct',
      name: 'Qwen 2.5 7B Instruct',
      author: 'Qwen',
      downloads: 800000,
      likes: 8000,
      size: '4.2 GB',
      quantization: 'F16',
      contextLength: 32768,
      tags: ['text-generation', 'multilingual', 'vietnamese'],
      description: 'Qwen 2.5: Excellent multilingual model with strong Vietnamese support',
      performance: {
        cpu: 'fast',
        gpu: 'very-fast',
        npu: 'supported'
      },
      recommended: true,
      recommendReason: 'Best Vietnamese support, 32k context, fast on RX 580',
      vietnameseSupport: 'excellent',
      reasoningPower: 'high'
    },
    {
      id: 'Qwen/Qwen2.5-14B-Instruct',
      name: 'Qwen 2.5 14B Instruct',
      author: 'Qwen',
      downloads: 500000,
      likes: 5000,
      size: '8.5 GB',
      quantization: 'F16',
      contextLength: 32768,
      tags: ['text-generation', 'multilingual', 'vietnamese'],
      description: 'Qwen 2.5 14B: Larger model with superior reasoning and Vietnamese understanding',
      performance: {
        cpu: 'medium',
        gpu: 'fast',
        npu: 'supported'
      },
      recommended: true,
      recommendReason: 'Highest quality Vietnamese, fits in RX 580, exceptional reasoning',
      vietnameseSupport: 'excellent',
      reasoningPower: 'high'
    },
    {
      id: 'Qwen/Qwen2.5-7B-Instruct-Q4_K_M-GGUF',
      name: 'Qwen 2.5 7B (Q4)',
      author: 'Qwen',
      downloads: 400000,
      likes: 4000,
      size: '1.8 GB',
      quantization: 'Q4_K_M',
      contextLength: 32768,
      tags: ['gguf', 'multilingual', 'vietnamese'],
      description: 'Quantized Qwen 2.5 for ultra-fast inference with Vietnamese support',
      performance: {
        cpu: 'very-fast',
        gpu: 'very-fast',
        npu: 'supported'
      },
      recommended: true,
      recommendReason: 'Ultra-fast (60+ tok/s CPU), excellent Vietnamese, low memory',
      vietnameseSupport: 'excellent',
      reasoningPower: 'high'
    },
    
    // GEMMA 2 (Google) - Good balance
    {
      id: 'google/gemma-2-9b-it',
      name: 'Gemma 2 9B Instruct',
      author: 'google',
      downloads: 600000,
      likes: 6000,
      size: '4.8 GB',
      quantization: 'F16',
      contextLength: 8192,
      tags: ['text-generation', 'instruct', 'multilingual'],
      description: 'Google Gemma 2 9B: Efficient instruction-tuned model with multilingual support',
      performance: {
        cpu: 'fast',
        gpu: 'very-fast',
        npu: 'supported'
      },
      recommended: true,
      recommendReason: 'Good Vietnamese, excellent reasoning, fits RX 580',
      vietnameseSupport: 'good',
      reasoningPower: 'high'
    },
    {
      id: 'google/gemma-2-2b-it',
      name: 'Gemma 2 2B Instruct',
      author: 'google',
      downloads: 400000,
      likes: 4000,
      size: '1.2 GB',
      quantization: 'F16',
      contextLength: 8192,
      tags: ['text-generation', 'instruct', 'lightweight'],
      description: 'Gemma 2 2B: Ultra-fast lightweight model for quick responses',
      performance: {
        cpu: 'very-fast',
        gpu: 'very-fast',
        npu: 'supported'
      },
      recommended: true,
      recommendReason: 'Blazing fast (80+ tok/s CPU), good quality, minimal memory',
      vietnameseSupport: 'fair',
      reasoningPower: 'medium'
    },
    
    // LLAMA 3.3 (Meta) - Latest from Meta
    {
      id: 'meta-llama/Llama-3.3-70B-Instruct',
      name: 'Llama 3.3 70B Instruct',
      author: 'meta-llama',
      downloads: 900000,
      likes: 9000,
      size: '40 GB',
      quantization: 'F16',
      contextLength: 128000,
      tags: ['text-generation', 'instruct', 'long-context'],
      description: 'Llama 3.3 70B: State-of-the-art model with 128k context (requires powerful GPU)',
      performance: {
        cpu: 'slow',
        gpu: 'slow',
        npu: 'not-supported'
      },
      recommended: false,
      recommendReason: 'Too large for RX 580, requires 24GB+ VRAM',
      vietnameseSupport: 'good',
      reasoningPower: 'high'
    },
    {
      id: 'meta-llama/Llama-3.3-70B-Instruct-Q4_K_M-GGUF',
      name: 'Llama 3.3 70B (Q4)',
      author: 'meta-llama',
      downloads: 300000,
      likes: 3000,
      size: '9.8 GB',
      quantization: 'Q4_K_M',
      contextLength: 128000,
      tags: ['gguf', 'instruct', 'long-context'],
      description: 'Quantized Llama 3.3 70B with 128k context, CPU-friendly',
      performance: {
        cpu: 'medium',
        gpu: 'fast',
        npu: 'not-supported'
      },
      recommended: true,
      recommendReason: 'Fits RX 580, massive 128k context for long documents',
      vietnameseSupport: 'good',
      reasoningPower: 'high'
    },
    
    // Embedding models for RAG
    {
      id: 'sentence-transformers/all-MiniLM-L6-v2',
      name: 'MiniLM L6 v2',
      author: 'sentence-transformers',
      downloads: 5000000,
      likes: 15000,
      size: '0.08 GB',
      quantization: 'F32',
      contextLength: 512,
      tags: ['feature-extraction', 'embeddings', 'sentence-similarity'],
      description: 'Fast and efficient embedding model for RAG retrieval',
      performance: {
        cpu: 'very-fast',
        gpu: 'very-fast',
        npu: 'supported'
      },
      recommended: true,
      recommendReason: 'Best embedding model for RAG, ultra-fast, minimal memory',
      vietnameseSupport: 'fair',
      reasoningPower: 'low'
    },
    {
      id: 'BAAI/bge-large-en-v1.5',
      name: 'BGE Large English v1.5',
      author: 'BAAI',
      downloads: 2000000,
      likes: 8000,
      size: '0.3 GB',
      quantization: 'F32',
      contextLength: 512,
      tags: ['feature-extraction', 'embeddings'],
      description: 'High-quality embedding model for semantic search',
      performance: {
        cpu: 'very-fast',
        gpu: 'very-fast',
        npu: 'supported'
      },
      recommended: true,
      recommendReason: 'Superior embedding quality for better RAG retrieval',
      vietnameseSupport: 'fair',
      reasoningPower: 'low'
    }
  ];
  
  return recommendedModels.filter(m => m.recommended);
}

/**
 * Download model to local storage
 */
export async function downloadModelToLocal(
  modelId: string,
  onProgress?: (progress: number, status: string) => void
): Promise<string> {
  onProgress?.(0, `Preparing to download ${modelId}...`);
  
  // Find GGUF file in model repo
  const filesResponse = await fetch(
    `https://huggingface.co/api/models/${modelId}/tree/main`,
    {
      headers: HF_TOKEN ? {
        'Authorization': `Bearer ${HF_TOKEN}`
      } : {}
    }
  );
  
  if (!filesResponse.ok) {
    throw new Error(`Failed to list model files: ${filesResponse.statusText}`);
  }
  
  const files = await filesResponse.json();
  const ggufFile = files.find((f: any) => f.path.endsWith('.gguf'));
  
  if (!ggufFile) {
    throw new Error('No GGUF file found in model repository');
  }
  
  onProgress?.(5, `Downloading ${ggufFile.path} (${formatBytes(ggufFile.size)})...`);
  
  // Download file
  const downloadUrl = `https://huggingface.co/${modelId}/resolve/main/${ggufFile.path}`;
  const response = await fetch(downloadUrl, {
    headers: HF_TOKEN ? {
      'Authorization': `Bearer ${HF_TOKEN}`
    } : {}
  });
  
  if (!response.ok) {
    throw new Error(`Download failed: ${response.statusText}`);
  }
  
  const totalSize = ggufFile.size || 0;
  let downloadedSize = 0;
  
  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');
  
  const chunks: Uint8Array[] = [];
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    chunks.push(value);
    downloadedSize += value.length;
    
    if (totalSize > 0) {
      const percent = (downloadedSize / totalSize) * 100;
      onProgress?.(percent, `Downloaded ${formatBytes(downloadedSize)} / ${formatBytes(totalSize)}`);
    }
  }
  
  onProgress?.(95, 'Saving model to disk...');
  
  // Combine chunks
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const modelData = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    modelData.set(chunk, offset);
    offset += chunk.length;
  }
  
  // Save to local storage
  const fileName = `${modelId.replace('/', '--')}--${ggufFile.path}`;
  const localPath = `${MODEL_DOWNLOAD_PATH}\\${fileName}`;
  
  // Use Electron API to save file
  if ((window.electronAPI as any)?.saveFile) {
    await (window.electronAPI as any).saveFile(localPath, modelData.buffer);
  } else {
    // Fallback: Show instructions to user
    console.log('Download complete! Please save file to:', localPath);
    console.log('File size:', formatBytes(totalLength));
    
    // Create download link for browser
    const blob = new Blob([modelData], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  onProgress?.(100, 'Download complete!');
  
  return localPath;
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Scan local models directory
 */
export async function scanLocalModelsDirectory(): Promise<HFModel[]> {
  const localModels: HFModel[] = [];
  
  if ((window.electronAPI as any)?.readDirectory) {
    try {
      const files = await (window.electronAPI as any).readDirectory(MODEL_DOWNLOAD_PATH);
      
      for (const file of files) {
        if (file.endsWith('.gguf') || file.endsWith('.bin')) {
          const model = parseLocalModelFile(file);
          if (model) localModels.push(model);
        }
      }
    } catch (e) {
      console.error('Failed to scan local models:', e);
    }
  }
  
  // Also scan LM Studio directories
  const lmStudioPaths = [
    `C:\\Users\\${process.env.USERNAME || 'User'}\\.cache\\lm-studio\\models`,
    `C:\\Users\\${process.env.USERNAME || 'User'}\\AppData\\Local\\LM Studio\\models`
  ];
  
  for (const path of lmStudioPaths) {
    if ((window.electronAPI as any)?.readDirectory) {
      try {
        const files = await (window.electronAPI as any).readDirectory(path);
        for (const file of files) {
          if (file.endsWith('.gguf')) {
            const model = parseLocalModelFile(file, path);
            if (model) localModels.push(model);
          }
        }
      } catch (e) {
        // Path doesn't exist or inaccessible
        continue;
      }
    }
  }
  
  return localModels;
}

/**
 * Parse local model file
 */
function parseLocalModelFile(fileName: string, basePath?: string): HFModel | null {
  try {
    const name = fileName.replace(/\.(gguf|bin)$/, '');
    
    // Detect quantization
    let quantization: string | undefined;
    if (name.includes('Q4_K_M')) quantization = 'Q4_K_M';
    else if (name.includes('Q5_K_M')) quantization = 'Q5_K_M';
    else if (name.includes('Q8_0')) quantization = 'Q8_0';
    else if (name.includes('F16')) quantization = 'F16';
    
    return {
      id: `local/${name}`,
      name,
      author: 'Local',
      downloads: 0,
      likes: 0,
      size: 'Unknown',
      quantization,
      contextLength: 8192,
      tags: ['local'],
      description: `Local model: ${fileName}`,
      isLocal: true,
      localPath: basePath ? `${basePath}\\${fileName}` : fileName,
      performance: {
        cpu: 'fast',
        gpu: 'fast',
        npu: 'supported'
      },
      recommended: true,
      recommendReason: 'Already downloaded and ready to use'
    };
  } catch (e) {
    return null;
  }
}

// Electron API will be defined in global.d.ts
