# 🍎 คู่มือส่ง “ตัวจิ๋ว” ขึ้น App Store

> สถานะ: โปรเจกต์ iOS พร้อมแล้ว (`ios/App/App.xcodeproj`), build ผ่าน, ไอคอน+สป-แลชครบ
> เหลือขั้นที่ต้องใช้ Apple ID ของคุณ (เซ็น + อัปโหลด + กรอกข้อมูล + ส่งรีวิว)

ข้อมูลแอพ
- **ชื่อ:** ตัวจิ๋ว
- **Bundle ID:** `app.tuajiw.mombaby`
- **Privacy Policy URL:** https://micamegan49-sketch.github.io/mom-baby/privacy.html
- **เว็บ/Support URL:** https://micamegan49-sketch.github.io/mom-baby/

---

## ขั้นที่ 1 — เปิดโปรเจกต์ใน Xcode
ในเทอร์มินัล:
```
cd ~/mom-baby && npm run open:ios
```
(หรือดับเบิลคลิก `ios/App/App.xcodeproj`)

## ขั้นที่ 2 — เซ็นแอพ (ใส่ Apple ID)
1. ใน Xcode คลิกที่ **App** (ไอคอนสีฟ้าบนซ้าย) → แท็บ **Signing & Capabilities**
2. ติ๊ก **Automatically manage signing**
3. ช่อง **Team** → **Add an Account…** → ล็อกอินด้วย Apple ID ที่สมัคร Developer ไว้ → เลือกทีมของคุณ
4. ดูให้ **Bundle Identifier = `app.tuajiw.mombaby`** (มีอยู่แล้ว) — ถ้าแดง ลองเปลี่ยน Team แล้วรอสักครู่

## ขั้นที่ 3 — ตั้งชื่อ/เวอร์ชัน
แท็บ **General**:
- **Display Name:** ตัวจิ๋ว
- **Version:** 1.0  ·  **Build:** 1

## ขั้นที่ 4 — สร้างแอพใน App Store Connect
1. ไป https://appstoreconnect.apple.com → **My Apps** → ปุ่ม **+** → **New App**
2. กรอก: Platform **iOS** · Name **ตัวจิ๋ว** · Primary Language **Thai** · Bundle ID เลือก **app.tuajiw.mombaby** · SKU พิมพ์อะไรก็ได้ เช่น `tuajiw001`
3. กด **Create**

## ขั้นที่ 5 — อัปโหลดไฟล์แอพจาก Xcode
1. บนแถบบนสุดของ Xcode เลือกอุปกรณ์เป็น **Any iOS Device (arm64)**
2. เมนู **Product → Archive** (รอ build สักครู่)
3. หน้าต่าง Organizer เด้งมา → **Distribute App** → **App Store Connect** → **Upload** → กดผ่านไปจนเสร็จ
4. รอ ~5–15 นาที ให้ Apple ประมวลผลไฟล์ (จะมีอีเมลแจ้ง)

## ขั้นที่ 6 — กรอกข้อมูลหน้าร้าน (ใน App Store Connect)
ในหน้าแอพที่สร้างไว้ กรอก:
- **Screenshots (จำเป็น):** ใช้รูปหน้าจอจาก iPhone ของคุณได้เลย (ที่แคปมาตอนเล่นแอพ) — ต้องเป็นขนาด 6.7" (เช่น iPhone 15/16 Plus/Pro Max) อย่างน้อย 3 รูป
- **Description:** (มีตัวอย่างให้ด้านล่าง)
- **Keywords:** แม่และเด็ก,ตั้งครรภ์,วัคซีน,พัฒนาการ,บันทึกลูก,กราฟเติบโต
- **Support URL:** https://micamegan49-sketch.github.io/mom-baby/
- **Privacy Policy URL:** https://micamegan49-sketch.github.io/mom-baby/privacy.html
- **Category:** Health & Fitness (หรือ Medical)
- **Age Rating:** ตอบแบบสอบถาม → จะได้ 4+
- **App Privacy:** ประกาศว่าเก็บ “อีเมล” (เพื่อบัญชี) และ “User Content” (ข้อมูลที่ผู้ใช้กรอก) — ไม่ใช้เพื่อโฆษณา ไม่ติดตามข้ามแอพ
- **Pricing:** Free
- **Build:** เลือกไฟล์ที่อัปโหลดในขั้นที่ 5

## ขั้นที่ 7 — ข้อมูลให้ทีมรีวิว (สำคัญ! กันโดนปฏิเสธ)
ในส่วน **App Review Information** → เปิด **Sign-in required** แล้วใส่บัญชีทดสอบนี้ (ผมสร้าง+ใส่ข้อมูลตัวอย่างให้แล้ว):
```
Username: review@tuajiw.app
Password: TuaJiwReview2026
```
และในช่อง Notes เขียนสั้น ๆ ว่า:
> แอพใช้งานออฟไลน์ได้เต็มรูปแบบ (บันทึกประจำวัน วัคซีน กราฟเติบโต พัฒนาการ เครื่องมือคนท้อง)
> การล็อกอินเป็น “ทางเลือก” เพื่อซิงค์/แชร์ข้ามเครื่องเท่านั้น

## ขั้นที่ 8 — ส่งรีวิว
กด **Add for Review → Submit to App Review** → รอผล 1–3 วัน (อาจมีถาม-ตอบ)

---

## ตัวอย่าง Description
```
ตัวจิ๋ว — ผู้ช่วยดูแลคุณแม่และลูกน้อย ตั้งแต่ในครรภ์จนถึงวัยเตาะแตะ (0–5 ปี)

• โหมดตั้งครรภ์ ติดตามรายสัปดาห์ เทียบขนาดลูกกับผลไม้ คำนวณน้ำหนัก/BMI นับลูกดิ้น จับเวลามดลูกหดตัว
• บันทึกประจำวัน นม/นอน/ผ้าอ้อม/สุขภาพ พร้อมสรุปรายวัน
• ตารางวัคซีนอิง EPI ไทย คำนวณวันครบกำหนดจากวันเกิด เตือนเข็มที่เลยกำหนด
• กราฟการเจริญเติบโต เทียบเกณฑ์อ้างอิง WHO
• พัฒนาการตามวัย + ธงแดงที่ควรพบแพทย์
• เกร็ดความรู้ บทความ และราคาคลอด/วัคซีนของโรงพยาบาล
• ใช้งานออฟไลน์ได้ + ซิงค์ข้ามเครื่องและแชร์ให้พี่เลี้ยงช่วยบันทึกได้ (ถ้าต้องการ)

ข้อมูลเก็บในเครื่องเป็นค่าเริ่มต้น ความเป็นส่วนตัวมาก่อน
หมายเหตุ: เนื้อหาเพื่อความรู้ทั่วไป ไม่ใช่คำวินิจฉัยทางการแพทย์
```

---

## คำสั่งที่ใช้บ่อย (เวลาแก้โค้ดเว็บแล้วอยากอัปเข้าแอพ)
```
cd ~/mom-baby
npm run sync        # ก๊อปไฟล์เว็บล่าสุดเข้าโปรเจกต์ iOS
npm run open:ios    # เปิด Xcode
```
แล้วทำขั้นที่ 3 (เพิ่มเลข Build) → Archive → Upload ใหม่
