import { useState, useEffect } from "react";
import { useJobStore } from "@/store/jobStore";
import { useSSESync } from "@/hooks/useSSESync";
import { FeatureLayout } from "@/components/FeatureLayout";
import { SplitView } from "@/components/SplitView";
import { AudioInput } from "@/components/AudioInput";
import { STTSettings } from "@/components/STTSettings";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { aiEngineService } from "@/services/aiEngine";
import { Loader2, Copy, Download, Info, Type, X } from "lucide-react";
import { toast } from "sonner";
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

// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";

export function STTPage() {
  const [showOutput, setShowOutput] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [viewMode, setViewMode] = useState<"horizontal" | "vertical">(
    "horizontal",
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<number | null>(null);
  const [transcriptionResult, setTranscriptionResult] = useState<string>("");
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">(
    "small",
  );

  // Get token from auth store
  const { token } = useAuthStore();
  // Initialize SSE sync
  useSSESync(token);

  // Get job store methods
  // const { addJob, getJobByJobId } = useJobStore();
  const addJob = useJobStore((state) => state.addJob);
  const currentJob = useJobStore((state) =>
    currentJobId ? state.getJobByJobId(currentJobId) : undefined,
  );

  // Settings state
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [device, setDevice] = useState("cpu");
  const [generateTimestamp, setGenerateTimestamp] = useState(true);
  const [timestampFormat, setTimestampFormat] = useState("srt");

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    console.log("File selected:", file.name, file.size);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setShowOutput(false);
    setCurrentJobId(null);
    setTranscriptionResult("");
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      alert("Please upload or record an audio file first");
      return;
    }

    if (!selectedLanguage) {
      alert("Please select audio language");
      return;
    }

    if (!token) {
      alert("Please login first");
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit job to API
      const jobId = await aiEngineService.submitSTTJob(selectedFile, token, {
        model_name: selectedModel,
        transcription_language: selectedLanguage,
        device: device,
        generate_timestamp: generateTimestamp,
        timestamp_file_format: generateTimestamp ? timestampFormat : undefined,
      });

      console.log("Job submitted successfully! Job ID:", jobId);

      // Add job to store
      addJob({
        jobId,
        type: "stt",
        status: "pending",
        input: {
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          params: {
            language: selectedLanguage,
            model: selectedModel,
          },
        },
      });

      // Store job ID
      setCurrentJobId(jobId);

      // Show output section with "Processing..." state
      setShowOutput(true);
      setHasSubmitted(true);
      setTranscriptionResult(""); // Clear previous result

      // TODO: SSE will notify us when complete (Phase 2)
      // For now, we can poll or wait for SSE notification
    } catch (error) {
      console.error("Failed to submit job:", error);
      alert(
        `Failed to submit transcription job: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = selectedFile && selectedLanguage && !isSubmitting;

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
        <AudioInput
          onFileSelect={handleFileSelect}
          selectedFile={selectedFile}
          onRemove={handleRemoveFile}
        />

        {selectedFile && !showOutput && (
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="min-w-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : !selectedLanguage ? (
                "Select Language First"
              ) : (
                "Transcribe Audio"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  // Output section content
  // Output section content
  const outputContent = showOutput ? (
    <div className="h-full p-6">
      <div className="h-full border rounded-lg p-6 bg-muted/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Transcribed Text</h3>

          {/* Action Icons - Only show when result exists */}
          {transcriptionResult && (
            <div className="flex items-center gap-1">
              {/* Copy Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 cursor-pointer"
                    onClick={() => {
                      navigator.clipboard.writeText(transcriptionResult);
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

              {/* Download Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 cursor-pointer"
                    onClick={() => {
                      const blob = new Blob([transcriptionResult], {
                        type: "text/plain",
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `transcription_${currentJobId}.txt`;
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

              {/* Font Size Toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 cursor-pointer"
                    onClick={() => {
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

              {/* Info HoverCard */}
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
                        {/* Job Details */}
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Job ID:
                            </span>
                            <span className="font-mono">{currentJobId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Language:
                            </span>
                            <span>{selectedLanguage}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Model:
                            </span>
                            <span>{selectedModel}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Device:
                            </span>
                            <span>{device.toUpperCase()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Timestamp:
                            </span>
                            <span>
                              {generateTimestamp ? "Enabled" : "Disabled"}
                            </span>
                          </div>
                          {generateTimestamp && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Format:
                              </span>
                              <span>{timestampFormat.toUpperCase()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </TooltipTrigger>
                {/* <TooltipContent>
                  <p>Job information</p>
                </TooltipContent> */}
              </Tooltip>
            </div>
          )}
        </div>

        {transcriptionResult ? (
          // Show actual result
          <div className="space-y-4">
            <div className="p-4 bg-background rounded-lg max-h-[600px] overflow-y-auto">
              <p
                className={`whitespace-pre-wrap ${
                  fontSize === "small"
                    ? "text-sm"
                    : fontSize === "medium"
                      ? "text-base"
                      : "text-lg"
                }`}
              >
                {transcriptionResult}
              </p>
            </div>
          </div>
        ) : (
          // Show processing state
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center">
              <p className="text-sm font-medium">Processing your audio...</p>
              <p className="text-xs text-muted-foreground mt-1">
                This may take a few moments. You can switch to other features
                while waiting.
              </p>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Job Id: {currentJobId}</p>
              <p>• Language: {selectedLanguage}</p>
              <p>• Model: {selectedModel}</p>
              <p>• Device: {device.toUpperCase()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  ) : null;

  // Watch for job completion
  // useEffect(() => {
  //   if (currentJobId) {
  //     const job = getJobByJobId(currentJobId);
  //     if (job?.output?.transcribedText) {
  //       setTranscriptionResult(job.output.transcribedText);
  //     }
  //   }
  // }, [currentJobId, getJobByJobId]);

  // Watch for job completion
  useEffect(() => {
    if (currentJob?.output?.transcribedText) {
      console.log(
        "Updating UI with transcription:",
        currentJob.output.transcribedText,
      );
      setTranscriptionResult(currentJob.output.transcribedText);
    }
  }, [currentJob]);

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
