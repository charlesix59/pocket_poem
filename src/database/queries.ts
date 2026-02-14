import * as SQLite from 'expo-sqlite';

export interface Poem {
  id: number;
  title: string;
  author?: string;
  dynasty?: string;
  content: string;
  translation?: string;
  appreciation?: string;
  tags?: string;
  created_at?: string;
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
