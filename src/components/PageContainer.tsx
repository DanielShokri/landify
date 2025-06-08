import React, { ReactNode } from 'react';

interface PageContainerProps {
    children: ReactNode;
    title?: string;
    subtitle?: string;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
    className?: string;
    centerContent?: boolean;
}

const PageContainer: React.FC<PageContainerProps> = ({
    children,
    title,
    subtitle,
    maxWidth = 'xl',
    className = '',
    centerContent = false
}) => {
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
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {title}
                        </h1>
                    )}
                    {subtitle && (
                        <p className="text-lg text-gray-600">
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