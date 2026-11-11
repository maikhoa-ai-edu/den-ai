# Hướng dẫn đưa Đèn AI lên mạng

Người làm: thầy (GV). Thời gian: khoảng 20 phút. Chi phí: 0 đồng.

## Bước 1. Tạo bảng trên Supabase

1. Vào dự án Supabase > **SQL Editor** > **New query**.
2. Mở tệp `supabase/001_khoi_tao.sql`, chép toàn bộ, dán vào, bấm **Run**.
3. Vào **Table Editor**: phải thấy hai bảng `prompt` và `cau_hinh`, cả hai có nhãn RLS đang bật.

## Bước 2. Lấy hai giá trị của Supabase

Trong **Project Settings**:

| Biến | Lấy ở đâu |
| --- | --- |
| `SUPABASE_URL` | Project URL, dạng `https://xxxx.supabase.co` |
| `SUPABASE_SECRET_KEY` | API Keys > Secret key (dự án cũ gọi là `service_role`) |

Khóa bí mật có toàn quyền với dữ liệu. Chỉ dán vào Vercel ở bước 3; không gửi qua tin nhắn, không dán vào mã, không gửi cho AI.

## Bước 3. Tạo dự án trên Vercel

1. Vercel > **Add New** > **Project** > chọn kho `den-ai`.
2. Framework Preset: **Other**. Các ô Build và Output để trống.
3. Mở **Environment Variables**, thêm hai biến ở bước 2.
4. Bấm **Deploy**.

Từ đây, mỗi lần kho GitHub có commit mới trên nhánh `main`, Vercel tự triển khai lại.

## Bước 4. Kiểm tra sau khi triển khai

| Việc | Kết quả đúng |
| --- | --- |
| Mở `địa-chỉ-app/api/trang-thai` | Hiện `{"dot":0,...}` |
| Trang Kiểm tra: nhập câu, chọn bối cảnh, bấm Bật đèn | Hiện đèn và màu 4 tiêu chí |
| Trang Góp prompt | Hiện "Chưa mở đợt góp câu hỏi" |
| Supabase > `cau_hinh` > sửa `dot_dang_mo` thành `1`, tải lại trang | Hiện biểu mẫu và thanh tiến độ 0 / 50 |
| Gửi thử một câu | Bảng `prompt` có thêm một dòng; tải lại trang chỉ còn lời cảm ơn |
| Gửi câu có số điện thoại (dùng thẻ ẩn danh của trình duyệt) | Bị chặn, không có dòng mới |

Xong thì xóa các dòng thử trong bảng `prompt` trước khi mở cho học sinh.

## Nâng lên bản 0.2 (khu nhóm)

Làm đủ 3 bước, theo đúng thứ tự.

1. **Supabase > SQL Editor:** dán toàn bộ `supabase/002_phan_loai.sql`, bấm Run. Table Editor phải có thêm bảng `phan_loai` và `khoa_cham`.
2. **Vercel > Settings > Environment Variables:** thêm 4 biến.

   | Biến | Giá trị |
   | --- | --- |
   | `MAT_KHAU_GV` | Mật khẩu của thầy, ít nhất 8 ký tự |
   | `MAT_KHAU_HS1` | Mật khẩu của HS1, ít nhất 8 ký tự |
   | `MAT_KHAU_HS2` | Mật khẩu của HS2, ít nhất 8 ký tự, khác HS1 |
   | `BI_MAT_PHIEN` | Một chuỗi ngẫu nhiên ít nhất 16 ký tự (gõ bừa cũng được, không cần nhớ) |

3. **Vercel > Deployments:** mở bản triển khai mới nhất > **Redeploy**. Biến môi trường chỉ có hiệu lực sau khi triển khai lại.

Thầy đưa mật khẩu riêng cho từng em. HS1 không được biết mật khẩu của HS2 và ngược lại; nếu biết thì hai bộ mã không còn độc lập.

| Việc kiểm tra | Kết quả đúng |
| --- | --- |
| Thẻ Nhóm > chọn GV > nhập mật khẩu | Vào trang Quản lý, thấy đủ các ô |
| Quản lý > chọn "Mở đợt 1" > Lưu, rồi mở thẻ Góp prompt ở trình duyệt khác | Hiện biểu mẫu góp |
| Đăng nhập HS1 > Làm sạch | Thấy các câu đã góp; bấm Hợp lệ thì nhãn đổi màu |
| HS1 > Phân loại | Thấy câu Hợp lệ đầu tiên để chấm |
| Đăng nhập HS2 > Phân loại | Số đã chấm là 0, không thấy gì của HS1; không có thẻ Làm sạch |
| Đăng nhập GV > Phân loại | Chỉ thấy tiến độ của hai em |

Nếu đăng nhập báo "Máy chủ đang gặp lỗi": thiếu một trong 4 biến, hoặc chưa Redeploy.

**Trước khi chấm thật:** dấu khóa không gỡ được trong app. Khi chạy thử, đừng bấm khóa; nếu lỡ bấm, thầy xóa dòng tương ứng trong bảng `khoa_cham` trên Supabase.

## Nâng lên bản 0.3 (Đối khớp)

Chỉ một bước: **Supabase > SQL Editor**, dán toàn bộ `supabase/003_doi_khop.sql`, bấm Run. Không có biến môi trường mới.

