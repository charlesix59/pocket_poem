/**
 * 示例诗词数据
 * 你可以将这个文件作为模板，或者从外部文件中加载诗词数据
 */

export const samplePoems = [
  {
    title: '静夜思',
    author: '李白',
    dynasty: '唐',
    content: '床前明月光，疑是地上霜。举头望明月，低头思故乡。',
  },
  {
    title: '登高',
    author: '杜甫',
    dynasty: '唐',
    content: '风急天高猿啸哀，渚清沙白鸟飞回。无边落木萧萧下，不尽长江滚滚来。万里悲秋常作客，百年多病独登台。艰难苦恨繁霜鬓，潦倒新停浊酒杯。',
  },
  {
    title: '春晓',
    author: '孟浩然',
    dynasty: '唐',
    content: '春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。',
  },
  {
    title: '望庐山瀑布',
    author: '李白',
    dynasty: '唐',
    content: '日照香炉生紫烟，遥看瀑布挂前川。飞流直下三千尺，疑是银河落九天。',
  },
];

/**
 * 如果你有大量诗词数据（例如 JSON 文件），可以这样导入：
 * 
 * import poemsData from './poems.json';
 * 
 * export const samplePoems = poemsData;
 */

/**
 * 或者从网络获取诗词数据：
 * 
 * export async function fetchPoemsFromServer() {
 *   const response = await fetch('https://your-api.com/poems');
 *   return await response.json();
 * }
 */
