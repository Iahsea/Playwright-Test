# GeeksforGeeks — Bug Fix Implementation Plan

> Tài liệu này mô tả chi tiết cách implement fix cho 4 bug được xác nhận qua kiểm thử thủ công trực tiếp trên https://www.geeksforgeeks.org/

---

## Tổng quan

| Bug ID | Tên | Mức độ | Loại | Ưu tiên fix |
|--------|-----|--------|------|-------------|
| GFG-001 | Sub-nav tràn ngang trên mobile | HIGH | CSS / Responsive | Sprint 1 |
| GFG-002 | White flash khi scroll | HIGH | Render / Performance | Sprint 1 |
| GFG-003 | URL cũ trả về 404 không redirect | MEDIUM | Routing / SEO | Sprint 2 |
| GFG-004 | Khoảng trắng lớn cuối bài viết | LOW | Layout / Ad | Sprint 2 |

---

## GFG-001 · Sub-nav bị tràn ngang trên màn hình 375px

### Mô tả bug
Thanh điều hướng phụ (sub-nav chứa các link như "Practice Problems", "C", "C++", "Java"…) không responsive trên viewport nhỏ. Ở 375px, menu bị overflow ra ngoài container và mục đầu tiên bị cắt mất ký tự đầu ("Practice Problems" chỉ hiện "ractice Problems").

### Root cause
CSS không set `overflow-x: auto` hoặc không có breakpoint ẩn các item dư thừa. Không có cơ chế fallback (hamburger / dropdown) cho mobile.

### Cách implement fix

**Giải pháp A — Scroll ngang (nhanh, ít rủi ro):**

```css
/* File: navbar.css hoặc global.css */

.sub-nav {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch; /* smooth scroll trên iOS */
  scrollbar-width: none;             /* ẩn scrollbar trên Firefox */
  gap: 0;
}

.sub-nav::-webkit-scrollbar {
  display: none; /* ẩn scrollbar trên Chrome/Safari */
}

.sub-nav a {
  white-space: nowrap;    /* ngăn text bị wrap xuống dòng */
  flex-shrink: 0;         /* ngăn item bị thu nhỏ */
  padding: 8px 12px;
}
```

**Giải pháp B — Ẩn bớt item ở mobile, thêm nút "More" (UX tốt hơn):**

```css
/* Ẩn các item không ưu tiên ở mobile */
@media (max-width: 480px) {
  .sub-nav .nav-item:nth-child(n+6) {
    display: none;
  }
  .sub-nav .nav-item--more {
    display: flex; /* hiện nút "More ▾" */
  }
}
```

```javascript
// File: sub-nav.js
// Toggle dropdown "More" chứa các item bị ẩn
const moreBtn = document.querySelector('.nav-item--more');
const moreDropdown = document.querySelector('.sub-nav__dropdown');

moreBtn?.addEventListener('click', () => {
  moreDropdown.toggleAttribute('hidden');
});
```

**Khuyến nghị:** Dùng Giải pháp A trước để hotfix nhanh, sau đó nâng lên Giải pháp B trong sprint tiếp theo.

### Test case để verify

```
GIVEN: Viewport width = 375px
WHEN:  Người dùng mở trang chủ hoặc bất kỳ trang bài viết nào
THEN:  Sub-nav hiển thị đủ text "Practice Problems" (không bị cắt)
 AND:  Người dùng có thể scroll ngang để thấy các mục còn lại
 AND:  Không có overflow làm vỡ layout tổng thể
```

### File cần sửa
- `src/components/Navbar/SubNav.css` (hoặc tương đương)
- `src/components/Navbar/SubNav.jsx`

---

## GFG-002 · Màn hình flash trắng toàn bộ khi scroll

### Mô tả bug
Khi scroll nhanh trên các trang bài viết, toàn bộ màn hình render thành màu trắng trong khoảng 1 frame (khoảng 16ms) trước khi nội dung hiển thị lại. Tái hiện nhất quán, xảy ra cả khi scroll lên và scroll xuống.

### Root cause (các nguyên nhân có thể)

