import {
  AIAnalysisCard,
  AskAIPopup,
  PPButton,
  SafeContainer,
  SaveButton,
  SaveToCollectionModal,
  SelectableText,
} from '@/src/components';
import { isAnyCollected } from '@/src/database/queries';
import { callAI } from '@/src/services/aiService';
import { AIMessage } from '@/src/types/ai';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

interface PoemData {
  id: number;
  content: string;
  title: string;
  author?: string;
  dynasty?: string;
}

export default function PoemDetailScreen() {
  const { poemId } = useLocalSearchParams<{ poemId: string }>();
  const db = useSQLiteContext();
  const [poem, setPoem] = useState<PoemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isCollected, setIsCollected] = useState(false);

  // AI 卡片的 ref 和显示状态
  const explanationCardRef = useRef<any>(null);
  const appreciationCardRef = useRef<any>(null);
  const [showExplanationCard, setShowExplanationCard] = useState(false);
  const [showAppreciationCard, setShowAppreciationCard] = useState(false);

  // 提问 AI 弹窗的状态
  const [showAskAIPopup, setShowAskAIPopup] = useState(false);
  const [selectedTextForAI, setSelectedTextForAI] = useState('');

  // 检查诗词是否已收藏
  const checkCollectionStatus = useCallback(async () => {
    if (!db || !poemId) return;
    try {
      const collected = await isAnyCollected(db, parseInt(poemId, 10));
      setIsCollected(collected);
    } catch (error) {
      console.error('检查收藏状态失败:', error);
    }
  }, [db, poemId]);

  useEffect(() => {
    const fetchPoemDetail = async () => {
      if (!db || !poemId) return;
      setLoading(true);
      try {
        const result = await db.getFirstAsync<any>(
          `SELECT id, title, content, author, dynasty 
           FROM poems 
           WHERE id = ?`,
          [parseInt(poemId, 10)],
        );

        if (result) {
          setPoem({
            id: result.id,
            content: result.content || '',
            title: result.title || '',
            author: result.author,
            dynasty: result.dynasty,
          });
        }
      } catch (error) {
        console.error('获取诗词详情失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPoemDetail();
    checkCollectionStatus();
  }, [db, poemId, checkCollectionStatus]);

  // 在页面获得焦点时检查收藏状态（Modal 关闭后）
  useFocusEffect(
    useCallback(() => {
      checkCollectionStatus();
    }, [checkCollectionStatus]),
  );

  // 处理收藏按钮点击
  const handleSaveButtonPress = useCallback(async () => {
    if (isCollected) {
      // 已收藏，显示取消选项
      Alert.alert('取消收藏', '请选择要从哪个收藏夹中移除此诗词', [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '查看并管理',
          onPress: () => setShowSaveModal(true),
        },
      ]);
    } else {
      // 未收藏，打开 Modal 添加收藏
      setShowSaveModal(true);
    }
  }, [isCollected]);

  // 处理选中文本后的"问 AI"功能
  const handleAskSelectedText = useCallback((selectedText: string) => {
    setSelectedTextForAI(selectedText);
    setShowAskAIPopup(true);
  }, []);

  // 处理 AI 提问提交
  const handleAskAISubmit = useCallback(
    async (question: string, includeContext: boolean): Promise<string> => {
      try {
        // 构建提示词 - 选中文本始终包含
        let promptContent = `关于以下选中的诗词片段，用户有以下疑问：\n\n选中内容：\n${selectedTextForAI}\n\n用户问题：${question}`;

        // 如果包含全文上下文，添加完整诗词信息
        if (includeContext && poem) {
          promptContent = `诗词标题：${poem.title}\n诗词作者：${poem.author || '未知'}\n\n完整诗词内容：\n${poem.content}\n\n用户在以下片段上提出疑问：\n${selectedTextForAI}\n\n用户问题：${question}`;
        }

        // 调用 AI API
        const messages: AIMessage[] = [
          {
            role: 'user',
            content: promptContent,
          },
        ];

        const response = await callAI(messages);

        // 返回 AI 的回答内容
        return response.content;
      } catch (error) {
        console.error('提问 AI 失败:', error);
        throw error;
      }
    },
    [poem, selectedTextForAI],
  );

  if (loading) {
    return (
      <SafeContainer backgroundColor="#FFFFFF" edges={['left', 'right', 'bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#333" />
        </View>
      </SafeContainer>
    );
  }

  if (!poem) {
    return (
      <SafeContainer backgroundColor="#FFFFFF" edges={['left', 'right', 'bottom']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>诗词未找到</Text>
        </View>
      </SafeContainer>
    );
  }

  return (
    <SafeContainer backgroundColor="#FFFFFF" edges={['left', 'right', 'bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        {/* 标题 */}
        <Text style={styles.title}>{poem.title}</Text>

        {/* 作者 */}
        <View style={styles.metaSection}>
          {poem.author && (
            <Text style={styles.author}>
              {poem.author}
            </Text>
          )}
        </View>

        {/* 诗词内容和收藏按钮 */}
        <View style={styles.contentWrapper}>
          <SelectableText
            text={poem.content}
            style={styles.content}
            onAsk={handleAskSelectedText}
          />

          {/* AI 标签和收藏按钮 */}
          <View style={styles.actionContainer}>
            {/* AI 解释标签 */}
            <PPButton
              text="🤖 AI解释"
              backgroundColor="#F0F0F0"
              borderColor="#E0E0E0"
              textColor="#666"
              size="small"
              onPress={() => {
                setShowExplanationCard(true);
                explanationCardRef.current?.expand();
              }}
            />

            {/* AI 赏析标签 */}
            <PPButton
              text="🎭 AI赏析"
              backgroundColor="#F0F0F0"
              borderColor="#E0E0E0"
              textColor="#666"
              size="small"
              onPress={() => {
                setShowAppreciationCard(true);
                appreciationCardRef.current?.expand();
              }}
            />

            {/* 右下角收藏按钮 */}
            <SaveButton
              onPress={handleSaveButtonPress}
              size="small"
              style={styles.saveButtonTag}
              isCollected={isCollected}
            />
          </View>
        </View>

        {/* AI 分析卡片 - 只在点击后显示 */}
        <View style={styles.analysisCardsContainer}>
          {showExplanationCard && (
            <AIAnalysisCard
              ref={explanationCardRef}
              poemTitle={poem.title}
              poemContent={poem.content}
              analysisType="explanation"
            />
          )}
          {showAppreciationCard && (
            <AIAnalysisCard
              ref={appreciationCardRef}
              poemTitle={poem.title}
              poemContent={poem.content}
              analysisType="appreciation"
            />
          )}
        </View>
      </ScrollView>

      {/* 选择收藏夹 Modal */}
      <SaveToCollectionModal
        visible={showSaveModal}
        poemId={poem.id}
        onClose={() => {
          setShowSaveModal(false);
          // Modal 关闭后重新检查收藏状态
          checkCollectionStatus();
        }}
        onSave={checkCollectionStatus}
      />

      {/* 提问 AI 弹窗 */}
      {poem && (
        <AskAIPopup
          visible={showAskAIPopup}
          selectedText={selectedTextForAI}
          fullText={poem.content}
          poemTitle={poem.title}
          poemAuthor={poem.author}
          onClose={() => setShowAskAIPopup(false)}
          onSubmit={handleAskAISubmit}
        />
      )}
    </SafeContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  metaSection: {
    alignItems: 'center',
    marginBottom: 10,
  },
  author: {
    fontSize: 15,
    color: '#666',
    fontStyle: 'italic',
    letterSpacing: 0.3,
  },
  contentWrapper: {
    marginBottom: 20,
    position: 'relative',
  },
  content: {
    fontSize: 17,
    lineHeight: 32,
    color: '#333',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  actionContainer: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    justifyContent: 'flex-end',
  },
  saveButtonTag: {
    marginTop: 0,
  },
  analysisCardsContainer: {
    marginTop: 8,
    gap: 4,
    paddingBottom: 20,
  },
});
