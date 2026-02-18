/**
 * 诗词数据转换脚本
 * 使用 OpenCC 将 lib/poems 下的所有 JSON 文件转换为简体中文
 * 生成 xxx.simplified.json 文件
 */

const fs = require('fs');
const path = require('path');
const opencc = require('opencc-js');

// 初始化转换器（繁体 -> 简体）
const converter = opencc.Converter({ from: 'hk', to: 'cn' });

const POEMS_DIR = path.join(__dirname, '../lib/poems');

/**
 * 递归转换对象中的所有字符串
 */
function convertObject(obj) {
  if (typeof obj === 'string') {
    return converter(obj);
  } else if (Array.isArray(obj)) {
    return obj.map(item => convertObject(item));
  } else if (obj !== null && typeof obj === 'object') {
    const converted = {};
    for (const [key, value] of Object.entries(obj)) {
      converted[key] = convertObject(value);
    }
    return converted;
  }
  return obj;
}

/**
 * 获取目录下的所有 JSON 文件（递归）
 */
function getAllJsonFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllJsonFiles(filePath, fileList);
    } else if (file.endsWith('.json') && !file.endsWith('.simplified.json')) {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

/**
 * 生成简体版本文件名
 */
function getSimplifiedFileName(filePath) {
  const dir = path.dirname(filePath);
  const basename = path.basename(filePath, '.json');
  return path.join(dir, `${basename}.simplified.json`);
}

/**
 * 转换单个文件
 */
function convertFile(filePath) {
  try {
    // 读取原始文件
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    
    // 转换数据
    const convertedData = convertObject(data);
    
    // 生成简体版本文件
    const simplifiedPath = getSimplifiedFileName(filePath);
    fs.writeFileSync(simplifiedPath, JSON.stringify(convertedData, null, 2), 'utf-8');
    
    return {
      success: true,
      original: filePath,
      simplified: simplifiedPath,
      size: JSON.stringify(convertedData).length
    };
  } catch (error) {
    return {
      success: false,
      original: filePath,
      error: error.message
    };
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始转换诗词数据...\n');
  console.log(`📁 诗词目录: ${POEMS_DIR}\n`);
  
  // 获取所有 JSON 文件
  const jsonFiles = getAllJsonFiles(POEMS_DIR);
  console.log(`📊 找到 ${jsonFiles.length} 个 JSON 文件\n`);
  
  if (jsonFiles.length === 0) {
    console.log('❌ 未找到任何 JSON 文件');
    process.exit(1);
  }
  
  const results = [];
  let successCount = 0;
  let failureCount = 0;
  
  // 转换每个文件
  for (const filePath of jsonFiles) {
    const relativePath = path.relative(POEMS_DIR, filePath);
    process.stdout.write(`⏳ 转换: ${relativePath}... `);
    
    const result = convertFile(filePath);
    
    if (result.success) {
      console.log(`✅`);
      successCount++;
      results.push({
        status: 'success',
        file: relativePath,
        size: result.size
      });
    } else {
      console.log(`❌ ${result.error}`);
      failureCount++;
      results.push({
        status: 'failed',
        file: relativePath,
        error: result.error
      });
    }
  }
  
  // 统计信息
  console.log('\n' + '='.repeat(60));
  console.log('\n📈 转换完成！\n');
  console.log(`✅ 成功: ${successCount}/${jsonFiles.length}`);
  console.log(`❌ 失败: ${failureCount}/${jsonFiles.length}`);
  
  if (failureCount > 0) {
    console.log('\n❌ 失败的文件:');
    results
      .filter(r => r.status === 'failed')
      .forEach(r => {
        console.log(`   ${r.file}: ${r.error}`);
      });
  }
  
  console.log('\n📁 简体版本已保存为 xxx.simplified.json 文件');
  console.log('\n💾 详细报告已保存到: conversion_report.json\n');
  
  // 保存详细报告
  fs.writeFileSync(
    path.join(__dirname, '../conversion_report.json'),
    JSON.stringify({
      timestamp: new Date().toISOString(),
      totalFiles: jsonFiles.length,
      successful: successCount,
      failed: failureCount,
      details: results
    }, null, 2),
    'utf-8'
  );
  
  process.exit(failureCount > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('❌ 转换过程出错:', error);
  process.exit(1);
});
