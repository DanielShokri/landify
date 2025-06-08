import type { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    variant?: 'landing' | 'highlight' | 'detailed';
    gradientFrom?: string;
    gradientTo?: string;
    className?: string;
}

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  variant = 'detailed',
  gradientFrom = 'blue-400',
  gradientTo = 'blue-600',
  className = ''
}: FeatureCardProps) => {
  const getCardStyles = () => {
    switch (variant) {
    case 'landing':
      return 'text-center';
    case 'highlight':
      return 'text-center';
    case 'detailed':
    default:
      return 'group p-8 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105';
    }
  };

  const getIconContainerStyles = () => {
    switch (variant) {
    case 'landing':
      return `w-16 h-16 bg-gradient-to-br from-${gradientFrom} to-${gradientTo} rounded-full flex items-center justify-center mx-auto mb-4`;
    case 'highlight':
      return `w-16 h-16 bg-gradient-to-br from-${gradientFrom} to-${gradientTo} rounded-full flex items-center justify-center text-2xl font-bold text-white mb-6 relative z-10`;
    case 'detailed':
    default:
      return `w-12 h-12 bg-gradient-to-br from-${gradientFrom} to-${gradientTo} rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`;
    }
  };

  const getIconStyles = () => {
    switch (variant) {
    case 'landing':
    case 'highlight':
      return 'w-8 h-8 text-white';
    case 'detailed':
    default:
      return 'w-6 h-6 text-white';
    }
  };

  const getTitleStyles = () => {
    switch (variant) {
    case 'landing':
    case 'highlight':
      return 'text-xl font-semibold text-white mb-2';
    case 'detailed':
    default:
      return 'text-xl font-semibold text-white mb-3';
    }
  };

  const getDescriptionStyles = () => {
    switch (variant) {
    case 'landing':
    case 'highlight':
      return 'text-gray-300';
    case 'detailed':
    default:
      return 'text-gray-300 leading-relaxed';
    }
  };

  return (
    <div className={`${getCardStyles()} ${className}`}>
      <div className={getIconContainerStyles()}>
        <Icon className={getIconStyles()} />
      </div>
      <h3 className={getTitleStyles()}>{title}</h3>
      <p className={getDescriptionStyles()}>{description}</p>
    </div>
  );
};

export default FeatureCard; 