import { useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  }, [db, poemId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#333" />
        </View>
      </SafeAreaView>
    );
  }

  if (!poem) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>诗词未找到</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
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

        {/* 诗词内容 */}
        <View style={styles.contentSection}>
          <Text style={styles.content}>{poem.content}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  contentSection: {
    marginBottom: 20,
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
});
