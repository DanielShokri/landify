import { Check } from 'lucide-react';

interface SelectedBusinessCardProps {
    business: {
        name: string;
        address: string;
    };
    className?: string;
}

const SelectedBusinessCard = ({ business, className = '' }: SelectedBusinessCardProps) => {
    return (
        <div className={`bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-xl p-6 ${className}`}>
            <h3 className="font-semibold text-green-400 mb-2 flex items-center">
                <Check className="w-5 h-5 mr-2" />
                Selected Business
            </h3>
            <p className="text-sm text-green-300 font-medium">{business.name}</p>
            <p className="text-xs text-green-400/80">{business.address}</p>
        </div>
    );
};

export default SelectedBusinessCard; 