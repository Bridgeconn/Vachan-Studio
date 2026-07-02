// src/hooks/useSSESync.ts

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { useJobStore } from "@/store/jobStore";
import { aiEngineService } from "@/services/aiEngine";
import { extractAudioFromZip } from "@/utils/zipExtractor";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config/constants";

export function useSSESync() {
  const { isAuthenticated, apiKey } = useAuthStore();
  const { getActiveJobs, updateJobByJobId } = useJobStore();
  const fetchingJobsRef = useRef<Set<number>>(new Set());
  const abortControllerRef = useRef<AbortController | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isConnectingRef = useRef(false);
  const hasConnectedOnceRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !apiKey) {
      abortControllerRef.current?.abort();
      return;
    }

    async function handleSSEEvent(raw: string) {
      try {
        const event = JSON.parse(raw);
        const jobId = Number(event.job_id);
        const status = event.status || "";

        if (status === "Background task completed successfully") {
          await handleJobCompleted(jobId);
        }
      } catch {
        console.error("Failed to parse SSE event:", raw);
      }
    }

    async function handleJobCompleted(jobId: number) {
      const activeJobs = getActiveJobs();
      const job = activeJobs.find((j) => j.jobId === jobId);
      if (!job) return;

      try {
        const result = await aiEngineService.getJobStatus(jobId);

        if (job.type === "stt") {
          const transcribedText =
            result.data.output?.transcriptions
              ?.map((t: any) => t.transcribedText)
              .join("\n\n") || "No transcription available";

          updateJobByJobId(jobId, {
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
          if (fetchingJobsRef.current.has(jobId)) return;
          fetchingJobsRef.current.add(jobId);

          try {
            const zipBlob = await aiEngineService.getJobAssets(jobId);
            const extracted = await extractAudioFromZip(zipBlob);
            extracted.sort((a, b) => a.name.localeCompare(b.name));
            const audioBlobs = extracted.map((f) => f.blob);

            updateJobByJobId(jobId, {
              status: "completed",
              completedAt: Date.now(),
              output: {
                data: result.data.output,
                audioReady: true,
                audioBlobs,
              },
            });
          } catch (assetError) {
            console.error("Failed to fetch assets for job:", jobId, assetError);
            updateJobByJobId(jobId, {
              status: "completed",
              completedAt: Date.now(),
              output: { data: result.data.output },
            });
          } finally {
            fetchingJobsRef.current.delete(jobId);
          }
        } else if (job.type === "ttt") {
          const translatedText =
            result.data.output?.translations
              ?.map((t: any) => t.translatedText)
              .join("\n\n") || "No translation available";

          updateJobByJobId(jobId, {
            status: "completed",
            completedAt: Date.now(),
            output: {
              translatedText,
              data: result.data.output,
            },
          });
        } else {
          updateJobByJobId(jobId, {
            status: "completed",
            completedAt: Date.now(),
            output: { data: result.data.output },
          });
        }
      } catch (error) {
        console.error("Failed to process completed job:", jobId, error);
      }
    }


    async function pollActiveJobs() {
      const activeJobs = getActiveJobs();
      for (const job of activeJobs) {
        try {
          const result = await aiEngineService.getJobStatus(job.jobId);
          if (result.data.status === "job finished") {
            await handleJobCompleted(job.jobId);
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
          console.error("Fallback poll failed for job:", job.jobId, error);
        }
      }
    }

    async function connect() {
      if (isConnectingRef.current) return;
      isConnectingRef.current = true;

      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch(`${API_BASE_URL}/model/events`, {
          headers: { "x-api-key": apiKey! },
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          console.error("SSE connection failed:", response.status);
          scheduleReconnect();
          return;
        }

        isConnectingRef.current = false;
        if (hasConnectedOnceRef.current) {
          // toast.success("Connection restored");
          await pollActiveJobs();
        }
        hasConnectedOnceRef.current = true;

        const reader = response.body?.getReader();
        if (!reader) {
          scheduleReconnect();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            scheduleReconnect();
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith(":")) continue;
            if (trimmed.startsWith("data:")) {
              const raw = trimmed.slice(5).trim();
              handleSSEEvent(raw);
            }
          }
        }
      } catch (error: any) {
        if (error?.name === "AbortError") return;
        console.error("SSE error:", error);
        scheduleReconnect();
      } finally {
        isConnectingRef.current = false;
      }
    }

    function scheduleReconnect() {
      if (reconnectTimerRef.current) return;
      // toast.error("Connection lost, reconnecting...");
      reconnectTimerRef.current = setTimeout(() => {
        reconnectTimerRef.current = null;
        connect();
      }, 3000);
    }

    connect();

    return () => {
      abortControllerRef.current?.abort();
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    };
  }, [isAuthenticated, apiKey]);
}