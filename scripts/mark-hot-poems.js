#!/usr/bin/env node

/**
 * 脚本用途：根据 popular-poems.json 中的诗词数据，标记数据库中的热门诗词
 * 匹配规则：使用 author + title 进行匹配，如果匹配到多个，只设置第一个
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../pocket_poem.db');
const POPULAR_POEMS_PATH = path.join(__dirname, '../lib/poems/rank/popular-poems.json');

/**
 * 标记热门诗词
 */
function markHotPoems() {
  try {
    console.log('🚀 开始标记热门诗词...\n');

    // 检查数据库是否存在
    if (!fs.existsSync(DB_PATH)) {
      console.error('❌ 错误：数据库文件不存在，请先运行 generate-db.js');
      process.exit(1);
    }

    // 检查 popular-poems.json 是否存在
    if (!fs.existsSync(POPULAR_POEMS_PATH)) {
      console.error('❌ 错误：popular-poems.json 文件不存在');
      process.exit(1);
    }

    // 打开数据库
    const db = new Database(DB_PATH);
    console.log(`📂 数据库位置: ${DB_PATH}\n`);

    // 读取 popular-poems.json
    const popularPoems = JSON.parse(fs.readFileSync(POPULAR_POEMS_PATH, 'utf-8'));
    console.log(`📊 加载热门诗词数据: ${popularPoems.length} 首\n`);

    // 创建匹配的诗词集合（避免重复标记）
    const matchedPoems = new Set();

    // 创建 UPDATE 语句
    const updateStmt = db.prepare(`
      UPDATE poems SET hot = 1 WHERE id = ?
    `);

    // 创建查询语句 - 按 author 和 title 查询
    const searchStmt = db.prepare(`
      SELECT id FROM poems WHERE author = ? AND title = ?
    `);

    console.log('🔍 匹配诗词...\n');
    let matchCount = 0;

    // 遍历热门诗词
    for (const poem of popularPoems) {
      const { author, title } = poem;

      // 跳过没有 author 或 title 的记录
      if (!author || !title) {
        continue;
      }

      // 在数据库中查询
      const result = searchStmt.get(author, title);

      if (result && !matchedPoems.has(result.id)) {
        // 标记为热门诗词
        updateStmt.run(result.id);
        matchedPoems.add(result.id);
        matchCount++;

        // 每 100 首显示一次进度
        if (matchCount % 100 === 0) {
          console.log(`  ✓ 已标记 ${matchCount} 首...`);
        }
      }
    }

    console.log(`\n✅ 完成！`);
    console.log(`📌 成功标记 ${matchCount} 首热门诗词`);

    // 统计信息
    const hotCount = db.prepare('SELECT COUNT(*) as count FROM poems WHERE hot = 1').get();
    const totalCount = db.prepare('SELECT COUNT(*) as count FROM poems').get();

    console.log(`\n📈 统计信息:`);
    console.log(`  - 数据库总诗词数: ${totalCount.count}`);
    console.log(`  - 标记为热门的诗词数: ${hotCount.count}`);
    console.log(`  - 占比: ${((hotCount.count / totalCount.count) * 100).toFixed(2)}%`);

    db.close();
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

// 运行脚本
markHotPoems();
