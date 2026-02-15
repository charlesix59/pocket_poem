# 字体子集化完整指南

本指南说明如何从大型字体文件中提取只有诗词库使用的字符，从而大幅压缩字体文件大小。

## 📊 统计数据

从 287,555 首诗词中提取的字符统计：

- **总字符数**：14,291 个
- **中文字符**：13,128 个
- **英文字符**：35 个
- **数字**：10 个
- **标点符号**：44 个
- **空白字符**：4 个
- **其他字符**：1,070 个

## 📁 生成的文件

脚本 `scripts/extract-chars.js` 已生成以下文件：

| 文件 | 大小 | 用途 |
|-----|------|------|
| `assets/chars.txt` | 56 KB | 每行一个字符（可读性强） |
| `assets/chars-all.txt` | 42 KB | 所有字符无换行（用于复制） |
| `assets/chars-unicode.txt` | 57 KB | Unicode 范围格式（用于 fonttools） |
| `assets/chars.json` | 154 KB | JSON 格式（便于脚本处理） |

## 🚀 快速开始

### 方案 1：使用 Python（推荐）

#### 1. 安装依赖
```bash
# 使用 pip 安装 fonttools 和 brotli
pip install fonttools brotli

# 可选：安装 woff2 以生成 WOFF2 格式
brew install woff2  # macOS
# 或
sudo apt-get install woff2  # Linux
```

#### 2. 执行子集化
```bash
# 使用默认输出文件名 (poetry-font.ttf)
python scripts/subset-font.py ~/Downloads/your-font.ttf

# 自定义输出文件名
python scripts/subset-font.py ~/Downloads/your-font.ttf --output assets/fonts/custom-font.ttf

# 显示详细信息
python scripts/subset-font.py ~/Downloads/your-font.ttf --verbose

# 仅生成 TTF 格式
python scripts/subset-font.py ~/Downloads/your-font.ttf --format ttf

# 生成 WOFF2 格式（推荐用于 Web）
python scripts/subset-font.py ~/Downloads/your-font.ttf --format woff2
```

#### 3. 输出示例
```
📚 开始字体子集化...
📂 源字体：/Users/charlesmin/Downloads/NotoSerifCJK-Regular.ttf
📊 原始文件大小：110.23 MB
📝 字符数：14291

⏳ 正在生成 TTF 文件... (poetry-font.ttf)
✅ TTF 生成成功！
   📦 文件大小：3.45 MB
   📈 压缩率：97%

⏳ 正在转换为 WOFF2 格式... (poetry-font.woff2)
✅ WOFF2 生成成功！
   📦 文件大小：0.89 MB
   📈 压缩率：99%
```

### 方案 2：使用 Shell 脚本

```bash
# 使脚本可执行
chmod +x scripts/subset-font.sh

# 执行子集化
./scripts/subset-font.sh ~/Downloads/your-font.ttf
```

### 方案 3：使用 fonttools 命令行

```bash
# 直接使用 pyftsubset
pyftsubset ~/Downloads/your-font.ttf \
    --text-file=assets/chars-all.txt \
    --output-file=assets/poetry-font.ttf \
    --flavor=woff2
```

## 🎨 在 React Native 中使用自定义字体

### 步骤 1：配置 app.json

```json
{
  "expo": {
    "plugins": [
      [
        "expo-font",
        {
          "fonts": ["./assets/fonts/poetry-font.ttf"]
        }
      ]
    ]
  }
}
```

### 步骤 2：在代码中加载字体

```typescript
// src/hooks/useFonts.ts
import * as Font from 'expo-font';

export const useFonts = async () => {
  await Font.loadAsync({
    'PoetryFont': require('@/assets/fonts/poetry-font.ttf'),
  });
};
```

### 步骤 3：在应用启动时加载

```typescript
// src/app/_layout.tsx
import * as Font from 'expo-font';
import { useEffect, useState } from 'react';

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'PoetryFont': require('@/assets/fonts/poetry-font.ttf'),
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  // 你的应用布局
}
```

### 步骤 4：使用自定义字体

