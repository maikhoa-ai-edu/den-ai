// Trang Góp prompt: mỗi trình duyệt gửi một câu cho mỗi đợt.
// Hai kiểu thu, do thầy chọn cho từng đợt:
//   tu_do      : HS chép lại một câu em đã từng hỏi AI
//   tinh_huong : app giao một tình huống, HS gõ câu em sẽ gửi cho AI
// Dấu "đã góp" và tình huống đã nhận chỉ nằm trong trình duyệt của HS (localStorage);
// máy chủ không nhận, không lưu các dấu này.

import { $, thongBao, nhomChon, daChon, goiMayChu, layTrangThai } from './app.js';
import { timThongTinCaNhan } from './chung/chan-thong-tin.js';

const TEN_DOT = { 1: 'Đợt 1 · thử tiêu chí', 2: 'Đợt 2 · chính thức' };
const TEN_BOI_CANH = { tuhoc: 'Tự học', venha: 'Bài về nhà', duan: 'Dự án', kiemtra: 'Đang kiểm tra', khac: 'Việc khác' };

const nho = {
  doc(khoa) { try { return localStorage.getItem(khoa); } catch { return null; } },
  ghi(khoa, giaTri) { try { localStorage.setItem(khoa, giaTri); } catch { /* trình duyệt chặn lưu: bỏ qua */ } }
};
const khoaDaGop = dot => 'denai_da_gop_dot_' + dot;
const khoaTinhHuong = dot => 'denai_tinh_huong_dot_' + dot;
const daGop = dot => nho.doc(khoaDaGop(dot)) === '1';

let dot = 0;
let kieu = 'tu_do';
let tinhHuong = null; // tình huống HS đang giữ (kiểu tinh_huong)

function ve(tt) {
  dot = tt.dot || 0;
  kieu = tt.kieu || 'tu_do';
  const giao = kieu === 'tinh_huong';
  $('#gp-h1').textContent = giao ? 'Em sẽ hỏi AI thế nào?' : 'Góp một câu em từng hỏi AI';
  $('#gp-progress').hidden = !dot;
  $('#gp-closed').hidden = !!dot;
  $('#gp-done').hidden = !(dot && daGop(dot));
  $('#gp-form').hidden = !dot || daGop(dot);
  if (!dot) return;
  $('#gp-round').textContent = TEN_DOT[dot];
  $('#gp-n').textContent = tt.da_thu;
  $('#gp-goal').textContent = tt.muc_tieu;
  $('#gp-bar').style.width = (tt.muc_tieu ? Math.min(100, (tt.da_thu / tt.muc_tieu) * 100) : 0) + '%';

  $('#gp-free').hidden = giao;
  $('#gp-prompt-label').textContent = giao ? 'Câu lệnh em sẽ gửi cho AI' : 'Một câu em từng hỏi AI (chép gần đúng)';
  $('#gp-prompt').placeholder = giao ? 'Gõ đúng như em sẽ gửi' : 'Ví dụ: Giải thích cung cầu bằng ví dụ bán xoài';
  if (giao) khoiPhucTinhHuong(); else veTinhHuong(null);
}

// ---------- kiểu giao tình huống ----------
function veTinhHuong(th) {
  tinhHuong = th;
  const giao = kieu === 'tinh_huong';
  $('#gp-th').hidden = !th;
  // Chưa nhận tình huống thì chưa hiện ô gõ câu lệnh và nút gửi.
  $('#gp-prompt-box').hidden = giao && (!th || daChon('#gp-tool') === 'khong_dung');
  $('#gp-send').hidden = giao && !th;
  if (!th) return;
  $('#gp-th-tag').textContent = ['Tình huống của em', th.mon, TEN_BOI_CANH[th.boi_canh]].filter(Boolean).join(' · ');
  $('#gp-th-text').textContent = th.nhiem_vu;
}

async function nhanTinhHuong(khoi) {
  const kq = await goiMayChu('/api/tinh-huong?khoi=' + khoi);
  if (!kq.ok) { veTinhHuong(null); return thongBao(kq.loi || 'Chưa nhận được tình huống.'); }
  nho.ghi(khoaTinhHuong(dot), JSON.stringify({ id: kq.tinh_huong.id, khoi }));
  veTinhHuong(kq.tinh_huong);
}

// Tải lại trang: HS vẫn giữ đúng tình huống đã nhận, không đổi sang cái khác.
async function khoiPhucTinhHuong() {
  let da = null;
  try { da = JSON.parse(nho.doc(khoaTinhHuong(dot)) || 'null'); } catch { /* dữ liệu hỏng: coi như chưa nhận */ }
  if (!da) return veTinhHuong(null);
  document.querySelectorAll('#gp-khoi .chip').forEach(n => n.setAttribute('aria-pressed', n.dataset.v === String(da.khoi)));
  const kq = await goiMayChu('/api/tinh-huong?id=' + da.id);
  if (kq.ok) veTinhHuong(kq.tinh_huong); else nhanTinhHuong(da.khoi); // tình huống cũ đã bị tắt: phát cái khác
}

