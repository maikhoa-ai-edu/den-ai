// Trang Làm sạch (HS1 và GV): rà từng câu đã góp, đánh dấu Hợp lệ hoặc Loại kèm lý do.
// Không xóa câu nào khỏi cơ sở dữ liệu.

import { $, $$, sach, thongBao, goiMayChu, nhom } from './app.js';

const TEN_BOI_CANH = { tuhoc: 'Tự học', venha: 'Bài về nhà', duan: 'Dự án', kiemtra: 'Kiểm tra', khac: 'Việc khác' };
const TEN_CONG_CU = { chatgpt: 'ChatGPT', gemini: 'Gemini', copilot: 'Copilot', khac: 'công cụ khác', khong_dung: 'không dùng AI' };
const NHAN = { moi: '<span class="pill na">Chưa rà</span>', hop_le: '<span class="pill c-X">Hợp lệ</span>', loai: '<span class="pill c-D">Loại</span>' };

async function doi(id, trangThai) {
  const lyDo = $(`#ls-ly-do-${id}`)?.value.trim() || '';
  if (trangThai === 'loai' && !lyDo) return thongBao('Em ghi lý do loại câu này');
  const kq = await goiMayChu('/api/lam-sach', { id, trang_thai: trangThai, ly_do_loai: lyDo });
  if (!kq.ok) return thongBao(kq.loi || 'Chưa lưu được.');
  veLamSach(true);
}

export async function veLamSach(giuViTri) {
  const viTri = window.scrollY;
  const kq = await goiMayChu('/api/lam-sach?dot=' + nhom.dot);
  if (!kq.ok) return thongBao(kq.loi || 'Chưa tải được danh sách.');
  const dem = tt => kq.ds.filter(p => p.trang_thai === tt).length;
  $('#ls-meter').innerHTML = `<span>Tổng <b>${kq.ds.length}</b></span><span>Chưa rà <b>${dem('moi')}</b></span><span>Hợp lệ <b>${dem('hop_le')}</b></span><span>Loại <b>${dem('loai')}</b></span>`;
  $('#ls-lock').hidden = !kq.da_khoa;
  $('#ls-list').innerHTML = kq.ds.length ? kq.ds.map(p => `<div class="card">
    <div class="head"><span class="code">${p.ma}</span><span class="tag">${[`Khối ${p.khoi}`, TEN_BOI_CANH[p.boi_canh], sach(p.mon)].filter(Boolean).join(' · ')}</span></div>
    ${p.nhiem_vu ? `<div class="hint">Tình huống được giao: ${sach(p.nhiem_vu)}${p.cong_cu_ai ? ' · Công cụ: ' + (TEN_CONG_CU[p.cong_cu_ai] || '') : ''}</div>` : ''}
    <div class="quote">${sach(p.noi_dung)}</div>
    ${p.can_ra ? '<div class="warn soft">Có thể chứa tên người thật. Đọc kĩ trước khi cho Hợp lệ.</div>' : ''}
    <div class="vs">${NHAN[p.trang_thai]}${p.ly_do_loai ? `<span class="hint">${sach(p.ly_do_loai)}</span>` : ''}</div>
    ${kq.da_khoa || p.cong_cu_ai === 'khong_dung' ? '' : `<div class="rowbtn"><button class="btn sm" data-id="${p.id}" data-tt="hop_le">Hợp lệ</button>
      <input type="text" id="ls-ly-do-${p.id}" maxlength="200" placeholder="Lý do nếu loại" aria-label="Lý do loại ${p.ma}">
      <button class="btn ghost sm" data-id="${p.id}" data-tt="loai">Loại</button></div>`}
  </div>`).join('') : '<div class="card"><p class="hint">Đợt này chưa có câu nào.</p></div>';
  $$('#ls-list [data-tt]').forEach(nut => (nut.onclick = () => doi(Number(nut.dataset.id), nut.dataset.tt)));
  if (giuViTri === true) window.scrollTo(0, viTri);
}

export function khoiDongLamSach() { /* nút được gắn mỗi lần vẽ danh sách */ }
