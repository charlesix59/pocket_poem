/**
 * 本地存储服务
 * 为了兼容性，这个文件重新导出 secureStorage 中的函数
 * 安全存储特性：
 * - 加密存储 API 密钥（Base64 编码）
 * - 自动备份功能
 * - 导入导出功能
 * - 生产环境建议使用 expo-secure-store 进一步加密
 */

export {
  getAISettings,
  saveAISettings,
  getAPIKey,
  setAPIKey,
  removeAPIKey,
  setActiveProvider,
  getActiveProvider,
  isProviderConfigured,
  // 新增功能
  restoreBackup,
  getBackupList,
  exportSettings,
  importSettings,
  clearAllData,
  getStorageInfo,
} from './secureStorage';
