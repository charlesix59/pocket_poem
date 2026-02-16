import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useRouter } from 'expo-router';
import { Poem, getAuthorsWithCount } from '@/src/database/queries';
import { PoemCard } from './PoemCard';

interface AuthorWithCount {
  author: string;
  count: number;
}

const PAGE_SIZE = 10;

export function PoemCategory() {
  const db = useSQLiteContext();
  const router = useRouter();
  const poemsListRef = React.useRef<FlatList<Poem>>(null);

  // 左侧侧边栏状态
  const [authors, setAuthors] = useState<AuthorWithCount[]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const [authorsLoading, setAuthorsLoading] = useState(false);
  const [authorsError, setAuthorsError] = useState<Error | null>(null);

  // 右侧诗词列表状态
  const [poems, setPoems] = useState<Poem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [poemsLoading, setPoemsLoading] = useState(false);
  const [poemsError, setPoemsError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  // 获取所有作者列表
  const fetchAuthors = useCallback(async () => {
    if (!db) return;
    setAuthorsLoading(true);
    setAuthorsError(null);
    try {
      const data = await getAuthorsWithCount(db);
      setAuthors(data);
      // 自动选择第一个作者
      if (data.length > 0) {
        setSelectedAuthor(data[0].author);
      }
    } catch (err) {
      setAuthorsError(err instanceof Error ? err : new Error('加载作者列表失败'));
    } finally {
      setAuthorsLoading(false);
    }
  }, [db]);

  // 获取选中作者的诗词
  const fetchPoemsByAuthor = useCallback(
    async (author: string, offset: number = 0) => {
      if (!db || !author) return;
      setPoemsLoading(true);
      setPoemsError(null);
      try {
        const [data, count] = await Promise.all([
          db.getAllAsync<Poem>(
            'SELECT * FROM poems WHERE author = ? ORDER BY id DESC LIMIT ? OFFSET ?',
            [author, PAGE_SIZE, offset]
          ),
          db.getFirstAsync<{ count: number }>(
            'SELECT COUNT(*) as count FROM poems WHERE author = ?',
            [author]
          ),
        ]);
        if (offset === 0) {
          setPoems(data);
        } else {
          setPoems((prev) => [...prev, ...data]);
        }
        setTotalCount(count?.count || 0);
      } catch (err) {
        setPoemsError(err instanceof Error ? err : new Error('加载诗词失败'));
      } finally {
        setPoemsLoading(false);
      }
    },
    [db]
  );

  // 初始化：加载作者列表
  useEffect(() => {
    fetchAuthors();
  }, [fetchAuthors]);

  // 选中作者时加载其诗词
  useEffect(() => {
    if (selectedAuthor) {
      setCurrentPage(0);
      fetchPoemsByAuthor(selectedAuthor, 0);
      // 重置诗词列表的滚动位置
      poemsListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }
  }, [selectedAuthor, fetchPoemsByAuthor]);

  const handleAuthorPress = (author: string) => {
    setSelectedAuthor(author);
  };

  const handlePoemPress = (poem: Poem) => {
    router.push({
      pathname: '/poem-detail',
      params: { poemId: poem.id },
    });
  };

  const handleLoadMore = useCallback(async () => {
    if (!selectedAuthor || poemsLoading || poems.length >= totalCount) {
      return;
    }
    const nextPage = currentPage + 1;
    const offset = nextPage * PAGE_SIZE;
    if (offset < totalCount) {
      await fetchPoemsByAuthor(selectedAuthor, offset);
      setCurrentPage(nextPage);
    }
  }, [selectedAuthor, poemsLoading, poems.length, totalCount, currentPage, fetchPoemsByAuthor]);

  const renderPoem = useCallback(
    ({ item }: { item: Poem }) => (
      <PoemCard poem={item} onPress={() => handlePoemPress(item)} numberOfLines={3} />
    ),
    []
  );

  const renderAuthor = ({ item }: { item: AuthorWithCount }) => (
    <TouchableOpacity
      style={[
        styles.authorItem,
        selectedAuthor === item.author && styles.authorItemActive,
      ]}
      onPress={() => handleAuthorPress(item.author)}>
      <Text
        style={[
          styles.authorName,
          selectedAuthor === item.author && styles.authorNameActive,
        ]}
        numberOfLines={1}>
        {item.author}
      </Text>
      <Text
        style={[
          styles.authorCount,
          selectedAuthor === item.author && styles.authorCountActive,
        ]}>
        {item.count}
      </Text>
    </TouchableOpacity>
  );

  if (authorsLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#333" />
      </View>
    );
  }

  if (authorsError || authors.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>暂无诗人数据</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 左侧侧边栏 */}
      <View style={styles.sidebar}>
        <FlatList
          data={authors}
          renderItem={renderAuthor}
          keyExtractor={(item) => item.author}
          scrollEnabled={true}
          showsVerticalScrollIndicator={true}
        />
      </View>

      {/* 右侧诗词列表 */}
      <View style={styles.contentArea}>
        {selectedAuthor && (
          <View style={styles.authorHeader}>
            <Text style={styles.authorTitle}>{selectedAuthor}</Text>
            <Text style={styles.authorPoetryCount}>共 {totalCount} 首</Text>
          </View>
        )}

        {poemsLoading && poems.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#333" />
          </View>
        ) : poems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>暂无诗词</Text>
          </View>
        ) : (
          <FlatList
            ref={poemsListRef}
            data={poems}
            renderItem={renderPoem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={true}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={
              totalCount > poems.length ? (
                <View style={styles.footer}>
                  {poemsLoading ? (
                    <ActivityIndicator size="small" color="#333" />
                  ) : (
                    <TouchableOpacity
                      style={styles.loadMoreButton}
                      onPress={handleLoadMore}
                      activeOpacity={0.7}>
                      <Text style={styles.loadMoreText}>加载更多</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : null
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
  },
  sidebar: {
    width: 100,
    backgroundColor: '#F5F5F5',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  authorItem: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
    backgroundColor: '#F5F5F5',
  },
  authorItemActive: {
    backgroundColor: '#FFFFFF',
    borderLeftColor: '#333',
  },
  authorName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  authorNameActive: {
    color: '#333',
  },
  authorCount: {
    fontSize: 11,
    color: '#999',
  },
  authorCountActive: {
    color: '#666',
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  authorHeader: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 12,
  },
  authorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  authorPoetryCount: {
    fontSize: 12,
    color: '#999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  errorText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadMoreButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#333',
    borderRadius: 6,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
