// src/hooks/useSSESync.ts

import { useEffect } from 'react';
import { sseManager } from '@/services/sseManager';
import { aiEngineService } from '@/services/aiEngine';
import { useJobStore } from '@/store/jobStore';
import type { SSENotification } from '@/types';

/**
 * Hook to sync SSE notifications with job store
 * Call this once when user logs in
 */
export function useSSESync(token: string | null) {
  const { updateJobByJobId } = useJobStore();

  useEffect(() => {
    if (!token) {
      // User logged out, disconnect SSE
      sseManager.disconnect();
      return;
    }

    // Connect SSE
    sseManager.connect(token);

    // Subscribe to notifications
    const unsubscribe = sseManager.subscribe(async (notification: SSENotification) => {
      console.log('SSE notification:', notification);

      const { job_id, status } = notification;

      // Map backend status to our job status
      let jobStatus: 'pending' | 'processing' | 'completed' | 'failed';
      
      if (status === 'started') {
        jobStatus = 'pending';
      } else if (status === 'processing') {
        jobStatus = 'processing';
      } else if (status === 'completed') {
        jobStatus = 'completed';
      } else if (status === 'failed') {
        jobStatus = 'failed';
      } else {
        console.warn('Unknown SSE status:', status);
        return;
      }

      // Update job status in store
      updateJobByJobId(job_id, { status: jobStatus });

      // If completed, fetch the result
      if (status === 'completed') {
        try {
          const result = await aiEngineService.getJobStatus(job_id, token);
          
          // Extract transcribed text from STT response
          const transcribedText = 
            result.data.output?.transcriptions?.[0]?.transcribedText || '';

          // Update job with output
          updateJobByJobId(job_id, {
            status: 'completed',
            completedAt: Date.now(),
            output: {
              transcribedText,
              data: result.data.output, // Store full output
            },
          });
        } catch (error) {
          console.error('Failed to fetch job result:', error);
          updateJobByJobId(job_id, {
            status: 'failed',
            error: 'Failed to fetch result',
          });
        }
      }

      // If failed, update with error
      if (status === 'failed') {
        updateJobByJobId(job_id, {
          status: 'failed',
          completedAt: Date.now(),
          error: 'Job failed',
        });
      }
    });

    // Cleanup on unmount or token change
    return () => {
      unsubscribe();
      sseManager.disconnect();
    };
  }, [token, updateJobByJobId]);
}