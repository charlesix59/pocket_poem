/**
 * 安全存储服务
 * 提供加密存储和备份功能
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AISettings, AIProvider } from '@/src/types/ai';

const STORAGE_KEYS = {
  AI_SETTINGS: '@pocket_poem:ai_settings',
  BACKUP_SETTINGS: '@pocket_poem:backup_settings',
};

/**
 * 简单的 Base64 编码（演示用）
 * 生产环境建议使用 react-native-keychain 或 expo-secure-store
 */
function encodeValue(value: string): string {
  try {
    return Buffer.from(value).toString('base64');
  } catch {
    return value;
  }
}

function decodeValue(encoded: string): string {
  try {
    return Buffer.from(encoded, 'base64').toString('utf8');
  } catch {
    return encoded;
  }
}

/**
 * 获取 AI 设置
 */
export async function getAISettings(): Promise<AISettings | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.AI_SETTINGS);
    if (!data) return null;

    const parsed = JSON.parse(data);
    
    // 解码 API 密钥
    if (parsed.providers) {
      for (const provider of Object.keys(parsed.providers)) {
        if (parsed.providers[provider]?.apiKey) {
          parsed.providers[provider].apiKey = decodeValue(
            parsed.providers[provider].apiKey
          );
        }
      }
    }

    return parsed;
  } catch (error) {
    console.error('获取 AI 设置失败:', error);
    return null;
  }
}

/**
 * 保存 AI 设置（带加密）
 */
export async function saveAISettings(settings: AISettings): Promise<boolean> {
  try {
    const toSave = { ...settings };

    // 编码 API 密钥
    if (toSave.providers) {
      for (const provider of Object.keys(toSave.providers)) {
        if (toSave.providers[provider as AIProvider]?.apiKey) {
          toSave.providers[provider as AIProvider]!.apiKey = encodeValue(
            toSave.providers[provider as AIProvider]!.apiKey
          );
        }
      }
    }

    await AsyncStorage.setItem(STORAGE_KEYS.AI_SETTINGS, JSON.stringify(toSave));
    
    // 自动创建备份
    await createBackup(toSave);
    
    return true;
  } catch (error) {
    console.error('保存 AI 设置失败:', error);
    return false;
  }
}

/**
 * 获取特定提供商的 API 密钥
 */
export async function getAPIKey(provider: AIProvider): Promise<string | null> {
  try {
    const settings = await getAISettings();
    return settings?.providers[provider]?.apiKey || null;
  } catch (error) {
    console.error('获取 API 密钥失败:', error);
    return null;
  }
}

/**
 * 设置 API 密钥
 */
export async function setAPIKey(
  provider: AIProvider,
  apiKey: string
): Promise<boolean> {
  try {
    const settings = await getAISettings() || {
      activeProvider: provider,
      providers: {},
    };

    settings.providers[provider] = {
      provider,
      apiKey,
      apiUrl: settings.providers[provider]?.apiUrl || '',
      modelId: settings.providers[provider]?.modelId || '',
    };

    if (!settings.activeProvider) {
      settings.activeProvider = provider;
    }

    return await saveAISettings(settings);
  } catch (error) {
    console.error('设置 API 密钥失败:', error);
    return false;
  }
}

/**
 * 删除 API 密钥
 */
export async function removeAPIKey(provider: AIProvider): Promise<boolean> {
  try {
    const settings = await getAISettings();
    if (!settings) return false;

    delete settings.providers[provider];

    // 如果删除的是活跃提供商，切换到其他可用的提供商
    if (settings.activeProvider === provider) {
      const availableProviders = Object.keys(settings.providers) as AIProvider[];
      settings.activeProvider = availableProviders[0] || 'openai';
    }

    return await saveAISettings(settings);
  } catch (error) {
    console.error('删除 API 密钥失败:', error);
    return false;
  }
}

/**
 * 设置活跃提供商
 */
export async function setActiveProvider(provider: AIProvider): Promise<boolean> {
  try {
    const settings = await getAISettings() || {
      activeProvider: provider,
      providers: {},
    };

    settings.activeProvider = provider;
    return await saveAISettings(settings);
  } catch (error) {
    console.error('设置活跃提供商失败:', error);
    return false;
  }
}

/**
 * 获取活跃提供商
 */
