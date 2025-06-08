import type { ReactNode } from 'react';

interface PageContainerProps {
    children: ReactNode;
    title?: ReactNode;
    subtitle?: ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
    className?: string;
    centerContent?: boolean;
}

const PageContainer = ({
  children,
  title,
  subtitle,
  maxWidth = 'xl',
  className = '',
  centerContent = false
}: PageContainerProps) => {
  const getMaxWidthClass = () => {
    switch (maxWidth) {
    case 'sm': return 'max-w-sm';
    case 'md': return 'max-w-md';
    case 'lg': return 'max-w-lg';
    case 'xl': return 'max-w-xl';
    case '2xl': return 'max-w-2xl';
    case '7xl': return 'max-w-7xl';
    case 'full': return 'max-w-full';
    default: return 'max-w-xl';
    }
  };

  const containerClasses = `
    ${getMaxWidthClass()} 
    mx-auto 
    px-4 
    py-8 
    ${centerContent ? 'text-center' : ''} 
    ${className}
  `.trim();

  return (
    <div className={containerClasses}>
      {(title || subtitle) && (
        <div className="mb-8">
          {title && (
            <h1 className="text-3xl font-bold text-white mb-2">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-lg text-gray-300">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default PageContainer; 