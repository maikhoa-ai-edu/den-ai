// /api/nhat-ky
//   GET  -> GV, HS1, HS2: toàn bộ nhật ký, ngày mới nhất ở trên
//   POST -> HS1, HS2: thêm một lần ghi, hoặc sửa lần ghi CỦA CHÍNH MÌNH (gửi kèm id)
//   PUT  -> GV: ghi nhận xét cho một lần ghi
//
// GV không sửa được nội dung nhật ký của HS; HS không sửa được nhật ký của bạn và nhận xét của GV.
// Bật "có dùng AI" thì phải ghi đủ 4 mục khai báo: công cụ, mục đích, phạm vi AI hỗ trợ, cách kiểm chứng.
// Mục thứ năm của thẻ khai báo (phần nhóm tự làm) chính là ô "việc đã làm".

import { dsNhatKy, luuNhatKy } from './_lib/db.js';
import { docThan, baoLoiMayChu } from './_lib/http.js';
import { canVai } from './_lib/phien.js';

const chu = (v, toiDa) => String(v || '').normalize('NFC').trim().slice(0, toiDa);
const MUC_AI = [['ai_cong_cu', 'công cụ', 100], ['ai_muc_dich', 'mục đích', 500], ['ai_pham_vi', 'phạm vi AI hỗ trợ', 500], ['ai_kiem_chung', 'cách kiểm chứng', 500]];

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const duocPhep = { GET: ['GV', 'HS1', 'HS2'], POST: ['HS1', 'HS2'], PUT: ['GV'] }[req.method];
  if (!duocPhep) return res.status(405).json({ loi: 'Phương thức không được hỗ trợ.' });
  const vai = canVai(req, res, duocPhep);
  if (!vai) return;
  try {
    const ds = await dsNhatKy();
    if (req.method === 'GET') return res.status(200).json({ ok: true, ds });

    const b = docThan(req);
    const cu = b.id ? ds.find(d => d.id === Number(b.id)) : null;
    if (b.id && !cu) return res.status(404).json({ loi: 'Không tìm thấy lần ghi này.' });

    if (req.method === 'PUT') {
      if (!cu) return res.status(400).json({ loi: 'Thiếu lần ghi cần nhận xét.' });
      await luuNhatKy({ id: cu.id, nhan_xet_gv: chu(b.nhan_xet_gv, 1000) });
      return res.status(200).json({ ok: true });
    }

    // POST của HS1, HS2
    if (cu && cu.nguoi_ghi !== vai) return res.status(403).json({ loi: 'Em chỉ sửa được nhật ký của chính mình.' });
    const ngay = String(b.ngay || '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(ngay) || Number.isNaN(Date.parse(ngay))) return res.status(400).json({ loi: 'Em chọn ngày.' });
    const viecDaLam = chu(b.viec_da_lam, 2000);
    if (viecDaLam.length < 3) return res.status(400).json({ loi: 'Em ghi việc đã làm.' });
    const dungAI = b.dung_ai === true;
    const ai = {};
    for (const [cot, ten, toiDa] of MUC_AI) {
      ai[cot] = dungAI ? chu(b[cot], toiDa) : '';
      if (dungAI && !ai[cot]) return res.status(400).json({ loi: `Có dùng AI thì em ghi đủ 4 mục khai báo; còn thiếu ${ten}.` });
    }
    await luuNhatKy({
      ...(cu ? { id: cu.id } : { nguoi_ghi: vai }),
      ngay, viec_da_lam: viecDaLam,
      minh_chung: chu(b.minh_chung, 1000), viec_tiep_theo: chu(b.viec_tiep_theo, 1000),
      dung_ai: dungAI, ...ai
    });
    res.status(200).json({ ok: true });
  } catch (loi) {
    baoLoiMayChu(res, loi);
  }
}
