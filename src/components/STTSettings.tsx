// src/components/STTSettings.tsx

import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  getAllLanguages, 
  getRecommendedModel, 
  supportsTimestamp,
  getModelDisplayName 
} from '@/utils/modelHelpers';
import type { Language } from '@/utils/modelHelpers';

interface STTSettingsProps {
  selectedLanguage: string;
  selectedModel: string;
  device: string;
  generateTimestamp: boolean;
  timestampFormat: string;
  onLanguageChange: (langCode: string) => void;
  onModelChange: (modelName: string) => void;
  onDeviceChange: (device: string) => void;
  onTimestampChange: (enabled: boolean) => void;
  onTimestampFormatChange: (format: string) => void;
}

export function STTSettings({
  selectedLanguage,
  selectedModel,
  device,
  generateTimestamp,
  timestampFormat,
  onLanguageChange,
  onModelChange,
  onDeviceChange,
  onTimestampChange,
  onTimestampFormatChange,
}: STTSettingsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLanguages(getAllLanguages());
  }, []);

  const handleLanguageSelect = (langCode: string) => {
    onLanguageChange(langCode);
    
    // Auto-select recommended model
    const recommended = getRecommendedModel(langCode);
    if (recommended) {
      onModelChange(recommended.name);
    }
  };

  const filteredLanguages = languages.filter((lang) =>
    lang.lang_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.lang_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedLangName = languages.find(l => l.lang_code === selectedLanguage)?.lang_name || 'Select language';
  const modelSupportsTimestamp = supportsTimestamp(selectedModel);

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex border-b">
        <button className="px-4 py-2 border-b-2 border-primary font-medium text-sm">
          Input
        </button>
        <button className="px-4 py-2 text-muted-foreground text-sm hover:text-foreground">
          Output
        </button>
      </div>

      {/* Language Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Audio Language <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <select
            value={selectedLanguage}
            onChange={(e) => handleLanguageSelect(e.target.value)}
            className="w-full p-2 border rounded-lg text-sm appearance-none pr-8"
          >
            <option value="">Select language</option>
            {filteredLanguages.map((lang) => (
              <option key={lang.lang_code} value={lang.lang_code}>
                {lang.lang_name} ({lang.lang_code})
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Model (Auto-selected) */}
      {selectedLanguage && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Model</label>
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium">{getModelDisplayName(selectedModel)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              ℹ️ Auto-selected for {selectedLangName}
            </p>
          </div>
        </div>
      )}

      {/* Advanced Settings */}
      <div className="border-t pt-4">
        <Button
          variant="ghost"
          className="w-full justify-between p-2 h-auto"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <span className="text-sm font-medium">Advanced Settings</span>
          <ChevronDown 
            className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} 
          />
        </Button>

        {showAdvanced && (
          <div className="space-y-4 mt-4">
            {/* Device */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Device</label>
              <select
                value={device}
                onChange={(e) => onDeviceChange(e.target.value)}
                className="w-full p-2 border rounded-lg text-sm"
              >
                <option value="cpu">CPU</option>
                <option value="gpu">GPU</option>
              </select>
            </div>

            {/* Timestamp Options (only if model supports) */}
            {modelSupportsTimestamp && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="timestamp"
                    checked={generateTimestamp}
                    onChange={(e) => onTimestampChange(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="timestamp" className="text-sm font-medium">
                    Generate Timestamps
                  </label>
                </div>

                {generateTimestamp && (
                  <div className="space-y-2 ml-6">
                    <label className="text-sm font-medium">Format</label>
                    <select
                      value={timestampFormat}
                      onChange={(e) => onTimestampFormatChange(e.target.value)}
                      className="w-full p-2 border rounded-lg text-sm"
                    >
                      <option value="srt">SRT</option>
                      <option value="vtt">VTT</option>
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}