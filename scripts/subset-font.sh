#!/bin/bash

# 字体子集化脚本
# 使用 fonttools 将您的字体文件按照诗词库中的字符进行子集化
# 
# 使用方法：
# chmod +x scripts/subset-font.sh
# ./scripts/subset-font.sh /path/to/your-font.ttf
# 
# 前置要求：
# pip install fonttools brotli

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查输入
if [ $# -eq 0 ]; then
    echo -e "${RED}❌ 错误：请指定字体文件路径${NC}"
    echo -e "${BLUE}用法：./scripts/subset-font.sh /path/to/your-font.ttf${NC}"
    exit 1
fi

FONT_FILE="$1"
CHARS_FILE="assets/chars-all.txt"
OUTPUT_FILE="assets/poetry-font.ttf"
OUTPUT_WOFF2="assets/poetry-font.woff2"

# 检查字体文件是否存在
if [ ! -f "$FONT_FILE" ]; then
    echo -e "${RED}❌ 错误：字体文件不存在：$FONT_FILE${NC}"
    exit 1
fi

# 检查字符文件是否存在
if [ ! -f "$CHARS_FILE" ]; then
    echo -e "${RED}❌ 错误：字符文件不存在：$CHARS_FILE${NC}"
    echo -e "${BLUE}请先运行：node scripts/extract-chars.js${NC}"
    exit 1
fi

echo -e "${BLUE}📚 开始字体子集化...${NC}"
echo -e "${BLUE}📂 源字体：$FONT_FILE${NC}"
echo -e "${BLUE}📝 字符文件：$CHARS_FILE${NC}"

# 获取原始文件大小
ORIGINAL_SIZE=$(ls -lh "$FONT_FILE" | awk '{print $5}')
ORIGINAL_BYTES=$(stat -f%z "$FONT_FILE" 2>/dev/null || stat -c%s "$FONT_FILE" 2>/dev/null)

echo -e "${YELLOW}📊 原始文件大小：$ORIGINAL_SIZE ($(numfmt --to=iec $ORIGINAL_BYTES 2>/dev/null || echo $ORIGINAL_BYTES bytes))${NC}"

# 检查是否安装了 fonttools
if ! command -v pyftsubset &> /dev/null; then
    echo -e "${RED}❌ 错误：未找到 pyftsubset，请先安装 fonttools${NC}"
    echo -e "${BLUE}安装方法：pip install fonttools brotli${NC}"
    exit 1
fi

# 执行子集化
echo -e "${BLUE}⏳ 正在处理... (这可能需要一段时间)${NC}"

if pyftsubset "$FONT_FILE" \
    --text-file="$CHARS_FILE" \
    --output-file="$OUTPUT_FILE" \
    --flavor=woff2; then
    
    echo -e "${GREEN}✅ 子集化成功！${NC}"
    
    # 获取新文件大小
    if [ -f "$OUTPUT_FILE" ]; then
        NEW_SIZE=$(ls -lh "$OUTPUT_FILE" | awk '{print $5}')
        NEW_BYTES=$(stat -f%z "$OUTPUT_FILE" 2>/dev/null || stat -c%s "$OUTPUT_FILE" 2>/dev/null)
        COMPRESSION=$((100 - NEW_BYTES * 100 / ORIGINAL_BYTES))
        
        echo -e "${GREEN}📦 输出文件大小：$NEW_SIZE ($(numfmt --to=iec $NEW_BYTES 2>/dev/null || echo $NEW_BYTES bytes))${NC}"
        echo -e "${GREEN}📈 压缩率：${COMPRESSION}%${NC}"
        echo -e "${GREEN}💾 已保存到：$OUTPUT_FILE${NC}"
        
        # 如果是 WOFF2 格式，显示 WOFF2 路径
        if [[ "$OUTPUT_FILE" == *.woff2 ]]; then
            echo -e "${GREEN}🎉 WOFF2 格式（网络优化）已生成${NC}"
        fi
    fi
else
    echo -e "${RED}❌ 子集化失败！${NC}"
    exit 1
fi

echo -e "${BLUE}\n📌 下一步建议：${NC}"
echo -e "${BLUE}1. 检查输出字体：$OUTPUT_FILE${NC}"
echo -e "${BLUE}2. 将其放入 assets/fonts/ 目录${NC}"
echo -e "${BLUE}3. 在 app.json 中配置 expo-font 插件${NC}"
echo -e "${BLUE}4. 在代码中使用自定义字体${NC}"

echo -e "${GREEN}✨ 字体子集化完成！${NC}"
