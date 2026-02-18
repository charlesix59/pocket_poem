import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeContainer } from '@/src/components';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  AIProvider,
  AISettings,
  AI_PROVIDERS,
} from '@/src/types/ai';
import {
  getAISettings,
  saveAISettings,
  getAPIKey,
  setAPIKey,
  removeAPIKey,
  setActiveProvider,
  getActiveProvider,
  isProviderConfigured,
} from '@/src/utils/storage';
import { testAIConnection } from '@/src/services/aiService';

export default function SettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<AIProvider | null>(null);
  const [expandedProvider, setExpandedProvider] = useState<AIProvider | null>(null);
  const [apiKeys, setApiKeys] = useState<Record<AIProvider, string>>({
    openai: '',
    gemini: '',
    deepseek: '',
    qwen: '',
  });

  // 加载设置
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const savedSettings = await getAISettings();
      setSettings(savedSettings || {
        activeProvider: 'openai',
        providers: {},
      });

      // 加载各个提供商的 API 密钥
      const keys: Record<AIProvider, string> = {
        openai: '',
        gemini: '',
        deepseek: '',
        qwen: '',
      };

      for (const provider of Object.keys(AI_PROVIDERS) as AIProvider[]) {
        const key = await getAPIKey(provider);
        if (key) {
          keys[provider] = key;
        }
      }

      setApiKeys(keys);
    } catch (error) {
      console.error('加载设置失败:', error);
      Alert.alert('错误', '加载设置失败');
    } finally {
      setLoading(false);
    }
  };

  // 保存 API 密钥
  const handleSaveAPIKey = useCallback(
    async (provider: AIProvider, apiKey: string) => {
      if (!apiKey.trim()) {
        Alert.alert('提示', '请输入 API 密钥');
        return;
      }

      setSaving(true);
      try {
        await setAPIKey(provider, apiKey.trim());
        
        // 更新本地状态
        setApiKeys(prev => ({
          ...prev,
          [provider]: apiKey.trim(),
        }));

        Alert.alert('成功', '已保存 API 密钥');
        
        // 刷新设置
        await loadSettings();
      } catch (error) {
        console.error('保存 API 密钥失败:', error);
        Alert.alert('错误', '保存 API 密钥失败');
      } finally {
        setSaving(false);
      }
    },
    []
  );

  // 删除 API 密钥
  const handleRemoveAPIKey = useCallback(
    async (provider: AIProvider) => {
      Alert.alert('确认删除', `确定要删除 ${AI_PROVIDERS[provider].displayName} 的 API 密钥吗？`, [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeAPIKey(provider);
              setApiKeys(prev => ({
                ...prev,
                [provider]: '',
              }));
              Alert.alert('成功', '已删除 API 密钥');
              await loadSettings();
            } catch (error) {
              console.error('删除 API 密钥失败:', error);
              Alert.alert('错误', '删除 API 密钥失败');
            }
          },
        },
      ]);
    },
    []
  );

  // 测试连接
  const handleTestConnection = useCallback(
    async (provider: AIProvider) => {
      if (!apiKeys[provider]) {
        Alert.alert('提示', '请先输入 API 密钥');
        return;
      }

      setTesting(provider);
      try {
        // 先保存，确保最新的密钥被使用
        await setAPIKey(provider, apiKeys[provider]);
        
        const success = await testAIConnection(provider);
        if (success) {
          Alert.alert('成功', '连接测试成功！');
        } else {
          Alert.alert('失败', '连接测试失败，请检查 API 密钥');
        }
      } catch (error) {
        console.error('连接测试失败:', error);
        Alert.alert('错误', `连接测试失败: ${error instanceof Error ? error.message : '未知错误'}`);
      } finally {
        setTesting(null);
      }
    },
    [apiKeys]
  );

  // 切换活跃提供商
  const handleToggleProvider = useCallback(
    async (provider: AIProvider) => {
      try {
        await setActiveProvider(provider);
        
        // 更新设置
        setSettings(prev => 
          prev ? { ...prev, activeProvider: provider } : null
        );
        
        Alert.alert('成功', `已切换到 ${AI_PROVIDERS[provider].displayName}`);
      } catch (error) {
        console.error('切换提供商失败:', error);
        Alert.alert('错误', '切换提供商失败');
      }
    },
    []
  );

  if (loading) {
    return (
      <SafeContainer backgroundColor="#FFFFFF" edges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeContainer>
    );
  }

  const providers = Object.keys(AI_PROVIDERS) as AIProvider[];

  return (
    <SafeContainer backgroundColor="#FFFFFF" edges={['top', 'left', 'right']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* 标题 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>设置</Text>
          <Text style={styles.headerSubtitle}>个性化您的体验</Text>
        </View>

        {/* 关注诗人入口 */}
        <TouchableOpacity
          style={styles.followPoetsCard}
          onPress={() => router.push('/follow-poets')}>
          <View style={styles.followPoetsContent}>
            <IconSymbol name="person.2.fill" size={24} color="#007AFF" />
            <View style={styles.followPoetsText}>
              <Text style={styles.followPoetsTitle}>关注诗人</Text>
              <Text style={styles.followPoetsSubtitle}>选择您喜爱的诗人作品</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        {/* AI 服务配置标题 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>AI 服务配置</Text>
        </View>

        {/* 说明 */}
        <View style={styles.infoCard}>
          <IconSymbol name="info.circle.fill" size={20} color="#007AFF" />
          <Text style={styles.infoText}>
            配置 AI 服务的 API 密钥，以使用 AI 功能进行诗词理解、创作等。
          </Text>
        </View>

        {/* AI 提供商列表 */}
        <View style={styles.providersContainer}>
          <Text style={styles.sectionTitle}>AI 服务提供商</Text>

          {providers.map(provider => {
            const providerInfo = AI_PROVIDERS[provider];
            const hasKey = !!apiKeys[provider];
            const isActive = settings?.activeProvider === provider;
            const isTesting = testing === provider;

            return (
              <View key={provider} style={styles.providerCard}>
                {/* 提供商头部 */}
                <TouchableOpacity
                  style={styles.providerHeader}
                  onPress={() =>
                    setExpandedProvider(
                      expandedProvider === provider ? null : provider
                    )
                  }
                >
                  <View style={styles.providerInfo}>
                    <Text style={styles.providerName}>{providerInfo.displayName}</Text>
                    <Text style={styles.providerStatus}>
                      {hasKey ? '✓ 已配置' : '未配置'}
                    </Text>
                  </View>

                  <View style={styles.providerActions}>
                    {hasKey && (
                      <Switch
                        value={isActive}
                        onValueChange={() => handleToggleProvider(provider)}
                        disabled={saving}
                      />
                    )}
                    <IconSymbol
                      name={
                        expandedProvider === provider
                          ? 'chevron.up'
                          : 'chevron.down'
                      }
                      size={20}
                      color="#999"
                    />
                  </View>
                </TouchableOpacity>

                {/* 展开内容 */}
                {expandedProvider === provider && (
                  <View style={styles.providerContent}>
                    <Text style={styles.descriptionText}>
                      {providerInfo.description}
                    </Text>

                    {/* API 密钥输入 */}
                    <View style={styles.inputSection}>
                      <Text style={styles.inputLabel}>API 密钥</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="输入您的 API 密钥"
                        placeholderTextColor="#999"
                        secureTextEntry
                        value={apiKeys[provider]}
                        onChangeText={text =>
                          setApiKeys(prev => ({
                            ...prev,
                            [provider]: text,
                          }))
                        }
                        editable={!saving && !isTesting}
                      />
                    </View>

                    {/* 说明信息 */}
                    <View style={styles.helpBox}>
                      <Text style={styles.helpText}>
                        获取 {providerInfo.displayName} API 密钥：
                      </Text>
                      {provider === 'openai' && (
                        <Text style={styles.helpLink}>
                          访问 https://platform.openai.com/api-keys
                        </Text>
                      )}
                      {provider === 'gemini' && (
                        <Text style={styles.helpLink}>
                          访问 https://makersuite.google.com/app/apikey
                        </Text>
                      )}
                      {provider === 'deepseek' && (
                        <Text style={styles.helpLink}>
                          访问 https://platform.deepseek.com/api_keys
                        </Text>
                      )}
                      {provider === 'qwen' && (
                        <Text style={styles.helpLink}>
                          访问 https://dashscope.console.aliyun.com/api_keys
                        </Text>
                      )}
                    </View>

                    {/* 操作按钮 */}
                    <View style={styles.buttonGroup}>
                      <TouchableOpacity
                        style={[
                          styles.button,
                          styles.secondaryButton,
                          (saving || isTesting) && styles.buttonDisabled,
                        ]}
                        onPress={() => handleTestConnection(provider)}
                        disabled={saving || isTesting || !apiKeys[provider]}
                      >
                        {isTesting ? (
                          <ActivityIndicator size="small" color="#007AFF" />
                        ) : (
                          <>
                            <IconSymbol name="checkmark.circle" size={18} color="#007AFF" />
                            <Text style={styles.buttonText}>测试连接</Text>
                          </>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.button,
                          styles.primaryButton,
                          saving && styles.buttonDisabled,
                        ]}
                        onPress={() => handleSaveAPIKey(provider, apiKeys[provider])}
                        disabled={saving || isTesting}
                      >
                        {saving ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <>
                            <IconSymbol name="checkmark" size={18} color="#FFFFFF" />
                            <Text style={styles.buttonTextPrimary}>保存密钥</Text>
                          </>
                        )}
                      </TouchableOpacity>

                      {hasKey && (
                        <TouchableOpacity
                          style={[
                            styles.button,
                            styles.dangerButton,
                            saving && styles.buttonDisabled,
                          ]}
                          onPress={() => handleRemoveAPIKey(provider)}
                          disabled={saving}
                        >
                          <IconSymbol name="trash" size={18} color="#FF3B30" />
                          <Text style={styles.buttonTextDanger}>删除</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* 底部说明 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            您的 API 密钥只会保存在本地设备中，不会发送到任何第三方服务器。
          </Text>
        </View>
      </ScrollView>
    </SafeContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#999',
  },
  followPoetsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#E8F4FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#B3D9FF',
  },
  followPoetsContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  followPoetsText: {
    flex: 1,
  },
  followPoetsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 2,
  },
  followPoetsSubtitle: {
    fontSize: 13,
    color: '#0051D5',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 8,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  infoCard: {
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    flexDirection: 'row',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#007AFF',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  providersContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  providerCard: {
    marginBottom: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  providerHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  providerStatus: {
    fontSize: 12,
    color: '#999',
  },
  providerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  providerContent: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  descriptionText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  inputSection: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#F9F9F9',
  },
  helpBox: {
    backgroundColor: '#F0F8FF',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  helpLink: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 6,
    gap: 6,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#D0D0D0',
  },
  dangerButton: {
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: '#FFD0D0',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
  },
  buttonTextPrimary: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonTextDanger: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF3B30',
  },
  footer: {
    marginHorizontal: 20,
    marginVertical: 20,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    lineHeight: 18,
    textAlign: 'center',
  },
});
