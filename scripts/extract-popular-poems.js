#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 提取唐诗、宋诗和宋词各自搜索量最高的前300首诗词
 */

const rankDir = path.join(__dirname, '../lib/poems/rank');

// 获取指定目录下的所有JSON文件
function getJsonFiles(dir, pattern) {
  const files = fs.readdirSync(dir);
  return files.filter(f => f.match(pattern) && f.endsWith('.json')).sort();
}

// 合并搜索数据，取最高搜索量
function mergeSearchMetrics(poem) {
  const metrics = {
    baidu: poem.baidu || 0,
    bing: poem.bing || 0,
    bing_en: poem.bing_en || 0,
    google: poem.google || 0,
    so360: poem.so360 || 0,
  };
  
  // 计算综合搜索量（取最大值作为代表）
  return Math.max(...Object.values(metrics));
}

// 提取指定类别的诗词
function extractPoems(pattern, dir) {
  const files = getJsonFiles(dir, pattern);
  const allPoems = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      
      for (const poem of data) {
        const searchMetric = mergeSearchMetrics(poem);
        
        allPoems.push({
          author: poem.author || '',
          title: poem.title || poem.rhythmic || '', // 如果没有title，使用rhythmic
          rhythmic: poem.rhythmic || '',
          baidu: poem.baidu || 0,
          bing: poem.bing || 0,
          bing_en: poem.bing_en || 0,
          google: poem.google || 0,
          so360: poem.so360 || 0,
          searchMetric: searchMetric,
        });
      }
    } catch (err) {
      console.error(`Error reading ${file}:`, err.message);
    }
  }

  // 按搜索量排序，取前300
  return allPoems
    .sort((a, b) => b.searchMetric - a.searchMetric)
    .slice(0, 300)
    .map(poem => ({
      author: poem.author,
      title: poem.title,
      rhythmic: poem.rhythmic,
      baidu: poem.baidu,
      bing: poem.bing,
      bing_en: poem.bing_en,
      google: poem.google,
      so360: poem.so360,
    }));
}

console.log('开始提取诗词排名数据...\n');

// 提取唐诗
console.log('处理唐诗 (poet.tang)...');
const tangPoems = extractPoems(/^poet\.tang\.rank/, path.join(rankDir, 'poet'));
console.log(`  ✓ 提取唐诗: ${tangPoems.length} 首\n`);

// 提取宋诗
console.log('处理宋诗 (poet.song)...');
const songPoems = extractPoems(/^poet\.song\.rank/, path.join(rankDir, 'poet'));
console.log(`  ✓ 提取宋诗: ${songPoems.length} 首\n`);

// 提取宋词
console.log('处理宋词 (ci.song)...');
const ciPoems = extractPoems(/^ci\.song\.rank/, path.join(rankDir, 'ci'));
console.log(`  ✓ 提取宋词: ${ciPoems.length} 首\n`);

// 合并所有数据
const allData = [
  ...tangPoems.map(p => ({ ...p, type: 'tang' })),
  ...songPoems.map(p => ({ ...p, type: 'song' })),
  ...ciPoems.map(p => ({ ...p, type: 'ci' })),
];

// 输出文件
const outputFile = path.join(rankDir, 'popular-poems.json');
fs.writeFileSync(outputFile, JSON.stringify(allData, null, 2), 'utf-8');

console.log(`\n✅ 完成！`);
console.log(`总计: ${allData.length} 首诗词`);
console.log(`  - 唐诗: ${tangPoems.length} 首`);
console.log(`  - 宋诗: ${songPoems.length} 首`);
console.log(`  - 宋词: ${ciPoems.length} 首`);
console.log(`\n输出文件: ${outputFile}`);
