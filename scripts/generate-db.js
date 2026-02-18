#!/usr/bin/env node

/**
 * 脚本用途：生成预构建的 SQLite 数据库文件
 * 将唐诗和宋词数据导入到 pocket_poem.db
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const { DATA_SOURCES } = require('./db-config');

const DB_PATH = path.join(__dirname, '../pocket_poem.db');

/**
 * 初始化数据库表结构
 */
function initializeDatabase(db) {
  console.log('📋 初始化数据库表...');
  
  // 创建诗词表
  db.exec(`
    CREATE TABLE IF NOT EXISTS poems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT,
      dynasty TEXT,
      content TEXT NOT NULL,
      hot INTEGER DEFAULT 0
    );
  `);

  // 创建收藏夹表
  db.exec(`
    CREATE TABLE IF NOT EXISTS collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_default INTEGER DEFAULT 0
    );
  `);

  // 创建收藏项表
  db.exec(`
    CREATE TABLE IF NOT EXISTS collection_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      collection_id INTEGER NOT NULL,
      poem_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
      FOREIGN KEY (poem_id) REFERENCES poems(id) ON DELETE CASCADE,
      UNIQUE(collection_id, poem_id)
    );
  `);

  // 创建索引
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_author ON poems(author);
    CREATE INDEX IF NOT EXISTS idx_title ON poems(title);
    CREATE INDEX IF NOT EXISTS idx_collection_id ON collection_items(collection_id);
    CREATE INDEX IF NOT EXISTS idx_poem_id ON collection_items(poem_id);
  `);

  // 创建默认收藏夹
  try {
    const checkDefault = db.prepare(`SELECT COUNT(*) as count FROM collections WHERE is_default = 1`).get();
    if (checkDefault.count === 0) {
      db.prepare(`
        INSERT INTO collections (name, description, is_default) 
        VALUES (?, ?, 1)
      `).run('默认收藏', '默认收藏夹');
    }
  } catch (error) {
    // 忽略插入错误，可能默认收藏夹已存在
  }

  console.log('✓ 表结构创建完成');
}

/**
 * 处理唐诗数据
 */
function processTangshi(data, dynasty) {
  return data.map(item => ({
    title: item.title || '无题',
    author: item.author || '佚名',
    dynasty: dynasty,
    content: Array.isArray(item.paragraphs) 
      ? item.paragraphs.join('\n') 
      : (item.paragraphs || '')
  }));
}

/**
 * 处理宋词数据
 */
function processSongci(data, dynasty) {
  return data.map(item => ({
    title: item.title || item.rhythmic || '无题',
    author: item.author || '佚名',
    dynasty: dynasty,
    content: Array.isArray(item.paragraphs)
      ? item.paragraphs.join('\n')
      : (item.paragraphs || '')
  }));
}

/**
 * 处理元曲数据
 */
function processYuanqu(data, dynasty) {
  return data.map(item => ({
    title: item.title || '无题',
    author: item.author || '佚名',
    dynasty: dynasty,
    content: Array.isArray(item.paragraphs)
      ? item.paragraphs.join('\n')
      : (item.paragraphs || '')
  }));
}

/**
 * 处理五代花间集数据
 */
function processHuajianji(data, dynasty) {
  return data.map(item => ({
    title: item.title || item.rhythmic || '无题',
    author: item.author || '佚名',
    dynasty: dynasty,
    content: Array.isArray(item.paragraphs)
      ? item.paragraphs.join('\n')
      : (item.paragraphs || ''),
  }));
}

/**
 * 处理五代南唐二主词数据
 */
function processNantang(data, dynasty) {
  return data.map(item => ({
    title: item.title || item.rhythmic || '无题',
    author: item.author || '佚名',
    dynasty: dynasty,
    content: Array.isArray(item.paragraphs)
      ? item.paragraphs.join('\n')
      : (item.paragraphs || ''),
  }));
}

/**
 * 处理曹操诗集数据
 */
function processCaocao(data, dynasty) {
  return data.map(item => ({
    title: item.title || '无题',
    author: item.author || '曹操',
    dynasty: dynasty,
    content: Array.isArray(item.paragraphs)
      ? item.paragraphs.join('\n')
      : (item.paragraphs || ''),
  }));
}


/**
 * 处理千家诗数据
 * 结构：{ title, author, content: [{ type, content: [...] }] }
 * 每个 content 内是 { chapter, author, paragraphs }
 */
function processQianjiashi(data, dynasty) {
  const poems = [];
  
  if (Array.isArray(data.content)) {
    data.content.forEach(section => {
      if (Array.isArray(section.content)) {
        section.content.forEach(poem => {
          if (poem.chapter) {
            poems.push({
              title: poem.chapter,
              author: poem.author || '佚名',
              dynasty: dynasty,
              content: Array.isArray(poem.paragraphs)
                ? poem.paragraphs.join('\n')
                : (poem.paragraphs || '')
            });
          }
        });
      }
    });
  }
  
  return poems;
}

/**
 * 处理唐诗三百首数据
 * 结构类似千家诗：{ title, content: [{ type, content: [...] }] }
 * 每个 content 内是 { chapter, author, paragraphs }
 */
function processTangshisanbaishou(data, dynasty) {
  const poems = [];
  
  if (Array.isArray(data.content)) {
    data.content.forEach(section => {
      if (Array.isArray(section.content)) {
        section.content.forEach(poem => {
          if (poem.chapter) {
            // 如果有 subchapter，拼接到 title 里
            let title = poem.chapter;
            if (poem.subchapter && poem.subchapter !== poem.chapter) {
              title = `${poem.chapter}（${poem.subchapter}）`;
            }
            
            poems.push({
              title: title,
              author: poem.author || '佚名',
              dynasty: dynasty,
              content: Array.isArray(poem.paragraphs)
                ? poem.paragraphs.join('\n')
                : (poem.paragraphs || '')
            });
          }
        });
      }
    });
  }
  
  return poems;
}

/**
 * 处理纳兰性德诗集数据
 */
function processNarlan(data, dynasty) {
  return data.map(item => ({
    title: item.title || '无题',
    author: item.author || '纳兰性德',
    dynasty: dynasty,
    content: Array.isArray(item.para)
      ? item.para.join('\n')
      : (item.para ? Array.isArray(item.para) ? item.para.join('\n') : item.para : ''),
  }));
}

/**
 * 处理楚辞数据
 * title 和 section 合成为 title: ${section}·${title}
 */
function processChuci(data, dynasty) {
  return data.map(item => {
    let title = item.title || '无题';
    if (item.section) {
      title = `${item.section}·${title}`;
    }
    return {
      title: title,
      author: item.author || '佚名',
      dynasty: dynasty,
      content: Array.isArray(item.content)
        ? item.content.join('\n')
        : (item.content || ''),
      translation: null,
      appreciation: null,
      tags: null
    };
  });
}

/**
 * 处理诗经数据
 * title、chapter 和 section 合成为 title: ${chapter}·${section}·${title}
 */
function processShijing(data, dynasty) {
  return data.map(item => {
    let title = item.title || '无题';
    if (item.chapter || item.section) {
      const chapter = item.chapter || '';
      const section = item.section || '';
      title = `${chapter}·${section}·${title}`;
    }
    return {
      title: title,
      author: item.author || '佚名',
      dynasty: dynasty,
      content: Array.isArray(item.content)
        ? item.content.join('\n')
        : (item.content || ''),
      translation: null,
      appreciation: null,
      tags: null
    };
  });
}

/**
 * 导入诗词数据到数据库
 */
function importPoemsToDatabase(db, poems, showProgress = true) {
  if (showProgress) {
    console.log(`📝 导入 ${poems.length} 首诗词...`);
  }
  
  const stmt = db.prepare(`
    INSERT INTO poems (title, author, dynasty, content)
    VALUES (?, ?, ?, ?)
  `);

  const BATCH_SIZE = 5000; // 批量处理大小
  const transaction = db.transaction((poemsToInsert) => {
    let count = 0;
    for (const poem of poemsToInsert) {
      stmt.run(
        poem.title,
        poem.author,
        poem.dynasty,
        poem.content
      );
      count++;
      
      // 每导入 BATCH_SIZE 首显示一次进度
      if (showProgress && count % BATCH_SIZE === 0) {
        console.log(`  ✓ 已导入 ${count} 首...`);
      }
    }
    return count;
  });

  const imported = transaction(poems);
  if (showProgress) {
    console.log(`✓ 成功导入 ${imported} 首诗词`);
  }
  return imported;
}

/**
 * 主函数
 */
function main() {
  try {
    console.log('\n🚀 开始生成数据库...\n');

    // 删除旧数据库文件（如果存在）
    if (fs.existsSync(DB_PATH)) {
      fs.unlinkSync(DB_PATH);
      console.log('🗑️  已删除旧数据库文件');
    }

    // 打开数据库
    const db = new Database(DB_PATH);
    console.log(`📂 数据库位置: ${DB_PATH}\n`);

    // 初始化表
    initializeDatabase(db);

    let totalImported = 0;

    // 按朝代和类型分组数据源，避免重复
    const sourcesByType = {};
    for (const source of DATA_SOURCES) {
      const key = `${source.type}_${source.dynasty}`;
      if (!sourcesByType[key]) {
        sourcesByType[key] = [];
      }
      sourcesByType[key].push(source);
    }

    // 处理每组数据源
    let processedCount = 0;
    for (const key in sourcesByType) {
      const sources = sourcesByType[key];
      if (sources.length === 0) continue;

      const firstSource = sources[0];
      const totalFiles = sources.length;
      console.log(`\n📚 处理 ${firstSource.name.split(' ')[0]} (共 ${totalFiles} 个文件)...`);

      let allData = [];
      let validFiles = 0;

      for (let i = 0; i < sources.length; i++) {
        const source = sources[i];
        const currentFile = i + 1;

        // 检查文件是否存在
        if (!fs.existsSync(source.path)) {
          console.warn(`  ⚠️  跳过: ${path.basename(source.path)} (文件不存在)`);
          continue;
        }

        try {
          // 读取数据
          const fileContent = fs.readFileSync(source.path, 'utf-8');
          const rawData = JSON.parse(fileContent);

           // 转换数据格式
            let processedData;
            if (source.type === 'tangshi') {
              processedData = processTangshi(rawData, source.dynasty);
            } else if (source.type === 'songci') {
              processedData = processSongci(rawData, source.dynasty);
            } else if (source.type === 'yuanqu') {
              processedData = processYuanqu(rawData, source.dynasty);
            } else if (source.type === 'huajianji') {
              processedData = processHuajianji(rawData, source.dynasty);
            } else if (source.type === 'nantang') {
              processedData = processNantang(rawData, source.dynasty);
            } else if (source.type === 'caocao') {
              processedData = processCaocao(rawData, source.dynasty);
            } else if (source.type === 'narlan') {
              processedData = processNarlan(rawData, source.dynasty);
            } else if (source.type === 'chuci') {
              processedData = processChuci(rawData, source.dynasty);
            } else if (source.type === 'shijing') {
              processedData = processShijing(rawData, source.dynasty);
            } else if (source.type === 'qianjiashi') {
              processedData = processQianjiashi(rawData, source.dynasty);
            } else if (source.type === 'tangshisanbaishou') {
              processedData = processTangshisanbaishou(rawData, source.dynasty);
            }

          allData = allData.concat(processedData);
          validFiles++;

          if (currentFile % 10 === 0 || currentFile === totalFiles) {
            console.log(`  📖 已读取 ${currentFile}/${totalFiles} 个文件...`);
          }

        } catch (error) {
          console.error(`  ✗ 处理 ${path.basename(source.path)} 时出错: ${error.message}`);
        }
      }

      // 批量导入该组数据
      if (allData.length > 0) {
        console.log(`📝 导入 ${validFiles} 个文件的 ${allData.length} 首诗词...`);
        const imported = importPoemsToDatabase(db, allData, false);
        totalImported += imported;
        console.log(`✓ 成功导入 ${imported} 首诗词\n`);
        processedCount++;
      }
    }

    // 获取统计信息
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT author) as authors,
        COUNT(DISTINCT dynasty) as dynasties
      FROM poems
    `).get();

    console.log('\n✅ 数据库生成完成！\n');
    console.log('📊 统计信息:');
    console.log(`  • 总诗词数: ${stats.total}`);
    console.log(`  • 作者数: ${stats.authors}`);
    console.log(`  • 朝代数: ${stats.dynasties}`);
    console.log(`\n📂 数据库文件: ${DB_PATH}\n`);

    // 关闭数据库
    db.close();

  } catch (error) {
    console.error('\n❌ 生成数据库时出错:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// 运行脚本
main();
