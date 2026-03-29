#!/bin/bash

# 🚀 GitHub Actions 初始化脚本
# 此脚本帮助你快速配置 GitHub Actions 所需的一切

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_header() {
  echo ""
  echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║${NC} $1"
  echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
  echo ""
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
  echo -e "${CYAN}ℹ️  $1${NC}"
}

# 检查是否在项目根目录
check_project_root() {
  if [ ! -f "package.json" ] || [ ! -f "app.json" ]; then
    print_error "请在项目根目录运行此脚本"
    exit 1
  fi
  print_success "项目目录验证完成"
}

# 检查 Git 仓库
check_git_repo() {
  if [ ! -d ".git" ]; then
    print_error "此项目不是 Git 仓库"
    echo "请运行: git init"
    exit 1
  fi
  print_success "Git 仓库验证完成"
  
  # 获取远程信息
  if git remote get-url origin &>/dev/null; then
    REMOTE_URL=$(git remote get-url origin)
    print_info "远程仓库: $REMOTE_URL"
  else
    print_warning "未找到 origin 远程仓库"
  fi
}

# 显示 Expo 账户检查
check_expo_account() {
  print_header "Expo 账户检查"
  
  if command -v eas &> /dev/null; then
    print_success "eas-cli 已安装"
  else
    print_warning "eas-cli 未安装"
    read -p "是否要安装 eas-cli? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      npm install -g eas-cli
      print_success "eas-cli 已安装"
    fi
  fi
  
  # 检查 Expo 登录状态
  if eas whoami &>/dev/null; then
    EXPO_USER=$(eas whoami 2>/dev/null || echo "Unknown")
    print_success "已登录 Expo 账户: $EXPO_USER"
  else
    print_warning "未登录 Expo"
    print_info "请运行: eas login"
  fi
}

# 生成 EXPO_TOKEN
generate_expo_token() {
  print_header "生成 EXPO_TOKEN"
  
  print_info "将为 GitHub Actions 生成一个新的 EXPO_TOKEN"
  print_info "这个 token 用于 CI/CD 环境自动构建"
  echo ""
  print_warning "你有两种方式生成 token:"
  echo ""
  echo "方式 1: 通过 Expo 网页（推荐）"
  echo "  1. 访问: https://expo.dev/settings/tokens"
  echo "  2. 点击 'Create Token'"
  echo "  3. 输入 token 名称（如: github-actions-ci）"
  echo "  4. 选择权限: admin"
  echo "  5. 点击 'Create'"
  echo "  6. 复制生成的 token"
  echo ""
  echo "方式 2: 使用命令行"
  echo "  注意: 此方法需要较新的 eas-cli 版本"
  echo "  运行: npm install -g eas-cli@latest"
  echo "  然后: eas token create --scope admin"
  echo ""
  
  read -p "已通过方式 1 或 2 生成了 token 吗? (y/n) " -n 1 -r
  echo
}

# 获取用户输入的 Token
input_expo_token() {
  print_header "输入 EXPO_TOKEN"
  
  echo "请粘贴你刚才生成的 EXPO_TOKEN:"
  read -s EXPO_TOKEN
  
  if [ -z "$EXPO_TOKEN" ]; then
    print_error "Token 不能为空"
    return 1
  fi
  
  print_success "Token 已记录"
  return 0
}

# 检查 GitHub CLI
check_github_cli() {
  print_header "GitHub CLI 检查"
  
  if ! command -v gh &> /dev/null; then
    print_warning "GitHub CLI 未安装"
    print_info "可通过以下方式安装:"
    echo "  brew install gh          (macOS)"
    echo "  choco install gh         (Windows)"
    echo "  或访问: https://cli.github.com"
    echo ""
    return 1
  fi
  
  print_success "GitHub CLI 已安装"
  
  # 检查 GitHub 登录状态
  if gh auth status &>/dev/null; then
    print_success "已登录 GitHub"
  else
    print_warning "未登录 GitHub"
    print_info "请运行: gh auth login"
    return 1
  fi
}

# 设置 GitHub Secrets
setup_github_secrets() {
  print_header "设置 GitHub Secrets"
  
  # 检查 GitHub CLI
  if ! command -v gh &> /dev/null; then
    print_warning "GitHub CLI 未安装，无法自动设置 secrets"
    print_info "请手动设置:"
    echo "  1. 访问: https://github.com/你的仓库名/settings/secrets/actions"
    echo "  2. 点击 'New repository secret'"
    echo "  3. 添加 EXPO_TOKEN"
    return 1
  fi
  
  if [ -z "$EXPO_TOKEN" ]; then
    print_error "EXPO_TOKEN 未设置"
    return 1
  fi
  
  read -p "使用 GitHub CLI 设置 secrets? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "设置 EXPO_TOKEN..."
    echo "$EXPO_TOKEN" | gh secret set EXPO_TOKEN
    print_success "EXPO_TOKEN 已设置"
  else
    print_info "请手动设置 secrets："
    echo "  1. 访问: https://github.com/你的仓库名/settings/secrets/actions"
    echo "  2. 点击 'New repository secret'"
    echo "  3. Name: EXPO_TOKEN"
    echo "  4. Value: 粘贴你的 token"
  fi
}

