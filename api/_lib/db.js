// Mọi lệnh đọc, ghi Supabase nằm ở tệp này.
// Khóa bí mật chỉ có ở máy chủ (biến môi trường của Vercel), không bao giờ gửi về trình duyệt.
//
// Khi chạy thử trên máy cá nhân mà chưa khai báo SUPABASE_URL, tệp dùng bộ nhớ tạm
// (tắt máy chủ là mất) để xem giao diện. Trên Vercel thì bắt buộc phải có khóa.

import { createClient } from '@supabase/supabase-js';

export const CAU_HINH_MAC_DINH = {
  dot_dang_mo: '0', // 0 = đang đóng, 1 = đợt thử tiêu chí, 2 = đợt chính thức
  muc_tieu_dot_1: '50',
  muc_tieu_dot_2: '120',
  link_khao_sat_truoc: '',
  link_khao_sat_sau: '',
  gioi_han_5_phut: '60'
};

const dungBoNhoTam = !process.env.SUPABASE_URL && !process.env.VERCEL;
const tam = { prompt: [], cau_hinh: { ...CAU_HINH_MAC_DINH, dot_dang_mo: '1' } };

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

function kiemLoi({ error }) {
  if (error) throw new Error('Supabase: ' + error.message);
}

export async function docCauHinh() {
  if (dungBoNhoTam) return { ...tam.cau_hinh };
  const kq = await sb().from('cau_hinh').select('khoa, gia_tri');
  kiemLoi(kq);
  const ch = { ...CAU_HINH_MAC_DINH };
  for (const dong of kq.data) ch[dong.khoa] = dong.gia_tri ?? '';
  return ch;
}

// Số prompt góp trực tiếp của một đợt, không tính prompt đã bị loại.
export async function demPromptGop(dot) {
  if (dungBoNhoTam) return tam.prompt.filter(p => p.dot === dot && p.nguon === 'gop').length;
  const kq = await sb()
    .from('prompt')
    .select('id', { count: 'exact', head: true })
    .eq('dot', dot)
    .eq('nguon', 'gop')
    .neq('trang_thai', 'loai');
  kiemLoi(kq);
  return kq.count ?? 0;
}

// Số lượt gửi trong N phút gần nhất (để tạm ngưng khi có người gửi dồn dập).
export async function demGanDay(phut) {
  const tu = new Date(Date.now() - phut * 60000).toISOString();
  if (dungBoNhoTam) return tam.prompt.filter(p => p.tao_luc >= tu).length;
  const kq = await sb().from('prompt').select('id', { count: 'exact', head: true }).gte('tao_luc', tu);
  kiemLoi(kq);
  return kq.count ?? 0;
}

// Có prompt giống hệt vừa được gửi trong N phút gần nhất không (bấm gửi hai lần, gửi lặp).
export async function vuaCoTrung(noiDungChuan, phut) {
  const tu = new Date(Date.now() - phut * 60000).toISOString();
  if (dungBoNhoTam) return tam.prompt.some(p => p.noi_dung_chuan === noiDungChuan && p.tao_luc >= tu);
  const kq = await sb().from('prompt').select('id').eq('noi_dung_chuan', noiDungChuan).gte('tao_luc', tu).limit(1);
  kiemLoi(kq);
  return kq.data.length > 0;
}

export async function themPrompt(dong) {
  if (dungBoNhoTam) {
    tam.prompt.push({ ...dong, id: tam.prompt.length + 1, tao_luc: new Date().toISOString() });
    return;
  }
  kiemLoi(await sb().from('prompt').insert(dong));
}
