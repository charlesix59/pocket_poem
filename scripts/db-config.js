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

  // 配置 1: 唐诗数据 (poet.song.*.json)
  const tangshiDir = path.join(POEMS_DIR, '全唐诗');
  if (fs.existsSync(tangshiDir)) {
    const tangshiFiles = fs.readdirSync(tangshiDir)
      .filter(f => f.startsWith('poet.song.') && f.endsWith('.json'))
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

  // 配置 2: 宋词数据 (ci.song.*.json)
  const songciDir = path.join(POEMS_DIR, '宋词');
  if (fs.existsSync(songciDir)) {
    const songciFiles = fs.readdirSync(songciDir)
      .filter(f => f.startsWith('ci.song.') && f.endsWith('.json'))
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

  // 配置 3: 元曲数据 (yuanqu.json)
  const yuanquDir = path.join(POEMS_DIR, '元曲');
  if (fs.existsSync(yuanquDir)) {
    const yuanquFiles = fs.readdirSync(yuanquDir)
      .filter(f => f.endsWith('.json') && !f.endsWith('_error.json'))
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

  // 配置 4: 五代诗词 - 花间集 (huajianji-1-juan.json)
  const huajianjiDir = path.join(POEMS_DIR, '五代诗词/huajianji');
  if (fs.existsSync(huajianjiDir)) {
    const huajianjiFiles = fs.readdirSync(huajianjiDir)
      .filter(f => f.endsWith('.json') && !f.endsWith('_error.json'))
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

  // 配置 5: 五代诗词 - 南唐二主词 (poetrys.json)
  const nantangDir = path.join(POEMS_DIR, '五代诗词/nantang');
  if (fs.existsSync(nantangDir)) {
    const nantangFiles = fs.readdirSync(nantangDir)
      .filter(f => f.endsWith('.json') && !f.endsWith('_error.json') && f !== 'intro.json' && f !== 'authors.json')
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

  // 配置 6: 曹操诗集 (caocao.json)
  const caocaoDir = path.join(POEMS_DIR, '曹操诗集');
  if (fs.existsSync(caocaoDir)) {
    const caocaoFiles = fs.readdirSync(caocaoDir)
      .filter(f => f.endsWith('.json') && !f.endsWith('_error.json'))
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

  // 配置 7: 纳兰性德诗集 (纳兰性德诗集.json)
  const narlanDir = path.join(POEMS_DIR, '纳兰性德');
  if (fs.existsSync(narlanDir)) {
    const narlanFiles = fs.readdirSync(narlanDir)
      .filter(f => f.endsWith('.json') && !f.endsWith('_error.json'))
      .sort();

    narlanFiles.forEach(file => {
      sources.push({
        type: 'narlan',
        name: `纳兰性德诗集 (${file})`,
        path: path.join(narlanDir, file),
        dynasty: '清',
        processor: 'processNarlan'
      });
    });
  }

  // 配置 8: 楚辞 (chuci.json)
  const chuciDir = path.join(POEMS_DIR, '楚辞');
  if (fs.existsSync(chuciDir)) {
    const chuciFiles = fs.readdirSync(chuciDir)
      .filter(f => f.endsWith('.json') && !f.endsWith('_error.json'))
      .sort();

    chuciFiles.forEach(file => {
      sources.push({
        type: 'chuci',
        name: `楚辞 (${file})`,
        path: path.join(chuciDir, file),
        dynasty: '战国',
        processor: 'processChuci'
      });
    });
  }

  // 配置 9: 诗经 (shijing.json)
  const shijingDir = path.join(POEMS_DIR, '诗经');
  if (fs.existsSync(shijingDir)) {
    const shijingFiles = fs.readdirSync(shijingDir)
      .filter(f => f.endsWith('.json') && !f.endsWith('_error.json'))
      .sort();

    shijingFiles.forEach(file => {
      sources.push({
        type: 'shijing',
        name: `诗经 (${file})`,
        path: path.join(shijingDir, file),
        dynasty: '周',
        processor: 'processShijing'
      });
    });
  }

  return sources;
}

const DATA_SOURCES = generateDataSources();

module.exports = {
  DATA_SOURCES,
  POEMS_DIR
};
