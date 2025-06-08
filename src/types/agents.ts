import { Observable } from 'rxjs';
import { BusinessData } from './business';
import { ContentGenerationRequest } from './content';

// Core Agent Types
export enum AgentType {
  BUSINESS_ANALYST = 'business_analyst',
  CONTENT_STRATEGIST = 'content_strategist',
  SYNTHESIS_AGENT = 'synthesis_agent'
}

// Agent Context Management
export interface AgentContext {
  businessData: BusinessData;
  userRequirements: ContentGenerationRequest;
  agentOutputs: Record<string, any>;
  iterationCount: number;
  maxIterations: number;
  confidence: number;
}

export interface AgentResponse {
  success: boolean;
  output: any;
  confidence: number;
  feedback?: string;
  requiresIteration?: boolean;
  reasoning?: string;
}

// Event System for AG-UI protocol
export enum EventType {
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

export interface BaseEvent {
  type: EventType;
  threadId?: string;
  runId?: string;
  stepName?: string;
  messageId?: string;
  delta?: any;
  message?: string;
}

// Progress Events
export interface ProgressEvent {
  stage: string;
  progress: number;
  message: string;
  agentEvent?: BaseEvent;
}

// Abstract Agent Interface
export interface IAgent {
  agentId: string;
  description: string;
  run(input: { threadId?: string; runId?: string }): Observable<BaseEvent>;
  runAgent(params?: any): Observable<BaseEvent>;
} 