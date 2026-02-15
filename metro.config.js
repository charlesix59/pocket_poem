const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 添加自定义资源文件扩展名以支持字体和数据库文件
const assetExts = config.resolver.assetExts || [];
['db', 'woff2', 'ttf', 'otf'].forEach(ext => {
  if (!assetExts.includes(ext)) {
    assetExts.push(ext);
  }
});

module.exports = config;
