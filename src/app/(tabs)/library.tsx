import { RandomPoem, HotPoems, PoemCategory } from '@/src/components';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type TabName = 'random' | 'category' | 'popular';

export default function LibraryScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabName>('random');

  const handleSearchPress = () => {
    router.push('/poem-search');
  };

  return (
    <SafeAreaView style={styles.container}>
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
          { key: 'category' as TabName, label: '诗词分类' },
          { key: 'popular' as TabName, label: '热门诗词' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab.key)}>
            <Text
              style={[
                styles.tabButtonText,
                activeTab === tab.key && styles.tabButtonTextActive,
              ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 内容区域 */}
      <View style={styles.contentSection}>
        {activeTab === 'random' && <RandomPoem />}

        {activeTab === 'category' && <PoemCategory />}

        {activeTab === 'popular' && <HotPoems />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F5F5F5',
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
    paddingBottom: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#333',
    borderColor: '#333',
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  contentSection: {
    flex: 1,
    paddingHorizontal: 0,
  },
});
