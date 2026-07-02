// src/utils/tttModelHelpers.ts

import { TTT_MODELS_DATA } from '@/config/tttModels';

export interface TTTLanguage {
  lang_code: string;
  lang_name: string;
  lang_id: number;
}

export interface TTTModel {
  name: string;
  version: number;
  status: string;
  tags: {
    model_type: string;
    [key: string]: string;
  };
  description: string;
  languages: TTTLanguage[];
}

// Get all unique languages across all TTT models
export function getTTTLanguages(): TTTLanguage[] {
  const languageMap = new Map<string, TTTLanguage>();

  TTT_MODELS_DATA.forEach((model: TTTModel) => {
    model.languages.forEach((lang) => {
      if (!languageMap.has(lang.lang_code)) {
        languageMap.set(lang.lang_code, lang);
      }
    });
  });

  return Array.from(languageMap.values()).sort((a, b) =>
    a.lang_name.localeCompare(b.lang_name)
  );
}

// Get models that support a specific source+target language pair
export function getModelsForLanguagePair(
  sourceLangCode: string,
  targetLangCode: string
): TTTModel[] {
  return TTT_MODELS_DATA.filter((model: TTTModel) => {
    const langCodes = model.languages.map((l) => l.lang_code);
    return (
      langCodes.includes(sourceLangCode) && langCodes.includes(targetLangCode)
    );
  });
}

// Get models that support a specific language (either source or target)
export function getModelsForLanguage(langCode: string): TTTModel[] {
  return TTT_MODELS_DATA.filter((model: TTTModel) =>
    model.languages.some((l) => l.lang_code === langCode)
  );
}

// Get recommended model for a language pair
// Prefers finetuned model with exact language match, falls back to nllb-600M
export function getRecommendedTTTModel(
  sourceLangCode: string,
  targetLangCode: string
): TTTModel | null {
  const models = getModelsForLanguagePair(sourceLangCode, targetLangCode);
  if (models.length === 0) return null;

  // Prefer finetuned model (has exactly these 2 languages)
  const finetuned = models.find(
    (m) =>
      m.languages.length === 2 &&
      m.tags.model_type?.includes('finetuned')
  );
  if (finetuned) return finetuned;

  // Prefer nllb-600M over nllb-1.3B for general use
  const nllb600 = models.find((m) => m.name === 'nllb-600M');
  if (nllb600) return nllb600;

  return models[0];
}

// Check if a model is bidirectional
// A model is bidirectional if it supports more than 2 languages
// OR if it's a finetuned model — we assume it works both ways
export function isBidirectional(model: TTTModel): boolean {
  return model.languages.length >= 2;
}

// Get target languages available for a given source language and model
export function getTargetLanguages(
  sourceLangCode: string,
  modelName?: string
): TTTLanguage[] {
  let models: TTTModel[];

  if (modelName) {
    models = TTT_MODELS_DATA.filter((m: TTTModel) => m.name === modelName);
  } else {
    models = getModelsForLanguage(sourceLangCode);
  }

  const languageMap = new Map<string, TTTLanguage>();

  models.forEach((model) => {
    model.languages.forEach((lang) => {
      if (
        lang.lang_code !== sourceLangCode &&
        !languageMap.has(lang.lang_code)
      ) {
        languageMap.set(lang.lang_code, lang);
      }
    });
  });

  return Array.from(languageMap.values()).sort((a, b) =>
    a.lang_name.localeCompare(b.lang_name)
  );
}