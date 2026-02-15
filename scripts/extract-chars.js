#!/usr/bin/env node

/**
 * 字符提取脚本
 * 从诗词数据库中提取所有使用的字符，用于字体子集化
 * 
 * 使用方法：
 * node scripts/extract-chars.js
 * 
 * 输出文件：
 * - assets/chars.txt（所有唯一字符，每行一个）
 * - assets/chars-all.txt（所有字符无换行）
 * - assets/chars-unicode.txt（Unicode 编码格式）
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../assets/pocket_poem.db');
const outputDir = path.join(__dirname, '../assets');

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('📚 开始提取诗词库中的所有字符...');
console.log(`📂 数据库路径: ${dbPath}`);

try {
  // 打开数据库
  const db = new Database(dbPath);
  
  // 获取所有诗词表
  const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' 
    ORDER BY name
  `).all();

  console.log(`\n📋 找到 ${tables.length} 个表：`);
  tables.forEach(t => console.log(`   - ${t.name}`));

  // 收集所有字符
  const charSet = new Set();
  let totalPoems = 0;

  // 从所有表中提取字符
  tables.forEach(table => {
    console.log(`\n🔍 正在扫描表: ${table.name}`);
    
    try {
      // 获取表的列信息
      const columns = db.prepare(`PRAGMA table_info(${table.name})`).all();
      const textColumns = columns
        .filter(col => {
          const type = col.type.toLowerCase();
          return type.includes('text') || type.includes('varchar') || type === '';
        })
        .map(col => col.name);

      console.log(`   📝 文本列: ${textColumns.join(', ')}`);

      // 获取表中的所有数据
      const rows = db.prepare(`SELECT * FROM ${table.name}`).all();
      console.log(`   📊 行数: ${rows.length}`);

      // 从文本列中提取字符
      rows.forEach(row => {
        textColumns.forEach(col => {
          const value = row[col];
          if (value && typeof value === 'string') {
            // 提取每个字符
            for (const char of value) {
              charSet.add(char);
            }
            totalPoems++;
          }
        });
      });
    } catch (err) {
      console.warn(`   ⚠️  处理表 ${table.name} 时出错: ${err.message}`);
    }
  });

  // 关闭数据库
  db.close();

  // 排序字符集
  const sortedChars = Array.from(charSet).sort();
  
  console.log(`\n✅ 提取完成！`);
  console.log(`   📈 总字符数: ${sortedChars.length}`);
  console.log(`   📝 总处理字符位置: ${totalPoems}`);

  // 分类统计
  const stats = {
    chinese: 0,
    english: 0,
    number: 0,
    punctuation: 0,
    space: 0,
    other: 0
  };

  sortedChars.forEach(char => {
    const code = char.charCodeAt(0);
    if (code >= 0x4E00 && code <= 0x9FFF) {
      stats.chinese++;
    } else if ((code >= 0x41 && code <= 0x5A) || (code >= 0x61 && code <= 0x7A)) {
      stats.english++;
    } else if (code >= 0x30 && code <= 0x39) {
      stats.number++;
    } else if (/\p{P}/u.test(char) || /[，。！？；：""''（）《》【】]/u.test(char)) {
      stats.punctuation++;
    } else if (/\s/.test(char)) {
      stats.space++;
    } else {
      stats.other++;
    }
  });

  console.log(`\n📊 字符分类统计：`);
  console.log(`   🈲 中文字符: ${stats.chinese}`);
  console.log(`   🔤 英文字符: ${stats.english}`);
  console.log(`   🔢 数字: ${stats.number}`);
  console.log(`   ✏️  标点符号: ${stats.punctuation}`);
  console.log(`   ⎵ 空白字符: ${stats.space}`);
  console.log(`   ❓ 其他: ${stats.other}`);

  // 输出文件 1: 每行一个字符（排除不可见字符和特殊字符）
  const printableChars = sortedChars.filter(c => {
    const code = c.charCodeAt(0);
    // 排除控制字符（0x00-0x1F）、删除字符（0x7F）和其他不可见字符
    return !(/[\n\r\t\x00-\x1F\x7F]/.test(c));
  });
  const charsByLine = printableChars.join('\n');
  const charsFilePath = path.join(outputDir, 'chars.txt');
  fs.writeFileSync(charsFilePath, charsByLine, 'utf-8');
  console.log(`\n💾 已保存到: ${charsFilePath}`);

  // 输出文件 2: 所有字符无换行（用于复制） - 排除不可见字符
  const charsAllPath = path.join(outputDir, 'chars-all.txt');
  fs.writeFileSync(charsAllPath, printableChars.join(''), 'utf-8');
  console.log(`💾 已保存到: ${charsAllPath}`);

  // 输出文件 3: Unicode 范围格式（用于 fonttools）
  const unicodeRanges = generateUnicodeRanges(sortedChars);
  const unicodePath = path.join(outputDir, 'chars-unicode.txt');
  fs.writeFileSync(unicodePath, unicodeRanges, 'utf-8');
  console.log(`💾 已保存到: ${unicodePath}`);

  // 输出文件 4: JSON 格式（便于其他脚本使用）
  const jsonPath = path.join(outputDir, 'chars.json');
  const jsonData = {
    total: sortedChars.length,
    characters: sortedChars,
    stats,
    generatedAt: new Date().toISOString()
  };
  fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf-8');
  console.log(`💾 已保存到: ${jsonPath}`);

  console.log(`\n🎉 字符提取完成！`);
  console.log(`\n📌 下一步：使用以下命令进行字体子集化`);
  console.log(`\n   方案 1: 使用 fonttools (Python)`);
  console.log(`   pyftsubset your-font.ttf --text-file=assets/chars-all.txt --output-file=poetry-font.ttf`);
  console.log(`\n   方案 2: 使用 glyphhanger (Node.js)`);
  console.log(`   glyphhanger --text-file=assets/chars-all.txt your-font.ttf --subset=poetry-font.ttf`);

} catch (error) {
  console.error('❌ 错误:', error.message);
  console.error(error.stack);
  process.exit(1);
}

/**
 * 生成 Unicode 范围格式（用于 fonttools）
 * 例如：U+0030-U+0039,U+4E00-U+9FFF
 */
function generateUnicodeRanges(chars) {
  const codePoints = chars.map(c => c.charCodeAt(0));
  const ranges = [];
  let start = codePoints[0];
  let end = codePoints[0];

  for (let i = 1; i < codePoints.length; i++) {
    if (codePoints[i] === end + 1) {
      end = codePoints[i];
    } else {
      if (start === end) {
        ranges.push(`U+${start.toString(16).toUpperCase().padStart(4, '0')}`);
      } else {
        ranges.push(`U+${start.toString(16).toUpperCase().padStart(4, '0')}-U+${end.toString(16).toUpperCase().padStart(4, '0')}`);
      }
      start = codePoints[i];
      end = codePoints[i];
    }
  }

  // 添加最后一个范围
  if (start === end) {
    ranges.push(`U+${start.toString(16).toUpperCase().padStart(4, '0')}`);
  } else {
    ranges.push(`U+${start.toString(16).toUpperCase().padStart(4, '0')}-U+${end.toString(16).toUpperCase().padStart(4, '0')}`);
  }

  return ranges.join(',');
}
