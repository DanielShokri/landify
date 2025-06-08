import { AgentContext, AgentType, BaseEvent } from '@/types/agents';
import { GeneratedContent } from '@/types/content';
import { openai } from '@/utils/openaiClient';
import { Observable } from 'rxjs';
import { BaseAgent } from './BaseAgent';

export class SynthesisAgent extends BaseAgent {
  private context: AgentContext;

  constructor(context: AgentContext) {
    super({
      agentId: AgentType.SYNTHESIS_AGENT,
      description: 'Synthesizes all agent outputs into final content structure'
    });
    this.context = context;
  }

  run(input: { threadId?: string; runId?: string }): Observable<BaseEvent> {
    return new Observable<BaseEvent>((observer) => {
      observer.next(this.emitRunStarted(input.threadId, input.runId));
      observer.next(this.emitStepStarted('final_synthesis'));

      this.synthesizeFinalContent()
        .then((finalContent) => {
          const messages = this.emitTextMessage(
            `✨ Final Synthesis Complete\n\nContent Generated for ${this.context.businessData.name}\nReady for HTML Generation`
          );
          messages.forEach(msg => observer.next(msg));

          observer.next(this.emitStateDelta('/finalContent', finalContent));
          observer.next(this.emitStepFinished('final_synthesis'));
          observer.next(this.emitRunFinished(input.threadId, input.runId));
          observer.complete();
        })
        .catch((error) => {
          observer.next(this.emitError((error as Error).message));
          observer.error(error);
        });
    });
  }

