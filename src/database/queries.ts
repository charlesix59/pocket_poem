import * as SQLite from 'expo-sqlite';

export interface Poem {
  id: number;
  title: string;
  author?: string;
  dynasty?: string;
  content: string;
  hot?: number;
}

/**
 * 根据 ID 获取单首诗词
 */
export async function getPoemById(db: SQLite.SQLiteDatabase, id: number) {
  try {
    const poem = await db.getFirstAsync<Poem>(
      'SELECT * FROM poems WHERE id = ?',
      [id]
    );
    return poem || null;
  } catch (error) {
    console.error('获取诗词失败:', error);
    throw error;
  }
}

/**
 * 获取所有诗词（带分页）
 */
export async function getAllPoems(
  db: SQLite.SQLiteDatabase,
  limit: number = 20,
  offset: number = 0
) {
  try {
    const poems = await db.getAllAsync<Poem>(
      'SELECT * FROM poems ORDER BY id DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    return poems;
  } catch (error) {
    console.error('获取诗词列表失败:', error);
    throw error;
  }
}

/**
 * 按标题或内容搜索诗词
 */
export async function searchPoems(
  db: SQLite.SQLiteDatabase,
  keyword: string,
  limit: number = 20,
  offset: number = 0
) {
  try {
    const searchTerm = `%${keyword}%`;
    const poems = await db.getAllAsync<Poem>(
      `SELECT * FROM poems 
       WHERE title LIKE ? OR content LIKE ? OR author LIKE ?
       ORDER BY id DESC LIMIT ? OFFSET ?`,
      [searchTerm, searchTerm, searchTerm, limit, offset]
    );
    return poems;
  } catch (error) {
    console.error('搜索诗词失败:', error);
    throw error;
  }
}

/**
 * 按作者获取诗词
 */
export async function getPoemsByAuthor(
  db: SQLite.SQLiteDatabase,
  author: string,
  limit: number = 20,
  offset: number = 0
) {
  try {
    const poems = await db.getAllAsync<Poem>(
      'SELECT * FROM poems WHERE author = ? ORDER BY id DESC LIMIT ? OFFSET ?',
      [author, limit, offset]
    );
    return poems;
  } catch (error) {
    console.error('按作者获取诗词失败:', error);
    throw error;
  }
}

/**
 * 按朝代获取诗词
 */
export async function getPoemsByDynasty(
  db: SQLite.SQLiteDatabase,
  dynasty: string,
  limit: number = 20,
  offset: number = 0
) {
  try {
    const poems = await db.getAllAsync<Poem>(
      'SELECT * FROM poems WHERE dynasty = ? ORDER BY id DESC LIMIT ? OFFSET ?',
      [dynasty, limit, offset]
    );
    return poems;
  } catch (error) {
    console.error('按朝代获取诗词失败:', error);
    throw error;
  }
}

/**
 * 获取所有作者列表
 */
export async function getAllAuthors(db: SQLite.SQLiteDatabase) {
  try {
    const authors = await db.getAllAsync<{ author: string }>(
      `SELECT DISTINCT author FROM poems WHERE author IS NOT NULL ORDER BY author`
    );
    return authors.map(a => a.author);
  } catch (error) {
    console.error('获取作者列表失败:', error);
    throw error;
  }
}

/**
 * 获取所有朝代列表
 */
export async function getAllDynasties(db: SQLite.SQLiteDatabase) {
  try {
    const dynasties = await db.getAllAsync<{ dynasty: string }>(
      `SELECT DISTINCT dynasty FROM poems WHERE dynasty IS NOT NULL ORDER BY dynasty`
    );
    return dynasties.map(d => d.dynasty);
  } catch (error) {
    console.error('获取朝代列表失败:', error);
    throw error;
  }
}

/**
 * 获取诗词总数
 */
export async function getTotalPoemCount(db: SQLite.SQLiteDatabase) {
  try {
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM poems'
    );
    return result?.count || 0;
  } catch (error) {
    console.error('获取诗词总数失败:', error);
    throw error;
  }
}

