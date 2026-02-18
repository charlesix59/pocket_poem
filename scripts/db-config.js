/* eslint-disable no-undef */
/**
 * 数据库配置文件
 * 定义所有数据源，方便添加新的诗词数据
 */

const path = require('path');
const fs = require('fs');

const POEMS_DIR = path.join(__dirname, '../lib/poems');

/**
 * 自动扫描并生成数据源配置
 * 支持批量导入多个 JSON 文件
 */
function generateDataSources() {
  const sources = [];

  // 配置 1: 唐诗数据 (仅加载简体版本 poet.tang.*.simplified.json)
  const tangshiDir = path.join(POEMS_DIR, '全唐诗');
  if (fs.existsSync(tangshiDir)) {
    const tangshiFiles = fs.readdirSync(tangshiDir)
      .filter(f => f.startsWith('poet.tang.') && f.includes('simplified') && f.endsWith('.json'))
      .sort((a, b) => {
        const aNum = parseInt(a.match(/\d+/)[0]);
        const bNum = parseInt(b.match(/\d+/)[0]);
        return aNum - bNum;
      });

    tangshiFiles.forEach(file => {
      sources.push({
        type: 'tangshi',
        name: `唐诗 (${file})`,
        path: path.join(tangshiDir, file),
        dynasty: '唐',
        processor: 'processTangshi'
      });
    });
  }

  // 配置 1.5: 宋词数据 (从全唐诗目录中加载 poet.song.*.simplified.json)
  const songpoetDir = path.join(POEMS_DIR, '全唐诗');
  if (fs.existsSync(songpoetDir)) {
    const songpoetFiles = fs.readdirSync(songpoetDir)
      .filter(f => f.startsWith('poet.song.') && f.includes('simplified') && f.endsWith('.json'))
      .sort((a, b) => {
        const aNum = parseInt(a.match(/\d+/)[0]);
        const bNum = parseInt(b.match(/\d+/)[0]);
        return aNum - bNum;
      });

    songpoetFiles.forEach(file => {
      sources.push({
        type: 'songshi',
        name: `宋诗 (${file})`,
        path: path.join(songpoetDir, file),
        dynasty: '宋',
        processor: 'processSongshi'
      });
    });
  }

  // 配置 2: 宋词数据 (仅加载简体版本 ci.song.*.simplified.json)
  const songciDir = path.join(POEMS_DIR, '宋词');
  if (fs.existsSync(songciDir)) {
    const songciFiles = fs.readdirSync(songciDir)
      .filter(f => f.startsWith('ci.song.') && f.includes('simplified') && f.endsWith('.json'))
      .sort((a, b) => {
        const aNum = parseInt(a.match(/\d+/)[0]);
        const bNum = parseInt(b.match(/\d+/)[0]);
        return aNum - bNum;
      });

    songciFiles.forEach(file => {
      sources.push({
        type: 'songci',
        name: `宋词 (${file})`,
        path: path.join(songciDir, file),
        dynasty: '宋',
        processor: 'processSongci'
      });
    });
  }

  // 配置 3: 元曲数据 (仅加载简体版本 yuanqu.simplified.json)
  const yuanquDir = path.join(POEMS_DIR, '元曲');
  if (fs.existsSync(yuanquDir)) {
    const yuanquFiles = fs.readdirSync(yuanquDir)
      .filter(f => f.endsWith('.json') && !f.endsWith('_error.json') && f.includes('simplified'))
      .sort();

    yuanquFiles.forEach(file => {
      sources.push({
        type: 'yuanqu',
        name: `元曲 (${file})`,
        path: path.join(yuanquDir, file),
        dynasty: '元',
        processor: 'processYuanqu'
      });
    });
  }

  // 配置 4: 五代诗词 - 花间集 (仅加载简体版本 *.simplified.json)
  const huajianjiDir = path.join(POEMS_DIR, '五代诗词/huajianji');
  if (fs.existsSync(huajianjiDir)) {
    const huajianjiFiles = fs.readdirSync(huajianjiDir)
      .filter(f => f.endsWith('.json') && !f.endsWith('_error.json') && f.includes('simplified'))
      .sort();

    huajianjiFiles.forEach(file => {
      sources.push({
        type: 'huajianji',
        name: `五代花间集 (${file})`,
        path: path.join(huajianjiDir, file),
        dynasty: '五代',
        processor: 'processHuajianji'
      });
    });
  }

  // 配置 5: 五代诗词 - 南唐二主词 (仅加载简体版本 *.simplified.json)
  const nantangDir = path.join(POEMS_DIR, '五代诗词/nantang');
  if (fs.existsSync(nantangDir)) {
    const nantangFiles = fs.readdirSync(nantangDir)
      .filter(f => f.endsWith('.json') && !f.endsWith('_error.json') && f !== 'intro.json' && f !== 'authors.json' && f.includes('simplified'))
      .sort();

    nantangFiles.forEach(file => {
      sources.push({
        type: 'nantang',
        name: `五代南唐二主词 (${file})`,
        path: path.join(nantangDir, file),
        dynasty: '五代',
        processor: 'processNantang'
      });
    });
  }

  // 配置 6: 曹操诗集 (仅加载简体版本 caocao.simplified.json)
  const caocaoDir = path.join(POEMS_DIR, '曹操诗集');
  if (fs.existsSync(caocaoDir)) {
    const caocaoFiles = fs.readdirSync(caocaoDir)
      .filter(f => f.endsWith('.json') && !f.endsWith('_error.json') && f.includes('simplified'))
      .sort();

    caocaoFiles.forEach(file => {
      sources.push({
        type: 'caocao',
        name: `曹操诗集 (${file})`,
        path: path.join(caocaoDir, file),
        dynasty: '汉',
        processor: 'processCaocao'
      });
    });
  }

  // 配置 7: 纳兰性德诗集 (优先加载简体版本)
  const narlanDir = path.join(POEMS_DIR, '纳兰性德');
  if (fs.existsSync(narlanDir)) {
    const narlanFiles = fs.readdirSync(narlanDir)
      .filter(f => f.endsWith('.json') && !f.endsWith('_error.json'))
      .sort();

    narlanFiles.forEach(file => {
      // 优先选择 simplified 版本，没有则用普通版本
      const baseFileName = file.replace('.simplified.json', '.json');
      const simplifiedPath = path.join(narlanDir, baseFileName.replace('.json', '.simplified.json'));
      const finalPath = fs.existsSync(simplifiedPath) ? simplifiedPath : path.join(narlanDir, file);
      
      // 避免重复：如果是 simplified 版本且已加载过，跳过
      if (file.includes('simplified') || !fs.existsSync(simplifiedPath)) {
        sources.push({
          type: 'narlan',
          name: `纳兰性德诗集 (${file})`,
          path: finalPath,
          dynasty: '清',
          processor: 'processNarlan'
        });
      }
    });
  }

  // 配置 8: 楚辞 (优先加载简体版本)
  const chuciDir = path.join(POEMS_DIR, '楚辞');
  if (fs.existsSync(chuciDir)) {
    const chuciFiles = fs.readdirSync(chuciDir)
      .filter(f => f.endsWith('.json') && !f.endsWith('_error.json'))
      .sort();

    chuciFiles.forEach(file => {
      const baseFileName = file.replace('.simplified.json', '.json');
      const simplifiedPath = path.join(chuciDir, baseFileName.replace('.json', '.simplified.json'));
      const finalPath = fs.existsSync(simplifiedPath) ? simplifiedPath : path.join(chuciDir, file);
      
      if (file.includes('simplified') || !fs.existsSync(simplifiedPath)) {
        sources.push({
          type: 'chuci',
          name: `楚辞 (${file})`,
          path: finalPath,
          dynasty: '战国',
          processor: 'processChuci'
        });
      }
    });
  }

  // 配置 9: 诗经 (优先加载简体版本)
  const shijingDir = path.join(POEMS_DIR, '诗经');
  if (fs.existsSync(shijingDir)) {
    const shijingFiles = fs.readdirSync(shijingDir)
      .filter(f => f.endsWith('.json') && !f.endsWith('_error.json'))
      .sort();

    shijingFiles.forEach(file => {
      const baseFileName = file.replace('.simplified.json', '.json');
      const simplifiedPath = path.join(shijingDir, baseFileName.replace('.json', '.simplified.json'));
      const finalPath = fs.existsSync(simplifiedPath) ? simplifiedPath : path.join(shijingDir, file);
      
      if (file.includes('simplified') || !fs.existsSync(simplifiedPath)) {
        sources.push({
          type: 'shijing',
          name: `诗经 (${file})`,
          path: finalPath,
          dynasty: '周',
          processor: 'processShijing'
        });
      }
    });
  }

  // 配置 10: 千家诗 (仅加载简体版本 qianjiashi.simplified.json)
  const qianjiaShiFile = path.join(POEMS_DIR, '蒙学/qianjiashi.simplified.json');
  if (fs.existsSync(qianjiaShiFile)) {
    sources.push({
      type: 'qianjiashi',
      name: '千家诗',
      path: qianjiaShiFile,
      dynasty: '宋',
      processor: 'processQianjiashi'
    });
  }

  // 配置 11: 唐诗三百首 (仅加载简体版本 tangshisanbaishou.simplified.json)
  const tangshiBaiShouFile = path.join(POEMS_DIR, '蒙学/tangshisanbaishou.simplified.json');
  if (fs.existsSync(tangshiBaiShouFile)) {
    sources.push({
      type: 'tangshisanbaishou',
      name: '唐诗三百首',
      path: tangshiBaiShouFile,
      dynasty: '唐',
      processor: 'processTangshisanbaishou'
    });
  }


  return sources;
}

const DATA_SOURCES = generateDataSources();

module.exports = {
  DATA_SOURCES,
  POEMS_DIR
};
