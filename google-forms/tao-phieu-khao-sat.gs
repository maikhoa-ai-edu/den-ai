/**
 * TẠO NHANH PHIẾU KHẢO SÁT 38 CÂU TRÊN GOOGLE FORMS
 * Nội dung lấy từ file 08 "Phiếu khảo sát 38 câu (bản khởi thảo v2)". Đây là BẢN KHỞI THẢO:
 * HS1 sửa câu chữ ngay trên Google Forms, thầy duyệt trước khi phát.
 *
 * Cách dùng:
 *   1. Mở https://script.google.com > Dự án mới.
 *   2. Xóa hết mã có sẵn, dán toàn bộ tệp này vào, bấm Lưu.
 *   3. Chọn hàm "taoPhieuKhaoSat" ở thanh trên, bấm Chạy, cho phép quyền khi được hỏi.
 *   4. Mở "Nhật ký thực thi": có 2 đường link.
 *        - Link SỬA: để thầy và HS1 chỉnh phiếu.
 *        - Link GỬI HS: dán vào trang Quản lý của app Đèn AI.
 *
 * Phiếu không thu email, không bắt đăng nhập. Cột mã YCCĐ và đáp án KHÔNG đưa vào phiếu.
 * Muốn có phiếu "sau tác động": trong Google Forms chọn Tạo bản sao, hoặc chạy hàm "taoPhieuSau".
 */

function taoPhieuKhaoSat() { taoPhieu_('Khảo sát việc dùng AI trong học tập (trước)'); }
function taoPhieuSau() { taoPhieu_('Khảo sát việc dùng AI trong học tập (sau)'); }

