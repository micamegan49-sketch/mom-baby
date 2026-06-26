/* หน้า: ประกันสำหรับลูก — ตอนนี้รวมอยู่ในหน้า "💰 ค่าใช้จ่าย" (แท็บย่อย "ประกัน")
   คงเราต์ 'insurance' ไว้เพื่อความเข้ากันได้กับลิงก์เดิม โดยส่งต่อไปยังตัวเรนเดอร์ของหน้า prices */
window.MB = window.MB || {}; MB.views = MB.views || {};
(function () {
  MB.views.insurance = function (root, params) {
    MB.views.prices(root, Object.assign({ tab: 'insurance' }, params || {}));
  };
})();
