import { contentService } from '@/api/contentService';
import type { ContentGenerationRequest, GeneratedContent } from '@/types/content';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

interface FastGenerationState {
  currentStage: string;
  progress: number;
  logs: string[];
}

export function useFastGeneration() {
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [generationState, setGenerationState] = useState<FastGenerationState>({
    currentStage: 'idle',
    progress: 0,
    logs: []
  });

  // React Query mutation for backend generation
  const mutation = useMutation({
    mutationFn: async (request: ContentGenerationRequest): Promise<GeneratedContent> => {
      return contentService.generateLandingPageWithAgents(request);
    },
    onSuccess: (data) => {
      setGeneratedContent(data);
      setGenerationState({
        currentStage: 'completed',
        progress: 100,
        logs: ['Generation completed successfully!']
      });
    },
    onError: (error: Error) => {
      console.error('Generation failed:', error);
      setGenerationState({
        currentStage: 'error',
        progress: 0,
        logs: [`Error: ${error.message}`]
      });
    }
  });

  // Simplified generation method (backend handles the complexity)
  const generateWithAgents = async (request: ContentGenerationRequest): Promise<GeneratedContent> => {
    setGenerationState({
      currentStage: 'generating',
      progress: 50,
      logs: ['Sending request to backend...']
    });

    const result = await mutation.mutateAsync(request);
    return result;
  };

  const clearContent = () => {
    setGeneratedContent(null);
    setGenerationState({
      currentStage: 'idle',
      progress: 0,
      logs: []
    });
    mutation.reset();
  };

  const getAgentCapabilities = async () => {
    return contentService.getAgentCapabilities();
  };

  return {
    generateWithAgents,
    clearContent,
    getAgentCapabilities,
    generatedContent,
    generationState,
    isLoading: mutation.isPending,
    error: mutation.error as Error | null,
    isSuccess: mutation.isSuccess,
    
    // Real-time generation info
    currentStage: generationState.currentStage,
    progress: generationState.progress,
    logs: generationState.logs
  };
} 