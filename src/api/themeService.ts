import { LandingPageTheme } from '@/types/content';
import { BusinessData } from '@/types/business';
import { aiDesignService } from './aiDesignService';

interface ThemeTemplate {
  colors: LandingPageTheme['colors'];
  fonts: LandingPageTheme['fonts'];
  effects: LandingPageTheme['effects'];
  spacing: LandingPageTheme['spacing'];
}

class ThemeService {
  private industryThemes: Record<string, ThemeTemplate> = {
    restaurant: {
      colors: {
        primary: '#d97706', // Warm orange
        secondary: '#f59e0b', // Amber
        accent: '#dc2626', // Red
        background: '#fef7ed', // Very light orange
        backgroundSecondary: '#fff7ed',
        text: '#1f2937', // Dark gray
        textSecondary: '#6b7280',
        cardBackground: '#ffffff',
        cardBorder: '#fed7aa',
        gradientFrom: '#f59e0b',
        gradientTo: '#d97706'
      },
      fonts: {
        heading: 'Playfair Display, serif',
        body: 'Inter, sans-serif'
      },
      effects: {
        cardBlur: true,
        gradientBackground: true,
        animations: true,
        shadows: 'medium'
      },
      spacing: {
        sectionGap: 'mb-20',
        cardPadding: 'p-8',
        containerMaxWidth: 'max-w-7xl'
      }
    },
    legal: {
      colors: {
        primary: '#1e40af', // Professional blue
        secondary: '#3b82f6',
        accent: '#059669', // Trust green
        background: '#f8fafc', // Very light blue-gray
        backgroundSecondary: '#f1f5f9',
        text: '#0f172a', // Near black
        textSecondary: '#475569',
        cardBackground: '#ffffff',
        cardBorder: '#cbd5e1',
        gradientFrom: '#1e40af',
        gradientTo: '#1e3a8a'
      },
      fonts: {
        heading: 'Georgia, serif',
        body: 'system-ui, sans-serif'
      },
      effects: {
        cardBlur: false,
        gradientBackground: false,
        animations: false,
        shadows: 'soft'
      },
      spacing: {
        sectionGap: 'mb-24',
        cardPadding: 'p-10',
        containerMaxWidth: 'max-w-6xl'
      }
    },
    healthcare: {
      colors: {
        primary: '#0ea5e9', // Medical blue
        secondary: '#06b6d4',
        accent: '#10b981', // Health green
        background: '#f0fdff', // Very light cyan
        backgroundSecondary: '#ecfeff',
        text: '#0c4a6e', // Dark blue
        textSecondary: '#0e7490',
        cardBackground: '#ffffff',
        cardBorder: '#a5f3fc',
        gradientFrom: '#0ea5e9',
        gradientTo: '#0284c7'
      },
      fonts: {
        heading: 'Inter, sans-serif',
        body: 'Inter, sans-serif'
      },
      effects: {
        cardBlur: true,
        gradientBackground: true,
        animations: true,
        shadows: 'soft'
      },
      spacing: {
        sectionGap: 'mb-20',
        cardPadding: 'p-8',
        containerMaxWidth: 'max-w-7xl'
      }
    },
    beauty: {
      colors: {
        primary: '#ec4899', // Pink
        secondary: '#f472b6',
        accent: '#a855f7', // Purple accent
        background: '#fdf2f8', // Very light pink
        backgroundSecondary: '#fce7f3',
        text: '#831843', // Dark pink
        textSecondary: '#be185d',
        cardBackground: '#ffffff',
        cardBorder: '#f9a8d4',
        gradientFrom: '#ec4899',
        gradientTo: '#be185d'
      },
      fonts: {
        heading: 'Poppins, sans-serif',
        body: 'Poppins, sans-serif'
      },
      effects: {
        cardBlur: true,
        gradientBackground: true,
        animations: true,
        shadows: 'medium'
      },
      spacing: {
        sectionGap: 'mb-16',
        cardPadding: 'p-6',
        containerMaxWidth: 'max-w-6xl'
      }
    },
    technology: {
      colors: {
        primary: '#6366f1', // Indigo
        secondary: '#8b5cf6',
        accent: '#06b6d4', // Cyan accent
        background: '#0f172a', // Dark background
        backgroundSecondary: '#1e293b',
        text: '#f8fafc', // Light text
        textSecondary: '#cbd5e1',
        cardBackground: '#1e293b',
        cardBorder: '#334155',
        gradientFrom: '#6366f1',
        gradientTo: '#8b5cf6'
      },
      fonts: {
        heading: 'JetBrains Mono, monospace',
        body: 'Inter, sans-serif'
      },
      effects: {
        cardBlur: true,
        gradientBackground: true,
        animations: true,
        shadows: 'strong'
      },
      spacing: {
        sectionGap: 'mb-24',
        cardPadding: 'p-8',
        containerMaxWidth: 'max-w-7xl'
      }
    },
    finance: {
      colors: {
        primary: '#059669', // Professional green
        secondary: '#10b981',
        accent: '#1d4ed8', // Trust blue
        background: '#f0fdf4', // Very light green
        backgroundSecondary: '#ecfdf5',
        text: '#064e3b', // Dark green
        textSecondary: '#065f46',
        cardBackground: '#ffffff',
        cardBorder: '#a7f3d0',
        gradientFrom: '#059669',
        gradientTo: '#047857'
      },
      fonts: {
        heading: 'Merriweather, serif',
        body: 'system-ui, sans-serif'
      },
      effects: {
        cardBlur: false,
        gradientBackground: false,
        animations: false,
        shadows: 'soft'
      },
      spacing: {
        sectionGap: 'mb-24',
        cardPadding: 'p-10',
        containerMaxWidth: 'max-w-6xl'
      }
    },
    retail: {
      colors: {
        primary: '#dc2626', // Vibrant red
        secondary: '#ef4444',
        accent: '#f59e0b', // Orange accent
        background: '#fef2f2', // Very light red
        backgroundSecondary: '#fee2e2',
        text: '#7f1d1d', // Dark red
        textSecondary: '#991b1b',
        cardBackground: '#ffffff',
        cardBorder: '#fca5a5',
        gradientFrom: '#dc2626',
        gradientTo: '#b91c1c'
      },
      fonts: {
        heading: 'Montserrat, sans-serif',
        body: 'Open Sans, sans-serif'
      },
      effects: {
        cardBlur: true,
        gradientBackground: true,
        animations: true,
        shadows: 'medium'
      },
      spacing: {
        sectionGap: 'mb-16',
        cardPadding: 'p-6',
        containerMaxWidth: 'max-w-7xl'
      }
    },
    fitness: {
      colors: {
        primary: '#ea580c', // Energetic orange
        secondary: '#fb923c',
        accent: '#65a30d', // Green accent
        background: '#0c0a09', // Dark background
        backgroundSecondary: '#1c1917',
        text: '#fafaf9', // Light text
        textSecondary: '#d6d3d1',
        cardBackground: '#1c1917',
        cardBorder: '#44403c',
        gradientFrom: '#ea580c',
        gradientTo: '#dc2626'
      },
      fonts: {
        heading: 'Oswald, sans-serif',
        body: 'Roboto, sans-serif'
      },
      effects: {
        cardBlur: true,
        gradientBackground: true,
        animations: true,
        shadows: 'strong'
      },
      spacing: {
        sectionGap: 'mb-20',
        cardPadding: 'p-8',
        containerMaxWidth: 'max-w-7xl'
      }
    }
  };

