import { useState } from 'react';

export interface OcrConfig {
  resolution: 'low' | 'medium' | 'high';
  language: 'vietnamese' | 'english' | 'mixed';
  accuracy: 'speed' | 'balanced' | 'accuracy';
}

const DEFAULT_CONFIG: OcrConfig = {
  resolution: 'medium',
  language: 'mixed',
  accuracy: 'balanced'
};

export const useOcrConfig = () => {
  const [config, setConfig] = useState<OcrConfig>(DEFAULT_CONFIG);

  const updateConfig = (newConfig: Partial<OcrConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG);
  };

  const getReadableConfig = () => {
    const resolutionMap = {
      low: 'Thấp (nhanh)',
      medium: 'Trung bình',
      high: 'Cao (chính xác)'
    };

    const languageMap = {
      vietnamese: 'Tiếng Việt',
      english: 'Tiếng Anh',
      mixed: 'Hỗn hợp'
    };

    const accuracyMap = {
      speed: 'Tốc độ',
      balanced: 'Cân bằng',
      accuracy: 'Độ chính xác'
    };

    return {
      resolution: resolutionMap[config.resolution],
      language: languageMap[config.language],
      accuracy: accuracyMap[config.accuracy]
    };
  };

  return {
    config,
    updateConfig,
    resetConfig,
    readableConfig: getReadableConfig()
  };
};
