import { SafeContainer } from '@/src/components';
import { getAuthorsWithCount } from '@/src/database/queries';
import { getFollowedPoets, setFollowedPoets } from '@/src/utils/storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface AuthorItem {
  author: string;
  count: number;
  isHot?: boolean;
}

// 热门诗人列表（维护的固定列表）
const HOT_POETS = [
  '屈原',
  '曹操',
  '陶渊明',
  '李白',
  '杜甫',
  '王维',
  '白居易',
  '孟浩然',
  '李商隐',
  '杜牧',
  '李煜',
  '苏轼',
  '李清照',
  '辛弃疾',
  '柳永',
  '陆游',
  '欧阳修',
  '马致远',
  '关汉卿',
  '纳兰性德',
];

export default function FollowPoetsScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [allAuthors, setAllAuthors] = useState<AuthorItem[]>([]);
  const [followedPoets, setFollowedPoetsState] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 加载诗人列表和关注状态
  useEffect(() => {
    loadPoets();
  }, [db]);

  const loadPoets = async () => {
    if (!db) return;
    try {
      setLoading(true);

      // 创建热门诗人Set以便快速查找
      const hotAuthorsSet = new Set(HOT_POETS);

      // 获取所有诗人及其作品数
      const allAuthorsList = await getAuthorsWithCount(db);

      // 标记热门诗人
      const authorsWithHot: AuthorItem[] = allAuthorsList.map((author) => ({
        ...author,
        isHot: hotAuthorsSet.has(author.author),
      }));

      // 热门诗人排在前面（按HOT_POETS列表顺序），其他按作品数排序
      authorsWithHot.sort((a, b) => {
        // 都是热门诗人或都不是热门诗人，按HOT_POETS顺序排序
        if (a.isHot && b.isHot) {
          return HOT_POETS.indexOf(a.author) - HOT_POETS.indexOf(b.author);
        }
        // 一个是热门，一个不是
        if (a.isHot && !b.isHot) return -1;
        if (!a.isHot && b.isHot) return 1;
        // 都不是热门诗人，按作品数排序
        return b.count - a.count;
      });

      setAllAuthors(authorsWithHot);

      // 加载已关注的诗人
      const followed = await getFollowedPoets();
      setFollowedPoetsState(new Set(followed));
    } catch (error) {
      console.error('加载诗人列表失败:', error);
      Alert.alert('错误', '加载诗人列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 切换诗人关注状态
  const togglePoet = useCallback((author: string) => {
    setFollowedPoetsState((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(author)) {
        newSet.delete(author);
      } else {
        newSet.add(author);
      }
      return newSet;
    });
  }, []);

  // 保存关注状态
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await setFollowedPoets(Array.from(followedPoets));
      Alert.alert('成功', '关注诗人已保存');
      router.back();
    } catch (error) {
      console.error('保存关注诗人失败:', error);
      Alert.alert('错误', '保存失败');
    } finally {
      setSaving(false);
    }
  }, [followedPoets, router]);

  // 全选
  const handleSelectAll = useCallback(() => {
    setFollowedPoetsState(new Set(allAuthors.map((a) => a.author)));
  }, [allAuthors]);

  // 清空
  const handleClearAll = useCallback(() => {
    setFollowedPoetsState(new Set());
  }, []);

  if (loading) {
    return (
      <SafeContainer backgroundColor="#FFFFFF" edges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeContainer>
    );
  }

  return (
    <SafeContainer backgroundColor="#FFFFFF" edges={['top', 'left', 'right']}>
      {/* 头部 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#007AFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>关注诗人</Text>
          <Text style={styles.headerSubtitle}>
            已选择 {followedPoets.size} / {allAuthors.length}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}>
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>

      {/* 提示信息 */}
      <View style={styles.tipContainer}>
        <Ionicons name="information-circle" size={16} color="#FF9500" />
        <Text style={styles.tipText}>首页随机一句只会展示关注诗人的作品</Text>
      </View>

      {/* 操作按钮 */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionButton} onPress={handleSelectAll}>
          <Ionicons name="checkmark-done" size={16} color="#007AFF" />
          <Text style={styles.actionButtonText}>全选</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleClearAll}>
          <Ionicons name="close" size={16} color="#FF3B30" />
          <Text style={styles.actionButtonText}>清空</Text>
        </TouchableOpacity>
      </View>

      {/* 诗人列表 */}
      <FlatList
        data={allAuthors}
        keyExtractor={(item) => item.author}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.poetItem, followedPoets.has(item.author) && styles.poetItemSelected]}
            onPress={() => togglePoet(item.author)}>
            <View style={styles.poetInfo}>
              <View style={styles.poetHeader}>
                <Text
                  style={[
                    styles.poetName,
                    followedPoets.has(item.author) && styles.poetNameSelected,
                  ]}
                  numberOfLines={1}>
                  {item.author}
                </Text>
                {item.isHot && <View style={styles.hotBadge} />}
              </View>
              <Text style={styles.poetCount}>{item.count} 首诗词</Text>
            </View>
            <View
              style={[styles.checkbox, followedPoets.has(item.author) && styles.checkboxChecked]}>
              {followedPoets.has(item.author) && (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              )}
            </View>
          </TouchableOpacity>
        )}
        scrollEnabled={true}
        showsVerticalScrollIndicator={true}
      />
    </SafeContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF9E6',
    borderBottomWidth: 1,
    borderBottomColor: '#FFE6B3',
    gap: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#8B6F47',
    fontWeight: '500',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  actionBar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    gap: 6,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  poetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#F9F9F9',
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
  },
  poetItemSelected: {
    backgroundColor: '#E8F4FF',
    borderColor: '#007AFF',
  },
  poetInfo: {
    flex: 1,
  },
  poetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  poetName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  poetNameSelected: {
    color: '#007AFF',
  },
  hotBadge: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF9500',
  },
  poetCount: {
    fontSize: 12,
    color: '#999',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D0D0D0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
});
