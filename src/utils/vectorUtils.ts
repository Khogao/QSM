// Vector similarity and system utilities for RAG engine

export interface VectorSearchResult {
  documentId: string;
  chunkId: string;
  score: number;
  text: string;
  metadata?: any;
}

// Calculate cosine similarity between two vectors
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

// Check system RAM
export function checkSystemRAM(): { totalRAM: number; warning: boolean } {
  try {
    // In Electron, we can access system info
    if (typeof navigator !== 'undefined' && 'deviceMemory' in navigator) {
      const totalRAM = (navigator as any).deviceMemory || 8;
      return {
        totalRAM,
        warning: totalRAM < 8
      };
    }
  } catch (error) {
    console.error('Error checking RAM:', error);
  }

  // Default fallback
  return {
    totalRAM: 8,
    warning: false
  };
}

// Backend platforms for model execution
export const backendPlatforms = {
  huggingface: {
    name: 'Hugging Face',
    callModel: async (prompt: string, modelId: string) => {
      try {
        const startTime = Date.now();
        
        // Mock response for now - in production would call actual HF API
        const response = {
          text: `Response from ${modelId}: ${prompt}`,
          timeTaken: Date.now() - startTime,
          error: null
        };
        
        return response;
      } catch (error) {
        return {
          text: '',
          timeTaken: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }
  },
  ollama: {
    name: 'Ollama',
    callModel: async (prompt: string, modelId: string) => {
      try {
        const startTime = Date.now();
        
        // Try to connect to local Ollama instance
        const response = await fetch('http://localhost:11434/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: modelId,
            prompt: prompt,
            stream: false
          })
        });

        if (!response.ok) {
          throw new Error('Ollama not running or model not found');
        }

        const data = await response.json();
        
        return {
          text: data.response || '',
          timeTaken: Date.now() - startTime,
          error: null
        };
      } catch (error) {
        return {
          text: '',
          timeTaken: 0,
          error: error instanceof Error ? error.message : 'Ollama connection failed'
        };
      }
    }
  },
  llamacpp: {
    name: 'LlamaCPP',
    callModel: async (prompt: string, modelId: string) => {
      try {
        const startTime = Date.now();
        
        // Try to connect to local llama.cpp server
        const response = await fetch('http://localhost:8080/completion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: prompt,
            n_predict: 512
          })
        });

        if (!response.ok) {
          throw new Error('LlamaCPP server not running');
        }

        const data = await response.json();
        
        return {
          text: data.content || '',
          timeTaken: Date.now() - startTime,
          error: null
        };
      } catch (error) {
        return {
          text: '',
          timeTaken: 0,
          error: error instanceof Error ? error.message : 'LlamaCPP connection failed'
        };
      }
    }
  }
};

// Chunk text into smaller pieces for embedding
export function chunkText(text: string, chunkSize: number = 512, overlap: number = 50): string[] {
  const chunks: string[] = [];
  const words = text.split(/\s+/);
  
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    if (chunk.trim().length > 0) {
      chunks.push(chunk);
    }
  }
  
  return chunks;
}

// Search through vectors to find most similar chunks
export function searchVectors(
  queryVector: number[],
  vectorDatabase: Array<{ vector: number[]; text: string; documentId: string; chunkId: string; metadata?: any }>,
  topK: number = 5
): VectorSearchResult[] {
  const results = vectorDatabase.map(item => ({
    documentId: item.documentId,
    chunkId: item.chunkId,
    text: item.text,
    metadata: item.metadata,
    score: cosineSimilarity(queryVector, item.vector)
  }));

  // Sort by score descending and return top K
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
