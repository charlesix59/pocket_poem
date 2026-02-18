import { useSQLiteContext } from 'expo-sqlite';
import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  addPoemToCollection,
  createCollection,
  getAllCollections,
  getCollectionsForPoem,
  removePoemFromCollection,
} from '@/src/database/queries';

export interface SaveToCollectionModalProps {
  visible: boolean;
  poemId: number;
  onClose: () => void;
  onSave?: () => void;
}

interface Collection {
  id: number;
  name: string;
  description: string;
  is_default: number;
}

export function SaveToCollectionModal({
  visible,
  poemId,
  onClose,
  onSave,
}: SaveToCollectionModalProps) {
  const db = useSQLiteContext();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [saving, setSaving] = useState(false);
  const [collectedIds, setCollectedIds] = useState<number[]>([]);

  // 加载收藏夹列表
  const loadCollections = useCallback(async () => {
    if (!db) return;
    setLoading(true);
    try {
      const [allCollections, collected] = await Promise.all([
        getAllCollections(db),
        getCollectionsForPoem(db, poemId),
      ]);
      setCollections(allCollections);
      // 记录已收藏的收藏夹 ID
      setCollectedIds(collected.map(c => c.id));
    } catch (error: any) {
      console.error('加载收藏夹失败:', error);
      
      // 如果是表不存在的错误，显示提示并自动重新创建
      if (error.message?.includes('no such table: collections')) {
        Alert.alert(
          '数据库更新中',
          '检测到需要更新数据库。请关闭此对话框，重启应用。',
          [
            {
              text: '确定',
              onPress: () => {
                onClose();
              },
            },
          ]
        );
      } else {
        Alert.alert('错误', '加载收藏夹失败: ' + (error.message || '未知错误'));
      }
    } finally {
      setLoading(false);
    }
  }, [db, poemId, onClose]);

  useEffect(() => {
    if (visible) {
      loadCollections();
    }
  }, [visible, loadCollections]);

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      Alert.alert('提示', '请输入收藏夹名称');
      return;
    }

    if (!db) return;

    setSaving(true);
    try {
      const collectionId = await createCollection(db, newCollectionName.trim(), '');
      
      // 添加诗词到新收藏夹
      await addPoemToCollection(db, Number(collectionId), poemId);
      
      Alert.alert('成功', `已创建收藏夹"${newCollectionName}"并保存诗词`);
      setNewCollectionName('');
      setShowNewCollection(false);
      
      // 刷新列表
      await loadCollections();
      
      if (onSave) {
        onSave();
      }
      
      onClose();
    } catch (error: any) {
      if (error.message?.includes('UNIQUE constraint failed')) {
        Alert.alert('提示', '收藏夹名称已存在');
      } else {
        Alert.alert('错误', '创建收藏夹失败');
      }
      console.error('创建收藏夹失败:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSelectCollection = async (collectionId: number) => {
    if (!db) return;

    setSaving(true);
    try {
      const isCurrentlyCollected = collectedIds.includes(collectionId);
      
      if (isCurrentlyCollected) {
        // 取消收藏
        await removePoemFromCollection(db, collectionId, poemId);
        setCollectedIds(collectedIds.filter(id => id !== collectionId));
        Alert.alert('成功', '已从收藏夹中移除');
      } else {
        // 添加收藏
        await addPoemToCollection(db, collectionId, poemId);
        setCollectedIds([...collectedIds, collectionId]);
        Alert.alert('成功', '诗词已保存到收藏夹');
      }
      
      if (onSave) {
        onSave();
      }
    } catch (error) {
      Alert.alert('错误', '操作失败');
      console.error('操作失败:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* 头部 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>返回</Text>
          </TouchableOpacity>
          <Text style={styles.title}>选择收藏夹</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* 新建收藏夹区域 */}
        {!showNewCollection ? (
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowNewCollection(true)}
          >
            <IconSymbol name="plus.circle.fill" size={24} color="#007AFF" />
            <Text style={styles.createButtonText}>新建收藏夹</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.newCollectionForm}>
            <TextInput
              style={styles.input}
              placeholder="输入收藏夹名称"
              placeholderTextColor="#999"
              value={newCollectionName}
              onChangeText={setNewCollectionName}
              editable={!saving}
            />
            <View style={styles.formButtons}>
              <TouchableOpacity
                style={[styles.formButton, styles.cancelButton]}
                onPress={() => {
                  setShowNewCollection(false);
                  setNewCollectionName('');
                }}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.formButton, styles.confirmButton]}
                onPress={handleCreateCollection}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.confirmButtonText}>创建</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 收藏夹列表 */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#333" />
          </View>
        ) : collections.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>还没有收藏夹</Text>
          </View>
        ) : (
          <FlatList
            data={collections}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
              const isInCollection = collectedIds.includes(item.id);
              return (
                <TouchableOpacity
                  style={[
                    styles.collectionItem,
                    isInCollection && styles.collectionItemSelected,
                  ]}
                  onPress={() => handleSelectCollection(item.id)}
                  disabled={saving}
                >
                  <View style={styles.collectionContent}>
                    <Text style={styles.collectionName}>{item.name}</Text>
                    <View style={styles.collectionBadges}>
                      {isInCollection && (
                        <Text style={styles.selectedBadge}>✓ 已收藏</Text>
                      )}
                      {item.is_default === 1 && (
                        <Text style={styles.defaultBadge}>默认</Text>
                      )}
                    </View>
                  </View>
                  {item.description && (
                    <Text style={styles.collectionDescription}>{item.description}</Text>
                  )}
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    width: 60,
    paddingVertical: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
    marginLeft: 8,
  },
  newCollectionForm: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  formButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#E8E8E8',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
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
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  collectionItem: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  collectionItemSelected: {
    backgroundColor: '#E8F5FF',
    borderLeftColor: '#34C759',
  },
  collectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  collectionBadges: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  collectionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  selectedBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    backgroundColor: '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  defaultBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  collectionDescription: {
    fontSize: 13,
    color: '#999',
  },
});
