import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useDatabase } from '../context/DatabaseContext';
import { useDatabaseStatistics } from '../hooks/usePoems';

/**
 * 主页 - 显示应用信息和导航
 */
export default function HomeScreen() {
  const router = useRouter();
  const { db, isReady, error } = useDatabase();
  const { stats, loading } = useDatabaseStatistics(db);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 头部 */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>📚 口袋诗词</Text>
        <Text style={styles.appSubtitle}>探索 287K+ 首经典诗词</Text>
      </View>

      {/* 数据库状态 */}
      <View style={styles.statusCard}>
        {error ? (
          <>
            <Text style={styles.errorTitle}>⚠️ 数据库初始化失败</Text>
            <Text style={styles.errorMessage}>{error.message}</Text>
          </>
        ) : isReady && !loading ? (
          <>
            <Text style={styles.statusTitle}>✅ 数据库已就绪</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{stats.total.toLocaleString()}</Text>
                <Text style={styles.statLabel}>诗词总数</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{stats.authors.toLocaleString()}</Text>
                <Text style={styles.statLabel}>作者数</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{stats.dynasties}</Text>
                <Text style={styles.statLabel}>朝代数</Text>
              </View>
            </View>
          </>
        ) : (
          <Text style={styles.loadingText}>初始化中...</Text>
        )}
      </View>

      {/* 功能介绍 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 功能介绍</Text>
        <FeatureItem
          icon="✨"
          title="随机诗词"
          description="每次点击获取一首随机诗词"
        />
        <FeatureItem
          icon="🔍"
          title="智能搜索"
          description="按标题、作者或内容搜索诗词"
        />
        <FeatureItem
          icon="👤"
          title="作者查询"
          description="浏览特定作者的所有诗词"
        />
        <FeatureItem
          icon="📖"
          title="朝代浏览"
          description="按朝代浏览诗词集合"
        />
      </View>

      {/* API 文档信息 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💻 开发者指南</Text>
        <Text style={styles.apiInfo}>
          本项目提供了完整的诗词数据库查询 API，包括：
        </Text>
        <Text style={styles.codeLabel}>• React Hooks - 在组件中使用</Text>
        <Text style={styles.codeLabel}>• PoemService - 面向对象 API</Text>
        <Text style={styles.codeLabel}>• PoemAPI - Pure Function API</Text>
        <Text style={styles.docLink}>
          详细文档请查看 API_USAGE.md
        </Text>
      </View>

      {/* 快速导航 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚀 快速导航</Text>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/demo')}
          activeOpacity={0.7}
        >
          <Text style={styles.navButtonText}>进入 Demo 页面</Text>
          <Text style={styles.navButtonArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* 技术栈 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ 技术栈</Text>
        <TechItem name="Expo" version="54+" />
        <TechItem name="React Native" version="0.81+" />
        <TechItem name="SQLite" version="expo-sqlite" />
        <TechItem name="TypeScript" version="5.9+" />
      </View>

      {/* 数据来源 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📚 数据来源</Text>
        <Text style={styles.dataInfo}>
          • 全唐诗 - 254,248 首{'\n'}
          • 宋词 - 21,053 首{'\n'}
          • 元曲 - 11,057 首{'\n'}
          • 诗经 - 305 首{'\n'}
          • 楚辞 - 65 首{'\n'}
          • 五代诗词 - 543 首{'\n'}
          • 及其他朝代作品
        </Text>
      </View>

      <View style={styles.footer} />
    </ScrollView>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

function TechItem({ name, version }: { name: string; version: string }) {
  return (
    <View style={styles.techItem}>
      <Text style={styles.techName}>{name}</Text>
      <Text style={styles.techVersion}>{version}</Text>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    marginBottom: 28,
    marginTop: 20,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  appSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4caf50',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f44',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center' as const,
  },
  statsGrid: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center' as const,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row' as const,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'flex-start' as const,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 12,
    color: '#666',
  },
  apiInfo: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  codeLabel: {
    fontSize: 12,
    color: '#444',
    marginLeft: 4,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  docLink: {
    fontSize: 13,
    color: '#0066cc',
    fontWeight: '600',
    marginTop: 8,
  },
  navButton: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center' as const,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  navButtonArrow: {
    fontSize: 20,
    color: '#fff',
  },
  techItem: {
    flexDirection: 'row' as const,
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 10,
    marginBottom: 6,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  techName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  techVersion: {
    fontSize: 12,
    color: '#999',
  },
  dataInfo: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
  },
  footer: {
    height: 40,
  },
};
