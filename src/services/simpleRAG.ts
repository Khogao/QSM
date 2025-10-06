/**
 * Simple RAG Service for QSM
 * Provides vector search and LLM integration
 * Uses localStorage for persistence (simple, fast, sufficient for prototype)
 */

import { cosineSimilarity } from '../utils/vectorUtils';

export interface RAGChunk {
  id: string;
  text: string;
  embedding: number[];
  documentName: string;
  documentId: string;
  folderId?: string;
  pageNumber?: number;
  metadata?: Record<string, any>;
}

export interface RAGSearchResult extends RAGChunk {
  score: number;
}

export interface LLMConfig {
  provider: 'lmstudio' | 'ollama' | 'openai' | 'gemini' | 'claude';
  model: string;
  apiKey?: string;
  endpoint?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMStreamChunk {
  text: string;
  done: boolean;
}

/**
 * Simple RAG Engine
 * Handles vector storage, search, and LLM integration
 */
export class SimpleRAG {
  private static STORAGE_KEY = 'qsm_rag_chunks';
  private static MAX_CHUNKS = 10000; // Limit for localStorage

  /**
   * Store chunks in localStorage
   */
  static async saveChunks(chunks: RAGChunk[]): Promise<void> {
    try {
      const existing = this.getAllChunks();
      const combined = [...existing, ...chunks];
      
      // Limit total chunks
      const limited = combined.slice(-this.MAX_CHUNKS);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(limited));
      console.log(`[RAG] Saved ${chunks.length} chunks (total: ${limited.length})`);
    } catch (error) {
      console.error('[RAG] Failed to save chunks:', error);
      throw error;
    }
  }

  /**
   * Get all chunks from storage
   */
  static getAllChunks(): RAGChunk[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];
      
