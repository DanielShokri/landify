import { BusinessData } from '@/types/business';
import { ContentGenerationRequest, GeneratedContent } from '@/types/content';
import OpenAI from 'openai';
import { Observable } from 'rxjs';

// Multi-Agent Context Management
interface AgentContext {
  businessData: BusinessData;
  userRequirements: ContentGenerationRequest;
  agentOutputs: Record<string, any>;
  iterationCount: number;
  maxIterations: number;
  confidence: number;
}

interface AgentResponse {
  success: boolean;
  output: any;
  confidence: number;
  feedback?: string;
  requiresIteration?: boolean;
  reasoning?: string;
}

// Specialized Agent Types
enum AgentType {
  BUSINESS_ANALYST = 'business_analyst',
  CONTENT_STRATEGIST = 'content_strategist', 
  DESIGN_INTELLIGENCE = 'design_intelligence',
  QUALITY_ASSURANCE = 'quality_assurance',
  SYNTHESIS_AGENT = 'synthesis_agent'
}

// Event Types for AG-UI protocol
enum EventType {
  RUN_STARTED = 'RUN_STARTED',
  RUN_FINISHED = 'RUN_FINISHED',
  RUN_ERROR = 'RUN_ERROR',
  STEP_STARTED = 'STEP_STARTED',
  STEP_FINISHED = 'STEP_FINISHED',
  TEXT_MESSAGE_START = 'TEXT_MESSAGE_START',
  TEXT_MESSAGE_CONTENT = 'TEXT_MESSAGE_CONTENT',
  TEXT_MESSAGE_END = 'TEXT_MESSAGE_END',
  STATE_DELTA = 'STATE_DELTA',
  STATE_SNAPSHOT = 'STATE_SNAPSHOT'
}

interface BaseEvent {
  type: EventType;
  threadId?: string | undefined;
  runId?: string | undefined;
  stepName?: string;
  messageId?: string;
  delta?: any;
  message?: string;
}

// Abstract Agent Base Class
abstract class AbstractAgent {
  protected agentId: string;
  protected description: string;

  constructor(config: { agentId: string; description: string }) {
    this.agentId = config.agentId;
    this.description = config.description;
  }

  abstract run(input: { threadId?: string; runId?: string }): Observable<BaseEvent>;

  runAgent(params?: any): Observable<BaseEvent> {
    return this.run({
      threadId: params?.threadId || 'default',
      runId: params?.runId || Date.now().toString()
    });
  }
}

// Business Analysis Agent
class BusinessAnalysisAgent extends AbstractAgent {
  private openai: OpenAI;
  private context: AgentContext;

  constructor(context: AgentContext) {
    super({
      agentId: AgentType.BUSINESS_ANALYST,
      description: 'Analyzes business context, market positioning, and customer psychology'
    });
    this.context = context;
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
      dangerouslyAllowBrowser: true
    });
  }

  run(input: { threadId?: string; runId?: string }): Observable<BaseEvent> {
    return new Observable<BaseEvent>((observer) => {
      observer.next({
        type: EventType.RUN_STARTED,
        threadId: input.threadId || undefined,
        runId: input.runId || undefined,
      });

      observer.next({
        type: EventType.STEP_STARTED,
        stepName: 'business_analysis',
      });

      const messageId = Date.now().toString();

      this.analyzeBusinessContext()
        .then((analysis) => {
          observer.next({
            type: EventType.TEXT_MESSAGE_START,
            messageId,
          });

          observer.next({
            type: EventType.TEXT_MESSAGE_CONTENT,
            messageId,
            delta: `🔍 Business Analysis Complete\n\nTarget Market: ${analysis.output.targetMarket}\nCompetitive Edge: ${analysis.output.competitiveEdge}\nConfidence: ${analysis.confidence}%`,
          });

          observer.next({
            type: EventType.TEXT_MESSAGE_END,
            messageId,
          });

          observer.next({
            type: EventType.STATE_DELTA,
            delta: [{ op: 'add', path: '/businessAnalysis', value: analysis }],
          });

          observer.next({
            type: EventType.STEP_FINISHED,
            stepName: 'business_analysis',
          });

          observer.next({
            type: EventType.RUN_FINISHED,
            threadId: input.threadId,
            runId: input.runId,
          });

          observer.complete();
        })
        .catch((error) => {
          observer.next({
            type: EventType.RUN_ERROR,
            message: error.message,
          });
          observer.error(error);
        });
    });
  }

  private async analyzeBusinessContext(): Promise<AgentResponse> {
    const businessHash = this.generateBusinessHash(this.context.businessData);
    const locationContext = this.extractLocationContext(this.context.businessData.address);
    
    const prompt = `
    You are a Business Analysis Agent specializing in market positioning and customer psychology.
    
    Business Data: ${JSON.stringify(this.context.businessData, null, 2)}
    User Requirements: ${JSON.stringify(this.context.userRequirements, null, 2)}
    
    UNIQUE ANALYSIS REQUIREMENT: This analysis must be completely unique for this specific business.
    Business Hash ID: ${businessHash}
    Location Context: ${locationContext}
    
    Provide a comprehensive business analysis for HTML-first content generation:
    {
      "targetMarket": "Detailed psychographic analysis specific to this location and business type",
      "competitiveEdge": "Unique positioning opportunities in this market",
      "valueDrivers": ["List of key value drivers specific to this business"],
      "customerPainPoints": ["Pain points this specific business solves"],
      "conversionTriggers": ["Industry and location-specific triggers"],
      "localAdvantages": ["Location-based advantages for ${this.context.businessData.address}"],
      "brandPersonality": "Unique brand personality for content tone",
      "emotionalTriggers": "Emotional triggers specific to this business type and location",
      "contentImplications": "How this analysis should influence content generation",
      "confidence": 85,
      "reasoning": "Why this analysis is accurate and unique to this business"
    }
    
    Focus on insights that will drive unique content decisions. No two businesses should get similar analysis.
    Consider: Business type (${this.context.businessData.type}), Location (${this.context.businessData.address}), Rating (${this.context.businessData.rating || 'New'}/5)
    `;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert business analyst specializing in creating unique market positioning insights that drive distinctive content decisions. Every analysis must be completely unique and tailored to the specific business context.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    return this.parseResponse(completion.choices[0]?.message?.content || '');
  }

  private extractLocationContext(address: string): string {
    const addressParts = address.split(',').map(part => part.trim());
    return `Location: ${addressParts.slice(0, 2).join(', ')} - Consider local market characteristics, demographics, and competitive landscape specific to this area.`;
  }

  private generateBusinessHash(businessData: BusinessData): string {
    const hashInput = `${businessData.name}-${businessData.type}-${businessData.address}`;
    let hash = 0;
    for (let i = 0; i < hashInput.length; i++) {
      const char = hashInput.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  private parseResponse(content: string): AgentResponse {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        output: parsed,
        confidence: parsed.confidence || 75,
        reasoning: parsed.reasoning || 'Business analysis completed'
      };
    } catch (error) {
      console.error('Failed to parse business analysis:', error);
      return {
        success: false,
        output: {
          targetMarket: `Target market for ${this.context.businessData.type} in ${this.context.businessData.address}`,
          competitiveEdge: 'Quality service and professional expertise',
          confidence: 50
        },
        confidence: 50,
        reasoning: 'Fallback analysis due to parsing error'
      };
    }
  }
}

