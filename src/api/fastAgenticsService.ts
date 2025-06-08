import type { ProgressEvent } from '@/types/agents';
import type { ContentGenerationRequest, GeneratedContent } from '@/types/content';
import OpenAI from 'openai';
import { Observable } from 'rxjs';
import { proxyService, shouldUseProxy } from './proxyService';

/**
 * Fast Multi-Agent Content Generation Service
 * 
 * Optimized for speed with:
 * - Parallel agent execution
 * - Streamlined prompts
 * - Single-pass generation
 * - Template-based HTML
 * - Secure API proxy in production
 */
class FastAgenticsService {
  private openai: OpenAI;
  private useProxy: boolean;

  constructor() {
    this.useProxy = shouldUseProxy();
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
      dangerouslyAllowBrowser: true
    });
  }

  /**
   * Generate landing page content using fast parallel approach
   */
  async generateLandingPageWithAgents(request: ContentGenerationRequest): Promise<GeneratedContent> {
    const businessData = request.businessData;

    // Run analysis and content generation in parallel
    const [analysis, contentData] = await Promise.all([
      this.fastBusinessAnalysis(businessData),
      this.fastContentGeneration(businessData)
    ]);

    // Generate HTML based on the content
    const htmlDocument = await this.fastHTMLGeneration(businessData, analysis, contentData);

    return {
      htmlDocument,
      layout: this.generateDefaultLayout(),
      headline: contentData.headline,
      subheadline: contentData.subheadline,
      valuePropositions: contentData.valuePropositions,
      services: contentData.services,
      callToAction: contentData.callToAction,
      aboutSection: contentData.aboutSection,
      contactInfo: {
        phone: businessData.phone || '',
        address: businessData.address || '',
        email: businessData.email || '',
        website: businessData.website || ''
      },
      theme: this.generateDefaultTheme(businessData),
      trustSignals: contentData.trustSignals || ['Licensed & Insured', 'Local Experts', '100% Satisfaction Guarantee'],
      locationHighlights: [`Serving ${this.extractCity(businessData.address)}`, 'Fast Response Time', 'Local Knowledge'],
      businessHours: businessData.hours || 'Monday-Friday: 9AM-5PM'
    };
  }

  /**
   * Generate with real-time progress updates
   */
  generateWithProgress(request: ContentGenerationRequest): Observable<ProgressEvent | { type: 'result'; data: GeneratedContent }> {
    return new Observable<ProgressEvent | { type: 'result'; data: GeneratedContent }>((observer) => {
      const runSequence = async () => {
        try {
          observer.next({
            stage: 'starting',
            progress: 0,
            message: '🚀 Fast AI Generation Starting...'
          });

          observer.next({
            stage: 'parallel_analysis',
            progress: 20,
            message: '⚡ Running parallel analysis and content generation...'
          });

          const businessData = request.businessData;

          // Run parallel generation
          const [analysis, contentData] = await Promise.all([
            this.fastBusinessAnalysis(businessData),
            this.fastContentGeneration(businessData)
          ]);

          observer.next({
            stage: 'html_generation',
            progress: 70,
            message: '🎨 Generating optimized HTML...'
          });

          const htmlDocument = await this.fastHTMLGeneration(businessData, analysis, contentData);

          observer.next({
            stage: 'finalizing',
            progress: 90,
            message: '✨ Finalizing landing page...'
          });

          const result: GeneratedContent = {
            htmlDocument,
            layout: this.generateDefaultLayout(),
            headline: contentData.headline,
            subheadline: contentData.subheadline,
            valuePropositions: contentData.valuePropositions,
            services: contentData.services,
            callToAction: contentData.callToAction,
            aboutSection: contentData.aboutSection,
            contactInfo: {
              phone: businessData.phone || '',
              address: businessData.address || '',
              email: businessData.email || '',
              website: businessData.website || ''
            },
            theme: this.generateDefaultTheme(businessData),
            trustSignals: contentData.trustSignals || ['Licensed & Insured', 'Local Experts', '100% Satisfaction Guarantee'],
            locationHighlights: [`Serving ${this.extractCity(businessData.address)}`, 'Fast Response Time', 'Local Knowledge'],
            businessHours: businessData.hours || 'Monday-Friday: 9AM-5PM'
          };

          observer.next({
            stage: 'completed',
            progress: 100,
            message: '🎉 Fast generation complete!'
          });

          observer.next({
            type: 'result',
            data: result
          });

          observer.complete();
        } catch (error) {
          observer.next({
            stage: 'error',
            progress: 0,
            message: `❌ Error: ${(error as Error).message}`
          });
          observer.error(error);
        }
      };

      runSequence();
    });
  }

  /**
   * Fast business analysis using streamlined prompts
   */
  private async fastBusinessAnalysis(businessData: any): Promise<any> {
    if (this.useProxy) {
      const response = await proxyService.generateContent({
        businessData,
        analysisType: 'business_analysis'
      });
      return this.parseJSONResponse(response.choices[0]?.message?.content || '{}');
    }

    const prompt = `Business: ${businessData.name} (${businessData.type})
Location: ${businessData.address}
Description: ${businessData.description || 'N/A'}

Analyze the target market and competitive edge. Return JSON:
{
  "targetMarket": "primary customer type",
  "competitiveEdge": "main advantage",
  "emotionalTriggers": "key emotional appeal"
}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a business analyst. Return only JSON in English.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    return this.parseJSONResponse(response.choices[0]?.message?.content || '{}');
  }

  /**
   * Fast content generation using streamlined prompts
   */
  private async fastContentGeneration(businessData: any): Promise<any> {
    if (this.useProxy) {
      const response = await proxyService.generateContent({
        businessData,
        analysisType: 'content_generation'
      });
      return this.parseJSONResponse(response.choices[0]?.message?.content || '{}');
    }

    const prompt = `Business: ${businessData.name} (${businessData.type})
Location: ${businessData.address}
Description: ${businessData.description || 'N/A'}

Create compelling content. Return JSON:
{
  "headline": "catchy main headline",
  "subheadline": "supporting description",
  "valuePropositions": ["benefit 1", "benefit 2", "benefit 3"],
  "services": [{"name": "service name", "description": "brief description", "features": ["feature 1", "feature 2"]}],
  "callToAction": {"primary": {"text": "action text", "action": "contact"}, "secondary": {"text": "secondary text", "action": "info"}},
  "aboutSection": "brief about paragraph",
  "trustSignals": ["signal 1", "signal 2", "signal 3"]
}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a content strategist. Return only JSON in English.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 800
    });

    return this.parseJSONResponse(response.choices[0]?.message?.content || '{}');
  }

  /**
   * Fast HTML generation using template-based approach
   */
  private async fastHTMLGeneration(businessData: any, analysis: any, content: any): Promise<string> {
    if (this.useProxy) {
      const response = await proxyService.generateContent({
        businessData,
        analysisType: 'html_generation',
        headline: content.headline
      });
      const html = response.choices[0]?.message?.content || '';
      
      // Ensure we have valid HTML
      if (!html.toLowerCase().includes('<html')) {
        return this.generateFallbackHTML(businessData, content);
      }
      
      return html;
    }

    const prompt = `Create a professional landing page HTML for ${businessData.name}.

Business: ${businessData.name} (${businessData.type})
Location: ${businessData.address}
Headline: ${content.headline}
Services: ${content.services?.map((s: any) => s.name).join(', ')}

Requirements:
- Use TailwindCSS CDN
- Include hero, services, about, contact sections
- Mobile responsive
- Professional design
- Include contact info: ${businessData.phone || 'N/A'}, ${businessData.address || 'N/A'}

Return only the complete HTML document.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a web designer. Return only HTML in English.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.9,
      max_tokens: 1500
    });

    const html = response.choices[0]?.message?.content || '';
    
    // Ensure we have valid HTML
    if (!html.toLowerCase().includes('<html')) {
      return this.generateFallbackHTML(businessData, content);
    }

    return html;
  }

  /**
   * Generate fallback HTML template
   */
  private generateFallbackHTML(businessData: any, content: any): string {
    const city = this.extractCity(businessData.address);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${businessData.name} - ${businessData.type} in ${city}</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white">
    <!-- Hero Section -->
    <header class="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div class="container mx-auto px-4 text-center">
            <h1 class="text-5xl font-bold mb-4">${content.headline || businessData.name}</h1>
            <p class="text-xl mb-8">${content.subheadline || `Professional ${businessData.type} services in ${city}`}</p>
            <button class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                ${content.callToAction?.primary?.text || 'Contact Us'}
            </button>
        </div>
    </header>

    <!-- Services Section -->
    <section class="py-16 bg-gray-50">
        <div class="container mx-auto px-4">
            <h2 class="text-3xl font-bold text-center mb-12">Our Services</h2>
            <div class="grid md:grid-cols-3 gap-8">
                ${content.services?.map((service: any) => `
                <div class="bg-white p-6 rounded-lg shadow-md">
                    <h3 class="text-xl font-semibold mb-3">${service.name}</h3>
                    <p class="text-gray-600">${service.description}</p>
                </div>
                `).join('') || `
                <div class="bg-white p-6 rounded-lg shadow-md">
                    <h3 class="text-xl font-semibold mb-3">Quality Service</h3>
                    <p class="text-gray-600">Professional ${businessData.type} services</p>
                </div>
                `}
            </div>
        </div>
    </section>

    <!-- About Section -->
    <section class="py-16">
        <div class="container mx-auto px-4">
            <div class="max-w-3xl mx-auto text-center">
                <h2 class="text-3xl font-bold mb-8">About ${businessData.name}</h2>
                <p class="text-lg text-gray-600">${content.aboutSection || `${businessData.name} is a trusted ${businessData.type} serving ${city} and surrounding areas. We provide professional, reliable service with a commitment to customer satisfaction.`}</p>
            </div>
        </div>
    </section>

    <!-- Contact Section -->
    <section class="py-16 bg-gray-50">
        <div class="container mx-auto px-4 text-center">
            <h2 class="text-3xl font-bold mb-8">Contact Us</h2>
            <div class="max-w-md mx-auto">
                ${businessData.phone ? `<p class="mb-4"><strong>Phone:</strong> ${businessData.phone}</p>` : ''}
                ${businessData.address ? `<p class="mb-4"><strong>Address:</strong> ${businessData.address}</p>` : ''}
                ${businessData.email ? `<p class="mb-4"><strong>Email:</strong> ${businessData.email}</p>` : ''}
                <button class="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                    Get In Touch
                </button>
            </div>
        </div>
    </section>
</body>
</html>`;
  }

  /**
   * Generate default theme
   */
  private generateDefaultTheme(businessData: any): any {
    const businessType = businessData.type?.toLowerCase() || 'business';
    
    // Business type specific colors
    const colorSchemes: Record<string, any> = {
      restaurant: { primary: '#dc2626', secondary: '#fbbf24' },
      cafe: { primary: '#92400e', secondary: '#f59e0b' },
      retail: { primary: '#7c3aed', secondary: '#a855f7' },
      healthcare: { primary: '#059669', secondary: '#34d399' },
      automotive: { primary: '#1f2937', secondary: '#6b7280' },
      default: { primary: '#2563eb', secondary: '#3b82f6' }
    };

    const colors = colorSchemes[businessType] || colorSchemes.default;

    return {
      id: `theme-${businessType}`,
      name: `${businessType.charAt(0).toUpperCase() + businessType.slice(1)} Theme`,
      businessType,
      colors: {
        primary: colors.primary,
        secondary: colors.secondary,
        accent: '#f59e0b',
        background: '#ffffff',
        backgroundSecondary: '#f8fafc',
        text: '#1f2937',
        textSecondary: '#6b7280',
        cardBackground: '#ffffff',
        cardBorder: '#e5e7eb',
        gradientFrom: colors.primary,
        gradientTo: colors.secondary
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter'
      },
      layout: {
        type: 'modern',
        structure: 'centered',
        heroStyle: 'gradient',
        sectionOrder: ['hero', 'services', 'about', 'contact'],
        contentLayout: 'grid',
        navigationStyle: 'top',
        ctaPlacement: 'hero-and-sections'
      },
      spacing: {
        sectionGap: 'space-y-16',
        cardPadding: 'p-6',
        containerMaxWidth: 'max-w-6xl'
      },
      effects: {
        cardBlur: false,
        gradientBackground: true,
        animations: true,
        shadows: 'shadow-md'
      }
    };
  }

  /**
   * Generate default layout
   */
  private generateDefaultLayout(): any {
    return {
      type: 'hero-centric',
      pageFlow: 'vertical-scroll',
      sections: [
        { id: 'hero', order: 1, variant: 'gradient-hero' },
        { id: 'services', order: 2, variant: 'grid-cards' },
        { id: 'about', order: 3, variant: 'centered-text' },
        { id: 'contact', order: 4, variant: 'contact-form' }
      ],
      globalStyle: {
        containerWidth: 'max-w-6xl',
        sectionSpacing: 'space-y-16',
        borderRadius: 'rounded-lg',
        shadowIntensity: 'shadow-md',
        animationStyle: 'moderate'
      },
      responsiveBreakpoints: {
        mobile: 'block',
        tablet: 'md:block',
        desktop: 'lg:block'
      }
    };
  }

  /**
   * Parse JSON response with fallback
   */
  private parseJSONResponse(content: string): any {
    try {
      const match = content.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('No JSON found');
      return JSON.parse(match[0]);
    } catch {
      return {};
    }
  }

  /**
   * Extract city from address
   */
  private extractCity(address: string): string {
    if (!address) return 'your area';
    const parts = address.split(',');
    return parts.length > 1 ? parts[parts.length - 2].trim() : 'your area';
  }

  /**
   * Get agent capabilities
   */
  getAgentCapabilities() {
    return {
      agents: [
        {
          id: 'fast_analyzer',
          name: 'Fast Analysis Agent',
          description: 'Rapid business analysis with parallel processing'
        },
        {
          id: 'fast_content',
          name: 'Fast Content Agent',
          description: 'Streamlined content generation'
        },
        {
          id: 'fast_html',
          name: 'Fast HTML Generator',
          description: 'Template-based HTML generation'
        }
      ],
      features: [
        'Parallel processing',
        'Streamlined prompts',
        'Template-based generation',
        '3x faster than standard agents'
      ],
      limitations: [
        'Requires OpenAI API key',
        'Less detailed analysis than full agents'
      ]
    };
  }
}

// Export singleton instance
export const fastAgenticsService = new FastAgenticsService(); 