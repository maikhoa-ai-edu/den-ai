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
  prompt.push({ can_ra: false, trang_thai: 'moi', ly_do_loai: '', kieu_thu: 'tu_do', tinh_huong_id: null, cong_cu_ai: '', ...dong, id: prompt.length + 1, tao_luc: new Date().toISOString() });
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

const doiKhop = [];
export async function dsDoiKhop(dot) { return doiKhop.filter(d => d.dot === dot).map(d => ({ ...d })); }
export async function luuDoiKhop(dong) {
  const cu = doiKhop.find(d => d.prompt_id === dong.prompt_id);
  if (cu) Object.assign(cu, dong); else doiKhop.push({ ...dong });
}

const tinhHuong = [
  { id: 1, mon: 'GD KT&PL', khoi: 10, boi_canh: 'venha', nhiem_vu: 'Thầy cô giao bài về nhà: so sánh các loại thị trường và nêu ví dụ ở địa phương em. Tiết sau nộp.', bat: true },
  { id: 2, mon: 'Toán', khoi: 0, boi_canh: 'tuhoc', nhiem_vu: 'Có một dạng bài đã học trên lớp nhưng em chưa hiểu. Em tự học lại ở nhà để chuẩn bị cho bài kiểm tra tuần sau.', bat: true },
  { id: 3, mon: 'Tin học', khoi: 0, boi_canh: 'duan', nhiem_vu: 'Nhóm em 4 bạn được giao thuyết trình 10 phút về an toàn khi dùng mạng xã hội. Em phụ trách tìm tư liệu.', bat: true }
];
export async function dsTinhHuong() { return tinhHuong.map(t => ({ ...t })); }
export async function luuTinhHuong(dong) {
  const cu = tinhHuong.find(t => t.id === dong.id);
  if (cu) Object.assign(cu, dong); else tinhHuong.push({ bat: true, ...dong, id: tinhHuong.length + 1 });
}
export async function demTheoTinhHuong(dot) {
  const dem = new Map();
  for (const p of prompt) if (p.tinh_huong_id && (!dot || p.dot === dot)) dem.set(p.tinh_huong_id, (dem.get(p.tinh_huong_id) || 0) + 1);
  return dem;
}

const nhatKy = [];
export async function dsNhatKy() {
  return nhatKy.map(d => ({ ...d })).sort((a, b) => (a.ngay < b.ngay ? 1 : a.ngay > b.ngay ? -1 : b.id - a.id));
}
export async function luuNhatKy(dong) {
  const cu = nhatKy.find(d => d.id === dong.id);
  if (cu) Object.assign(cu, dong); else nhatKy.push({ nhan_xet_gv: '', ...dong, id: nhatKy.length + 1 });
}
