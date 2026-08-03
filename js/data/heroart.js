/* ตัวจิ๋ว – ภาพประกอบ "เด็กน้อยบนก้อนเมฆ" สำหรับการ์ดหลัก (วาดด้วย SVG ล้วน โทนพาสเทล) */
window.MB = window.MB || {};
MB.babyHeroSVG = function () {
  return `<svg class="hero-deco" viewBox="0 0 140 120" fill="none" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <!-- พระจันทร์เสี้ยว -->
    <path d="M120 12a12 12 0 1 0 7 19 9.5 9.5 0 1 1-7-19Z" fill="#F9E3A6"/>
    <!-- ดาวประกาย -->
    <path d="M73 19l1.3 3 3 1.3-3 1.3L73 29l-1.3-3-3-1.3 3-1.3z" fill="#F3B6C6"/>
    <path d="M110 45l1 2.4 2.4 1-2.4 1-1 2.4-1-2.4-2.4-1 2.4-1z" fill="#C6B0EA"/>
    <circle cx="60" cy="41" r="1.6" fill="#fff"/>
    <circle cx="122" cy="54" r="1.6" fill="#F3B6C6"/>
    <!-- ผมหยิกน้อย -->
    <path d="M94.5 49.5c1-4.5 6.5-4.5 6.5 0.5" stroke="#7A5240" stroke-width="2.6" stroke-linecap="round"/>
    <!-- หู -->
    <circle cx="79.6" cy="64" r="3.4" fill="#F6C7A2"/>
    <circle cx="110.4" cy="64" r="3.4" fill="#F6C7A2"/>
    <!-- หัว -->
    <circle cx="95" cy="63" r="16.2" fill="#F8CDA9"/>
    <!-- แก้มชมพู -->
    <circle cx="85.5" cy="67.5" r="3.6" fill="#F3A0AB" opacity=".6"/>
    <circle cx="104.5" cy="67.5" r="3.6" fill="#F3A0AB" opacity=".6"/>
    <!-- ตาหลับยิ้ม -->
    <path d="M84 61.5q3 3.2 6 0" stroke="#5A463C" stroke-width="1.9" stroke-linecap="round"/>
    <path d="M100 61.5q3 3.2 6 0" stroke="#5A463C" stroke-width="1.9" stroke-linecap="round"/>
    <!-- ปากยิ้ม -->
    <path d="M89.5 70.5q5.5 4 11 0" stroke="#5A463C" stroke-width="1.7" stroke-linecap="round"/>
    <!-- ก้อนเมฆ (อยู่หน้า ตัวเด็กโผล่พ้นเมฆ) -->
    <g fill="#ffffff">
      <ellipse cx="95" cy="104" rx="35" ry="14.5"/>
      <ellipse cx="71" cy="100" rx="16" ry="12.5"/>
      <ellipse cx="119" cy="100" rx="16" ry="12.5"/>
      <ellipse cx="95" cy="93" rx="20" ry="13.5"/>
    </g>
    <!-- มือน้อยเกาะขอบเมฆ -->
    <circle cx="79" cy="90" r="4.6" fill="#F8CDA9"/>
    <circle cx="111" cy="90" r="4.6" fill="#F8CDA9"/>
    <!-- เงานุ่มใต้เมฆ -->
    <ellipse cx="95" cy="113" rx="30" ry="3.5" fill="#E7D2DE" opacity=".45"/>
  </svg>`;
};

/* ===== ภาพประกอบการ์ดหน้าต้อนรับ (ออนบอร์ดดิ้ง) — วาด SVG ล้วน โทนพาสเทล ===== */

/* 🌷 วางแผนมีลูก — ดอกทิวลิป */
MB.artTulip = function () {
  return `<svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <path d="M32 33v20" stroke="#6BBF8E" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M31 50c-7-1-12-6-13-13 8-1 13 4 13 13Z" fill="#7FCB9B"/>
    <path d="M33 44c5-1 9-5 10-11-6 0-10 4-10 11Z" fill="#5FB183"/>
    <path d="M32 7c-5 3-8 9-8 16 0 8 3 14 8 16 5-2 8-8 8-16 0-7-3-13-8-16Z" fill="#F6B7C6"/>
    <path d="M23 12c-4 4-6 10-5 16 1 6 4 10 7 12-3-8-4-19-2-28Z" fill="#EA92A8"/>
    <path d="M41 12c4 4 6 10 5 16-1 6-4 10-7 12 3-8 4-19 2-28Z" fill="#EA92A8"/>
    <path d="M30 10c1.4-.6 2.6-.6 4 0 1 7 1 15 0 22-1.4.6-2.6.6-4 0-1-7-1-15 0-22Z" fill="#FBD2DC" opacity=".75"/>
  </svg>`;
};

