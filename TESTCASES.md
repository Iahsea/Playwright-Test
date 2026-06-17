# Bảng Test Case — Kiểm thử tự động GeeksforGeeks (Playwright)

Tổng hợp toàn bộ test case thực tế của dự án để đưa vào báo cáo. Định dạng các cột:
**ID | Tên | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Status**.

- Tổng số test case: **55** (Smoke Navigation 2, Smoke Homepage 1, Functional 10, Advanced 30, Bug regression 8, Exploratory audit 4).
- Kết quả: **46 Pass**, **4 Fail**, **5 Skip** (các ca test tài khoản được skip nếu không cấu hình tài khoản thử nghiệm trong `.env`; các ca **Fail** là regression test cố ý bắt lỗi còn tồn tại trên website production — sẽ tự chuyển xanh khi GeeksforGeeks sửa).
- Môi trường chạy: Windows, Node 20+, Playwright + Chromium. Ngày kiểm thử: 2026-06-17.

---

## Bảng 1 — Điều hướng cơ bản (tests/smoke/navigation.spec.ts)

| ID | Tên test case | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Status |
| --- | --- | --- | --- | --- | --- |
| NV_01 | Điều hướng trang Luyện tập | Mở trang chủ -> Click liên kết "Practice Problems" -> Chờ trang tải xong | URL chứa `/explore` hoặc `/problems` hoặc `/practice`, tải trang thành công | Chuyển hướng thành công và tải xong trang | ✅ Pass |
| NV_02 | Điều hướng trang Khóa học | Mở trang chủ -> Click liên kết "Courses" -> Chờ trang tải xong | URL chứa `/courses`, tải trang thành công | Chuyển hướng thành công và tải xong trang | ✅ Pass |

---

## Bảng 2 — Chức năng Đọc bài viết (tests/functional/article.spec.ts)

| ID | Tên test case | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Status |
| --- | --- | --- | --- | --- | --- |
| AR_01 | Hiển thị nội dung bài viết | Điều hướng trực tiếp đến trang bài viết `/binary-search/` | Tiêu đề bài viết chính xác, nội dung bài viết, code blocks hiển thị đầy đủ, có các liên kết nội bộ hợp lệ | Nội dung và code block hiển thị đúng, các link nội bộ hoạt động | ✅ Pass |

---

## Bảng 3 — Xác thực và Quản lý tài khoản (tests/functional/authentication.spec.ts)

| ID | Tên test case | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Status |
| --- | --- | --- | --- | --- | --- |
| AU_01 | Đăng nhập với thông tin sai cấu trúc | Mở popup đăng nhập -> Nhập email không hợp lệ ("not-an-email") và mật khẩu "wrong" -> Submit | Hệ thống từ chối và hiển thị thông báo lỗi/validation | Hiển thị thông báo lỗi định dạng email | ✅ Pass |
| AU_02 | Quy trình Đăng nhập & Đăng xuất | Nhập email & mật khẩu từ `.env` -> Submit -> Click avatar/profile -> Chọn Đăng xuất/Logout | Đăng nhập thành công hiển thị nút profile, đăng xuất thành công hiển thị lại nút Sign In | Tự động bỏ qua do thiếu tài khoản thử nghiệm trong `.env` | ⏭️ Skip |
| AU_03 | Yêu cầu khôi phục mật khẩu | Mở form đăng nhập -> Click "Forgot Password" -> Nhập email -> Submit | Trang chuyển sang bước nhập mã xác thực OTP | Tự động bỏ qua do thiếu tài khoản thử nghiệm trong `.env` | ⏭️ Skip |
| AU_04 | Đăng ký tài khoản mới đến bước OTP | Mở form đăng ký -> Nhập email đăng ký mới -> Click Continue | Trang chuyển sang bước xác thực OTP | Tự động bỏ qua do thiếu tài khoản thử nghiệm trong `.env` | ⏭️ Skip |

---

