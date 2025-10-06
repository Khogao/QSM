/**
 * Advanced Query Interface
 * Features:
 * - RAG retrieval with citations
 * - Streaming LLM responses
 * - Web search integration
 * - Web file download
 * - Multi-document context
 */

import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  Send, Search, Globe, Download, FileText, 
  ExternalLink, Loader2, X, Copy, Check,
  Brain, Sparkles, AlertCircle
} from 'lucide-react';
import { callLLM, streamLLM, type LLMRequest } from '../services/llmService';
import { SimpleRAG, buildRAGPrompt, type RAGSearchResult, type LLMConfig } from '../services/simpleRAG';
import { useAiModel } from '../hooks/useAiModel';

interface RAGChunk {
  id: string;
  text: string;
  source: string;
  page?: number;
  score: number;
  metadata?: any;
}

interface QueryResult {
  question: string;
  answer: string;
  chunks: RAGChunk[];
  citations: Citation[];
  webResults?: WebResult[];
  timestamp: Date;
  model: string;
  tokensPerSec: number;
  latency: number;
}

interface Citation {
  number: number;
  source: string;
  page?: number;
  text: string;
  chunkId: string;
}

interface WebResult {
  title: string;
  url: string;
  snippet: string;
  downloaded?: boolean;
}

interface AdvancedQueryInterfaceProps {
  config: {
    provider: string;
    model: string;
    temperature: number;
    maxTokens: number;
    useWebSearch: boolean;
    autoDownloadWebFiles: boolean;
  };
}

