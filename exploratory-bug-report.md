# GeeksforGeeks — Báo cáo Bug Exploratory

> Kết quả dò lỗi mở rộng trên https://www.geeksforgeeks.org/ (ngoài 4 bug GFG-001→004 và GFG-005 đã có).
> Mọi phát hiện dưới đây đều được **xác minh bằng Playwright probe trên site production**, không phải suy đoán.
> Ngày kiểm thử: 2026-06-17 · Môi trường: Chromium (Playwright), viewport mặc định 1280×720.

---

## Tổng quan

| Bug ID | Tên | Mức độ | Loại | Trạng thái |
|--------|-----|--------|------|-----------|
| GFG-006 | Lỗi JS `renderMathInElement is not defined` trên bài không có công thức | Thấp–Trung bình | JavaScript / Race condition | Đã xác minh |
| GFG-007 | ID trùng lặp trong DOM (`comp`, `script`) | Thấp | HTML hợp lệ (W3C) | Đã xác minh |
| GFG-008 | Ảnh thiếu thuộc tính `alt` | Thấp | Accessibility / SEO | Đã xác minh |

### Đã kiểm nhưng KHÔNG phải bug (loại false-positive)

- **`X-Frame-Options` thiếu** → KHÔNG phải lỗi: CSP đã có `frame-ancestors 'self'` thay thế (chống clickjacking đầy đủ).
- **Link nội bộ 404** → kiểm 25 link trên trang bài viết: 0 link hỏng.
- **`practiceapi` trả HTTP 403** trên `/explore` → do chưa đăng nhập (hành vi đúng), không phải bug.
- **Lỗi `ERR_NAME_NOT_RESOLVED`, CORS `api.rlcdn.com`, `400 nextmillmedia`** → script quảng cáo/tracker bên thứ ba, không thuộc code lõi GFG.

---

## GFG-006 · Lỗi JS `renderMathInElement is not defined`

### Mô tả bug
Trên các trang bài viết **không chứa công thức toán**, console ném ngoại lệ chưa bắt:

```
Uncaught ReferenceError: renderMathInElement is not defined
```

### Bằng chứng (đã reproduce)
| URL | JS error | Toán render (KaTeX) |
|-----|----------|---------------------|
| `/python/python-program-to-add-two-numbers/` | ❌ có lỗi | (không có toán) |
| `/dsa/binary-search/` | ❌ có lỗi | (không có toán) |
| `/maths/bayes-theorem/` | ✅ không lỗi | ✅ render đúng |

### Root cause (phân tích)
Trang gọi hàm `renderMathInElement()` của thư viện **KaTeX auto-render**, nhưng script auto-render **không được nạp** trên các bài không có toán (hoặc nạp không kịp). Trên bài có toán thì script nạp đúng nên không lỗi → đây là **race condition / thiếu guard tồn tại hàm**.

### Tác động
- Chưa thấy hỏng hiển thị trực tiếp (vì các bài lỗi vốn không có toán cần render).
- Nhưng là exception chưa bắt: làm bẩn console và **có nguy cơ chặn các đoạn JS chạy sau nó trong cùng block** → rủi ro ngầm.

### Hướng fix gợi ý
```javascript
// Guard trước khi gọi, hoặc chỉ gọi sau khi script auto-render đã load:
if (typeof renderMathInElement === 'function') {
  renderMathInElement(document.body, { /* options */ });
}
// Hoặc nạp KaTeX auto-render đồng bộ trước khi gọi.
```

### Test case verify (đề xuất)
```
GIVEN: Mở một bài viết không có công thức toán (vd /dsa/binary-search/)
WHEN:  Trang load xong và JS chạy
THEN:  Không có pageerror "renderMathInElement is not defined"
```

---

## GFG-007 · ID trùng lặp trong DOM

### Mô tả bug
Trên trang chủ và trang bài viết, một số `id` xuất hiện nhiều lần — vi phạm chuẩn HTML (id phải duy nhất).

### Bằng chứng (đã reproduce)
```
Trang chủ (/):           id="comp" ×2, id="script" ×2
Trang bài viết (article): id="comp" ×2, id="script" ×2
```

