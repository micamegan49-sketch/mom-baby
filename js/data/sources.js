/* ตัวจิ๋ว – แหล่งอ้างอิงข้อมูลสุขภาพในแอพ (medical citations)
   ใช้แสดง "ที่มา/แหล่งอ้างอิง" พร้อมลิงก์ในแต่ละหน้าที่มีข้อมูลทางการแพทย์
   เพื่อให้ผู้ใช้ตรวจสอบข้อมูลจากแหล่งที่น่าเชื่อถือได้ง่าย */
window.MB = window.MB || {};
MB.SOURCES = {
  vaccine: {
    title: '💉 ตารางวัคซีน',
    items: [
      { name: 'ตารางสร้างเสริมภูมิคุ้มกันโรค (EPI) — กรมควบคุมโรค กระทรวงสาธารณสุข', url: 'https://ddc.moph.go.th/' },
      { name: 'กำหนดการให้วัคซีนในเด็กไทย — สมาคมโรคติดเชื้อในเด็กแห่งประเทศไทย (PIDST)', url: 'https://www.pidst.or.th/' }
    ]
  },
  growth: {
    title: '📈 เกณฑ์การเจริญเติบโต',
    items: [
      { name: 'WHO Child Growth Standards — องค์การอนามัยโลก (WHO)', url: 'https://www.who.int/tools/child-growth-standards' },
      { name: 'กราฟการเจริญเติบโตและภาวะโภชนาการ — กรมอนามัย กระทรวงสาธารณสุข', url: 'https://nutrition2.anamai.moph.go.th/' }
    ]
  },
  pregnancy: {
    title: '🤰 ข้อมูลการตั้งครรภ์รายสัปดาห์',
    items: [
      { name: 'Pregnancy week-by-week — NHS (UK)', url: 'https://www.nhs.uk/pregnancy/' },
      { name: 'การฝากครรภ์และดูแลครรภ์คุณภาพ — กรมอนามัย กระทรวงสาธารณสุข', url: 'https://hp.anamai.moph.go.th/' }
    ]
  },
  develop: {
    title: '🌱 พัฒนาการเด็ก',
    items: [
      { name: 'Developmental Milestones (Learn the Signs. Act Early.) — CDC', url: 'https://www.cdc.gov/ncbddd/actearly/milestones/index.html' },
      { name: 'คู่มือเฝ้าระวังและส่งเสริมพัฒนาการเด็กปฐมวัย (DSPM) — กรมอนามัย', url: 'https://www.anamai.moph.go.th/' }
    ]
  },
  feeding: {
    title: '🍼 โภชนาการและการให้นม',
    items: [
      { name: 'Infant and young child feeding — WHO', url: 'https://www.who.int/health-topics/breastfeeding' },
      { name: 'อาหารตามวัยสำหรับทารกและเด็กเล็ก — กรมอนามัย', url: 'https://multimedia.anamai.moph.go.th/' }
    ]
  }
};
MB.SOURCE_KEYS = ['vaccine', 'growth', 'pregnancy', 'develop', 'feeding'];

/* แสดงบล็อก "แหล่งอ้างอิง" พร้อมลิงก์ที่กดได้ (เปิดในเบราว์เซอร์) ใช้ท้ายหน้าข้อมูลการแพทย์
   key = vaccine | growth | pregnancy | develop | feeding */
MB.citeBlock = function (key) {
  const s = MB.SOURCES[key];
  if (!s) return '';
  const links = s.items.map(function (it) {
    return '<a href="' + it.url + '" target="_blank" rel="noopener noreferrer" ' +
      'style="color:#8B5E4B;text-decoration:underline;word-break:break-word">' + it.name + ' ↗</a>';
  }).join('<br/>');
  return '<div class="disclaimer" style="font-size:12px;line-height:1.7">' +
    '📚 <b>แหล่งอ้างอิง / Sources:</b><br/>' + links + '</div>';
};