## Bảng 4 — Chức năng Khóa học (tests/functional/courses.spec.ts)

| ID | Tên test case | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Status |
| --- | --- | --- | --- | --- | --- |
| CO_01 | Xem chi tiết khóa học từ danh mục | Mở trang danh mục khóa học -> Click khóa học đầu tiên | Chuyển hướng đến trang chi tiết khóa học (URL chứa `/course`), trang hiển thị thông tin đăng ký (Enroll/Register) | Chuyển hướng chính xác và tải chi tiết khóa học | ✅ Pass |

---

## Bảng 5 — Chức năng Luyện tập / Bài tập (tests/functional/practice.spec.ts)

| ID | Tên test case | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Status |
| --- | --- | --- | --- | --- | --- |
| PR_01 | Tải danh mục bài tập luyện tập | Mở trang `/explore` | Trang explore tải thành công, hiển thị danh sách bài tập | Tải danh sách bài tập đầy đủ | ✅ Pass |
| PR_02 | Tìm kiếm bài tập trong danh mục | Mở trang `/explore` -> Nhập từ khóa tìm kiếm bài tập (ví dụ: "two sum") | Danh sách bài tập được lọc, chứa từ khóa tìm kiếm | Kết quả hiển thị bài tập "two sum" hoặc liên quan | ✅ Pass |

---

## Bảng 6 — Chức năng Tìm kiếm cơ bản (tests/functional/search.spec.ts)

| ID | Tên test case | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Status |
| --- | --- | --- | --- | --- | --- |
| SE_01 | Tìm kiếm từ khóa hợp lệ và mở bài viết | Mở trang chủ -> Nhập từ khóa -> Nhấn Enter -> Click bài viết đầu tiên | Kết quả tìm kiếm hiển thị, click bài viết mở thành công bài viết liên quan | Tải trang kết quả và điều hướng vào bài viết chính xác | ✅ Pass |
| SE_02 | Tìm kiếm từ khóa không tồn tại | Mở trang chủ -> Nhập từ khóa ngẫu nhiên không tồn tại -> Nhấn Enter | Trang hiển thị thông báo không tìm thấy kết quả ("no result", "nothing here") | Hiển thị thông báo "Oops! nothing here" như mong đợi | ✅ Pass |

---

## Bảng 7 — Giao diện thích ứng (tests/advanced/responsive.spec.ts)

| ID | Tên test case | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Status |
| --- | --- | --- | --- | --- | --- |
| TC3_01 | Menu điều hướng trên Desktop | Đặt độ phân giải màn hình 1920x1080 -> Mở trang chủ | Menu chính hiển thị đầy đủ, nút hamburger menu bị ẩn | Menu chính hiển thị, nút hamburger ẩn đúng | ✅ Pass |
| TC3_02 | Menu điều hướng trên Mobile | Đặt độ phân giải màn hình 390x844 (mobile) -> Mở trang chủ | Nút hamburger menu (menu icon) hiển thị rõ ràng | Nút hamburger menu hiển thị đúng | ✅ Pass |
| TC3_03 | Mở Hamburger Menu trên Mobile | Đặt độ phân giải mobile -> Mở trang chủ -> Click nút hamburger | Sidebar/Drawer menu mở ra và hiển thị các mục điều hướng | Menu mở ra hiển thị danh sách điều hướng | ✅ Pass |
| TC3_04 | Tự động co giãn hình ảnh trên Tablet | Đặt màn hình 768x1024 (iPad) -> Mở trang chủ -> Kiểm tra ảnh | Chiều rộng ảnh không vượt quá chiều rộng viewport (768px) | Chiều rộng ảnh nằm trong giới hạn màn hình | ✅ Pass |
| TC3_05 | Ô tìm kiếm trên Mobile | Đặt màn hình mobile -> Mở trang chủ -> Click trigger tìm kiếm (nếu có) | Ô nhập liệu tìm kiếm hiển thị rõ ràng và tương tác được | Ô tìm kiếm hiển thị đúng | ✅ Pass |
| TC3_06 | Kích thước font chữ trên màn hình nhỏ | Đặt màn hình mobile -> Mở trang chủ -> Đo font-size của đoạn văn chính | Kích thước font chữ lớn hơn hoặc bằng 12px để đảm bảo dễ đọc | Font-size đo được ≥ 12px (thường là 14px hoặc 16px) | ✅ Pass |
| TC3_07 | Kích thước vùng click của nút trên Mobile | Đặt màn hình mobile -> Mở trang chủ -> Đo kích thước nút bấm hoặc link đầu tiên | Vùng click tối thiểu 30px x 30px (tiêu chuẩn WCAG) | Kích thước nút/link đều đạt chuẩn ≥ 30px | ✅ Pass |
| TC3_08 | Không xuất hiện thanh cuộn ngang trên Mobile | Đặt màn hình mobile -> Mở trang chủ -> Kiểm tra chiều rộng trang so với viewport | Trang không xuất hiện thanh cuộn ngang (scrollWidth <= innerWidth) | scrollWidth = innerWidth, không có cuộn ngang | ✅ Pass |

