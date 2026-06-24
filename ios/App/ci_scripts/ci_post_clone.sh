#!/bin/sh

# Xcode Cloud — รันหลัง clone repo เสร็จ
# จุดประสงค์: สร้างไฟล์เว็บของ Capacitor (www/) แล้วซิงก์เข้า iOS project
# เพราะ www/ และ ios/App/App/public/ ถูก gitignore (สร้างจากซอร์สตอน build)

set -e
echo "=== ci_post_clone: เตรียมไฟล์เว็บ Capacitor ==="

# ติดตั้ง Node.js (อิมเมจ Xcode Cloud มี Homebrew)
brew install node

# ไปที่ราก repo แล้ว build เว็บ + ซิงก์เข้า iOS
cd "$CI_PRIMARY_REPOSITORY_PATH"
npm ci
npm run build:web
npx cap sync ios

echo "=== ci_post_clone: เสร็จสิ้น ==="
