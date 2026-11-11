// Phát hiện thông tin cá nhân trong câu hỏi (prompt).
// Tệp này dùng chung cho trình duyệt (báo ngay cho HS) và máy chủ (kiểm tra lần hai).
// Luật chỉ bắt được các mẫu thường gặp. Nhóm nghiên cứu vẫn phải rà lại bằng mắt (file 04).
//
// Hai mức:
//   chan : chắc chắn là thông tin cá nhân  -> không cho gửi
//   nhac : có thể là tên người thật        -> hỏi lại HS, nếu vẫn gửi thì đánh dấu "cần rà"

const HO = [
  'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Huỳnh', 'Hoàng', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ',
  'Ngô', 'Dương', 'Lý', 'Mai', 'Trương', 'Đinh', 'Lâm', 'Đoàn', 'Trịnh', 'Tô', 'Châu', 'Tạ',
  'Quách', 'Lưu'
];

const TEN = '\\p{Lu}\\p{Ll}+'; // một chữ viết hoa đầu: "Lan", "Hưng"
const DAU = '(?<![\\p{L}\\p{N}])'; // không đứng liền sau chữ hoặc số

const LUAT_CHAN = [
  ['số điện thoại hoặc dãy số định danh', /(?:\+?84|0)(?:[\s.\-]?\d){8,10}(?!\d)|\d{9,}/u],
  ['địa chỉ email', /[\w.+-]+@[\w-]+\.[\w.-]+/u],
  ['đường link trang cá nhân', /(facebook\.com|fb\.com|zalo\.me|instagram\.com|tiktok\.com\/@)/iu],
  ['câu giới thiệu tên', new RegExp(`${DAU}(?:tên (?:mình |em |tôi |tớ |bạn ấy |nó )?là|(?:mình|em|tôi|tớ) tên)\\s+${TEN}`, 'iu')],
  ['địa chỉ nhà', new RegExp(`${DAU}(?:nhà (?:mình |em |tôi |bạn ấy |nó )?ở|số nhà|địa chỉ (?:nhà|là))`, 'iu')],
  ['tên một bạn học', new RegExp(`${DAU}[Bb]ạn\\s+${TEN}`, 'u')]
];

const LUAT_NHAC = [
  ['tên thầy cô hoặc người quen', new RegExp(`${DAU}(?:[Tt]hầy|[Cc]ô|anh|chị|chú|dì)\\s+${TEN}`, 'u')],
  ['họ và tên', new RegExp(`${DAU}(?:${HO.join('|')})(?:\\s+${TEN}){1,3}`, 'u')],
  ['tên lớp', new RegExp(`${DAU}lớp\\s*\\d{1,2}\\s?[A-Za-z]\\d{0,2}(?![\\p{L}\\p{N}])`, 'iu')]
];

export function timThongTinCaNhan(vanBan) {
  const t = String(vanBan || '').normalize('NFC');
  const tim = luat => luat.filter(([, mau]) => mau.test(t)).map(([nhan]) => nhan);
  return { chan: tim(LUAT_CHAN), nhac: tim(LUAT_NHAC) };
}

// Dạng rút gọn để so trùng: chữ thường, bỏ dấu câu, gộp khoảng trắng.
export function chuanHoa(vanBan) {
  return String(vanBan || '')
    .normalize('NFC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