---

## Bảng 8 — Chế độ Ngoại tuyến / Offline (tests/advanced/offline-behavior.spec.ts)

| ID | Tên test case | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Status |
| --- | --- | --- | --- | --- | --- |
| TC4_01 | Tải trang khi không có kết nối mạng | Đặt trình duyệt sang chế độ Offline -> Cố mở trang chủ | Trình duyệt báo lỗi kết nối mạng (reject navigation) | Playwright nhận lỗi kết nối bị từ chối như mong muốn | ✅ Pass |
| TC4_02 | Mất mạng đột ngột khi đang đọc bài | Mở trang chủ khi Online -> Đặt chế độ Offline -> Click liên kết bất kỳ | Trình duyệt từ chối điều hướng sang trang mới và báo lỗi mạng | Báo lỗi điều hướng thất bại do offline | ✅ Pass |
| TC4_03 | Mất mạng khi nhấn tìm kiếm | Mở trang chủ Online -> Nhập từ khóa -> Ngắt mạng (Offline) -> Nhấn Enter | Yêu cầu tìm kiếm bị từ chối và báo lỗi kết nối | Lỗi kết nối được ném ra đúng thiết kế | ✅ Pass |
| TC4_04 | Khôi phục kết nối mạng thành công | Ngắt mạng (Offline) -> Bật lại mạng (Online) -> Tải lại trang | Tải lại trang thành công (HTTP status code < 400) | Trang tải lại bình thường, mã trạng thái HTTP 200 | ✅ Pass |
| TC4_05 | Chạy code compiler khi Offline | Mở trang Online compiler -> Ngắt mạng (Offline) -> Click Run | Trình duyệt ném ra lỗi kết nối AJAX hoặc hiển thị cảnh báo offline trên giao diện | Ném ra lỗi mạng hoặc báo lỗi UI | ✅ Pass |
| TC4_06 | Kiểm tra hoạt động của Service SW / Cache khi offline | Tải trang chủ Online -> Ngắt mạng (Offline) -> Tải lại (Reload) trang | Trình duyệt hiển thị thông tin trạng thái tải từ cache hoặc báo lỗi tải trang nếu không được lưu đệm | Ghi log trạng thái tải trang từ bộ nhớ đệm (hoặc báo lỗi nếu không hỗ trợ offline cache) | ✅ Pass |

---

## Bảng 9 — Chế độ Sáng/Tối / Theme Toggle (tests/advanced/dark-light-mode.spec.ts)

