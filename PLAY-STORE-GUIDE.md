# คู่มือส่งแอป "ตัวจิ๋ว" ขึ้น Google Play Store

แอปถูกห่อด้วย **Capacitor** (เว็บ PWA → แอปเนทีฟ) ตอนนี้เพิ่ม **Android platform** ให้แล้ว
- `appId` (package name): `app.tuajiw.mombaby`  ← ต้องไม่ซ้ำใครบน Play และ **เปลี่ยนไม่ได้หลังเผยแพร่**
- โปรเจกต์ Android อยู่ที่ `android/`

---

## สิ่งที่ต้องเตรียม (ครั้งเดียว)
1. **บัญชี Google Play Console** — สมัครที่ https://play.google.com/console ค่าธรรมเนียม **$25 (จ่ายครั้งเดียวตลอดชีพ)** บัญชีแบบ Individual ต้องยืนยันตัวตน (อาจขอบัตรประชาชน/ที่อยู่) ใช้เวลายืนยันสองสามวัน
2. **Android Studio** (ฟรี) — https://developer.android.com/studio ติดตั้งพร้อม JDK ในตัว
3. **โลโก้/ภาพประกอบ** สำหรับหน้าร้าน (ดูข้อ 4)

---

## ขั้นที่ 1 — ซิงก์เว็บล่าสุดเข้าแอป
ทุกครั้งที่แก้โค้ดเว็บ ให้รัน (ต้อง source nvm ก่อนถ้า node ไม่ขึ้น):
```bash
cd ~/mom-baby
npm run sync:android      # = build:web + cap sync android
npm run open:android      # เปิดโปรเจกต์ใน Android Studio
```

## ขั้นที่ 2 — ตั้งเวอร์ชัน
แก้ไฟล์ `android/app/build.gradle` ในบล็อก `defaultConfig`:
- `versionCode 1` → **ต้องเพิ่มทีละ 1 ทุกครั้งที่อัปโหลดไฟล์ใหม่** (2, 3, 4, ...)
- `versionName "1.0.0"` → เลขเวอร์ชันที่ผู้ใช้เห็น

## ขั้นที่ 3 — สร้าง Keystore + ไฟล์ AAB ที่เซ็นแล้ว
Play ต้องการไฟล์ **.aab** (Android App Bundle) ที่เซ็นด้วย "upload key"

ใน Android Studio:
1. เมนู **Build → Generate Signed App Bundle / APK… → Android App Bundle → Next**
2. **Create new…** (ครั้งแรก) เพื่อสร้าง keystore:
   - เลือกที่เก็บไฟล์ เช่น `~/tuajiw-upload.jks` (เก็บ**นอกโฟลเดอร์โปรเจกต์** เพราะ `.gitignore` กันไม่ให้ commit แล้ว)
   - ตั้งรหัสผ่าน + ข้อมูล (ชื่อ/องค์กร) — **จดรหัสและสำรองไฟล์ .jks ไว้หลายที่**
   - 🔐 **สำคัญมาก:** ถ้าทำ keystore นี้หายหรือลืมรหัส จะ**อัปเดตแอปเดิมไม่ได้อีกเลย**
3. เลือก build variant = **release** → Finish
4. ได้ไฟล์ที่ `android/app/release/app-release.aab`

> 💡 Google มีระบบ **Play App Signing** — เราอัปโหลดด้วย "upload key" ของเรา ส่วน Google ถือ "app signing key" จริงไว้ให้ (แนะนำให้เปิดใช้ ปลอดภัยกว่า)

## ขั้นที่ 4 — ตั้งค่าใน Play Console
สร้างแอปใหม่ (Create app): ชื่อ **ตัวจิ๋ว**, ภาษาเริ่มต้น **ไทย**, ประเภท **App**, **ฟรี**

