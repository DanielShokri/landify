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

    console.log('🚀 Starting comprehensive content and design generation...');

    try {
      // Generate content and AI theme in parallel for better performance
      const [contentResult, aiThemeResult] = await Promise.allSettled([
        this.generateContent(businessData, tone, style, targetAudience, industry),
        this.generateAITheme(businessData, tone, style, targetAudience)
      ]);

      let content: Omit<GeneratedContent, 'theme'>;
      let theme;

      // Handle content generation result
      if (contentResult.status === 'fulfilled') {
        content = contentResult.value;
        console.log('✅ Content generation successful');
      } else {
        console.warn('⚠️ Content generation failed, using fallback');
        content = this.getFallbackContent(businessData);
      }

      // Handle AI theme generation result
      if (aiThemeResult.status === 'fulfilled' && aiThemeResult.value) {
        theme = aiThemeResult.value;
        console.log('✅ AI theme generation successful');
      } else {
        console.warn('⚠️ AI theme generation failed, using industry-based theme');
        theme = themeService.generateTheme(businessData);
      }

      return {
        ...content,
        theme
      };
    } catch (error) {
      console.error('Error in comprehensive generation:', error);
      
      // Fallback to basic generation
      const content = this.getFallbackContent(businessData);
      const theme = themeService.generateTheme(businessData);
      
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

  private async generateAITheme(
    businessData: BusinessData,
    tone: string,
    style: string,
    targetAudience?: string
  ) {
    try {
      console.log('🎨 Auto-generating AI theme for:', businessData.name);
      
      // Create a design request based on the business data and content preferences
      const designRequest = {
        businessData,
        targetAudience,
        designStyle: this.mapStyleToDesignStyle(style),
        brandPersonality: this.inferBrandPersonality(businessData, tone),
        customRequests: `Generate a unique design that reflects the business type: ${businessData.type}`
      };

      const suggestions = await aiDesignService.generateDesignSuggestions(designRequest);
      const theme = aiDesignService.convertToTheme(suggestions, businessData);
      
      console.log('✅ AI theme auto-generated successfully');
      return theme;
    } catch (error) {
      console.warn('⚠️ AI theme auto-generation failed:', error);
      return null; // Will fallback to industry-based theme
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
    return `
Create compelling landing page content for the following business:

Business Details:
- Name: ${businessData.name}
- Type: ${businessData.type}
- Description: ${businessData.description}
- Address: ${businessData.address}
- Phone: ${businessData.phone}
- Rating: ${businessData.rating}/5 (${businessData.reviews} reviews)

Content Requirements:
- Tone: ${tone}
- Style: ${style}
- Target Audience: ${targetAudience || 'General consumers'}
- Industry: ${industry || businessData.type}

Generate the following content in JSON format:
{
  "headline": "Main headline (max 60 characters)",
  "subheadline": "Supporting subheadline (max 120 characters)",
  "valuePropositions": ["3-5 key value propositions"],
  "services": [
    {
      "name": "Service name",
      "description": "Brief description",
      "features": ["Key features"]
    }
  ],
  "callToAction": {
    "primary": {
      "text": "Primary CTA text",
      "action": "contact"
    }
  },
  "aboutSection": "About us content (2-3 sentences)",
  "contactInfo": {
    "phone": "${businessData.phone}",
    "address": "${businessData.address}"
  }
}

Ensure the content is:
1. Compelling and conversion-focused
2. SEO-friendly with relevant keywords
3. Appropriate for the specified tone and style
4. Tailored to the target audience
5. Highlighting the business's unique value proposition
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
      
      // Ensure all required fields are present with fallbacks
      return {
        headline: parsedContent.headline || `Welcome to ${businessData.name}`,
        subheadline: parsedContent.subheadline || `Your trusted ${businessData.type.toLowerCase()} in ${businessData.address.split(',')[0]}`,
        valuePropositions: parsedContent.valuePropositions || [
          'Quality service you can trust',
          'Experienced professionals',
          'Customer satisfaction guaranteed'
        ],
        services: parsedContent.services || [{
          name: 'Our Services',
          description: businessData.description || 'Professional services tailored to your needs',
          features: ['High quality', 'Reliable', 'Affordable']
        }],
        callToAction: parsedContent.callToAction || {
          primary: {
            text: 'Contact Us Today',
            action: 'contact'
          }
        },
        aboutSection: parsedContent.aboutSection || `${businessData.name} is a trusted ${businessData.type.toLowerCase()} serving the local community with excellence and dedication.`,
        contactInfo: {
          phone: businessData.phone,
          address: businessData.address,
          email: businessData.email,
          website: businessData.website
        }
      };
    } catch (error) {
      console.error('Error parsing generated content:', error);
      
      // Return fallback content if parsing fails
      return this.getFallbackContentWithoutTheme(businessData);
    }
  }

  private getFallbackContent(businessData: BusinessData): GeneratedContent {
    const theme = themeService.generateTheme(businessData);
    
    return {
      headline: `Welcome to ${businessData.name}`,
      subheadline: `Your trusted ${businessData.type.toLowerCase()} in ${businessData.address.split(',')[0]}`,
      valuePropositions: [
        'Quality service you can trust',
        'Experienced professionals',
        'Customer satisfaction guaranteed'
      ],
      services: [{
        name: 'Our Services',
        description: businessData.description || 'Professional services tailored to your needs',
        features: ['High quality', 'Reliable', 'Affordable']
      }],
      callToAction: {
        primary: {
          text: 'Contact Us Today',
          action: 'contact'
        }
      },
      aboutSection: `${businessData.name} is a trusted ${businessData.type.toLowerCase()} serving the local community with excellence and dedication.`,
      contactInfo: {
        phone: businessData.phone,
        address: businessData.address,
        email: businessData.email,
        website: businessData.website
      },
      theme
    };
  }

  private getFallbackContentWithoutTheme(businessData: BusinessData): Omit<GeneratedContent, 'theme'> {
    return {
      headline: `Welcome to ${businessData.name}`,
      subheadline: `Your trusted ${businessData.type.toLowerCase()} in ${businessData.address.split(',')[0]}`,
      valuePropositions: [
        'Quality service you can trust',
        'Experienced professionals',
        'Customer satisfaction guaranteed'
      ],
      services: [{
        name: 'Our Services',
        description: businessData.description || 'Professional services tailored to your needs',
        features: ['High quality', 'Reliable', 'Affordable']
      }],
      callToAction: {
        primary: {
          text: 'Contact Us Today',
          action: 'contact'
        }
      },
      aboutSection: `${businessData.name} is a trusted ${businessData.type.toLowerCase()} serving the local community with excellence and dedication.`,
      contactInfo: {
        phone: businessData.phone,
        address: businessData.address,
        email: businessData.email,
        website: businessData.website
      }
    };
  }
}

export const openaiService = new OpenAIService(); 