function taoPhieu_(tieuDe) {
  var f = FormApp.create(tieuDe);
  f.setDescription(
    'Chào bạn! Chúng mình là nhóm học sinh lớp 10A2, Trường THCS&THPT Vĩnh Phong, đang nghiên cứu cách học sinh ' +
    'dùng AI (ChatGPT, Gemini, Copilot…) trong học tập. Phiếu không hỏi tên, không tính điểm, không có câu trả lời "đẹp". ' +
    'Bạn cứ trả lời đúng với thực tế của mình. Thời gian khoảng 12 phút.');
  f.setCollectEmail(false);
  f.setProgressBar(true);
  f.setShowLinkToRespondAgain(false);

  // ----- Màn đồng ý tham gia -----
  var dongY = f.addMultipleChoiceItem().setTitle('Bạn có đồng ý tham gia khảo sát không?').setRequired(true);

  // ----- Phần A – Thông tin chung -----
  var phanA = f.addPageBreakItem().setTitle('Phần A – Thông tin chung');
  dongY.setChoices([
    dongY.createChoice('Mình đồng ý tham gia', phanA),
    dongY.createChoice('Mình không tham gia', FormApp.PageNavigationType.SUBMIT)
  ]);
  chon1_(f, 'Bạn đang học khối nào?', ['10', '11', '12']);
  chon1_(f, 'Giới tính của bạn?', ['Nam', 'Nữ', 'Không muốn trả lời']);
  chon1_(f, 'Trong 7 ngày qua, bạn dùng AI cho việc học bao nhiêu lần?',
    ['Không lần nào', '1–2 lần', '3–5 lần', '6–10 lần', 'Trên 10 lần']);

  // ----- Phần B – Bạn thường làm gì? (câu 4–9) -----
  f.addPageBreakItem().setTitle('Phần B – Bạn thường làm gì?');
  f.addGridItem()
    .setTitle('Mỗi dòng chọn một mức đúng với bạn nhất.')
    .setRows([
      'Trước khi hỏi AI, mình xác định rõ phần nào cần AI giúp và phần nào mình tự làm.',
      'Mình tự làm bài trước rồi mới nhờ AI kiểm tra hoặc góp ý.',
      'Mình chép nguyên câu trả lời của AI vào bài làm.',
      'Mình đối chiếu câu trả lời của AI với sách giáo khoa hoặc nguồn đáng tin cậy.',
      'Khi nộp bài có dùng AI, mình nói rõ với thầy cô phần nào AI đã giúp.',
      'Mình nhắc bạn khi thấy bạn dùng AI sai cách (ví dụ chép bài, đưa ảnh người khác lên AI).'
    ])
    .setColumns(['Không bao giờ', 'Hiếm khi', 'Thỉnh thoảng', 'Thường xuyên', 'Luôn luôn'])
    .setRequired(true);

  // ----- Phần C – Bạn nghĩ gì? (câu 10–20) -----
  f.addPageBreakItem().setTitle('Phần C – Bạn nghĩ gì?');
  f.addGridItem()
    .setTitle('Mỗi dòng chọn một mức: 1 = Hoàn toàn không đồng ý · 2 = Không đồng ý · 3 = Phân vân · 4 = Đồng ý · 5 = Hoàn toàn đồng ý')
    .setRows([
      'Dù AI trả lời rất trôi chảy, người quyết định có dùng câu trả lời đó hay không vẫn phải là mình.',
      'Nếu bài mình nộp có lỗi do AI đưa thông tin sai, người chịu trách nhiệm là mình.',
      'Nhờ AI làm hộ thường xuyên sẽ làm mình kém khả năng tự suy nghĩ.',
      'AI có thể trả lời thiên lệch vì dữ liệu nó được học không đầy đủ.',
      'Ở câu này, bạn hãy chọn mức 2.',
      'Học sinh nên được góp ý vào quy định dùng AI của trường.',
      'Dùng AI giúp mình học tốt hơn.',
      'Bạn bè mình thường nhờ AI làm bài hộ.',
      'Bạn bè mình coi việc chép bài của AI là chuyện bình thường.',
      'Mình biết cách hỏi AI để hiểu bài chứ không chỉ để lấy đáp án.',
      'Trong tháng tới, mình sẽ tự làm trước rồi mới hỏi AI.'
    ])
    .setColumns(['1', '2', '3', '4', '5'])
    .setRequired(true);

  // ----- Phần D – Tình huống (câu 21–34) -----
  f.addPageBreakItem().setTitle('Phần D – Tình huống')
    .setHelpText('Các tình huống đều lấy từ việc học hằng ngày. Mỗi câu chọn một đáp án.');
  chon1_(f, 'Nhóm bạn được giao bài thuyết trình và đang chọn chủ đề. Cách phân vai nào hợp lý nhất?', [
    'Để AI chọn chủ đề, nhóm làm theo.',
    'AI gợi ý vài hướng, nhóm cân nhắc và tự quyết định.',
    'Không dùng AI ở bất kì bước nào vì AI luôn sai.',
    'Để AI quyết định cả chủ đề lẫn cách làm.']);
  chon1_(f, 'Nhóm bạn định dùng một ứng dụng AI làm slide. Ứng dụng bắt đăng nhập nhưng không cho biết nó lưu những dữ liệu gì của bạn. Nguyên tắc nào bị bỏ qua rõ nhất?', [
    'Minh bạch', 'Công bằng', 'Không gây nguy hiểm cho con người', 'Tiết kiệm năng lượng']);
  chon1_(f, 'Bạn từng tải ảnh bài làm có ghi họ tên, lớp của mình lên một ứng dụng AI để nhờ chấm. Giờ bạn muốn ứng dụng xóa dữ liệu đó. Phát biểu nào đúng?', [
    'Bạn có quyền yêu cầu xóa; quyền này được pháp luật về bảo vệ dữ liệu cá nhân bảo vệ.',
    'Đã đưa lên mạng thì bạn không còn quyền gì với dữ liệu đó.',
    'Chỉ người đủ 18 tuổi mới có quyền này.',
    'Chỉ được xóa nếu trả phí cho ứng dụng.']);
  chon1_(f, 'Việc nào sau đây vi phạm quy định của nhà trường?', [
    'Ở nhà, nhờ AI giải thích lại phần bài chưa hiểu.',
    'Ở nhà, nhờ AI đặt câu hỏi để tự ôn tập.',
    'Lén dùng điện thoại hỏi AI đáp án trong giờ kiểm tra.',
    'Ở nhà, nhờ AI kiểm tra bài mình đã tự làm.']);
  chon1_(f, 'Nhóm bạn có dùng AI khi làm bài thuyết trình. Lời khai báo nào đầy đủ nhất?', [
    '"Nhóm em có dùng AI."',
    '"Nhóm em dùng Gemini để làm slide."',
    '"Nhóm em dùng Gemini để gợi ý bố cục 5 slide; nội dung nhóm tự viết và đã đối chiếu số liệu với sách giáo khoa."',
    '"Nhóm em không nhớ đã dùng AI ở phần nào."']);
  f.addGridItem()
    .setTitle('Với mỗi tình huống, bạn chọn một màu đèn: Xanh = nên dùng · Vàng = dùng được nhưng có điều kiện · Đỏ = không nên dùng.')
    .setRows([
      'Ôn tập ở nhà, bạn An tự giải bài Toán rồi nhờ AI chỉ ra bước nào sai.',
      'Cô cho phép dùng AI trong bài văn về nhà. Bạn Bình nhờ AI lập dàn ý, sau đó tự viết bài và có khai báo.',
      'Để chia việc cho bài tập nhóm, bạn Chi dán danh sách nhóm kèm số điện thoại và nhận xét riêng về từng bạn vào AI.',
      'Cho vui, bạn Dũng dùng AI ghép mặt một bạn cùng nhóm vào ảnh chế rồi chèn vào slide thuyết trình.'
    ])
    .setColumns(['Xanh', 'Vàng', 'Đỏ'])
    .setRequired(true);
  chon1_(f, 'Lớp bạn muốn làm một chatbot giúp cả lớp ôn tập. Nếu làm ẩu, bước nào dễ làm lộ thông tin cá nhân của các bạn nhất?', [
    'Đặt tên cho chatbot', 'Thu thập và lưu lại các cuộc trò chuyện của các bạn', 'Chọn màu giao diện', 'Viết lời chào']);
  chon1_(f, 'Khi chuẩn bị bài thuyết trình, AI liệt kê cho bạn một cuốn sách tham khảo, nhưng tìm mãi không thấy cuốn đó có thật. Nguyên nhân hợp lý nhất là gì?', [
    'AI cố ý nói dối bạn.',
    'AI tạo câu trả lời từ các mẫu câu chữ đã học nên có thể "bịa" ra thông tin nghe rất hợp lý.',
    'Cuốn sách có thật nhưng đã bị cấm.',
    'Do mạng chậm.']);
  chon1_(f, 'Tối nay bạn phải soạn bài Ngữ văn cho tiết sau. Cách dùng AI nào có rủi ro CAO NHẤT?', [
    'Tự soạn xong rồi nhờ AI nhận xét.',
    'Nhờ AI giải thích những từ khó trong văn bản.',
    'Nhờ AI soạn toàn bộ rồi chép vào vở soạn.',
    'Nhờ AI đặt câu hỏi gợi ý để mình tự trả lời.']);
  chon1_(f, 'Nhóm bạn tìm tư liệu cho bài thuyết trình. Cách dùng AI nào có rủi ro THẤP NHẤT?', [
    'Dán nguyên phần AI viết vào slide.',
    'Nhờ AI gợi ý từ khóa, rồi tự tìm và mở nguồn ra kiểm tra.',
    'Lấy danh sách nguồn AI đưa ra mà không mở xem.',
    'Lấy số liệu AI đưa ra mà không biết nó từ đâu.']);
  chon1_(f, 'Ôn thi giữa kì, bạn nhờ AI tóm tắt chương 3 rồi học theo bản tóm tắt, chưa đối chiếu với sách giáo khoa. Mức rủi ro là gì?', [
    'Thấp – không cần làm gì thêm.',
    'Trung bình – cần đối chiếu với sách giáo khoa vì bản tóm tắt có thể sai hoặc thiếu.',
    'Cao – tuyệt đối không được làm.',
    'Không có rủi ro vì AI không sai.']);

  // ----- Phần E – Vì sao bạn dùng AI như vậy? (câu 35–37) -----
  f.addPageBreakItem().setTitle('Phần E – Vì sao bạn dùng AI như vậy?').setHelpText('Mỗi câu chọn tối đa 3 ý.');
  chonNhieu_(f, 'Bạn bắt đầu dùng AI cho việc học từ đâu?', [
    'Bạn bè chỉ cho',
    'Thấy trên mạng xã hội (TikTok, Facebook, YouTube…)',
    'Thầy cô giới thiệu hoặc hướng dẫn',
    'Anh chị, người nhà chỉ cho',
    'Tự tìm hiểu vì tò mò',
    'Ứng dụng có sẵn trên điện thoại, máy tính',
    'Mình chưa từng dùng AI cho việc học']);
  chonNhieu_(f, 'Những lúc bạn nhờ AI làm thay (hoặc rất muốn nhờ), lý do từ phía bản thân thường là gì?', [
    'Mình không hiểu bài, bị hổng kiến thức',
    'Mình ngại suy nghĩ, muốn xong cho nhanh',
    'Mình để dồn bài đến sát hạn',
    'Mình muốn điểm cao hơn sức mình',
    'Mình không tự tin vào bài tự làm',
    'Mình quen tay, cứ có bài là mở AI',
    'Mình không nhờ AI làm thay']);
  chonNhieu_(f, 'Điều gì từ bên ngoài khiến bạn (hoặc các bạn quanh bạn) dễ nhờ AI làm thay?', [
    'Bài tập, bài soạn nhiều; hạn nộp gấp',
    'Bài quá khó so với sức học',
    'Lịch học thêm kín, không đủ thời gian',
    'Không có ai để hỏi khi làm bài ở nhà',
    'Bạn bè xung quanh đều làm vậy',
    'Thầy cô chỉ kiểm tra có làm hay chưa, ít khi hỏi lại nội dung',
    'Trường, lớp chưa có quy định rõ về dùng AI',
    'AI miễn phí, mở điện thoại là có']);

  // ----- Phần F – Câu hỏi mở (câu 38, không bắt buộc) -----
  f.addParagraphTextItem()
    .setTitle('Có lần nào bạn thấy việc dùng AI trong học tập là "không ổn" không? Kể ngắn gọn. (Không ghi tên ai.)')
    .setRequired(false);

  f.setConfirmationMessage('Cảm ơn bạn đã tham gia. Câu trả lời của bạn đã được ghi nhận ẩn danh.');
  try { f.setPublished(true); } catch (e) { /* tài khoản chưa có tính năng này: phiếu mặc định đã mở */ }

  Logger.log('Link SỬA phiếu (thầy và HS1): ' + f.getEditUrl());
  Logger.log('Link GỬI HS (dán vào trang Quản lý của app): ' + f.getPublishedUrl());
}

// Câu chọn một đáp án, bắt buộc trả lời.
function chon1_(f, cauHoi, luaChon) {
  f.addMultipleChoiceItem().setTitle(cauHoi).setChoiceValues(luaChon).setRequired(true);
}

// Câu chọn nhiều ý (tối đa 3), có ô "Khác" để tự viết.
function chonNhieu_(f, cauHoi, luaChon) {
  var kiemTra = FormApp.createCheckboxValidation().requireSelectAtMost(3).setHelpText('Bạn chọn tối đa 3 ý.').build();
  f.addCheckboxItem().setTitle(cauHoi).setChoiceValues(luaChon).showOtherOption(true).setValidation(kiemTra).setRequired(true);
}