  private defaultTheme: ThemeTemplate = {
    colors: {
      primary: '#3b82f6', // Default blue
      secondary: '#6366f1',
      accent: '#8b5cf6',
      background: '#f8fafc',
      backgroundSecondary: '#f1f5f9',
      text: '#1e293b',
      textSecondary: '#475569',
      cardBackground: '#ffffff',
      cardBorder: '#e2e8f0',
      gradientFrom: '#3b82f6',
      gradientTo: '#6366f1'
    },
    fonts: {
      heading: 'Inter, sans-serif',
      body: 'Inter, sans-serif'
    },
    effects: {
      cardBlur: true,
      gradientBackground: true,
      animations: true,
      shadows: 'medium'
    },
    spacing: {
      sectionGap: 'mb-20',
      cardPadding: 'p-8',
      containerMaxWidth: 'max-w-7xl'
    }
  };

  generateTheme(businessData: BusinessData): LandingPageTheme {
    const businessType = this.categorizeBusinessType(businessData.type);
    const template = this.industryThemes[businessType] || this.defaultTheme;
    
    return {
      id: `theme_${businessType}_${Date.now()}`,
      name: `${businessType.charAt(0).toUpperCase() + businessType.slice(1)} Theme`,
      businessType,
      layout: 'single-page',
      ...template
    };
  }

