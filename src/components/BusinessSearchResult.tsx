import { Check, Star } from 'lucide-react';

interface BusinessSearchResultProps {
    business: {
        name: string;
        address: string;
        rating?: number;
        reviews?: number;
        placeId: string;
    };
    isSelected: boolean;
    onClick: () => void;
    className?: string;
}

const BusinessSearchResult = ({
    business,
    isSelected,
    onClick,
    className = ''
}: BusinessSearchResultProps) => {
    return (
        <div
            className={`p-6 cursor-pointer rounded-xl transition-all duration-300 border ${isSelected
                ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-400/50 ring-2 ring-blue-400/30'
                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                } ${className}`}
            onClick={onClick}
        >
            <h3 className="font-semibold text-lg text-white">{business.name}</h3>
            <p className="text-sm text-gray-300 mt-1">{business.address}</p>

            {(business.rating || business.reviews) && (
                <div className="flex items-center mt-3 text-sm text-gray-400">
                    {business.rating && (
                        <span className="mr-4 flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 mr-1 fill-current" />
                            {business.rating}
                        </span>
                    )}
                    {business.reviews && (
                        <span>({business.reviews} reviews)</span>
                    )}
                </div>
            )}

            {isSelected && (
                <div className="flex items-center mt-3">
                    <Check className="w-4 h-4 text-green-400 mr-2" />
                    <span className="text-sm text-green-400 font-medium">Selected</span>
                </div>
            )}
        </div>
    );
};

export default BusinessSearchResult; 