import { useHotPoems } from '@/src/hooks/usePoems';
import { useSQLiteContext } from 'expo-sqlite';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Poem } from '@/src/database/queries';
import { PoemCard } from './PoemCard';

const PAGE_SIZE = 10;

export function HotPoems() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { poems, totalCount, loading, fetchHotPoems } = useHotPoems(db, PAGE_SIZE);
  const [currentPage, setCurrentPage] = useState(0);

  const handlePoemPress = React.useCallback((poem: Poem) => {
    router.push({
      pathname: '/poem-detail',
      params: { poemId: poem.id },
    });
  }, [router]);

  const handleLoadMore = React.useCallback(async () => {
    // 防止重复加载：如果正在加载或已加载完所有数据，则不加载
    if (loading || poems.length >= totalCount) {
      return;
    }

    const nextPage = currentPage + 1;
    const offset = nextPage * PAGE_SIZE;
    
    if (offset < totalCount) {
      await fetchHotPoems(offset);
      setCurrentPage(nextPage);
    }
  }, [loading, poems.length, totalCount, currentPage, fetchHotPoems]);

  // 使用 useCallback 优化 renderItem 函数，防止不必要的重新渲染
  const renderItem = React.useCallback(
    ({ item }: { item: Poem }) => (
      <PoemCard 
        poem={item} 
        onPress={() => handlePoemPress(item)}
        numberOfLines={4}
      />
    ),
    [handlePoemPress]
  );

  if (loading && poems.length === 0) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#333" />
      </View>
    );
  }

  if (!loading && poems.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>暂无热门诗词</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={poems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        scrollEnabled={true}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          totalCount > poems.length ? (
            <View style={styles.footer}>
              {loading ? (
                <ActivityIndicator size="small" color="#333" />
              ) : (
                <TouchableOpacity
                  style={styles.loadMoreButton}
                  onPress={handleLoadMore}
                  activeOpacity={0.7}>
                  <Text style={styles.loadMoreText}>换一批</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null
        }
      />
      <Text style={styles.countText}>
        共 {totalCount} 首热门诗词 (显示 {poems.length})
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
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
  countText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 12,
    paddingBottom: 20,
  },
});
