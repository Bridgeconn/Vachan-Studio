// src/utils/modelHelpers.ts

import { STT_MODELS_DATA } from '@/config/sttModels';

export interface Language {
  lang_code: string;
  lang_name: string;
  lang_id: number;
}

export interface Model {
  name: string;
  version: number;
  status: string;
  tags: {
    model_type: string;
    [key: string]: string;
  };
  description: string;
  languages: Language[];
}

// Get all unique languages across all models
export function getAllLanguages(): Language[] {
  const languageMap = new Map<string, Language>();

  STT_MODELS_DATA.forEach((model: Model) => {
    model.languages.forEach((lang) => {
      if (!languageMap.has(lang.lang_code)) {
        languageMap.set(lang.lang_code, lang);
      }
    });
  });

  // Sort alphabetically by language name
  return Array.from(languageMap.values()).sort((a, b) =>
    a.lang_name.localeCompare(b.lang_name)
  );
}

// Get models that support a specific language
export function getModelsForLanguage(langCode: string): Model[] {
  return STT_MODELS_DATA.filter((model: Model) =>
    model.languages.some((lang) => lang.lang_code === langCode)
  );
}

// Get recommended model for a language (priority order)
export function getRecommendedModel(langCode: string): Model | null {
  const models = getModelsForLanguage(langCode);
  
  // Priority order
  const priority = ['mms-1b-all', 'mms-finetuned', 'omniASR_CTC_1B'];
  
  for (const modelName of priority) {
    const model = models.find((m) => m.name === modelName);
    if (model) return model;
  }
  
  return models[0] || null;
}

// Check if model supports timestamps
export function supportsTimestamp(modelName: string): boolean {
  return modelName === 'mms-1b-all';
}

// Get display name for model
export function getModelDisplayName(modelName: string): string {
  const displayNames: Record<string, string> = {
    'mms-1b-all': 'MMS 1B All',
    'mms-finetuned': 'MMS Finetuned',
    'omniASR_CTC_1B': 'Omni ASR CTC 1B'
  };
  return displayNames[modelName] || modelName;
}