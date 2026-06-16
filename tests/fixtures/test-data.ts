export const testData = {
  searchTerm: 'binary search',
  articleTitle: /binary search/i,
  missingSearchTerm: `no-result-${Date.now()}-gfg`,
  practiceTerm: 'Two Sum',
  bugs: {
    // Bài viết dùng để kiểm tra GFG-002 (FOUC) và GFG-004 (khoảng trắng cuối bài).
    articlePath: '/python/python-program-to-add-two-numbers/',
    // URL slug cũ dùng để kiểm tra GFG-003 (không được trả về 404).
    legacyUrls: [
      '/python-hello-world-program/',
      '/variables-in-python/',
      '/print-hello-world-in-python/',
    ],
    // Viewport mobile dùng để kiểm tra GFG-001 (sub-nav tràn ngang).
    mobileViewport: { width: 375, height: 812 },
    // Ngưỡng khoảng trắng tối đa cho phép ở cuối bài viết (GFG-004).
    bottomWhitespaceThreshold: 48,
    // GFG-005 — Online C++ compiler: đoạn code hợp lệ và output mong đợi,
    // dùng để sanity check trước khi kiểm tra hành vi với code rỗng.
    ide: {
      cppPath: '/ide/online-cpp-compiler',
      cppHelloWorld: [
        '#include <iostream>',
        'using namespace std;',
        'int main() {',
        '    cout << "Hello Geek!";',
        '    return 0;',
        '}',
      ].join('\n'),
      expectedHelloOutput: /Hello Geek!/,
    },
  },
};

