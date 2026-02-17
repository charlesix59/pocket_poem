/**
 * AI 解释和赏析 Modal
 * 用于展示 AI 对诗词的解释或赏析
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { callAI } from '@/src/services/aiService';
import { AIMessage } from '@/src/types/ai';

export interface AIAnalysisModalProps {
  visible: boolean;
  poemTitle: string;
  poemContent: string;
  analysisType: 'explanation' | 'appreciation'; // 解释或赏析
  onClose: () => void;
}

export function AIAnalysisModal({
  visible,
  poemTitle,
  poemContent,
  analysisType,
  onClose,
}: AIAnalysisModalProps) {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const title = analysisType === 'explanation' ? 'AI 解释' : 'AI 赏析';
  const prompt =
    analysisType === 'explanation'
      ? `请对以下古诗进行详细的解释，包括诗的含义、词语解释、表达的意境等。

诗名：${poemTitle}
诗文：${poemContent}

请用清晰易懂的语言进行解释。`
      : `请对以下古诗进行赏析，包括艺术表现、修辞手法、思想内涵、审美价值等。

诗名：${poemTitle}
诗文：${poemContent}

请用专业的文学评论角度进行赏析。`;

  useEffect(() => {
    if (visible && !analysis && !loading) {
      fetchAnalysis();
    }
  }, [visible]);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError('');
    try {
      const messages: AIMessage[] = [
        {
          role: 'user',
          content: prompt,
        },
      ];

      const response = await callAI(messages);
      setAnalysis(response.content);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError(errorMessage);
      console.error('AI 分析失败:', err);
      Alert.alert('错误', `${title}失败: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAnalysis('');
    setError('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}>
      <View style={styles.modalContainer}>
        {/* 背景蒙层 */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />

        {/* 内容容器 */}
        <View style={styles.contentContainer}>
          {/* 头部 */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{title}</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <IconSymbol name="xmark" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* 内容 */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>
                  {title === 'AI 解释' ? '正在解释诗词...' : '正在进行赏析...'}
                </Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <IconSymbol name="exclamationmark.circle" size={48} color="#FF3B30" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={fetchAnalysis}
                  disabled={loading}>
                  <Text style={styles.retryButtonText}>重试</Text>
                </TouchableOpacity>
              </View>
            ) : analysis ? (
              <Text style={styles.analysisText}>{analysis}</Text>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>暂无内容</Text>
              </View>
            )}
          </ScrollView>

          {/* 底部按钮 */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.closeButtonBottom}
              onPress={handleClose}
              disabled={loading}>
              <Text style={styles.closeButtonText}>关闭</Text>
            </TouchableOpacity>
            {analysis && (
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={fetchAnalysis}
                disabled={loading}>
                <IconSymbol name="arrow.clockwise" size={16} color="#007AFF" />
                <Text style={styles.refreshButtonText}>重新生成</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  contentContainer: {
    height: '75%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    padding: 8,
    marginRight: -8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  analysisText: {
    fontSize: 15,
    lineHeight: 26,
    color: '#333',
    letterSpacing: 0.2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  closeButtonBottom: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  refreshButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
});