function chonKhoi() {
  if (kieu !== 'tinh_huong') return;
  const khoi = daChon('#gp-khoi');
  // Đã nhận tình huống rồi thì giữ nguyên, trừ khi em đổi sang khối khác.
  let da = null;
  try { da = JSON.parse(nho.doc(khoaTinhHuong(dot)) || 'null'); } catch { /* bỏ qua */ }
  if (tinhHuong && da && String(da.khoi) === khoi) return;
  nhanTinhHuong(khoi);
}

// ---------- gửi ----------
async function gui(xacNhanKhongTenRieng) {
  const giao = kieu === 'tinh_huong';
  const khoi = daChon('#gp-khoi');
  const congCu = daChon('#gp-tool');
  const khongDung = giao && congCu === 'khong_dung';
  const noiDung = khongDung ? '' : $('#gp-prompt').value.trim();
  const mon = giao ? '' : $('#gp-mon').value.trim();
  const boiCanh = daChon('#gp-ctx');

  // Kiểm tra thông tin cá nhân ngay trên máy HS, trước khi gửi đi.
  const tt = timThongTinCaNhan(giao ? noiDung : noiDung + ' | ' + mon);
  $('#gp-warn').hidden = !tt.chan.length;
  $('#gp-soft').hidden = true;
  if (tt.chan.length) {
    $('#gp-warn').textContent = `Câu này có vẻ chứa ${tt.chan.join(', ')}. Em xóa đi rồi gửi lại nhé.`;
    return;
  }
  if (!khoi) return thongBao('Em chọn khối lớp');
  if (giao && !tinhHuong) return thongBao('Em chờ nhận tình huống');
  if (giao && !congCu) return thongBao('Em chọn công cụ AI em sẽ dùng');
  if (!khongDung && noiDung.length < 5) return thongBao('Em ghi câu lệnh đầy đủ hơn nhé');
  if (!giao && !boiCanh) return thongBao('Em chọn lúc đó mình đang làm gì');
  if (tt.nhac.length && !xacNhanKhongTenRieng) {
    $('#gp-soft-text').textContent = `Câu này có thể chứa ${tt.nhac.join(', ')}. Nếu là người thật, em đổi thành "một bạn", "thầy cô" rồi gửi. Nếu đó là tên tác giả hay nhân vật trong bài học thì em gửi được.`;
    $('#gp-soft').hidden = false;
    return;
  }

  $('#gp-send').disabled = true;
  const kq = await goiMayChu('/api/gop-prompt', {
    nguon: 'gop', khoi: Number(khoi), noi_dung: noiDung,
    xac_nhan_khong_ten_rieng: xacNhanKhongTenRieng === true,
    ...(giao ? { tinh_huong_id: tinhHuong.id, cong_cu_ai: congCu } : { mon, boi_canh: boiCanh })
  });
  $('#gp-send').disabled = false;
  if (!kq.ok) return thongBao(kq.loi || 'Chưa gửi được, em thử lại nhé.');

  nho.ghi(khoaDaGop(dot), '1');
  $('#gp-prompt').value = '';
  $('#gp-mon').value = '';
  ve(await layTrangThai(true));
  thongBao('Đã gửi. Cảm ơn em.');
}

export async function khoiDongGopPrompt() {
  nhomChon('#gp-khoi');
  nhomChon('#gp-ctx');
  nhomChon('#gp-tool');
  document.querySelectorAll('#gp-khoi .chip').forEach(n => n.addEventListener('click', chonKhoi));
  document.querySelectorAll('#gp-tool .chip').forEach(n => n.addEventListener('click', () => veTinhHuong(tinhHuong)));
  $('#gp-soft').querySelector('.warn').classList.add('soft');
  $('#gp-send').onclick = () => gui(false);
  $('#gp-soft-ok').onclick = () => gui(true);
  await veGopPrompt();
}

// Gọi mỗi lần mở trang, để thấy ngay khi thầy mở hoặc đóng đợt thu.
export async function veGopPrompt(taiLai = false) {
  const tt = await layTrangThai(taiLai);
  if (tt.ma !== 200) {
    $('#gp-progress').hidden = $('#gp-form').hidden = $('#gp-done').hidden = true;
    $('#gp-closed').hidden = false;
    $('#gp-closed').querySelector('p').textContent = tt.loi || 'Chưa tải được trạng thái. Em tải lại trang nhé.';
    return;
  }
  ve(tt);
}
