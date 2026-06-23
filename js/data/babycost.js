/* ข้อมูลราคา/รีวิวของใช้แม่และเด็ก (ข้อมูลจริงพร้อมแหล่งอ้างอิง — เก็บข้อมูลปี 2025-2026)
   ⚠️ ราคาเป็นค่าประมาณจากร้านค้าออนไลน์ ณ ช่วงเวลาหนึ่ง อาจเปลี่ยนตามโปรโมชัน/ร้าน โปรดตรวจสอบก่อนซื้อจริง */
window.MB = window.MB || {};

/* ---------- เครื่องปั๊มนม ---------- */
MB.PUMP_DATA = [
  { brand:'Spectra', model:'S1 Plus', type:'ไฟฟ้าคู่', price:'8,500–12,850 บาท', note:'เกรดโรงพยาบาล มีแบตในตัว พกพาได้ ยอดนิยมอันดับต้น ๆ ของแม่ไทย', url:'https://www.priceza.com/s/ราคา/spectra-s1-เครื่องปั๊มนมสเปคตร้า-s1' },
  { brand:'Spectra', model:'S2 Plus', type:'ไฟฟ้าคู่', price:'8,500–12,850 บาท', note:'รุ่นเสียบไฟบ้าน (ไม่มีแบต) สเปคเดียวกับ S1 ราคาประหยัดกว่า', url:'https://www.priceza.com/s/ราคา/เครื่องปั๊มนม-spectra-s2' },
  { brand:'Spectra', model:'9 Plus', type:'ไฟฟ้าคู่', price:'~7,950 บาท', note:'พกพา น้ำหนักเบา ~239 กรัม มีแบตในตัว ใช้ปั๊มเดี่ยว/คู่ได้', url:'https://shop.babygiftretail.com/product/Spectra-Breast-Pump-S9-Plus' },
  { brand:'Medela', model:'New Swing Maxi', type:'ไฟฟ้าคู่', price:'7,900–11,900 บาท', note:'เทคโนโลยี 2-Phase Expression เลียนแบบจังหวะดูดของทารก แบรนด์สวิส', url:'https://www.priceza.com/s/ราคา/เครื่องปั๊มนม-medela-swing-maxi' },
  { brand:'Medela', model:'Freestyle Hands-free', type:'สวมใส่ได้ (wearable)', price:'25,900–35,900 บาท', note:'ปั๊มไร้สายสวมในเสื้อใน เชื่อมแอป รุ่นพรีเมียมราคาสูง', url:'https://www.priceza.com/s/ราคา/เครื่องปั๊มนม-medela-freestyle' },
  { brand:'Pigeon', model:'GoMini (Electric Double)', type:'ไฟฟ้าคู่', price:'~3,800 บาท (มักแถมของ)', note:'ปั๊มคู่กะทัดรัด แบรนด์ญี่ปุ่นที่แม่ไทยคุ้นเคย คุ้มค่า', url:'https://www.moong-shop.com/product/baby-and-mom-products/feeding-bottles-and-nipples/pregnant/zpg00pm000210.html' },
  { brand:'Pigeon', model:'Manual (คอกว้าง)', type:'มือ', price:'~700–1,200 บาท', note:'ปั๊มมือกรวยซิลิโคนคอกว้าง เบา พกพาง่าย ราคาประหยัด (ราคาโดยประมาณ)', url:'https://www.bonnykids.com/product/17628/' },
  { brand:'Haakaa', model:'Silicone Gen2', type:'มือ (ซิลิโคนสุญญากาศ)', price:'820–990 บาท', note:'กรวยซิลิโคนชิ้นเดียว ไร้เสียง รองน้ำนมไหลซึม ราคาถูกที่สุด', url:'https://www.mellowforkid.com/product/haakaa-silicone-breast-pump-gen2/' },
  { brand:'Real Bubee', model:'Double Electric', type:'ไฟฟ้าคู่', price:'500–1,260 บาท', note:'ปั๊มคู่ราคาประหยัดมาก ขายดีออนไลน์ แต่ทนน้อยกว่าแบรนด์หลัก', url:'https://www.priceza.com/s/ราคา/real-bubee-เครื่องปั๊มนม' },
  { brand:'Attitude Mom (Attmu)', model:'Easy Life II', type:'สวมใส่ได้ (wearable)', price:'~4,900 บาท (ต่อข้าง)', note:'ปั๊มไร้สายสวมในเสื้อใน 4 โหมด แบรนด์ไทยยอดนิยม', url:'https://shop.babygiftretail.com/product/attitude-mom-wireless-breast-pump-easy-life-ll' },
  { brand:'Unimom', model:'Allegro', type:'ไฟฟ้าคู่', price:'5,200–6,500 บาท', note:'ปั๊มคู่จากเกาหลี มีแบตในตัว คลินิกนมแม่หลายแห่งแนะนำ', url:'https://www.priceza.com/p/unimom-เครื่องปั๊มน้ำนมไฟฟ้าแบบคู่-รุ่น-allegro-321502444' },
  { brand:'Cimilre', model:'S5 Plus', type:'ไฟฟ้าคู่', price:'7,290–7,590 บาท', note:'ปั๊มคู่ 2 มอเตอร์จากเกาหลี ปั๊มเกลี้ยงเต้า รีวิวดี', url:'https://www.cimilre-thailand.com/cimilre-s5/' },
  { brand:'Cimilre', model:'F1', type:'ไฟฟ้าคู่ (พกพา)', price:'~5,990 บาท', note:'ปั๊มพกพาน้ำหนักเบา มีแบตในตัว พกพาง่าย', url:'https://pantip.com/topic/38948921' },
  { brand:'Youha', model:'Plus YH-8804', type:'ไฟฟ้าคู่', price:'2,800–2,990 บาท', note:'ปั๊มคู่เครื่องเล็กเบาเงียบ มีแบต ผ่าน อย.ไทย คุ้มราคา', url:'https://shop.babygiftretail.com/product/youha-breast-pump-yh-8804' },
  { brand:'Philips Avent', model:'Single Electric (SCF391)', type:'ไฟฟ้าเดี่ยว', price:'~5,990 บาท (เซ็ต)', note:'ระบบนวดกระตุ้น นั่งสบายไม่ต้องโน้มตัว แบรนด์ยุโรป', url:'https://www.priceza.com/s/ราคา/เครื่องปั๊มนม-philips-avent' }
];

