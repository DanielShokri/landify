import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { aiDesignService, DesignRequest, AIDesignSuggestion } from '@/api/aiDesignService';
import { LandingPageTheme } from '@/types/content';
import { BusinessData } from '@/types/business';

export function useAIDesign() {
  const [suggestions, setSuggestions] = useState<AIDesignSuggestion | null>(null);
  const [appliedTheme, setAppliedTheme] = useState<LandingPageTheme | null>(null);

  const generateSuggestionsMutation = useMutation({
    mutationFn: (request: DesignRequest) => {
      return aiDesignService.generateDesignSuggestions(request);
    },
    onSuccess: (data) => {
      setSuggestions(data);
    },
    onError: (error) => {
      console.error('❌ useAIDesign: Failed to generate design suggestions:', error);
    }
  });

  const generateSuggestions = (request: DesignRequest) => {
    generateSuggestionsMutation.mutate(request);
  };

  const applyAITheme = (businessData: BusinessData) => {
    if (!suggestions) return null;
    
    const theme = aiDesignService.convertToTheme(suggestions, businessData);
    setAppliedTheme(theme);
    return theme;
  };

  const clearSuggestions = () => {
    setSuggestions(null);
    setAppliedTheme(null);
    generateSuggestionsMutation.reset();
  };

  return {
    suggestions,
    appliedTheme,
    generateSuggestions,
    applyAITheme,
    clearSuggestions,
    isGenerating: generateSuggestionsMutation.isPending,
    error: generateSuggestionsMutation.error as Error | null,
    hasError: !!generateSuggestionsMutation.error,
    hasSuggestions: !!suggestions
  };
} 