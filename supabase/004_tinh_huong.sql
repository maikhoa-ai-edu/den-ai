-- ĐÈN AI – thêm bảng cho bản 0.4 (giao tình huống khi thu prompt).
-- Cách dùng: Supabase > SQL Editor > New query > dán toàn bộ tệp này > Run.
-- Chạy sau tệp 003. Chạy lại nhiều lần không làm mất dữ liệu và không chèn trùng tình huống.

-- 1. Ngân hàng tình huống: mỗi dòng là một nhiệm vụ học tập thường gặp.
create table if not exists public.tinh_huong (
  id       bigint generated always as identity primary key,
  mon      text not null,
  khoi     smallint not null default 0 check (khoi in (0, 10, 11, 12)),   -- 0 = dùng cho mọi khối
  boi_canh text not null check (boi_canh in ('tuhoc', 'venha', 'duan', 'kiemtra', 'khac')),
  nhiem_vu text not null check (char_length(nhiem_vu) between 10 and 500),
  bat      boolean not null default true,                                 -- false = tạm không phát cho HS
  tao_luc  timestamptz not null default now()
);
alter table public.tinh_huong enable row level security;

-- 2. Bảng prompt: ghi thêm kiểu thu, tình huống được giao và công cụ AI.
alter table public.prompt add column if not exists kieu_thu text not null default 'tu_do';
alter table public.prompt add column if not exists tinh_huong_id bigint references public.tinh_huong (id);
alter table public.prompt add column if not exists cong_cu_ai text not null default '';
do $$ begin
  alter table public.prompt add constraint prompt_kieu_thu_check check (kieu_thu in ('tu_do', 'tinh_huong'));
exception when duplicate_object then null; end $$;
create index if not exists prompt_tinh_huong on public.prompt (tinh_huong_id);

-- 3. Cấu hình: kiểu thu của từng đợt.
insert into public.cau_hinh (khoa, gia_tri, ghi_chu) values
  ('kieu_dot_1', 'tinh_huong', 'tinh_huong = giao tình huống; tu_do = HS góp câu đã từng hỏi'),
  ('kieu_dot_2', 'tu_do',      'tinh_huong = giao tình huống; tu_do = HS góp câu đã từng hỏi')
on conflict (khoa) do nothing;

-- 4. Mười hai tình huống KHỞI THẢO (do Claude soạn). Nhóm sửa, tắt hoặc thêm ở trang Tình huống của app.
--    Chỉ chèn khi bảng còn trống.
insert into public.tinh_huong (mon, khoi, boi_canh, nhiem_vu)
select * from (values
  ('GD KT&PL',      10, 'venha',   'Thầy cô giao bài về nhà: so sánh các loại thị trường và nêu ví dụ ở địa phương em. Tiết sau nộp.'),
  ('Ngữ văn',        0, 'venha',   'Thầy cô giao viết bài văn nghị luận khoảng 600 chữ về thói quen dùng mạng xã hội của học sinh. Tuần sau nộp, có lấy điểm.'),
  ('Toán',           0, 'venha',   'Có 5 bài tập cuối chương. Em làm được 3 bài, còn 2 bài chưa biết cách giải. Sáng mai phải nộp.'),
  ('Tiếng Anh',      0, 'venha',   'Thầy cô giao viết một đoạn văn tiếng Anh khoảng 120 từ giới thiệu một lễ hội ở quê em.'),
  ('Ngữ văn',        0, 'venha',   'Tối nay em phải soạn bài một văn bản mới trong sách giáo khoa để mai học.'),
  ('Toán',           0, 'tuhoc',   'Có một dạng bài đã học trên lớp nhưng em chưa hiểu. Em tự học lại ở nhà để chuẩn bị cho bài kiểm tra tuần sau.'),
  ('Lịch sử',        0, 'tuhoc',   'Em tự ôn một chương có nhiều sự kiện và mốc thời gian để chuẩn bị kiểm tra giữa kì.'),
  ('Vật lí',         0, 'tuhoc',   'Em đọc trước bài mới ở nhà và gặp một khái niệm đọc mãi vẫn không hiểu.'),
  ('Tin học',        0, 'duan',    'Nhóm em 4 bạn được giao thuyết trình 10 phút về an toàn khi dùng mạng xã hội. Em phụ trách tìm tư liệu.'),
  ('Địa lí',         0, 'duan',    'Nhóm em làm báo cáo về biến đổi khí hậu ở Đồng bằng sông Cửu Long, cần số liệu và nguồn tham khảo.'),
  ('Làm việc nhóm',  0, 'duan',    'Nhóm em làm bài thuyết trình chung nhưng có một bạn không chịu làm phần của mình. Em muốn hỏi AI cách xử lý.'),
  ('Tiếng Anh',      0, 'kiemtra', 'Em đang làm bài kiểm tra 15 phút trên lớp và có một câu không làm được.')
) as moi (mon, khoi, boi_canh, nhiem_vu)
where not exists (select 1 from public.tinh_huong);
