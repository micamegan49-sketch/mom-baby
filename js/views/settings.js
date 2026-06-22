/* หน้า: ตั้งค่า + โปรไฟล์ + จัดการลูก */
window.MB = window.MB || {}; MB.views = MB.views || {};
(function () {
  const S = MB.store, U = MB.util;

  /* ---- ฟอร์มเพิ่ม/แก้ไขลูก (บอตทอมชีต) ---- */
  MB.views.editChild = function (child) {
    const isNew = !child;
    const emojis = ['👶', '👧', '👦', '🍼', '🐣', '🧸'];
    const c = child || { name: '', sex: 'M', birthDate: S.todayISO(), emoji: '👶' };
    MB.sheet({
      title: isNew ? 'เพิ่มลูกน้อย' : 'แก้ไขข้อมูล',
      html: `
        <div class="field"><label>ชื่อเล่น</label><input id="f-name" value="${U.esc(c.name)}" placeholder="เช่น น้องข้าวปั้น" /></div>
        <div class="field"><label>เพศ</label>
          <div class="chips" id="f-sex">
            <div class="chip ${c.sex === 'M' ? 'active' : ''}" data-v="M">👦 ชาย</div>
            <div class="chip ${c.sex === 'F' ? 'active' : ''}" data-v="F">👧 หญิง</div>
          </div>
        </div>
        <div class="field"><label>วันเกิด</label><input id="f-bd" type="date" value="${c.birthDate}" max="${S.todayISO()}" /></div>
        <div class="field"><label>รูปแทนตัว</label>
          <div class="chips" id="f-emo">${emojis.map(e => `<div class="chip ${c.emoji === e ? 'active' : ''}" data-v="${e}" style="font-size:20px">${e}</div>`).join('')}</div>
        </div>
        <button class="btn" id="f-save">${isNew ? 'เพิ่มลูกน้อย' : 'บันทึก'}</button>
        ${isNew ? '' : '<button class="btn ghost" id="f-del" style="margin-top:10px;color:#D9737A">ลบโปรไฟล์นี้</button>'}
      `,
      onMount(root) {
        let sex = c.sex, emoji = c.emoji;
        root.querySelectorAll('#f-sex .chip').forEach(ch => ch.onclick = () => {
          root.querySelectorAll('#f-sex .chip').forEach(x => x.classList.remove('active'));
          ch.classList.add('active'); sex = ch.dataset.v;
        });
        root.querySelectorAll('#f-emo .chip').forEach(ch => ch.onclick = () => {
          root.querySelectorAll('#f-emo .chip').forEach(x => x.classList.remove('active'));
          ch.classList.add('active'); emoji = ch.dataset.v;
        });
        root.querySelector('#f-save').onclick = () => {
          const name = root.querySelector('#f-name').value.trim();
          const birthDate = root.querySelector('#f-bd').value;
          if (!name) return MB.toast('กรอกชื่อก่อนนะ');
          if (!birthDate) return MB.toast('เลือกวันเกิดก่อนนะ');
          if (isNew) { const nc = S.addChild({ name, sex, birthDate, emoji }); S.setActiveChild(nc.id); }
          else S.updateChild(child.id, { name, sex, birthDate, emoji });
          MB.closeSheet(); MB.toast('บันทึกแล้ว 🎉'); MB.go('home');
        };
        const del = root.querySelector('#f-del');
        if (del) del.onclick = () => {
          if (confirm('ลบโปรไฟล์และข้อมูลทั้งหมดของลูกคนนี้?')) {
            S.removeChild(child.id); MB.closeSheet(); MB.toast('ลบแล้ว'); MB.go('home');
          }
        };
      }
    });
  };

  /* ---- หน้าตั้งค่า ---- */
  MB.views.settings = function (root) {
    const kids = S.children();
    const preg = S.preg();
    const kidRows = kids.length ? kids.map(c => {
      const a = U.ageInfo(c.birthDate);
      return `<div class="list-item" data-edit="${c.id}">
        <div class="ic">${c.emoji || '👶'}</div>
        <div class="body"><div class="t">${U.esc(c.name)}</div><div class="s">${a.label} · เกิด ${U.fmtDateTH(c.birthDate)}</div></div>
        <div class="meta">แก้ไข ›</div></div>`;
    }).join('') : '<p class="muted center" style="padding:10px">ยังไม่มีโปรไฟล์ลูก</p>';

    root.innerHTML = `
      <div class="section-title">👶 ลูกของฉัน</div>
      <div class="card">${kidRows}
        <button class="btn ghost" id="add-baby" style="margin-top:12px">+ เพิ่มลูกน้อย</button>
      </div>

      <div class="section-title">🤰 การตั้งครรภ์</div>
      <div class="card">
        <div class="list-item" id="go-preg">
          <div class="ic">🤰</div>
          <div class="body"><div class="t">${preg.active ? 'กำลังตั้งครรภ์' : 'เริ่มโหมดตั้งครรภ์'}</div>
          <div class="s">${preg.active ? 'แตะเพื่อดู/แก้ไข' : 'ติดตามครรภ์รายสัปดาห์ นับลูกดิ้น น้ำหนัก'}</div></div>
          <div class="meta">›</div>
        </div>
      </div>

      <div class="section-title">🔔 อื่น ๆ</div>
      <div class="card">
        <div class="list-item" id="go-appt">
          <div class="ic">🔔</div>
          <div class="body"><div class="t">นัดหมาย & การเตือน</div><div class="s">ฝากครรภ์ วัคซีน หมอเด็ก</div></div>
          <div class="meta">›</div>
        </div>
        <div class="list-item" id="go-prices">
          <div class="ic">💰</div>
          <div class="body"><div class="t">ราคาคลอด & วัคซีน</div><div class="s">เทียบราคา รพ. ทุกจังหวัด</div></div>
          <div class="meta">›</div>
        </div>
        <button class="btn ghost" id="install" style="margin-top:12px;display:none">📲 ติดตั้งแอพลงเครื่อง</button>
      </div>

      <div class="section-title">💾 ข้อมูลของฉัน</div>
      <div class="card">
        <button class="btn ghost" id="exp" style="margin-bottom:10px">📤 สำรองข้อมูล (ส่งออกไฟล์)</button>
        <button class="btn ghost" id="imp" style="margin-bottom:10px">📥 นำเข้าข้อมูลจากไฟล์</button>
        <button class="btn ghost" id="rst" style="color:#D9737A">🗑️ ล้างข้อมูลทั้งหมด</button>
        <input type="file" id="impfile" accept="application/json" hidden />
      </div>

      <div class="section-title">ℹ️ เกี่ยวกับ</div>
      <div class="card">
        <p style="margin:0 0 8px;font-weight:700">ตัวจิ๋ว 👣 v1.0</p>
        <p class="muted" style="font-size:13px;margin:0">แอพดูแลคุณแม่และลูกน้อย ทำงานบนเครื่องของคุณ ข้อมูลเก็บในเครื่องนี้เท่านั้น ใช้งานออฟไลน์ได้</p>
        <div class="disclaimer" style="margin-top:12px">⚠️ ข้อมูลในแอพ (วัคซีน เกณฑ์เติบโต พัฒนาการ บทความ) เป็นข้อมูลอ้างอิงทั่วไปเพื่อความรู้ ไม่ใช่คำวินิจฉัยทางการแพทย์ กรุณายึดสมุดสุขภาพเด็กและคำแนะนำของแพทย์เป็นหลักเสมอ</div>
      </div>
    `;

    root.querySelector('#add-baby').onclick = () => MB.views.editChild(null);
    root.querySelectorAll('[data-edit]').forEach(n => n.onclick = () => {
      MB.views.editChild(kids.find(k => k.id === n.dataset.edit));
    });
    root.querySelector('#go-preg').onclick = () => MB.go('preg');
    root.querySelector('#go-appt').onclick = () => MB.go('appt');
    root.querySelector('#go-prices').onclick = () => MB.go('prices');
    const installBtn = root.querySelector('#install');
    if (MB._installPrompt) {
      installBtn.style.display = 'block';
      installBtn.onclick = async () => { MB._installPrompt.prompt(); MB._installPrompt = null; installBtn.style.display = 'none'; };
    }

    root.querySelector('#exp').onclick = () => {
      const blob = new Blob([S.exportJSON()], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'tuajiw-backup-' + S.todayISO() + '.json';
      a.click(); MB.toast('ส่งออกไฟล์แล้ว');
    };
    root.querySelector('#imp').onclick = () => root.querySelector('#impfile').click();
    root.querySelector('#impfile').onchange = (e) => {
      const file = e.target.files[0]; if (!file) return;
      const r = new FileReader();
      r.onload = () => { try { S.importJSON(r.result); MB.toast('นำเข้าสำเร็จ'); MB.go('home'); } catch { MB.toast('ไฟล์ไม่ถูกต้อง'); } };
      r.readAsText(file);
    };
    root.querySelector('#rst').onclick = () => {
      if (confirm('ล้างข้อมูลทั้งหมดในเครื่อง? ลบแล้วกู้คืนไม่ได้')) { S.reset(); MB.toast('ล้างข้อมูลแล้ว'); MB.go('home'); }
    };
  };
})();
