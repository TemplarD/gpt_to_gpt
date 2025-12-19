// Типы для ChatInterface компонента

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface Thread {
  id: string;
  title: string;
  created_at: string;
  updated_at?: string;
}

export interface Confirmation {
  type: string;
  id: string;
}

export interface ModelSettings {
  ollama: {
    url: string;
    model: string;
  };
  openai: {
    apiKey: string;
    model: string;
  };
}
