const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 添加 .db 文件到 assetExts，使得 Metro 能够打包数据库文件
config.resolver.assetExts.push('db');

module.exports = config;