1. **Background mismatch:** Body/root element có `background-color: white` trong khi dark mode được apply muộn hơn qua JavaScript, gây ra FOUC (Flash of Unstyled Content).
2. **Lazy-loaded ads:** Quảng cáo dạng sticky/fixed dùng `position: fixed` làm trigger repaint toàn trang khi scroll.
3. **Scroll event handler nặng:** JS chạy sync trên main thread trong scroll event, block paint.

### Cách implement fix

**Fix 1 — Ngăn FOUC bằng CSS-first dark mode:**

```css
/* File: globals.css — đặt TRƯỚC mọi style khác */

:root {
  color-scheme: light dark;
}

/* Set background ngay lập tức theo prefers-color-scheme,
   không cần chờ JS */
@media (prefers-color-scheme: dark) {
  html {
    background-color: #1a1a1a; /* màu nền dark mode của GFG */
  }
}

html {
  background-color: #ffffff;
}
```

```html
<!-- Thêm vào <head>, TRƯỚC mọi stylesheet,
     để detect dark mode preference sớm nhất có thể -->
<script>
  (function() {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'dark' || (!saved && prefersDark)) {
      document.documentElement.setAttribute('data-theme', 'dark');
      // Set background ngay để tránh white flash
      document.documentElement.style.backgroundColor = '#1a1a1a';
    }
  })();
</script>
```

**Fix 2 — Tối ưu scroll performance:**

```javascript
// File: scroll-handler.js

// TRƯỚC (gây jank):
window.addEventListener('scroll', () => {
  // logic nặng chạy mỗi scroll event
  updateStickyNav();
  loadMoreAds();
});

// SAU (dùng passive listener + requestAnimationFrame):
let ticking = false;

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      updateStickyNav();
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true }); // passive: true rất quan trọng cho performance
```

**Fix 3 — Ngăn quảng cáo gây repaint:**

```css
/* Wrap quảng cáo trong container có will-change
   để tách layer composite, tránh repaint toàn trang */
.ad-container {
  will-change: transform;
  transform: translateZ(0); /* tạo GPU layer riêng */
  contain: layout style paint; /* isolate rendering */
}
```

### Test case để verify

```
GIVEN: Trang bài viết bất kỳ đang ở dark mode
WHEN:  Người dùng scroll nhanh (kéo scroll bar hoặc dùng chuột)
THEN:  Không có frame nào hiển thị màu trắng
 AND:  Scroll mượt, không giật
 AND:  FPS không drop dưới 55fps (đo bằng Chrome DevTools > Performance)
```

### File cần sửa
- `src/styles/globals.css`
- `public/index.html` (thêm inline script vào `<head>`)
- `src/hooks/useScrollHandler.js` (hoặc tương đương)
- `src/components/Ad/AdContainer.css`

---

## GFG-003 · URL cũ trả về 404 thay vì redirect

### Mô tả bug
Các URL theo slug cũ (ví dụ `/python-hello-world-program/`, `/variables-in-python/`, `/print-hello-world-in-python/`) trả về HTTP 404. Đây là các trang đã được Google index, được chia sẻ rộng rãi, và hiện đang gây mất traffic lớn.

### Root cause
GFG đã tái cấu trúc URL sang định dạng mới (ví dụ `/python/python-program-to-add-two-numbers/`) nhưng không thiết lập redirect 301 từ URL cũ.

### Cách implement fix

**Giải pháp A — Redirect map tĩnh (phù hợp nếu số lượng URL ít):**

```javascript
// File: src/config/redirects.js

const REDIRECTS = [
  {
    from: '/python-hello-world-program/',
    to: '/python/python-program-to-add-two-numbers/',
    statusCode: 301,
  },
  {
    from: '/variables-in-python/',
    to: '/python/python-variables/',
    statusCode: 301,
  },
  {
    from: '/print-hello-world-in-python/',
    to: '/python/python-output-using-print-function/',
    statusCode: 301,
  },
  // ... thêm các URL khác vào đây
];

export default REDIRECTS;
```

```javascript
// File: next.config.js (nếu dùng Next.js)
const REDIRECTS = require('./src/config/redirects');

module.exports = {
  async redirects() {
    return REDIRECTS.map(({ from, to, statusCode }) => ({
      source: from,
      destination: to,
      permanent: statusCode === 301,
    }));
  },
};
```

**Giải pháp B — Redirect động theo pattern (phù hợp nếu số lượng lớn):**

