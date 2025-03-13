'use client';

import { useChat } from 'ai/react';
import ChatMessage from './components/ChatMessage';
import FileUpload from './components/FileUpload';
import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat();
  const [currentFile, setCurrentFile] = useState<{ name: string; type: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        
        await append({
          role: 'user',
          content: JSON.stringify([
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
          ])
        });
        return;
      }

      if (file.type.startsWith('image/')) {
        const arrayBuffer = await file.arrayBuffer();
        const base64Data = btoa(
          new Uint8Array(arrayBuffer)
            .reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        
        await append({
          role: 'user',
          content: JSON.stringify([
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
          ])
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
    <main className="flex min-h-screen flex-col items-center bg-white">
      <div className="w-full max-w-3xl h-screen flex flex-col">
        <h1 className="text-3xl font-bold text-center py-4 text-gray-800 bg-white">
          Indian Tax Assistant
        </h1>
        
        {/* Chat messages container with fixed height and scrolling */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="flex flex-col gap-2">
            {messages.map((message, i) => (
              <ChatMessage key={i} message={message} />
            ))}
            <div ref={messagesEndRef} /> {/* Scroll anchor */}
            
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
        </div>

        {/* Fixed input form at bottom */}
        <div className="border-t bg-white">
          <form
            onSubmit={handleFormSubmit}
            className="p-4 space-y-3"
          >
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
          </form>
        </div>
      </div>
    </main>
  );
} 