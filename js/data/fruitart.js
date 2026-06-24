/* ภาพผลไม้/ผักเทียบขนาดลูกรายสัปดาห์ — วาด SVG สไตล์ latte+rose
   MB.fruitSVG(key, size, opts):
     key  = คีย์ผลไม้ (ดู MB.PREG_FRUIT_KEY)
     size = ขนาด px (ค่าเริ่ม 120)
     opts.bare = true → ไม่วาดพื้นวงกลม (ใช้ตอนวางในกล่องที่มีพื้นอยู่แล้ว) */
window.MB = window.MB || {};
(function () {
  const C = {
    leaf: '#86b35f', leafD: '#6f9a4c', leafL: '#a9cd83', stem: '#9a7550', stemD: '#7c5a3e',
    red: '#d65f5a', redD: '#c14a45', pink: '#e79aa0',
    yellow: '#e8c24c', yellowL: '#f0d36e', orange: '#e0904a', orangeD: '#cf7a3a',
    purple: '#8064a0', purpleD: '#6a4a80', brown: '#9c7350', brownD: '#7c5a3e',
    white: '#f1ebdd', cream: '#efe4cf'
  };
  const seeds = (pts, r) => pts.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="${r || 1.5}"/>`).join('');
  const ring = (cx, cy, rad, n, r) => { const a = []; for (let i = 0; i < n; i++) { const t = i / n * Math.PI * 2; a.push([+(cx + rad * Math.cos(t)).toFixed(1), +(cy + rad * Math.sin(t)).toFixed(1)]); } return a; };
  const grid = (x1, y1, x2, y2, sx, sy) => { let s = ''; for (let i = 0; i <= sx; i++)for (let j = 0; j <= sy; j++) { const x = x1 + (x2 - x1) * i / sx, y = y1 + (y2 - y1) * j / sy; s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.7"/>`; } return s; };
  const hatch = (cx, cy, rx, ry) => { let s = ''; for (let i = -2; i <= 2; i++) { s += `<path d="M${cx - rx} ${cy + i * ry / 2.5} q${rx} ${i < 0 ? -8 : 8} ${2 * rx} 0"/>`; s += `<path d="M${cx + i * rx / 2.5} ${cy - ry} q${i < 0 ? -8 : 8} ${ry} 0 ${2 * ry}"/>`; } return s; };

  const FRUITS = {
    seed: `<ellipse cx="60" cy="60" rx="7" ry="11" fill="#c0a472" transform="rotate(18 60 60)"/>
      <ellipse cx="57" cy="55" rx="2.4" ry="4" fill="#d8c194" opacity=".7" transform="rotate(18 57 55)"/>`,
    pea: `<circle cx="60" cy="62" r="15" fill="${C.leaf}"/><circle cx="54" cy="56" r="5" fill="${C.leafL}" opacity=".85"/>`,
    blueberry: `<circle cx="60" cy="64" r="18" fill="#6f72a6"/><circle cx="53" cy="58" r="6" fill="#9093c4" opacity=".6"/>
      <path d="M54 51 l3 4 3-4 3 4 3-4" fill="none" stroke="#4f5285" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`,
    redbean: `<g transform="rotate(-22 60 60)"><ellipse cx="60" cy="60" rx="21" ry="13" fill="#a9514a"/>
      <path d="M47 60 q13 -8 26 0" fill="none" stroke="#82382f" stroke-width="2.6" stroke-linecap="round"/>
      <ellipse cx="52" cy="55" rx="5" ry="3" fill="#c4756e" opacity=".5"/></g>`,
    cherry: `<path d="M50 46 q10 6 10 20 M70 46 q-10 6-10 20" fill="none" stroke="${C.leafD}" stroke-width="3" stroke-linecap="round"/>
      <path d="M58 44 q9-8 19-3 q-9 8-19 3z" fill="${C.leaf}"/>
      <circle cx="49" cy="74" r="13" fill="#cf4f52"/><circle cx="72" cy="72" r="13" fill="#bf4548"/>
      <ellipse cx="45" cy="69" rx="4" ry="2.6" fill="#e89" opacity=".6"/>`,
    strawberry: `<path d="M60 86 q-23-7-23-27 q0-9 23-11 q23 2 23 11 q0 20-23 27z" fill="#d65f5a"/>
      <g fill="#f5e7b0">${seeds([[50, 56], [60, 52], [70, 56], [46, 66], [60, 64], [74, 66], [52, 76], [68, 76], [60, 80]])}</g>
      <path d="M44 50 q16-11 32 0 q-7 6-16 4 q-9 2-16-4z" fill="${C.leaf}"/>
      <path d="M60 40 v8" stroke="${C.leafD}" stroke-width="3" stroke-linecap="round"/>`,
    kiwi: `<circle cx="60" cy="60" r="23" fill="#8a6a3e"/><circle cx="60" cy="60" r="19.5" fill="#a7c46a"/>
      <circle cx="60" cy="60" r="6.5" fill="#eef0dd"/>
      <g fill="#3a3a32">${seeds(ring(60, 60, 13.5, 9, 1.4), 1.4)}</g>`,
    lemon: `<ellipse cx="60" cy="60" rx="25" ry="17" fill="${C.yellow}"/>
      <circle cx="87" cy="60" r="3.2" fill="#d3a82e"/><circle cx="33" cy="60" r="3.2" fill="#d3a82e"/>
      <ellipse cx="51" cy="52" rx="8" ry="4" fill="${C.yellowL}" opacity=".55"/>`,
    peapod: `<path d="M36 56 q24 26 48 -2 q-5 17-24 17 q-19 0-24-15z" fill="${C.leaf}"/>
      <path d="M40 56 q20 18 40 -1" fill="none" stroke="${C.leafD}" stroke-width="2"/>
      <g fill="${C.leafL}"><circle cx="50" cy="62" r="5"/><circle cx="61" cy="65" r="5"/><circle cx="72" cy="62" r="5"/></g>`,
    peach: `<circle cx="60" cy="62" r="23" fill="#edb491"/>
      <path d="M60 41 q-7 21 0 42" fill="none" stroke="#dd9a76" stroke-width="2.4"/>
      <ellipse cx="51" cy="54" rx="7" ry="5" fill="#f4cbae" opacity=".6"/>
      <ellipse cx="68" cy="56" rx="9" ry="7" fill="#d9743f" opacity=".35"/>
      <path d="M61 41 q9-10 18-5 q-6 9-18 6z" fill="${C.leaf}"/>`,
    apple: `<path d="M60 47 q-15-5-22 7 q-7 14 3 27 q8 11 19 6 q11 5 19-6 q10-13 3-27 q-7-12-22-7z" fill="#d65f5a"/>
      <path d="M60 47 q1-9 5-12" stroke="${C.stem}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M62 40 q9-7 18-3 q-6 8-18 4z" fill="${C.leaf}"/>
      <ellipse cx="50" cy="58" rx="5" ry="8" fill="#e88" opacity=".4"/>`,
    avocado: `<ellipse cx="60" cy="63" rx="20" ry="26" fill="#5f8a4a"/>
      <ellipse cx="60" cy="63" rx="14.5" ry="20.5" fill="#d2e0a4"/>
      <circle cx="60" cy="71" r="9.5" fill="#9c7350"/>`,
    pear: `<path d="M60 43 q-7 6-7 16 q-13 6-13 23 q0 15 20 15 q20 0 20-15 q0-17-13-23 q0-10-7-16z" fill="#bcd06a"/>
      <path d="M60 43 q0-7 3-10" stroke="${C.stem}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M63 38 q8-6 16-2 q-6 7-16 3z" fill="${C.leaf}"/>
      <ellipse cx="50" cy="74" rx="6" ry="10" fill="#d4e29a" opacity=".5"/>`,
    bellpepper: `<path d="M41 56 q-3 27 19 29 q22-2 19-29 q-9 7-19 1 q-10 6-19-1z" fill="#d65f5a"/>
      <path d="M58 44 q2 8 0 13" stroke="${C.leafD}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M60 45 q6-5 9-1" stroke="${C.leafD}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <ellipse cx="51" cy="60" rx="4" ry="11" fill="#e88" opacity=".35"/>`,
    mango: `<g transform="rotate(-18 60 60)"><ellipse cx="60" cy="60" rx="27" ry="18" fill="${C.orange}"/>
      <ellipse cx="49" cy="54" rx="11" ry="7" fill="#d9743f" opacity=".5"/>
      <ellipse cx="70" cy="62" rx="10" ry="6" fill="${C.yellowL}" opacity=".5"/></g>
      <path d="M80 46 q6-6 11-3 q-4 7-11 5z" fill="${C.leaf}"/>`,
    banana: `<path d="M40 42 q3 38 42 31 q7-1 7-7 q-3-4-8-2 q-28 6-35-23 q-2-3-6-2z" fill="${C.yellow}"/>
      <path d="M42 44 q6 30 40 26" fill="none" stroke="#d3a82e" stroke-width="1.6" opacity=".6"/>
      <circle cx="40" cy="42" r="3" fill="${C.stemD}"/><circle cx="88" cy="66" r="2.6" fill="${C.stemD}"/>`,
    carrot: `<path d="M60 88 l-13-35 q13-7 26 0z" fill="${C.orange}"/>
      <path d="M52 60 h16 M50 68 h20 M54 76 h12" stroke="${C.orangeD}" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M50 53 q-5-13 1-17 M57 51 q-2-15 4-17 M64 51 q3-15 9-14 M70 54 q7-11 13-10" stroke="${C.leafD}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`,
    coconut: `<circle cx="60" cy="62" r="23" fill="#9c7350"/>
      <path d="M40 58 q20-8 40 0 M40 66 q20 8 40 0" stroke="#8a6347" stroke-width="1.4" fill="none" opacity=".6"/>
      <circle cx="54" cy="56" r="3.6" fill="#5f4330"/><circle cx="66" cy="57" r="3.6" fill="#5f4330"/><circle cx="60" cy="65" r="3.6" fill="#5f4330"/>`,
    melon: `<ellipse cx="60" cy="60" rx="24" ry="20" fill="#e3cf86"/>
      <path d="M60 40 v40 M49 43 q-4 17 0 34 M71 43 q4 17 0 34 M40 50 q-2 10 0 20 M80 50 q2 10 0 20" stroke="#c9b25f" stroke-width="1.8" fill="none"/>`,
    corn: `<path d="M44 50 q-13 6-11 31 q11-6 13-23z" fill="${C.leaf}"/>
      <path d="M76 50 q13 6 11 31 q-11-6-13-23z" fill="${C.leafD}"/>
      <path d="M60 38 q15 0 15 25 q0 21-15 23 q-15-2-15-23 q0-25 15-25z" fill="${C.yellow}"/>
      <g fill="#d3a82e">${grid(48, 48, 72, 82, 4, 5)}</g>`,
    radish: `<path d="M60 88 q-17-2-17-19 q0-13 17-15 q17 2 17 15 q0 17-17 19z" fill="#f1ebdd"/>
      <path d="M43 55 q17-12 34 0 q1-9-17-10 q-18 1-17 10z" fill="#9a7aa8"/>
      <path d="M52 47 q-3-12 2-16 M60 45 q0-14 4-16 M68 47 q4-12 9-13" stroke="${C.leafD}" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <path d="M60 88 q0 6 1 10" stroke="#ddd3c4" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    springonion: `<path d="M53 84 q-6-1-6-9 q0-7 6-8 q7 1 7 8 q0 8-7 9z" fill="#f1ebdd"/>
      <path d="M50 78 q-2 5-5 8 M56 80 q0 5 0 9 M60 79 q3 5 6 8" stroke="#e6ddcd" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M51 70 q-7-30-3-46 M58 70 q-1-34 1-48 M65 70 q7-28 5-44" stroke="${C.leafD}" stroke-width="4.4" fill="none" stroke-linecap="round"/>`,
    cauliflower: `<path d="M40 64 q-4-14 10-14 q-2-10 12-10 q4-8 16-2 q12-2 12 10 q10 2 6 16z" fill="#eee6d2"/>
      <g fill="#e3d8bf">${seeds([[48, 56], [58, 52], [68, 55], [53, 62], [63, 61], [72, 63], [58, 66]], 4)}</g>
      <path d="M38 64 q-8 6-4 16 q8-2 10-12z" fill="${C.leaf}"/>
      <path d="M82 64 q8 6 4 16 q-8-2-10-12z" fill="${C.leafD}"/>`,
    eggplant: `<path d="M60 49 q17 2 17 21 q0 19-17 21 q-17-2-17-21 q0-19 17-21z" fill="#7d5a93"/>
      <ellipse cx="52" cy="58" rx="4" ry="12" fill="#9c7caf" opacity=".5"/>
      <path d="M51 50 q9-9 18 0 q-1-9-9-10 q-8 1-9 10z" fill="${C.leafD}"/>
      <path d="M60 39 q1 6 0 9" stroke="${C.leafD}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`,
    pumpkin: `<path d="M60 44 q2 6 2 9" stroke="${C.stemD}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <ellipse cx="48" cy="64" rx="14" ry="19" fill="#d9863f"/><ellipse cx="72" cy="64" rx="14" ry="19" fill="#d9863f"/>
      <ellipse cx="60" cy="64" rx="20" ry="20" fill="${C.orange}"/>
      <path d="M54 48 q-4 16 0 32 M66 48 q4 16 0 32" stroke="#cf7a3a" stroke-width="1.8" fill="none"/>`,
    cabbage: `<circle cx="60" cy="64" r="22" fill="#9cc06a"/>
      <path d="M60 43 q-17 10-13 31 M60 43 q17 10 13 31 M47 50 q-7 16 5 29 M73 50 q7 16-5 29" stroke="#bdd690" stroke-width="2.4" fill="none"/>
      <path d="M40 60 q-6-12 6-16 q-2 10-6 16z" fill="${C.leafD}"/>`,
    napacabbage: `<path d="M50 40 q-9 4-7 31 q2 15 17 15 q15 0 17-15 q2-27-7-31 q-10 4-20 0z" fill="#e6e2b4"/>
      <path d="M50 40 q10 6 20 0 q-2-7-10-7 q-8 0-10 7z" fill="#9cc06a"/>
      <path d="M55 44 q-2 20 1 40 M65 44 q2 20-1 40 M48 50 q-2 16 1 28 M72 50 q2 16-1 28" stroke="#cfd592" stroke-width="1.8" fill="none"/>`,
    pineapple: `<path d="M60 30 l-7 18 7-7 7 7z M48 38 l-5 14 6-7z M72 38 l5 14-6-7z M54 33 l-4 13 5-7z M66 33 l4 13-5-7z" fill="${C.leaf}"/>
      <ellipse cx="60" cy="72" rx="19" ry="24" fill="#e0a83f"/>
      <g stroke="#b9842c" stroke-width="1.6" fill="none" opacity=".7">${hatch(60, 72, 16, 21)}</g>`,
    cantaloupe: `<circle cx="60" cy="62" r="23" fill="#dcc488"/>
      <circle cx="60" cy="62" r="23" fill="#e0a86a" opacity=".18"/>
      <g stroke="#c2a96a" stroke-width="1.3" fill="none">${hatch(60, 62, 20, 20)}</g>`,
    lettuce: `<circle cx="60" cy="66" r="20" fill="#9cc06a"/>
      <path d="M40 60 q-2-14 12-14 q-2-10 16-9 q14-3 18 8 q12 0 8 14 q-22-12-34 0 q-16-8-30 1z" fill="#abce85"/>
      <path d="M50 56 q4 14 0 26 M60 54 q0 16 0 28 M70 56 q-4 14 0 26" stroke="#86b35f" stroke-width="1.8" fill="none" opacity=".7"/>`,
    spinach: `<path d="M60 84 q-20-10-18-36 q11 6 18 17 q7-11 18-17 q2 26-18 36z" fill="${C.leaf}"/>
      <path d="M44 56 q-8 12 4 24 q4-12-4-24z" fill="${C.leafD}"/>
      <path d="M76 56 q8 12-4 24 q-4-12 4-24z" fill="${C.leafD}"/>
      <path d="M60 80 q0-20 0-30" stroke="${C.leafL}" stroke-width="1.8" fill="none"/>`,
    garlic: `<path d="M60 86 q-16-2-16-19 q0-14 16-16 q16 2 16 16 q0 17-16 19z" fill="#f1ebdd"/>
      <path d="M60 51 q-7 17-5 35 M60 51 q7 17 5 35 M50 56 q-3 14 0 26 M70 56 q3 14 0 26" stroke="#ddd3c0" stroke-width="1.8" fill="none"/>
      <path d="M55 52 q-4-12 2-16 M62 51 q3-12 8-13" stroke="${C.leafD}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M60 51 q0-6 0-10" stroke="#e6ddc8" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    watermelon: `<path d="M30 74 a32 32 0 0 1 60 0 z" fill="#5f8a4a"/>
      <path d="M34 73 a28 28 0 0 1 52 0 z" fill="#eef0dd"/>
      <path d="M37 72 a25 25 0 0 1 46 0 z" fill="#d65f5a"/>
      <g fill="#3a3a32">${seeds([[50, 64], [60, 60], [70, 64], [55, 70], [65, 70]], 1.7)}</g>`
  };

  MB.PREG_FRUIT_KEY = {
    4: 'seed', 5: 'seed', 6: 'pea', 7: 'blueberry', 8: 'redbean', 9: 'cherry', 10: 'strawberry', 11: 'kiwi', 12: 'lemon',
    13: 'peapod', 14: 'peach', 15: 'apple', 16: 'avocado', 17: 'pear', 18: 'bellpepper', 19: 'mango', 20: 'banana',
    21: 'carrot', 22: 'coconut', 23: 'melon', 24: 'corn', 25: 'radish', 26: 'springonion', 27: 'cauliflower',
    28: 'eggplant', 29: 'pumpkin', 30: 'cabbage', 31: 'coconut', 32: 'napacabbage', 33: 'pineapple', 34: 'cantaloupe',
    35: 'melon', 36: 'lettuce', 37: 'spinach', 38: 'garlic', 39: 'watermelon', 40: 'watermelon'
  };

  let _frId = 0;
  MB.fruitSVG = function (key, size, opts) {
    size = size || 120;
    opts = opts || {};
    const art = FRUITS[key] || FRUITS.seed;
    const id = 'fr' + (_frId++);
    const bg = opts.bare ? '' : `<circle cx="60" cy="62" r="54" fill="#f0e3d7"/><circle cx="60" cy="62" r="54" fill="#e8b9c0" opacity=".25"/>`;
    // viewBox ซูมเข้าหาตัวผลไม้ให้ดูใหญ่ขึ้น + เงาตกกระทบ/ไฮไลต์เงาวับ ให้ดูมีมิติสมจริง
    return `<svg viewBox="22 24 76 76" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="${id}g" cx="40%" cy="32%" r="72%">
          <stop offset="0%" stop-color="#fff" stop-opacity=".4"/>
          <stop offset="48%" stop-color="#fff" stop-opacity="0"/>
        </radialGradient>
        <filter id="${id}s" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2.4" stdDeviation="2.2" flood-color="#7a5a48" flood-opacity=".28"/>
        </filter>
      </defs>
      ${bg}
      <ellipse cx="60" cy="95" rx="25" ry="5.5" fill="#9a7458" opacity=".16"/>
      <g filter="url(#${id}s)">${art}</g>
      <ellipse cx="52" cy="50" rx="30" ry="26" fill="url(#${id}g)"/>
    </svg>`;
  };
})();