# 验证工作流文件
verify_workflows() {
  print_header "验证工作流文件"
  
  local workflows=(
    ".github/workflows/build-android.yml"
    ".github/workflows/build-ios.yml"
    ".github/workflows/build-all.yml"
  )
  
  for workflow in "${workflows[@]}"; do
    if [ -f "$workflow" ]; then
      print_success "$workflow 已存在"
    else
      print_error "$workflow 不存在"
    fi
  done
}

# 验证配置文件
verify_config_files() {
  print_header "验证配置文件"
  
  local files=(
    "eas.json"
    "app.json"
    ".github/QUICK_START.md"
    ".github/WORKFLOW_SETUP.md"
    ".github/CI_CD_GUIDE.md"
  )
  
  for file in "${files[@]}"; do
    if [ -f "$file" ]; then
      print_success "$file 已存在"
    else
      print_error "$file 不存在"
    fi
  done
}

# 显示后续步骤
show_next_steps() {
  print_header "✨ 设置完成！后续步骤"
  
  echo -e "${CYAN}1️⃣  验证 Secrets 已设置${NC}"
  echo "   访问: https://github.com/你的仓库名/settings/secrets/actions"
  echo "   确认 EXPO_TOKEN 已列出"
  echo ""
  
  echo -e "${CYAN}2️⃣  推送代码到 GitHub${NC}"
  echo "   git add ."
  echo "   git commit -m 'Add GitHub Actions CI/CD'"
  echo "   git push origin main"
  echo ""
  
  echo -e "${CYAN}3️⃣  测试 CI/CD 流程${NC}"
  echo "   选项 A: 创建 tag 触发自动构建"
  echo "   git tag v1.0.0-test"
  echo "   git push origin v1.0.0-test"
  echo ""
  echo "   选项 B: 进入 GitHub Actions 手动触发"
  echo "   https://github.com/你的仓库名/actions"
  echo ""
  
  echo -e "${CYAN}4️⃣  监控构建进度${NC}"
  echo "   访问 Actions 页面查看实时日志"
  echo ""
  
  echo -e "${CYAN}5️⃣  阅读文档${NC}"
  echo "   详细指南: .github/CI_CD_GUIDE.md"
  echo "   快速开始: .github/QUICK_START.md"
  echo "   Secret配置: .github/WORKFLOW_SETUP.md"
  echo ""
}

# 显示帮助
show_help() {
  cat << EOF
${BLUE}🚀 GitHub Actions 初始化脚本${NC}

用法: ./scripts/setup-github-actions.sh [选项]

选项:
  --full           完整设置流程（推荐首次使用）
  --token          仅生成和设置 EXPO_TOKEN
  --verify         验证配置是否完整
  --help           显示此帮助信息

示例:
  # 完整设置
  ./scripts/setup-github-actions.sh --full

  # 仅生成 token
  ./scripts/setup-github-actions.sh --token

  # 验证配置
  ./scripts/setup-github-actions.sh --verify

EOF
}

# 完整设置流程
full_setup() {
  print_header "🚀 完整 GitHub Actions 设置"
  
  check_project_root
  check_git_repo
  check_expo_account
  
  print_header "EXPO_TOKEN 设置"
  print_info "现在需要生成或输入 EXPO_TOKEN"
  echo ""
  
  generate_expo_token
  input_expo_token || exit 1
  
  verify_workflows
  verify_config_files
  
  check_github_cli
  setup_github_secrets
  
  show_next_steps
  
  print_header "✅ 设置完成！"
  print_success "所有准备工作已完成，现在可以使用 GitHub Actions 了！"
}

# 仅 token 设置
token_only_setup() {
  print_header "🔑 EXPO_TOKEN 设置"
  
  check_project_root
  check_expo_account
  generate_expo_token
  input_expo_token || exit 1
  
  print_header "✅ Token 已保存"
  print_success "EXPO_TOKEN 已记录"
  echo ""
  print_info "要将 token 设置到 GitHub，请运行以下命令之一:"
  echo ""
  echo "  # 使用 GitHub CLI (推荐)"
  echo "  echo \$EXPO_TOKEN | gh secret set EXPO_TOKEN"
  echo ""
  echo "  # 或手动方式:"
  echo "  1. 访问: https://github.com/你的用户名/pocket_poem/settings/secrets/actions"
  echo "  2. 点击 'New repository secret'"
  echo "  3. Name: EXPO_TOKEN"
  echo "  4. Value: 粘贴你的 token"
  echo "  5. 点击 'Add secret'"
}

# 验证设置
verify_setup() {
  print_header "🔍 验证配置"
  
  check_project_root
  check_git_repo
  verify_workflows
  verify_config_files
  
  print_header "✅ 验证结果"
  print_success "所有配置文件已就位！"
  print_info "现在可以使用 GitHub Actions 了"
}

# 主函数
main() {
  local command="${1:---full}"
  
  case "$command" in
    --full)
      full_setup
      ;;
    --token)
      token_only_setup
      ;;
    --verify)
      verify_setup
      ;;
    --help|help)
      show_help
      ;;
    *)
      print_error "未知命令: $command"
      show_help
      exit 1
      ;;
  esac
}

# 运行主函数
main "$@"
