/* หน้า: การนอน — สรุปเวลานอน วัน/สัปดาห์/เดือน + ไทม์ไลน์การนอน */
window.MB = window.MB || {}; MB.views = MB.views || {};
(function () {
  const S = MB.store, U = MB.util;

  /* นอนกลางคืน = เริ่มหลัง 18:00 หรือก่อน 05:00 · นอกนั้นนับเป็นงีบกลางวัน */
  function isNight(ts) { const h = new Date(ts).getHours(); return h >= 18 || h < 5; }
  const hhmm = ts => { const d = new Date(ts); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
  function dur(min) {
    const h = Math.floor(min / 60), m = Math.round(min % 60);
    if (!h) return m + ' นาที';
    return h + ' ชม.' + (m ? ' ' + m + ' นาที' : '');
  }
  const sameDay = (ts, d) => new Date(ts).toDateString() === d.toDateString();

  function collect(child, days, endDate) {
    const logs = S.logs(child.id).filter(l => l.type === 'sleep' && l.minutes);
    const out = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(endDate); d.setDate(d.getDate() - i);
      const blocks = logs.filter(l => sameDay(l.ts, d)).sort((a, b) => a.ts - b.ts);
      const night = blocks.filter(b => isNight(b.ts)).reduce((s, b) => s + b.minutes, 0);
      const nap = blocks.filter(b => !isNight(b.ts)).reduce((s, b) => s + b.minutes, 0);
      out.push({ date: new Date(d), blocks, night, nap, total: night + nap });
    }
    return out;
  }

  MB.views.sleep = function (root, params) {
    const child = S.activeChild();
    if (!child) {
      root.innerHTML = `<div class="empty"><div class="em">😴</div><p>ยังไม่มีลูกในระบบ<br/>เพิ่มข้อมูลลูกเพื่อดูสรุปการนอน</p>
        <button class="btn" id="add">+ เพิ่มลูกน้อย</button></div>`;
      root.querySelector('#add').onclick = () => MB.views.editChild(null);
      return;
    }
    const tab = (params && params.tab) || 'day';
    const today = new Date();
    const TABS = [{ k: 'day', l: 'วัน' }, { k: 'week', l: 'สัปดาห์' }, { k: 'เดือน', l: 'เดือน' }];
    const seg = `<div class="sl-seg">
        ${[['day', 'วัน'], ['week', 'สัปดาห์'], ['month', 'เดือน']]
          .map(([k, l]) => `<button class="${tab === k ? 'active' : ''}" data-sltab="${k}">${l}</button>`).join('')}
      </div>`;

    const days = tab === 'day' ? 1 : (tab === 'week' ? 7 : 30);
    const rows = collect(child, days, today);
    const sum = rows.reduce((a, r) => ({ night: a.night + r.night, nap: a.nap + r.nap, total: a.total + r.total }), { night: 0, nap: 0, total: 0 });
    const withData = rows.filter(r => r.total > 0).length || 1;
    const avg = tab === 'day' ? sum : { night: sum.night / withData, nap: sum.nap / withData, total: sum.total / withData };

    const dateLine = tab === 'day'
      ? 'วันนี้ · ' + today.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
      : (tab === 'week' ? '7 วันล่าสุด' : '30 วันล่าสุด') + ' · เฉลี่ยต่อวัน';

    const hero = `<div class="sl-hero">
        <div class="art">${MB.babyHeroSVG ? MB.babyHeroSVG() : '🌙'}</div>
        <div class="tx">
          <div class="lb">${tab === 'day' ? 'รวมเวลานอนวันนี้' : 'เฉลี่ยต่อวัน'}</div>
          <div class="big">${avg.total ? dur(avg.total) : '—'}</div>
        </div>
      </div>`;

    const split = `<div class="sl-split">
        <div class="c night"><span class="em">🌙</span><div><div class="l">กลางคืน</div><div class="v">${avg.night ? dur(avg.night) : '—'}</div></div></div>
        <div class="c nap"><span class="em">☀️</span><div><div class="l">งีบกลางวัน</div><div class="v">${avg.nap ? dur(avg.nap) : '—'}</div></div></div>
      </div>`;

    let body;
    if (tab === 'day') {
      const blocks = rows[0].blocks;
      body = blocks.length
        ? `<div class="section-title">ไทม์ไลน์การนอน</div>
           <div class="card sl-tl">${blocks.map(b => {
             const night = isNight(b.ts);
             return `<div class="r" data-del="${b.id}">
               <span class="em ${night ? 'night' : 'nap'}">${night ? '🌙' : '☀️'}</span>
               <span class="t">${hhmm(b.ts)} – ${hhmm(b.ts + b.minutes * 60000)}</span>
               <span class="d">${night ? 'กลางคืน' : 'งีบ'} ${dur(b.minutes)}</span>
               <span class="x">✕</span>
             </div>`;
           }).join('')}</div>`
        : `<div class="card"><p class="muted center" style="margin:6px 0;font-size:13.5px">ยังไม่มีบันทึกการนอนวันนี้<br/>กดปุ่ม “เริ่มนอน” ในหน้าบันทึกได้เลย</p></div>`;
    } else {
      const dw = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
      const max = Math.max(1, ...rows.map(r => r.total));
      body = `<div class="section-title">รายวัน</div>
        <div class="card sl-days">${rows.slice().reverse().map(r => `
          <div class="r">
            <span class="d">${dw[r.date.getDay()]} ${r.date.getDate()}/${r.date.getMonth() + 1}</span>
            <span class="bar"><i class="n" style="width:${(r.night / max * 100).toFixed(1)}%"></i><i class="p" style="width:${(r.nap / max * 100).toFixed(1)}%"></i></span>
            <span class="v">${r.total ? dur(r.total) : '—'}</span>
          </div>`).join('')}
        </div>
        <div class="sl-legend"><span><i class="n"></i>กลางคืน</span><span><i class="p"></i>งีบกลางวัน</span></div>`;
    }

    const need = MB.SLEEP_NEED ? MB.SLEEP_NEED(U.ageInfo(child.birthDate).totalMonths) : null;
    const needCard = need ? `<div class="card" style="background:var(--lilac-bg);border-color:#E3D9F8">
        <b style="font-size:14px;color:#6E58A8">💤 วัยนี้ควรนอนวันละเท่าไหร่</b>
        <p style="margin:6px 0 0;font-size:13.5px;line-height:1.7;color:#4A332A">
          ${need.label} — รวมกลางวัน+กลางคืน ประมาณ <b>${need.text}</b>${need.naps ? ' · งีบกลางวันราว ' + need.naps : ''}</p>
        ${avg.total ? `<p style="margin:8px 0 0;font-size:13px;color:${avg.total / 60 >= need.min ? '#4CA085' : '#B9802F'}">
          ${avg.total / 60 >= need.min ? '✅ ตอนนี้นอนได้ตามเกณฑ์แล้ว' : '⚠️ ตอนนี้เฉลี่ย ' + (avg.total / 60).toFixed(1) + ' ชม. ยังน้อยกว่าเกณฑ์อยู่'}</p>` : ''}
      </div>` : '';

    root.innerHTML = `
      ${seg}
      <div class="sl-date">${dateLine}</div>
      ${hero}
      ${split}
      ${body}
      ${needCard}
      <button class="btn ghost" data-go="sleeptrain" style="margin-top:4px">😴 วิธีฝึกลูกนอนยาว ›</button>
      <div class="disclaimer">ตัวเลขคำนวณจากบันทึกการนอนในแอป ยิ่งบันทึกครบยิ่งแม่นขึ้น · เกณฑ์ชั่วโมงการนอนเป็นค่าอ้างอิงทั่วไป เด็กแต่ละคนต่างกันได้</div>
      ${MB.citeBlock ? MB.citeBlock('sleep') : ''}
    `;

    root.querySelectorAll('[data-sltab]').forEach(b => b.onclick = () => MB.go('sleep', { tab: b.dataset.sltab }));
    root.querySelectorAll('[data-go]').forEach(b => b.onclick = () => MB.go(b.dataset.go));
    root.querySelectorAll('.sl-tl .r').forEach(r => {
      const x = r.querySelector('.x');
      if (x) x.onclick = (e) => {
        e.stopPropagation();
        if (confirm('ลบบันทึกการนอนนี้?')) { S.removeLog(child.id, r.dataset.del); MB.rerender({ tab }); }
      };
    });
  };
})();
