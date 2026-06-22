/* หน้า: บันทึกประจำวัน */
window.MB = window.MB || {}; MB.views = MB.views || {};
(function () {
  const S = MB.store, U = MB.util;

  const TYPE = {
    feed:   { em: '🍼', label: 'ให้นม' },
    sleep:  { em: '😴', label: 'การนอน' },
    diaper: { em: '🧷', label: 'ผ้าอ้อม' },
    note:   { em: '📝', label: 'บันทึก' },
    health: { em: '🩺', label: 'สุขภาพ' }
  };

  function nowLocal() {
    const d = new Date(), z = n => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()) + 'T' + z(d.getHours()) + ':' + z(d.getMinutes());
  }
  function fmtDur(ms) { const s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }

  let timerInt = null;
  function timerLabel(t) {
    if (t.type === 'sleep') return '😴 กำลังนอน';
    return '🍼 ให้นม' + (t.side ? ' (' + t.side + ')' : '');
  }
  function timerCardHtml(child) {
    const t = S.getTimer();
    if (t && t.childId === child.id) {
      return `<div class="card tint" style="text-align:center">
        <div style="font-weight:700;color:var(--brown-dark)">${timerLabel(t)}</div>
        <div id="timer-elapsed" style="font-size:46px;font-weight:800;color:var(--pink-deep);line-height:1.1;margin:6px 0">0:00</div>
        <div class="btn-row"><button class="btn pink" id="timer-stop">■ หยุด & บันทึก</button><button class="btn ghost" id="timer-cancel">ยกเลิก</button></div>
      </div>`;
    }
    return `<div class="card flat" style="padding:12px">
      <div style="font-size:13px;font-weight:700;color:var(--brown-dark);margin-bottom:8px">⏱️ จับเวลาแบบเรียลไทม์</div>
      <div class="btn-row">
        <button class="btn ghost sm" data-start="feed:ซ้าย">🍼 นมซ้าย</button>
        <button class="btn ghost sm" data-start="feed:ขวา">🍼 นมขวา</button>
        <button class="btn ghost sm" data-start="sleep:">😴 เริ่มนอน</button>
      </div>
    </div>`;
  }
  function wireTimer(root, child) {
    if (timerInt) { clearInterval(timerInt); timerInt = null; }
    const t = S.getTimer();
    if (t && t.childId === child.id) {
      const tick = () => {
        const el = document.getElementById('timer-elapsed');
        if (!el) { clearInterval(timerInt); timerInt = null; return; }
        el.textContent = fmtDur(Date.now() - t.startTs);
      };
      tick(); timerInt = setInterval(tick, 1000);
      const stop = root.querySelector('#timer-stop'), cancel = root.querySelector('#timer-cancel');
      if (stop) stop.onclick = () => {
        const tt = S.stopTimer(); if (timerInt) { clearInterval(timerInt); timerInt = null; }
        const minutes = Math.max(1, Math.round((Date.now() - tt.startTs) / 60000));
        if (tt.type === 'sleep') S.addLog(child.id, { type: 'sleep', minutes, ts: tt.startTs });
        else S.addLog(child.id, { type: 'feed', subtype: 'นมแม่', side: tt.side || undefined, minutes, ts: tt.startTs });
        MB.toast('บันทึก ' + minutes + ' นาทีแล้ว ✓'); MB.render();
      };
      if (cancel) cancel.onclick = () => { S.cancelTimer(); if (timerInt) { clearInterval(timerInt); timerInt = null; } MB.toast('ยกเลิกแล้ว'); MB.render(); };
    } else {
      root.querySelectorAll('[data-start]').forEach(b => b.onclick = () => {
        const [type, side] = b.dataset.start.split(':');
        S.startTimer(child.id, type, side || null); MB.render();
      });
    }
  }

  function logTitle(l) {
    if (l.type === 'feed') return (l.subtype || 'ให้นม') + (l.amount ? ' · ' + l.amount + ' มล.' : '') + (l.minutes ? ' · ' + l.minutes + ' นาที' : '') + (l.side ? ' · ' + l.side : '');
    if (l.type === 'sleep') return 'นอน ' + (l.minutes ? Math.floor(l.minutes / 60) + ' ชม. ' + (l.minutes % 60) + ' นาที' : '');
    if (l.type === 'diaper') return 'ผ้าอ้อม · ' + (l.kind || '');
    if (l.type === 'health') return (l.subtype || 'สุขภาพ') + (l.value ? ' · ' + l.value : '');
    return l.text || 'บันทึก';
  }

  /* ---------- ฟอร์มเพิ่มบันทึก (sheet) ---------- */
  MB.views.quickLog = function (type) {
    const child = S.activeChild();
    if (!child) { MB.toast('เพิ่มข้อมูลลูกก่อนนะ'); return MB.views.editChild(null); }
    type = type || 'feed';
    let body = '';
    if (type === 'feed') body = `
      <div class="field"><label>ประเภท</label><div class="chips" data-grp="subtype">
        <div class="chip active" data-v="นมแม่">นมแม่</div><div class="chip" data-v="นมผง">นมผง</div><div class="chip" data-v="อาหาร">อาหาร</div></div></div>
      <div class="field"><label>ปริมาณ (มล. – ถ้ามี)</label><input id="f-amt" type="number" inputmode="numeric" placeholder="เช่น 90" /></div>
      <div class="field"><label>ข้างที่ดูดนม (นมแม่)</label><div class="chips" data-grp="side">
        <div class="chip" data-v="ซ้าย">ซ้าย</div><div class="chip" data-v="ขวา">ขวา</div><div class="chip" data-v="ทั้งสอง">ทั้งสอง</div></div></div>`;
    else if (type === 'sleep') body = `
      <div class="field"><label>นอนนานเท่าไร</label><div class="row">
        <div><input id="f-h" type="number" inputmode="numeric" placeholder="ชั่วโมง" /></div>
        <div><input id="f-m" type="number" inputmode="numeric" placeholder="นาที" /></div></div></div>`;
    else if (type === 'diaper') body = `
      <div class="field"><label>ลักษณะ</label><div class="chips" data-grp="kind">
        <div class="chip active" data-v="ฉี่">💧 ฉี่</div><div class="chip" data-v="อึ">💩 อึ</div><div class="chip" data-v="ทั้งสอง">ทั้งสอง</div></div></div>`;
    else if (type === 'health') body = `
      <div class="field"><label>ประเภท</label><div class="chips" data-grp="subtype">
        <div class="chip active" data-v="อุณหภูมิ">🌡️ ไข้/อุณหภูมิ</div><div class="chip" data-v="ยา">💊 ยา</div><div class="chip" data-v="อาการ">🤒 อาการ</div></div></div>
      <div class="field"><label>รายละเอียด/ค่า</label><input id="f-val" placeholder="เช่น 38.2°C หรือ พารา 2.5 มล." /></div>`;
    else body = '';

    MB.sheet({
      title: TYPE[type].em + ' ' + TYPE[type].label,
      html: `${body}
        <div class="field"><label>บันทึกเพิ่มเติม</label><input id="f-note" placeholder="โน้ตสั้น ๆ (ไม่บังคับ)" /></div>
        <div class="field"><label>เวลา</label><input id="f-time" type="datetime-local" value="${nowLocal()}" /></div>
        <button class="btn pink" id="f-go">บันทึก</button>`,
      onMount(rt) {
        rt.querySelectorAll('[data-grp]').forEach(grp => {
          grp.querySelectorAll('.chip').forEach(ch => ch.onclick = () => {
            grp.querySelectorAll('.chip').forEach(x => x.classList.remove('active'));
            ch.classList.add('active');
          });
        });
        rt.querySelector('#f-go').onclick = () => {
          const sel = g => { const n = rt.querySelector(`[data-grp="${g}"] .chip.active`); return n ? n.dataset.v : null; };
          const note = rt.querySelector('#f-note').value.trim();
          const ts = new Date(rt.querySelector('#f-time').value).getTime() || Date.now();
          const log = { type, ts, note: note || undefined };
          if (type === 'feed') { log.subtype = sel('subtype'); log.amount = parseFloat(rt.querySelector('#f-amt').value) || undefined; log.side = sel('side') || undefined; }
          else if (type === 'sleep') { log.minutes = (parseInt(rt.querySelector('#f-h').value) || 0) * 60 + (parseInt(rt.querySelector('#f-m').value) || 0); }
          else if (type === 'diaper') { log.kind = sel('kind'); }
          else if (type === 'health') { log.subtype = sel('subtype'); log.value = rt.querySelector('#f-val').value.trim() || undefined; }
          else if (type === 'note') { log.text = note; }
          if (type === 'note' && !note) return MB.toast('พิมพ์ข้อความก่อนนะ');
          S.addLog(child.id, log);
          MB.closeSheet(); MB.toast('บันทึกแล้ว ✓'); MB.render();
        };
      }
    });
  };

  /* ---------- หน้ารายการบันทึก ---------- */
  MB.views.log = function (root) {
    const child = S.activeChild();
    if (!child) {
      root.innerHTML = `<div class="empty"><div class="em">📝</div><p>ยังไม่มีลูกในระบบ<br/>เพิ่มข้อมูลลูกเพื่อเริ่มบันทึก</p><button class="btn" id="add">+ เพิ่มลูกน้อย</button></div>`;
      root.querySelector('#add').onclick = () => MB.views.editChild(null);
      return;
    }
    const logs = S.logs(child.id);
    const now = new Date();
    const isToday = ts => { const d = new Date(ts); return d.toDateString() === now.toDateString(); };
    const tFeeds = logs.filter(l => isToday(l.ts) && l.type === 'feed').length;
    const tDiaper = logs.filter(l => isToday(l.ts) && l.type === 'diaper').length;
    const tSleep = logs.filter(l => isToday(l.ts) && l.type === 'sleep').reduce((s, l) => s + (l.minutes || 0), 0);

    // จัดกลุ่มตามวัน
    const groups = {};
    logs.forEach(l => {
      const key = new Date(l.ts).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
      (groups[key] || (groups[key] = [])).push(l);
    });

    root.innerHTML = `
      ${timerCardHtml(child)}
      <div class="section-title">เพิ่มบันทึก</div>
      <div class="quick-grid">
        ${Object.keys(TYPE).map(t => `<button class="quick" data-q="${t}"><span class="ic">${TYPE[t].em}</span><span class="lb">${TYPE[t].label}</span></button>`).join('')}
        <button class="quick" data-q="" style="visibility:hidden"></button>
      </div>
      <div class="stat-row" style="margin-top:14px">
        <div class="stat"><div class="v">${tFeeds}</div><div class="l">🍼 มื้อนมวันนี้</div></div>
        <div class="stat"><div class="v">${tSleep ? (Math.round(tSleep / 6) / 10) : 0}</div><div class="l">😴 ชม.นอน</div></div>
        <div class="stat"><div class="v">${tDiaper}</div><div class="l">🧷 ผ้าอ้อม</div></div>
      </div>
      <div class="section-title">ประวัติ</div>
      ${logs.length ? Object.entries(groups).map(([day, items]) => `
        <div style="margin:4px 4px 6px;font-size:13px;font-weight:700;color:var(--muted)">${day}</div>
        <div class="card" style="padding:6px 14px">
          ${items.map(l => `<div class="list-item" data-del="${l.id}">
            <div class="ic">${TYPE[l.type] ? TYPE[l.type].em : '📝'}</div>
            <div class="body"><div class="t">${U.esc(logTitle(l))}</div>${l.note ? `<div class="s">${U.esc(l.note)}</div>` : ''}</div>
            <div class="meta">${U.fmtTime(l.ts)}<br/><span style="color:#D9737A;font-size:11px">ลบ</span></div>
          </div>`).join('')}
        </div>`).join('')
      : '<div class="empty"><div class="em">🍼</div><p>ยังไม่มีบันทึก เริ่มจากปุ่มด้านบนได้เลย</p></div>'}
    `;
    wireTimer(root, child);
    root.querySelectorAll('[data-q]').forEach(b => { if (b.dataset.q) b.onclick = () => MB.views.quickLog(b.dataset.q); });
    root.querySelectorAll('[data-del]').forEach(n => n.onclick = () => {
      if (confirm('ลบบันทึกนี้?')) { S.removeLog(child.id, n.dataset.del); MB.render(); }
    });
  };
})();
