'use client';

import { Message } from '@/types/chat';
import { useChat } from 'ai/react';
import ChatMessage from './components/ChatMessage';
import FileUpload from './components/FileUpload';
import { useState } from 'react';

interface ContentBlock {
  type: 'text' | 'image' | 'document';
  text?: string;
  source?: {
    type: 'base64';
    media_type: string;
    data: string;
  };
}

interface CustomMessage extends Message {
  content: string | ContentBlock[];
}

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat();
  const [currentFile, setCurrentFile] = useState<{ name: string; type: string } | null>(null);

  const handleFileSelect = async (file: File) => {
    setCurrentFile({ name: file.name, type: file.type });
    
    try {
      let fileContent: string;
      
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const base64Data = btoa(
          new Uint8Array(arrayBuffer)
            .reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        
        await (append as (message: CustomMessage) => void)({
          role: 'user',
          content: [
            {
              type: 'text',
              text: `I'm uploading a PDF file named "${file.name}" for analysis.`
            },
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: base64Data
              }
            }
          ]
        });
        return;
      }

      if (file.type.startsWith('image/')) {
        const arrayBuffer = await file.arrayBuffer();
        const base64Data = btoa(
          new Uint8Array(arrayBuffer)
            .reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        
        await (append as (message: CustomMessage) => void)({
          role: 'user',
          content: [
            {
              type: 'text',
              text: `I'm uploading an image file named "${file.name}" for analysis.`
            },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: file.type,
                data: base64Data
              }
            }
          ]
        });
        return;
      }

      // Handle text files
      if (file.type === 'text/plain') {
        fileContent = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result?.toString() || '');
          reader.readAsText(file);
        });

        await append({
          role: 'user',
          content: `I've uploaded a text file named "${file.name}". Here's its content:\n\n${fileContent}\n\nPlease analyze this document and provide guidance.`
        });
        return;
      }

      // For unsupported file types
      await append({
        role: 'user',
        content: `I tried to upload a file "${file.name}" but the file type "${file.type}" is not supported. Please upload a PDF, image, or text file.`
      });
      
    } catch (err) {
      console.error('Error processing file:', err);
      await append({
        role: 'user',
        content: `There was an error processing the file "${file.name}". Please try uploading a different file or copy-paste the content directly.`
      });
    }
  };

  const handleFileRemove = () => {
    setCurrentFile(null);
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit(e);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-white">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Indian Tax Assistant
        </h1>
        
        <div className="flex flex-col gap-2 pb-32">
          {messages.map((message: Message, i: number) => (
            <ChatMessage key={i} message={message} />
          ))}
          
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              Ask me anything about Indian taxes! I can help with income tax, GST, and more.
              <br />
              Upload your tax documents (Form 16, ITR, etc.) for specific guidance.
              <br />
              <span className="text-xs mt-2 block">
                Note: For PDFs and images, you&apos;ll need to copy-paste the relevant content if automatic parsing fails.
              </span>
            </div>
          )}
        </div>

        <form
          onSubmit={handleFormSubmit}
          className="fixed bottom-0 w-full max-w-3xl bg-white p-4 border-t"
        >
          <div className="space-y-3">
            <FileUpload
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              acceptedFileTypes=".pdf,.jpg,.jpeg,.png,.txt"
            />
            <div className="flex gap-4">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder={currentFile 
                  ? "Ask questions about the uploaded document..."
                  : "Ask about Indian taxes..."}
                className="flex-1 rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:outline-none"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
              >
                {isLoading ? 'Thinking...' : 'Send'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
} 