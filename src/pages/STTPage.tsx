// src/pages/STTPage.tsx

import { useState } from 'react';
import { FeatureLayout } from '@/components/FeatureLayout';
import { SplitView } from '@/components/SplitView';
import { AudioInput } from '@/components/AudioInput';
import { Button } from '@/components/ui/button';

export function STTPage() {
  const [showOutput, setShowOutput] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [viewMode, setViewMode] = useState<'horizontal' | 'vertical'>('horizontal');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    console.log('File selected:', file.name, file.size);
  };

  const handleSubmit = () => {
    if (!selectedFile) {
      alert('Please upload or record an audio file first');
      return;
    }

    // TODO: Call API to submit job
    console.log('Submitting file:', selectedFile.name);
    setShowOutput(true);
    setHasSubmitted(true);
  };

  // Settings content for right panel
  const settingsContent = (
    <div className="space-y-4">
      {/* Tabs - Input/Output */}
      <div className="flex border-b">
        <button className="px-4 py-2 border-b-2 border-primary font-medium text-sm">
          Input
        </button>
        <button className="px-4 py-2 text-muted-foreground text-sm hover:text-foreground">
          Output
        </button>
      </div>
      
      {/* Input Settings */}
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium mb-1 block">Model</label>
          <select className="w-full p-2 border rounded-lg text-sm">
            <option>mms-1b-all</option>
            <option>whisper-large</option>
          </select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1 block">Language</label>
          <select className="w-full p-2 border rounded-lg text-sm">
            <option>English (eng)</option>
            <option>Hindi (hin)</option>
            <option>Spanish (spa)</option>
          </select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1 block">Device</label>
          <select className="w-full p-2 border rounded-lg text-sm">
            <option>CPU</option>
            <option>GPU</option>
          </select>
        </div>
      </div>
    </div>
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
              className="min-w-50"
            >
              Transcribe Audio
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
            You can drag the divider to resize this section.
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