      return JSON.parse(data) as RAGChunk[];
    } catch (error) {
      console.error('[RAG] Failed to load chunks:', error);
      return [];
    }
  }

  /**
   * Search for similar chunks using vector similarity
   */
  static async searchChunks(
    queryEmbedding: number[],
    topK: number = 5,
    folderIds?: string[]
  ): Promise<RAGSearchResult[]> {
    try {
      let chunks = this.getAllChunks();
      
      // Filter by folders if specified
      if (folderIds && folderIds.length > 0) {
        chunks = chunks.filter(chunk => 
          chunk.folderId && folderIds.includes(chunk.folderId)
        );
      }

      if (chunks.length === 0) {
        console.warn('[RAG] No chunks available for search');
        return [];
      }

      // Calculate similarity scores
      const scored = chunks.map(chunk => ({
        ...chunk,
        score: cosineSimilarity(queryEmbedding, chunk.embedding)
      }));

      // Sort by score (descending) and return top K
      const topResults = scored
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);

      console.log(`[RAG] Found ${topResults.length} relevant chunks (top score: ${topResults[0]?.score.toFixed(3)})`);
      
      return topResults;
    } catch (error) {
      console.error('[RAG] Search failed:', error);
      return [];
    }
  }

  /**
   * Call LLM with streaming support
   */
  static async *queryLLMStream(
    prompt: string,
    config: LLMConfig
  ): AsyncGenerator<LLMStreamChunk> {
    try {
      switch (config.provider) {
        case 'lmstudio':
          yield* this.callLMStudio(prompt, config);
          break;
        case 'ollama':
          yield* this.callOllama(prompt, config);
          break;
        case 'openai':
          yield* this.callOpenAI(prompt, config);
          break;
        case 'gemini':
          yield* this.callGemini(prompt, config);
          break;
        case 'claude':
          yield* this.callClaude(prompt, config);
          break;
        default:
          throw new Error(`Unknown provider: ${config.provider}`);
      }
    } catch (error) {
      console.error(`[RAG] LLM query failed:`, error);
      yield {
        text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        done: true
      };
    }
  }

  /**
   * LM Studio API call (OpenAI-compatible)
   */
  private static async *callLMStudio(prompt: string, config: LLMConfig): AsyncGenerator<LLMStreamChunk> {
    const endpoint = config.endpoint || 'http://localhost:1234/v1/chat/completions';
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.model || 'local-model',
          messages: [
            {
              role: 'system',
              content: 'Bạn là trợ lý AI chuyên trả lời câu hỏi dựa trên tài liệu. Trả lời bằng tiếng Việt, chính xác và trích dẫn nguồn.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: config.temperature || 0.7,
          max_tokens: config.maxTokens || 2000,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`LM Studio error: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              yield { text: '', done: true };
              return;
            }

            try {
              const json = JSON.parse(data);
              const content = json.choices?.[0]?.delta?.content;
              if (content) {
                yield { text: content, done: false };
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('[RAG] LM Studio call failed:', error);
      throw error;
    }
  }

  /**
   * Ollama API call
   */
  private static async *callOllama(prompt: string, config: LLMConfig): AsyncGenerator<LLMStreamChunk> {
    const endpoint = config.endpoint || 'http://localhost:11434/api/chat';
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.model || 'qwen2.5:7b',
          messages: [
            {
              role: 'system',
              content: 'Bạn là trợ lý AI chuyên trả lời câu hỏi dựa trên tài liệu. Trả lời bằng tiếng Việt, chính xác và trích dẫn nguồn.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          stream: true,
          options: {
            temperature: config.temperature || 0.7,
            num_predict: config.maxTokens || 2000
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            if (json.message?.content) {
              yield { text: json.message.content, done: false };
            }
            if (json.done) {
              yield { text: '', done: true };
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    } catch (error) {
      console.error('[RAG] Ollama call failed:', error);
      throw error;
    }
  }

  /**
   * OpenAI API call
   */
  private static async *callOpenAI(prompt: string, config: LLMConfig): AsyncGenerator<LLMStreamChunk> {
    if (!config.apiKey) {
      throw new Error('OpenAI API key required');
    }

    const endpoint = config.endpoint || 'https://api.openai.com/v1/chat/completions';
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: config.model || 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Bạn là trợ lý AI chuyên trả lời câu hỏi dựa trên tài liệu. Trả lời bằng tiếng Việt, chính xác và trích dẫn nguồn.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: config.temperature || 0.7,
          max_tokens: config.maxTokens || 2000,
          stream: true
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI error: ${error.error?.message || response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              yield { text: '', done: true };
              return;
            }

            try {
              const json = JSON.parse(data);
              const content = json.choices?.[0]?.delta?.content;
              if (content) {
                yield { text: content, done: false };
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('[RAG] OpenAI call failed:', error);
      throw error;
    }
  }

  /**
   * Google Gemini API call
   */
  private static async *callGemini(prompt: string, config: LLMConfig): AsyncGenerator<LLMStreamChunk> {
    if (!config.apiKey) {
      throw new Error('Gemini API key required');
    }

    const model = config.model || 'gemini-2.0-flash-exp';
    const endpoint = config.endpoint || `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${config.apiKey}`;
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Bạn là trợ lý AI chuyên trả lời câu hỏi dựa trên tài liệu. Trả lời bằng tiếng Việt, chính xác và trích dẫn nguồn.\n\n${prompt}`
            }]
          }],
          generationConfig: {
            temperature: config.temperature || 0.7,
            maxOutputTokens: config.maxTokens || 2000,
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Gemini error: ${error.error?.message || response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // Gemini returns JSON objects separated by newlines
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          
          try {
            const json = JSON.parse(line);
            const content = json.candidates?.[0]?.content?.parts?.[0]?.text;
            if (content) {
              yield { text: content, done: false };
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }

      yield { text: '', done: true };
    } catch (error) {
      console.error('[RAG] Gemini call failed:', error);
      throw error;
    }
  }

  /**
   * Anthropic Claude API call
   */
  private static async *callClaude(prompt: string, config: LLMConfig): AsyncGenerator<LLMStreamChunk> {
    if (!config.apiKey) {
      throw new Error('Claude API key required');
    }

    const endpoint = config.endpoint || 'https://api.anthropic.com/v1/messages';
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: config.model || 'claude-3-5-sonnet-20241022',
          max_tokens: config.maxTokens || 2000,
          temperature: config.temperature || 0.7,
          messages: [
            {
              role: 'user',
              content: `Bạn là trợ lý AI chuyên trả lời câu hỏi dựa trên tài liệu. Trả lời bằng tiếng Việt, chính xác và trích dẫn nguồn.\n\n${prompt}`
            }
          ],
          stream: true
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Claude error: ${error.error?.message || response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            try {
              const json = JSON.parse(data);
              
              if (json.type === 'content_block_delta') {
                const content = json.delta?.text;
                if (content) {
                  yield { text: content, done: false };
                }
              } else if (json.type === 'message_stop') {
                yield { text: '', done: true };
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('[RAG] Claude call failed:', error);
      throw error;
    }
  }

  /**
   * Clear all stored chunks (for testing/debugging)
   */
  static clearChunks(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('[RAG] Cleared all chunks');
  }

  /**
   * Get chunk statistics
   */
  static getStats() {
    const chunks = this.getAllChunks();
    const uniqueDocs = new Set(chunks.map(c => c.documentId)).size;
    const totalSize = JSON.stringify(chunks).length;
    
    return {
      totalChunks: chunks.length,
      uniqueDocuments: uniqueDocs,
      storageSizeKB: (totalSize / 1024).toFixed(2),
      maxChunks: this.MAX_CHUNKS
    };
  }
}

/**
 * Build RAG prompt with context and citations
 */
export function buildRAGPrompt(query: string, chunks: RAGSearchResult[]): string {
  if (chunks.length === 0) {
    return `Câu hỏi: ${query}\n\nXin lỗi, tôi không tìm thấy tài liệu liên quan để trả lời câu hỏi này.`;
  }

  // Format context with citations
  const context = chunks
    .map((chunk, idx) => 
      `[${idx + 1}] Tài liệu: ${chunk.documentName}${chunk.pageNumber ? ` (trang ${chunk.pageNumber})` : ''}\nĐộ liên quan: ${(chunk.score * 100).toFixed(1)}%\nNội dung:\n${chunk.text}\n`
    )
    .join('\n---\n\n');

  return `Dựa trên các tài liệu sau, hãy trả lời câu hỏi của người dùng. Trích dẫn nguồn bằng cách sử dụng [1], [2], [3]... tương ứng với tài liệu.

TÀI LIỆU THAM KHẢO:
${context}

---

CÂU HỎI: ${query}

TRẢ LỜI (bằng tiếng Việt, có trích dẫn):`;
}
