// Trang Đối khớp: chỉ có dữ liệu khi cả HS1 và HS2 đã khóa kết quả chấm.
// Hai em ngồi cùng nhau, bàn từng ca lệch, ghi nguyên nhân, đề xuất sửa tiêu chí và màu thống nhất.
// GV chỉ xem.

import { $, $$, sach, thongBao, goiMayChu, nhom } from './app.js';
import { layVai } from './nhom.js';
import { TEN_MAU } from './chung/luat-tam.js';
import { CAC_MAU } from './chung/thong-ke.js';

const TEN_BOI_CANH = { tuhoc: 'Tự học', venha: 'Bài về nhà', duan: 'Dự án', kiemtra: 'Kiểm tra', khac: 'Việc khác' };
const TEN_NGUYEN_NHAN = { tieu_chi_mo_ho: 'Tiêu chí viết mơ hồ', thieu_boi_canh: 'Prompt thiếu bối cảnh', hieu_sai: 'Một bạn hiểu sai tiêu chí', khac: 'Nguyên nhân khác' };
const TC = ['tc1', 'tc2', 'tc3', 'tc5'];
const vien = (mau, chu) => `<span class="pill c-${mau}">${chu || TEN_MAU[mau]}</span>`;
const mauCuoi = k => vien(k.mau_cuoi, k.do_tuyet_doi ? 'Đỏ tuyệt đối' : '');
const o = (so, nhan) => `<div class="tile"><span class="v">${so}</span><span class="k">${nhan}</span></div>`;
const soVN = (x, le) => x.toFixed(le).replace('.', ',');

function veCa(c, duocGhi) {
  const kl = c.ket_luan;
  const hang = TC.map(k => `<tr><th>${k.toUpperCase()}</th><td class="${c.hs1[k] === c.hs2[k] ? '' : 'diag'}">${TEN_MAU[c.hs1[k]]}</td><td class="${c.hs1[k] === c.hs2[k] ? '' : 'diag'}">${TEN_MAU[c.hs2[k]]}</td></tr>`).join('');
  const phanGhi = duocGhi ? `
    <label class="f" for="dk-nn-${c.id}">Nguyên nhân lệch<select id="dk-nn-${c.id}">${Object.entries(TEN_NGUYEN_NHAN).map(([ma, ten]) => `<option value="${ma}" ${kl?.nguyen_nhan === ma ? 'selected' : ''}>${ten}</option>`).join('')}</select></label>
    <label class="f" for="dk-dx-${c.id}">Đề xuất sửa tiêu chí<input type="text" id="dk-dx-${c.id}" maxlength="500" value="${sach(kl?.de_xuat_sua || '')}" placeholder="Ví dụ: TC1 tách 'AI chỉ ra lỗi' và 'AI sửa trực tiếp'"></label>
    <div class="pick"><div class="n">Màu hai em thống nhất</div><div class="three" id="dk-mau-${c.id}">${CAC_MAU.map(m => `<button data-c="${m}" aria-pressed="${kl?.mau_thong_nhat === m}" aria-label="${TEN_MAU[m]}">${TEN_MAU[m][0]}</button>`).join('')}</div></div>
    <button class="btn sm" data-luu="${c.id}">${kl ? 'Lưu thay đổi' : 'Lưu kết luận'}</button>`
    : kl ? `<div class="hint">Nguyên nhân: ${TEN_NGUYEN_NHAN[kl.nguyen_nhan]}${kl.de_xuat_sua ? ' · Đề xuất: ' + sach(kl.de_xuat_sua) : ''}</div>` : '<div class="hint">Hai em chưa ghi kết luận.</div>';
  return `<div class="case">
    <div class="vs"><span class="code">${c.ma}</span><span class="tag">${[TEN_BOI_CANH[c.boi_canh], sach(c.mon)].filter(Boolean).join(' · ')}</span>${kl ? `<span style="margin-left:auto">Thống nhất ${vien(kl.mau_thong_nhat)}</span>` : ''}</div>
    ${c.nhiem_vu ? `<div class="hint">Tình huống được giao: ${sach(c.nhiem_vu)}</div>` : ''}
    <div class="quote">${sach(c.noi_dung)}</div>
    <div class="scroll"><table><tr><th></th><th>HS1 ${c.hs1.ca_kho ? '★' : ''}</th><th>HS2 ${c.hs2.ca_kho ? '★' : ''}</th></tr>${hang}<tr><th>Màu cuối</th><td>${mauCuoi(c.hs1)}</td><td>${mauCuoi(c.hs2)}</td></tr></table></div>
    <div class="hint">HS1: ${sach(c.hs1.ly_do)}</div><div class="hint">HS2: ${sach(c.hs2.ly_do)}</div>
    ${phanGhi}</div>`;
}