| ID | Tên test case | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Status |
| --- | --- | --- | --- | --- | --- |
| TC5_01 | Chuyển giao diện sang Dark Mode | Mở trang chủ -> Click nút đổi giao diện (theme toggle) sang chế độ tối | Cookie `gfg_theme` đổi thành `gfgThemeDark`, màu nền header sẫm màu | Đổi giao diện thành công, cookie lưu đúng giá trị | ✅ Pass |
| TC5_02 | Chuyển giao diện về Light Mode | Mở trang chủ ở Dark Mode -> Click nút đổi giao diện về sáng | Cookie `gfg_theme` đổi thành giá trị sáng, màu nền header sáng màu | Đổi về giao diện sáng thành công | ✅ Pass |
| TC5_03 | Lưu trạng thái Dark Mode sau khi Reload | Bật Dark Mode -> Tải lại (Reload) trang -> Kiểm tra cookie và màu sắc | Giao diện vẫn ở chế độ tối sau khi tải lại | Trạng thái Dark Mode được duy trì thành công | ✅ Pass |
| TC5_04 | Màu nền header ở chế độ tối | Bật Dark Mode -> Lấy màu nền computed style của header | Màu nền có độ sáng thấp (average RGB < 128 - màu tối) | Màu nền đo được phù hợp tiêu chuẩn giao diện tối | ✅ Pass |
| TC5_05 | Màu chữ header ở chế độ sáng | Chuyển sang Light Mode -> Lấy màu chữ computed style của header | Màu chữ có độ sáng thấp (average RGB < 180 - màu sẫm để tương phản với nền sáng) | Màu chữ hiển thị tương phản tốt | ✅ Pass |
| TC5_06 | Thích ứng thiết lập Dark Mode của hệ thống | Giả lập color scheme của hệ thống là `dark` -> Mở trang | Trang tự động áp dụng lớp CSS dark theme | Lớp dark được áp dụng thành công | ✅ Pass |
| TC5_07 | Trình soạn thảo code đổi theme theo Dark Mode | Bật Dark Mode -> Kiểm tra class/style của Ace Editor / Monaco Editor | Code block chuyển sang hiển thị giao diện tối | Trình biên tập chuyển màu tối chính xác | ✅ Pass |
| TC5_08 | Thay đổi icon của nút toggle theme | Đo HTML/class của nút toggle theme trước và sau khi click | Icon thay đổi trạng thái (ví dụ từ Mặt trời sang Mặt trăng và ngược lại) | Icon thay đổi thành công | ✅ Pass |

---

## Bảng 10 — Chức năng Phân trang / Pagination (tests/advanced/pagination.spec.ts)

| ID | Tên test case | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Status |
| --- | --- | --- | --- | --- | --- |
| TC6_01 | Hiển thị thanh phân trang blog | Truy cập `/category/blogs/` | Phần tử thanh phân trang (pagination wrapper) hiển thị trên màn hình | Thanh phân trang hiển thị đúng vị trí | ✅ Pass |
| TC6_02 | Điều hướng qua trang 2 | Truy cập `/category/blogs/` -> Click nút Next -> Chờ chuyển URL | URL chứa `/page/2/` hoặc `?page=2` | Chuyển trang thành công, URL thay đổi đúng định dạng | ✅ Pass |
| TC6_03 | Điều hướng quay về trang 1 | Mở trang 2 -> Click nút Previous -> Chờ chuyển URL | URL quay về trang chủ blogs hoặc `/page/1/` | Trở về trang 1 thành công | ✅ Pass |
| TC6_04 | Nút Previous bị vô hiệu hóa tại trang đầu | Mở trang 1 blogs -> Kiểm tra nút Previous | Nút Previous bị ẩn đi hoặc có thuộc tính `disabled` / không thể click | Nút bị ẩn hoặc vô hiệu hóa đúng tiêu chuẩn | ✅ Pass |
| TC6_05 | Nút Next bị vô hiệu hóa tại trang cuối | Điều hướng thẳng đến trang cực lớn (ví dụ trang 1000) -> Kiểm tra nút Next | Nút Next bị ẩn hoặc vô hiệu hóa do không còn trang tiếp theo | Nút Next bị vô hiệu hóa chính xác | ✅ Pass |
| TC6_06 | Chuyển trang trực tiếp qua số trang | Mở trang blogs -> Click vào nút số trang "3" | URL chuyển sang `/page/3/` hoặc `?page=3` | Điều hướng trực tiếp đến trang 3 thành công | ✅ Pass |
| TC6_07 | Nội dung bài viết giữa trang 1 và trang 2 không trùng lặp | Lấy tiêu đề bài viết đầu tiên ở trang 1 -> Chuyển sang trang 2 -> Lấy tiêu đề bài viết đầu tiên ở trang 2 -> So sánh | Hai tiêu đề bài viết phải khác nhau | Nội dung hoàn toàn khác biệt | ✅ Pass |
| TC6_08 | URL thay đổi chính xác theo trang được chọn | Truy cập trực tiếp trang 4 (`/category/blogs/page/4/`) | Trang tải đúng và URL phản ánh số trang 4 | URL tải đúng trang 4 thành công | ✅ Pass |

