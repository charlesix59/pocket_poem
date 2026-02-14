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
    translation: '床前洒满了月光，仔细看就像地上的霜。抬起头来看那月亮，不禁低头思念起故乡来了。',
    appreciation: '这是唐代诗人李白的一首著名诗作，表达了诗人对故乡的思念。全诗四句，每句五个字，是五言绝句。',
    tags: '思乡,月夜,唐诗',
  },
  {
    title: '登高',
    author: '杜甫',
    dynasty: '唐',
    content: '风急天高猿啸哀，渚清沙白鸟飞回。无边落木萧萧下，不尽长江滚滚来。万里悲秋常作客，百年多病独登台。艰难苦恨繁霜鬓，潦倒新停浊酒杯。',
    translation: '风势急，天很高，猿猴哀啼显悲凄。渚地清，沙地白，飞鸟回旋不停飞。无边无际的落木纷纷扬扬地飘下来，无穷无尽的长江滚滚涛涛地流来。',
    appreciation: '杜甫晚年作品，登高望远，触景生情。全诗八句，对仗工整，意境开阔，是律诗中的杰作。',
    tags: '秋景,登高,感慨,唐诗',
  },
  {
    title: '春晓',
    author: '孟浩然',
    dynasty: '唐',
    content: '春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。',
    translation: '在春天的早晨，我睡得很熟，不知不觉天已亮了。到处都听到小鸟在啼鸣。夜里下了一场风雨。凋落了不少花儿。',
    appreciation: '这是一首描写春天早晨景色的诗。全诗四句，短小精悍，意境优美，是唐诗中的典范之作。',
    tags: '春天,早晨,自然,唐诗',
  },
  {
    title: '望庐山瀑布',
    author: '李白',
    dynasty: '唐',
    content: '日照香炉生紫烟，遥看瀑布挂前川。飞流直下三千尺，疑是银河落九天。',
    translation: '太阳照射在香炉峰上，产生了紫色的烟雾。远远看去，瀑布仿佛挂在山前。瀑布飞流直下，好像有三千尺高，让人怀疑是银河从天上落下来了。',
    appreciation: '李白最著名的诗作之一，用夸张的手法描写了庐山瀑布的壮观景象，充分展现了诗人的想象力。',
    tags: '山水,景物,壮观,唐诗',
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
