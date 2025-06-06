import React, { createContext, useContext } from 'react';
import { LandingPageTheme } from '@/types/content';

interface ThemeContextType {
  theme: LandingPageTheme;
  getBackgroundClasses: () => string;
  getTextClasses: () => string;
  getCardClasses: () => string;
  getButtonClasses: () => string;
  getGradientClasses: () => string;
  getShadowClasses: () => string;
  getContainerClasses: () => string;
  getSectionSpacing: () => string;
  getCardPadding: () => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  theme: LandingPageTheme;
  children: React.ReactNode;
}

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const getBackgroundClasses = (): string => {
    if (theme.effects.gradientBackground) {
      return `min-h-screen relative overflow-hidden`;
    }
    return `min-h-screen relative overflow-hidden`;
  };

  const getTextClasses = (): string => {
    return 'text-current';
  };

  const getCardClasses = (): string => {
    let classes = 'rounded-xl border transition-all duration-300';
    
    if (theme.effects.cardBlur) {
      classes += ' backdrop-blur-sm';
    }
    
    switch (theme.effects.shadows) {
      case 'soft':
        classes += ' shadow-sm hover:shadow-md';
        break;
      case 'medium':
        classes += ' shadow-md hover:shadow-lg';
        break;
      case 'strong':
        classes += ' shadow-lg hover:shadow-xl';
        break;
      case 'none':
        classes += ' shadow-none';
        break;
      default:
        classes += ' shadow-md hover:shadow-lg';
    }

    if (theme.effects.animations) {
      classes += ' hover:scale-105';
    }

    return classes;
  };

  const getButtonClasses = (): string => {
    let classes = 'font-medium transition-all duration-300 rounded-lg';
    
    switch (theme.effects.shadows) {
      case 'soft':
        classes += ' shadow-sm hover:shadow-md';
        break;
      case 'medium':
        classes += ' shadow-md hover:shadow-lg';
        break;
      case 'strong':
        classes += ' shadow-lg hover:shadow-xl';
        break;
      case 'none':
        classes += ' shadow-none';
        break;
      default:
        classes += ' shadow-lg hover:shadow-xl';
    }

    return classes;
  };

  const getGradientClasses = (): string => {
    return 'bg-gradient-to-r';
  };

  const getShadowClasses = (): string => {
    switch (theme.effects.shadows) {
      case 'soft':
        return 'shadow-sm';
      case 'medium':
        return 'shadow-md';
      case 'strong':
        return 'shadow-lg';
      case 'none':
        return 'shadow-none';
      default:
        return 'shadow-md';
    }
  };

  const getContainerClasses = (): string => {
    return `max-w-7xl mx-auto px-6`;
  };

  const getSectionSpacing = (): string => {
    return `mb-32`;
  };

  const getCardPadding = (): string => {
    return `p-8`;
  };

  const contextValue: ThemeContextType = {
    theme,
    getBackgroundClasses,
    getTextClasses,
    getCardClasses,
    getButtonClasses,
    getGradientClasses,
    getShadowClasses,
    getContainerClasses,
    getSectionSpacing,
    getCardPadding
  };

  // Apply CSS custom properties for the theme
  const themeStyles: React.CSSProperties = {
    '--theme-primary': theme.colors.primary,
    '--theme-secondary': theme.colors.secondary,
    '--theme-accent': theme.colors.accent,
    '--theme-background': theme.colors.background,
    '--theme-background-secondary': theme.colors.backgroundSecondary,
    '--theme-text': theme.colors.text,
    '--theme-text-secondary': theme.colors.textSecondary,
    '--theme-card-background': theme.colors.cardBackground,
    '--theme-card-border': theme.colors.cardBorder,
    '--theme-gradient-from': theme.colors.gradientFrom,
    '--theme-gradient-to': theme.colors.gradientTo,
    '--theme-font-heading': theme.fonts.heading,
    '--theme-font-body': theme.fonts.body,
    fontFamily: theme.fonts.body,
    backgroundColor: theme.colors.background,
    color: theme.colors.text
  } as React.CSSProperties;

  return (
    <ThemeContext.Provider value={contextValue}>
      <div style={themeStyles} className="min-h-screen">
        <style>{`
          * {
            color: inherit;
          }
          
          h1, h2, h3, h4, h5, h6 {
            font-family: ${theme.fonts.heading};
          }
          
          .theme-card {
            background-color: ${theme.colors.cardBackground};
            border-color: ${theme.colors.cardBorder};
          }
          
          .theme-button-primary {
            background: linear-gradient(to right, ${theme.colors.gradientFrom}, ${theme.colors.gradientTo});
            color: ${theme.colors.background};
          }
          
          .theme-button-primary:hover {
            background: linear-gradient(to right, ${theme.colors.primary}, ${theme.colors.secondary});
          }
          
          .theme-text-primary {
            color: ${theme.colors.primary};
          }
          
          .theme-text-secondary {
            color: ${theme.colors.textSecondary};
          }
          
          .theme-background-gradient {
            background: linear-gradient(135deg, ${theme.colors.gradientFrom}, ${theme.colors.gradientTo});
          }
          
          .theme-bg-secondary {
            background-color: ${theme.colors.backgroundSecondary};
          }
          
          .theme-border {
            border-color: ${theme.colors.cardBorder};
          }
        `}</style>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 