export async function getActiveProvider(): Promise<AIProvider> {
  try {
    const settings = await getAISettings();
    return settings?.activeProvider || 'openai';
  } catch (error) {
    console.error('获取活跃提供商失败:', error);
    return 'openai';
  }
}

/**
 * 检查提供商是否已配置
 */
export async function isProviderConfigured(provider: AIProvider): Promise<boolean> {
  try {
    const apiKey = await getAPIKey(provider);
    return !!apiKey;
  } catch (error) {
    console.error('检查提供商配置状态失败:', error);
    return false;
  }
}

/**
 * 创建备份（自动保存）
 */
async function createBackup(settings: AISettings): Promise<void> {
  try {
    const backups = (await AsyncStorage.getItem(STORAGE_KEYS.BACKUP_SETTINGS))
      ? JSON.parse(await AsyncStorage.getItem(STORAGE_KEYS.BACKUP_SETTINGS) || '{}')
      : {};

    // 只保留最近 5 个备份
    const timestamp = new Date().toISOString();
    backups[timestamp] = settings;

    const backupEntries = Object.entries(backups).sort(
      (a: any, b: any) => new Date(b[0]).getTime() - new Date(a[0]).getTime()
    );

    if (backupEntries.length > 5) {
      backupEntries.slice(5).forEach(([key]) => {
        delete backups[key];
      });
    }

    await AsyncStorage.setItem(STORAGE_KEYS.BACKUP_SETTINGS, JSON.stringify(backups));
  } catch (error) {
    console.warn('创建备份失败:', error);
    // 备份失败不应该阻止主流程
  }
}

/**
 * 恢复备份
 */
export async function restoreBackup(timestamp: string): Promise<boolean> {
  try {
    const backupsStr = await AsyncStorage.getItem(STORAGE_KEYS.BACKUP_SETTINGS);
    if (!backupsStr) return false;

    const backups = JSON.parse(backupsStr);
    const backup = backups[timestamp];

    if (!backup) return false;

    return await saveAISettings(backup);
  } catch (error) {
    console.error('恢复备份失败:', error);
    return false;
  }
}

/**
 * 获取所有备份记录
 */
export async function getBackupList(): Promise<string[]> {
  try {
    const backupsStr = await AsyncStorage.getItem(STORAGE_KEYS.BACKUP_SETTINGS);
    if (!backupsStr) return [];

    const backups = JSON.parse(backupsStr);
    return Object.keys(backups).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );
  } catch (error) {
    console.error('获取备份列表失败:', error);
    return [];
  }
}

/**
 * 导出设置为 JSON（用于备份或转移）
 */
export async function exportSettings(): Promise<string | null> {
  try {
    const settings = await getAISettings();
    if (!settings) return null;

    return JSON.stringify(settings, null, 2);
  } catch (error) {
    console.error('导出设置失败:', error);
    return null;
  }
}

/**
 * 从 JSON 导入设置
 */
export async function importSettings(jsonStr: string): Promise<boolean> {
  try {
    const settings = JSON.parse(jsonStr) as AISettings;
    return await saveAISettings(settings);
  } catch (error) {
    console.error('导入设置失败:', error);
    return false;
  }
}

/**
 * 清除所有数据
 */
export async function clearAllData(): Promise<boolean> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AI_SETTINGS,
      STORAGE_KEYS.BACKUP_SETTINGS,
    ]);
    return true;
  } catch (error) {
    console.error('清除数据失败:', error);
    return false;
  }
}

/**
 * 获取存储使用情况
 */
export async function getStorageInfo(): Promise<{
  settings: number;
  backups: number;
  total: number;
}> {
  try {
    const settings = await AsyncStorage.getItem(STORAGE_KEYS.AI_SETTINGS);
    const backups = await AsyncStorage.getItem(STORAGE_KEYS.BACKUP_SETTINGS);

    const settingsSize = settings ? Buffer.byteLength(settings, 'utf8') : 0;
    const backupsSize = backups ? Buffer.byteLength(backups, 'utf8') : 0;

    return {
      settings: settingsSize,
      backups: backupsSize,
      total: settingsSize + backupsSize,
    };
  } catch (error) {
    console.error('获取存储信息失败:', error);
    return { settings: 0, backups: 0, total: 0 };
  }
}
