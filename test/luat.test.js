// Chạy: npm test
// Kiểm tra hai tệp luật dùng chung. Ví dụ lấy từ file 02 (bộ tiêu chí v0.1).

import test from 'node:test';
import assert from 'node:assert/strict';
import { timThongTinCaNhan, chuanHoa } from '../public/js/chung/chan-thong-tin.js';
import { chamTam } from '../public/js/chung/luat-tam.js';

test('chặn số điện thoại, email, tên bạn học, địa chỉ', () => {
  for (const cau of [
    'gọi cho mình số 0912 345 678 nhé',
    'liên hệ +84912345678',
    'gửi về abc.def@gmail.com giúp mình',
    'Bạn Lan lớp mình hay bị bắt nạt, mình nên làm gì?',
    'mình tên Hưng, viết giúp mình bài giới thiệu',
    'bạn ấy nhà ở gần chợ Vĩnh Phong'
  ]) assert.ok(timThongTinCaNhan(cau).chan.length > 0, cau);
});

test('không chặn câu hỏi học tập bình thường', () => {
  for (const cau of [
    'Giải thích lạm phát bằng ví dụ ở chợ quê, rồi hỏi mình 3 câu để kiểm tra',
    'Mình giải ra x = 4, kiểm tra giúp mình sai ở bước nào',
    'Một bạn trong lớp hay bị bắt nạt, mình nên làm gì?',
    'Bạn A và bạn B cùng chạy 100 m, tính vận tốc trung bình',
    'Tính 123456 x 789',
    'Dịch đoạn văn này sang tiếng Anh | Văn',
    'Làm bài tập Anh Văn unit 3 thế nào cho nhanh hiểu'
  ]) assert.deepEqual(timThongTinCaNhan(cau), { chan: [], nhac: [] }, cau);
});

test('tên tác giả chỉ nhắc, không chặn', () => {
  const kq = timThongTinCaNhan('Phân tích hai câu đầu bài Truyện Kiều của Nguyễn Du');
  assert.equal(kq.chan.length, 0);
  assert.ok(kq.nhac.length > 0);
});

test('chuẩn hóa để so trùng', () => {
  assert.equal(chuanHoa('  Giải thích  CUNG – CẦU!! '), chuanHoa('giải thích cung cầu'));
});

test('luật tạm: các ca rõ ràng', () => {
  assert.equal(chamTam('Giải thích lạm phát bằng ví dụ ở chợ quê', 'tuhoc').mauCuoi, 'X');
  assert.equal(chamTam('Lập dàn ý bài nghị luận về lối sống ảo', 'venha').mauCuoi, 'V');
  assert.equal(chamTam('Viết giúp mình bài nghị luận 600 chữ để mai nộp', 'venha').mauCuoi, 'D');
  const kt = chamTam('Giải đề kiểm tra 15 phút này giúp mình', 'kiemtra');
  assert.ok(kt.tuyetDoi && kt.mauCuoi === 'D' && kt.xanhHoa === '');
  assert.ok(chamTam('ghép mặt bạn ấy vào ảnh hài', 'khac').tuyetDoi);
});
