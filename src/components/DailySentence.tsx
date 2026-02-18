import Ionicons from '@expo/vector-icons/Ionicons';
import * as Font from 'expo-font';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { divideSentence, getPoemFragment } from '../utils/sentence';

interface DailySentenceProps {
  onRefresh?: () => void;
}

interface VerseData {
  id: number;
  content: string;
  title: string;
  author?: string;
  dynasty?: string;
}

/**
 * 生成随机纤维纹理数据
 */
interface Fiber {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
}

const generateFibers = (): Fiber[] => {
  const fibers: Fiber[] = [];
  const fiberCount = 60; // 细丝数量

  for (let i = 0; i < fiberCount; i++) {
    fibers.push({
      id: `fiber-${i}`,
      x: Math.random() * 100, // 百分比位置
      y: Math.random() * 100,
      width: Math.random() * 40 + 20, // 20-60px (更短，约原来的1/2)
      height: Math.random() * 0.6 + 0.4, // 0.4-1.0px (稍微粗一点)
      rotation: Math.random() * 360, // 随机角度
      opacity: Math.random() * 0.5 + 0.25, // 0.25-0.75 透明度 (更深)
    });
  }

  return fibers;
};

/**
 * 每日诗句卡片组件
 * 古典宣纸质感背景，竖版文本排列
 */
