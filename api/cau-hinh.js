// /api/cau-hinh  (chỉ tài khoản GV)
//   GET  -> đọc cấu hình
//   POST -> sửa một hoặc nhiều mục: { dot_dang_mo, muc_tieu_dot_1, ... }

import { docCauHinh, ghiCauHinh } from './_lib/db.js';
import { docThan, baoLoiMayChu, linkFormHopLe } from './_lib/http.js';
import { canVai } from './_lib/phien.js';

const soNguyen = (tu, den) => v => (Number.isInteger(Number(v)) && Number(v) >= tu && Number(v) <= den ? String(Number(v)) : null);
const linkForm = v => (String(v).trim() === '' ? '' : linkFormHopLe(v) || null);

// Mỗi mục kèm một hàm kiểm tra: trả về giá trị sạch, hoặc null nếu không hợp lệ.
const MUC = {
  dot_dang_mo: soNguyen(0, 2),
  muc_tieu_dot_1: soNguyen(1, 500),
  muc_tieu_dot_2: soNguyen(1, 500),
  link_khao_sat_truoc: linkForm,
  link_khao_sat_sau: linkForm,
  phien_ban_tieu_chi: v => (/^v\d+\.\d+$/.test(String(v).trim()) ? String(v).trim() : null)
};

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!canVai(req, res, ['GV'])) return;
  try {
    if (req.method === 'POST') {
      const b = docThan(req);
      const sua = {};
      for (const khoa of Object.keys(MUC)) {
        if (!(khoa in b)) continue;
        const sach = MUC[khoa](b[khoa]);
        if (sach === null) return res.status(400).json({ loi: `Giá trị của "${khoa}" không hợp lệ.` });
        sua[khoa] = sach;
      }
      for (const [khoa, giaTri] of Object.entries(sua)) await ghiCauHinh(khoa, giaTri);
    } else if (req.method !== 'GET') {
      return res.status(405).json({ loi: 'Phương thức không được hỗ trợ.' });
    }
    const ch = await docCauHinh();
    res.status(200).json({ ok: true, cau_hinh: Object.fromEntries(Object.keys(MUC).map(k => [k, ch[k]])) });
  } catch (loi) {
    baoLoiMayChu(res, loi);
  }
}
