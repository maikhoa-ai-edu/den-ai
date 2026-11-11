// Khu nhóm: đăng nhập, đăng xuất và trang Quản lý của giáo viên.
// Trình duyệt chỉ biết "đang là GV, HS1 hay HS2"; mật khẩu được kiểm tra ở máy chủ.

import { $, $$, thongBao, goiMayChu, chuyenTrang, nhomChon, daChon, layTrangThai } from './app.js';

let vai = null;
export const layVai = () => vai;

async function dangNhap(e) {
  e.preventDefault();
  const chon = $('#lg-acct [aria-pressed="true"]');
  if (!chon) return thongBao('Chọn tài khoản trước');
  $('#lg-go').disabled = true;
  const kq = await goiMayChu('/api/phien', { vai: chon.dataset.u, mat_khau: $('#lg-pw').value });
  $('#lg-go').disabled = false;
  if (!kq.ok) return thongBao(kq.loi || 'Chưa đăng nhập được.');
  vai = kq.vai;
  $('#lg-pw').value = '';
  location.hash = vai === 'GV' ? 'quan-ly' : 'phan-loai';
  chuyenTrang();
}

export async function dangXuat() {
  await goiMayChu('/api/phien', null, 'DELETE');
  vai = null;
  location.hash = 'kiem-tra';
  chuyenTrang();
  thongBao('Đã đăng xuất');
}

// ---------- trang Quản lý (GV) ----------
const O = { muc_tieu_dot_1: '#ql-mt1', muc_tieu_dot_2: '#ql-mt2', link_khao_sat_truoc: '#ql-truoc', link_khao_sat_sau: '#ql-sau', phien_ban_tieu_chi: '#ql-pb' };

function dienQuanLy(ch) {
  $$('#ql-dot .chip').forEach(n => n.setAttribute('aria-pressed', n.dataset.v === ch.dot_dang_mo));
  for (const d of [1, 2]) $$(`#ql-k${d} .chip`).forEach(n => n.setAttribute('aria-pressed', n.dataset.v === ch['kieu_dot_' + d]));
  for (const [khoa, o] of Object.entries(O)) $(o).value = ch[khoa] ?? '';
}
export async function veQuanLy() {
  const kq = await goiMayChu('/api/cau-hinh');
  if (kq.ok) dienQuanLy(kq.cau_hinh); else thongBao(kq.loi || 'Chưa tải được cấu hình.');
}
async function luuQuanLy() {
  const gui = { dot_dang_mo: daChon('#ql-dot') ?? '0', kieu_dot_1: daChon('#ql-k1'), kieu_dot_2: daChon('#ql-k2') };
  for (const [khoa, o] of Object.entries(O)) gui[khoa] = $(o).value.trim();
  $('#ql-save').disabled = true;
  const kq = await goiMayChu('/api/cau-hinh', gui);
  $('#ql-save').disabled = false;
  if (!kq.ok) return thongBao(kq.loi || 'Chưa lưu được.');
  dienQuanLy(kq.cau_hinh);
  layTrangThai(true);
  thongBao('Đã lưu');
}

export async function khoiDongNhom() {
  $$('#lg-acct button').forEach(n => (n.onclick = () => $$('#lg-acct button').forEach(x => x.setAttribute('aria-pressed', x === n))));
  $('#lg-form').onsubmit = dangNhap;
  nhomChon('#ql-dot');
  nhomChon('#ql-k1');
  nhomChon('#ql-k2');
  $('#ql-save').onclick = luuQuanLy;
  vai = (await goiMayChu('/api/phien')).vai || null;
}