export const DailySentence: React.FC<DailySentenceProps> = ({ onRefresh }) => {
  const db = useSQLiteContext();
  const router = useRouter();
  const [verse, setVerse] = useState<VerseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // 生成并缓存纤维纹理（避免每次渲染重新生成）
  const fibers = useMemo(() => generateFibers(), []);

  // 加载自定义字体
  useEffect(() => {
    const loadFonts = async () => {
      try {
        const fontUri = require('../../assets/poetry-font.woff2');
        await Font.loadAsync({
          PoetryFont: fontUri,
        });
        setFontsLoaded(true);
      } catch (error) {
        console.warn('⚠️ 诗词字体加载失败:', error);
        setFontsLoaded(true); // 字体加载失败也继续显示，使用系统字体
      }
    };

    loadFonts();
  }, []);

  // 获取随机诗句
  const fetchRandomVerse = useCallback(async () => {
    if (!db) return;
    setLoading(true);
    try {
      const result = await db.getFirstAsync<any>(
        `SELECT id, title, content, author, dynasty 
         FROM poems 
         ORDER BY RANDOM() 
         LIMIT 1`,
      );

      if (result) {
        setVerse({
          id: result.id,
          content: result.content || '',
          title: result.title || '',
          author: result.author,
          dynasty: result.dynasty,
        });
      }
    } catch (error) {
      console.error('获取随机诗句失败:', error);
    } finally {
      setLoading(false);
    }
  }, [db]);

  // 初始化加载
  useEffect(() => {
    fetchRandomVerse();
  }, [db, fetchRandomVerse]);

  const handleRefresh = async () => {
    await fetchRandomVerse();
    onRefresh?.();
  };

  const handleCardPress = () => {
    if (verse) {
      router.push({
        pathname: '/poem-detail',
        params: { poemId: verse.id.toString() },
      });
    }
  };

  // 将文本转换为竖版排列（从右到左）
  const renderVerticalText = (text: string) => {
    // 使用 divideSentence 函数分割句子
    const lines = divideSentence(text);

    // 反转行数组，使其从右往左排列
    const reversedLines = lines.reverse();

    return reversedLines.map((line, lineIndex) => (
      <View key={lineIndex} style={styles.verticalLine}>
        {line.split('').map((char, charIndex) => (
          <Text key={charIndex} style={styles.verticalChar}>
            {char}
          </Text>
        ))}
      </View>
    ));
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handleCardPress} activeOpacity={0.95}>
      {/* 宣纸背景 */}
      <View style={styles.paperBackground} />
      {/* 基础纹理层 */}
      <View style={styles.textureOverlay} />
      {/* 古典边框 */}
      <View style={styles.borderFrame}>
        {/* 细丝纤维层 - 在 borderFrame 内部，这样显示在内容下方 */}
        <View style={styles.fibersContainer}>
          {fibers.map((fiber) => (
            <View
              key={fiber.id}
              style={[
                styles.fiber,
                {
                  left: `${fiber.x}%`,
                  top: `${fiber.y}%`,
                  width: fiber.width,
                  height: fiber.height,
                  transform: [{ rotate: `${fiber.rotation}deg` }],
                  opacity: fiber.opacity,
                },
              ]}
            />
          ))}
        </View>

        {/* 半透明白色背景层，让纤维透出来 */}
        <View style={styles.contentBackground} />

        {/* 顶部按钮 */}
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#8B4513" />
          ) : (
            <View style={styles.refreshButtonContent}>
              <Ionicons name="refresh" size={14} color="#8B4513" />
              <Text style={styles.refreshButtonText}>新的一句</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* 主要内容区域 */}
        <View style={styles.contentContainer}>
          {verse ? (
            <View style={styles.verseWrapper}>
              {/* 竖版诗文内容 */}
              <View style={styles.verticalTextContainer}>
                {renderVerticalText(getPoemFragment(verse.content))}
              </View>

              {/* 诗词信息 - 横排 */}
              <View style={styles.infoSection}>
                <Text style={styles.verseTitle}>《{verse.title}》</Text>
                {verse.author && (
                  <Text style={styles.verseAuthor}>
                    {verse.author}
                    {verse.dynasty && ` · ${verse.dynasty}`}
                  </Text>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#8B4513" />
              <Text style={styles.loadingText}>正在加载诗句...</Text>
            </View>
          )}
        </View>

        {/* 装饰角落 */}
        <View style={[styles.cornerDecoration, styles.topLeft]} />
        <View style={[styles.cornerDecoration, styles.topRight]} />
        <View style={[styles.cornerDecoration, styles.bottomLeft]} />
        <View style={[styles.cornerDecoration, styles.bottomRight]} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 16,
    backgroundColor: '#FFF8F0',
    position: 'relative',
    height: 500,
  },
  paperBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFF8F0',
    zIndex: 0,
    borderRadius: 12,
  },
  textureOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(230, 140, 100, 0.08)',
    zIndex: 1,
  },
  fibersContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    overflow: 'hidden',
  },
  fiber: {
    position: 'absolute',
    backgroundColor: '#A0453F',
    borderRadius: 999, // 完全圆润的两端
    shadowColor: '#8B3A3A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 1,
  },
  contentBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 248, 240, 0.75)',
    zIndex: 1,
  },
  borderFrame: {
    padding: 24,
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#D2691E',
    borderStyle: 'solid',
    position: 'relative',
    zIndex: 3,
    borderRadius: 12,
    overflow: 'hidden',
  },
  refreshButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(210, 105, 30, 0.1)',
    borderWidth: 1,
    borderColor: '#CD853F',
    borderRadius: 6,
    marginBottom: 20,
    zIndex: 2,
    position: 'relative',
  },
  refreshButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  refreshButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B4513',
    letterSpacing: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 480,
    zIndex: 2,
    position: 'relative',
  },
  verseWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  verticalTextContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 1,
    marginBottom: 24,
    flex: 1,
  },
  verticalLine: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verticalChar: {
    fontSize: 24,
    fontWeight: '500' as any,
    color: '#3D2817',
    lineHeight: 32,
    width: 32,
    textAlign: 'center' as any,
    height: 32 as any,
    fontFamily: 'PoetryFont',
  } as any,
  infoSection: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#D2691E',
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  verseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5C4033',
    marginBottom: 4,
    letterSpacing: 0.5,
    fontFamily: 'PoetryFont',
  },
  verseAuthor: {
    fontSize: 14,
    color: '#8B6F47',
    fontStyle: 'italic',
    fontFamily: 'PoetryFont',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 280,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#8B4513',
  },
  // 装饰角落
  cornerDecoration: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderColor: '#D2691E',
  },
  topLeft: {
    top: 8,
    left: 8,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  topRight: {
    top: 8,
    right: 8,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  bottomLeft: {
    bottom: 8,
    left: 8,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  bottomRight: {
    bottom: 8,
    right: 8,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
});
