# Đèn AI

Webapp của dự án Khoa học kỹ thuật **"Hỏi để hiểu hay hỏi để chép?"** – nhóm học sinh lớp 10A2, Trường THCS&THPT Vĩnh Phong (An Giang).

App giúp học sinh xem một câu hỏi gửi AI nên bật đèn **xanh, vàng hay đỏ** theo bộ tiêu chí Đèn tín hiệu AI, và giúp nhóm nghiên cứu thu câu hỏi ẩn danh.

## Bản 0.1 có gì

| Trang | Việc làm được |
| --- | --- |
| Kiểm tra | Dán câu hỏi, chọn bối cảnh và môn, xem màu đèn và màu từng tiêu chí TC1, TC2, TC3, TC5. Đang chấm bằng **luật tạm** (dò từ khóa). |
| Góp prompt | Gửi một câu hỏi ẩn danh kèm khối, bối cảnh, môn. Chặn số điện thoại, email, tên riêng. Mỗi trình duyệt gửi một câu mỗi đợt. |
| Khảo sát | Hai nút mở Google Forms (phiếu trước và phiếu sau) ở thẻ mới. |
| Nhóm | Chưa có. Đăng nhập, Phân loại, Đối khớp làm ở bản 0.2. |

## Cam kết về dữ liệu

- Không lưu IP, mã thiết bị, email, họ tên của học sinh.
- Câu hỏi ở trang Kiểm tra được chấm ngay trên trình duyệt và **không gửi đi đâu**, trừ khi học sinh tự tích ô đồng ý góp.
- Khóa Supabase chỉ nằm trong biến môi trường của Vercel, không nằm trong mã.

## Cấu trúc thư mục

```
public/                  Phần chạy trên trình duyệt
  index.html             Khung 4 trang
  css/app.css            Màu, chữ, bố cục
  js/app.js              Chuyển trang, thông báo, gọi máy chủ
  js/kiem-tra.js         Trang Kiểm tra
  js/gop-prompt.js       Trang Góp prompt
  js/khao-sat.js         Trang Khảo sát
  js/chung/luat-tam.js         Luật chấm tạm theo tiêu chí v0.1
  js/chung/chan-thong-tin.js   Phát hiện thông tin cá nhân (trình duyệt và máy chủ dùng chung)
api/                     Hàm Node.js chạy trên máy chủ Vercel
  gop-prompt.js          Nhận và ghi một câu hỏi
  trang-thai.js          Đợt đang mở, tiến độ, link khảo sát
  _lib/db.js             Mọi lệnh đọc, ghi Supabase
  _lib/http.js           Hàm tiện dùng chung
supabase/001_khoi_tao.sql  Lệnh tạo bảng
scripts/chay-thu.js      Máy chủ thử trên máy cá nhân
test/                    Kiểm tra tự động cho hai tệp luật
docs/TRIEN-KHAI.md       Hướng dẫn đưa app lên mạng
```

## Chạy thử trên máy

Cần Node.js 22.

```
npm install
npm run thu      # mở http://localhost:3000
npm test
```

Khi chưa khai báo Supabase, dữ liệu chạy thử chỉ nằm trong bộ nhớ và mất khi tắt.

## Khai báo sử dụng AI

Mã nguồn do Claude (Anthropic) viết theo yêu cầu và bộ tiêu chí của nhóm; nhóm đọc, chạy thử, ghi lỗi và quyết định nội dung tiêu chí.
