import type { AgentContext, ProgressEvent } from '@/types/agents';
import { EventType } from '@/types/agents';
import type { ContentGenerationRequest, GeneratedContent } from '@/types/content';
import { Observable } from 'rxjs';
import { BusinessAnalysisAgent } from './agents/BusinessAnalysisAgent';
import { ContentStrategyAgent } from './agents/ContentStrategyAgent';
import { SynthesisAgent } from './agents/SynthesisAgent';

/**
 * Multi-Agent Content Generation Service
 * 
 * Orchestrates specialized agents to generate landing page content:
 * 1. BusinessAnalysisAgent - Analyzes market positioning and customer psychology
 * 2. ContentStrategyAgent - Creates content strategy and messaging
 * 3. SynthesisAgent - Combines outputs into final HTML and structured content
 */
class AgenticsService {
  private context: AgentContext | null = null;

  /**
   * Generate landing page content using multi-agent approach
   */
  async generateLandingPageWithAgents(request: ContentGenerationRequest): Promise<GeneratedContent> {
    this.initializeContext(request);

    try {
      // Stage 1: Business Analysis
      await this.runAgent(new BusinessAnalysisAgent(this.context!), 'businessAnalysis');
      
      // Stage 2: Content Strategy
      await this.runAgent(new ContentStrategyAgent(this.context!), 'contentStrategy');
      
      // Stage 3: Final Synthesis
      const finalResult = await this.runAgent(new SynthesisAgent(this.context!), 'finalContent');
      
      return finalResult;
    } catch (error) {
      console.error('Multi-agent generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate with real-time progress updates
   */
  generateWithProgress(request: ContentGenerationRequest): Observable<ProgressEvent | { type: 'result'; data: GeneratedContent }> {
    return new Observable<ProgressEvent | { type: 'result'; data: GeneratedContent }>((observer) => {
      this.initializeContext(request);

      const runSequence = async () => {
        try {
          // Emit start
          observer.next({
            stage: 'starting',
            progress: 0,
            message: '🤖 Initializing Multi-Agent System...'
          });

          // Stage 1: Business Analysis (0-33%)
          observer.next({
            stage: 'business_analysis',
            progress: 10,
            message: '🔍 Business Analysis Agent starting...'
          });
          
          await this.runAgentWithProgress(
            new BusinessAnalysisAgent(this.context!), 
            'businessAnalysis',
            observer,
            33
          );

          // Stage 2: Content Strategy (33-66%)
          observer.next({
            stage: 'content_strategy',
            progress: 35,
            message: '✍️ Content Strategy Agent starting...'
          });
          
          await this.runAgentWithProgress(
            new ContentStrategyAgent(this.context!),
            'contentStrategy', 
            observer,
            66
          );

          // Stage 3: Synthesis (66-100%)
          observer.next({
            stage: 'synthesis',
            progress: 70,
            message: '🎨 Synthesis Agent creating final content...'
          });
          
          const finalResult = await this.runAgentWithProgress(
            new SynthesisAgent(this.context!),
            'finalContent',
            observer,
            100
          );

          observer.next({
            stage: 'completed',
            progress: 100,
            message: '✨ Multi-Agent Generation Complete!'
          });

          // Emit final result
          observer.next({
            type: 'result',
            data: finalResult
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
   * Get available agent capabilities
   */
  getAgentCapabilities() {
    return {
      agents: [
        {
          id: 'business_analyst',
          name: 'Business Analysis Agent',
          description: 'Analyzes market positioning and customer psychology'
        },
        {
          id: 'content_strategist',
          name: 'Content Strategy Agent',
          description: 'Creates compelling content and messaging'
        },
        {
          id: 'synthesis_agent',
          name: 'Synthesis Agent',
          description: 'Combines all insights into final content'
        }
      ],
      features: [
        'Business context analysis',
        'Content strategy generation',
        'Multi-agent synthesis',
        'Premium HTML generation'
      ],
      limitations: [
        'Requires OpenAI API key',
        'Internet connection required'
      ]
    };
  }

  // Private helper methods
  private initializeContext(request: ContentGenerationRequest): void {
    this.context = {
      businessData: request.businessData,
      userRequirements: request,
      agentOutputs: {},
      iterationCount: 0,
      maxIterations: 3,
      confidence: 0
    };
  }

  private async runAgent(agent: any, outputKey: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const subscription = agent.runAgent().subscribe({
        next: (event: any) => {
          if (event.type === EventType.STATE_DELTA && event.delta) {
            const delta = event.delta[0];
            const pathKey = delta.path.replace('/', '');
            
            if (pathKey === outputKey) {
              this.context!.agentOutputs[outputKey] = delta.value;
              resolve(delta.value);
            }
          } else if (event.type === EventType.RUN_ERROR) {
            reject(new Error(event.message));
          }
        },
        error: (error: any) => reject(error),
        complete: () => subscription.unsubscribe()
      });
    });
  }

  private async runAgentWithProgress(
    agent: any,
    outputKey: string,
    observer: any,
    completionProgress: number
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const subscription = agent.runAgent().subscribe({
        next: (event: any) => {
          // Forward agent events as progress updates
          if (event.type === EventType.TEXT_MESSAGE_CONTENT) {
            observer.next({
              stage: outputKey,
              progress: completionProgress - 5,
              message: '💭 Processing...',
              agentEvent: event
            });
          } else if (event.type === EventType.STATE_DELTA && event.delta) {
            const delta = event.delta[0];
            const pathKey = delta.path.replace('/', '');
            
            if (pathKey === outputKey) {
              this.context!.agentOutputs[outputKey] = delta.value;
              observer.next({
                stage: outputKey,
                progress: completionProgress,
                message: `✅ ${outputKey.charAt(0).toUpperCase() + outputKey.slice(1)} Complete!`
              });
              resolve(delta.value);
            }
          } else if (event.type === EventType.RUN_ERROR) {
            reject(new Error(event.message));
          }
        },
        error: (error: any) => reject(error),
        complete: () => subscription.unsubscribe()
      });
    });
  }
}

// Export singleton instance
export const agenticsService = new AgenticsService();

// Export for direct use in hooks
export const generateWithAgents = (request: ContentGenerationRequest): Promise<GeneratedContent> => {
  return agenticsService.generateLandingPageWithAgents(request);
};