ต้องกรอกให้ครบก่อนเผยแพร่ (เมนู *Dashboard* จะไล่ให้):
- **Privacy policy** → ใช้ลิงก์ที่มีอยู่: `https://micamegan49-sketch.github.io/mom-baby/privacy.html`
- **Data safety** — แบบฟอร์มบอกว่าแอปเก็บ/ส่งข้อมูลอะไร (แอปนี้เก็บข้อมูลในเครื่องเป็นหลัก; ถ้าผู้ใช้เปิด cloud sync เองค่อยระบุว่าเก็บผ่าน Supabase)
- **Content rating** — ทำแบบสอบถาม จะได้เรตอายุ (แอปนี้ควรได้ "ทุกวัย")
- **Target audience** — กลุ่มเป้าหมายผู้ใหญ่ (พ่อแม่) ไม่ได้เจาะเด็ก
- **Ads** — ระบุว่า**ไม่มีโฆษณา** (ถ้ายังไม่ใส่ลิงก์ affiliate/โฆษณา)
- **App access** — ถ้ามีหน้า login ให้ใส่บัญชีทดสอบ (แอปนี้ใช้ได้โดยไม่ต้องล็อกอิน บอกได้เลย)

**Store listing** (หน้าร้าน):
- ไอคอน **512×512 px** (PNG)
- Feature graphic **1024×500 px**
- สกรีนช็อตมือถืออย่างน้อย **2 รูป** (แนะนำ 4-8 รูป) — แคปจากแอปจริง
- ชื่อแอป (≤30 ตัวอักษร), คำโปรยสั้น (≤80), รายละเอียด (≤4000)

## ขั้นที่ 5 — อัปโหลด & ปล่อย
1. แนะนำเริ่มที่ **Testing → Internal testing** ก่อน: สร้าง release, อัปโหลด `app-release.aab`, เพิ่มอีเมลผู้ทดสอบ → ลองติดตั้งจริงผ่านลิงก์
2. เมื่อพร้อม → **Production → Create new release** → อัปโหลด .aab → กรอก release notes → **Review release → Rollout**
3. ส่งรีวิว — Google ใช้เวลาตรวจ **ไม่กี่ชั่วโมงถึงไม่กี่วัน** (แอปครั้งแรก/บัญชีใหม่มักนานกว่า อาจถึง ~7 วัน)

---

## ข้อควรรู้
- Play ยอมรับแอปแบบ "ห่อเว็บ" (WebView) ได้ถ้า**มีประโยชน์จริงและใช้งานออฟไลน์ได้** — แอปนี้เข้าเกณฑ์ (ฟีเจอร์เยอะ ทำงานออฟไลน์)
- ถ้าจะใส่ลิงก์ **affiliate/แนะนำซื้อ** ต้องประกาศเรื่อง Ads/รายได้ให้ตรงในแบบฟอร์ม และเลี่ยงเนื้อหาที่ Play ห้าม
- บัญชี Play **Individual ที่เปิดหลัง ~ปลายปี 2023** มักต้อง **ทดสอบแบบ closed testing กับผู้ทดสอบ ≥12 คน ต่อเนื่อง 14 วัน** ก่อนถึงจะขอเปิด Production ได้ — เผื่อเวลาส่วนนี้ไว้ด้วย
- ทุกการอัปเดตในอนาคต: แก้โค้ด → `npm run sync:android` → เพิ่ม `versionCode` → สร้าง .aab ใหม่ (เซ็นด้วย keystore เดิม) → อัปโหลด

## สรุปสิ่งที่ผมทำให้แล้ว
- ✅ เพิ่ม `@capacitor/android` + สร้างโปรเจกต์ `android/`
- ✅ สร้างไอคอน/สเปลชสกรีน Android ครบทุกขนาด (จาก `resources/icon.png`)
- ✅ ตั้ง `appId`, `backgroundColor`, สคริปต์ `sync:android`/`open:android`
- ✅ `.gitignore` กันไฟล์ build + **keystore** ไม่ให้หลุดขึ้น git

เหลือเป็นขั้นตอนที่ต้องทำผ่าน GUI/บัญชีของคุณเอง: สมัคร Play Console, สร้าง keystore, Generate Signed Bundle, กรอกหน้าร้าน, อัปโหลด .aab
