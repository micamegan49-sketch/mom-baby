/* ตัวจิ๋ว – ไดอารี่รูปความทรงจำ (เก็บใน IndexedDB ของเครื่องนี้)
 * รูปไม่เข้าไปใน state ที่ซิงค์คลาวด์ (กันบวม) → เก็บในเครื่องเท่านั้นในเวอร์ชันนี้ */
window.MB = window.MB || {};
MB.diary = (function () {
  const DB = 'tuajiw_media', STORE = 'photos', VER = 1;
  function open() {
    return new Promise((res, rej) => {
      const r = indexedDB.open(DB, VER);
      r.onupgradeneeded = () => {
        const db = r.result;
        if (!db.objectStoreNames.contains(STORE)) {
          const os = db.createObjectStore(STORE, { keyPath: 'id' });
          os.createIndex('child', 'childId', { unique: false });
        }
      };
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
  }
  async function add(entry) {
    const db = await open();
    return new Promise((res, rej) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(entry);
      tx.oncomplete = () => res(entry);
      tx.onerror = () => rej(tx.error);
    });
  }
  async function list(childId) {
    const db = await open();
    return new Promise((res, rej) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).index('child').getAll(childId);
      req.onsuccess = () => res((req.result || []).sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.id || '').localeCompare(a.id || '')));
      req.onerror = () => rej(req.error);
    });
  }
  async function remove(id) {
    const db = await open();
    return new Promise((res, rej) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(id);
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  }
  async function count(childId) { return (await list(childId)).length; }
  return { add, list, remove, count, available: () => !!window.indexedDB };
})();
