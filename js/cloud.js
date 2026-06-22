/* ตัวจิ๋ว – คลาวด์ซิงค์ผ่าน Supabase
 * - ทางเลือก: ถ้าไม่ตั้งค่า แอพยังทำงานออฟไลน์ 100% เหมือนเดิม
 * - เก็บ state ทั้งก้อนเป็น JSON 1 แถวต่อ 1 บัญชี (ตาราง app_state)
 * - localStorage เป็นหลัก → push ขึ้นคลาวด์อัตโนมัติ (debounce) + realtime ดึงข้ามเครื่อง
 */
window.MB = window.MB || {};
(function () {
  const S = MB.store;
  const TABLE = 'app_state';
  const LS_CFG = 'tuajiw.supa';        // {url, anonKey} ที่ผู้ใช้กรอกในแอพ
  const LS_SYNC = 'tuajiw.lastSync';

  let client = null;
  let user = null;
  let pushTimer = null;
  let channel = null;
  let syncing = false;
  let conflict = false;
  let lastError = null;
  let lastSyncedAt = Number(localStorage.getItem(LS_SYNC) || 0) || null;
  const subs = [];

  /* ---- รหัสประจำเครื่อง (กันเสียงสะท้อนของ realtime) ---- */
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

  function status() {
    return {
      libLoaded: !!window.supabase,
      configured: !!cfg(),
      ready: !!client,
      signedIn: !!user,
      email: user ? user.email : null,
      syncing, conflict, lastSyncedAt, error: lastError
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

  /* รับข้อมูลจากคลาวด์มาเขียนทับ state โดยไม่ push ย้อนกลับ */
  function adoptRemote(data) {
    const hook = S._onSave; S._onSave = null;
    try { S.loadFrom(data || {}); } finally { S._onSave = hook; }
    if (MB.render) { try { MB.render(); } catch (e) {} }
  }

  async function fetchRemote() {
    const { data, error } = await client.from(TABLE)
      .select('data, updated_at, client_id').eq('user_id', user.id).maybeSingle();
    if (error) throw error;
    return data;  // null ถ้ายังไม่มีแถว
  }

  async function pushNow() {
    if (!client || !user) return;
    syncing = true; lastError = null; emit();
    try {
      const row = { user_id: user.id, data: S.state, client_id: CID, updated_at: new Date().toISOString() };
      const { error } = await client.from(TABLE).upsert(row, { onConflict: 'user_id' });
      if (error) throw error;
      conflict = false; setSync(Date.now());
    } catch (e) { lastError = msg(e); }
    finally { syncing = false; emit(); }
  }

  function schedulePush() {
    if (!client || !user) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(pushNow, 1500);
  }

  /* รวมข้อมูลตอนเข้าสู่ระบบ — ไม่ทำลายข้อมูลเงียบ ๆ ถ้าทั้งสองฝั่งมีของ */
  async function reconcile() {
    if (!client || !user) return;
    syncing = true; conflict = false; lastError = null; emit();
    try {
      const remote = await fetchRemote();
      const remoteHas = remote && hasData(remote.data);
      const localHas = !S.isEmpty();
      if (remoteHas && !localHas) {
        adoptRemote(remote.data); setSync(Date.now());
      } else if (!remoteHas && localHas) {
        await pushNow();
      } else if (remoteHas && localHas) {
        if (JSON.stringify(remote.data) === JSON.stringify(S.state)) setSync(Date.now());
        else conflict = true;   // ให้ผู้ใช้เลือกเองในหน้าตั้งค่า
      } else {
        setSync(Date.now());
      }
      subscribe();
    } catch (e) { lastError = msg(e); }
    finally { syncing = false; emit(); }
  }

  function subscribe() {
    if (!client || !user || channel) return;
    try {
      channel = client.channel('app_state_' + user.id)
        .on('postgres_changes',
          { event: '*', schema: 'public', table: TABLE, filter: 'user_id=eq.' + user.id },
          (payload) => {
            const row = payload.new;
            if (!row || row.client_id === CID) return;  // การเปลี่ยนของเราเอง
            adoptRemote(row.data); setSync(Date.now()); emit();
            if (MB.toast) MB.toast('ซิงค์ข้อมูลใหม่จากอีกเครื่อง ☁️');
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
      unsubscribe(); client = null; user = null; lastError = null; emit();
    },

    async init(reinit) {
      if (!window.supabase) { emit(); return; }
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
          if (!user) unsubscribe();
          emit();
        });
        if (user) reconcile(); else emit();
      } catch (e) { lastError = msg(e); emit(); }
    },

    async signUp(email, password) {
      if (!client) throw new Error('ยังไม่ได้ตั้งค่า Supabase');
      const { data, error } = await client.auth.signUp({ email, password });
      if (error) throw error;
      if (data.session) { user = data.session.user; await reconcile(); }
      emit();
      return data;
    },
    async signIn(email, password) {
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
      user = null; conflict = false; emit();
    },

    async syncNow() { if (user) await reconcile(); },
    async pushForce() { conflict = false; await pushNow(); if (MB.toast) MB.toast('อัปโหลดข้อมูลเครื่องนี้ขึ้นคลาวด์แล้ว'); },
    async pullForce() {
      if (!client || !user) return;
      syncing = true; emit();
      try {
        const remote = await fetchRemote();
        adoptRemote(remote ? remote.data : {});
        conflict = false; setSync(Date.now());
        subscribe();
        if (MB.toast) MB.toast('ดึงข้อมูลจากคลาวด์มาแล้ว');
      } catch (e) { lastError = msg(e); }
      finally { syncing = false; emit(); }
    }
  };

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', () => MB.cloud.init());
  else
    MB.cloud.init();
})();
