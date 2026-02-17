import React from 'react';
import { View } from 'react-native';
import { PPButton } from './PPButton';

export interface SaveButtonProps {
  onPress: () => void;
  style?: any;
  showText?: boolean;
  size?: 'small' | 'large';
  isCollected?: boolean;
}

/**
 * 蓝色收藏按钮组件
 * 基于 PPButton 构建，用于收藏功能
 * @param size - 'small' 为小标签样式（默认），'large' 为大按钮样式
 * @param isCollected - 是否已收藏，为 true 时显示已收藏状态
 */
export function SaveButton({
  onPress,
  style,
  showText = true,
  size = 'small',
  isCollected = false,
}: SaveButtonProps) {
  const getSaveButtonConfig = () => {
    if (size === 'small') {
      return {
        bgColor: isCollected ? '#34C759' : '#007AFF',
        textContent: isCollected ? '📌 已收藏' : '📌 收藏',
        shadowStyle: {
          shadowColor: isCollected ? '#34C759' : '#007AFF',
          shadowOpacity: 0.2,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
          elevation: 2,
        },
      };
    }
    // large
    return {
      bgColor: isCollected ? '#34C759' : '#007AFF',
      textContent: isCollected ? '📌 已收藏' : '📌 收藏',
      shadowStyle: {
        shadowColor: isCollected ? '#34C759' : '#007AFF',
        shadowOpacity: 0.3,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
      },
    };
  };

  const config = getSaveButtonConfig();

  return (
    <View style={[config.shadowStyle, style]}>
      <PPButton
        text={config.textContent}
        backgroundColor={config.bgColor}
        borderColor={config.bgColor}
        textColor="#FFFFFF"
        size={size}
        onPress={onPress}
      />
    </View>
  );
}
