/**
 * Cloud API Keys Configuration Component
 * Manages API keys for OpenAI, Google Gemini, Anthropic Claude, Azure
 */

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  Key, Eye, EyeOff, Save, Check, X,
  AlertCircle, Cloud, Loader2
} from 'lucide-react';

interface APIKeys {
  openai?: string;
  gemini?: string;
  claude?: string;
  azure?: string;
  azureEndpoint?: string;
  huggingface?: string;
}

interface APIKeyStatus {
  provider: string;
  hasKey: boolean;
  isValid?: boolean;
  lastTested?: Date;
}

export const CloudAPIKeysConfig: React.FC = () => {
  const [keys, setKeys] = useState<APIKeys>({});
  const [showKeys, setShowKeys] = useState<{[key: string]: boolean}>({});
  const [statuses, setStatuses] = useState<APIKeyStatus[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState<{[key: string]: boolean}>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load keys from localStorage on mount
  useEffect(() => {
    loadKeys();
  }, []);

  /**
   * Load API keys from localStorage
   */
  const loadKeys = () => {
    try {
      const stored = localStorage.getItem('qsm_cloud_api_keys');
      if (stored) {
        const parsed = JSON.parse(stored);
        setKeys(parsed);
        
        // Update statuses
        const newStatuses: APIKeyStatus[] = [
          { provider: 'OpenAI', hasKey: !!parsed.openai },
          { provider: 'Google Gemini', hasKey: !!parsed.gemini },
          { provider: 'Anthropic Claude', hasKey: !!parsed.claude },
          { provider: 'Azure OpenAI', hasKey: !!parsed.azure },
          { provider: 'HuggingFace', hasKey: !!parsed.huggingface },
        ];
        setStatuses(newStatuses);
      }
    } catch (e) {
      console.error('Failed to load API keys:', e);
    }
  };

  /**
   * Save API keys to localStorage
   */
  const saveKeys = () => {
    setIsSaving(true);
    try {
      localStorage.setItem('qsm_cloud_api_keys', JSON.stringify(keys));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      
      // Update statuses
      loadKeys();
    } catch (e) {
      console.error('Failed to save API keys:', e);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Test API key validity
   */
  const testAPIKey = async (provider: string) => {
    setIsTesting({ ...isTesting, [provider]: true });
    
    try {
      let isValid = false;
      
      switch (provider) {
        case 'openai':
          isValid = await testOpenAI(keys.openai!);
          break;
        case 'gemini':
          isValid = await testGemini(keys.gemini!);
          break;
        case 'claude':
          isValid = await testClaude(keys.claude!);
          break;
        case 'azure':
          isValid = await testAzure(keys.azure!, keys.azureEndpoint!);
          break;
        case 'huggingface':
          isValid = await testHuggingFace(keys.huggingface!);
          break;
      }
      
      // Update status
      const newStatuses = statuses.map(s => {
        if (s.provider.toLowerCase().replace(/\s/g, '') === provider.replace('huggingface', 'huggingface')) {
          return { ...s, isValid, lastTested: new Date() };
        }
        return s;
      });
      setStatuses(newStatuses);
      
    } catch (e) {
      console.error(`Failed to test ${provider}:`, e);
    } finally {
      setIsTesting({ ...isTesting, [provider]: false });
    }
  };

  /**
   * Test OpenAI API key
   */
  const testOpenAI = async (apiKey: string): Promise<boolean> => {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  /**
   * Test Google Gemini API key
   */
  const testGemini = async (apiKey: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      );
      return response.ok;
    } catch {
      return false;
    }
  };

  /**
   * Test Anthropic Claude API key
   */
  const testClaude = async (apiKey: string): Promise<boolean> => {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'test' }]
        })
      });
      return response.ok || response.status === 400; // 400 = valid key, invalid request
    } catch {
      return false;
    }
  };

  /**
   * Test Azure OpenAI API key
   */
  const testAzure = async (apiKey: string, endpoint: string): Promise<boolean> => {
    if (!endpoint) return false;
    
    try {
      const response = await fetch(`${endpoint}/openai/deployments?api-version=2023-05-15`, {
        headers: {
          'api-key': apiKey
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  /**
   * Test HuggingFace API key
   */
  const testHuggingFace = async (apiKey: string): Promise<boolean> => {
    try {
      const response = await fetch('https://huggingface.co/api/whoami-v2', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  /**
   * Toggle show/hide key
   */
  const toggleShowKey = (provider: string) => {
    setShowKeys({ ...showKeys, [provider]: !showKeys[provider] });
  };

  /**
   * Update key value
   */
  const updateKey = (provider: string, value: string) => {
    setKeys({ ...keys, [provider]: value });
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg border">
      <div className="flex items-center gap-3 border-b pb-4">
        <Cloud className="w-6 h-6 text-blue-600" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Cloud AI Configuration</h2>
          <p className="text-sm text-gray-600 mt-1">
            Configure API keys for cloud AI providers
          </p>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {statuses.map(status => (
          <div 
            key={status.provider}
            className={`p-3 rounded-lg border ${
              status.hasKey 
                ? status.isValid === true
                  ? 'bg-green-50 border-green-200'
                  : status.isValid === false
                  ? 'bg-red-50 border-red-200'
                  : 'bg-blue-50 border-blue-200'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="text-xs font-semibold text-gray-700 mb-1">
              {status.provider}
            </div>
            <div className="flex items-center gap-1">
              {status.hasKey ? (
                status.isValid === true ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-green-700">Valid</span>
                  </>
                ) : status.isValid === false ? (
                  <>
                    <X className="w-4 h-4 text-red-600" />
                    <span className="text-xs text-red-700">Invalid</span>
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4 text-blue-600" />
                    <span className="text-xs text-blue-700">Configured</span>
                  </>
                )
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">Not set</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* API Key Inputs */}
      <div className="space-y-4">
        {/* OpenAI */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            OpenAI API Key
            <a 
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-xs font-normal"
            >
              (Get key)
            </a>
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                type={showKeys.openai ? 'text' : 'password'}
                value={keys.openai || ''}
                onChange={(e) => updateKey('openai', e.target.value)}
                placeholder="sk-..."
                className="pr-10"
              />
              <button
                onClick={() => toggleShowKey('openai')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showKeys.openai ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => testAPIKey('openai')}
              disabled={!keys.openai || isTesting.openai}
            >
              {isTesting.openai ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Test'
              )}
            </Button>
          </div>
        </div>

        {/* Google Gemini */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            Google Gemini API Key
            <a 
              href="https://makersuite.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-xs font-normal"
            >
              (Get key)
            </a>
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                type={showKeys.gemini ? 'text' : 'password'}
                value={keys.gemini || ''}
                onChange={(e) => updateKey('gemini', e.target.value)}
                placeholder="AIza..."
                className="pr-10"
              />
              <button
                onClick={() => toggleShowKey('gemini')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showKeys.gemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => testAPIKey('gemini')}
              disabled={!keys.gemini || isTesting.gemini}
            >
              {isTesting.gemini ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Test'
              )}
            </Button>
          </div>
        </div>

        {/* Anthropic Claude */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            Anthropic Claude API Key
            <a 
              href="https://console.anthropic.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-xs font-normal"
            >
              (Get key)
            </a>
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                type={showKeys.claude ? 'text' : 'password'}
                value={keys.claude || ''}
                onChange={(e) => updateKey('claude', e.target.value)}
                placeholder="sk-ant-..."
                className="pr-10"
              />
              <button
                onClick={() => toggleShowKey('claude')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showKeys.claude ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => testAPIKey('claude')}
              disabled={!keys.claude || isTesting.claude}
            >
              {isTesting.claude ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Test'
              )}
            </Button>
          </div>
        </div>

        {/* Azure OpenAI */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            Azure OpenAI
            <a 
              href="https://portal.azure.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-xs font-normal"
            >
              (Azure Portal)
            </a>
          </label>
          <Input
            type="text"
            value={keys.azureEndpoint || ''}
            onChange={(e) => updateKey('azureEndpoint', e.target.value)}
            placeholder="https://your-resource.openai.azure.com"
            className="mb-2"
          />
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                type={showKeys.azure ? 'text' : 'password'}
                value={keys.azure || ''}
                onChange={(e) => updateKey('azure', e.target.value)}
                placeholder="API Key"
                className="pr-10"
              />
              <button
                onClick={() => toggleShowKey('azure')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showKeys.azure ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => testAPIKey('azure')}
              disabled={!keys.azure || !keys.azureEndpoint || isTesting.azure}
            >
              {isTesting.azure ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Test'
              )}
            </Button>
          </div>
        </div>

        {/* HuggingFace */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            HuggingFace Token
            <a 
              href="https://huggingface.co/settings/tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-xs font-normal"
            >
              (Get token)
            </a>
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                type={showKeys.huggingface ? 'text' : 'password'}
                value={keys.huggingface || ''}
                onChange={(e) => updateKey('huggingface', e.target.value)}
                placeholder="hf_..."
                className="pr-10"
              />
              <button
                onClick={() => toggleShowKey('huggingface')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showKeys.huggingface ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => testAPIKey('huggingface')}
              disabled={!keys.huggingface || isTesting.huggingface}
            >
              {isTesting.huggingface ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Test'
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-sm text-gray-600">
          <AlertCircle className="w-4 h-4 inline mr-1" />
          Keys are stored locally in your browser
        </div>
        <Button
          onClick={saveKeys}
          disabled={isSaving}
          className="px-6"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : saveSuccess ? (
            <Check className="w-4 h-4 mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {saveSuccess ? 'Saved!' : 'Save Keys'}
        </Button>
      </div>
    </div>
  );
};
