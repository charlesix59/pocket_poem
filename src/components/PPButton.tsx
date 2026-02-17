/**
 * PP Button 组件
 * 一个通用的标签样式按钮，用于展示和管理 tag 类型的按钮
 * 仅维护样式和显示逻辑，业务逻辑由外层处理
 */

import React from 'react';
import { StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

export interface PPButtonProps {
  /** 按钮文案 */
  text: string;
  /** 按钮点击后的文案（可选，用于展示状态变化） */
  activeText?: string;
  /** 是否处于激活状态 */
  isActive?: boolean;
  /** 背景色 */
  backgroundColor?: string;
  /** 边框色 */
  borderColor?: string;
  /** 文字颜色 */
  textColor?: string;
  /** 按钮大小：'small' | 'medium' | 'large' */
  size?: 'small' | 'medium' | 'large';
  /** 按钮点击回调 */
  onPress: () => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 自定义样式 */
  style?: ViewStyle;
  /** 自定义文字样式 */
  textStyle?: TextStyle;
}

export const PPButton: React.FC<PPButtonProps> = ({
  text,
  activeText,
  isActive = false,
  backgroundColor = '#F0F0F0',
  borderColor = '#E0E0E0',
  textColor = '#666',
  size = 'small',
  onPress,
  disabled = false,
  style,
  textStyle,
}) => {
  const displayText = isActive && activeText ? activeText : text;
  const sizeStyles = getSizeStyles(size);

  return (
    <TouchableOpacity
      style={[
        styles.button,
        sizeStyles.container,
        {
          backgroundColor,
          borderColor,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}>
      <Text
        style={[
          styles.text,
          sizeStyles.text,
          {
            color: textColor,
          },
          textStyle,
        ]}>
        {displayText}
      </Text>
    </TouchableOpacity>
  );
};

/**
 * 根据 size 获取对应的样式
 */
function getSizeStyles(size: 'small' | 'medium' | 'large') {
  switch (size) {
    case 'large':
      return {
        container: {
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: 4,
        },
        text: {
          fontSize: 14,
          fontWeight: '600' as const,
        },
      };
    case 'medium':
      return {
        container: {
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 4,
        },
        text: {
          fontSize: 13,
          fontWeight: '500' as const,
        },
      };
    case 'small':
    default:
      return {
        container: {
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 4,
        },
        text: {
          fontSize: 12,
          fontWeight: '500' as const,
        },
      };
  }
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '500',
  },
});
