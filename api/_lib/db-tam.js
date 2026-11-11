// Bộ nhớ tạm thay cho Supabase khi chạy thử trên máy cá nhân (npm run thu).
// Cùng tên hàm với db-supabase.js. Tắt máy chủ thử là mất hết dữ liệu.

import { CAU_HINH_MAC_DINH } from './mac-dinh.js';

const cauHinh = { ...CAU_HINH_MAC_DINH, dot_dang_mo: '1' };
const prompt = [];
const phanLoai = [];
const khoa = [];
const cachDay = phut => new Date(Date.now() - phut * 60000).toISOString();
const laGop = p => p.nguon === 'gop';

export async function docCauHinh() { return { ...cauHinh }; }
export async function ghiCauHinh(k, v) { cauHinh[k] = v; }

export async function demPromptGop(dot) { return prompt.filter(p => laGop(p) && p.dot === dot && p.trang_thai !== 'loai').length; }
export async function demGanDay(phut) { return prompt.filter(p => p.tao_luc >= cachDay(phut)).length; }
export async function vuaCoTrung(chuan, phut) { return prompt.some(p => p.noi_dung_chuan === chuan && p.tao_luc >= cachDay(phut)); }
export async function themPrompt(dong) {
  prompt.push({ can_ra: false, trang_thai: 'moi', ly_do_loai: '', ...dong, id: prompt.length + 1, tao_luc: new Date().toISOString() });
}

export async function dsPrompt(dot) { return prompt.filter(p => laGop(p) && p.dot === dot).map(p => ({ ...p })); }
export async function layPrompt(id) { const p = prompt.find(x => x.id === id && laGop(x)); return p ? { ...p } : null; }
export async function capNhatPrompt(id, thayDoi) { Object.assign(prompt.find(p => p.id === id) || {}, thayDoi); }

export async function dsPhanLoai(dot, nguoiCham) {
  return phanLoai.filter(d => d.dot === dot && (!nguoiCham || d.nguoi_cham === nguoiCham)).map(d => ({ ...d }));
}
export async function luuPhanLoai(dong) {
  const cu = phanLoai.find(d => d.prompt_id === dong.prompt_id && d.nguoi_cham === dong.nguoi_cham);
  if (cu) Object.assign(cu, dong); else phanLoai.push({ ...dong });
}
export async function dsKhoa(dot) { return khoa.filter(k => k.dot === dot).map(k => ({ ...k })); }
export async function themKhoa(dot, nguoiCham) {
  if (!khoa.some(k => k.dot === dot && k.nguoi_cham === nguoiCham)) khoa.push({ dot, nguoi_cham: nguoiCham, khoa_luc: new Date().toISOString() });
}
