-- ĐÈN AI – thêm bảng cho bản 0.2 (Phân loại độc lập).
-- Cách dùng: Supabase > SQL Editor > New query > dán toàn bộ tệp này > Run.
-- Chạy sau tệp 001. Chạy lại nhiều lần không làm mất dữ liệu.

-- 1. Kết quả chấm: mỗi dòng là một người chấm một câu.
create table if not exists public.phan_loai (
  id                 bigint generated always as identity primary key,
  prompt_id          bigint not null references public.prompt (id),
  dot                smallint not null check (dot in (1, 2)),
  nguoi_cham         text not null check (nguoi_cham in ('HS1', 'HS2')),
  tc1                text not null check (tc1 in ('X', 'V', 'D')),
  tc2                text not null check (tc2 in ('X', 'V', 'D')),
  tc3                text not null check (tc3 in ('X', 'V', 'D')),
  tc5                text not null check (tc5 in ('X', 'V', 'D')),
  do_tuyet_doi       boolean not null default false,
  mau_cuoi           text not null check (mau_cuoi in ('X', 'V', 'D')),   -- màu xấu nhất, do máy chủ tính
  ly_do              text not null,
  ca_kho             boolean not null default false,
  phien_ban_tieu_chi text not null,                                        -- v0.1, v1.0… lúc chấm
  cap_nhat_luc       timestamptz not null default now(),
  unique (prompt_id, nguoi_cham)
);
create index if not exists phan_loai_dot on public.phan_loai (dot, nguoi_cham);

-- 2. Dấu khóa: người chấm đã khóa kết quả của một đợt (không sửa được nữa).
create table if not exists public.khoa_cham (
  dot        smallint not null check (dot in (1, 2)),
  nguoi_cham text not null check (nguoi_cham in ('HS1', 'HS2')),
  khoa_luc   timestamptz not null default now(),
  primary key (dot, nguoi_cham)
);

-- 3. Mục cấu hình mới: phiên bản tiêu chí đang dùng để chấm.
insert into public.cau_hinh (khoa, gia_tri, ghi_chu) values
  ('phien_ban_tieu_chi', 'v0.1', 'Phiên bản bộ tiêu chí đang dùng; đổi thành v1.0 khi nhóm chốt')
on conflict (khoa) do nothing;

-- 4. Khóa bảng như tệp 001: chỉ máy chủ của app đọc, ghi được.
alter table public.phan_loai enable row level security;
alter table public.khoa_cham enable row level security;
