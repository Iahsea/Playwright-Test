# Hướng dẫn cài đặt và chạy project

## 1. Yêu cầu

- Node.js 20 trở lên.
- npm đi kèm Node.js.
- Kết nối Internet để truy cập `https://www.geeksforgeeks.org`.
- Chromium do Playwright quản lý.

Kiểm tra môi trường:

```powershell
node --version
npm --version
```

## 2. Cài đặt lần đầu

Mở PowerShell tại thư mục project và chạy:

```powershell
npm install
npx playwright install chromium
```

Kiểm tra Playwright đã nhận test:

```powershell
npx playwright test --list
```

## 3. Chạy test

Chạy toàn bộ suite:

```powershell
npm test
```

Playwright chạy tối đa bốn worker trên máy local để giảm lỗi không ổn định khi
website production phản hồi chậm.

Khi chưa cấu hình credentials, ba test `@account` sẽ được skip tự động.

Chạy smoke test:

```powershell
npm run test:smoke
```

Chạy functional test công khai:

```powershell
npm run test:functional
```

Chạy browser có giao diện:

```powershell
npm run test:headed
```

Chạy một file:

```powershell
npx playwright test search.spec.ts
```

Chạy một test theo tên:

```powershell
npx playwright test --grep "finds and opens relevant content"
```

## 4. Test tài khoản

Thiết lập biến môi trường trong PowerShell:

```powershell
$env:GFG_TEST_EMAIL = "test-account@example.com"
$env:GFG_TEST_PASSWORD = "secret"
$env:GFG_REGISTRATION_EMAIL = "new-test-account@example.com"
```

Sau đó chạy:

```powershell
npm run test:account
```

Ý nghĩa biến:

| Biến | Mục đích |
|---|---|
| `GFG_TEST_EMAIL` | Đăng nhập và yêu cầu khôi phục mật khẩu |
| `GFG_TEST_PASSWORD` | Mật khẩu của tài khoản test |
| `GFG_REGISTRATION_EMAIL` | Email có thể nhận OTP đăng ký |
| `GFG_BASE_URL` | Ghi đè URL mặc định của website |

Ví dụ chạy với URL khác:

```powershell
$env:GFG_BASE_URL = "https://www.geeksforgeeks.org"
npm test
```

Không commit credentials vào source code, README, report hoặc file `.env`.
Luồng đăng ký và quên mật khẩu chỉ xác minh đến bước OTP. CAPTCHA không được
bỏ qua bằng automation.

## 5. Báo cáo và debug

Mở HTML report của lần chạy gần nhất:

```powershell
npm run report
```

Artifact được tạo trong:

- `playwright-report/`: HTML report.
- `test-results/`: screenshot, trace, video và thông tin lỗi.

### 5.1. Debug theo nhóm tag

Mỗi `test.describe` được gắn tag `@smoke`, `@functional` hoặc `@account` trong tên.
Kết hợp `--grep` với `--debug` để mở Playwright Inspector chỉ cho nhóm đó.
Thêm `--headed` nếu chỉ muốn thấy browser mà không cần Inspector.

Debug toàn bộ nhóm smoke — mở Inspector từng bước:

```powershell
npx playwright test --grep "@smoke" --debug
```

Chạy nhóm smoke có browser hiện ra, không dừng từng bước:

```powershell
npx playwright test --grep "@smoke" --headed
```

Debug toàn bộ nhóm functional:

```powershell
npx playwright test --grep "@functional" --debug
```

```powershell
npx playwright test --grep "@functional" --headed
```

Debug nhóm account (chạy tuần tự, bắt buộc `--workers=1`):

```powershell
npx playwright test --grep "@account" --workers=1 --debug
```

Loại trừ một nhóm khỏi lần chạy (ví dụ bỏ qua `@account`):

```powershell
npx playwright test --grep-invert "@account"
```

### 5.2. Debug theo file

Mở Playwright Inspector cho một file cụ thể:

```powershell
npx playwright test tests/smoke/homepage.spec.ts --debug
```

```powershell
npx playwright test tests/functional/search.spec.ts --debug
```

```powershell
npx playwright test tests/functional/authentication.spec.ts --debug
```

Chạy có browser hiện ra nhưng không dừng từng bước:

```powershell
npx playwright test tests/smoke/homepage.spec.ts --headed
```

```powershell
npx playwright test tests/functional/search.spec.ts --headed
```

