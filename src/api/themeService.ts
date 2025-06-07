import { LandingPageTheme } from '@/types/content';
import { BusinessData } from '@/types/business';
import { aiDesignService } from './aiDesignService';

interface ThemeGenerationOptions {
  style?: 'modern' | 'classic' | 'minimalist' | 'bold' | 'artistic' | 'corporate';
  tone?: 'professional' | 'friendly' | 'casual' | 'luxury';
  targetAudience?: string;
  useAdvancedAI?: boolean;
}

class ThemeService {
  /**
   * Generate a unique AI-powered theme for any business
   * This is the main method that should be used for all theme generation
   */
  async generateTheme(
    businessData: BusinessData, 
    options: ThemeGenerationOptions = {}
  ): Promise<LandingPageTheme> {
    const {
      style = 'modern',
      tone = 'professional',
      targetAudience,
      useAdvancedAI = true
    } = options;

    try {
      console.log('🎨 Generating unique AI theme for:', businessData.name);
      
      if (useAdvancedAI) {
        // Use advanced AI generation with detailed business analysis
        return await this.generateAdvancedAITheme(businessData, style, tone, targetAudience);
      } else {
        // Use simplified AI generation for fallback
        return await this.generateSimplifiedAITheme(businessData, style, tone);
      }
    } catch (error) {
      console.warn('⚠️ AI theme generation failed, using emergency fallback:', error);
      // Only as absolute last resort, generate a minimal unique theme
      return this.generateEmergencyFallbackTheme(businessData);
    }
  }

  /**
   * Advanced AI theme generation with comprehensive business analysis
   */
  private async generateAdvancedAITheme(
    businessData: BusinessData,
    style: string,
    tone: string,
    targetAudience?: string
  ): Promise<LandingPageTheme> {
    const designRequest = {
      businessData,
      targetAudience: targetAudience || this.inferTargetAudience(businessData),
      designStyle: style as any,
      brandPersonality: this.inferBrandPersonality(businessData, tone),
      customRequests: this.generateCustomRequests(businessData, style, tone)
    };

    const suggestions = await aiDesignService.generateDesignSuggestions(designRequest);
    const theme = aiDesignService.convertToTheme(suggestions, businessData);
    
    console.log('✅ Advanced AI theme generated successfully');
    return theme;
  }

  /**
   * Simplified AI theme generation for fallback scenarios
   */
  private async generateSimplifiedAITheme(
    businessData: BusinessData,
    style: string,
    tone: string
  ): Promise<LandingPageTheme> {
    // Create a simplified design request
    const designRequest = {
      businessData,
      designStyle: style as any,
      brandPersonality: [tone, 'unique', 'memorable'],
      customRequests: `Generate a completely unique theme for ${businessData.type} business. Focus on ${style} design with ${tone} personality.`
    };

    const suggestions = await aiDesignService.generateDesignSuggestions(designRequest);
    const theme = aiDesignService.convertToTheme(suggestions, businessData);
    
    console.log('✅ Simplified AI theme generated successfully');
    return theme;
  }

  /**
   * Emergency fallback that generates a minimal but unique theme
   * Only used when AI generation completely fails
   */
  private generateEmergencyFallbackTheme(businessData: BusinessData): LandingPageTheme {
    // Generate unique colors based on business name and type
    const uniqueId = this.generateUniqueId(businessData.name, businessData.type);
    const colors = this.generateUniqueColors(uniqueId);
    
    return {
      id: `emergency_theme_${uniqueId}`,
      name: `Unique Theme for ${businessData.name}`,
      businessType: businessData.type,
      layout: {
        type: 'single-page',
        structure: this.selectUniqueStructure(uniqueId, businessData.type),
        heroStyle: this.selectUniqueHeroStyle(uniqueId),
        sectionOrder: this.generateUniqueSectionOrder(uniqueId, businessData.type),
        contentLayout: this.selectUniqueContentLayout(uniqueId),
        navigationStyle: 'top-bar',
        ctaPlacement: this.selectUniqueCTAPlacement(uniqueId)
      },
      colors,
      fonts: {
        heading: this.selectUniqueFont(uniqueId, 'heading'),
        body: this.selectUniqueFont(uniqueId, 'body')
      },
      effects: {
        cardBlur: uniqueId % 2 === 0,
        gradientBackground: true,
        animations: uniqueId % 3 === 0,
        shadows: this.selectUniqueShadow(uniqueId)
      },
      spacing: {
        sectionGap: uniqueId % 2 === 0 ? '5rem' : '4rem',
        cardPadding: uniqueId % 3 === 0 ? '2rem' : '1.5rem',
        containerMaxWidth: uniqueId % 2 === 0 ? '1400px' : '1200px'
      }
    };
  }

