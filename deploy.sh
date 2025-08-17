#!/bin/bash

echo "🚀 準備部署自我反省網站到Zeabur..."
echo ""

# 檢查Git是否初始化
if [ ! -d ".git" ]; then
    echo "📝 初始化Git倉庫..."
    git init
    echo "✅ Git倉庫已初始化"
else
    echo "✅ Git倉庫已存在"
fi

# 添加所有文件
echo "📁 添加文件到Git..."
git add .

# 檢查是否有變更
if git diff --staged --quiet; then
    echo "ℹ️  沒有新的變更需要提交"
else
    # 提交變更
    echo "💾 提交變更..."
    git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "✅ 變更已提交"
fi

echo ""
echo "🎯 部署準備完成！"
echo ""
echo "📋 接下來的步驟："
echo "1. 創建GitHub倉庫 (如果還沒有)"
echo "2. 添加遠程倉庫: git remote add origin https://github.com/你的用戶名/倉庫名.git"
echo "3. 推送代碼: git push -u origin main"
echo "4. 在Zeabur中連接你的倉庫"
echo ""
echo "🔗 Zeabur部署鏈接: https://zeabur.com"
echo ""

# 顯示項目文件結構
echo "📂 項目文件結構:"
tree -I 'node_modules|.git|tmp_*' || ls -la

echo ""
echo "🌟 部署指南已保存在: zeabur-deployment-guide.md"