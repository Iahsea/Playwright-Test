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

### CAPTCHA hoặc rate limit / Bị Ban IP bởi Cloudflare

Khi test trên môi trường Production như GeeksforGeeks, Cloudflare có thể phát hiện hành vi tự động và chặn truy cập hoặc ban IP của bạn.

**Các biện pháp phòng tránh đã được thiết lập:**
- Đã cấu hình `workers: 1` ở môi trường local trong `playwright.config.ts` để các test chạy tuần tự, giảm lưu lượng gửi dồn dập từ cùng một IP.
- Đã thêm `slowMo: 500` vào tùy chọn khởi chạy (launch options) để tạo độ trễ 500ms giữa các thao tác (click, gõ phím...), làm cho hành vi giống người dùng thật hơn.
- Cấu hình User-Agent giả lập trình duyệt Chrome Desktop thông thường để tránh chữ ký bot mặc định.

**Giải pháp khắc phục khi bị ban IP:**
1. **Không cố chạy lại liên tục:** Việc cố tình chạy lại suite test khi đang bị chặn sẽ làm tăng thời gian khóa IP của bạn.
2. **Thay đổi IP:**
   - Kết nối máy tính với một mạng Wi-Fi khác hoặc sử dụng **Hotspot 4G/5G** từ điện thoại di động (đây là cách nhanh nhất và hiệu quả nhất vì mạng di động thường được cấp IP mới và ít bị Cloudflare nghi ngờ hơn).
   - Sử dụng một dịch vụ **VPN** đáng tin cậy và chuyển sang server quốc tế khác.
3. **Phát triển test thông minh:** Khi viết và gỡ lỗi (debug) test, tuyệt đối không chạy toàn bộ suite test. Hãy chỉ chạy duy nhất file test hoặc test case bạn đang làm việc:
   ```powershell
   npx playwright test tests/smoke/homepage.spec.ts
   ```
4. **Xác minh thủ công:** Coi việc CAPTCHA chặn là một giới hạn môi trường không thể vượt qua bằng auto test, hãy ghi nhận kết quả và bỏ qua/xác minh thủ công phần đó.
