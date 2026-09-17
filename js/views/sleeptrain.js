/* หน้า: วิธีฝึกลูกนอนยาว */
window.MB = window.MB || {}; MB.views = MB.views || {};
(function () {
  const S = MB.store, U = MB.util;
  const TINT = { rose: '#CE6E8B', lilac: '#8B72C4', sky: '#5E8AB6', peach: '#CB7F49', mint: '#4CA085' };

  MB.views.sleeptrain = function (root, params) {
    const child = S.activeChild();
    const months = child ? U.ageInfo(child.birthDate).totalMonths : null;
    let cur = null;
    MB.SLEEP_STAGES.forEach(s => { if (months != null && months >= s.from) cur = s; });
    const open = (params && params.open) || (cur && cur.key) || 's0';
    const need = MB.SLEEP_NEED(months);

    const stages = MB.SLEEP_STAGES.map(s => {
      const isCur = cur && cur.key === s.key;
      const isOpen = open === s.key;
      const ink = TINT[s.tint] || TINT.rose;
      return `<div class="card emo-card ${isOpen ? 'open' : ''}" data-st="${s.key}"
                   style="${isCur ? 'border-color:var(--pink);' : ''}padding:0;overflow:hidden">
        <div class="emo-head">
          <div class="ic" style="background:var(--${s.tint}-bg)">${s.em}</div>
          <div class="body">
            <div class="t">${s.label} ${isCur ? '<span class="badge soon" style="margin-left:4px">ช่วงนี้</span>' : ''}</div>
            <div class="s">${U.esc(s.tag)}</div>
          </div>
          <div class="chev">${isOpen ? '−' : '+'}</div>
        </div>
        <div class="emo-body" style="${isOpen ? '' : 'display:none'}">
          <p class="emo-feel">${s.body}</p>
          <div class="emo-sec"><div class="h" style="color:${ink}">✅ ทำแบบนี้</div>
            <ul>${s.tips.map(t => `<li>${t}</li>`).join('')}</ul></div>
        </div>
      </div>`;
    }).join('');

    const methods = MB.SLEEP_METHODS.map(m => `<div class="card st-method">
        <div class="h"><span class="em">${m.em}</span>
          <div><div class="n">${U.esc(m.name)}</div><div class="sub">${U.esc(m.sub)}</div></div></div>
        <p class="how">${U.esc(m.how)}</p>
        <div class="pro">👍 ${U.esc(m.good)}</div>
        <div class="con">👎 ${U.esc(m.bad)}</div>
      </div>`).join('');

    root.innerHTML = `
      <div class="hero" style="padding:14px 16px"><div class="emoji">😴</div>
        <div style="flex:1"><h2 style="font-size:18px">วิธีฝึกลูกนอนยาว</h2>
        <p>แนวทางตามวัย + วิธีฝึกที่ใช้ได้จริง</p></div></div>

      <div class="card" style="background:var(--lilac-bg);border-color:#E3D9F8">
        <b style="font-size:14px;color:#6E58A8">💤 วัยนี้ควรนอนวันละเท่าไหร่</b>
        <p style="margin:6px 0 0;font-size:13.5px;line-height:1.7">${need.label} — รวมกลางวัน+กลางคืน ประมาณ <b>${need.text}</b> · งีบ ${need.naps}</p>
        <button class="btn ghost sm" data-go="sleep" style="margin-top:10px">📊 ดูสรุปการนอนของลูก</button>
      </div>

      <div class="card" style="background:#FFF3E6;border-color:#F3DCBD">
        <b style="color:#B9802F">🛡️ กฎความปลอดภัยการนอน (สำคัญกว่าทุกเทคนิค)</b>
        <ul class="mk-tips" style="margin-top:8px">${MB.SLEEP_SAFETY.map(s => `<li>${s}</li>`).join('')}</ul>
      </div>

      <div class="section-title">📅 แนวทางตามวัย</div>
      ${stages}

      <div class="section-title">🧭 ก่อนเริ่มฝึก เช็กก่อน</div>
      <div class="card"><ul class="mk-tips">${MB.SLEEP_BEFORE.map(s => `<li>${s}</li>`).join('')}</ul></div>

      <div class="section-title">🛠️ เลือกวิธีที่เหมาะกับบ้านเรา</div>
      ${methods}

      <div class="disclaimer">การฝึกนอนไม่ใช่สิ่งจำเป็นสำหรับทุกครอบครัว และไม่มีวิธีไหนถูกที่สุด เลือกวิธีที่พ่อแม่ทำได้ต่อเนื่องจริงจะได้ผลดีที่สุด ข้อมูลนี้เป็นแนวทางทั่วไป ไม่ใช่คำแนะนำทางการแพทย์เฉพาะบุคคล — ถ้าลูกกรน หายใจเสียงดังตอนหลับ น้ำหนักขึ้นช้า หรือง่วงผิดปกติตอนกลางวัน ควรปรึกษาแพทย์</div>
      ${MB.citeBlock('sleep')}
    `;

    root.querySelectorAll('[data-go]').forEach(b => b.onclick = () => MB.go(b.dataset.go));
    root.querySelectorAll('[data-st] .emo-head').forEach(h => h.onclick = () => {
      const card = h.parentNode, body = card.querySelector('.emo-body');
      const shown = body.style.display !== 'none';
      body.style.display = shown ? 'none' : '';
      card.classList.toggle('open', !shown);
      h.querySelector('.chev').textContent = shown ? '+' : '−';
    });
  };
})();
