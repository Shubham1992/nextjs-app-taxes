import { Anthropic } from '@anthropic-ai/sdk';
import { Message } from 'ai';
import { StreamingTextResponse, experimental_StreamData } from 'ai';

interface ContentBlock {
  type: 'text' | 'image' | 'document';
  text?: string;
  source?: {
    type: 'base64';
    media_type: string;
    data: string;
  };
}

type CustomMessage = Omit<Message, 'content'> & {
  content: string | ContentBlock[];
};

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const systemMessage = `You are a helpful tax assistant specializing in Indian taxation. You help users understand their tax documents, calculate taxes, and provide guidance on tax-related matters. You can analyze tax documents like Form 16, ITR forms, and other financial documents. Always be clear and precise in your explanations.`;

  // Convert messages to Anthropic's format
  const formattedMessages = messages.map((msg: CustomMessage) => {
    if (typeof msg.content === 'string') {
      return {
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      };
    }
    
    // Handle array content (for files)
    return {
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    };
  });

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    system: systemMessage,
    messages: formattedMessages,
    stream: true
  });

  // Convert the response into a friendly stream
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of response) {
        if (chunk.type === 'content_block_delta' && 'text' in chunk.delta) {
          controller.enqueue(chunk.delta.text);
        }
      }
      controller.close();
    },
  });

  const data_store = new experimental_StreamData();
  
  return new StreamingTextResponse(stream, {
    headers: {
      'X-Data': JSON.stringify(data_store),
    },
  });
} 