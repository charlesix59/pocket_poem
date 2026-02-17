/**
 * Markdown 内容显示组件
 * 用于在应用中统一渲染 Markdown 格式的内容
 * 支持标题、列表、代码块、引用等各种 Markdown 元素
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import MarkdownDisplay from 'react-native-markdown-display';

export interface MarkdownContentProps {
  content: string;
  style?: any;
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({ content, style }) => {
  return (
    <View style={[styles.container, style]}>
      <MarkdownDisplay style={markdownStyles}>
        {content}
      </MarkdownDisplay>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

// Markdown 样式配置 - 统一使用
export const markdownStyles = {
  body: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  heading1: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  heading2: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#333',
    marginTop: 10,
    marginBottom: 6,
  },
  heading3: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  strong: {
    fontWeight: '600' as const,
    color: '#000',
  },
  em: {
    fontStyle: 'italic' as const,
    color: '#555',
  },
  paragraph: {
    marginBottom: 8,
    lineHeight: 22,
  },
  list: {
    marginBottom: 8,
  },
  listItem: {
    marginBottom: 4,
    marginLeft: 16,
    lineHeight: 22,
  },
  listItemContent: {
    lineHeight: 22,
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline' as const,
  },
  code_inline: {
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontFamily: 'Courier New',
    fontSize: 12,
    color: '#D81C1C',
  },
  code_block: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    fontFamily: 'Courier New',
    fontSize: 12,
    color: '#333',
    lineHeight: 18,
  },
  blockquote: {
    backgroundColor: '#F9F9F9',
    borderLeftWidth: 4,
    borderLeftColor: '#D0D0D0',
    paddingLeft: 12,
    paddingVertical: 8,
    marginVertical: 8,
    fontStyle: 'italic' as const,
  },
  hr: {
    backgroundColor: '#E0E0E0',
    height: 1,
    marginVertical: 12,
  },
  table: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginVertical: 8,
  },
  tableHeader: {
    backgroundColor: '#F5F5F5',
  },
  tableHeaderCell: {
    padding: 8,
    fontWeight: '600' as const,
    color: '#333',
  },
  tableRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tableRowCell: {
    padding: 8,
    color: '#333',
  },
};
