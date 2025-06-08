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
  } = {}
) => {
  const {
    model = 'gpt-4o-mini',
    temperature = 0.7,
    max_tokens = 2000
  } = options;

  return await openai.chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens
  });
}; 