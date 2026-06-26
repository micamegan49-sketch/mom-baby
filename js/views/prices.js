/* หน้า: ราคาคลอด & ราคาแพ็กเกจวัคซีน (เรียกดูได้ทุกจังหวัด + เพิ่มเองได้) */
window.MB = window.MB || {}; MB.views = MB.views || {};
(function () {
  const S = MB.store, U = MB.util;
  const COLL = new Intl.Collator('th');   // cached collator (เร็วกว่า localeCompare(...,'th') ที่สร้าง collator ใหม่ทุกครั้ง)

  function provinceSelect(sel) {
    return `<select id="prov-sel">
      <option value="" ${sel === '' ? 'selected' : ''}>— ทุกจังหวัด —</option>
      ${MB.REGIONS.map(r => `<optgroup label="${r.em} ${r.name}">${r.provinces.map(p => `<option ${sel === p ? 'selected' : ''}>${p}</option>`).join('')}</optgroup>`).join('')}
    </select>`;
  }

  function deliveryCard(x) {
    return `<div class="card" data-search="${U.esc((x.hospital || '') + ' ' + (x.province || ''))}">
      <div style="display:flex;align-items:center;gap:8px"><b style="flex:1">${U.esc(x.hospital || '-')}</b>
        <span class="badge ${x.type === 'เอกชน' ? 'soon' : 'upcoming'}">${U.esc(x.type || '')}</span></div>
      <div class="muted" style="font-size:12.5px">📍 ${U.esc(x.province || '')}${x.year ? ' · ราคาปี ' + U.esc(x.year) : ''}</div>
      <div style="display:flex;gap:10px;margin-top:8px">
        <div style="flex:1;background:var(--cream-2);border-radius:10px;padding:8px;text-align:center"><div class="muted" style="font-size:11px">คลอดธรรมชาติ</div><b style="color:var(--brown)">${U.esc(x.normal || '-')}</b></div>
        <div style="flex:1;background:var(--cream-2);border-radius:10px;padding:8px;text-align:center"><div class="muted" style="font-size:11px">ผ่าคลอด</div><b style="color:var(--brown)">${U.esc(x.csection || '-')}</b></div>
      </div>
      ${x.promo ? `<div style="font-size:13px;margin-top:8px">🎁 ${U.esc(x.promo)}</div>` : ''}
      ${linkRow(x)}
    </div>`;
  }

  function vaccineCard(x) {
    return `<div class="card" data-search="${U.esc((x.hospital || '') + ' ' + (x.province || '') + ' ' + (x.packageName || ''))}">
      <div style="display:flex;align-items:center;gap:8px"><b style="flex:1">${U.esc(x.hospital || '-')}</b>
        <b style="color:var(--pink-deep)">${U.esc(x.price || '-')}</b></div>
      <div class="muted" style="font-size:12.5px">📍 ${U.esc(x.province || '')}${x.year ? ' · ราคาปี ' + U.esc(x.year) : ''}</div>
      <div style="margin-top:6px;font-weight:600;font-size:14px">💉 ${U.esc(x.packageName || '')}${x.ages ? ' <span class="muted" style="font-weight:400">(' + U.esc(x.ages) + ')</span>' : ''}</div>
      ${x.includes ? `<div style="font-size:12.5px;color:#4f3d33;margin-top:4px">รวม: ${U.esc(x.includes)}</div>` : ''}
      ${linkRow(x)}
    </div>`;
  }

  function linkRow(x) {
    let html = '';
    // หลัก: ภาพแพ็กเกจที่โรงพยาบาล/คลินิกทำไว้ (แตะดูเต็ม)
    if (x.img) {
      html += `<a href="${U.esc(x.img)}" target="_blank" rel="noopener" style="display:block;margin-top:10px"><img src="${U.esc(x.img)}" alt="ภาพแพ็กเกจ" loading="lazy" style="width:100%;border-radius:12px;border:1px solid var(--line);display:block" /></a>`;
    } else if (x.url) {
      // แผนสำรอง: ยังไม่มีรูปแพ็กเกจ → ลิงก์ไปดูที่เว็บโรงพยาบาลแทน
      html += `<div style="margin-top:8px;font-size:12.5px"><a href="${U.esc(x.url)}" target="_blank" rel="noopener">🔗 ดูแพ็กเกจจากเว็บโรงพยาบาล</a></div>`;
    }
    if (x.phone) html += `<div style="margin-top:8px;font-size:12.5px"><a href="tel:${U.esc(String(x.phone).replace(/\s/g, ''))}">📞 ${U.esc(x.phone)}</a></div>`;
    if (x.userAdded) html += `<div style="text-align:right;margin-top:4px"><span data-del="${x.id}" style="color:#D9737A;font-size:12px;cursor:pointer">ลบรายการนี้</span></div>`;
    return html;
  }

  /* แท็บย่อยของหน้า "ค่าใช้จ่าย": ค่าคลอด · ค่าวัคซีน · ประกัน · ปั๊มนม · แพมเพิส · นมผง
     ค่าคลอด/ค่าวัคซีน/ประกัน เรนเดอร์ในเราต์ prices ส่วน ปั๊มนม/แพมเพิส/นมผง เป็นเราต์ของตัวเอง (babycost.js) */
  const COST_SUBS = [
    { k: 'raising', em: '🧮', label: 'ค่าเลี้ยงลูก' },
    { k: 'diaper', em: '🧷', label: 'แพมเพิส' },
    { k: 'formula', em: '🥛', label: 'นมผง' }
  ];
  function costSubbar(tab) {
    return `<div class="chips" style="margin:0 0 14px">
      ${COST_SUBS.map(s => `<div class="chip ${tab === s.k ? 'active' : ''}" data-cost="${s.k}">${s.em} ${s.label}</div>`).join('')}
    </div>`;
  }
  function wireCostSubbar(root) {
    root.querySelectorAll('[data-cost]').forEach(b => b.onclick = () => {
      const k = b.dataset.cost;
      if (k === 'raising') MB.go('prices', { tab: 'raising' });
      else MB.go(k);   // diaper / formula → เราต์ของตัวเอง
    });
  }
  MB.costSubbar = costSubbar;            // ให้ babycost.js (ปั๊มนม/แพมเพิส/นมผง) ใช้แถบเดียวกันได้
  MB.wireCostSubbar = wireCostSubbar;

  /* แท็บ "ค่าเลี้ยงลูก 1 คน" — เครื่องคำนวณประมาณการค่าใช้จ่ายแรกเกิด→จบป.ตรี
     ตัวเลขเป็นค่าประมาณการ (รวมค่ากิน-อยู่-เรียน) อิงช่วงที่พบบ่อยในไทย ปี 2568 — ปรับได้ตามไลฟ์สไตล์ */
  const RAISE = {
    tiers: [
      { k: 'low',  label: 'ประหยัด', sub: 'ร.ร.รัฐ · ใช้สิทธิบัตรทอง/ประกันสังคม', once: 30000,  m: [4000, 4000, 5000, 5000, 6000, 7000, 9000] },
      { k: 'mid',  label: 'ปานกลาง', sub: 'ร.ร.เอกชนทั่วไป',                       once: 80000,  m: [8000, 8000, 12000, 13000, 15000, 16000, 18000] },
      { k: 'high', label: 'พรีเมียม', sub: 'ร.ร.อินเตอร์ / ทุกอย่างพรีเมียม',        once: 150000, m: [15000, 18000, 35000, 50000, 60000, 70000, 60000] }
    ],
    stages: [
      { label: '0–1 ปี',   sub: 'นม แพมเพิส ของใช้ วัคซีน',  months: 12 },
      { label: '1–3 ปี',   sub: 'อาหาร ของเล่น เนอสเซอรี่',  months: 24 },
      { label: '3–6 ปี',   sub: 'ชั้นอนุบาล',                months: 36 },
      { label: '6–12 ปี',  sub: 'ชั้นประถม',                 months: 72 },
      { label: '12–15 ปี', sub: 'มัธยมต้น',                  months: 36 },
      { label: '15–18 ปี', sub: 'มัธยมปลาย',                 months: 36 },
      { label: '18–22 ปี', sub: 'มหาวิทยาลัย (ป.ตรี)',       months: 48 }
    ],
    // แจกแจงค่าใช้จ่ายพื้นฐาน (สัดส่วน % ของยอดต่อเดือน/ครั้ง — ใช้กับทุกระดับ) รวมกัน = 100
    onceItems: [
      { l: 'ค่าคลอด (เฉลี่ยรัฐ/เอกชน)', w: 55 }, { l: 'เปล/ที่นอน', w: 12 },
      { l: 'คาร์ซีท', w: 12 }, { l: 'รถเข็น', w: 11 }, { l: 'เสื้อผ้า/ขวดนม/ของใช้แรกเกิด', w: 10 }
    ],
    breakdown: [
      [{ l: 'นม/อาหาร', w: 30 }, { l: 'แพมเพิส', w: 20 }, { l: 'สุขภาพ/วัคซีน', w: 13 }, { l: 'เสื้อผ้า/ของใช้', w: 12 }, { l: 'ของเล่น/หนังสือ', w: 7 }, { l: 'เบ็ดเตล็ด/เก็บออม', w: 18 }],
      [{ l: 'อาหาร', w: 30 }, { l: 'เนอสเซอรี่/ค่าเลี้ยง', w: 25 }, { l: 'แพมเพิส/ของใช้', w: 15 }, { l: 'เสื้อผ้า', w: 10 }, { l: 'สุขภาพ', w: 8 }, { l: 'ของเล่น/เบ็ดเตล็ด', w: 12 }],
      [{ l: 'ค่าเทอม/ค่าเรียน', w: 45 }, { l: 'อาหาร', w: 20 }, { l: 'เสื้อผ้า/อุปกรณ์', w: 10 }, { l: 'เดินทาง', w: 8 }, { l: 'สุขภาพ', w: 7 }, { l: 'เบ็ดเตล็ด', w: 10 }],
      [{ l: 'ค่าเทอม/ค่าเรียน', w: 43 }, { l: 'อาหาร/ขนม', w: 18 }, { l: 'เรียนพิเศษ', w: 13 }, { l: 'เดินทาง', w: 8 }, { l: 'อุปกรณ์/เสื้อผ้า', w: 8 }, { l: 'เบ็ดเตล็ด', w: 10 }],
      [{ l: 'ค่าเทอม', w: 40 }, { l: 'เรียนพิเศษ', w: 18 }, { l: 'อาหาร', w: 15 }, { l: 'เดินทาง', w: 9 }, { l: 'มือถือ/อินเทอร์เน็ต', w: 8 }, { l: 'เบ็ดเตล็ด', w: 10 }],
      [{ l: 'ค่าเทอม', w: 38 }, { l: 'เรียนพิเศษ/ติว', w: 20 }, { l: 'อาหาร', w: 15 }, { l: 'เดินทาง', w: 9 }, { l: 'มือถือ/เน็ต', w: 8 }, { l: 'เบ็ดเตล็ด', w: 10 }],
      [{ l: 'ค่าเทอม', w: 48 }, { l: 'ที่พัก/หอ', w: 18 }, { l: 'อาหาร', w: 17 }, { l: 'เดินทาง', w: 7 }, { l: 'หนังสือ/อุปกรณ์', w: 5 }, { l: 'เบ็ดเตล็ด', w: 5 }]
    ]
  };
  function renderRaising(root, params) {
    const tier = RAISE.tiers.find(t => t.k === ((params && params.tier) || 'mid')) || RAISE.tiers[1];
    const fmt = n => Math.round(n).toLocaleString('en-US');
    let total = tier.once;
    const rows = RAISE.stages.map((s, i) => { const sub = tier.m[i] * s.months; total += sub; return { s, perMonth: tier.m[i], sub }; });
    const totalMonths = RAISE.stages.reduce((a, s) => a + s.months, 0);   // 264 เดือน (~22 ปี)
    const avgMonth = Math.round(total / totalMonths / 100) * 100;
    const millions = (total / 1000000).toFixed(total >= 1000000 ? 1 : 2);

    // แจกแจงยอด (amount) ตามสัดส่วน cats ให้รวมกันเท่ากับ amount พอดี (ตัวสุดท้ายรับเศษ)
    function catRows(amount, cats) {
      let acc = 0;
      return cats.map((c, i) => {
        const v = i === cats.length - 1 ? amount - acc : Math.round(amount * c.w / 100);
        acc += v;
        return `<div style="display:flex;justify-content:space-between;gap:10px;padding:4px 0;font-size:12.5px"><span class="muted">• ${U.esc(c.l)}</span><b style="color:var(--brown);font-weight:600;white-space:nowrap">${fmt(v)}</b></div>`;
      }).join('');
    }
    function detailBox(headline, inner) {
      return `<div class="raise-detail" style="display:none;margin:0 0 8px;padding:8px 12px;background:var(--cream);border-radius:10px;border:1px solid var(--line)">
        <div class="muted" style="font-size:11px;margin-bottom:2px">${headline}</div>${inner}</div>`;
    }

    root.innerHTML = `
      ${MB.knowledgeChips('cost')}
      ${costSubbar('raising')}
      <div class="hero" style="padding:14px 16px"><div class="emoji">🧮</div>
        <div style="flex:1"><h2 style="font-size:18px">ค่าเลี้ยงลูก 1 คน</h2><p>ประมาณการแรกเกิด → จบปริญญาตรี</p></div></div>

      <div class="chips" style="margin:2px 0 12px">
        ${RAISE.tiers.map(t => `<div class="chip ${t.k === tier.k ? 'active' : ''}" data-tier="${t.k}">${t.label}</div>`).join('')}
      </div>

      <div class="card tint" style="text-align:center;padding:18px 16px">
        <div class="muted" style="font-size:12.5px">${U.esc(tier.label)} · ${U.esc(tier.sub)}</div>
        <div style="font-size:30px;font-weight:800;color:var(--brown);margin:4px 0">≈ ${millions} ล้านบาท</div>
        <div class="muted" style="font-size:12.5px">ตั้งแต่แรกเกิดจนจบ ป.ตรี (~22 ปี)</div>
        <div class="divider"></div>
        <div style="display:flex;justify-content:center;gap:24px">
          <div><div style="font-size:18px;font-weight:800;color:var(--pink-deep)">${fmt(avgMonth)}</div><div class="muted" style="font-size:11.5px">บาท/เดือน (เฉลี่ย)</div></div>
          <div><div style="font-size:18px;font-weight:800;color:var(--pink-deep)">${fmt(total)}</div><div class="muted" style="font-size:11.5px">บาท (รวมทั้งหมด)</div></div>
        </div>
      </div>

      <div class="section-title">📋 แยกตามช่วงวัย <span class="more">แตะดูค่าใช้จ่ายพื้นฐาน</span></div>
      <div class="card" style="padding:6px 14px">
        <div>
          <div class="list-item" style="border-bottom:1px solid var(--line);cursor:pointer" data-exp="once">
            <div class="ic" style="background:var(--cream-2)">👶</div>
            <div class="body"><div class="t">ค่าคลอด + ของแรกเกิด <span class="exp-ic" style="color:var(--pink-deep)">▾</span></div><div class="s">จ่ายครั้งเดียว</div></div>
            <b style="color:var(--brown);white-space:nowrap">${fmt(tier.once)}</b>
          </div>
          ${detailBox('รายการจ่ายครั้งเดียว (โดยประมาณ)', catRows(tier.once, RAISE.onceItems))}
        </div>
        ${rows.map((r, i) => `<div>
          <div class="list-item" style="border-bottom:1px solid var(--line);cursor:pointer" data-exp="${i}">
            <div class="ic" style="background:var(--cream-2)">📅</div>
            <div class="body"><div class="t">${U.esc(r.s.label)} <span class="muted" style="font-weight:400;font-size:12px">${U.esc(r.s.sub)}</span> <span class="exp-ic" style="color:var(--pink-deep)">▾</span></div>
              <div class="s">~${fmt(r.perMonth)} บาท/เดือน × ${r.s.months} เดือน</div></div>
            <b style="color:var(--brown);white-space:nowrap">${fmt(r.sub)}</b>
          </div>
          ${detailBox('ค่าใช้จ่ายพื้นฐานต่อเดือน (โดยประมาณ)', catRows(r.perMonth, RAISE.breakdown[i]))}
        </div>`).join('')}
        <div class="list-item" style="border-bottom:none">
          <div class="ic" style="background:var(--pink-soft)">💰</div>
          <div class="body"><div class="t">รวมทั้งหมด</div><div class="s">เฉลี่ย ~${fmt(avgMonth)} บาท/เดือน</div></div>
          <b style="color:var(--pink-deep);white-space:nowrap;font-size:15px">${fmt(total)}</b>
        </div>
      </div>

      <div class="disclaimer">🧮 ตัวเลขเป็น <b>ค่าประมาณการเพื่อวางแผนเท่านั้น</b> รวมค่ากิน-อยู่-เรียนคร่าว ๆ อิงช่วงที่พบบ่อยในไทย (ปี 2568) ค่าใช้จ่ายจริงต่างกันมากตามจังหวัด โรงเรียน ไลฟ์สไตล์ และเงินเฟ้อ — ไม่ใช่คำแนะนำการเงินเฉพาะบุคคล</div>
    `;
    MB.wireKnowledgeChips(root);
    wireCostSubbar(root);
    root.querySelectorAll('[data-tier]').forEach(c => c.onclick = () => MB.go('prices', { tab: 'raising', tier: c.dataset.tier }));
    // แตะแถวเพื่อกาง/พับรายละเอียดค่าใช้จ่ายพื้นฐาน
    root.querySelectorAll('[data-exp]').forEach(row => row.onclick = () => {
      const detail = row.nextElementSibling;
      const ic = row.querySelector('.exp-ic');
      if (!detail) return;
      const open = detail.style.display === 'none';
      detail.style.display = open ? '' : 'none';
      if (ic) ic.textContent = open ? '▴' : '▾';
    });
  }

  /* แท็บ "ประกัน" (ย้ายมารวมไว้ในหน้าค่าใช้จ่าย) */
  function renderInsurance(root, params) {
    const T = MB.INSURANCE_TYPES || {};
    const filter = (params && params.type) || 'all';
    const all = MB.CHILD_INSURANCE || [];
    const list = filter === 'all' ? all : all.filter(x => x.type === filter);

    const card = it => {
      const t = T[it.type] || { em: '🛡️', label: '' };
      return `<div class="card" style="padding:14px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <span class="badge upcoming">${t.em} ${t.label}</span>
          <span class="muted" style="font-size:12px">${U.esc(it.company)}</span>
        </div>
        <div style="font-weight:800;font-size:15.5px">${U.esc(it.plan)}</div>
        <div class="muted" style="font-size:12.5px;margin:2px 0 8px">รับอายุ ${U.esc(it.ages)} · ข้อมูลปี ${it.year}</div>
        <div style="font-size:14px;line-height:1.6">${U.esc(it.coverage)}</div>
        <div style="margin-top:8px;font-weight:700;color:var(--brown)">💵 ${U.esc(it.premium)}</div>
      </div>`;
    };

    root.innerHTML = `
      ${MB.knowledgeChips('cost')}
      ${costSubbar('insurance')}
      <div class="hero" style="padding:14px 16px"><div class="emoji">🛡️</div>
        <div style="flex:1"><h2 style="font-size:18px">ประกันสำหรับลูก</h2><p>เทียบแผนจากบริษัทชั้นนำ (ข้อมูลทางการ)</p></div></div>
      <div class="chips" style="margin:4px 0 12px">
        ${['all', 'health', 'save', 'accident'].map(k => `<div class="chip ${filter === k ? 'active' : ''}" data-t="${k}">${k === 'all' ? 'ทั้งหมด' : T[k].em + ' ' + T[k].label}</div>`).join('')}
      </div>
      ${list.map(card).join('') || '<p class="muted center">ไม่มีข้อมูลในหมวดนี้</p>'}
      <div class="disclaimer">⚠️ เบี้ยส่วนใหญ่คำนวณตามอายุ/แผน/ทุนประกัน — ตัวเลขที่แสดงเป็นเบี้ยเริ่มต้น/ตัวอย่างที่ประกาศ ณ ปี 2568 อาจเปลี่ยนแปลง โปรดติดต่อบริษัทเพื่อขอใบเสนอราคาจริงและเงื่อนไขล่าสุดก่อนตัดสินใจ (ไม่ใช่คำแนะนำการลงทุน/การเงินเฉพาะบุคคล)</div>
    `;
    MB.wireKnowledgeChips(root);
    wireCostSubbar(root);
    root.querySelectorAll('[data-t]').forEach(c => c.onclick = () => MB.go('prices', { tab: 'insurance', type: c.dataset.t }));
  }

  MB.views.prices = function (root, params) {
    const tab = (params && params.tab) || 'raising';
    if (tab === 'raising') return renderRaising(root, params);
    if (tab === 'insurance') return renderInsurance(root, params);
    const province = (params && params.province) || '';
    const isVax = tab === 'vaccine';

    const seed = isVax ? (MB.VAX_PRICE_SEED || []) : (MB.DELIVERY_SEED || []);
    const user = isVax ? S.vaxPricePkgs() : S.deliveryPkgs();
    let items = seed.concat(user);
    if (province) items = items.filter(x => x.province === province);
    items.sort((a, b) => COLL.compare(a.province || '', b.province || '') || COLL.compare(a.hospital || '', b.hospital || ''));

    const guide = isVax ? MB.VAX_PRICE_GUIDE : MB.DELIVERY_GUIDE;
    const guideHtml = isVax ? `
      <div class="card tint"><b>💡 รู้ก่อนจ่าย</b>
        <p style="font-size:13px;margin:6px 0 8px">${guide.note}</p>
        ${guide.ranges.map(r => `<div style="font-size:13px;display:flex;justify-content:space-between;gap:10px;padding:3px 0"><span class="muted">${r.t}</span><b>${r.d.replace('ประมาณ ', '')}</b></div>`).join('')}
      </div>` : `
      <div class="card tint"><b>🪪 สิทธิที่ช่วยจ่ายค่าคลอด</b>
        ${guide.rights.map(r => `<div style="margin-top:8px"><div style="font-weight:700;font-size:13.5px">${r.t}</div><div class="muted" style="font-size:12.5px">${r.d}</div></div>`).join('')}
        <div class="divider"></div><b>ช่วงราคาประมาณการ</b>
        ${guide.ranges.map(r => `<div style="font-size:13px;display:flex;justify-content:space-between;gap:10px;padding:3px 0"><span class="muted">${r.t}</span><b>${r.d.replace('ประมาณ ', '')}</b></div>`).join('')}
      </div>`;

    const N = MB.NIPT_DATA;
    const niptHtml = (!isVax && N) ? `
      <div class="card"><b>🧬 ราคาตรวจ NIPT (คัดกรองดาวน์ฯ จากเลือดแม่)</b>
        <p style="font-size:12.5px;color:#4f3d33;margin:6px 0 8px;line-height:1.6">${U.esc(N.intro)}</p>
        ${N.ranges.map(r => `<div style="font-size:13px;display:flex;justify-content:space-between;gap:10px;padding:3px 0"><span class="muted">${U.esc(r.tier)}</span><b style="white-space:nowrap">${U.esc(r.range)}</b></div>`).join('')}
        <div class="divider"></div>
        <div style="font-weight:700;font-size:13.5px;margin-bottom:4px">แพ็กเกจยอดนิยม</div>
        ${N.packages.map(p => `<div style="margin-top:6px"><div style="display:flex;justify-content:space-between;gap:8px"><b style="font-size:13.5px">${U.esc(p.name)}</b><span style="color:var(--pink-deep);font-weight:700;white-space:nowrap">${U.esc(p.price)}</span></div><div class="muted" style="font-size:12px">${U.esc(p.screens)}</div></div>`).join('')}
        <div class="disclaimer" style="margin-top:10px">${N.notes.map(n => '• ' + U.esc(n)).join('<br>')}</div>
      </div>` : '';

    // ค่าวัคซีน → อยู่ใต้แท็บ "วัคซีน" · ค่าคลอด → อยู่ใต้หน้า "ตั้งครรภ์" (เอาออกจากค่าใช้จ่าย/ความรู้แล้ว)
    const topNav = isVax
      ? (MB.vaxTabs ? MB.vaxTabs('price') : '')
      : (tab === 'delivery'
        ? `<button class="btn ghost sm" id="back-preg" style="margin-bottom:12px">‹ กลับหน้าตั้งครรภ์</button>`
        : (MB.knowledgeChips('cost') + costSubbar(tab)));
    root.innerHTML = `
      ${topNav}
      <div class="hero" style="padding:14px 16px"><div class="emoji">${isVax ? '💉' : '🤱'}</div>
        <div style="flex:1"><h2 style="font-size:18px">ราคา${isVax ? 'แพ็กเกจวัคซีน' : 'คลอด'}</h2><p>ดูได้ทุกจังหวัด · เทียบราคาก่อนตัดสินใจ</p></div></div>

      ${guideHtml}
      ${niptHtml}

      <div class="field"><label>เลือกจังหวัด</label>${provinceSelect(province)}</div>
      <div class="field"><input id="prov-search" placeholder="🔍 ค้นชื่อโรงพยาบาล..." /></div>

      <div class="section-title">รายการราคา <span class="more" id="list-count">${items.length} รายการ</span></div>
      <div id="price-list"></div>
      <button class="btn ghost sm" id="more-btn" style="display:none;width:100%;margin-top:2px"></button>

      <button class="btn pink" id="add-pkg" style="margin-top:10px">+ เพิ่มราคา${isVax ? 'วัคซีน' : 'คลอด'}ที่ทราบ</button>

      <div class="disclaimer">ราคาเป็นข้อมูลที่รวบรวมจากเว็บสาธารณะ/ผู้ใช้ ณ ช่วงเวลาหนึ่ง <b>อาจเปลี่ยนแปลงหรือเป็นโปรโมชันชั่วคราว</b> โปรดโทรยืนยันกับโรงพยาบาลทุกครั้งก่อนตัดสินใจ — รพ.รัฐส่วนใหญ่ใช้สิทธิบัตรทอง/ประกันสังคม</div>
    `;

    if (isVax) { MB.wireVaxTabs(root); }
    else if (tab === 'delivery') { const bp = root.querySelector('#back-preg'); if (bp) bp.onclick = () => MB.go('preg'); }
    else { MB.wireKnowledgeChips(root); wireCostSubbar(root); }
    root.querySelector('#prov-sel').onchange = (e) => MB.go('prices', { tab, province: e.target.value });
    root.querySelector('#add-pkg').onclick = () => openForm(tab, province);

    // แบ่งหน้าทีละ 20 การ์ด (กันหน้า "ค้าง" บนมือถือ — ไม่สร้าง DOM ทั้ง ~120 รายการในครั้งเดียว)
    const listEl = root.querySelector('#price-list');
    const moreBtn = root.querySelector('#more-btn');
    const countEl = root.querySelector('#list-count');
    const cardFn = isVax ? vaccineCard : deliveryCard;
    const searchKey = x => ((x.hospital || '') + ' ' + (x.province || '') + ' ' + (x.packageName || '')).toLowerCase();
    const emptyHtml = `<div class="empty"><div class="em">${isVax ? '💉' : '🏥'}</div><p>${province ? 'ยังไม่มีข้อมูลในจังหวัดนี้' : 'ไม่พบรายการ'}<br/>เพิ่มราคาที่คุณทราบได้เลย ช่วยกันสะสมเป็นฐานข้อมูล</p></div>`;
    const PAGE = 20;
    let matches = items, shown = 0;

    function renderPage() {
      listEl.insertAdjacentHTML('beforeend', matches.slice(shown, shown + PAGE).map(cardFn).join(''));
      shown += PAGE;
      const rest = matches.length - shown;
      if (rest > 0) { moreBtn.style.display = ''; moreBtn.textContent = `ดูเพิ่มอีก (${rest} รายการ)`; }
      else moreBtn.style.display = 'none';
    }
    function resetList(list) {
      matches = list; shown = 0; listEl.innerHTML = '';
      if (!matches.length) { listEl.innerHTML = emptyHtml; moreBtn.style.display = 'none'; return; }
      renderPage();
    }
    moreBtn.onclick = renderPage;
    resetList(items);

    // ลบรายการ — ใช้ event delegation
    listEl.addEventListener('click', (e) => {
      const del = e.target.closest('[data-del]'); if (!del) return;
      if (confirm('ลบรายการนี้?')) { isVax ? S.removeVaxPricePkg(del.dataset.del) : S.removeDeliveryPkg(del.dataset.del); MB.go('prices', { tab, province }); }
    });

    // ค้นหา = กรองจากชุดข้อมูลเต็มแล้วเรนเดอร์ใหม่ (ทำงานครบทุกรายการ ไม่ใช่แค่ที่โชว์อยู่)
    const search = root.querySelector('#prov-search');
    let t = null;
    search.oninput = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const q = search.value.trim().toLowerCase();
        const list = q ? items.filter(x => searchKey(x).includes(q)) : items;
        countEl.textContent = list.length + ' รายการ';
        resetList(list);
      }, 120);
    };
  };

  function openForm(tab, province) {
    const isVax = tab === 'vaccine';
    const common = `
      <div class="field"><label>จังหวัด</label>${MB.views._provSelForm(province)}</div>
      <div class="field"><label>ชื่อโรงพยาบาล</label><input id="pk-hosp" placeholder="เช่น รพ. ..." /></div>`;
    const body = isVax ? common + `
      <div class="field"><label>ชื่อแพ็กเกจ</label><input id="pk-name" placeholder="เช่น วัคซีนเหมาจ่าย 0-1 ปี" /></div>
      <div class="field"><div class="row"><div><label>ช่วงอายุ</label><input id="pk-ages" placeholder="แรกเกิด-1 ปี" /></div><div><label>ราคา (บาท)</label><input id="pk-price" placeholder="12,900" /></div></div></div>
      <div class="field"><label>รวมวัคซีนอะไรบ้าง</label><input id="pk-inc" placeholder="เช่น Rota, PCV, ไข้หวัดใหญ่" /></div>`
      : common + `
      <div class="field"><label>ประเภท</label><div class="chips" data-grp="type"><div class="chip active" data-v="เอกชน">เอกชน</div><div class="chip" data-v="รัฐ">รัฐ</div></div></div>
      <div class="field"><div class="row"><div><label>คลอดธรรมชาติ</label><input id="pk-normal" placeholder="39,000" /></div><div><label>ผ่าคลอด</label><input id="pk-cs" placeholder="75,000" /></div></div></div>
      <div class="field"><label>โปรโมชัน/หมายเหตุ</label><input id="pk-promo" placeholder="เช่น รวมค่าห้อง 3 คืน" /></div>`;
    MB.sheet({
      title: (isVax ? '💉 เพิ่มราคาวัคซีน' : '🤱 เพิ่มราคาคลอด'),
      html: body + `
        <div class="field"><div class="row"><div><label>ปีของราคา</label><input id="pk-year" placeholder="2568" /></div><div><label>เบอร์โทร</label><input id="pk-phone" placeholder="0xx-xxx-xxxx" /></div></div></div>
        <div class="field"><label>ลิงก์รูปแพ็กเกจ (ถ้ามี)</label><input id="pk-img" placeholder="วางลิงก์รูปภาพ https://..." /><div class="muted" style="font-size:11px;margin-top:3px">ใส่ลิงก์รูปโบรชัวร์/แพ็กเกจ จะแสดงเป็นภาพในการ์ด</div></div>
        <button class="btn pink" id="pk-save">บันทึก</button>`,
      onMount(rt) {
        rt.querySelectorAll('[data-grp="type"] .chip').forEach(ch => ch.onclick = () => {
          rt.querySelectorAll('[data-grp="type"] .chip').forEach(x => x.classList.remove('active')); ch.classList.add('active');
        });
        rt.querySelector('#pk-save').onclick = () => {
          const prov = rt.querySelector('#pkf-prov').value;
          const hospital = rt.querySelector('#pk-hosp').value.trim();
          if (!prov) return MB.toast('เลือกจังหวัดก่อนนะ');
          if (!hospital) return MB.toast('ใส่ชื่อโรงพยาบาลก่อนนะ');
          const base = { province: prov, hospital, year: rt.querySelector('#pk-year').value.trim() || undefined, phone: rt.querySelector('#pk-phone').value.trim() || undefined, img: rt.querySelector('#pk-img').value.trim() || undefined, source: 'เพิ่มเอง' };
          if (isVax) {
            S.addVaxPricePkg(Object.assign(base, { packageName: rt.querySelector('#pk-name').value.trim() || 'แพ็กเกจวัคซีน', ages: rt.querySelector('#pk-ages').value.trim() || undefined, price: rt.querySelector('#pk-price').value.trim() || undefined, includes: rt.querySelector('#pk-inc').value.trim() || undefined }));
          } else {
            const type = (rt.querySelector('[data-grp="type"] .chip.active') || {}).dataset?.v || 'เอกชน';
            S.addDeliveryPkg(Object.assign(base, { type, normal: rt.querySelector('#pk-normal').value.trim() || undefined, csection: rt.querySelector('#pk-cs').value.trim() || undefined, promo: rt.querySelector('#pk-promo').value.trim() || undefined }));
          }
          MB.closeSheet(); MB.toast('บันทึกแล้ว ขอบคุณที่ช่วยแบ่งปัน 💕'); MB.go('prices', { tab, province });
        };
      }
    });
  }

  /* province select สำหรับฟอร์ม (id ต่างกันเพื่อไม่ชนกับตัวกรอง) */
  MB.views._provSelForm = function (sel) {
    return `<select id="pkf-prov"><option value="">— เลือกจังหวัด —</option>
      ${MB.REGIONS.map(r => `<optgroup label="${r.em} ${r.name}">${r.provinces.map(p => `<option ${sel === p ? 'selected' : ''}>${p}</option>`).join('')}</optgroup>`).join('')}
    </select>`;
  };
})();
