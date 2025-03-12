export type Role = 'function' | 'user' | 'assistant' | 'system' | 'data' | 'tool';

export interface Message {
  role: Role;
  content: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
} 