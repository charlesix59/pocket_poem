#!/usr/bin/env node

/**
 * 确保数据库文件存在
 * 如果 pocket_poem.db 不存在，会自动生成
 * 这个脚本在 npm install 后自动运行
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dbPath = path.join(__dirname, '../pocket_poem.db');

try {
  // 检查数据库是否存在
  if (fs.existsSync(dbPath)) {
    console.log('✅ Database already exists');
    process.exit(0);
  }

  console.log('📦 Database not found, generating...');
  
  // 运行生成数据库的脚本
  execSync('node ./scripts/generate-db.js', {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });

  console.log('✅ Database generated successfully');
} catch (error) {
  console.error('❌ Error ensuring database:', error.message);
  // 不退出，允许构建继续进行
  // 因为有些环境可能不支持生成数据库
}
