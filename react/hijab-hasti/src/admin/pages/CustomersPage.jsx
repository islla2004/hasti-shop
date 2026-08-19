import { useEffect } from 'react';
import { initCustomers } from '../inits/initCustomers.js';

const HTML = "<div class=\"page-head\">\r\n        <div>\r\n          <nav class=\"breadcrumb\" aria-label=\"مسیر صفحه\">\r\n            <a href=\"/admin\">داشبورد</a>\r\n            <span aria-hidden=\"true\">/</span>\r\n            <span>مشتریان</span>\r\n          </nav>\r\n          <h1 class=\"page-title\">مشتریان</h1>\r\n          <p class=\"page-sub\">\r\n            پرونده کامل مشتریان، سطح باشگاه وفاداری، سابقه خرید و ارتباط سریع از طریق واتساپ.\r\n          </p>\r\n        </div>\r\n        <div class=\"page-head__actions\">\r\n          <button class=\"btn btn--ghost btn--sm\" type=\"button\" id=\"exportBtn\">برون‌بری CSV</button>\r\n          <button class=\"btn btn--gold btn--sm\" type=\"button\" id=\"segmentBtn\">ساخت لیست بازاریابی</button>\r\n        </div>\r\n      </div>\r\n\r\n      <div class=\"grid grid--kpi mb-3\" id=\"customerKpis\"></div>\r\n\r\n      <div class=\"grid grid--main\">\r\n        <section class=\"card\">\r\n          <div id=\"customerTable\"></div>\r\n        </section>\r\n\r\n        <section class=\"card\">\r\n          <div class=\"card__head\">\r\n            <h2 class=\"card__title\">مشتریان برتر</h2>\r\n            <span class=\"badge badge--gold\">بر اساس مبلغ خرید</span>\r\n          </div>\r\n          <div class=\"rank-list\" id=\"topCustomers\"></div>\r\n        </section>\r\n      </div>";

export default function CustomersPage() {
  useEffect(() => {
    let alive = true;
    (async () => {
      
      if (!alive) return;
      await initCustomers();
    })();
    return () => { alive = false; };
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: HTML }} />;
}