Kiểm tra: đăng nhập bất kỳ tài khoản nào > thẻ Đối khớp. Khi chưa đủ hai em khóa, trang hiện "Chưa mở" và cho biết em nào đã khóa.

## Nâng lên bản 0.4 (giao tình huống)

Chỉ một bước, nhưng **phải làm ngay sau khi Vercel triển khai bản 0.4**: Supabase > SQL Editor, dán toàn bộ `supabase/004_tinh_huong.sql`, bấm Run. Chưa chạy tệp này thì các trang Góp prompt, Làm sạch, Phân loại, Đối khớp báo "Máy chủ đang gặp lỗi".

Tệp này tạo bảng `tinh_huong`, thêm 3 cột vào bảng `prompt` và chèn 12 tình huống khởi thảo.

| Việc kiểm tra | Kết quả đúng |
| --- | --- |
| Đăng nhập > thẻ Tình huống | Thấy 12 tình huống, đều "Đang phát", 0 câu trả lời |
| Quản lý | Đợt 1: Giao tình huống; đợt 2: Câu đã từng hỏi |
| Mở đợt 1, vào thẻ Góp prompt bằng trình duyệt khác, chọn khối | Hiện một tình huống, ô chọn công cụ AI và ô gõ câu lệnh |
| Tải lại trang | Vẫn đúng tình huống đó |
| Gửi một câu, rồi xem thẻ Làm sạch | Câu vừa gửi kèm dòng "Tình huống được giao" |

Xong thì đánh dấu Loại các câu thử (ghi lý do "câu thử của nhóm") trước khi mở cho học sinh.

## Nâng lên bản 0.6 (Nhật ký dự án)

Một bước: Supabase > SQL Editor, dán toàn bộ `supabase/005_nhat_ky.sql`, bấm Run. Chưa chạy thì chỉ riêng thẻ Nhật ký báo lỗi, các trang khác không ảnh hưởng.

Kiểm tra: đăng nhập HS1 > thẻ Nhật ký > ghi một lần có tích "có dùng AI" > đăng nhập GV thấy lần ghi đó và ô nhận xét.

Làm phụ lục báo cáo: nút **Xuất CSV** (mở bằng Excel hoặc Google Sheets, sắp từ ngày đầu đến ngày cuối) hoặc nút **In phụ lục** (chọn "Lưu dưới dạng PDF" trong hộp thoại in). Lọc "Có dùng AI" trước khi in thì được riêng nhật ký sử dụng AI.

## Quy trình chấm một đợt

0. Đợt giao tình huống: nhóm rà ngân hàng tình huống ở trang Tình huống trước khi mở. Sau khi có câu trả lời, nội dung tình huống không sửa được.
1. GV mở đợt ở trang Quản lý; HS góp câu hỏi.
2. Đủ số thì GV đóng đợt.
3. HS1 rà hết ở trang Làm sạch (không còn câu "Chưa rà").
4. HS1 và HS2 chấm ở trang Phân loại, mỗi em một máy, không trao đổi.
5. Mỗi em chấm hết thì bấm khóa.
6. Cả hai đã khóa: hai em ngồi cùng nhau ở trang Đối khớp, bàn từng ca lệch, ghi nguyên nhân, đề xuất sửa tiêu chí và màu thống nhất.
7. Các đề xuất sửa tiêu chí là căn cứ để HS2 viết bản tiêu chí tiếp theo; GV đổi phiên bản tiêu chí ở trang Quản lý trước đợt chấm sau.

## Bảng `cau_hinh` (từ bản 0.2 thầy sửa ở trang Quản lý, không cần vào Supabase)

| Khóa | Ý nghĩa |
| --- | --- |
| `dot_dang_mo` | `0` đóng; `1` mở đợt thử 50 prompt; `2` mở đợt chính thức |
| `muc_tieu_dot_1`, `muc_tieu_dot_2` | Số prompt cần thu của từng đợt |
| `link_khao_sat_truoc`, `link_khao_sat_sau` | Dán link Google Forms; để trống thì nút hiện "Chưa mở" |
| `gioi_han_5_phut` | Số lượt gửi tối đa trong 5 phút, mặc định 60 |

## Ý nghĩa các cột khi làm sạch (HS1 làm ở trang Làm sạch)

- `can_ra = true`: câu có thể chứa tên người; đọc lại trước tiên.
- Câu không dùng được: đổi `trang_thai` thành `loai` và ghi `ly_do_loai`. Không xóa dòng, để báo cáo đếm được số câu bị loại.
- Câu đã rà xong: đổi `trang_thai` thành `hop_le`.
- `nguon = kiem_tra`: câu học sinh tự nguyện góp từ trang Kiểm tra; không tính vào tiến độ đợt thu.

## Giới hạn cần biết

- "Mỗi bạn một câu" dựa trên dấu lưu ở trình duyệt. Mở thẻ ẩn danh hoặc đổi máy thì gửi lại được.
- Luật chặn tên riêng chỉ bắt mẫu thường gặp; nhóm vẫn phải rà bằng mắt.
- Dự án Supabase miễn phí bị tạm dừng nếu cả tuần không có hoạt động; vào trang quản trị bấm khôi phục là chạy lại.
