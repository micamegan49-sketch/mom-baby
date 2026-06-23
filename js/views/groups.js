/* หน้า: กลุ่มไลน์แม่ ๆ ตามปี/เดือนเกิดของลูก (ชุมชนแลกเปลี่ยน) */
window.MB = window.MB || {}; MB.views = MB.views || {};
(function () {
  const S = MB.store, U = MB.util;
  const THMON = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

  MB.views.groups = function (root) {
    const groups = MB.LINE_GROUPS || [];
    const nowBE = new Date().getFullYear() + 543;

    // ปี/เดือนเกิดของลูกที่กำลังเลือก (ถ้ามี)
    let myYear = null, myMonth = null, childName = '';
    const child = S.activeChild();
    if (child) { const d = U.parseISO(child.birthDate); myYear = d.getFullYear() + 543; myMonth = d.getMonth() + 1; childName = child.name; }

    const yearGroups = y => groups.filter(g => g.yearBE === y);
    const joinBtn = g => g.url
      ? `<a class="btn pink sm" style="width:auto;padding:8px 16px;text-decoration:none" href="${U.esc(g.url)}" target="_blank" rel="noopener">เข้ากลุ่ม LINE</a>`
      : `<span class="badge upcoming">เร็ว ๆ นี้</span>`;

    // ช่วงปีที่แสดง: ลูกวัย 0–5 ปี (และเผื่อปีหน้าสำหรับคนท้อง)
    const years = [];
    for (let y = nowBE + 1; y >= nowBE - 5; y--) years.push(y);

    const yearCard = y => {
      const mine = y === myYear;
      const list = yearGroups(y);
      const whole = list.filter(g => !g.month);
      const monthly = list.filter(g => g.month).sort((a, b) => a.month - b.month);
      const rows = [];
      // กลุ่มรวมทั้งปี
      if (whole.length) {
        whole.forEach(g => rows.push(`<div class="list-item" style="padding:10px 0">
          <div class="ic">💬</div><div class="body"><div class="t">${U.esc(g.label || ('แม่ลูกเกิดปี ' + y))}</div>${g.note ? `<div class="s">${U.esc(g.note)}</div>` : ''}</div>${joinBtn(g)}</div>`));
      } else {
        rows.push(`<div class="list-item" style="padding:10px 0"><div class="ic">💬</div>
          <div class="body"><div class="t">แม่ลูกเกิดปี ${y}</div><div class="s">กำลังเปิดกลุ่ม</div></div>${joinBtn({})}</div>`);
      }
      // กลุ่มรายเดือน (ถ้ามี)
      monthly.forEach(g => rows.push(`<div class="list-item" style="padding:10px 0">
        <div class="ic">📅</div><div class="body"><div class="t">${U.esc(g.label || ('เกิดเดือน ' + THMON[g.month - 1] + ' ' + y))}</div>${g.note ? `<div class="s">${U.esc(g.note)}</div>` : ''}</div>${joinBtn(g)}</div>`));

      return `<div class="card" style="${mine ? 'border-color:var(--pink);' : ''}">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:2px">
          <b style="flex:1">ปี ${y}${y === nowBE + 1 ? ' (กำหนดคลอดปีหน้า)' : ''}</b>
          ${mine ? `<span class="badge due">ลูกของคุณ${myMonth ? ' · ' + THMON[myMonth - 1] : ''}</span>` : ''}
        </div>
        ${rows.join('')}
      </div>`;
    };

    root.innerHTML = `${MB.knowledgeChips('groups')}
      <div class="hero" style="padding:14px 16px"><div class="emoji">🤝</div>
        <div style="flex:1"><h2 style="font-size:18px">กลุ่มแม่ ๆ</h2><p>ชุมชนแลกเปลี่ยนตามปี/เดือนเกิดของลูก</p></div></div>
      <div class="card tint"><b>💬 กลุ่มไลน์ตามรุ่นลูก</b>
        <p style="font-size:13px;margin:6px 0 0;line-height:1.6">หาเพื่อนแม่ที่ลูกวัยใกล้กัน แลกเปลี่ยนประสบการณ์ ของใช้ พัฒนาการ และให้กำลังใจกัน${childName ? ` — ลูกของคุณ (${U.esc(childName)}) อยู่รุ่นปี ${myYear}` : ''}</p></div>
      <div class="section-title">เลือกรุ่นปีเกิด</div>
      ${years.map(yearCard).join('')}
      <div class="disclaimer">กลุ่มไลน์อยู่ระหว่างทยอยเปิด ผู้ดูแลจะนำลิงก์มาเพิ่มเรื่อย ๆ · โปรดใช้วิจารณญาณในการพูดคุย ข้อมูลในกลุ่มเป็นความเห็นส่วนบุคคล ไม่ใช่คำแนะนำทางการแพทย์</div>`;
    MB.wireKnowledgeChips(root);
  };
})();
