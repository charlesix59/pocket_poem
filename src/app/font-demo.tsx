import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import * as Font from 'expo-font';
import { useSQLiteContext } from 'expo-sqlite';
import { SafeContainer } from '@/src/components';
import { useRandomPoems } from '@/src/hooks/usePoems';

/**
 * 字体Demo组件 - 展示自定义诗词字体的使用
 */
export default function FontDemoScreen() {
  const db = useSQLiteContext();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'poem' | 'compare'>('basic');
  
  const randomPoems = useRandomPoems(db, 3);

  // 加载自定义字体
  useEffect(() => {
    const loadFonts = async () => {
      try {
        // 调试：检查 require 是否能找到文件
        console.log('[字体加载] 开始加载字体文件...');
        
        // 使用 require() 加载字体文件
        // require() 会让 Metro bundler 处理资源，确保字体文件被正确打包
        const fontUri = require('../../assets/poetry-font.woff2');
        console.log('[字体加载] 获取到 fontUri:', typeof fontUri, fontUri);
        
        await Font.loadAsync({
          'PoetryFont': fontUri,
        });
        console.log('✓ PoetryFont 字体加载成功');
      } catch (error) {
        console.warn('⚠️ 字体加载失败，将使用系统字体显示');
        console.warn('   错误信息:', error instanceof Error ? error.message : String(error));
        console.log('   完整错误:', error);
        console.log('\n【解决方案】');
        console.log('1. 确保已执行: npx expo start --clear');
        console.log('2. 检查 metro.config.js 中是否包含 woff2 扩展名');
        console.log('3. 确保 assets/poetry-font.woff2 文件存在');
      } finally {
        // 无论字体是否加载成功，都继续运行应用
        setFontsLoaded(true);
      }
    };

    loadFonts();
  }, []);

  // 初始化加载诗词
  useEffect(() => {
    if (fontsLoaded && activeTab === 'poem') {
      randomPoems.fetchRandomPoems();
    }
  }, [fontsLoaded, activeTab]);

  if (!fontsLoaded) {
    return (
      <SafeContainer backgroundColor="#f5f5f5">
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#666" />
          <Text style={styles.loadingText}>正在加载字体...</Text>
        </View>
      </SafeContainer>
    );
  }

  return (
    <SafeContainer backgroundColor="#f5f5f5">
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* 标题 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🎨 字体 Demo</Text>
          <Text style={styles.headerSubtitle}>展示诗词专用字体效果</Text>
        </View>

        {/* 标签页 */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'basic' && styles.activeTab]}
            onPress={() => setActiveTab('basic')}
          >
            <Text style={[styles.tabText, activeTab === 'basic' && styles.activeTabText]}>
              基本展示
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'poem' && styles.activeTab]}
            onPress={() => setActiveTab('poem')}
          >
            <Text style={[styles.tabText, activeTab === 'poem' && styles.activeTabText]}>
              诗词展示
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'compare' && styles.activeTab]}
            onPress={() => setActiveTab('compare')}
          >
            <Text style={[styles.tabText, activeTab === 'compare' && styles.activeTabText]}>
              对比
            </Text>
          </TouchableOpacity>
        </View>

        {/* 基本展示 - 常见汉字 */}
        {activeTab === 'basic' && (
          <View style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📝 常见汉字展示</Text>
              
              <View style={styles.demoCard}>
                <Text style={[styles.demoLabel, styles.defaultFont]}>默认字体</Text>
                <Text style={[styles.demoText, styles.defaultFont]}>
                  诗词歌赋，古韵悠扬，笔墨纸砚，书法精妙
                </Text>
              </View>

              <View style={styles.demoCard}>
                <Text style={[styles.demoLabel, styles.customFont]}>PoetryFont（诗词字体）</Text>
                <Text style={[styles.demoText, styles.customFont]}>
                  诗词歌赋，古韵悠扬，笔墨纸砚，书法精妙
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🖊️ 文字样式展示</Text>
              
              <View style={styles.styleCard}>
                <Text style={[styles.styleText, styles.customFont, { fontSize: 16 }]}>
                  小号字体（16px）
                </Text>
                <Text style={[styles.styleText, styles.customFont, { fontSize: 20 }]}>
                  中号字体（20px）
                </Text>
                <Text style={[styles.styleText, styles.customFont, { fontSize: 24 }]}>
                  大号字体（24px）
                </Text>
                <Text style={[styles.styleText, styles.customFont, { fontSize: 28 }]}>
                  超大号字体（28px）
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📖 诗词名句</Text>
              
              <View style={[styles.quoteCard, { borderLeftColor: '#d4a574' }]}>
                <Text style={[styles.quoteText, styles.customFont]}>
                  "千里莺啼绿映红，水村山郭酒旗风。"
                </Text>
                <Text style={styles.quoteSource}>— 杜牧《江南春》</Text>
              </View>

              <View style={[styles.quoteCard, { borderLeftColor: '#c5a572' }]}>
                <Text style={[styles.quoteText, styles.customFont]}>
                  "莫笑农家腊酒浑，丰年留客足鸡豚。"
                </Text>
                <Text style={styles.quoteSource}>— 陆游《游山西村》</Text>
              </View>

              <View style={[styles.quoteCard, { borderLeftColor: '#b89968' }]}>
                <Text style={[styles.quoteText, styles.customFont]}>
                  "春风又绿江南岸，明月何时照我还。"
                </Text>
                <Text style={styles.quoteSource}>— 王安石《泊船瓜洲》</Text>
              </View>
            </View>
          </View>
        )}

        {/* 诗词展示 - 随机诗词 */}
        {activeTab === 'poem' && (
          <View style={styles.content}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => randomPoems.fetchRandomPoems()}
              disabled={randomPoems.loading}
            >
              <Text style={styles.buttonText}>
                {randomPoems.loading ? '加载中...' : '🎲 刷新诗词'}
              </Text>
            </TouchableOpacity>

            {randomPoems.loading ? (
              <ActivityIndicator size="large" color="#666" style={styles.loader} />
            ) : randomPoems.poems.length > 0 ? (
              randomPoems.poems.map((poem) => (
                <View key={poem.id} style={styles.poemCard}>
                  <Text style={[styles.poemTitle, styles.customFont]}>
                    {poem.title}
                  </Text>
                  {poem.author && (
                    <Text style={[styles.poemAuthor, styles.customFont]}>
                      {poem.author} {poem.dynasty && `(${poem.dynasty})`}
                    </Text>
                  )}
                  <Text style={[styles.poemContent, styles.customFont]}>
                    {poem.content}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>暂无诗词数据</Text>
            )}
          </View>
        )}

        {/* 对比展示 */}
        {activeTab === 'compare' && (
          <View style={styles.content}>
            <View style={styles.comparisonSection}>
              <Text style={styles.sectionTitle}>🔍 字体对比</Text>
              
              <View style={styles.comparisonGroup}>
                <View style={styles.comparisonItem}>
                  <Text style={styles.comparisonLabel}>系统默认字体</Text>
                  <View style={[styles.comparisonBox, { backgroundColor: '#f0f0f0' }]}>
                    <Text style={[styles.comparisonText, styles.defaultFont]}>
                      春眠不觉晓
                    </Text>
                    <Text style={[styles.comparisonText, styles.defaultFont]}>
                      处处闻啼鸟
                    </Text>
                    <Text style={[styles.comparisonText, styles.defaultFont]}>
                      夜来风雨声
                    </Text>
                    <Text style={[styles.comparisonText, styles.defaultFont]}>
                      花落知多少
                    </Text>
                  </View>
                </View>

                <View style={styles.comparisonItem}>
                  <Text style={styles.comparisonLabel}>PoetryFont 字体</Text>
                  <View style={[styles.comparisonBox, { backgroundColor: '#f5f0e8' }]}>
                    <Text style={[styles.comparisonText, styles.customFont]}>
                      春眠不觉晓
                    </Text>
                    <Text style={[styles.comparisonText, styles.customFont]}>
                      处处闻啼鸟
                    </Text>
                    <Text style={[styles.comparisonText, styles.customFont]}>
                      夜来风雨声
                    </Text>
                    <Text style={[styles.comparisonText, styles.customFont]}>
                      花落知多少
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>📌 PoetryFont 优势</Text>
                <Text style={[styles.infoText, styles.customFont]}>
                  ✓ 专为诗词设计的字形
                </Text>
                <Text style={[styles.infoText, styles.customFont]}>
                  ✓ 支持繁体和简体汉字
                </Text>
                <Text style={[styles.infoText, styles.customFont]}>
                  ✓ 古风韵味，展现诗意
                </Text>
                <Text style={[styles.infoText, styles.customFont]}>
                  ✓ 优化的字间距和行高
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* 底部间距 */}
        <View style={styles.footer} />
      </ScrollView>
    </SafeContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    marginBottom: 24,
    marginTop: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeTab: {
    backgroundColor: '#333',
    borderColor: '#333',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  demoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  demoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  demoText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#333',
  },
  defaultFont: {
    fontFamily: 'System',
  },
  customFont: {
    fontFamily: 'PoetryFont',
  },
  styleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  styleText: {
    marginBottom: 12,
    color: '#333',
    lineHeight: 32,
  },
  quoteCard: {
    backgroundColor: '#fff',
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  quoteText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  quoteSource: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  poemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  poemTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  poemAuthor: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  poemContent: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  comparisonSection: {
    marginBottom: 24,
  },
  comparisonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  comparisonItem: {
    flex: 1,
  },
  comparisonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  comparisonBox: {
    borderRadius: 8,
    padding: 12,
    minHeight: 160,
  },
  comparisonText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#333',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#f5f0e8',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    marginBottom: 6,
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
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  footer: {
    height: 40,
  },
});