/* ---------- ผ้าอ้อม/แพมเพิส ---------- */
MB.DIAPER_GUIDE = [
  { tier:'ประหยัด', range:'~4–7 บาท/ชิ้น' },
  { tier:'พรีเมียม', range:'~10–16 บาท/ชิ้น' }
];
MB.DIAPER_DATA = [
  { brand:'Mamy Poko Pants Standard', type:'กางเกง', sizes:'S–XXL', pack:'L 54 ชิ้น', price:'~289–359 บาท/ห่อ', perPiece:'~5.4–6.6 บาท/ชิ้น', tier:'กลาง', url:'https://www.priceza.com/brand/mamypoko' },
  { brand:'Huggies Dry Pants', type:'กางเกง', sizes:'M–XXL', pack:'L 44 ชิ้น', price:'~200 บาท (ต่ำสุด)', perPiece:'~4.5 บาท/ชิ้น', tier:'ประหยัด', url:'https://www.priceza.com/brand/huggies' },
  { brand:'Pampers Standard Pants', type:'กางเกง', sizes:'S–XXL', pack:'L 42 ชิ้น', price:'~636 บาท', perPiece:'~15.1 บาท/ชิ้น', tier:'พรีเมียม', url:'https://www.priceza.com/brand/pampers' },
  { brand:'Pampers Dry Pants (แพ็คใหญ่)', type:'กางเกง', sizes:'S–XXL', pack:'L 82 ชิ้น', price:'~891–991 บาท', perPiece:'~10.9–12.1 บาท/ชิ้น', tier:'พรีเมียม', url:'https://www.priceza.com/brand/pampers' },
  { brand:'BabyLove Play Pants Premium', type:'กางเกง', sizes:'S–XXL', pack:'L 46 ชิ้น', price:'~280–499 บาท', perPiece:'~6.1–10.8 บาท/ชิ้น', tier:'กลาง', url:'https://www.priceza.com/brand/babylove' },
  { brand:'BabyLove Easy Tape', type:'เทป', sizes:'NB–XL', pack:'L 72 ชิ้น', price:'~375–599 บาท', perPiece:'~5.2–8.3 บาท/ชิ้น', tier:'กลาง', url:'https://www.priceza.com/brand/babylove' },
  { brand:'Goo.N Friend', type:'กางเกง', sizes:'S–XXXL', pack:'L 46 ชิ้น', price:'~219–239 บาท', perPiece:'~4.8–5.2 บาท/ชิ้น', tier:'ประหยัด', url:'https://www.priceza.com/brand/goon' },
  { brand:'Goo.N Premium Mommy Kiss', type:'กางเกง', sizes:'NB–XXXL', pack:'L 44 ชิ้น', price:'~299–319 บาท', perPiece:'~6.8–7.3 บาท/ชิ้น', tier:'กลาง', url:'https://www.priceza.com/brand/goon' },
  { brand:'Merries Pants', type:'กางเกง', sizes:'S–XXL', pack:'L 44 ชิ้น', price:'~525 บาท (ต่ำสุด)', perPiece:'~11.9 บาท/ชิ้น', tier:'พรีเมียม', url:'https://www.priceza.com/brand/merries' },
  { brand:'Drypers DryPantz', type:'กางเกง', sizes:'M–XXL', pack:'L (Mega Pack)', price:'~338–564 บาท', perPiece:'ราคาประหยัดต่อชิ้น', tier:'ประหยัด', url:'https://www.priceza.com/brand/drypers' },
  { brand:'Molfix Extra Dry', type:'กางเกง', sizes:'S–XXXL', pack:'L ยกลัง', price:'~255 บาท (ครึ่งลัง)', perPiece:'~4–5 บาท/ชิ้น', tier:'ประหยัด', url:'https://www.lazada.co.th/tag/ผ้าอ้อม-molfix/' }
];

