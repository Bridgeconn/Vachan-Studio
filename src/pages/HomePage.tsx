// src/pages/HomePage.tsx

import { useOutletContext } from 'react-router-dom';
import { FeatureCard } from '../components/FeatureCard';
import { 
  Mic, 
  Volume2, 
  Languages, 
  Waves,
  Sparkles
} from 'lucide-react';

interface OutletContext {
  onFeatureClick: (feature: string) => void;
}

export function HomePage() {
  const { onFeatureClick } = useOutletContext<OutletContext>();

  const features = [
    {
      id: 'stt',
      icon: Mic,
      title: 'Voice Transcription',
      description: 'Convert spoken words into accurate text using AI-powered speech recognition.',
      iconColor: 'bg-purple-500'
    },
    {
      id: 'tts',
      icon: Volume2,
      title: 'Speak your Text',
      description: 'Convert text into natural, human-like speech using AI voices.',
      iconColor: 'bg-pink-500'
    },
    {
      id: 'ttt',
      icon: Languages,
      title: 'AI Text Translation',
      description: 'Translate text between languages instantly with high-quality AI translations.',
      iconColor: 'bg-blue-500'
    },
    {
      id: 'sts',
      icon: Waves,
      title: 'AI Voice Translation',
      description: 'Translate speech from one language to another seamlessly.',
      iconColor: 'bg-indigo-500'
    },
    {
      id: 'custom',
      icon: Sparkles,
      title: 'Custom Voice Generation',
      description: 'Generate a custom voice for your brand or product using AI.',
      iconColor: 'bg-amber-500'
    }
  ];

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16 text-center">
        <h1 className="text-5xl font-bold mb-4">
          Welcome to AI UI Services
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Transform your communication with cutting-edge AI-powered speech and language technologies
        </p>
      </div>

      {/* Feature Cards Grid */}
      <div className="container mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature) => (
            <FeatureCard
              key={feature.id}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              iconColor={feature.iconColor}
              onClick={() => onFeatureClick(feature.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}