/* หน้า: โหมดตั้งครรภ์ – ติดตามรายสัปดาห์ + เครื่องมือคนท้อง */
window.MB = window.MB || {}; MB.views = MB.views || {};
(function () {
  const S = MB.store, U = MB.util;

  /* วาดเบบี๋ในครรภ์แบบพารามิเตอร์ — ค่อย ๆ โต/เปลี่ยนท่า/ขึ้นแขนขา-ใบหน้า ตามอายุครรภ์ (สัปดาห์ + วัน)
     gw รับเป็นทศนิยมได้ (เช่น 24.43) จึงเปลี่ยนทีละนิดทุกวัน */
  MB.fetusSVG = function (gw) {
    const lerp = (a, b, k) => a + (b - a) * k;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    gw = clamp(gw, 4, 40);
    const t = (gw - 4) / 36;               // ความคืบหน้า 0..1 (ต่อเนื่องรายวัน)
    const ease = t * (2 - t);              // easeOutQuad
    const fat = clamp((gw - 28) / 12, 0, 1);
    const scale = lerp(0.50, 1.05, ease);
    const headR = lerp(26, 30, t);                  // หัวโตช้า
    const bRX = lerp(15, 35, t) + fat * 5;          // ตัวโตเร็ว + อ้วนช่วงท้าย
    const bRY = lerp(15, 33, t) + fat * 4;
    const rot = lerp(-12, 6, ease);                 // ท่าค่อย ๆ เปลี่ยน
    const limb = clamp((gw - 8) / 3.5, 0, 1);       // แขนขาเริ่มเห็นราวสัปดาห์ 8-11
    const face = clamp((gw - 9) / 2.5, 0, 1);       // ใบหน้าเริ่มชัดราวสัปดาห์ 9-11
    const body = '#a98a79', bodyD = '#97735f', cheek = '#cf8b86', line = '#5a463c';
    return `<svg viewBox="0 0 200 210" width="172" height="180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ลูกในครรภ์ราวสัปดาห์ที่ ${Math.floor(gw)}">
      <circle cx="100" cy="104" r="95" fill="#c9a89d" opacity="0.15"/>
      <circle cx="100" cy="104" r="71" fill="#c9a89d" opacity="0.15"/>
      <g transform="translate(100,110) rotate(${rot.toFixed(1)}) scale(${scale.toFixed(3)}) translate(-100,-110)">
        <ellipse cx="90" cy="128" rx="${bRX.toFixed(1)}" ry="${bRY.toFixed(1)}" fill="${body}"/>
        <g opacity="${limb.toFixed(2)}">
          <ellipse cx="96" cy="156" rx="13" ry="9" fill="${bodyD}"/>
          <ellipse cx="72" cy="150" rx="10" ry="8" fill="${bodyD}"/>
        </g>
        <circle cx="115" cy="90" r="${headR.toFixed(1)}" fill="${body}"/>
        <g opacity="${limb.toFixed(2)}"><ellipse cx="95" cy="116" rx="7" ry="14" fill="${bodyD}" transform="rotate(30 95 116)"/></g>
        <g opacity="${face.toFixed(2)}">
          <path d="M100 86 q5 5 10 0" fill="none" stroke="${line}" stroke-width="2.4" stroke-linecap="round"/>
          <circle cx="118" cy="96" r="4.6" fill="${cheek}" opacity="0.5"/>
          <path d="M104 99 q4 3.5 8 0.5" fill="none" stroke="${line}" stroke-width="1.9" stroke-linecap="round"/>
        </g>
      </g>
    </svg>`;
  };

  function bmiCat(bmi) {
    return MB.PREG_WEIGHT_GAIN.find(c => bmi < c.max) || MB.PREG_WEIGHT_GAIN[MB.PREG_WEIGHT_GAIN.length - 1];
  }

  MB.views.preg = function (root, params) {
    const preg = S.preg();

    /* ---------- ตั้งค่าครั้งแรก ---------- */
    if (!preg.active) {
      root.innerHTML = `
        <div class="hero"><div class="emoji">🤰</div><div><h2>เริ่มติดตามการตั้งครรภ์</h2><p>กรอกข้อมูลเพื่อคำนวณอายุครรภ์และกำหนดคลอด</p></div></div>
        <div class="card">
          <div class="field"><label>ชื่อเล่นที่อยากเรียก (ไม่บังคับ)</label><input id="p-name" placeholder="เช่น เบบี๋" /></div>
          <div class="field"><label>🩺 อายุครรภ์ตอนนี้ (ตามที่หมอ/อัลตราซาวด์บอก) <span style="color:var(--pink-deep);font-weight:700">— ตรงที่สุด</span></label>
            <div class="row">
              <div><input id="p-gw" type="number" inputmode="numeric" min="0" max="42" placeholder="สัปดาห์" /></div>
              <div><input id="p-gd" type="number" inputmode="numeric" min="0" max="6" placeholder="วัน (0–6)" /></div>
            </div>
            <div class="muted" style="font-size:11px;margin-top:3px">กรอกอายุครรภ์ ณ วันนี้ แล้วระบบคำนวณให้ตรงกับหมอ</div>
          </div>
          <p class="muted center" style="font-size:12px;margin:2px 0 8px">— หรือกรอกเป็นวันที่ —</p>
          <div class="field"><label>วันแรกของประจำเดือนครั้งสุดท้าย (LMP)</label><input id="p-lmp" type="date" max="${S.todayISO()}" /></div>
          <div class="field"><label>วันกำหนดคลอด / นัดผ่าคลอด (ถ้ามี)</label><input id="p-edd" type="date" /><div class="muted" style="font-size:11px;margin-top:3px">ใช้แสดงวันคลอดเท่านั้น ไม่ใช้คำนวณอายุครรภ์</div></div>
          <div class="divider"></div>
          <div class="field"><div class="row">
            <div><label>ส่วนสูง (ซม.)</label><input id="p-h" type="number" inputmode="decimal" placeholder="160" /></div>
            <div><label>น้ำหนักก่อนตั้งครรภ์ (กก.)</label><input id="p-w" type="number" inputmode="decimal" placeholder="52" /></div>
          </div></div>
          <button class="btn pink" id="p-save">เริ่มเลย 💕</button>
        </div>
        <div class="disclaimer">การคำนวณเป็นค่าประมาณ กำหนดคลอดจริงควรยึดผลอัลตราซาวด์และคำวินิจฉัยของแพทย์</div>
      `;
      root.querySelector('#p-save').onclick = () => {
        let lmp = root.querySelector('#p-lmp').value || null;
        const edd = root.querySelector('#p-edd').value || null;
        const gw = parseInt(root.querySelector('#p-gw').value, 10);
        if (!isNaN(gw) && gw >= 0) {   // กรอกอายุครรภ์เอง → แปลงเป็น LMP (วันนี้ − อายุครรภ์)
          const gd = Math.min(6, Math.max(0, parseInt(root.querySelector('#p-gd').value, 10) || 0));
          lmp = U.addDays(S.todayISO(), -(gw * 7 + gd));
        }
        if (!lmp && !edd) return MB.toast('กรอกอายุครรภ์ หรือ LMP/วันกำหนดคลอด');
        S.setPreg({
          active: true, lmp: lmp || null, edd: edd || null,
          name: root.querySelector('#p-name').value.trim(),
          height: parseFloat(root.querySelector('#p-h').value) || null,
          prePregWeight: parseFloat(root.querySelector('#p-w').value) || null
        });
        MB.toast('เริ่มติดตามครรภ์แล้ว 🎉'); MB.go('preg');
      };
      return;
    }

    /* ---------- แดชบอร์ดครรภ์ ---------- */
    const p = U.pregInfo(preg);
    const curWeek = p ? p.week : 1;
    let viewWeek = params && params.week ? params.week : curWeek;
    viewWeek = Math.max(4, Math.min(40, viewWeek));
    const wk = MB.PREG_WEEKS.find(x => x.w === viewWeek) || MB.PREG_WEEKS[0];
    const pct = Math.min(100, Math.round((p ? p.daysPreg : 0) / 280 * 100));
    // อายุครรภ์แบบทศนิยมสำหรับวาดภาพ: สัปดาห์ที่กำลังดูอยู่ปัจจุบันใช้วัน "วันนี้" จริง (เปลี่ยนทุกวัน)
    const gwImg = (viewWeek === curWeek && p) ? (p.week + p.day / 7) : viewWeek;
    const fruitKey = (MB.PREG_FRUIT_KEY && MB.PREG_FRUIT_KEY[viewWeek]) || 'seed';

    // ขนาดลูกแบบ "อัปเดตทุกวัน" — แทรกค่าความยาว/น้ำหนักตามวันจริงในสัปดาห์ (เฉพาะสัปดาห์ปัจจุบัน)
    const nextWk = MB.PREG_WEEKS.find(x => x.w === viewWeek + 1);
    const dayFrac = (viewWeek === curWeek && p) ? Math.min(1, Math.max(0, p.day / 7)) : 0;
    const dayLen = (nextWk && nextWk.len != null && wk.len != null) ? wk.len + (nextWk.len - wk.len) * dayFrac : wk.len;
    const dayWt = (nextWk && nextWk.wt != null && wk.wt != null) ? Math.round(wk.wt + (nextWk.wt - wk.wt) * dayFrac) : wk.wt;

    // เช็กลิสต์
    const checked = preg.checklist || {};
    const curKey = 't' + (p ? p.trimester : 1);
    const checklistHtml = (MB.PREG_CHECKLIST || []).map(g => {
      const cur = g.key === curKey;
      const dc = g.items.filter(i => checked[i.id]).length;
      return `<div class="section-title">${g.em} ${g.label} ${cur ? '<span class="badge soon">ตอนนี้</span>' : ''}<span class="more">${dc}/${g.items.length}</span></div>
        <div class="card" style="padding:6px 14px;${cur ? 'border-color:var(--pink);' : ''}">
          ${g.items.map(i => `<div class="list-item" data-check="${i.id}">
            <div class="ic" style="background:${checked[i.id] ? '#E6F3E9' : 'var(--cream-2)'}">${checked[i.id] ? '✅' : '⬜'}</div>
            <div class="body"><div class="t" style="${checked[i.id] ? 'text-decoration:line-through;color:var(--muted)' : ''}">${U.esc(i.text)}</div></div>
          </div>`).join('')}
        </div>`;
    }).join('');

    const nut = MB.pregNutrition ? MB.pregNutrition(viewWeek) : null;
    const nutHtml = nut ? `
      <div class="section-title">${nut.emoji} โภชนาการ <span class="more">${nut.weeks}</span></div>
      <div class="card">
        <p style="margin:0 0 8px"><b>สารอาหารเด่นช่วงนี้:</b> ${nut.focus}</p>
        <div style="font-weight:700;color:var(--brown);margin-bottom:2px">🍽️ ควรกิน</div>
        <ul style="margin:0 0 10px;padding-left:20px;font-size:14px;line-height:1.65">${nut.foods.map(f => '<li>' + f + '</li>').join('')}</ul>
        <div style="font-weight:700;color:var(--brown);margin-bottom:2px">💡 เคล็ดลับ</div>
        <ul style="margin:0 0 10px;padding-left:20px;font-size:14px;line-height:1.65">${nut.tips.map(t => '<li>' + t + '</li>').join('')}</ul>
        <div style="font-weight:700;color:#C45a61;margin-bottom:2px">🚫 ควรเลี่ยง</div>
        <ul style="margin:0;padding-left:20px;font-size:14px;line-height:1.65;color:#7a5a52">${nut.avoid.map(a => '<li>' + a + '</li>').join('')}</ul>
        <div class="disclaimer" style="margin-top:10px">คำแนะนำทั่วไป ปรึกษาแพทย์/นักโภชนาการสำหรับแผนเฉพาะบุคคล</div>
      </div>` : '';

    // ฟีดประจำวัน — การ์ดเปลี่ยนทุกวันตามจำนวนวันตั้งครรภ์ และเรียกชื่อลูก (สไตล์ฟีดแบบมะลิ)
    const feedDayIdx = (viewWeek === curWeek && p) ? p.daysPreg : viewWeek * 7;
    const feed = MB.pregFeed ? MB.pregFeed(viewWeek, feedDayIdx, preg.name) : [];
    const feedHtml = feed.length ? `
      <div class="section-title">💌 อัปเดตวันนี้${viewWeek === curWeek ? '' : ' (สัปดาห์ ' + viewWeek + ')'}</div>
      ${feed.map(c => `
        <div style="display:flex;align-items:center;gap:8px;margin:0 2px 6px"><span style="font-size:18px">${c.em}</span><b style="font-size:14.5px;color:var(--pink-deep)">${U.esc(c.label)}</b></div>
        <div class="card" style="border-color:var(--pink-soft);margin-bottom:14px"><p style="margin:0;font-size:14.5px;line-height:1.7;color:#4f3d33">${U.esc(c.text)}</p></div>
      `).join('')}` : '';

    root.innerHTML = `
      <div class="hero">
        <div class="emoji" style="padding:2px">${MB.fruitSVG(fruitKey, 60, { bare: true })}</div>
        <div style="flex:1">
          <div class="tag-week">ไตรมาส ${p ? p.trimester : 1} ${viewWeek !== curWeek ? '· กำลังดูย้อน' : ''}</div>
          <div class="bigweek"><b>${p ? p.week : '-'}</b><small>สัปดาห์ ${p ? '+' + p.day + ' วัน' : ''}</small></div>
          <p>${p && p.daysLeft >= 0 ? 'เหลืออีก ' + p.daysLeft + ' วัน' : 'ถึง/เลยกำหนดแล้ว'} · กำหนดคลอด ${U.fmtDateTH(p ? p.edd : '')}</p>
          <div class="progress"><span style="width:${pct}%"></span></div>
        </div>
      </div>

      <div class="section-title">${MB.fruitSVG(fruitKey, 22, { bare: true })} สัปดาห์ที่ ${viewWeek} – ลูกตอนนี้</div>
      <div class="card">
        <div class="center">${MB.fetusSVG(gwImg)}</div>
        <div class="center muted" style="font-size:11px;margin:-2px 0 6px">🎨 ภาพและขนาดโดยประมาณ อัปเดตตามอายุครรภ์${viewWeek === curWeek ? ' (เปลี่ยนทุกวัน)' : ''}</div>
        <div class="center" style="margin-bottom:8px">ขนาดเทียบ <span style="display:inline-block;vertical-align:middle">${MB.fruitSVG(fruitKey, 34, { bare: true })}</span> <b>≈ ${wk.fruitName}</b> · ยาว ~${dayLen != null ? dayLen.toFixed(1) : '-'} ซม.${dayWt ? ' · หนัก ~' + (dayWt >= 1000 ? (dayWt / 1000).toFixed(2) + ' กก.' : dayWt + ' ก.') : ''}</div>
        <div class="divider"></div>
        <p style="margin:0 0 8px"><b>👶 พัฒนาการลูก:</b> ${wk.baby}</p>
        <p style="margin:0"><b>🤰 ร่างกายคุณแม่:</b> ${wk.mom}</p>
        ${MB.citeBlock('pregnancy')}
        <div class="btn-row" style="margin-top:14px">
          <button class="btn ghost sm" id="wk-prev">‹ ก่อนหน้า</button>
          ${viewWeek !== curWeek ? '<button class="btn ghost sm" id="wk-now">กลับสัปดาห์นี้</button>' : ''}
          <button class="btn ghost sm" id="wk-next">ถัดไป ›</button>
        </div>
      </div>

      ${feedHtml}

      ${nutHtml}

      <div class="section-title">🧰 เครื่องมือคนท้อง</div>
      <div class="quick-grid">
        <button class="quick" id="t-weight"><span class="ic">⚖️</span><span class="lb">น้ำหนัก/BMI</span></button>
        <button class="quick" id="t-kick"><span class="ic">👣</span><span class="lb">นับลูกดิ้น</span></button>
        <button class="quick" id="t-contr"><span class="ic">⏱️</span><span class="lb">จับเวลาหดตัว</span></button>
        <button class="quick" id="t-cost"><span class="ic">🤱</span><span class="lb">ราคาคลอด</span></button>
        <button class="quick" id="t-menu"><span class="ic">🍱</span><span class="lb">เมนูอาหาร</span></button>
        <button class="quick" id="t-gear"><span class="ic">🧳</span><span class="lb">ของเตรียมคลอด</span></button>
        <button class="quick" id="t-tips"><span class="ic">📚</span><span class="lb">บทความ</span></button>
      </div>

      <div class="section-title">⚖️ น้ำหนักของคุณแม่</div>
      <div class="card" id="weight-card"></div>

      ${checklistHtml}

      <div style="margin-top:18px" class="card flat">
        <button class="btn ghost" id="born">👶 คลอดแล้ว → เพิ่มข้อมูลลูก</button>
        <button class="btn ghost" id="edit-preg" style="margin-top:10px">แก้ไข/ปิดโหมดตั้งครรภ์</button>
      </div>
    `;

    // เปลี่ยนสัปดาห์
    const pv = root.querySelector('#wk-prev'), nx = root.querySelector('#wk-next'), nw = root.querySelector('#wk-now');
    if (pv) pv.onclick = () => MB.go('preg', { week: viewWeek - 1 });
    if (nx) nx.onclick = () => MB.go('preg', { week: viewWeek + 1 });
    if (nw) nw.onclick = () => MB.go('preg', { week: curWeek });

    root.querySelector('#t-weight').onclick = openWeight;
    root.querySelector('#t-kick').onclick = openKick;
    root.querySelector('#t-contr').onclick = openContraction;
    root.querySelector('#t-cost').onclick = () => MB.go('prices', { tab: 'delivery' });
    root.querySelector('#t-menu').onclick = openMenu;
    root.querySelector('#t-gear').onclick = openGear;
    root.querySelector('#t-tips').onclick = () => MB.go('develop', { cat: 'preg' });

    renderWeightCard(root.querySelector('#weight-card'));

    root.querySelectorAll('[data-check]').forEach(n => n.onclick = () => { S.toggleCheck(n.dataset.check); MB.rerender({ week: viewWeek }); });

    root.querySelector('#born').onclick = () => {
      if (confirm('ยินดีด้วย! เพิ่มข้อมูลลูกและปิดโหมดตั้งครรภ์ใช่ไหม?')) {
        MB.views.editChild(null);
      }
    };
    root.querySelector('#edit-preg').onclick = openEditPreg;
  };

  /* ---------- การ์ดน้ำหนัก ---------- */
  function renderWeightCard(card) {
    const preg = S.preg();
    const ws = preg.weights;
    let gainHtml = '';
    if (preg.height && preg.prePregWeight) {
      const bmi = preg.prePregWeight / Math.pow(preg.height / 100, 2);
      const cat = bmiCat(bmi);
      const last = ws.length ? ws[ws.length - 1].kg : preg.prePregWeight;
      const gain = (last - preg.prePregWeight);
      gainHtml = `<div class="center" style="margin-bottom:10px">
        <div style="font-size:13px;color:var(--muted)">BMI ก่อนตั้งครรภ์ ${bmi.toFixed(1)} (${cat.label})</div>
        <div style="font-size:26px;font-weight:800;color:var(--brown)">${gain >= 0 ? '+' : ''}${gain.toFixed(1)} กก.</div>
        <div style="font-size:13px;color:var(--muted)">ควรขึ้นรวมทั้งครรภ์ ${cat.lo}–${cat.hi} กก.</div>
      </div>`;
    }
    const list = ws.slice(-5).reverse().map(w =>
      `<div class="list-item" style="padding:8px 2px"><div class="body"><div class="t">${w.kg} กก.</div></div><div class="meta">${U.fmtDateTH(w.date)}</div></div>`
    ).join('') || '<p class="muted center" style="font-size:13px">ยังไม่มีบันทึกน้ำหนัก</p>';
    card.innerHTML = gainHtml + list + '<button class="btn ghost sm" id="add-w" style="margin-top:10px;width:100%">+ บันทึกน้ำหนักวันนี้</button>';
    card.querySelector('#add-w').onclick = openWeight;
  }

  /* ---------- เครื่องมือ: น้ำหนัก/BMI ---------- */
  function openWeight() {
    const preg = S.preg();
    MB.sheet({
      title: 'บันทึกน้ำหนัก',
      html: `
        ${(!preg.height || !preg.prePregWeight) ? `<div class="field"><div class="row">
          <div><label>ส่วนสูง (ซม.)</label><input id="w-h" type="number" inputmode="decimal" value="${preg.height || ''}" placeholder="160" /></div>
          <div><label>น้ำหนักก่อนตั้งครรภ์</label><input id="w-pre" type="number" inputmode="decimal" value="${preg.prePregWeight || ''}" placeholder="52" /></div>
        </div></div>` : ''}
        <div class="field"><label>วันที่ชั่ง</label><input id="w-date" type="date" value="${S.todayISO()}" max="${S.todayISO()}" /></div>
        <div class="field"><label>น้ำหนักวันนี้ (กก.)</label><input id="w-kg" type="number" inputmode="decimal" placeholder="55.5" /></div>
        <button class="btn pink" id="w-save">บันทึก</button>
      `,
      onMount(rt) {
        rt.querySelector('#w-save').onclick = () => {
          const kg = parseFloat(rt.querySelector('#w-kg').value);
          if (!kg) return MB.toast('กรอกน้ำหนักก่อนนะ');
          const hEl = rt.querySelector('#w-h'), preEl = rt.querySelector('#w-pre');
          if (hEl) S.setPreg({ height: parseFloat(hEl.value) || preg.height, prePregWeight: parseFloat(preEl.value) || preg.prePregWeight });
          S.addPregWeight(rt.querySelector('#w-date').value, kg);
          MB.closeSheet(); MB.toast('บันทึกน้ำหนักแล้ว'); MB.go('preg');
        };
      }
    });
  }

  /* ---------- เครื่องมือ: นับลูกดิ้น ---------- */
  function openKick() {
    let count = 0, startTs = null, timer = null;
    MB.sheet({
      title: 'นับลูกดิ้น 👣',
      html: `
        <p class="muted center" style="margin-top:-6px">เป้าหมาย: นับให้ครบ <b>10 ครั้ง</b> แตะปุ่มทุกครั้งที่ลูกดิ้น</p>
        <div class="center" style="margin:16px 0">
          <div id="k-count" style="font-size:64px;font-weight:800;color:var(--pink-deep);line-height:1">0</div>
          <div class="muted">ครั้ง · ใช้เวลา <span id="k-time">0:00</span></div>
        </div>
        <button class="btn pink" id="k-tap" style="padding:20px;font-size:18px">👣 ลูกดิ้น +1</button>
        <div class="btn-row" style="margin-top:10px">
          <button class="btn ghost" id="k-reset">รีเซ็ต</button>
          <button class="btn outline" id="k-save">บันทึกรอบนี้</button>
        </div>
        <div id="k-msg" class="center" style="margin-top:12px;color:var(--ok);font-weight:700"></div>
        <div class="disclaimer" style="margin-top:12px">ตั้งแต่สัปดาห์ ~28 ควรนับลูกดิ้นทุกวัน หากดิ้นน้อยกว่า 10 ครั้งใน 2 ชม. หรือดิ้นน้อยลงชัดเจน ให้รีบไปโรงพยาบาล</div>
      `,
      onClose() { if (timer) clearInterval(timer); },
      onMount(rt) {
        const cEl = rt.querySelector('#k-count'), tEl = rt.querySelector('#k-time'), msg = rt.querySelector('#k-msg');
        function fmt(ms) { const s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
        rt.querySelector('#k-tap').onclick = () => {
          if (!startTs) { startTs = Date.now(); timer = setInterval(() => { tEl.textContent = fmt(Date.now() - startTs); }, 1000); }
          count++; cEl.textContent = count;
          if (count === 10) msg.textContent = '🎉 ครบ 10 ครั้งแล้ว! ใช้เวลา ' + fmt(Date.now() - startTs);
        };
        rt.querySelector('#k-reset').onclick = () => { count = 0; startTs = null; if (timer) clearInterval(timer); cEl.textContent = '0'; tEl.textContent = '0:00'; msg.textContent = ''; };
        rt.querySelector('#k-save').onclick = () => {
          if (!count) return MB.toast('ยังไม่มีการนับ');
          S.addKickSession({ date: S.todayISO(), count, ms: startTs ? Date.now() - startTs : 0 });
          MB.closeSheet(); MB.toast('บันทึกการนับลูกดิ้นแล้ว');
        };
      }
    });
  }

  /* ---------- เครื่องมือ: จับเวลาการหดตัวของมดลูก ---------- */
  function openContraction() {
    let contractions = []; // {start, end}
    let active = null, timer = null;
    MB.sheet({
      title: 'จับเวลามดลูกหดตัว ⏱️',
      html: `
        <p class="muted center" style="margin-top:-6px">กด “เริ่ม” เมื่อเริ่มเจ็บ และ “หยุด” เมื่อหายเจ็บ</p>
        <div class="center" style="margin:12px 0"><div id="c-run" style="font-size:46px;font-weight:800;color:var(--brown)">0:00</div><div class="muted" id="c-state">พร้อมจับเวลา</div></div>
        <button class="btn pink" id="c-toggle" style="padding:18px;font-size:18px">▶ เริ่มหดตัว</button>
        <div class="section-title" style="margin-top:18px">ประวัติล่าสุด</div>
        <div id="c-list"><p class="muted center" style="font-size:13px">ยังไม่มีข้อมูล</p></div>
        <div class="disclaimer" style="margin-top:12px">สัญญาณควรไปโรงพยาบาล: หดตัวสม่ำเสมอ ทุก ~5 นาที นานครั้งละ ~1 นาที ต่อเนื่อง 1 ชม. (กฎ 5-1-1) หรือมีน้ำเดิน/เลือดออก — ปรึกษาแพทย์</div>
      `,
      onClose() { if (timer) clearInterval(timer); },
      onMount(rt) {
        const run = rt.querySelector('#c-run'), state = rt.querySelector('#c-state'), btn = rt.querySelector('#c-toggle'), list = rt.querySelector('#c-list');
        function fmt(ms) { const s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
        function renderList() {
          if (!contractions.length) { list.innerHTML = '<p class="muted center" style="font-size:13px">ยังไม่มีข้อมูล</p>'; return; }
          list.innerHTML = contractions.slice().reverse().map((c, i, arr) => {
            const dur = c.end ? fmt(c.end - c.start) : 'กำลังหดตัว';
            const realIdx = contractions.length - 1 - i;
            const prev = contractions[realIdx - 1];
            const gap = prev ? Math.round((c.start - prev.start) / 60000 * 10) / 10 + ' นาที' : '-';
            const t = new Date(c.start);
            return `<div class="list-item" style="padding:8px 2px"><div class="ic">⏱️</div><div class="body"><div class="t">นาน ${dur}</div><div class="s">ห่างจากครั้งก่อน ${gap}</div></div><div class="meta">${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')}</div></div>`;
          }).join('');
        }
        btn.onclick = () => {
          if (!active) {
            active = { start: Date.now(), end: null }; contractions.push(active);
            btn.textContent = '■ หยุด (กำลังหดตัว)'; btn.classList.remove('pink'); state.textContent = 'กำลังหดตัว...';
            timer = setInterval(() => { run.textContent = fmt(Date.now() - active.start); }, 1000);
            renderList();
          } else {
            active.end = Date.now(); clearInterval(timer); timer = null;
            btn.textContent = '▶ เริ่มหดตัว'; btn.classList.add('pink'); state.textContent = 'หยุดพัก'; run.textContent = '0:00';
            active = null; renderList();
          }
        };
      }
    });
  }

  /* ---------- เครื่องมือ: เมนูอาหารคนท้อง ---------- */
  function openMenu() {
    const p = U.pregInfo(S.preg());
    const nut = MB.pregNutrition ? MB.pregNutrition(p ? p.week : 8) : null;
    const M = MB.PREG_MENU;
    const day = M.day.map(s => `<div style="margin-top:10px"><b>${s.t}</b><ul style="margin:4px 0 0;padding-left:20px;font-size:14px;line-height:1.6">${s.items.map(i => '<li>' + U.esc(i) + '</li>').join('')}</ul></div>`).join('');
    MB.sheet({
      title: '🍱 เมนูอาหารคนท้อง',
      html: `<p class="muted" style="margin-top:-4px;font-size:13.5px">${M.intro}</p>
        ${nut ? `<div class="card tint" style="margin:10px 0"><b>${nut.emoji} เน้นช่วงนี้:</b> ${nut.focus}</div>` : ''}
        <div class="section-title" style="margin-top:8px">ตัวอย่างเมนู 1 วัน</div>${day}
        <div class="section-title" style="margin-top:14px">🥗 ของว่างที่ดี</div>
        <div class="chips">${M.good.map(g => `<div class="chip">${U.esc(g)}</div>`).join('')}</div>
        <div class="section-title" style="margin-top:14px;color:#C45a61">🚫 ควรเลี่ยง</div>
        <ul style="margin:0;padding-left:20px;font-size:14px;line-height:1.6;color:#7a5a52">${M.avoid.map(a => '<li>' + U.esc(a) + '</li>').join('')}</ul>
        <div class="disclaimer" style="margin-top:12px">เมนูตัวอย่างเพื่อความรู้ทั่วไป ปรับตามภาวะสุขภาพ/น้ำหนัก/คำแนะนำแพทย์หรือนักโภชนาการ</div>
        <button class="btn ghost" style="margin-top:10px" onclick="MB.closeSheet()">ปิด</button>`
    });
  }

  /* ---------- เครื่องมือ: ของเตรียมก่อนคลอด (เช็กลิสต์) ---------- */
  function gearHtml() {
    const checked = S.preg().checklist || {};
    const total = MB.PREG_GEAR.reduce((n, g) => n + g.items.length, 0);
    const done = MB.PREG_GEAR.reduce((n, g) => n + g.items.filter(i => checked[i.id]).length, 0);
    const groups = MB.PREG_GEAR.map(g => `
      <div class="section-title">${g.em} ${g.label}</div>
      <div class="card" style="padding:6px 14px">
        ${g.items.map(i => `<div class="list-item" data-gear="${i.id}" style="cursor:pointer">
          <div class="ic" style="background:${checked[i.id] ? '#E6F3E9' : 'var(--cream-2)'}">${checked[i.id] ? '✅' : '⬜'}</div>
          <div class="body"><div class="t" style="${checked[i.id] ? 'text-decoration:line-through;color:var(--muted)' : ''}">${U.esc(i.text)}</div></div>
        </div>`).join('')}
      </div>`).join('');
    return `<div class="center muted" style="font-size:13px;margin:-4px 0 8px">เตรียมแล้ว ${done}/${total} อย่าง</div>${groups}
      <div class="disclaimer" style="margin-top:10px">รายการแนะนำทั่วไป ปรับตามความจำเป็นและงบประมาณของแต่ละบ้าน</div>`;
  }
  function openGear() {
    MB.sheet({
      title: '🧳 ของเตรียมก่อนคลอด',
      html: gearHtml(),
      onMount(rt) {
        const wire = () => rt.querySelectorAll('[data-gear]').forEach(n => n.onclick = () => {
          S.toggleCheck(n.dataset.gear);
          rt.querySelector('.sheet-body').innerHTML = gearHtml();
          wire();
        });
        wire();
      }
    });
  }

  /* ---------- แก้ไข/ปิดโหมด ---------- */
  function openEditPreg() {
    const preg = S.preg();
    MB.sheet({
      title: 'แก้ไขการตั้งครรภ์',
      html: `
        <div class="field"><label>ชื่อเล่น</label><input id="e-name" value="${U.esc(preg.name || '')}" /></div>
        <div class="field"><label>🩺 อายุครรภ์ตอนนี้ (ตามที่หมอ/อัลตราซาวด์บอก) <span style="color:var(--pink-deep);font-weight:700">— ตรงที่สุด</span></label>
          <div class="row">
            <div><input id="e-gw" type="number" inputmode="numeric" min="0" max="42" placeholder="สัปดาห์" /></div>
            <div><input id="e-gd" type="number" inputmode="numeric" min="0" max="6" placeholder="วัน (0–6)" /></div>
          </div>
          <div class="muted" style="font-size:11px;margin-top:3px">กรอกอายุครรภ์ ณ วันนี้ แล้วระบบคำนวณให้ตรงกับหมอเป๊ะ</div>
        </div>
        <p class="muted center" style="font-size:12px;margin:2px 0 8px">— หรือกรอกเป็นวันที่ —</p>
        <div class="field"><label>วันแรกของประจำเดือนครั้งสุดท้าย (LMP)</label><input id="e-lmp" type="date" value="${preg.lmp || ''}" max="${S.todayISO()}" /></div>
        <div class="field"><label>วันกำหนดคลอด / นัดผ่าคลอด (ถ้ามี)</label><input id="e-edd" type="date" value="${preg.edd || ''}" /><div class="muted" style="font-size:11px;margin-top:3px">ใช้แสดงวันคลอดเท่านั้น ไม่ใช้คำนวณอายุครรภ์</div></div>
        <div class="card tint" id="e-preview" style="text-align:center;font-size:13.5px;padding:10px"></div>
        <button class="btn pink" id="e-save">บันทึก</button>
        <button class="btn ghost" id="e-off" style="margin-top:10px;color:#D9737A">ปิดโหมดตั้งครรภ์</button>
      `,
      onMount(rt) {
        const lmpEl = rt.querySelector('#e-lmp'), eddEl = rt.querySelector('#e-edd'),
          gwEl = rt.querySelector('#e-gw'), gdEl = rt.querySelector('#e-gd'), prev = rt.querySelector('#e-preview');
        // ลำดับความสำคัญ: อายุครรภ์ที่กรอกเอง > LMP > กำหนดคลอด
        function effective() {
          const gw = parseInt(gwEl.value, 10);
          if (!isNaN(gw) && gw >= 0) {
            const gd = Math.min(6, Math.max(0, parseInt(gdEl.value, 10) || 0));
            return { lmp: U.addDays(S.todayISO(), -(gw * 7 + gd)), edd: eddEl.value || null };  // LMP = วันนี้ − อายุครรภ์
          }
          return { lmp: lmpEl.value || null, edd: eddEl.value || null };
        }
        function refresh() {
          const info = U.pregInfo(effective());
          prev.innerHTML = info
            ? `ตอนนี้ ~สัปดาห์ที่ <b>${info.week}</b>${info.day ? ' +' + info.day + ' วัน' : ''} · กำหนดคลอด <b>${U.fmtDateTH(info.edd)}</b>`
            : 'กรอกอายุครรภ์ หรือ LMP/กำหนดคลอด';
        }
        [lmpEl, eddEl, gwEl, gdEl].forEach(el => { el.onchange = refresh; el.oninput = refresh; });
        refresh();
        rt.querySelector('#e-save').onclick = () => {
          const eff = effective();
          if (!eff.lmp && !eff.edd) return MB.toast('กรอกอายุครรภ์ หรือ LMP/กำหนดคลอด');
          S.setPreg({ name: rt.querySelector('#e-name').value.trim(), lmp: eff.lmp, edd: eff.edd });
          MB.closeSheet(); MB.toast('บันทึกแล้ว'); MB.go('preg');
        };
        rt.querySelector('#e-off').onclick = () => {
          if (confirm('ปิดโหมดตั้งครรภ์? (ข้อมูลน้ำหนัก/ลูกดิ้นจะถูกล้าง)')) {
            S.setPreg({ active: false, lmp: null, edd: null, name: '', weights: [], kicks: [] });
            MB.closeSheet(); MB.toast('ปิดโหมดแล้ว'); MB.go('home');
          }
        };
      }
    });
  }
})();
