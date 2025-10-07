/**
 * Model Selection Panel - AI Provider & Model Configuration
 * 
 * Supports:
 * - Local: Ollama, LM Studio, Transformers.js
 * - Cloud: OpenAI, Google Gemini, Anthropic Claude
 */

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  Brain, Server, Cloud, Zap, Settings2,
  Check, X, Download, Loader2, Eye, EyeOff
} from 'lucide-react';

interface ModelInfo {
  id: string;
  name: string;
  size: string;
  speed: 'very-fast' | 'fast' | 'medium' | 'slow';
  quality: 'basic' | 'good' | 'high' | 'excellent';
  contextWindow: number;
  downloaded?: boolean;
}

interface Provider {
  id: string;
  name: string;
  type: 'local' | 'cloud';
  icon: React.ReactNode;
  models: ModelInfo[];
  requiresApiKey: boolean;
}

const PROVIDERS: Provider[] = [
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    type: 'local',
    icon: <Server className="h-5 w-5" />,
    requiresApiKey: false,
    models: [
      { id: 'llama3:8b', name: 'Llama 3 8B', size: '4.5 GB', speed: 'fast', quality: 'high', contextWindow: 8192 },
      { id: 'llama3:70b', name: 'Llama 3 70B', size: '40 GB', speed: 'slow', quality: 'excellent', contextWindow: 8192 },
      { id: 'mistral:7b', name: 'Mistral 7B', size: '4.1 GB', speed: 'fast', quality: 'high', contextWindow: 8192 },
      { id: 'gemma2:9b', name: 'Gemma 2 9B', size: '5.4 GB', speed: 'medium', quality: 'high', contextWindow: 8192 },
      { id: 'phi3:mini', name: 'Phi-3 Mini', size: '2.3 GB', speed: 'very-fast', quality: 'good', contextWindow: 4096 },
      { id: 'qwen2:7b', name: 'Qwen 2 7B', size: '4.4 GB', speed: 'fast', quality: 'high', contextWindow: 32768 },
    ]
  },
  {
    id: 'lmstudio',
    name: 'LM Studio (Local)',
    type: 'local',
    icon: <Server className="h-5 w-5" />,
    requiresApiKey: false,
    models: [
      { id: 'llama-3-8b', name: 'Llama 3 8B', size: '4.5 GB', speed: 'fast', quality: 'high', contextWindow: 8192 },
      { id: 'mistral-7b', name: 'Mistral 7B', size: '4.1 GB', speed: 'fast', quality: 'high', contextWindow: 8192 },
      { id: 'phi-3-mini', name: 'Phi-3 Mini', size: '2.3 GB', speed: 'very-fast', quality: 'good', contextWindow: 4096 },
    ]
  },
  {
    id: 'openai',
    name: 'OpenAI (Cloud)',
    type: 'cloud',
    icon: <Cloud className="h-5 w-5" />,
    requiresApiKey: true,
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', size: 'Cloud', speed: 'fast', quality: 'excellent', contextWindow: 128000 },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', size: 'Cloud', speed: 'very-fast', quality: 'high', contextWindow: 128000 },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', size: 'Cloud', speed: 'very-fast', quality: 'good', contextWindow: 16385 },
    ]
  },
  {
    id: 'gemini',
    name: 'Google Gemini (Cloud)',
    type: 'cloud',
    icon: <Cloud className="h-5 w-5" />,
    requiresApiKey: true,
    models: [
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', size: 'Cloud', speed: 'medium', quality: 'excellent', contextWindow: 2097152 },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', size: 'Cloud', speed: 'very-fast', quality: 'high', contextWindow: 1048576 },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', size: 'Cloud', speed: 'very-fast', quality: 'high', contextWindow: 1048576 },
    ]
  },
  {
    id: 'claude',
    name: 'Anthropic Claude (Cloud)',
    type: 'cloud',
    icon: <Cloud className="h-5 w-5" />,
    requiresApiKey: true,
    models: [
      { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', size: 'Cloud', speed: 'fast', quality: 'excellent', contextWindow: 200000 },
      { id: 'claude-3-opus', name: 'Claude 3 Opus', size: 'Cloud', speed: 'medium', quality: 'excellent', contextWindow: 200000 },
      { id: 'claude-3-haiku', name: 'Claude 3 Haiku', size: 'Cloud', speed: 'very-fast', quality: 'good', contextWindow: 200000 },
    ]
  },
];

interface ModelConfig {
  provider: string;
  model: string;
  apiKey?: string;
  useVulkan: boolean;
  useGPU: boolean;
  temperature: number;
  maxTokens: number;
}

