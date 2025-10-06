/**
 * Advanced Model Selection Panel v2
 * - HuggingFace model discovery
 * - LM Studio/Vulkan prioritized
 * - NPU support (DirectML for Intel/AMD)
 * - Local model scanning
 */

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  Brain, Server, Cloud, Zap, Settings2, Download,
  Check, X, Loader2, Eye, EyeOff, RefreshCw, Search, Cpu, Gpu
} from 'lucide-react';
import { 
  getRecommendedModels, 
  scanLocalModels, 
  downloadModel,
  initHFToken,
  type HFModel 
} from '../services/huggingfaceService';

interface ModelConfig {
  // Provider selection
  provider: 'lmstudio' | 'vulkan-bare' | 'ollama' | 'openai' | 'gemini' | 'claude';
  model: string;
  
  // Hardware acceleration
  useVulkan: boolean;
  useNPU: boolean;  // DirectML for Intel/AMD
  useGPU: boolean;
  
  // Advanced settings
  temperature: number;
  maxTokens: number;
  contextLength: number;
  
  // API keys (cloud only)
  apiKey?: string;
  hfToken?: string;
}

export const AdvancedModelPanel: React.FC = () => {
  const [config, setConfig] = useState<ModelConfig>({
    provider: 'lmstudio', // Default to LM Studio
    model: '',
    useVulkan: true, // Enable Vulkan by default
    useNPU: false,
    useGPU: true,
    temperature: 0.7,
    maxTokens: 2048,
    contextLength: 8192
  });
  
  const [hfModels, setHFModels] = useState<HFModel[]>([]);
  const [localModels, setLocalModels] = useState<HFModel[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'ready' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showHFToken, setShowHFToken] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'local' | 'huggingface' | 'cloud'>('local');
  
  // Load config from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('qsm_advanced_model_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig(parsed);
        
        // Initialize HF token if present
        if (parsed.hfToken) {
          initHFToken(parsed.hfToken).catch(console.error);
        }
      } catch (e) {
        console.error('Failed to load model config:', e);
      }
    }
    
    // Auto-scan local models
    scanLocalModelsAsync();
  }, []);
  
  // Save config to localStorage
  const saveConfig = (newConfig: ModelConfig) => {
    setConfig(newConfig);
    localStorage.setItem('qsm_advanced_model_config', JSON.stringify(newConfig));
  };
  
  // Scan local LM Studio models
  const scanLocalModelsAsync = async () => {
    try {
      const models = await scanLocalModels();
      setLocalModels(models);
      
      // Auto-select first local model if none selected
      if (!config.model && models.length > 0) {
        saveConfig({ ...config, model: models[0].id });
      }
    } catch (e) {
      console.error('Failed to scan local models:', e);
    }
  };
  
  // Discover models from HuggingFace
  const discoverHFModels = async () => {
    setIsLoadingModels(true);
    try {
      const models = await getRecommendedModels();
      setHFModels(models);
      setStatus('ready');
      setStatusMessage(`Found ${models.length} recommended models`);
    } catch (e) {
      setStatus('error');
      setStatusMessage(e instanceof Error ? e.message : 'Failed to load models');
    } finally {
      setIsLoadingModels(false);
    }
  };
  
  // Download model from HuggingFace
  const handleDownloadModel = async (modelId: string) => {
    setIsDownloading(true);
    setDownloadProgress(0);
    
    try {
      await downloadModel(modelId, (progress) => {
        setDownloadProgress(progress);
      });
      
      setStatus('ready');
      setStatusMessage(`Model ${modelId} downloaded successfully`);
      
      // Rescan local models
      await scanLocalModelsAsync();
      
      // Auto-select downloaded model
      saveConfig({ ...config, model: `local/${modelId}` });
    } catch (e) {
      setStatus('error');
      setStatusMessage(e instanceof Error ? e.message : 'Download failed');
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };
  
  // Test connection to selected provider
  const handleTestConnection = async () => {
    setStatus('connecting');
    setStatusMessage('Testing connection...');
    
    try {
      if (config.provider === 'lmstudio') {
        // Test LM Studio API (OpenAI-compatible)
        const response = await fetch('http://localhost:1234/v1/models');
        if (response.ok) {
          const data = await response.json();
          setStatus('ready');
          setStatusMessage(`LM Studio ready (${data.data?.length || 0} models loaded)`);
        } else {
          setStatus('error');
          setStatusMessage('LM Studio not running. Please start LM Studio.');
        }
      } else if (config.provider === 'vulkan-bare') {
        // Check if Vulkan is available (via system info)
        const hasVulkan = await checkVulkanSupport();
        if (hasVulkan) {
          setStatus('ready');
          setStatusMessage('Vulkan backend available');
        } else {
          setStatus('error');
          setStatusMessage('Vulkan not detected. Install latest GPU drivers.');
        }
      } else if (config.provider === 'ollama') {
        // Test Ollama
        const response = await fetch('http://localhost:11434/api/tags');
        if (response.ok) {
          setStatus('ready');
          setStatusMessage('Ollama ready');
        } else {
          setStatus('error');
          setStatusMessage('Ollama not running');
        }
      }
    } catch (error) {
      setStatus('error');
      setStatusMessage(error instanceof Error ? error.message : 'Connection failed');
    }
  };
  
  // Check Vulkan support
  const checkVulkanSupport = async (): Promise<boolean> => {
    // TODO: Implement actual Vulkan detection via Electron API
    // For now, assume available if GPU detected
    return config.useGPU;
  };
  
  // Save HuggingFace token
  const handleSaveHFToken = async () => {
    if (config.hfToken) {
      try {
        await initHFToken(config.hfToken);
        setStatus('ready');
        setStatusMessage('HuggingFace token validated ✓');
        
        // Auto-discover models
        await discoverHFModels();
      } catch (e) {
        setStatus('error');
        setStatusMessage('Invalid HuggingFace token');
      }
    }
  };
  
  const getPerformanceColor = (perf: string) => {
    switch (perf) {
      case 'very-fast': return 'text-green-600';
      case 'fast': return 'text-blue-600';
      case 'medium': return 'text-yellow-600';
      case 'slow': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };
  
  return (
    <div className="bg-white rounded-lg border p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          AI Model Settings (Advanced)
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Auto-discover and manage AI models with hardware acceleration
        </p>
      </div>
      
      {/* Provider Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Inference Provider
        </label>
        <select
          value={config.provider}
          onChange={(e) => saveConfig({ ...config, provider: e.target.value as any })}
          className="w-full border rounded-lg p-2"
        >
          <optgroup label="Local (Recommended)">
            <option value="lmstudio">🎯 LM Studio + Vulkan (Best)</option>
            <option value="vulkan-bare">⚡ Vulkan Bare Metal</option>
            <option value="ollama">🦙 Ollama</option>
          </optgroup>
          <optgroup label="Cloud (Paid)">
            <option value="openai">☁️ OpenAI (GPT-4o)</option>
            <option value="gemini">☁️ Google Gemini</option>
            <option value="claude">☁️ Anthropic Claude</option>
          </optgroup>
        </select>
        
        {config.provider === 'lmstudio' && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            ✅ <strong>Best choice!</strong> LM Studio with Vulkan gives best performance on your AMD RX 580.
            Make sure LM Studio is running and Vulkan is enabled in Settings.
          </div>
        )}
        
        {config.provider === 'vulkan-bare' && (
          <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            ⚠️ <strong>Experimental!</strong> Direct Vulkan backend without LM Studio overhead.
            Requires manual model loading and configuration.
          </div>
        )}
      </div>
      
      {/* HuggingFace Token */}
      <div className="border-t pt-4">
        <label className="block text-sm font-medium mb-2">
          🤗 HuggingFace Token (Optional)
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type={showHFToken ? 'text' : 'password'}
              value={config.hfToken || ''}
              onChange={(e) => saveConfig({ ...config, hfToken: e.target.value })}
              placeholder="hf_..."
              className="pr-10"
            />
            <button
              onClick={() => setShowHFToken(!showHFToken)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showHFToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <Button onClick={handleSaveHFToken} variant="outline">
            <Check className="h-4 w-4 mr-1" />
            Verify
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Get token from: <a href="https://huggingface.co/settings/tokens" target="_blank" className="text-blue-600">huggingface.co/settings/tokens</a>
        </p>
      </div>
      
      {/* Model Selection Tabs */}
      <div className="border-t pt-4">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSelectedTab('local')}
            className={`px-4 py-2 rounded-lg ${
              selectedTab === 'local' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Server className="h-4 w-4 inline mr-1" />
            Local Models ({localModels.length})
          </button>
          <button
            onClick={() => setSelectedTab('huggingface')}
            className={`px-4 py-2 rounded-lg ${
              selectedTab === 'huggingface' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Search className="h-4 w-4 inline mr-1" />
            HuggingFace ({hfModels.length})
          </button>
          {(config.provider === 'openai' || config.provider === 'gemini' || config.provider === 'claude') && (
            <button
              onClick={() => setSelectedTab('cloud')}
              className={`px-4 py-2 rounded-lg ${
                selectedTab === 'cloud' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Cloud className="h-4 w-4 inline mr-1" />
              Cloud
            </button>
          )}
        </div>
        
        {/* Local Models Tab */}
        {selectedTab === 'local' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Your Downloaded Models</span>
              <Button size="sm" variant="outline" onClick={scanLocalModelsAsync}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </div>
            
            {localModels.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Server className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No local models found</p>
                <p className="text-xs">Download models from HuggingFace tab</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {localModels.map(model => (
                  <div
                    key={model.id}
                    onClick={() => saveConfig({ ...config, model: model.id })}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      config.model === model.id
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium flex items-center gap-2">
                          {model.name}
                          {model.recommended && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                              ⭐ Recommended
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Size: {model.size} • Quant: {model.quantization || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 flex gap-3">
                          <span className={getPerformanceColor(model.performance.cpu)}>
                            <Cpu className="h-3 w-3 inline mr-1" />
                            CPU: {model.performance.cpu}
                          </span>
                          <span className={getPerformanceColor(model.performance.gpu)}>
                            <Gpu className="h-3 w-3 inline mr-1" />
                            GPU: {model.performance.gpu}
                          </span>
                          {model.performance.npu === 'supported' && (
                            <span className="text-purple-600">
                              ⚡ NPU Ready
                            </span>
                          )}
                        </div>
                        {model.recommendReason && (
                          <div className="text-xs text-green-600 mt-1">
                            💡 {model.recommendReason}
                          </div>
                        )}
                      </div>
                      {config.model === model.id && (
                        <Check className="h-5 w-5 text-purple-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* HuggingFace Models Tab */}
        {selectedTab === 'huggingface' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Recommended for RAG/Q&A</span>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={discoverHFModels}
                disabled={isLoadingModels}
              >
                {isLoadingModels ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-1" />
                    Discover Models
                  </>
                )}
              </Button>
            </div>
            
            {hfModels.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Click "Discover Models" to find recommended models</p>
                <p className="text-xs">Optimized for your AMD 5700X CPU + RX 580 GPU</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {hfModels.map(model => (
                  <div
                    key={model.id}
                    className="border rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium flex items-center gap-2">
                          {model.name}
                          {model.recommended && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                              ⭐ Recommended
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          by {model.author} • {model.size} • {model.quantization || 'FP16'}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          📥 {(model.downloads / 1000).toFixed(0)}k downloads • 
                          ❤️ {model.likes} likes • 
                          📄 {(model.contextLength / 1000).toFixed(0)}k context
                        </div>
                        <div className="text-xs text-gray-400 mt-1 flex gap-3">
                          <span className={getPerformanceColor(model.performance.cpu)}>
                            <Cpu className="h-3 w-3 inline mr-1" />
                            CPU: {model.performance.cpu}
                          </span>
                          <span className={getPerformanceColor(model.performance.gpu)}>
                            <Gpu className="h-3 w-3 inline mr-1" />
                            GPU: {model.performance.gpu}
                          </span>
                          {model.performance.npu === 'supported' && (
                            <span className="text-purple-600">
                              ⚡ NPU Ready
                            </span>
                          )}
                        </div>
                        {model.recommendReason && (
                          <div className="text-xs text-green-600 mt-1">
                            💡 {model.recommendReason}
                          </div>
                        )}
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleDownloadModel(model.id)}
                        disabled={isDownloading}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {isDownloading && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Downloading model...</span>
                  <span className="text-sm text-gray-600">{downloadProgress.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all" 
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Cloud Models Tab */}
        {selectedTab === 'cloud' && (
          <div className="space-y-3">
            <Input
              type={showApiKey ? 'text' : 'password'}
              value={config.apiKey || ''}
              onChange={(e) => saveConfig({ ...config, apiKey: e.target.value })}
              placeholder="Enter API key"
            />
            {/* Add cloud model selection here */}
          </div>
        )}
      </div>
      
      {/* Hardware Acceleration */}
      <div className="border-t pt-4 space-y-3">
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
            ⚡ Enable Vulkan (1.5-2x speedup on AMD RX 580)
          </label>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="useNPU"
            checked={config.useNPU}
            onChange={(e) => saveConfig({ ...config, useNPU: e.target.checked })}
            className="rounded"
          />
          <label htmlFor="useNPU" className="text-sm">
            🚀 Enable NPU (DirectML for Intel/AMD with NPU)
          </label>
        </div>
        
        {config.useNPU && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm text-purple-800">
            💡 <strong>NPU Support:</strong> DirectML enables AI acceleration on modern Intel/AMD CPUs with NPU.
            Your AMD 5700X doesn't have NPU, but customer PCs with newer CPUs may benefit.
          </div>
        )}
      </div>
      
      {/* Advanced Settings */}
      <div className="border-t pt-4 space-y-3">
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
      <div className="border-t pt-4 space-y-2">
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

export default AdvancedModelPanel;
