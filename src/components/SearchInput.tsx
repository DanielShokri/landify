import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRef } from 'react';
import AutocompleteDropdown from './AutocompleteDropdown';

// Use the Google Maps AutocompletePrediction type directly
type AutocompleteSuggestion = google.maps.places.AutocompletePrediction;

interface SearchInputProps {
    value: string;
    placeholder?: string;
    isLoading?: boolean;
    showAutocomplete?: boolean;
    hasAutocompleteSuggestions?: boolean;
    autocompleteSuggestions?: AutocompleteSuggestion[];
    buttonText?: string;
    className?: string;
    onInputChange: (value: string) => void;
    onInputFocus: () => void;
    onInputBlur: () => void;
    onSearch: () => void;
    onAutocompleteSelect: (suggestion: AutocompleteSuggestion) => void;
}

const SearchInput = ({
  value,
  placeholder = 'Enter search query...',
  isLoading = false,
  showAutocomplete = false,
  hasAutocompleteSuggestions = false,
  autocompleteSuggestions = [],
  buttonText = 'Search',
  className = '',
  onInputChange,
  onInputFocus,
  onInputBlur,
  onSearch,
  onAutocompleteSelect
}: SearchInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      onSearch();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex space-x-3">
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            placeholder={placeholder}
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={onInputFocus}
            onBlur={onInputBlur}
            className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20 focus:border-white/40 transition-all duration-300"
          />

          {/* Autocomplete Dropdown */}
          {showAutocomplete && hasAutocompleteSuggestions && (
            <AutocompleteDropdown
              suggestions={autocompleteSuggestions}
              onSelect={onAutocompleteSelect}
              inputRef={inputRef}
            />
          )}
        </div>
        <Button
          onClick={onSearch}
          disabled={isLoading || !value.trim()}
          className="min-w-[100px] px-4 py-2 text-sm sm:min-w-[120px] sm:px-6 sm:py-3 sm:text-base bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          {isLoading ? (
            <>
              <span className="hidden sm:inline">Searching...</span>
              <span className="sm:hidden">...</span>
            </>
          ) : (
            buttonText
          )}
        </Button>
      </div>
    </div>
  );
};

export default SearchInput; 