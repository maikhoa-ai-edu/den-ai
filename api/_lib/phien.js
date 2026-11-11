// Đăng nhập cho đúng 3 tài khoản: GV, HS1, HS2.
// Mật khẩu nằm trong biến môi trường của Vercel, không nằm trong mã hay cơ sở dữ liệu.
// Sau khi đăng nhập, máy chủ cấp một "vé" có chữ ký, lưu trong cookie mà mã trên trang không đọc được.
// Cookie này chỉ dành cho 3 tài khoản nhóm; học sinh ẩn danh không nhận cookie nào.

import { createHmac, timingSafeEqual } from 'node:crypto';
import { CHAY_THU } from './mac-dinh.js';

export const VAI = ['GV', 'HS1', 'HS2'];
const TEN_COOKIE = 'denai_phien';
const HAN_GIO = 12;

function biMat() {
  const b = process.env.BI_MAT_PHIEN || (CHAY_THU ? 'bi-mat-chi-de-chay-thu' : '');
  if (b.length < 16) throw new Error('Thiếu BI_MAT_PHIEN (ít nhất 16 ký tự) trong biến môi trường.');
  return b;
}
const ky = noiDung => createHmac('sha256', biMat()).update(noiDung).digest('base64url');

function bangNhau(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
}

export function dungMatKhau(vai, matKhau) {
  if (!VAI.includes(vai)) return false;
  const dung = process.env['MAT_KHAU_' + vai] || (CHAY_THU ? 'mat-khau-thu-' + vai.toLowerCase() : '');
  if (dung.length < 8) throw new Error(`Thiếu MAT_KHAU_${vai} (ít nhất 8 ký tự) trong biến môi trường.`);
  return bangNhau(matKhau, dung);
}

export function capVe(res, vai) {
  const noiDung = vai + '.' + (Date.now() + HAN_GIO * 3600000);
  res.setHeader('Set-Cookie', `${TEN_COOKIE}=${noiDung}.${ky(noiDung)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${HAN_GIO * 3600}`);
}
export function huyVe(res) {
  res.setHeader('Set-Cookie', `${TEN_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);
}

// Trả về 'GV' | 'HS1' | 'HS2' nếu vé hợp lệ và còn hạn, ngược lại trả về null.
export function docVai(req) {
  const m = String(req.headers.cookie || '').match(new RegExp(`(?:^|;\\s*)${TEN_COOKIE}=([^;]+)`));
  if (!m) return null;
  const [vai, han, chuKy] = m[1].split('.');
  if (!VAI.includes(vai) || !chuKy || !bangNhau(chuKy, ky(vai + '.' + han))) return null;
  return Number(han) > Date.now() ? vai : null;
}

// Dùng ở đầu mỗi hàm của khu nhóm: không đúng vai thì trả lỗi và dừng.
export function canVai(req, res, duocPhep) {
  const vai = docVai(req);
  if (!vai) { res.status(401).json({ loi: 'Em cần đăng nhập lại.' }); return null; }
  if (!duocPhep.includes(vai)) { res.status(403).json({ loi: 'Tài khoản này không làm được việc đó.' }); return null; }
  return vai;
}
