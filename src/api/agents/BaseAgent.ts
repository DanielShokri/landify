import { BaseEvent, EventType, IAgent } from '@/types/agents';
import { Observable } from 'rxjs';

export abstract class BaseAgent implements IAgent {
  public readonly agentId: string;
  public readonly description: string;

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

  // Helper methods for common event patterns
  protected emitRunStarted(threadId?: string, runId?: string): BaseEvent {
    return {
      type: EventType.RUN_STARTED,
      ...(threadId && { threadId }),
      ...(runId && { runId })
    };
  }

  protected emitRunFinished(threadId?: string, runId?: string): BaseEvent {
    return {
      type: EventType.RUN_FINISHED,
      ...(threadId && { threadId }),
      ...(runId && { runId })
    };
  }

  protected emitStepStarted(stepName: string): BaseEvent {
    return {
      type: EventType.STEP_STARTED,
      stepName
    };
  }

  protected emitStepFinished(stepName: string): BaseEvent {
    return {
      type: EventType.STEP_FINISHED,
      stepName
    };
  }

  protected emitTextMessage(content: string): BaseEvent[] {
    const messageId = Date.now().toString();
    return [
      {
        type: EventType.TEXT_MESSAGE_START,
        messageId
      },
      {
        type: EventType.TEXT_MESSAGE_CONTENT,
        messageId,
        delta: content
      },
      {
        type: EventType.TEXT_MESSAGE_END,
        messageId
      }
    ];
  }

  protected emitStateDelta(path: string, value: any): BaseEvent {
    return {
      type: EventType.STATE_DELTA,
      delta: [{ op: 'add', path, value }]
    };
  }

  protected emitError(message: string): BaseEvent {
    return {
      type: EventType.RUN_ERROR,
      message
    };
  }
} 