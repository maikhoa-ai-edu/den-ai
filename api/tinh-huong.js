// /api/tinh-huong
//   GET ?khoi=10      -> (ai cũng gọi được) phát một tình huống cho HS: cái đang có ít câu trả lời nhất
//   GET ?id=5         -> (ai cũng gọi được) lấy lại đúng tình huống đã phát, khi HS tải lại trang
//   GET ?quan_ly=1    -> (GV, HS1, HS2) toàn bộ ngân hàng tình huống kèm số câu trả lời
//   POST              -> (GV, HS1, HS2) thêm, sửa, bật hoặc tắt một tình huống
//
// Tình huống đã có câu trả lời thì KHÔNG sửa được nội dung, chỉ bật hoặc tắt.
// Lý do: sửa nội dung sẽ làm các câu trả lời cũ bị hiểu theo một nhiệm vụ khác.

import { docCauHinh, dsTinhHuong, luuTinhHuong, demTheoTinhHuong } from './_lib/db.js';
import { docThan, baoLoiMayChu } from './_lib/http.js';
import { canVai } from './_lib/phien.js';

const BOI_CANH = ['tuhoc', 'venha', 'duan', 'kiemtra', 'khac'];
const choHS = t => ({ id: t.id, mon: t.mon, boi_canh: t.boi_canh, nhiem_vu: t.nhiem_vu });

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const thamSo = new URL(req.url, 'http://x').searchParams;

    // ----- khu nhóm -----
    if (req.method === 'POST' || thamSo.has('quan_ly')) {
      if (!canVai(req, res, ['GV', 'HS1', 'HS2'])) return;
      const ds = await dsTinhHuong();
      const dem = await demTheoTinhHuong(null);
      if (req.method === 'POST') {
        const b = docThan(req);
        const cu = b.id ? ds.find(t => t.id === Number(b.id)) : null;
        if (b.id && !cu) return res.status(404).json({ loi: 'Không tìm thấy tình huống này.' });
        if (cu && dem.get(cu.id)) {
          // Đã có câu trả lời: chỉ cho bật hoặc tắt.
          await luuTinhHuong({ id: cu.id, bat: b.bat !== false });
          return res.status(200).json({ ok: true });
        }
        const mon = String(b.mon || '').normalize('NFC').trim().slice(0, 40);
        const nhiemVu = String(b.nhiem_vu || '').normalize('NFC').trim();
        if (!mon) return res.status(400).json({ loi: 'Ghi tên môn.' });
        if (nhiemVu.length < 10 || nhiemVu.length > 500) return res.status(400).json({ loi: 'Nhiệm vụ cần từ 10 đến 500 ký tự.' });
        if (![0, 10, 11, 12].includes(Number(b.khoi))) return res.status(400).json({ loi: 'Chọn khối.' });
        if (!BOI_CANH.includes(b.boi_canh)) return res.status(400).json({ loi: 'Chọn bối cảnh.' });
        await luuTinhHuong({ ...(cu ? { id: cu.id } : {}), mon, khoi: Number(b.khoi), boi_canh: b.boi_canh, nhiem_vu: nhiemVu, bat: b.bat !== false });
        return res.status(200).json({ ok: true });
      }
      return res.status(200).json({ ok: true, ds: ds.map(t => ({ ...t, so_cau: dem.get(t.id) || 0 })) });
    }

    // ----- học sinh ẩn danh -----
    if (req.method !== 'GET') return res.status(405).json({ loi: 'Phương thức không được hỗ trợ.' });
    const ch = await docCauHinh();
    const dot = [1, 2].includes(Number(ch.dot_dang_mo)) ? Number(ch.dot_dang_mo) : 0;
    if (!dot || ch['kieu_dot_' + dot] !== 'tinh_huong') return res.status(403).json({ loi: 'Hiện không phát tình huống.' });
    const dangBat = (await dsTinhHuong()).filter(t => t.bat);

    if (thamSo.has('id')) {
      const t = dangBat.find(x => x.id === Number(thamSo.get('id')));
      return t ? res.status(200).json({ ok: true, tinh_huong: choHS(t) }) : res.status(404).json({ loi: 'Tình huống này không còn dùng.' });
    }

    const khoi = Number(thamSo.get('khoi'));
    if (![10, 11, 12].includes(khoi)) return res.status(400).json({ loi: 'Em chọn khối lớp.' });
    const hop = dangBat.filter(t => t.khoi === 0 || t.khoi === khoi);
    if (!hop.length) return res.status(404).json({ loi: 'Chưa có tình huống cho khối của em.' });
    // Phát cái đang có ít câu trả lời nhất để các tình huống được chia đều; bằng nhau thì chọn ngẫu nhiên.
    const dem = await demTheoTinhHuong(dot);
    const itNhat = Math.min(...hop.map(t => dem.get(t.id) || 0));
    const ungVien = hop.filter(t => (dem.get(t.id) || 0) === itNhat);
    res.status(200).json({ ok: true, tinh_huong: choHS(ungVien[Math.floor(Math.random() * ungVien.length)]) });
  } catch (loi) {
    baoLoiMayChu(res, loi);
  }
}
