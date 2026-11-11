// Trang Phân loại độc lập.
// HS1, HS2: chấm từng câu; máy chủ chỉ trả kết quả của chính em, không trả của bạn kia.
// GV: chỉ thấy tiến độ, không thấy màu.

import { $, $$, sach, thongBao, goiMayChu, nhom } from './app.js';
import { layVai } from './nhom.js';
import { TEN_MAU, TEN_TIEU_CHI, mauXauNhat } from './chung/luat-tam.js';

const TEN_BOI_CANH = { tuhoc: 'Tự học', venha: 'Bài về nhà', duan: 'Dự án', kiemtra: 'Kiểm tra', khac: 'Việc khác' };
const TC = ['tc1', 'tc2', 'tc3', 'tc5'];
const vien = (mau, chu) => `<span class="pill c-${mau}">${chu || TEN_MAU[mau]}</span>`;

let duLieu = null;  // câu trả lời gần nhất của máy chủ
let dangCham = null; // câu đang hiện trên thẻ chấm
let chon = {};       // màu em đã bấm cho từng tiêu chí

function mauCuoi() {
  if ($('#pl-abs').checked) return 'D';
  return TC.every(k => chon[k]) ? mauXauNhat(TC.map(k => chon[k])) : null;
}
function veMauCuoi() {
  const mau = mauCuoi();
  $('#pl-final-box').innerHTML = mau
    ? vien(mau, $('#pl-abs').checked ? 'Đỏ tuyệt đối' : TEN_MAU[mau])
    : '<span class="pill na">Chưa đủ tiêu chí</span>';
  $('#pl-save').disabled = !(mau && TC.every(k => chon[k]));
}

function moThe(cau) {
  dangCham = cau;
  const cu = cau.cham;
  chon = cu ? Object.fromEntries(TC.map(k => [k, cu[k]])) : {};
  $('#pl-code').textContent = cau.ma;
  $('#pl-ctx').textContent = [TEN_BOI_CANH[cau.boi_canh], cau.mon].filter(Boolean).join(' · ');
  $('#pl-text').textContent = cau.noi_dung;
  $('#pl-abs').checked = !!cu?.do_tuyet_doi;
  $('#pl-hard').checked = !!cu?.ca_kho;
  $('#pl-why').value = cu?.ly_do || '';
  $('#pl-save').textContent = cu ? 'Lưu thay đổi' : 'Lưu và sang câu tiếp';
  $('#pl-picks').innerHTML = TC.map(k => `<div class="pick"><div class="n">${TEN_TIEU_CHI[k.toUpperCase()]}</div><div class="three" data-k="${k}">${
    ['X', 'V', 'D'].map(c => `<button data-c="${c}" aria-pressed="${chon[k] === c}" aria-label="${TEN_MAU[c]}">${TEN_MAU[c][0]}</button>`).join('')
  }</div></div>`).join('');
  $$('#pl-picks .three').forEach(nhomNut => nhomNut.querySelectorAll('button').forEach(nut => {
    nut.onclick = () => {
      nhomNut.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === nut));
      chon[nhomNut.dataset.k] = nut.dataset.c;
      veMauCuoi();
    };
  }));
  veMauCuoi();
  $('#pl-card').hidden = false;
}

function veGiaoVien(kq) {
  $('#pl-gv').hidden = false;
  $('#pl-gv-rows').innerHTML = kq.tien_do.map(t => `
    <div class="meter"><span>${t.nguoi_cham}${t.da_khoa ? ' · đã khóa' : ''}</span><span><b>${t.da_cham}</b> / ${kq.tong}</span></div>
    <div class="prog"><b style="width:${kq.tong ? (t.da_cham / kq.tong) * 100 : 0}%"></b></div>`).join('');
}