Kết hợp cả hai — browser hiện ra và chạy chậm để quan sát rõ từng action:

```powershell
npx playwright test tests/functional/search.spec.ts --headed --slow-mo=800
```

Danh sách file spec có trong project:

| File | Nhóm | Nội dung |
|---|---|---|
| `tests/smoke/homepage.spec.ts` | `@smoke` | Tải trang chủ, kiểm tra landmark |
| `tests/smoke/navigation.spec.ts` | `@smoke` | Click nav links, kiểm tra URL |
| `tests/functional/search.spec.ts` | `@functional` | Tìm kiếm, mở kết quả, no-result |
| `tests/functional/article.spec.ts` | `@functional` | Mở bài viết, đọc nội dung |
| `tests/functional/practice.spec.ts` | `@functional` | Trang practice problems |
| `tests/functional/courses.spec.ts` | `@functional` | Trang courses |
| `tests/functional/authentication.spec.ts` | `@functional` / `@account` | Form đăng nhập, đăng xuất, quên mật khẩu |

### 5.3. Debug một test case cụ thể

Truyền tên test (hoặc một phần tên) vào `--grep`.

`--debug` mở Playwright Inspector, dừng ngay dòng đầu tiên và cho phép chạy
từng bước bằng nút **Next Step** trên giao diện Inspector.
`--headed` chỉ hiện browser, chạy liên tục không dừng — phù hợp khi muốn quan
sát luồng mà không cần can thiệp.

```powershell
npx playwright test --grep "loads the public home page" --debug
```

```powershell
npx playwright test --grep "finds and opens relevant content" --debug
```

```powershell
npx playwright test --grep "finds and opens relevant content" --headed
```

```powershell
npx playwright test --grep "handles a search term with no expected match" --debug
```

```powershell
npx playwright test --grep "rejects malformed credentials" --debug
```

Kết hợp `--headed` và `--slow-mo` để quan sát chậm mà không cần Inspector:

```powershell
npx playwright test --grep "rejects malformed credentials" --headed --slow-mo=1000
```

### 5.4. UI Mode — debug trực quan toàn bộ hoặc từng phần

UI Mode mở giao diện đồ họa với timeline, DOM snapshot, network log và video.
Không cần `PWDEBUG`.

Mở toàn bộ suite trong UI Mode:

```powershell
npx playwright test --ui
```

Lọc sẵn theo file khi mở UI Mode:

```powershell
npx playwright test tests/functional/search.spec.ts --ui
```

Lọc sẵn theo nhóm khi mở UI Mode:

```powershell
npx playwright test --grep "@smoke" --ui
```

### 5.5. Xem trace sau khi test fail

Trace được bật tự động ở lần retry đầu tiên (`trace: 'on-first-retry'` trong
`playwright.config.ts`). Để bật trace cho mọi lần chạy:

```powershell
npx playwright test --trace on tests/functional/search.spec.ts
```

Mở trace viewer:

```powershell
npx playwright show-trace test-results/<thu-muc-test>/trace.zip
```

Thư mục `<thu-muc-test>` có dạng `<tên-file>-<tên-test>-chromium/`, ví dụ:
`search-spec-finds-and-opens-relevant-content-chromium/`.

## 6. Kết quả mong đợi

Một lượt chạy mặc định thành công có dạng:

```text
10 passed
3 skipped
```

Ba test bị skip là các luồng cần tài khoản hoặc email nhận OTP. Khi đã thiết lập
đủ biến môi trường, các test này sẽ được thực thi.

## 7. Xử lý lỗi thường gặp

### `node`, `npm` hoặc `npx` không được nhận diện

Đảm bảo thư mục cài Node.js có trong biến môi trường `PATH`, sau đó mở lại
PowerShell và kiểm tra:

```powershell
where.exe node
where.exe npm
```

### Browser executable không tồn tại

```powershell
npx playwright install chromium
```

### Test timeout hoặc locator thất bại

GeeksforGeeks là website production và DOM có thể thay đổi. Kiểm tra screenshot,
trace và accessibility tree; ưu tiên cập nhật locator trong Page Object thay vì
đặt CSS selector trực tiếp trong test.

### CAPTCHA hoặc rate limit

Không cố vượt CAPTCHA. Dừng test, ghi nhận đây là giới hạn môi trường và chạy
lại sau khi hết rate limit hoặc xác minh thủ công.

### Cách chạy test GFG-005

npx playwright test -g "GFG-005" --workers=1 --headed
