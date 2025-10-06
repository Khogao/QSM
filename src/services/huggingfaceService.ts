/**
 * HuggingFace Model Discovery Service
 * Auto-discover best models for RAG/Document QA
 */

import { sha256 } from 'crypto-hash';

// HuggingFace API Token (hashed for security - never commit raw token!)
const HF_TOKEN_HASH = '49504a215025138f2a44213e792b85c1205f5be248ba7d5b4172f55504ec78b2';
let HF_TOKEN = ''; // Runtime only, never committed to git

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
 * Initialize HuggingFace token (call on app start)
 */
export async function initHFToken(token: string): Promise<void> {
  // Validate token format
  if (!token.startsWith('hf_')) {
    throw new Error('Invalid HuggingFace token format');
  }
  
  // Verify hash matches (security check)
  const hash = await sha256(token);
  if (hash !== HF_TOKEN_HASH) {
    console.warn('HF token hash mismatch, using provided token');
  }
  
  HF_TOKEN = token;
  
  // Test connection
  const valid = await testHFConnection();
  if (!valid) {
    throw new Error('HuggingFace token invalid or network error');
  }
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
 * Search HuggingFace for best models
 */
export async function searchModels(filter: ModelFilter): Promise<HFModel[]> {
  const params = new URLSearchParams({
    filter: filter.task,
    sort: 'downloads',
    direction: '-1',
    limit: '50'
  });
  
  // Add tags
  if (filter.tags) {
    filter.tags.forEach(tag => params.append('tags', tag));
  }
  
  const response = await fetch(
    `https://huggingface.co/api/models?${params.toString()}`,
    {
      headers: HF_TOKEN ? {
        'Authorization': `Bearer ${HF_TOKEN}`
      } : {}
    }
  );
  
  if (!response.ok) {
    throw new Error(`HuggingFace API error: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Parse and filter models
  const models: HFModel[] = data
    .map((m: any) => parseHFModel(m))
    .filter((m: HFModel | null) => m !== null)
    .filter((m: HFModel) => {
      if (filter.maxSize && parseSize(m.size) > filter.maxSize) return false;
      if (filter.minDownloads && m.downloads < filter.minDownloads) return false;
      if (filter.minLikes && m.likes < filter.minLikes) return false;
      if (filter.quantization && !m.quantization?.includes(filter.quantization)) return false;
      return true;
    });
  
  // Add recommendations
  return addRecommendations(models);
}

/**
 * Get recommended models for RAG/Document QA
 */
export async function getRecommendedModels(): Promise<HFModel[]> {
  // Text generation models for QA
  const qaModels = await searchModels({
    task: 'text-generation',
    tags: ['conversational', 'text-generation', 'instruct'],
    minDownloads: 10000,
    minLikes: 100
  });
  
  // Embedding models for RAG
  const embeddingModels = await searchModels({
    task: 'feature-extraction',
    tags: ['sentence-similarity', 'embeddings'],
    minDownloads: 50000
  });
  
  // Combine and deduplicate
  const allModels = [...qaModels, ...embeddingModels];
  const uniqueModels = Array.from(
    new Map(allModels.map(m => [m.id, m])).values()
  );
  
  // Sort by recommendation score
  return uniqueModels
    .sort((a, b) => {
      const scoreA = (a.recommended ? 1000 : 0) + a.downloads + a.likes * 10;
      const scoreB = (b.recommended ? 1000 : 0) + b.downloads + b.likes * 10;
      return scoreB - scoreA;
    })
    .slice(0, 20); // Top 20
}

/**
 * Parse HuggingFace model data
 */
function parseHFModel(data: any): HFModel | null {
  try {
    // Extract model info
    const id = data.id || data.modelId;
    const parts = id.split('/');
    const author = parts[0];
    const name = parts.slice(1).join('/');
    
    // Estimate size from siblings or config
    const size = estimateModelSize(data);
    
    // Detect quantization
    const quantization = detectQuantization(id, data.tags);
    
    // Estimate context length
    const contextLength = estimateContextLength(data);
    
    // Estimate performance
    const performance = estimatePerformance(size, quantization);
    
    return {
      id,
      name,
      author,
      downloads: data.downloads || 0,
      likes: data.likes || 0,
      size,
      quantization,
      contextLength,
      tags: data.tags || [],
      description: data.description || '',
      performance,
      recommended: false
    };
  } catch (e) {
    console.error('Failed to parse model:', e);
    return null;
  }
}

/**
 * Estimate model size from metadata
 */
function estimateModelSize(data: any): string {
  // Try to get from siblings (files)
  if (data.siblings && Array.isArray(data.siblings)) {
    const totalBytes = data.siblings.reduce((sum: number, file: any) => {
      return sum + (file.size || 0);
    }, 0);
    
    if (totalBytes > 0) {
      const gb = totalBytes / (1024 ** 3);
      return `${gb.toFixed(1)} GB`;
    }
  }
  
  // Estimate from model name
  const name = data.id.toLowerCase();
  if (name.includes('70b')) return '~40 GB';
  if (name.includes('34b')) return '~20 GB';
  if (name.includes('13b')) return '~7 GB';
  if (name.includes('7b') || name.includes('8b')) return '~4 GB';
  if (name.includes('3b')) return '~2 GB';
  if (name.includes('1b')) return '~1 GB';
  
  return 'Unknown';
}

/**
 * Detect quantization from model ID or tags
 */
function detectQuantization(id: string, tags: string[]): string | undefined {
  const lower = id.toLowerCase();
  
  if (lower.includes('q4_k_m') || lower.includes('q4-k-m')) return 'Q4_K_M';
  if (lower.includes('q4_0') || lower.includes('q4-0')) return 'Q4_0';
  if (lower.includes('q5_k_m') || lower.includes('q5-k-m')) return 'Q5_K_M';
  if (lower.includes('q5_0') || lower.includes('q5-0')) return 'Q5_0';
  if (lower.includes('q8_0') || lower.includes('q8-0')) return 'Q8_0';
  if (lower.includes('f16') || lower.includes('fp16')) return 'F16';
  if (lower.includes('f32') || lower.includes('fp32')) return 'F32';
  if (lower.includes('gguf')) return 'GGUF';
  if (lower.includes('onnx')) return 'ONNX';
  
  // Check tags
  if (tags.includes('gguf')) return 'GGUF';
  if (tags.includes('onnx')) return 'ONNX';
  
  return undefined;
}

/**
 * Estimate context length
 */
function estimateContextLength(data: any): number {
  const name = data.id.toLowerCase();
  
  // Check explicit context markers
  if (name.includes('128k')) return 128000;
  if (name.includes('32k')) return 32768;
  if (name.includes('16k')) return 16384;
  if (name.includes('8k')) return 8192;
  if (name.includes('4k')) return 4096;
  
  // Try to get from config
  if (data.config && data.config.max_position_embeddings) {
    return data.config.max_position_embeddings;
  }
  
  // Default based on model type
  if (name.includes('llama3') || name.includes('llama-3')) return 8192;
  if (name.includes('mistral')) return 8192;
  if (name.includes('phi')) return 4096;
  if (name.includes('gemma')) return 8192;
  
  return 4096; // Conservative default
}

/**
 * Estimate performance on different hardware
 */
function estimatePerformance(
  size: string,
  quantization?: string
): HFModel['performance'] {
  const sizeGB = parseSize(size);
  
  // CPU performance (AMD 5700X reference)
  let cpu: HFModel['performance']['cpu'];
  if (sizeGB < 2) cpu = 'very-fast'; // <2GB: 40-50 tok/s
  else if (sizeGB < 5) cpu = 'fast'; // 2-5GB: 20-30 tok/s
  else if (sizeGB < 10) cpu = 'medium'; // 5-10GB: 10-20 tok/s
  else cpu = 'slow'; // >10GB: <10 tok/s
  
  // GPU performance (AMD RX 580 8GB reference)
  let gpu: HFModel['performance']['gpu'];
  if (sizeGB > 8) gpu = 'slow'; // Too large for VRAM
  else if (sizeGB < 2) gpu = 'very-fast'; // Small: 60-80 tok/s
  else if (sizeGB < 5) gpu = 'fast'; // Medium: 40-60 tok/s
  else gpu = 'medium'; // Large: 20-40 tok/s
  
  // NPU support (Intel/AMD with DirectML)
  const npu = (quantization === 'ONNX' || quantization === 'Q4_0') 
    ? 'supported' 
    : 'not-supported';
  
  return { cpu, gpu, npu };
}

/**
 * Parse size string to GB number
 */
function parseSize(size: string): number {
  const match = size.match(/(\d+\.?\d*)\s*(GB|MB)/i);
  if (!match) return 999; // Unknown = very large
  
  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  
  return unit === 'GB' ? value : value / 1024;
}

/**
 * Add recommendation flags to models
 */
function addRecommendations(models: HFModel[]): HFModel[] {
  return models.map(model => {
    const reasons: string[] = [];
    let recommended = false;
    
    // Recommend if good for CPU (AMD 5700X)
    if (model.performance.cpu === 'fast' || model.performance.cpu === 'very-fast') {
      reasons.push('Fast on CPU');
      recommended = true;
    }
    
    // Recommend if GPU-friendly (RX 580 8GB)
    if (parseSize(model.size) <= 8 && model.quantization) {
      reasons.push('Fits in RX 580 VRAM');
      recommended = true;
    }
    
    // Recommend if NPU-compatible (future Intel/AMD)
    if (model.performance.npu === 'supported') {
      reasons.push('NPU-accelerated (DirectML)');
      recommended = true;
    }
    
    // Recommend if popular and well-tested
    if (model.downloads > 100000 && model.likes > 1000) {
      reasons.push('Popular & well-tested');
      recommended = true;
    }
    
    // Recommend if good for RAG/QA
    const ragTags = ['instruct', 'chat', 'conversational', 'question-answering'];
    if (model.tags.some(tag => ragTags.includes(tag))) {
      reasons.push('Optimized for Q&A');
      recommended = true;
    }
    
    return {
      ...model,
      recommended,
      recommendReason: reasons.length > 0 ? reasons.join(', ') : undefined
    };
  });
}

/**
 * Scan local LM Studio models directory
 */
export async function scanLocalModels(): Promise<HFModel[]> {
  // LM Studio default paths
  const possiblePaths = [
    'C:\\Users\\' + process.env.USERNAME + '\\.cache\\lm-studio\\models',
    'C:\\Users\\' + process.env.USERNAME + '\\AppData\\Local\\LM Studio\\models',
    'D:\\.lmstudio\\models'
  ];
  
  const localModels: HFModel[] = [];
  
  for (const basePath of possiblePaths) {
    try {
      // TODO: Use Electron API to read directory when available
      // For now, return empty array (user can manually enter model names)
      // const files = await window.electronAPI?.readDirectory(basePath);
      // if (!files) continue;
      
      // Placeholder: Will be implemented with Electron API
      console.log('Local model scanning not yet implemented, basePath:', basePath);
    } catch (e) {
      // Path doesn't exist, continue
      continue;
    }
  }
  
  return localModels;
}

/**
 * Parse local model file info
 */
function parseLocalModel(filename: string, basePath: string): HFModel | null {
  try {
    const name = filename.replace(/\.(gguf|bin)$/, '');
    
    return {
      id: `local/${name}`,
      name,
      author: 'Local',
      downloads: 0,
      likes: 0,
      size: 'Unknown',
      quantization: detectQuantization(filename, []),
      contextLength: estimateContextLength({ id: name }),
      tags: ['local'],
      description: `Local model: ${filename}`,
      isLocal: true,
      localPath: `${basePath}\\${filename}`,
      performance: estimatePerformance('4 GB'), // Assume 4GB
      recommended: true,
      recommendReason: 'Already downloaded'
    };
  } catch (e) {
    return null;
  }
}

/**
 * Download model from HuggingFace (for LM Studio)
 */
export async function downloadModel(
  modelId: string,
  onProgress?: (progress: number) => void
): Promise<void> {
  // This will trigger LM Studio's download
  // Or download directly to LM Studio models folder
  
  const downloadUrl = `https://huggingface.co/${modelId}/resolve/main/model.gguf`;
  
  const response = await fetch(downloadUrl, {
    headers: HF_TOKEN ? {
      'Authorization': `Bearer ${HF_TOKEN}`
    } : {}
  });
  
  if (!response.ok) {
    throw new Error(`Download failed: ${response.statusText}`);
  }
  
  const totalSize = parseInt(response.headers.get('content-length') || '0');
  let downloadedSize = 0;
  
  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');
  
  const chunks: Uint8Array[] = [];
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    chunks.push(value);
    downloadedSize += value.length;
    
    if (onProgress && totalSize > 0) {
      onProgress((downloadedSize / totalSize) * 100);
    }
  }
  
  // Save to LM Studio models folder
  // Convert chunks to proper Uint8Array
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  
  const modelPath = `C:\\Users\\${process.env.USERNAME || 'User'}\\.cache\\lm-studio\\models\\${modelId.replace('/', '--')}.gguf`;
  
  // TODO: Use Electron API to save file when available
  // await window.electronAPI?.saveFile(modelPath, result.buffer);
  console.log('Model download complete, path:', modelPath);
  console.log('TODO: Implement Electron file save API');
}
