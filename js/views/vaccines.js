/* หน้า: ตารางวัคซีน + ตัวช่วยสถานะ */
window.MB = window.MB || {}; MB.views = MB.views || {};
(function () {
  const S = MB.store, U = MB.util;
  const z = n => String(n).padStart(2, '0');

  function mLabel(m) {
    if (m === 0) return 'แรกเกิด';
    if (m < 12) return m + ' เดือน';
    const y = Math.floor(m / 12), mm = m % 12;
    return y + ' ปี' + (mm ? ' ' + mm + ' เดือน' : '');
  }
  function dueDate(birthISO, m) {
    const d = U.parseISO(birthISO); d.setMonth(d.getMonth() + m);
    return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate());
  }
  function statusOf(due, done) {
    if (done) return { text: 'ฉีดแล้ว', cls: 'done' };
    const today = S.todayISO();
    const diff = U.daysBetween(today, due);
    if (diff < 0) return { text: 'เลยกำหนด', cls: 'due' };
    if (diff <= 30) return { text: 'ใกล้ถึง', cls: 'soon' };
    return { text: 'กำหนด ' + U.fmtDateTH(due), cls: 'upcoming' };
  }

  /* รายการวัคซีนพร้อมสถานะ */
  MB.vaxList = function (child) {
    const v = S.vax(child.id);
    return MB.VACCINES.map(x => {
      const due = dueDate(child.birthDate, x.m);
      const done = !!(v[x.id] && v[x.id].done);
      return Object.assign({}, x, { due, ageLabel: mLabel(x.m), done, doneDate: done ? v[x.id].date : null, status: statusOf(due, done) });
    });
  };

  /* วัคซีนถัดไป (สำหรับหน้าหลัก) – เน้นพื้นฐานที่ยังไม่ฉีด */
  MB.vaxNext = function (child) {
    const list = MB.vaxList(child).filter(x => !x.done && x.group === 'พื้นฐาน');
    if (!list.length) return null;
    list.sort((a, b) => a.due.localeCompare(b.due));
    const n = list[0];
    return { name: n.name, due: n.due, ageLabel: n.ageLabel, text: n.status.text, cls: n.status.cls };
  };

  /* แท็บย่อยบนหน้า "วัคซีน": ตารางวัคซีน ↔ ราคาแพ็กเกจ (ย้าย "ค่าวัคซีน" มาอยู่ที่นี่) */
  MB.vaxTabs = function (active) {
    return `<div class="chips" style="margin:0 0 12px">
      <div class="chip ${active === 'schedule' ? 'active' : ''}" data-vaxtab="schedule" style="flex:1;justify-content:center;text-align:center">📅 ตารางวัคซีน</div>
      <div class="chip ${active === 'price' ? 'active' : ''}" data-vaxtab="price" style="flex:1;justify-content:center;text-align:center">💰 ราคาแพ็กเกจ</div>
    </div>`;
  };
  MB.wireVaxTabs = function (root) {
    root.querySelectorAll('[data-vaxtab]').forEach(c => c.onclick = () =>
      c.dataset.vaxtab === 'price' ? MB.go('prices', { tab: 'vaccine' }) : MB.go('vax'));
  };

  MB.views.vax = function (root, params) {
    const child = S.activeChild();
    if (!child) {
      root.innerHTML = `<div class="empty"><div class="em">💉</div><p>เพิ่มข้อมูลลูกเพื่อดูตารางวัคซีน<br/>(คำนวณกำหนดจากวันเกิดอัตโนมัติ)</p><button class="btn" id="add">+ เพิ่มลูกน้อย</button></div>`;
      root.querySelector('#add').onclick = () => MB.views.editChild(null);
      return;
    }
    const filter = (params && params.filter) || 'พื้นฐาน';
    const all = MB.vaxList(child);
    const baseDone = all.filter(x => x.group === 'พื้นฐาน' && x.done).length;
    const baseTotal = all.filter(x => x.group === 'พื้นฐาน').length;
    const overdue = all.filter(x => !x.done && x.status.cls === 'due').length;

    let list = all;
    if (filter === 'พื้นฐาน') list = all.filter(x => x.group === 'พื้นฐาน');
    else if (filter === 'เสริม') list = all.filter(x => x.group === 'เสริม');
    else if (filter === 'ค้าง') list = all.filter(x => !x.done && x.status.cls !== 'upcoming');

    // จัดกลุ่มตามอายุ
    const groups = {};
    list.forEach(x => (groups[x.ageLabel] || (groups[x.ageLabel] = [])).push(x));

    root.innerHTML = `
      ${MB.vaxTabs('schedule')}
      <div class="hero" style="padding:14px 16px">
        <div class="emoji">💉</div>
        <div style="flex:1">
          <h2 style="font-size:17px">วัคซีนของ${U.esc(child.name)}</h2>
          <p>ฉีดวัคซีนพื้นฐานแล้ว ${baseDone}/${baseTotal} รายการ</p>
          <div class="progress"><span style="width:${baseTotal ? Math.round(baseDone / baseTotal * 100) : 0}%"></span></div>
        </div>
      </div>
      ${overdue ? `<div class="card" style="background:#FCEAEB;border-color:#F4C9CC"><b style="color:#C45a61">⚠️ มี ${overdue} รายการเลยกำหนด</b><div class="muted" style="font-size:13px">ควรพาไปฉีดและปรึกษาแพทย์</div></div>` : ''}
      <div class="chips" style="margin:4px 0 12px">
        ${['พื้นฐาน', 'เสริม', 'ค้าง', 'ทั้งหมด'].map(f => `<div class="chip ${filter === f ? 'active' : ''}" data-f="${f}">${f}</div>`).join('')}
      </div>
      ${Object.entries(groups).map(([age, items]) => `
        <div class="section-title">📅 ${age}</div>
        <div class="card" style="padding:6px 14px">
          ${items.map(x => `<div class="list-item" data-tog="${x.id}">
            <div class="ic" style="background:${x.done ? '#E6F3E9' : 'var(--cream-2)'}">${x.done ? '✅' : '💉'}</div>
            <div class="body"><div class="t">${U.esc(x.name)}</div><div class="s">${U.esc(x.dose)} · ${U.esc(x.info)}</div></div>
            <span class="badge ${x.status.cls}">${x.status.text}</span>
          </div>`).join('')}
        </div>`).join('')}
      <div class="disclaimer">อ้างอิงตารางสร้างเสริมภูมิคุ้มกันโรค (EPI) ของไทยโดยประมาณ กำหนดการจริงและวัคซีนเสริมขึ้นกับนโยบายปีนั้น ๆ และดุลยพินิจแพทย์ — โปรดยึดสมุดสุขภาพเด็กเป็นหลัก</div>
      ${MB.citeBlock('vaccine')}
    `;
    MB.wireVaxTabs(root);
    root.querySelectorAll('[data-f]').forEach(c => c.onclick = () => MB.go('vax', { filter: c.dataset.f }));
    root.querySelectorAll('[data-tog]').forEach(n => n.onclick = () => {
      const x = all.find(v => v.id === n.dataset.tog);
      if (x) openVaxSheet(child, x, filter);
    });
  };

  /* ชีตบันทึกการฉีด — เลือก/แก้ "วันที่ฉีดจริง" ได้ */
  function openVaxSheet(child, x, filter) {
    const today = S.todayISO();
    const doneDate = x.doneDate || today;
    MB.sheet({
      title: '💉 ' + x.name,
      html: x.done ? `
        <div class="disclaimer" style="background:#E6F3E9;border-color:#BFE3C6;margin:0 0 14px">✅ ฉีดแล้วเมื่อ <b>${U.fmtDateTH(doneDate)}</b></div>
        <div class="field"><label>แก้ไขวันที่ฉีด</label><input id="vx-date" type="date" value="${doneDate}" max="${today}" /></div>
        <button class="btn" id="vx-savedate">บันทึกวันที่ใหม่</button>
        <button class="btn ghost" id="vx-undo" style="margin-top:10px;color:#D9737A">↩️ ยังไม่ได้ฉีด (ยกเลิก)</button>`
      : `
        <p class="muted" style="font-size:13px;margin:0 0 12px">${U.esc(x.dose)} · ${U.esc(x.info)}</p>
        <div class="field"><label>วันที่ฉีดจริง</label><input id="vx-date" type="date" value="${today}" max="${today}" /></div>
        <button class="btn" id="vx-done">✅ บันทึกว่าฉีดแล้ว</button>`,
      onMount(rt) {
        const q = id => rt.querySelector('#' + id);
        const dateVal = () => (q('vx-date') && q('vx-date').value) || today;
        if (q('vx-done')) q('vx-done').onclick = () => {
          S.toggleVax(child.id, x.id, dateVal());
          MB.closeSheet(); MB.toast('บันทึกการฉีดแล้ว 💉'); MB.rerender({ filter });
        };
        if (q('vx-savedate')) q('vx-savedate').onclick = () => {
          S.setVaxDate(child.id, x.id, dateVal());
          MB.closeSheet(); MB.toast('แก้วันที่ฉีดแล้ว ✓'); MB.rerender({ filter });
        };
        if (q('vx-undo')) q('vx-undo').onclick = () => {
          if (confirm('ยกเลิกว่ายังไม่ได้ฉีดวัคซีนนี้?')) { S.toggleVax(child.id, x.id); MB.closeSheet(); MB.rerender({ filter }); }
        };
      }
    });
  }
})();
