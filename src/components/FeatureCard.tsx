// src/components/FeatureCard.tsx

import { Card } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';  // ← Add 'type' here

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
  iconColor?: string;
}

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
  iconColor?: string;
}

export function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  onClick,
  iconColor = 'bg-primary'
}: FeatureCardProps) {
  return (
    <Card 
      className="p-6 hover:shadow-lg transition-all cursor-pointer hover:scale-105 group"
      onClick={onClick}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Icon Circle */}
        <div className={`w-16 h-16 ${iconColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon className="w-8 h-8 text-primary-foreground" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </Card>
  );
}