```typescript
// 在样式中使用
const styles = StyleSheet.create({
  poemTitle: {
    fontFamily: 'PoetryFont',
    fontSize: 24,
    fontWeight: 'bold',
  },
  poemContent: {
    fontFamily: 'PoetryFont',
    fontSize: 16,
    lineHeight: 28,
  },
});

// 或在组件中直接使用
<Text style={{ fontFamily: 'PoetryFont', fontSize: 18 }}>
  春眠不觉晓，处处闻啼鸟
</Text>
```

## 📈 压缩对比

### 示例：思源宋体繁体版（Noto Serif CJK TC）

| 格式 | 原始大小 | 子集化后 | 压缩率 |
|-----|---------|---------|--------|
| TTF（全字库） | 110 MB | 3.5 MB | 96.8% |
| WOFF2（全字库） | 110 MB | 0.9 MB | 99.2% |
| 子集 TTF | 3.5 MB | 3.5 MB | 96.8% |
| 子集 WOFF2 | 3.5 MB | 0.9 MB | 99.2% |

## 💡 高级用法

### 添加额外字符

如果需要支持更多字符（如标点符号或特殊符号），可以编辑 `assets/chars.txt`：

```bash
# 添加新字符到 chars-all.txt
echo "新增字符" >> assets/chars-all.txt

# 重新执行子集化
python scripts/subset-font.py ~/Downloads/your-font.ttf
```

### 从特定文本生成子集

如果只想保留特定文本中的字符：

```bash
# 创建包含特定文本的文件
echo "你要保留的所有文本内容" > custom-chars.txt

# 执行子集化
python scripts/subset-font.py ~/Downloads/your-font.ttf --chars custom-chars.txt
```

### 支持多种字体

```typescript
// 加载多个字体
await Font.loadAsync({
  'PoemTitle': require('@/assets/fonts/poem-title.ttf'),
  'PoemContent': require('@/assets/fonts/poem-content.ttf'),
  'PoemMeta': require('@/assets/fonts/poem-meta.ttf'),
});
```

## 🔧 故障排除

### 问题 1：`pyftsubset: command not found`

**解决方案**：
```bash
# 检查 Python 是否正确安装 fonttools
python -m pip install fonttools brotli

# 或使用 pip3
pip3 install fonttools brotli
```

### 问题 2：子集化后字体显示不正确

**解决方案**：
1. 检查字符文件是否包含所需的字符
2. 确认字体本身支持这些字符
3. 尝试不进行压缩，直接使用原始字体测试

### 问题 3：WOFF2 转换失败

**解决方案**：
```bash
# macOS
brew install woff2

# Ubuntu/Debian
sudo apt-get install woff2

# 或使用 Google 的在线工具转换
# https://convertio.co/ttf-woff2/
```

### 问题 4：应用加载时字体闪烁

**解决方案**：
```typescript
// 使用 SplashScreen 在字体加载期间保持启动屏幕
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

// 在字体加载完成后
SplashScreen.hideAsync();
```

## 📚 推荐字体

以下是一些适合诗词应用的免费商用字体：

1. **思源宋体（Source Han Serif）** - 最推荐
   - 下载：https://github.com/adobe-fonts/source-han-serif
   - 支持繁体字、多个字重
   - 文件大小：150MB+（全字库）

2. **Noto Serif CJK**
   - 下载：https://github.com/googlei18n/noto-cjk
   - Google 维护，质量高
   - 支持简体、繁体、日文、韩文

3. **刻石录篆体**
   - 下载：https://github.com/TH-Tshyn/TH-STONE
   - 特色篆体风格，适合标题

## 🎯 最佳实践

1. **优化字体大小**：始终使用字体子集化，不要打包全字库
2. **异步加载**：在应用启动时异步加载字体
3. **备用方案**：在样式中设置备用字体，防止加载失败
4. **测试多个设备**：在 iOS 和 Android 上测试字体加载和显示
5. **版本管理**：在 git 中跟踪字体文件，但排除临时生成的大文件

## 📖 参考资源

- [fonttools 官方文档](https://fonttools.readthedocs.io/)
- [Google Fonts 支持](https://support.google.com/fonts/)
- [Expo Font 文档](https://docs.expo.dev/guides/using-custom-fonts/)
- [WOFF2 规范](https://www.w3.org/TR/WOFF2/)

---

**最后更新**：2026年2月15日

如有问题，请查看脚本的详细错误信息或在项目中提 Issue。
