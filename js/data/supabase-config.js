/* ตัวจิ๋ว – ตั้งค่าการเชื่อมต่อ Supabase (ทางเลือก สำหรับซิงค์ข้ามเครื่อง)
 *
 * วิธีใช้: กรอกได้ 2 ทาง
 *   1) ใส่ค่าในไฟล์นี้ (ถ้าจะ deploy ให้คนอื่นใช้ร่วมโปรเจกต์เดียวกัน) หรือ
 *   2) เว้นว่างไว้ แล้วไปกรอกในแอพ: ตั้งค่า → ☁️ บัญชี & ซิงค์ (เก็บในเครื่องนี้เท่านั้น)
 *
 * เอาค่าจาก Supabase Dashboard → Project Settings → API
 *   url      = Project URL  (เช่น https://xxxxxxxx.supabase.co)
 *   anonKey  = anon / public key  ← ใส่ในแอพฝั่งหน้าเว็บได้อย่างปลอดภัย เพราะมี
 *              Row Level Security (RLS) ป้องกันให้แต่ละบัญชีเห็นเฉพาะข้อมูลตัวเอง
 *   ⚠️ อย่าใส่ service_role key เด็ดขาด (คีย์นั้นข้าม RLS ได้)
 */
window.MB = window.MB || {};
MB.SUPA = {
  url: 'https://gmjbpenvncesgbglcolb.supabase.co',
  anonKey: 'sb_publishable_RFB2fNLfZiDhP8Ojb7Thqg_L3TT4ZT0'   // publishable key (ปลอดภัยฝั่งหน้าเว็บ มี RLS กัน)
};
