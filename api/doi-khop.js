// /api/doi-khop?dot=1
//   GET  -> GV, HS1, HS2: số liệu đồng thuận và danh sách ca lệch màu
//   POST -> HS1, HS2: ghi kết luận cho một ca lệch (nguyên nhân, đề xuất sửa tiêu chí, màu thống nhất)
//
// Trang này CHỈ MỞ khi cả HS1 và HS2 đã khóa kết quả chấm của đợt.
// Trước lúc đó, hàm không trả bất kỳ kết quả chấm nào.
// Kết quả chấm độc lập ban đầu không bị sửa; kết luận sau khi bàn được ghi ở bảng riêng.

import { doiChieu } from '../public/js/chung/thong-ke.js';
import { dsPrompt, dsPhanLoai, dsKhoa, dsDoiKhop, luuDoiKhop, dsTinhHuong } from './_lib/db.js';
import { docThan, baoLoiMayChu, maPrompt } from './_lib/http.js';
import { canVai } from './_lib/phien.js';

const TC = ['tc1', 'tc2', 'tc3', 'tc5'];
const NGUYEN_NHAN = ['tieu_chi_mo_ho', 'thieu_boi_canh', 'hieu_sai', 'khac'];
const rutGon = d => ({ tc1: d.tc1, tc2: d.tc2, tc3: d.tc3, tc5: d.tc5, mau_cuoi: d.mau_cuoi, do_tuyet_doi: d.do_tuyet_doi, ly_do: d.ly_do, ca_kho: d.ca_kho });

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const vai = canVai(req, res, req.method === 'GET' ? ['GV', 'HS1', 'HS2'] : ['HS1', 'HS2']);
  if (!vai) return;
  try {
    const b = docThan(req);
    const dot = Number(new URL(req.url, 'http://x').searchParams.get('dot') ?? b.dot) === 2 ? 2 : 1;
    const daKhoa = (await dsKhoa(dot)).map(k => k.nguoi_cham);
    if (!(daKhoa.includes('HS1') && daKhoa.includes('HS2'))) {
      const tl = { ok: true, dot, mo: false, da_khoa: daKhoa };
      return req.method === 'GET' ? res.status(200).json(tl) : res.status(409).json({ loi: 'Trang Đối khớp chỉ mở khi cả hai bạn đã khóa.' });
    }

    // Ghép kết quả của hai em theo từng câu; chỉ lấy câu Hợp lệ mà cả hai đã chấm.
    const tatCa = await dsPhanLoai(dot);
    const cua = nguoi => new Map(tatCa.filter(d => d.nguoi_cham === nguoi).map(d => [d.prompt_id, d]));
    const hs1 = cua('HS1'), hs2 = cua('HS2');
    const cap = (await dsPrompt(dot))
      .filter(p => p.trang_thai === 'hop_le' && hs1.has(p.id) && hs2.has(p.id))
      .map(p => ({ p, a: hs1.get(p.id), b: hs2.get(p.id) }));
    const lech = cap.filter(c => c.a.mau_cuoi !== c.b.mau_cuoi);

    if (req.method === 'POST') {
      const ca = lech.find(c => c.p.id === Number(b.prompt_id));
      if (!ca) return res.status(404).json({ loi: 'Câu này không phải ca lệch màu.' });
      if (!NGUYEN_NHAN.includes(b.nguyen_nhan)) return res.status(400).json({ loi: 'Hai em chọn nguyên nhân lệch.' });
      if (!['X', 'V', 'D'].includes(b.mau_thong_nhat)) return res.status(400).json({ loi: 'Hai em chọn màu thống nhất.' });
      await luuDoiKhop({
        prompt_id: ca.p.id, dot,
        nguyen_nhan: b.nguyen_nhan,
        de_xuat_sua: String(b.de_xuat_sua || '').trim().slice(0, 500),
        mau_thong_nhat: b.mau_thong_nhat,
        nguoi_ghi: vai
      });
      return res.status(200).json({ ok: true });
    }
    if (req.method !== 'GET') return res.status(405).json({ loi: 'Phương thức không được hỗ trợ.' });

    const tk = doiChieu(cap.map(c => [c.a.mau_cuoi, c.b.mau_cuoi]));
    const nhiemVu = new Map((await dsTinhHuong()).map(t => [t.id, t.nhiem_vu]));
    const ketLuan = new Map((await dsDoiKhop(dot)).map(d => [d.prompt_id, d]));
    res.status(200).json({
      ok: true, dot, mo: true,
      n: tk.n, cung: tk.cung, ty_le: tk.po, kappa: tk.kappa, ma_tran: tk.maTran,
      // Đồng thuận theo từng tiêu chí: cho biết tiêu chí nào đang gây lệch nhiều nhất.
      theo_tieu_chi: TC.map(k => ({ tc: k.toUpperCase(), cung: cap.filter(c => c.a[k] === c.b[k]).length, n: tk.n })),
      ca_kho: cap.filter(c => c.a.ca_kho || c.b.ca_kho).length,
      ca_lech: lech.map(c => {
        const kl = ketLuan.get(c.p.id);
        return {
          id: c.p.id, ma: maPrompt(c.p.id), noi_dung: c.p.noi_dung, boi_canh: c.p.boi_canh, mon: c.p.mon, nhiem_vu: nhiemVu.get(c.p.tinh_huong_id) || '',
          hs1: rutGon(c.a), hs2: rutGon(c.b),
          ket_luan: kl ? { nguyen_nhan: kl.nguyen_nhan, de_xuat_sua: kl.de_xuat_sua, mau_thong_nhat: kl.mau_thong_nhat, nguoi_ghi: kl.nguoi_ghi } : null
        };
      })
    });
  } catch (loi) {
    baoLoiMayChu(res, loi);
  }
}
