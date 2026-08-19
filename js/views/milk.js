/* หน้า: ตารางรอบป้อนนม & ปั๊มนม + ตั้งเวลาแจ้งเตือน */
window.MB = window.MB || {}; MB.views = MB.views || {};
(function () {
  const S = MB.store, U = MB.util;

  const KINDS = {
    feed: { label: 'ป้อนนม', em: '🍼', tint: 'rose',  ink: '#CE6E8B' },
    pump: { label: 'ปั๊มนม', em: '🫗', tint: 'lilac', ink: '#8B72C4' }
  };

  function nowMin() { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); }
  function toMin(hhmm) { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; }

  /* หา "รอบถัดไป" จากรายการเวลา คืน {time, inMin} */
  function nextRound(times) {
    if (!times.length) return null;
    const n = nowMin();
    const sorted = times.map(toMin).sort((a, b) => a - b);
    let t = sorted.find(x => x > n);
    let diff;
    if (t == null) { t = sorted[0]; diff = 1440 - n + t; } else diff = t - n;
    return { time: String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0'), inMin: diff };
  }

  function fmtIn(min) {
    if (min < 60) return 'อีก ' + min + ' นาที';
    const h = Math.floor(min / 60), m = min % 60;
    return 'อีก ' + h + ' ชม.' + (m ? ' ' + m + ' นาที' : '');
  }

  /* การ์ดตั้งค่า 1 ชุด (ป้อนนม หรือ ปั๊มนม) */
  function planCard(kind, plan, months) {
    const K = KINDS[kind];
    const times = MB.milkTimes(plan.start, plan.every, plan.count);
    const nx = plan.on ? nextRound(times) : null;
    const gap = plan.every % 1 === 0 ? plan.every : plan.every.toFixed(1);

    const chips = times.map(t => {
      const isNext = nx && t === nx.time;
      const past = toMin(t) < nowMin();
      return `<span class="mk-time${isNext ? ' next' : ''}${past && !isNext ? ' past' : ''}">${t}</span>`;
    }).join('');

    return `<div class="card" style="${plan.on ? 'border-color:var(--pink);' : ''}">
      <div class="mk-head">
        <div class="ic" style="background:var(--${K.tint}-bg)">${K.em}</div>
        <div class="body">
          <div class="t">รอบ${K.label}</div>
          <div class="s">${plan.on ? 'ทุก ' + gap + ' ชม. · ' + plan.count + ' รอบ/วัน' : 'ยังไม่ได้เปิดใช้'}</div>
        </div>
        <label class="switch"><input type="checkbox" data-mkon="${kind}" ${plan.on ? 'checked' : ''}><span class="slider"></span></label>
      </div>

      ${plan.on ? `
        ${nx ? `<div class="mk-next" style="background:var(--${K.tint}-bg);color:${K.ink}">
            <b>รอบถัดไป ${nx.time} น.</b><span>${fmtIn(nx.inMin)}</span>
          </div>` : ''}

        <div class="mk-fields">
          <div class="field"><label>เริ่มรอบแรก</label>
            <input type="time" data-mkstart="${kind}" value="${plan.start}" /></div>
          <div class="field"><label>ห่างทุก (ชม.)</label>
            <input type="number" step="0.5" min="1" max="8" data-mkevery="${kind}" value="${plan.every}" /></div>
          <div class="field"><label>กี่รอบ/วัน</label>
            <input type="number" step="1" min="1" max="14" data-mkcount="${kind}" value="${plan.count}" /></div>
        </div>

        <div class="mk-times">${chips}</div>
        <button class="btn ghost sm" data-mkauto="${kind}" style="margin-top:10px">✨ ใช้ค่าแนะนำตามวัยลูก</button>
      ` : ''}
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
      ${notifWarn}
      ${planCard('feed', mp.feed, months)}
      ${planCard('pump', mp.pump, months)}
      <div class="section-title">💡 เคล็ดลับ</div>
      <div class="card"><ul class="mk-tips">${MB.MILK_TIPS.map(t => `<li>${U.esc(t)}</li>`).join('')}</ul></div>
      <div class="disclaimer">ทารกส่วนใหญ่ควรได้กินตามความต้องการ (feed on demand) ตารางนี้เป็นกรอบคร่าว ๆ เพื่อช่วยเตือนความจำ ไม่ใช่กฎตายตัวหรือคำแนะนำทางการแพทย์เฉพาะบุคคล หากลูกน้ำหนักขึ้นช้า ปัสสาวะน้อย หรือมีปัญหาน้ำนม ควรปรึกษาแพทย์หรือคลินิกนมแม่</div>
      ${MB.citeBlock('feeding')}
    `;

    function save(kind, patch) { S.setMilkPlan(kind, patch); MB.notify && MB.notify.rescheduleSoon && MB.notify.rescheduleSoon(); MB.rerender(); }

    root.querySelectorAll('[data-mkon]').forEach(sw => sw.onchange = () => save(sw.dataset.mkon, { on: sw.checked }));
    root.querySelectorAll('[data-mkstart]').forEach(i => i.onchange = () => save(i.dataset.mkstart, { start: i.value || '06:00' }));
    root.querySelectorAll('[data-mkevery]').forEach(i => i.onchange = () => {
      const v = Math.min(8, Math.max(1, Number(i.value) || 3));
      save(i.dataset.mkevery, { every: v });
    });
    root.querySelectorAll('[data-mkcount]').forEach(i => i.onchange = () => {
      const v = Math.min(14, Math.max(1, Math.round(Number(i.value) || 8)));
      save(i.dataset.mkcount, { count: v });
    });
    root.querySelectorAll('[data-mkauto]').forEach(b => b.onclick = () => {
      const kind = b.dataset.mkauto;
      const rec = kind === 'feed' ? fp : pp;
      const count = Math.min(14, Math.max(1, Math.round(24 / rec.every)));
      save(kind, { every: rec.every, count });
      MB.toast('ตั้งตามค่าแนะนำแล้ว ✨');
    });
    const en = root.querySelector('#mk-enable-notif');
    if (en) en.onclick = async () => {
      en.disabled = true; en.textContent = 'กำลังเปิด…';
      try { await MB.notify.enable(); } catch (e) {}
      MB.rerender();
    };
  };
})();
