// Khung chung: chuyển trang theo dấu # trên địa chỉ, thông báo nổi, vài hàm tiện dùng.

import { khoiDongKiemTra } from './kiem-tra.js';
import { khoiDongGopPrompt, veGopPrompt } from './gop-prompt.js';
import { khoiDongKhaoSat } from './khao-sat.js';
import { khoiDongNhom, layVai, dangXuat, veQuanLy } from './nhom.js';
import { khoiDongPhanLoai, vePhanLoai } from './phan-loai.js';
import { khoiDongLamSach, veLamSach } from './lam-sach.js';
import { veDoiKhop } from './doi-khop.js';
import { khoiDongTinhHuong, veTinhHuong } from './tinh-huong.js';
import { khoiDongNhatKy, veNhatKy } from './nhat-ky.js';

export const $ = s => document.querySelector(s);
export const $$ = s => [...document.querySelectorAll(s)];

// Chữ do người dùng nhập phải qua hàm này trước khi chèn vào trang.
export const sach = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let henGio;
export function thongBao(loi) {
  const e = $('#toast');
  e.textContent = loi;
  e.hidden = false;
  clearTimeout(henGio);
  henGio = setTimeout(() => (e.hidden = true), 3000);
}

// Nhóm nút chọn một (bối cảnh, khối): bấm nút nào thì chỉ nút đó sáng.
export function nhomChon(hop) {
  $$(hop + ' .chip').forEach(nut => {
    nut.onclick = () => $$(hop + ' .chip').forEach(x => x.setAttribute('aria-pressed', x === nut));
  });
}
export const daChon = hop => $(hop + ' [aria-pressed="true"]')?.dataset.v;

// Gọi hàm phía máy chủ. Trình duyệt không bao giờ nối thẳng tới Supabase.
export async function goiMayChu(duong, duLieu, phuongThuc) {
  const tuyChon = { method: phuongThuc || (duLieu ? 'POST' : 'GET') };
  if (duLieu) Object.assign(tuyChon, { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(duLieu) });
  try {
    const tl = await fetch(duong, tuyChon);
    const kq = await tl.json().catch(() => ({}));
    return { ma: tl.status, ...kq };
  } catch {
    return { ma: 0, loi: 'Không kết nối được máy chủ. Em kiểm tra mạng rồi thử lại.' };
  }
}

// Trạng thái chung (đợt đang mở, tiến độ, link khảo sát): tải một lần, các trang dùng chung.
let trangThai;
export function layTrangThai(taiLai = false) {
  if (!trangThai || taiLai) trangThai = goiMayChu('/api/trang-thai');
  return trangThai;
}

// Đợt đang xem ở khu nhóm (Phân loại và Làm sạch dùng chung).
export const nhom = { dot: 1 };

const THE_CHUNG = [['kiem-tra', 'Kiểm tra'], ['gop-prompt', 'Góp prompt'], ['khao-sat', 'Khảo sát'], ['nhom', 'Nhóm']];
const THE_NHOM = [
  ['phan-loai', 'Phân loại', ['GV', 'HS1', 'HS2'], vePhanLoai],
  ['lam-sach', 'Làm sạch', ['GV', 'HS1'], veLamSach],
  ['doi-khop', 'Đối khớp', ['GV', 'HS1', 'HS2'], veDoiKhop],
  ['tinh-huong', 'Tình huống', ['GV', 'HS1', 'HS2'], veTinhHuong],
  ['nhat-ky', 'Nhật ký', ['GV', 'HS1', 'HS2'], veNhatKy],
  ['quan-ly', 'Quản lý', ['GV'], veQuanLy]
];

let daVe = false; // lần vẽ đầu tiên đã có khoiDongGopPrompt tải trạng thái
export function chuyenTrang() {
  const vai = layVai();
  let t = location.hash.slice(1) || 'kiem-tra';
  const cuaNhom = THE_NHOM.find(([ma]) => ma === t);
  if (cuaNhom && !(vai && cuaNhom[2].includes(vai))) t = vai ? 'phan-loai' : 'nhom';
  else if (!cuaNhom && !THE_CHUNG.some(([ma]) => ma === t)) t = 'kiem-tra';
  if (t === 'nhom' && vai) t = 'phan-loai';

  $$('section.view').forEach(s => (s.hidden = s.dataset.view !== t));
  const trangNhom = THE_NHOM.find(([ma]) => ma === t);
  const the = trangNhom
    ? THE_NHOM.filter(x => x[2].includes(vai)) // muốn về trang của HS thì bấm tên app ở góc trên
    : THE_CHUNG;
  $('#tabs').innerHTML = the.map(([ma, ten]) => `<a href="#${ma}" ${ma === t ? 'aria-current="page"' : ''}>${ten}</a>`).join('');
  $('#who').innerHTML = vai ? `${vai} · <button id="out">Thoát</button>` : 'Ẩn danh';
  if (vai) $('#out').onclick = dangXuat;
  $$('[data-dot] button').forEach(n => n.setAttribute('aria-pressed', Number(n.dataset.v) === nhom.dot));
  if (trangNhom) trangNhom[3]();
  if (t === 'gop-prompt' && daVe) veGopPrompt(true);
  daVe = true;
  window.scrollTo(0, 0);
}
addEventListener('hashchange', chuyenTrang);

khoiDongKiemTra();
khoiDongGopPrompt();
khoiDongKhaoSat();
khoiDongPhanLoai();
khoiDongLamSach();
khoiDongTinhHuong();
khoiDongNhatKy();
$$('[data-dot] button').forEach(n => (n.onclick = () => { nhom.dot = Number(n.dataset.v); chuyenTrang(); }));
khoiDongNhom().then(chuyenTrang);
