/**
 * Model Selection Panel - COMPACT VERSION with Ollama API Integration
 */

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { 
  Brain, Server, ChevronDown, ChevronRight, Check, Loader2, RefreshCw
} from 'lucide-react';

interface OllamaModel {
  name: string;
  size: number;
  modified_at: string;
}

export const ModelSelectionPanel: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('llama3.2');
  const [ollamaModels, setOllamaModels] = useState<OllamaModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');

  // Load saved config
  useEffect(() => {
    const saved = localStorage.getItem('qsm_selected_model');
    if (saved) setSelectedModel(saved);
    
    const savedUrl = localStorage.getItem('qsm_ollama_url');
    if (savedUrl) setOllamaUrl(savedUrl);
  }, []);

  // Fetch Ollama models on mount and when URL changes
  useEffect(() => {
    fetchOllamaModels();
  }, [ollamaUrl]);

  const fetchOllamaModels = async () => {
    setIsLoading(true);
    setOllamaStatus('checking');
    
    try {
      const response = await fetch(`${ollamaUrl}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        setOllamaModels(data.models || []);
        setOllamaStatus('online');
        
        // Auto-select first model if none selected
        if (!selectedModel && data.models?.length > 0) {
          const firstModel = data.models[0].name;
          setSelectedModel(firstModel);
          localStorage.setItem('qsm_selected_model', firstModel);
        }
      } else {
        setOllamaStatus('offline');
        setOllamaModels([]);
      }
    } catch (error) {
      console.error('Failed to fetch Ollama models:', error);
      setOllamaStatus('offline');
      setOllamaModels([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModelSelect = (modelName: string) => {
    setSelectedModel(modelName);
    localStorage.setItem('qsm_selected_model', modelName);
  };

  const formatSize = (bytes: number): string => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  };

  const getStatusColor = () => {
    switch (ollamaStatus) {
      case 'online': return 'text-green-600';
      case 'offline': return 'text-red-600';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = () => {
    switch (ollamaStatus) {
      case 'online': return `✅ Connected (${ollamaModels.length} models)`;
      case 'offline': return '❌ Ollama offline';
      default: return '⏳ Checking...';
    }
  };

  return (
    <div className="border-b border-gray-200">
      {/* Collapsed Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <span className="font-semibold">AI Model</span>
          <span className="text-xs text-gray-500">({selectedModel || 'None'})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs ${getStatusColor()}`}>
            {ollamaStatus === 'online' ? '🟢' : ollamaStatus === 'offline' ? '🔴' : '⚪'}
          </span>
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 space-y-3 bg-gray-50">
          {/* Ollama URL Config */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Ollama URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={ollamaUrl}
                onChange={(e) => setOllamaUrl(e.target.value)}
                placeholder="http://localhost:11434"
                className="flex-1 text-sm border rounded px-2 py-1"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={fetchOllamaModels}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">{getStatusText()}</p>
          </div>

          {/* Model List */}
          {ollamaStatus === 'online' && ollamaModels.length > 0 ? (
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-2">
                Select Model ({ollamaModels.length} available)
              </label>
              <div className="space-y-1 max-h-[200px] overflow-y-auto">
                {ollamaModels.map((model) => (
                  <button
                    key={model.name}
                    onClick={() => handleModelSelect(model.name)}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                      selectedModel === model.name
                        ? 'bg-purple-100 border-purple-300 border'
                        : 'bg-white border border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{model.name}</div>
                        <div className="text-xs text-gray-500">
                          {formatSize(model.size)}
                        </div>
                      </div>
                      {selectedModel === model.name && (
                        <Check className="h-4 w-4 text-purple-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : ollamaStatus === 'offline' ? (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
              <p className="font-medium">⚠️ Ollama Not Running</p>
              <p className="text-xs mt-1">Start Ollama with: <code className="bg-red-100 px-1 rounded">ollama serve</code></p>
            </div>
          ) : (
            <div className="text-sm text-gray-500 text-center py-4">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
              Checking Ollama...
            </div>
          )}

          {/* Quick Actions */}
          <div className="text-xs text-gray-500 border-t pt-2">
            <p>💡 <strong>Tip:</strong> Download models with: <code className="bg-gray-200 px-1 rounded">ollama pull llama3.2</code></p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelectionPanel;
