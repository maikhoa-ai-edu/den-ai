// /api/phan-loai?dot=1
//   GET  -> HS1, HS2: các câu cần chấm và kết quả của CHÍNH MÌNH. GV: chỉ tiến độ của hai em.
//   POST -> HS1, HS2 lưu kết quả chấm một câu
//   PUT  -> HS1, HS2 khóa kết quả của mình cho cả đợt (không sửa được nữa)
//
// TÍNH ĐỘC LẬP: hàm này không bao giờ trả kết quả chấm của bạn kia.
// Máy chủ lọc theo tài khoản đang đăng nhập, không tin tên người chấm do trình duyệt gửi lên.

import { mauXauNhat } from '../public/js/chung/luat-tam.js';
import { docCauHinh, dsPrompt, layPrompt, dsPhanLoai, luuPhanLoai, dsKhoa, themKhoa, dsTinhHuong } from './_lib/db.js';
import { docThan, baoLoiMayChu, maPrompt } from './_lib/http.js';
import { canVai } from './_lib/phien.js';

const TC = ['tc1', 'tc2', 'tc3', 'tc5']; // TC4 không chấm khi chỉ có prompt
const MAU = ['X', 'V', 'D'];
const NGUOI_CHAM = ['HS1', 'HS2'];

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const vai = canVai(req, res, req.method === 'GET' ? ['GV', 'HS1', 'HS2'] : NGUOI_CHAM);
  if (!vai) return;
  try {
    const b = docThan(req);
    const thamSo = new URL(req.url, 'http://x').searchParams;
    const dot = Number(thamSo.get('dot') ?? b.dot) === 2 ? 2 : 1;
    const hopLe = (await dsPrompt(dot)).filter(p => p.trang_thai === 'hop_le');
    const khoa = await dsKhoa(dot);
    const daKhoa = nguoi => khoa.some(k => k.nguoi_cham === nguoi);

    if (req.method === 'GET') {
      if (vai === 'GV') {
        const tatCa = await dsPhanLoai(dot);
        const idHopLe = new Set(hopLe.map(p => p.id));
        return res.status(200).json({
          ok: true, dot, tong: hopLe.length,
          tien_do: NGUOI_CHAM.map(n => ({
            nguoi_cham: n,
            da_cham: tatCa.filter(d => d.nguoi_cham === n && idHopLe.has(d.prompt_id)).length,
            da_khoa: daKhoa(n)
          }))
        });
      }
      const nhiemVu = new Map((await dsTinhHuong()).map(t => [t.id, t.nhiem_vu]));
      const cuaToi = new Map((await dsPhanLoai(dot, vai)).map(d => [d.prompt_id, d]));
      return res.status(200).json({
        ok: true, dot, tong: hopLe.length, da_khoa: daKhoa(vai),
        phien_ban_tieu_chi: (await docCauHinh()).phien_ban_tieu_chi,
        ds: hopLe.map(p => ({
          id: p.id, ma: maPrompt(p.id), noi_dung: p.noi_dung, boi_canh: p.boi_canh, mon: p.mon,
          nhiem_vu: nhiemVu.get(p.tinh_huong_id) || '', cong_cu_ai: p.cong_cu_ai || '',
          cham: cuaToi.get(p.id) || null
        }))
      });
    }

    if (daKhoa(vai)) return res.status(409).json({ loi: 'Em đã khóa kết quả của đợt này nên không sửa được nữa.' });

    if (req.method === 'POST') {
      const p = await layPrompt(Number(b.prompt_id));
      if (!p || p.dot !== dot || p.trang_thai !== 'hop_le') return res.status(404).json({ loi: 'Câu này không nằm trong danh sách cần chấm.' });
      if (!TC.every(k => MAU.includes(b[k]))) return res.status(400).json({ loi: 'Em chấm đủ 4 tiêu chí rồi lưu.' });
      const lyDo = String(b.ly_do || '').trim().slice(0, 300);
      if (!lyDo) return res.status(400).json({ loi: 'Em ghi lý do 1 câu rồi lưu.' });
      const tuyetDoi = b.do_tuyet_doi === true;
      await luuPhanLoai({
        prompt_id: p.id, dot, nguoi_cham: vai,
        tc1: b.tc1, tc2: b.tc2, tc3: b.tc3, tc5: b.tc5,
        do_tuyet_doi: tuyetDoi,
        mau_cuoi: tuyetDoi ? 'D' : mauXauNhat(TC.map(k => b[k])), // màu cuối = màu xấu nhất, máy chủ tự tính
        ly_do: lyDo,
        ca_kho: b.ca_kho === true,
        phien_ban_tieu_chi: (await docCauHinh()).phien_ban_tieu_chi
      });
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'PUT') {
      const daCham = new Set((await dsPhanLoai(dot, vai)).map(d => d.prompt_id));
      const conLai = hopLe.filter(p => !daCham.has(p.id)).length;
      if (!hopLe.length) return res.status(400).json({ loi: 'Đợt này chưa có câu nào để chấm.' });
      if (conLai) return res.status(400).json({ loi: `Em còn ${conLai} câu chưa chấm.` });
      await themKhoa(dot, vai);
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ loi: 'Phương thức không được hỗ trợ.' });
  } catch (loi) {
    baoLoiMayChu(res, loi);
  }
}