  /**
   * Generate a batch of unique themes for comparison/selection
   */
  async generateThemeVariations(
    businessData: BusinessData,
    count: number = 3
  ): Promise<LandingPageTheme[]> {
    const styles = ['modern', 'classic', 'minimalist', 'bold', 'artistic'];
    const tones = ['professional', 'friendly', 'casual', 'luxury'];
    
    const promises = Array.from({ length: count }, (_, index) => {
      const style = styles[index % styles.length];
      const tone = tones[index % tones.length];
      
      return this.generateTheme(businessData, {
        style: style as any,
        tone: tone as any,
        useAdvancedAI: true
      });
    });

    try {
      const themes = await Promise.all(promises);
      console.log(`✅ Generated ${themes.length} unique theme variations`);
      return themes;
    } catch (error) {
      console.error('❌ Failed to generate theme variations:', error);
      // Generate at least one theme
      return [await this.generateTheme(businessData, { useAdvancedAI: false })];
    }
  }

  // Helper methods for theme generation

  private inferTargetAudience(businessData: BusinessData): string {
    const type = businessData.type.toLowerCase();
    
    if (type.includes('restaurant') || type.includes('food')) {
      return 'Food lovers, families, and dining enthusiasts';
    } else if (type.includes('health') || type.includes('medical')) {
      return 'Patients seeking quality healthcare and medical services';
    } else if (type.includes('tech') || type.includes('software')) {
      return 'Tech-savvy professionals and businesses seeking digital solutions';
    } else if (type.includes('beauty') || type.includes('spa')) {
      return 'Individuals focused on wellness, beauty, and self-care';
    } else if (type.includes('legal') || type.includes('law')) {
      return 'Individuals and businesses needing professional legal services';
    } else if (type.includes('fitness') || type.includes('gym')) {
      return 'Health-conscious individuals pursuing fitness goals';
    } else {
      return 'Local community members and potential customers';
    }
  }

  private inferBrandPersonality(businessData: BusinessData, tone: string): string[] {
    const personalities: string[] = [tone];
    const type = businessData.type.toLowerCase();
    
    // Add unique personality traits based on business type
    if (type.includes('restaurant')) {
      personalities.push('welcoming', 'appetizing', 'social', 'memorable');
    } else if (type.includes('health')) {
      personalities.push('caring', 'trustworthy', 'healing', 'compassionate');
    } else if (type.includes('tech')) {
      personalities.push('innovative', 'cutting-edge', 'reliable', 'forward-thinking');
    } else if (type.includes('creative')) {
      personalities.push('artistic', 'inspiring', 'original', 'visionary');
    } else if (type.includes('legal')) {
      personalities.push('authoritative', 'reliable', 'experienced', 'trustworthy');
    } else {
      personalities.push('unique', 'distinctive', 'memorable', 'authentic');
    }
    
    // Add location-based personality if available
    if (businessData.address) {
      const location = businessData.address.toLowerCase();
      if (location.includes('downtown') || location.includes('city')) {
        personalities.push('urban', 'sophisticated');
      } else if (location.includes('suburb')) {
        personalities.push('community-focused', 'family-friendly');
      }
    }
    
    return personalities;
  }

  private generateCustomRequests(
    businessData: BusinessData,
    style: string,
    tone: string
  ): string {
    return `Create a completely unique and memorable theme for ${businessData.name}, a ${businessData.type} business. 
    The design should be ${style} with a ${tone} personality. 
    Make this theme distinctive and unlike any standard template. 
    Consider the business location: ${businessData.address}. 
    Focus on creating something that stands out in the ${businessData.type} industry.
    Ensure the color scheme and typography choice is fresh and contemporary.`;
  }

  // Emergency fallback helper methods

