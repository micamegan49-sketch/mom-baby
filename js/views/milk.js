/* หน้า: ตารางรอบป้อนนม & ปั๊มนม + ตั้งเวลาแจ้งเตือน + คำนวณปริมาณนม */
window.MB = window.MB || {}; MB.views = MB.views || {};
(function () {
  const S = MB.store, U = MB.util;

  const KINDS = {
    feed: { label: 'ป้อนนม', em: '🍼', tint: 'rose',  ink: '#CE6E8B' },
    pump: { label: 'ปั๊มนม', em: '🫗', tint: 'lilac', ink: '#8B72C4' }
  };

  function nowMin() { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); }
  function toMin(hhmm) { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; }
  function fromMin(v) {
    v = ((v % 1440) + 1440) % 1440;
    return String(Math.floor(v / 60)).padStart(2, '0') + ':' + String(v % 60).padStart(2, '0');
  }

  function nextRound(times) {
    if (!times.length) return null;
    const n = nowMin();
    const sorted = times.map(toMin).sort((a, b) => a - b);
    let t = sorted.find(x => x > n), diff;
    if (t == null) { t = sorted[0]; diff = 1440 - n + t; } else diff = t - n;
    return { time: fromMin(t), inMin: diff };
  }

  function fmtIn(min) {
    if (min < 60) return 'อีก ' + min + ' นาที';
    const h = Math.floor(min / 60), m = min % 60;
    return 'อีก ' + h + ' ชม.' + (m ? ' ' + m + ' นาที' : '');
  }

  /* การ์ดตั้งค่า 1 ชุด (ป้อนนม หรือ ปั๊มนม) */
  function planCard(kind, plan) {
    const K = KINDS[kind];
    const times = MB.milkPlanTimes(plan);
    const nx = plan.on ? nextRound(times) : null;
    const gap = plan.every % 1 === 0 ? plan.every : plan.every.toFixed(1);
    const custom = plan.mode === 'custom';

    const chips = times.map(t => {
      const isNext = nx && t === nx.time;
      const past = toMin(t) < nowMin();
      return `<span class="mk-time${isNext ? ' next' : ''}${past && !isNext ? ' past' : ''}">${t}</span>`;
    }).join('');

    const editor = custom
      ? `<div class="mk-list">
          ${times.length ? times.map((t, i) => `
            <div class="mk-row">
              <span class="n">${i + 1}</span>
              <input type="time" data-mktime="${kind}" data-i="${i}" value="${t}" />
              <button class="del" data-mkdel="${kind}" data-i="${i}" aria-label="ลบรอบนี้">✕</button>
            </div>`).join('')
            : '<p class="muted center" style="font-size:13px;padding:8px 0;margin:0">ยังไม่มีรอบ — กดปุ่มด้านล่างเพื่อเพิ่ม</p>'}
        </div>
        <div class="mk-actions">
          <button class="btn ghost sm" data-mkadd="${kind}">+ เพิ่มรอบ</button>
          <button class="btn ghost sm" data-mkfill="${kind}">↺ เติมจากทุก ${gap} ชม.</button>
        </div>`
      : `<div class="mk-fields">
          <div class="field"><label>เริ่มรอบแรก</label>
            <input type="time" data-mkstart="${kind}" value="${plan.start}" /></div>
          <div class="field"><label>ห่างทุก (ชม.)</label>
            <input type="number" step="0.5" min="1" max="8" data-mkevery="${kind}" value="${plan.every}" /></div>
          <div class="field"><label>กี่รอบ/วัน</label>
            <input type="number" step="1" min="1" max="14" data-mkcount="${kind}" value="${plan.count}" /></div>
        </div>
        <button class="btn ghost sm" data-mkauto="${kind}" style="margin-top:10px">✨ ใช้ค่าแนะนำตามวัยลูก</button>`;

    return `<div class="card" style="${plan.on ? 'border-color:var(--pink);' : ''}">
      <div class="mk-head">
        <div class="ic" style="background:var(--${K.tint}-bg)">${K.em}</div>
        <div class="body">
          <div class="t">รอบ${K.label}</div>
          <div class="s">${plan.on
            ? (custom ? 'กำหนดเอง · ' + times.length + ' รอบ/วัน' : 'ทุก ' + gap + ' ชม. · ' + times.length + ' รอบ/วัน')
            : 'ยังไม่ได้เปิดใช้'}</div>
        </div>
        <label class="switch"><input type="checkbox" data-mkon="${kind}" ${plan.on ? 'checked' : ''}><span class="slider"></span></label>
      </div>

      ${plan.on ? `
        ${nx ? `<div class="mk-next" style="background:var(--${K.tint}-bg);color:${K.ink}">
            <b>รอบถัดไป ${nx.time} น.</b><span>${fmtIn(nx.inMin)}</span>
          </div>` : ''}

        <div class="chips" style="margin:12px 0 0">
          <div class="chip ${!custom ? 'active' : ''}" data-mkmode="${kind}" data-v="auto">⏱️ ทุก ๆ กี่ชั่วโมง</div>
          <div class="chip ${custom ? 'active' : ''}" data-mkmode="${kind}" data-v="custom">✏️ กำหนดเวลาเอง</div>
        </div>

        ${editor}
        <div class="mk-times">${chips}</div>
      ` : ''}
    </div>`;
  }

  /* ---------- คำนวณปริมาณนมจากน้ำหนัก ---------- */
  function intakeCard(child, months, plan) {
    const meas = child ? S.measurements(child.id) : [];
    const last = meas.length ? meas[meas.length - 1] : null;
    const kg = last && last.weight ? Number(last.weight) : null;

    if (!child) {
      return `<div class="card"><b style="font-size:14.5px">🍼 ลูกควรกินนมวันละเท่าไหร่</b>
        <p class="muted" style="margin:6px 0 0;font-size:13px">เพิ่มข้อมูลลูกและบันทึกน้ำหนักก่อน แล้วระบบจะคำนวณให้อัตโนมัติ</p></div>`;
    }
    if (!kg) {
      return `<div class="card"><b style="font-size:14.5px">🍼 ลูกควรกินนมวันละเท่าไหร่</b>
        <p class="muted" style="margin:6px 0 10px;font-size:13px">ยังไม่มีน้ำหนักล่าสุดของ ${U.esc(child.name)} — บันทึกน้ำหนักก่อน แล้วระบบจะคำนวณปริมาณนมให้</p>
        <button class="btn ghost" data-go="growth">⚖️ ไปบันทึกน้ำหนัก</button></div>`;
    }
    if (months >= 12) {
      return `<div class="card"><b style="font-size:14.5px">🥛 นมสำหรับลูก 1 ขวบขึ้นไป</b>
        <p style="margin:8px 0 0;font-size:13.5px;line-height:1.7">วัยนี้ <b>อาหาร 3 มื้อเป็นหลัก</b> นมเป็นอาหารเสริม แนะนำราว
        <b style="color:var(--pink-deep)">350–500 มล./วัน</b> (ประมาณ 2–3 แก้ว) ไม่ควรเกิน 600 มล./วัน
        เพราะจะอิ่มจนกินอาหารได้น้อยและเสี่ยงขาดธาตุเหล็ก</p>
        <p class="muted" style="margin:8px 0 0;font-size:12.5px">น้ำหนักล่าสุด ${kg} กก. · วัดเมื่อ ${U.fmtDateTH(last.date)}</p></div>`;
    }

    // 0–6 เดือน ~150 มล./กก./วัน (ช่วง 120–180) · 6–12 เดือน ~120 มล./กก./วัน เพราะเริ่มอาหารตามวัย
    const perKg = months < 6 ? 150 : 120;
    const lo = Math.round(kg * (months < 6 ? 120 : 100) / 10) * 10;
    const hi = Math.round(kg * (months < 6 ? 180 : 140) / 10) * 10;
    const perDay = Math.round(kg * perKg / 10) * 10;
    const feedTimes = MB.milkPlanTimes(plan.feed);
    const rounds = (plan.feed.on && feedTimes.length) ? feedTimes.length : Math.max(1, Math.round(24 / MB.feedPlanFor(months).every));
    const perFeed = Math.round(perDay / rounds / 5) * 5;

    return `<div class="card">
      <b style="font-size:14.5px">🍼 ลูกควรกินนมวันละเท่าไหร่</b>
      <p class="muted" style="margin:4px 0 12px;font-size:12.5px">คำนวณจากน้ำหนักล่าสุด <b>${kg} กก.</b> (วัดเมื่อ ${U.fmtDateTH(last.date)})${last.height ? ' · สูง ' + last.height + ' ซม.' : ''}</p>
      <div class="mk-calc">
        <div class="c"><div class="v">${perDay.toLocaleString()}</div><div class="l">มล./วัน</div></div>
        <div class="c"><div class="v">${perFeed}</div><div class="l">มล./มื้อ</div></div>
        <div class="c"><div class="v">${rounds}</div><div class="l">มื้อ/วัน</div></div>
      </div>
      <p style="margin:12px 0 0;font-size:13px;line-height:1.7">
        เกณฑ์ที่ใช้: <b>${perKg} มล. ต่อน้ำหนักตัว 1 กก. ต่อวัน</b> (ช่วงปกติ ${lo}–${hi} มล./วัน)
        ${months >= 6 ? '<br/>วัยนี้เริ่มอาหารตามวัยแล้ว ปริมาณนมจึงลดลงจากช่วง 0–6 เดือน' : ''}
      </p>
      <div class="mk-note">🤱 <b>ถ้ากินนมแม่จากเต้า ไม่ต้องนับมิลลิลิตร</b> — ให้ดูที่ลูกดูดอิ่ม ปัสสาวะวันละ 6 ครั้งขึ้นไป และน้ำหนักขึ้นตามเกณฑ์ ตัวเลขนี้ใช้กับนมผงหรือนมแม่ที่ปั๊มใส่ขวดเป็นหลัก</div>
    </div>`;
  }

  MB.views.milk = function (root) {
    const child = S.activeChild();
    const months = child ? U.ageInfo(child.birthDate).totalMonths : null;
    const mp = S.milkPlan();
    const fp = MB.feedPlanFor(months);
    const pp = MB.pumpPlanFor(months);

    const guide = `<div class="card" style="background:var(--cream-2);border-color:var(--line)">
        <b style="font-size:14.5px">📋 รอบที่แนะนำ${child ? 'สำหรับ ' + U.esc(child.name) : 'ตามวัย'}</b>
        ${child ? `<p class="muted" style="margin:4px 0 10px;font-size:12.5px">${U.ageInfo(child.birthDate).label}</p>` : '<p class="muted" style="margin:4px 0 10px;font-size:12.5px">ยังไม่มีข้อมูลลูก — แสดงค่าเริ่มต้นของทารกแรกเกิด</p>'}
        <div class="mk-rec">
          <div class="r"><span class="em">${fp.em}</span>
            <div><b>ป้อนนม · ${fp.label}</b><div class="s">ทุก ~${fp.every} ชม. · ${fp.perDay}</div>
            <div class="n">${U.esc(fp.note)}</div></div></div>
          <div class="r"><span class="em">${pp.em}</span>
            <div><b>ปั๊มนม · ${pp.label}</b><div class="s">ทุก ~${pp.every} ชม. · ${pp.perDay}</div>
            <div class="n">${U.esc(pp.note)}</div></div></div>
        </div>
      </div>`;

    const notifOn = MB.notify && MB.notify.isEnabled && MB.notify.isEnabled();
    const notifWarn = (mp.feed.on || mp.pump.on) && !notifOn
      ? `<div class="card" style="background:#FFF3E6;border-color:#F3DCBD">
           <b style="color:#B9802F">🔕 การแจ้งเตือนยังปิดอยู่</b>
           <p style="margin:6px 0 10px;font-size:13px">ตารางจะแสดงในแอปได้ แต่จะไม่มีเสียงเตือนขึ้นมาเอง</p>
           <button class="btn" id="mk-enable-notif">เปิดการแจ้งเตือน</button>
         </div>` : '';

    root.innerHTML = `
      <div class="hero" style="padding:14px 16px"><div class="emoji">⏰</div>
        <div style="flex:1"><h2 style="font-size:18px">ตารางรอบนม</h2>
        <p>ตั้งรอบป้อนนม–ปั๊มนม แล้วให้แอปเตือนตามเวลา</p></div></div>
      ${guide}
      ${intakeCard(child, months, mp)}
      ${notifWarn}
      ${planCard('feed', mp.feed)}
      ${planCard('pump', mp.pump)}
      <div class="section-title">💡 เคล็ดลับ</div>
      <div class="card"><ul class="mk-tips">${MB.MILK_TIPS.map(t => `<li>${U.esc(t)}</li>`).join('')}</ul></div>
      <div class="disclaimer">ทารกส่วนใหญ่ควรได้กินตามความต้องการ (feed on demand) ตารางและตัวเลขปริมาณนมเป็นค่าประมาณเพื่อช่วยวางแผนเท่านั้น ไม่ใช่กฎตายตัวหรือคำแนะนำทางการแพทย์เฉพาะบุคคล หากลูกน้ำหนักขึ้นช้า ปัสสาวะน้อย หรือมีปัญหาน้ำนม ควรปรึกษาแพทย์หรือคลินิกนมแม่</div>
      ${MB.citeBlock('feeding')}
    `;

    function save(kind, patch) {
      S.setMilkPlan(kind, patch);
      MB.notify && MB.notify.rescheduleSoon && MB.notify.rescheduleSoon();
      MB.rerender();
    }
    function setTimes(kind, arr) {
      const seen = {};
      save(kind, { times: arr.filter(t => /^\d{2}:\d{2}$/.test(t) && !seen[t] && (seen[t] = 1)).sort() });
    }

    root.querySelectorAll('[data-mkon]').forEach(sw => sw.onchange = () => save(sw.dataset.mkon, { on: sw.checked }));

    // สลับโหมด — ครั้งแรกที่เข้าโหมดกำหนดเอง เติมเวลาจากรอบอัตโนมัติไว้ให้แก้ต่อ
    root.querySelectorAll('[data-mkmode]').forEach(c => c.onclick = () => {
      const kind = c.dataset.mkmode, v = c.dataset.v, p = mp[kind];
      if (p.mode === v) return;
      const patch = { mode: v };
      if (v === 'custom' && !(p.times || []).length) patch.times = MB.milkTimes(p.start, p.every, p.count);
      save(kind, patch);
    });

    root.querySelectorAll('[data-mktime]').forEach(i => i.onchange = () => {
      const kind = i.dataset.mktime, arr = MB.milkPlanTimes(mp[kind]).slice();
      arr[+i.dataset.i] = i.value || '06:00';
      setTimes(kind, arr);
    });
    root.querySelectorAll('[data-mkdel]').forEach(b => b.onclick = () => {
      const kind = b.dataset.mkdel, arr = MB.milkPlanTimes(mp[kind]).slice();
      arr.splice(+b.dataset.i, 1);
      setTimes(kind, arr);
    });
    root.querySelectorAll('[data-mkadd]').forEach(b => b.onclick = () => {
      const kind = b.dataset.mkadd, arr = MB.milkPlanTimes(mp[kind]).slice();
      const base = arr.length ? toMin(arr[arr.length - 1]) + Math.round(mp[kind].every * 60) : toMin(mp[kind].start);
      arr.push(fromMin(base));
      setTimes(kind, arr);
    });
    root.querySelectorAll('[data-mkfill]').forEach(b => b.onclick = () => {
      const kind = b.dataset.mkfill, p = mp[kind];
      setTimes(kind, MB.milkTimes(p.start, p.every, p.count));
      MB.toast('เติมรอบจากทุก ' + p.every + ' ชม. แล้ว ปรับต่อได้เลย ✏️');
    });

    root.querySelectorAll('[data-mkstart]').forEach(i => i.onchange = () => save(i.dataset.mkstart, { start: i.value || '06:00' }));
    root.querySelectorAll('[data-mkevery]').forEach(i => i.onchange = () =>
      save(i.dataset.mkevery, { every: Math.min(8, Math.max(1, Number(i.value) || 3)) }));
    root.querySelectorAll('[data-mkcount]').forEach(i => i.onchange = () =>
      save(i.dataset.mkcount, { count: Math.min(14, Math.max(1, Math.round(Number(i.value) || 8))) }));
    root.querySelectorAll('[data-mkauto]').forEach(b => b.onclick = () => {
      const kind = b.dataset.mkauto, rec = kind === 'feed' ? fp : pp;
      save(kind, { every: rec.every, count: Math.min(14, Math.max(1, Math.round(24 / rec.every))) });
      MB.toast('ตั้งตามค่าแนะนำแล้ว ✨');
    });

    root.querySelectorAll('[data-go]').forEach(n => n.onclick = () => MB.go(n.dataset.go));
    const en = root.querySelector('#mk-enable-notif');
    if (en) en.onclick = async () => {
      en.disabled = true; en.textContent = 'กำลังเปิด…';
      try { await MB.notify.enable(); } catch (e) {}
      MB.rerender();
    };
  };
})();
