git commit -m "你的更新說明"# Zeabur 部署指南 - 自我反省網站

## 📋 部署前準備

### 1. 創建Git倉庫
```bash
# 初始化Git倉庫
git init

# 添加所有文件
git add .

# 提交代碼
git commit -m "Initial commit: Self-reflection app"

# 推送到GitHub/GitLab (需要先創建遠程倉庫)
git remote add origin https://github.com/你的用戶名/self-reflection-app.git
git branch -M main
git push -u origin main
```

## 🚀 Zeabur 部署步驟

### 步驟 1: 登錄 Zeabur
1. 訪問 [https://zeabur.com](https://zeabur.com)
2. 使用GitHub/GitLab賬號登錄

### 步驟 2: 創建新項目
1. 點擊 "Create Project"
2. 選擇一個區域（建議選擇香港或新加坡）
3. 輸入項目名稱，例如 "self-reflection"

### 步驟 3: 添加PostgreSQL數據庫
1. 在項目頁面點擊 "Add Service"
2. 選擇 "Database" → "PostgreSQL"
3. 等待數據庫部署完成
4. 記下數據庫連接信息（會自動生成環境變量）

### 步驟 4: 部署應用
1. 點擊 "Add Service" → "Git Repository"
2. 選擇你的Git倉庫
3. Zeabur會自動檢測到Node.js項目
4. 等待部署完成

### 步驟 5: 配置環境變量
1. 點擊你的應用服務
2. 進入 "Environment Variables" 標籤
3. 添加以下環境變量：
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: (會自動從PostgreSQL服務獲取)

## 🗄️ PostgreSQL 配置

### 自動配置（推薦）
Zeabur會自動設置以下環境變量：
- `DATABASE_URL`: 完整的數據庫連接字符串
- `POSTGRES_HOST`: 數據庫主機
- `POSTGRES_PORT`: 數據庫端口
- `POSTGRES_USER`: 數據庫用戶名
- `POSTGRES_PASSWORD`: 數據庫密碼
- `POSTGRES_DATABASE`: 數據庫名稱

### 手動配置（如果需要）
如果需要手動配置，連接字符串格式：
```
postgresql://用戶名:密碼@主機:端口/數據庫名
```

## 📱 域名設置

### 使用Zeabur提供的域名
- 部署完成後，Zeabur會自動提供一個 `.zeabur.app` 域名
- 例如：`https://your-app-name.zeabur.app`

### 使用自定義域名（可選）
1. 在應用設置中點擊 "Domains"
2. 添加你的自定義域名
3. 按照指示設置DNS記錄

## 🔧 部署後驗證

### 檢查應用狀態
1. 訪問你的應用URL
2. 測試所有功能：
   - 點擊各個按鈕
   - 輸入反省內容
   - 查看統計圖表
   - 測試詳細記錄篩選

### 檢查數據庫
1. 在Zeabur控制台查看PostgreSQL服務狀態
2. 確認數據表已自動創建
3. 測試數據保存功能

## 🐛 常見問題解決

### 問題1: 應用無法啟動
**解決方案:**
- 檢查 `package.json` 中的 `start` 腳本
- 確認所有依賴都在 `dependencies` 中
- 查看應用日誌

### 問題2: 數據庫連接失敗
**解決方案:**
- 確認PostgreSQL服務正在運行
- 檢查 `DATABASE_URL` 環境變量
- 確認防火牆設置

### 問題3: 靜態文件無法加載
**解決方案:**
- 確認 `public` 文件夾結構正確
- 檢查Express靜態文件配置

## 📊 監控和維護

### 查看日誌
1. 在Zeabur控制台點擊你的應用
2. 查看 "Logs" 標籤
3. 監控錯誤和性能

### 數據備份
1. 定期導出數據庫數據
2. 可以使用PostgreSQL的 `pg_dump` 工具

### 更新應用
1. 推送新代碼到Git倉庫
2. Zeabur會自動重新部署
3. 或者手動觸發重新部署

## 💰 費用說明

### 免費額度
- Zeabur提供免費額度
- 包括基本的計算和存儲資源
- 適合個人使用和測試

### 付費計劃
- 如果需要更多資源或自定義域名
- 可以升級到付費計劃
- 按使用量計費

## 🔐 安全建議

1. **環境變量**: 不要在代碼中硬編碼敏感信息
2. **HTTPS**: Zeabur自動提供HTTPS
3. **數據庫**: 使用強密碼
4. **備份**: 定期備份重要數據

## 📱 移動端優化

部署後在iPhone上測試：
1. 添加到主屏幕（PWA功能）
2. 測試觸摸操作
3. 驗證響應式設計
4. 檢查離線功能

## 🎉 部署完成！

恭喜！你的自我反省網站現在已經在線運行了。你可以：
- 在任何設備上訪問
- 記錄你的日常反省
- 查看統計數據
- 隨時隨地進行自我提升

記住要定期使用這個工具來幫助自己成長！ 🌱