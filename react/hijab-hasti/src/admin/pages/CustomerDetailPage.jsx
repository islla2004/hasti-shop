import { useEffect } from 'react';
import { initCustomerDetail } from '../inits/initCustomerDetail.js';

const HTML = "<div class=\"page-head\">\r\n        <div>\r\n          <nav class=\"breadcrumb\" aria-label=\"مسیر صفحه\">\r\n            <a href=\"/admin\">داشبورد</a>\r\n            <span aria-hidden=\"true\">/</span>\r\n            <a href=\"/admin/customers\">مشتریان</a>\r\n            <span aria-hidden=\"true\">/</span>\r\n            <span id=\"crumbName\">…</span>\r\n          </nav>\r\n          <h1 class=\"page-title\" id=\"customerName\">پرونده مشتری</h1>\r\n          <p class=\"page-sub\" id=\"customerSub\">در حال بارگذاری…</p>\r\n        </div>\r\n        <div class=\"page-head__actions\" id=\"headActions\"></div>\r\n      </div>\r\n\r\n      <div class=\"grid grid--kpi mb-3\" id=\"customerKpis\"></div>\r\n\r\n      <div class=\"grid grid--form\">\r\n        <div class=\"stack\">\r\n\r\n          <section class=\"card\">\r\n            <div class=\"card__head\">\r\n              <h2 class=\"card__title\">سابقه سفارش‌ها</h2>\r\n              <span class=\"text-sm text-muted\" id=\"orderCountLabel\"></span>\r\n            </div>\r\n            <div id=\"orderList\"></div>\r\n          </section>\r\n\r\n          <section class=\"card\">\r\n            <div class=\"card__head\">\r\n              <h2 class=\"card__title\">وضعیت پرداخت‌های باز</h2>\r\n              <p class=\"card__sub\">اقساط و مراحل پرداخت‌نشده این مشتری</p>\r\n            </div>\r\n            <div id=\"openPayments\"></div>\r\n          </section>\r\n\r\n          <section class=\"card\">\r\n            <div class=\"card__head\">\r\n              <h2 class=\"card__title\">علاقه‌مندی‌ها</h2>\r\n              <p class=\"card__sub\">محصولاتی که مشتری ذخیره کرده — فرصت مناسب برای پیشنهاد هدفمند</p>\r\n            </div>\r\n            <div class=\"card__body\" id=\"wishlistBox\"></div>\r\n          </section>\r\n\r\n        </div>\r\n\r\n        <div class=\"stack\">\r\n\r\n          <section class=\"card\">\r\n            <div class=\"card__head\">\r\n              <h2 class=\"card__title\">اطلاعات تماس</h2>\r\n            </div>\r\n            <div class=\"card__body\" id=\"contactBox\"></div>\r\n          </section>\r\n\r\n          <section class=\"card\">\r\n            <div class=\"card__head\">\r\n              <h2 class=\"card__title\">باشگاه وفاداری</h2>\r\n            </div>\r\n            <div class=\"card__body\" id=\"loyaltyBox\"></div>\r\n          </section>\r\n\r\n          <section class=\"card\">\r\n            <div class=\"card__head\">\r\n              <h2 class=\"card__title\">برچسب‌ها و یادداشت</h2>\r\n            </div>\r\n            <div class=\"card__body\">\r\n              <div class=\"chips mb-2\" id=\"tagChips\"></div>\r\n              <div class=\"field\">\r\n                <label class=\"label\" for=\"customerNote\">یادداشت داخلی</label>\r\n                <textarea class=\"textarea\" id=\"customerNote\" rows=\"3\"\r\n                  placeholder=\"مثال: ترجیح می‌دهد ارسال روزهای زوج انجام شود.\"></textarea>\r\n              </div>\r\n              <button class=\"btn btn--primary btn--sm mt-1\" type=\"button\" id=\"saveNote\">ذخیره</button>\r\n            </div>\r\n          </section>\r\n\r\n        </div>\r\n      </div>";

export default function CustomerDetailPage() {
  useEffect(() => {
    let alive = true;
    (async () => {
      
      if (!alive) return;
      await initCustomerDetail();
    })();
    return () => { alive = false; };
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: HTML }} />;
}