// Content Strategy Agent
class ContentStrategyAgent extends AbstractAgent {
  private openai: OpenAI;
  private context: AgentContext;

  constructor(context: AgentContext) {
    super({
      agentId: AgentType.CONTENT_STRATEGIST,
      description: 'Creates content strategy and messaging framework'
    });
    this.context = context;
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
      dangerouslyAllowBrowser: true
    });
  }

  run(input: { threadId?: string; runId?: string }): Observable<BaseEvent> {
    return new Observable<BaseEvent>((observer) => {
      observer.next({
        type: EventType.RUN_STARTED,
        threadId: input.threadId,
        runId: input.runId,
      });

      observer.next({
        type: EventType.STEP_STARTED,
        stepName: 'content_strategy',
      });

      this.generateContentStrategyWithReflection()
        .then((result) => {
          const messageId = Date.now().toString();

          observer.next({
            type: EventType.TEXT_MESSAGE_START,
            messageId,
          });

          observer.next({
            type: EventType.TEXT_MESSAGE_CONTENT,
            messageId,
            delta: `📝 Content Strategy Complete\n\nHeadline: ${result.output.headline}\nValue Props: ${result.output.valuePropositions?.slice(0, 2).join(', ')}\nIterations: ${result.iterations}\nConfidence: ${result.confidence}%`,
          });

          observer.next({
            type: EventType.TEXT_MESSAGE_END,
            messageId,
          });

          observer.next({
            type: EventType.STATE_DELTA,
            delta: [{ op: 'add', path: '/contentStrategy', value: result }],
          });

          observer.next({
            type: EventType.STEP_FINISHED,
            stepName: 'content_strategy',
          });

          observer.next({
            type: EventType.RUN_FINISHED,
            threadId: input.threadId,
            runId: input.runId,
          });

          observer.complete();
        })
        .catch((error) => {
          observer.next({
            type: EventType.RUN_ERROR,
            message: error.message,
          });
          observer.error(error);
        });
    });
  }

  private async generateContentStrategyWithReflection(): Promise<AgentResponse & { iterations: number }> {
    const businessAnalysis = this.context.agentOutputs.businessAnalysis?.output || {};
    
    const prompt = `
    You are a Content Strategy Agent. Create compelling content based on the business analysis.
    
    Business Data: ${JSON.stringify(this.context.businessData, null, 2)}
    Business Analysis: ${JSON.stringify(businessAnalysis, null, 2)}
    
    Create content strategy that will be used for HTML generation:
    {
      "headline": "Compelling headline that captures ${this.context.businessData.name}'s unique value",
      "subheadline": "Supporting subheadline with location and specialties",
      "valuePropositions": ["3-5 unique value propositions based on business analysis"],
      "services": [
        {
          "name": "Service name",
          "description": "Description incorporating business insights",
          "features": ["Features based on competitive analysis"]
        }
      ],
      "callToAction": {
        "primary": {
          "text": "Ultra-concise CTA from analysis",
          "action": "contact"
        },
        "secondary": {
          "text": "Secondary CTA",
          "action": "info"
        }
      },
      "aboutSection": "Rich about section incorporating all insights",
      "confidence": 85,
      "reasoning": "Why this content strategy is effective"
    }
    
    Make content unique to ${this.context.businessData.name} and location ${this.context.businessData.address}.
    `;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert content strategist who creates compelling, unique content that converts visitors into customers. Every piece of content must be tailored to the specific business and market.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 2000
    });

    const response = this.parseResponse(completion.choices[0]?.message?.content || '');
    return { ...response, iterations: 1 };
  }

  private parseResponse(content: string): AgentResponse {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        output: parsed,
        confidence: parsed.confidence || 75,
        reasoning: parsed.reasoning || 'Content strategy completed'
      };
    } catch (error) {
      console.error('Failed to parse content strategy:', error);
      return {
        success: false,
        output: {
          headline: `Welcome to ${this.context.businessData.name}`,
          subheadline: `Professional ${this.context.businessData.type} services`,
          valuePropositions: ['Quality service', 'Professional expertise', 'Customer satisfaction'],
          confidence: 50
        },
        confidence: 50,
        reasoning: 'Fallback content due to parsing error'
      };
    }
  }
}

// Synthesis Agent - Now focused on content only
class SynthesisAgent extends AbstractAgent {
  private openai: OpenAI;
  private context: AgentContext;

