import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
    variant?: 'landing' | 'app' | 'minimal';
    showNavigation?: boolean;
    className?: string;
}

const Header: React.FC<HeaderProps> = ({
  variant = 'app',
  showNavigation = true,
  className = ''
}) => {
  const navigate = useNavigate();

  // Different styling based on variant
  const getHeaderStyles = () => {
    switch (variant) {
    case 'landing':
      return 'relative z-10 flex justify-between items-center p-6 max-w-7xl mx-auto';
    case 'minimal':
      return 'flex justify-between items-center p-4 border-b border-gray-200';
    case 'app':
    default:
      return 'flex justify-between items-center p-6 max-w-7xl mx-auto';
    }
  };

  const getLogoStyles = () => {
    switch (variant) {
    case 'landing':
      return 'text-white font-bold text-xl flex items-center gap-2';
    case 'minimal':
      return 'text-gray-900 font-bold text-lg flex items-center gap-2';
    case 'app':
    default:
      return 'text-gray-900 font-bold text-xl flex items-center gap-2';
    }
  };

  const getNavStyles = () => {
    switch (variant) {
    case 'landing':
      return 'flex items-center space-x-8';
    case 'minimal':
      return 'flex items-center space-x-4';
    case 'app':
    default:
      return 'flex items-center space-x-6';
    }
  };

  const getLinkStyles = () => {
    switch (variant) {
    case 'landing':
      return 'text-gray-300 hover:text-white transition-colors';
    case 'minimal':
      return 'text-gray-600 hover:text-gray-900 transition-colors text-sm';
    case 'app':
    default:
      return 'text-gray-600 hover:text-gray-900 transition-colors';
    }
  };

  const getButtonVariant = () => {
    switch (variant) {
    case 'landing':
      return 'outline';
    case 'minimal':
      return 'default';
    case 'app':
    default:
      return 'default';
    }
  };

  const getButtonStyles = () => {
    switch (variant) {
    case 'landing':
      return 'border-gray-600 text-black-300 hover:bg-white hover:text-slate-900 transition-all duration-300';
    case 'minimal':
      return 'text-sm';
    case 'app':
    default:
      return '';
    }
  };

  return (
    <nav className={`${getHeaderStyles()} ${className}`}>
      {/* Logo */}
      <button
        onClick={() => navigate('/')}
        className={getLogoStyles()}
      >
        <Sparkles className="w-6 h-6" />
                Landify
      </button>

      {/* Navigation */}
      {showNavigation && (
        <div className={getNavStyles()}>
          <button
            onClick={() => navigate('/pages')}
            className={getLinkStyles()}
          >
                        My Pages
          </button>

          <Button
            variant={getButtonVariant()}
            className={getButtonStyles()}
            onClick={() => navigate('/onboarding')}
          >
            {variant === 'minimal' ? 'Create' : 'Get Started'}
          </Button>
        </div>
      )}
    </nav>
  );
};

export default Header; 