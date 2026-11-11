// Trang Khảo sát: chỉ là hai nút mở Google Forms ở thẻ mới.
// App không dựng lại phiếu và không nhận câu trả lời khảo sát.
// Thầy dán link vào bảng cau_hinh trên Supabase; để trống thì nút hiện "Chưa mở".

import { $, layTrangThai } from './app.js';

function gan(nut, link) {
  if (!link) return;
  nut.href = link;
  nut.textContent = 'Mở phiếu khảo sát';
  nut.setAttribute('aria-disabled', 'false');
}

export async function khoiDongKhaoSat() {
  const tt = await layTrangThai();
  gan($('#ks-truoc'), tt.khao_sat_truoc);
  gan($('#ks-sau'), tt.khao_sat_sau);
}
