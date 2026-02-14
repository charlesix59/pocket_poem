# 快速开始指南

## ⚡ 5 分钟快速上手

### 1️⃣ 启动应用

```bash
npm start
```

然后选择平台运行：
- `i` - iOS
- `a` - Android  
- `w` - Web

### 2️⃣ 导入示例数据

打开应用后，在首页点击 **"📥 导入示例诗词"** 按钮。

### 3️⃣ 查看效果

你现在可以看到：
- ✅ 4 首示例诗词
- ✅ 统计信息（总诗词数、作者数、朝代数）
- ✅ 诗词卡片展示

---

## 🎯 常见任务

### 添加自己的诗词

编辑 `src/data/samplePoems.ts`:

```typescript
export const samplePoems = [
  {
    title: '你的诗名',
    author: '你的作者',
    dynasty: '朝代',
    content: '诗词内容',
    translation: '翻译（可选）',
    appreciation: '赏析（可选）',
    tags: '标签,多个标签'
  },
  // 添加更多...
];
```

保存后重新运行应用即可。

### 查询诗词

在任何组件中使用：

```typescript
import { useDatabase } from '@/src/context/DatabaseContext';
import { getAllPoems, searchPoems } from '@/src/database/queries';

export function MyComponent() {
  const { db } = useDatabase();

  // 获取所有诗词
  const [poems, setPoems] = useState([]);
  
  useEffect(() => {
    if (db) {
      getAllPoems(db, 20, 0).then(setPoems);
    }
  }, [db]);

  return (
    // 显示 poems...
  );
}
```

### 搜索诗词

```typescript
import { searchPoems } from '@/src/database/queries';

const results = await searchPoems(db, '月', 20, 0);
```

---

## 📱 项目结构速查

```
关键文件位置：
├── src/database/initialization.ts   ← 数据库初始化
├── src/database/queries.ts          ← 查询函数
├── src/context/DatabaseContext.tsx  ← 全局 DB Context
├── src/data/samplePoems.ts          ← 你的诗词数据
└── app/(tabs)/index.tsx             ← 首页演示
```

---

## 🔍 数据库函数速查

### 导入数据
```typescript
import { importPoems } from '@/src/database/initialization';
await importPoems(db, poemsArray);
```

### 查询功能
```typescript
import { 
  getPoemById,
  getAllPoems,
  searchPoems,
  getPoemsByAuthor,
  getPoemsByDynasty,
  getAllAuthors,
  getAllDynasties,
  getTotalPoemCount
} from '@/src/database/queries';

await getAllPoems(db, 20, 0);      // 获取 20 条，跳过 0 条
await searchPoems(db, '月', 20);   // 搜索包含"月"的诗词
await getPoemsByAuthor(db, '李白'); // 获取李白的诗
```

### 统计
```typescript
import { getStatistics } from '@/src/database/initialization';
const stats = await getStatistics(db);
// { total: 100, authors: 50, dynasties: 5 }
```

---

## 🐛 常见问题快速解决

**问题**: 修改数据后看不到变化？
> 重新运行 `npm start` 重启应用

**问题**: "Database not ready"？
> 等待 `isReady === true`：
> ```typescript
> const { db, isReady } = useDatabase();
> if (!isReady) return <Loading />;
> ```

**问题**: 数据库文件在哪？
> 自动存储在应用沙箱目录，无需关心

---

## 📚 下一步

- 阅读 [SETUP.md](./SETUP.md) 了解完整文档
- 查看 `app/(tabs)/index.tsx` 了解页面实现
- 在 `app/(tabs)/` 下创建更多页面

---

**就这么简单！开始开发你的诗词应用吧！** 📖✨
