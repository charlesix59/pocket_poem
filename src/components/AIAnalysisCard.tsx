/**
 * AI 分析卡片组件
 * 用于在诗词详情页下方展示可展开的 AI 解释或赏析结果
 */

import { IconSymbol } from '@/components/ui/icon-symbol';
import { MarkdownContent } from './MarkdownContent';
import { callAI } from '@/src/services/aiService';
import { AIMessage } from '@/src/types/ai';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface AIAnalysisCardProps {
  poemTitle: string;
  poemContent: string;
  analysisType: 'explanation' | 'appreciation'; // 解释或赏析
}

export interface AIAnalysisCardRef {
  expand: () => void;
}

function AIAnalysisCardComponent(
  { poemTitle, poemContent, analysisType }: AIAnalysisCardProps,
  ref: React.Ref<AIAnalysisCardRef>,
) {
  const [isExpanded, setIsExpanded] = useState(true);  // 默认展开
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const title = analysisType === 'explanation' ? 'AI 解释' : 'AI 赏析';
  const icon = analysisType === 'explanation' ? '🤖' : '🎭';
  const prompt =
    analysisType === 'explanation'
      ? `请讲下面的诗词翻译成现代汉语，注意用词妥帖符合原意

诗名：${poemTitle}
诗文：${poemContent}

不需要多余的解释，只输出翻译成现代汉语后的结果`
      : `请对以下古诗进行赏析，包括艺术表现、修辞手法、思想内涵、审美价值等。

诗名：${poemTitle}
诗文：${poemContent}

请用专业的文学评论角度进行赏析。`;

  // 切换卡片展开/收起
  const handleToggle = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  const fetchAnalysis = useCallback(async () => {
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
  }, [title, prompt]);

  const handleRetry = useCallback(async () => {
    await fetchAnalysis();
  }, [fetchAnalysis]);

  const handleRegenerate = useCallback(async () => {
    setAnalysis('');
    setError('');
    await fetchAnalysis();
  }, [fetchAnalysis]);

  // 组件挂载时自动加载分析
  useEffect(() => {
    if (!analysis && !loading && !error) {
      fetchAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 仅在组件挂载时执行一次

  // 暴露 expand 方法供父组件调用 - 触发加载分析
  useImperativeHandle(
    ref,
    () => ({
      expand: () => {
        if (!analysis) {
          fetchAnalysis();
        }
      },
    }),
    [analysis, fetchAnalysis],
  );

  return (
    <View style={styles.cardContainer}>
      {/* 卡片头部 - 点击展开/收起 */}
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={handleToggle}>
        <View style={styles.headerLeft}>
          <Text style={styles.cardTitle}>
            {icon} {title}
          </Text>
          {analysis && !error && (
            <Text style={styles.resultPreview}>{analysis.substring(0, 30)}...</Text>
          )}
          {error && <Text style={styles.errorBadge}>错误</Text>}
          {loading && !analysis && <Text style={styles.loadingBadge}>加载中...</Text>}
        </View>
        <IconSymbol name={isExpanded ? 'chevron.up' : 'chevron.down'} size={20} color="#999" />
      </TouchableOpacity>

      {/* 展开的内容 */}
      {isExpanded && (
        <View style={styles.cardContent}>
          {loading && !analysis ? (
            // 加载状态
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>
                {analysisType === 'explanation' ? '正在生成解释...' : '正在进行赏析...'}
              </Text>
            </View>
          ) : error ? (
            // 错误状态
            <View style={styles.errorContainer}>
              <IconSymbol name="exclamationmark.circle" size={32} color="#FF3B30" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                <Text style={styles.retryButtonText}>重试</Text>
              </TouchableOpacity>
            </View>
          ) : analysis ? (
            // 成功状态 - 显示分析内容
            <View style={styles.analysisContainer}>
              <MarkdownContent content={analysis} />

              {/* 底部按钮 */}
              <View style={styles.bottomActions}>
                <TouchableOpacity
                  style={styles.regenerateButton}
                  onPress={handleRegenerate}
                  disabled={loading}>
                  <IconSymbol name="arrow.clockwise" size={14} color="#007AFF" />
                  <Text style={styles.regenerateButtonText}>重新生成</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}

export const AIAnalysisCard = forwardRef<AIAnalysisCardRef, AIAnalysisCardProps>(
  AIAnalysisCardComponent,
);

const styles = StyleSheet.create({
  cardContainer: {
    marginVertical: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F0F0F0',
  },
  headerLeft: {
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginBottom: 0,
  },
  resultPreview: {
    display: 'none',
  },
  errorBadge: {
    fontSize: 11,
    color: '#FF3B30',
    fontWeight: '500',
  },
  loadingBadge: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: '500',
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  errorText: {
    marginTop: 12,
    fontSize: 13,
    color: '#FF3B30',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  analysisContainer: {
    minHeight: 80,
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 6,
  },
  regenerateButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
});
