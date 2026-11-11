// LUẬT TẠM để chấm màu khi chưa có AI.
// Dựa trên bộ tiêu chí v0.1 (file 02). Chỉ dò từ khóa nên sẽ có ca chấm sai:
// HS2 ghi lại các ca đó để sửa tiêu chí và để viết system prompt sau khi chốt v1.0.
// Sau 17/11 tệp này được thay bằng lời gọi Gemini ở máy chủ.

import { timThongTinCaNhan } from './chan-thong-tin.js';

export const PHIEN_BAN_LUAT = 'luat-tam-0.1';
export const PHIEN_BAN_TIEU_CHI = 'v0.1';

export const TEN_MAU = { X: 'Xanh', V: 'Vàng', D: 'Đỏ' };
export const TEN_TIEU_CHI = {
  TC1: 'TC1. Ai làm phần tư duy chính?',
  TC2: 'TC2. Bối cảnh nhiệm vụ',
  TC3: 'TC3. Dữ liệu đưa vào AI',
  TC5: 'TC5. Mục đích'
};

const HANG = { X: 0, V: 1, D: 2 };
export const mauXauNhat = ds => ds.reduce((m, c) => (HANG[c] > HANG[m] ? c : m), 'X');

// TC1: AI làm trọn sản phẩm
const TC1_DO = [
  'viết giúp', 'viết hộ', 'viết cho', 'làm giúp', 'làm hộ', 'làm bài giúp', 'làm bài hộ',
  'giải giúp', 'giải hộ', 'giải đề', 'soạn giúp', 'soạn hộ', 'soạn bài giúp',
  'để nộp', 'mai nộp', 'để mình nộp', 'để em nộp', 'cho đáp án', 'đáp án bài'
];
// TC1: AI làm một phần
const TC1_VANG = ['dàn ý', 'sửa', 'dịch', 'tóm tắt', 'mở bài', 'kết bài', 'bài mẫu', 'văn mẫu', 'liệt kê'];
// TC5: gây hại, giả mạo, xúc phạm (thuộc nhóm Đỏ tuyệt đối)
const TC5_DO = ['ghép mặt', 'giả giọng', 'deepfake', 'ảnh chế', 'chửi', 'bắt nạt lại', 'nói xấu', 'bôi nhọ', 'trêu chọc'];

const TC2_THEO_BOI_CANH = { tuhoc: 'X', venha: 'V', duan: 'V', kiemtra: 'D', khac: 'X' };

export function chamTam(prompt, boiCanh) {
  const t = String(prompt || '').normalize('NFC').toLowerCase();
  const co = ds => ds.some(tu => t.includes(tu));

  const tc = {
    TC1: co(TC1_DO) ? 'D' : co(TC1_VANG) ? 'V' : 'X',
    TC2: TC2_THEO_BOI_CANH[boiCanh] || 'V',
    TC3: timThongTinCaNhan(prompt).chan.length ? 'D' : 'X',
    TC5: co(TC5_DO) ? 'D' : 'X'
  };

  // Đỏ tuyệt đối: dùng AI khi đang kiểm tra; giả mạo, xúc phạm người khác.
  const tuyetDoi = boiCanh === 'kiemtra' || tc.TC5 === 'D';
  const mauCuoi = tuyetDoi ? 'D' : mauXauNhat(Object.values(tc));
  const quyetDinh = Object.keys(tc).filter(k => tc[k] === mauCuoi);

  let xanhHoa = 'Giữ nguyên. Nhớ đối chiếu câu trả lời với sách giáo khoa.';
  if (tc.TC3 === 'D') xanhHoa = 'Bỏ tên, địa chỉ, số điện thoại. Chỉ mô tả tình huống chung, ví dụ: "Một bạn trong lớp…".';
  else if (tc.TC1 === 'D') xanhHoa = 'Hỏi mình 5 câu để mình tự tìm ý, rồi nhận xét bài mình tự làm.';
  else if (tc.TC1 === 'V') xanhHoa = 'Mình đã tự làm thế này: […]. Chỉ chỗ chưa ổn và giải thích, để mình tự sửa.';
  if (tuyetDoi) xanhHoa = '';

  return { tc, mauCuoi, tuyetDoi, quyetDinh, xanhHoa, phienBanLuat: PHIEN_BAN_LUAT, phienBanTieuChi: PHIEN_BAN_TIEU_CHI };
}
