// POST /api/gop-prompt
// Nhận một prompt ẩn danh và ghi vào bảng "prompt" của Supabase.
// KHÔNG đọc, KHÔNG lưu: địa chỉ IP, mã thiết bị, cookie, email, họ tên.
//
// Hai kiểu thu (thầy chọn cho từng đợt ở trang Quản lý):
//   tu_do      : HS chép lại một câu em ĐÃ TỪNG hỏi AI, tự chọn bối cảnh và môn
//   tinh_huong : app giao một tình huống, HS gõ câu em SẼ gửi cho AI; bối cảnh và môn lấy từ tình huống

import { timThongTinCaNhan, chuanHoa } from '../public/js/chung/chan-thong-tin.js';
import { docCauHinh, demGanDay, vuaCoTrung, themPrompt, dsTinhHuong } from './_lib/db.js';
import { chiNhan, docThan, baoLoiMayChu } from './_lib/http.js';

const BOI_CANH = ['tuhoc', 'venha', 'duan', 'kiemtra', 'khac'];
const NGUON = ['gop', 'kiem_tra']; // gop = trang Góp prompt; kiem_tra = HS tích ô đồng ý ở trang Kiểm tra
const CONG_CU = ['chatgpt', 'gemini', 'copilot', 'khac', 'khong_dung'];

export default async function handler(req, res) {
  if (!chiNhan(req, res, 'POST')) return;
  const b = docThan(req);
  const tuChoi = (ma, loi, them = {}) => res.status(ma).json({ loi, ...them });

  try {
    // 1. Đợt thu có đang mở không, và đợt này thu theo kiểu nào
    const ch = await docCauHinh();
    const dot = [1, 2].includes(Number(ch.dot_dang_mo)) ? Number(ch.dot_dang_mo) : 0;
    const nguon = NGUON.includes(b.nguon) ? b.nguon : 'gop';
    if (nguon === 'gop' && !dot) return tuChoi(403, 'Hiện chưa mở đợt góp câu hỏi. Em quay lại sau nhé.');
    const giaoTinhHuong = nguon === 'gop' && ch['kieu_dot_' + dot] === 'tinh_huong';

    // 2. Kiểm tra dữ liệu gửi lên
    const khoi = Number(b.khoi);
    if (![10, 11, 12].includes(khoi)) return tuChoi(400, 'Em chọn khối lớp trước khi gửi.');
    let noiDung = String(b.noi_dung || '').normalize('NFC').trim();
    let mon = String(b.mon || '').normalize('NFC').trim().slice(0, 40);
    let boiCanh = b.boi_canh;
    let tinhHuongId = null, congCu = '', khongDungAI = false;

    if (giaoTinhHuong) {
      const th = (await dsTinhHuong()).find(t => t.bat && t.id === Number(b.tinh_huong_id) && (t.khoi === 0 || t.khoi === khoi));
      if (!th) return tuChoi(400, 'Tình huống không hợp lệ. Em tải lại trang nhé.');
      if (!CONG_CU.includes(b.cong_cu_ai)) return tuChoi(400, 'Em chọn công cụ AI em sẽ dùng.');
      // Bối cảnh và môn lấy từ tình huống ở máy chủ, không lấy từ trình duyệt.
      tinhHuongId = th.id; mon = th.mon; boiCanh = th.boi_canh; congCu = b.cong_cu_ai;
      khongDungAI = congCu === 'khong_dung';
      if (khongDungAI) noiDung = '(không dùng AI)';
    } else if (!BOI_CANH.includes(boiCanh)) {
      return tuChoi(400, 'Em chọn bối cảnh trước khi gửi.');
    }
    if (noiDung.length < 5) return tuChoi(400, 'Câu lệnh còn ngắn quá, em ghi đầy đủ hơn nhé.');
    if (noiDung.length > 1000) return tuChoi(400, 'Câu lệnh dài quá 1000 ký tự.');

    // 3. Chặn thông tin cá nhân (lần hai, sau khi trình duyệt đã kiểm tra)
    const tt = khongDungAI ? { chan: [], nhac: [] } : timThongTinCaNhan(giaoTinhHuong ? noiDung : noiDung + ' | ' + mon);
    if (tt.chan.length) return tuChoi(422, 'Câu này có vẻ chứa ' + tt.chan.join(', ') + '. Em xóa đi rồi gửi lại nhé.', { chan: tt.chan });
    if (tt.nhac.length && b.xac_nhan_khong_ten_rieng !== true) {
      return tuChoi(409, 'Câu này có thể chứa ' + tt.nhac.join(', ') + '. Nếu là người thật, em đổi cách gọi rồi gửi lại.', { nhac: tt.nhac });
    }

    // 4. Chống gửi dồn dập và gửi lặp
    const gioiHan = Number(ch.gioi_han_5_phut) || 60;
    if ((await demGanDay(5)) >= gioiHan) return tuChoi(429, 'Đang có quá nhiều lượt gửi. Em thử lại sau 5 phút.');
    const noiDungChuan = chuanHoa(noiDung);
    // Hai HS có thể gõ cùng một câu, nên chỉ coi là gửi lặp khi trùng trong 10 phút (và cùng tình huống).
    if (!khongDungAI && (await vuaCoTrung(noiDungChuan + (tinhHuongId ? ' #' + tinhHuongId : ''), 10))) return res.status(200).json({ ok: true, trung: true });

    // 5. Ghi vào cơ sở dữ liệu
    await themPrompt({
      dot,
      nguon,
      khoi,
      boi_canh: boiCanh,
      mon,
      noi_dung: noiDung,
      noi_dung_chuan: noiDungChuan + (tinhHuongId ? ' #' + tinhHuongId : ''),
      can_ra: tt.nhac.length > 0, // HS1 rà lại các câu có thể chứa tên người
      kieu_thu: giaoTinhHuong ? 'tinh_huong' : 'tu_do',
      tinh_huong_id: tinhHuongId,
      cong_cu_ai: congCu,
      // HS chọn "không dùng AI": vẫn ghi lại để đếm, nhưng không đưa vào danh sách chấm.
      ...(khongDungAI ? { trang_thai: 'loai', ly_do_loai: 'HS chọn không dùng AI cho việc này' } : {})
    });
    res.status(200).json({ ok: true });
  } catch (loi) {
    baoLoiMayChu(res, loi);
  }
}
