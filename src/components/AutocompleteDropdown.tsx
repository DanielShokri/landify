import { MapPin } from 'lucide-react';

// Use the Google Maps AutocompletePrediction type directly
type AutocompleteSuggestion = google.maps.places.AutocompletePrediction;

interface AutocompleteDropdownProps {
    suggestions: AutocompleteSuggestion[];
    onSelect: (suggestion: AutocompleteSuggestion) => void;
    className?: string;
}

const AutocompleteDropdown = ({
    suggestions,
    onSelect,
    className = ''
}: AutocompleteDropdownProps) => {
    return (
        <div className={`absolute top-full left-0 right-0 mt-1 bg-slate-800/95 backdrop-blur-sm border border-white/20 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto ${className}`}>
            {suggestions.map((suggestion, index) => (
                <div
                    key={suggestion.place_id || index}
                    className="px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors duration-200 border-b border-white/10 last:border-b-0"
                    onClick={() => onSelect(suggestion)}
                >
                    <div className="flex items-start space-x-3">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">
                                {suggestion.structured_formatting?.main_text || suggestion.description}
                            </p>
                            <p className="text-gray-400 text-xs truncate">
                                {suggestion.structured_formatting?.secondary_text || ''}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AutocompleteDropdown; 