  constructor(context: AgentContext) {
    super({
      agentId: AgentType.SYNTHESIS_AGENT,
      description: 'Synthesizes all agent outputs into final content structure'
    });
    this.context = context;
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
      dangerouslyAllowBrowser: true
    });
  }

  run(input: { threadId?: string; runId?: string }): Observable<BaseEvent> {
    return new Observable<BaseEvent>((observer) => {
      observer.next({
        type: EventType.RUN_STARTED,
        threadId: input.threadId,
        runId: input.runId,
      });

      observer.next({
        type: EventType.STEP_STARTED,
        stepName: 'final_synthesis',
      });

      this.synthesizeFinalContent()
        .then((finalContent) => {
          const messageId = Date.now().toString();

          observer.next({
            type: EventType.TEXT_MESSAGE_START,
            messageId,
          });

          observer.next({
            type: EventType.TEXT_MESSAGE_CONTENT,
            messageId,
            delta: `✨ Final Synthesis Complete\n\nContent Generated for ${this.context.businessData.name}\nReady for HTML Generation`,
          });

          observer.next({
            type: EventType.TEXT_MESSAGE_END,
            messageId,
          });

          observer.next({
            type: EventType.STATE_DELTA,
            delta: [{ op: 'add', path: '/finalContent', value: finalContent }],
          });

          observer.next({
            type: EventType.STEP_FINISHED,
            stepName: 'final_synthesis',
          });

          observer.next({
            type: EventType.RUN_FINISHED,
            threadId: input.threadId,
            runId: input.runId,
          });

          observer.complete();
        })
        .catch((error) => {
          observer.next({
            type: EventType.RUN_ERROR,
            message: error.message,
          });
          observer.error(error);
        });
    });
  }

  private async synthesizeFinalContent(): Promise<GeneratedContent> {
    // ✨ STAGE 1: Pure HTML Generation (Creative Mode)
    const htmlGenerationPrompt = `
    You are an elite web designer creating a premium landing page that rivals the best modern sites.
    
    🎨 DESIGN INSPIRATION & QUALITY BENCHMARKS:
    - Linear.app: Clean typography, sophisticated gradients, micro-interactions
    - Ray.so: Modern cards, perfect spacing, elegant shadows
    - Vercel.com: Minimal excellence, smart use of negative space
    - Framer.com: Smooth animations, premium feel, perfect contrast
    - Stripe.com: Professional trust, clear hierarchy, conversion focus
    - Tailwindui.com: Component perfection, responsive mastery
    
    BUSINESS CONTEXT:
    - Name: ${this.context.businessData.name}
    - Type: ${this.context.businessData.type}
    - Location: ${this.context.businessData.address}
    - Phone: ${this.context.businessData.phone}
    - Rating: ${this.context.businessData.rating || 'New Business'}/5
    
    BUSINESS INSIGHTS:
    ${JSON.stringify(this.context.agentOutputs.businessAnalysis?.output || {}, null, 2)}
    
    CONTENT STRATEGY:
    ${JSON.stringify(this.context.agentOutputs.contentStrategy?.output || {}, null, 2)}
    
    🎯 BUSINESS-SPECIFIC DESIGN DIRECTION:
    ${this.getBusinessSpecificDesign(this.context.businessData.type)}
    
    📐 PREMIUM STRUCTURE REQUIREMENTS:
    
    1. **HERO SECTION** (Full viewport impact):
       - Massive gradient background (bg-gradient-to-br with 3+ color stops)
       - Display typography (text-7xl md:text-8xl font-extrabold tracking-tight)
       - Floating decorative elements with backdrop-blur-sm
       - Dual contrasting CTAs (gradient button + outline ghost)
       - Subtle animation delays (animate-pulse, animate-bounce delay-100/300)
       - Perfect vertical centering with proper spacing
    
    2. **SERVICES/VALUE SECTION**:
       - Perfect grid (grid-cols-1 md:grid-cols-3 gap-8)
       - Cards with gradient backgrounds and shadow-2xl
       - Sophisticated hover effects (hover:scale-105 hover:shadow-blue-500/25)
       - Business-appropriate icons or visual elements
       - Typography hierarchy (text-2xl font-bold → text-gray-600)
    
    3. **ABOUT/STORY SECTION**:
       - Asymmetric layout (md:grid-cols-5 with 3/2 split)
       - Rich content with proper line-height and spacing
       - Visual element with sophisticated styling
       - Trust indicators with stars/badges
       - Professional spacing (py-24 px-8)
    
    4. **CONTACT/CTA SECTION**:
       - Dark theme contrast (bg-gray-900 or bg-black)
       - Contact info cards with perfect spacing
       - Final conversion CTA with gradient magic
       - Professional contrast and accessibility
    
    5. **FOOTER**:
       - Minimal, clean design
       - Proper business info hierarchy
    
    🎨 ADVANCED STYLING REQUIREMENTS:
    - Complex gradients: from-blue-600 via-purple-600 to-cyan-500
    - Sophisticated shadows: shadow-2xl shadow-blue-500/25 shadow-purple-500/20
    - Perfect spacing: py-24 px-8 space-y-16 gap-12
    - Premium typography: font-extrabold tracking-tight leading-tight
    - Modern corners: rounded-3xl rounded-full
    - Smooth animations: transition-all duration-500 ease-out
    - Backdrop magic: backdrop-blur-sm backdrop-saturate-150
    - Hover states: hover:shadow-2xl hover:scale-105 hover:-translate-y-1
    
    📱 RESPONSIVE PERFECTION:
    - Mobile-first methodology
    - Breakpoint mastery: sm:, md:, lg:, xl:, 2xl:
    - Typography scales: text-4xl md:text-6xl lg:text-8xl
    - Layout adaptation with grid-responsive patterns
    
    ⚡ TECHNICAL EXCELLENCE:
    - TailwindCSS CDN integration
    - Semantic HTML5 structure
    - SEO-optimized meta tags
    - Performance-conscious code
    
    CRITICAL INSTRUCTIONS:
    1. Return ONLY the complete HTML document
    2. Use delimiters: <<<BEGIN_HTML>>> and <<<END_HTML>>>
    3. No JSON, no explanations, just pure premium HTML
    4. Make it look like a $15,000 agency design
    5. Every element should feel intentional and sophisticated
    
    <<<BEGIN_HTML>>>
    [YOUR COMPLETE PREMIUM HTML DOCUMENT]
    <<<END_HTML>>>
    `;

    try {
      // Stage 1: Generate Pure HTML
      console.log('🎨 Stage 1: Generating premium HTML with elite design standards...');
      const htmlCompletion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an elite web designer who creates award-winning landing pages that rival the best modern sites like Linear, Vercel, and Framer. You only return complete, production-ready HTML documents with sophisticated TailwindCSS styling. Always use the HTML delimiters provided.'
          },
          {
            role: 'user',
            content: htmlGenerationPrompt
          }
        ],
        temperature: 0.9, // High creativity for unique designs
        max_tokens: 4000
      });

      let htmlDocument = htmlCompletion.choices[0]?.message?.content?.trim() || '';
      
      // Extract HTML from delimiters
      const htmlMatch = htmlDocument.match(/<<<BEGIN_HTML>>>([\s\S]*?)<<<END_HTML>>>/);
      if (htmlMatch && htmlMatch[1]) {
        htmlDocument = htmlMatch[1].trim();
      }
      
      console.log('✅ Stage 1 Complete: Premium HTML generated:', htmlDocument.length, 'characters');

      if (!htmlDocument.includes('<!DOCTYPE html>')) {
        throw new Error('Invalid HTML generated in Stage 1');
      }

      // ✨ STAGE 2: Content Extraction (Structured Mode)
      const extractionPrompt = `
      You are a content extraction specialist analyzing premium HTML for structured data.
      
      HTML DOCUMENT:
      ${htmlDocument}
      
      BUSINESS CONTEXT:
      - Business Name: ${this.context.businessData.name}
      - Business Type: ${this.context.businessData.type}
      - Phone: ${this.context.businessData.phone}
      - Address: ${this.context.businessData.address}
      
      Extract and return ONLY this JSON structure:
      {
        "headline": "Main headline from the HTML",
        "subheadline": "Supporting headline/tagline from the HTML", 
        "valuePropositions": ["Extract 3-5 key value propositions or benefits mentioned"],
        "services": [
          {
            "name": "Service name",
            "description": "Service description", 
            "features": ["Feature 1", "Feature 2"]
          }
        ],
        "callToAction": {
          "primary": {"text": "Main CTA button text", "action": "contact"},
          "secondary": {"text": "Secondary CTA text", "action": "info"}
        },
        "aboutSection": "About/story content from the HTML",
        "contactInfo": {
          "phone": "${this.context.businessData.phone}",
          "address": "${this.context.businessData.address}",
          "email": "",
          "website": ""
        }
      }
      
      Return ONLY valid JSON, no additional text or formatting.
      `;

      // Stage 2: Extract Structured Data
      console.log('📋 Stage 2: Extracting structured content...');
      const extractionCompletion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a content extraction specialist. You analyze HTML and return only clean, valid JSON with extracted structured data. Never include explanations or additional text.'
          },
          {
            role: 'user',
            content: extractionPrompt
          }
        ],
        temperature: 0.1, // Low temperature for accurate extraction
        max_tokens: 1500
      });

      const extractionResponse = extractionCompletion.choices[0]?.message?.content?.trim() || '{}';
      console.log('✅ Stage 2 Complete: Content extracted');

      // Parse extracted content
      let extractedContent;
      try {
        const jsonMatch = extractionResponse.match(/\{[\s\S]*\}/);
        extractedContent = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
      } catch (error) {
        console.warn('⚠️ Extraction parsing failed, using fallback structure');
        extractedContent = this.createFallbackExtractedContent();
      }

      // ✨ STAGE 3: Design Refinement & Polish (Perfection Mode)
      console.log('✨ Stage 3: Design refinement and polish...');
      const refinedHtml = await this.refineDesign(htmlDocument, extractedContent);

      // ✨ COMBINE RESULTS: Premium HTML + Structured Data + Refinements
      const finalContent = this.combineHtmlAndStructuredData(refinedHtml, extractedContent);
      console.log('🎯 Three-Stage Premium Generation Complete!');
      
      return finalContent;

    } catch (error) {
      console.error('💥 Three-stage generation failed:', error);
      
      // Enhanced fallback with professional styling
      return this.createProfessionalFallbackContent();
    }
  }

  private getBusinessSpecificDesign(businessType: string): string {
    const type = businessType.toLowerCase();
    
    if (type.includes('restaurant') || type.includes('food') || type.includes('pizza') || type.includes('cafe')) {
      return `
      🍕 RESTAURANT/FOOD DESIGN DIRECTION:
      - Colors: Warm reds, oranges, yellows (#dc2626, #ea580c, #fbbf24)
      - Typography: font-serif for headlines, font-sans for body
      - Buttons: rounded-full with warm gradients
      - Icons: Food emojis (🍕, 🍔, ⭐) or simple food icons
      - Animation: Playful bounce effects, gentle hover scaling
      - Mood: Welcoming, appetizing, family-friendly
      - CTA Language: "Order Now", "Book Table", "See Menu"
      `;
    } else if (type.includes('tech') || type.includes('software') || type.includes('digital') || type.includes('saas')) {
      return `
      💻 TECH/SOFTWARE DESIGN DIRECTION:
      - Colors: Cool blues, purples, cyans (#3b82f6, #6366f1, #8b5cf6)
      - Typography: font-mono for accents, font-sans for everything else
      - Buttons: Sharp rounded-lg corners, gradient borders
      - Icons: Line icons, minimal geometric shapes, code symbols
      - Animation: Smooth fade transitions, subtle transforms
      - Mood: Clean, innovative, trustworthy, cutting-edge
      - CTA Language: "Get Started", "Try Free", "Learn More"
      `;
    } else if (type.includes('health') || type.includes('medical') || type.includes('clinic') || type.includes('dental')) {
      return `
      🏥 HEALTH/MEDICAL DESIGN DIRECTION:
      - Colors: Calming greens, teals, blues (#059669, #0d9488, #0284c7)
      - Typography: font-sans throughout, professional hierarchy
      - Buttons: rounded-xl corners, solid trustworthy styling
      - Icons: Medical symbols, hearts, shields, plus signs
      - Animation: Gentle, reassuring movements, no jarring effects
      - Mood: Professional, trustworthy, calming, caring
      - CTA Language: "Book Appointment", "Contact Us", "Learn More"
      `;
    } else if (type.includes('retail') || type.includes('shop') || type.includes('store') || type.includes('boutique')) {
      return `
      🛍️ RETAIL/SHOPPING DESIGN DIRECTION:
      - Colors: Vibrant purples, pinks, blues (#a855f7, #ec4899, #3b82f6)
      - Typography: font-sans with playful font weights
      - Buttons: rounded-2xl with gradient backgrounds
      - Icons: Shopping symbols, stars, arrows, product imagery
      - Animation: Fun hover effects, scale transforms, color transitions
      - Mood: Exciting, trendy, accessible, engaging
      - CTA Language: "Shop Now", "Discover", "Explore Collection"
      `;
    } else {
      return `
      🏢 PROFESSIONAL SERVICES DESIGN DIRECTION:
      - Colors: Professional navy, grays, blues (#374151, #3b82f6, #6366f1)
      - Typography: font-sans with strong hierarchy
      - Buttons: rounded-lg corners, professional styling
      - Icons: Business symbols, arrows, checkmarks, shields
      - Animation: Subtle, professional hover effects
      - Mood: Trustworthy, professional, competent, reliable
      - CTA Language: "Contact Us", "Get Quote", "Learn More"
      `;
    }
  }

  private async refineDesign(htmlDocument: string, extractedContent: any): Promise<string> {
    const refinementPrompt = `
    You are a design refinement specialist perfecting an already-good landing page.
    
    CURRENT HTML:
    ${htmlDocument}
    
    EXTRACTED CONTENT FOR CONTEXT:
    ${JSON.stringify(extractedContent, null, 2)}
    
    BUSINESS TYPE: ${this.context.businessData.type}
    
    🎯 REFINEMENT OBJECTIVES:
    
    1. **POLISH RESPONSIVE DESIGN**:
       - Ensure perfect mobile breakpoints
       - Fix any spacing issues on small screens
       - Optimize typography scaling
    
    2. **ENHANCE VISUAL HIERARCHY**:
       - Strengthen contrast between sections
       - Perfect the spacing rhythm
       - Ensure CTAs stand out prominently
    
    3. **OPTIMIZE COLORS & GRADIENTS**:
       - Make gradients more sophisticated
       - Ensure proper contrast ratios
       - Add subtle color variations
    
    4. **REFINE ANIMATIONS & INTERACTIONS**:
       - Add smooth micro-interactions
       - Ensure hover states are perfect
       - Add loading state considerations
    
    5. **BUSINESS-SPECIFIC TOUCHES**:
       - Add industry-appropriate visual elements
       - Optimize for conversion psychology
       - Ensure brand personality shines through
    
    6. **PERFORMANCE & ACCESSIBILITY**:
       - Optimize for fast loading
       - Ensure proper semantic structure
       - Add ARIA labels where needed
    
    INSTRUCTIONS:
    - Return ONLY the refined HTML document
    - Use delimiters: <<<BEGIN_REFINED_HTML>>> and <<<END_REFINED_HTML>>>
    - Keep all existing content, just polish the design
    - Make it feel like a $20,000 custom design
    
    <<<BEGIN_REFINED_HTML>>>
    [YOUR REFINED HTML DOCUMENT]
    <<<END_REFINED_HTML>>>
    `;

    try {
      const refinementCompletion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a design refinement specialist who takes good designs and makes them exceptional. You focus on polish, responsiveness, and perfect user experience. Always use the HTML delimiters provided.'
          },
          {
            role: 'user',
            content: refinementPrompt
          }
        ],
        temperature: 0.3, // Lower temperature for refinement precision
        max_tokens: 4000
      });

      let refinedHtml = refinementCompletion.choices[0]?.message?.content?.trim() || htmlDocument;
      
      // Extract refined HTML from delimiters
      const refinedMatch = refinedHtml.match(/<<<BEGIN_REFINED_HTML>>>([\s\S]*?)<<<END_REFINED_HTML>>>/);
      if (refinedMatch && refinedMatch[1]) {
        refinedHtml = refinedMatch[1].trim();
      }
      
      console.log('✨ Stage 3 Complete: Design refined and polished');
      return refinedHtml;
      
    } catch (error) {
      console.warn('⚠️ Design refinement failed, returning original HTML');
      return htmlDocument;
    }
  }

  private createFallbackExtractedContent(): any {
    return {
      headline: `Welcome to ${this.context.businessData.name}`,
      subheadline: `Professional ${this.context.businessData.type} services`,
      valuePropositions: ['Quality Service', 'Professional Excellence', 'Customer Satisfaction'],
      services: [{
        name: 'Our Services',
        description: `Professional ${this.context.businessData.type} services`,
        features: ['High Quality', 'Expert Team']
      }],
      callToAction: {
        primary: { text: 'Contact Us', action: 'contact' }
      },
      aboutSection: `${this.context.businessData.name} provides exceptional service.`,
      contactInfo: {
        phone: this.context.businessData.phone,
        address: this.context.businessData.address,
        email: '',
        website: ''
      }
    };
  }

  private combineHtmlAndStructuredData(htmlDocument: string, extractedContent: any): GeneratedContent {
    return {
      htmlDocument: htmlDocument, // The premium HTML from Stage 1
      headline: extractedContent.headline || `Welcome to ${this.context.businessData.name}`,
      subheadline: extractedContent.subheadline || `Professional ${this.context.businessData.type} services`,
      valuePropositions: extractedContent.valuePropositions || ['Quality Service', 'Professional Excellence'],
      services: extractedContent.services || [{
        name: 'Our Services',
        description: `Professional ${this.context.businessData.type} services`,
        features: ['High Quality', 'Expert Team']
      }],
      callToAction: extractedContent.callToAction || {
        primary: { text: 'Contact Us', action: 'contact' }
      },
      aboutSection: extractedContent.aboutSection || `${this.context.businessData.name} provides exceptional service.`,
      contactInfo: extractedContent.contactInfo || {
        phone: this.context.businessData.phone,
        address: this.context.businessData.address,
        email: this.context.businessData.email || '',
        website: this.context.businessData.website || ''
      },
      // Create enhanced theme based on generated HTML
      theme: this.generateThemeFromHtml(htmlDocument),
      trustSignals: extractedContent.trustSignals,
      locationHighlights: extractedContent.locationHighlights,
      businessHours: extractedContent.businessHours
    };
  }

  private generateThemeFromHtml(htmlDocument: string): any {
    // Analyze HTML to determine theme characteristics
    const businessType = this.context.businessData.type;
    const businessName = this.context.businessData.name;
    
    // Extract potential color scheme from HTML classes
    const getThemeColorsFromBusinessType = (type: string) => {
      const lowerType = type.toLowerCase();
      if (lowerType.includes('restaurant') || lowerType.includes('food')) {
        return { primary: '#dc2626', secondary: '#ea580c', accent: '#fbbf24' };
      } else if (lowerType.includes('tech') || lowerType.includes('software')) {
        return { primary: '#3b82f6', secondary: '#6366f1', accent: '#8b5cf6' };
      } else if (lowerType.includes('health') || lowerType.includes('medical')) {
        return { primary: '#059669', secondary: '#0d9488', accent: '#0284c7' };
      } else {
        return { primary: '#374151', secondary: '#3b82f6', accent: '#6366f1' };
      }
    };

    const colors = getThemeColorsFromBusinessType(businessType);

    return {
      id: `premium_theme_${Date.now()}`,
      name: `Premium Theme for ${businessName}`,
      businessType: businessType,
      colors: {
        primary: colors.primary,
        secondary: colors.secondary,
        accent: colors.accent,
        background: '#ffffff',
        backgroundSecondary: '#f8fafc',
        text: '#1e293b',
        textSecondary: '#64748b',
        cardBackground: '#ffffff',
        cardBorder: '#e2e8f0',
        gradientFrom: colors.primary,
        gradientTo: colors.secondary
      },
      fonts: {
        heading: 'Inter, sans-serif',
        body: 'Inter, sans-serif'
      },
      layout: {
        type: 'single-page',
        structure: 'hero-focused',
        heroStyle: 'full-screen',
        sectionOrder: ['Hero', 'Services', 'About', 'Contact'],
        contentLayout: 'single-column',
        navigationStyle: 'minimal',
        ctaPlacement: 'multiple-sections'
      },
      spacing: {
        sectionGap: '6rem',
        cardPadding: '2rem',
        containerMaxWidth: '1200px'
      },
      effects: {
        cardBlur: true,
        gradientBackground: true,
        animations: true,
        shadows: 'strong'
      }
    };
  }

  private createProfessionalFallbackContent(): GeneratedContent {
    const businessName = this.context.businessData.name;
    const businessType = this.context.businessData.type;
    const phone = this.context.businessData.phone;
    const address = this.context.businessData.address;
    const rating = this.context.businessData.rating || 'New';

    // Choose colors based on business type
    const getBusinessColors = (type: string) => {
      const lowerType = type.toLowerCase();
      if (lowerType.includes('restaurant') || lowerType.includes('food') || lowerType.includes('pizza')) {
        return { primary: '#dc2626', secondary: '#ea580c', accent: '#fbbf24' };
      } else if (lowerType.includes('tech') || lowerType.includes('software') || lowerType.includes('digital')) {
        return { primary: '#3b82f6', secondary: '#6366f1', accent: '#8b5cf6' };
      } else if (lowerType.includes('health') || lowerType.includes('medical') || lowerType.includes('clinic')) {
        return { primary: '#059669', secondary: '#0d9488', accent: '#0284c7' };
      } else if (lowerType.includes('retail') || lowerType.includes('shop') || lowerType.includes('store')) {
        return { primary: '#a855f7', secondary: '#ec4899', accent: '#3b82f6' };
      } else {
        return { primary: '#374151', secondary: '#3b82f6', accent: '#6366f1' };
      }
    };

    const colors = getBusinessColors(businessType);

    const fallbackHTML = `<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>${businessName}</title>
    <script src='https://cdn.tailwindcss.com'></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '${colors.primary}',
                        secondary: '${colors.secondary}',
                        accent: '${colors.accent}'
                    }
                }
            }
        }
    </script>
</head>
<body class='bg-gradient-to-br from-gray-50 via-white to-gray-50'>
    <!-- Hero Section -->
    <header class='relative min-h-screen flex items-center justify-center bg-gradient-to-r from-primary/90 via-secondary/80 to-accent/70 text-white overflow-hidden'>
        <div class='absolute inset-0 bg-black/30'></div>
        <div class='relative z-10 text-center max-w-4xl mx-auto px-6'>
            <h1 class='text-6xl md:text-7xl font-bold mb-6 tracking-tight'>${businessName}</h1>
            <p class='text-xl md:text-2xl mb-8 text-white/90 font-light'>Professional ${businessType.toLowerCase()} services in ${address.split(',')[0] || 'your area'}</p>
            <div class='flex flex-col sm:flex-row gap-4 justify-center'>
                <button class='bg-accent hover:bg-yellow-400 text-gray-900 font-semibold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg'>
                    Contact Us Now
                </button>
                <button class='border-2 border-white hover:bg-white hover:text-gray-900 text-white font-semibold py-4 px-8 rounded-full transition-all duration-300'>
                    Learn More
                </button>
            </div>
        </div>
        
        <!-- Floating elements -->
        <div class='absolute top-20 left-10 w-20 h-20 bg-accent/20 rounded-full blur-xl animate-pulse'></div>
        <div class='absolute bottom-20 right-10 w-32 h-32 bg-primary/20 rounded-full blur-xl animate-pulse delay-1000'></div>
    </header>

    <!-- Services Section -->
    <section class='py-20 bg-white'>
        <div class='max-w-7xl mx-auto px-6'>
            <div class='text-center mb-16'>
                <h2 class='text-4xl md:text-5xl font-bold text-gray-900 mb-4'>Our Services</h2>
                <p class='text-xl text-gray-600 max-w-2xl mx-auto'>Providing exceptional ${businessType.toLowerCase()} services with dedication to quality and customer satisfaction</p>
            </div>

            <div class='grid md:grid-cols-3 gap-8'>
                <div class='bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2'>
                    <div class='w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-6 mx-auto'>
                        <span class='text-2xl'>🎯</span>
                    </div>
                    <h3 class='text-2xl font-bold text-gray-900 mb-4 text-center'>Quality Service</h3>
                    <p class='text-gray-600 text-center leading-relaxed'>We deliver exceptional ${businessType.toLowerCase()} services with attention to detail and commitment to excellence.</p>
                </div>

                <div class='bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2'>
                    <div class='w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-6 mx-auto'>
                        <span class='text-2xl'>⭐</span>
                    </div>
                    <h3 class='text-2xl font-bold text-gray-900 mb-4 text-center'>Expert Team</h3>
                    <p class='text-gray-600 text-center leading-relaxed'>Our experienced professionals bring years of expertise to every project and customer interaction.</p>
                </div>

                <div class='bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2'>
                    <div class='w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-6 mx-auto'>
                        <span class='text-2xl'>💎</span>
                    </div>
                    <h3 class='text-2xl font-bold text-gray-900 mb-4 text-center'>Customer Focused</h3>
                    <p class='text-gray-600 text-center leading-relaxed'>Your satisfaction is our priority. We work closely with you to exceed your expectations.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- About Section -->
    <section class='py-20 bg-gradient-to-r from-gray-50 to-blue-50'>
        <div class='max-w-6xl mx-auto px-6'>
            <div class='grid md:grid-cols-2 gap-12 items-center'>
                <div>
                    <h2 class='text-4xl md:text-5xl font-bold text-gray-900 mb-6'>About ${businessName}</h2>
                    <p class='text-lg text-gray-700 mb-6 leading-relaxed'>
                        ${businessName} has been serving the community with professional ${businessType.toLowerCase()} services. 
                        We pride ourselves on quality, reliability, and exceptional customer service.
                    </p>
                    ${rating !== 'New' ? `
                    <div class='flex items-center space-x-4 mb-6'>
                        <div class='flex text-yellow-400'>
                            <span class='text-2xl'>⭐⭐⭐⭐⭐</span>
                        </div>
                        <span class='text-gray-600'>${rating}/5 rating from satisfied customers</span>
                    </div>
                    ` : ''}
                    <button class='bg-primary hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300'>
                        Learn More
                    </button>
                </div>
                <div class='relative'>
                    <div class='w-full h-96 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center'>
                        <span class='text-6xl'>🏢</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Contact Section -->
    <section class='py-20 bg-gray-900 text-white'>
        <div class='max-w-6xl mx-auto px-6'>
            <div class='text-center mb-12'>
                <h2 class='text-4xl md:text-5xl font-bold mb-4'>Get In Touch</h2>
                <p class='text-xl text-gray-300'>Ready to experience our professional ${businessType.toLowerCase()} services?</p>
            </div>

            <div class='grid md:grid-cols-2 gap-8 text-center'>
                <div class='bg-gray-800 rounded-xl p-8 hover:bg-gray-700 transition-colors duration-300'>
                    <div class='w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 mx-auto'>
                        <span class='text-2xl'>📞</span>
                    </div>
                    <h3 class='text-xl font-semibold mb-2'>Phone</h3>
                    <p class='text-gray-300'>${phone}</p>
                </div>

                <div class='bg-gray-800 rounded-xl p-8 hover:bg-gray-700 transition-colors duration-300'>
                    <div class='w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4 mx-auto'>
                        <span class='text-2xl'>📍</span>
                    </div>
                    <h3 class='text-xl font-semibold mb-2'>Location</h3>
                    <p class='text-gray-300'>${address}</p>
                </div>
            </div>

            <div class='text-center mt-12'>
                <button class='bg-accent hover:bg-yellow-400 text-gray-900 font-semibold py-4 px-12 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg'>
                    Contact Us Today
                </button>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class='bg-black text-white py-8'>
        <div class='max-w-6xl mx-auto px-6 text-center'>
            <p class='text-gray-400'>© 2024 ${businessName}. Professional ${businessType.toLowerCase()} services.</p>
        </div>
    </footer>
</body>
</html>`;

    return {
      htmlDocument: fallbackHTML,
      headline: businessName,
      subheadline: `Professional ${businessType.toLowerCase()} services in ${address.split(',')[0] || 'your area'}`,
      valuePropositions: ['Quality Service', 'Expert Team', 'Customer Focused', 'Professional Results'],
      services: [{
        name: 'Professional Services',
        description: `Comprehensive ${businessType.toLowerCase()} services tailored to your needs`,
        features: ['Quality Work', 'Expert Team', 'Customer Satisfaction', 'Professional Results']
      }],
      callToAction: {
        primary: { text: 'Contact Us Now', action: 'contact' }
      },
      aboutSection: `${businessName} has been serving the community with professional ${businessType.toLowerCase()} services. We pride ourselves on quality, reliability, and exceptional customer service.`,
      contactInfo: {
        phone: phone || '',
        address: address || '',
        email: this.context.businessData.email || '',
        website: this.context.businessData.website || ''
      },
      theme: {
        id: `professional_theme_${Date.now()}`,
        name: `Professional Theme for ${businessName}`,
        businessType: businessType,
        colors: {
          primary: colors.primary,
          secondary: colors.secondary, 
          accent: colors.accent,
          background: '#ffffff',
          backgroundSecondary: '#f8fafc',
          text: '#1e293b',
          textSecondary: '#64748b',
          cardBackground: '#ffffff',
          cardBorder: '#e2e8f0',
          gradientFrom: colors.primary,
          gradientTo: colors.secondary
        },
        fonts: {
          heading: 'Inter, sans-serif',
          body: 'Inter, sans-serif'
        },
        layout: {
          type: 'single-page',
          structure: 'hero-focused',
          heroStyle: 'centered-compact',
          sectionOrder: ['Hero', 'Services', 'About', 'Contact'],
          contentLayout: 'single-column',
          navigationStyle: 'hidden-scroll',
          ctaPlacement: 'hero-only'
        },
        spacing: {
          sectionGap: '5rem',
          cardPadding: '2rem',
          containerMaxWidth: '1200px'
        },
        effects: {
          cardBlur: false,
          gradientBackground: true,
          animations: true,
          shadows: 'strong'
        }
      }
    };
  }

  private transformToGeneratedContent(synthesisOutput: any): GeneratedContent {
    const synthesis = synthesisOutput;

    return {
      htmlDocument: synthesis.htmlDocument, // The complete HTML document
      headline: synthesis.headline || `Welcome to ${this.context.businessData.name}`,
      subheadline: synthesis.subheadline || `Professional ${this.context.businessData.type.toLowerCase()} services`,
      valuePropositions: synthesis.valuePropositions || ['Quality service', 'Professional expertise'],
      services: synthesis.services || [{
        name: 'Our Services',
        description: this.context.businessData.description || 'Professional services',
        features: ['High quality', 'Expert team']
      }],
      callToAction: synthesis.callToAction || {
        primary: { text: 'Contact', action: 'contact' },
        secondary: { text: 'Info', action: 'info' }
      },
      aboutSection: synthesis.aboutSection || `${this.context.businessData.name} provides exceptional service.`,
      contactInfo: synthesis.contactInfo || {
        phone: this.context.businessData.phone,
        address: this.context.businessData.address,
        email: this.context.businessData.email,
        website: this.context.businessData.website
      },
      // Create minimal theme for backward compatibility
      theme: {
        id: `html_theme_${Date.now()}`,
        name: `HTML Theme for ${this.context.businessData.name}`,
        businessType: this.context.businessData.type,
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
          gradientTo: '#1d4ed8'
        },
        fonts: {
          heading: 'Inter, sans-serif',
          body: 'Inter, sans-serif'
        },
        layout: {
          type: 'single-page',
          structure: 'hero-focused',
          heroStyle: 'centered-compact',
          sectionOrder: ['Hero', 'Services', 'About', 'Contact'],
          contentLayout: 'single-column',
          navigationStyle: 'top-bar',
          ctaPlacement: 'hero-only'
        },
        spacing: {
          sectionGap: '4rem',
          cardPadding: '1.5rem',
          containerMaxWidth: '1200px'
        },
        effects: {
          cardBlur: false,
          gradientBackground: false,
          animations: true,
          shadows: 'medium'
        }
      },
      trustSignals: synthesis.trustSignals,
      locationHighlights: synthesis.locationHighlights,
      businessHours: synthesis.businessHours
    };
  }

  private parseResponse(content: string): AgentResponse {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
      return {
        success: true,
        output: parsed,
        confidence: 90,
        reasoning: 'Synthesis completed'
      };
    } catch (error) {
      return {
        success: false,
        output: {},
        confidence: 50,
        reasoning: 'Failed to parse synthesis'
      };
    }
  }
}

