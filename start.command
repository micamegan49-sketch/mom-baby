#!/bin/bash
# ดับเบิลคลิกไฟล์นี้เพื่อเปิดแอพ "ตัวจิ๋ว"
cd "$(dirname "$0")"
PORT=8848
echo "เปิดแอพตัวจิ๋วที่  http://localhost:$PORT"
IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)
[ -n "$IP" ] && echo "บนมือถือ (Wi-Fi เดียวกัน):  http://$IP:$PORT"
sleep 1
open "http://localhost:$PORT" 2>/dev/null
python3 -m http.server $PORT
