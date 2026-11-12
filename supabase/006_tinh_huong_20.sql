-- ĐÈN AI – bộ 20 tình huống KHỞI THẢO (bản 0.7): mỗi khối 5 tình huống, 5 tình huống dùng chung.
-- Cách dùng: Supabase > SQL Editor > New query > dán toàn bộ tệp này > Run.
--
-- Tệp này làm hai việc, và chỉ làm MỘT LẦN (chạy lại không lặp):
--   1. TẮT các tình huống đang có (không xóa; câu trả lời đã thu vẫn giữ nguyên; muốn dùng lại thì bấm Bật trong app).
--   2. Thêm 20 tình huống mới, đều ở trạng thái đang phát.
-- Nhóm sửa, tắt, thêm ở trang Tình huống của app trước khi mở đợt thu.

do $$
begin
  if exists (select 1 from public.tinh_huong where nhiem_vu like 'Thầy cô giao bài về nhà: lập kế hoạch thu chi cá nhân%') then
    raise notice 'Bộ 20 tình huống đã có, không làm gì thêm.';
    return;
  end if;

  update public.tinh_huong set bat = false;

  insert into public.tinh_huong (mon, khoi, boi_canh, nhiem_vu) values
  -- ===== Khối 10 =====
  ('GD KT&PL',   10, 'venha', 'Thầy cô giao bài về nhà: lập kế hoạch thu chi cá nhân của em trong một tháng và giải thích vì sao em chia như vậy. Làm trên giấy, tiết sau nộp lấy điểm.'),
  ('Ngữ văn',    10, 'venha', 'Thầy cô giao viết bài văn nghị luận khoảng 500 chữ phân tích, đánh giá một truyện hoặc bài thơ đã học trong học kì này. Sáng mai nộp, có lấy điểm. Bây giờ là 9 giờ tối và em chưa viết chữ nào.'),
  ('Toán',       10, 'venha', 'Phiếu bài tập về hàm số bậc hai có 6 bài. Em làm được 2 bài, 4 bài còn lại nghĩ mãi không ra. Đầu giờ sáng mai tổ trưởng kiểm tra vở.'),
  ('Tin học',    10, 'venha', 'Thầy cô giao viết một chương trình Python nhập điểm ba môn rồi in ra điểm trung bình và xếp loại. Em chạy thử thì báo lỗi, mà tối nay phải nộp tệp.'),
  ('Vật lí',     10, 'duan',  'Nhóm em vừa làm thí nghiệm đo gia tốc rơi tự do. Em được giao viết báo cáo thực hành: xử lí bảng số liệu, nhận xét sai số và kết luận. Hai ngày nữa nộp.'),
  -- ===== Khối 11 =====
  ('GD KT&PL',   11, 'venha', 'Thầy cô giao: tìm một ví dụ thực tế về lạm phát hoặc thất nghiệp ở Việt Nam, nêu nguyên nhân và hậu quả, viết khoảng một trang giấy. Tiết sau nộp lấy điểm.'),
  ('Ngữ văn',    11, 'venha', 'Thầy cô giao viết bài văn nghị luận khoảng 600 chữ về một vấn đề của giới trẻ hiện nay (em tự chọn vấn đề). Bài có lấy điểm, hạn nộp là sáng thứ Hai.'),
  ('Toán',       11, 'venha', 'Bài tập về nhà gồm 8 phương trình lượng giác. Em xem lại vở vẫn không hiểu cách giải, mà mai thầy cô gọi lên bảng lấy điểm.'),
  ('Hóa học',    11, 'tuhoc', 'Tuần sau kiểm tra giữa kì môn Hóa. Em bị hổng phần cân bằng hóa học và chỉ còn ba buổi tối để ôn.'),
  ('Tiếng Anh',  11, 'venha', 'Thầy cô giao viết một bài luận tiếng Anh khoảng 150 từ về lợi ích và tác hại của mạng xã hội với học sinh. Phải gửi vào nhóm lớp trước 10 giờ tối nay.'),
  -- ===== Khối 12 =====
  ('GD KT&PL',   12, 'duan',  'Nhóm em làm bài thuyết trình về hội nhập kinh tế quốc tế của Việt Nam, cần số liệu mới và nguồn dẫn. Em phụ trách phần số liệu, ba ngày nữa trình bày.'),
  ('Ngữ văn',    12, 'venha', 'Thầy cô phát đề luyện thi tốt nghiệp: viết bài nghị luận xã hội khoảng 600 chữ. Tuần này em còn phải nộp hai đề Toán và một đề tiếng Anh.'),
  ('Toán',       12, 'tuhoc', 'Em tự luyện một đề thi thử tốt nghiệp môn Toán. Có 5 câu vận dụng em không làm được và đề không kèm lời giải.'),
  ('Tiếng Anh',  12, 'venha', 'Thầy cô giao 3 bài đọc hiểu tiếng Anh trong đề luyện thi, yêu cầu chọn đáp án và ghi lí do chọn. Mai kiểm tra vở.'),
  ('Hướng nghiệp', 12, 'khac', 'Em đang phân vân chọn ngành và trường đại học. Em cũng cần viết một đoạn giới thiệu bản thân để nộp kèm hồ sơ xét tuyển.'),
  -- ===== Dùng chung cho cả ba khối =====
  ('Ngữ văn',              0, 'venha',   'Tối nay em phải soạn bài một văn bản mới trong sách giáo khoa Ngữ văn (trả lời các câu hỏi cuối bài) để mai thầy cô kiểm tra vở soạn.'),
  ('Hoạt động trải nghiệm', 0, 'venha',   'Sau buổi sinh hoạt chuyên đề về an toàn giao thông, mỗi học sinh phải nộp một bài thu hoạch viết tay dài hai trang giấy. Hạn nộp là ngày mai.'),
  ('Làm việc nhóm',        0, 'duan',    'Nhóm em làm bài thuyết trình chung nhưng có một bạn không chịu làm phần của mình. Em muốn hỏi AI cách xử lý.'),
  ('Hoạt động lớp',        0, 'duan',    'Lớp em làm video chúc mừng thầy cô nhân ngày 20/11. Em được giao phần hình ảnh và lời chúc; em đang có sẵn ảnh chụp các thầy cô và các bạn trong lớp.'),
  ('Môn bất kì',           0, 'kiemtra', 'Em đang làm bài kiểm tra 15 phút trên lớp và có một câu không làm được.');
end $$;
