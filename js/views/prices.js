/* หน้า: ราคาคลอด & ราคาแพ็กเกจวัคซีน (เรียกดูได้ทุกจังหวัด + เพิ่มเองได้) */
window.MB = window.MB || {}; MB.views = MB.views || {};
(function () {
  const S = MB.store, U = MB.util;

  function provinceSelect(sel) {
    return `<select id="prov-sel">
      <option value="" ${sel === '' ? 'selected' : ''}>— ทุกจังหวัด —</option>
      ${MB.REGIONS.map(r => `<optgroup label="${r.em} ${r.name}">${r.provinces.map(p => `<option ${sel === p ? 'selected' : ''}>${p}</option>`).join('')}</optgroup>`).join('')}
    </select>`;
  }

  function deliveryCard(x) {
    return `<div class="card" data-search="${U.esc((x.hospital || '') + ' ' + (x.province || ''))}">
      <div style="display:flex;align-items:center;gap:8px"><b style="flex:1">${U.esc(x.hospital || '-')}</b>
        <span class="badge ${x.type === 'เอกชน' ? 'soon' : 'upcoming'}">${U.esc(x.type || '')}</span></div>
      <div class="muted" style="font-size:12.5px">📍 ${U.esc(x.province || '')}${x.year ? ' · ราคาปี ' + U.esc(x.year) : ''}</div>
      <div style="display:flex;gap:10px;margin-top:8px">
        <div style="flex:1;background:var(--cream-2);border-radius:10px;padding:8px;text-align:center"><div class="muted" style="font-size:11px">คลอดธรรมชาติ</div><b style="color:var(--brown)">${U.esc(x.normal || '-')}</b></div>
        <div style="flex:1;background:var(--cream-2);border-radius:10px;padding:8px;text-align:center"><div class="muted" style="font-size:11px">ผ่าคลอด</div><b style="color:var(--brown)">${U.esc(x.csection || '-')}</b></div>
      </div>
      ${x.promo ? `<div style="font-size:13px;margin-top:8px">🎁 ${U.esc(x.promo)}</div>` : ''}
      ${linkRow(x)}
    </div>`;
  }

  function vaccineCard(x) {
    return `<div class="card" data-search="${U.esc((x.hospital || '') + ' ' + (x.province || '') + ' ' + (x.packageName || ''))}">
      <div style="display:flex;align-items:center;gap:8px"><b style="flex:1">${U.esc(x.hospital || '-')}</b>
        <b style="color:var(--pink-deep)">${U.esc(x.price || '-')}</b></div>
      <div class="muted" style="font-size:12.5px">📍 ${U.esc(x.province || '')}${x.year ? ' · ราคาปี ' + U.esc(x.year) : ''}</div>
      <div style="margin-top:6px;font-weight:600;font-size:14px">💉 ${U.esc(x.packageName || '')}${x.ages ? ' <span class="muted" style="font-weight:400">(' + U.esc(x.ages) + ')</span>' : ''}</div>
      ${x.includes ? `<div style="font-size:12.5px;color:#4f3d33;margin-top:4px">รวม: ${U.esc(x.includes)}</div>` : ''}
      ${linkRow(x)}
    </div>`;
  }

  function linkRow(x) {
    const links = [];
    if (x.phone) links.push(`<a href="tel:${U.esc(String(x.phone).replace(/\s/g, ''))}">📞 ${U.esc(x.phone)}</a>`);
    if (x.url) links.push(`<a href="${U.esc(x.url)}" target="_blank" rel="noopener">🔗 ดูแหล่งข้อมูล</a>`);
    let html = links.length ? `<div style="margin-top:8px;display:flex;gap:14px;font-size:12.5px;flex-wrap:wrap">${links.join('')}</div>` : '';
    if (x.source) html += `<div class="muted" style="font-size:11px;margin-top:4px">ที่มา: ${U.esc(x.source)}</div>`;
    if (x.userAdded) html += `<div style="text-align:right;margin-top:4px"><span data-del="${x.id}" style="color:#D9737A;font-size:12px;cursor:pointer">ลบรายการนี้</span></div>`;
    return html;
  }

  MB.views.prices = function (root, params) {
    const tab = (params && params.tab) || 'delivery';
    const province = (params && params.province) || '';
    const isVax = tab === 'vaccine';

    const seed = isVax ? (MB.VAX_PRICE_SEED || []) : (MB.DELIVERY_SEED || []);
    const user = isVax ? S.vaxPricePkgs() : S.deliveryPkgs();
    let items = seed.concat(user);
    if (province) items = items.filter(x => x.province === province);
    items.sort((a, b) => (a.province || '').localeCompare(b.province || '', 'th') || (a.hospital || '').localeCompare(b.hospital || '', 'th'));

    const guide = isVax ? MB.VAX_PRICE_GUIDE : MB.DELIVERY_GUIDE;
    const guideHtml = isVax ? `
      <div class="card tint"><b>💡 รู้ก่อนจ่าย</b>
        <p style="font-size:13px;margin:6px 0 8px">${guide.note}</p>
        ${guide.ranges.map(r => `<div style="font-size:13px;display:flex;justify-content:space-between;gap:10px;padding:3px 0"><span class="muted">${r.t}</span><b>${r.d.replace('ประมาณ ', '')}</b></div>`).join('')}
      </div>` : `
      <div class="card tint"><b>🪪 สิทธิที่ช่วยจ่ายค่าคลอด</b>
        ${guide.rights.map(r => `<div style="margin-top:8px"><div style="font-weight:700;font-size:13.5px">${r.t}</div><div class="muted" style="font-size:12.5px">${r.d}</div></div>`).join('')}
        <div class="divider"></div><b>ช่วงราคาประมาณการ</b>
        ${guide.ranges.map(r => `<div style="font-size:13px;display:flex;justify-content:space-between;gap:10px;padding:3px 0"><span class="muted">${r.t}</span><b>${r.d.replace('ประมาณ ', '')}</b></div>`).join('')}
      </div>`;

    const N = MB.NIPT_DATA;
    const niptHtml = (!isVax && N) ? `
      <div class="card"><b>🧬 ราคาตรวจ NIPT (คัดกรองดาวน์ฯ จากเลือดแม่)</b>
        <p style="font-size:12.5px;color:#4f3d33;margin:6px 0 8px;line-height:1.6">${U.esc(N.intro)}</p>
        ${N.ranges.map(r => `<div style="font-size:13px;display:flex;justify-content:space-between;gap:10px;padding:3px 0"><span class="muted">${U.esc(r.tier)}</span><b style="white-space:nowrap">${U.esc(r.range)}</b></div>`).join('')}
        <div class="divider"></div>
        <div style="font-weight:700;font-size:13.5px;margin-bottom:4px">แพ็กเกจยอดนิยม</div>
        ${N.packages.map(p => `<div style="margin-top:6px"><div style="display:flex;justify-content:space-between;gap:8px"><b style="font-size:13.5px">${U.esc(p.name)}</b><span style="color:var(--pink-deep);font-weight:700;white-space:nowrap">${U.esc(p.price)}</span></div><div class="muted" style="font-size:12px">${U.esc(p.screens)}</div></div>`).join('')}
        <div class="disclaimer" style="margin-top:10px">${N.notes.map(n => '• ' + U.esc(n)).join('<br>')}</div>
      </div>` : '';

    root.innerHTML = `
      ${MB.knowledgeChips(isVax ? 'vaccine' : 'prices')}
      <div class="hero" style="padding:14px 16px"><div class="emoji">${isVax ? '💉' : '🤱'}</div>
        <div style="flex:1"><h2 style="font-size:18px">ราคา${isVax ? 'แพ็กเกจวัคซีน' : 'คลอด'}</h2><p>ดูได้ทุกจังหวัด · ข้อมูลจริงพร้อมแหล่งอ้างอิง</p></div></div>

      ${guideHtml}
      ${niptHtml}

      <div class="field"><label>เลือกจังหวัด</label>${provinceSelect(province)}</div>
      <div class="field"><input id="prov-search" placeholder="🔍 ค้นชื่อโรงพยาบาล..." /></div>

      <div class="section-title">รายการราคา <span class="more">${items.length} รายการ</span></div>
      <div id="price-list">
        ${items.length ? items.map(isVax ? vaccineCard : deliveryCard).join('')
          : `<div class="empty"><div class="em">${isVax ? '💉' : '🏥'}</div><p>${province ? 'ยังไม่มีข้อมูลในจังหวัดนี้' : 'ยังไม่มีข้อมูล'}<br/>เพิ่มราคาที่คุณทราบได้เลย ช่วยกันสะสมเป็นฐานข้อมูล</p></div>`}
      </div>

      <button class="btn pink" id="add-pkg" style="margin-top:6px">+ เพิ่มราคา${isVax ? 'วัคซีน' : 'คลอด'}ที่ทราบ</button>

      <div class="disclaimer">ราคาเป็นข้อมูลที่รวบรวมจากเว็บสาธารณะ/ผู้ใช้ ณ ช่วงเวลาหนึ่ง <b>อาจเปลี่ยนแปลงหรือเป็นโปรโมชันชั่วคราว</b> โปรดโทรยืนยันกับโรงพยาบาลทุกครั้งก่อนตัดสินใจ — รพ.รัฐส่วนใหญ่ใช้สิทธิบัตรทอง/ประกันสังคม</div>
    `;

    MB.wireKnowledgeChips(root);
    root.querySelector('#prov-sel').onchange = (e) => MB.go('prices', { tab, province: e.target.value });
    root.querySelector('#add-pkg').onclick = () => openForm(tab, province);
    root.querySelectorAll('[data-del]').forEach(n => n.onclick = () => {
      if (confirm('ลบรายการนี้?')) { isVax ? S.removeVaxPricePkg(n.dataset.del) : S.removeDeliveryPkg(n.dataset.del); MB.go('prices', { tab, province }); }
    });
    const search = root.querySelector('#prov-search');
    search.oninput = () => {
      const q = search.value.trim().toLowerCase();
      root.querySelectorAll('#price-list [data-search]').forEach(c => {
        c.style.display = !q || c.getAttribute('data-search').toLowerCase().includes(q) ? '' : 'none';
      });
    };
  };

  function openForm(tab, province) {
    const isVax = tab === 'vaccine';
    const common = `
      <div class="field"><label>จังหวัด</label>${MB.views._provSelForm(province)}</div>
      <div class="field"><label>ชื่อโรงพยาบาล</label><input id="pk-hosp" placeholder="เช่น รพ. ..." /></div>`;
    const body = isVax ? common + `
      <div class="field"><label>ชื่อแพ็กเกจ</label><input id="pk-name" placeholder="เช่น วัคซีนเหมาจ่าย 0-1 ปี" /></div>
      <div class="field"><div class="row"><div><label>ช่วงอายุ</label><input id="pk-ages" placeholder="แรกเกิด-1 ปี" /></div><div><label>ราคา (บาท)</label><input id="pk-price" placeholder="12,900" /></div></div></div>
      <div class="field"><label>รวมวัคซีนอะไรบ้าง</label><input id="pk-inc" placeholder="เช่น Rota, PCV, ไข้หวัดใหญ่" /></div>`
      : common + `
      <div class="field"><label>ประเภท</label><div class="chips" data-grp="type"><div class="chip active" data-v="เอกชน">เอกชน</div><div class="chip" data-v="รัฐ">รัฐ</div></div></div>
      <div class="field"><div class="row"><div><label>คลอดธรรมชาติ</label><input id="pk-normal" placeholder="39,000" /></div><div><label>ผ่าคลอด</label><input id="pk-cs" placeholder="75,000" /></div></div></div>
      <div class="field"><label>โปรโมชัน/หมายเหตุ</label><input id="pk-promo" placeholder="เช่น รวมค่าห้อง 3 คืน" /></div>`;
    MB.sheet({
      title: (isVax ? '💉 เพิ่มราคาวัคซีน' : '🤱 เพิ่มราคาคลอด'),
      html: body + `
        <div class="field"><div class="row"><div><label>ปีของราคา</label><input id="pk-year" placeholder="2568" /></div><div><label>เบอร์โทร</label><input id="pk-phone" placeholder="0xx-xxx-xxxx" /></div></div></div>
        <div class="field"><label>ลิงก์แหล่งข้อมูล (ถ้ามี)</label><input id="pk-url" placeholder="https://..." /></div>
        <button class="btn pink" id="pk-save">บันทึก</button>`,
      onMount(rt) {
        rt.querySelectorAll('[data-grp="type"] .chip').forEach(ch => ch.onclick = () => {
          rt.querySelectorAll('[data-grp="type"] .chip').forEach(x => x.classList.remove('active')); ch.classList.add('active');
        });
        rt.querySelector('#pk-save').onclick = () => {
          const prov = rt.querySelector('#pkf-prov').value;
          const hospital = rt.querySelector('#pk-hosp').value.trim();
          if (!prov) return MB.toast('เลือกจังหวัดก่อนนะ');
          if (!hospital) return MB.toast('ใส่ชื่อโรงพยาบาลก่อนนะ');
          const base = { province: prov, hospital, year: rt.querySelector('#pk-year').value.trim() || undefined, phone: rt.querySelector('#pk-phone').value.trim() || undefined, url: rt.querySelector('#pk-url').value.trim() || undefined, source: 'เพิ่มเอง' };
          if (isVax) {
            S.addVaxPricePkg(Object.assign(base, { packageName: rt.querySelector('#pk-name').value.trim() || 'แพ็กเกจวัคซีน', ages: rt.querySelector('#pk-ages').value.trim() || undefined, price: rt.querySelector('#pk-price').value.trim() || undefined, includes: rt.querySelector('#pk-inc').value.trim() || undefined }));
          } else {
            const type = (rt.querySelector('[data-grp="type"] .chip.active') || {}).dataset?.v || 'เอกชน';
            S.addDeliveryPkg(Object.assign(base, { type, normal: rt.querySelector('#pk-normal').value.trim() || undefined, csection: rt.querySelector('#pk-cs').value.trim() || undefined, promo: rt.querySelector('#pk-promo').value.trim() || undefined }));
          }
          MB.closeSheet(); MB.toast('บันทึกแล้ว ขอบคุณที่ช่วยแบ่งปัน 💕'); MB.go('prices', { tab, province });
        };
      }
    });
  }

  /* province select สำหรับฟอร์ม (id ต่างกันเพื่อไม่ชนกับตัวกรอง) */
  MB.views._provSelForm = function (sel) {
    return `<select id="pkf-prov"><option value="">— เลือกจังหวัด —</option>
      ${MB.REGIONS.map(r => `<optgroup label="${r.em} ${r.name}">${r.provinces.map(p => `<option ${sel === p ? 'selected' : ''}>${p}</option>`).join('')}</optgroup>`).join('')}
    </select>`;
  };
})();
