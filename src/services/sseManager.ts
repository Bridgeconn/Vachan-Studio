// src/services/sseManager.ts

import { SSE_ENDPOINT, SSE_RECONNECT_DELAY } from '@/config/constants';
import type { SSENotification } from '@/types';

type SSECallback = (notification: SSENotification) => void;

class SSEManager {
  private abortController: AbortController | null = null;
  private callbacks: Set<SSECallback> = new Set();
  private token: string | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private isConnecting: boolean = false;

  /**
   * Start listening to SSE events
   */
  async connect(token: string): Promise<void> {
    this.token = token;
    this.disconnect(); // Close any existing connection

    if (this.isConnecting) return;
    this.isConnecting = true;

    try {
      this.abortController = new AbortController();

      const response = await fetch(SSE_ENDPOINT, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/event-stream',
        },
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`SSE connection failed: ${response.status}`);
      }

      console.log('SSE connected');
      this.isConnecting = false;

      // Read the stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Response body is not readable');
      }

      // Process stream
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('SSE stream ended');
          this.scheduleReconnect();
          break;
        }

        // Decode chunk
        const chunk = decoder.decode(value, { stream: true });
        
        // Process SSE messages
        this.processSSEChunk(chunk);
      }
    } catch (error: any) {
      this.isConnecting = false;
      
      if (error.name === 'AbortError') {
        console.log('SSE connection aborted');
        return;
      }

      console.error('SSE error:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Process SSE chunk and extract data
   */
  private processSSEChunk(chunk: string): void {
    const lines = chunk.split('\n');

    for (const line of lines) {
      // SSE format: "data: {...}"
      if (line.startsWith('data:')) {
        try {
          const jsonStr = line.substring(5).trim(); // Remove "data:" prefix
          const data = JSON.parse(jsonStr);
          console.log('SSE notification received:', data);

          // Notify all subscribers
          this.callbacks.forEach((callback) => callback(data));
        } catch (error) {
          console.error('Failed to parse SSE message:', error);
        }
      }
    }
  }

  /**
   * Stop listening to SSE events
   */
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
      console.log('SSE disconnected');
    }

    this.isConnecting = false;
  }

  /**
   * Subscribe to SSE notifications
   */
  subscribe(callback: SSECallback): () => void {
    this.callbacks.add(callback);

    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback);
    };
  }

  /**
   * Reconnect after delay
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimeout || !this.token) return;

    console.log(`Reconnecting SSE in ${SSE_RECONNECT_DELAY}ms...`);
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      if (this.token) {
        this.connect(this.token);
      }
    }, SSE_RECONNECT_DELAY);
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.abortController !== null && !this.isConnecting;
  }
}

export const sseManager = new SSEManager();