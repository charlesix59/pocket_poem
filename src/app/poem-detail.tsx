import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SaveButton, SaveToCollectionModal, SafeContainer } from '@/src/components';
import { isAnyCollected, getCollectionsForPoem, removePoemFromCollection } from '@/src/database/queries';

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
    }, [checkCollectionStatus])
  );

  // 处理收藏按钮点击
  const handleSaveButtonPress = useCallback(async () => {
    if (isCollected) {
      // 已收藏，显示取消选项
      Alert.alert(
        '取消收藏',
        '请选择要从哪个收藏夹中移除此诗词',
        [
          {
            text: '取消',
            style: 'cancel',
          },
          {
            text: '查看并管理',
            onPress: () => setShowSaveModal(true),
          },
        ]
      );
    } else {
      // 未收藏，打开 Modal 添加收藏
      setShowSaveModal(true);
    }
  }, [isCollected]);

  if (loading) {
    return (
      <SafeContainer backgroundColor="#FFFFFF">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#333" />
        </View>
      </SafeContainer>
    );
  }

  if (!poem) {
    return (
      <SafeContainer backgroundColor="#FFFFFF">
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>诗词未找到</Text>
        </View>
      </SafeContainer>
    );
  }

  return (
    <SafeContainer backgroundColor="#FFFFFF">
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        {/* 标题 */}
        <Text style={styles.title}>{poem.title}</Text>

        {/* 作者和朝代 */}
        <View style={styles.metaSection}>
          {poem.author && (
            <Text style={styles.author}>
              {poem.author}
              {poem.dynasty && ` · ${poem.dynasty}`}
            </Text>
          )}
        </View>

        {/* 诗词内容和收藏按钮 */}
        <View style={styles.contentWrapper}>
          <Text style={styles.content}>{poem.content}</Text>
          {/* 右下角收藏按钮 */}
          <SaveButton 
            onPress={handleSaveButtonPress}
            size="small"
            style={styles.saveButtonTag}
            isCollected={isCollected}
          />
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
  },
  errorText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  saveButtonTag: {
    marginTop: 12,
    alignSelf: 'flex-end',
  },
});