// Progress tracking for hooks
interface ProgressEvent {
  stage: string;
  progress: number;
  message: string;
  agentEvent?: BaseEvent;
}

// Main Multi-Agent Orchestrator (Simplified)
class AgenticsService {
  private context: AgentContext | null = null;

  async generateLandingPageWithAgents(request: ContentGenerationRequest): Promise<GeneratedContent> {
    this.context = {
      businessData: request.businessData,
      userRequirements: request,
      agentOutputs: {},
      iterationCount: 0,
      maxIterations: 3,
      confidence: 0
    };

        try {
      // Stage 1: Business Analysis Agent
      const analysisAgent = new BusinessAnalysisAgent(this.context);
      await this.runAgentStage(analysisAgent, 'Business Analysis');

      // Stage 2: Content Strategy Agent
      const strategyAgent = new ContentStrategyAgent(this.context);
      await this.runAgentStage(strategyAgent, 'Content Strategy');

      // Stage 3: Final Synthesis Agent
      const synthesisAgent = new SynthesisAgent(this.context);
      const finalResult = await this.runAgentStage(synthesisAgent, 'Final Synthesis');

      return finalResult;

    } catch (error) {
      console.error('Multi-agent generation failed:', error);
      throw error;
    }
  }

  // New method to generate with real-time progress
  generateWithProgress(request: ContentGenerationRequest): Observable<ProgressEvent | { type: 'result'; data: GeneratedContent }> {
    return new Observable<ProgressEvent | { type: 'result'; data: GeneratedContent }>((progressObserver) => {
      this.context = {
        businessData: request.businessData,
        userRequirements: request,
        agentOutputs: {},
        iterationCount: 0,
        maxIterations: 3,
        confidence: 0
      };



      const runWithProgress = async () => {
        try {
          // Emit start
          progressObserver.next({
            stage: 'starting',
            progress: 0,
            message: '🤖 Initializing Multi-Agent System...'
          });

          // Stage 1: Business Analysis Agent
          const analysisAgent = new BusinessAnalysisAgent(this.context!);
          progressObserver.next({
            stage: 'business_analysis',
            progress: 10,
            message: '🔍 Business Analysis Agent starting...'
          });
          
          await this.runAgentStageWithProgress(analysisAgent, 'Business Analysis', progressObserver, 30);

          // Stage 2: Content Strategy Agent
          const strategyAgent = new ContentStrategyAgent(this.context!);
          progressObserver.next({
            stage: 'content_strategy',
            progress: 35,
            message: '✍️ Content Strategy Agent starting...'
          });
          
          await this.runAgentStageWithProgress(strategyAgent, 'Content Strategy', progressObserver, 65);

          // Stage 3: Final Synthesis Agent
          const synthesisAgent = new SynthesisAgent(this.context!);
          progressObserver.next({
            stage: 'html_synthesis',
            progress: 70,
            message: '🎨 HTML Synthesis Agent starting...'
          });
          
          const finalResult = await this.runAgentStageWithProgress(synthesisAgent, 'Final Synthesis', progressObserver, 100);

          progressObserver.next({
            stage: 'completed',
            progress: 100,
            message: '✨ Multi-Agent Generation Complete!'
          });

          // Emit the final result
          progressObserver.next({
            type: 'result',
            data: finalResult
          });

          progressObserver.complete();
          return finalResult;

        } catch (error) {
          progressObserver.next({
            stage: 'error',
            progress: 0,
            message: `❌ Error: ${(error as Error).message}`
          });
          progressObserver.error(error);
        }
      };

      runWithProgress();
    });
  }

