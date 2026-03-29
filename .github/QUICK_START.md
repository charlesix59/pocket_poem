# 🚀 快速开始指南 - GitHub Actions CI/CD

## 第一步: 本地准备 (5 分钟)

### 1.1 安装 EAS CLI
```bash
npm install -g eas-cli
```

### 1.2 登录 Expo
```bash
eas login
```

### 1.3 初始化项目（如果尚未做过）
```bash
eas build:configure
```

## 第二步: 生成 Expo Token (3 分钟)

```bash
# 在终端中生成 token
eas token create --scope admin --name "github-actions"

# 复制显示的 token
```

## 第三步: 配置 GitHub Secrets (5 分钟)

1. **打开 GitHub 仓库**
   - 进入 Settings → Secrets and variables → Actions

2. **添加 EXPO_TOKEN**
   - 点击 "New repository secret"
   - Name: `EXPO_TOKEN`
   - Value: 粘贴从步骤 2 复制的 token
   - 点击 "Add secret"

3. **（可选）添加 iOS App Store Secrets**
   - 如果要上传到 TestFlight，按照 WORKFLOW_SETUP.md 配置

## 第四步: 测试工作流 (10 分钟)

### 方式 A: 通过 GitHub UI (推荐新手)

1. 进入 GitHub 仓库 → Actions
2. 选择 "Build Android APK" 工作流
3. 点击 "Run workflow"
4. 选择分支 (main)
5. 点击绿色的 "Run workflow" 按钮
6. 等待构建完成（通常 10-15 分钟）

### 方式 B: 通过 Git Tag (推荐发布)

```bash
# 在本地创建 tag
git tag v1.0.0-test

# 推送到 GitHub
git push origin v1.0.0-test

# GitHub Actions 会自动触发构建
```

### 方式 C: 通过推送到 main

```bash
git push origin main

# 工作流会自动触发
```

## 第五步: 监控构建 (2 分钟)

1. **进入 Actions 页面**
   - GitHub 仓库 → Actions 标签

2. **查看最新的工作流运行**
   - 看到黄色圆圈 ⏳ = 运行中
   - 看到绿色对勾 ✅ = 成功
   - 看到红色 ✗ = 失败

3. **下载产物**
   - 点击工作流运行
   - 向下滚动到 "Artifacts"
   - 下载 "android-apk" 或 "ios-ipa"

## 第六步: 获取构建产物 (1 分钟)

### Android APK
```bash
# 下载 APK 后，可以通过 adb 安装到设备
adb install app-release.apk
```

### iOS IPA
```bash
# IPA 文件用于上传到 App Store
# 或在 Xcode 中打开: Xcode → Open → build-xxx.ipa
```

## 📊 常见工作流

### 场景 1: 日常开发版本
```bash
git push origin main
# ✅ 自动构建 APK 和 IPA，上传到 Artifacts
```

### 场景 2: 测试发布版本
```bash
git tag v1.0.0-rc1
git push origin v1.0.0-rc1
# ✅ 自动构建并创建 GitHub Release
```

### 场景 3: 正式发布到应用商店
```bash
git tag v1.0.0
git push origin v1.0.0
# ✅ 自动构建、创建 Release、上传到 TestFlight
```

## 🔥 常见问题快速解决

| 问题 | 解决方案 |
|------|---------|
| ❌ "Error: EXPO_TOKEN not found" | 检查 GitHub Secrets 是否添加了 EXPO_TOKEN |
| ❌ "Build failed: Node modules" | 本地运行 `npm install` 确认无误 |
| ❌ "Submodule failed" | 检查子模块是否正确初始化: `git submodule update --init` |
| ❌ "Build timeout" | 调整工作流中的超时时间 |
| ⏳ "Build 卡在某一步" | 查看 workflow 日志，检查网络连接 |

## 📱 安装 APK 到设备

### 通过 adb (连接 USB)
```bash
adb install app-release.apk
```

### 通过手机直接打开
```bash
# 将 APK 文件发送到手机
# 打开文件管理器，点击 APK 文件安装
```

### 生成二维码分享
```bash
# 可以使用在线工具生成 APK 文件链接的二维码
# 方便他人下载安装
```

## 🎯 下一步

1. ✅ 已完成初始设置
2. 📖 阅读详细配置: [WORKFLOW_SETUP.md](./WORKFLOW_SETUP.md)
3. 🔧 按需自定义工作流文件
4. 🚀 开始使用自动化构建！

## 💡 提示

- 建议在 `main` 分支稳定后再设置自动上传到应用商店
- 保管好 EXPO_TOKEN，不要泄露
- 定期更新依赖和 SDK 版本
- 在应用商店上传前本地测试构建成功

## 📞 获取帮助

- 查看工作流日志（GitHub Actions UI）
- 阅读 [Expo EAS 文档](https://docs.expo.dev/build/introduction/)
- 检查 [GitHub Actions 文档](https://docs.github.com/en/actions)

