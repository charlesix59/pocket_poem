import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeContainer } from '@/src/components';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AIMessage } from '@/src/types/ai';
import { callAI } from '@/src/services/aiService';
import { getActiveProvider, isProviderConfigured } from '@/src/utils/storage';
import { AI_PROVIDERS } from '@/src/types/ai';

interface ChatMessage extends AIMessage {
  id: string;
  timestamp: number;
}

export default function AIChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: '你好！我是你的诗词助手，可以帮你理解诗词、探讨诗歌创作。有什么我可以帮助你的吗？',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState('');
  const listRef = useRef<FlatList>(null);

  // 检查 AI 配置
  useEffect(() => {
    checkAIConfiguration();
  }, []);

  const checkAIConfiguration = async () => {
    try {
      const activeProvider = await getActiveProvider();
      const isConfigured = await isProviderConfigured(activeProvider);

      if (!isConfigured) {
        Alert.alert(
          '未配置 AI 服务',
          `请先在"设置"页面配置 ${AI_PROVIDERS[activeProvider].displayName} 的 API 密钥`,
          [
            {
              text: '确定',
              onPress: () => {},
            },
          ]
        );
      }

      setProvider(activeProvider);
    } catch (error) {
      console.error('检查 AI 配置失败:', error);
    }
  };

  // 发送消息
  const handleSendMessage = useCallback(async () => {
    if (!input.trim()) {
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // 准备消息历史（只使用最后 10 条消息以节省 token）
      const recentMessages = messages
        .slice(-9)
        .concat(userMessage)
        .map(msg => ({
          role: msg.role,
          content: msg.content,
        }));

      // 添加系统提示
      const messagesWithSystem: AIMessage[] = [
        {
          role: 'system',
          content: '你是一个专业的诗词专家，可以帮助用户理解诗词、讨论诗歌创作、分析诗歌意象等。用中文回复，保持友好和专业的语气。',
        },
        ...recentMessages,
      ];

      // 调用 AI
      const response = await callAI(messagesWithSystem);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // 自动滚动到底部
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('发送消息失败:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      Alert.alert('错误', `发送消息失败: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [input, messages]);

  // 清空对话
  const handleClearChat = useCallback(() => {
    Alert.alert('清空对话', '确定要清空所有对话记录吗？', [
      {
        text: '取消',
        style: 'cancel',
      },
      {
        text: '清空',
        style: 'destructive',
        onPress: () => {
          setMessages([
            {
              id: '0',
              role: 'assistant',
              content: '对话已清空。你好！我是你的诗词助手，可以帮你理解诗词、探讨诗歌创作。有什么我可以帮助你的吗？',
              timestamp: Date.now(),
            },
          ]);
        },
      },
    ]);
  }, []);

  return (
    <SafeContainer backgroundColor="#FFFFFF">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={90}
      >
        {/* 头部 */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>诗词助手</Text>
            {provider && (
              <Text style={styles.headerSubtitle}>
                使用 {AI_PROVIDERS[provider as keyof typeof AI_PROVIDERS]?.displayName || provider}
              </Text>
            )}
          </View>
          <TouchableOpacity onPress={handleClearChat} style={styles.clearButton}>
            <IconSymbol name="trash" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        {/* 消息列表 */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messageList}
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageContainer,
                item.role === 'user' && styles.userMessageContainer,
                item.role === 'assistant' && styles.assistantMessageContainer,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  item.role === 'user' && styles.userBubble,
                  item.role === 'assistant' && styles.assistantBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    item.role === 'user' && styles.userText,
                    item.role === 'assistant' && styles.assistantText,
                  ]}
                >
                  {item.content}
                </Text>
              </View>
            </View>
          )}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        />

        {/* 加载指示器 */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.loadingText}>正在思考...</Text>
          </View>
        )}

        {/* 输入框 */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="输入您的问题..."
            placeholderTextColor="#999"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={1000}
            editable={!loading}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (loading || !input.trim()) && styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={loading || !input.trim()}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <IconSymbol name="paperplane.fill" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  messageList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageContainer: {
    marginVertical: 6,
    flexDirection: 'row',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  assistantMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  userBubble: {
    backgroundColor: '#007AFF',
  },
  assistantBubble: {
    backgroundColor: '#F0F0F0',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: '#FFFFFF',
  },
  assistantText: {
    color: '#333',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: '#999',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#333',
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
