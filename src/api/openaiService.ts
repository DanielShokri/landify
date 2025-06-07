import OpenAI from 'openai';
import { BusinessData } from '../types/business';
import { GeneratedContent, ContentGenerationRequest } from '../types/content';
import { themeService } from './themeService';
import { aiDesignService } from './aiDesignService';

class OpenAIService {
  private client: OpenAI;

  constructor() {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    if (!apiKey) {
      console.warn('OpenAI API key not found. Set VITE_OPENAI_API_KEY environment variable.');
    }
    
    this.client = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true // Note: In production, use a backend proxy
    });
  }

  async generateLandingPageContent(request: ContentGenerationRequest): Promise<GeneratedContent> {
    const { businessData, tone = 'professional', style = 'modern', targetAudience, industry } = request;

    try {
      // Generate content and AI theme in parallel for better performance
      const [contentResult, aiThemeResult] = await Promise.allSettled([
        this.generateContent(businessData, tone, style, targetAudience, industry),
        this.generateUniqueAITheme(businessData, tone, style, targetAudience)
      ]);

      let content: Omit<GeneratedContent, 'theme'>;
      let theme;

      // Handle content generation result
      if (contentResult.status === 'fulfilled') {
        content = contentResult.value;
      } else {
        content = this.getFallbackContent(businessData);
      }

      // Handle AI theme generation result
      if (aiThemeResult.status === 'fulfilled' && aiThemeResult.value) {
        theme = aiThemeResult.value;
      } else {
        // Use emergency theme generation as fallback
        theme = await this.generateEmergencyTheme(businessData, tone, style);
      }

      return {
        ...content,
        theme
      };
    } catch (error) {
      console.error('Error in comprehensive generation:', error);
      
      // Fallback to basic generation with emergency theme
      const content = this.getFallbackContent(businessData);
      const theme = await this.generateEmergencyTheme(businessData, tone, style);
      
      return {
        ...content,
        theme
      };
    }
  }

  private async generateContent(
    businessData: BusinessData,
    tone: string,
    style: string,
    targetAudience?: string,
    industry?: string
  ): Promise<Omit<GeneratedContent, 'theme'>> {
    const prompt = this.buildContentPrompt(businessData, tone, style, targetAudience, industry);

    const completion = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional copywriter specializing in creating compelling landing page content for businesses. Generate content that is engaging, SEO-friendly, and conversion-focused.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2500
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content generated from OpenAI');
    }

    return this.parseGeneratedContent(content, businessData);
  }

  private async generateUniqueAITheme(
    businessData: BusinessData,
    tone: string,
    style: string,
    targetAudience?: string
  ) {
    try {
      // Use the new AI-driven theme service
      const theme = await themeService.generateTheme(businessData, {
        style: this.mapStyleToDesignStyle(style),
        tone: tone as any,
        targetAudience,
        useAdvancedAI: true
      });
      
      return theme;
    } catch (error) {
      return null; // Will fallback to emergency theme
    }
  }

  private async generateEmergencyTheme(
    businessData: BusinessData,
    tone: string,
    style: string
  ) {
    try {
      // Try simplified AI generation first
      const theme = await themeService.generateTheme(businessData, {
        style: this.mapStyleToDesignStyle(style),
        tone: tone as any,
        useAdvancedAI: false // Use simplified AI
      });
      
      return theme;
    } catch (error) {
      
      // Create a minimal but unique theme manually
      return {
        id: `emergency_${Date.now()}`,
        name: `Emergency Theme for ${businessData.name}`,
        businessType: businessData.type,
        layout: {
          type: 'single-page' as const,
          structure: 'hero-focused' as const,
          heroStyle: 'full-screen' as const,
          sectionOrder: ['Hero', 'Services', 'About', 'Contact'],
          contentLayout: 'single-column' as const,
          navigationStyle: 'top-bar' as const,
          ctaPlacement: 'hero-only' as const
        },
        colors: {
          primary: '#3b82f6',
          secondary: '#6366f1',
          accent: '#8b5cf6',
          background: '#ffffff',
          backgroundSecondary: '#f8fafc',
          text: '#1e293b',
          textSecondary: '#64748b',
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
          shadows: 'medium' as const
        },
        spacing: {
          sectionGap: '4rem',
          cardPadding: '1.5rem',
          containerMaxWidth: '1200px'
        }
      };
    }
  }

  private mapStyleToDesignStyle(style: string): 'modern' | 'classic' | 'minimalist' | 'bold' | 'artistic' | 'corporate' {
    const styleMap: Record<string, any> = {
      'modern': 'modern',
      'classic': 'classic', 
      'minimalist': 'minimalist',
      'bold': 'bold',
      'luxury': 'artistic',
      'professional': 'corporate'
    };
    
    return styleMap[style] || 'modern';
  }

  private inferBrandPersonality(businessData: BusinessData, tone: string): string[] {
    const personalities: string[] = [];
    
    // Add personality traits based on tone
    switch (tone) {
      case 'professional':
        personalities.push('trustworthy', 'reliable', 'expert');
        break;
      case 'friendly':
        personalities.push('approachable', 'warm', 'helpful');
        break;
      case 'casual':
        personalities.push('relaxed', 'authentic', 'down-to-earth');
        break;
      case 'luxury':
        personalities.push('sophisticated', 'premium', 'exclusive');
        break;
    }
    
    // Add personalities based on business type
    const businessType = businessData.type.toLowerCase();
    if (businessType.includes('restaurant') || businessType.includes('food')) {
      personalities.push('welcoming', 'appetizing', 'social');
    } else if (businessType.includes('health') || businessType.includes('medical')) {
      personalities.push('caring', 'professional', 'healing');
    } else if (businessType.includes('tech') || businessType.includes('software')) {
      personalities.push('innovative', 'cutting-edge', 'smart');
    } else if (businessType.includes('creative') || businessType.includes('design')) {
      personalities.push('creative', 'artistic', 'inspiring');
    }
    
    return personalities.length > 0 ? personalities : ['professional', 'trustworthy'];
  }

  private buildContentPrompt(
    businessData: BusinessData,
    tone: string,
    style: string,
    targetAudience?: string,
    industry?: string
  ): string {
    // Build comprehensive business hours text
    const hoursText = businessData.hours ? Object.entries(businessData.hours)
      .filter(([_, hours]) => hours)
      .map(([day, hours]) => `${day.charAt(0).toUpperCase() + day.slice(1)}: ${hours}`)
      .join(', ') : 'Hours available upon request';

    // Build amenities list
    const amenitiesText = businessData.amenities && businessData.amenities.length > 0 
      ? businessData.amenities.join(', ') 
      : 'Standard amenities available';

    // Build social media text
    const socialMediaText = businessData.socialMedia ? 
      Object.entries(businessData.socialMedia)
        .filter(([_, link]) => link)
        .map(([platform, _]) => platform)
        .join(', ') : 'Contact us for more information';

    return `
Create compelling, detailed landing page content for the following business using ALL available information:

COMPREHENSIVE BUSINESS PROFILE:
- Name: ${businessData.name}
- Type: ${businessData.type}
- Description: ${businessData.description}
- Address: ${businessData.address}
- Phone: ${businessData.phone}
- Email: ${businessData.email || 'Not provided'}
- Website: ${businessData.website || 'Not provided'}
- Rating: ${businessData.rating || 'New business'}/5 (${businessData.reviews || 0} customer reviews)
- Business Hours: ${hoursText}
- Amenities/Features: ${amenitiesText}
- Social Media Presence: ${socialMediaText}
- Coordinates: ${businessData.coordinates ? `${businessData.coordinates.lat}, ${businessData.coordinates.lng}` : 'Location services available'}
- Photo Gallery: ${businessData.photos?.length || 0} business photos available

CONTENT GENERATION REQUIREMENTS:
- Tone: ${tone}
- Style: ${style}
- Target Audience: ${targetAudience || 'Local community and potential customers'}
- Industry: ${industry || businessData.type}

Generate comprehensive, detailed content in JSON format that LEVERAGES ALL the business data above:

{
  "headline": "Compelling main headline (max 60 characters) that highlights unique value",
  "subheadline": "Detailed supporting subheadline (max 150 characters) incorporating location and specialties",
  "valuePropositions": [
    "4-6 specific value propositions based on rating, reviews, hours, amenities, and business type",
    "Include review-based proposition if rating is 4+ stars",
    "Include convenience proposition if hours are extensive",
    "Include location-based proposition using address details"
  ],
  "services": [
    {
      "name": "Primary service/offering name",
      "description": "Detailed description incorporating business type and amenities",
      "features": ["Specific features based on business data", "Hours-related benefit", "Location advantage"],
      "price": "Call for pricing or mention value proposition"
    },
    {
      "name": "Secondary service (if applicable)",
      "description": "Another service offering based on business type",
      "features": ["More specific features", "Quality indicators", "Customer benefits"]
    }
  ],
  "callToAction": {
    "primary": {
      "text": "Ultra-concise CTA (1-2 words max: Call, Book, Order, Visit, Get Quote)",
      "action": "contact"
    },
    "secondary": {
      "text": "Short secondary CTA (1-2 words: Info, Hours, Reviews, More)",
      "action": "info"
    }
  },
  "aboutSection": "Rich about section (3-4 sentences) incorporating location, experience (inferred from reviews), specialties, and commitment to service quality",
  "contactInfo": {
    "phone": "${businessData.phone}",
    "address": "${businessData.address}",
    "email": "${businessData.email || ''}",
    "website": "${businessData.website || ''}",
    "hours": {
      ${businessData.hours ? Object.entries(businessData.hours)
        .filter(([_, hours]) => hours)
        .map(([day, hours]) => `"${day}": "${hours}"`)
        .join(',\n      ') : '"general": "Contact for hours"'}
    }
  },
  "trustSignals": {
    "rating": ${businessData.rating || 0},
    "reviewCount": ${businessData.reviews || 0},
    "established": "Serving ${businessData.address.split(',')[0]} area",
    "specialties": ["Based on business type and amenities"],
    "guarantees": ["Quality service promise", "Customer satisfaction"]
  },
  "locationHighlights": {
    "neighborhood": "Extract from ${businessData.address}",
    "accessibility": "Based on location and amenities",
    "parking": "Inferred from business type",
    "nearbyLandmarks": "Local area context"
  },
  "businessHours": {
    "schedule": "Extract from business hours data",
    "specialHours": "Holiday or special event hours",
    "availability": "Best times to visit or contact"
  }
}

CRITICAL REQUIREMENTS:
1. Use the ${businessData.rating || 0}/5 star rating prominently if ≥4.0 stars
2. Highlight the ${businessData.reviews || 0} customer reviews as social proof
3. Incorporate specific business hours for convenience messaging
4. Reference location advantages from ${businessData.address}
5. Use amenities/features data to create compelling value propositions
6. Create trust signals from review count and rating
7. Make content feel personal and locally-focused
8. Ensure all content is accurate to the business type: ${businessData.type}
9. Include specific calls-to-action based on business hours and contact methods
10. Generate content that converts visitors into customers using social proof

Focus on creating a comprehensive, trustworthy landing page that uses every piece of available business data to build credibility and drive conversions.
`;
  }

  private parseGeneratedContent(content: string, businessData: BusinessData): Omit<GeneratedContent, 'theme'> {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsedContent = JSON.parse(jsonMatch[0]);
      
      // Ensure all required fields are present with comprehensive fallbacks
      return {
        headline: parsedContent.headline || `Welcome to ${businessData.name}`,
        subheadline: parsedContent.subheadline || `Your trusted ${businessData.type.toLowerCase()} in ${businessData.address.split(',')[0]}`,
        valuePropositions: parsedContent.valuePropositions || [
          'Quality service you can trust',
          'Experienced professionals',
          'Customer satisfaction guaranteed',
          ...(businessData.rating && businessData.rating >= 4.0 ? [`${businessData.rating}/5 star rating from ${businessData.reviews} customers`] : []),
          ...(businessData.amenities && businessData.amenities.length > 0 ? [businessData.amenities[0]] : [])
        ],
        services: parsedContent.services || [{
          name: 'Our Services',
          description: businessData.description || 'Professional services tailored to your needs',
          features: [
            'High quality service',
            'Professional expertise', 
            'Customer-focused approach',
            ...(businessData.amenities?.slice(0, 2) || [])
          ]
        }],
        callToAction: parsedContent.callToAction || {
          primary: {
            text: businessData.phone ? 'Call' : 'Contact',
            action: 'contact'
          },
          secondary: {
            text: businessData.rating ? 'Reviews' : 'Info',
            action: 'info'
          }
        },
        aboutSection: parsedContent.aboutSection || `${businessData.name} is a trusted ${businessData.type.toLowerCase()} serving the ${businessData.address.split(',')[0]} area${businessData.rating ? ` with a ${businessData.rating}/5 star rating` : ''}${businessData.reviews ? ` from ${businessData.reviews} satisfied customers` : ''}. We're committed to providing exceptional service and exceeding customer expectations.`,
        contactInfo: {
          phone: businessData.phone,
          address: businessData.address,
          email: businessData.email,
          website: businessData.website,
          hours: parsedContent.contactInfo?.hours || (businessData.hours ? businessData.hours as { [key: string]: string } : undefined)
        },
        // Parse new rich content fields
        trustSignals: parsedContent.trustSignals || {
          rating: businessData.rating || 0,
          reviewCount: businessData.reviews || 0,
          established: `Serving ${businessData.address.split(',')[0]} area`,
          specialties: businessData.amenities?.slice(0, 3) || ['Quality Service', 'Professional Excellence'],
          guarantees: ['Customer Satisfaction', 'Quality Guarantee']
        },
        locationHighlights: parsedContent.locationHighlights || {
          neighborhood: businessData.address.split(',')[0] || 'Local area',
          accessibility: 'Convenient location with easy access',
          parking: businessData.type.toLowerCase().includes('restaurant') || businessData.type.toLowerCase().includes('retail') ? 'Parking available' : 'Contact for parking information',
          nearbyLandmarks: `Located in ${businessData.address.split(',')[0]}`
        },
        businessHours: parsedContent.businessHours || {
          schedule: businessData.hours ? Object.entries(businessData.hours)
            .filter(([_, hours]) => hours)
            .map(([day, hours]) => `${day.charAt(0).toUpperCase() + day.slice(1)}: ${hours}`)
            .join(' | ') : 'Contact us for hours',
          specialHours: 'Holiday hours may vary',
          availability: businessData.phone ? 'Call for immediate assistance' : 'Contact us for availability'
        }
      };
    } catch (error) {
      console.error('Error parsing generated content:', error);
      
      // Return enhanced fallback content if parsing fails
      return this.getEnhancedFallbackContent(businessData);
    }
  }

  private getEnhancedFallbackContent(businessData: BusinessData): Omit<GeneratedContent, 'theme'> {
    return {
      headline: `Welcome to ${businessData.name}`,
      subheadline: `Your trusted ${businessData.type.toLowerCase()} in ${businessData.address.split(',')[0]}${businessData.rating ? ` • ${businessData.rating}/5 Stars` : ''}`,
      valuePropositions: [
        'Quality service you can trust',
        'Experienced professionals',
        'Customer satisfaction guaranteed',
        ...(businessData.rating && businessData.rating >= 4.0 ? [`${businessData.rating}/5 star rating from satisfied customers`] : []),
        ...(businessData.amenities?.slice(0, 2) || [])
      ],
      services: [{
        name: 'Our Services',
        description: businessData.description || 'Professional services tailored to your needs',
        features: [
          'High quality service',
          'Professional expertise',
          'Customer-focused approach',
          ...(businessData.amenities?.slice(0, 2) || [])
        ]
      }],
      callToAction: {
        primary: {
          text: businessData.phone ? 'Call' : 'Contact',
          action: 'contact'
        },
        secondary: {
          text: businessData.rating ? 'Reviews' : 'Info',
          action: 'info'
        }
      },
      aboutSection: `${businessData.name} is a trusted ${businessData.type.toLowerCase()} serving the ${businessData.address.split(',')[0]} area${businessData.rating ? ` with a ${businessData.rating}/5 star rating` : ''}${businessData.reviews ? ` from ${businessData.reviews} satisfied customers` : ''}. We're committed to providing exceptional service and exceeding customer expectations.`,
      contactInfo: {
        phone: businessData.phone,
        address: businessData.address,
        email: businessData.email,
        website: businessData.website,
                 hours: businessData.hours as { [key: string]: string } | undefined
      },
      trustSignals: {
        rating: businessData.rating || 0,
        reviewCount: businessData.reviews || 0,
        established: `Serving ${businessData.address.split(',')[0]} area`,
        specialties: businessData.amenities?.slice(0, 3) || ['Quality Service', 'Professional Excellence'],
        guarantees: ['Customer Satisfaction', 'Quality Guarantee']
      },
      locationHighlights: {
        neighborhood: businessData.address.split(',')[0] || 'Local area',
        accessibility: 'Convenient location with easy access',
        parking: businessData.type.toLowerCase().includes('restaurant') || businessData.type.toLowerCase().includes('retail') ? 'Parking available' : 'Contact for parking information',
        nearbyLandmarks: `Located in ${businessData.address.split(',')[0]}`
      },
      businessHours: {
        schedule: businessData.hours ? Object.entries(businessData.hours)
          .filter(([_, hours]) => hours)
          .map(([day, hours]) => `${day.charAt(0).toUpperCase() + day.slice(1)}: ${hours}`)
          .join(' | ') : 'Contact us for hours',
        specialHours: 'Holiday hours may vary',
        availability: businessData.phone ? 'Call for immediate assistance' : 'Contact us for availability'
      }
    };
  }

  private getFallbackContent(businessData: BusinessData): Omit<GeneratedContent, 'theme'> {
    return this.getEnhancedFallbackContent(businessData);
  }
}

export const openaiService = new OpenAIService(); 