---

## Bảng 11 — Smoke Tải trang chủ (tests/smoke/homepage.spec.ts)

| ID | Tên test case | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Status |
| --- | --- | --- | --- | --- | --- |
| HP_01 | Tải trang chủ và các landmark cốt lõi | Mở trang chủ -> Kiểm tra trang tải xong và các landmark (header, nav, nội dung) hiển thị | Trang chủ tải thành công, các landmark cốt lõi đều hiển thị | Trang chủ tải đúng, các landmark hiển thị đầy đủ | ✅ Pass |

---

## Bảng 12 — Kiểm thử hồi quy Bug (tests/functional/bug-regression.spec.ts)

> Các ca **Fail** là regression test cố ý bắt lỗi còn tồn tại trên website production GeeksforGeeks; test sẽ tự chuyển xanh khi lỗi được sửa. (Đã loại 3 bug GFG-001, GFG-003, GFG-004 theo yêu cầu.)

| ID | Tên test case | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Status |
| --- | --- | --- | --- | --- | --- |
| BUG_01 | GFG-002 — Cơ chế chống flash trắng (FOUC) dark mode | Mở trang bài viết -> Kiểm tra trang có inline theme guard / meta color-scheme chống nháy trắng khi tải | Trang có cơ chế chống FOUC dark mode | Không tìm thấy cơ chế chống FOUC (inlineThemeGuard=false, colorSchemeMeta=0) — bug còn tồn tại | ❌ Fail |
| BUG_02 | GFG-002 — Dùng passive scroll listener | Mở trang bài viết -> Kiểm tra các scroll listener được đăng ký dạng passive | Scroll listener ở chế độ passive (không chặn cuộn) | Scroll listener passive đúng chuẩn | ✅ Pass |
| BUG_03 | GFG-005 — Chạy code C++ hợp lệ cho output đúng (sanity) | Đăng nhập -> Mở IDE compiler -> Chạy đoạn C++ Hello World -> Kiểm tra output | Output khớp kết quả mong đợi của chương trình | Tự động bỏ qua do thiếu `GFG_TEST_EMAIL`/`GFG_TEST_PASSWORD` trong `.env` (Run yêu cầu đăng nhập) | ⏭️ Skip |
| BUG_04 | GFG-005 — Code rỗng báo lỗi thân thiện, không rò rỉ lỗi linker | Đăng nhập -> Mở IDE compiler -> Để code rỗng -> Click Run | Hiển thị lỗi thân thiện, không lộ lỗi linker nội bộ | Tự động bỏ qua do thiếu tài khoản thử nghiệm trong `.env` | ⏭️ Skip |
| BUG_05 | GFG-007 — Trang chủ không có id trùng lặp | Mở trang chủ -> Quét toàn bộ phần tử có thuộc tính id | Không có id nào xuất hiện > 1 lần | Bắt được `id="comp"` ×2 và `id="script"` ×2 — bug còn tồn tại | ❌ Fail |
| BUG_06 | GFG-007 — Trang bài viết không có id trùng lặp | Mở trang bài viết -> Quét toàn bộ phần tử có thuộc tính id | Không có id nào xuất hiện > 1 lần | Bắt được `id="comp"` ×2 và `id="script"` ×2 — bug còn tồn tại | ❌ Fail |
| BUG_07 | GFG-008 — Ảnh nội dung trang /courses đều có alt | Mở `/courses` -> Cuộn hết trang để lazy-load -> Kiểm tra ảnh nội dung GFG (bỏ tracking pixel/data-URI/1×1) | Mọi ảnh nội dung GFG đều có thuộc tính alt | 22 ảnh nội dung GFG thiếu alt — bug còn tồn tại | ❌ Fail |
| BUG_08 | GFG-008 — Ảnh nội dung trang /explore đều có alt | Mở `/explore` -> Cuộn hết trang để lazy-load -> Kiểm tra ảnh nội dung GFG | Mọi ảnh nội dung GFG đều có thuộc tính alt | Trang sạch, mọi ảnh nội dung đều có alt | ✅ Pass |

