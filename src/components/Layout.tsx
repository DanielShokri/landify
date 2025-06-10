import type { ReactNode } from 'react';
import Footer from './Footer';
import Header from './Header';

interface LayoutProps {
    children: ReactNode;
    variant?: 'landing' | 'app' | 'minimal';
    showHeader?: boolean;
    showFooter?: boolean;
    className?: string;
    containerClassName?: string;
}

const Layout = ({
  children,
  variant = 'app',
  showHeader = true,
  showFooter = true,
  className = '',
  containerClassName = ''
}: LayoutProps) => {
  const getLayoutStyles = () => {
    switch (variant) {
    case 'landing':
      return 'min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden';
    case 'minimal':
      return 'min-h-screen bg-white';
    case 'app':
    default:
      return 'min-h-screen bg-gray-50';
    }
  };

  const getContainerStyles = () => {
    switch (variant) {
    case 'landing':
      return 'relative z-10 max-w-7xl mx-auto px-6';
    case 'minimal':
      return 'max-w-4xl mx-auto px-4';
    case 'app':
    default:
      return 'max-w-7xl mx-auto px-6';
    }
  };

  const renderBackgroundEffects = () => {
    if (variant === 'landing') {
      return (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`${getLayoutStyles()} ${className} flex flex-col`}>
      {renderBackgroundEffects()}

      {showHeader && (
        <div className="w-full flex-shrink-0">
          <Header variant={variant} />
        </div>
      )}

      <main className={`${getContainerStyles()} ${containerClassName} flex-1`}>
        {children}
      </main>

      {showFooter && <Footer variant={variant} />}
    </div>
  );
};

export default Layout; 