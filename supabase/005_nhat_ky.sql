-- ĐÈN AI – thêm bảng cho bản 0.6 (Nhật ký dự án).
-- Cách dùng: Supabase > SQL Editor > New query > dán toàn bộ tệp này > Run.
-- Chạy lại nhiều lần không làm mất dữ liệu.

-- Mỗi dòng là một lần ghi nhật ký của HS1 hoặc HS2. Một ngày có thể ghi nhiều lần.
create table if not exists public.nhat_ky (
  id             bigint generated always as identity primary key,
  ngay           date not null,
  nguoi_ghi      text not null check (nguoi_ghi in ('HS1', 'HS2')),
  viec_da_lam    text not null check (char_length(viec_da_lam) between 3 and 2000),
  minh_chung     text not null default '',
  viec_tiep_theo text not null default '',
  dung_ai        boolean not null default false,
  -- Bốn mục khai báo khi có dùng AI (mục VI.4 QĐ 2422); phần nhóm tự làm chính là cột viec_da_lam.
  ai_cong_cu     text not null default '',
  ai_muc_dich    text not null default '',
  ai_pham_vi     text not null default '',
  ai_kiem_chung  text not null default '',
  nhan_xet_gv    text not null default '',
  tao_luc        timestamptz not null default now(),
  cap_nhat_luc   timestamptz not null default now()
);
create index if not exists nhat_ky_ngay on public.nhat_ky (ngay desc, id desc);
alter table public.nhat_ky enable row level security;