/**
 * 按作者获取诗词总数
 */
export async function getPoemCountByAuthor(
  db: SQLite.SQLiteDatabase,
  author: string
) {
  try {
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM poems WHERE author = ?',
      [author]
    );
    return result?.count || 0;
  } catch (error) {
    console.error('获取作者诗词数失败:', error);
    throw error;
  }
}

/**
 * 按朝代获取诗词总数
 */
export async function getPoemCountByDynasty(
  db: SQLite.SQLiteDatabase,
  dynasty: string
) {
  try {
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM poems WHERE dynasty = ?',
      [dynasty]
    );
    return result?.count || 0;
  } catch (error) {
    console.error('获取朝代诗词数失败:', error);
    throw error;
  }
}

/**
 * 搜索诗词总数
 */
export async function getSearchResultCount(
  db: SQLite.SQLiteDatabase,
  keyword: string
) {
  try {
    const searchTerm = `%${keyword}%`;
    const result = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM poems 
       WHERE title LIKE ? OR content LIKE ? OR author LIKE ?`,
      [searchTerm, searchTerm, searchTerm]
    );
    return result?.count || 0;
  } catch (error) {
    console.error('获取搜索结果总数失败:', error);
    throw error;
  }
}

/**
 * 获取随机诗词
 */
export async function getRandomPoem(db: SQLite.SQLiteDatabase) {
  try {
    const poem = await db.getFirstAsync<Poem>(
      'SELECT * FROM poems ORDER BY RANDOM() LIMIT 1'
    );
    return poem || null;
  } catch (error) {
    console.error('获取随机诗词失败:', error);
    throw error;
  }
}

/**
 * 获取多首随机诗词
 */
export async function getRandomPoems(db: SQLite.SQLiteDatabase, count: number = 5) {
  try {
    const poems = await db.getAllAsync<Poem>(
      'SELECT * FROM poems ORDER BY RANDOM() LIMIT ?',
      [count]
    );
    return poems;
  } catch (error) {
    console.error('获取随机诗词失败:', error);
    throw error;
  }
}

/**
 * 从指定作者的作品中获取随机一首诗词
 */
export async function getRandomPoemByAuthors(
  db: SQLite.SQLiteDatabase,
  authors: string[]
) {
  try {
    if (!authors || authors.length === 0) {
      return null;
    }
    
    // 构建 SQL 中的占位符
    const placeholders = authors.map(() => '?').join(',');
    
    const poem = await db.getFirstAsync<Poem>(
      `SELECT * FROM poems 
       WHERE author IN (${placeholders})
       ORDER BY RANDOM() LIMIT 1`,
      authors
    );
    return poem || null;
  } catch (error) {
    console.error('从指定作者获取随机诗词失败:', error);
    throw error;
  }
}

/**
 * 从指定作者的作品中获取多首随机诗词
 */
export async function getRandomPoemsByAuthors(
  db: SQLite.SQLiteDatabase,
  authors: string[],
  count: number = 5
) {
  try {
    if (!authors || authors.length === 0) {
      return [];
    }
    
    // 构建 SQL 中的占位符
    const placeholders = authors.map(() => '?').join(',');
    
    const poems = await db.getAllAsync<Poem>(
      `SELECT * FROM poems 
       WHERE author IN (${placeholders})
       ORDER BY RANDOM() LIMIT ?`,
      [...authors, count]
    );
    return poems;
  } catch (error) {
    console.error('从指定作者获取随机诗词失败:', error);
    throw error;
  }
}

/**
 * 获取数据库统计信息
 */
export async function getDatabaseStatistics(db: SQLite.SQLiteDatabase) {
  try {
    const result = await db.getFirstAsync<{
      total: number;
      authors: number;
      dynasties: number;
    }>(
      `SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT author) as authors,
        COUNT(DISTINCT dynasty) as dynasties
       FROM poems`
    );
    return result || { total: 0, authors: 0, dynasties: 0 };
  } catch (error) {
    console.error('获取统计信息失败:', error);
    throw error;
  }
}

/**
 * 获取热门诗词（带分页）
 */
export async function getHotPoems(
  db: SQLite.SQLiteDatabase,
  limit: number = 20,
  offset: number = 0
) {
  try {
    const poems = await db.getAllAsync<Poem>(
      'SELECT * FROM poems WHERE hot = 1 ORDER BY id DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    return poems;
  } catch (error) {
    console.error('获取热门诗词失败:', error);
    throw error;
  }
}

/**
 * 获取热门诗词总数
 */
export async function getHotPoemCount(db: SQLite.SQLiteDatabase) {
  try {
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM poems WHERE hot = 1'
    );
    return result?.count || 0;
  } catch (error) {
    console.error('获取热门诗词总数失败:', error);
    throw error;
  }
}

/**
 * 获取所有作者及其作品数量，按作品数从高到低排序
 */
export async function getAuthorsWithCount(db: SQLite.SQLiteDatabase) {
  try {
    const authors = await db.getAllAsync<{ author: string; count: number }>(
      `SELECT author, COUNT(*) as count 
       FROM poems 
       WHERE author IS NOT NULL AND author != ''
       GROUP BY author 
       ORDER BY count DESC, author ASC`
    );
    return authors;
  } catch (error) {
    console.error('获取作者及作品数失败:', error);
    throw error;
  }
}

/**
 * 获取搜索建议（标题匹配，最多10个）
 */
export async function getSearchSuggestions(
  db: SQLite.SQLiteDatabase,
  keyword: string
) {
  try {
    if (!keyword.trim()) {
      return [];
    }
    const searchTerm = `%${keyword}%`;
    const suggestions = await db.getAllAsync<{ title: string }>(
      `SELECT DISTINCT title FROM poems 
       WHERE title LIKE ? OR content LIKE ? OR author LIKE ?
       LIMIT 10`,
      [searchTerm, searchTerm, searchTerm]
    );
    return suggestions.map(s => s.title);
  } catch (error) {
    console.error('获取搜索建议失败:', error);
    throw error;
  }
}

/**
 * 获取所有收藏夹
 */
export async function getAllCollections(db: SQLite.SQLiteDatabase) {
  try {
    const collections = await db.getAllAsync<{ id: number; name: string; description: string; is_default: number }>(
      `SELECT id, name, description, is_default FROM collections ORDER BY is_default DESC, created_at ASC`
    );
    return collections;
  } catch (error) {
    console.error('获取收藏夹列表失败:', error);
    throw error;
  }
}

/**
 * 获取默认收藏夹
 */
export async function getDefaultCollection(db: SQLite.SQLiteDatabase) {
  try {
    const collection = await db.getFirstAsync<{ id: number; name: string }>(
      `SELECT id, name FROM collections WHERE is_default = 1 LIMIT 1`
    );
    return collection;
  } catch (error) {
    console.error('获取默认收藏夹失败:', error);
    throw error;
  }
}

/**
 * 创建新收藏夹
 */
export async function createCollection(
  db: SQLite.SQLiteDatabase,
  name: string,
  description: string = ''
) {
  try {
    const result = await db.runAsync(
      `INSERT INTO collections (name, description, is_default) VALUES (?, ?, 0)`,
      [name, description]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('创建收藏夹失败:', error);
    throw error;
  }
}

/**
 * 添加诗词到收藏夹
 */
export async function addPoemToCollection(
  db: SQLite.SQLiteDatabase,
  collectionId: number,
  poemId: number
) {
  try {
    // 检查是否已经存在
    const existing = await db.getFirstAsync<{ id: number }>(
      `SELECT id FROM collection_items WHERE collection_id = ? AND poem_id = ?`,
      [collectionId, poemId]
    );

    if (existing) {
      return existing.id;
    }

    const result = await db.runAsync(
      `INSERT INTO collection_items (collection_id, poem_id) VALUES (?, ?)`,
      [collectionId, poemId]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('添加诗词到收藏夹失败:', error);
    throw error;
  }
}

/**
 * 检查诗词是否已在某个收藏夹中
 */
export async function isCollected(
  db: SQLite.SQLiteDatabase,
  collectionId: number,
  poemId: number
) {
  try {
    const result = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM collection_items WHERE collection_id = ? AND poem_id = ?`,
      [collectionId, poemId]
    );
    return (result?.count || 0) > 0;
  } catch (error) {
    console.error('检查收藏状态失败:', error);
    throw error;
  }
}

