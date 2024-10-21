import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

type ChatCompletionMessageParam = {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
};

export async function getGroqChatCompletion(messages: ChatCompletionMessageParam[]) {
  return groq.chat.completions.create({
    messages,
    model: "llama3-8b-8192",
  });
}