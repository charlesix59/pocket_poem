import { DailySentence, SafeContainer } from '@/src/components';
import { getStatistics } from '@/src/database/initialization';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const db = useSQLiteContext();
  const [stats, setStats] = useState({ total: 0, authors: 0, dynasties: 0 });

  // 加载统计数据
  useEffect(() => {
    if (!db) return;
    const loadStats = async () => {
      try {
        const data = await getStatistics(db);
        setStats(data);
      } catch (err) {
        console.error('加载统计数据失败:', err);
      }
    };
    loadStats();
  }, [db]);

  return (
    <SafeContainer backgroundColor="#f5f5f5">
      <ScrollView style={styles.container}>
        {/* 统计信息卡片 */}
        <View style={styles.statsCard}>
          <Text style={styles.title}>口袋诗词</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.total.toLocaleString()}</Text>
              <Text style={styles.statLabel}>诗词</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.authors.toLocaleString()}</Text>
              <Text style={styles.statLabel}>作者</Text>
            </View>
          </View>
        </View>
        {/* 每日一句卡片 */}
        <DailySentence />
      </ScrollView>
    </SafeContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statsCard: {
    flexDirection: 'column',
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
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1976d2',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
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
});