async function luu(id) {
  const mau = $(`#dk-mau-${id} [aria-pressed="true"]`)?.dataset.c;
  if (!mau) return thongBao('Hai em chọn màu thống nhất');
  const kq = await goiMayChu('/api/doi-khop', {
    dot: nhom.dot, prompt_id: id, mau_thong_nhat: mau,
    nguyen_nhan: $(`#dk-nn-${id}`).value, de_xuat_sua: $(`#dk-dx-${id}`).value.trim()
  });
  if (!kq.ok) return thongBao(kq.loi || 'Chưa lưu được.');
  thongBao('Đã lưu kết luận');
  veDoiKhop(true);
}

export async function veDoiKhop(giuViTri) {
  const viTri = window.scrollY;
  const kq = await goiMayChu('/api/doi-khop?dot=' + nhom.dot);
  if (!kq.ok) { $('#dk-wait').hidden = $('#dk-body').hidden = true; return thongBao(kq.loi || 'Chưa tải được.'); }
  $('#dk-wait').hidden = kq.mo;
  $('#dk-body').hidden = !kq.mo;
  if (!kq.mo) {
    $('#dk-wait-text').textContent = ['HS1', 'HS2'].map(n => `${n}: ${kq.da_khoa.includes(n) ? 'đã khóa' : 'chưa khóa'}`).join(' · ');
    return;
  }
  const daBan = kq.ca_lech.filter(c => c.ket_luan).length;
  $('#dk-tiles').innerHTML =
    o(`${kq.cung}<small> / ${kq.n}</small>`, 'Câu chấm cùng màu') +
    o(kq.n ? soVN(kq.ty_le * 100, 0) + '<small>%</small>' : '–', 'Tỷ lệ đồng thuận') +
    o(kq.kappa === null ? '–' : soVN(kq.kappa, 2), "Cohen's kappa (mục tiêu từ 0,6)") +
    o(`${daBan}<small> / ${kq.ca_lech.length}</small>`, 'Ca lệch đã có kết luận');
  $('#dk-matrix').innerHTML = `<tr><th>HS1 \\ HS2</th>${CAC_MAU.map(m => `<th>${TEN_MAU[m]}</th>`).join('')}</tr>` +
    CAC_MAU.map((a, i) => `<tr><th>${TEN_MAU[a]}</th>${CAC_MAU.map((_, j) => `<td class="${i === j ? 'diag' : ''}">${kq.ma_tran[i][j]}</td>`).join('')}</tr>`).join('');
  $('#dk-tc').innerHTML = kq.theo_tieu_chi.map(t => `<span>${t.tc}</span><span class="t"><b class="bg-A" style="width:${t.n ? (t.cung / t.n) * 100 : 0}%"></b></span><span>${t.cung} / ${t.n}</span>`).join('');
  $('#dk-kho').textContent = `Có ${kq.ca_kho} câu được ít nhất một bạn đánh dấu ★ khó quyết.`;
  const duocGhi = layVai() !== 'GV';
  $('#dk-cases').innerHTML = kq.ca_lech.length ? kq.ca_lech.map(c => veCa(c, duocGhi)).join('') : '<p class="hint">Không có ca lệch màu nào.</p>';
  $$('#dk-cases .three').forEach(nhomNut => nhomNut.querySelectorAll('button').forEach(nut => {
    nut.onclick = () => nhomNut.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === nut));
  }));
  $$('#dk-cases [data-luu]').forEach(nut => (nut.onclick = () => luu(Number(nut.dataset.luu))));
  if (giuViTri === true) window.scrollTo(0, viTri);
}
