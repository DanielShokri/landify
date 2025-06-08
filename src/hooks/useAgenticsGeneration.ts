import { agenticsService } from '@/api/agenticsService';
import { ContentGenerationRequest, GeneratedContent } from '@/types/content';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

interface AgenticsGenerationState {
  currentStage: string;
  progress: number;
  agentOutputs: Record<string, any>;
  logs: string[];
}

export function useAgenticsGeneration() {
  const [generationState, setGenerationState] = useState<AgenticsGenerationState>({
    currentStage: 'idle',
    progress: 0,
    agentOutputs: {},
    logs: []
  });

  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const mutation = useMutation({
    mutationFn: (request: ContentGenerationRequest) => {
      // Reset state at start
      setGenerationState({
        currentStage: 'starting',
        progress: 0,
        agentOutputs: {},
        logs: []
      });

      return agenticsService.generateLandingPageWithAgents(request);
    },
    onSuccess: (data) => {
      // Only update if we're using the old method (fallback)
      if (!generatedContent) {
        setGeneratedContent(data);
        setGenerationState(prev => ({
          ...prev,
          currentStage: 'completed',
          progress: 100,
          logs: [...prev.logs, '✨ Multi-Agent Generation Complete!']
        }));
      }
    },
    onError: (error: Error) => {
      console.error('Agentics generation failed:', error);
      setGenerationState(prev => ({
        ...prev,
        currentStage: 'error',
        logs: [...prev.logs, `❌ Error: ${error.message}`]
      }));
    }
  });

  const generateWithAgents = async (request: ContentGenerationRequest): Promise<GeneratedContent> => {
    // Set loading state immediately
    setIsGenerating(true);
    
    // Use real-time progress from agents
    return new Promise((resolve, reject) => {
      const progressSubscription = agenticsService.generateWithProgress(request).subscribe({
        next: (event) => {
          if ('type' in event && event.type === 'result') {
            // This is the final result
            setGeneratedContent(event.data);
            setGenerationState(prev => ({
              ...prev,
              currentStage: 'completed',
              progress: 100
            }));
            setIsGenerating(false);
            resolve(event.data);
          } else {
            // This is a progress event
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
      agentOutputs: {},
      logs: []
    });
    mutation.reset();
  };

  const getAgentCapabilities = () => {
    return agenticsService.getAgentCapabilities();
  };

  return {
    generateWithAgents,
    clearContent,
    getAgentCapabilities,
    generatedContent,
    generationState,
    isLoading: isGenerating, // Use our manual loading state
    error: mutation.error as Error | null,
    isSuccess: mutation.isSuccess,
    
    // Real-time generation info
    currentStage: generationState.currentStage,
    progress: generationState.progress,
    logs: generationState.logs,
    agentOutputs: generationState.agentOutputs
  };
} 