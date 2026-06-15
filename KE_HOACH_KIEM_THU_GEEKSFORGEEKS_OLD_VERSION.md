# KẾ HOẠCH BÀI TẬP LỚN: KIỂM THỬ TỰ ĐỘNG WEBSITE GEEKSFORGEEKS
> **Công cụ:** Playwright + PyTest  
> **Ngôn ngữ:** Python  
> **Website mục tiêu:** https://www.geeksforgeeks.org  

---

## MỤC LỤC
1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Cấu trúc thư mục dự án](#2-cấu-trúc-thư-mục-dự-án)
3. [Công cụ & Môi trường](#3-công-cụ--môi-trường)
4. [6 Kịch bản kiểm thử](#4-6-kịch-bản-kiểm-thử)
5. [Kế hoạch triển khai](#5-kế-hoạch-triển-khai)
6. [Báo cáo & Kết quả](#6-báo-cáo--kết-quả)

---

## 1. TỔNG QUAN DỰ ÁN

### Mục tiêu
Xây dựng bộ kiểm thử tự động (Automation Testing) cho website **GeeksforGeeks** sử dụng **Playwright** và **PyTest**, bao gồm 6 kịch bản kiểm thử được thiết kế để đánh giá toàn diện các chức năng quan trọng của trang web.

### Phạm vi kiểm thử
| STT | Kịch bản | Chức năng |
|-----|----------|-----------|
| 1 | Search & Filters | Tìm kiếm và bộ lọc bài viết |
| 2 | Online IDE | Trình biên dịch code online |
| 3 | Responsive UI | Giao diện đa thiết bị |
| 4 | Offline Behavior | Hành vi khi mất kết nối mạng |
| 5 | Dark/Light Mode | Chuyển đổi chế độ giao diện |
| 6 | Pagination | Phân trang danh sách bài viết |

---

## 2. CẤU TRÚC THƯ MỤC DỰ ÁN

```
geeksforgeeks-automation/
│
├── tests/
│   ├── test_search_filters.py        # Kịch bản 1
│   ├── test_online_ide.py            # Kịch bản 2
│   ├── test_responsive.py            # Kịch bản 3
│   ├── test_offline_behavior.py      # Kịch bản 4
│   ├── test_dark_light_mode.py       # Kịch bản 5
│   └── test_pagination.py            # Kịch bản 6
│
├── pages/                            # Page Object Model (POM)
│   ├── base_page.py
│   ├── home_page.py
│   ├── search_page.py
│   ├── ide_page.py
│   └── article_page.py
│
├── conftest.py                       # Fixtures & cấu hình chung
├── pytest.ini                        # Cấu hình PyTest
├── requirements.txt                  # Dependencies
└── reports/                          # Báo cáo tự động (HTML/Allure)
```

---

## 3. CÔNG CỤ & MÔI TRƯỜNG

### Thư viện cần cài đặt
```bash
pip install pytest
pip install playwright
pip install pytest-playwright
pip install pytest-html           # Báo cáo HTML
pip install allure-pytest          # Báo cáo Allure (tùy chọn)
playwright install                 # Cài trình duyệt
```

### File requirements.txt
```
pytest>=7.0
playwright>=1.40
pytest-playwright>=0.4
pytest-html>=4.0
```

### Trình duyệt hỗ trợ
- Chromium (mặc định)
- Firefox
- WebKit (Safari)

---

## 4. SÁU KỊCH BẢN KIỂM THỬ

---

### Kịch bản 1: Kiểm thử Tìm kiếm và Bộ lọc (Search & Filters)

**Mục tiêu:** Xác minh chức năng tìm kiếm bài viết và bộ lọc theo chủ đề hoạt động đúng.

#### Test Cases

| TC ID | Tên Test Case | Đầu vào | Kết quả mong đợi |
|-------|--------------|---------|-----------------|
| TC1_01 | Tìm kiếm từ khóa hợp lệ | "Python tutorial" | Hiển thị danh sách kết quả liên quan |
| TC1_02 | Tìm kiếm từ khóa không tồn tại | "xyzabc123!!!" | Hiển thị thông báo không tìm thấy kết quả |
| TC1_03 | Tìm kiếm từ khóa rỗng | "" (Enter) | Không crash, giữ nguyên trang hoặc hiển thị gợi ý |
| TC1_04 | Tìm kiếm với ký tự đặc biệt | "<script>alert(1)</script>" | Không thực thi script, kết quả an toàn |
| TC1_05 | Gợi ý tìm kiếm tự động | "Pyth" (gõ chậm) | Xuất hiện dropdown gợi ý |
| TC1_06 | Lọc theo chủ đề (Tag Filter) | Chọn tag "DSA" | Chỉ hiển thị bài viết thuộc DSA |
| TC1_07 | Kết hợp tìm kiếm + lọc | "sort" + lọc "Python" | Kết quả khớp cả từ khóa và tag |
| TC1_08 | Tìm kiếm không dấu tiếng Việt | Nếu có | Nhận diện đúng từ khóa |

#### Kỹ thuật áp dụng
- **Data-Driven Testing** với `@pytest.mark.parametrize`
- Xác minh URL thay đổi sau khi tìm kiếm
- Kiểm tra số lượng kết quả > 0

---

### Kịch bản 2: Kiểm thử Trình biên dịch Code Online (Online IDE)

**Mục tiêu:** Xác minh trình biên dịch code tích hợp trên GeeksforGeeks hoạt động đúng với các ngôn ngữ lập trình khác nhau.

#### Test Cases

| TC ID | Tên Test Case | Đầu vào | Kết quả mong đợi |
|-------|--------------|---------|-----------------|
| TC2_01 | Chạy code Python hợp lệ | `print("Hello, GFG!")` | Output: `Hello, GFG!` |
| TC2_02 | Chạy code C++ hợp lệ | `cout << "Hello";` | Output: `Hello` |
| TC2_03 | Chạy code có lỗi cú pháp | `prit("hello")` (Python) | Hiển thị thông báo lỗi compile |
| TC2_04 | Chạy code vòng lặp vô hạn | `while True: pass` | Timeout hoặc thông báo TLE |
| TC2_05 | Nhập dữ liệu từ stdin | Code đọc input() | Chấp nhận input và trả output đúng |
| TC2_06 | Chuyển đổi ngôn ngữ | Chọn Java/C/JavaScript | Editor thay đổi ngôn ngữ, code mẫu tương ứng |
| TC2_07 | Xóa code và chạy lại | Xóa code → Nhập mới → Run | Kết quả mới, không bị lẫn output cũ |
| TC2_08 | Kiểm tra timeout | Code chạy > giới hạn thời gian | Thông báo Time Limit Exceeded |

#### Kỹ thuật áp dụng
- Sử dụng `page.wait_for_selector()` chờ output xuất hiện
- Xử lý **iframe** nếu IDE nằm trong frame
- Timeout handling cho các trường hợp TLE

---

### Kịch bản 3: Kiểm thử Giao diện Responsive

**Mục tiêu:** Xác minh giao diện GeeksforGeeks hiển thị đúng và đầy đủ trên nhiều kích thước màn hình khác nhau.

#### Viewport được kiểm thử

| Thiết bị | Độ phân giải |
|----------|-------------|
| Desktop (Full HD) | 1920 x 1080 |
| Desktop (HD) | 1366 x 768 |
| Tablet (iPad) | 768 x 1024 |
| Mobile (iPhone 14) | 390 x 844 |
| Mobile (Android) | 412 x 915 |

#### Test Cases

| TC ID | Tên Test Case | Thiết bị | Kết quả mong đợi |
|-------|--------------|---------|-----------------|
| TC3_01 | Menu Navigation Desktop | 1920x1080 | Hiển thị full menu ngang |
| TC3_02 | Menu Navigation Mobile | 390x844 | Hiển thị hamburger menu |
| TC3_03 | Mở Hamburger Menu | Mobile | Menu dropdown mở đúng |
| TC3_04 | Hình ảnh co giãn | Tablet | Ảnh không bị vỡ hoặc tràn |
| TC3_05 | Thanh tìm kiếm | Mobile | Search bar hiển thị và dùng được |
| TC3_06 | Font chữ đọc được | Mobile | Cỡ chữ không quá nhỏ (≥ 12px) |
| TC3_07 | Nút bấm đủ lớn | Mobile | Nút ≥ 44x44 px (WCAG) |
| TC3_08 | Không cuộn ngang | Mobile | Không xuất hiện scrollbar ngang |

#### Kỹ thuật áp dụng
- `page.set_viewport_size({"width": W, "height": H})`
- Chụp ảnh màn hình (`page.screenshot()`) làm bằng chứng
- Parametrize với nhiều viewport

---

### Kịch bản 4: Kiểm thử Hành vi khi Mất Mạng (Offline Behavior)

**Mục tiêu:** Xác minh website xử lý đúng khi mạng bị ngắt giữa chừng — không crash, hiển thị thông báo phù hợp.

#### Test Cases

| TC ID | Tên Test Case | Hành động | Kết quả mong đợi |
|-------|--------------|---------|-----------------|
| TC4_01 | Tải trang khi offline | Tắt mạng → Mở URL | Hiển thị trang lỗi trình duyệt hoặc offline page |
| TC4_02 | Mất mạng khi đang đọc bài | Đọc bài → Tắt mạng → Click link | Thông báo lỗi mạng hoặc trang không tải được |
| TC4_03 | Mất mạng khi tìm kiếm | Gõ từ khóa → Tắt mạng → Enter | Không crash, hiển thị lỗi mạng |
| TC4_04 | Khôi phục mạng | Tắt → Bật lại mạng → Retry | Trang tải lại thành công |
| TC4_05 | Offline khi chạy code IDE | Tắt mạng → Nhấn Run | Thông báo lỗi kết nối, không crash |
| TC4_06 | Service Worker / Cache | Trang đã load → Offline → Reload | Nếu có SW: hiển thị nội dung cache |

#### Kỹ thuật áp dụng
- Playwright API: `context.set_offline(True/False)`
- Bắt lỗi network với `page.on("requestfailed", ...)`
- Kiểm tra thông báo lỗi xuất hiện trong DOM

---

### Kịch bản 5: Kiểm thử Chế độ Sáng/Tối (Dark/Light Mode)

**Mục tiêu:** Xác minh chức năng chuyển đổi Dark Mode / Light Mode hoạt động đúng và toàn bộ giao diện áp dụng đúng màu sắc.

#### Test Cases

| TC ID | Tên Test Case | Hành động | Kết quả mong đợi |
|-------|--------------|---------|-----------------|
| TC5_01 | Chuyển sang Dark Mode | Click toggle Dark | Nền tối, chữ sáng |
| TC5_02 | Chuyển về Light Mode | Click toggle Light | Nền trắng, chữ tối |
| TC5_03 | Lưu trạng thái Dark Mode | Dark → Reload trang | Vẫn giữ Dark Mode |
| TC5_04 | Kiểm tra màu nền | Dark Mode | `background-color` tối (≤ #333) |
| TC5_05 | Kiểm tra màu chữ | Light Mode | `color` đủ tương phản với nền |
| TC5_06 | Dark Mode theo hệ thống | Prefers-color-scheme: dark | GFG tự chuyển sang Dark |
| TC5_07 | Code block hiển thị Dark | Dark Mode → Xem code | Syntax highlighting vẫn đọc được |
| TC5_08 | Icon toggle đổi trạng thái | Sau khi click | Icon moon ↔ sun thay đổi |

#### Kỹ thuật áp dụng
- Đọc CSS property: `page.evaluate("getComputedStyle(el).backgroundColor")`
- Emulate dark mode: `page.emulate_media(color_scheme="dark")`
- LocalStorage check: kiểm tra giá trị lưu trạng thái

---

### Kịch bản 6: Kiểm thử Phân trang (Pagination)

**Mục tiêu:** Xác minh hệ thống phân trang trên các trang danh sách bài viết hoạt động đúng — điều hướng, số trang, nút Prev/Next.

#### Test Cases

| TC ID | Tên Test Case | Hành động | Kết quả mong đợi |
|-------|--------------|---------|-----------------|
| TC6_01 | Hiển thị thanh phân trang | Mở trang danh sách | Pagination bar hiển thị |
| TC6_02 | Chuyển sang trang 2 | Click "Next" hoặc "2" | URL thay đổi, nội dung mới |
| TC6_03 | Quay về trang 1 | Click "Previous" | Quay về nội dung trang 1 |
| TC6_04 | Nút Previous ở trang 1 | Trang 1 → Click Previous | Nút Previous bị disabled hoặc ẩn |
| TC6_05 | Nút Next ở trang cuối | Trang cuối → Click Next | Nút Next bị disabled hoặc ẩn |
| TC6_06 | Nhảy đến trang cụ thể | Click số trang "5" | Hiển thị đúng nội dung trang 5 |
| TC6_07 | Nội dung không trùng lặp | Trang 1 vs Trang 2 | Danh sách bài khác nhau |
| TC6_08 | URL phản ánh số trang | Trang 3 | URL chứa `?page=3` hoặc `/page/3` |

#### Kỹ thuật áp dụng
- Xác minh URL thay đổi sau mỗi lần click
- So sánh nội dung giữa các trang
- Kiểm tra trạng thái `disabled` của nút Prev/Next

---

## 5. KẾ HOẠCH TRIỂN KHAI

### Bước 1: Khởi tạo dự án
- [ ] Cài đặt môi trường Python + Playwright
- [ ] Tạo cấu trúc thư mục dự án
- [ ] Viết `conftest.py` với fixture browser/page dùng chung
- [ ] Tạo `pytest.ini` cấu hình cơ bản

### Bước 2: Viết Page Object Model (POM)
- [ ] `base_page.py` — các hàm dùng chung (click, input, wait)
- [ ] `home_page.py` — trang chủ GFG
- [ ] `search_page.py` — trang kết quả tìm kiếm
- [ ] `ide_page.py` — trang Online IDE
- [ ] `article_page.py` — trang bài viết

### Bước 3: Viết Test Scripts
- [ ] `test_search_filters.py` — Kịch bản 1
- [ ] `test_online_ide.py` — Kịch bản 2
- [ ] `test_responsive.py` — Kịch bản 3
- [ ] `test_offline_behavior.py` — Kịch bản 4
- [ ] `test_dark_light_mode.py` — Kịch bản 5
- [ ] `test_pagination.py` — Kịch bản 6

### Bước 4: Chạy kiểm thử & Gỡ lỗi
- [ ] Chạy từng file test riêng lẻ
- [ ] Gỡ lỗi các test case thất bại
- [ ] Chụp ảnh màn hình khi có lỗi

### Bước 5: Sinh báo cáo
- [ ] Sinh báo cáo HTML với `pytest-html`
- [ ] (Tùy chọn) Sinh báo cáo Allure

---

## 6. BÁO CÁO & KẾT QUẢ

### Lệnh chạy kiểm thử

```bash
# Chạy toàn bộ test
pytest tests/ -v --html=reports/report.html --self-contained-html

# Chạy riêng từng kịch bản
pytest tests/test_search_filters.py -v
pytest tests/test_online_ide.py -v
pytest tests/test_responsive.py -v
pytest tests/test_offline_behavior.py -v
pytest tests/test_dark_light_mode.py -v
pytest tests/test_pagination.py -v

# Chạy trên nhiều trình duyệt
pytest tests/ --browser chromium --browser firefox
```

### Bảng tổng hợp kết quả (mẫu)

| Kịch bản | Số TC | Pass | Fail | Ghi chú |
|----------|-------|------|------|---------|
| KC1 - Search & Filters | 8 | — | — | — |
| KC2 - Online IDE | 8 | — | — | — |
| KC3 - Responsive UI | 8 | — | — | — |
| KC4 - Offline Behavior | 6 | — | — | — |
| KC5 - Dark/Light Mode | 8 | — | — | — |
| KC6 - Pagination | 8 | — | — | — |
| **Tổng cộng** | **46** | **—** | **—** | — |

---

## GHI CHÚ KỸ THUẬT QUAN TRỌNG

- **Auto-wait:** Playwright tự động chờ phần tử trước khi thao tác — giảm cần `time.sleep()`
- **Page Object Model:** Tách biệt logic tìm phần tử và logic kiểm thử để dễ bảo trì
- **Fixtures:** Sử dụng `conftest.py` để dùng chung browser/page giữa các test
- **Screenshot khi lỗi:** Cấu hình `--screenshot=on` để tự động chụp ảnh khi test fail
- **Headless mode:** Mặc định chạy headless; thêm `--headed` để xem trực tiếp khi debug

---

*Tài liệu này là kế hoạch tổng quan. Các bước tiếp theo sẽ triển khai từng phần theo thứ tự.*
