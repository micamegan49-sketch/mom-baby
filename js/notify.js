/* ตัวจิ๋ว – แจ้งเตือนบนมือถือ (Local Notifications ผ่าน Capacitor)
   เตือนอัตโนมัติจากข้อมูลในเครื่อง: บันทึกประจำวัน · วัคซีนครบกำหนด · นัดหมาย · ครรภ์รายสัปดาห์
   ไม่ต้องมีเซิร์ฟเวอร์ ทำงานแม้ปิดแอพ; บนเว็บ (ไม่ใช่แอพเนทีฟ) จะทำได้แค่แจ้งเตือนทดสอบทันที */
window.MB = window.MB || {};
(function () {
  const S = MB.store, U = MB.util;
  const APP = 'ตัวจิ๋ว 👣';
  const PREF_KEY = 'tuajiw.notify.enabled';
  const NUDGE_HOUR = 19;   // เตือนบันทึกประจำวันตอนเย็น
  const MAX = 58;          // iOS จำกัด local notification ที่ตั้งไว้ล่วงหน้า ~64 รายการ

  const BABY_MSGS = [
    'อย่าลืมบันทึกพัฒนาการและกิจวัตรของลูกวันนี้นะคะ 👶',
    'วันนี้ลูกเป็นยังไงบ้าง? มาจดบันทึกความทรงจำกันค่ะ 📸',
    'แวะมาดูวัคซีนและพัฒนาการตามวัยของลูกน้อยกันค่ะ 💕',
    'บันทึกการนอน/นม/ผ้าอ้อมวันนี้ไว้ ดูสถิติย้อนหลังได้เลยค่ะ 🍼',
    'มาเช็กว่าลูกน้อยพัฒนาการถึงไหนแล้วกันค่ะ ✨',
    'ชั่งน้ำหนัก-วัดส่วนสูงลูกเทียบเกณฑ์ WHO ได้ในแอพนะคะ 📈'
  ];
  const PREG_MSGS = [
    'ลูกน้อยสัปดาห์นี้ตัวเท่าผลไม้อะไรแล้วนะ? มาดูกันค่ะ 🤰',
    'อย่าลืมนับลูกดิ้นและดูแลตัวเองวันนี้นะคะ 💕',
    'แวะมาอ่านเคล็ดลับคุณแม่ตั้งครรภ์ประจำวันกันค่ะ ✨',
    'เตรียมของใช้ลูกน้อยไปถึงไหนแล้ว? มาเช็กลิสต์กันค่ะ 👶',
    'ดูเมนูอาหารและน้ำหนักที่ควรขึ้นสัปดาห์นี้กันค่ะ 🍽️'
  ];

  let _ln = null;
  function C() { return window.Capacitor; }
  function isNative() { const c = C(); return !!(c && c.isNativePlatform && c.isNativePlatform()); }
  function ln() {
    if (_ln) return _ln;
    const c = C(); if (!c) return null;
    if (c.registerPlugin) { _ln = c.registerPlugin('LocalNotifications'); return _ln; }
    _ln = (c.Plugins && c.Plugins.LocalNotifications) || null;
    return _ln;
  }

  function prefEnabled() { const v = localStorage.getItem(PREF_KEY); return v === null ? true : v === '1'; }
  function setPref(on) { try { localStorage.setItem(PREF_KEY, on ? '1' : '0'); } catch (e) {} }
  function hasData() {
    try { return !!(S.activeChild() || (S.preg() && S.preg().active)); } catch (e) { return false; }
  }

  function atLocal(iso, h, m) { const d = U.parseISO(iso); d.setHours(h, m || 0, 0, 0); return d; }

  /* สร้างรายการแจ้งเตือนทั้งหมดจากข้อมูลปัจจุบัน (คืนเป็น array ของ notification object) */
  function buildSchedule() {
    const now = new Date();
    const todayISO = S.todayISO();
    const items = [];   // {title, body, at, extra}
    const add = (title, body, at, go) => { if (at > now) items.push({ title, body, at, extra: go ? { go } : undefined }); };

    // 1) เตือนบันทึกประจำวัน (nudge รายวันตอนเย็น 14 วันข้างหน้า)
    const child = S.activeChild();
    const preg = S.preg();
    const stage = child ? 'baby' : (preg && preg.active ? 'preg' : null);
    if (stage) {
      const pool = stage === 'preg' ? PREG_MSGS : BABY_MSGS;
      let startISO = todayISO;
      if (atLocal(todayISO, NUDGE_HOUR) <= now) startISO = U.addDays(todayISO, 1);
      for (let i = 0; i < 14; i++) {
        const iso = U.addDays(startISO, i);
        add(APP, pool[i % pool.length], atLocal(iso, NUDGE_HOUR), 'home');
      }
    }

    // 2) วัคซีนครบกำหนด (เตือนล่วงหน้า 3 วัน + วันที่ถึงกำหนด) — ทุกคน
    try {
      (S.children() || []).forEach(ch => {
        const vl = MB.vaxList ? MB.vaxList(ch) : [];
        vl.filter(x => !x.done && U.daysBetween(todayISO, x.due) >= 0).forEach(x => {
          const preISO = U.addDays(x.due, -3);
          if (U.daysBetween(todayISO, preISO) >= 0)
            add('ใกล้ถึงกำหนดวัคซีน 💉', ch.name + ': ' + x.name + ' — กำหนด ' + U.fmtDateTH(x.due), atLocal(preISO, 9), 'vax');
          add('วันนี้ถึงกำหนดวัคซีน 💉', ch.name + ': ' + x.name + ' พาลูกไปฉีดได้เลยค่ะ', atLocal(x.due, 9), 'vax');
        });
      });
    } catch (e) {}

    // 3) นัดหมาย (เตือนก่อน 1 วันตอนเย็น + เช้าวันนัด)
    try {
      (S.appts() || []).filter(a => !a.done && U.daysBetween(todayISO, a.date) >= 0).forEach(a => {
        const t = a.time ? ' เวลา ' + a.time + ' น.' : '';
        const preISO = U.addDays(a.date, -1);
        if (U.daysBetween(todayISO, preISO) >= 0)
          add('พรุ่งนี้มีนัด 🔔', a.title + t, atLocal(preISO, 18), 'appt');
        add('วันนี้มีนัด 🔔', a.title + t, atLocal(a.date, 8), 'appt');
      });
    } catch (e) {}

    // 4) ครรภ์รายสัปดาห์ ("สัปดาห์ที่ N แล้ว!") — 8 สัปดาห์ข้างหน้า
    try {
      if (preg && preg.active) {
        const pi = U.pregInfo(preg);
        if (pi) {
          const lmpISO = pi.lmp || (pi.edd ? U.addDays(pi.edd, -280) : null);
          if (lmpISO) {
            for (let w = pi.week + 1; w <= Math.min(40, pi.week + 8); w++) {
              const iso = U.addDays(lmpISO, w * 7);
              add('ตั้งครรภ์สัปดาห์ที่ ' + w + ' แล้ว 🤰',
                'มาดูพัฒนาการลูกน้อยและคำแนะนำสำหรับสัปดาห์นี้กันค่ะ', atLocal(iso, 9), 'preg');
            }
          }
        }
      }
    } catch (e) {}

    // จัดเรียงตามเวลา เอาที่ใกล้ที่สุดก่อน แล้วตัดไม่ให้เกินลิมิต
    items.sort((a, b) => a.at - b.at);
    return items.slice(0, MAX).map((it, i) => ({
      id: 1001 + i,
      title: it.title,
      body: it.body,
      schedule: { at: it.at, allowWhileIdle: true },
      extra: it.extra
    }));
  }

  async function cancelAll(L) {
    try {
      const p = await L.getPending();
      if (p && p.notifications && p.notifications.length)
        await L.cancel({ notifications: p.notifications.map(n => ({ id: n.id })) });
    } catch (e) {}
  }

  /* ล้างของเดิม แล้วตั้งใหม่ทั้งหมดจากข้อมูลปัจจุบัน (เรียกตอนเปิดแอพ / กลับมาหน้าจอ / แก้ข้อมูล) */
  async function reschedule() {
    const L = ln();
    if (!L || !isNative() || !prefEnabled()) return;
    try {
      const perm = await L.checkPermissions();
      if (perm.display !== 'granted') return;
      await cancelAll(L);
      const list = buildSchedule();
      if (list.length) await L.schedule({ notifications: list });
    } catch (e) {}
  }

  let _rzTimer = null;
  function rescheduleSoon() {
    if (!isNative() || !prefEnabled()) return;
    clearTimeout(_rzTimer); _rzTimer = setTimeout(reschedule, 800);
  }

  /* เรียกตอนบูตแอพ */
  async function init() {
    if (!isNative()) return;
    const L = ln(); if (!L) return;
    // แตะการแจ้งเตือน → เปิดหน้าที่เกี่ยวข้อง
    try {
      L.addListener('localNotificationActionPerformed', ev => {
        const go = ev && ev.notification && ev.notification.extra && ev.notification.extra.go;
        if (go && MB.go) setTimeout(() => MB.go(go), 60);
      });
    } catch (e) {}
    // กลับมาที่แอพ → คำนวณ/ตั้งเตือนใหม่ให้ทันข้อมูลล่าสุด
    document.addEventListener('visibilitychange', () => { if (!document.hidden) rescheduleSoon(); });

    if (!prefEnabled() || !hasData()) return;   // ยังไม่มีข้อมูล → รอให้ผู้ใช้เพิ่มลูก/ครรภ์ก่อนค่อยขออนุญาต
    try {
      let perm = await L.checkPermissions();
      if (perm.display === 'prompt' || perm.display === 'prompt-with-rationale') perm = await L.requestPermissions();
      if (perm.display === 'granted') await reschedule();
    } catch (e) {}
  }

  /* เปิดใช้งาน (จากปุ่มใน Settings) */
  async function enable() {
    setPref(true);
    if (isNative()) {
      const L = ln(); if (!L) return { supported: false };
      try {
        const perm = await L.requestPermissions();
        if (perm.display !== 'granted') return { supported: true, granted: false };
        await reschedule();
        return { supported: true, granted: true };
      } catch (e) { return { supported: true, granted: false }; }
    }
    // เว็บ: ทำได้แค่ขออนุญาต + ยิงตัวอย่างทันที (การตั้งเวลาเต็มรูปแบบต้องเป็นแอพเนทีฟ)
    if ('Notification' in window) {
      try {
        const p = await Notification.requestPermission();
        if (p === 'granted') {
          try { new Notification(APP, { body: 'ตัวอย่างการแจ้งเตือน — ในแอพจะเตือนวัคซีน นัดหมาย และบันทึกประจำวันให้อัตโนมัติค่ะ' }); } catch (e) {}
          return { supported: true, web: true, granted: true };
        }
        return { supported: true, web: true, granted: false };
      } catch (e) { return { supported: true, web: true, granted: false }; }
    }
    return { supported: false };
  }

  async function disable() {
    setPref(false);
    const L = ln();
    if (L && isNative()) await cancelAll(L);
  }

  MB.notify = {
    init, enable, disable, reschedule, rescheduleSoon,
    isEnabled: prefEnabled,
    supported: function () { return isNative() || ('Notification' in window); },
    isNative: isNative
  };
})();