function veHocSinh(kq) {
  const daCham = kq.ds.filter(c => c.cham);
  const tiep = kq.ds.find(c => !c.cham);
  $('#pl-meter').hidden = false;
  $('#pl-who').textContent = `Đang chấm: ${layVai()} · tiêu chí ${kq.phien_ban_tieu_chi}`;
  $('#pl-n').textContent = daCham.length;
  $('#pl-total').textContent = kq.tong;
  $('#pl-bar').style.width = (kq.tong ? (daCham.length / kq.tong) * 100 : 0) + '%';

  const ghiChu = (tieuDe, loi, coNutKhoa) => {
    $('#pl-note').hidden = false;
    $('#pl-note-title').textContent = tieuDe;
    $('#pl-note-text').textContent = loi;
    $('#pl-lock').hidden = !coNutKhoa;
  };
  if (kq.da_khoa) ghiChu('Em đã khóa kết quả đợt này', 'Kết quả không sửa được nữa. Trang Đối khớp mở khi cả hai bạn đã khóa.', false);
  else if (!kq.tong) ghiChu('Chưa có câu nào để chấm', 'Câu hỏi vào danh sách này sau khi được đánh dấu Hợp lệ ở trang Làm sạch.', false);
  else if (!tiep) ghiChu('Em đã chấm hết', 'Xem lại các câu bên dưới, sửa nếu cần. Khi chắc chắn thì khóa; khóa rồi không sửa được.', true);
  else moThe(tiep);

  $('#pl-done').hidden = !daCham.length;
  $('#pl-ver').textContent = daCham.length + ' câu';
  $('#pl-list').innerHTML = daCham.map(c => `<div class="case"><div class="vs"><span class="code">${c.ma}</span>${
    vien(c.cham.mau_cuoi, c.cham.do_tuyet_doi ? 'Đỏ tuyệt đối' : '')}${c.cham.ca_kho ? '<span>★ khó quyết</span>' : ''}${
    kq.da_khoa ? '' : `<button class="btn ghost sm" data-sua="${c.id}" style="margin-left:auto">Sửa</button>`}</div><div>${sach(c.noi_dung)}</div><div class="hint">${sach(c.cham.ly_do)}</div></div>`).join('');
  $$('#pl-list [data-sua]').forEach(nut => (nut.onclick = () => {
    $('#pl-note').hidden = true;
    moThe(kq.ds.find(c => c.id === Number(nut.dataset.sua)));
    $('#pl-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
}

export async function vePhanLoai() {
  ['#pl-gv', '#pl-meter', '#pl-note', '#pl-card', '#pl-done'].forEach(o => ($(o).hidden = true));
  const kq = await goiMayChu('/api/phan-loai?dot=' + nhom.dot);
  if (!kq.ok) return thongBao(kq.loi || 'Chưa tải được danh sách.');
  duLieu = kq;
  if (layVai() === 'GV') veGiaoVien(kq); else veHocSinh(kq);
}

async function luu() {
  const lyDo = $('#pl-why').value.trim();
  if (!lyDo) return thongBao('Em ghi lý do 1 câu rồi lưu');
  $('#pl-save').disabled = true;
  const kq = await goiMayChu('/api/phan-loai', {
    dot: duLieu.dot, prompt_id: dangCham.id, ...chon,
    do_tuyet_doi: $('#pl-abs').checked, ca_kho: $('#pl-hard').checked, ly_do: lyDo
  });
  if (!kq.ok) { $('#pl-save').disabled = false; return thongBao(kq.loi || 'Chưa lưu được.'); }
  thongBao('Đã lưu ' + dangCham.ma);
  await vePhanLoai();
  window.scrollTo(0, 0);
}

async function khoa() {
  if (!$('#pl-lock').dataset.hoi) {
    $('#pl-lock').dataset.hoi = '1';
    $('#pl-lock').textContent = 'Bấm lần nữa để khóa (không sửa được nữa)';
    return;
  }
  delete $('#pl-lock').dataset.hoi;
  $('#pl-lock').textContent = 'Khóa kết quả của em';
  const kq = await goiMayChu('/api/phan-loai', { dot: duLieu.dot }, 'PUT');
  if (!kq.ok) return thongBao(kq.loi || 'Chưa khóa được.');
  thongBao('Đã khóa');
  vePhanLoai();
}

export function khoiDongPhanLoai() {
  $('#pl-abs').onchange = veMauCuoi;
  $('#pl-save').onclick = luu;
  $('#pl-lock').onclick = khoa;
}
