// GET /api/trang-thai
// Trả về: đợt thu đang mở, kiểu thu của đợt, tiến độ thu prompt, link hai phiếu khảo sát.

import { docCauHinh, demPromptGop } from './_lib/db.js';
import { chiNhan, baoLoiMayChu, linkFormHopLe } from './_lib/http.js';

export default async function handler(req, res) {
  if (!chiNhan(req, res, 'GET')) return;
  try {
    const ch = await docCauHinh();
    const dot = [1, 2].includes(Number(ch.dot_dang_mo)) ? Number(ch.dot_dang_mo) : 0;
    res.status(200).json({
      dot,
      kieu: dot && ch['kieu_dot_' + dot] === 'tinh_huong' ? 'tinh_huong' : 'tu_do',
      da_thu: dot ? await demPromptGop(dot) : 0,
      muc_tieu: dot ? Number(ch['muc_tieu_dot_' + dot]) || 0 : 0,
      khao_sat_truoc: linkFormHopLe(ch.link_khao_sat_truoc),
      khao_sat_sau: linkFormHopLe(ch.link_khao_sat_sau)
    });
  } catch (loi) {
    baoLoiMayChu(res, loi);
  }
}
