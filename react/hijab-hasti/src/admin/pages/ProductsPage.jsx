import { useEffect } from 'react';
import { initProducts } from '../inits/initProducts.js';

const HTML = "<div class=\"page-head\">\r\n        <div>\r\n          <nav class=\"breadcrumb\" aria-label=\"مسیر صفحه\">\r\n            <a href=\"/admin\">داشبورد</a>\r\n            <span aria-hidden=\"true\">/</span>\r\n            <span>محصولات</span>\r\n          </nav>\r\n          <h1 class=\"page-title\">محصولات</h1>\r\n          <p class=\"page-sub\">مدیریت کامل کاتالوگ محصولات، قیمت‌گذاری، موجودی تنوع‌ها و نمایش در صفحه اصلی.</p>\r\n        </div>\r\n        <div class=\"page-head__actions\">\r\n          <!-- تغییر نمای جدولی / کارتی -->\r\n          <div class=\"segment\" role=\"group\" aria-label=\"نوع نمایش\">\r\n            <button type=\"button\" id=\"viewTable\" aria-pressed=\"true\" aria-label=\"نمای جدولی\"></button>\r\n            <button type=\"button\" id=\"viewCards\" aria-pressed=\"false\" aria-label=\"نمای کارتی\"></button>\r\n          </div>\r\n          <button class=\"btn btn--ghost btn--sm\" id=\"importBtn\">درون‌ریزی CSV</button>\r\n          <a class=\"btn btn--gold\" href=\"/admin/products/new\">افزودن محصول</a>\r\n        </div>\r\n      </div>\r\n\r\n      <!-- خلاصه وضعیت کاتالوگ -->\r\n      <div class=\"grid grid--kpi mb-3\" id=\"summaryGrid\"></div>\r\n\r\n      <section class=\"card\">\r\n        <div id=\"productTable\"></div>\r\n        <div id=\"productCards\" hidden></div>\r\n      </section>";

export default function ProductsPage() {
  useEffect(() => {
    let alive = true;
    (async () => {
      
      if (!alive) return;
      await initProducts();
    })();
    return () => { alive = false; };
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: HTML }} />;
}
