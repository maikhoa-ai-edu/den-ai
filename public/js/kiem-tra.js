// Trang Kiểm tra: chấm màu ngay trên trình duyệt bằng luật tạm.
// Câu hỏi KHÔNG được gửi đi đâu, trừ khi HS tự tích ô đồng ý và bấm "Góp câu này".

import { $, thongBao, nhomChon, daChon, goiMayChu } from './app.js';
import { chamTam, TEN_MAU, TEN_TIEU_CHI } from './chung/luat-tam.js';
import { timThongTinCaNhan } from './chung/chan-thong-tin.js';

const NGHIA = { X: 'nên dùng', V: 'dùng có điều kiện', D: 'không dùng' };
const vien = mau => `<span class="pill c-${mau}">${TEN_MAU[mau]}</span>`;

let vuaCham = null; // { noi_dung, boi_canh, mon } của lần bấm "Bật đèn" gần nhất

function batDen() {
  const noiDung = $('#ck-prompt').value.trim();
  const boiCanh = daChon('#ck-ctx');
  if (!noiDung) return thongBao('Em nhập câu hỏi trước nhé');
  if (!boiCanh) return thongBao('Em chọn mình đang làm gì');

  const kq = chamTam(noiDung, boiCanh);
  const mau = kq.mauCuoi;
  $('#ck-lamp').dataset.on = mau;
  $('#ck-title').innerHTML = `<span class="c-${mau}">${kq.tuyetDoi ? 'Đỏ tuyệt đối' : TEN_MAU[mau]}</span> · ${NGHIA[mau]}`;
  $('#ck-why').textContent = kq.tuyetDoi
    ? 'Thuộc nhóm không cần xét tiêu chí khác.'
    : `Màu cuối là màu xấu nhất, quyết định bởi ${kq.quyetDinh.join(', ')}.`;
  $('#ck-tc').innerHTML =
    Object.keys(TEN_TIEU_CHI).map(k => `<span>${TEN_TIEU_CHI[k]}</span>${vien(kq.tc[k])}`).join('') +
    '<span>TC4. Minh bạch và kiểm chứng</span><span class="pill na">Chờ kết quả</span>';
  $('#ck-green-box').hidden = !kq.xanhHoa;
  $('#ck-green').textContent = kq.xanhHoa;

  vuaCham = { noi_dung: noiDung, boi_canh: boiCanh, mon: $('#ck-mon').value };
  $('#ck-donate').checked = false;
  $('#ck-donate').disabled = false;
  $('#ck-donate-more').hidden = true;
  $('#ck-donate-box').hidden = false;
  $('#ck-result').hidden = false;
  $('#ck-result').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function gopCauNay() {
  if (!vuaCham || !$('#ck-donate').checked) return;
  const khoi = daChon('#ck-khoi');
  if (!khoi) return thongBao('Em chọn khối lớp');
  const tt = timThongTinCaNhan(vuaCham.noi_dung);
  if (tt.chan.length || tt.nhac.length) {
    return thongBao('Câu này có thông tin riêng (' + [...tt.chan, ...tt.nhac].join(', ') + ') nên không góp được.');
  }
  $('#ck-donate-send').disabled = true;
  const kq = await goiMayChu('/api/gop-prompt', { ...vuaCham, khoi: Number(khoi), nguon: 'kiem_tra' });
  $('#ck-donate-send').disabled = false;
  if (!kq.ok) return thongBao(kq.loi || 'Chưa gửi được, em thử lại nhé.');
  $('#ck-donate-box').hidden = true;
  thongBao('Đã góp ẩn danh. Cảm ơn em.');
}

function doiCheDo(giaoVien) {
  $('#mode-hs').setAttribute('aria-pressed', !giaoVien);
  $('#mode-gv').setAttribute('aria-pressed', giaoVien);
  $('#hs-form').hidden = giaoVien;
  $('#gv-form').hidden = !giaoVien;
  $('#ck-result').hidden = true;
}

export function khoiDongKiemTra() {
  nhomChon('#ck-ctx');
  nhomChon('#ck-khoi');
  $('#ck-go').onclick = batDen;
  $('#mode-hs').onclick = () => doiCheDo(false);
  $('#mode-gv').onclick = () => doiCheDo(true);
  $('#ck-donate').onchange = e => ($('#ck-donate-more').hidden = !e.target.checked);
  $('#ck-donate-send').onclick = gopCauNay;
}
