-- ĐÈN AI – tạo bảng cho bản 0.1 (ba trang ẩn danh).
-- Cách dùng: Supabase > SQL Editor > New query > dán toàn bộ tệp này > Run.
-- Chạy lại nhiều lần không làm mất dữ liệu.

-- 1. Bảng prompt: mỗi dòng là một câu hỏi HS góp ẩn danh.
--    Không có cột nào chứa IP, mã thiết bị, email hay họ tên.
create table if not exists public.prompt (
  id             bigint generated always as identity primary key,  -- mã hiển thị trong app: P0001, P0002…
  tao_luc        timestamptz not null default now(),
  dot            smallint not null check (dot in (0, 1, 2)),       -- 1 = thử tiêu chí, 2 = chính thức, 0 = ngoài đợt
  nguon          text not null check (nguon in ('gop', 'kiem_tra')),
  khoi           smallint not null check (khoi in (10, 11, 12)),
  boi_canh       text not null check (boi_canh in ('tuhoc', 'venha', 'duan', 'kiemtra', 'khac')),
  mon            text not null default '',
  noi_dung       text not null check (char_length(noi_dung) between 5 and 1000),
  noi_dung_chuan text not null,                                    -- dạng rút gọn để phát hiện gửi lặp
  can_ra         boolean not null default false,                   -- true = có thể chứa tên người, HS1 rà lại
  trang_thai     text not null default 'moi' check (trang_thai in ('moi', 'hop_le', 'loai')),
  ly_do_loai     text not null default ''
);
create index if not exists prompt_dot_nguon on public.prompt (dot, nguon);
create index if not exists prompt_tao_luc on public.prompt (tao_luc);

-- 2. Bảng cấu hình: thầy sửa trực tiếp ở Table Editor (cột gia_tri).
create table if not exists public.cau_hinh (
  khoa    text primary key,
  gia_tri text not null default '',
  ghi_chu text not null default ''
);
insert into public.cau_hinh (khoa, gia_tri, ghi_chu) values
  ('dot_dang_mo',         '0',   '0 = đóng; 1 = mở đợt thử 50 prompt; 2 = mở đợt chính thức'),
  ('muc_tieu_dot_1',      '50',  'Số prompt cần thu ở đợt 1'),
  ('muc_tieu_dot_2',      '120', 'Số prompt cần thu ở đợt 2'),
  ('link_khao_sat_truoc', '',    'Link Google Forms phiếu trước tác động; để trống = nút chưa mở'),
  ('link_khao_sat_sau',   '',    'Link Google Forms phiếu sau tác động; để trống = nút chưa mở'),
  ('gioi_han_5_phut',     '60',  'Quá số lượt gửi này trong 5 phút thì app tạm ngưng nhận')
on conflict (khoa) do nothing;

-- 3. Khóa bảng: bật RLS và không tạo chính sách nào.
--    Kết quả: chỉ máy chủ của app (dùng khóa bí mật) đọc, ghi được; khóa công khai không xem được gì.
alter table public.prompt   enable row level security;
alter table public.cau_hinh enable row level security;
