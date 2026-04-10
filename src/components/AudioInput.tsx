// src/components/AudioInput.tsx

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Mic, Trash2, Play, Pause, X } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB in bytes
const ALLOWED_FORMATS = ['audio/wav', 'audio/ogg', 'audio/mp3'];

interface AudioInputProps {
  onFileSelect: (file: File) => void;
}

export function AudioInput({ onFileSelect }: AudioInputProps) {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize WaveSurfer when audio file is set
  useEffect(() => {
    if (audioFile && waveformRef.current && !wavesurfer.current) {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: 'rgb(148, 163, 184)', // slate-400
        progressColor: 'rgb(99, 102, 241)', // primary color
        cursorColor: 'rgb(99, 102, 241)',
        barWidth: 2,
        barRadius: 3,
        cursorWidth: 1,
        height: 80,
        barGap: 2,
      });

      // Load audio file
      const url = URL.createObjectURL(audioFile);
      wavesurfer.current.load(url);

      // Handle play/pause events
      wavesurfer.current.on('play', () => setIsPlaying(true));
      wavesurfer.current.on('pause', () => setIsPlaying(false));
      wavesurfer.current.on('finish', () => setIsPlaying(false));
    }

    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
        wavesurfer.current = null;
      }
    };
  }, [audioFile]);

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds 25MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`;
    }
    if (!ALLOWED_FORMATS.includes(file.type)) {
      return 'Invalid format. Please upload WAV, MP3, or OGG files only.';
    }
    return null;
  };

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setTimeout(() => setError(''), 5000);
      return;
    }

    setError('');
    setAudioFile(file);
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    if (wavesurfer.current) {
      wavesurfer.current.destroy();
      wavesurfer.current = null;
    }
    setAudioFile(null);
    setIsPlaying(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const togglePlayPause = () => {
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        const audioFile = new File([audioBlob], `recording_${Date.now()}.wav`, {
          type: 'audio/wav',
        });
        
        handleFileSelect(audioFile);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setError('');
    } catch (err) {
      setError('Microphone access denied. Please allow microphone access.');
      setTimeout(() => setError(''), 5000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  // If no audio file, show upload/record interface
  if (!audioFile) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-4">
        {/* Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
          onDragEnter={() => setDragActive(true)}
          onDragLeave={() => setDragActive(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium">Drop audio here</p>
              <p className="text-sm text-muted-foreground mt-1">
                WAV, MP3, OGG • up to 25MB
              </p>
            </div>
          </div>
        </div>

        {/* Upload and Record Buttons */}
        <div className="flex gap-3 justify-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".wav,.mp3,.ogg,audio/wav,audio/mpeg,audio/ogg"
            onChange={handleFileInput}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload audio
          </Button>

          <Button
            variant={isRecording ? 'destructive' : 'outline'}
            onClick={isRecording ? stopRecording : startRecording}
          >
            <Mic className="w-4 h-4 mr-2" />
            {isRecording ? 'Stop Recording' : 'Record'}
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm flex items-start gap-2">
            <X className="w-4 h-4 mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}
      </div>
    );
  }

  // If audio file exists, show player
  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* File Info */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            ✓
          </div>
          <div>
            <p className="font-medium text-sm">{audioFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {(audioFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRemove}
          title="Remove audio"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Waveform Player */}
      <div className="border rounded-lg p-4 space-y-3">
        <div ref={waveformRef} className="w-full" />
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={togglePlayPause}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>
          <span className="text-xs text-muted-foreground">
            Click to play audio
          </span>
        </div>
      </div>
    </div>
  );
}