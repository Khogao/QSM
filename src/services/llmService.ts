/**
 * LLM Integration Service - Unified interface for all AI providers
 * 
 * Supports:
 * - Local: Ollama, LM Studio
 * - Cloud: OpenAI, Google Gemini, Anthropic Claude
 */

export interface LLMRequest {
  provider: 'ollama' | 'lmstudio' | 'openai' | 'gemini' | 'claude';
  model: string;
  prompt: string;
  context?: string[];  // RAG chunks
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  apiKey?: string;
}

export interface LLMResponse {
  answer: string;
  tokens: number;
  latency: number;
  model: string;
  citations?: Array<{ chunkIndex: number; text: string; source: string }>;
  tokensPerSecond?: number;
}

export interface LLMStreamChunk {
  text: string;
  done: boolean;
  tokens?: number;
}

/**
 * Main entry point - routes to appropriate provider
 */
export async function callLLM(request: LLMRequest): Promise<LLMResponse> {
  const startTime = performance.now();
  
  try {
    let response: LLMResponse;
    
    switch (request.provider) {
      case 'ollama':
        response = await callOllama(request);
        break;
      case 'lmstudio':
        response = await callLMStudio(request);
        break;
      case 'openai':
        response = await callOpenAI(request);
        break;
      case 'gemini':
        response = await callGemini(request);
        break;
      case 'claude':
        response = await callClaude(request);
        break;
      default:
        throw new Error(`Unsupported provider: ${request.provider}`);
    }
    
    const latency = performance.now() - startTime;
    response.latency = latency;
    
    if (response.tokens && latency > 0) {
      response.tokensPerSecond = response.tokens / (latency / 1000);
    }
    
    return response;
  } catch (error) {
    throw new Error(`LLM call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Ollama Integration (http://localhost:11434)
 */
async function callOllama(request: LLMRequest): Promise<LLMResponse> {
  const prompt = buildPrompt(request);
  
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: request.model,
      prompt,
      stream: false,
      options: {
        temperature: request.temperature ?? 0.7,
        num_predict: request.maxTokens ?? 2048,
      }
    })
  });
  
  if (!response.ok) {
    throw new Error(`Ollama error: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  return {
    answer: data.response,
    tokens: data.eval_count || 0,
    latency: 0, // Will be calculated by callLLM
    model: request.model,
    citations: extractCitations(data.response, request.context),
  };
}

/**
 * LM Studio Integration (OpenAI-compatible API)
 */
async function callLMStudio(request: LLMRequest): Promise<LLMResponse> {
  const prompt = buildPrompt(request);
  
  const response = await fetch('http://localhost:1234/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: request.model,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 2048,
      stream: false,
    })
  });
  
  if (!response.ok) {
    throw new Error(`LM Studio error: ${response.statusText}`);
  }
  
  const data = await response.json();
  const answer = data.choices[0]?.message?.content || '';
  
  return {
    answer,
    tokens: data.usage?.total_tokens || 0,
    latency: 0,
    model: request.model,
    citations: extractCitations(answer, request.context),
  };
}

/**
 * OpenAI Integration
 */
async function callOpenAI(request: LLMRequest): Promise<LLMResponse> {
  if (!request.apiKey) {
    throw new Error('OpenAI API key required');
  }
  
  const messages = buildMessages(request);
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${request.apiKey}`
    },
    body: JSON.stringify({
      model: request.model,
      messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 2048,
      stream: false,
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI error: ${error.error?.message || response.statusText}`);
  }
  
  const data = await response.json();
  const answer = data.choices[0]?.message?.content || '';
  
  return {
    answer,
    tokens: data.usage?.total_tokens || 0,
    latency: 0,
    model: request.model,
    citations: extractCitations(answer, request.context),
  };
}

/**
 * Google Gemini Integration
 */
async function callGemini(request: LLMRequest): Promise<LLMResponse> {
  if (!request.apiKey) {
    throw new Error('Gemini API key required');
  }
  
  const prompt = buildPrompt(request);
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${request.model}:generateContent?key=${request.apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: request.temperature ?? 0.7,
          maxOutputTokens: request.maxTokens ?? 2048,
        }
      })
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Gemini error: ${error.error?.message || response.statusText}`);
  }
  
  const data = await response.json();
  const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const tokens = data.usageMetadata?.totalTokenCount || 0;
  
  return {
    answer,
    tokens,
    latency: 0,
    model: request.model,
    citations: extractCitations(answer, request.context),
  };
}

/**
 * Anthropic Claude Integration
 */
async function callClaude(request: LLMRequest): Promise<LLMResponse> {
  if (!request.apiKey) {
    throw new Error('Claude API key required');
  }
  
  const prompt = buildPrompt(request);
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': request.apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: request.model,
      max_tokens: request.maxTokens ?? 2048,
      temperature: request.temperature ?? 0.7,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Claude error: ${error.error?.message || response.statusText}`);
  }
  
  const data = await response.json();
  const answer = data.content?.[0]?.text || '';
  const tokens = data.usage?.input_tokens + data.usage?.output_tokens || 0;
  
  return {
    answer,
    tokens,
    latency: 0,
    model: request.model,
    citations: extractCitations(answer, request.context),
  };
}

/**
 * Build prompt with RAG context
 */