  private generateUniqueId(name: string, type: string): number {
    // Create a unique number based on business name and type
    const combined = `${name}_${type}`.toLowerCase();
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  private generateUniqueColors(uniqueId: number): LandingPageTheme['colors'] {
    // Generate unique colors based on the unique ID
    const hue1 = (uniqueId * 137.508) % 360; // Golden angle for good distribution
    const hue2 = (hue1 + 60 + (uniqueId % 60)) % 360;
    const hue3 = (hue2 + 60 + (uniqueId % 60)) % 360;
    
    const saturation = 70 + (uniqueId % 30);
    const lightness = 45 + (uniqueId % 20);
    
    return {
      primary: `hsl(${hue1}, ${saturation}%, ${lightness}%)`,
      secondary: `hsl(${hue2}, ${saturation - 10}%, ${lightness + 10}%)`,
      accent: `hsl(${hue3}, ${saturation + 10}%, ${lightness - 5}%)`,
      background: uniqueId % 2 === 0 ? '#ffffff' : '#fafafa',
      backgroundSecondary: uniqueId % 2 === 0 ? '#f8fafc' : '#f1f5f9',
      text: uniqueId % 3 === 0 ? '#1e293b' : '#0f172a',
      textSecondary: '#64748b',
      cardBackground: '#ffffff',
      cardBorder: `hsl(${hue1}, 20%, 90%)`,
      gradientFrom: `hsl(${hue1}, ${saturation}%, ${lightness}%)`,
      gradientTo: `hsl(${hue2}, ${saturation}%, ${lightness - 10}%)`
    };
  }

  private selectUniqueFont(uniqueId: number, type: 'heading' | 'body'): string {
    const headingFonts = [
      'Inter, sans-serif',
      'Poppins, sans-serif',
      'Montserrat, sans-serif',
      'Playfair Display, serif',
      'Merriweather, serif',
      'Oswald, sans-serif',
      'Lato, sans-serif',
      'Source Sans Pro, sans-serif'
    ];
    
    const bodyFonts = [
      'Inter, sans-serif',
      'Open Sans, sans-serif',
      'Roboto, sans-serif',
      'Lato, sans-serif',
      'Source Sans Pro, sans-serif',
      'Nunito, sans-serif',
      'PT Sans, sans-serif',
      'Rubik, sans-serif'
    ];
    
    const fonts = type === 'heading' ? headingFonts : bodyFonts;
    return fonts[uniqueId % fonts.length];
  }

  private selectUniqueShadow(uniqueId: number): 'soft' | 'medium' | 'strong' | 'none' {
    const shadows: ('soft' | 'medium' | 'strong' | 'none')[] = ['soft', 'medium', 'strong', 'none'];
    return shadows[uniqueId % shadows.length];
  }

  private selectUniqueStructure(uniqueId: number, businessType: string): 'hero-focused' | 'service-grid' | 'story-driven' | 'feature-list' | 'testimonial-heavy' | 'restaurant-menu' | 'portfolio-showcase' | 'contact-first' | 'product-catalog' {
    const type = businessType.toLowerCase();
    
    // Business-specific structures
    if (type.includes('restaurant') || type.includes('food')) {
      const restaurantStructures: ('restaurant-menu' | 'story-driven' | 'testimonial-heavy')[] = ['restaurant-menu', 'story-driven', 'testimonial-heavy'];
      return restaurantStructures[uniqueId % restaurantStructures.length];
    } else if (type.includes('portfolio') || type.includes('creative') || type.includes('design')) {
      const creativeStructures: ('portfolio-showcase' | 'feature-list' | 'hero-focused')[] = ['portfolio-showcase', 'feature-list', 'hero-focused'];
      return creativeStructures[uniqueId % creativeStructures.length];
    } else if (type.includes('service') || type.includes('consulting')) {
      const serviceStructures: ('service-grid' | 'testimonial-heavy' | 'contact-first')[] = ['service-grid', 'testimonial-heavy', 'contact-first'];
      return serviceStructures[uniqueId % serviceStructures.length];
    } else {
      const allStructures: ('hero-focused' | 'service-grid' | 'story-driven' | 'feature-list' | 'testimonial-heavy')[] = ['hero-focused', 'service-grid', 'story-driven', 'feature-list', 'testimonial-heavy'];
      return allStructures[uniqueId % allStructures.length];
    }
  }

  private selectUniqueHeroStyle(uniqueId: number): 'full-screen' | 'split-content' | 'minimal-text' | 'image-background' | 'video-background' | 'centered-compact' {
    const heroStyles: ('full-screen' | 'split-content' | 'minimal-text' | 'image-background' | 'centered-compact')[] = ['full-screen', 'split-content', 'minimal-text', 'image-background', 'centered-compact'];
    return heroStyles[uniqueId % heroStyles.length];
  }

  private generateUniqueSectionOrder(uniqueId: number, businessType: string): string[] {
    const type = businessType.toLowerCase();
    const baseSections = ['Hero'];
    
    // Business-specific section ordering
    if (type.includes('restaurant') || type.includes('food')) {
      const restaurantSections = ['Menu', 'About', 'Location', 'Contact'];
      return [
        ...baseSections,
        ...this.shuffleArray(restaurantSections, uniqueId)
      ];
    } else if (type.includes('service') || type.includes('consulting')) {
      const serviceSections = ['Services', 'About', 'Testimonials', 'Contact'];
      return [
        ...baseSections,
        ...this.shuffleArray(serviceSections, uniqueId)
      ];
    } else {
      const defaultSections = ['Services', 'About', 'Contact'];
      return [
        ...baseSections,
        ...this.shuffleArray(defaultSections, uniqueId)
      ];
    }
  }

  private selectUniqueContentLayout(uniqueId: number): 'single-column' | 'two-column' | 'grid-3' | 'grid-4' | 'asymmetric' | 'sidebar-left' | 'sidebar-right' {
    const layouts: ('single-column' | 'two-column' | 'grid-3' | 'grid-4' | 'asymmetric')[] = ['single-column', 'two-column', 'grid-3', 'grid-4', 'asymmetric'];
    return layouts[uniqueId % layouts.length];
  }

  private selectUniqueCTAPlacement(uniqueId: number): 'hero-only' | 'multiple-sections' | 'floating-button' | 'footer-focus' | 'inline-content' {
    const placements: ('hero-only' | 'multiple-sections' | 'floating-button' | 'footer-focus')[] = ['hero-only', 'multiple-sections', 'floating-button', 'footer-focus'];
    return placements[uniqueId % placements.length];
  }

  private shuffleArray(array: string[], seed: number): string[] {
    const shuffled = [...array];
    let currentIndex = shuffled.length;
    let randomIndex;

    // Use seed for deterministic shuffling
    const seededRandom = (s: number) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };

    while (currentIndex !== 0) {
      randomIndex = Math.floor(seededRandom(seed + currentIndex) * currentIndex);
      currentIndex--;
      [shuffled[currentIndex], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[currentIndex]];
    }

    return shuffled;
  }