```javascript
// File: middleware.js (Next.js middleware hoặc Express middleware)
// Logic: nếu URL không tìm thấy, thử tìm slug tương ứng trong DB

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Chỉ xử lý các URL không có prefix language/category
  if (!pathname.startsWith('/python/') &&
      !pathname.startsWith('/javascript/') &&
      !pathname.startsWith('/dsa/')) {

    const slug = pathname.replace(/^\/|\/$/g, ''); // bỏ dấu /

    // Tra cứu slug trong bảng URL mapping
    const newPath = await lookupLegacySlug(slug);

    if (newPath) {
      return Response.redirect(new URL(newPath, request.url), 301);
    }
  }
}

// Hàm tra cứu — có thể dùng cache (Redis) để tăng tốc
async function lookupLegacySlug(slug) {
  // Gọi API nội bộ hoặc truy vấn DB
  const result = await fetch(`/api/internal/slug-lookup?slug=${slug}`);
  if (result.ok) {
    const { redirectTo } = await result.json();
    return redirectTo || null;
  }
  return null;
}
```

**Giải pháp C — Config server (Nginx) nếu không muốn sửa app code:**

```nginx
# File: nginx.conf hoặc redirect.conf

# Redirect các URL Python cũ
rewrite ^/python-hello-world-program/?$
        /python/python-program-to-add-two-numbers/ permanent;

rewrite ^/variables-in-python/?$
        /python/python-variables/ permanent;

# Pattern tổng quát hơn — redirect tất cả slug cũ không có category prefix
# (chỉ dùng nếu đã có mapping đầy đủ)
location ~* "^/([a-z0-9-]+)/?$" {
  if ($legacy_map_$1) {
    return 301 $legacy_map_$1;
  }
}
```

**Khuyến nghị:** Dùng Giải pháp A ngay cho các trang top traffic, đồng thời chạy script crawl để phát hiện toàn bộ URL cũ còn 404:

```bash
# Script kiểm tra hàng loạt URL từ Google Search Console export
while IFS= read -r url; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  if [ "$status" = "404" ]; then
    echo "404: $url"
  fi
done < urls_from_gsc.txt > broken_urls.txt
```

### Test case để verify

```
GIVEN: URL cũ /python-hello-world-program/ đã được map trong redirect config
WHEN:  Người dùng hoặc bot truy cập URL đó
THEN:  Server trả về HTTP 301 (không phải 302)
 AND:  Header "Location" trỏ đúng đến URL mới
 AND:  Trình duyệt tự động redirect đến trang đích
 AND:  Trang đích load thành công với HTTP 200
```

### File cần sửa
- `next.config.js` hoặc `nginx.conf` (tùy stack)
- `src/config/redirects.js` (tạo mới)
- `src/middleware.js` (nếu dùng dynamic lookup)

---

## GFG-004 · Khoảng trắng lớn (~300px) cuối bài viết

### Mô tả bug
Sau phần "Article Tags" ở cuối mỗi bài viết, xuất hiện khoảng trắng lớn (~300px) không có nội dung trước khi footer render. Khả năng cao là do một ad slot hoặc widget placeholder không load được nhưng vẫn giữ nguyên chiều cao.

### Root cause (các khả năng)

1. Ad container có `min-height` hoặc `height` cố định, không co lại khi ad không load.
2. Widget (newsletter, related articles) render skeleton nhưng JS bị lỗi, không replace skeleton.
3. SSR/hydration mismatch khiến một component render phía client với empty content nhưng vẫn có chiều cao.

### Cách implement fix

**Fix 1 — Xóa height cố định trên ad container:**

```css
/* File: article.css hoặc ad.css */

/* TRƯỚC (gây khoảng trắng): */
.article-bottom-ad {
  min-height: 280px;
  height: 300px;
}

/* SAU: chỉ set min-height khi ad đã load xong */
.article-bottom-ad {
  min-height: 0;
  transition: min-height 0.2s ease;
}

.article-bottom-ad.is-loaded {
  min-height: 280px;
}
```

```javascript
// File: ad-loader.js
// Thêm class 'is-loaded' sau khi ad thực sự render

const adSlot = document.querySelector('.article-bottom-ad');

// Sử dụng IntersectionObserver để lazy load + kiểm tra
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      loadAd(adSlot).then((success) => {
        if (success) {
          adSlot.classList.add('is-loaded');
        } else {
          // Ad không load được — xóa hoàn toàn placeholder
          adSlot.remove();
        }
      });
      observer.disconnect();
    }
  });
}, { rootMargin: '200px' });

observer.observe(adSlot);
```

