# 口袋诗词 - 数据库 API 使用指南

## 📋 概览

这个项目提供了三种方式来查询诗词数据库：

1. **React Hooks** - 适合在 React 组件中使用
2. **PoemService 类** - 面向对象的 API
3. **PoemAPI 对象** - Pure Function 风格的 API

## 🚀 快速开始

### 1. 在 React 组件中使用 Hooks

```tsx
import { useDatabase } from '@/context/DatabaseContext';
import { useRandomPoem, useDatabaseStatistics } from '@/hooks/usePoems';

export default function MyComponent() {
  const { db } = useDatabase();
  const { poem, loading, error, fetchRandomPoem } = useRandomPoem(db);
  const { stats } = useDatabaseStatistics(db);

  return (
    <View>
      <Text>总诗词数: {stats.total}</Text>
      {poem && <Text>{poem.title}</Text>}
      <Button onPress={() => fetchRandomPoem()} title="换一首" />
    </View>
  );
}
```

### 2. 使用 PoemService 类

```ts
import * as SQLite from 'expo-sqlite';
import { PoemService } from '@/services/poemService';

const db = await SQLite.openDatabaseAsync('pocket_poem.db');
const poemService = new PoemService(db);

// 获取随机诗词
const poem = await poemService.getRandomPoem();

// 搜索诗词
const results = await poemService.search('月亮', 20, 0);

// 获取统计信息
const stats = await poemService.getStatistics();
```

### 3. 使用 PoemAPI Pure Functions

```ts
import * as SQLite from 'expo-sqlite';
import { PoemAPI } from '@/services/poemService';

const db = await SQLite.openDatabaseAsync('pocket_poem.db');

// 获取随机诗词
const poem = await PoemAPI.getRandomPoem(db);

// 搜索
const results = await PoemAPI.search(db, '月亮');

// 按朝代搜索
const tangPoems = await PoemAPI.searchByDynasty(db, '唐');
```

## 📚 完整 API 参考

### React Hooks

#### `useRandomPoem(db: SQLiteDatabase | null)`

获取随机诗词。

```tsx
const { poem, loading, error, fetchRandomPoem } = useRandomPoem(db);
```

**返回值：**
- `poem: Poem | null` - 随机诗词对象
- `loading: boolean` - 加载状态
- `error: Error | null` - 错误信息
- `fetchRandomPoem: () => Promise<void>` - 手动刷新函数

---

#### `useRandomPoems(db: SQLiteDatabase | null, count: number = 5)`

获取多首随机诗词。

```tsx
const { poems, loading, error, fetchRandomPoems } = useRandomPoems(db, 10);
```

---

#### `useSearchPoems(db: SQLiteDatabase | null, limit: number = 20)`

搜索诗词。

```tsx
const { poems, totalCount, loading, error, search } = useSearchPoems(db);

// 执行搜索
await search('月亮', 0);
```

---

#### `usePoemsByAuthor(db: SQLiteDatabase | null, author: string | null, limit: number = 20)`

获取指定作者的诗词。

```tsx
const { poems, totalCount, loading, error, fetchByAuthor } = usePoemsByAuthor(db, '李白');
```

---

#### `usePoemsByDynasty(db: SQLiteDatabase | null, dynasty: string | null, limit: number = 20)`

获取指定朝代的诗词。

```tsx
const { poems, totalCount, loading, error, fetchByDynasty } = usePoemsByDynasty(db, '唐');
```

---

#### `useAllAuthors(db: SQLiteDatabase | null)`

获取所有作者列表。

```tsx
const { authors, loading, error } = useAllAuthors(db);
```

---

#### `useAllDynasties(db: SQLiteDatabase | null)`

获取所有朝代列表。

```tsx
const { dynasties, loading, error } = useAllDynasties(db);
```

---

#### `useDatabaseStatistics(db: SQLiteDatabase | null)`

获取数据库统计信息。

```tsx
const { stats, loading, error } = useDatabaseStatistics(db);
// stats = { total: number, authors: number, dynasties: number }
```

---

#### `useAllPoems(db: SQLiteDatabase | null, limit: number = 20)`

获取所有诗词（分页）。

```tsx
const { poems, loading, error, fetchPoems } = useAllPoems(db, 20);
```

---

#### `usePoem(db: SQLiteDatabase | null, id: number | null)`

获取单首诗词。

```tsx
const { poem, loading, error } = usePoem(db, 123);
```

### PoemService 类方法

```ts
const service = new PoemService(db);

// 基础查询
await service.getPoem(id);
await service.getAllPoems(limit, offset);

// 搜索
await service.search(keyword, limit, offset);
await service.getPoemsByAuthor(author, limit, offset);
await service.getPoemsByDynasty(dynasty, limit, offset);

// 列表
await service.getAllAuthors();
await service.getAllDynasties();

// 统计
await service.getTotalCount();
await service.getCountByAuthor(author);
await service.getCountByDynasty(dynasty);
await service.getSearchCount(keyword);

// 随机
await service.getRandomPoem();
await service.getRandomPoems(count);

// 统计信息
await service.getStatistics();
```

