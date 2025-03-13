'use client';

import { useChat } from 'ai/react';
import ChatMessage from './components/ChatMessage';
import FileUpload from './components/FileUpload';
import { useState, useRef, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

const SUGGESTED_QUESTIONS = [
  "How do I calculate my income tax for FY 2024-25?",
  "What are the tax benefits under Section 80C?",
  "How to file ITR for freelancers?",
  "What is the new tax regime vs old tax regime?"
];

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

  const handleSuggestedQuestion = (question: string) => {
    handleInputChange({ target: { value: question } } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div className="container flex-1 items-center justify-center md:py-10">
      <Card className="w-full max-w-3xl mx-auto h-[calc(100vh-8rem)]">
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex flex-col gap-4">
              {messages.map((message, i) => (
                <ChatMessage key={i} message={message} />
              ))}
              <div ref={messagesEndRef} />
              
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <h2 className="text-2xl font-bold">Welcome to AI Tax Assistant</h2>
                  <p className="text-muted-foreground max-w-sm">
                    Ask me anything about Indian taxes! I can help with income tax, GST, and more.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-2xl mt-4">
                    {SUGGESTED_QUESTIONS.map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="h-auto py-2 px-4 text-left text-sm"
                        onClick={() => handleSuggestedQuestion(question)}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Upload your tax documents (Form 16, ITR, etc.) for specific guidance.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Note: For PDFs and images, you&apos;ll need to copy-paste the relevant content if automatic parsing fails.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="border-t p-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <div className="w-full sm:w-48">
                <FileUpload
                  onFileSelect={handleFileSelect}
                  onFileRemove={handleFileRemove}
                  acceptedFileTypes=".pdf,.jpg,.jpeg,.png,.txt"
                />
              </div>
              <form onSubmit={handleFormSubmit} className="flex-1 flex gap-2">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder={currentFile 
                    ? "Ask questions about the uploaded document..."
                    : "Ask about Indian taxes..."}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      <span>Send</span>
                    </div>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
} 