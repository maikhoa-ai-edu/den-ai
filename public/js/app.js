// Khung chung: chuyển trang theo dấu # trên địa chỉ, thông báo nổi, vài hàm tiện dùng.

import { khoiDongKiemTra } from './kiem-tra.js';
import { khoiDongGopPrompt } from './gop-prompt.js';
import { khoiDongKhaoSat } from './khao-sat.js';

export const $ = s => document.querySelector(s);
export const $$ = s => [...document.querySelectorAll(s)];

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
export async function goiMayChu(duong, duLieu) {
  const tuyChon = duLieu
    ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(duLieu) }
    : {};
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

const THE = [['kiem-tra', 'Kiểm tra'], ['gop-prompt', 'Góp prompt'], ['khao-sat', 'Khảo sát'], ['nhom', 'Nhóm']];
function chuyenTrang() {
  let t = location.hash.slice(1) || 'kiem-tra';
  if (!THE.some(([ma]) => ma === t)) t = 'kiem-tra';
  $$('section.view').forEach(s => (s.hidden = s.dataset.view !== t));
  $('#tabs').innerHTML = THE.map(([ma, ten]) => `<a href="#${ma}" ${ma === t ? 'aria-current="page"' : ''}>${ten}</a>`).join('');
  window.scrollTo(0, 0);
}
addEventListener('hashchange', chuyenTrang);

khoiDongKiemTra();
khoiDongGopPrompt();
khoiDongKhaoSat();
chuyenTrang();