/* 🤰 กำลังตั้งครรภ์ — คุณแม่ท้องโอบพุง */
MB.artPregMom = function () {
  return `<svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <path d="M20 22c0-9 5-14 12-14s12 5 12 14c0 5-1 8-2 10-1-7-4-10-10-10s-9 3-10 10c-1-2-2-5-2-10Z" fill="#6E4B3A"/>
    <circle cx="32" cy="21" r="9" fill="#F8CDA9"/>
    <path d="M23 19c1-7 5-10 9-10s8 3 9 10c-3-4-6-5-9-5s-6 1-9 5Z" fill="#6E4B3A"/>
    <path d="M27 61V44c0-9 5-14 11-14s12 6 12 15v16H27Z" fill="#B79BE0"/>
    <ellipse cx="41" cy="45" rx="12" ry="11" fill="#C9B1EB"/>
    <path d="M26 29c-6 3-9 9-9 17v15h11V44c0-6 2-11 6-14-3-1-6-1-8-1Z" fill="#A98BD8"/>
    <path d="M22 36c-3 7 1 14 9 17" stroke="#F8CDA9" stroke-width="5" stroke-linecap="round"/>
    <path d="M13 44c0-3 4.4-3.6 4.4.4 0-4 4.4-3.4 4.4-.4 0 3.4-4.4 6-4.4 6s-4.4-2.6-4.4-6Z" fill="#EE93A8"/>
  </svg>`;
};

/* 👶 มีลูกแล้ว — หน้าเด็กยิ้ม */
MB.artBabyFace = function () {
  return `<svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <circle cx="12.5" cy="34" r="4.2" fill="#F3BE96"/>
    <circle cx="51.5" cy="34" r="4.2" fill="#F3BE96"/>
    <circle cx="32" cy="34" r="19" fill="#F8CDA9"/>
    <path d="M30 13.5c1.2-5.4 8-4.8 7.6 1.2" stroke="#7A5240" stroke-width="3.2" stroke-linecap="round"/>
    <circle cx="21" cy="39.5" r="4.2" fill="#F3A0AB" opacity=".55"/>
    <circle cx="43" cy="39.5" r="4.2" fill="#F3A0AB" opacity=".55"/>
    <circle cx="25.5" cy="32" r="2.9" fill="#5A463C"/>
    <circle cx="38.5" cy="32" r="2.9" fill="#5A463C"/>
    <circle cx="26.6" cy="30.9" r="1" fill="#fff"/>
    <circle cx="39.6" cy="30.9" r="1" fill="#fff"/>
    <path d="M27.5 41.5q4.5 3.8 9 0" stroke="#5A463C" stroke-width="2.1" stroke-linecap="round"/>
    <path d="M10 48.5l1.2 2.8 2.8 1.2-2.8 1.2L10 56.5l-1.2-2.8L6 52.5l2.8-1.2z" fill="#F2C86E"/>
    <path d="M53 15l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z" fill="#F3B6C6"/>
  </svg>`;
};

/* ภาพประกอบ "ฝันหวาน" สำหรับการ์ดหลักหน้าตั้งครรภ์ (พระจันทร์ ดาว เมฆ หัวใจ) */
MB.pregHeroSVG = function () {
  return `<svg class="hero-deco" viewBox="0 0 140 120" fill="none" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <!-- พระจันทร์เสี้ยว -->
    <path d="M112 16a17 17 0 1 0 10 25 13 13 0 1 1-10-25Z" fill="#F9E3A6"/>
    <!-- ดาวประกาย -->
    <path d="M74 22l1.5 3.4 3.4 1.5-3.4 1.5L74 33.4l-1.5-3.4-3.4-1.5 3.4-1.5z" fill="#F3B6C6"/>
    <path d="M126 58l1.1 2.5 2.5 1.1-2.5 1.1L126 66.3l-1.1-2.5-2.5-1.1 2.5-1.1z" fill="#C6B0EA"/>
    <circle cx="60" cy="42" r="1.7" fill="#fff"/>
    <circle cx="94" cy="34" r="1.6" fill="#F3B6C6"/>
    <!-- หัวใจน้อย ๆ ลอย -->
    <path d="M88 60c0-3 4.6-3.6 4.6.4 0-4 4.6-3.4 4.6-.4 0 3.4-4.6 6-4.6 6s-4.6-2.6-4.6-6Z" fill="#F3A6B0" opacity=".85"/>
    <!-- เมฆฟูนุ่ม -->
    <g fill="#ffffff">
      <ellipse cx="92" cy="98" rx="34" ry="14"/>
      <ellipse cx="69" cy="94" rx="15" ry="12"/>
      <ellipse cx="115" cy="95" rx="15" ry="12"/>
      <ellipse cx="92" cy="87" rx="19" ry="13"/>
    </g>
    <ellipse cx="92" cy="107" rx="29" ry="3.4" fill="#E7D2DE" opacity=".45"/>
  </svg>`;
};
