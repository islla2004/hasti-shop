import { useEffect } from 'react';
import { initCategories } from '../inits/initCategories.js';

const HTML = "<div class=\"page-head\">\r\n        <div>\r\n          <nav class=\"breadcrumb\" aria-label=\"مسیر صفحه\">\r\n            <a href=\"/admin\">داشبورد</a>\r\n            <span aria-hidden=\"true\">/</span>\r\n            <span>دسته‌بندی و کالکشن</span>\r\n          </nav>\r\n          <h1 class=\"page-title\">دسته‌بندی و کالکشن</h1>\r\n          <p class=\"page-sub\">\r\n            فروشگاه هستی دو محور سازمان‌دهی مستقل دارد: <b>دسته‌بندی</b> (ستون اول مگامنو) و\r\n            <b>کالکشن</b> (ستون دوم، برای کمپین‌های فصلی و مناسبتی).\r\n          </p>\r\n        </div>\r\n        <div class=\"page-head__actions\">\r\n          <button class=\"btn btn--gold\" type=\"button\" id=\"addBtn\">افزودن مورد جدید</button>\r\n        </div>\r\n      </div>\r\n\r\n      <div class=\"tabs mb-3\" role=\"tablist\" aria-label=\"بخش‌های تاکسونومی\">\r\n        <button class=\"tab tab--active\" role=\"tab\" aria-selected=\"true\" data-tab=\"categories\">\r\n          دسته‌بندی محصول <span class=\"tab__count\" id=\"countCategories\">۰</span>\r\n        </button>\r\n        <button class=\"tab\" role=\"tab\" aria-selected=\"false\" data-tab=\"collections\">\r\n          کالکشن‌ها <span class=\"tab__count\" id=\"countCollections\">۰</span>\r\n        </button>\r\n        <button class=\"tab\" role=\"tab\" aria-selected=\"false\" data-tab=\"fabrics\">\r\n          جنس پارچه <span class=\"tab__count\" id=\"countFabrics\">۰</span>\r\n        </button>\r\n      </div>\r\n\r\n      <!-- ========================= دسته‌بندی محصول ========================= -->\r\n      <section class=\"tab-panel tab-panel--active\" data-panel=\"categories\">\r\n        <div class=\"notice notice--info mb-2\" id=\"categoryNotice\"></div>\r\n        <div class=\"grid grid--3\" id=\"categoryGrid\"></div>\r\n      </section>\r\n\r\n      <!-- ============================ کالکشن‌ها =========================== -->\r\n      <section class=\"tab-panel\" data-panel=\"collections\">\r\n        <div class=\"notice notice--gold mb-2\" id=\"collectionNotice\"></div>\r\n        <div class=\"card\">\r\n          <div id=\"collectionTable\"></div>\r\n        </div>\r\n      </section>\r\n\r\n      <!-- =========================== جنس پارچه =========================== -->\r\n      <section class=\"tab-panel\" data-panel=\"fabrics\">\r\n        <div class=\"notice notice--info mb-2\" id=\"fabricNotice\"></div>\r\n        <div class=\"card\">\r\n          <div class=\"card__body\">\r\n            <div class=\"chips\" id=\"fabricChips\"></div>\r\n          </div>\r\n        </div>\r\n      </section>";

export default function CategoriesPage() {
  useEffect(() => {
    let alive = true;
    (async () => {
      
      if (!alive) return;
      await initCategories();
    })();
    return () => { alive = false; };
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: HTML }} />;
}
