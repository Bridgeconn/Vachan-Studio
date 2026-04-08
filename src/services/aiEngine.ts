// src/services/aiEngine.ts

import { API_BASE_URL } from "@/config/constants";
import type { SubmitJobResponse, JobStatusResponse } from "@/types";

class AIEngineService {
  /**
   * Submit a STT job
   */
  async submitSTTJob(
    audioFile: File,
    token: string,
    params: {
      model_name: string; // Required ✅
      transcription_language: string; // Required ✅
      device?: string; // Optional (default: 'cpu')
      generate_timestamp?: boolean; // Optional (default: false)
      timestamp_file_format?: string; // Optional
    },
  ): Promise<number> {
    const formData = new FormData();
    formData.append("files", audioFile);

    const url = new URL(`${API_BASE_URL}/model/audio/transcribe`);

    // Required parameters
    url.searchParams.append("model_name", params.model_name);
    url.searchParams.append(
      "transcription_language",
      params.transcription_language,
    );

    // Optional parameters
    if (params.device) url.searchParams.append("device", params.device);
    if (params.generate_timestamp !== undefined) {
      url.searchParams.append(
        "generate_timestamp",
        String(params.generate_timestamp),
      );
    }
    if (params.timestamp_file_format) {
      url.searchParams.append(
        "timestamp_file_format",
        params.timestamp_file_format,
      );
    }

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to submit STT job: ${response.status}`);
    }

    const data: SubmitJobResponse = await response.json();
    console.log("STT job submitted:", data);

    return data.data.jobId;
  }

  /**
   * Get job status and result
   */
  async getJobStatus(jobId: number, token: string): Promise<JobStatusResponse> {
    const url = `${API_BASE_URL}/model/job?jobId=${jobId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get job status: ${response.status}`);
    }

    const data: JobStatusResponse = await response.json();
    return data;
  }

  /**
   * Cancel a job (placeholder - add endpoint when available)
   */
  async cancelJob(jobId: number, token: string): Promise<void> {
    // TODO: Add cancel endpoint when backend team provides it
    console.log("Cancel job:", jobId);
    throw new Error("Cancel endpoint not implemented yet");
  }
}

export const aiEngineService = new AIEngineService();