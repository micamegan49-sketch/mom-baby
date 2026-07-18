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
