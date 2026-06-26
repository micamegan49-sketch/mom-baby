/* ตัวจิ๋ว – แกนหลัก: ตัวช่วย, เราเตอร์, แถบนำทาง, ชีต, ทोสต์ */
window.MB = window.MB || {};
(function () {
  const S = MB.store;

  /* ============ ตัวช่วยทั่วไป ============ */
  const z = n => String(n).padStart(2, '0');
  const THMON = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

  function parseISO(iso) { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); }
  function startOfToday() { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function addDays(iso, n) {
    const d = parseISO(iso); d.setDate(d.getDate() + n);
    return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate());
  }
  function daysBetween(aISO, bISO) {
    return Math.round((parseISO(bISO) - parseISO(aISO)) / 86400000);
  }
  function fmtDateTH(iso) {
    if (!iso) return '-';
    const d = parseISO(iso);
    return d.getDate() + ' ' + THMON[d.getMonth()] + ' ' + (d.getFullYear() + 543);
  }
  function fmtTime(ts) { const d = new Date(ts); return z(d.getHours()) + ':' + z(d.getMinutes()); }
  function relTime(ts) {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return 'เมื่อสักครู่';
    if (s < 3600) return Math.floor(s / 60) + ' นาทีที่แล้ว';
    if (s < 86400) return Math.floor(s / 3600) + ' ชม.ที่แล้ว';
    const d = Math.floor(s / 86400);
    if (d === 1) return 'เมื่อวาน';
    if (d < 7) return d + ' วันที่แล้ว';
    return fmtDateTH(new Date(ts).toISOString().slice(0, 10));
  }

  /* อายุเด็กจากวันเกิด */
  function ageInfo(birthISO) {
    const b = parseISO(birthISO), now = startOfToday();
    let years = now.getFullYear() - b.getFullYear();
    let months = now.getMonth() - b.getMonth();
    let days = now.getDate() - b.getDate();
    if (days < 0) { months--; const pm = new Date(now.getFullYear(), now.getMonth(), 0).getDate(); days += pm; }
    if (months < 0) { years--; months += 12; }
    const totalMonths = years * 12 + months;
    const totalDays = Math.round((now - b) / 86400000);
    let label;
    if (totalDays < 0) label = 'ยังไม่เกิด';
    else if (totalMonths < 1) label = totalDays + ' วัน';
    else if (years < 1) label = months + ' เดือน' + (days ? ' ' + days + ' วัน' : '');
    else label = years + ' ปี' + (months ? ' ' + months + ' เดือน' : '');
    // อายุเป็นเดือนแบบทศนิยม (สำหรับกราฟ)
    const exactMonths = totalDays / 30.4375;
    return { years, months, days, totalMonths, totalDays, exactMonths, label };
  }

  /* ข้อมูลอายุครรภ์ */
  function pregInfo(preg) {
    let edd = preg.edd, lmp = preg.lmp;
    if (!edd && lmp) edd = addDays(lmp, 280);
    if (!edd) return null;
    const today = startOfToday(), eddDate = parseISO(edd);
    const daysLeft = Math.round((eddDate - today) / 86400000);
    // อายุครรภ์ยึด "ประจำเดือนครั้งสุดท้าย (LMP)" เป็นหลัก = อายุครรภ์จริง
    // ไม่เพี้ยนตามวันนัดผ่าคลอด/วันคลอดที่หมอกำหนด (ถ้าไม่มี LMP ค่อยคิดจากกำหนดคลอด = 40 สัปดาห์)
    const daysPreg = lmp ? Math.round((today - parseISO(lmp)) / 86400000) : (280 - daysLeft);
    let week = Math.floor(daysPreg / 7);
    let day = ((daysPreg % 7) + 7) % 7;
    week = Math.max(0, Math.min(42, week));
    const trimester = week < 14 ? 1 : week < 28 ? 2 : 3;
    return { edd, eddDate, daysLeft, daysPreg, week, day, trimester, lmp };
  }

  function el(html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  /* ============ ทੋสต์ ============ */
  function toast(msg) {
    document.querySelectorAll('.toast').forEach(t => t.remove());
    const t = el(`<div class="toast">${esc(msg)}</div>`);
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 1900);
  }

  /* ============ บอตทอมชีต ============ */
  let sheetCleanup = null;
  function sheet(opts) {
    closeSheet();
    const back = el(`<div class="sheet-backdrop"><div class="sheet"><div class="grab"></div>${opts.title ? `<h3>${esc(opts.title)}</h3>` : ''}<div class="sheet-body"></div></div></div>`);
    back.querySelector('.sheet-body').innerHTML = opts.html || '';
    back.addEventListener('click', e => { if (e.target === back) closeSheet(); });
    document.body.appendChild(back);
    sheetCleanup = opts.onClose || null;
    if (opts.onMount) opts.onMount(back.querySelector('.sheet'));
    return back;
  }
  function closeSheet() {
    if (sheetCleanup) { try { sheetCleanup(); } catch (e) {} sheetCleanup = null; }
    document.querySelectorAll('.sheet-backdrop').forEach(s => s.remove());
  }

  /* ============ ตัวเลือกเด็ก ============ */
  function openChildSwitcher() {
    const kids = S.children();
    const preg = S.preg();
    let rows = kids.map(c => {
      const a = ageInfo(c.birthDate);
      const active = c.id === (S.activeChild() || {}).id;
      return `<div class="list-item" data-pick="${c.id}">
        <div class="ic">${c.emoji || '👶'}</div>
        <div class="body"><div class="t">${esc(c.name)} ${active ? '✓' : ''}</div><div class="s">${a.label} · เกิด ${fmtDateTH(c.birthDate)}</div></div>
        <button class="btn ghost sm" data-edit-kid="${c.id}" style="width:auto;padding:6px 10px">✏️ แก้</button>
      </div>`;
    }).join('');
    if (preg.active) {
      const p = pregInfo(preg);
      rows = `<div class="list-item" data-goto="preg"><div class="ic">🤰</div><div class="body"><div class="t">${esc(preg.name || 'การตั้งครรภ์')}</div><div class="s">${p ? 'สัปดาห์ที่ ' + p.week : 'โหมดตั้งครรภ์'}</div></div></div>` + rows;
    }
    sheet({
      title: 'เลือกโปรไฟล์',
      html: (rows || '<p class="muted center">ยังไม่มีข้อมูล</p>') +
        `<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">
           <button class="btn ghost" data-add-baby style="flex:1">+ เพิ่มลูก</button>
           <button class="btn ghost" data-add-preg style="flex:1">🤰 ตั้งครรภ์</button>
           <button class="btn ghost" data-plan style="flex:1">🌷 วางแผน</button>
         </div>`,
      onMount(root) {
        root.querySelectorAll('[data-edit-kid]').forEach(n => n.onclick = (e) => { e.stopPropagation(); closeSheet(); MB.views.editChild(kids.find(k => k.id === n.dataset.editKid)); });
        root.querySelectorAll('[data-pick]').forEach(n => n.onclick = () => { S.setActiveChild(n.dataset.pick); closeSheet(); render(); });
        root.querySelectorAll('[data-goto]').forEach(n => n.onclick = () => { closeSheet(); go(n.dataset.goto); });
        root.querySelector('[data-add-baby]').onclick = () => { closeSheet(); MB.views.editChild(null); };
        root.querySelector('[data-add-preg]').onclick = () => { closeSheet(); go('preg'); };
        root.querySelector('[data-plan]').onclick = () => { closeSheet(); go('plan'); };
      }
    });
  }

  /* ============ เราเตอร์ ============ */
  const TABS = [
    { id: 'home',    label: 'หน้าหลัก',  ic: '🏠' },
    { id: 'log',     label: 'บันทึก',    ic: '📝' },
    { id: 'vax',     label: 'วัคซีน',    ic: '💉' },
    { id: 'growth',  label: 'เติบโต',    ic: '📈' },
    { id: 'develop', label: 'ความรู้',   ic: '📚' }
  ];
  let current = 'home';
  let currentParams = {};

  function go(route, params) {
    current = route;
    render(params);
    window.scrollTo(0, 0);            // เลื่อนขึ้นบนสุดเมื่อเปลี่ยนหน้า (เลื่อนแบบเอกสารปกติ)
  }

  /* ลิงก์ลึกผ่าน URL hash เช่น #develop (บทความ/ความรู้), #pregnancy, #prices, #vaccine
     ใช้ให้ลิงก์ภายนอก (ริชเมนู LINE/เพจ) เปิดตรงไปยังหน้าที่ต้องการ */
  function routeFromHash() {
    const h = (location.hash || '').replace(/^#\/?/, '').trim();
    if (!h) return false;
    const [name, qs] = h.split('?');
    const params = {};
    if (qs) qs.split('&').forEach(kv => { const [k, v] = kv.split('='); if (k) params[k] = decodeURIComponent(v || ''); });
    const alias = { articles: ['develop', { tab: 'articles' }], knowledge: ['develop', null], vaccine: ['vax', null], vaccines: ['vax', null], cost: ['prices', null], raising: ['prices', { tab: 'raising' }] };
    if (alias[name]) { go(alias[name][0], alias[name][1] || params); return true; }
    if (MB.views[name]) { go(name, params); return true; }
    return false;
  }

  function renderAppbar() {
    const bar = document.getElementById('appbar');
    const child = S.activeChild();
    const preg = S.preg();
    let pill = '';
    if (child) {
      const a = ageInfo(child.birthDate);
      pill = `<button class="child-pill" id="childPill"><span class="avatar">${child.emoji || '👶'}</span><span class="nm">${esc(child.name)} · ${esc(a.label)}</span></button>`;
    } else if (preg.active) {
      const p = pregInfo(preg);
      pill = `<button class="child-pill" id="childPill"><span class="avatar">🤰</span><span class="nm">${p ? 'สัปดาห์ ' + p.week : 'ตั้งครรภ์'}</span></button>`;
    }
    const nb = (MB.buildNotifications ? MB.buildNotifications() : []).length;
    const bell = `<button class="icon-btn" id="bellBtn" aria-label="การแจ้งเตือน">🔔${nb ? `<span class="badge-dot">${nb > 9 ? '9+' : nb}</span>` : ''}</button>`;
    bar.innerHTML = `<div class="logo"><span class="mark">👣</span> ตัวจิ๋ว</div>
      <div class="spacer"></div>${pill}${bell}
      <button class="child-pill" id="settingsBtn" style="max-width:none"><span class="avatar">⚙️</span></button>`;
    const cp = document.getElementById('childPill');
    if (cp) cp.onclick = openChildSwitcher;
    document.getElementById('bellBtn').onclick = openNotifications;
    document.getElementById('settingsBtn').onclick = () => go('settings');
  }

  function renderTabbar() {
    const tb = document.getElementById('tabbar');
    // ค่าวัคซีน → ไฮไลต์ "วัคซีน" · ค่าคลอด → อยู่ใต้ตั้งครรภ์ (ไฮไลต์ "หน้าหลัก") · ที่เหลืออยู่ใต้ "ความรู้"
    const activeTab = (current === 'prices' && currentParams.tab === 'vaccine') ? 'vax'
      : (current === 'prices' && currentParams.tab === 'delivery') ? 'home'
      : ['prices', 'insurance', 'pump', 'diaper', 'formula', 'groups'].includes(current) ? 'develop' : current;
    tb.innerHTML = TABS.map(t =>
      `<button data-tab="${t.id}" class="${activeTab === t.id ? 'active' : ''}"><span class="ic">${t.ic}</span>${t.label}</button>`
    ).join('');
    tb.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => go(b.dataset.tab));
  }

  function render(params) {
    currentParams = params || {};
    renderAppbar();
    renderTabbar();
    const view = document.getElementById('view');
    view.innerHTML = '';
    const fn = MB.views[current] || MB.views.home;
    // กัน view ใดพังแล้วทำให้ทั้งหน้า "กดอะไรก็ไม่ไป" — แท็บล่างยังนำทางได้เสมอ
    try { fn(view, params); }
    catch (e) {
      view.innerHTML = '<div class="empty"><div class="em">⚠️</div><p>หน้านี้ขัดข้องชั่วคราว<br/>ลองแตะเมนูอื่นด้านล่าง หรือปิด-เปิดแอปใหม่</p></div>';
      try { console.error('view render error:', e); } catch (_) {}
    }
  }

  /* ============ แจ้งเตือน (รวมศูนย์) ============ */
  function openNotifications() {
    const items = MB.buildNotifications ? MB.buildNotifications() : [];
    const body = items.length
      ? items.map((n, i) => `<div class="notif-item" data-i="${i}">
          <div class="ic ${n.cls || ''}">${n.em}</div>
          <div class="body"><div class="t">${esc(n.title)}</div>${n.sub ? `<div class="s">${esc(n.sub)}</div>` : ''}</div>
          ${n.go ? '<div class="chev">›</div>' : ''}
        </div>`).join('')
      : `<div class="empty" style="padding:22px 8px"><div class="em">🔕</div><p>ยังไม่มีการแจ้งเตือน<br/>เราจะเตือนเมื่อใกล้กำหนดวัคซีน นัดหมาย หรือถึงเวลาชั่งน้ำหนัก</p></div>`;
    sheet({
      title: '🔔 การแจ้งเตือน',
      html: body,
      onMount(rt) {
        rt.querySelectorAll('[data-i]').forEach(n => n.onclick = () => {
          const it = items[+n.dataset.i];
          closeSheet();
          if (it && it.go) go(it.go, it.params);
        });
      }
    });
  }

  /* ============ เปิดเผย API ============ */
  MB.util = { parseISO, startOfToday, addDays, daysBetween, fmtDateTH, fmtTime, relTime, ageInfo, pregInfo, el, esc, z };
  MB.toast = toast;
  MB.sheet = sheet;
  MB.closeSheet = closeSheet;
  MB.go = go;
  MB.render = render;
  MB.rerender = function (params) { render(params); };   // เรนเดอร์ซ้ำหน้าเดิมโดยไม่เลื่อนจอขึ้นบน
  MB.openChildSwitcher = openChildSwitcher;
  MB.openNotifications = openNotifications;

  /* ============ เริ่มต้น ============ */
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); MB._installPrompt = e; });

  document.addEventListener('DOMContentLoaded', () => {
    if (!routeFromHash()) render();
    window.addEventListener('hashchange', routeFromHash);
    // เลิกใช้ service worker ทั้งหมด (ทั้งเว็บ/เนทีฟ) — SW เดิมทำให้มือถือค้างที่แคชเก่า/ไฟล์ปนรุ่น
    // โหลดสดจากเน็ตเสมอ = ของใหม่ ครบ ไม่ค้าง (sw.js ตัวปิดตัวเองจะล้างแคช+เลิก SW ให้เครื่องที่ยังค้างอยู่)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations()
        .then(function (rs) { rs.forEach(function (r) { r.unregister(); }); }).catch(function () {});
    }
    if (window.caches && caches.keys) {
      caches.keys().then(function (ks) { ks.forEach(function (k) { caches.delete(k); }); }).catch(function () {});
    }
  });
})();
