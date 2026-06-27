/* ตัวจิ๋ว – คลาวด์ซิงค์ + แชร์หลายบัญชี (บ้าน/ครัวเรือน) ผ่าน Supabase
 * - ทางเลือก: ถ้าไม่ตั้งค่า แอพยังทำงานออฟไลน์ 100%
 * - ข้อมูลเก็บเป็น JSON ต่อ "บ้าน" (homes) ที่มีสมาชิกหลายคนได้
 * - เจ้าของสร้างรหัสเชิญ → คนอื่นเข้าร่วมช่วยบันทึก (สิทธิ์ owner/editor/viewer)
 */
window.MB = window.MB || {};
(function () {
  const S = MB.store;
  const LS_CFG = 'tuajiw.supa';
  const LS_SYNC = 'tuajiw.lastSync';
  const LS_HOME = 'tuajiw.homeId';

  let client = null;
  let user = null;
  let homeId = null;
  let homes = [];          // [{id,name,role,owner_id}]
  let pushTimer = null;
  let channel = null;
  let syncing = false;
  let conflict = false;
  let lastError = null;
  let lastSyncedAt = Number(localStorage.getItem(LS_SYNC) || 0) || null;
  const subs = [];

  function clientId() {
    let id = localStorage.getItem('tuajiw.clientId');
    if (!id) { id = 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); localStorage.setItem('tuajiw.clientId', id); }
    return id;
  }
  const CID = clientId();

  function cfg() {
    try { const o = JSON.parse(localStorage.getItem(LS_CFG) || 'null'); if (o && o.url && o.anonKey) return o; } catch (e) {}
    if (MB.SUPA && MB.SUPA.url && MB.SUPA.anonKey) return { url: MB.SUPA.url, anonKey: MB.SUPA.anonKey };
    return null;
  }
  function msg(e) { return (e && (e.message || e.error_description || e.msg)) || String(e || ''); }
  function emit() { subs.forEach(fn => { try { fn(status()); } catch (e) {} }); }
  function setSync(ts) { lastSyncedAt = ts; if (ts) localStorage.setItem(LS_SYNC, String(ts)); }

  function curHome() { return homes.find(h => h.id === homeId) || null; }
  function canEdit() { const h = curHome(); return !!h && (h.role === 'owner' || h.role === 'editor'); }

  function status() {
    const h = curHome();
    return {
      libLoaded: !!window.supabase,
      configured: !!cfg(),
      ready: !!client,
      signedIn: !!user,
      email: user ? user.email : null,
      syncing, conflict, lastSyncedAt, error: lastError,
      homeId,
      homeName: h ? h.name : null,
      role: h ? h.role : null,
      isOwner: h ? h.role === 'owner' : false,
      canEdit: canEdit(),
      homes: homes.slice()
    };
  }

  function hasData(d) {
    if (!d) return false;
    return !!((d.children && d.children.length) ||
      (d.pregnancy && d.pregnancy.active) ||
      (d.appointments && d.appointments.length) ||
      (d.logsByChild && Object.keys(d.logsByChild).length) ||
      (d.measByChild && Object.keys(d.measByChild).length) ||
      (d.deliveryPkgs && d.deliveryPkgs.length) ||
      (d.vaxPricePkgs && d.vaxPricePkgs.length));
  }

  function adoptRemote(data) {
    const hook = S._onSave; S._onSave = null;
    try { S.loadFrom(data || {}); } finally { S._onSave = hook; }
    if (MB.render) { try { MB.render(); } catch (e) {} }
  }

  async function fetchRemote() {
    if (!homeId) return null;
    const { data, error } = await client.from('app_state')
      .select('data, updated_at, client_id').eq('home_id', homeId).maybeSingle();
    if (error) throw error;
    return data;
  }

  async function pushNow() {
    if (!client || !user || !homeId) return;
    if (!canEdit()) { lastError = 'บัญชีนี้ดูได้อย่างเดียว (ไม่มีสิทธิ์บันทึก)'; emit(); return; }
    syncing = true; lastError = null; emit();
    try {
      const row = { home_id: homeId, data: S.state, client_id: CID, updated_at: new Date().toISOString() };
      const { error } = await client.from('app_state').upsert(row, { onConflict: 'home_id' });
      if (error) throw error;
      conflict = false; setSync(Date.now());
    } catch (e) { lastError = msg(e); }
    finally { syncing = false; emit(); }
  }

  function schedulePush() {
    if (!client || !user || !homeId || !canEdit()) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(pushNow, 1500);
  }

  /* หาบ้านของผู้ใช้ (สร้างบ้านตัวเองถ้ายังไม่มี) แล้วเลือกบ้านปัจจุบัน */
  async function resolveHomes() {
    const { data: ownId, error: e1 } = await client.rpc('ensure_home');
    if (e1) throw e1;
    const { data: mem, error: e2 } = await client.from('home_members')
      .select('home_id, role, homes(name, owner_id)').eq('user_id', user.id);
    if (e2) throw e2;
    homes = (mem || []).map(m => ({
      id: m.home_id, role: m.role,
      name: m.homes ? m.homes.name : 'บ้าน',
      owner_id: m.homes ? m.homes.owner_id : null
    }));
    const stored = localStorage.getItem(LS_HOME);
    if (stored && homes.some(h => h.id === stored)) homeId = stored;
    else homeId = (homes.find(h => h.id === ownId) || homes[0] || {}).id || ownId;
    if (homeId) localStorage.setItem(LS_HOME, homeId);
  }

  async function reconcile() {
    if (!client || !user) return;
    syncing = true; conflict = false; lastError = null; emit();
    try {
      await resolveHomes();
      const remote = await fetchRemote();
      const remoteHas = remote && hasData(remote.data);
      const localHas = !S.isEmpty();
      if (remoteHas && !localHas) { adoptRemote(remote.data); setSync(Date.now()); }
      else if (!remoteHas && localHas) { await pushNow(); }
      else if (remoteHas && localHas) {
        if (JSON.stringify(remote.data) === JSON.stringify(S.state)) setSync(Date.now());
        else conflict = true;
      } else setSync(Date.now());
      subscribe();
    } catch (e) { lastError = msg(e); }
    finally { syncing = false; emit(); }
  }

  async function pullCurrent() {
    const remote = await fetchRemote();
    adoptRemote(remote ? remote.data : {});
    conflict = false; setSync(Date.now());
  }

  function subscribe() {
    if (!client || !user || !homeId || channel) return;
    try {
      channel = client.channel('as_' + homeId)
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'app_state', filter: 'home_id=eq.' + homeId },
          (payload) => {
            const row = payload.new;
            if (!row || row.client_id === CID) return;
            adoptRemote(row.data); setSync(Date.now()); emit();
            if (MB.toast) MB.toast('ซิงค์ข้อมูลใหม่จากสมาชิกในบ้าน ☁️');
          })
        .subscribe();
    } catch (e) {}
  }
  function unsubscribe() { if (channel) { try { client.removeChannel(channel); } catch (e) {} channel = null; } }

  MB.cloud = {
    status,
    config: cfg,
    onChange(fn) { subs.push(fn); return () => { const i = subs.indexOf(fn); if (i >= 0) subs.splice(i, 1); }; },

    saveConfig(url, anonKey) {
      url = (url || '').trim().replace(/\/+$/, '');
      anonKey = (anonKey || '').trim();
      localStorage.setItem(LS_CFG, JSON.stringify({ url, anonKey }));
      return MB.cloud.init(true);
    },
    clearConfig() {
      localStorage.removeItem(LS_CFG);
      unsubscribe(); client = null; user = null; homes = []; homeId = null; lastError = null; emit();
    },

    async init(reinit) {
      if (!window.supabase) {
        await loadLib();                              // โหลดไลบรารี Supabase แบบ lazy เมื่อต้องใช้จริง
        if (!window.supabase) { emit(); return; }     // โหลดไม่ได้ (ออฟไลน์) — แอพยังทำงานออฟไลน์ได้
      }
      const c = cfg();
      if (!c) { emit(); return; }
      if (client && !reinit) { emit(); return; }
      try {
        unsubscribe();
        client = window.supabase.createClient(c.url, c.anonKey, {
          auth: { persistSession: true, autoRefreshToken: true }
        });
        S._onSave = schedulePush;
        const { data } = await client.auth.getSession();
        user = data && data.session ? data.session.user : null;
        client.auth.onAuthStateChange((event, session) => {
          const was = !!user;
          user = session ? session.user : null;
          if (user && !was) reconcile();
          if (!user) { unsubscribe(); homes = []; homeId = null; }
          emit();
        });
        if (user) reconcile(); else emit();
      } catch (e) { lastError = msg(e); emit(); }
    },

    async signUp(email, password) {
      if (!client) await MB.cloud.init();
      if (!client) throw new Error('ยังไม่ได้ตั้งค่า Supabase');
      const { data, error } = await client.auth.signUp({ email, password });
      if (error) throw error;
      if (data.session) { user = data.session.user; await reconcile(); }
      emit();
      return data;
    },
    async signIn(email, password) {
      if (!client) await MB.cloud.init();
      if (!client) throw new Error('ยังไม่ได้ตั้งค่า Supabase');
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      user = data.user;
      await reconcile();
      emit();
      return data;
    },
    async signOut() {
      if (!client) return;
      unsubscribe();
      try { await client.auth.signOut(); } catch (e) {}
      user = null; homes = []; homeId = null; conflict = false;
      localStorage.removeItem(LS_HOME);
      emit();
    },

    /* ลบบัญชีและข้อมูลถาวร (ข้อกำหนด App Store 5.1.1(v): สมัครได้ ต้องลบได้จากในแอป)
       เรียก RPC delete_account() ฝั่งเซิร์ฟเวอร์ที่ลบทั้งข้อมูล (homes/app_state/invites/members)
       และลบ auth user ออกจากระบบจริง แล้วออกจากระบบในเครื่อง */
    async deleteAccount() {
      if (!client || !user) throw new Error('ต้องเข้าสู่ระบบก่อน');
      const { error } = await client.rpc('delete_account');
      if (error) throw error;
      unsubscribe();
      try { await client.auth.signOut(); } catch (e) {}
      user = null; homes = []; homeId = null; conflict = false;
      localStorage.removeItem(LS_HOME);
      emit();
    },

    async syncNow() { if (user) await reconcile(); },
    async pushForce() { conflict = false; await pushNow(); if (MB.toast) MB.toast('อัปโหลดข้อมูลเครื่องนี้ขึ้นคลาวด์แล้ว'); },
    async pullForce() {
      if (!client || !user) return;
      syncing = true; emit();
      try { await pullCurrent(); subscribe(); if (MB.toast) MB.toast('ดึงข้อมูลจากคลาวด์มาแล้ว'); }
      catch (e) { lastError = msg(e); }
      finally { syncing = false; emit(); }
    },

    /* ---------- บ้าน & การแชร์ ---------- */
    homes() { return homes.slice(); },
    currentHomeId() { return homeId; },

    async switchHome(id) {
      if (!client || !user || id === homeId) return;
      syncing = true; emit();
      try {
        if (canEdit()) await pushNow();          // เซฟบ้านเดิมก่อน
        unsubscribe();
        homeId = id; localStorage.setItem(LS_HOME, id);
        await pullCurrent();                      // ดึงข้อมูลบ้านใหม่มาแสดง
        subscribe();
      } catch (e) { lastError = msg(e); }
      finally { syncing = false; emit(); }
    },

    async renameHome(name) {
      if (!client || !homeId) return;
      const { error } = await client.from('homes').update({ name: (name || '').trim() || 'ครอบครัวของฉัน' }).eq('id', homeId);
      if (error) throw error;
      const h = curHome(); if (h) h.name = (name || '').trim() || 'ครอบครัวของฉัน';
      emit();
    },

    async createInvite(role) {
      if (!client || !homeId) throw new Error('ยังไม่ได้เลือกบ้าน');
      const { data, error } = await client.rpc('create_invite', { h: homeId, r: role === 'viewer' ? 'viewer' : 'editor' });
      if (error) throw error;
      return data; // รหัสเชิญ
    },

    async redeemInvite(code) {
      if (!client || !user) throw new Error('ต้องเข้าสู่ระบบก่อน');
      const { data: hid, error } = await client.rpc('redeem_invite', { invite_code: (code || '').trim() });
      if (error) throw error;
      await resolveHomes();
      await MB.cloud.switchHome(hid);
      return hid;
    },

    async listMembers() {
      if (!client || !homeId) return [];
      const { data, error } = await client.from('home_members')
        .select('user_id, role, email, joined_at').eq('home_id', homeId).order('joined_at');
      if (error) throw error;
      return data || [];
    },
    async removeMember(uid) {
      if (!client || !homeId) return;
      const { error } = await client.from('home_members').delete().eq('home_id', homeId).eq('user_id', uid);
      if (error) throw error;
      emit();
    },
    async leaveHome(id) {
      if (!client || !user) return;
      await client.from('home_members').delete().eq('home_id', id).eq('user_id', user.id);
      localStorage.removeItem(LS_HOME);
      await resolveHomes();
      await pullCurrent(); subscribe(); emit();
    }
  };

  /* โหลดไลบรารี Supabase (204KB) แบบ lazy — ไม่บล็อกการเปิดแอพ
     โหลดเบื้องหลังหลังแอพพร้อมแล้ว (ฟีเจอร์ซิงค์เป็นทางเลือก ใช้ไม่บ่อย) */
  // โหลดไลบรารี Supabase (204KB) แบบ lazy — โหลดเฉพาะเมื่อต้องใช้จริง (คืน Promise โหลดครั้งเดียว)
  function loadLib() {
    if (window.supabase) return Promise.resolve();
    if (loadLib._p) return loadLib._p;
    loadLib._p = new Promise(function (resolve) {
      var s = document.createElement('script');
      s.src = './js/lib/supabase.js';
      s.async = true;
      s.onload = function () { resolve(); };
      s.onerror = function () { resolve(); };   // โหลดไม่ได้ก็ไม่เป็นไร แอพทำงานออฟไลน์ต่อได้
      document.head.appendChild(s);
    });
    return loadLib._p;
  }
  // เคยล็อกอินค้างไว้ไหม — เช็กจาก session ที่ supabase เก็บใน localStorage (ไม่ต้องโหลดไลบรารี)
  function hasSavedSession() {
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && /^sb-.*-auth-token$/.test(k)) return true;
      }
    } catch (e) {}
    return false;
  }
  function bootCloud() {
    // โหลด+ซิงค์อัตโนมัติเฉพาะผู้ที่ "เคยล็อกอินแล้ว" เท่านั้น
    // ผู้ใช้ใหม่/ยังไม่ล็อกอิน จะโหลดไลบรารีตอนเปิด "ตั้งค่า → บัญชี & ซิงค์" แทน (ประหยัด ~204KB ตอนเปิดแอพ)
    if (!cfg() || !hasSavedSession()) return;
    var idle = window.requestIdleCallback || function (f) { return setTimeout(f, 1200); };
    idle(function () { MB.cloud.init(); });
  }
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', bootCloud);
  else
    bootCloud();
})();
