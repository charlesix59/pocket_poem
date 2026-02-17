/**
 * AI 分析卡片组件
 * 用于在诗词详情页下方展示可展开的 AI 解释或赏析结果
 */

import { IconSymbol } from '@/components/ui/icon-symbol';
import { callAI } from '@/src/services/aiService';
import { AIMessage } from '@/src/types/ai';
import React, { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const title = analysisType === 'explanation' ? 'AI 解释' : 'AI 赏析';
  const icon = analysisType === 'explanation' ? '🤖' : '🎭';
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

  // 展开卡片并获取分析
  const handleToggle = useCallback(async () => {
    if (isExpanded) {
      // 如果已展开，直接关闭
      setIsExpanded(false);
    } else {
      // 如果已有分析结果，直接展开
      if (analysis) {
        setIsExpanded(true);
      } else {
        // 否则获取分析
        await fetchAnalysis();
      }
    }
  }, [isExpanded, analysis]);

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
      setIsExpanded(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError(errorMessage);
      console.error('AI 分析失败:', err);
      Alert.alert('错误', `${title}失败: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    await fetchAnalysis();
  };

  const handleRegenerate = async () => {
    setAnalysis('');
    setError('');
    await fetchAnalysis();
  };

  // 暴露 expand 方法供父组件调用
  useImperativeHandle(
    ref,
    () => ({
      expand: () => {
        if (analysis) {
          setIsExpanded(true);
        } else {
          fetchAnalysis();
        }
      },
    }),
    [analysis],
  );

  return (
    <View style={styles.cardContainer}>
      {/* 卡片头部 - 点击展开/收起 */}
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={handleToggle}
        disabled={loading && !analysis}>
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
              <Text style={styles.analysisText}>{analysis}</Text>

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
  analysisText: {
    fontSize: 14,
    lineHeight: 24,
    color: '#333',
    marginBottom: 12,
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
