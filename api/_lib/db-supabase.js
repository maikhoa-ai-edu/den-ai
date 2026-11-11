// Mọi lệnh đọc, ghi Supabase nằm ở tệp này.
// Khóa bí mật chỉ có ở máy chủ (biến môi trường của Vercel), không bao giờ gửi về trình duyệt.

import { createClient } from '@supabase/supabase-js';
import { CAU_HINH_MAC_DINH } from './mac-dinh.js';

let ketNoi;
function sb() {
  if (!ketNoi) {
    const url = process.env.SUPABASE_URL;
    const khoa = process.env.SUPABASE_SECRET_KEY;
    if (!url || !khoa) throw new Error('Thiếu SUPABASE_URL hoặc SUPABASE_SECRET_KEY trong biến môi trường.');
    ketNoi = createClient(url, khoa, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  return ketNoi;
}

function lay(kq) {
  if (kq.error) throw new Error('Supabase: ' + kq.error.message);
  return kq;
}
const cachDay = phut => new Date(Date.now() - phut * 60000).toISOString();

// ---------- cấu hình ----------
export async function docCauHinh() {
  const { data } = lay(await sb().from('cau_hinh').select('khoa, gia_tri'));
  const ch = { ...CAU_HINH_MAC_DINH };
  for (const dong of data) ch[dong.khoa] = dong.gia_tri ?? '';
  return ch;
}
export async function ghiCauHinh(khoa, giaTri) {
  lay(await sb().from('cau_hinh').upsert({ khoa, gia_tri: giaTri }, { onConflict: 'khoa' }));
}

// ---------- prompt (khu ẩn danh) ----------
// Số prompt góp trực tiếp của một đợt, không tính prompt đã bị loại.
export async function demPromptGop(dot) {
  const { count } = lay(await sb().from('prompt').select('id', { count: 'exact', head: true })
    .eq('dot', dot).eq('nguon', 'gop').neq('trang_thai', 'loai'));
  return count ?? 0;
}
// Số lượt gửi trong N phút gần nhất (để tạm ngưng khi có người gửi dồn dập).
export async function demGanDay(phut) {
  const { count } = lay(await sb().from('prompt').select('id', { count: 'exact', head: true }).gte('tao_luc', cachDay(phut)));
  return count ?? 0;
}
// Có prompt giống hệt vừa được gửi trong N phút gần nhất không.
export async function vuaCoTrung(noiDungChuan, phut) {
  const { data } = lay(await sb().from('prompt').select('id').eq('noi_dung_chuan', noiDungChuan).gte('tao_luc', cachDay(phut)).limit(1));
  return data.length > 0;
}
export async function themPrompt(dong) {
  lay(await sb().from('prompt').insert(dong));
}

// ---------- prompt (khu nhóm) ----------
const COT_PROMPT = 'id, dot, khoi, boi_canh, mon, noi_dung, can_ra, trang_thai, ly_do_loai, kieu_thu, tinh_huong_id, cong_cu_ai';
export async function dsPrompt(dot) {
  const { data } = lay(await sb().from('prompt').select(COT_PROMPT).eq('dot', dot).eq('nguon', 'gop').order('id'));
  return data;
}
export async function layPrompt(id) {
  const { data } = lay(await sb().from('prompt').select(COT_PROMPT).eq('id', id).eq('nguon', 'gop').limit(1));
  return data[0] || null;
}
export async function capNhatPrompt(id, thayDoi) {
  lay(await sb().from('prompt').update(thayDoi).eq('id', id));
}

// ---------- phân loại ----------
export async function dsPhanLoai(dot, nguoiCham) {
  let q = sb().from('phan_loai').select('*').eq('dot', dot).order('prompt_id');
  if (nguoiCham) q = q.eq('nguoi_cham', nguoiCham);
  return lay(await q).data;
}
export async function luuPhanLoai(dong) {
  lay(await sb().from('phan_loai').upsert({ ...dong, cap_nhat_luc: new Date().toISOString() }, { onConflict: 'prompt_id,nguoi_cham' }));
}
export async function dsKhoa(dot) {
  return lay(await sb().from('khoa_cham').select('nguoi_cham, khoa_luc').eq('dot', dot)).data;
}
export async function themKhoa(dot, nguoiCham) {
  lay(await sb().from('khoa_cham').upsert({ dot, nguoi_cham: nguoiCham }, { onConflict: 'dot,nguoi_cham' }));
}

// ---------- đối khớp ----------
export async function dsDoiKhop(dot) {
  return lay(await sb().from('doi_khop').select('*').eq('dot', dot)).data;
}
export async function luuDoiKhop(dong) {
  lay(await sb().from('doi_khop').upsert({ ...dong, cap_nhat_luc: new Date().toISOString() }, { onConflict: 'prompt_id' }));
}

// ---------- tình huống ----------
export async function dsTinhHuong() {
  return lay(await sb().from('tinh_huong').select('id, mon, khoi, boi_canh, nhiem_vu, bat').order('id')).data;
}
export async function luuTinhHuong(dong) {
  const { id, ...cot } = dong;
  if (id) lay(await sb().from('tinh_huong').update(cot).eq('id', id));
  else lay(await sb().from('tinh_huong').insert(cot));
}
// Mỗi tình huống đã có bao nhiêu câu trả lời. dot = null thì đếm mọi đợt.
export async function demTheoTinhHuong(dot) {
  let q = sb().from('prompt').select('tinh_huong_id').not('tinh_huong_id', 'is', null);
  if (dot) q = q.eq('dot', dot);
  const dem = new Map();
  for (const d of lay(await q).data) dem.set(d.tinh_huong_id, (dem.get(d.tinh_huong_id) || 0) + 1);
  return dem;
}

// ---------- nhật ký ----------
export async function dsNhatKy() {
  return lay(await sb().from('nhat_ky').select('*').order('ngay', { ascending: false }).order('id', { ascending: false })).data;
}
export async function luuNhatKy(dong) {
  const { id, ...cot } = dong;
  cot.cap_nhat_luc = new Date().toISOString();
  if (id) lay(await sb().from('nhat_ky').update(cot).eq('id', id));
  else lay(await sb().from('nhat_ky').insert(cot));
}
