import { expect, test } from '../fixtures/pages.fixture';
import { testData } from '../fixtures/test-data';

/**
 * Kiểm thử hồi quy 4 bug mô tả trong bug-fix-implementation.md.
 * Mục tiêu: xác minh website production còn xuất hiện lỗi hay không.
 * Mỗi spec chỉ điều hướng và gọi hành vi nghiệp vụ từ Page Object.
 */

test.describe('@functional @bug GFG-001 sub-nav tràn ngang trên mobile 375px', () => {
  test.use({ viewport: testData.bugs.mobileViewport });

  test('trang chủ không có overflow ngang ở 375px', async ({ homePage }) => {
    await homePage.open();
    await homePage.expectNoLayoutOverflow();
  });

  test('link nav không bị cắt ký tự đầu ở 375px', async ({ homePage }) => {
    await homePage.open();
    await homePage.expectNavLinksNotClipped();
  });
});

test.describe('@functional @bug GFG-002 white flash / FOUC khi scroll', () => {
  test('trang bài viết có cơ chế chống flash trắng dark mode', async ({ articlePage }) => {
    const response = await articlePage.goto(testData.bugs.articlePath);
    await articlePage.expectSuccessfulResponse(response);
    await articlePage.expectDarkModeFlashGuard();
  });

  test('trang bài viết dùng passive scroll listener', async ({ articlePage }) => {
    const response = await articlePage.goto(testData.bugs.articlePath);
    await articlePage.expectSuccessfulResponse(response);
    await articlePage.expectPassiveScrollListeners();
  });
});

test.describe('@functional @bug GFG-003 URL slug cũ không được trả về 404', () => {
  for (const legacyUrl of testData.bugs.legacyUrls) {
    test(`${legacyUrl} resolve không 404`, async ({ homePage }) => {
      const result = await homePage.expectLegacyUrlResolves(legacyUrl);
      expect(
        result.finalStatus,
        `${legacyUrl} phải serve 200 hoặc redirect, nhận HTTP ${result.finalStatus}`,
      ).toBeLessThan(400);
    });
  }
});

test.describe('@functional @bug GFG-004 khoảng trắng lớn cuối bài viết', () => {
  test('khoảng cách giữa article tags và footer trong ngưỡng cho phép', async ({ articlePage }) => {
    const response = await articlePage.goto(testData.bugs.articlePath);
    await articlePage.expectSuccessfulResponse(response);
    await articlePage.scrollToBottom();
    await articlePage.expectNoBottomWhitespace(testData.bugs.bottomWhitespaceThreshold);
  });

  test('không còn ad placeholder rỗng ở cuối bài viết', async ({ articlePage }) => {
    const response = await articlePage.goto(testData.bugs.articlePath);
    await articlePage.expectSuccessfulResponse(response);
    await articlePage.scrollToBottom();
    await articlePage.expectNoEmptyAdPlaceholders();
  });
});

test.describe('@functional @bug GFG-005 IDE C++ báo lỗi linker thô khi code rỗng', () => {
  // Login + cold-start biên dịch có thể lâu hơn timeout mặc định 45s.
  // mode: 'serial' để hai test không đăng nhập cùng tài khoản đồng thời
  // (tránh xung đột session / rate-limit); test sau bị skip nếu sanity fail.
  test.describe.configure({ mode: 'serial', timeout: 90_000 });

  // Bấm Run trên IDE yêu cầu đăng nhập (anonymous sẽ bị bật modal Log in),
  // nên cần credentials. Thiếu credentials thì skip thay vì fail.
  const email = process.env.GFG_TEST_EMAIL;
  const password = process.env.GFG_TEST_PASSWORD;
  test.skip(
    !email || !password,
    'Cần GFG_TEST_EMAIL/GFG_TEST_PASSWORD để chạy code trên IDE (Run yêu cầu đăng nhập)',
  );

  test.beforeEach(async ({ authPage }) => {
    await authPage.openLogin();
    await authPage.submitLogin(email!, password!);
    await authPage.expectLoggedIn();
  });

  test('chạy code hợp lệ vẫn cho output đúng (sanity)', async ({ idePage }) => {
    await idePage.open();
    await idePage.expectRunsCode(
      testData.bugs.ide.cppHelloWorld,
      testData.bugs.ide.expectedHelloOutput,
    );
  });

  test('code rỗng phải báo lỗi thân thiện, không rò rỉ lỗi linker nội bộ', async ({ idePage }) => {
    await idePage.open();
    await idePage.expectEmptyCodeHandledGracefully();
  });
});

test.describe('@functional @bug GFG-008 ảnh nội dung thiếu thuộc tính alt', () => {
  test('trang /courses: mọi ảnh nội dung GFG đều có alt', async ({ coursesPage }) => {
    await coursesPage.open();
    await coursesPage.scrollThroughPage();
    await coursesPage.expectContentImagesHaveAlt();
  });

  test('trang /explore: mọi ảnh nội dung GFG đều có alt', async ({ practicePage }) => {
    await practicePage.open();
    await practicePage.scrollThroughPage();
    await practicePage.expectContentImagesHaveAlt();
  });
});
