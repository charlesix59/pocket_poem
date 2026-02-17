import { ScrollView, StyleSheet, Text, View, ActivityIndicator, Button, FlatList, TouchableOpacity } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { useRouter } from 'expo-router';
import { SafeContainer, DailySentence } from '@/src/components';
import { getAllPoems, type Poem } from '@/src/database/queries';
import { getStatistics } from '@/src/database/initialization';

export default function HomeScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [poems, setPoems] = useState<Poem[]>([]);
  const [stats, setStats] = useState({ total: 0, authors: 0, dynasties: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // 加载诗词数据
  const loadPoems = useCallback(async () => {
    if (!db) return;
    setIsLoading(true);
    try {
      const data = await getAllPoems(db, 10);
      setPoems(data);
      const stats = await getStatistics(db);
      setStats(stats);
    } catch (err) {
      console.error('加载诗词失败:', err);
    } finally {
      setIsLoading(false);
    }
  }, [db]);

  // 初始化时加载数据
  useEffect(() => {
    if (db) {
      loadPoems();
    }
  }, [db, loadPoems]);

  return (
    <SafeContainer backgroundColor="#f5f5f5">
      <ScrollView style={styles.container}>

      {/* 统计信息卡片 */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.total.toLocaleString()}</Text>
          <Text style={styles.statLabel}>诗词</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.authors.toLocaleString()}</Text>
          <Text style={styles.statLabel}>作者</Text>
        </View>
      </View>

      {/* 每日一句卡片 */}
      <DailySentence />

      {/* 说明信息 */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>✨ 数据库已加载</Text>
        <Text style={styles.infoText}>包含 287,555+ 首诗词、词、曲等经典文献</Text>
        <View style={styles.buttonGroup}>
          <View style={styles.buttonWrapper}>
            <Button title="🤖 AI 助手" onPress={() => router.push('/ai-chat' as any)} />
          </View>
          <View style={styles.buttonWrapper}>
            <Button title="🚀 诗词 Demo" onPress={() => router.push('/demo' as any)} />
          </View>
          <View style={styles.buttonWrapper}>
            <Button title="🎨 字体 Demo" onPress={() => router.push('/font-demo' as any)} />
          </View>
        </View>
      </View>

      {/* 诗词列表 */}
      <View style={styles.poemsSection}>
        <Text style={styles.sectionTitle}>最新诗词</Text>
        {isLoading ? (
          <ActivityIndicator size="small" style={styles.loader} />
        ) : poems.length === 0 ? (
          <Text style={styles.emptyText}>
            还没有诗词数据，点击上面的按钮导入示例数据吧！
          </Text>
        ) : (
          <FlatList
            data={poems}
            keyExtractor={item => item.id.toString()}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.poemCard}>
                <Text style={styles.poemTitle}>{item.title}</Text>
                <Text style={styles.poemAuthor}>
                  {item.author && `${item.author}`}
                  {item.dynasty && ` · ${item.dynasty}代`}
                </Text>
                <Text style={styles.poemContent} numberOfLines={3}>
                  {item.content}
                </Text>
              </View>
            )}
          />
        )}
      </View>

      {/* 使用指南 */}
      <View style={styles.guideSection}>
        <Text style={styles.sectionTitle}>🚀 功能特性</Text>
         <Text style={styles.guideText}>
           • 287,555+ 首经典诗词、词、曲等文献{'\n'}
           • 支持按标题、作者、朝代等多维搜索{'\n'}
           • 离线使用，预加载数据库{'\n'}
           • 使用 TypeScript 和 React Native 构建
         </Text>
      </View>

      {/* 技术栈信息 */}
      <View style={styles.techStack}>
        <Text style={styles.sectionTitle}>⚙️ 技术栈</Text>
        <View style={styles.techItem}>
          <Text style={styles.techLabel}>框架：</Text>
          <Text style={styles.techValue}>React Native + Expo</Text>
        </View>
        <View style={styles.techItem}>
          <Text style={styles.techLabel}>数据库：</Text>
          <Text style={styles.techValue}>SQLite (expo-sqlite)</Text>
        </View>
        <View style={styles.techItem}>
          <Text style={styles.techLabel}>路由：</Text>
          <Text style={styles.techValue}>Expo Router</Text>
        </View>
        <View style={styles.techItem}>
          <Text style={styles.techLabel}>语言：</Text>
          <Text style={styles.techValue}>TypeScript</Text>
        </View>
      </View>
      </ScrollView>
    </SafeContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#d32f2f',
    textAlign: 'center',
  },
  statsCard: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  infoCard: {
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#1565c0',
    lineHeight: 20,
    marginBottom: 12,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  buttonWrapper: {
    flex: 1,
  },
  loader: {
    marginVertical: 16,
  },
  poemsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    paddingVertical: 24,
  },
  poemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#1976d2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  poemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  poemAuthor: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  poemContent: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
  },
  guideSection: {
    padding: 16,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  guideText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  techStack: {
    padding: 16,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 32,
    borderRadius: 12,
  },
  techItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  techLabel: {
    flex: 1,
    fontSize: 13,
    color: '#666',
  },
  techValue: {
    flex: 1.5,
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
});
