import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, ViewStyle } from 'react-native';

interface SafeContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
}

/**
 * SafeContainer 组件
 * 确保内容显示在安全区域内（避免 notch、status bar 等）
 * 使用 react-native-safe-area-context 替代已弃用的 SafeAreaView
 */
export const SafeContainer: React.FC<SafeContainerProps> = ({
  children,
  style,
  backgroundColor = '#fff',
}) => {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor }, style]}>
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
