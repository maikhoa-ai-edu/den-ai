-- ĐÈN AI – thêm bảng cho bản 0.3 (Đối khớp).
-- Cách dùng: Supabase > SQL Editor > New query > dán toàn bộ tệp này > Run.
-- Chạy sau tệp 002. Chạy lại nhiều lần không làm mất dữ liệu.

-- Kết luận của hai em cho từng ca lệch màu, ghi sau khi đã bàn với nhau.
-- Kết quả chấm độc lập ban đầu vẫn nằm nguyên trong bảng phan_loai, không bị sửa.
create table if not exists public.doi_khop (
  prompt_id      bigint primary key references public.prompt (id),
  dot            smallint not null check (dot in (1, 2)),
  nguyen_nhan    text not null check (nguyen_nhan in ('tieu_chi_mo_ho', 'thieu_boi_canh', 'hieu_sai', 'khac')),
  de_xuat_sua    text not null default '',
  mau_thong_nhat text not null check (mau_thong_nhat in ('X', 'V', 'D')),
  nguoi_ghi      text not null check (nguoi_ghi in ('HS1', 'HS2')),
  cap_nhat_luc   timestamptz not null default now()
);
create index if not exists doi_khop_dot on public.doi_khop (dot);

alter table public.doi_khop enable row level security;
