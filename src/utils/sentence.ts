/**
 * 分割句子的工具函数
 */

/**
 * 标点符号集（中英文标点符号 + 换行符）
 */
export const PUNCTUATION_SET = new Set([
  // 中文标点
  '，', '。', '！', '？', '；', '：', '「', '」', '『', '』', '（', '）', '《', '》',
  '【', '】', '·', '、', '…', '—', '～', '·', '･', '。', '｡', '，', '､', '！', '｢', '｣',
  // 英文标点
  ',', '.', '!', '?', ';', ':', '"', "'", '-', '(', ')', '[', ']', '{', '}', '/', '\\',
  '&', '@', '#', '$', '%', '^', '*', '~', '`', '|', '<', '>', '=', '+', '−',
  // 换行符和空白符
  '\n', '\r', '\t', '\u000B', '\u000C',
]);

/**
 * 结束标点集（用于分片段的终止标记）
 */
const END_PUNCTUATION_SET = new Set(['。', '？', '！', '……']);

/**
 * 非标点符号集（excludes 中英文标点符号 + 换行符）
 */
const NON_PUNCTUATION_SET = new Set([
  '，', '、', '（', '）', '《', '》', '【', '】', '「', '」', '『', '』',
  '；', '：', '"', "'", '-', '(', ')', '[', ']', '{', '}', '/', '\\',
  ',', '.', '!', '?', ';', ':', '&', '@', '#', '$', '%', '^', '*', '~',
  '`', '|', '<', '>', '=', '+', '−', '\n', '\r', '\t', '\u000B', '\u000C',
]);

/**
 * 获取诗词的一个片段
 * 规则：
 * 1. 找到所有结束标点（"。"、"？"、"！"、"……"）的位置
 * 2. 随机选择一个位置作为起点
 * 3. 从该位置开始，截取14-42个非标点字符的片段
 * 4. 片段内需要包含结束标点，或在14-42范围内找最后一个标点，或直接在42处截断
 * 
 * @param content 诗词的完整内容
 * @returns 提取的诗词片段
 */
export const getPoemFragment = (content: string): string => {
  // 步骤 1: 找到所有结束标点的位置
  const endPunctuationIndices: number[] = [];
  for (let i = 0; i < content.length; i++) {
    if (END_PUNCTUATION_SET.has(content[i])) {
      endPunctuationIndices.push(i);
    }
  }

  // 如果没有结束标点，则直接返回整个内容
  if (endPunctuationIndices.length === 0) {
    return content;
  }

  // 步骤 2: 随机选择一个结束标点位置作为起点
  const randomEndIndex = endPunctuationIndices[Math.floor(Math.random() * endPunctuationIndices.length)];
  const startIndex = randomEndIndex + 1;

  // 如果起点已经超过内容长度，则从最后一个位置开始
  if (startIndex >= content.length) {
    return content.slice(Math.max(0, content.length - 42));
  }

  // 步骤 3-6: 从起点开始，截取14-42个非标点字符的片段
  let nonPunctuationCount = 0;
  let endFragmentIndex = startIndex;
  let lastPunctuationInRange = -1;

  for (let i = startIndex; i < content.length; i++) {
    const char = content[i];
    const isNonPunctuation = !NON_PUNCTUATION_SET.has(char);

    if (isNonPunctuation) {
      nonPunctuationCount++;
    }

    // 记录14-42范围内最后一个标点的位置
    if (nonPunctuationCount >= 14 && nonPunctuationCount <= 42 && NON_PUNCTUATION_SET.has(char)) {
      lastPunctuationInRange = i;
    }

    // 如果找到结束标点且已经有14个非标点字符
    if (nonPunctuationCount >= 14 && END_PUNCTUATION_SET.has(char)) {
      endFragmentIndex = i + 1;
      break;
    }

    // 如果已经有42个非标点字符
    if (nonPunctuationCount >= 42) {
      // 如果在14-42范围内有标点，则在最后一个标点处截断
      if (lastPunctuationInRange !== -1) {
        endFragmentIndex = lastPunctuationInRange + 1;
      } else {
        // 否则直接在42处截断
        endFragmentIndex = i + 1;
      }
      break;
    }

    endFragmentIndex = i + 1;
  }

  return content.slice(startIndex, endFragmentIndex);
};

/**
 * 分割句子为多行
 * 规则：
 * 1. 遇到标点符号时，省略该字符并换行
 * 2. 一行超过9个字符时，直接换行
 * 
 * @param text 要分割的文本
 * @returns 分割后的行数组
 */
export const divideSentence = (text: string): string[] => {
  const lines: string[] = [];
  let currentLine = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    // 如果是标点符号，省略并换行
    if (PUNCTUATION_SET.has(char)) {
      if (currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = '';
      }
      // 标点符号不添加到行中
      continue;
    }

    currentLine += char;

    // 如果当前行超过9个字符，换行
    if (currentLine.length > 9) {
      lines.push(currentLine);
      currentLine = '';
    }
  }

  // 添加剩余的字符
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines;
};
