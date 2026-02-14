import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import {
  useRandomPoem,
  useRandomPoems,
  useDatabaseStatistics,
  useSearchPoems,
  useAllDynasties,
} from '@/src/hooks/usePoems';

/**
 * 诗词卡片组件
 */
function PoemCard({ poem }: { poem: any }) {
  return (
    <View style={styles.poemCard}>
      <Text style={styles.poemTitle}>{poem.title}</Text>
      {poem.author && (
        <Text style={styles.poemAuthor}>
          作者: {poem.author} {poem.dynasty && `(${poem.dynasty})`}
        </Text>
      )}
      <Text style={styles.poemContent}>{poem.content}</Text>
      {poem.translation && (
        <View style={styles.translationSection}>
          <Text style={styles.sectionTitle}>译文：</Text>
          <Text style={styles.sectionContent}>{poem.translation}</Text>
        </View>
      )}
      {poem.appreciation && (
        <View style={styles.appreciationSection}>
          <Text style={styles.sectionTitle}>赏析：</Text>
          <Text style={styles.sectionContent}>{poem.appreciation}</Text>
        </View>
      )}
    </View>
  );
}

/**
 * 主 Demo 组件
 */
export default function DemoScreen() {
  const db = useSQLiteContext();
  const [selectedTab, setSelectedTab] = useState('random');
  const [searchKeyword, setSearchKeyword] = useState('');

  // 获取随机单首诗词
  const randomPoem = useRandomPoem(db);

  // 获取随机多首诗词
  const randomPoems = useRandomPoems(db, 5);

  // 获取统计信息
  const statistics = useDatabaseStatistics(db);

  // 搜索诗词
  const searchPoems = useSearchPoems(db);

  // 获取朝代列表
  const dynasties = useAllDynasties(db);

  // 处理搜索
  const handleSearch = useCallback(() => {
    if (searchKeyword.trim()) {
      searchPoems.search(searchKeyword, 0);
    }
  }, [searchKeyword, searchPoems]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 标题 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📚 口袋诗词 Demo</Text>
        <Text style={styles.headerSubtitle}>探索 287K+ 首经典诗词</Text>
      </View>

      {/* 统计信息卡片 */}
      {!statistics.loading && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{statistics.stats.total.toLocaleString()}</Text>
            <Text style={styles.statLabel}>诗词总数</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{statistics.stats.authors.toLocaleString()}</Text>
            <Text style={styles.statLabel}>作者数</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{statistics.stats.dynasties}</Text>
            <Text style={styles.statLabel}>朝代数</Text>
          </View>
        </View>
      )}

      {/* 标签页切换 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'random' && styles.activeTab]}
          onPress={() => setSelectedTab('random')}
        >
          <Text style={[styles.tabText, selectedTab === 'random' && styles.activeTabText]}>
            随机诗词
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'multiple' && styles.activeTab]}
          onPress={() => setSelectedTab('multiple')}
        >
          <Text style={[styles.tabText, selectedTab === 'multiple' && styles.activeTabText]}>
            随机推荐
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'search' && styles.activeTab]}
          onPress={() => setSelectedTab('search')}
        >
          <Text style={[styles.tabText, selectedTab === 'search' && styles.activeTabText]}>
            搜索
          </Text>
        </TouchableOpacity>
      </View>

      {/* 随机单首诗词 */}
      {selectedTab === 'random' && (
        <View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => randomPoem.fetchRandomPoem()}
            disabled={randomPoem.loading}
          >
            <Text style={styles.buttonText}>
              {randomPoem.loading ? '加载中...' : '✨ 换一首'}
            </Text>
          </TouchableOpacity>

          {randomPoem.loading ? (
            <ActivityIndicator size="large" color="#666" style={styles.loader} />
          ) : randomPoem.poem ? (
            <PoemCard poem={randomPoem.poem} />
          ) : (
            <Text style={styles.emptyText}>暂无数据</Text>
          )}
        </View>
      )}

      {/* 随机推荐 */}
      {selectedTab === 'multiple' && (
        <View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => randomPoems.fetchRandomPoems()}
            disabled={randomPoems.loading}
          >
            <Text style={styles.buttonText}>
              {randomPoems.loading ? '加载中...' : '🎲 刷新推荐'}
            </Text>
          </TouchableOpacity>

          {randomPoems.loading ? (
            <ActivityIndicator size="large" color="#666" style={styles.loader} />
          ) : randomPoems.poems.length > 0 ? (
            randomPoems.poems.map((poem) => <PoemCard key={poem.id} poem={poem} />)
          ) : (
            <Text style={styles.emptyText}>暂无数据</Text>
          )}
        </View>
      )}

      {/* 搜索 */}
      {selectedTab === 'search' && (
        <View>
          <TextInput
            style={styles.searchInput}
            placeholder="搜索诗词标题、作者或内容..."
            value={searchKeyword}
            onChangeText={setSearchKeyword}
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleSearch}
            disabled={searchPoems.loading || !searchKeyword.trim()}
          >
            <Text style={styles.buttonText}>
              {searchPoems.loading ? '搜索中...' : '🔍 搜索'}
            </Text>
          </TouchableOpacity>

          {searchPoems.loading ? (
            <ActivityIndicator size="large" color="#666" style={styles.loader} />
          ) : (
            <>
              {searchPoems.totalCount > 0 && (
                <Text style={styles.resultCount}>
                  找到 {searchPoems.totalCount} 首诗词
                </Text>
              )}
              {searchPoems.poems.length > 0 ? (
                searchPoems.poems.map((poem) => <PoemCard key={poem.id} poem={poem} />)
              ) : searchKeyword.trim() ? (
                <Text style={styles.emptyText}>未找到匹配的诗词</Text>
              ) : null}
            </>
          )}
        </View>
      )}

      {/* 朝代信息 */}
      {dynasties.dynasties.length > 0 && (
        <View style={styles.dynastiesSection}>
          <Text style={styles.dynastiesTitle}>📖 数据库包含朝代</Text>
          <View style={styles.dynastiesList}>
            {dynasties.dynasties.map((dynasty) => (
              <View key={dynasty} style={styles.dynastyBadge}>
                <Text style={styles.dynastyText}>{dynasty}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 底部间距 */}
      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = ({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    marginBottom: 24,
    marginTop: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as any,
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  statsContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700' as any,
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
  },
  tabContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as any,
    marginBottom: 20,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeTab: {
    backgroundColor: '#333',
    borderColor: '#333',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center' as const,
  },
  activeTabText: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#333',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center' as const,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  loader: {
    marginVertical: 24,
  },
  poemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  poemTitle: {
    fontSize: 18,
    fontWeight: '700' as any,
    color: '#333',
    marginBottom: 8,
  },
  poemAuthor: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  poemContent: {
    fontSize: 14,
    color: '#555',
    lineHeight: 24,
    marginBottom: 12,
  },
  translationSection: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    marginTop: 12,
    marginBottom: 8,
  },
  appreciationSection: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600' as any,
    color: '#666',
    marginBottom: 6,
  },
  sectionContent: {
    fontSize: 12,
    color: '#888',
    lineHeight: 18,
  },
  resultCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontWeight: '500' as any,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center' as const,
    marginVertical: 24,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    textAlign: 'center' as const,
  },
  errorText: {
    fontSize: 14,
    color: '#f44',
    textAlign: 'center' as const,
  },
  dynastiesSection: {
    marginTop: 12,
    marginBottom: 24,
  },
  dynastiesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  dynastiesList: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  dynastyBadge: {
    backgroundColor: '#333',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  dynastyText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600' as any,
  },
  footer: {
    height: 40,
  },
} as any);
