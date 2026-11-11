// POST /api/gop-prompt
// Nhận một prompt ẩn danh và ghi vào bảng "prompt" của Supabase.
// KHÔNG đọc, KHÔNG lưu: địa chỉ IP, mã thiết bị, cookie, email, họ tên.

import { timThongTinCaNhan, chuanHoa } from '../public/js/chung/chan-thong-tin.js';
import { docCauHinh, demGanDay, vuaCoTrung, themPrompt } from './_lib/db.js';
import { chiNhan, docThan, baoLoiMayChu } from './_lib/http.js';

const BOI_CANH = ['tuhoc', 'venha', 'duan', 'kiemtra', 'khac'];
const NGUON = ['gop', 'kiem_tra']; // gop = trang Góp prompt; kiem_tra = HS tích ô đồng ý ở trang Kiểm tra

export default async function handler(req, res) {
  if (!chiNhan(req, res, 'POST')) return;
  const b = docThan(req);
  const tuChoi = (ma, loi, them = {}) => res.status(ma).json({ loi, ...them });

  // 1. Kiểm tra dữ liệu gửi lên
  const noiDung = String(b.noi_dung || '').normalize('NFC').trim();
  const mon = String(b.mon || '').normalize('NFC').trim().slice(0, 40);
  const khoi = Number(b.khoi);
  const nguon = NGUON.includes(b.nguon) ? b.nguon : 'gop';
  if (noiDung.length < 5) return tuChoi(400, 'Câu hỏi còn ngắn quá, em ghi đầy đủ hơn nhé.');
  if (noiDung.length > 1000) return tuChoi(400, 'Câu hỏi dài quá 1000 ký tự.');
  if (!BOI_CANH.includes(b.boi_canh)) return tuChoi(400, 'Em chọn bối cảnh trước khi gửi.');
  if (![10, 11, 12].includes(khoi)) return tuChoi(400, 'Em chọn khối lớp trước khi gửi.');

  // 2. Chặn thông tin cá nhân (lần hai, sau khi trình duyệt đã kiểm tra)
  const tt = timThongTinCaNhan(noiDung + ' | ' + mon);
  if (tt.chan.length) return tuChoi(422, 'Câu này có vẻ chứa ' + tt.chan.join(', ') + '. Em xóa đi rồi gửi lại nhé.', { chan: tt.chan });
  if (tt.nhac.length && b.xac_nhan_khong_ten_rieng !== true) {
    return tuChoi(409, 'Câu này có thể chứa ' + tt.nhac.join(', ') + '. Nếu là người thật, em đổi cách gọi rồi gửi lại.', { nhac: tt.nhac });
  }

  try {
    // 3. Đợt thu có đang mở không
    const ch = await docCauHinh();
    const dot = [1, 2].includes(Number(ch.dot_dang_mo)) ? Number(ch.dot_dang_mo) : 0;
    if (nguon === 'gop' && !dot) return tuChoi(403, 'Hiện chưa mở đợt góp câu hỏi. Em quay lại sau nhé.');

    // 4. Chống gửi dồn dập và gửi lặp
    const gioiHan = Number(ch.gioi_han_5_phut) || 60;
    if ((await demGanDay(5)) >= gioiHan) return tuChoi(429, 'Đang có quá nhiều lượt gửi. Em thử lại sau 5 phút.');
    const noiDungChuan = chuanHoa(noiDung);
    if (await vuaCoTrung(noiDungChuan, 10)) return res.status(200).json({ ok: true, trung: true });

    // 5. Ghi vào cơ sở dữ liệu
    await themPrompt({
      dot,
      nguon,
      khoi,
      boi_canh: b.boi_canh,
      mon,
      noi_dung: noiDung,
      noi_dung_chuan: noiDungChuan,
      can_ra: tt.nhac.length > 0 // HS1 rà lại các câu có thể chứa tên người
    });
    res.status(200).json({ ok: true });
  } catch (loi) {
    baoLoiMayChu(res, loi);
  }
}
