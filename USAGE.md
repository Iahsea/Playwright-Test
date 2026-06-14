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

Chạy debug mode:

```powershell
$env:PWDEBUG = "1"
npx playwright test search.spec.ts
```

Mở trace:

```powershell
npx playwright show-trace test-results/<thu-muc-test>/trace.zip
```

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
