# Kế hoạch kiểm thử chức năng cơ bản GeeksforGeeks

  ## 1. Mục tiêu

  Xây dựng bộ kiểm thử Playwright cho GeeksforGeeks (https://www.geeksforgeeks.org/) với các lựa chọn:

  - Chromium desktop.
  - Smoke test và functional test.
  - Bao gồm đăng nhập, đăng ký và quên mật khẩu.
  - Đăng ký/quên mật khẩu dừng ở bước OTP.
  - Courses chỉ kiểm tra duyệt nội dung, không checkout.
  - Chạy trực tiếp trên production nên không tạo đơn hàng, không submit bài hoặc thay đổi dữ liệu người dùng ngoài phạm vi cần thiết.

  ## 2. Cấu trúc bộ test

  Tổ chức theo Page Object Model:

  tests/
    smoke/
      homepage.spec.ts
      navigation.spec.ts
    functional/
      search.spec.ts
      article.spec.ts
      practice.spec.ts
      courses.spec.ts
      authentication.spec.ts
    pages/
      home.page.ts
      search.page.ts
      article.page.ts
      practice.page.ts
      courses.page.ts
      auth.page.ts
    fixtures/
      test-data.ts
      pages.fixture.ts

  Cập nhật cấu hình:

  - Đặt baseURL=https://www.geeksforgeeks.org.
  - Chỉ bật project chromium.
  - Screenshot khi thất bại.
  - Video và trace ở lần retry đầu.
  - Timeout điều hướng khoảng 30–45 giây vì website production có quảng cáo và tài nguyên ngoài.
  - Dùng biến môi trường GFG_TEST_EMAIL và GFG_TEST_PASSWORD.
  - Thêm script test, test:smoke, test:functional, test:account, test:headed và report.
  - Gắn tag @smoke, @functional, @account để chạy từng nhóm độc lập.
  - Các test gửi OTP chạy tuần tự và chỉ chạy khi gọi test:account.

  ## 3. Các nhóm kiểm thử

  ### Trang chủ

  1. Mở trang chủ và xác minh HTTP response thành công.
  2. Xác minh title, logo, header và nội dung chính hiển thị.
  3. Xác minh thanh điều hướng và ô/nút tìm kiếm hoạt động.
  4. Xác minh các khu vực nội dung chính có ít nhất một mục hợp lệ.
  5. Nhấn logo từ trang con và xác minh quay về trang chủ.
  6. Xác minh các liên kết chính không dẫn đến trang lỗi 404/500.

  ### Điều hướng

  1. Mở từng danh mục chính đang hiển thị trên header.
  2. Xác minh click điều hướng đến URL hoặc trang phù hợp.
  3. Kiểm tra menu dropdown có thể mở và chọn mục con.
  4. Kiểm tra Back/Forward của trình duyệt giữ đúng luồng.
  5. Kiểm tra liên kết mở tab mới và xác minh URL tab mới.
  6. Không kiểm thử quảng cáo hoặc liên kết tài trợ bên thứ ba.

  ### Tìm kiếm

  1. Tìm bằng từ khóa phổ biến như binary search.
  2. Xác minh trang kết quả tải thành công và có kết quả liên quan.
  3. Mở một kết quả và xác minh trang bài viết tương ứng.
  4. Tìm bằng chuỗi ngẫu nhiên không có kết quả.
  5. Xác minh trạng thái không có kết quả được xử lý rõ ràng.
  6. Thử tìm kiếm với khoảng trắng đầu/cuối.
  7. Thử gửi từ khóa rỗng và xác minh trang không lỗi.
  8. Thử từ khóa chứa ký tự đặc biệt và xác minh không có lỗi ứng dụng.

  ### Trang bài viết/tutorial

  1. Mở một bài viết ổn định từ kết quả tìm kiếm.
  2. Xác minh tiêu đề, nội dung và breadcrumb hiển thị.
  3. Xác minh bảng mục lục hoặc điều hướng trong bài nếu có.
  4. Xác minh code block, hình ảnh và liên kết nội bộ tải được.
  5. Nhấn một liên kết nội bộ và xác minh điều hướng đúng.
  6. Xác minh trang không hiển thị trạng thái lỗi hoặc nội dung rỗng.
  7. Bỏ qua nội dung quảng cáo, số lượt xem và dữ liệu thay đổi liên tục.

  ### Practice Problems

  1. Mở trang Practice và xác minh danh sách bài tập xuất hiện.
  2. Tìm kiếm một bài tập theo tên.
  3. Kiểm tra các bộ lọc đang được website cung cấp.
  4. Mở trang chi tiết bài tập.
  5. Xác minh đề bài, ví dụ, ràng buộc và editor hiển thị.
  6. Kiểm tra chuyển ngôn ngữ lập trình nếu tính năng khả dụng.
  7. Kiểm tra nút Run với dữ liệu mẫu nếu không yêu cầu cập nhật hồ sơ.
  8. Không tự động Submit để tránh thay đổi tiến độ, điểm hoặc thống kê tài khoản.

  ### Courses

  1. Mở trang Courses và xác minh danh sách khóa học tải được.
  2. Kiểm tra tìm kiếm hoặc lọc khóa học nếu có.
  3. Mở một khóa học và xác minh tên, mô tả và CTA.
  4. Xác minh điều hướng quay lại danh sách.
  5. Không thêm vào giỏ, tạo đơn hàng hoặc mở cổng thanh toán.

  ### Đăng nhập

  1. Mở form đăng nhập.
  2. Kiểm tra validation khi để trống email và mật khẩu.
  3. Kiểm tra email sai định dạng.
  4. Kiểm tra thông tin đăng nhập không hợp lệ.
  5. Đăng nhập hợp lệ bằng biến môi trường.
  6. Xác minh trạng thái hoặc menu người dùng sau đăng nhập.
  7. Đăng xuất và xác minh phiên đăng nhập bị xóa.
  8. Không ghi thông tin tài khoản vào source code, log, screenshot hoặc report.

  ### Đăng ký

  1. Mở form đăng ký.
  2. Kiểm tra các trường bắt buộc.
  3. Kiểm tra email sai định dạng.
  4. Kiểm tra quy tắc mật khẩu nếu được hiển thị.
  5. Kiểm tra mật khẩu xác nhận không khớp nếu có.
  6. Dùng địa chỉ email test hợp lệ và chuyển đến bước OTP.
  7. Dừng tại màn hình OTP, không cố đọc hoặc vượt OTP.
  8. Nếu CAPTCHA xuất hiện, ghi nhận test bị chặn và chuyển bước xác minh này sang thủ công.

  ### Quên mật khẩu

  1. Mở luồng quên mật khẩu từ trang đăng nhập.
  2. Kiểm tra email rỗng và email sai định dạng.
  3. Kiểm tra email không tồn tại nếu website cho phép mà không gây khóa/rate limit.
  4. Gửi yêu cầu bằng email test hợp lệ.
  5. Xác minh chuyển đến bước xác nhận OTP hoặc thông báo gửi email.
  6. Dừng trước nhập OTP và không thay đổi mật khẩu.
  7. Chỉ chạy test gửi OTP theo yêu cầu, không nằm trong regression mặc định.

  ## 4. Selector và dữ liệu test

  - Ưu tiên getByRole, getByLabel, getByPlaceholder và text ổn định.
  - Chỉ dùng CSS selector khi không có selector semantic phù hợp.
  - Không phụ thuộc class sinh động, vị trí quảng cáo hoặc thứ tự nội dung đề xuất.
  - Dùng từ khóa tìm kiếm và bài viết cố định nhưng chỉ kiểm tra nội dung cốt lõi, không kiểm tra số lượng tuyệt đối.
  - Tạo chuỗi tìm kiếm không tồn tại bằng timestamp.
  - Test tài khoản chạy tuần tự để tránh xung đột session và rate limit.
  - Xử lý cookie banner hoặc popup bằng helper dùng chung.

  ## 5. Tiêu chí đạt

  - Search trả về và mở được nội dung liên quan.
  - Article, Practice và Courses hiển thị nội dung cốt lõi.
  - Đăng ký và quên mật khẩu đi được đến bước OTP.
  - Khi thất bại, report có screenshot, trace và URL tại thời điểm lỗi.
  ## 6. Giả định

  - Website production có thể thay đổi nội dung, quảng cáo và popup; assertion không dựa vào dữ liệu động.
  - Tài khoản test hợp lệ sẽ được cung cấp qua biến môi trường.
  - Email dùng cho đăng ký có thể nhận OTP nhưng bộ test không cần truy cập hộp thư.
  - CAPTCHA và rate limiting được xem là giới hạn môi trường, không được tự động vượt qua.
  - Firefox, WebKit, mobile, accessibility và performance nằm ngoài vòng kiểm thử ban đầu.