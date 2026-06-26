/* หน้า: ความรู้ – พัฒนาการ + บทความ + ถาม-ตอบ */
window.MB = window.MB || {}; MB.views = MB.views || {};
(function () {
  const S = MB.store, U = MB.util;

  /* แถบหัวข้อหลักของ "ความรู้" — ใช้ร่วมกันทุกหน้าย่อย
     ค่าคลอด/ค่าวัคซีน/ประกัน ถูกรวมเป็นหน้าเดียว "💰 ค่าใช้จ่าย" (เราต์ prices + แท็บย่อย) */
  MB.knowledgeChips = function (active) {
    const items = [
      { k: 'ms',        em: '🌱', label: 'พัฒนาการ' },
      { k: 'articles',  em: '📖', label: 'บทความ' },
      { k: 'faq',       em: '💬', label: 'ถาม-ตอบ' },
      { k: 'cost',      em: '💰', label: 'ค่าใช้จ่าย' },
      { k: 'groups',    em: '🤝', label: 'กลุ่มแม่' }
    ];
    return `<div class="chips chips-main" style="margin-bottom:14px">
      ${items.map(i => `<div class="chip ${active === i.k ? 'active' : ''}" data-knav="${i.k}">${i.em} ${i.label}</div>`).join('')}
    </div>`;
  };
  MB.wireKnowledgeChips = function (root) {
    root.querySelectorAll('[data-knav]').forEach(c => c.onclick = () => {
      const k = c.dataset.knav;
      if (k === 'cost') MB.go('prices', { tab: 'raising' });
      else if (k === 'groups') MB.go('groups');
      else MB.go('develop', { tab: k });
    });
  };

  function mLabel(m) {
    if (m === 0) return 'แรกเกิด';
    if (m < 12) return m + ' เดือน';
    const y = Math.floor(m / 12), mm = m % 12;
    return y + ' ปี' + (mm ? ' ' + mm + ' เดือน' : '');
  }

  /* ความคืบหน้าพัฒนาการช่วงปัจจุบัน (สำหรับหน้าหลัก) */
  MB.msProgress = function (child) {
    const age = U.ageInfo(child.birthDate).totalMonths;
    const ages = [...new Set(MB.MILESTONES.map(m => m.m))].sort((a, b) => a - b);
    let band = ages[0];
    ages.forEach(a => { if (a <= age) band = a; });
    const items = MB.MILESTONES.filter(m => m.m === band);
    const ms = S.ms(child.id);
    const done = items.filter(m => ms[m.id] && ms[m.id].done).length;
    return { done, total: items.length, bandLabel: mLabel(band), band };
  };

  /* เปิดอ่านบทความ */
  MB.openArticle = function (id) {
    const a = MB.ARTICLES.find(x => x.id === id);
    if (!a) return;
    MB.sheet({
      title: a.em + ' ' + a.title,
      html: `<div class="article">${a.body}</div>
        <div class="disclaimer" style="margin-top:14px">เนื้อหาเพื่อความรู้ทั่วไป ไม่ใช่คำแนะนำเฉพาะบุคคล กรณีมีข้อสงสัยควรปรึกษาแพทย์/ผู้เชี่ยวชาญ</div>
        <button class="btn ghost" style="margin-top:12px" onclick="MB.closeSheet()">ปิด</button>`
    });
  };

  MB.views.develop = function (root, params) {
    const child = S.activeChild();
    const tab = (params && params.tab) || (params && params.cat ? 'articles' : (child ? 'ms' : 'articles'));

    const seg = MB.knowledgeChips(tab);

    if (tab === 'ms') root.innerHTML = seg + renderMs(child);
    else if (tab === 'faq') root.innerHTML = seg + renderFaq();
    else root.innerHTML = seg + renderArticles(params && params.cat);

    MB.wireKnowledgeChips(root);

    if (tab === 'ms' && child) {
      root.querySelectorAll('[data-ms]').forEach(n => n.onclick = () => { S.toggleMs(child.id, n.dataset.ms); MB.rerender({ tab: 'ms' }); });
    }
    if (tab === 'articles') {
      root.querySelectorAll('[data-cat]').forEach(n => n.onclick = () => MB.go('develop', { tab: 'articles', cat: n.dataset.cat }));
      root.querySelectorAll('[data-art]').forEach(n => n.onclick = () => MB.openArticle(n.dataset.art));
    }
    if (tab === 'faq') {
      root.querySelectorAll('[data-faq]').forEach(n => n.onclick = () => {
        const ans = n.querySelector('.faq-a'); ans.style.display = ans.style.display === 'block' ? 'none' : 'block';
        n.querySelector('.faq-ar').textContent = ans.style.display === 'block' ? '−' : '+';
      });
    }
  };

  function renderMs(child) {
    if (!child) return `<div class="empty"><div class="em">🌱</div><p>เพิ่มข้อมูลลูกเพื่อติดตามพัฒนาการตามวัย</p><button class="btn" onclick="MB.views.editChild(null)">+ เพิ่มลูกน้อย</button></div>`;
    const age = U.ageInfo(child.birthDate).totalMonths;
    const ms = S.ms(child.id);
    const ages = [...new Set(MB.MILESTONES.map(m => m.m))].sort((a, b) => a - b);
    let curBand = ages[0]; ages.forEach(a => { if (a <= age) curBand = a; });

    // ธงแดงของช่วงปัจจุบัน
    let rf = null; MB.REDFLAGS.forEach(f => { if (f.m <= age + 0) rf = f; });
    const rfCard = rf ? `<div class="card" style="background:#FFF3E6;border-color:#F3DCBD">
      <b style="color:#B9802F">⚠️ สัญญาณที่ควรปรึกษาแพทย์ (ราว ${mLabel(rf.m)})</b>
      <p style="margin:6px 0 0;font-size:13.5px">${rf.text}</p></div>` : '';

    return rfCard + ages.map(a => {
      const items = MB.MILESTONES.filter(m => m.m === a);
      const cur = a === curBand;
      return `<div class="section-title">${MB.DOMAINS ? '' : ''}📅 ${mLabel(a)} ${cur ? '<span class="badge soon" style="margin-left:6px">ช่วงนี้</span>' : ''}</div>
        <div class="card" style="padding:6px 14px;${cur ? 'border-color:var(--pink);' : ''}">
          ${items.map(m => {
            const done = ms[m.id] && ms[m.id].done;
            const d = MB.DOMAINS[m.domain] || { em: '•', label: '' };
            return `<div class="list-item" data-ms="${m.id}">
              <div class="ic" style="background:${done ? '#E6F3E9' : 'var(--cream-2)'}">${done ? '✅' : d.em}</div>
              <div class="body"><div class="t">${U.esc(m.text)}</div><div class="s">${d.label}</div></div>
            </div>`;
          }).join('')}
        </div>`;
    }).join('') + `<div class="disclaimer">เด็กแต่ละคนมีจังหวะพัฒนาการต่างกัน ใช้เป็นแนวทางคร่าว ๆ หากกังวลหรือพบสัญญาณธงแดง ควรปรึกษาแพทย์</div>` + MB.citeBlock('develop');
  }

  function renderArticles(cat) {
    const cats = MB.CATS;
    const chips = `<div class="chips" style="margin-bottom:14px">
      <div class="chip ${!cat ? 'active' : ''}" data-cat="">ทั้งหมด</div>
      ${Object.keys(cats).map(k => `<div class="chip ${cat === k ? 'active' : ''}" data-cat="${k}">${cats[k].em} ${cats[k].label}</div>`).join('')}
    </div>`;
    const list = MB.ARTICLES.filter(a => !cat || a.cat === cat);
    const cards = list.map(a => `<div class="card" data-art="${a.id}" style="display:flex;align-items:center;gap:12px;cursor:pointer">
      <div style="font-size:30px">${a.em}</div>
      <div style="flex:1"><div style="font-weight:700">${U.esc(a.title)}</div><div class="muted" style="font-size:12.5px">${cats[a.cat] ? cats[a.cat].label : ''}</div></div>
      <div style="color:var(--pink-deep);font-size:20px">›</div></div>`).join('');
    return chips + (cards || '<p class="muted center">ไม่มีบทความในหมวดนี้</p>');
  }

  function renderFaq() {
    return `<p class="muted center" style="font-size:13px;margin:-4px 0 12px">คำถามที่คุณแม่พบบ่อย แตะเพื่อดูคำตอบ</p>` +
      MB.FAQ.map(f => `<div class="card" data-faq style="cursor:pointer;padding:14px">
        <div style="display:flex;align-items:center;gap:10px"><b style="flex:1;font-size:14.5px">${U.esc(f.q)}</b><span class="faq-ar" style="font-size:22px;color:var(--pink-deep)">+</span></div>
        <div class="faq-a" style="display:none;margin-top:10px;font-size:14px;color:#4f3d33;line-height:1.6">${U.esc(f.a)}</div>
      </div>`).join('') +
      `<div class="disclaimer">เวอร์ชันนี้เป็นคลังคำถามที่พบบ่อย (ออฟไลน์) — ฟีเจอร์คอมมูนิตี้ถาม-ตอบกับผู้เชี่ยวชาญจริงจะเพิ่มในเวอร์ชันถัดไป</div>`;
  }
})();
