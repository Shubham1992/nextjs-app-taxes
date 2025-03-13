import { Message } from 'ai';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import { GeistMono } from 'geist/font/mono';
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";

interface ContentBlock {
  type: 'text' | 'image' | 'document';
  text?: string;
  source?: {
    type: 'base64';
    media_type: string;
    data: string;
  };
}

type MessageContent = string | ContentBlock[];

// Function to wrap numbers in a medium font weight span
const formatTextWithNumbers = (text: string) => {
  return text.replace(/(\d+(?:\.\d+)?)/g, '<span class="font-medium">$1</span>');
};

const MarkdownComponents: Partial<Components> = {
  h1: ({ children }) => (
    <h1 className="scroll-m-20 text-2xl font-bold tracking-tight mb-4" dangerouslySetInnerHTML={{ 
      __html: typeof children === 'string' ? formatTextWithNumbers(children) : String(children) 
    }} />
  ),
  h2: ({ children }) => (
    <h2 className="scroll-m-20 text-xl font-semibold tracking-tight mb-3" dangerouslySetInnerHTML={{ 
      __html: typeof children === 'string' ? formatTextWithNumbers(children) : String(children) 
    }} />
  ),
  h3: ({ children }) => (
    <h3 className="scroll-m-20 text-lg font-medium tracking-tight mb-2" dangerouslySetInnerHTML={{ 
      __html: typeof children === 'string' ? formatTextWithNumbers(children) : String(children) 
    }} />
  ),
  p: ({ children }) => (
    <p className="leading-7 mb-4" dangerouslySetInnerHTML={{ 
      __html: typeof children === 'string' ? formatTextWithNumbers(children) : String(children) 
    }} />
  ),
  ul: ({ children }) => (
    <ul className="my-6 ml-6 list-disc space-y-2">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-6 ml-6 list-decimal space-y-2">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="mt-2" dangerouslySetInnerHTML={{ 
      __html: typeof children === 'string' ? formatTextWithNumbers(children) : String(children) 
    }} />
  ),
  code: ({ className, children }) => {
    const isInline = !className?.includes('language-');
    return (
      <code
        className={cn(
          GeistMono.className,
          "relative rounded text-sm",
          isInline 
            ? "bg-muted px-[0.3rem] py-[0.2rem]" 
            : "block bg-muted px-4 py-3 my-4"
        )}
      >
        {children}
      </code>
    );
  },
  table: ({ children }) => (
    <div className="my-6 w-full overflow-y-auto">
      <table className="w-full">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border px-4 py-2 text-left font-bold" dangerouslySetInnerHTML={{ 
      __html: typeof children === 'string' ? formatTextWithNumbers(children) : String(children) 
    }} />
  ),
  td: ({ children }) => (
    <td className="border px-4 py-2" dangerouslySetInnerHTML={{ 
      __html: typeof children === 'string' ? formatTextWithNumbers(children) : String(children) 
    }} />
  ),
  blockquote: ({ children }) => (
    <blockquote className="mt-6 border-l-2 pl-6 italic" dangerouslySetInnerHTML={{ 
      __html: typeof children === 'string' ? formatTextWithNumbers(children) : String(children) 
    }} />
  ),
  hr: () => <hr className="my-4 md:my-8" />,
};

export default function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  // Function to render content based on its type
  const renderContent = (content: MessageContent) => {
    if (typeof content === 'string') {
      return (
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={MarkdownComponents}
          >
            {content}
          </ReactMarkdown>
        </div>
      );
    }

    if (Array.isArray(content)) {
      // For array content, render only the text parts
      return (
        <div className="prose prose-sm max-w-none">
          {content
            .filter((block: ContentBlock) => block.type === 'text')
            .map((block: ContentBlock, index: number) => (
              <div key={index}>
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={MarkdownComponents}
                >
                  {block.text || ''}
                </ReactMarkdown>
              </div>
            ))}
        </div>
      );
    }

    return null;
  };

  return (
    <Card className={cn(
      'flex w-full items-start gap-4 p-4',
      isUser ? 'bg-muted/50' : 'bg-background'
    )}>
      <Avatar className={cn(
        'h-8 w-8',
        isUser ? 'bg-primary' : 'bg-muted'
      )}>
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </Avatar>
      <div className="flex-1 space-y-2 overflow-hidden">
        {renderContent(message.content as MessageContent)}
      </div>
    </Card>
  );
} 