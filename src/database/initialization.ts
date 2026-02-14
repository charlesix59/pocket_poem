import * as SQLite from 'expo-sqlite';

/**
 * 获取或创建数据库实例
 */
export async function getDatabase() {
  const db = await SQLite.openDatabaseAsync('pocket_poem.db');
  await initializeDatabase(db);
  return db;
}

/**
 * 初始化数据库表结构
 */
async function initializeDatabase(db: SQLite.SQLiteDatabase) {
  try {
    // 创建诗词表
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS poems (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT,
        dynasty TEXT,
        content TEXT NOT NULL,
        translation TEXT,
        appreciation TEXT,
        tags TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 创建索引以加快查询性能
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_author ON poems(author);
      CREATE INDEX IF NOT EXISTS idx_dynasty ON poems(dynasty);
      CREATE INDEX IF NOT EXISTS idx_title ON poems(title);
    `);

    console.log('✓ 数据库初始化成功');
  } catch (error) {
    console.error('✗ 数据库初始化失败:', error);
    throw error;
  }
}

/**
 * 导入诗词数据到数据库
 * @param db 数据库实例
 * @param poems 诗词数据数组
 */
export async function importPoems(
  db: SQLite.SQLiteDatabase,
  poems: {
    title: string;
    author?: string;
    dynasty?: string;
    content: string;
    translation?: string;
    appreciation?: string;
    tags?: string;
  }[]
) {
  try {
    await db.withTransactionAsync(async () => {
      for (const poem of poems) {
        await db.runAsync(
          `INSERT INTO poems (title, author, dynasty, content, translation, appreciation, tags)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            poem.title,
            poem.author || null,
            poem.dynasty || null,
            poem.content,
            poem.translation || null,
            poem.appreciation || null,
            poem.tags || null,
          ]
        );
      }
    });
    console.log(`✓ 成功导入 ${poems.length} 首诗词`);
  } catch (error) {
    console.error('✗ 导入诗词失败:', error);
    throw error;
  }
}

/**
 * 清空所有诗词数据
 */
export async function clearAllPoems(db: SQLite.SQLiteDatabase) {
  try {
    await db.execAsync('DELETE FROM poems');
    console.log('✓ 已清空所有诗词');
  } catch (error) {
    console.error('✗ 清空诗词失败:', error);
    throw error;
  }
}

/**
 * 获取数据库统计信息
 */
export async function getStatistics(db: SQLite.SQLiteDatabase) {
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
    console.error('✗ 获取统计信息失败:', error);
    throw error;
  }
}
