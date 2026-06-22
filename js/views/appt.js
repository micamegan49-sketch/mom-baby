/* หน้า: นัดหมาย & การเตือน (ฝากครรภ์ / วัคซีน / หมอเด็ก) */
window.MB = window.MB || {}; MB.views = MB.views || {};
(function () {
  const S = MB.store, U = MB.util;
  const KIND = {
    anc:     { em: '🤰', label: 'ฝากครรภ์' },
    vaccine: { em: '💉', label: 'วัคซีน' },
    checkup: { em: '🩺', label: 'ตรวจสุขภาพ/หมอเด็ก' },
    other:   { em: '🔔', label: 'อื่น ๆ' }
  };

  function statusBadge(date) {
    const d = U.daysBetween(S.todayISO(), date);
    if (d < 0) return { t: 'เลยกำหนด', c: 'due' };
    if (d === 0) return { t: 'วันนี้', c: 'soon' };
    if (d === 1) return { t: 'พรุ่งนี้', c: 'soon' };
    if (d <= 7) return { t: 'อีก ' + d + ' วัน', c: 'soon' };
    return { t: U.fmtDateTH(date), c: 'upcoming' };
  }

  /* นัดที่กำลังจะถึง (สำหรับหน้าหลัก) */
  MB.upcomingAppts = function (limit) {
    const today = S.todayISO();
    return S.appts().filter(a => !a.done).filter(a => U.daysBetween(today, a.date) >= -30)
      .sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || ''))).slice(0, limit || 99);
  };

  function childName(id) { const c = S.children().find(x => x.id === id); return c ? c.name : null; }

  MB.views.appt = function (root) {
    const ups = MB.upcomingAppts();
    const done = S.appts().filter(a => a.done || U.daysBetween(S.todayISO(), a.date) < -30);

    const row = a => {
      const k = KIND[a.kind] || KIND.other, st = statusBadge(a.date);
      const who = childName(a.childId);
      return `<div class="list-item">
        <div class="ic" data-tog="${a.id}" style="cursor:pointer;background:${a.done ? '#E6F3E9' : 'var(--cream-2)'}">${a.done ? '✅' : k.em}</div>
        <div class="body" data-tog="${a.id}" style="cursor:pointer"><div class="t">${U.esc(a.title)}</div>
          <div class="s">${k.label}${who ? ' · ' + U.esc(who) : ''}${a.time ? ' · ' + a.time + ' น.' : ''}${a.note ? ' · ' + U.esc(a.note) : ''}</div></div>
        ${a.done ? '' : `<span class="badge ${st.c}">${st.t}</span>`}
        <span data-del="${a.id}" style="cursor:pointer;color:#D9737A;font-size:12px;margin-left:8px">ลบ</span>
      </div>`;
    };

    root.innerHTML = `
      <div class="hero" style="padding:14px 16px"><div class="emoji">🔔</div>
        <div style="flex:1"><h2 style="font-size:18px">นัดหมาย & การเตือน</h2><p>${ups.length ? 'มี ' + ups.length + ' นัดที่กำลังจะถึง' : 'ยังไม่มีนัดที่จะถึง'}</p></div></div>

      <button class="btn pink" id="add-appt">+ เพิ่มนัดหมาย</button>
      ${S.activeChild() && MB.vaxNext && MB.vaxNext(S.activeChild()) ? '<button class="btn ghost" id="add-vax" style="margin-top:10px">💉 ตั้งเตือนวัคซีนเข็มถัดไปอัตโนมัติ</button>' : ''}

      <div class="section-title">กำลังจะถึง</div>
      ${ups.length ? `<div class="card" style="padding:6px 14px">${ups.map(row).join('')}</div>` : '<div class="empty"><div class="em">📅</div><p>ยังไม่มีนัดหมาย เพิ่มได้จากปุ่มด้านบน</p></div>'}

      ${done.length ? `<div class="section-title">เสร็จแล้ว / ผ่านมาแล้ว</div><div class="card" style="padding:6px 14px;opacity:.7">${done.map(row).join('')}</div>` : ''}

      <div class="disclaimer">การเตือนเป็นการแสดงในแอพ (ต้องเปิดแอพดู) — การแจ้งเตือนเด้งอัตโนมัติ (push) จะเพิ่มเมื่อนำขึ้นโฮสต์จริงในอนาคต</div>
    `;

    root.querySelector('#add-appt').onclick = () => openApptForm();
    const av = root.querySelector('#add-vax');
    if (av) av.onclick = () => {
      const vx = MB.vaxNext(S.activeChild());
      openApptForm({ title: vx.name, date: vx.due, kind: 'vaccine', childId: S.activeChild().id });
    };
    root.querySelectorAll('[data-tog]').forEach(n => n.onclick = () => { S.toggleAppt(n.dataset.tog); MB.rerender(); });
    root.querySelectorAll('[data-del]').forEach(n => n.onclick = () => { if (confirm('ลบนัดหมายนี้?')) { S.removeAppt(n.dataset.del); MB.rerender(); } });
  };

  function openApptForm(pre) {
    pre = pre || {};
    const kids = S.children();
    const childOpts = kids.map(c => `<option value="${c.id}" ${pre.childId === c.id ? 'selected' : ''}>${U.esc(c.name)}</option>`).join('');
    MB.sheet({
      title: '🔔 เพิ่มนัดหมาย',
      html: `
        <div class="field"><label>ประเภท</label><div class="chips" data-grp="kind">
          ${Object.keys(KIND).map(k => `<div class="chip ${(pre.kind || 'checkup') === k ? 'active' : ''}" data-v="${k}">${KIND[k].em} ${KIND[k].label}</div>`).join('')}
        </div></div>
        <div class="field"><label>หัวข้อ</label><input id="ap-title" value="${U.esc(pre.title || '')}" placeholder="เช่น ฉีดวัคซีน 2 เดือน" /></div>
        <div class="field"><div class="row">
          <div><label>วันที่</label><input id="ap-date" type="date" value="${pre.date || S.todayISO()}" /></div>
          <div><label>เวลา (ถ้ามี)</label><input id="ap-time" type="time" value="${pre.time || ''}" /></div>
        </div></div>
        ${kids.length ? `<div class="field"><label>สำหรับ</label><select id="ap-child"><option value="">— ทั่วไป/คุณแม่ —</option>${childOpts}</select></div>` : ''}
        <div class="field"><label>บันทึกเพิ่มเติม</label><input id="ap-note" placeholder="เช่น โรงพยาบาล... (ไม่บังคับ)" /></div>
        <button class="btn pink" id="ap-save">บันทึกนัดหมาย</button>
      `,
      onMount(rt) {
        rt.querySelectorAll('[data-grp="kind"] .chip').forEach(ch => ch.onclick = () => {
          rt.querySelectorAll('[data-grp="kind"] .chip').forEach(x => x.classList.remove('active')); ch.classList.add('active');
        });
        rt.querySelector('#ap-save').onclick = () => {
          const title = rt.querySelector('#ap-title').value.trim();
          const date = rt.querySelector('#ap-date').value;
          if (!title) return MB.toast('ใส่หัวข้อก่อนนะ');
          if (!date) return MB.toast('เลือกวันที่ก่อนนะ');
          const kind = (rt.querySelector('[data-grp="kind"] .chip.active') || {}).dataset?.v || 'checkup';
          const childSel = rt.querySelector('#ap-child');
          S.addAppt({ title, date, time: rt.querySelector('#ap-time').value || null, kind, childId: childSel ? childSel.value || null : null, note: rt.querySelector('#ap-note').value.trim() || null });
          MB.closeSheet(); MB.toast('บันทึกนัดหมายแล้ว 🔔'); MB.go('appt');
        };
      }
    });
  }
})();
