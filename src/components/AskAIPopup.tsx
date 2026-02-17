/**
 * 提问 AI 的弹窗组件
 * 类似 ChatGPT 界面，显示 AI 对话，支持上下文选择
 */

import React, { useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { PPButton } from './PPButton';

export interface AskAIPopupProps {
  visible: boolean;
  selectedText: string;
  fullText: string;
  onClose: () => void;
  onSubmit: (question: string, includeContext: boolean) => Promise<string>;
  poemTitle?: string;
  poemAuthor?: string;
}

export const AskAIPopup: React.FC<AskAIPopupProps> = ({
  visible,
  selectedText,
  fullText,
  onClose,
  onSubmit,
  poemTitle = '',
  poemAuthor = '',
}) => {
  const [question, setQuestion] = useState('');
  const [includeContext, setIncludeContext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasAsked, setHasAsked] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [userQuestion, setUserQuestion] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  // 快速提问按钮处理
  const quickQuestions = [
    { label: '释义', question: `请解释这段内容在古代汉语中的含义：${selectedText}` },
    { label: '典故', question: `“${selectedText}”中有哪些典故或引用？` },
    {
      label: '创作背景',
      question: `关于《${poemTitle}》${poemAuthor ? `（${poemAuthor}）` : ''}的创作背景是什么？`,
    },
  ];

  const handleQuickQuestion = async (quickQuestion: string) => {
    // 直接处理快速提问，不需要通过输入框
    setUserQuestion(quickQuestion);
    setLoading(true);
    setHasAsked(true);
    try {
      const response = await onSubmit(quickQuestion, includeContext);
      setAiResponse(response);
      
      // 滚动到底部以显示新的 AI 响应
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('提问 AI 失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!question.trim()) {
      return;
    }

    // 保存用户的问题
    setUserQuestion(question);
    setLoading(true);
    setHasAsked(true);
    try {
      const response = await onSubmit(question, includeContext);
      setAiResponse(response);
      // 清空输入框
      setQuestion('');
      
      // 滚动到底部以显示新的 AI 响应
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('提问 AI 失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setQuestion('');
    setAiResponse('');
    setUserQuestion('');
    setHasAsked(false);
    setIncludeContext(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        {/* 蒙层 */}
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleClose}
        />

        {/* PopUp 内容 */}
        <View style={styles.popupContent}>
          {/* 头部 */}
          <View style={styles.header}>
            <Text style={styles.title}>🤖 诗词问答</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <IconSymbol name="xmark" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* 对话内容区域 */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.conversationArea}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.conversationContent}>
            
            {/* 初始化选中文本和上下文选项 */}
            {!hasAsked && (
              <>
                {/* 选中文本展示 */}
                <View style={styles.messageContainer}>
                  <View style={styles.selectedTextBox}>
                    <Text style={styles.selectedLabel}>📍 选中的文本</Text>
                    <Text style={styles.selectedText}>{selectedText}</Text>
                  </View>
                </View>

                {/* 上下文开关 */}
                <View style={styles.contextContainer}>
                  <TouchableOpacity
                    style={styles.contextToggle}
                    onPress={() => setIncludeContext(!includeContext)}>
                    <View
                      style={[
                        styles.checkbox,
                        includeContext && styles.checkboxChecked,
                      ]}>
                      {includeContext && (
                        <IconSymbol name="checkmark" size={14} color="#007AFF" />
                      )}
                    </View>
                    <Text style={styles.contextLabel}>将全文作为上下文</Text>
                  </TouchableOpacity>
                  <Text style={styles.contextDescription}>
                    启用后，AI 将考虑整首诗的内容来回答问题
                  </Text>
                </View>
              </>
            )}

            {/* 显示用户的问题 */}
            {userQuestion && (
              <View style={styles.userQuestionContainer}>
                <View style={styles.userMessageBox}>
                  <Text style={styles.userQuestionText}>{userQuestion}</Text>
                </View>
              </View>
            )}

             {/* AI 回答消息 */}
             {loading && hasAsked && !aiResponse && (
               <View style={styles.loadingContainer}>
                 <ActivityIndicator size="large" color="#007AFF" />
                 <Text style={styles.loadingText}>AI 正在思考...</Text>
               </View>
             )}

             {/* 显示 AI 的响应 */}
             {aiResponse && (
               <View style={styles.aiResponseContainer}>
                 <View style={styles.aiMessageBox}>
                   <Text style={styles.aiResponseText}>{aiResponse}</Text>
                 </View>
               </View>
             )}
          </ScrollView>

          {/* 输入框 - 固定在底部 */}
          <View style={styles.inputContainer}>
            {/* 快速提问按钮 */}
            {!hasAsked && (
              <View style={styles.quickQuestionsContainer}>
                {quickQuestions.map((item, index) => (
                  <PPButton
                    key={index}
                    text={item.label}
                    size="small"
                    backgroundColor="#F5F5F5"
                    borderColor="#E0E0E0"
                    textColor="#333"
                    onPress={() => handleQuickQuestion(item.question)}
                    style={styles.quickButton}
                  />
                ))}
              </View>
            )}

            <View style={styles.inputWrapper}>
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder="输入您的问题..."
                placeholderTextColor="#999"
                value={question}
                onChangeText={setQuestion}
                multiline={true}
                editable={!loading}
                maxLength={200}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (loading || !question.trim()) && styles.sendButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={loading || !question.trim()}>
                <IconSymbol 
                  name="arrow.up" 
                  size={18} 
                  color={loading || !question.trim() ? '#CCC' : '#007AFF'} 
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.charCount}>{question.length}/200</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  popupContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: Dimensions.get('window').height * 0.9,
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 8,
    marginRight: -8,
  },
  conversationArea: {
    flex: 1,
  },
  conversationContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  selectedLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  selectedTextBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFB81C',
  },
  selectedText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  contextContainer: {
    marginBottom: 20,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 12,
  },
  contextToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D0D0D0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  contextLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  contextDescription: {
    fontSize: 12,
    color: '#999',
    lineHeight: 18,
    marginLeft: 28,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  aiResponseContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  aiMessageBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  aiResponseText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  userQuestionContainer: {
    marginTop: 12,
    marginBottom: 16,
  },
  userMessageBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  userQuestionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  quickQuestionsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  quickButton: {
    flex: 0,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    minHeight: 40,
    maxHeight: 100,
    textAlignVertical: 'center',
    paddingVertical: 0,
  },
  sendButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  charCount: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    textAlign: 'right',
  },
});
