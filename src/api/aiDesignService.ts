import OpenAI from 'openai';
import { BusinessData } from '@/types/business';
import { LandingPageTheme } from '@/types/content';

export interface DesignRequest {
  businessData: BusinessData;
  targetAudience?: string;
  industry?: string;
  designStyle?: 'modern' | 'classic' | 'minimalist' | 'bold' | 'artistic' | 'corporate';
  colorPreferences?: string[];
  brandPersonality?: string[];
  customRequests?: string;
}

export interface AIDesignSuggestion {
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    backgroundSecondary: string;
    text: string;
    textSecondary: string;
    cardBackground: string;
    cardBorder: string;
    gradientFrom: string;
    gradientTo: string;
    reasoning: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    accentFont?: string;
    reasoning: string;
  };
  layout: {
    structure: 'hero-focused' | 'service-grid' | 'story-driven' | 'feature-list' | 'testimonial-heavy';
    sections: string[];
    visualElements: string[];
    reasoning: string;
  };
  visualElements: {
    iconStyle: string;
    imageFilters: string[];
    backgroundPatterns: string[];
    animations: string[];
    reasoning: string;
  };
  brandingElements: {
    logoSuggestions: string[];
    taglineSuggestions: string[];
    visualMetaphors: string[];
    reasoning: string;
  };
}

class AIDesignService {
  private client: OpenAI | null = null;
  private isInitialized = false;

  constructor() {
    this.initializeClient();
  }