### Tác động
- `document.getElementById('comp')` / `querySelector('#comp')` **chỉ trả về phần tử đầu tiên** → nếu JS giả định id duy nhất, dễ thao tác sai phần tử (bug ngầm khó truy).
- Ảnh hưởng accessibility (label/aria trỏ theo id) và công cụ test/automation.

### Hướng fix gợi ý
Đảm bảo mỗi id render ra trang là duy nhất (thêm hậu tố/index khi render component lặp), hoặc đổi sang `class`/`data-*` nếu không cần định danh duy nhất.

### Test case verify (đề xuất)
```
GIVEN: Trang chủ hoặc trang bài viết
WHEN:  Quét toàn bộ phần tử có thuộc tính id
THEN:  Không có id nào xuất hiện > 1 lần
```

---

## GFG-008 · Ảnh thiếu thuộc tính `alt`

### Mô tả bug
Nhiều ảnh thiếu thuộc tính `alt`, ảnh hưởng screen reader và SEO ảnh.

### Bằng chứng (đã reproduce)
Số liệu thô (mọi `<img>` thiếu alt) so với số đã lọc (chỉ ảnh **nội dung do GFG sở hữu** — loại pixel tracking bên thứ ba, pixel 1×1, và `data:` placeholder lazy-load):

| Trang | Thiếu alt (thô) | Ảnh nội dung GFG thiếu alt (đã lọc) |
|-------|-----------------|--------------------------------------|
| `/courses` | 24 | **22** (icon 16×16 `_next/image` + SVG 48×48 `media.geeksforgeeks.org`) |
| `/explore` | 2 | **0** (cả 2 là tracking pixel `t.co`, `analytics.twitter.com`) |
| `/` (trang chủ) | 0 | 0 |

> Lưu ý: `media.geeksforgeeks.org` là CDN của GFG nên vẫn tính là ảnh do GFG sở hữu. `/explore` thực chất **sạch** — số "2" trong audit thô chỉ là pixel tracking GFG không kiểm soát.

### Tác động
- Screen reader không đọc được nội dung ảnh → rào cản accessibility (WCAG 1.1.1).
- Mất điểm SEO hình ảnh.

### Hướng fix gợi ý
Bổ sung `alt` mô tả cho ảnh nội dung; ảnh trang trí dùng `alt=""` (rỗng có chủ đích) để screen reader bỏ qua.

### Test case verify (đề xuất)
```
GIVEN: Trang /courses hoặc /explore
WHEN:  Quét các <img> là ảnh nội dung do GFG sở hữu (bỏ tracking pixel/data-URI/1×1)
THEN:  Mọi ảnh đó đều có thuộc tính alt (kể cả alt="")
```

### Trạng thái: ✅ ĐÃ IMPLEMENT regression test
- Helper: `expectContentImagesHaveAlt()` + `scrollThroughPage()` trong `tests/pages/base.page.ts`.
- Spec: nhóm `@bug GFG-008` trong `tests/functional/bug-regression.spec.ts` (2 test: `/courses`, `/explore`).
- Kết quả chạy thực tế: `/courses` **FAIL** (22 ảnh nội dung GFG thiếu alt — đúng chủ đích, document bug); `/explore` **PASS** (sạch). Test sẽ tự chuyển xanh khi GFG bổ sung `alt`.
- Chạy: `npx playwright test -g "GFG-008"`

---

## Phương pháp kiểm thử

- **Audit tĩnh:** `tests/bugs/exploratory-audit.spec.ts` — quét console error, ảnh hỏng, alt, id trùng, mixed content, meta, viewport trên 4 trang chính.
- **Probe xác minh:** script Playwright tạm thời (đã xóa sau khi xác minh) — reproduce từng nghi vấn nhiều lần, đối chiếu trang có/không có toán, crawl link kiểm 404, đọc HTTP security headers, kiểm CSP.
- Mọi phát hiện chỉ được đưa vào báo cáo sau khi reproduce ổn định và loại trừ nguyên nhân bên thứ ba.

---

*Báo cáo dành cho mục đích kiểm thử/giáo dục trên website công khai. Bước tiếp theo (tùy chọn): viết regression test cho GFG-006/007/008, và mở rộng kiểm bug empty-code (GFG-005) sang Java/C/Python compiler.*