  private async runAgentStageWithProgress(
    agent: AbstractAgent, 
    stageName: string, 
    progressObserver: any,
    completionProgress: number
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const subscription = agent.runAgent({
        tools: [],
        context: []
      }).subscribe({
        next: (event) => {
          
          // Emit agent events as progress updates
          switch (event.type) {
            case EventType.RUN_STARTED:
              progressObserver.next({
                stage: stageName.toLowerCase().replace(' ', '_'),
                progress: completionProgress - 20,
                message: `🔄 ${stageName} Agent working...`,
                agentEvent: event
              });
              break;
            case EventType.STEP_STARTED:
              progressObserver.next({
                stage: stageName.toLowerCase().replace(' ', '_'),
                progress: completionProgress - 15,
                message: `⚡ ${stageName} Agent processing...`,
                agentEvent: event
              });
              break;
            case EventType.TEXT_MESSAGE_CONTENT:
              progressObserver.next({
                stage: stageName.toLowerCase().replace(' ', '_'),
                progress: completionProgress - 10,
                message: `💭 ${stageName} Agent thinking...`,
                agentEvent: event
              });
              break;
            case EventType.STATE_DELTA:
              if ((event as any).delta) {
                const delta = (event as any).delta[0];
                if (delta.path === '/businessAnalysis') {
                  this.context!.agentOutputs.businessAnalysis = delta.value;
                  progressObserver.next({
                    stage: 'business_analysis',
                    progress: completionProgress,
                    message: '✅ Business Analysis Complete!'
                  });
                  resolve(delta.value); // Resolve to continue to next agent
                } else if (delta.path === '/contentStrategy') {
                  this.context!.agentOutputs.contentStrategy = delta.value;
                  progressObserver.next({
                    stage: 'content_strategy',
                    progress: completionProgress,
                    message: '✅ Content Strategy Complete!'
                  });
                  resolve(delta.value); // Resolve to continue to next agent
                } else if (delta.path === '/finalContent') {
                  progressObserver.next({
                    stage: 'html_synthesis',
                    progress: completionProgress,
                    message: '✅ HTML Generation Complete!'
                  });
                  resolve(delta.value); // Final result
                }
              }
              break;
            case EventType.RUN_ERROR:
              reject(new Error((event as any).message));
              break;
          }
        },
        error: (error) => {
          reject(error);
        },
        complete: () => {
          subscription.unsubscribe();
        }
      });
    });
  }

  private async runAgentStage(agent: AbstractAgent, _stageName: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const subscription = agent.runAgent({
        tools: [],
        context: []
      }).subscribe({
        next: (event) => {
          
          switch (event.type) {
            case EventType.STATE_DELTA:
              if ((event as any).delta) {
                const delta = (event as any).delta[0];
                if (delta.path === '/businessAnalysis') {
                  this.context!.agentOutputs.businessAnalysis = delta.value;
                } else if (delta.path === '/contentStrategy') {
                  this.context!.agentOutputs.contentStrategy = delta.value;
                } else if (delta.path === '/finalContent') {
                  resolve(delta.value);
                }
              }
              break;
            case EventType.RUN_ERROR:
              reject(new Error((event as any).message));
              break;
          }
        },
        error: (error) => {
          reject(error);
        },
        complete: () => {
          subscription.unsubscribe();
        }
      });
    });
  }

  getAgentCapabilities() {
    return {
      agents: [
        {
          id: AgentType.BUSINESS_ANALYST,
          name: 'Business Analysis Agent',
          description: 'Analyzes market positioning and customer psychology'
        },
        {
          id: AgentType.CONTENT_STRATEGIST,
          name: 'Content Strategy Agent',
          description: 'Creates compelling content and messaging'
        },
        {
          id: AgentType.SYNTHESIS_AGENT,
          name: 'Synthesis Agent',
          description: 'Combines all insights into final content'
        }
      ],
      features: [
        'Business context analysis',
        'Content strategy generation',
        'Multi-agent synthesis',
        'Unique content creation'
      ],
      limitations: [
        'Requires OpenAI API key',
        'Content focused (no design constraints)'
      ]
    };
  }
}

export const agenticsService = new AgenticsService();

// Export for direct use in hooks
export const generateWithAgents = (request: ContentGenerationRequest): Promise<GeneratedContent> => {
  return agenticsService.generateLandingPageWithAgents(request);
};
