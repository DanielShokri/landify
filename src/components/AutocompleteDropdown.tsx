import { MapPin } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// Use the Google Maps AutocompletePrediction type directly
type AutocompleteSuggestion = google.maps.places.AutocompletePrediction;

interface AutocompleteDropdownProps {
    suggestions: AutocompleteSuggestion[];
    onSelect: (suggestion: AutocompleteSuggestion) => void;
    className?: string;
    inputRef?: React.RefObject<HTMLInputElement>;
}

const AutocompleteDropdown = ({
  suggestions,
  onSelect,
  className = '',
  inputRef
}: AutocompleteDropdownProps) => {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (inputRef?.current) {
      const inputRect = inputRef.current.getBoundingClientRect();
      setPosition({
        top: inputRect.bottom + window.scrollY + 4,
        left: inputRect.left + window.scrollX,
        width: inputRect.width
      });
    }
  }, [inputRef]);

  useEffect(() => {
    updatePosition();
  }, [updatePosition, suggestions]);

  useEffect(() => {
    const handleScroll = () => updatePosition();
    const handleResize = () => updatePosition();

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [updatePosition]);

  const dropdownContent = (
    <div
      ref={dropdownRef}
      className={`autocomplete-dropdown fixed bg-slate-800/95 backdrop-blur-sm border border-white/20 rounded-lg shadow-xl z-[9999] h-60 overflow-y-auto ${className}`}
      style={{
        top: position.top,
        left: position.left,
        width: position.width,
        minWidth: '200px'
      }}
    >
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

  return createPortal(dropdownContent, document.body);
};

export default AutocompleteDropdown; 