  // Enhanced method that can optionally use AI for theme generation
  async generateEnhancedTheme(businessData: BusinessData, useAI: boolean = false): Promise<LandingPageTheme> {
    if (useAI) {
      try {
        const aiSuggestions = await aiDesignService.generateDesignSuggestions({
          businessData,
          designStyle: 'modern',
          targetAudience: 'General customers'
        });
        return aiDesignService.convertToTheme(aiSuggestions, businessData);
      } catch (error) {
        console.warn('AI theme generation failed, falling back to standard theme:', error);
        return this.generateTheme(businessData);
      }
    }
    return this.generateTheme(businessData);
  }

  private categorizeBusinessType(businessType: string): string {
    const type = businessType.toLowerCase();
    
    // Restaurant & Food
    if (type.includes('restaurant') || type.includes('food') || type.includes('cafe') || 
        type.includes('bar') || type.includes('bakery') || type.includes('catering')) {
      return 'restaurant';
    }
    
    // Legal
    if (type.includes('law') || type.includes('legal') || type.includes('attorney') || 
        type.includes('lawyer') || type.includes('firm')) {
      return 'legal';
    }
    
    // Healthcare
    if (type.includes('health') || type.includes('medical') || type.includes('doctor') || 
        type.includes('clinic') || type.includes('dental') || type.includes('hospital')) {
      return 'healthcare';
    }
    
    // Beauty & Wellness
    if (type.includes('beauty') || type.includes('salon') || type.includes('spa') || 
        type.includes('wellness') || type.includes('massage') || type.includes('cosmetic')) {
      return 'beauty';
    }
    
    // Technology
    if (type.includes('tech') || type.includes('software') || type.includes('digital') || 
        type.includes('computer') || type.includes('app') || type.includes('web')) {
      return 'technology';
    }
    
    // Finance
    if (type.includes('finance') || type.includes('bank') || type.includes('investment') || 
        type.includes('accounting') || type.includes('insurance') || type.includes('credit')) {
      return 'finance';
    }
    
    // Retail
    if (type.includes('retail') || type.includes('store') || type.includes('shop') || 
        type.includes('boutique') || type.includes('market') || type.includes('commerce')) {
      return 'retail';
    }
    
    // Fitness
    if (type.includes('fitness') || type.includes('gym') || type.includes('training') || 
        type.includes('sport') || type.includes('yoga') || type.includes('personal trainer')) {
      return 'fitness';
    }
    
    return 'default';
  }

  // Get available theme categories
  getAvailableThemes(): string[] {
    return Object.keys(this.industryThemes);
  }

  // Get theme by category
  getThemeByCategory(category: string): LandingPageTheme {
    const template = this.industryThemes[category] || this.defaultTheme;
    
    return {
      id: `theme_${category}_${Date.now()}`,
      name: `${category.charAt(0).toUpperCase() + category.slice(1)} Theme`,
      businessType: category,
      layout: 'single-page',
      ...template
    };
  }
}

export const themeService = new ThemeService(); 