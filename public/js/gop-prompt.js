// Trang Góp prompt: mỗi trình duyệt gửi một câu cho mỗi đợt.
// Dấu "đã góp" chỉ nằm trong trình duyệt của HS (localStorage); máy chủ không nhận, không lưu dấu này.

import { $, thongBao, nhomChon, daChon, goiMayChu, layTrangThai } from './app.js';
import { timThongTinCaNhan } from './chung/chan-thong-tin.js';

const TEN_DOT = { 1: 'Đợt 1 · thử tiêu chí', 2: 'Đợt 2 · chính thức' };
const khoaDaGop = dot => 'denai_da_gop_dot_' + dot;

function daGop(dot) {
  try { return localStorage.getItem(khoaDaGop(dot)) === '1'; } catch { return false; }
}
function ghiDaGop(dot) {
  try { localStorage.setItem(khoaDaGop(dot), '1'); } catch { /* trình duyệt chặn lưu: bỏ qua */ }
}

let dot = 0;

function ve(tt) {
  dot = tt.dot || 0;
  $('#gp-progress').hidden = !dot;
  $('#gp-closed').hidden = !!dot;
  $('#gp-done').hidden = !(dot && daGop(dot));
  $('#gp-form').hidden = !dot || daGop(dot);
  if (!dot) return;
  $('#gp-round').textContent = TEN_DOT[dot];
  $('#gp-n').textContent = tt.da_thu;
  $('#gp-goal').textContent = tt.muc_tieu;
  $('#gp-bar').style.width = (tt.muc_tieu ? Math.min(100, (tt.da_thu / tt.muc_tieu) * 100) : 0) + '%';
}

async function gui(xacNhanKhongTenRieng) {
  const noiDung = $('#gp-prompt').value.trim();
  const mon = $('#gp-mon').value.trim();
  const khoi = daChon('#gp-khoi');
  const boiCanh = daChon('#gp-ctx');

  // Kiểm tra thông tin cá nhân ngay trên máy HS, trước khi gửi đi.
  const tt = timThongTinCaNhan(noiDung + ' ' + mon);
  $('#gp-warn').hidden = !tt.chan.length;
  $('#gp-soft').hidden = true;
  if (tt.chan.length) {
    $('#gp-warn').textContent = `Câu này có vẻ chứa ${tt.chan.join(', ')}. Em xóa đi rồi gửi lại nhé.`;
    return;
  }
  if (noiDung.length < 5) return thongBao('Em ghi câu hỏi đầy đủ hơn nhé');
  if (!khoi) return thongBao('Em chọn khối lớp');
  if (!boiCanh) return thongBao('Em chọn lúc đó mình đang làm gì');
  if (tt.nhac.length && !xacNhanKhongTenRieng) {
    $('#gp-soft-text').textContent = `Câu này có thể chứa ${tt.nhac.join(', ')}. Nếu là người thật, em đổi thành "một bạn", "thầy cô" rồi gửi. Nếu đó là tên tác giả hay nhân vật trong bài học thì em gửi được.`;
    $('#gp-soft').hidden = false;
    return;
  }

  $('#gp-send').disabled = true;
  const kq = await goiMayChu('/api/gop-prompt', {
    noi_dung: noiDung, mon, khoi: Number(khoi), boi_canh: boiCanh, nguon: 'gop',
    xac_nhan_khong_ten_rieng: xacNhanKhongTenRieng === true
  });
  $('#gp-send').disabled = false;
  if (!kq.ok) return thongBao(kq.loi || 'Chưa gửi được, em thử lại nhé.');

  ghiDaGop(dot);
  $('#gp-prompt').value = '';
  $('#gp-mon').value = '';
  ve(await layTrangThai(true));
  thongBao('Đã gửi. Cảm ơn em.');
}

export async function khoiDongGopPrompt() {
  nhomChon('#gp-khoi');
  nhomChon('#gp-ctx');
  $('#gp-soft').querySelector('.warn').classList.add('soft');
  $('#gp-send').onclick = () => gui(false);
  $('#gp-soft-ok').onclick = () => gui(true);
  const tt = await layTrangThai();
  if (tt.ma !== 200) {
    $('#gp-closed').hidden = false;
    $('#gp-closed').querySelector('p').textContent = tt.loi || 'Chưa tải được trạng thái. Em tải lại trang nhé.';
    return;
  }
  ve(tt);
}
