import { RandomPoem, HotPoems } from '@/src/components';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type TabName = 'random' | 'popular' | 'favorite';

export default function LibraryScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabName>('random');

  const handleSearchPress = () => {
    router.push('/poem-search');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 搜索栏 */}
        <TouchableOpacity
          style={styles.searchBarContainer}
          activeOpacity={0.7}
          onPress={handleSearchPress}>
          <Ionicons name="search" size={20} color="#999" />
          <Text style={styles.searchBarPlaceholder}>搜索诗词、作者、朝代...</Text>
        </TouchableOpacity>

        {/* Tab 导航 */}
        <View style={styles.tabContainer}>
          {[
            { key: 'random' as TabName, label: '随机诗词' },
            { key: 'popular' as TabName, label: '热门诗词' },
            { key: 'favorite' as TabName, label: '我的收藏' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab.key)}>
              <Text
                style={[styles.tabButtonText, activeTab === tab.key && styles.tabButtonTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 内容区域 */}
        <View style={styles.contentSection}>
          {activeTab === 'random' && <RandomPoem />}

          {activeTab === 'popular' && <HotPoems />}

          {activeTab === 'favorite' && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>我的收藏</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  scrollView: {
    flex: 1,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchBarPlaceholder: {
    marginLeft: 10,
    fontSize: 14,
    color: '#999',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#333',
    borderColor: '#333',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  contentSection: {
    paddingHorizontal: 0,
    marginBottom: 40,
  },
  emptyState: {
    paddingVertical: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
  },
});
