import type { AgentContext, AgentResponse, BaseEvent } from '@/types/agents';
import { AgentType } from '@/types/agents';
import OpenAI from 'openai';
import { Observable } from 'rxjs';
import { BaseAgent } from './BaseAgent';

export class BusinessAnalysisAgent extends BaseAgent {
  private openai: OpenAI;
  private context: AgentContext;

  constructor(context: AgentContext) {
    super({
      agentId: AgentType.BUSINESS_ANALYST,
      description: 'Analyzes business context, positioning, and customer insights'
    });
    this.context = context;
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
      dangerouslyAllowBrowser: true
    });
  }

  run(input: { threadId?: string; runId?: string }): Observable<BaseEvent> {
    return new Observable<BaseEvent>(observer => {
      observer.next(this.emitRunStarted(input.threadId, input.runId));
      observer.next(this.emitStepStarted('business_analysis'));
      this.analyzeBusinessContext()
        .then(analysis => {
          const msgs = this.emitTextMessage(
            `✅ Analysis Complete\nMarket: ${analysis.output.targetMarket}\nEdge: ${analysis.output.competitiveEdge}\nConfidence: ${analysis.confidence}%`
          );
          msgs.forEach(m => observer.next(m));
          observer.next(this.emitStateDelta('/businessAnalysis', analysis));
          observer.next(this.emitStepFinished('business_analysis'));
          observer.next(this.emitRunFinished(input.threadId, input.runId));
          observer.complete();
        })
        .catch(err => {
          observer.next(this.emitError(err.message));
          observer.error(err);
        });
    });
  }

  private async analyzeBusinessContext(): Promise<AgentResponse> {
    const prompt = this.buildPrompt();
    const first = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `
You are a business analyst. Analyze the business context, target market, competitors, and unique positioning.
IMPORTANT: Respond ONLY in English language. All content must be in English.
Think step by step and at each step note your reasoning before summarizing.
Respond in JSON according to this schema exactly:
{
  "targetMarket": "...",
  "competitiveEdge": "...",
  "valueDrivers": ["..."],
  "customerPainPoints": ["..."],
  "conversionTriggers": ["..."],
  "localAdvantages": ["..."],
  "brandPersonality": "...",
  "emotionalTriggers": "...",
  "contentImplications": "...",
  "confidence": X,
  "reasoning": "..."
}`
        },
        ...this.getFewShotExamples(),
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const resp = this.parseResponse(first.choices[0]?.message?.content || '');

    // self-critique pass
    const critique = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert reviewer. Respond ONLY in English language.' },
        { role: 'user', content: `Review this JSON and refine any generic parts to be more specific to this business/location.\nJSON: ${JSON.stringify(resp.output, null,2)}` }
      ],
      temperature: 0.5,
      max_tokens: 1000
    });

    const improved = this.parseResponse(critique.choices[0]?.message?.content || '');
    return { ...improved, success: true };
  }

  private buildPrompt(): string {
    return `
Business data: ${JSON.stringify(this.context.businessData, null,2)}
User needs: ${JSON.stringify(this.context.userRequirements, null,2)}

Please analyze this business in its market context. Use step-by-step reasoning, then output JSON.`;
  }

  private getFewShotExamples(): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    const ex1 = `
 Example:
 Business: "Corner Café" at downtown city center. Data: small café, local coffee roasters, tourist foot traffic.
 Step-by-step reasoning:
 1. Analyze location demographics...
 2. Identify competitors like Chain X...
 ... 
 Final JSON:
 {
   "targetMarket": "tourists and remote workers",
   "competitiveEdge": "local sourcing and prime location",
   "confidence": 80,
   "reasoning": "Downtown location attracts both tourists and remote workers"
 }`;
    const ex2 = `
 Example:
 Business: "QuickFix Plumbing" suburban area. Reasoning steps...
 Final JSON:
 { 
   "targetMarket": "homeowners in suburban areas",
   "competitiveEdge": "24/7 emergency service",
   "confidence": 85,
   "reasoning": "Suburban homeowners need reliable emergency plumbing"
 }`;
    return [
      { role: 'assistant' as const, content: ex1 },
      { role: 'assistant' as const, content: ex2 }
    ];
  }

  private parseResponse(content: string): AgentResponse {
    try {
      const match = content.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('No JSON');
      const output = JSON.parse(match[0]);
      return { success: true, output, confidence: output.confidence || 70, reasoning: output.reasoning || '' };
    } catch {
      return this.createFallbackAnalysis();
    }
  }

  private createFallbackAnalysis(): AgentResponse {
    const { businessData } = this.context;
    return {
      success: false,
      output: {
        targetMarket: `Customers of ${businessData.type}`,
        competitiveEdge: 'Reliable service',
        confidence: 50
      },
      confidence: 50,
      reasoning: 'Fallback analysis'
    };
  }
}