  private async synthesizeFinalContent(): Promise<GeneratedContent> {
    const businessAnalysis = this.context.agentOutputs.businessAnalysis?.output || {};
    const contentStrategy = this.context.agentOutputs.contentStrategy?.output || {};
    const businessData = this.context.businessData;

    // Build a detailed, creative prompt for HTML generation
    const htmlPrompt = `
You are a creative web designer AI. Generate a fully unique, business-specific landing page HTML for the following business. 
- Use TailwindCSS via CDN for styling.
- Do NOT use any boilerplate or generic templates; every page must be visually and structurally unique.
- Use semantic HTML5, creative layouts, and vibrant color schemes inspired by the business type.
- Include a hero section, at least 4 distinct sections (e.g., services, about, testimonials, contact), and interactive calls to action.
- Use the provided business data, content strategy, and business analysis for inspiration.
- Output ONLY the full HTML document as a single string, nothing else.

Business Data: ${JSON.stringify(businessData, null, 2)}
Content Strategy: ${JSON.stringify(contentStrategy, null, 2)}
Business Analysis: ${JSON.stringify(businessAnalysis, null, 2)}
`;

    // Call OpenAI to generate HTML
    const htmlResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a creative web designer AI.' },
        { role: 'user', content: htmlPrompt }
      ],
      temperature: 0.95,
      max_tokens: 2000
    });

    const html = htmlResponse.choices[0]?.message?.content?.trim() || '';
    if (!this.isValidHtml(html)) {
      throw new Error('AI did not return valid HTML.');
    }

    // Ask the AI to generate both theme and layout in a single call
    const themeAndLayoutPrompt = `
You are a creative web designer AI. Based on the following business data, content strategy, and business analysis, generate:
1. A unique, business-appropriate theme object (as 'theme') matching this TypeScript interface:

interface LandingPageTheme {
  id: string;
  name: string;
  businessType: string;
  colors: {
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
  };
  fonts: {
    heading: string;
    body: string;
  };
  layout: {
    type: string;
    structure: string;
    heroStyle: string;
    sectionOrder: string[];
    contentLayout: string;
    navigationStyle: string;
    ctaPlacement: string;
  };
  spacing: {
    sectionGap: string;
    cardPadding: string;
    containerMaxWidth: string;
  };
  effects: {
    cardBlur: boolean;
    gradientBackground: boolean;
    animations: boolean;
    shadows: string;
  };
}

2. A unique, business-appropriate layout object (as 'layout') matching this TypeScript interface:

interface AILayoutInstructions {
  type: 'hero-centric' | 'service-focused' | 'story-driven' | 'contact-first' | 'visual-portfolio' | 'minimal-modern' | 'full-immersive';
  pageFlow: 'vertical-scroll' | 'sectioned-blocks' | 'card-based' | 'magazine-style';
  sections: AILayoutSection[];
  globalStyle: {
    containerWidth: 'max-w-7xl' | 'max-w-6xl' | 'max-w-5xl' | 'max-w-4xl' | 'full-width';
    sectionSpacing: 'space-y-8' | 'space-y-12' | 'space-y-16' | 'space-y-20';
    borderRadius: 'rounded-none' | 'rounded-lg' | 'rounded-xl' | 'rounded-2xl';
    shadowIntensity: 'shadow-none' | 'shadow-md' | 'shadow-lg' | 'shadow-xl';
    animationStyle: 'none' | 'subtle' | 'moderate' | 'dynamic';
  };
  responsiveBreakpoints: {
    mobile: 'block' | 'hidden';
    tablet: 'md:block' | 'md:hidden';
    desktop: 'lg:block' | 'lg:hidden';
  };
}

interface AILayoutSection {
  id: 'hero' | 'services' | 'about' | 'contact' | 'trust' | 'menu' | 'portfolio' | 'features' | 'hours' | string;
  order: number;
  variant: string;
  [key: string]: any;
}

Output a single JSON object with this structure:
{
  "theme": { ... },
  "layout": { ... }
}

Do not include any explanation, just the JSON.

Business Data: ${JSON.stringify(businessData, null, 2)}
Content Strategy: ${JSON.stringify(contentStrategy, null, 2)}
Business Analysis: ${JSON.stringify(businessAnalysis, null, 2)}
`;

    const themeAndLayoutResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a creative web designer AI.' },
        { role: 'user', content: themeAndLayoutPrompt }
      ],
      temperature: 0.85,
      max_tokens: 1800
    });

    const themeAndLayoutJson = themeAndLayoutResponse.choices[0]?.message?.content || '';
    const { theme, layout } = this.parseThemeAndLayoutJson(themeAndLayoutJson);

    // Extract structured content from the strategy
    const extractedContent = this.extractStructuredContent(contentStrategy);

    // Create the final GeneratedContent object
    return {
      htmlDocument: html,
      layout,
      headline: extractedContent.headline,
      subheadline: extractedContent.subheadline,
      valuePropositions: extractedContent.valuePropositions,
      services: extractedContent.services,
      callToAction: extractedContent.callToAction,
      aboutSection: extractedContent.aboutSection,
      contactInfo: {
        phone: businessData.phone || '',
        address: businessData.address || '',
        email: businessData.email || '',
        website: businessData.website || ''
      },
      theme,
      trustSignals: extractedContent.trustSignals,
      locationHighlights: extractedContent.locationHighlights,
      businessHours: extractedContent.businessHours
    };
  }

  private parseThemeAndLayoutJson(content: string): { theme: any; layout: any } {
    try {
      const match = content.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('No JSON');
      const parsed = JSON.parse(match[0]);
      if (!parsed.theme || !parsed.layout) throw new Error('Missing theme or layout in JSON');
      return { theme: parsed.theme, layout: parsed.layout };
    } catch {
      throw new Error('Failed to parse theme+layout JSON from AI.');
    }
  }

  private isValidHtml(html?: string): boolean {
    if (!html) return false;
    const lower = html.toLowerCase();
    return lower.includes('<html') && lower.includes('<body') && lower.includes('</html>');
  }

  private extractStructuredContent(contentStrategy: any): any {
    return {
      headline: contentStrategy?.headline || this.context.businessData.name || 'Welcome',
      subheadline: contentStrategy?.subheadline || `Professional ${(this.context.businessData.type || 'business').toLowerCase()} services`,
      valuePropositions: contentStrategy?.valuePropositions || ['Quality Service', 'Professional Excellence', 'Customer Satisfaction'],
      services: contentStrategy?.services || [{
        name: 'Our Services',
        description: `Professional ${(this.context.businessData.type || 'business').toLowerCase()} services`,
        features: ['High Quality', 'Expert Team', 'Customer Satisfaction']
      }],
      callToAction: contentStrategy?.callToAction || {
        primary: { text: 'Contact Us', action: 'contact' },
        secondary: { text: 'Learn More', action: 'info' }
      },
      aboutSection: contentStrategy?.aboutSection || `${this.context.businessData.name || 'Our business'} provides exceptional service and professional expertise.`,
      trustSignals: contentStrategy?.trustSignals,
      locationHighlights: contentStrategy?.locationHighlights,
      businessHours: contentStrategy?.businessHours
    };
  }
}
