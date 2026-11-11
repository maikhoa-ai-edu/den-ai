// /api/phien
//   GET    -> đang đăng nhập bằng tài khoản nào
//   POST   -> đăng nhập { vai, mat_khau }
//   DELETE -> đăng xuất

import { docThan, baoLoiMayChu } from './_lib/http.js';
import { dungMatKhau, capVe, huyVe, docVai } from './_lib/phien.js';

const cho = ms => new Promise(xong => setTimeout(xong, ms));

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') return res.status(200).json({ vai: docVai(req) });
    if (req.method === 'DELETE') { huyVe(res); return res.status(200).json({ ok: true }); }
    if (req.method !== 'POST') return res.status(405).json({ loi: 'Phương thức không được hỗ trợ.' });

    const b = docThan(req);
    if (!dungMatKhau(b.vai, String(b.mat_khau || ''))) {
      await cho(800); // làm chậm việc dò mật khẩu
      return res.status(401).json({ loi: 'Sai tài khoản hoặc mật khẩu.' });
    }
    capVe(res, b.vai);
    res.status(200).json({ ok: true, vai: b.vai });
  } catch (loi) {
    baoLoiMayChu(res, loi);
  }
}
