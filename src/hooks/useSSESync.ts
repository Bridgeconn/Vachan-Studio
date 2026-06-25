// src/hooks/useSSESync.ts - POLLING VERSION

import { useEffect, useRef } from "react";
import { aiEngineService } from "@/services/aiEngine";
import { useJobStore } from "@/store/jobStore";
import { useAuthStore } from "@/store/authStore";
import { extractAudioFromZip } from "@/utils/zipExtractor";
import { toast } from "sonner";

export function useSSESync() {
  const { isAuthenticated } = useAuthStore();
  const { getActiveJobs, updateJobByJobId } = useJobStore();
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fetchingJobsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!isAuthenticated) {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    pollingIntervalRef.current = setInterval(async () => {
      const activeJobs = getActiveJobs();

      for (const job of activeJobs) {
        try {
          console.log("Polling job:", job.jobId, "type:", job.type);

          const result = await aiEngineService.getJobStatus(job.jobId);

          if (result.data.status === "job finished") {
            console.log("Job completed:", job.jobId, "type:", job.type);

            if (job.type === "stt") {
              const transcribedText =
                result.data.output?.transcriptions
                  ?.map((t) => t.transcribedText)
                  .join("\n\n") || "No transcription available";

              updateJobByJobId(job.jobId, {
                status: "completed",
                completedAt: Date.now(),
                output: {
                  transcribedText,
                  data: result.data.output,
                },
              });
            } else if (
              job.type === "tts" ||
              job.type === "sts" ||
              job.type === "vc" ||
              job.type === "nr" ||
              job.type === "ae"
            ) {
              if (fetchingJobsRef.current.has(job.jobId)) continue;
              fetchingJobsRef.current.add(job.jobId);

              try {
                const zipBlob = await aiEngineService.getJobAssets(job.jobId);
                const extracted = await extractAudioFromZip(zipBlob);

                extracted.sort((a, b) => a.name.localeCompare(b.name));
                const audioBlobs = extracted.map((f) => f.blob);

                updateJobByJobId(job.jobId, {
                  status: "completed",
                  completedAt: Date.now(),
                  output: {
                    data: result.data.output,
                    audioReady: true,
                    audioBlobs,
                  },
                });
              } catch (assetError) {
                console.error("Failed to fetch assets for job:", job.jobId, assetError);
                updateJobByJobId(job.jobId, {
                  status: "completed",
                  completedAt: Date.now(),
                  output: {
                    data: result.data.output,
                  },
                });
              } finally {
                fetchingJobsRef.current.delete(job.jobId);
              }
            } else if (job.type === "ttt") {
              const translatedText =
                result.data.output?.translations
                  ?.map((t: { translatedText: string }) => t.translatedText)
                  .join("\n\n") || "No translation available";

              updateJobByJobId(job.jobId, {
                status: "completed",
                completedAt: Date.now(),
                output: {
                  translatedText,
                  data: result.data.output,
                },
              });
            } else {
              updateJobByJobId(job.jobId, {
                status: "completed",
                completedAt: Date.now(),
                output: {
                  data: result.data.output,
                },
              });
            }
          } else if (result.data.status === "job is in progress") {
            updateJobByJobId(job.jobId, { status: "processing" });
          } else if (
            result.data.status === "job failed" ||
            result.data.status === "Error"
          ) {
            const errorMessage = result.data.output?.message || "Job failed";
            updateJobByJobId(job.jobId, {
              status: "failed",
              completedAt: Date.now(),
              error: errorMessage,
            });
            toast.error(errorMessage);
          }
        } catch (error) {
          console.error("Failed to poll job:", job.jobId, error);
        }
      }
    }, 3000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [isAuthenticated, getActiveJobs, updateJobByJobId]);
}