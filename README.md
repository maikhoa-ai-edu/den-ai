# Đèn AI

Webapp của dự án Khoa học kỹ thuật **"Hỏi để hiểu hay hỏi để chép?"** – nhóm học sinh lớp 10A2, Trường THCS&THPT Vĩnh Phong (An Giang).

App giúp học sinh xem một câu hỏi gửi AI nên bật đèn **xanh, vàng hay đỏ** theo bộ tiêu chí Đèn tín hiệu AI, và giúp nhóm nghiên cứu thu câu hỏi ẩn danh.

## Bản 0.2 có gì

| Trang | Ai dùng | Việc làm được |
| --- | --- | --- |
| Kiểm tra | Mọi người | Dán câu hỏi, chọn bối cảnh và môn, xem màu đèn và màu từng tiêu chí TC1, TC2, TC3, TC5. Đang chấm bằng **luật tạm** (dò từ khóa). |
| Góp prompt | Mọi người | Gửi một câu hỏi ẩn danh kèm khối, bối cảnh, môn. Chặn số điện thoại, email, tên riêng. Mỗi trình duyệt gửi một câu mỗi đợt. |
| Khảo sát | Mọi người | Hai nút mở Google Forms (phiếu trước và phiếu sau) ở thẻ mới. |
| Làm sạch | HS1, GV | Rà từng câu đã góp: Hợp lệ hoặc Loại kèm lý do. Không xóa câu nào. |
| Phân loại | HS1, HS2 | Chấm 4 tiêu chí cho từng câu Hợp lệ, màu cuối là màu xấu nhất, ô Đỏ tuyệt đối, lý do, đánh dấu ca khó. Chấm hết thì khóa. GV chỉ xem tiến độ. |
| Quản lý | GV | Mở, đóng đợt thu; số prompt cần thu; link hai phiếu khảo sát; phiên bản tiêu chí. |

Chưa có: Đối khớp, AI chấm thứ ba, Số liệu, Nhật ký, chế độ Giáo viên của trang Kiểm tra.

## Tính độc lập của hai bộ mã

- Máy chủ chỉ trả cho mỗi em kết quả chấm của chính em. Tên người chấm lấy từ tài khoản đang đăng nhập, không lấy từ dữ liệu trình duyệt gửi lên.
- Tài khoản GV chỉ nhận số câu đã chấm, không nhận màu.
- Khi một em đã khóa kết quả của đợt, em không sửa được nữa và danh sách câu Hợp lệ của đợt cũng bị đóng.
- Mỗi kết quả chấm lưu kèm phiên bản tiêu chí lúc chấm (v0.1, v1.0…).

## Cam kết về dữ liệu

- Không lưu IP, mã thiết bị, email, họ tên của học sinh.
- Câu hỏi ở trang Kiểm tra được chấm ngay trên trình duyệt và **không gửi đi đâu**, trừ khi học sinh tự tích ô đồng ý góp.
- Khóa Supabase và mật khẩu 3 tài khoản nhóm chỉ nằm trong biến môi trường của Vercel, không nằm trong mã.
- Chỉ 3 tài khoản nhóm nhận cookie đăng nhập; học sinh ẩn danh không nhận cookie nào.

## Cấu trúc thư mục

```
public/                  Phần chạy trên trình duyệt
  index.html             Khung các trang
  css/app.css            Màu, chữ, bố cục
  js/app.js              Chuyển trang, thông báo, gọi máy chủ
  js/kiem-tra.js         Trang Kiểm tra
  js/gop-prompt.js       Trang Góp prompt
  js/khao-sat.js         Trang Khảo sát
  js/nhom.js             Đăng nhập, đăng xuất, trang Quản lý
  js/lam-sach.js         Trang Làm sạch
  js/phan-loai.js        Trang Phân loại
  js/chung/luat-tam.js         Luật chấm tạm theo tiêu chí v0.1
  js/chung/chan-thong-tin.js   Phát hiện thông tin cá nhân (trình duyệt và máy chủ dùng chung)
api/                     Hàm Node.js chạy trên máy chủ Vercel
  gop-prompt.js          Nhận và ghi một câu hỏi
  trang-thai.js          Đợt đang mở, tiến độ, link khảo sát
  phien.js               Đăng nhập, đăng xuất
  lam-sach.js            Danh sách câu và đổi trạng thái
  phan-loai.js           Lấy câu cần chấm, lưu kết quả, khóa
  cau-hinh.js            Đọc, sửa cấu hình (GV)
  _lib/db.js             Chọn nơi lưu: Supabase hoặc bộ nhớ tạm khi chạy thử
  _lib/db-supabase.js    Mọi lệnh đọc, ghi Supabase
  _lib/db-tam.js         Bộ nhớ tạm khi chạy thử trên máy
  _lib/phien.js          Kiểm tra mật khẩu, cấp và đọc vé đăng nhập
  _lib/http.js           Hàm tiện dùng chung
supabase/                Lệnh tạo bảng, chạy theo thứ tự 001, 002
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

Khi chưa khai báo Supabase, dữ liệu chạy thử chỉ nằm trong bộ nhớ và mất khi tắt; mật khẩu thử là `mat-khau-thu-gv`, `mat-khau-thu-hs1`, `mat-khau-thu-hs2`. Trên Vercel các mật khẩu thử này không dùng được.

## Khai báo sử dụng AI

Mã nguồn do Claude (Anthropic) viết theo yêu cầu và bộ tiêu chí của nhóm; nhóm đọc, chạy thử, ghi lỗi và quyết định nội dung tiêu chí.