  /**
   * Legacy method for backwards compatibility
   * Now redirects to AI generation
   */
  generateThemeByCategory(category: string, businessData: BusinessData): Promise<LandingPageTheme> {
    console.log(`🔄 Legacy category "${category}" redirected to AI generation`);
    return this.generateTheme(businessData, {
      style: this.mapCategoryToStyle(category),
      tone: this.mapCategoryToTone(category)
    });
  }

  private mapCategoryToStyle(category: string): 'modern' | 'classic' | 'minimalist' | 'bold' | 'artistic' | 'corporate' {
    const styleMap: Record<string, any> = {
      'restaurant': 'artistic',
      'legal': 'corporate',
      'healthcare': 'modern',
      'beauty': 'minimalist',
      'technology': 'bold',
      'finance': 'corporate',
      'retail': 'modern',
      'fitness': 'bold'
    };
    
    return styleMap[category] || 'modern';
  }

  private mapCategoryToTone(category: string): 'professional' | 'friendly' | 'casual' | 'luxury' {
    const toneMap: Record<string, any> = {
      'restaurant': 'friendly',
      'legal': 'professional',
      'healthcare': 'professional',
      'beauty': 'luxury',
      'technology': 'professional',
      'finance': 'professional',
      'retail': 'friendly',
      'fitness': 'casual'
    };
    
    return toneMap[category] || 'professional';
  }

  /**
   * Get available AI generation options
   */
  getAvailableOptions() {
    return {
      styles: ['modern', 'classic', 'minimalist', 'bold', 'artistic', 'corporate'],
      tones: ['professional', 'friendly', 'casual', 'luxury'],
      features: [
        'Completely AI-generated themes',
        'Unique designs for every business',
        'Industry-specific optimization',
        'Dynamic color generation',
        'Smart typography selection',
        'Personalized brand personality'
      ]
    };
  }
}

export const themeService = new ThemeService(); 