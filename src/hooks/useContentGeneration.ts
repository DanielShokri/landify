import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { GeneratedContent, ContentGenerationRequest } from '../types/content';
import { openaiService } from '../api/openaiService';

export function useContentGeneration() {
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);

  const mutation = useMutation({
    mutationFn: (request: ContentGenerationRequest) => openaiService.generateLandingPageContent(request),
    onSuccess: (data) => {
      setGeneratedContent(data);
    },
    onError: (error) => {
      console.error('Content generation failed:', error);
    }
  });

  const generateContent = async (request: ContentGenerationRequest): Promise<GeneratedContent> => {
    const result = await mutation.mutateAsync(request);
    return result;
  };

  const clearContent = () => {
    setGeneratedContent(null);
    mutation.reset();
  };

  return {
    generateContent,
    clearContent,
    generatedContent,
    isLoading: mutation.isPending,
    error: mutation.error as Error | null,
    isSuccess: mutation.isSuccess
  };
} 