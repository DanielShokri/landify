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
    const prompt = `
    You are the HTML Generation Synthesis Agent. Create a complete, beautiful landing page using the specialist agent outputs.
    
    All Agent Outputs: ${JSON.stringify(this.context.agentOutputs, null, 2)}
    Business Data: ${JSON.stringify(this.context.businessData, null, 2)}
    User Requirements: ${JSON.stringify(this.context.userRequirements, null, 2)}
    
    CRITICAL: Generate a COMPLETE HTML document with TailwindCSS. You have TOTAL CREATIVE FREEDOM - no templates, no constraints.
    
    Create a stunning, modern, responsive landing page with:
    - Beautiful color schemes and typography
    - Professional spacing and layout
    - Smooth animations and hover effects
    - Mobile-first responsive design
    - Modern UI patterns (hero sections, cards, gradients, etc.)
    - Creative layouts that match the business personality
    
    Business Context:
    - Business: ${this.context.businessData.name}
    - Type: ${this.context.businessData.type}
    - Location: ${this.context.businessData.address}
    - Rating: ${this.context.businessData.rating || 'New'}/5
    - Phone: ${this.context.businessData.phone}
    
    Generate in this JSON format:
    {
      "htmlDocument": "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'><title>${this.context.businessData.name}</title><script src='https://cdn.tailwindcss.com'></script><script>tailwind.config = { theme: { extend: { colors: { primary: 'YOUR_CHOSEN_COLOR', secondary: 'YOUR_CHOSEN_COLOR' } } } }</script></head><body class='YOUR_DESIGN'>YOUR_COMPLETE_HTML_CONTENT</body></html>",
      "headline": "Extracted headline from HTML",
      "subheadline": "Extracted subheadline from HTML",
      "valuePropositions": ["Value props from content strategy"],
      "services": [{"name": "Service", "description": "Description", "features": ["Features"]}],
      "callToAction": {"primary": {"text": "CTA", "action": "contact"}},
      "aboutSection": "About section content",
      "contactInfo": {
        "phone": "${this.context.businessData.phone}",
        "address": "${this.context.businessData.address}",
        "email": "${this.context.businessData.email || ''}",
        "website": "${this.context.businessData.website || ''}"
      }
    }
    
    HTML REQUIREMENTS:
    1. Use TailwindCSS extensively for beautiful styling
    2. Create unique, creative layouts - no boring templates
    3. Include proper mobile responsiveness (sm:, md:, lg: classes)
    4. Use modern design elements: gradients, shadows, animations
    5. Make it conversion-focused with clear CTAs
    6. Include all business information naturally in the design
    7. Use beautiful color schemes that match the business type
    8. Add hover effects and smooth transitions
    9. Create visual hierarchy with typography and spacing
    10. Make it production-ready and visually stunning
    
    DESIGN INSPIRATION:
    - Modern SaaS landing pages
    - Professional service websites  
    - Beautiful restaurant/retail sites
    - Creative portfolio layouts
    
    Be CREATIVE and UNIQUE. Every business should get a completely different design!
    `;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert web designer who creates stunning, modern landing pages with TailwindCSS. You have complete creative freedom to design beautiful, unique layouts. Every design must be production-ready and visually exceptional.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8, // High creativity for unique designs
      max_tokens: 4000 // More tokens for complete HTML
    });

    const synthesisResult = this.parseResponse(completion.choices[0]?.message?.content || '');
    return this.transformToGeneratedContent(synthesisResult.output);
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