/**
 * 快速检查诗词是否在任何收藏夹中（不需要指定收藏夹ID）
 */
export async function isAnyCollected(
  db: SQLite.SQLiteDatabase,
  poemId: number
) {
  try {
    const result = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM collection_items WHERE poem_id = ?`,
      [poemId]
    );
    return (result?.count || 0) > 0;
  } catch (error) {
    console.error('检查收藏状态失败:', error);
    throw error;
  }
}

/**
 * 获取诗词已收藏的收藏夹列表（包含收藏夹ID和名称）
 */
export async function getCollectionsForPoem(
  db: SQLite.SQLiteDatabase,
  poemId: number
) {
  try {
    const result = await db.getAllAsync<{ id: number; name: string; is_default: number }>(
      `SELECT c.id, c.name, c.is_default FROM collections c
       INNER JOIN collection_items ci ON c.id = ci.collection_id
       WHERE ci.poem_id = ?
       ORDER BY c.is_default DESC, c.name ASC`,
      [poemId]
    );
    return result || [];
  } catch (error) {
    console.error('获取诗词的收藏夹列表失败:', error);
    throw error;
  }
}

/**
 * 获取收藏夹中的所有诗词
 */
export async function getCollectionPoems(
  db: SQLite.SQLiteDatabase,
  collectionId: number,
  limit: number = 20,
  offset: number = 0
) {
  try {
    const poems = await db.getAllAsync<Poem>(
      `SELECT p.* FROM poems p
       INNER JOIN collection_items ci ON p.id = ci.poem_id
       WHERE ci.collection_id = ?
       ORDER BY ci.created_at DESC
       LIMIT ? OFFSET ?`,
      [collectionId, limit, offset]
    );
    return poems;
  } catch (error) {
    console.error('获取收藏夹诗词失败:', error);
    throw error;
  }
}

/**
 * 获取收藏夹中的诗词总数
 */
export async function getCollectionPoemCount(
  db: SQLite.SQLiteDatabase,
  collectionId: number
) {
  try {
    const result = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM collection_items WHERE collection_id = ?`,
      [collectionId]
    );
    return result?.count || 0;
  } catch (error) {
    console.error('获取收藏夹诗词数失败:', error);
    throw error;
  }
}

/**
 * 从收藏夹中删除诗词
 */
export async function removePoemFromCollection(
  db: SQLite.SQLiteDatabase,
  collectionId: number,
  poemId: number
) {
  try {
    await db.runAsync(
      `DELETE FROM collection_items WHERE collection_id = ? AND poem_id = ?`,
      [collectionId, poemId]
    );
  } catch (error) {
    console.error('从收藏夹中删除诗词失败:', error);
    throw error;
  }
}

/**
 * 删除收藏夹
 */
export async function deleteCollection(db: SQLite.SQLiteDatabase, collectionId: number) {
  try {
    await db.runAsync(
      `DELETE FROM collections WHERE id = ? AND is_default = 0`,
      [collectionId]
    );
  } catch (error) {
    console.error('删除收藏夹失败:', error);
    throw error;
  }
}
