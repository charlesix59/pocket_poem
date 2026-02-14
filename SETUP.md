# 口袋诗词 (Pocket Poem) - 项目初始化完成

## 📱 项目概述

这是一个 React Native + Expo + SQLite 的诗词应用，专门为帮助用户阅读和学习诗词而设计。

## 🛠️ 技术栈

- **框架**: React Native 0.81.5
- **Expo**: ~54.0.33 (用于快速开发和部署)
- **数据库**: SQLite (expo-sqlite ^16.0.10)
- **路由**: Expo Router ~6.0.23
- **语言**: TypeScript ~5.9.2
- **UI**: React Native 原生组件

## 📁 项目结构

```
pocket_poem/
├── app/                          # Expo Router 应用主目录
│   ├── (tabs)/                   # Tab 导航组
│   │   ├── index.tsx            # 首页 (诗词列表演示)
│   │   ├── explore.tsx          # 探索页
│   │   └── _layout.tsx          # Tab 布局
│   ├── _layout.tsx              # 根布局 (集成 DatabaseProvider)
│   └── modal.tsx                # Modal 示例页面
│
├── src/                          # 应用业务逻辑
│   ├── database/                # 数据库模块
│   │   ├── initialization.ts    # 数据库初始化、导入和工具函数
│   │   └── queries.ts           # 数据库查询函数 (CRUD 操作)
│   │
│   ├── context/                 # React Context
│   │   └── DatabaseContext.tsx  # 全局数据库 Context
│   │
│   └── data/                    # 数据文件
│       └── samplePoems.ts       # 示例诗词数据
│
├── components/                   # React 组件
├── hooks/                        # 自定义 Hooks
├── constants/                    # 常量定义
├── assets/                       # 静态资源
├── package.json                  # 项目依赖配置
├── tsconfig.json                # TypeScript 配置
└── app.json                     # Expo 应用配置
```

## 🚀 快速开始

### 1. 安装依赖

所有依赖已安装完毕，包括：
- `expo-sqlite` - SQLite 数据库支持
- `expo-router` - 路由管理
- 其他 React Native 依赖

### 2. 运行应用

```bash
# 启动 Expo 开发服务器
npm start

# 运行 iOS 版本
npm run ios

# 运行 Android 版本
npm run android

# 运行 Web 版本
npm run web
```

### 3. 导入诗词数据

在首页点击"📥 导入示例诗词"按钮，即可将示例数据导入到 SQLite 数据库中。

## 📚 数据库使用指南

### 创建数据库连接

```typescript
import { useDatabase } from '@/src/context/DatabaseContext';

export function MyComponent() {
  const { db, isReady, error } = useDatabase();

  if (!isReady) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  // 使用 db 进行数据库操作
}
```

### 查询诗词

```typescript
import { getAllPoems, searchPoems, getPoemsByAuthor } from '@/src/database/queries';

// 获取所有诗词 (带分页)
const poems = await getAllPoems(db, limit = 20, offset = 0);

// 搜索诗词
const results = await searchPoems(db, '月', limit = 20, offset = 0);

// 按作者查询
const liPoems = await getPoemsByAuthor(db, '李白', limit = 20);

// 按朝代查询
const tangPoems = await getPoemsByDynasty(db, '唐', limit = 20);
```

### 导入诗词数据

```typescript
import { importPoems } from '@/src/database/initialization';

const poemData = [
  {
    title: '静夜思',
    author: '李白',
    dynasty: '唐',
    content: '床前明月光，疑是地上霜。...',
    translation: '...',
    appreciation: '...',
    tags: '思乡,月夜'
  },
  // ... 更多诗词
];

await importPoems(db, poemData);
```

## 🗄️ 数据库表结构

### poems 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PRIMARY KEY | 诗词 ID (自增) |
| title | TEXT | 诗词标题 |
| author | TEXT | 作者 |
| dynasty | TEXT | 朝代 |
| content | TEXT | 诗词正文 |
| translation | TEXT | 译文 |
| appreciation | TEXT | 赏析 |
| tags | TEXT | 标签 (逗号分隔或 JSON) |
| created_at | DATETIME | 创建时间 |

### 已创建的索引

- `idx_author` - 按作者查询
- `idx_dynasty` - 按朝代查询
- `idx_title` - 按标题查询

## 📝 添加自己的诗词数据

### 方法 1: 修改 samplePoems.ts

编辑 `src/data/samplePoems.ts` 文件，添加你的诗词数据：