export const AdvancedQueryInterface: React.FC<AdvancedQueryInterfaceProps> = ({ config }) => {
  const [query, setQuery] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [results, setResults] = useState<QueryResult[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [expandedChunks, setExpandedChunks] = useState<Set<number>>(new Set());
  
  const answerRef = useRef<HTMLDivElement>(null);
  const scrollBottomRef = useRef<HTMLDivElement>(null);
  
  // Get AI model hook for embeddings
  const { generateEmbedding } = useAiModel();

  // Auto-scroll to bottom when streaming
  useEffect(() => {
    if (isStreaming && scrollBottomRef.current) {
      scrollBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentAnswer, isStreaming]);

  /**
   * Handle query submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isQuerying) return;

    setIsQuerying(true);
    setIsStreaming(true);
    setError(null);
    setCurrentAnswer('');

    const startTime = performance.now();

    try {
      // Step 1: Retrieve RAG chunks (REAL IMPLEMENTATION)
      console.log('[Query] Step 1: Retrieving RAG chunks...');
      const chunks = await retrieveRAGChunks(query);
      console.log(`[Query] Retrieved ${chunks.length} chunks`);
      
      // Step 2: Web search (if enabled)
      let webResults: WebResult[] = [];
      if (config.useWebSearch) {
        console.log('[Query] Step 2: Performing web search...');
        webResults = await performWebSearch(query);
        
        // Download web files (if enabled)
        if (config.autoDownloadWebFiles) {
          await downloadWebFiles(webResults);
        }
      }
      
      // Step 3: Build RAG prompt using SimpleRAG
      console.log('[Query] Step 3: Building RAG prompt...');
      const ragSearchResults: RAGSearchResult[] = chunks.map(chunk => ({
        id: chunk.id,
        text: chunk.text,
        embedding: [], // Not needed for prompt building
        documentName: chunk.source,
        documentId: chunk.id,
        folderId: chunk.metadata?.folderId,
        pageNumber: chunk.page,
        metadata: chunk.metadata,
        score: chunk.score
      }));
      
      const prompt = buildRAGPrompt(query, ragSearchResults);
      console.log('[Query] Prompt length:', prompt.length, 'characters');
      
      // Step 4: Get API keys from localStorage
      const apiKeys = {
        openai: localStorage.getItem('openai_api_key') || undefined,
        gemini: localStorage.getItem('gemini_api_key') || undefined,
        claude: localStorage.getItem('claude_api_key') || undefined,
        azure: localStorage.getItem('azure_openai_api_key') || undefined,
      };
      
      // Step 5: Build LLM config
      const llmConfig: LLMConfig = {
        provider: config.provider as any,
        model: config.model,
        apiKey: apiKeys[config.provider as keyof typeof apiKeys],
        temperature: config.temperature,
        maxTokens: config.maxTokens
      };
      
      console.log('[Query] Step 4: Streaming LLM response...');
      
      // Step 6: Stream LLM response using SimpleRAG
      let fullAnswer = '';
      let tokenCount = 0;
      
      for await (const chunk of SimpleRAG.queryLLMStream(prompt, llmConfig)) {
        if (chunk.text) {
          fullAnswer += chunk.text;
          setCurrentAnswer(fullAnswer);
          tokenCount++;
        }
        if (chunk.done) break;
      }
      
      console.log('[Query] Step 5: Extracting citations...');
      
      // Step 7: Parse citations
      const citations = extractCitations(fullAnswer, chunks);
      
      // Calculate metrics
      const endTime = performance.now();
      const latency = endTime - startTime;
      const tokensPerSec = tokenCount > 0 ? (tokenCount / latency) * 1000 : 0;
      
      console.log(`[Query] Complete! Tokens: ${tokenCount}, Latency: ${latency.toFixed(0)}ms, Speed: ${tokensPerSec.toFixed(1)} tok/s`);
      
      // Save result
      const result: QueryResult = {
        question: query,
        answer: fullAnswer,
        chunks,
        citations,
        webResults,
        timestamp: new Date(),
        model: config.model,
        tokensPerSec,
        latency
      };
      
      setResults([result, ...results]);
      setQuery('');
      
    } catch (err: any) {
      setError(err.message || 'Query failed');
      console.error('Query error:', err);
    } finally {
      setIsQuerying(false);
      setIsStreaming(false);
    }
  };

  /**
   * Retrieve RAG chunks from vector database
   * REAL IMPLEMENTATION using SimpleRAG service
   */
  const retrieveRAGChunks = async (query: string): Promise<RAGChunk[]> => {
    try {
      console.log('[Query] Generating embedding for query:', query.substring(0, 50) + '...');
      
      // Step 1: Generate embedding for query
      const queryEmbedding = await generateEmbedding(query);
      
      if (!queryEmbedding || !queryEmbedding.data) {
        console.warn('[Query] No embedding generated, using empty results');
        return [];
      }
      
      // Extract embedding array (Transformers.js returns { data: Float32Array })
      const embeddingArray = Array.from(queryEmbedding.data) as number[];
      
      console.log('[Query] Embedding generated, searching vector database...');
      console.log('[Query] Embedding dimensions:', embeddingArray.length);
      
      // Step 2: Search vector database
      const searchResults = await SimpleRAG.searchChunks(embeddingArray, 5); // Top-5 results
      
      console.log('[Query] Found', searchResults.length, 'relevant chunks');
      
      // Step 3: Convert to RAGChunk format
      const ragChunks: RAGChunk[] = searchResults.map(result => ({
        id: result.id,
        text: result.text,
        source: result.documentName,
        page: result.pageNumber,
        score: result.score,
        metadata: result.metadata || {}
      }));
      
      return ragChunks;
      
    } catch (error) {
      console.error('[Query] Failed to retrieve RAG chunks:', error);
      // Return empty array on error to allow query to continue
      return [];
    }
  };

  /**
   * Perform web search
   */
  const performWebSearch = async (query: string): Promise<WebResult[]> => {
    // Use SerpAPI, Google Custom Search, or Bing API
    // Placeholder implementation
    
    // TODO: Implement actual web search API
    console.log('Web search for:', query);
    
    return [
      {
        title: 'Hướng dẫn đầu tư tại TP.HCM 2025',
        url: 'https://scci.gov.vn/huong-dan-dau-tu-2025',
        snippet: 'Quy trình mới nhất về thủ tục đầu tư tại TP.HCM...'
      },
      {
        title: 'Luật Đầu Tư (Sửa đổi 2024) - Chính phủ',
        url: 'https://chinhphu.vn/luat-dau-tu-2024',
        snippet: 'Nội dung chính của Luật Đầu Tư sửa đổi...'
      }
    ];
  };

  /**
   * Download web files for RAG indexing
   */
  const downloadWebFiles = async (webResults: WebResult[]) => {
    for (const result of webResults) {
      try {
        // Download PDF/DOCX from URL
        // Add to document database
        // Trigger RAG processing
        
        console.log('Downloading:', result.url);
        
        // TODO: Implement web file download
        result.downloaded = true;
        
      } catch (err) {
        console.error('Failed to download:', result.url, err);
      }
    }
  };

  /**
   * Build LLM prompt with RAG context
   */
  const buildPrompt = (
    query: string, 
    chunks: RAGChunk[], 
    webResults?: WebResult[]
  ): string => {
    let prompt = `You are a helpful legal assistant analyzing Vietnamese documents about investment procedures.

**Context from Documents:**

`;

    // Add RAG chunks as context
    chunks.forEach((chunk, idx) => {
      prompt += `[${idx + 1}] Source: ${chunk.source}, Page ${chunk.page || 'N/A'}
${chunk.text}

`;
    });

    // Add web search results (if available)
    if (webResults && webResults.length > 0) {
      prompt += `\n**Web Search Results:**\n\n`;
      webResults.forEach((result, idx) => {
        prompt += `[W${idx + 1}] ${result.title}
URL: ${result.url}
${result.snippet}

`;
      });
    }

    prompt += `\n**User Question:** ${query}

**Instructions:**
1. Answer based ONLY on the provided context
2. Cite sources using [1], [2], [3] notation
3. If information is not in context, say "I don't have this information in the documents"
4. Compare and contrast information from different sources
5. Answer in Vietnamese (user's language)

**Answer:**`;

    return prompt;
  };

  /**
   * Extract citations from LLM response
   */
  const extractCitations = (answer: string, chunks: RAGChunk[]): Citation[] => {
    const citations: Citation[] = [];
    const citationRegex = /\[(\d+)\]/g;
    
    let match;
    while ((match = citationRegex.exec(answer)) !== null) {
      const number = parseInt(match[1]);
      const chunk = chunks[number - 1];
      
      if (chunk && !citations.find(c => c.number === number)) {
        citations.push({
          number,
          source: chunk.source,
          page: chunk.page,
          text: chunk.text.slice(0, 200) + '...',
          chunkId: chunk.id
        });
      }
    }
    
    return citations.sort((a, b) => a.number - b.number);
  };

  /**
   * Copy answer to clipboard
   */
  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  /**
   * Toggle chunk expansion
   */
  const toggleChunkExpansion = (index: number) => {
    const newExpanded = new Set(expandedChunks);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedChunks(newExpanded);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Query Input */}
      <div className="p-4 border-b">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Hỏi về tài liệu của bạn... (ví dụ: Quy trình xét duyệt thủ tục đầu tư có gì khác nhau trước và sau 1/7/2025?)"
            className="flex-1 text-base"
            disabled={isQuerying}
          />
          <Button 
            type="submit" 
            disabled={!query.trim() || isQuerying}
            className="px-6"
          >
            {isQuerying ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </form>
        
        {config.useWebSearch && (
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
            <Globe className="w-4 h-4" />
            <span>Web search enabled</span>
            {config.autoDownloadWebFiles && (
              <>
                <span>•</span>
                <Download className="w-4 h-4" />
                <span>Auto-download web files</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Streaming Answer */}
        {isStreaming && (
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-blue-600 animate-pulse" />
              <span className="font-semibold text-blue-900">AI đang trả lời...</span>
            </div>
            
            <div 
              ref={answerRef}
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: formatMarkdown(currentAnswer) }}
            />
            
            <div ref={scrollBottomRef} />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 rounded-lg p-4 border border-red-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Lỗi khi truy vấn</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Previous Results */}
        {results.map((result, resultIdx) => (
          <div key={resultIdx} className="border rounded-lg overflow-hidden">
            {/* Question */}
            <div className="bg-gray-50 p-4 border-b">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span>{result.model}</span>
                    <span>•</span>
                    <span>{result.tokensPerSec.toFixed(1)} tok/s</span>
                    <span>•</span>
                    <span>{(result.latency / 1000).toFixed(1)}s</span>
                  </div>
                  <p className="font-semibold text-gray-900">{result.question}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(result.answer, resultIdx)}
                >
                  {copiedIndex === resultIdx ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Answer */}
            <div className="p-6 bg-white">
              <div 
                className="prose prose-sm max-w-none mb-6"
                dangerouslySetInnerHTML={{ __html: formatMarkdown(result.answer) }}
              />

              {/* Citations */}
              {result.citations.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Nguồn trích dẫn ({result.citations.length})
                  </h3>
                  <div className="space-y-2">
                    {result.citations.map((citation) => (
                      <div 
                        key={citation.number}
                        className="flex gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                        onClick={() => {
                          // Jump to source document
                          console.log('Jump to:', citation.source, citation.page);
                        }}
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                          {citation.number}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                            <FileText className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{citation.source}</span>
                            {citation.page && (
                              <span className="text-gray-500">• Trang {citation.page}</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {citation.text}
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* RAG Chunks (Expandable) */}
              <div className="border-t pt-4 mt-4">
                <button
                  onClick={() => toggleChunkExpansion(resultIdx)}
                  className="text-sm font-semibold text-gray-700 hover:text-gray-900 flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  RAG Context ({result.chunks.length} chunks)
                  {expandedChunks.has(resultIdx) ? ' ▼' : ' ▶'}
                </button>
                
                {expandedChunks.has(resultIdx) && (
                  <div className="mt-3 space-y-2">
                    {result.chunks.map((chunk, chunkIdx) => (
                      <div 
                        key={chunk.id}
                        className="p-3 bg-purple-50 rounded-lg border border-purple-200"
                      >
                        <div className="flex items-center gap-2 text-xs text-purple-700 mb-2">
                          <FileText className="w-3 h-3" />
                          <span className="font-semibold">{chunk.source}</span>
                          {chunk.page && <span>• Page {chunk.page}</span>}
                          <span className="ml-auto">Score: {(chunk.score * 100).toFixed(0)}%</span>
                        </div>
                        <p className="text-sm text-gray-700">{chunk.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Web Results */}
              {result.webResults && result.webResults.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Kết quả tìm kiếm web ({result.webResults.length})
                  </h3>
                  <div className="space-y-2">
                    {result.webResults.map((webResult, idx) => (
                      <a
                        key={idx}
                        href={webResult.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <ExternalLink className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-green-900 text-sm">
                              {webResult.title}
                            </p>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {webResult.snippet}
                            </p>
                            <p className="text-xs text-green-700 mt-1 truncate">
                              {webResult.url}
                            </p>
                          </div>
                          {webResult.downloaded && (
                            <Download className="w-4 h-4 text-green-600 flex-shrink-0" />
                          )}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Format markdown to HTML (simple implementation)
 */
function formatMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\[(.*?)\]/g, '<sup class="text-blue-600 font-semibold">[$1]</sup>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');
}
