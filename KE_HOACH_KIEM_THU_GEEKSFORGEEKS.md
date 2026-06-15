# KẾ HOẠCH BÀI TẬP LỚN: KIỂM THỬ TỰ ĐỘNG WEBSITE GEEKSFORGEEKS
> **Công cụ:** Playwright Test  
> **Ngôn ngữ:** TypeScript + Node.js  
> **Website mục tiêu:** https://www.geeksforgeeks.org  
> **Framework:** Playwright Test @1.60.0

---

## MỤC LỤC
1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Cấu trúc thư mục dự án](#2-cấu-trúc-thư-mục-dự-án)
3. [Công cụ & Môi trường](#3-công-cụ--môi-trường)
4. [Phase 1: Smoke & Functional Test](#4-phase-1-smoke--functional-test)
5. [Phase 2: 6 Kịch bản kiểm thử mở rộng](#5-phase-2-6-kịch-bản-kiểm-thử-mở-rộng)
6. [Kế hoạch triển khai](#6-kế-hoạch-triển-khai)
7. [Báo cáo & Kết quả](#7-báo-cáo--kết-quả)
8. [Ghi chú kỹ thuật & Troubleshoot](#8-ghi-chú-kỹ-thuật--troubleshoot)
9. [Lịch sử thay đổi](#9-lịch-sử-thay-đổi)

---

## 1. TỔNG QUAN DỰ ÁN

### Mục tiêu
Xây dựng bộ kiểm thử tự động (Automation Testing) cho website **GeeksforGeeks** sử dụng **Playwright Test** và **TypeScript**, bao gồm:
- **Phase 1:** 7 test file hiện tại (Smoke + Functional) với 13 test case
- **Phase 2:** 6 kịch bản mở rộng với 47 test case (tổng 60 test case)

### Phạm vi kiểm thử

#### Phase 1: Smoke & Functional (Đã triển khai)
| STT | Nhóm | Chức năng | File |
|-----|------|----------|------|
| 1 | Smoke | Homepage load + Navigation | `smoke/*.spec.ts` |
| 2 | Functional | Search, Article, Practice, Courses, Auth | `functional/*.spec.ts` |

#### Phase 2: 6 Kịch bản mở rộng (Sẽ triển khai)
| STT | Kịch bản | Chức năng | Số TC | Ưu tiên |
|-----|----------|----------|-------|---------|
| 1 | Search & Filters | Tìm kiếm nâng cao, bộ lọc | 8 | Cao |
| 2 | Online IDE | Trình biên dịch code online | 9 | Cao |
| 3 | Responsive UI | Giao diện đa thiết bị | 8 | Trung |
| 4 | Offline Behavior | Hành vi khi mất kết nối mạng | 6 | Trung |
| 5 | Dark/Light Mode | Chuyển đổi chế độ giao diện | 8 | Thấp |
| 6 | Pagination | Phân trang danh sách bài viết | 8 | Trung |

---

## 2. CẤU TRÚC THƯ MỤC DỰ ÁN

```
Playwright-Test/
│
├── tests/
│   ├── smoke/                       # Phase 1: Smoke test
│   │   ├── homepage.spec.ts
│   │   └── navigation.spec.ts
│   │
│   ├── functional/                  # Phase 1: Functional test
│   │   ├── search.spec.ts
│   │   ├── article.spec.ts
│   │   ├── practice.spec.ts
│   │   ├── courses.spec.ts
│   │   └── authentication.spec.ts
│   │
│   ├── advanced/                    # Phase 2: Advanced test
│   │   ├── search-filters.spec.ts
│   │   ├── online-ide.spec.ts
│   │   ├── responsive.spec.ts
│   │   ├── offline-behavior.spec.ts
│   │   ├── dark-light-mode.spec.ts
│   │   └── pagination.spec.ts
│   │
│   ├── fixtures/
│   │   ├── pages.fixture.ts         # Dependency injection
│   │   └── test-data.ts
│   │
│   └── pages/                       # Page Object Model (POM)
│       ├── base.page.ts
│       ├── home.page.ts
│       ├── search.page.ts
│       ├── article.page.ts
│       ├── practice.page.ts
│       ├── courses.page.ts
│       └── auth.page.ts
│
├── playwright.config.ts             # Cấu hình Playwright
├── tsconfig.json                    # Cấu hình TypeScript
├── package.json                     # Dependencies
├── playwright-report/               # HTML report
├── test-results/                    # Artifacts (screenshot, video, trace)
└── README.md
```

---

## 3. CÔNG CỤ & MÔI TRƯỜNG

### Cài đặt
```bash
npm install          # Cài @playwright/test, TypeScript, dependencies
npm install -D @playwright/test typescript @types/node
```

### Cấu hình Playwright (playwright.config.ts)
```typescript
const config: PlaywrightTestConfig = {
  testDir: './tests',
  use: {
    baseURL: 'https://www.geeksforgeeks.org',
    navigationTimeout: 45_000,     // Production site slow with ads
    actionTimeout: 15_000,
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    trace: 'on-first-retry',
    locale: 'en-US',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  workers: process.env.CI ? 1 : 4,
};
```

### NPM Scripts
```bash
npm test                    # Chạy toàn bộ test
npm run test:smoke         # Chỉ smoke test
npm run test:functional    # Chỉ functional test
npm run test:account       # Account test (sequential)
npm run test:headed        # Visible browser
npm run report             # Xem HTML report
```

### Biến môi trường
```bash
GFG_TEST_EMAIL=your-email@example.com
GFG_TEST_PASSWORD=your-password
GFG_BASE_URL=https://www.geeksforgeeks.org
```

---

## 4. PHASE 1: SMOKE & FUNCTIONAL TEST

**Trạng thái:** ✅ **Đã triển khai** (13 test case)

### Các test hiện tại

| File | Nhóm | Test Case | Mục đích |
|------|------|-----------|---------|
| `smoke/homepage.spec.ts` | Smoke | Homepage load, Logo, Search, Sign-in | Verify trang chủ load & UI landmarks |
| `smoke/navigation.spec.ts` | Smoke | Practice nav, Courses nav | Verify navigation links work |
| `functional/search.spec.ts` | Functional | Find "binary search", No-result | Verify search functionality |
| `functional/article.spec.ts` | Functional | Article rendering, title, code, links | Verify article content display |
| `functional/practice.spec.ts` | Functional | Load practice catalog, search "Two Sum" | Verify practice features |
| `functional/courses.spec.ts` | Functional | Browse courses, open course detail | Verify course browsing |
| `functional/authentication.spec.ts` | Functional | Login, Register, Password recovery (OTP) | Verify auth flow (stop at CAPTCHA) |

**Ghi chú:** 
- Tất cả test chạy trên **Chromium desktop** (Phase 1)
- Authentication test **dừng ở OTP**, không vượt CAPTCHA (per design)
- Mỗi test có **context riêng** (isolation mặc định của Playwright)

---

## 5. PHASE 2: 6 KỊCH BẢN KIỂM THỬ MỞ RỘNG

### Kịch bản 1: Kiểm thử Tìm kiếm và Bộ lọc (Search & Filters)

**Mục tiêu:** Xác minh chức năng tìm kiếm bài viết và bộ lọc theo chủ đề hoạt động đúng.

**Tệp test:** `tests/advanced/search-filters.spec.ts` | **Số TC:** 8

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

---

### Kịch bản 2: Kiểm thử Trình biên dịch Code Online (Online IDE)

**Mục tiêu:** Xác minh trình biên dịch code tích hợp hoạt động đúng với các ngôn ngữ lập trình khác nhau.

**Tệp test:** `tests/advanced/online-ide.spec.ts` | **Số TC:** 9

**⚠️ CẢNH BÁO VERIFY:** Các test case về code execution (Python, C++, stdin) phụ thuộc vào GFG IDE hỗ trợ chạy code thực tế. Cần verify trên website với VPN.

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
| TC2_09 | IDE có accessibility | Tab, focus, keyboard | IDE điều hướng được bằng bàn phím |

---

### Kịch bản 3: Kiểm thử Giao diện Responsive

**Mục tiêu:** Xác minh giao diện hiển thị đúng trên nhiều kích thước màn hình.

**Tệp test:** `tests/advanced/responsive.spec.ts` | **Số TC:** 8

#### Viewport được kiểm thử

| Thiết bị | Độ phân giải |
|----------|-------------|
| Desktop (Full HD) | 1920 x 1080 |
| Desktop (HD) | 1366 x 768 |
| Tablet (iPad) | 768 x 1024 |
| Mobile (iPhone 14) | 390 x 844 |
| Mobile (Android) | 412 x 915 |

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

---

### Kịch bản 4: Kiểm thử Hành vi khi Mất Mạng (Offline Behavior)

**Mục tiêu:** Xác minh website xử lý đúng khi mạng bị ngắt giữa chừng.

**Tệp test:** `tests/advanced/offline-behavior.spec.ts` | **Số TC:** 6

| TC ID | Tên Test Case | Hành động | Kết quả mong đợi |
|-------|--------------|---------|-----------------|
| TC4_01 | Tải trang khi offline | Tắt mạng → Mở URL | Hiển thị trang lỗi trình duyệt hoặc offline page |
| TC4_02 | Mất mạng khi đang đọc bài | Đọc bài → Tắt mạng → Click link | Thông báo lỗi mạng hoặc trang không tải được |
| TC4_03 | Mất mạng khi tìm kiếm | Gõ từ khóa → Tắt mạng → Enter | Không crash, hiển thị lỗi mạng |
| TC4_04 | Khôi phục mạng | Tắt → Bật lại mạng → Retry | Trang tải lại thành công |
| TC4_05 | Offline khi chạy code IDE | Tắt mạng → Nhấn Run | Thông báo lỗi kết nối, không crash |
| TC4_06 | Service Worker / Cache | Trang đã load → Offline → Reload | Nếu có SW: hiển thị nội dung cache **(Optional — GFG có thể không hỗ trợ)** |

---

### Kịch bản 5: Kiểm thử Chế độ Sáng/Tối (Dark/Light Mode)

**Mục tiêu:** Xác minh chức năng chuyển đổi Dark Mode / Light Mode hoạt động đúng.

**Tệp test:** `tests/advanced/dark-light-mode.spec.ts` | **Số TC:** 8

**⚠️ CẢNH BÁO VERIFY:** Tính năng Dark Mode có thể không tồn tại trên GFG. Cần kiểm tra website với VPN trước khi code.

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

---

### Kịch bản 6: Kiểm thử Phân trang (Pagination)

**Mục tiêu:** Xác minh hệ thống phân trang hoạt động đúng — điều hướng, số trang, nút Prev/Next.

**Tệp test:** `tests/advanced/pagination.spec.ts` | **Số TC:** 8

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

---

## 6. KẾ HOẠCH TRIỂN KHAI

### Ưu tiên Cao (Sprint 1)
- [ ] `search-filters.spec.ts` — Kịch bản 1 (8 TC)

### Ưu tiên Trung (Sprint 2)
- [ ] `pagination.spec.ts` — Kịch bản 6 (8 TC)
- [ ] `offline-behavior.spec.ts` — Kịch bản 4 (6 TC)
- [ ] `online-ide.spec.ts` — Kịch bản 2 (9 TC)

### Ưu tiên Thấp→Trung (Sprint 3)
- [ ] `responsive.spec.ts` — Kịch bản 3 (8 TC)
- [ ] `dark-light-mode.spec.ts` — Kịch bản 5 (8 TC)

---

## 7. BÁO CÁO & KẾT QUẢ

### Lệnh chạy kiểm thử

```bash
npm test                           # Chạy toàn bộ
npm run test:smoke                # Smoke only
npm run test:functional           # Functional only
npm run test:account              # Account (sequential)
npm run test:headed               # With visible browser
npm run report                    # View HTML report
npx playwright test search-filters.spec.ts    # Single file
npx playwright test --grep "Dark mode"        # By pattern
```

### Artifact tạo ra

| Loại | Đường dẫn | Mục đích |
|------|----------|--------|
| HTML Report | `playwright-report/index.html` | Tóm tắt kết quả |
| Screenshot | `test-results/*/test-*.png` | Ảnh lỗi |
| Video | `test-results/*/video.webm` | Record retry |
| Trace | `test-results/*/trace.zip` | Timeline chi tiết |
| Error Context | `test-results/*/error-context.md` | Stack trace |

### Bảng tổng hợp kết quả

| Phase | Nhóm | Số TC | Status | Ghi chú |
|-------|------|-------|--------|---------|
| **Phase 1** | Smoke | 2 | ✅ Passed | Homepage, Navigation |
| | Functional | 11 | ✅ 9 Passed, 2 Skipped | Search, Article, Practice, Courses, Auth |
| | **Tổng** | **13** | **9 Passed, 4 Skipped** | Ready for Phase 2 |
| **Phase 2** | Search & Filters | 8 | — | — |
| | Online IDE | 9 | — | **⚠️ Verify** |
| | Responsive | 8 | — | — |
| | Offline Behavior | 6 | — | TC4_06 optional |
| | Dark/Light Mode | 8 | — | **⚠️ Verify** |
| | Pagination | 8 | — | — |
| | **Tổng** | **47** | **TBD** | 60 TC total |

---

## 8. GHI CHÚ KỸ THUẬT & TROUBLESHOOT

### Playwright Test Features
- **Auto-wait**: Tự động chờ phần tử → giảm timeout cần thiết
- **Page Object Model (POM)**: Tách logic tìm phần tử và test logic
- **Fixture & DI**: Dùng `pages.fixture.ts` để inject page objects
- **Screenshot on-failure**: Tự động chụp khi fail
- **Video & Trace on-first-retry**: Ghi hình & timeline chi tiết
- **Context Isolation**: Mỗi test có context riêng
- **Parallel Execution**: 4 workers local, 1 worker CI

### Xử lý Cloudflare & Bot Protection
- **Không có bypass** cho CAPTCHA hay bot detection
- Test dừng ở OTP/CAPTCHA (per design)
- **Parallel Execution**: 1 worker local (để tránh Cloudflare ban IP), 1 worker CI

### Xử lý Cloudflare & Bot Protection & Phòng tránh Ban IP
- **Cơ chế phòng ngừa tích hợp:**
  1. **Chạy tuần tự (Sequential Execution):** Thiết lập `workers: 1` ở local. Việc chạy song song nhiều luồng từ một IP là nguyên nhân lớn nhất khiến Cloudflare khóa IP.
  2. **Trễ mô phỏng (slowMo):** Cấu hình `slowMo: 500` (dừng 500ms giữa các hành động) giúp giả lập nhịp thao tác của con người.
  3. **Giả lập User-Agent:** Sử dụng User-Agent Chrome thực tế thay vì User-Agent tự động mặc định của Playwright.
- **Không có bypass** cho CAPTCHA hay bot detection.
- Test dừng ở OTP/CAPTCHA (per design).
- Nếu IP bị ban: Sử dụng mạng 4G (hotspot) hoặc chuyển sang VPN khác.
- **Khuyến cáo:** Tránh chạy toàn bộ bộ test liên tục nhiều lần. Trong quá trình phát triển test case mới, chỉ chạy file test riêng lẻ mục tiêu.

### Best Practices
1. **Không hardcode** email, password → dùng env var
2. **Không submit hay thay đổi** dữ liệu production
3. **Ưu tiên getByRole, getByLabel** → chịu UI thay đổi tốt hơn
4. **Cập nhật locator ngay** khi UI thay đổi
5. **Chạy tuần tự** cho account workflows (`--workers=1`)

### Troubleshoot thường gặp

| Vấn đề | Nguyên nhân | Giải pháp |
|-------|-----------|---------|
| `Timeout waiting for selector` | UI thay đổi / network chậm | Check screenshot, verify locator |
| `CAPTCHA xuất hiện` | Bot detection | Skip test, chờ unban hoặc đổi IP/VPN |
| `Test flaky` | Timing, animation, ads | Dùng `waitForLoadState()`, tăng timeout |
| `IP bị ban` | Cloudflare phát hiện bot/nhiều req song song | Đổi IP (bật VPN/Hotspot), chuyển workers = 1, tăng slowMo |
| `Login fail` | Env var sai | Kiểm tra `GFG_TEST_EMAIL` & password |
| **KC2 IDE fail** | GFG không hỗ trợ code execution | Verify GFG IDE trước, skip nếu cần |
| **KC5 Dark Mode fail** | GFG không có dark mode | Verify GFG website, skip kịch bản nếu cần |

---

## 9. LỊCH SỬ THAY ĐỔI

### Phiên bản 2.1 (06/15/2026) — Merge & Verification
- **Merge**: Kết hợp old version (production test cases) + new version (accessibility tests)
- **KC2**: Mở rộng 6 → 9 TC (thêm Python, C++, stdin, accessibility)
- **KC4**: Thêm TC4_06 Service Worker (optional)
- **KC5**: Đảm bảo đầy đủ 8 TC (thêm TC5_08 Icon toggle)
- **Cảnh báo**: Mark KC2 & KC5 cần verify trên GFG
- **Tổng**: 60 TC (13 Phase 1 + 47 Phase 2)

### Phiên bản 2.0 (06/2026)
- **Chuyển**: PyTest/Python → Playwright Test/TypeScript
- **Thêm**: Phase 2 với 6 kịch bản mở rộng
- **Cập nhật**: npm scripts, artifact paths, troubleshoot

### Phiên bản 1.0
- Kế hoạch gốc với PyTest

---

**Last Updated:** 2026-06-15 | **Ready for VPN Testing**
