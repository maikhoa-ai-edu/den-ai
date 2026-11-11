// Giá trị cấu hình dùng khi bảng cau_hinh chưa có dòng tương ứng.
export const CAU_HINH_MAC_DINH = {
  dot_dang_mo: '0', // 0 = đang đóng, 1 = đợt thử tiêu chí, 2 = đợt chính thức
  muc_tieu_dot_1: '50',
  muc_tieu_dot_2: '120',
  link_khao_sat_truoc: '',
  link_khao_sat_sau: '',
  gioi_han_5_phut: '60',
  phien_ban_tieu_chi: 'v0.1'
};

// Trên Vercel luôn dùng Supabase. Chỉ khi chạy thử trên máy cá nhân và chưa khai báo
// SUPABASE_URL thì mới dùng bộ nhớ tạm và mật khẩu thử.
export const CHAY_THU = !process.env.SUPABASE_URL && !process.env.VERCEL;
