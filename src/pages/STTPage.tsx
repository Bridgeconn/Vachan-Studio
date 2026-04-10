// src/pages/STTPage.tsx

import { useState } from 'react';
import { FeatureLayout } from '@/components/FeatureLayout';
import { SplitView } from '@/components/SplitView';
import { AudioInput } from '@/components/AudioInput';
import { STTSettings } from '@/components/STTSettings';
import { Button } from '@/components/ui/button';

export function STTPage() {
  const [showOutput, setShowOutput] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [viewMode, setViewMode] = useState<'horizontal' | 'vertical'>('horizontal');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Settings state
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [device, setDevice] = useState('cpu');
  const [generateTimestamp, setGenerateTimestamp] = useState(true);
  const [timestampFormat, setTimestampFormat] = useState('srt');

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    console.log('File selected:', file.name, file.size);
  };

  const handleSubmit = () => {
    if (!selectedFile) {
      alert('Please upload or record an audio file first');
      return;
    }

    if (!selectedLanguage) {
      alert('Please select audio language');
      return;
    }

    // Prepare API payload
    const payload = {
      file: selectedFile,
      model_name: selectedModel,
      transcription_language: selectedLanguage,
      device: device,
      generate_timestamp: generateTimestamp,
      timestamp_file_format: generateTimestamp ? timestampFormat : undefined
    };

    console.log('Submitting with payload:', payload);

    // TODO: Call API to submit job
    // For now, just show output
    setShowOutput(true);
    setHasSubmitted(true);
  };

  const canSubmit = selectedFile && selectedLanguage;

  // Settings content for right panel
  const settingsContent = (
    <STTSettings
      selectedLanguage={selectedLanguage}
      selectedModel={selectedModel}
      device={device}
      generateTimestamp={generateTimestamp}
      timestampFormat={timestampFormat}
      onLanguageChange={setSelectedLanguage}
      onModelChange={setSelectedModel}
      onDeviceChange={setDevice}
      onTimestampChange={setGenerateTimestamp}
      onTimestampFormatChange={setTimestampFormat}
    />
  );

  // Input section content
  const inputContent = (
    <div className="h-full p-6 flex flex-col items-center justify-center">
      <div className="w-full space-y-6">
        <AudioInput onFileSelect={handleFileSelect} />
        
        {selectedFile && (
          <div className="flex justify-center">
            <Button 
              size="lg"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="min-w-[200px]"
            >
              {!selectedLanguage ? 'Select Language First' : 'Transcribe Audio'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  // Output section content
  const outputContent = showOutput ? (
    <div className="h-full p-6">
      <div className="h-full border rounded-lg p-6 bg-muted/30">
        <h3 className="font-semibold mb-4">Transcribed Text</h3>
        <div className="space-y-2">
          <p className="text-sm">
            This is a dummy transcription output. The actual transcribed text will appear here 
            after the STT job completes.
          </p>
          <p className="text-sm text-muted-foreground">
            Selected Language: {selectedLanguage}
          </p>
          <p className="text-sm text-muted-foreground">
            Model: {selectedModel}
          </p>
        </div>
        
        <div className="mt-6 flex gap-2">
          <Button variant="outline" size="sm">Copy</Button>
          <Button variant="outline" size="sm">Download</Button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <FeatureLayout
      featureName="Speech To Text"
      featureType="stt"
      settingsContent={settingsContent}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      showNewButton={hasSubmitted}
    >
      <SplitView
        inputContent={inputContent}
        outputContent={outputContent}
        viewMode={viewMode}
        showOutput={showOutput}
      />
    </FeatureLayout>
  );
}