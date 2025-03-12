import { Message } from 'ai';
import { cn } from '@/lib/utils';

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

export default function ChatMessage({ message }: { message: CustomMessage }) {
  const isUser = message.role === 'user';

  // Function to format text with enhanced typography
  const formatText = (text: string) => {
    // Split text into segments while preserving whitespace
    return text.split(/(\s+|\d+(?:,\d+)*(?:\.\d+)?|\n)/).map((segment, index) => {
      // Check if segment is a number (including decimals and thousands separators)
      if (/^\d+(?:,\d+)*(?:\.\d+)?$/.test(segment)) {
        return (
          <span key={index} className="font-medium text-gray-900">
            {segment}
          </span>
        );
      }
      // Handle newlines
      if (segment === '\n') {
        return <br key={index} />;
      }
      // Handle whitespace
      if (/^\s+$/.test(segment)) {
        return <span key={index}>{segment}</span>;
      }
      // Check for percentage patterns
      if (/^\d+(?:\.\d+)?%$/.test(segment)) {
        return (
          <span key={index} className="font-medium text-gray-900">
            {segment}
          </span>
        );
      }
      // Check for currency patterns (₹, $, €)
      if (/^[₹$€]\d+(?:,\d+)*(?:\.\d+)?$/.test(segment)) {
        return (
          <span key={index} className="font-medium text-gray-900">
            {segment}
          </span>
        );
      }
      // Regular text
      return <span key={index}>{segment}</span>;
    });
  };

  // Function to render content based on its type
  const renderContent = (content: string | ContentBlock[]) => {
    if (typeof content === 'string') {
      return (
        <div className="prose prose-sm max-w-none">
          {formatText(content)}
        </div>
      );
    }

    // For array content, render only the text parts
    return (
      <div className="prose prose-sm max-w-none">
        {content
          .filter(block => block.type === 'text')
          .map((block, index) => (
            <div key={index}>
              {block.text && formatText(block.text)}
            </div>
          ))}
      </div>
    );
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
          'rounded-full p-1.5 text-xs font-medium',
          isUser ? 'bg-blue-200' : 'bg-gray-200'
        )}
      >
        {isUser ? 'You' : 'AI'}
      </div>
      <div className="flex-1 space-y-2">
        {renderContent(message.content)}
      </div>
    </div>
  );
} 