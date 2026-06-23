/* หน้า: ประกันสำหรับลูก (เทียบแผนจากบริษัทชั้นนำ) */
window.MB = window.MB || {}; MB.views = MB.views || {};
(function () {
  const U = MB.util;

  MB.views.insurance = function (root, params) {
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
        <div style="display:flex;gap:14px;margin-top:10px;font-size:13px;align-items:center">
          <a href="${U.esc(it.url)}" target="_blank" rel="noopener" style="color:var(--pink-deep);font-weight:700;text-decoration:none">เว็บทางการ ›</a>
          <span class="muted" style="font-size:11.5px">${U.esc(it.source)}</span>
        </div>
      </div>`;
    };

    root.innerHTML = `
      ${MB.knowledgeChips('insurance')}
      <div class="hero" style="padding:14px 16px"><div class="emoji">🛡️</div>
        <div style="flex:1"><h2 style="font-size:18px">ประกันสำหรับลูก</h2><p>เทียบแผนจากบริษัทชั้นนำ (ข้อมูลทางการ)</p></div></div>
      <div class="chips" style="margin:4px 0 12px">
        ${['all', 'health', 'save', 'accident'].map(k => `<div class="chip ${filter === k ? 'active' : ''}" data-t="${k}">${k === 'all' ? 'ทั้งหมด' : T[k].em + ' ' + T[k].label}</div>`).join('')}
      </div>
      ${list.map(card).join('') || '<p class="muted center">ไม่มีข้อมูลในหมวดนี้</p>'}
      <div class="disclaimer">⚠️ เบี้ยส่วนใหญ่คำนวณตามอายุ/แผน/ทุนประกัน — ตัวเลขที่แสดงเป็นเบี้ยเริ่มต้น/ตัวอย่างที่ประกาศ ณ ปี 2568 อาจเปลี่ยนแปลง โปรดติดต่อบริษัทเพื่อขอใบเสนอราคาจริงและเงื่อนไขล่าสุดก่อนตัดสินใจ (ไม่ใช่คำแนะนำการลงทุน/การเงินเฉพาะบุคคล)</div>
    `;
    MB.wireKnowledgeChips(root);
    root.querySelectorAll('[data-t]').forEach(c => c.onclick = () => MB.go('insurance', { type: c.dataset.t }));
  };
})();
