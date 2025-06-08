import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { BusinessSearchResult } from '../types/business';
import { googleMapsService } from '../api/googleMapsService';

export function useBusinessSearch() {
  const [searchResults, setSearchResults] = useState<BusinessSearchResult[]>([]);
  const [autocompleteQuery, setAutocompleteQuery] = useState('');
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);

  // Main search mutation
  const mutation = useMutation({
    mutationFn: (query: string) => googleMapsService.searchBusiness(query),
    onSuccess: (data) => {
      setSearchResults(data || []);
    },
    onError: (error) => {
      console.error('Business search failed:', error);
      setSearchResults([]);
    }
  });

  // Autocomplete query
  const { isLoading: isAutocompleteLoading } = useQuery({
    queryKey: ['autocomplete', autocompleteQuery],
    queryFn: () => googleMapsService.getAutocompleteSuggestions(autocompleteQuery),
    enabled: autocompleteQuery.length >= 2,
    onSuccess: (data: google.maps.places.AutocompletePrediction[]) => {
      setAutocompleteSuggestions(data || []);
    },
    onError: (error: Error) => {
      console.error('Autocomplete failed:', error);
      setAutocompleteSuggestions([]);
    },
    staleTime: 1000, // Cache for 1 second
    cacheTime: 5 * 60 * 1000 // Keep in cache for 5 minutes
  });

  const searchBusiness = (query: string) => {
    mutation.mutate(query);
    // Clear autocomplete when doing a full search
    setAutocompleteSuggestions([]);
    setAutocompleteQuery('');
  };

  const updateAutocompleteQuery = (query: string) => {
    setAutocompleteQuery(query);
  };

  const clearAutocomplete = () => {
    setAutocompleteSuggestions([]);
    setAutocompleteQuery('');
  };

  const clearResults = () => {
    setSearchResults([]);
    setAutocompleteSuggestions([]);
    setAutocompleteQuery('');
    mutation.reset();
  };

  return {
    searchBusiness,
    clearResults,
    updateAutocompleteQuery,
    clearAutocomplete,
    searchResults,
    autocompleteSuggestions,
    isLoading: mutation.isPending,
    isAutocompleteLoading,
    error: mutation.error as Error | null,
    hasResults: searchResults.length > 0,
    hasAutocompleteSuggestions: autocompleteSuggestions.length > 0
  };
} 