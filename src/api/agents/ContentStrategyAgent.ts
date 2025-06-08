import type { AgentContext, AgentResponse, BaseEvent } from '@/types/agents';
import { AgentType } from '@/types/agents';
import OpenAI from 'openai';
import { Observable } from 'rxjs';
import { BaseAgent } from './BaseAgent';

export class ContentStrategyAgent extends BaseAgent {
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
    return new Observable<BaseEvent>(observer => {
      observer.next(this.emitRunStarted(input.threadId, input.runId));
      observer.next(this.emitStepStarted('content_strategy'));
      this.generateContentStrategy()
        .then(result => {
          const msgs = this.emitTextMessage(
            `📝 Content Strategy Complete\nHeadline: ${result.output.headline}\nValue Props: ${result.output.valuePropositions?.slice(0, 2).join(', ')}\nConfidence: ${result.confidence}%`
          );
          msgs.forEach(m => observer.next(m));
          observer.next(this.emitStateDelta('/contentStrategy', result));
          observer.next(this.emitStepFinished('content_strategy'));
          observer.next(this.emitRunFinished(input.threadId, input.runId));
          observer.complete();
        })
        .catch(err => {
          observer.next(this.emitError(err.message));
          observer.error(err);
        });
    });
  }

  private async generateContentStrategy(): Promise<AgentResponse> {
    const businessAnalysis = this.context.agentOutputs.businessAnalysis?.output || {};
    const prompt = this.buildPrompt(businessAnalysis);

    const initial = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `
You are a content strategist. Craft a compelling content strategy step by step, referencing business analysis data.
Think step by step, outline your reasoning, then output JSON:
{
  "headline": "...",
  "subheadline": "...",
  "valuePropositions": ["..."],
  "services": [{"name":"","description":"","features":[""]}],
  "callToAction": {"primary":{"text":"","action":""},"secondary":{"text":"","action":""}},
  "aboutSection": "...",
  "confidence": X,
  "reasoning": "..."
}`
        },
        ...this.getFewShotExamples(),
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 2000
    });

    const resp = this.parseResponse(initial.choices[0]?.message?.content || '');

    const critique = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert reviewer.' },
        { role: 'user', content: `Review and refine this content strategy JSON. Remove anything generic and enhance business/location specificity.\nJSON: ${JSON.stringify(resp.output, null, 2)}` }
      ],
      temperature: 0.6,
      max_tokens: 1200
    });

    const improved = this.parseResponse(critique.choices[0]?.message?.content || '');
    return { ...improved, success: true };
  }

  private buildPrompt(analysis: any): string {
    return `
Business: ${this.context.businessData.name} (${this.context.businessData.type})
Location: ${this.context.businessData.address}

Based on this business analysis:
${JSON.stringify(analysis, null, 2)}

Craft a unique content strategy for a landing page. Think step-by-step, then return JSON as specified.`;
  }

  private getFewShotExamples(): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    const ex1 = `
Example:
Business: "Corner Café"
Analysis: { targetMarket: "tourists and remote workers", competitiveEdge: "local sourcing" }
Reasoning:
1. Identify core audience: tourists need convenience, remote workers need atmosphere
2. Frame unique services: local sourcing + wifi/workspace
Final JSON:
{
  "headline": "Your Local Coffee Haven",
  "subheadline": "Locally sourced coffee in the heart of downtown",
  "valuePropositions": ["Premium local beans", "Tourist-friendly location", "Remote work atmosphere"],
  "confidence": 85
}`;

    const ex2 = `
Example:
Business: "QuickFix Plumbing"
Analysis: { targetMarket: "suburban homeowners", competitiveEdge: "24/7 emergency service" }
Reasoning:
1. Local trust focus: homeowners value reliability
2. Highlight 24/7 availability: emergency situations create urgency
Final JSON:
{
  "headline": "24/7 Emergency Plumbing You Can Trust",
  "subheadline": "Fast, reliable service when you need it most",
  "valuePropositions": ["Emergency availability", "Local expertise", "Trustworthy service"],
  "confidence": 80
}`;

    return [
      { role: 'assistant' as const, content: ex1 },
      { role: 'assistant' as const, content: ex2 }
    ];
  }

  private parseResponse(content: string): AgentResponse {
    try {
      const m = content.match(/\{[\s\S]*\}/);
      if (!m) throw new Error('No JSON');
      const out = JSON.parse(m[0]);
      return { success: true, output: out, confidence: out.confidence || 70, reasoning: out.reasoning || '' };
    } catch {
      return this.createFallback();
    }
  }

  private createFallback(): AgentResponse {
    const bd = this.context.businessData;
    return {
      success: false,
      output: {
        headline: `Welcome to ${bd.name}`,
        subheadline: `Expert ${bd.type} services in ${bd.address}`,
        valuePropositions: ['Reliable service','Local expertise','Customer-first approach'],
        confidence: 50
      },
      confidence: 50,
      reasoning: 'Fallback due to parse error'
    };
  }
}
