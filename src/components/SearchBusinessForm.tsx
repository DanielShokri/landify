import { BusinessSearchResult, SearchInput, SelectedBusinessCard } from '@/components';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { BusinessSearchResult as BusinessSearchResultType } from '@/types/business';
import { Sparkles } from 'lucide-react';

interface SearchBusinessFormProps {
    searchQuery: string;
    showAutocomplete: boolean;
    hasAutocompleteSuggestions: boolean;
    autocompleteSuggestions: google.maps.places.AutocompletePrediction[];
    isLoading: boolean;
    error: Error | null;
    searchResults: BusinessSearchResultType[];
    selectedBusiness: BusinessSearchResultType | null;
    canGenerate: boolean;
    onInputChange: (value: string) => void;
    onInputFocus: () => void;
    onInputBlur: () => void;
    onSearch: () => void;
    onAutocompleteSelect: (suggestion: google.maps.places.AutocompletePrediction) => void;
    onSelectBusiness: (business: BusinessSearchResultType) => void;
    onManualEntry: () => void;
    onGenerateLandingPage: () => void;
}

const SearchBusinessForm = ({
    searchQuery,
    showAutocomplete,
    hasAutocompleteSuggestions,
    autocompleteSuggestions,
    isLoading,
    error,
    searchResults,
    selectedBusiness,
    canGenerate,
    onInputChange,
    onInputFocus,
    onInputBlur,
    onSearch,
    onAutocompleteSelect,
    onSelectBusiness,
    onManualEntry,
    onGenerateLandingPage
}: SearchBusinessFormProps) => {
    return (
        <>
            <div className="space-y-4">
                <Label htmlFor="search" className="text-base font-medium text-white">
                    Search for your business on Google Maps
                </Label>

                {/* Using the SearchInput component */}
                <SearchInput
                    value={searchQuery}
                    placeholder="Enter business name and location..."
                    isLoading={isLoading}
                    showAutocomplete={showAutocomplete}
                    hasAutocompleteSuggestions={hasAutocompleteSuggestions}
                    autocompleteSuggestions={autocompleteSuggestions}
                    onInputChange={onInputChange}
                    onInputFocus={onInputFocus}
                    onInputBlur={onInputBlur}
                    onSearch={onSearch}
                    onAutocompleteSelect={onAutocompleteSelect}
                />

                {error && (
                    <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                        Search failed. Please try again or enter details manually.
                    </p>
                )}
            </div>

            {/* Search Results using BusinessSearchResult components */}
            {searchResults && searchResults.length > 0 && (
                <div className="space-y-4">
                    <Label className="text-base font-medium text-white">Search Results</Label>
                    <div className="search-results-container max-h-80 overflow-y-auto space-y-3 pr-2">
                        {searchResults.map((result: BusinessSearchResultType, index: number) => (
                            <BusinessSearchResult
                                key={index}
                                business={result}
                                isSelected={selectedBusiness?.placeId === result.placeId}
                                onClick={() => onSelectBusiness(result)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Selected Business Card */}
            {selectedBusiness && (
                <SelectedBusinessCard business={selectedBusiness} />
            )}

            <div className="flex flex-col space-y-4">
                {selectedBusiness && (
                    <Button
                        onClick={onGenerateLandingPage}
                        disabled={!canGenerate}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium py-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl text-base md:text-lg"
                    >
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate
                    </Button>
                )}
                <div className="text-left text-gray-400 text-sm">Can't find your business? </div>
                <Button
                    variant="outline"
                    onClick={onManualEntry}
                    className="w-full border-white/20 text-black hover:bg-white/10 hover:text-white hover:border-white/40 transition-all duration-300"
                >
                    Enter details manually
                </Button>
            </div>
        </>
    );
};

export default SearchBusinessForm; 