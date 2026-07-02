// src/components/ComingSoonModal.tsx

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Volume2,
  Waves,
  Sparkles,
  Wand2,
  ShieldOff,
  Mic2,
} from "lucide-react";

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMING_SOON_FEATURES = [
  {
    icon: Wand2,
    title: "Voice Cloning",
    description: "Clone any voice from a short audio sample and generate speech in that voice.",
    color: "bg-purple-500",
    model: "OpenVoice v2",
  },
  {
    icon: ShieldOff,
    title: "Noise Removal",
    description: "Remove background noise from audio in real-time for crystal clear speech.",
    color: "bg-green-500",
    model: "DeepFilterNet3",
  },
  {
    icon: Sparkles,
    title: "Audio Enhancement",
    description: "Restore audio distortions and boost perceptual quality of speech recordings.",
    color: "bg-blue-500",
    model: "Resemble Enhance",
  },
  {
    icon: Mic2,
    title: "Audio Segmentation",
    description: "Split audio into speech, music, noise and silence zones automatically.",
    color: "bg-orange-500",
    model: "inaSpeechSegmenter",
  },
  {
    icon: Waves,
    title: "Forced Alignment",
    description: "Align audio recordings with text transcriptions at sentence level with precise timestamps.",
    color: "bg-indigo-500",
    model: "MMS-FA",
  },
  {
    icon: Volume2,
    title: "Custom TTS & Voice Generation",
    description: "Generate natural speech with zero-shot voice cloning using state-of-the-art TTS models.",
    color: "bg-pink-500",
    model: "Chatterbox",
  },
];

export function ComingSoonModal({ isOpen, onClose }: ComingSoonModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-[90vw] max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">More AI Features</h2>
                <p className="text-sm text-muted-foreground font-normal">
                  Exciting features coming soon
                </p>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Banner */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-center">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
              🚧 These features are currently under development
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
              We're working hard to bring you more powerful AI tools. Stay tuned!
            </p>
          </div>

          {/* Feature list */}
          <div className="grid grid-cols-1 gap-3">
            {COMING_SOON_FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-4 border rounded-lg p-4 bg-muted/20"
              >
                <div
                  className={`w-10 h-10 rounded-lg ${feature.color} flex items-center justify-center shrink-0`}
                >
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{feature.title}</p>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">
                      {feature.model}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="border rounded-lg p-4 bg-primary/5 text-center space-y-1">
            <p className="text-sm font-medium">Interested in early access or custom models?</p>
            <a
              href="mailto:bcssupport@bridgeconn.com"
              className="text-sm text-primary hover:underline"
            >
              bcssupport@bridgeconn.com
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}