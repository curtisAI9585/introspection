# 🗑️ Zeabur PostgreSQL 清除測試數據指南

## 方法1: 通過網站API清除（推薦）

### 創建清除數據的API端點
我可以為你添加一個清除數據的功能到網站中。

### 步驟：
1. 我會添加一個 `/api/clear-data` 端點
2. 你可以通過訪問特定URL來清除數據
3. 安全且簡單

## 方法2: 通過Zeabur控制台

### 步驟1: 進入PostgreSQL服務
1. 登錄Zeabur控制台
2. 進入你的項目
3. 點擊 **PostgreSQL** 服務

### 步驟2: 查找數據庫管理工具
1. 在PostgreSQL服務頁面查看是否有 **"Console"** 或 **"Terminal"** 標籤
2. 或者查看是否有 **"Database Management"** 選項

### 步驟3: 執行SQL命令
如果有控制台，執行：
```sql
-- 清除所有反省數據
DELETE FROM reflections;

-- 重置ID計數器（可選）
ALTER SEQUENCE reflections_id_seq RESTART WITH 1;
```

## 方法3: 使用外部數據庫工具

### 獲取連接信息
1. 在PostgreSQL服務中找到：
   - Host: `postgresql.zeabur.internal`
   - Port: `5432`
   - Username: `root`
   - Password: `95C4ZV3m6blnI07UcXgzJqD8a1uRSpH2`
   - Database: `postgres`

### 使用工具連接
- **pgAdmin**
- **DBeaver**
- **TablePlus**
- **Postico** (Mac)

## 方法4: 重新創建數據庫（最徹底）

### 在Zeabur中：
1. 刪除現有的PostgreSQL服務
2. 重新添加PostgreSQL服務
3. 更新應用的DATABASE_URL環境變量

## 🚀 推薦方案：添加清除功能到網站

讓我為你添加一個安全的清除數據功能：