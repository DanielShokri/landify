import { fastAgenticsService } from '@/api/fastAgenticsService';
import type { ContentGenerationRequest, GeneratedContent } from '@/types/content';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

interface FastGenerationState {
  currentStage: string;
  progress: number;
  logs: string[];
}

export function useFastGeneration() {
  const [generationState, setGenerationState] = useState<FastGenerationState>({
    currentStage: 'idle',
    progress: 0,
    logs: []
  });

  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const mutation = useMutation({
    mutationFn: (request: ContentGenerationRequest) => {
      setGenerationState({
        currentStage: 'starting',
        progress: 0,
        logs: []
      });

      return fastAgenticsService.generateLandingPageWithAgents(request);
    },
    onSuccess: (data) => {
      if (!generatedContent) {
        setGeneratedContent(data);
        setGenerationState(prev => ({
          ...prev,
          currentStage: 'completed',
          progress: 100,
          logs: [...prev.logs, '🎉 Fast generation complete!']
        }));
      }
    },
    onError: (error: Error) => {
      console.error('Fast generation failed:', error);
      setGenerationState(prev => ({
        ...prev,
        currentStage: 'error',
        logs: [...prev.logs, `❌ Error: ${error.message}`]
      }));
    }
  });

  const generateWithAgents = async (request: ContentGenerationRequest): Promise<GeneratedContent> => {
    setIsGenerating(true);
    
    return new Promise((resolve, reject) => {
      const progressSubscription = fastAgenticsService.generateWithProgress(request).subscribe({
        next: (event) => {
          if ('type' in event && event.type === 'result') {
            setGeneratedContent(event.data);
            setGenerationState(prev => ({
              ...prev,
              currentStage: 'completed',
              progress: 100
            }));
            setIsGenerating(false);
            resolve(event.data);
          } else {
            const progressEvent = event as any;
            setGenerationState(prev => ({
              ...prev,
              currentStage: progressEvent.stage,
              progress: progressEvent.progress,
              logs: [...prev.logs, progressEvent.message]
            }));
          }
        },
        complete: () => {
          progressSubscription.unsubscribe();
          setIsGenerating(false);
        },
        error: (error) => {
          progressSubscription.unsubscribe();
          setIsGenerating(false);
          reject(error);
        }
      });
    });
  };

  const clearContent = () => {
    setGeneratedContent(null);
    setIsGenerating(false);
    setGenerationState({
      currentStage: 'idle',
      progress: 0,
      logs: []
    });
    mutation.reset();
  };

  const getAgentCapabilities = () => {
    return fastAgenticsService.getAgentCapabilities();
  };

  return {
    generateWithAgents,
    clearContent,
    getAgentCapabilities,
    generatedContent,
    generationState,
    isLoading: isGenerating,
    error: mutation.error as Error | null,
    isSuccess: mutation.isSuccess,
    
    // Real-time generation info
    currentStage: generationState.currentStage,
    progress: generationState.progress,
    logs: generationState.logs
  };
} 