// Trang Nhật ký dự án.
// HS1, HS2: ghi theo ngày việc đã làm, minh chứng, việc tiếp theo; có dùng AI thì khai báo 4 mục.
// GV: chỉ đọc và nhận xét. Cả ba xuất được tệp CSV hoặc in để làm phụ lục báo cáo.

import { $, $$, sach, thongBao, goiMayChu } from './app.js';
import { layVai } from './nhom.js';

const O_AI = { ai_cong_cu: '#nk-ai-cc', ai_muc_dich: '#nk-ai-md', ai_pham_vi: '#nk-ai-pv', ai_kiem_chung: '#nk-ai-kc' };
let ds = [];
let dangSua = null;
let loc = 'tat-ca'; // tat-ca | HS1 | HS2 | ai

const homNay = () => { const d = new Date(); return new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
const ngayVN = iso => iso.split('-').reverse().join('/');

function dienO(d) {
  dangSua = d?.id ?? null;
  $('#nk-form-title').textContent = d ? 'Sửa nhật ký ngày ' + ngayVN(d.ngay) : 'Ghi nhật ký';
  $('#nk-cancel').hidden = !d;
  $('#nk-ngay').value = d?.ngay || homNay();
  $('#nk-viec').value = d?.viec_da_lam || '';
  $('#nk-mc').value = d?.minh_chung || '';
  $('#nk-tiep').value = d?.viec_tiep_theo || '';
  $('#nk-ai').checked = !!d?.dung_ai;
  for (const [cot, o] of Object.entries(O_AI)) $(o).value = d?.[cot] || '';
  $('#nk-ai-box').hidden = !$('#nk-ai').checked;
}

async function luu() {
  const gui = {
    ...(dangSua ? { id: dangSua } : {}),
    ngay: $('#nk-ngay').value, viec_da_lam: $('#nk-viec').value, minh_chung: $('#nk-mc').value, viec_tiep_theo: $('#nk-tiep').value,
    dung_ai: $('#nk-ai').checked
  };
  for (const [cot, o] of Object.entries(O_AI)) gui[cot] = $(o).value;
  $('#nk-save').disabled = true;
  const kq = await goiMayChu('/api/nhat-ky', gui);
  $('#nk-save').disabled = false;
  if (!kq.ok) return thongBao(kq.loi || 'Chưa lưu được.');
  thongBao('Đã lưu nhật ký');
  dienO(null);
  veNhatKy();
}

async function luuNhanXet(id) {
  const kq = await goiMayChu('/api/nhat-ky', { id, nhan_xet_gv: $(`#nk-nx-${id}`).value }, 'PUT');
  thongBao(kq.ok ? 'Đã lưu nhận xét' : kq.loi || 'Chưa lưu được.');
  if (kq.ok) veNhatKy();
}

const dong = (nhan, noiDung) => (noiDung ? `<div><strong>${nhan}:</strong> ${sach(noiDung).replace(/\n/g, '<br>')}</div>` : '');

function veDanhSach() {
  const vai = layVai();
  const hien = ds.filter(d => loc === 'tat-ca' || (loc === 'ai' ? d.dung_ai : d.nguoi_ghi === loc));
  $$('#nk-loc .chip').forEach(n => n.setAttribute('aria-pressed', n.dataset.v === loc));
  $('#nk-dem').textContent = `${ds.length} lần ghi, trong đó ${ds.filter(d => d.dung_ai).length} lần có dùng AI`;
  $('#nk-list').innerHTML = hien.length ? hien.map(d => `<div class="card">
    <div class="head"><strong>${ngayVN(d.ngay)}</strong><span class="rowbtn"><span class="pill na">${d.nguoi_ghi}</span>${
      d.nguoi_ghi === vai ? `<button class="btn ghost sm" data-sua="${d.id}">Sửa</button>` : ''}</span></div>
    ${dong('Việc đã làm', d.viec_da_lam)}${dong('Minh chứng', d.minh_chung)}${dong('Việc tiếp theo', d.viec_tiep_theo)}
    ${d.dung_ai ? `<div class="ai"><strong>Có dùng AI</strong>${dong('Công cụ', d.ai_cong_cu)}${dong('Mục đích, đã hỏi hoặc nhờ gì', d.ai_muc_dich)}${dong('Phạm vi AI hỗ trợ', d.ai_pham_vi)}${dong('Nhóm đã kiểm chứng, sửa gì', d.ai_kiem_chung)}</div>` : ''}
    ${vai === 'GV'
      ? `<div class="rowbtn noprint"><input type="text" id="nk-nx-${d.id}" maxlength="1000" value="${sach(d.nhan_xet_gv)}" placeholder="Nhận xét của giáo viên" aria-label="Nhận xét cho ngày ${ngayVN(d.ngay)}"><button class="btn sm" data-nx="${d.id}">Lưu nhận xét</button></div>${d.nhan_xet_gv ? `<div class="warn soft onlyprint">${dong('Nhận xét của GV', d.nhan_xet_gv)}</div>` : ''}`
      : d.nhan_xet_gv ? `<div class="warn soft">${dong('Nhận xét của GV', d.nhan_xet_gv)}</div>` : ''}
  </div>`).join('') : '<div class="card"><p class="hint">Chưa có lần ghi nào.</p></div>';
  $$('#nk-list [data-sua]').forEach(n => (n.onclick = () => { dienO(ds.find(d => d.id === Number(n.dataset.sua))); $('#nk-form').scrollIntoView({ behavior: 'smooth' }); }));
  $$('#nk-list [data-nx]').forEach(n => (n.onclick = () => luuNhanXet(Number(n.dataset.nx))));
}

export async function veNhatKy() {
  $('#nk-form').hidden = layVai() === 'GV';
  if (!dangSua && !$('#nk-ngay').value) dienO(null);
  const kq = await goiMayChu('/api/nhat-ky');
  if (!kq.ok) return thongBao(kq.loi || 'Chưa tải được nhật ký.');
  ds = kq.ds;
  veDanhSach();
}

// Xuất CSV: mở được bằng Excel hoặc Google Sheets để dán vào phụ lục báo cáo.
function xuatCSV() {
  const cot = [['ngay', 'Ngày'], ['nguoi_ghi', 'Người ghi'], ['viec_da_lam', 'Việc đã làm'], ['minh_chung', 'Minh chứng'], ['viec_tiep_theo', 'Việc tiếp theo'],
    ['dung_ai', 'Có dùng AI'], ['ai_cong_cu', 'Công cụ AI'], ['ai_muc_dich', 'Mục đích, hỏi hoặc nhờ gì'], ['ai_pham_vi', 'Phạm vi AI hỗ trợ'], ['ai_kiem_chung', 'Nhóm đã kiểm chứng, sửa gì'], ['nhan_xet_gv', 'Nhận xét của GV']];
  const o = v => '"' + String(v === true ? 'Có' : v === false ? 'Không' : v ?? '').replace(/"/g, '""') + '"';
  const theoNgay = [...ds].reverse(); // phụ lục đọc từ ngày đầu đến ngày cuối
  const csv = [cot.map(c => o(c[1])).join(','), ...theoNgay.map(d => cot.map(c => o(c[0] === 'ngay' ? ngayVN(d.ngay) : d[c[0]])).join(','))].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
  a.download = 'nhat-ky-du-an-den-ai.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}

export function khoiDongNhatKy() {
  $('#nk-ai').onchange = () => ($('#nk-ai-box').hidden = !$('#nk-ai').checked);
  $('#nk-save').onclick = luu;
  $('#nk-cancel').onclick = () => dienO(null);
  $('#nk-csv').onclick = xuatCSV;
  $('#nk-in').onclick = () => window.print();
  $$('#nk-loc .chip').forEach(n => (n.onclick = () => { loc = n.dataset.v; veDanhSach(); }));
}
