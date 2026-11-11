// Đo mức đồng thuận giữa hai người chấm.
// Đầu vào: danh sách cặp màu [[màu của HS1, màu của HS2], ...], mỗi màu là 'X', 'V' hoặc 'D'.
//
// Tỷ lệ đồng thuận (po) = số câu cùng màu / tổng số câu.
// Cohen's kappa = (po - pe) / (1 - pe), trong đó pe là tỷ lệ trùng nhau do ngẫu nhiên,
// tính từ việc mỗi người dùng từng màu nhiều hay ít. Kappa trừ đi phần "trùng do may mắn".

export const CAC_MAU = ['X', 'V', 'D'];

export function doiChieu(capMau) {
  const n = capMau.length;
  // maTran[i][j] = số câu HS1 chấm màu i và HS2 chấm màu j
  const maTran = CAC_MAU.map(a => CAC_MAU.map(b => capMau.filter(([x, y]) => x === a && y === b).length));
  const cung = CAC_MAU.reduce((tong, _, i) => tong + maTran[i][i], 0);
  if (!n) return { n: 0, cung: 0, po: null, pe: null, kappa: null, maTran };

  const po = cung / n;
  const pe = CAC_MAU.reduce((tong, _, i) => {
    const hs1 = maTran[i].reduce((a, b) => a + b, 0) / n;        // HS1 dùng màu i bao nhiêu phần
    const hs2 = maTran.reduce((a, hang) => a + hang[i], 0) / n;  // HS2 dùng màu i bao nhiêu phần
    return tong + hs1 * hs2;
  }, 0);
  // Nếu cả hai chỉ dùng đúng một màu thì pe = 1 và kappa không tính được.
  const kappa = pe === 1 ? null : (po - pe) / (1 - pe);
  return { n, cung, po, pe, kappa, maTran };
}
