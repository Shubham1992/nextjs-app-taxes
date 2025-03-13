import { Message } from 'ai';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

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
    <h1 className="text-2xl font-bold mb-4 text-gray-800" dangerouslySetInnerHTML={{ 
      __html: typeof children === 'string' ? formatTextWithNumbers(children) : String(children) 
    }} />
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-semibold mb-3 text-gray-800" dangerouslySetInnerHTML={{ 
      __html: typeof children === 'string' ? formatTextWithNumbers(children) : String(children) 
    }} />
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-medium mb-2 text-gray-800" dangerouslySetInnerHTML={{ 
      __html: typeof children === 'string' ? formatTextWithNumbers(children) : String(children) 
    }} />
  ),
  p: ({ children }) => (
    <p className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ 
      __html: typeof children === 'string' ? formatTextWithNumbers(children) : String(children) 
    }} />
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="ml-4" dangerouslySetInnerHTML={{ 
      __html: typeof children === 'string' ? formatTextWithNumbers(children) : String(children) 
    }} />
  ),
  code: ({ className, children }) => {
    const isInline = !className?.includes('language-');
    return (
      <code
        className={cn(
          "px-1.5 py-0.5 rounded font-mono text-sm",
          isInline ? "bg-gray-100" : "block bg-gray-50 p-4 my-4"
        )}
      >
        {children}
      </code>
    );
  },
  table: ({ children }) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full divide-y divide-gray-200">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="px-4 py-2 bg-gray-50 text-left text-sm font-semibold text-gray-700" dangerouslySetInnerHTML={{ 
      __html: typeof children === 'string' ? formatTextWithNumbers(children) : String(children) 
    }} />
  ),
  td: ({ children }) => (
    <td className="px-4 py-2 text-sm text-gray-700 border-t" dangerouslySetInnerHTML={{ 
      __html: typeof children === 'string' ? formatTextWithNumbers(children) : String(children) 
    }} />
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-blue-200 pl-4 my-4 italic text-gray-700" dangerouslySetInnerHTML={{ 
      __html: typeof children === 'string' ? formatTextWithNumbers(children) : String(children) 
    }} />
  ),
  hr: () => <hr className="my-6 border-gray-200" />,
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
    <div
      className={cn(
        'flex w-full items-start gap-4 rounded-lg px-4 py-3',
        isUser ? 'bg-blue-50' : 'bg-gray-50'
      )}
    >
      <div
        className={cn(
          'rounded-full p-2 text-sm font-medium flex items-center justify-center h-8 w-8',
          isUser ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-800'
        )}
      >
        {isUser ? 'You' : 'AI'}
      </div>
      <div className="flex-1 space-y-2 overflow-x-auto">
        {renderContent(message.content as MessageContent)}
      </div>
    </div>
  );
} 