/* ---------- นมผง ---------- */
MB.FORMULA_NOTICE = 'นมแม่คือสารอาหารที่ดีที่สุดสำหรับทารก WHO และกระทรวงสาธารณสุขแนะนำให้เลี้ยงลูกด้วยนมแม่อย่างเดียว 6 เดือนแรก และให้ควบคู่อาหารตามวัยจนถึง 2 ปีหรือนานกว่า นมผงสำหรับทารก/เด็กเล็ก (โดยเฉพาะอายุต่ำกว่า 1 ปี) ควรใช้ภายใต้คำแนะนำของแพทย์/นักโภชนาการ สูตรเฉพาะ (แพ้นมวัว/ไฮโดรไลซ์/กรดอะมิโน) ต้องสั่งจ่ายโดยแพทย์ ข้อมูลนี้เป็น "อ้างอิงราคา" ที่เป็นกลางเท่านั้น ไม่ใช่การโฆษณา (ตาม พ.ร.บ.ควบคุมการส่งเสริมการตลาดอาหารสำหรับทารกและเด็กเล็ก พ.ศ.2560 เน้นข้อมูลสูตรต่อเนื่อง 1 ปีขึ้นไปเป็นหลัก)';
MB.FORMULA_GUIDE = 'แบรนด์หลัก (สูตร 3 ขึ้นไป) ส่วนใหญ่ราว 45–95 บาท/100 ก. (กระป๋องใหญ่ถูกกว่าต่อกรัม) · นมพรีเมียม/ออร์แกนิก/A2 นำเข้า ราว 180–330 บาท/100 ก. · สูตรเฉพาะ (แพ้นมวัว/soy/HA) มักแพงกว่าปกติ';
MB.FORMULA_DATA = [
  { brand:'S-26', line:'Gold Progress', stage:'สูตร 3 (1 ปี+)', size:'3500 ก.', price:'~1,750 บาท', per100g:'~50 บาท', type:'ปกติ', url:'https://www.priceza.com/brand/s-26' },
  { brand:'S-26', line:'Gold Pro HA', stage:'สูตร 2 (6-12 ด.)', size:'500 ก.', price:'~599 บาท', per100g:'~120 บาท', type:'HA', url:'https://www.priceza.com/brand/s-26' },
  { brand:'Enfa', line:'Enfagrow A+ MindPro รสจืด', stage:'สูตร 3 (1 ปี+)', size:'3400 ก.', price:'~2,010 บาท', per100g:'~59 บาท', type:'ปกติ', url:'https://www.priceza.com/brand/enfa' },
  { brand:'Enfa', line:'Enfagrow A+ Gentle Care', stage:'สูตร 3 (1 ปี+)', size:'1425 ก.', price:'~1,265 บาท', per100g:'~89 บาท', type:'ย่อยง่าย', url:'https://www.priceza.com/brand/enfa' },
  { brand:'Similac', line:'Gain (สูตร 3)', stage:'สูตร 3 (1 ปี+)', size:'1300 ก.', price:'~775 บาท', per100g:'~60 บาท', type:'ปกติ', url:'https://www.priceza.com/brand/similac' },
  { brand:'Similac', line:'Comfort 2', stage:'สูตร 2 (6 ด.-3 ปี)', size:'820 ก.', price:'~650 บาท', per100g:'~79 บาท', type:'ย่อยง่าย', url:'https://www.priceza.com/brand/similac' },
  { brand:'Similac', line:'LF (ปราศจากแลคโตส)', stage:'สูตรพิเศษ', size:'375 ก.', price:'~315 บาท', per100g:'~84 บาท', type:'แพ้แลคโตส', url:'https://www.priceza.com/brand/similac' },
  { brand:'Nan', line:'Gold Total-C', stage:'สูตร 3 (1 ปี+)', size:'1800 ก.', price:'~1,290 บาท', per100g:'~72 บาท', type:'ปกติ', url:'https://www.priceza.com/brand/nan' },
  { brand:'Nan', line:'Gold HA 3', stage:'สูตร 3 (1 ปี+)', size:'1400 ก.', price:'~1,039 บาท', per100g:'~74 บาท', type:'HA', url:'https://www.priceza.com/brand/nan' },
  { brand:'Dumex', line:'Hi-Q 1 Plus Super Gold', stage:'สูตร 3 (1 ปี+)', size:'1800 ก.', price:'~855 บาท', per100g:'~48 บาท', type:'ปกติ', url:'https://www.priceza.com/brand/dumex' },
  { brand:'Dumex', line:'Dugro 3 Iron Active Plus', stage:'สูตร 3 (1 ปี+)', size:'1650 ก.', price:'~2,300 บาท', per100g:'~139 บาท', type:'ปกติ', url:'https://www.priceza.com/brand/dumex' },
  { brand:'Aptamil', line:'Gold+ (นำเข้า)', stage:'สูตร 3 (1 ปี+)', size:'900 ก.', price:'1,660–1,980 บาท', per100g:'~184–220 บาท', type:'พรีเมียมนำเข้า', url:'https://www.priceza.com/brand/aptamil' },
  { brand:'Aptamil', line:'Profutura (นำเข้า)', stage:'สูตร 3 (1 ปี+)', size:'900 ก.', price:'~2,499 บาท', per100g:'~278 บาท', type:'พรีเมียมนำเข้า', url:'https://www.priceza.com/brand/aptamil' },
  { brand:'Aptamil', line:'Essensis Organic A2', stage:'สูตร 3 (1 ปี+)', size:'900 ก.', price:'2,950–4,300 บาท', per100g:'~328–478 บาท', type:'A2/ออร์แกนิก', url:'https://www.priceza.com/brand/aptamil' },
  { brand:"Bellamy's", line:'Organic (A2 beta-casein)', stage:'สูตร 1 (อ้างอิงราคา)', size:'800 ก.', price:'~2,399 บาท', per100g:'~300 บาท', type:'A2/ออร์แกนิก', url:'https://www.priceza.com/s/ราคา/bellamys' },
  { brand:'PediaSure', line:'1+ Complete', stage:'1 ปี+ (นมโต)', size:'850 ก.', price:'~780 บาท', per100g:'~92 บาท', type:'เสริมการเจริญเติบโต', url:'https://www.priceza.com/brand/pediasure' },
  { brand:'Isomil', line:'Plus AI Q (โปรตีนถั่วเหลือง)', stage:'1 ปี+', size:'850 ก.', price:'~690 บาท', per100g:'~81 บาท', type:'soy (แพ้นมวัว)', url:'https://www.priceza.com/s/ราคา/isomil' }
];

