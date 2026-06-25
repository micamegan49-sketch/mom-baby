/* ตัวจิ๋ว – ชั้นเก็บข้อมูล (localStorage) ทำงานออฟไลน์ 100% */
window.MB = window.MB || {};
(function () {
  const KEY = 'tuajiw.state.v1';

  const DEFAULT = {
    v: 1,
    activeChildId: null,
    children: [],          // {id,name,sex:'M'|'F',birthDate:'YYYY-MM-DD',emoji}
    pregnancy: {           // โหมดตั้งครรภ์ (1 ครรภ์)
      active: false, edd: null, lmp: null, name: '',
      prePregWeight: null, height: null,
      weights: [],         // {id,date,kg}
      kicks: [],           // {id,date,count,ms}
      checklist: {}        // { itemId: true }
    },
    activeTimer: null,      // {childId,type:'feed'|'sleep',side,startTs}
    appointments: [],       // {id,childId,title,date,time,kind,note,done}
    deliveryPkgs: [],       // ราคาห้องคลอดที่ผู้ใช้เพิ่มเอง
    vaxPricePkgs: [],       // ราคาแพ็กเกจวัคซีนที่ผู้ใช้เพิ่มเอง
    logsByChild: {},        // id -> [ {id,ts,type,...} ]
    measByChild: {},        // id -> [ {id,date,weight,height,head} ]
    vaxByChild: {},         // id -> { vid: {done,date} }
    msByChild: {}           // id -> { mid: {done,date} }
  };

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return structuredClone(DEFAULT);
      const s = JSON.parse(raw);
      return Object.assign(structuredClone(DEFAULT), s);
    } catch (e) {
      console.warn('load failed', e);
      return structuredClone(DEFAULT);
    }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { console.warn('save failed', e); }
    if (store._onSave) { try { store._onSave(); } catch (e) {} }   // hook คลาวด์ซิงค์
  }
  function uid() {
    return 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  const store = {
    get state() { return state; },
    save,
    uid,

    // ---------- เด็ก ----------
    children() { return state.children; },
    activeChild() {
      return state.children.find(c => c.id === state.activeChildId) || state.children[0] || null;
    },
    setActiveChild(id) { state.activeChildId = id; save(); },
    addChild(data) {
      const c = Object.assign({ id: uid(), emoji: '👶' }, data);
      state.children.push(c);
      if (!state.activeChildId) state.activeChildId = c.id;
      save();
      return c;
    },
    updateChild(id, patch) {
      const c = state.children.find(x => x.id === id);
      if (c) Object.assign(c, patch);
      save();
    },
    removeChild(id) {
      state.children = state.children.filter(c => c.id !== id);
      delete state.logsByChild[id];
      delete state.measByChild[id];
      delete state.vaxByChild[id];
      delete state.msByChild[id];
      if (state.activeChildId === id) state.activeChildId = state.children[0]?.id || null;
      save();
    },

    // ---------- บันทึกประจำวัน ----------
    logs(childId) { return state.logsByChild[childId] || []; },
    addLog(childId, log) {
      const arr = state.logsByChild[childId] || (state.logsByChild[childId] = []);
      const item = Object.assign({ id: uid(), ts: Date.now() }, log);
      arr.unshift(item);
      save();
      return item;
    },
    removeLog(childId, logId) {
      const arr = state.logsByChild[childId];
      if (arr) state.logsByChild[childId] = arr.filter(l => l.id !== logId);
      save();
    },

    // ---------- การเจริญเติบโต ----------
    measurements(childId) {
      return (state.measByChild[childId] || []).slice().sort((a, b) => a.date.localeCompare(b.date));
    },
    addMeasurement(childId, m) {
      const arr = state.measByChild[childId] || (state.measByChild[childId] = []);
      arr.push(Object.assign({ id: uid() }, m));
      save();
    },
    removeMeasurement(childId, id) {
      const arr = state.measByChild[childId];
      if (arr) state.measByChild[childId] = arr.filter(x => x.id !== id);
      save();
    },

    // ---------- วัคซีน ----------
    vax(childId) { return state.vaxByChild[childId] || (state.vaxByChild[childId] = {}); },
    toggleVax(childId, vid, doneDate) {
      const v = store.vax(childId);
      if (v[vid] && v[vid].done) delete v[vid];
      else v[vid] = { done: true, date: doneDate || todayISO() };
      save();
    },
    setVaxDate(childId, vid, date) {
      const v = store.vax(childId);
      if (v[vid] && v[vid].done) { v[vid].date = date || todayISO(); save(); }
    },

    // ---------- พัฒนาการ ----------
    ms(childId) { return state.msByChild[childId] || (state.msByChild[childId] = {}); },
    toggleMs(childId, mid) {
      const m = store.ms(childId);
      if (m[mid] && m[mid].done) delete m[mid];
      else m[mid] = { done: true, date: todayISO() };
      save();
    },

    // ---------- จับเวลาเรียลไทม์ ----------
    getTimer() { return state.activeTimer; },
    startTimer(childId, type, side) { state.activeTimer = { childId, type, side: side || null, startTs: Date.now() }; save(); },
    stopTimer() { const t = state.activeTimer; state.activeTimer = null; save(); return t; },
    cancelTimer() { state.activeTimer = null; save(); },

    // ---------- นัดหมาย ----------
    appts() { return state.appointments; },
    addAppt(a) {
      state.appointments.push(Object.assign({ id: uid(), done: false }, a));
      state.appointments.sort((x, y) => (x.date + (x.time || '')).localeCompare(y.date + (y.time || '')));
      save();
    },
    removeAppt(id) { state.appointments = state.appointments.filter(a => a.id !== id); save(); },
    toggleAppt(id) { const a = state.appointments.find(x => x.id === id); if (a) { a.done = !a.done; save(); } },

    // ---------- ราคาคลอด / วัคซีน (ผู้ใช้เพิ่มเอง) ----------
    deliveryPkgs() { return state.deliveryPkgs; },
    addDeliveryPkg(p) { state.deliveryPkgs.push(Object.assign({ id: uid(), userAdded: true }, p)); save(); },
    removeDeliveryPkg(id) { state.deliveryPkgs = state.deliveryPkgs.filter(x => x.id !== id); save(); },
    vaxPricePkgs() { return state.vaxPricePkgs; },
    addVaxPricePkg(p) { state.vaxPricePkgs.push(Object.assign({ id: uid(), userAdded: true }, p)); save(); },
    removeVaxPricePkg(id) { state.vaxPricePkgs = state.vaxPricePkgs.filter(x => x.id !== id); save(); },

    // ---------- ตั้งครรภ์ ----------
    preg() { return state.pregnancy; },
    setPreg(patch) { Object.assign(state.pregnancy, patch); save(); },
    toggleCheck(id) {
      const c = state.pregnancy.checklist || (state.pregnancy.checklist = {});
      if (c[id]) delete c[id]; else c[id] = true; save();
    },
    addPregWeight(date, kg) {
      state.pregnancy.weights.push({ id: uid(), date, kg });
      state.pregnancy.weights.sort((a, b) => a.date.localeCompare(b.date));
      save();
    },
    addKickSession(s) {
      state.pregnancy.kicks.unshift(Object.assign({ id: uid() }, s));
      save();
    },

    // ---------- ส่งออก/นำเข้า ----------
    exportJSON() { return JSON.stringify(state, null, 2); },
    importJSON(text) {
      const s = JSON.parse(text);
      state = Object.assign(structuredClone(DEFAULT), s);
      save();
    },
    reset() { state = structuredClone(DEFAULT); save(); },

    // ---------- คลาวด์ซิงค์ (ใช้โดย js/cloud.js) ----------
    _onSave: null,
    loadFrom(obj) { state = Object.assign(structuredClone(DEFAULT), obj || {}); save(); },
    isEmpty() {
      return state.children.length === 0 && !state.pregnancy.active &&
        (state.pregnancy.weights || []).length === 0 && state.appointments.length === 0 &&
        state.deliveryPkgs.length === 0 && state.vaxPricePkgs.length === 0 &&
        Object.keys(state.logsByChild).length === 0 && Object.keys(state.measByChild).length === 0;
    }
  };

  function todayISO() {
    const d = new Date();
    const z = n => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate());
  }
  store.todayISO = todayISO;

  MB.store = store;
})();
