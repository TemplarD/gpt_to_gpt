import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { createOllama } from 'ollama-ai-provider';
import { config } from '@/app/config';

export function getModel() {
  const { provider, model, apiKey, baseUrl } = config.ai;

  switch (provider) {
    case 'openai':
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY is required for OpenAI provider');
      }
      return openai(model);
    
    case 'anthropic':
      if (!apiKey) {
        throw new Error('ANTHROPIC_API_KEY is required for Anthropic provider');
      }
      return anthropic(model);
    
    case 'ollama':
      const ollama = createOllama({ baseURL: baseUrl });
      return ollama(model);
    
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

export function getProviderCapabilities() {
  const { provider } = config.ai;

  switch (provider) {
    case 'openai':
      return {
        supportsTools: true,
        supportsStreaming: true,
        maxTokens: 4096,
        costPerToken: 0.00001,
      };
    
    case 'anthropic':
      return {
        supportsTools: true,
        supportsStreaming: true,
        maxTokens: 4096,
        costPerToken: 0.000015,
      };
    
    case 'ollama':
      return {
        supportsTools: true,
        supportsStreaming: true,
        maxTokens: 4096,
        costPerToken: 0,
      };
    
    default:
      return {
        supportsTools: false,
        supportsStreaming: false,
        maxTokens: 2048,
        costPerToken: 0,
      };
  }
}
