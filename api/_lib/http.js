// Mấy hàm nhỏ dùng chung cho các tệp trong thư mục api/.

export function chiNhan(req, res, phuongThuc) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === phuongThuc) return true;
  res.setHeader('Allow', phuongThuc);
  res.status(405).json({ loi: 'Phương thức không được hỗ trợ.' });
  return false;
}

export function docThan(req) {
  let b = req.body;
  if (typeof b === 'string') {
    try { b = JSON.parse(b); } catch { b = null; }
  }
  return b && typeof b === 'object' ? b : {};
}

export function baoLoiMayChu(res, loi) {
  console.error(loi); // chỉ ghi thông báo lỗi kỹ thuật, không ghi nội dung prompt
  res.status(500).json({ loi: 'Máy chủ đang gặp lỗi. Em thử lại sau ít phút nhé.' });
}

// Chỉ nhận đường link Google Forms, để không ai chèn được link lạ vào nút Khảo sát.
export function linkFormHopLe(link) {
  const l = String(link || '').trim();
  return /^https:\/\/(docs\.google\.com\/forms\/|forms\.gle\/)/.test(l) ? l : '';
}

// Mã hiển thị của một prompt: 7 -> "P0007".
export const maPrompt = id => 'P' + String(id).padStart(4, '0');