function buildPrompt(request: LLMRequest): string {
  let prompt = "You are a helpful assistant analyzing documents.\n\n";
  
  // Add RAG context if available
  if (request.context && request.context.length > 0) {
    prompt += "Context from documents:\n";
    request.context.forEach((chunk, i) => {
      prompt += `[${i+1}] ${chunk}\n\n`;
    });
    prompt += "\n";
  }
  
  prompt += `Question: ${request.prompt}\n\n`;
  
  if (request.context && request.context.length > 0) {
    prompt += "Answer based on the context provided above. Include citations like [1], [2] when referencing specific information from the context.\n";
  } else {
    prompt += "Provide a helpful and accurate answer.\n";
  }
  
  return prompt;
}

/**
 * Build messages format (for OpenAI-compatible APIs)
 */
function buildMessages(request: LLMRequest): Array<{ role: string; content: string }> {
  const messages: Array<{ role: string; content: string }> = [];
  
  // System message
  messages.push({
    role: 'system',
    content: 'You are a helpful assistant analyzing documents. When context is provided, answer based on that context and include citations like [1], [2].'
  });
  
  // Add RAG context if available
  if (request.context && request.context.length > 0) {
    let contextMessage = "Context from documents:\n";
    request.context.forEach((chunk, i) => {
      contextMessage += `[${i+1}] ${chunk}\n\n`;
    });
    
    messages.push({
      role: 'user',
      content: contextMessage
    });
  }
  
  // User question
  messages.push({
    role: 'user',
    content: request.prompt
  });
  
  return messages;
}

/**
 * Extract citations from LLM response
 */
function extractCitations(
  answer: string,
  context?: string[]
): Array<{ chunkIndex: number; text: string; source: string }> {
  if (!context || context.length === 0) {
    return [];
  }
  
  const citations: Array<{ chunkIndex: number; text: string; source: string }> = [];
  const citationRegex = /\[(\d+)\]/g;
  let match;
  
  while ((match = citationRegex.exec(answer)) !== null) {
    const index = parseInt(match[1]) - 1;
    if (index >= 0 && index < context.length) {
      citations.push({
        chunkIndex: index,
        text: context[index].substring(0, 100) + '...',
        source: `Chunk ${index + 1}`
      });
    }
  }
  
  return citations;
}

/**
 * Stream response from LLM (for real-time display)
 */
export async function* streamLLM(request: LLMRequest): AsyncGenerator<LLMStreamChunk> {
  if (request.provider === 'ollama') {
    yield* streamOllama(request);
  } else if (request.provider === 'openai') {
    yield* streamOpenAI(request);
  } else {
    // Fallback: call non-streaming and yield full response
    const response = await callLLM(request);
    yield { text: response.answer, done: true, tokens: response.tokens };
  }
}

/**
 * Stream from Ollama
 */
async function* streamOllama(request: LLMRequest): AsyncGenerator<LLMStreamChunk> {
  const prompt = buildPrompt(request);
  
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: request.model,
      prompt,
      stream: true,
      options: {
        temperature: request.temperature ?? 0.7,
        num_predict: request.maxTokens ?? 2048,
      }
    })
  });
  
  if (!response.ok) {
    throw new Error(`Ollama error: ${response.statusText}`);
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
      if (line.trim()) {
        try {
          const data = JSON.parse(line);
          yield {
            text: data.response,
            done: data.done,
            tokens: data.eval_count
          };
        } catch (e) {
          console.error('Failed to parse stream chunk:', e);
        }
      }
    }
  }
}

/**
 * Stream from OpenAI
 */
async function* streamOpenAI(request: LLMRequest): AsyncGenerator<LLMStreamChunk> {
  if (!request.apiKey) {
    throw new Error('OpenAI API key required');
  }
  
  const messages = buildMessages(request);
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${request.apiKey}`
    },
    body: JSON.stringify({
      model: request.model,
      messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 2048,
      stream: true,
    })
  });
  
  if (!response.ok) {
    throw new Error(`OpenAI error: ${response.statusText}`);
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
          const content = json.choices[0]?.delta?.content;
          if (content) {
            yield { text: content, done: false };
          }
        } catch (e) {
          console.error('Failed to parse stream chunk:', e);
        }
      }
    }
  }
}

/**
 * Test connection to provider
 */
export async function testConnection(
  provider: string,
  apiKey?: string
): Promise<{ success: boolean; message: string; performance?: string }> {
  try {
    if (provider === 'ollama') {
      const response = await fetch('http://localhost:11434/api/tags');
      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          message: `Connected to Ollama (${data.models?.length || 0} models available)`,
          performance: '~20-30 tokens/sec (CPU)'
        };
      } else {
        return {
          success: false,
          message: 'Ollama not running. Start Ollama and try again.'
        };
      }
    } else if (provider === 'openai') {
      if (!apiKey) {
        return { success: false, message: 'API key required' };
      }
      
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      
      if (response.ok) {
        return {
          success: true,
          message: 'Connected to OpenAI',
          performance: '~40-60 tokens/sec (cloud)'
        };
      } else {
        return { success: false, message: 'Invalid API key' };
      }
    }
    
    return { success: true, message: 'Provider configured' };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Connection failed'
    };
  }
}
