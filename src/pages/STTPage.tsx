// src/pages/STTPage.tsx

import { FeatureLayout } from '@/components/FeatureLayout';
import { Button } from '@/components/ui/button';

export function STTPage() {
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

  // Main content for middle panel
  const content = (
    <div className="h-full p-6 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-full max-w-md border-2 border-dashed rounded-lg p-12">
          <p className="text-muted-foreground">
            Input Section - Upload audio (Step 2)
          </p>
        </div>
        
        <Button>Submit (Dummy)</Button>
      </div>
    </div>
  );

  return (
    <FeatureLayout
      featureName="Speech To Text"
      featureType="stt"
      settingsContent={settingsContent}
    >
      {content}
    </FeatureLayout>
  );
}