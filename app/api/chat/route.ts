import { Anthropic } from '@anthropic-ai/sdk';
import { Message, StreamingTextResponse } from 'ai';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const systemMessage = {
    role: 'system',
    content: "You are a knowledgeable tax assistant specializing in Indian taxation. You help users understand their tax obligations, calculate taxes, and provide guidance on tax-related documents. When analyzing documents, provide clear explanations and actionable insights."
  };

  // Extract file data if present in the last message
  const lastMessage = messages[messages.length - 1];
  let fileData = null;
  
  try {
    const content = JSON.parse(lastMessage.content);
    if (Array.isArray(content)) {
      const fileBlock = content.find(block => block.type === 'document' || block.type === 'image');
      if (fileBlock?.source?.data) {
        fileData = {
          type: fileBlock.source.media_type,
          data: fileBlock.source.data
        };
      }
    }
  } catch {
    // Not JSON content, continue with text-only message
  }

  // Filter out previous messages containing file data
  const previousMessages = messages.slice(0, -1).map((msg: Message) => {
    try {
      const content = JSON.parse(msg.content);
      if (Array.isArray(content)) {
        // If it's a file upload message, only keep the text part
        const textBlock = content.find(block => block.type === 'text');
        return {
          role: msg.role,
          content: textBlock?.text || msg.content
        };
      }
    } catch {
      // Not JSON content, keep as is
    }
    return msg;
  });

  const response = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 4096,
    temperature: 0.7,
    system: systemMessage.content,
    messages: [
      ...previousMessages,
      {
        role: lastMessage.role,
        content: fileData ? [
          { type: "text", text: lastMessage.content },
          {
            type: fileData.type.startsWith('image/') ? "image" : "document",
            source: {
              type: "base64",
              media_type: fileData.type,
              data: fileData.data
            }
          }
        ] : lastMessage.content
      }
    ],
    stream: true
  });

  // Convert the response into a streaming response
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of response) {
        if (chunk.type === 'content_block_delta' && 'text' in chunk.delta) {
          controller.enqueue(chunk.delta.text);
        }
      }
      controller.close();
    }
  });

  return new StreamingTextResponse(stream);
} 