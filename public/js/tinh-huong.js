// Trang Tình huống (GV, HS1, HS2): xem, thêm, sửa, bật hoặc tắt tình huống giao cho HS.
// Tình huống đã có câu trả lời thì chỉ bật hoặc tắt được.

import { $, $$, sach, thongBao, goiMayChu, nhomChon, daChon } from './app.js';

const TEN_BOI_CANH = { tuhoc: 'Tự học', venha: 'Bài về nhà', duan: 'Dự án', kiemtra: 'Kiểm tra', khac: 'Việc khác' };
let ds = [];
let dangSua = null; // id tình huống đang sửa, null = đang thêm mới
let loc = 'tat-ca';  // tat-ca | 10 | 11 | 12 | 0 (dùng chung) | bat (đang phát)

function dienO(t) {
  dangSua = t?.id ?? null;
  $('#th-form-title').textContent = t ? 'Sửa tình huống T' + t.id : 'Thêm tình huống';
  $('#th-cancel').hidden = !t;
  $('#th-mon').value = t?.mon || '';
  $('#th-nv').value = t?.nhiem_vu || '';
  $$('#th-khoi .chip').forEach(n => n.setAttribute('aria-pressed', n.dataset.v === String(t?.khoi ?? 0)));
  $$('#th-ctx .chip').forEach(n => n.setAttribute('aria-pressed', n.dataset.v === t?.boi_canh));
}

async function luu() {
  const kq = await goiMayChu('/api/tinh-huong', {
    ...(dangSua ? { id: dangSua } : {}),
    mon: $('#th-mon').value, khoi: Number(daChon('#th-khoi') ?? 0), boi_canh: daChon('#th-ctx'), nhiem_vu: $('#th-nv').value,
    bat: dangSua ? ds.find(t => t.id === dangSua)?.bat !== false : true
  });
  if (!kq.ok) return thongBao(kq.loi || 'Chưa lưu được.');
  thongBao('Đã lưu');
  dienO(null);
  veTinhHuong();
}

async function batTat(id) {
  const t = ds.find(x => x.id === id);
  const kq = await goiMayChu('/api/tinh-huong', { ...t, bat: !t.bat });
  if (!kq.ok) return thongBao(kq.loi || 'Chưa lưu được.');
  veTinhHuong();
}

export async function veTinhHuong() {
  const kq = await goiMayChu('/api/tinh-huong?quan_ly=1');
  if (!kq.ok) return thongBao(kq.loi || 'Chưa tải được.');
  ds = kq.ds;
  veDanhSach();
}

function veDanhSach() {
  $$('#th-loc .chip').forEach(n => n.setAttribute('aria-pressed', n.dataset.v === loc));
  // Mỗi HS của một khối có thể nhận: tình huống của khối đó + tình huống dùng chung, đang phát.
  const soPhat = k => ds.filter(t => t.bat && (t.khoi === k || t.khoi === 0)).length;
  $('#th-dem').textContent = `Đang phát cho HS: khối 10 có ${soPhat(10)} tình huống, khối 11 có ${soPhat(11)}, khối 12 có ${soPhat(12)} (đã tính tình huống dùng chung).`;
  const hien = ds.filter(t => loc === 'tat-ca' || (loc === 'bat' ? t.bat : String(t.khoi) === loc));
  $('#th-list').innerHTML = hien.length ? hien.map(t => `<div class="card">
    <div class="head"><span class="code">T${t.id}</span><span class="tag">${[sach(t.mon), t.khoi ? 'Khối ' + t.khoi : 'Mọi khối', TEN_BOI_CANH[t.boi_canh]].join(' · ')}</span></div>
    <div class="quote">${sach(t.nhiem_vu)}</div>
    <div class="rowbtn"><span class="pill ${t.bat ? 'c-X' : 'na'}">${t.bat ? 'Đang phát' : 'Đã tắt'}</span><span class="hint">${t.so_cau} câu trả lời</span>
      <button class="btn ghost sm" data-bat="${t.id}" style="margin-left:auto">${t.bat ? 'Tắt' : 'Bật'}</button>
      ${t.so_cau ? '' : `<button class="btn ghost sm" data-sua="${t.id}">Sửa</button>`}</div>
  </div>`).join('') : '<div class="card"><p class="hint">Không có tình huống nào trong mục này.</p></div>';
  $$('#th-list [data-bat]').forEach(n => (n.onclick = () => batTat(Number(n.dataset.bat))));
  $$('#th-list [data-sua]').forEach(n => (n.onclick = () => { dienO(ds.find(t => t.id === Number(n.dataset.sua))); $('#th-form').scrollIntoView({ behavior: 'smooth' }); }));
}

export function khoiDongTinhHuong() {
  nhomChon('#th-khoi');
  nhomChon('#th-ctx');
  $('#th-save').onclick = luu;
  $('#th-cancel').onclick = () => dienO(null);
  $$('#th-loc .chip').forEach(n => (n.onclick = () => { loc = n.dataset.v; veDanhSach(); }));
}