  private initializeClient() {
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
      
      if (!apiKey) {
        console.error('OpenAI API key not found in environment variables');
        return;
      }

      if (!apiKey.startsWith('sk-')) {
        console.error('Invalid OpenAI API key format');
        return;
      }

      this.client = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true // Note: In production, use a backend proxy
      });

      this.isInitialized = true;
      console.log('✅ OpenAI client initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize OpenAI client:', error);
    }
  }

  async generateDesignSuggestions(request: DesignRequest): Promise<AIDesignSuggestion> {
    console.log('🎨 Starting AI design generation for:', request.businessData.name);
    
    if (!this.isInitialized || !this.client) {
      console.error('❌ OpenAI client not initialized');
      throw new Error('AI Design service not available. Please check your API configuration.');
    }

    const prompt = this.buildDesignPrompt(request);
    console.log('📝 Generated prompt for AI design suggestions');

    try {
      console.log('🚀 Making API call to OpenAI...');
      
      const completion = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert UI/UX designer and brand strategist. You create custom design recommendations based on business characteristics, industry trends, and psychological color theory. Generate comprehensive design suggestions that are both aesthetically pleasing and conversion-optimized.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 3000
      });

      console.log('✅ Received response from OpenAI');

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No design suggestions generated from OpenAI');
      }

      console.log('🔄 Parsing AI design suggestions...');
      const suggestions = this.parseDesignSuggestions(content, request);
      console.log('✅ Successfully generated AI design suggestions');
      
      return suggestions;
    } catch (error: any) {
      console.error('❌ Error generating design suggestions:', error);
      
      // Provide more specific error messages
      if (error.message?.includes('API key')) {
        throw new Error('Invalid API key. Please check your OpenAI configuration.');
      } else if (error.message?.includes('quota')) {
        throw new Error('API quota exceeded. Please check your OpenAI account.');
      } else if (error.message?.includes('network') || error.code === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        console.warn('⚠️ AI generation failed, falling back to industry-based suggestions');
        return this.getFallbackDesignSuggestions(request);
      }
    }
  }

  private buildDesignPrompt(request: DesignRequest): string {
    const { businessData, targetAudience, designStyle, colorPreferences, brandPersonality, customRequests } = request;

    return `
Create custom design recommendations for this business:

BUSINESS PROFILE:
- Name: ${businessData.name}
- Type: ${businessData.type}
- Description: ${businessData.description}
- Location: ${businessData.address}
- Target Audience: ${targetAudience || 'General consumers'}
- Preferred Style: ${designStyle || 'modern'}
- Color Preferences: ${colorPreferences?.join(', ') || 'Open to suggestions'}
- Brand Personality: ${brandPersonality?.join(', ') || 'Professional, trustworthy'}
- Special Requests: ${customRequests || 'None'}

Generate design recommendations in this JSON format:
{
  "colorPalette": {
    "primary": "#hexcode",
    "secondary": "#hexcode", 
    "accent": "#hexcode",
    "background": "#hexcode",
    "backgroundSecondary": "#hexcode",
    "text": "#hexcode",
    "textSecondary": "#hexcode",
    "cardBackground": "#hexcode",
    "cardBorder": "#hexcode",
    "gradientFrom": "#hexcode",
    "gradientTo": "#hexcode",
    "reasoning": "Explain color psychology and why these colors work for this business"
  },
  "typography": {
    "headingFont": "Font name with fallbacks",
    "bodyFont": "Font name with fallbacks",
    "accentFont": "Optional decorative font",
    "reasoning": "Why these fonts convey the right brand message"
  },
  "layout": {
    "structure": "hero-focused|service-grid|story-driven|feature-list|testimonial-heavy",
    "sections": ["Hero", "Services", "About", "Testimonials", "Contact"],
    "visualElements": ["Large hero image", "Service icons", "Customer photos"],
    "reasoning": "Why this layout works for this business type"
  },
  "visualElements": {
    "iconStyle": "minimalist|detailed|geometric|organic",
    "imageFilters": ["warm tone", "high contrast"],
    "backgroundPatterns": ["subtle grid", "geometric shapes"],
    "animations": ["fade in", "slide up", "hover effects"],
    "reasoning": "How these elements enhance user experience"
  },
  "brandingElements": {
    "logoSuggestions": ["Text-based with icon", "Minimalist symbol"],
    "taglineSuggestions": ["2-3 compelling taglines"],
    "visualMetaphors": ["Growth arrows", "Shield for trust"],
    "reasoning": "Brand elements that reinforce business values"
  }
}

Consider:
- Industry standards and competitor analysis
- Color psychology and emotional impact
- Accessibility (WCAG guidelines)
- Mobile responsiveness
- Conversion optimization
- Cultural sensitivity for location
- Current design trends while maintaining timeless appeal
`;
  }

  private parseDesignSuggestions(content: string, request: DesignRequest): AIDesignSuggestion {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const suggestions = JSON.parse(jsonMatch[0]);
      
      // Validate and ensure all required fields
      return {
        colorPalette: {
          primary: suggestions.colorPalette?.primary || '#3b82f6',
          secondary: suggestions.colorPalette?.secondary || '#64748b',
          accent: suggestions.colorPalette?.accent || '#f59e0b',
          background: suggestions.colorPalette?.background || '#ffffff',
          backgroundSecondary: suggestions.colorPalette?.backgroundSecondary || '#f8fafc',
          text: suggestions.colorPalette?.text || '#1e293b',
          textSecondary: suggestions.colorPalette?.textSecondary || '#64748b',
          cardBackground: suggestions.colorPalette?.cardBackground || '#ffffff',
          cardBorder: suggestions.colorPalette?.cardBorder || '#e2e8f0',
          gradientFrom: suggestions.colorPalette?.gradientFrom || '#3b82f6',
          gradientTo: suggestions.colorPalette?.gradientTo || '#1d4ed8',
          reasoning: suggestions.colorPalette?.reasoning || 'Colors chosen for professional appearance and trust-building'
        },
        typography: {
          headingFont: suggestions.typography?.headingFont || 'Inter, system-ui, sans-serif',
          bodyFont: suggestions.typography?.bodyFont || 'Inter, system-ui, sans-serif',
          accentFont: suggestions.typography?.accentFont,
          reasoning: suggestions.typography?.reasoning || 'Modern, readable fonts for digital clarity'
        },
        layout: {
          structure: suggestions.layout?.structure || 'hero-focused',
          sections: suggestions.layout?.sections || ['Hero', 'Services', 'About', 'Contact'],
          visualElements: suggestions.layout?.visualElements || ['Hero image', 'Service cards'],
          reasoning: suggestions.layout?.reasoning || 'Layout optimized for conversion and user flow'
        },
        visualElements: {
          iconStyle: suggestions.visualElements?.iconStyle || 'minimalist',
          imageFilters: suggestions.visualElements?.imageFilters || ['subtle warmth'],
          backgroundPatterns: suggestions.visualElements?.backgroundPatterns || [],
          animations: suggestions.visualElements?.animations || ['fade in'],
          reasoning: suggestions.visualElements?.reasoning || 'Clean, modern visual approach'
        },
        brandingElements: {
          logoSuggestions: suggestions.brandingElements?.logoSuggestions || ['Text-based logo'],
          taglineSuggestions: suggestions.brandingElements?.taglineSuggestions || ['Your trusted partner'],
          visualMetaphors: suggestions.brandingElements?.visualMetaphors || [],
          reasoning: suggestions.brandingElements?.reasoning || 'Branding elements build trust and recognition'
        }
      };
    } catch (error) {
      console.error('Error parsing design suggestions:', error);
      return this.getFallbackDesignSuggestions(request);
    }
  }

  private getFallbackDesignSuggestions(request: DesignRequest): AIDesignSuggestion {
    // Industry-based fallback suggestions
    const industryColors = this.getIndustryColors(request.businessData.type);
    
    return {
      colorPalette: {
        ...industryColors,
        reasoning: 'Fallback color scheme based on industry standards'
      },
      typography: {
        headingFont: 'Inter, system-ui, sans-serif',
        bodyFont: 'Inter, system-ui, sans-serif',
        reasoning: 'Reliable, professional typography'
      },
      layout: {
        structure: 'hero-focused',
        sections: ['Hero', 'Services', 'About', 'Contact'],
        visualElements: ['Hero banner', 'Service grid', 'Contact form'],
        reasoning: 'Standard layout proven for conversion'
      },
      visualElements: {
        iconStyle: 'minimalist',
        imageFilters: ['professional tone'],
        backgroundPatterns: [],
        animations: ['fade in'],
        reasoning: 'Clean, professional visual approach'
      },
      brandingElements: {
        logoSuggestions: ['Text-based with icon'],
        taglineSuggestions: [`Professional ${request.businessData.type.toLowerCase()} services`],
        visualMetaphors: ['Quality badge'],
        reasoning: 'Standard branding elements for professional service businesses'
      }
    };
  }

  private getIndustryColors(businessType: string): Omit<AIDesignSuggestion['colorPalette'], 'reasoning'> {
    const type = businessType.toLowerCase();
    
    if (type.includes('restaurant') || type.includes('food')) {
      return {
        primary: '#d97706',
        secondary: '#f59e0b',
        accent: '#dc2626',
        background: '#fef7ed',
        backgroundSecondary: '#fff7ed',
        text: '#1f2937',
        textSecondary: '#6b7280',
        cardBackground: '#ffffff',
        cardBorder: '#fed7aa',
        gradientFrom: '#f59e0b',
        gradientTo: '#d97706'
      };
    }
    
    if (type.includes('health') || type.includes('medical')) {
      return {
        primary: '#0891b2',
        secondary: '#06b6d4',
        accent: '#0284c7',
        background: '#f0f9ff',
        backgroundSecondary: '#e0f2fe',
        text: '#0f172a',
        textSecondary: '#64748b',
        cardBackground: '#ffffff',
        cardBorder: '#bae6fd',
        gradientFrom: '#0891b2',
        gradientTo: '#0284c7'
      };
    }
    
    // Default professional colors
    return {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#f59e0b',
      background: '#ffffff',
      backgroundSecondary: '#f8fafc',
      text: '#1e293b',
      textSecondary: '#64748b',
      cardBackground: '#ffffff',
      cardBorder: '#e2e8f0',
      gradientFrom: '#3b82f6',
      gradientTo: '#1d4ed8'
    };
  }

  // Convert AI suggestions to theme format
  convertToTheme(suggestions: AIDesignSuggestion, businessData: BusinessData): LandingPageTheme {
    return {
      id: `ai_theme_${Date.now()}`,
      name: `AI-Generated Theme for ${businessData.name}`,
      businessType: businessData.type,
      colors: suggestions.colorPalette,
      fonts: {
        heading: suggestions.typography.headingFont,
        body: suggestions.typography.bodyFont
      },
      layout: 'single-page',
      spacing: {
        sectionGap: '4rem',
        cardPadding: '1.5rem',
        containerMaxWidth: '1200px'
      },
      effects: {
        cardBlur: true,
        gradientBackground: true,
        animations: suggestions.visualElements.animations.includes('fade in'),
        shadows: suggestions.visualElements.iconStyle === 'minimalist' ? 'soft' : 'medium'
      }
    };
  }
}

export const aiDesignService = new AIDesignService(); 