**Fix 2 — Cleanup skeleton/placeholder khi component rỗng:**

```jsx
// File: ArticleBottomWidget.jsx

function ArticleBottomWidget({ data }) {
  // Nếu không có data, không render gì cả
  // Tránh render container rỗng vẫn có height
  if (!data || data.items?.length === 0) {
    return null; // KHÔNG trả về <div className="widget-container" />
  }

  return (
    <div className="widget-container">
      {data.items.map(item => (
        <RelatedArticleCard key={item.id} {...item} />
      ))}
    </div>
  );
}
```

**Fix 3 — Dùng CSS Grid để layout tự co lại:**

```css
/* Container bài viết dùng grid thay vì block
   để các child tự động co vào nếu content rỗng */
.article-content {
  display: grid;
  grid-template-rows: auto; /* rows tự co theo content */
}

/* Xóa margin-bottom dư thừa ở element cuối cùng */
.article-content > *:last-child {
  margin-bottom: 0;
}
```

### Test case để verify

```
GIVEN: Một trang bài viết bất kỳ (ví dụ /python/python-program-to-add-two-numbers/)
WHEN:  Người dùng scroll xuống cuối bài (sau "Article Tags")
THEN:  Khoảng cách từ "Article Tags" đến footer không vượt quá 48px
 AND:  Nếu ad không load, container ad bị ẩn hoàn toàn (height = 0)
 AND:  Không có element rỗng nào có height > 0 trong DOM
```

### File cần sửa
- `src/components/Article/ArticleBottomAd.css`
- `src/components/Article/ArticleBottomWidget.jsx`
- `src/utils/ad-loader.js`

---

## Quy trình triển khai đề xuất

### Sprint 1 — Hotfix (ưu tiên HIGH)

```
Week 1:
├── GFG-002: Thêm inline script dark mode vào <head>        (0.5 ngày)
├── GFG-002: Thêm { passive: true } vào scroll listeners   (0.5 ngày)
├── GFG-001: Apply CSS overflow-x: auto cho sub-nav        (0.5 ngày)
└── QA: Verify trên Chrome/Safari/Firefox, mobile 375px    (1 ngày)
```

### Sprint 2 — Improvement (MEDIUM + LOW)

```
Week 2:
├── GFG-003: Tạo redirects.js, map top 50 URL 404          (1 ngày)
├── GFG-003: Deploy và verify 301 headers                   (0.5 ngày)
├── GFG-004: Fix ad container height, cleanup empty widget  (1 ngày)
└── QA: Regression test toàn bộ 4 bug                      (1 ngày)
```

### Sprint 3 — Long-term (cải tiến bền vững)

```
Week 3-4:
├── GFG-001: Implement giải pháp B (hamburger/More button)  (2 ngày)
├── GFG-003: Script tự động phát hiện URL 404 mới          (1 ngày)
└── GFG-002: Lighthouse audit, target Performance ≥ 85     (1 ngày)
```

---

## Checklist verify sau khi deploy

- [ ] GFG-001: Sub-nav hiển thị đủ "Practice Problems" ở 375px
- [ ] GFG-001: Không có overflow làm vỡ layout tổng thể
- [ ] GFG-002: Không còn white flash khi scroll trên dark mode
- [ ] GFG-002: Lighthouse Performance score không giảm so với baseline
- [ ] GFG-003: Tất cả URL trong `redirects.js` trả về 301
- [ ] GFG-003: Trang đích của redirect trả về 200
- [ ] GFG-004: Không có khoảng trắng > 48px ở cuối bài viết
- [ ] GFG-004: Khi ad không load, không còn placeholder rỗng
- [ ] Regression: Tất cả test case PASS trên Chrome, Safari, Firefox
- [ ] Regression: Mobile 375px, 390px, 414px đều hiển thị đúng

---

*Tài liệu được tạo dựa trên kết quả kiểm thử thủ công ngày 15/06/2026*
*Kiểm thử thực hiện trên: Windows, Chrome, viewport 1400px và 375px*