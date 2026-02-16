# 快速开始指南

## ⚡ 30 秒快速开始

```bash
# 1️⃣  生成数据库
node scripts/generate-db.js

# 2️⃣  标记热门诗词
node scripts/mark-hot-poems.js

# 3️⃣  启动应用
npm start
```

完成！现在打开应用，进入"诗库" → "热门诗词"来查看 452 首热门诗词。

---

## 📱 在应用中使用

1. **打开应用**
   ```
   npm start
   ```

2. **进入诗库页面**
   - 在底部 Tab 栏点击"诗库"

3. **查看热门诗词**
   - 点击"热门诗词"选项卡
   - 滚动查看更多诗词
   - 点击诗词卡片查看详情

---

## ✅ 验证安装

### 检查数据库

```bash
node -e "const db = require('better-sqlite3')('./pocket_poem.db'); const r = db.prepare('SELECT COUNT(*) as c FROM poems WHERE hot = 1').get(); console.log('✅ Hot poems:', r.c);"
```

**预期输出**：`✅ Hot poems: 452`

### 检查应用

1. 启动应用：`npm start`
2. 进入"诗库" Tab 页
3. 点击"热门诗词"选项卡
4. 应该看到诗词列表

---

## 🔧 常见问题

### Q: 脚本运行失败？

```bash
# 检查依赖
npm install

# 重新生成数据库
rm pocket_poem.db
node scripts/generate-db.js
node scripts/mark-hot-poems.js
```

### Q: 诗词没有显示？

确保按顺序运行两个脚本：
```bash
node scripts/generate-db.js    # 必须先运行
node scripts/mark-hot-poems.js # 再运行这个
```

### Q: 性能很慢？

- 首次生成数据库需要 1-2 分钟，这是正常的
- 应用运行时应该很流畅

---

## 📚 详细文档

- **SCRIPTS_USAGE.md** - 脚本详细说明
- **HOT_POEMS_SETUP.md** - 功能完整指南
- **IMPLEMENTATION_SUMMARY.md** - 技术实现细节

---

## 🎯 核心功能

✨ **452 首热门诗词** - 根据 popular-poems.json 标记  
✨ **分页加载** - 每页 10 首，自动加载更多  
✨ **快速查阅** - 点击诗词卡片查看完整内容  
✨ **详情页面** - 展示题目、作者、内容  

---

## 💾 数据概览

| 项目 | 数值 |
|------|------|
| 数据库大小 | 91 MB |
| 总诗词数 | 287,555 首 |
| 热门诗词 | 452 首 |
| 生成时间 | 1-2 分钟 |
| 标记时间 | 10-30 秒 |

---

**👉 现在就开始吧！运行上面的三个命令，享受热门诗词！**
