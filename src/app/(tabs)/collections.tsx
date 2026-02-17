import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useRouter, useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SafeContainer } from '@/src/components';
import {
  getAllCollections,
  getCollectionPoemCount,
  getCollectionPoems,
  deleteCollection,
} from '@/src/database/queries';
import { PoemCard } from '@/src/components/PoemCard';

interface Collection {
  id: number;
  name: string;
  description: string;
  is_default: number;
}

interface CollectionWithCount extends Collection {
  poemCount: number;
}

export default function CollectionsScreen() {
  const db = useSQLiteContext();
  const router = useRouter();

  const [collections, setCollections] = useState<CollectionWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<number | null>(null);
  const [collectionPoems, setCollectionPoems] = useState<any[]>([]);
  const [loadingPoems, setLoadingPoems] = useState(false);
  const [poemsPage, setPoemsPage] = useState(0);
  const [hasMorePoems, setHasMorePoems] = useState(true);

  const PAGE_SIZE = 20;

  // 加载所有收藏夹
  const loadCollections = useCallback(async () => {
    if (!db) return;
    try {
      const result = await getAllCollections(db);
      const collectionsWithCount = await Promise.all(
        result.map(async (collection) => {
          const count = await getCollectionPoemCount(db, collection.id);
          return { ...collection, poemCount: count };
        })
      );
      setCollections(collectionsWithCount);
      // 默认选择第一个收藏夹
      if (collectionsWithCount.length > 0 && selectedCollection === null) {
        setSelectedCollection(collectionsWithCount[0].id);
      }
    } catch (error) {
      console.error('加载收藏夹失败:', error);
      Alert.alert('错误', '加载收藏夹失败');
    } finally {
      setLoading(false);
    }
  }, [db, selectedCollection]);

  // 加载选定收藏夹的诗词
  const loadCollectionPoems = useCallback(
    async (collectionId: number, page: number = 0) => {
      if (!db) return;
      setLoadingPoems(true);
      try {
        const poems = await getCollectionPoems(db, collectionId, PAGE_SIZE, page * PAGE_SIZE);
        if (page === 0) {
          setCollectionPoems(poems);
        } else {
          setCollectionPoems((prev) => [...prev, ...poems]);
        }
        setHasMorePoems(poems.length === PAGE_SIZE);
        setPoemsPage(page);
      } catch (error) {
        console.error('加载收藏夹诗词失败:', error);
        Alert.alert('错误', '加载诗词失败');
      } finally {
        setLoadingPoems(false);
      }
    },
    [db]
  );

  // 初始化加载
  useEffect(() => {
    if (db) {
      loadCollections();
    }
  }, [db, loadCollections]);

  // 监听页面焦点，刷新收藏夹列表和诗词
  useFocusEffect(
    useCallback(() => {
      if (!db) return;
      
      // 刷新收藏夹列表（包括每个收藏夹的诗词计数）
      const refreshData = async () => {
        try {
          const result = await getAllCollections(db);
          const collectionsWithCount = await Promise.all(
            result.map(async (collection) => {
              const count = await getCollectionPoemCount(db, collection.id);
              return { ...collection, poemCount: count };
            })
          );
          setCollections(collectionsWithCount);
          
          // 如果有选中的收藏夹，也刷新其诗词
          if (selectedCollection !== null) {
            const poems = await getCollectionPoems(db, selectedCollection, PAGE_SIZE, 0);
            setCollectionPoems(poems);
            setHasMorePoems(poems.length === PAGE_SIZE);
            setPoemsPage(0);
          }
        } catch (error) {
          console.error('刷新数据失败:', error);
        }
      };
      
      refreshData();
    }, [db, selectedCollection])
  );

  // 选择收藏夹时加载其诗词
  useEffect(() => {
    if (selectedCollection !== null) {
      loadCollectionPoems(selectedCollection, 0);
    }
  }, [selectedCollection, loadCollectionPoems]);

  // 下拉刷新
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCollections();
    setRefreshing(false);
  }, [loadCollections]);

  // 加载更多诗词
  const loadMorePoems = useCallback(() => {
    if (selectedCollection !== null && hasMorePoems && !loadingPoems) {
      loadCollectionPoems(selectedCollection, poemsPage + 1);
    }
  }, [selectedCollection, poemsPage, hasMorePoems, loadingPoems, loadCollectionPoems]);

  // 删除收藏夹
  const handleDeleteCollection = useCallback(
    (collectionId: number, collectionName: string) => {
      if (!db) return;

      Alert.alert(
        '删除收藏夹',
        `确定要删除"${collectionName}"吗？`,
        [
          {
            text: '取消',
            onPress: () => {},
            style: 'cancel',
          },
          {
            text: '删除',
            onPress: async () => {
              try {
                await deleteCollection(db, collectionId);
                // 重新加载列表
                await loadCollections();
                // 如果删除的是当前选中的收藏夹，选择第一个
                if (selectedCollection === collectionId && collections.length > 1) {
                  const remaining = collections.filter((c) => c.id !== collectionId);
                  setSelectedCollection(remaining[0].id);
                }
              } catch (error) {
                console.error('删除收藏夹失败:', error);
                Alert.alert('错误', '删除收藏夹失败');
              }
            },
            style: 'destructive',
          },
        ]
      );
    },
    [db, collections, selectedCollection, loadCollections]
  );

  // 点击诗词卡片跳转到详情页
  const handlePoemPress = useCallback(
    (poemId: number) => {
      router.push({
        pathname: '/poem-detail',
        params: { poemId: poemId.toString() },
      });
    },
    [router]
  );

  if (loading) {
    return (
      <SafeContainer backgroundColor="#FFFFFF">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#333" />
        </View>
      </SafeContainer>
    );
  }

  if (collections.length === 0) {
    return (
      <SafeContainer backgroundColor="#FFFFFF">
        <View style={styles.emptyContainer}>
          <IconSymbol name="bookmark" size={48} color="#CCC" />
          <Text style={styles.emptyText}>还没有任何收藏夹</Text>
          <Text style={styles.emptySubText}>点击诗词详情页的收藏按钮创建</Text>
        </View>
      </SafeContainer>
    );
  }

  return (
    <SafeContainer backgroundColor="#FFFFFF">
      <View style={styles.pageContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>辑录</Text>
          <Text style={styles.headerSubtitle}>我的收藏夹</Text>
        </View>

        {/* 收藏夹标签列表 */}
        <View style={styles.collectionsContainer}>
        <FlatList
          horizontal
          data={collections}
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.collectionsList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.collectionTag,
                selectedCollection === item.id && styles.collectionTagActive,
              ]}
              onPress={() => setSelectedCollection(item.id)}
              onLongPress={() => handleDeleteCollection(item.id, item.name)}>
              <View style={styles.tagHeader}>
                <Text
                  style={[
                    styles.collectionTagName,
                    selectedCollection === item.id && styles.collectionTagNameActive,
                  ]}
                  numberOfLines={1}>
                  {item.name}
                </Text>
                {item.is_default === 1 && (
                  <Text style={styles.defaultBadge}>默认</Text>
                )}
              </View>
              <Text
                style={[
                  styles.collectionTagCount,
                  selectedCollection === item.id && styles.collectionTagCountActive,
                ]}>
                {item.poemCount} 首
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* 诗词列表 */}
      <View style={styles.poemsContainer}>
        {collectionPoems.length === 0 ? (
          <View style={styles.noPoemsContainer}>
            <Text style={styles.noPoemsText}>这个收藏夹还是空的</Text>
          </View>
        ) : (
          <FlatList
            data={collectionPoems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.poemCardWrapper}>
                <PoemCard
                  poem={item}
                  onPress={() => handlePoemPress(item.id)}
                  numberOfLines={3}
                />
              </View>
            )}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            onEndReached={loadMorePoems}
            onEndReachedThreshold={0.3}
            ListFooterComponent={
              loadingPoems ? (
                <View style={styles.loadingMore}>
                  <ActivityIndicator size="small" color="#333" />
                </View>
              ) : null
            }
          />
        )}
      </View>

        {/* 提示信息 */}
        {collections.length > 0 && collectionPoems.length > 0 && (
          <View style={styles.tipContainer}>
            <Text style={styles.tipText}>长按标签可删除收藏夹</Text>
          </View>
        )}
      </View>
    </SafeContainer>
  );
}

const styles = StyleSheet.create({
  pageContent: {
    flex: 1,
    flexDirection: 'column',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  collectionsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingVertical: 12,
  },
  collectionsList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  collectionTag: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  collectionTagActive: {
    backgroundColor: '#007AFF',
    borderColor: '#0051D5',
  },
  tagHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  collectionTagName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  collectionTagNameActive: {
    color: '#FFFFFF',
  },
  defaultBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    backgroundColor: '#FF9500',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  collectionTagCount: {
    fontSize: 12,
    color: '#999',
  },
  collectionTagCountActive: {
    color: '#E8F4FF',
  },
  poemsContainer: {
    flex: 1,
  },
  noPoemsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPoemsText: {
    fontSize: 16,
    color: '#999',
  },
  poemCardWrapper: {
    paddingHorizontal: 12,
    marginVertical: 6,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 6,
  },
  loadingMore: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  tipContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  tipText: {
    fontSize: 12,
    color: '#999',
  },
});
