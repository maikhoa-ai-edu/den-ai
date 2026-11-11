// /api/lam-sach?dot=1  (HS1 và GV)
//   GET  -> danh sách prompt của đợt để rà
//   POST -> { id, trang_thai: 'hop_le' | 'loai' | 'moi', ly_do_loai }
// Không xóa dòng nào: câu bị loại vẫn được giữ kèm lý do, để báo cáo đếm được.
// Khi đã có bạn khóa kết quả chấm của đợt thì không sửa trạng thái được nữa.

import { dsPrompt, layPrompt, capNhatPrompt, dsKhoa, dsTinhHuong } from './_lib/db.js';
import { docThan, baoLoiMayChu, maPrompt } from './_lib/http.js';
import { canVai } from './_lib/phien.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!canVai(req, res, ['GV', 'HS1'])) return;
  try {
    if (req.method === 'POST') {
      const b = docThan(req);
      const p = await layPrompt(Number(b.id));
      if (!p) return res.status(404).json({ loi: 'Không tìm thấy câu này.' });
      if (!['moi', 'hop_le', 'loai'].includes(b.trang_thai)) return res.status(400).json({ loi: 'Trạng thái không hợp lệ.' });
      const lyDo = String(b.ly_do_loai || '').trim().slice(0, 200);
      if (b.trang_thai === 'loai' && !lyDo) return res.status(400).json({ loi: 'Em ghi lý do loại câu này.' });
      if (p.cong_cu_ai === 'khong_dung') return res.status(409).json({ loi: 'Dòng này là HS chọn không dùng AI, không có câu lệnh để chấm.' });
      if ((await dsKhoa(p.dot)).length) return res.status(409).json({ loi: 'Đợt này đã có bạn khóa kết quả chấm nên không sửa được nữa.' });
      await capNhatPrompt(p.id, { trang_thai: b.trang_thai, ly_do_loai: b.trang_thai === 'loai' ? lyDo : '' });
      return res.status(200).json({ ok: true });
    }
    if (req.method !== 'GET') return res.status(405).json({ loi: 'Phương thức không được hỗ trợ.' });

    const dot = Number(new URL(req.url, 'http://x').searchParams.get('dot')) === 2 ? 2 : 1;
    const ds = await dsPrompt(dot);
    const nhiemVu = new Map((await dsTinhHuong()).map(t => [t.id, t.nhiem_vu]));
    res.status(200).json({
      ok: true,
      dot,
      da_khoa: (await dsKhoa(dot)).length > 0,
      ds: ds.map(p => ({ ...p, ma: maPrompt(p.id), nhiem_vu: nhiemVu.get(p.tinh_huong_id) || '' }))
    });
  } catch (loi) {
    baoLoiMayChu(res, loi);
  }
}
