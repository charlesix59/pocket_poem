/**
 * AI 服务
 * 统一处理不同 AI 提供商的 API 调用
 */

import { AIProvider, AIMessage, AIResponse, AI_PROVIDERS } from '@/src/types/ai';
import { getAPIKey, getActiveProvider } from '@/src/utils/storage';

/**
 * OpenAI 兼容的 API 调用
 */
async function callOpenAICompatible(
  provider: AIProvider,
  messages: AIMessage[],
  model: string
): Promise<AIResponse> {
  const apiKey = await getAPIKey(provider);
  if (!apiKey) {
    throw new Error(`${provider} API 密钥未配置`);
  }

  const apiUrl = AI_PROVIDERS[provider].apiUrl;
  const endpoint = `${apiUrl}/chat/completions`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `API 请求失败: ${response.status}`);
    }

    const data = await response.json();

    return {
      content: data.choices[0]?.message?.content || '',
      provider,
      model,
      tokens: {
        prompt: data.usage?.prompt_tokens || 0,
        completion: data.usage?.completion_tokens || 0,
        total: data.usage?.total_tokens || 0,
      },
    };
  } catch (error) {
    console.error(`${provider} 调用失败:`, error);
    throw error;
  }
}

/**
 * Google Gemini API 调用
 */
async function callGemini(messages: AIMessage[], model: string): Promise<AIResponse> {
  const apiKey = await getAPIKey('gemini');
  if (!apiKey) {
    throw new Error('Gemini API 密钥未配置');
  }

  const endpoint = `${AI_PROVIDERS.gemini.apiUrl}/${model}:generateContent?key=${apiKey}`;

  try {
    // 转换消息格式
    const contents = messages
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `API 请求失败: ${response.status}`);
    }

    const data = await response.json();

    return {
      content: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
      provider: 'gemini',
      model,
      tokens: {
        prompt: data.usageMetadata?.promptTokenCount || 0,
        completion: data.usageMetadata?.candidatesTokenCount || 0,
        total: data.usageMetadata?.totalTokenCount || 0,
      },
    };
  } catch (error) {
    console.error('Gemini 调用失败:', error);
    throw error;
  }
}

/**
 * 阿里通义千问 API 调用
 */
async function callQwen(messages: AIMessage[], model: string): Promise<AIResponse> {
  const apiKey = await getAPIKey('qwen');
  if (!apiKey) {
    throw new Error('通义千问 API 密钥未配置');
  }

  const endpoint = `${AI_PROVIDERS.qwen.apiUrl}/services/aigc/text-generation/generation`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        parameters: {
          temperature: 0.7,
          max_tokens: 2000,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `API 请求失败: ${response.status}`);
    }

    const data = await response.json();

    return {
      content: data.output?.text || '',
      provider: 'qwen',
      model,
      tokens: {
        prompt: data.usage?.input_tokens || 0,
        completion: data.usage?.output_tokens || 0,
        total: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
      },
    };
  } catch (error) {
    console.error('通义千问调用失败:', error);
    throw error;
  }
}

/**
 * 通用 AI 调用接口
 */
export async function callAI(
  messages: AIMessage[],
  provider?: AIProvider,
  model?: string
): Promise<AIResponse> {
  const activeProvider = provider || (await getActiveProvider());
  const activeModel = model || AI_PROVIDERS[activeProvider].defaultModel;

  switch (activeProvider) {
    case 'gemini':
      return callGemini(messages, activeModel);
    case 'qwen':
      return callQwen(messages, activeModel);
    case 'openai':
    case 'deepseek':
      return callOpenAICompatible(activeProvider, messages, activeModel);
    default:
      throw new Error(`不支持的 AI 提供商: ${activeProvider}`);
  }
}

/**
 * 测试 API 连接
 */
export async function testAIConnection(provider: AIProvider): Promise<boolean> {
  try {
    const testMessages: AIMessage[] = [
      {
        role: 'user',
        content: '你好，这是一条测试消息。请简单地回复 "测试成功"。',
      },
    ];

    const response = await callAI(testMessages, provider);
    return !!response.content;
  } catch (error) {
    console.error(`${provider} 连接测试失败:`, error);
    return false;
  }
}