export const ModelSelectionPanel: React.FC = () => {
  const [config, setConfig] = useState<ModelConfig>({
    provider: 'ollama',
    model: 'llama3:8b',
    apiKey: '',
    useVulkan: false,
    useGPU: false,
    temperature: 0.7,
    maxTokens: 2048,
  });
  
  const [status, setStatus] = useState<'idle' | 'connecting' | 'ready' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [performanceInfo, setPerformanceInfo] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [downloadingModels, setDownloadingModels] = useState<Set<string>>(new Set());
  
  // Load config from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('qsm_model_config');
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load model config:', e);
      }
    }
  }, []);
  
  // Save config to localStorage
  const saveConfig = (newConfig: ModelConfig) => {
    setConfig(newConfig);
    localStorage.setItem('qsm_model_config', JSON.stringify(newConfig));
  };
  
  const selectedProvider = PROVIDERS.find(p => p.id === config.provider);
  const selectedModel = selectedProvider?.models.find(m => m.id === config.model);
  
  const handleProviderChange = (providerId: string) => {
    const provider = PROVIDERS.find(p => p.id === providerId);
    if (provider) {
      saveConfig({
        ...config,
        provider: providerId,
        model: provider.models[0].id
      });
    }
  };
  
  const handleModelChange = (modelId: string) => {
    saveConfig({ ...config, model: modelId });
  };
  
  const handleTestConnection = async () => {
    setStatus('connecting');
    setStatusMessage('Testing connection...');
    
    try {
      // TODO: Implement actual connection test based on provider
      if (config.provider === 'ollama') {
        // Test Ollama
        const response = await fetch('http://localhost:11434/api/tags');
        if (response.ok) {
          const data = await response.json();
          const modelExists = data.models.some((m: any) => m.name === config.model);
          
          if (modelExists) {
            setStatus('ready');
            setStatusMessage('Connected to Ollama');
            setPerformanceInfo('~20-30 tokens/sec (CPU)');
          } else {
            setStatus('error');
            setStatusMessage(`Model ${config.model} not found. Click "Pull Model" to download.`);
          }
        } else {
          setStatus('error');
          setStatusMessage('Ollama not running. Start Ollama and try again.');
        }
      } else if (config.provider === 'openai') {
        // Test OpenAI
        if (!config.apiKey) {
          setStatus('error');
          setStatusMessage('API key required for OpenAI');
          return;
        }
        
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`
          }
        });
        
        if (response.ok) {
          setStatus('ready');
          setStatusMessage('Connected to OpenAI');
          setPerformanceInfo('Cloud-based, ~40-60 tokens/sec');
        } else {
          setStatus('error');
          setStatusMessage('Invalid API key or network error');
        }
      } else {
        setStatus('ready');
        setStatusMessage('Provider configured');
      }
    } catch (error) {
      setStatus('error');
      setStatusMessage(error instanceof Error ? error.message : 'Connection failed');
    }
  };
  
  const handlePullModel = async (modelId: string) => {
    if (config.provider !== 'ollama') return;
    
    setDownloadingModels(prev => new Set(prev).add(modelId));
    
    try {
      // TODO: Implement actual model download
      // This would use ollama API: POST /api/pull
      console.log(`Downloading model: ${modelId}`);
      
      // Simulate download
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setDownloadingModels(prev => {
        const next = new Set(prev);
        next.delete(modelId);
        return next;
      });
      
      // Refresh model list
      handleTestConnection();
    } catch (error) {
      console.error('Failed to pull model:', error);
      setDownloadingModels(prev => {
        const next = new Set(prev);
        next.delete(modelId);
        return next;
      });
    }
  };
  
  const getSpeedColor = (speed: string) => {
    switch (speed) {
      case 'very-fast': return 'text-green-600';
      case 'fast': return 'text-blue-600';
      case 'medium': return 'text-yellow-600';
      case 'slow': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };
  
  const getQualityStars = (quality: string) => {
    switch (quality) {
      case 'excellent': return '⭐⭐⭐⭐⭐';
      case 'high': return '⭐⭐⭐⭐';
      case 'good': return '⭐⭐⭐';
      case 'basic': return '⭐⭐';
      default: return '⭐';
    }
  };
  
  return (
    <div className="bg-white rounded-lg border p-6 space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          AI Model Settings
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Configure your AI provider and model for querying documents
        </p>
      </div>
      
      {/* Provider Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Provider
        </label>
        <select
          value={config.provider}
          onChange={(e) => handleProviderChange(e.target.value)}
          className="w-full border rounded-lg p-2"
        >
          {PROVIDERS.map(provider => (
            <option key={provider.id} value={provider.id}>
              {provider.name} {provider.type === 'local' ? '(Free)' : '(Paid)'}
            </option>
          ))}
        </select>
      </div>
      
      {/* Model Selection */}
      {selectedProvider && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Model
          </label>
          <div className="space-y-2">
            {selectedProvider.models.map(model => (
              <div
                key={model.id}
                onClick={() => handleModelChange(model.id)}
                className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                  config.model === model.id
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{model.name}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      Size: {model.size} • 
                      <span className={getSpeedColor(model.speed)}> Speed: {model.speed}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Quality: {getQualityStars(model.quality)} • 
                      Context: {(model.contextWindow / 1000).toFixed(0)}k tokens
                    </div>
                  </div>
                  
                  {config.provider === 'ollama' && (
                    <div className="ml-2">
                      {downloadingModels.has(model.id) ? (
                        <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                      ) : model.downloaded ? (
                        <Check className="h-5 w-5 text-green-600" />
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePullModel(model.id);
                          }}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Pull
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* API Key (for cloud providers) */}
      {selectedProvider?.requiresApiKey && (
        <div>
          <label className="block text-sm font-medium mb-2">
            API Key
          </label>
          <div className="relative">
            <Input
              type={showApiKey ? 'text' : 'password'}
              value={config.apiKey}
              onChange={(e) => saveConfig({ ...config, apiKey: e.target.value })}
              placeholder="Enter your API key"
              className="pr-10"
            />
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Get your API key from: {selectedProvider.id === 'openai' && 'platform.openai.com'}
            {selectedProvider.id === 'gemini' && 'makersuite.google.com'}
            {selectedProvider.id === 'claude' && 'console.anthropic.com'}
          </p>
        </div>
      )}
      
      {/* Hardware Acceleration (local only) */}
      {selectedProvider?.type === 'local' && (
        <div className="space-y-3">
          <label className="block text-sm font-medium">
            Hardware Acceleration
          </label>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="useVulkan"
              checked={config.useVulkan}
              onChange={(e) => saveConfig({ ...config, useVulkan: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="useVulkan" className="text-sm">
              Enable Vulkan (Experimental)
            </label>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="useGPU"
              checked={config.useGPU}
              onChange={(e) => saveConfig({ ...config, useGPU: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="useGPU" className="text-sm">
              Use GPU if available (AMD RX 580)
            </label>
          </div>
          
          {config.useGPU && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
              ⚠️ AMD GPU support requires ROCm (Linux only). On Windows, will fallback to CPU.
            </div>
          )}
        </div>
      )}
      
      {/* Advanced Settings */}
      <div className="space-y-3">
        <label className="block text-sm font-medium">
          Advanced Settings
        </label>
        
        <div>
          <label className="text-sm text-gray-600">Temperature: {config.temperature}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={config.temperature}
            onChange={(e) => saveConfig({ ...config, temperature: parseFloat(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>Precise</span>
            <span>Creative</span>
          </div>
        </div>
        
        <div>
          <label className="text-sm text-gray-600">Max Tokens</label>
          <Input
            type="number"
            value={config.maxTokens}
            onChange={(e) => saveConfig({ ...config, maxTokens: parseInt(e.target.value) })}
            min="256"
            max="8192"
            step="256"
          />
        </div>
      </div>
      
      {/* Status */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Status:</span>
          {status === 'idle' && <span className="text-gray-500">⚪ Not tested</span>}
          {status === 'connecting' && (
            <span className="text-blue-600 flex items-center gap-1">
              <Loader2 className="h-4 w-4 animate-spin" />
              Testing...
            </span>
          )}
          {status === 'ready' && <span className="text-green-600">🟢 Ready</span>}
          {status === 'error' && <span className="text-red-600">🔴 Error</span>}
        </div>
        
        {statusMessage && (
          <div className="text-sm text-gray-600">{statusMessage}</div>
        )}
        
        {performanceInfo && status === 'ready' && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Zap className="h-4 w-4 text-yellow-600" />
            {performanceInfo}
          </div>
        )}
      </div>
      
      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={handleTestConnection}
          disabled={status === 'connecting'}
          className="flex-1"
        >
          {status === 'connecting' ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Test Connection
            </>
          )}
        </Button>
        
        <Button variant="outline">
          <Settings2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ModelSelectionPanel;
