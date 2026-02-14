import { ScrollView, StyleSheet, Text, View, ActivityIndicator, Button, FlatList } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useDatabase } from '@/src/context/DatabaseContext';
import { getAllPoems, type Poem } from '@/src/database/queries';
import { importPoems, clearAllPoems, getStatistics } from '@/src/database/initialization';
import { samplePoems } from '@/src/data/samplePoems';

export default function HomeScreen() {
  const { db, isReady, error } = useDatabase();
  const [poems, setPoems] = useState<Poem[]>([]);
  const [stats, setStats] = useState({ total: 0, authors: 0, dynasties: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);

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
    if (isReady && db) {
      loadPoems();
    }
  }, [isReady, db, loadPoems]);

  // 导入示例数据
  const handleImportSampleData = async () => {
    if (!db) return;
    setIsImporting(true);
    try {
      await importPoems(db, samplePoems);
      await loadPoems();
    } catch (err) {
      console.error('导入数据失败:', err);
    } finally {
      setIsImporting(false);
    }
  };

  // 清空数据
  const handleClearData = async () => {
    if (!db) return;
    try {
      await clearAllPoems(db);
      await loadPoems();
    } catch (err) {
      console.error('清空数据失败:', err);
    }
  };

  if (!isReady) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>正在初始化应用...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>❌ 初始化失败</Text>
        <Text style={styles.errorMessage}>{error.message}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📖 口袋诗词</Text>
        <Text style={styles.subtitle}>阅读和学习诗词的最佳方式</Text>
      </View>

      {/* 统计信息卡片 */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>诗词</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.authors}</Text>
          <Text style={styles.statLabel}>作者</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.dynasties}</Text>
          <Text style={styles.statLabel}>朝代</Text>
        </View>
      </View>

      {/* 操作按钮 */}
      <View style={styles.buttonGroup}>
        <Button
          title="📥 导入示例诗词"
          onPress={handleImportSampleData}
          disabled={isImporting}
        />
        <Button
          title="🗑️ 清空所有数据"
          onPress={handleClearData}
          color="#ff6b6b"
        />
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
        <Text style={styles.sectionTitle}>🚀 快速开始</Text>
         <Text style={styles.guideText}>
           1. 点击&quot;导入示例诗词&quot;按钮查看数据库功能{'\n'}
           2. 在 src/data/samplePoems.ts 中添加你的诗词{'\n'}
           3. 使用 src/database/queries.ts 中的函数查询诗词{'\n'}
           4. 在组件中使用 useDatabase hook 访问数据库
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
  buttonGroup: {
    paddingHorizontal: 16,
    gap: 8,
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
