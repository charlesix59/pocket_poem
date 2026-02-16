import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Poem } from '@/src/database/queries';

interface PoemCardProps {
  poem: Poem;
  onPress?: () => void;
  numberOfLines?: number;
}

/**
 * 可复用的诗词卡片组件
 * @param poem - 诗词对象
 * @param onPress - 点击卡片的回调
 * @param numberOfLines - 内容行数限制（默认不限制）
 */
export function PoemCard({ poem, onPress, numberOfLines }: PoemCardProps) {
  // 检查内容是否被截断
  const contentIsTruncated = numberOfLines ? poem.content.split('\n').length > numberOfLines : false;

  return (
    <TouchableOpacity style={styles.poemCard} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.cardHeader}>
        <Text style={styles.poemTitle}>{poem.title}</Text>
      </View>

      {poem.author && (
        <Text style={styles.poemAuthor}>
          作者: {poem.author} {poem.dynasty && `(${poem.dynasty})`}
        </Text>
      )}

      <View style={styles.contentWrapper}>
        <Text style={styles.poemContent} numberOfLines={numberOfLines}>
          {poem.content}
        </Text>

        {/* 如果内容被截断，显示提示文本 */}
        {contentIsTruncated && (
          <Text style={styles.truncatedText}>点击查看全文</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  poemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 10,
  },
  poemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  poemAuthor: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
  },
  contentWrapper: {
    position: 'relative',
  },
  poemContent: {
    fontSize: 14,
    color: '#555',
    lineHeight: 24,
  },
  truncatedText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
