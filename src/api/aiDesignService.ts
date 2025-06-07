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
    structure: 'hero-focused' | 'service-grid' | 'story-driven' | 'feature-list' | 'testimonial-heavy' | 'restaurant-menu' | 'portfolio-showcase' | 'contact-first' | 'product-catalog';
    heroStyle: 'full-screen' | 'split-content' | 'minimal-text' | 'image-background' | 'video-background' | 'centered-compact';
    sectionOrder: string[];
    contentLayout: 'single-column' | 'two-column' | 'grid-3' | 'grid-4' | 'asymmetric' | 'sidebar-left' | 'sidebar-right';
    navigationStyle: 'top-bar' | 'side-menu' | 'minimal' | 'sticky-header' | 'hidden-scroll';
    ctaPlacement: 'hero-only' | 'multiple-sections' | 'floating-button' | 'footer-focus' | 'inline-content';
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
    "structure": "hero-focused|service-grid|story-driven|feature-list|testimonial-heavy|restaurant-menu|portfolio-showcase|contact-first|product-catalog",
    "heroStyle": "full-screen|split-content|minimal-text|image-background|video-background|centered-compact",
    "sectionOrder": ["Hero", "Services", "About", "Testimonials", "Contact"],
    "contentLayout": "single-column|two-column|grid-3|grid-4|asymmetric|sidebar-left|sidebar-right",
    "navigationStyle": "top-bar|side-menu|minimal|sticky-header|hidden-scroll",
    "ctaPlacement": "hero-only|multiple-sections|floating-button|footer-focus|inline-content",
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
      console.log('🔍 Parsing AI response content:', content.substring(0, 200) + '...');
      
      // Extract JSON from the response with better regex
      const jsonMatch = content.match(/\{[\s\S]*?\}(?=\s*$|\s*[^}]*$)/);
      if (!jsonMatch) {
        console.warn('⚠️ No JSON object found in AI response');
        throw new Error('No JSON found in response');
      }

      let jsonString = jsonMatch[0];
      console.log('📄 Extracted JSON string:', jsonString.substring(0, 200) + '...');

      // Clean up common JSON formatting issues from AI responses
      jsonString = this.cleanupAIJsonResponse(jsonString);

      let suggestions;
      try {
        suggestions = JSON.parse(jsonString);
        console.log('✅ Successfully parsed JSON from AI response');
      } catch (parseError) {
        console.error('❌ JSON parsing failed, attempting to fix common issues:', parseError);
        
        // Try to fix common AI JSON formatting issues
        const fixedJson = this.attemptJsonFix(jsonString);
        suggestions = JSON.parse(fixedJson);
        console.log('✅ Successfully parsed JSON after fixing formatting issues');
      }
      
      // Validate and ensure all required fields with robust fallbacks
      return this.validateAndNormalizeSuggestions(suggestions, request);
      
    } catch (error) {
      console.error('❌ Error parsing design suggestions:', error);
      console.log('🔄 Falling back to industry-based design suggestions');
      return this.getFallbackDesignSuggestions(request);
    }
  }

  private cleanupAIJsonResponse(jsonString: string): string {
    // Remove any text before the first {
    jsonString = jsonString.substring(jsonString.indexOf('{'));
    
    // Remove any text after the last }
    const lastBraceIndex = jsonString.lastIndexOf('}');
    if (lastBraceIndex !== -1) {
      jsonString = jsonString.substring(0, lastBraceIndex + 1);
    }
    
    // Remove comments and explanatory text that AI might add
    jsonString = jsonString.replace(/\/\/.*$/gm, ''); // Remove line comments
    jsonString = jsonString.replace(/\/\*[\s\S]*?\*\//g, ''); // Remove block comments
    
    return jsonString.trim();
  }

  private attemptJsonFix(jsonString: string): string {
    let fixed = jsonString;
    
    // Fix single quotes to double quotes for property names and string values
    fixed = fixed.replace(/'/g, '"');
    
    // Fix unquoted property names (word followed by colon)
    fixed = fixed.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');
    
    // Fix trailing commas
    fixed = fixed.replace(/,(\s*[}\]])/g, '$1');
    
    // Fix multiple spaces and newlines
    fixed = fixed.replace(/\s+/g, ' ');
    
    // Ensure proper array and object formatting
    fixed = fixed.replace(/,\s*}/g, '}');
    fixed = fixed.replace(/,\s*]/g, ']');
    
    return fixed;
  }

  private validateAndNormalizeSuggestions(suggestions: any, request: DesignRequest): AIDesignSuggestion {
    return {
      colorPalette: {
        primary: this.validateColor(suggestions.colorPalette?.primary) || '#3b82f6',
        secondary: this.validateColor(suggestions.colorPalette?.secondary) || '#64748b',
        accent: this.validateColor(suggestions.colorPalette?.accent) || '#f59e0b',
        background: this.validateColor(suggestions.colorPalette?.background) || '#ffffff',
        backgroundSecondary: this.validateColor(suggestions.colorPalette?.backgroundSecondary) || '#f8fafc',
        text: this.validateColor(suggestions.colorPalette?.text) || '#1e293b',
        textSecondary: this.validateColor(suggestions.colorPalette?.textSecondary) || '#64748b',
        cardBackground: this.validateColor(suggestions.colorPalette?.cardBackground) || '#ffffff',
        cardBorder: this.validateColor(suggestions.colorPalette?.cardBorder) || '#e2e8f0',
        gradientFrom: this.validateColor(suggestions.colorPalette?.gradientFrom) || '#3b82f6',
        gradientTo: this.validateColor(suggestions.colorPalette?.gradientTo) || '#1d4ed8',
        reasoning: suggestions.colorPalette?.reasoning || 'Colors chosen for professional appearance and trust-building'
      },
      typography: {
        headingFont: suggestions.typography?.headingFont || 'Inter, system-ui, sans-serif',
        bodyFont: suggestions.typography?.bodyFont || 'Inter, system-ui, sans-serif',
        accentFont: suggestions.typography?.accentFont,
        reasoning: suggestions.typography?.reasoning || 'Modern, readable fonts for digital clarity'
      },
      layout: {
        structure: (this.validateLayoutStructure(suggestions.layout?.structure) || 'hero-focused') as AIDesignSuggestion['layout']['structure'],
        heroStyle: (this.validateHeroStyle(suggestions.layout?.heroStyle) || 'full-screen') as AIDesignSuggestion['layout']['heroStyle'],
        sectionOrder: Array.isArray(suggestions.layout?.sectionOrder) ? suggestions.layout.sectionOrder : ['Hero', 'Services', 'About', 'Contact'],
        contentLayout: (this.validateContentLayout(suggestions.layout?.contentLayout) || 'single-column') as AIDesignSuggestion['layout']['contentLayout'],
        navigationStyle: (this.validateNavigationStyle(suggestions.layout?.navigationStyle) || 'top-bar') as AIDesignSuggestion['layout']['navigationStyle'],
        ctaPlacement: (this.validateCTAPlacement(suggestions.layout?.ctaPlacement) || 'hero-only') as AIDesignSuggestion['layout']['ctaPlacement'],
        visualElements: Array.isArray(suggestions.layout?.visualElements) ? suggestions.layout.visualElements : ['Hero image', 'Service cards'],
        reasoning: suggestions.layout?.reasoning || 'Layout optimized for conversion and user flow'
      },
      visualElements: {
        iconStyle: suggestions.visualElements?.iconStyle || 'minimalist',
        imageFilters: Array.isArray(suggestions.visualElements?.imageFilters) ? suggestions.visualElements.imageFilters : ['subtle warmth'],
        backgroundPatterns: Array.isArray(suggestions.visualElements?.backgroundPatterns) ? suggestions.visualElements.backgroundPatterns : [],
        animations: Array.isArray(suggestions.visualElements?.animations) ? suggestions.visualElements.animations : ['fade in'],
        reasoning: suggestions.visualElements?.reasoning || 'Clean, modern visual approach'
      },
      brandingElements: {
        logoSuggestions: Array.isArray(suggestions.brandingElements?.logoSuggestions) ? suggestions.brandingElements.logoSuggestions : ['Text-based logo'],
        taglineSuggestions: Array.isArray(suggestions.brandingElements?.taglineSuggestions) ? suggestions.brandingElements.taglineSuggestions : ['Your trusted partner'],
        visualMetaphors: Array.isArray(suggestions.brandingElements?.visualMetaphors) ? suggestions.brandingElements.visualMetaphors : [],
        reasoning: suggestions.brandingElements?.reasoning || 'Branding elements build trust and recognition'
      }
    };
  }

  private validateColor(color: any): string | null {
    if (typeof color !== 'string') return null;
    // Basic color validation - hex, rgb, hsl, or named colors
    const colorRegex = /^(#[0-9A-Fa-f]{3,8}|rgb\(|rgba\(|hsl\(|hsla\(|\w+).*$/;
    return colorRegex.test(color.trim()) ? color.trim() : null;
  }

  private validateLayoutStructure(structure: any): string | null {
    const validStructures = ['hero-focused', 'service-grid', 'story-driven', 'feature-list', 'testimonial-heavy', 'restaurant-menu', 'portfolio-showcase', 'contact-first', 'product-catalog'];
    return validStructures.includes(structure) ? structure : null;
  }

  private validateHeroStyle(style: any): string | null {
    const validStyles = ['full-screen', 'split-content', 'minimal-text', 'image-background', 'video-background', 'centered-compact'];
    return validStyles.includes(style) ? style : null;
  }

  private validateContentLayout(layout: any): string | null {
    const validLayouts = ['single-column', 'two-column', 'grid-3', 'grid-4', 'asymmetric', 'sidebar-left', 'sidebar-right'];
    return validLayouts.includes(layout) ? layout : null;
  }

  private validateNavigationStyle(style: any): string | null {
    const validStyles = ['top-bar', 'side-menu', 'minimal', 'sticky-header', 'hidden-scroll'];
    return validStyles.includes(style) ? style : null;
  }

  private validateCTAPlacement(placement: any): string | null {
    const validPlacements = ['hero-only', 'multiple-sections', 'floating-button', 'footer-focus', 'inline-content'];
    return validPlacements.includes(placement) ? placement : null;
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
        heroStyle: 'full-screen',
        sectionOrder: ['Hero', 'Services', 'About', 'Contact'],
        contentLayout: 'single-column',
        navigationStyle: 'top-bar',
        ctaPlacement: 'hero-only',
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
      layout: {
        type: 'single-page',
        structure: suggestions.layout.structure,
        heroStyle: suggestions.layout.heroStyle,
        sectionOrder: suggestions.layout.sectionOrder,
        contentLayout: suggestions.layout.contentLayout,
        navigationStyle: suggestions.layout.navigationStyle,
        ctaPlacement: suggestions.layout.ctaPlacement
      },
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