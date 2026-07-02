// src/services/aiEngine.ts

import { API_BASE_URL } from "@/config/constants";
import type { SubmitJobResponse, JobStatusResponse } from "@/types";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/auth";

async function getValidApiKey(): Promise<string> {
  const store = useAuthStore.getState();

  if (store.isApiKeyExpiringSoon()) {
    // Regenerate API key silently
    if (!store.token || !store.userId) {
      throw new Error("Session expired. Please login again.");
    }
    try {
      const { apiKey, expiresInSeconds } = await authService.generateApiKey(
        store.token,
        store.userId,
      );
      store.setApiKey(apiKey, expiresInSeconds);
      return apiKey;
    } catch {
      throw new Error("Session expired. Please login again.");
    }
  }

  if (!store.apiKey) throw new Error("Not authenticated. Please login.");
  return store.apiKey;
}

class AIEngineService {
  async submitSTTJob(
    audioFile: File,
    // token: string,
    params: {
      model_name: string;
      transcription_language: string;
      device?: string;
      generate_timestamp?: boolean;
      timestamp_file_format?: string;
    },
  ): Promise<number> {
    const apiKey = await getValidApiKey();
    const formData = new FormData();
    formData.append("files", audioFile);

    const url = new URL(`${API_BASE_URL}/model/audio/transcribe`);
    url.searchParams.append("model_name", params.model_name);
    url.searchParams.append("transcription_language", params.transcription_language);
    if (params.device) url.searchParams.append("device", params.device);
    if (params.generate_timestamp !== undefined) {
      url.searchParams.append("generate_timestamp", params.generate_timestamp ? "True" : "False");
    }
    if (params.timestamp_file_format) {
      url.searchParams.append("timestamp_file_format", params.timestamp_file_format);
    }

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "x-api-key": apiKey },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${errorText}`);
    }

    const data: SubmitJobResponse = await response.json();
    return data.data.jobId;
  }

  async submitTTSJob(
    texts: string[],
    // token: string,
    params: {
      model_name: string;
      output_format: string;
      language?: string;
      description?: string;
      device?: string;
      enhance?: boolean;
    },
  ): Promise<number> {
    const apiKey = await getValidApiKey();
    const url = new URL(`${API_BASE_URL}/model/audio/generate`);

    url.searchParams.append("model_name", params.model_name);
    url.searchParams.append("output_format", params.output_format);
    if (params.language) url.searchParams.append("language", params.language);
    if (params.description) url.searchParams.append("description", params.description);
    if (params.device) url.searchParams.append("device", params.device);
    if (params.enhance !== undefined) {
      url.searchParams.append("enhance", params.enhance ? "True" : "False");
    }

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(texts),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${errorText}`);
    }

    const data: SubmitJobResponse = await response.json();
    return data.data.jobId;
  }

  async submitTTTJob(
    texts: string[],
    // token: string,
    params: {
      model_name: string;
      source_language: string;
      target_language: string;
      device?: string;
    },
  ): Promise<number> {
    const apiKey = await getValidApiKey();
    const url = new URL(`${API_BASE_URL}/model/text/translate`);

    url.searchParams.append("model_name", params.model_name);
    url.searchParams.append("source_language", params.source_language);
    url.searchParams.append("target_language", params.target_language);
    if (params.device) url.searchParams.append("device", params.device);

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(texts),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${errorText}`);
    }

    const data: SubmitJobResponse = await response.json();
    return data.data.jobId;
  }

  async submitSTSJob(
    audioFile: File,
    // token: string,
    params: {
      model_name: string;
      target_language: string;
      output_format: string;
      device?: string;
      enhance?: boolean;
    },
  ): Promise<number> {
    const apiKey = await getValidApiKey();
    const formData = new FormData();
    formData.append("files", audioFile);

    const url = new URL(`${API_BASE_URL}/model/audio/translate`);
    url.searchParams.append("model_name", params.model_name);
    url.searchParams.append("target_language", params.target_language);
    url.searchParams.append("output_format", params.output_format);
    if (params.device) url.searchParams.append("device", params.device);
    if (params.enhance !== undefined) {
      url.searchParams.append("enhance", params.enhance ? "True" : "False");
    }

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "x-api-key": apiKey },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${errorText}`);
    }

    const data: SubmitJobResponse = await response.json();
    return data.data.jobId;
  }

  async submitVoiceCloneJob(
    inputAudio: File,
    // token: string,
    params: {
      output_format: string;
      reference_speaker?: string;
      input_language?: string;
      enhance?: boolean;
      reference_audio?: File;
    },
  ): Promise<number> {
    const apiKey = await getValidApiKey();
    const formData = new FormData();
    formData.append("input_audios", inputAudio);
    if (params.reference_audio) {
      formData.append("reference_audio", params.reference_audio);
    }

    const url = new URL(`${API_BASE_URL}/model/audio/voice-clone`);
    url.searchParams.append("model_name", "chatterbox");
    url.searchParams.append("output_format", params.output_format);
    if (params.reference_speaker) url.searchParams.append("reference_speaker", params.reference_speaker);
    if (params.input_language) url.searchParams.append("input_language", params.input_language);
    if (params.enhance !== undefined) {
      url.searchParams.append("enhance", params.enhance ? "True" : "False");
    }

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "x-api-key": apiKey },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${errorText}`);
    }

    const data: SubmitJobResponse = await response.json();
    return data.data.jobId;
  }

  async submitNoiseRemovalJob(
    audioFile: File,
    // token: string,
    params: {
      output_format: string;
      enhance?: boolean;
      device?: string;
    },
  ): Promise<number> {
    const apiKey = await getValidApiKey();
    const formData = new FormData();
    formData.append("files", audioFile);

    const url = new URL(`${API_BASE_URL}/model/audio/noise-removal`);
    url.searchParams.append("model_name", "DeepFilterNet3");
    url.searchParams.append("output_format", params.output_format);
    if (params.enhance !== undefined) {
      url.searchParams.append("enhance", params.enhance ? "True" : "False");
    }
    if (params.device) url.searchParams.append("device", params.device);

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "x-api-key": apiKey },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${errorText}`);
    }

    const data: SubmitJobResponse = await response.json();
    return data.data.jobId;
  }

  async submitEnhanceJob(
    audioFile: File,
    // token: string,
    params: {
      output_format: string;
      denoise?: boolean;
      device?: string;
    },
  ): Promise<number> {
    const apiKey = await getValidApiKey();
    const formData = new FormData();
    formData.append("audio_file", audioFile);

    const url = new URL(`${API_BASE_URL}/model/audio/enhance`);
    url.searchParams.append("model_name", "resemble-enhance");
    url.searchParams.append("output_format", params.output_format);
    if (params.denoise !== undefined) {
      url.searchParams.append("denoise", params.denoise ? "True" : "False");
    }
    if (params.device) url.searchParams.append("device", params.device);

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "x-api-key": apiKey },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${errorText}`);
    }

    const data: SubmitJobResponse = await response.json();
    return data.data.jobId;
  }

  async getJobStatus(jobId: number): Promise<JobStatusResponse> {
    const apiKey = await getValidApiKey();
    const url = `${API_BASE_URL}/model/job?job_id=${jobId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "x-api-key": apiKey },
    });

    if (!response.ok) {
      throw new Error(`Failed to get job status: ${response.status}`);
    }

    return await response.json();
  }

  async getJobAssets(jobId: number): Promise<Blob> {
    const apiKey = await getValidApiKey();
    const url = `${API_BASE_URL}/assets?job_id=${jobId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get job assets: ${response.status}`);
    }

    return await response.blob();
  }

  async cancelJob(jobId: number): Promise<void> {
    console.log("Cancel job:", jobId);
    throw new Error("Cancel endpoint not implemented yet");
  }
}

export const aiEngineService = new AIEngineService();