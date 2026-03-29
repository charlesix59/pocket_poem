#!/bin/bash

# 🚀 Pocket Poem Release Build Script
# 用于本地测试和手动构建 APK/IPA

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_header() {
  echo -e "${BLUE}=== $1 ===${NC}"
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠️ $1${NC}"
}

# 检查依赖
check_dependencies() {
  print_header "检查依赖"
  
  # 检查 Node.js
  if ! command -v node &> /dev/null; then
    print_error "未找到 Node.js，请先安装"
    exit 1
  fi
  print_success "Node.js 版本: $(node --version)"
  
  # 检查 npm
  if ! command -v npm &> /dev/null; then
    print_error "未找到 npm，请先安装"
    exit 1
  fi
  print_success "npm 版本: $(npm --version)"
  
  # 检查 eas-cli
  if ! command -v eas &> /dev/null; then
    print_warning "eas-cli 未安装，正在安装..."
    npm install -g eas-cli
  fi
  print_success "eas-cli 已安装"
  
  # 检查 Python（用于生成数据库）
  if ! command -v python3 &> /dev/null; then
    print_error "未找到 Python 3，某些功能可能无法使用"
  else
    print_success "Python 版本: $(python3 --version)"
  fi
}

# 安装依赖
install_dependencies() {
  print_header "安装 npm 依赖"
  npm install
  print_success "npm 依赖已安装"
}

# 生成数据库
generate_database() {
  print_header "生成数据库"
  npm run generate-db
  print_success "数据库已生成"
}

# 构建 Android APK
build_android() {
  print_header "构建 Android APK"
  
  if [ "$1" == "local" ]; then
    print_warning "使用本地构建模式（需要 Android SDK）"
    eas build --platform android --local
  else
    print_warning "使用云构建模式（Expo EAS）"
    eas build --platform android --non-interactive
  fi
  
  print_success "Android APK 构建完成"
}

# 构建 iOS IPA
build_ios() {
  print_header "构建 iOS IPA"
  
  if [ "$1" == "local" ]; then
    print_warning "使用本地构建模式（仅限 macOS，需要 Xcode）"
    eas build --platform ios --local
  else
    print_warning "使用云构建模式（Expo EAS）"
    eas build --platform ios --non-interactive
  fi
  
  print_success "iOS IPA 构建完成"
}

# 显示帮助
show_help() {
  cat << EOF
${BLUE}📦 Pocket Poem Release Build Script${NC}

用法: ./scripts/build-release.sh [命令] [选项]

命令:
  check         检查依赖是否已安装
  install       安装 npm 依赖
  generate-db   生成数据库
  android       构建 Android APK (云构建)
  android-local 构建 Android APK (本地构建)
  ios           构建 iOS IPA (云构建)
  ios-local     构建 iOS IPA (本地构建)
  all           完整构建流程（check -> install -> generate-db -> android -> ios）
  all-local     完整构建流程（本地模式）

选项:
  --help        显示此帮助信息
  --skip-db     跳过数据库生成

示例:
  # 仅检查依赖
  ./scripts/build-release.sh check

  # 构建 Android APK（云构建）
  ./scripts/build-release.sh android

  # 完整构建流程（跳过数据库）
  ./scripts/build-release.sh all --skip-db

  # 本地构建 iOS（需要 macOS 和 Xcode）
  ./scripts/build-release.sh ios-local

EOF
}

# 主函数
main() {
  local command="${1:-help}"
  local option="${2:-}"
  
  case "$command" in
    check)
      check_dependencies
      ;;
    install)
      install_dependencies
      ;;
    generate-db)
      if [ -f "scripts/generate-db.js" ]; then
        generate_database
      else
        print_error "未找到 generate-db.js，请检查脚本文件"
        exit 1
      fi
      ;;
    android)
      check_dependencies
      generate_database
      build_android "cloud"
      ;;
    android-local)
      check_dependencies
      generate_database
      build_android "local"
      ;;
    ios)
      check_dependencies
      generate_database
      build_ios "cloud"
      ;;
    ios-local)
      check_dependencies
      generate_database
      build_ios "local"
      ;;
    all)
      check_dependencies
      install_dependencies
      if [ "$option" != "--skip-db" ]; then
        generate_database
      fi
      build_android "cloud"
      build_ios "cloud"
      print_success "所有平台构建完成！"
      ;;
    all-local)
      check_dependencies
      install_dependencies
      if [ "$option" != "--skip-db" ]; then
        generate_database
      fi
      build_android "local"
      build_ios "local"
      print_success "所有平台本地构建完成！"
      ;;
    help|--help)
      show_help
      ;;
    *)
      print_error "未知命令: $command"
      echo ""
      show_help
      exit 1
      ;;
  esac
}

# 运行主函数
main "$@"
