/* หน้า: หน้าหลัก (แดชบอร์ด) + ออนบอร์ดดิ้ง */
window.MB = window.MB || {}; MB.views = MB.views || {};
(function () {
  const S = MB.store, U = MB.util;

  function stageOf(months) { return months < 12 ? 'baby' : 'toddler'; }
  function sameDay(ts, ref) {
    const d = new Date(ts), r = ref;
    return d.getFullYear() === r.getFullYear() && d.getMonth() === r.getMonth() && d.getDate() === r.getDate();
  }

  /* ===== สร้างรายการแจ้งเตือน (ใช้โดยกระดิ่งบนแถบบน + ส่วนแจ้งเตือนหน้าหลัก) =====
     รวมเรื่องที่ "ต้องทำ": วัคซีนเลย/ใกล้กำหนด, นัดหมายเร็ว ๆ นี้, ถึงเวลาชั่งน้ำหนัก, ใกล้คลอด */
  MB.buildNotifications = function () {
    const out = [];
    const today = S.todayISO();
    const child = S.activeChild();
    const preg = S.preg();

    if (child && MB.vaxList) {
      const vlist = MB.vaxList(child);
      vlist.filter(x => !x.done && x.status.cls === 'due')
        .forEach(x => out.push({ em: '💉', cls: 'due', title: 'วัคซีนเลยกำหนด: ' + x.name, sub: 'กำหนด ' + U.fmtDateTH(x.due) + ' · ควรพาไปฉีด', go: 'vax' }));
      vlist.filter(x => !x.done && x.status.cls === 'soon').slice(0, 3)
        .forEach(x => out.push({ em: '💉', cls: 'soon', title: 'ใกล้ถึงกำหนดวัคซีน: ' + x.name, sub: 'กำหนด ' + U.fmtDateTH(x.due), go: 'vax' }));
    }

    (S.appts() || []).filter(a => !a.done).forEach(a => {
      if (child && a.childId && a.childId !== child.id) return;
      const d = U.daysBetween(today, a.date);
      const em = a.kind === 'vaccine' ? '💉' : a.kind === 'anc' ? '🤰' : a.kind === 'checkup' ? '🩺' : '🔔';
      if (d < 0) out.push({ em, cls: 'due', title: 'นัดเลยกำหนด: ' + a.title, sub: U.fmtDateTH(a.date) + ' · แตะเพื่อจัดการ', go: 'appt' });
      else if (d <= 7) {
        const lbl = d === 0 ? 'วันนี้' : d === 1 ? 'พรุ่งนี้' : 'อีก ' + d + ' วัน';
        out.push({ em, cls: d <= 1 ? 'due' : 'soon', title: 'นัดหมาย: ' + a.title, sub: U.fmtDateTH(a.date) + (a.time ? ' · ' + a.time + ' น.' : '') + ' · ' + lbl, go: 'appt' });
      }
    });

    if (child) {
      const meas = S.measurements(child.id);
      const last = meas[meas.length - 1];
      const age = U.ageInfo(child.birthDate);
      const limit = age.totalMonths < 12 ? 30 : 90;   // เด็กเล็กควรวัดถี่กว่า
      if (!last) out.push({ em: '📈', cls: 'soon', title: 'ยังไม่มีข้อมูลการเจริญเติบโต', sub: 'เพิ่มน้ำหนัก/ส่วนสูงเพื่อดูกราฟเทียบเกณฑ์', go: 'growth' });
      else {
        const days = U.daysBetween(last.date, today);
        if (days >= limit) out.push({ em: '📈', cls: 'soon', title: 'ถึงเวลาชั่งน้ำหนัก/วัดส่วนสูง', sub: 'วัดล่าสุด ' + U.fmtDateTH(last.date) + ' (' + days + ' วันก่อน)', go: 'growth' });
      }
    }

    if (!child && preg.active) {
      const p = U.pregInfo(preg);
      if (p && p.daysLeft >= 0 && p.daysLeft <= 30)
        out.push({ em: '🤰', cls: 'soon', title: 'ใกล้กำหนดคลอดแล้ว', sub: 'เหลืออีก ' + p.daysLeft + ' วัน · เตรียมกระเป๋าคลอดได้เลย', go: 'preg' });
    }

    return out;
  };

  /* การ์ดเกร็ดความรู้ (สุ่ม/รายวัน) */
  function tipCardHtml(stage) {
    const arr = MB.tipsFor ? MB.tipsFor(stage) : [];
    const tip = MB.tipOfDay ? MB.tipOfDay(arr) : (arr[0] || null);
    if (!tip) return '';
    return `<div class="section-title">💡 เกร็ดความรู้</div>
      <div class="card" style="background:linear-gradient(135deg,#FFF4F6,#FBF2EB);border-color:#F3D9DE">
        <p id="tip-text" style="margin:0;font-size:14.5px;line-height:1.65;color:#5a463c">${U.esc(tip.text)}</p>
        <button class="btn ghost sm" id="tip-more" style="margin-top:12px">🔄 อีกเรื่อง</button>
      </div>`;
  }
  function wireTip(root, stage) {
    const arr = MB.tipsFor ? MB.tipsFor(stage) : [];
    const btn = root.querySelector('#tip-more'), txt = root.querySelector('#tip-text');
    if (!btn || !txt) return;
    if (arr.length < 2) { btn.style.display = 'none'; return; }
    let cur = MB.tipOfDay ? arr.indexOf(MB.tipOfDay(arr)) : 0;
    btn.onclick = () => {
      let i; do { i = Math.floor(Math.random() * arr.length); } while (i === cur);
      cur = i; txt.textContent = arr[i].text;
    };
  }

  MB.views.home = function (root) {
    const child = S.activeChild();
    const preg = S.preg();

    // ---------- ออนบอร์ดดิ้ง ----------
    if (!child && !preg.active) {
      root.innerHTML = `
        <div style="text-align:center;padding:24px 8px 8px">
          <div style="font-size:64px">👣</div>
          <h2 style="margin:8px 0 4px;color:var(--brown-deep)">ยินดีต้อนรับสู่ ตัวจิ๋ว</h2>
          <p class="muted" style="margin:0 0 22px">ผู้ช่วยดูแลคุณแม่และลูกน้อย<br/>ตั้งแต่ในครรภ์จนถึงวัยเตาะแตะ</p>
        </div>
        <div class="card tint onboard" id="start-plan" style="display:flex;align-items:center;gap:14px">
          <div style="font-size:40px">🌷</div>
          <div style="flex:1"><div style="font-weight:800;font-size:17px">วางแผนมีลูก</div>
          <div class="muted" style="font-size:13px">คำนวณวันไข่ตก & ช่วงมีบุตรง่าย</div></div>
          <div style="font-size:22px;color:var(--pink-deep)">›</div>
        </div>
        <div class="card tint onboard" id="start-preg" style="display:flex;align-items:center;gap:14px">
          <div style="font-size:40px">🤰</div>
          <div style="flex:1"><div style="font-weight:800;font-size:17px">กำลังตั้งครรภ์</div>
          <div class="muted" style="font-size:13px">ติดตามครรภ์รายสัปดาห์ เทียบขนาดลูก นับลูกดิ้น</div></div>
          <div style="font-size:22px;color:var(--pink-deep)">›</div>
        </div>
        <div class="card tint onboard" id="start-baby" style="display:flex;align-items:center;gap:14px">
          <div style="font-size:40px">👶</div>
          <div style="flex:1"><div style="font-weight:800;font-size:17px">มีลูกแล้ว</div>
          <div class="muted" style="font-size:13px">บันทึกประจำวัน วัคซีน กราฟเติบโต พัฒนาการ</div></div>
          <div style="font-size:22px;color:var(--pink-deep)">›</div>
        </div>
        <div class="disclaimer" style="margin-top:18px">ข้อมูลทั้งหมดเก็บในเครื่องของคุณ ใช้งานออฟไลน์ได้ 100% และเป็นความรู้ทั่วไป ไม่ใช่คำวินิจฉัยทางการแพทย์</div>
      `;
      root.querySelector('#start-plan').onclick = () => MB.go('plan');
      root.querySelector('#start-preg').onclick = () => MB.go('preg');
      root.querySelector('#start-baby').onclick = () => MB.views.editChild(null);
      return;
    }

    // ---------- ไม่มีลูก แต่กำลังตั้งครรภ์ → สรุปครรภ์ ----------
    if (!child && preg.active) {
      const p = U.pregInfo(preg);
      const wk = (MB.PREG_WEEKS.find(x => x.w === (p ? p.week : 0))) || MB.PREG_WEEKS[0];
      root.innerHTML = `
        <div class="hero" id="open-preg">
          <div class="emoji" style="padding:2px">${MB.fruitSVG((MB.PREG_FRUIT_KEY && MB.PREG_FRUIT_KEY[p ? p.week : 0]) || 'seed', 60, { bare: true })}</div>
          <div style="flex:1">
            <div class="tag-week">ไตรมาส ${p ? p.trimester : 1}</div>
            <div class="bigweek"><b>${p ? p.week : '-'}</b><small>สัปดาห์ ${p ? '+' + p.day + ' วัน' : ''}</small></div>
            <p>เหลืออีก ${p && p.daysLeft >= 0 ? p.daysLeft + ' วัน' : 'ถึงกำหนดแล้ว'} · ลูกตอนนี้ ≈ ${wk.fruitName}</p>
          </div>
        </div>
        <div class="card"><b>👶 ลูกตอนนี้</b><p style="margin:6px 0 0;font-size:14px">${wk.baby}</p></div>
        ${tipCardHtml('preg')}
        <button class="btn pink" id="full-preg">เปิดหน้าตั้งครรภ์แบบเต็ม 🤰</button>
        <button class="btn ghost" id="add-baby2" style="margin-top:10px">คลอดแล้ว? เพิ่มข้อมูลลูก 👶</button>
      `;
      root.querySelector('#open-preg').onclick = root.querySelector('#full-preg').onclick = () => MB.go('preg');
      root.querySelector('#add-baby2').onclick = () => MB.views.editChild(null);
      wireTip(root, 'preg');
      return;
    }

    // ---------- แดชบอร์ดลูก ----------
    const a = U.ageInfo(child.birthDate);
    const logs = S.logs(child.id);
    const now = new Date();
    const todayLogs = logs.filter(l => sameDay(l.ts, now));
    const feeds = todayLogs.filter(l => l.type === 'feed').length;
    const diapers = todayLogs.filter(l => l.type === 'diaper').length;
    const sleepMin = todayLogs.filter(l => l.type === 'sleep').reduce((s, l) => s + (l.minutes || 0), 0);
    const sleepH = sleepMin ? (Math.round(sleepMin / 6) / 10) : 0;
    const lastFeed = logs.find(l => l.type === 'feed');

    // วัคซีนถัดไป
    const vx = MB.vaxNext ? MB.vaxNext(child) : null;
    // พัฒนาการรอบตัว
    const msInfo = MB.msProgress ? MB.msProgress(child) : null;
    // เติบโตล่าสุด
    const meas = S.measurements(child.id);
    const lastM = meas[meas.length - 1];
    // บทความ
    const stage = stageOf(a.totalMonths);
    const arts = MB.ARTICLES.filter(x => x.stage === stage || x.stage === 'all').slice(0, 6);
    const feed = MB.feedingFor ? MB.feedingFor(a.totalMonths) : null;
    const feedHtml = feed ? `
      <div class="section-title">🍼 อาหารตามวัย <span class="more">${feed.label}</span></div>
      <div class="card">
        <p style="margin:0 0 8px"><b>เน้น:</b> ${feed.focus}</p>
        <div style="font-weight:700;color:var(--brown);margin-bottom:2px">🍽️ ควรกิน</div>
        <ul style="margin:0 0 10px;padding-left:20px;font-size:14px;line-height:1.65">${feed.foods.map(f => '<li>' + f + '</li>').join('')}</ul>
        <div style="font-weight:700;color:var(--brown);margin-bottom:2px">💡 เคล็ดลับ</div>
        <ul style="margin:0 0 10px;padding-left:20px;font-size:14px;line-height:1.65">${feed.tips.map(t => '<li>' + t + '</li>').join('')}</ul>
        <div style="font-weight:700;color:#C45a61;margin-bottom:2px">🚫 ควรเลี่ยง</div>
        <ul style="margin:0;padding-left:20px;font-size:14px;line-height:1.65;color:#7a5a52">${feed.avoid.map(av => '<li>' + av + '</li>').join('')}</ul>
        <div class="disclaimer" style="margin-top:10px">คำแนะนำทั่วไป ปรึกษาแพทย์/คลินิกสุขภาพเด็กสำหรับลูกแต่ละคน</div>
      </div>` : '';
    // ตัวจับเวลา & นัดหมาย
    const timer = S.getTimer();
    const timerOn = timer && timer.childId === child.id;
    const appts = MB.upcomingAppts ? MB.upcomingAppts(3) : [];
    const apptRow = ap => {
      const d = U.daysBetween(S.todayISO(), ap.date);
      const lbl = d < 0 ? 'เลยกำหนด' : d === 0 ? 'วันนี้' : d === 1 ? 'พรุ่งนี้' : 'อีก ' + d + ' วัน';
      const cls = d <= 1 ? 'due' : d <= 7 ? 'soon' : 'upcoming';
      const em = ap.kind === 'vaccine' ? '💉' : ap.kind === 'anc' ? '🤰' : ap.kind === 'checkup' ? '🩺' : '🔔';
      return `<div class="list-item" style="border-bottom:none;padding:8px 0"><div class="ic">${em}</div>
        <div class="body"><div class="t">${U.esc(ap.title)}</div><div class="s">${U.fmtDateTH(ap.date)}${ap.time ? ' · ' + ap.time + ' น.' : ''}</div></div>
        <span class="badge ${cls}">${lbl}</span></div>`;
    };

    // การ์ดสรุปภาพรวม + แจ้งเตือน
    const vlistAll = MB.vaxList ? MB.vaxList(child) : [];
    const vaxDone = vlistAll.filter(x => x.group === 'พื้นฐาน' && x.done).length;
    const vaxTotal = vlistAll.filter(x => x.group === 'พื้นฐาน').length;
    const notifs = MB.buildNotifications();
    const summaryHtml = `
      <div class="summary-card">
        <div class="su" data-go="log"><div class="v">${logs.length}</div><div class="l">📝 บันทึก</div></div>
        <div class="su" data-go="vax"><div class="v">${vaxDone}<small>/${vaxTotal}</small></div><div class="l">💉 วัคซีน</div></div>
        <div class="su" data-go="growth"><div class="v">${meas.length}</div><div class="l">📈 การวัด</div></div>
      </div>`;
    const notifHtml = notifs.length ? `
      <div class="section-title">🔔 การแจ้งเตือน <span class="more" data-notif>ดูทั้งหมด</span></div>
      <div class="card" style="padding:4px 14px">
        ${notifs.slice(0, 3).map((n, i) => `<div class="notif-item" data-ni="${i}"><div class="ic ${n.cls || ''}">${n.em}</div><div class="body"><div class="t">${U.esc(n.title)}</div>${n.sub ? `<div class="s">${U.esc(n.sub)}</div>` : ''}</div>${n.go ? '<div class="chev">›</div>' : ''}</div>`).join('')}
        ${notifs.length > 3 ? `<div class="muted center" style="font-size:12.5px;padding:9px 0;cursor:pointer" data-notif>+ อีก ${notifs.length - 3} รายการ</div>` : ''}
      </div>` : '';

    root.innerHTML = `
      <div class="hero">
        <div class="emoji">${child.emoji || '👶'}</div>
        <div style="flex:1">
          <h2>${U.esc(child.name)}</h2>
          <p>อายุ ${a.label} · ${child.sex === 'M' ? 'ชาย 👦' : 'หญิง 👧'}</p>
          ${lastFeed ? `<p style="margin-top:2px">🍼 ให้นมล่าสุด ${U.relTime(lastFeed.ts)}</p>` : ''}
        </div>
      </div>

      ${summaryHtml}
      ${notifHtml}

      ${timerOn ? `<div class="card tint" data-go="log" style="display:flex;align-items:center;gap:12px;cursor:pointer">
        <div style="font-size:26px">⏱️</div>
        <div style="flex:1"><b>กำลังจับเวลา${timer.type === 'sleep' ? 'การนอน 😴' : 'ให้นม 🍼'}</b><div class="muted" style="font-size:12.5px">แตะเพื่อหยุดและบันทึก</div></div>
        <div style="color:var(--pink-deep);font-size:20px">›</div></div>` : ''}

      <div class="section-title">⚡ บันทึกด่วน</div>
      <div class="quick-grid">
        <button class="quick" data-q="feed"><span class="ic">🍼</span><span class="lb">ให้นม</span></button>
        <button class="quick" data-q="sleep"><span class="ic">😴</span><span class="lb">การนอน</span></button>
        <button class="quick" data-q="diaper"><span class="ic">🧷</span><span class="lb">ผ้าอ้อม</span></button>
        <button class="quick" data-q="note"><span class="ic">📝</span><span class="lb">บันทึก</span></button>
      </div>

      <div class="section-title">📊 วันนี้ <span class="more" data-go="log">ดูประวัติ ›</span></div>
      <div class="stat-row">
        <div class="stat" data-go="log" style="cursor:pointer"><div class="v">${feeds}</div><div class="l">🍼 มื้อนม</div></div>
        <div class="stat" data-go="log" style="cursor:pointer"><div class="v">${sleepH || '0'}</div><div class="l">😴 ชม.นอน</div></div>
        <div class="stat" data-go="log" style="cursor:pointer"><div class="v">${diapers}</div><div class="l">🧷 ผ้าอ้อม</div></div>
      </div>

      ${tipCardHtml(stage)}

      ${vx ? `<div class="section-title">💉 วัคซีนถัดไป <span class="more" data-go="vax">ดูทั้งหมด</span></div>
      <div class="card" data-go="vax">
        <div class="list-item" style="border:none;padding:2px 0">
          <div class="ic">💉</div>
          <div class="body"><div class="t">${U.esc(vx.name)}</div><div class="s">กำหนด ${U.fmtDateTH(vx.due)} · ช่วงอายุ ${vx.ageLabel}</div></div>
          <span class="badge ${vx.cls}">${vx.text}</span>
        </div>
      </div>` : ''}

      <div class="section-title">📈 การเจริญเติบโต <span class="more" data-go="growth">ดูกราฟ</span></div>
      <div class="card" data-go="growth">
        ${lastM ? `<div style="display:flex;gap:16px;text-align:center">
          <div style="flex:1"><div style="font-size:22px;font-weight:800;color:var(--brown)">${lastM.weight || '-'}</div><div class="muted" style="font-size:12px">น้ำหนัก (กก.)</div></div>
          <div style="flex:1"><div style="font-size:22px;font-weight:800;color:var(--brown)">${lastM.height || '-'}</div><div class="muted" style="font-size:12px">ส่วนสูง (ซม.)</div></div>
          <div style="flex:1"><div style="font-size:13px;color:var(--muted);margin-top:6px">วัดเมื่อ<br/>${U.fmtDateTH(lastM.date)}</div></div>
        </div>` : '<p class="muted center" style="margin:6px 0">ยังไม่มีข้อมูล แตะเพื่อเริ่มบันทึกน้ำหนัก/ส่วนสูง</p>'}
      </div>

      ${msInfo ? `<div class="section-title">🌱 พัฒนาการช่วงนี้ <span class="more" data-go="develop">ดูทั้งหมด</span></div>
      <div class="card" data-go="develop">
        <div style="display:flex;justify-content:space-between;align-items:center"><b>ทำได้แล้ว ${msInfo.done}/${msInfo.total} ข้อ</b><span class="muted" style="font-size:12px">ช่วง ${msInfo.bandLabel}</span></div>
        <div class="progress"><span style="width:${msInfo.total ? Math.round(msInfo.done / msInfo.total * 100) : 0}%"></span></div>
      </div>` : ''}

      ${feedHtml}

      <div class="section-title">🔔 นัดหมาย <span class="more" data-go="appt">${appts.length ? 'ดูทั้งหมด' : 'เพิ่มนัด'}</span></div>
      <div class="card" data-go="appt">
        ${appts.length ? appts.map(apptRow).join('') : '<p class="muted center" style="margin:4px 0;font-size:13.5px">ยังไม่มีนัดหมาย แตะเพื่อเพิ่มนัดฝากครรภ์/วัคซีน/หมอเด็ก</p>'}
      </div>

      <div class="section-title">📚 ความรู้สำหรับคุณ <span class="more" data-go="develop">เพิ่มเติม</span></div>
      <div class="scroll-x">
        ${arts.map(x => `<div class="mini-card" data-art="${x.id}"><div class="em">${x.em}</div><div class="t">${U.esc(x.title)}</div><div class="s">${MB.CATS[x.cat] ? MB.CATS[x.cat].label : ''}</div></div>`).join('')}
      </div>
      <div class="card" data-go="diary" style="display:flex;align-items:center;gap:12px;cursor:pointer;margin-top:12px">
        <div style="font-size:30px">📸</div>
        <div style="flex:1"><div style="font-weight:700">ไดอารี่ความทรงจำ</div><div class="muted" style="font-size:12.5px">เก็บภาพช่วงเวลาน่ารักของลูกไว้ย้อนดู</div></div>
        <div style="color:var(--pink-deep);font-size:20px">›</div>
      </div>
      <div style="height:8px"></div>
    `;

    root.querySelectorAll('[data-q]').forEach(b => b.onclick = () => MB.views.quickLog(b.dataset.q));
    root.querySelectorAll('[data-go]').forEach(n => n.onclick = () => MB.go(n.dataset.go));
    root.querySelectorAll('[data-art]').forEach(n => n.onclick = () => MB.openArticle(n.dataset.art));
    root.querySelectorAll('[data-ni]').forEach(n => n.onclick = () => { const it = notifs[+n.dataset.ni]; if (it && it.go) MB.go(it.go, it.params); });
    root.querySelectorAll('[data-notif]').forEach(n => n.onclick = () => MB.openNotifications());
    wireTip(root, stage);
  };
})();