### PoemAPI Pure Functions

```ts
// 最常用
PoemAPI.getRandomPoem(db);           // 获取随机诗词
PoemAPI.getRandomPoems(db, count);   // 获取多首随机诗词

// 搜索
PoemAPI.search(db, keyword);         // 搜索诗词
PoemAPI.searchByAuthor(db, author);  // 按作者搜索
PoemAPI.searchByDynasty(db, dynasty);// 按朝代搜索

// 列表
PoemAPI.getAllDynasties(db);         // 获取所有朝代
PoemAPI.getAllAuthors(db);           // 获取所有作者

// 统计
PoemAPI.getTotalCount(db);           // 获取总诗词数
PoemAPI.getStatistics(db);           // 获取统计信息

// 单项查询
PoemAPI.getPoemById(db, id);         // 获取单首诗词
```

## 📖 Poem 接口

```ts
interface Poem {
  id: number;
  title: string;
  author?: string;
  dynasty?: string;
  content: string;
  translation?: string;
  appreciation?: string;
  tags?: string;
  created_at?: string;
}
```

## 🎯 使用场景示例

### 场景 1：显示每日诗词

```tsx
export function DailyPoem() {
  const { db } = useDatabase();
  const { poem, loading, fetchRandomPoem } = useRandomPoem(db);

  useEffect(() => {
    // 每天自动刷新
    fetchRandomPoem();
  }, []);

  return (
    <View>
      {poem && (
        <View>
          <Text>{poem.title}</Text>
          <Text>{poem.author} ({poem.dynasty})</Text>
          <Text>{poem.content}</Text>
        </View>
      )}
    </View>
  );
}
```

### 场景 2：诗词搜索页

```tsx
export function SearchPage() {
  const { db } = useDatabase();
  const [keyword, setKeyword] = useState('');
  const { poems, totalCount, search } = useSearchPoems(db);

  return (
    <View>
      <TextInput
        value={keyword}
        onChangeText={setKeyword}
        placeholder="搜索诗词..."
      />
      <Button
        title="搜索"
        onPress={() => search(keyword, 0)}
      />
      <Text>找到 {totalCount} 首诗词</Text>
      {poems.map(poem => (
        <PoemCard key={poem.id} poem={poem} />
      ))}
    </View>
  );
}
```

### 场景 3：作者詳頁

```tsx
export function AuthorDetail({ author }: { author: string }) {
  const { db } = useDatabase();
  const { poems, totalCount } = usePoemsByAuthor(db, author);

  return (
    <View>
      <Text>{author} (共 {totalCount} 首)</Text>
      {poems.map(poem => (
        <PoemCard key={poem.id} poem={poem} />
      ))}
    </View>
  );
}
```

### 场景 4：朝代浏览

```tsx
export function DynastyBrowser() {
  const { db } = useDatabase();
  const [selectedDynasty, setSelectedDynasty] = useState('唐');
  const { poems, totalCount } = usePoemsByDynasty(db, selectedDynasty);
  const { dynasties } = useAllDynasties(db);

  return (
    <View>
      <ScrollView horizontal>
        {dynasties.map(dynasty => (
          <Button
            key={dynasty}
            title={dynasty}
            onPress={() => setSelectedDynasty(dynasty)}
          />
        ))}
      </ScrollView>
      <Text>{selectedDynasty} 时期 ({totalCount} 首诗词)</Text>
      {poems.map(poem => (
        <PoemCard key={poem.id} poem={poem} />
      ))}
    </View>
  );
}
```

## 🔧 设置 DatabaseProvider

确保在应用根部包装 DatabaseProvider：

```tsx
import { DatabaseProvider } from '@/context/DatabaseContext';

export default function RootLayout() {
  return (
    <DatabaseProvider>
      {/* 你的应用内容 */}
    </DatabaseProvider>
  );
}
```

## 📊 数据库统计

当前数据库包含：

- **总诗词数**: 287,555 首
- **作者数**: 10,449 位
- **朝代数**: 8 个朝代
  - 唐: 254,248 首
  - 宋: 21,053 首
  - 元: 11,057 首
  - 五代: 543 首
  - 周（诗经）: 305 首
  - 清: 258 首
  - 战国（楚辞）: 65 首
  - 汉: 26 首

## 💡 性能建议

1. **使用分页** - 获取大量数据时使用 `limit` 和 `offset`
2. **缓存结果** - 使用 useState 缓存已获取的数据
3. **避免重复查询** - 使用 Hooks 的依赖数组控制重新获取
4. **搜索优化** - 搜索前检查关键字不为空

## 🐛 调试

启用详细日志：

```ts
// 在 queries.ts 中查看所有操作的日志
console.log('执行查询:', sql);
console.log('查询结果:', result);
```

## 📝 Demo 页面

查看 `src/app/demo.tsx` 了解完整的使用示例，包括：

- 随机诗词展示
- 诗词搜索
- 统计信息展示
- 朝代列表展示

运行以下命令启动 Demo：

```bash
npm start
# 然后导航到 demo 页面
```
