/* หน้า: ไดอารี่รูปความทรงจำของลูก */
window.MB = window.MB || {}; MB.views = MB.views || {};
(function () {
  const S = MB.store, U = MB.util;

  /* ย่อรูปก่อนเก็บ (กันไฟล์ใหญ่เกิน) */
  function resizeToDataURL(file, maxDim, cb) {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = function () {
      URL.revokeObjectURL(url);
      let w = img.width, h = img.height;
      if (w > h && w > maxDim) { h = Math.round(h * maxDim / w); w = maxDim; }
      else if (h >= w && h > maxDim) { w = Math.round(w * maxDim / h); h = maxDim; }
      const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      cv.getContext('2d').drawImage(img, 0, 0, w, h);
      try { cb(cv.toDataURL('image/jpeg', 0.82)); } catch (e) { cb(null); }
    };
    img.onerror = function () { URL.revokeObjectURL(url); cb(null); };
    img.src = url;
  }

  MB.views.diary = function (root) {
    const child = S.activeChild();
    if (!child) {
      root.innerHTML = `<div class="empty"><div class="em">📸</div><p>เพิ่มข้อมูลลูกก่อน เพื่อเริ่มเก็บความทรงจำ</p><button class="btn" id="add">+ เพิ่มลูกน้อย</button></div>`;
      root.querySelector('#add').onclick = () => MB.views.editChild(null);
      return;
    }
    root.innerHTML = `
      <div class="hero" style="padding:14px 16px">
        <div class="emoji">📸</div>
        <div style="flex:1"><h2 style="font-size:18px">ความทรงจำของ${U.esc(child.name)}</h2><p>เก็บภาพช่วงเวลาน่ารัก ๆ ไว้ย้อนดู</p></div>
      </div>
      <button class="btn pink" id="add-photo">+ เพิ่มรูปความทรงจำ</button>
      <input type="file" id="photo-file" accept="image/*" hidden />
      <div id="diary-grid" style="margin-top:14px"><p class="muted center" style="font-size:13px">กำลังโหลด...</p></div>
      <div class="disclaimer" style="margin-top:14px">🔒 รูปเก็บไว้ใน<b>เครื่องนี้เท่านั้น</b> (ยังไม่ซิงค์ข้ามเครื่อง) — แนะนำสำรองรูปสำคัญไว้ที่อื่นด้วย</div>
    `;

    const fileEl = root.querySelector('#photo-file');
    root.querySelector('#add-photo').onclick = () => fileEl.click();
    fileEl.onchange = (e) => {
      const file = e.target.files && e.target.files[0];
      fileEl.value = '';
      if (!file) return;
      MB.toast('กำลังเตรียมรูป...');
      resizeToDataURL(file, 1200, (dataURL) => {
        if (!dataURL) return MB.toast('อ่านรูปไม่สำเร็จ');
        openSave(child, dataURL);
      });
    };

    loadGrid(root, child);
  };

  async function loadGrid(root, child) {
    const grid = root.querySelector('#diary-grid');
    if (!grid) return;
    let items = [];
    try { items = await MB.diary.list(child.id); } catch (e) {}
    if (!items.length) {
      grid.innerHTML = '<div class="empty"><div class="em">🍼</div><p>ยังไม่มีรูป แตะ “เพิ่มรูปความทรงจำ” เพื่อเริ่มเก็บภาพแรก</p></div>';
      return;
    }
    grid.innerHTML = `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
      ${items.map(it => `<div data-view="${it.id}" style="position:relative;aspect-ratio:1;border-radius:12px;overflow:hidden;cursor:pointer;background:var(--cream-2,#f0e3da)">
        <img src="${it.dataURL}" loading="lazy" style="width:100%;height:100%;object-fit:cover" />
        ${it.date ? `<div style="position:absolute;left:0;right:0;bottom:0;background:linear-gradient(transparent,rgba(0,0,0,.45));color:#fff;font-size:10px;padding:10px 6px 4px">${U.fmtDateTH(it.date)}</div>` : ''}
      </div>`).join('')}
    </div>`;
    grid.querySelectorAll('[data-view]').forEach(n => n.onclick = () => {
      const it = items.find(x => x.id === n.dataset.view);
      if (it) openView(root, child, it);
    });
  }

  function openSave(child, dataURL) {
    MB.sheet({
      title: '📸 บันทึกความทรงจำ',
      html: `
        <div style="text-align:center;margin-bottom:12px"><img src="${dataURL}" style="max-width:100%;max-height:240px;border-radius:12px" /></div>
        <div class="field"><label>วันที่</label><input id="ph-date" type="date" value="${S.todayISO()}" max="${S.todayISO()}" /></div>
        <div class="field"><label>คำบรรยาย (ไม่บังคับ)</label><input id="ph-cap" placeholder="เช่น ยิ้มแรกของลูก 🥰" /></div>
        <button class="btn pink" id="ph-save">บันทึก</button>`,
      onMount(rt) {
        rt.querySelector('#ph-save').onclick = async () => {
          try {
            await MB.diary.add({ id: S.uid(), childId: child.id, date: rt.querySelector('#ph-date').value || S.todayISO(), caption: rt.querySelector('#ph-cap').value.trim(), dataURL });
            MB.closeSheet(); MB.toast('เก็บความทรงจำแล้ว 💖'); MB.go('diary');
          } catch (e) { MB.toast('บันทึกไม่สำเร็จ (พื้นที่เครื่องอาจเต็ม)'); }
        };
      }
    });
  }

  function openView(root, child, it) {
    MB.sheet({
      title: it.date ? U.fmtDateTH(it.date) : 'ความทรงจำ',
      html: `
        <div style="text-align:center"><img src="${it.dataURL}" style="max-width:100%;border-radius:12px" /></div>
        ${it.caption ? `<p style="text-align:center;margin:12px 0 0;font-size:15px">${U.esc(it.caption)}</p>` : ''}
        <button class="btn ghost" id="ph-del" style="margin-top:16px;color:#D9737A">🗑️ ลบรูปนี้</button>`,
      onMount(rt) {
        rt.querySelector('#ph-del').onclick = async () => {
          if (confirm('ลบรูปนี้?')) {
            try { await MB.diary.remove(it.id); } catch (e) {}
            MB.closeSheet(); MB.toast('ลบแล้ว'); MB.go('diary');
          }
        };
      }
    });
  }
})();
