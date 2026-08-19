import { useEffect } from 'react';
import { initDiscounts } from '../inits/initDiscounts.js';

const HTML = "<div class=\"page-head\">\r\n        <div>\r\n          <nav class=\"breadcrumb\" aria-label=\"مسیر صفحه\">\r\n            <a href=\"/admin\">داشبورد</a>\r\n            <span aria-hidden=\"true\">/</span>\r\n            <span>تخفیف و کمپین</span>\r\n          </nav>\r\n          <h1 class=\"page-title\">تخفیف و کمپین</h1>\r\n          <p class=\"page-sub\">\r\n            ساخت کد تخفیف با محدودیت مصرف، تعیین هدف (کل فروشگاه، دسته‌بندی، کالکشن) و مدیریت کمپین‌های مناسبتی.\r\n          </p>\r\n        </div>\r\n        <div class=\"page-head__actions\">\r\n          <button class=\"btn btn--gold\" type=\"button\" id=\"addBtn\">ساخت کد تخفیف</button>\r\n        </div>\r\n      </div>\r\n\r\n      <div class=\"grid grid--kpi mb-3\" id=\"discountKpis\"></div>\r\n\r\n      <div class=\"tabs mb-3\" role=\"tablist\" aria-label=\"بخش‌های تخفیف\">\r\n        <button class=\"tab tab--active\" role=\"tab\" aria-selected=\"true\" data-tab=\"codes\">\r\n          کدهای تخفیف <span class=\"tab__count\" id=\"countCodes\">۰</span>\r\n        </button>\r\n        <button class=\"tab\" role=\"tab\" aria-selected=\"false\" data-tab=\"campaigns\">\r\n          کمپین‌های مناسبتی <span class=\"tab__count\" id=\"countCampaigns\">۰</span>\r\n        </button>\r\n      </div>\r\n\r\n      <section class=\"tab-panel tab-panel--active\" data-panel=\"codes\">\r\n        <div class=\"card\">\r\n          <div id=\"discountTable\"></div>\r\n        </div>\r\n      </section>\r\n\r\n      <section class=\"tab-panel\" data-panel=\"campaigns\">\r\n        <div class=\"grid grid--3\" id=\"campaignGrid\"></div>\r\n      </section>";

export default function DiscountsPage() {
  useEffect(() => {
    let alive = true;
    (async () => {
      
      if (!alive) return;
      await initDiscounts();
    })();
    return () => { alive = false; };
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: HTML }} />;
}
