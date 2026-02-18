import { SafeContainer } from '@/src/components';
import { PoemCard } from '@/src/components/PoemCard';
import { getSearchSuggestions, Poem, searchPoems } from '@/src/database/queries';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function PoemSearchScreen() {
  const db = useSQLiteContext();
  const router = useRouter();

  // 搜索输入
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  // 搜索结果
  const [searchResults, setSearchResults] = useState<Poem[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // 作者筛选
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);

  // 防抖相关
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 从搜索结果中提取所有作者
  const authors = useMemo(() => {
    const authorSet = new Set<string>();
    searchResults.forEach((poem) => {
      if (poem.author) {
        authorSet.add(poem.author);
      }
    });
    return Array.from(authorSet).sort();
  }, [searchResults]);

  // 根据选中的作者筛选搜索结果
  const filteredResults = useMemo(() => {
    if (!selectedAuthor) {
      return searchResults;
    }
    return searchResults.filter((poem) => poem.author === selectedAuthor);
  }, [searchResults, selectedAuthor]);

  // 获取搜索建议的函数
  const fetchSuggestions = useCallback(
    async (keyword: string) => {
      if (!db || !keyword.trim()) {
        setSuggestions([]);
        return;
      }

      setSuggestionsLoading(true);
      try {
        const results = await getSearchSuggestions(db, keyword);
        setSuggestions(results);
      } catch (error) {
        console.error('获取搜索建议失败:', error);
        setSuggestions([]);
      } finally {
        setSuggestionsLoading(false);
      }
    },
    [db],
  );

  // 处理搜索输入变化，带防抖
  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchQuery(text);

      // 清除之前的防抖计时器
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // 设置新的防抖计时器（500ms）
      debounceTimerRef.current = setTimeout(() => {
        fetchSuggestions(text);
      }, 500);
    },
    [fetchSuggestions],
  );

  // 执行完整搜索
  const performSearch = useCallback(
    async (keyword: string) => {
      if (!db || !keyword.trim()) {
        setSearchResults([]);
        setHasSearched(false);
        return;
      }

      setResultsLoading(true);
      setHasSearched(true);
      try {
        const results = await searchPoems(db, keyword, 100, 0);
        setSearchResults(results);
      } catch (error) {
        console.error('搜索失败:', error);
        setSearchResults([]);
      } finally {
        setResultsLoading(false);
      }
    },
    [db],
  );

  // 点击建议词时的处理
  const handleSuggestionPress = useCallback(
    (suggestion: string) => {
      setSearchQuery(suggestion);
      setSuggestions([]);
      Keyboard.dismiss();
      performSearch(suggestion);
    },
    [performSearch],
  );

  // 点击诗词卡片时的处理
  const handlePoemPress = useCallback(
    (poem: Poem) => {
      router.push({
        pathname: '/poem-detail',
        params: { poemId: poem.id },
      });
    },
    [router],
  );

  // 清空搜索
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setSuggestions([]);
    setSearchResults([]);
    setHasSearched(false);
    setSelectedAuthor(null);
  }, []);

  // 处理作者筛选
  const handleAuthorSelect = useCallback((author: string) => {
    setSelectedAuthor(author);
    setShowAuthorDropdown(false);
  }, []);

  // 清除作者筛选
  const handleClearAuthorFilter = useCallback(() => {
    setSelectedAuthor(null);
    setShowAuthorDropdown(false);
  }, []);

  // 渲染建议项
  const renderSuggestion = ({ item }: { item: string }) => (
    <TouchableOpacity style={styles.suggestionItem} onPress={() => handleSuggestionPress(item)}>
      <Ionicons name="search" size={16} color="#999" style={styles.suggestionIcon} />
      <Text style={styles.suggestionText} numberOfLines={1}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  // 渲染搜索结果
  const renderSearchResult = ({ item }: { item: Poem }) => (
    <PoemCard poem={item} onPress={() => handlePoemPress(item)} numberOfLines={3} />
  );

  return (
    <SafeContainer backgroundColor="#FFFFFF" edges={['left', 'right', 'bottom']}>
      {/* 搜索栏 */}
      <View style={styles.searchBarContainer}>
        <Ionicons name="search" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="搜索诗词、标题、作者..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearchChange}
          onSubmitEditing={() => performSearch(searchQuery)}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch} activeOpacity={0.7}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* 建议列表或搜索结果 */}
      {searchQuery.length === 0 ? (
        // 空状态
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={48} color="#DDD" />
          <Text style={styles.emptyText}>输入关键词搜索诗词</Text>
        </View>
      ) : suggestions.length > 0 ? (
        // 显示建议（无论是否已搜索）
        <FlatList
          data={suggestions}
          renderItem={renderSuggestion}
          keyExtractor={(item, index) => `${item}-${index}`}
          scrollEnabled={true}
          ListHeaderComponent={
            suggestionsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#333" />
              </View>
            ) : (
              <Text style={styles.suggestionsHeader}>推荐搜索</Text>
            )
          }
        />
      ) : hasSearched ? (
        // 显示搜索结果
        <>
          {resultsLoading && searchResults.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#333" />
            </View>
          ) : searchResults.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>未找到相关诗词</Text>
            </View>
          ) : (
            <>
              {/* 作者筛选下拉框 */}
              {authors.length > 0 && (
                <View style={styles.filterContainer}>
                  <Text style={styles.filterLabel}>按作者筛选：</Text>
                  <TouchableOpacity
                    style={styles.filterDropdown}
                    onPress={() => setShowAuthorDropdown(true)}>
                    <Text style={styles.filterDropdownText}>{selectedAuthor || '全部作者'}</Text>
                    <Ionicons name="chevron-down" size={16} color="#333" />
                  </TouchableOpacity>
                  {selectedAuthor && (
                    <TouchableOpacity
                      style={styles.clearFilterButton}
                      onPress={handleClearAuthorFilter}>
                      <Ionicons name="close" size={16} color="#999" />
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* 作者筛选下拉菜单 */}
              <Modal
                visible={showAuthorDropdown}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowAuthorDropdown(false)}>
                <TouchableOpacity
                  style={styles.modalOverlay}
                  activeOpacity={1}
                  onPress={() => setShowAuthorDropdown(false)}>
                  <View style={styles.dropdownMenu}>
                    <FlatList
                      data={authors}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={[
                            styles.authorOption,
                            selectedAuthor === item && styles.authorOptionSelected,
                          ]}
                          onPress={() => handleAuthorSelect(item)}>
                          <Text
                            style={[
                              styles.authorOptionText,
                              selectedAuthor === item && styles.authorOptionTextSelected,
                            ]}>
                            {item}
                          </Text>
                          {selectedAuthor === item && (
                            <Ionicons name="checkmark" size={18} color="#333" />
                          )}
                        </TouchableOpacity>
                      )}
                      keyExtractor={(item) => item}
                      scrollEnabled={true}
                      nestedScrollEnabled={true}
                    />
                  </View>
                </TouchableOpacity>
              </Modal>

              {/* 搜索结果列表 */}
              <FlatList
                data={filteredResults}
                renderItem={renderSearchResult}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={true}
                contentContainerStyle={styles.resultsList}
                ListHeaderComponent={
                  <Text style={styles.resultsHeader}>
                    {selectedAuthor
                      ? `${selectedAuthor} 的诗词 (${filteredResults.length})`
                      : `找到 ${filteredResults.length} 首诗词`}
                  </Text>
                }
              />
            </>
          )}
        </>
      ) : null}
    </SafeContainer>
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
  searchInput: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 14,
    color: '#333',
    textAlign: 'left',
    textAlignVertical: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  suggestionsHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9F9F9',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  suggestionIcon: {
    marginRight: 10,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9F9F9',
  },
  resultsList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    gap: 8,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  filterDropdown: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterDropdownText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  clearFilterButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
  },
  dropdownMenu: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 60,
    borderRadius: 8,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    overflow: 'hidden',
  },
  authorOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  authorOptionSelected: {
    backgroundColor: '#F9F9F9',
  },
  authorOptionText: {
    fontSize: 13,
    color: '#333',
  },
  authorOptionTextSelected: {
    fontWeight: '600',
    color: '#333',
  },
});
