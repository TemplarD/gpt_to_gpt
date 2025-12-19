export interface AppConfig {
  ai: {
    provider: 'openai' | 'ollama' | 'anthropic';
    model: string;
    apiKey?: string;
    baseUrl?: string;
  };
  database: {
    path: string;
  };
  spreadsheet: {
    path: string;
  };
  server: {
    port: number;
    host: string;
  };
}

export const config: AppConfig = {
  ai: {
    provider: (process.env.AI_PROVIDER as 'openai' | 'ollama' | 'anthropic') || 'openai',
    model: process.env.MODEL_NAME || 'gpt-4-turbo',
    apiKey: process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY,
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  },
  database: {
    path: process.env.DB_PATH || './chat.db',
  },
  spreadsheet: {
    path: process.env.XLSX_PATH || './data/example.xlsx',
  },
  server: {
    port: parseInt(process.env.PORT || '3000'),
    host: process.env.HOST || 'localhost',
  },
};

export default config;