/* ---------- NIPT (คัดกรองดาวน์ซินโดรมจากเลือดแม่) ---------- */
MB.NIPT_DATA = {
  intro:'NIPT (Non-Invasive Prenatal Testing) คือการตรวจคัดกรองความผิดปกติของโครโมโซมทารก เช่น ดาวน์ซินโดรม (trisomy 21) จากเลือดแม่ ทำได้ตั้งแต่อายุครรภ์ราว 10 สัปดาห์ขึ้นไป แม่นยำในการคัดกรองดาวน์ซินโดรมสูงกว่า 99% รู้ผลราว 7–14 วัน — เป็นเพียง "การคัดกรอง" ไม่ใช่การวินิจฉัย หากผลเสี่ยงสูงต้องยืนยันด้วยการเจาะน้ำคร่ำเสมอ',
  ranges:[
    { tier:'สิทธิ สปสช. (หญิงตั้งครรภ์คนไทยตามสิทธิ)', range:'สปสช.จ่ายให้ ~2,700 บาท/ครั้ง (อาจไม่มีค่าใช้จ่ายเองหากเข้าเงื่อนไข)' },
    { tier:'พื้นฐาน (trisomy 21/18/13 + โครโมโซมเพศ)', range:'~8,900–13,500 บาท' },
    { tier:'มาตรฐาน (ครบ 23 คู่โครโมโซม)', range:'~11,900–16,000 บาท' },
    { tier:'ขยาย (23 คู่ + microdeletion)', range:'~14,500–28,500 บาท' }
  ],
  packages:[
    { name:'NGD NIPS 5C (iGene/NGD)', screens:'trisomy 21/18/13 + เพศ (5 โครโมโซม)', price:'~8,900 บาท', url:'https://healthsmile.co.th/blog-th/ราคาตรวจ-nipt-2568-ตรวจ-nipt-ราคาถูก/' },
    { name:'NGD NIPS Plus 23', screens:'ครบ 23 คู่โครโมโซม + เพศ', price:'~11,900 บาท', url:'https://healthsmile.co.th/blog-th/ราคาตรวจ-nipt-2568-ตรวจ-nipt-ราคาถูก/' },
    { name:'NIFTY Focus (BGI)', screens:'trisomy 21/18/13 + เพศ', price:'~10,900 บาท', url:'https://healthsmile.co.th/blog-th/ราคาตรวจ-nipt-2568-ตรวจ-nipt-ราคาถูก/' },
    { name:'NIFTY Core (BGI)', screens:'ครบ 23 คู่โครโมโซม + เพศ', price:'~12,900 บาท', url:'https://healthsmile.co.th/blog-th/ราคาตรวจ-nipt-2568-ตรวจ-nipt-ราคาถูก/' },
    { name:'NIFTY Pro (BGI)', screens:'23 คู่ + microdeletion 92 กลุ่มโรค', price:'~17,400 บาท', url:'https://healthsmile.co.th/blog-th/ราคาตรวจ-nipt-2568-ตรวจ-nipt-ราคาถูก/' },
    { name:'Panorama (Natera)', screens:'trisomy + เพศ + microdeletion (เริ่ม 9 สัปดาห์)', price:'~15,500–18,500 บาท', url:'https://www.bccgroup-thailand.com/panorama/' },
    { name:'NIPT รพ.กรุงเทพ (อุดร) Essential/Complete', screens:'Essential 13/18/21+เพศ / Complete +microdeletion 96 รายการ', price:'13,500–14,500 บาท', url:'https://www.bangkokhospital.com/en/udon/package/bud-nipt-test-2025' },
    { name:'NIPT Plus รพ.บำรุงราษฎร์', screens:'ครบ 23 คู่ + microdeletion 92 กลุ่มโรค', price:'~28,500 บาท', url:'https://www.bumrungrad.com/en/packages/nipt' }
  ],
  notes:[
    'NIPT เป็นการคัดกรอง ไม่ใช่การวินิจฉัย — ผล "เสี่ยงสูง" ต้องยืนยันด้วยการเจาะน้ำคร่ำเสมอ',
    'ตรวจได้ตั้งแต่อายุครรภ์ ~10 สัปดาห์ (บางแบรนด์ 9 สัปดาห์) แม่นยำคัดกรองดาวน์ >99% รู้ผล 7–14 วัน',
    'หญิงตั้งครรภ์คนไทยทุกสิทธิใช้ NIPT ผ่าน สปสช.ได้ (ปรับอัตราจ่าย 2,700 บาท/ครั้ง ปี 2568) สอบถามสถานพยาบาลตามสิทธิ',
    'ราคาเป็นค่าตรวจโดยประมาณ อาจไม่รวมค่าแพทย์/บริการ/เจาะเลือด และเปลี่ยนแปลงได้ ควรสอบถามสถานพยาบาลก่อนตรวจ'
  ]
};
