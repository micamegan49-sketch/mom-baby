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
        <div class="list-item" id="go-diary">
          <div class="ic">📸</div>
          <div class="body"><div class="t">ไดอารี่ความทรงจำ</div><div class="s">เก็บภาพช่วงเวลาน่ารักของลูก</div></div>
          <div class="meta">›</div>
        </div>
        <button class="btn ghost" id="install" style="margin-top:12px;display:none">📲 ติดตั้งแอพลงเครื่อง</button>
      </div>

      <div class="section-title">☁️ บัญชี & ซิงค์ข้ามเครื่อง</div>
      <div class="card" id="cloud-card"></div>

      <div class="section-title">📚 แหล่งอ้างอิงทางการแพทย์</div>
      <div class="card">
        <p class="muted" style="font-size:13px;margin:0 0 10px">ข้อมูลสุขภาพในแอพอ้างอิงจากแหล่งที่น่าเชื่อถือต่อไปนี้ (แตะเพื่อเปิดดูที่มา)</p>
        <div id="sources-list"></div>
      </div>

      <div class="section-title">ℹ️ เกี่ยวกับ</div>
      <div class="card">
        <p style="margin:0 0 8px;font-weight:700">ตัวจิ๋ว 👣 v1.0</p>
        <p class="muted" style="font-size:13px;margin:0">แอพดูแลคุณแม่และลูกน้อย ทำงานบนเครื่องของคุณ ข้อมูลเก็บในเครื่องนี้เท่านั้น ใช้งานออฟไลน์ได้ — ไม่จำเป็นต้องสมัครบัญชี (การซิงค์คลาวด์เป็นทางเลือก)</p>
        <div class="disclaimer" style="margin-top:12px">⚠️ <b>ข้อมูลเพื่อความรู้ทั่วไป ไม่ใช่คำแนะนำทางการแพทย์</b> — ข้อมูลในแอพ (วัคซีน เกณฑ์เติบโต พัฒนาการ การตั้งครรภ์ บทความ) เป็นข้อมูลอ้างอิงทั่วไป ไม่ใช่คำวินิจฉัยหรือคำแนะนำเฉพาะบุคคล กรุณายึดสมุดสุขภาพเด็กและคำแนะนำของแพทย์เป็นหลักเสมอ ดูแหล่งอ้างอิงด้านบน</div>
        <a href="https://micamegan49-sketch.github.io/mom-baby/support.html" target="_blank" rel="noopener noreferrer"
          class="btn ghost" style="margin-top:12px;display:block;text-decoration:none;text-align:center">💬 ความช่วยเหลือ & ติดต่อเรา</a>
      </div>
    `;

    /* แหล่งอ้างอิง: เรนเดอร์รายการพร้อมลิงก์ (citations – ข้อกำหนด App Store 1.4.1) */
    const srcBox = root.querySelector('#sources-list');
    if (srcBox && MB.SOURCES) {
      srcBox.innerHTML = (MB.SOURCE_KEYS || Object.keys(MB.SOURCES)).map(k => {
        const s = MB.SOURCES[k]; if (!s) return '';
        const links = s.items.map(it =>
          `<a href="${it.url}" target="_blank" rel="noopener noreferrer" style="display:block;color:#8B5E4B;text-decoration:underline;font-size:13px;margin:3px 0;word-break:break-word">• ${it.name} ↗</a>`
        ).join('');
        return `<div style="margin-bottom:12px"><div style="font-weight:700;font-size:14px;margin-bottom:2px">${s.title}</div>${links}</div>`;
      }).join('');
    }

    root.querySelector('#add-baby').onclick = () => MB.views.editChild(null);
    root.querySelectorAll('[data-edit]').forEach(n => n.onclick = () => {
      MB.views.editChild(kids.find(k => k.id === n.dataset.edit));
    });
    root.querySelector('#go-preg').onclick = () => MB.go('preg');
    root.querySelector('#go-appt').onclick = () => MB.go('appt');
    root.querySelector('#go-diary').onclick = () => MB.go('diary');
    const installBtn = root.querySelector('#install');
    if (MB._installPrompt) {
      installBtn.style.display = 'block';
      installBtn.onclick = async () => { MB._installPrompt.prompt(); MB._installPrompt = null; installBtn.style.display = 'none'; };
    }

    // ส่วน "ข้อมูลของฉัน" (สำรอง/นำเข้า/ล้าง) ถูกซ่อนจากผู้ใช้แล้ว — guard ไว้กันพังถ้านำกลับมาภายหลัง
    const expBtn = root.querySelector('#exp');
    if (expBtn) expBtn.onclick = () => {
      const blob = new Blob([S.exportJSON()], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'tuajiw-backup-' + S.todayISO() + '.json';
      a.click(); MB.toast('ส่งออกไฟล์แล้ว');
    };
    const impBtn = root.querySelector('#imp');
    if (impBtn) impBtn.onclick = () => root.querySelector('#impfile').click();
    const impFile = root.querySelector('#impfile');
    if (impFile) impFile.onchange = (e) => {
      const file = e.target.files[0]; if (!file) return;
      const r = new FileReader();
      r.onload = () => { try { S.importJSON(r.result); MB.toast('นำเข้าสำเร็จ'); MB.go('home'); } catch { MB.toast('ไฟล์ไม่ถูกต้อง'); } };
      r.readAsText(file);
    };
    const rstBtn = root.querySelector('#rst');
    if (rstBtn) rstBtn.onclick = () => {
      if (confirm('ล้างข้อมูลทั้งหมดในเครื่อง? ลบแล้วกู้คืนไม่ได้')) { S.reset(); MB.toast('ล้างข้อมูลแล้ว'); MB.go('home'); }
    };

    /* ---------- การ์ดคลาวด์ & ซิงค์ ---------- */
    if (MB.views._cloudUnsub) { try { MB.views._cloudUnsub(); } catch (e) {} MB.views._cloudUnsub = null; }

    function inputRow(id, label, ph, type) {
      return `<div class="field"><label>${label}</label>
        <input id="${id}" type="${type || 'text'}" placeholder="${U.esc(ph || '')}"
          autocapitalize="off" autocomplete="off" autocorrect="off" spellcheck="false" /></div>`;
    }
    function errTH(e) {
      const m = (e && e.message) || '';
      if (/Invalid login/i.test(m)) return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
      if (/already registered/i.test(m)) return 'อีเมลนี้สมัครไว้แล้ว ลองเข้าสู่ระบบ';
      if (/at least 6|Password should/i.test(m)) return 'รหัสผ่านอย่างน้อย 6 ตัว';
      if (/valid email|invalid.*email/i.test(m)) return 'อีเมลไม่ถูกต้อง';
      if (/Email not confirmed/i.test(m)) return 'ยังไม่ได้ยืนยันอีเมล ตรวจสอบกล่องจดหมาย';
      return m || 'เกิดข้อผิดพลาด';
    }
    function cloudInner(st) {
      if (!st.configured) {
        return `<p class="muted" style="font-size:13px;margin:0 0 12px">
            เชื่อมต่อ Supabase เพื่อสำรองข้อมูลออนไลน์และซิงค์ข้ามเครื่อง (มือถือ+คอม) — ฟรี ตั้งค่าครั้งเดียว
            วิธีสร้างโปรเจกต์ดูใน README</p>
          ${inputRow('su-url', 'Project URL', 'https://xxxx.supabase.co')}
          ${inputRow('su-key', 'anon public key', 'eyJhbGci...')}
          <button class="btn" id="su-save">บันทึกการตั้งค่า</button>`;
      }
      const editKeys = `<button class="btn ghost sm" id="su-edit" style="margin-top:10px">⚙️ แก้คีย์ Supabase</button>`;
      if (!st.ready) {
        return `<p class="muted" style="font-size:13px">กำลังเชื่อมต่อคลาวด์... ถ้าค้างอาจกำลังออฟไลน์ (แอพยังใช้งานได้ปกติ)</p>${editKeys}`;
      }
      if (!st.signedIn) {
        return `<p class="muted" style="font-size:13px;margin:0 0 12px">เข้าสู่ระบบเพื่อซิงค์ข้อมูลข้ามเครื่อง</p>
          ${inputRow('su-email', 'อีเมล', 'you@email.com', 'email')}
          ${inputRow('su-pw', 'รหัสผ่าน', 'อย่างน้อย 6 ตัว', 'password')}
          <div style="display:flex;gap:10px">
            <button class="btn" id="su-login" style="flex:1">เข้าสู่ระบบ</button>
            <button class="btn ghost" id="su-signup" style="flex:1">สมัครใหม่</button>
          </div>
          ${st.error ? `<p style="color:#C45a61;font-size:12px;margin:10px 0 0">${U.esc(st.error)}</p>` : ''}
          ${editKeys}`;
      }
      const synced = st.lastSyncedAt ? 'ซิงค์ล่าสุด ' + U.relTime(st.lastSyncedAt) : 'ยังไม่ได้ซิงค์';
      const line = st.syncing ? '⏳ กำลังซิงค์...' : (st.error ? '⚠️ ' + U.esc(st.error) : '✅ ' + synced);
      const conflictBlock = st.conflict ? `
        <div class="disclaimer" style="margin:12px 0;background:#FCEAEB;border-color:#F4C9CC">
          ⚠️ พบข้อมูลทั้งบนคลาวด์และในเครื่องนี้ และไม่ตรงกัน — เลือกว่าจะเก็บชุดไหน (อีกชุดจะถูกเขียนทับ):
          <div style="display:flex;gap:10px;margin-top:10px">
            <button class="btn sm" id="su-pull" style="flex:1">ใช้ข้อมูลคลาวด์</button>
            <button class="btn ghost sm" id="su-push" style="flex:1">ใช้ข้อมูลเครื่องนี้</button>
          </div>
        </div>` : '';
      const roleBadge = st.role === 'owner' ? '👑 เจ้าของ' : st.role === 'viewer' ? '👁 ดูอย่างเดียว' : '✏️ บันทึกได้';
      const switcher = (st.homes && st.homes.length > 1) ? `
        <div class="field" style="margin-top:10px"><label>บ้านที่กำลังดู</label>
          <select id="su-home" style="width:100%;padding:11px;border-radius:12px;border:1px solid #E7D5C8;background:#fff;font-size:15px">
            ${st.homes.map(h => `<option value="${h.id}" ${h.id === st.homeId ? 'selected' : ''}>${U.esc(h.name)}${h.role === 'owner' ? '' : ' · ร่วมดูแล'}</option>`).join('')}
          </select>
        </div>` : '';
      return `<div class="list-item" style="padding:6px 0">
          <div class="ic">☁️</div>
          <div class="body"><div class="t">${U.esc(st.email)}</div><div class="s">${line}</div></div>
        </div>
        ${conflictBlock}
        <div class="disclaimer" style="background:#F6EEE8;border-color:#E7D5C8;margin:10px 0">
          🏠 บ้าน: <b>${U.esc(st.homeName || '-')}</b> · สิทธิ์คุณ: ${roleBadge}
        </div>
        ${switcher}
        <div style="display:flex;gap:10px;margin-top:6px">
          <button class="btn ghost sm" id="su-members" style="flex:1">👥 สมาชิก & เชิญ</button>
          <button class="btn ghost sm" id="su-join" style="flex:1">➕ ใส่รหัสเชิญ</button>
        </div>
        <button class="btn ghost" id="su-sync" style="margin-top:10px">🔄 ซิงค์เดี๋ยวนี้</button>
        <button class="btn ghost" id="su-logout" style="margin-top:10px;color:#D9737A">ออกจากระบบ</button>
        <div style="border-top:1px solid #EAD9CC;margin-top:14px;padding-top:12px">
          <button class="btn ghost" id="su-delacc" style="color:#C0566A;border-color:#E7C2C7">🗑️ ลบบัญชีและข้อมูลถาวร</button>
          <p class="muted" style="font-size:11.5px;margin:8px 2px 0;text-align:center">ลบบัญชี อีเมล และข้อมูลที่ซิงค์ทั้งหมดออกจากระบบอย่างถาวร (กู้คืนไม่ได้) ·
            <a href="https://micamegan49-sketch.github.io/mom-baby/delete-account.html" target="_blank" rel="noopener noreferrer" style="color:#8B5E4B">รายละเอียด</a></p>
        </div>`;
    }
    function wireCloud(card) {
      const $ = id => card.querySelector('#' + id);
      if ($('su-save')) $('su-save').onclick = async () => {
        const url = $('su-url').value.trim(), key = $('su-key').value.trim();
        if (!url || !key) return MB.toast('กรอก URL และคีย์ให้ครบ');
        await MB.cloud.saveConfig(url, key); MB.toast('บันทึกแล้ว'); paintCloud();
      };
      if ($('su-edit')) $('su-edit').onclick = () => { MB.cloud.clearConfig(); paintCloud(); };
      async function doAuth(mode) {
        const email = $('su-email') ? $('su-email').value.trim() : '';
        const pw = $('su-pw') ? $('su-pw').value : '';
        // ตรวจช่องว่างก่อน เพื่อให้ปุ่มตอบสนองทันทีเสมอ (ไม่กดแล้วเงียบ)
        if (!email) { MB.toast('กรอกอีเมลก่อนนะ'); if ($('su-email')) $('su-email').focus(); return; }
        if (!pw) { MB.toast('กรอกรหัสผ่านก่อนนะ'); if ($('su-pw')) $('su-pw').focus(); return; }
        if (pw.length < 6) { MB.toast('รหัสผ่านอย่างน้อย 6 ตัว'); if ($('su-pw')) $('su-pw').focus(); return; }
        const loginBtn = $('su-login'), signBtn = $('su-signup');
        const btn = mode === 'signup' ? signBtn : loginBtn;
        const label = btn ? btn.textContent : '';
        if (loginBtn) loginBtn.disabled = true;
        if (signBtn) signBtn.disabled = true;
        if (btn) btn.textContent = mode === 'signup' ? 'กำลังสมัคร…' : 'กำลังเข้าสู่ระบบ…';
        try {
          if (mode === 'signup') {
            const r = await MB.cloud.signUp(email, pw);
            MB.toast(r && r.session ? 'สมัครและเข้าสู่ระบบแล้ว 🎉' : 'สมัครแล้ว — โปรดตรวจอีเมลเพื่อยืนยัน แล้วกด “เข้าสู่ระบบ”');
          } else {
            await MB.cloud.signIn(email, pw);
            MB.toast('เข้าสู่ระบบแล้ว 🎉');
          }
        } catch (e) {
          if (loginBtn) loginBtn.disabled = false;
          if (signBtn) signBtn.disabled = false;
          if (btn) btn.textContent = label;
          MB.toast(errTH(e));
          return;
        }
        paintCloud();
      }
      if ($('su-login')) $('su-login').onclick = () => doAuth('login');
      if ($('su-signup')) $('su-signup').onclick = () => doAuth('signup');
      if ($('su-sync')) $('su-sync').onclick = () => MB.cloud.syncNow();
      if ($('su-pull')) $('su-pull').onclick = () => MB.cloud.pullForce();
      if ($('su-push')) $('su-push').onclick = () => MB.cloud.pushForce();
      if ($('su-logout')) $('su-logout').onclick = async () => { await MB.cloud.signOut(); MB.toast('ออกจากระบบแล้ว'); paintCloud(); };
      if ($('su-delacc')) $('su-delacc').onclick = async () => {
        // ยืนยัน 2 ชั้น กันลบโดยไม่ตั้งใจ (ข้อกำหนด App Store 5.1.1(v) — ลบบัญชีได้จากในแอป)
        if (!confirm('ลบบัญชีและข้อมูลทั้งหมดถาวร?\nบัญชี อีเมล และข้อมูลที่ซิงค์จะถูกลบ กู้คืนไม่ได้')) return;
        if (!confirm('ยืนยันอีกครั้ง — การลบนี้ถาวรและกู้คืนไม่ได้\nต้องการลบบัญชีต่อหรือไม่?')) return;
        const btn = $('su-delacc'); btn.disabled = true; btn.textContent = 'กำลังลบบัญชี…';
        try {
          await MB.cloud.deleteAccount();
          MB.toast('ลบบัญชีและข้อมูลถาวรแล้ว');
          paintCloud();
        } catch (e) {
          btn.disabled = false; btn.textContent = '🗑️ ลบบัญชีและข้อมูลถาวร';
          MB.toast('ลบไม่สำเร็จ: ' + ((e && e.message) || 'ลองใหม่อีกครั้ง'));
        }
      };
      if ($('su-home')) $('su-home').onchange = async () => { await MB.cloud.switchHome($('su-home').value); MB.toast('สลับบ้านแล้ว'); paintCloud(); };
      if ($('su-members')) $('su-members').onclick = openMembers;
      if ($('su-join')) $('su-join').onclick = openJoin;
    }
    function openMembers() {
      const st = MB.cloud.status();
      MB.sheet({
        title: '👥 สมาชิกในบ้าน',
        html: `${st.isOwner ? `<button class="btn ghost sm" id="mem-rename" style="margin-bottom:10px">✏️ เปลี่ยนชื่อบ้าน (${U.esc(st.homeName || '')})</button>` : ''}
          <div id="mem-list"><p class="muted center">กำลังโหลด...</p></div>
          ${st.isOwner ? `
            <div class="section-title" style="margin-top:6px">เชิญคนช่วยดูแล</div>
            <div class="chips" id="inv-role">
              <div class="chip active" data-v="editor">✏️ บันทึกได้</div>
              <div class="chip" data-v="viewer">👁 ดูอย่างเดียว</div>
            </div>
            <button class="btn" id="inv-gen" style="margin-top:8px">สร้างรหัสเชิญ</button>
            <div id="inv-out" style="margin-top:10px"></div>`
          : '<p class="muted" style="font-size:12px;margin-top:10px">เฉพาะเจ้าของบ้านเชิญ/ลบสมาชิกได้</p>'}`,
        onMount(sheetEl) {
          let role = 'editor';
          const reload = async () => {
            let mem = [];
            try { mem = await MB.cloud.listMembers(); } catch (e) {}
            const box = sheetEl.querySelector('#mem-list');
            if (!box) return;
            box.innerHTML = mem.length ? mem.map(m => {
              const rb = m.role === 'owner' ? '👑' : m.role === 'viewer' ? '👁' : '✏️';
              const me = m.email === st.email;
              const canRm = st.isOwner && m.role !== 'owner';
              return `<div class="list-item">
                <div class="ic">${rb}</div>
                <div class="body"><div class="t">${U.esc(m.email || (m.user_id || '').slice(0, 8))}${me ? ' (คุณ)' : ''}</div>
                  <div class="s">${m.role === 'owner' ? 'เจ้าของ' : m.role === 'viewer' ? 'ดูอย่างเดียว' : 'บันทึกได้'}</div></div>
                ${canRm ? `<button class="btn ghost sm" data-rm="${m.user_id}" style="color:#D9737A;width:auto;padding:6px 12px">ลบ</button>` : ''}
              </div>`;
            }).join('') : '<p class="muted center">ยังไม่มีสมาชิก</p>';
            box.querySelectorAll('[data-rm]').forEach(b => b.onclick = async () => {
              if (confirm('ลบสมาชิกคนนี้ออกจากบ้าน?')) { try { await MB.cloud.removeMember(b.dataset.rm); } catch (e) { MB.toast('ลบไม่สำเร็จ'); } reload(); }
            });
          };
          reload();
          const rn = sheetEl.querySelector('#mem-rename');
          if (rn) rn.onclick = async () => {
            const name = prompt('ตั้งชื่อบ้านใหม่', st.homeName || '');
            if (name && name.trim()) { try { await MB.cloud.renameHome(name.trim()); MB.toast('เปลี่ยนชื่อแล้ว'); MB.closeSheet(); paintCloud(); } catch (e) { MB.toast('เปลี่ยนไม่สำเร็จ'); } }
          };
          const chips = sheetEl.querySelectorAll('#inv-role .chip');
          chips.forEach(c => c.onclick = () => { chips.forEach(x => x.classList.remove('active')); c.classList.add('active'); role = c.dataset.v; });
          const gen = sheetEl.querySelector('#inv-gen');
          if (gen) gen.onclick = async () => {
            gen.disabled = true; gen.textContent = 'กำลังสร้าง...';
            try {
              const code = await MB.cloud.createInvite(role);
              const url = location.origin + location.pathname;
              sheetEl.querySelector('#inv-out').innerHTML = `
                <div class="disclaimer" style="background:#EAF5EC;border-color:#BFE3C6">
                  ✅ รหัสเชิญ (ใช้ได้ 14 วัน):<br><b style="font-size:22px;letter-spacing:2px">${code}</b>
                  <p style="font-size:12px;margin:8px 0 0">ให้พี่เลี้ยงเปิดแอพ → สมัคร/เข้าสู่ระบบ → ตั้งค่า → ☁️ → "ใส่รหัสเชิญ" → กรอกรหัสนี้</p>
                  <button class="btn ghost sm" id="inv-copy" style="margin-top:8px">📋 ก๊อปข้อความเชิญ</button>
                </div>`;
              const cp = sheetEl.querySelector('#inv-copy');
              if (cp) cp.onclick = () => {
                const txt = `ชวนช่วยดูแลลูกในแอพตัวจิ๋ว 👣\nเปิด: ${url}\nสมัคร/เข้าสู่ระบบ แล้วไป ตั้งค่า → ☁️ → ใส่รหัสเชิญ\nรหัส: ${code}`;
                if (navigator.clipboard) navigator.clipboard.writeText(txt).then(() => MB.toast('ก๊อปข้อความแล้ว'), () => MB.toast('ก๊อปไม่ได้'));
                else MB.toast('ก๊อปด้วยมือนะ');
              };
            } catch (e) { MB.toast('สร้างรหัสไม่สำเร็จ'); }
            gen.disabled = false; gen.textContent = 'สร้างรหัสเชิญ';
            reload();
          };
        }
      });
    }
    function openJoin() {
      MB.sheet({
        title: '➕ เข้าร่วมด้วยรหัสเชิญ',
        html: `<p class="muted" style="font-size:13px">กรอกรหัสที่เจ้าของบ้านส่งให้ เพื่อเข้าไปช่วยดูแล/บันทึกข้อมูลลูกของเขา</p>
          <div class="field"><label>รหัสเชิญ</label>
            <input id="jn-code" placeholder="เช่น A1B2C3D4" autocapitalize="characters" autocomplete="off" style="text-transform:uppercase;letter-spacing:1px" /></div>
          <button class="btn" id="jn-go">เข้าร่วม</button>`,
        onMount(sheetEl) {
          sheetEl.querySelector('#jn-go').onclick = async () => {
            const code = sheetEl.querySelector('#jn-code').value.trim();
            if (!code) return MB.toast('กรอกรหัสก่อน');
            const btn = sheetEl.querySelector('#jn-go'); btn.disabled = true; btn.textContent = 'กำลังเข้าร่วม...';
            try {
              await MB.cloud.redeemInvite(code);
              MB.closeSheet(); MB.toast('เข้าร่วมบ้านสำเร็จ 🎉'); MB.go('home');
            } catch (e) {
              const m = (e && e.message) || '';
              MB.toast(/not_found/.test(m) ? 'ไม่พบรหัสนี้' : /expired/.test(m) ? 'รหัสหมดอายุแล้ว' : 'เข้าร่วมไม่สำเร็จ');
              btn.disabled = false; btn.textContent = 'เข้าร่วม';
            }
          };
        }
      });
    }
    function paintCloud() {
      const card = root.querySelector('#cloud-card');
      if (!card || !MB.cloud) return;
      card.innerHTML = cloudInner(MB.cloud.status());
      wireCloud(card);
    }
    if (MB.cloud) {
      paintCloud();
      MB.views._cloudUnsub = MB.cloud.onChange(() => paintCloud());
      MB.cloud.init();   // โหลดไลบรารีคลาวด์แบบ lazy เมื่อผู้ใช้เปิดหน้าตั้งค่า (กรณียังไม่เคยล็อกอิน)
    } else {
      root.querySelector('#cloud-card').innerHTML =
        '<p class="muted" style="font-size:13px;margin:0">ระบบคลาวด์ยังไม่พร้อม (อาจกำลังออฟไลน์) — แอพใช้งานออฟไลน์ได้ตามปกติ</p>';
    }
  };
})();
