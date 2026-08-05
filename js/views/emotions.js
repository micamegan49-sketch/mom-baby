/* หน้า: อารมณ์ลูกแต่ละช่วงวัย (แรกเกิด → 5 ขวบ) */
window.MB = window.MB || {}; MB.views = MB.views || {};
(function () {
  const S = MB.store, U = MB.util;

  const TINT = {
    rose:  { bg: 'var(--rose-bg)',  dot: '#E59BA6' },
    peach: { bg: 'var(--peach-bg)', dot: '#D9A06A' },
    mint:  { bg: 'var(--mint-bg)',  dot: '#5FBF9B' },
    sky:   { bg: 'var(--sky-bg)',   dot: '#6FA8D6' },
    lilac: { bg: 'var(--lilac-bg)', dot: '#9B7ED0' }
  };

  function curStage(months) {
    if (months == null) return null;
    let cur = null;
    MB.EMOTIONS.forEach(e => { if (months >= e.from) cur = e; });
    return cur;
  }

  MB.views.emotions = function (root, params) {
    const child = S.activeChild();
    const months = child ? U.ageInfo(child.birthDate).totalMonths : null;
    const cur = curStage(months);
    const open = (params && params.open) || (cur && cur.key) || 'e0';

    // สัญญาณที่ควรปรึกษา — เอาช่วงล่าสุดที่ผ่านมาแล้วของอายุลูก
    let cc = null;
    if (months != null) MB.EMO_CONCERNS.forEach(c => { if (c.m <= months) cc = c; });

    const intro = `<div class="card" style="background:var(--rose-bg);border-color:#F4D7DF">
        <b style="font-size:15px">😊 อารมณ์ลูกแต่ละช่วงวัย</b>
        <p style="margin:6px 0 0;font-size:13.5px;line-height:1.65">
          ลูกไม่ได้ "ดื้อ" หรือ "เอาแต่ใจ" ตั้งแต่เกิด — อารมณ์ของเด็กค่อย ๆ พัฒนาไปตามวัย
          รู้ว่าช่วงนี้ลูกกำลังรู้สึกอะไร จะช่วยให้เราตอบสนองได้ตรงและเหนื่อยน้อยลง
        </p>
        ${child ? `<p class="muted" style="margin:8px 0 0;font-size:12.5px">กำลังดูของ ${U.esc(child.name)} · ${U.ageInfo(child.birthDate).label}</p>` : ''}
      </div>`;

    const cards = MB.EMOTIONS.map(e => {
      const t = TINT[e.tint] || TINT.rose;
      const isCur = cur && cur.key === e.key;
      const isOpen = open === e.key;
      return `<div class="card emo-card ${isOpen ? 'open' : ''}" data-emo="${e.key}"
                   style="${isCur ? 'border-color:var(--pink);' : ''}padding:0;overflow:hidden">
        <div class="emo-head">
          <div class="ic" style="background:${t.bg}">${e.em}</div>
          <div class="body">
            <div class="t">${e.label} ${isCur ? '<span class="badge soon" style="margin-left:4px">ช่วงนี้</span>' : ''}</div>
            <div class="s">${U.esc(e.tag)}</div>
          </div>
          <div class="chev">${isOpen ? '−' : '+'}</div>
        </div>
        <div class="emo-body" style="${isOpen ? '' : 'display:none'}">
          <p class="emo-feel">${U.esc(e.feel)}</p>
          <div class="emo-sec">
            <div class="h" style="color:${t.dot}">🔎 สังเกตได้จาก</div>
            <ul>${e.signs.map(s => `<li>${U.esc(s)}</li>`).join('')}</ul>
          </div>
          <div class="emo-sec">
            <div class="h" style="color:${t.dot}">💡 แม่ช่วยได้แบบนี้</div>
            <ul>${e.tips.map(s => `<li>${U.esc(s)}</li>`).join('')}</ul>
          </div>
        </div>
      </div>`;
    }).join('');

    const concern = cc ? `<div class="card" style="background:#FFF3E6;border-color:#F3DCBD">
        <b style="color:#B9802F">⚠️ ถ้าพบสัญญาณนี้ ควรปรึกษาแพทย์</b>
        <p style="margin:6px 0 0;font-size:13.5px">${U.esc(cc.text)}</p>
        <p class="muted" style="margin:6px 0 0;font-size:12px">(แนวทางสำหรับช่วงอายุราว ${cc.m} เดือนขึ้นไป — ไม่ใช่การวินิจฉัย)</p>
      </div>` : '';

    root.innerHTML = MB.knowledgeChips('emo') + intro + cards + concern
      + `<div class="disclaimer">เด็กแต่ละคนมีจังหวะของตัวเอง ข้อมูลนี้เป็นแนวทางทั่วไปเพื่อความเข้าใจ ไม่ใช่คำวินิจฉัยหรือคำแนะนำเฉพาะบุคคล หากกังวลเรื่องพัฒนาการหรืออารมณ์ของลูก ควรปรึกษาแพทย์หรือผู้เชี่ยวชาญ</div>`
      + MB.citeBlock('emotion');

    MB.wireKnowledgeChips(root);
    root.querySelectorAll('[data-emo] .emo-head').forEach(h => h.onclick = () => {
      const card = h.parentNode;
      const body = card.querySelector('.emo-body');
      const shown = body.style.display !== 'none';
      body.style.display = shown ? 'none' : '';
      card.classList.toggle('open', !shown);
      h.querySelector('.chev').textContent = shown ? '+' : '−';
    });
  };
})();