---

## Bảng 13 — Kiểm thử thăm dò / Exploratory Audit (tests/bugs/exploratory-audit.spec.ts)

> Spec chẩn đoán: quét console error, ảnh hỏng/thiếu alt, id trùng, mixed content, meta SEO, viewport trên các trang chính. Chỉ ghi log, không assert — luôn Pass nếu trang tải được.

| ID | Tên test case | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Status |
| --- | --- | --- | --- | --- | --- |
| AUD_01 | Audit trang chủ (`/`) | Mở `/` -> Cuộn kích hoạt lazy-load -> Thu thập console error, ảnh hỏng/thiếu alt, id trùng, link rỗng, mixed content, meta, viewport | Ghi log toàn bộ chỉ số audit thành công | Ghi log đầy đủ (phát hiện id trùng `comp`/`script`, lỗi JS `renderMathInElement`) | ✅ Pass |
| AUD_02 | Audit trang bài viết | Mở `/python/python-program-to-add-two-numbers/` -> Cuộn -> Thu thập các chỉ số audit | Ghi log toàn bộ chỉ số audit thành công | Ghi log đầy đủ các chỉ số audit | ✅ Pass |
| AUD_03 | Audit trang Practice (`/explore`) | Mở `/explore` -> Cuộn -> Thu thập các chỉ số audit | Ghi log toàn bộ chỉ số audit thành công | Ghi log đầy đủ các chỉ số audit | ✅ Pass |
| AUD_04 | Audit trang Courses (`/courses`) | Mở `/courses` -> Cuộn -> Thu thập các chỉ số audit | Ghi log toàn bộ chỉ số audit thành công | Ghi log đầy đủ các chỉ số audit | ✅ Pass |

---

## Tổng kết

| Nhóm | Số test case | Pass | Fail | Skip |
| --- | --- | --- | --- | --- |
| Điều hướng (NV) | 2 | 2 | 0 | 0 |
| Đọc bài viết (AR) | 1 | 1 | 0 | 0 |
| Xác thực (AU) | 4 | 1 | 0 | 3 |
| Khóa học (CO) | 1 | 1 | 0 | 0 |
| Luyện tập (PR) | 2 | 2 | 0 | 0 |
| Tìm kiếm cơ bản (SE) | 2 | 2 | 0 | 0 |
| Giao diện thích ứng (TC3) | 8 | 8 | 0 | 0 |
| Ngoại tuyến (TC4) | 6 | 6 | 0 | 0 |
| Giao diện Sáng/Tối (TC5) | 8 | 8 | 0 | 0 |
| Phân trang (TC6) | 8 | 8 | 0 | 0 |
| Smoke trang chủ (HP) | 1 | 1 | 0 | 0 |
| Hồi quy Bug (BUG) | 8 | 2 | 4 | 2 |
| Thăm dò / Audit (AUD) | 4 | 4 | 0 | 0 |
| **Tổng** | **55** | **46** | **4** | **5** |
