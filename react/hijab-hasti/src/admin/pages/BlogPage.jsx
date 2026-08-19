import { useEffect } from 'react';
import { initBlog } from '../inits/initBlog.js';

const HTML = "<div class=\"page-head\">\r\n        <div>\r\n          <nav class=\"breadcrumb\" aria-label=\"مسیر صفحه\">\r\n            <a href=\"/admin\">داشبورد</a>\r\n            <span aria-hidden=\"true\">/</span>\r\n            <span>بلاگ</span>\r\n          </nav>\r\n          <h1 class=\"page-title\">بلاگ</h1>\r\n          <p class=\"page-sub\">\r\n            مقالات آموزشی و راهنمای خرید — موتور اصلی سئوی محتوایی فروشگاه هستی.\r\n          </p>\r\n        </div>\r\n        <div class=\"page-head__actions\">\r\n          <button class=\"btn btn--ghost btn--sm\" type=\"button\" id=\"addCategoryBtn\">افزودن دسته مقاله</button>\r\n          <a class=\"btn btn--gold\" href=\"/admin/blog/new\">نوشتن مقاله</a>\r\n        </div>\r\n      </div>\r\n\r\n      <div class=\"grid grid--kpi mb-3\" id=\"blogKpis\"></div>\r\n\r\n      <div class=\"grid grid--main\">\r\n        <section class=\"card\">\r\n          <div id=\"postTable\"></div>\r\n        </section>\r\n\r\n        <div class=\"stack\">\r\n          <section class=\"card\">\r\n            <div class=\"card__head\">\r\n              <h2 class=\"card__title\">دسته‌بندی مقالات</h2>\r\n            </div>\r\n            <div class=\"card__body\" id=\"categoryList\"></div>\r\n          </section>\r\n\r\n          <section class=\"card\">\r\n            <div class=\"card__head\">\r\n              <h2 class=\"card__title\">پربازدیدترین مقالات</h2>\r\n            </div>\r\n            <div class=\"rank-list\" id=\"topPosts\"></div>\r\n          </section>\r\n        </div>\r\n      </div>";

export default function BlogPage() {
  useEffect(() => {
    let alive = true;
    (async () => {
      
      if (!alive) return;
      await initBlog();
    })();
    return () => { alive = false; };
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: HTML }} />;
}
