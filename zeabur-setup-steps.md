# 🔧 Zeabur PostgreSQL 設置步驟

## 問題診斷
你的網站顯示「保存失敗」是因為沒有正確連接到PostgreSQL數據庫。

## 🗄️ 在Zeabur中設置PostgreSQL

### 步驟1: 添加PostgreSQL服務
1. 登錄你的Zeabur控制台
2. 進入你的項目
3. 點擊 **"Add Service"**
4. 選擇 **"Database"** → **"PostgreSQL"**
5. 等待PostgreSQL服務部署完成（通常需要1-2分鐘）

### 步驟2: 檢查環境變量
1. PostgreSQL服務部署完成後，點擊PostgreSQL服務
2. 查看 **"Environment Variables"** 標籤
3. 你應該看到類似這些變量：
   ```
   POSTGRES_HOST=xxx.xxx.xxx.xxx
   POSTGRES_PORT=5432
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=xxxxxxxxxx
   POSTGRES_DATABASE=postgres
   DATABASE_URL=postgresql://postgres:password@host:5432/postgres
   ```

### 步驟3: 連接應用到數據庫
1. 點擊你的**應用服務**（不是PostgreSQL服務）
2. 進入 **"Environment Variables"** 標籤
3. 確認有以下環境變量：
   - `DATABASE_URL`: 應該自動從PostgreSQL服務獲取
   - `NODE_ENV`: 設置為 `production`

### 步驟4: 如果環境變量沒有自動設置
如果`DATABASE_URL`沒有自動設置，手動添加：
1. 從PostgreSQL服務複製`DATABASE_URL`的值
2. 在應用服務中添加環境變量：
   - 名稱: `DATABASE_URL`
   - 值: `postgresql://用戶名:密碼@主機:端口/數據庫名`

## 🔍 測試連接

### 方法1: 訪問健康檢查端點
訪問: `https://你的應用域名.zeabur.app/api/health`

**成功的響應:**
```json
{
  "success": true,
  "database": "connected",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```

**失敗的響應:**
```json
{
  "success": false,
  "database": "disconnected",
  "error": "connection error message",
  "help": "Check DATABASE_URL environment variable in Zeabur"
}
```

### 方法2: 查看應用日誌
1. 在Zeabur控制台點擊你的應用
2. 查看 **"Logs"** 標籤
3. 尋找以下信息：
   - ✅ `Database connected successfully`
   - ❌ `Database connection failed`

## 🚀 重新部署

修復環境變量後：
1. 在Zeabur控制台點擊你的應用
2. 點擊 **"Redeploy"** 按鈕
3. 等待重新部署完成
4. 測試網站功能

## 🐛 常見問題解決

### 問題1: PostgreSQL服務狀態異常
**解決方案:**
- 重啟PostgreSQL服務
- 檢查Zeabur服務狀態頁面

### 問題2: 環境變量沒有自動設置
**解決方案:**
- 手動複製DATABASE_URL
- 確保應用和數據庫在同一個項目中

### 問題3: 連接超時
**解決方案:**
- 檢查防火牆設置
- 確認PostgreSQL服務正在運行
- 重新部署應用

### 問題4: SSL證書錯誤
**解決方案:**
- 確認server.js中的SSL設置正確
- 生產環境應該使用SSL

## 📱 測試步驟

1. **訪問健康檢查**: `/api/health`
2. **測試保存功能**: 點擊任意按鈕並輸入文字
3. **檢查統計圖表**: 確認數據顯示
4. **查看詳細記錄**: 測試篩選功能

## 💡 成功指標

當一切正常時，你應該看到：
- ✅ 健康檢查返回成功
- ✅ 可以保存反省內容
- ✅ 統計圖表顯示數據
- ✅ 詳細記錄可以查看和篩選

## 📞 需要幫助？

如果仍然有問題，請提供：
1. Zeabur應用日誌截圖
2. `/api/health` 端點的響應
3. PostgreSQL服務的狀態
4. 環境變量設置截圖

我會幫你進一步診斷問題！