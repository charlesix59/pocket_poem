/**
 * 可选中的文本组件
 * 基于 TextInput 的只读模式，支持原生文本选中功能
 */

import React, { useRef, useState } from 'react';
import {
  TextInput,
  StyleSheet,
  TouchableOpacity,
  View,
  Dimensions,
  Alert,
  Clipboard,
  Text,
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

export interface SelectableTextProps {
  text: string;
  style?: any;
  onAsk?: (selectedText: string) => void;
}

export const SelectableText: React.FC<SelectableTextProps> = ({
  text,
  style,
  onAsk,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const textInputRef = useRef<TextInput>(null);

  // 处理文本选中
  const handleSelectionChange = (event: any) => {
    const { start, end } = event.nativeEvent.selection;
    
    if (start !== end) {
      // 用户选中了文本
      const selected = text.substring(start, end);
      setSelectedText(selected);
      
      // 获取 TextInput 的位置和尺寸
      textInputRef.current?.measure((x, y, width, height) => {
        // 计算选中文本所在行的位置
        // 通过选中文本长度和字符宽度估算行数
        const lineHeight = 24; // 预估行高
        const selectedStart = text.substring(0, start);
        const lineIndex = (selectedStart.match(/\n/g) || []).length;
        
        // 菜单显示在选中内容下方（该行的下一行）
        const menuY = y + (lineIndex + 1) * lineHeight + 8; // 距离下方 8px
        
        setMenuPosition({
          x: x + width / 2,
          y: menuY,
        });
        setMenuVisible(true);
      });
    }
  };

  const handleCopy = async () => {
    try {
      await Clipboard.setString(selectedText);
      setMenuVisible(false);
      Alert.alert('成功', '已复制到剪贴板');
    } catch {
      Alert.alert('错误', '复制失败');
    }
  };

  const handleAskAI = () => {
    setMenuVisible(false);
    if (onAsk && selectedText) {
      onAsk(selectedText);
    }
  };

  // 处理文本区域点击 - 关闭菜单并清除选中
  const handleTextInputPress = () => {
    if (menuVisible) {
      setMenuVisible(false);
      setSelectedText('');
    }
  };

  const windowWidth = Dimensions.get('window').width;
  const menuWidth = 140;
  let menuLeft = menuPosition.x - menuWidth / 2;

  if (menuLeft < 10) {
    menuLeft = 10;
  } else if (menuLeft + menuWidth > windowWidth - 10) {
    menuLeft = windowWidth - menuWidth - 10;
  }

  return (
    <>
      <TextInput
        ref={textInputRef}
        value={text}
        editable={false}
        multiline={true}
        style={[styles.textInput, style]}
        onSelectionChange={handleSelectionChange}
        onPress={handleTextInputPress}
      />

      {/* 隐形蒙层 - 点击时关闭菜单 */}
      {menuVisible && (
        <TouchableOpacity
          style={styles.invisibleOverlay}
          onPress={() => {
            setMenuVisible(false);
            setSelectedText('');
          }}
          activeOpacity={1}
        />
      )}

      {/* 自定义菜单 */}
      {menuVisible && (
        <View
          style={[
            styles.menuAbsolute,
            {
              left: menuLeft,
              top: menuPosition.y,
            },
          ]}>
          {/* 复制选项 */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleCopy}
            activeOpacity={0.7}>
            <IconSymbol name="doc.on.doc" size={16} color="#007AFF" />
            <Text style={styles.menuItemText}>复制</Text>
          </TouchableOpacity>

          {/* 分割线 */}
          <View style={styles.divider} />

          {/* 问 AI 选项 */}
          {onAsk && (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleAskAI}
              activeOpacity={0.7}>
              <IconSymbol name="sparkles" size={16} color="#007AFF" />
              <Text style={styles.menuItemText}>问 AI</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  textInput: {
    padding: 0,
    margin: 0,
  },
  invisibleOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  menuAbsolute: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    minWidth: 140,
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E8E8',
  },
});
