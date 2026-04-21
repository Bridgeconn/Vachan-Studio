// src/components/JobDetailModal.tsx

import { useState, useEffect, useRef } from "react";
import {
  Copy,
  Download,
  Info,
  Type,
  Pencil,
  Check,
  X,
  Highlighter,
  Play,
  Pause,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import WaveSurfer from "wavesurfer.js";
import { HighlightedTranscription } from "./HighlightedTranscription";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Job } from "@/types";
import { useJobStore } from "@/store/jobStore";

interface JobDetailModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

export function JobDetailModal({ job, isOpen, onClose }: JobDetailModalProps) {
  const [transcriptionText, setTranscriptionText] = useState("");
  const [srtText, setSrtText] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">(
    "small",
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [highlightingEnabled, setHighlightingEnabled] = useState(false);
  const [wavesurferInstance, setWavesurferInstance] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);

  const updateJobByJobId = useJobStore((state) => state.updateJobByJobId);

  // Initialize WaveSurfer when modal opens
  useEffect(() => {
    console.log("🎵 WaveSurfer useEffect triggered:", {
      isOpen,
      hasAudioBlob: !!job?.input.audioBlob,
      hasWaveformRef: !!waveformRef.current,
      hasWavesurfer: !!wavesurfer.current,
    });

    if (!isOpen || !job?.input.audioBlob) {
      return;
    }

    // Flag to prevent race conditions
    let isInitializing = false;

    // Wait for DOM to be ready
    const initWaveSurfer = () => {
      // Skip if already initializing or instance exists
      if (isInitializing || wavesurfer.current) {
        console.log("⏭️ Skipping - already initializing or exists");
        return;
      }

      if (!waveformRef.current) {
        console.log("⏳ Ref not ready yet, retrying...");
        setTimeout(initWaveSurfer, 100);
        return;
      }

      isInitializing = true;
      console.log("✅ Creating WaveSurfer instance...");

      try {
        wavesurfer.current = WaveSurfer.create({
          container: waveformRef.current,
          waveColor: "rgb(148, 163, 184)",
          progressColor: "rgb(99, 102, 241)",
          cursorColor: "rgb(99, 102, 241)",
          barWidth: 2,
          barRadius: 3,
          cursorWidth: 1,
          height: 60,
          barGap: 2,
        });

        if (!job.input.audioBlob) {
          isInitializing = false;
          return;
        }

        const url = URL.createObjectURL(job.input.audioBlob);
        console.log("📂 Loading audio from URL:", url);
        wavesurfer.current.load(url);

        wavesurfer.current.on("play", () => setIsPlaying(true));
        wavesurfer.current.on("pause", () => setIsPlaying(false));
        wavesurfer.current.on("finish", () => setIsPlaying(false));
        wavesurfer.current.on("ready", () => {
          console.log("✅ WaveSurfer ready!");
          setWavesurferInstance(wavesurfer.current);
          isInitializing = false;
        });
      } catch (error) {
        console.error("❌ Error creating WaveSurfer:", error);
        isInitializing = false;
        wavesurfer.current = null;
      }
    };

    initWaveSurfer();

    // Cleanup function
    return () => {
      console.log("🧹 Cleanup triggered");
      isInitializing = false;

      if (wavesurfer.current) {
        console.log("🧹 Destroying WaveSurfer");
        try {
          wavesurfer.current.destroy();
        } catch (e) {
          console.error("⚠️ Error during cleanup:", e);
        }
        wavesurfer.current = null;
        setWavesurferInstance(null);
      }
    };
  }, [isOpen, job?.input.audioBlob]);

  // Update state when job changes
  useEffect(() => {
    if (job) {
      setTranscriptionText(job.output?.transcribedText || "");
      setSrtText(job.output?.srtText || null);
      setIsEditing(false);
      setEditedText("");
    }
  }, [job]);

  if (!job) return null;

  const handleEditStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditedText(transcriptionText);
    setIsEditing(true);
    if (srtText) {
      toast.warning("Editing will disable word-level highlighting");
    }
  };

  const handleEditSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTranscriptionText(editedText);
    setIsEditing(false);
    setSrtText(null);

    updateJobByJobId(job.jobId, {
      output: {
        ...job.output,
        transcribedText: editedText,
        srtText: undefined,
      },
    });

    toast.success("Changes saved!");
  };

  const handleEditCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditedText("");
    setIsEditing(false);
  };

  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
    }
  };

  const supportsHighlighting = job.input.params?.model === "mms-1b-all";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-[90vw] max-w-5xl max-h-[90vh] flex flex-col p-0 gap-0"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>
            <div>
              <h2 className="text-xl font-semibold">Transcription</h2>
              <p className="text-sm text-muted-foreground font-normal mt-1">
                {job.input.fileName}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
          {/* Audio Player */}
          {job.input.audioBlob && (
            <div className="border rounded-lg p-4 space-y-3 mt-6">
              <div ref={waveformRef} className="w-full" />
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={togglePlayPause}
                  className="cursor-pointer"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                    </>
                  )}
                </Button>
                <span className="text-xs text-muted-foreground">
                  Click to play audio
                </span>
              </div>
            </div>
          )}

          {/* Transcription Output */}
          <div className="border rounded-lg p-6 bg-muted/30 space-y-4">
            {/* Action Icons */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Transcribed Text</h3>

              <div className="flex items-center gap-1">
                {isEditing ? (
                  <>
                    {/* Save */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-green-600 hover:text-green-700 cursor-pointer"
                          onClick={handleEditSave}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Save changes</p>
                      </TooltipContent>
                    </Tooltip>

                    {/* Cancel */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 cursor-pointer"
                          onClick={handleEditCancel}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Cancel</p>
                      </TooltipContent>
                    </Tooltip>
                  </>
                ) : (
                  <>
                    {/* Copy */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(transcriptionText);
                            toast.success("Copied to clipboard!");
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy</p>
                      </TooltipContent>
                    </Tooltip>

                    {/* Download */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            const blob = new Blob([transcriptionText], {
                              type: "text/plain",
                            });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `${job.input.fileName}_transcription.txt`;
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Download</p>
                      </TooltipContent>
                    </Tooltip>

                    {/* Edit */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 cursor-pointer"
                          onClick={handleEditStart}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit</p>
                      </TooltipContent>
                    </Tooltip>

                    {/* Font Size */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFontSize((prev) =>
                              prev === "small"
                                ? "medium"
                                : prev === "medium"
                                  ? "large"
                                  : "small",
                            );
                          }}
                        >
                          <Type
                            className={`h-4 w-4 ${
                              fontSize === "small"
                                ? "scale-75"
                                : fontSize === "medium"
                                  ? "scale-100"
                                  : "scale-125"
                            }`}
                          />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Font size: {fontSize}</p>
                      </TooltipContent>
                    </Tooltip>

                    {/* Highlighting Toggle */}
                    {srtText && supportsHighlighting && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setHighlightingEnabled(!highlightingEnabled);
                            }}
                          >
                            <Highlighter
                              className={`h-4 w-4 ${highlightingEnabled ? "text-primary" : ""}`}
                            />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {highlightingEnabled ? "Disable" : "Enable"} word
                            highlighting
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    )}

                    {/* Info */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HoverCard openDelay={0} closeDelay={0}>
                          <HoverCardTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 cursor-pointer"
                            >
                              <Info className="h-4 w-4" />
                            </Button>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-52">
                            <div className="space-y-3">
                              <h4 className="font-semibold text-sm">
                                Job Information
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Job ID:
                                  </span>
                                  <span className="font-mono">{job.jobId}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Language:
                                  </span>
                                  <span>{job.input.params?.language}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Model:
                                  </span>
                                  <span>{job.input.params?.model}</span>
                                </div>
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </TooltipTrigger>
                    </Tooltip>
                  </>
                )}
              </div>
            </div>

            {/* Text Display */}
            <div className="p-4 bg-background rounded-lg min-h-[300px] max-h-[400px] overflow-y-auto">
              {isEditing ? (
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className={`w-full h-[300px] bg-transparent border-none outline-none resize-none ${
                    fontSize === "small"
                      ? "text-sm"
                      : fontSize === "medium"
                        ? "text-base"
                        : "text-lg"
                  }`}
                  autoFocus
                />
              ) : highlightingEnabled && srtText && wavesurferInstance ? (
                <HighlightedTranscription
                  srtText={srtText}
                  wavesurfer={wavesurferInstance}
                  fontSize={fontSize}
                />
              ) : (
                <p
                  className={`whitespace-pre-wrap ${
                    fontSize === "small"
                      ? "text-sm"
                      : fontSize === "medium"
                        ? "text-base"
                        : "text-lg"
                  }`}
                >
                  {transcriptionText}
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
