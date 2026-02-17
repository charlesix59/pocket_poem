import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

export interface SaveButtonProps {
  onPress: () => void;
  style?: any;
  showText?: boolean;
  size?: 'small' | 'large';
  isCollected?: boolean;
}

/**
 * 蓝色收藏按钮组件
 * @param size - 'small' 为小标签样式（默认），'large' 为大按钮样式
 * @param isCollected - 是否已收藏，为 true 时显示已收藏状态
 */
export function SaveButton({ onPress, style, showText = true, size = 'small', isCollected = false }: SaveButtonProps) {
  if (size === 'small') {
    // 小标签样式
    return (
      <TouchableOpacity 
        style={[
          styles.buttonSmall, 
          isCollected && styles.buttonSmallCollected,
          style
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.contentSmall}>
          <IconSymbol 
            name={isCollected ? "bookmark.fill" : "bookmark"} 
            size={16} 
            color="#FFFFFF" 
          />
          {showText && (
            <Text style={styles.textSmall}>{isCollected ? '已收藏' : '收藏'}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  // 大按钮样式
  return (
    <TouchableOpacity 
      style={[
        styles.buttonLarge,
        isCollected && styles.buttonLargeCollected,
        style
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.contentLarge}>
        <IconSymbol 
          name={isCollected ? "bookmark.fill" : "bookmark"} 
          size={24} 
          color="#FFFFFF" 
        />
        {showText && (
          <Text style={styles.textLarge}>{isCollected ? '已收藏' : '收藏'}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // 小标签样式
  buttonSmall: {
    backgroundColor: '#007AFF',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  buttonSmallCollected: {
    backgroundColor: '#34C759',
    shadowColor: '#34C759',
  },
  contentSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  textSmall: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // 大按钮样式
  buttonLarge: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  buttonLargeCollected: {
    backgroundColor: '#34C759',
    shadowColor: '#34C759',
  },
  contentLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textLarge: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
