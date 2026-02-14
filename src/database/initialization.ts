import * as SQLite from 'expo-sqlite';

/**
 * 注意: 从 expo-sqlite 16.0+ 开始，使用 SQLiteProvider 组件来管理数据库连接
 * 详见 _layout.tsx 中的使用示例
 */


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
