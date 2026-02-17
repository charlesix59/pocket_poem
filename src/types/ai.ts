/**
 * AI 相关的类型定义
 */

export type AIProvider = 'openai' | 'gemini' | 'deepseek' | 'qwen';

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey: string;
  apiUrl: string;
  modelId: string;
}

export interface AIProviderInfo {
  name: string;
  displayName: string;
  apiUrl: string;
  defaultModel: string;
  description: string;
}

export const AI_PROVIDERS: Record<AIProvider, AIProviderInfo> = {
  openai: {
    name: 'openai',
    displayName: 'OpenAI',
    apiUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-3.5-turbo',
    description: 'OpenAI 官方 API',
  },
  gemini: {
    name: 'gemini',
    displayName: 'Google Gemini',
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
    defaultModel: 'gemini-pro',
    description: 'Google Gemini API',
  },
  deepseek: {
    name: 'deepseek',
    displayName: 'DeepSeek',
    apiUrl: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    description: 'DeepSeek API',
  },
  qwen: {
    name: 'qwen',
    displayName: '阿里通义千问',
    apiUrl: 'https://dashscope.aliyuncs.com/api/v1',
    defaultModel: 'qwen-turbo',
    description: '阿里云通义千问 API',
  },
};

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  content: string;
  provider: AIProvider;
  model: string;
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
  };
}

export interface AISettings {
  activeProvider: AIProvider;
  providers: {
    [key in AIProvider]?: AIProviderConfig;
  };
}
