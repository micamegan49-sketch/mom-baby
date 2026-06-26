/* หน้า: ของใช้แม่และเด็ก — ปั๊มนม / ผ้าอ้อม / นมผง (เปรียบเทียบราคา ข้อมูลจริง) */
window.MB = window.MB || {}; MB.views = MB.views || {};
(function () {
  const U = MB.util;

  function tierBadge(t) {
    const cls = t === 'พรีเมียม' ? 'soon' : t === 'ประหยัด' ? 'upcoming' : 'due';
    return `<span class="badge ${cls}">${U.esc(t)}</span>`;
  }
  function searchBox(ph) {
    return `<div class="field"><input id="bc-search" placeholder="🔍 ${ph}" /></div>`;
  }
  function wireSearch(root) {
    const s = root.querySelector('#bc-search');
    if (!s) return;
    s.oninput = () => {
      const q = s.value.trim().toLowerCase();
      root.querySelectorAll('[data-search]').forEach(c => {
        c.style.display = !q || c.getAttribute('data-search').toLowerCase().includes(q) ? '' : 'none';
      });
    };
  }
  const disc = txt => `<div class="disclaimer" style="margin-top:12px">${txt}</div>`;
  const PRICE_DISC = 'ราคาเป็นข้อมูลรวบรวมจากร้านค้าออนไลน์ ณ ปี 2025-2026 <b>อาจเปลี่ยนตามโปรโมชัน/ร้าน/ไซส์</b> โปรดตรวจสอบกับผู้ขายก่อนซื้อจริง';

  /* ---------- เครื่องปั๊มนม ---------- */
  MB.views.pump = function (root) {
    const cards = MB.PUMP_DATA.map(x => `<div class="card" data-search="${U.esc(x.brand + ' ' + x.model + ' ' + x.type)}">
      <div style="display:flex;align-items:center;gap:8px"><b style="flex:1">${U.esc(x.brand)} <span style="font-weight:500">${U.esc(x.model)}</span></b>
        <span class="badge upcoming">${U.esc(x.type)}</span></div>
      <div style="margin-top:6px;font-weight:700;color:var(--pink-deep)">💵 ${U.esc(x.price)}</div>
      <div style="font-size:13.5px;color:#4f3d33;margin-top:4px">${U.esc(x.note)}</div>
    </div>`).join('');
    root.innerHTML = `${MB.knowledgeChips('cost')}${MB.costSubbar('pump')}
      <div class="hero" style="padding:14px 16px"><div class="emoji">🍼</div>
        <div style="flex:1"><h2 style="font-size:18px">เครื่องปั๊มนม</h2><p>เปรียบเทียบยี่ห้อ/รุ่นยอดนิยมในไทย</p></div></div>
      <div class="card tint"><b>💡 เลือกยังไงดี</b>
        <div style="font-size:13px;margin-top:6px;line-height:1.6">• <b>ปั๊มมือ/ซิลิโคน</b> ราคาประหยัด เหมาะพกพา/ปั๊มนาน ๆ ครั้ง<br>• <b>ไฟฟ้าเดี่ยว</b> เริ่มต้นสำหรับใช้บ้าน<br>• <b>ไฟฟ้าคู่</b> ปั๊มเร็ว เกลี้ยงเต้า เหมาะแม่ทำงาน/สต๊อกนม<br>• <b>สวมใส่ได้ (wearable)</b> ไร้สาย ทำอย่างอื่นได้ แต่ราคาสูง</div></div>
      ${searchBox('ค้นยี่ห้อ/รุ่น...')}
      <div class="section-title">รายการ <span class="more">${MB.PUMP_DATA.length} รุ่น</span></div>
      ${cards}
      ${disc('รีวิว/ราคาเพื่อประกอบการตัดสินใจเท่านั้น ไม่ใช่การโฆษณา การเลือกขึ้นกับสรีระและการใช้งานของแต่ละคน — ' + PRICE_DISC)}`;
    MB.wireKnowledgeChips(root); MB.wireCostSubbar(root); wireSearch(root);
  };

  /* ---------- ผ้าอ้อม/แพมเพิส ---------- */
  MB.views.diaper = function (root) {
    const cards = MB.DIAPER_DATA.map(x => `<div class="card" data-search="${U.esc(x.brand + ' ' + x.type)}">
      <div style="display:flex;align-items:center;gap:8px"><b style="flex:1">${U.esc(x.brand)}</b>${tierBadge(x.tier)}</div>
      <div class="muted" style="font-size:12.5px;margin-top:2px">${U.esc(x.type)} · ไซส์ ${U.esc(x.sizes)}</div>
      <div style="display:flex;gap:10px;margin-top:8px">
        <div style="flex:1;background:var(--cream-2);border-radius:10px;padding:8px;text-align:center"><div class="muted" style="font-size:11px">${U.esc(x.pack)}</div><b style="color:var(--brown)">${U.esc(x.price)}</b></div>
        <div style="flex:1;background:var(--cream-2);border-radius:10px;padding:8px;text-align:center"><div class="muted" style="font-size:11px">ราคาต่อชิ้น</div><b style="color:var(--pink-deep)">${U.esc(x.perPiece)}</b></div>
      </div>
    </div>`).join('');
    root.innerHTML = `${MB.knowledgeChips('cost')}${MB.costSubbar('diaper')}
      <div class="hero" style="padding:14px 16px"><div class="emoji">🧷</div>
        <div style="flex:1"><h2 style="font-size:18px">ผ้าอ้อม/แพมเพิส</h2><p>เทียบราคาต่อชิ้น ทุกยี่ห้อ/ไซส์</p></div></div>
      <div class="card tint"><b>📏 ราคากลางต่อชิ้น</b>
        ${MB.DIAPER_GUIDE.map(g => `<div style="font-size:13px;display:flex;justify-content:space-between;padding:3px 0"><span class="muted">${U.esc(g.tier)}</span><b>${U.esc(g.range)}</b></div>`).join('')}
        <div style="font-size:12px;color:var(--muted);margin-top:6px">เทียบ "ราคาต่อชิ้น" จะคุ้มกว่าดูราคาห่อ เพราะจำนวนชิ้นต่อห่อต่างกัน · แพ็คใหญ่/ยกลังมักถูกกว่า</div></div>
      ${searchBox('ค้นยี่ห้อ...')}
      <div class="section-title">รายการ <span class="more">${MB.DIAPER_DATA.length} ยี่ห้อ</span></div>
      ${cards}
      ${disc(PRICE_DISC + ' · ไซส์ NB/S/M/L/XL/XXL เลือกตามน้ำหนักลูก (ดูที่ข้างห่อ)')}`;
    MB.wireKnowledgeChips(root); MB.wireCostSubbar(root); wireSearch(root);
  };

  /* ---------- นมผง ---------- */
  MB.views.formula = function (root) {
    const cards = MB.FORMULA_DATA.map(x => `<div class="card" data-search="${U.esc(x.brand + ' ' + x.line + ' ' + x.type)}">
      <div style="display:flex;align-items:center;gap:8px"><b style="flex:1">${U.esc(x.brand)} <span style="font-weight:500">${U.esc(x.line)}</span></b>
        <span class="badge ${x.type === 'ปกติ' ? 'upcoming' : 'soon'}">${U.esc(x.type)}</span></div>
      <div class="muted" style="font-size:12.5px;margin-top:2px">${U.esc(x.stage)} · ${U.esc(x.size)}</div>
      <div style="display:flex;gap:10px;margin-top:8px">
        <div style="flex:1;background:var(--cream-2);border-radius:10px;padding:8px;text-align:center"><div class="muted" style="font-size:11px">ราคา</div><b style="color:var(--brown)">${U.esc(x.price)}</b></div>
        <div style="flex:1;background:var(--cream-2);border-radius:10px;padding:8px;text-align:center"><div class="muted" style="font-size:11px">ต่อ 100 ก.</div><b style="color:var(--pink-deep)">${U.esc(x.per100g)}</b></div>
      </div>
    </div>`).join('');
    root.innerHTML = `${MB.knowledgeChips('cost')}${MB.costSubbar('formula')}
      <div class="hero" style="padding:14px 16px"><div class="emoji">🥛</div>
        <div style="flex:1"><h2 style="font-size:18px">นมผง</h2><p>เทียบราคาต่อ 100 กรัม</p></div></div>
      <div class="card" style="background:#FFF3E6;border-color:#F3DCBD"><b style="color:#B9802F">🤱 นมแม่ดีที่สุด</b>
        <p style="font-size:12.5px;margin:6px 0 0;line-height:1.6">${U.esc(MB.FORMULA_NOTICE)}</p></div>
      <div class="card tint" style="margin-top:10px"><b>💵 ราคากลางต่อ 100 กรัม</b><p style="font-size:13px;margin:6px 0 0;line-height:1.6">${U.esc(MB.FORMULA_GUIDE)}</p></div>
      ${searchBox('ค้นยี่ห้อ/สูตร...')}
      <div class="section-title">รายการ <span class="more">${MB.FORMULA_DATA.length} รายการ</span></div>
      ${cards}
      ${disc('สูตรเฉพาะ (แพ้นมวัว/ไฮโดรไลซ์/soy/A2) ควรใช้ตามคำแนะนำแพทย์ · ' + PRICE_DISC)}`;
    MB.wireKnowledgeChips(root); MB.wireCostSubbar(root); wireSearch(root);
  };
})();
