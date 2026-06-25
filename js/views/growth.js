/* หน้า: กราฟการเจริญเติบโต (เทียบเกณฑ์ WHO) */
window.MB = window.MB || {}; MB.views = MB.views || {};
(function () {
  const S = MB.store, U = MB.util;
  const METRICS = {
    weight: { label: 'น้ำหนัก', unit: 'กก.', em: '⚖️' },
    height: { label: 'ส่วนสูง', unit: 'ซม.', em: '📏' },
    head:   { label: 'รอบศีรษะ', unit: 'ซม.', em: '🧠' }
  };

  function draw(canvas, metric, sex, birth, meas) {
    const ctx = canvas.getContext('2d');
    const cssW = canvas.clientWidth || 340, cssH = 250;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = cssW * dpr; canvas.height = cssH * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);
    const padL = 32, padR = 10, padT = 12, padB = 24;

    const pts = meas.map(m => ({ x: U.daysBetween(birth, m.date) / 30.4375, y: m[metric] }))
      .filter(p => p.y != null && !isNaN(p.y) && p.x >= 0);
    let xMax = 12;
    pts.forEach(p => { if (p.x + 2 > xMax) xMax = p.x + 2; });
    xMax = Math.min(60, Math.max(6, Math.ceil(xMax)));

    let yMin = Infinity, yMax = -Infinity;
    for (let m = 0; m <= xMax; m++) { const r = MB.growthRefAt(metric, sex, m); if (r) { yMin = Math.min(yMin, r.lo); yMax = Math.max(yMax, r.hi); } }
    pts.forEach(p => { yMin = Math.min(yMin, p.y); yMax = Math.max(yMax, p.y); });
    if (!isFinite(yMin)) { yMin = 0; yMax = 10; }
    const yPad = (yMax - yMin) * 0.08 || 1; yMin -= yPad; yMax += yPad;

    const X = x => padL + (x / xMax) * (cssW - padL - padR);
    const Y = y => cssH - padB - ((y - yMin) / (yMax - yMin)) * (cssH - padT - padB);

    // แถบช่วงปกติ
    ctx.beginPath();
    for (let m = 0; m <= xMax; m++) { const r = MB.growthRefAt(metric, sex, m); ctx.lineTo(X(m), Y(r.hi)); }
    for (let m = xMax; m >= 0; m--) { const r = MB.growthRefAt(metric, sex, m); ctx.lineTo(X(m), Y(r.lo)); }
    ctx.closePath(); ctx.fillStyle = 'rgba(229,155,166,0.15)'; ctx.fill();

    function curve(key, color, dash) {
      ctx.beginPath();
      for (let m = 0; m <= xMax; m++) { const r = MB.growthRefAt(metric, sex, m); const fx = X(m), fy = Y(r[key]); m === 0 ? ctx.moveTo(fx, fy) : ctx.lineTo(fx, fy); }
      ctx.strokeStyle = color; ctx.setLineDash(dash || []); ctx.lineWidth = 1.2; ctx.stroke(); ctx.setLineDash([]);
    }
    // เส้นกริด y
    ctx.fillStyle = '#A38C7E'; ctx.font = '10px sans-serif'; ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const yv = yMin + (yMax - yMin) * i / 4, py = Y(yv);
      ctx.strokeStyle = '#EADBCD'; ctx.beginPath(); ctx.moveTo(padL, py); ctx.lineTo(cssW - padR, py); ctx.stroke();
      ctx.fillText(yv.toFixed(yv < 10 ? 1 : 0), padL - 4, py + 3);
    }
    curve('hi', '#D8a0ab', [4, 3]); curve('lo', '#D8a0ab', [4, 3]); curve('mid', '#C98B94', []);
    // ป้ายแกน x (เดือน)
    ctx.textAlign = 'center'; ctx.fillStyle = '#A38C7E';
    const step = xMax <= 12 ? 2 : xMax <= 24 ? 4 : 12;
    for (let m = 0; m <= xMax; m += step) ctx.fillText(m + '', X(m), cssH - padB + 14);

    // เส้นและจุดของลูก
    if (pts.length) {
      const sp = pts.slice().sort((a, b) => a.x - b.x);
      ctx.beginPath(); sp.forEach((p, i) => i ? ctx.lineTo(X(p.x), Y(p.y)) : ctx.moveTo(X(p.x), Y(p.y)));
      ctx.strokeStyle = '#8B5E4B'; ctx.lineWidth = 2.4; ctx.stroke();
      sp.forEach(p => { ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), 4, 0, 7); ctx.fillStyle = '#8B5E4B'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke(); });
    }
  }

  function statusText(metric, sex, age, val) {
    const r = MB.growthRefAt(metric, sex, age);
    if (!r) return null;
    if (val < r.lo) return { t: 'ต่ำกว่าเกณฑ์อ้างอิง', c: 'due' };
    if (val > r.hi) return { t: 'สูงกว่าเกณฑ์อ้างอิง', c: 'soon' };
    return { t: 'อยู่ในช่วงปกติ', c: 'done' };
  }

  MB.views.growth = function (root, params) {
    const child = S.activeChild();
    if (!child) {
      root.innerHTML = `<div class="empty"><div class="em">📈</div><p>เพิ่มข้อมูลลูกเพื่อบันทึกการเจริญเติบโต</p><button class="btn" id="add">+ เพิ่มลูกน้อย</button></div>`;
      root.querySelector('#add').onclick = () => MB.views.editChild(null);
      return;
    }
    const metric = (params && params.metric) || 'weight';
    const meas = S.measurements(child.id);
    const last = meas[meas.length - 1];
    let st = null, lastAge = 0;
    if (last && last[metric] != null) { lastAge = U.daysBetween(child.birthDate, last.date) / 30.4375; st = statusText(metric, child.sex, lastAge, last[metric]); }

    root.innerHTML = `
      <div class="section-title">📈 การเจริญเติบโต</div>
      <div class="chips" style="margin-bottom:12px">
        ${Object.keys(METRICS).map(k => `<div class="chip ${metric === k ? 'active' : ''}" data-m="${k}">${METRICS[k].em} ${METRICS[k].label}</div>`).join('')}
      </div>
      <div class="card">
        <canvas id="chart" style="height:250px"></canvas>
        <div class="center muted" style="font-size:11px;margin-top:4px">แกนนอน = อายุ (เดือน) · แถบชมพู = ช่วงปกติ (~P3–P97) · เส้นทึบ = ค่ากลาง (WHO)</div>
        ${st ? `<div class="center" style="margin-top:10px"><span class="badge ${st.c}">${METRICS[metric].label}ล่าสุด: ${st.t}</span></div>` : ''}
      </div>
      <button class="btn pink" id="add-m">+ บันทึกการวัดวันนี้</button>
      <div class="section-title">ประวัติการวัด</div>
      ${meas.length ? `<div class="card" style="padding:6px 14px">${meas.slice().reverse().map(m => {
        const a = U.ageInfo(m.date); // not used; show date
        return `<div class="list-item" data-del="${m.id}">
          <div class="ic">📏</div>
          <div class="body"><div class="t">${[m.weight ? m.weight + ' กก.' : '', m.height ? m.height + ' ซม.' : '', m.head ? 'รอบหัว ' + m.head : ''].filter(Boolean).join(' · ')}</div>
          <div class="s">อายุ ~${(U.daysBetween(child.birthDate, m.date) / 30.4375).toFixed(1)} เดือน</div></div>
          <div class="meta">${U.fmtDateTH(m.date)}<br/><span style="color:#D9737A;font-size:11px">ลบ</span></div>
        </div>`;
      }).join('')}</div>` : '<div class="empty"><div class="em">📏</div><p>ยังไม่มีข้อมูล เริ่มบันทึกน้ำหนัก/ส่วนสูงได้เลย</p></div>'}
      <div class="disclaimer">เกณฑ์อ้างอิงอิง WHO Child Growth Standards (ค่าโดยประมาณ) ใช้ดู “แนวโน้ม” การเติบโต ไม่ใช่การวินิจฉัย หากกราฟตก/แบนผิดปกติ ควรปรึกษากุมารแพทย์</div>
      ${MB.citeBlock('growth')}
    `;

    const canvas = root.querySelector('#chart');
    requestAnimationFrame(() => draw(canvas, metric, child.sex, child.birthDate, meas));

    root.querySelectorAll('[data-m]').forEach(c => c.onclick = () => MB.go('growth', { metric: c.dataset.m }));
    root.querySelector('#add-m').onclick = () => openAddMeas(child);
    root.querySelectorAll('[data-del]').forEach(n => n.onclick = () => {
      if (confirm('ลบรายการวัดนี้?')) { S.removeMeasurement(child.id, n.dataset.del); MB.go('growth', { metric }); }
    });
  };

  function openAddMeas(child) {
    MB.sheet({
      title: '📏 บันทึกการวัด',
      html: `
        <div class="field"><label>วันที่วัด</label><input id="m-date" type="date" value="${S.todayISO()}" max="${S.todayISO()}" /></div>
        <div class="field"><label>น้ำหนัก (กก.)</label><input id="m-w" type="number" inputmode="decimal" placeholder="เช่น 7.2" /></div>
        <div class="field"><label>ส่วนสูง/ความยาว (ซม.)</label><input id="m-h" type="number" inputmode="decimal" placeholder="เช่น 67" /></div>
        <div class="field"><label>เส้นรอบศีรษะ (ซม. – ถ้ามี)</label><input id="m-hd" type="number" inputmode="decimal" placeholder="เช่น 43" /></div>
        <button class="btn pink" id="m-save">บันทึก</button>
      `,
      onMount(rt) {
        rt.querySelector('#m-save').onclick = () => {
          const weight = parseFloat(rt.querySelector('#m-w').value) || undefined;
          const height = parseFloat(rt.querySelector('#m-h').value) || undefined;
          const head = parseFloat(rt.querySelector('#m-hd').value) || undefined;
          if (!weight && !height && !head) return MB.toast('กรอกอย่างน้อย 1 ค่า');
          S.addMeasurement(child.id, { date: rt.querySelector('#m-date').value, weight, height, head });
          MB.closeSheet(); MB.toast('บันทึกแล้ว ✓'); MB.go('growth');
        };
      }
    });
  }
})();
