import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useRandomPoem } from '@/src/hooks/usePoems';
import { useSQLiteContext } from 'expo-sqlite';
import { useRouter } from 'expo-router';
import { PoemCard } from './PoemCard';

interface RandomPoemProps {
  onRefresh?: () => void;
}

/**
 * 随机诗词组件
 */
export const RandomPoem: React.FC<RandomPoemProps> = ({ onRefresh }) => {
  const db = useSQLiteContext();
  const router = useRouter();
  const randomPoem = useRandomPoem(db);

  const handleRefresh = React.useCallback(() => {
    randomPoem.fetchRandomPoem();
    onRefresh?.();
  }, [randomPoem, onRefresh]);

  const handleCardPress = React.useCallback(() => {
    if (randomPoem.poem) {
      router.push({
        pathname: '/poem-detail',
        params: { poemId: randomPoem.poem.id.toString() },
      });
    }
  }, [randomPoem.poem, router]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={handleRefresh}
        disabled={randomPoem.loading}
      >
        <Text style={styles.buttonText}>
          {randomPoem.loading ? '加载中...' : '✨ 换一首'}
        </Text>
      </TouchableOpacity>

      {randomPoem.loading ? (
        <ActivityIndicator size="large" color="#666" style={styles.loader} />
      ) : randomPoem.poem ? (
        <PoemCard poem={randomPoem.poem} onPress={handleCardPress} numberOfLines={0} />
      ) : (
        <Text style={styles.emptyText}>暂无数据</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  button: {
    backgroundColor: '#333',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  loader: {
    marginVertical: 24,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginVertical: 24,
  },
});