```typescript
export const samplePoems = [
  {
    title: '你的诗词标题',
    author: '作者名',
    dynasty: '朝代',
    content: '诗词内容',
    translation: '译文 (可选)',
    appreciation: '赏析 (可选)',
    tags: '标签'
  },
  // ... 更多诗词
];
```

### 方法 2: 从 JSON 文件导入

```typescript
// src/data/samplePoems.ts
import poemsData from './poems.json';
export const samplePoems = poemsData;
```

### 方法 3: 从网络 API 导入

```typescript
// 在组件中
const response = await fetch('https://your-api.com/poems');
const poemsData = await response.json();
await importPoems(db, poemsData);
```

## 🎯 核心功能模块

### 1. DatabaseContext (`src/context/DatabaseContext.tsx`)

全局数据库上下文，管理 SQLite 连接的生命周期。

**功能**:
- 自动初始化数据库
- 提供全局访问接口
- 错误处理

**使用**:
```typescript
const { db, isReady, error } = useDatabase();
```

### 2. 初始化模块 (`src/database/initialization.ts`)

处理数据库的创建、初始化和数据导入。

**主要函数**:
- `getDatabase()` - 获取或创建数据库实例
- `importPoems()` - 导入诗词数据
- `clearAllPoems()` - 清空所有数据
- `getStatistics()` - 获取统计信息

### 3. 查询模块 (`src/database/queries.ts`)

提供各种数据库查询函数。

**主要函数**:
- `getPoemById()` - 按 ID 查询
- `getAllPoems()` - 获取所有诗词
- `searchPoems()` - 搜索诗词
- `getPoemsByAuthor()` - 按作者查询
- `getPoemsByDynasty()` - 按朝代查询
- `getAllAuthors()` - 获取所有作者
- `getAllDynasties()` - 获取所有朝代
- `getTotalPoemCount()` - 获取诗词总数

## 🔧 配置和修改

### 修改应用名称

编辑 `app.json`:

```json
{
  "expo": {
    "name": "你的应用名称",
    "slug": "你的应用缩写"
  }
}
```

### 修改数据库文件名

在 `src/database/initialization.ts` 中修改：

```typescript
const db = await SQLite.openDatabaseAsync('你的数据库名.db');
```

### 修改表结构

在 `src/database/initialization.ts` 的 `initializeDatabase()` 函数中修改 SQL 语句。

## 📦 构建和发布

### 构建 APK (Android)

```bash
eas build --platform android
```

### 构建 IPA (iOS)

```bash
eas build --platform ios
```

### 发布到 Expo Go

```bash
expo publish
```

## 🐛 调试

### 查看数据库内容

使用 React Native Debugger 或在组件中输出查询结果：

```typescript
const poems = await getAllPoems(db, 100);
console.log(poems);
```

### 重置项目

```bash
npm run reset-project
```

## 📖 相关资源

- [React Native 官方文档](https://reactnative.dev)
- [Expo 官方文档](https://docs.expo.dev)
- [expo-sqlite 文档](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [Expo Router 文档](https://docs.expo.dev/routing/introduction/)
- [TypeScript 官方文档](https://www.typescriptlang.org)

## 🎓 下一步建议

1. **添加搜索功能** - 在 explore 页面实现诗词搜索
2. **收藏功能** - 添加收藏/书签功能 (需要新增表)
3. **详情页面** - 创建诗词详情页面显示完整信息
4. **分类浏览** - 按作者、朝代分类浏览
5. **随机推荐** - 每日推荐诗词功能
6. **离线搜索** - 优化全文搜索性能
7. **自定义列表** - 用户创建自己的诗词列表

## 💡 常见问题

**Q: 如何更新应用中的诗词数据？**
A: 修改 `src/data/samplePoems.ts` 文件，重新运行应用时会自动导入更新的数据。

**Q: SQLite 数据库文件存储在哪里？**
A: 数据库文件通常存储在应用的文档目录中，具体位置取决于平台。

**Q: 如何处理大量诗词数据（超过 10MB）？**
A: 可以分批导入，或者考虑预构建数据库文件并打包到应用中。

**Q: 支持离线使用吗？**
A: 是的！SQLite 是完全离线的，无需网络连接即可访问诗词。

## 📄 许可证

MIT License - 详见 LICENSE 文件

---

**祝你开发愉快！**🚀

有任何问题或建议，欢迎反馈！
