#!/usr/bin/env node

/**
 * 脚本用途：验证数据库完整性和查询示例
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../pocket_poem.db');

function verifyDatabase() {
  try {
    // 检查文件是否存在
    if (!fs.existsSync(DB_PATH)) {
      console.error('\n❌ 数据库文件不存在！');
      console.log('   运行命令生成数据库：npm run generate-db\n');
      process.exit(1);
    }

    console.log('\n📊 数据库验证报告\n');
    console.log(`📂 数据库文件: ${DB_PATH}`);
    
    // 获取文件大小
    const stats = fs.statSync(DB_PATH);
    const fileSizeInKB = (stats.size / 1024).toFixed(2);
    console.log(`📏 文件大小: ${fileSizeInKB} KB\n`);

    // 打开数据库
    const db = new Database(DB_PATH);

    // 检查表是否存在
    const tables = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    ).all();

    if (tables.length === 0) {
      console.error('❌ 数据库中没有找到表！\n');
      process.exit(1);
    }

    console.log('✓ 表结构:');
    for (const table of tables) {
      const columns = db.prepare(`PRAGMA table_info(${table.name})`).all();
      console.log(`\n  📋 ${table.name}:`);
      for (const col of columns) {
        console.log(`     • ${col.name} (${col.type})`);
      }
    }

    // 获取统计信息
    console.log('\n✓ 统计信息:');
    const stats_result = db.prepare(`
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT author) as authors,
        COUNT(DISTINCT dynasty) as dynasties
      FROM poems
    `).get();

    console.log(`  • 总诗词数: ${stats_result.total}`);
    console.log(`  • 作者数: ${stats_result.authors}`);
    console.log(`  • 朝代数: ${stats_result.dynasties}`);

    // 按朝代统计
    console.log('\n✓ 按朝代分布:');
    const dynastyStats = db.prepare(`
      SELECT dynasty, COUNT(*) as count
      FROM poems
      GROUP BY dynasty
      ORDER BY count DESC
    `).all();

    for (const stat of dynastyStats) {
      console.log(`  • ${stat.dynasty}: ${stat.count} 首`);
    }

    // 获取一些示例数据
    console.log('\n✓ 示例数据:');
    const samples = db.prepare(`
      SELECT id, title, author, dynasty FROM poems LIMIT 3
    `).all();

    for (const poem of samples) {
      console.log(`  • ${poem.title} (${poem.author} - ${poem.dynasty})`);
    }

    // 检查索引
    console.log('\n✓ 索引信息:');
    const indexes = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='index' ORDER BY name"
    ).all();

    if (indexes.length === 0) {
      console.log('  没有找到索引');
    } else {
      for (const idx of indexes) {
        if (!idx.name.startsWith('sqlite_')) {
          console.log(`  • ${idx.name}`);
        }
      }
    }

    // 数据库完整性检查
    console.log('\n✓ 完整性检查:');
    try {
      const integrity = db.prepare('PRAGMA integrity_check').get();
      if (integrity.integrity_check === 'ok') {
        console.log('  ✓ 数据库完整性：正常');
      } else {
        console.log(`  ⚠️  数据库完整性：${integrity.integrity_check}`);
      }
    } catch (e) {
      console.log('  ⚠️  无法检查完整性');
    }

    console.log('\n✅ 数据库验证成功！\n');

    // 关闭数据库
    db.close();

  } catch (error) {
    console.error('\n❌ 验证失败:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// 运行验证
verifyDatabase();
