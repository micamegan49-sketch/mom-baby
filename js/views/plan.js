/* หน้า: วางแผนมีลูก — คำนวณวันไข่ตก / ช่วงมีบุตรง่าย + เตรียมตัวก่อนตั้งครรภ์ */
window.MB = window.MB || {}; MB.views = MB.views || {};
(function () {
  const S = MB.store, U = MB.util;
  const KEY = 'tuajiw_plan';

  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }

  // คำนวณ 1 รอบ: ไข่ตก = วันแรกประจำเดือน + รอบเดือน - luteal(14)
  function cycleInfo(lmpISO, cycle, n) {
    const lutealLen = 14;
    const periodStart = U.addDays(lmpISO, cycle * n);
    const nextPeriod = U.addDays(periodStart, cycle);
    const ovulation = U.addDays(nextPeriod, -lutealLen);
    return {
      periodStart,
      nextPeriod,
      ovulation,
      fertileStart: U.addDays(ovulation, -5),
      fertileEnd: U.addDays(ovulation, 1)
    };
  }

  MB.views.plan = function (root) {
    const st = load();
    const lmp = st.lmp || '';
    const cycle = st.cycle || 28;

    let resultHtml = `<p class="muted center" style="font-size:13.5px;margin:10px 0">กรอกวันแรกของประจำเดือนล่าสุด เพื่อคำนวณวันไข่ตก</p>`;
    if (lmp) {
      const c0 = cycleInfo(lmp, cycle, 0);
      const rows = [0, 1, 2].map(n => {
        const c = cycleInfo(lmp, cycle, n);
        return `<div class="list-item" style="padding:9px 2px"><div class="ic">${n === 0 ? '🥚' : '📅'}</div>
          <div class="body"><div class="t">ไข่ตก ~${U.fmtDateTH(c.ovulation)}</div>
          <div class="s">มีบุตรง่าย ${U.fmtDateTH(c.fertileStart)} – ${U.fmtDateTH(c.fertileEnd)}</div></div>
          ${n === 0 ? '<span class="badge due">รอบนี้</span>' : ''}</div>`;
      }).join('');
      resultHtml = `
        <div class="hero" style="padding:14px 16px;background:linear-gradient(135deg,#fff,#FCEDE6)">
          <div class="emoji" style="font-size:30px">🥚</div>
          <div style="flex:1"><div class="tag-week">ช่วงมีบุตรง่าย (รอบนี้)</div>
          <div style="font-weight:800;font-size:16px;color:var(--brown-deep)">${U.fmtDateTH(c0.fertileStart)} – ${U.fmtDateTH(c0.fertileEnd)}</div>
          <p style="margin-top:2px">วันไข่ตกประมาณ <b>${U.fmtDateTH(c0.ovulation)}</b></p></div>
        </div>
        <div class="card tint" style="font-size:13px;line-height:1.6">
          💡 โอกาสตั้งครรภ์สูงสุดคือ <b>ช่วง 2 วันก่อนไข่ตกถึงวันไข่ตก</b> เพราะอสุจิอยู่ได้ ~3-5 วัน ส่วนไข่อยู่ได้ ~12-24 ชม.</div>
        <div class="section-title">ไข่ตก 3 รอบถัดไป <span class="more">ประจำเดือนรอบหน้า ~${U.fmtDateTH(c0.nextPeriod)}</span></div>
        <div class="card" style="padding:4px 14px">${rows}</div>`;
    }

    root.innerHTML = `
      <div class="hero"><div class="emoji">🌷</div>
        <div style="flex:1"><h2>วางแผนมีลูก</h2><p>คำนวณวันไข่ตก & ช่วงมีบุตรง่าย</p></div></div>

      <div class="card">
        <div class="field"><label>วันแรกของประจำเดือนล่าสุด</label><input id="pl-lmp" type="date" value="${lmp}" max="${S.todayISO()}" /></div>
        <div class="field"><label>ความยาวรอบเดือน (วัน)</label><input id="pl-cycle" type="number" inputmode="numeric" min="20" max="45" value="${cycle}" /></div>
        <p class="muted" style="font-size:12px;margin:-4px 0 0">รอบเดือนปกติ ~21-35 วัน (ค่าเริ่มต้น 28) นับจากวันแรกของรอบหนึ่งถึงวันแรกของรอบถัดไป</p>
      </div>

      ${resultHtml}

      <div class="section-title">🌿 เตรียมตัวก่อนตั้งครรภ์</div>
      <div class="card" style="font-size:14px;line-height:1.7">
        <ul style="margin:0;padding-left:20px">
          <li>เริ่มทาน <b>กรดโฟลิก 400 ไมโครกรัม/วัน</b> ก่อนตั้งครรภ์อย่างน้อย 1-3 เดือน (ลดความเสี่ยงหลอดประสาทลูก)</li>
          <li>ตรวจสุขภาพก่อนมีบุตรทั้งคู่ (ธาลัสซีเมีย หมู่เลือด ภูมิหัดเยอรมัน โรคติดต่อ)</li>
          <li>คุมน้ำหนักให้พอดี ออกกำลังกายสม่ำเสมอ</li>
          <li>งดเหล้า บุหรี่ ลดคาเฟอีน</li>
          <li>มีเพศสัมพันธ์ช่วงมีบุตรง่ายทุก 1-2 วัน</li>
          <li>หากพยายาม ~1 ปียังไม่ตั้งครรภ์ (หรือ 6 เดือนเมื่ออายุ >35) ควรปรึกษาแพทย์ — ดูบทความ "ขั้นตอน IUI/IVF/ICSI"</li>
        </ul>
      </div>

      <button class="btn pink" id="pl-preg" style="margin-top:14px">ตั้งครรภ์แล้ว? เริ่มติดตามครรภ์ 🤰</button>
      <div class="disclaimer">การคำนวณไข่ตกเป็นค่าประมาณจากรอบเดือนเฉลี่ย รอบเดือนจริงอาจคลาดเคลื่อน หากต้องการแม่นยำขึ้นใช้ร่วมกับชุดตรวจไข่ตก (LH) หรือปรึกษาแพทย์</div>
    `;

    function update() {
      const v = root.querySelector('#pl-lmp').value;
      let cy = parseInt(root.querySelector('#pl-cycle').value, 10);
      if (!cy || cy < 20 || cy > 45) cy = 28;
      save({ lmp: v || '', cycle: cy });
      MB.rerender();
    }
    root.querySelector('#pl-lmp').onchange = update;
    root.querySelector('#pl-cycle').onchange = update;
    root.querySelector('#pl-preg').onclick = () => MB.go('preg');
  };
})();
