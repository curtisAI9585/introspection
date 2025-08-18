#!/bin/bash

echo "🔧 正在啟動自我反省網站測試服務器..."
echo ""

# Check if public directory exists
if [ ! -d "public" ]; then
    echo "❌ 找不到 public 目錄"
    exit 1
fi

# Check if Python3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ 找不到 Python3，請先安裝 Python3"
    exit 1
fi

echo "✅ 環境檢查通過"
echo ""

# Get local IP for mobile testing
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

echo "📱 本地測試地址:"
echo "   電腦瀏覽器: http://localhost:8000"
if [ ! -z "$LOCAL_IP" ]; then
    echo "   手機瀏覽器: http://$LOCAL_IP:8000"
fi
echo ""

# Start the server
python3 simple_server.py