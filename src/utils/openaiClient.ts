import OpenAI from 'openai';

// OpenAI client wrapper
export const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true
});

// Helper function for common completions
export const createCompletion = async (
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  options: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    enforceEnglish?: boolean;
  } = {}
) => {
  const {
    model = 'gpt-4o-mini',
    temperature = 0.7,
    max_tokens = 2000,
    enforceEnglish = true
  } = options;

  // Add English language enforcement to system message if enabled
  const enhancedMessages = enforceEnglish ? [
    {
      role: 'system' as const,
      content: 'IMPORTANT: Respond ONLY in English language. All content must be in English.'
    },
    ...messages
  ] : messages;

  return await openai.chat.completions.create({
    model,
    messages: enhancedMessages,
    temperature,
    max_tokens
  });
}; 