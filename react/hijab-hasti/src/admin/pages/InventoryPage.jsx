import { useEffect } from 'react';
import { initInventory } from '../inits/initInventory.js';

const HTML = "<div class=\"page-head\">\r\n        <div>\r\n          <nav class=\"breadcrumb\" aria-label=\"مسیر صفحه\">\r\n            <a href=\"/admin\">داشبورد</a>\r\n            <span aria-hidden=\"true\">/</span>\r\n            <span>انبار</span>\r\n          </nav>\r\n          <h1 class=\"page-title\">انبار</h1>\r\n          <p class=\"page-sub\">\r\n            موجودی به تفکیک تنوع (سایز × قد × رنگ)، ثبت ورود و خروج کالا، ارزش‌گذاری انبار و کالاهای راکد.\r\n          </p>\r\n        </div>\r\n        <div class=\"page-head__actions\">\r\n          <button class=\"btn btn--ghost btn--sm\" type=\"button\" id=\"exportBtn\">برون‌بری موجودی</button>\r\n          <button class=\"btn btn--gold btn--sm\" type=\"button\" id=\"moveBtn\">ثبت ورود / خروج</button>\r\n        </div>\r\n      </div>\r\n\r\n      <div class=\"grid grid--kpi mb-3\" id=\"inventoryKpis\"></div>\r\n\r\n      <div class=\"tabs mb-3\" role=\"tablist\" aria-label=\"بخش‌های انبار\">\r\n        <button class=\"tab tab--active\" role=\"tab\" aria-selected=\"true\" data-tab=\"stock\">موجودی تنوع‌ها</button>\r\n        <button class=\"tab\" role=\"tab\" aria-selected=\"false\" data-tab=\"moves\">تراکنش‌های انبار</button>\r\n        <button class=\"tab\" role=\"tab\" aria-selected=\"false\" data-tab=\"stagnant\">کالاهای راکد</button>\r\n        <button class=\"tab\" role=\"tab\" aria-selected=\"false\" data-tab=\"restock\">درخواست اطلاع از موجودی</button>\r\n      </div>\r\n\r\n      <section class=\"tab-panel tab-panel--active\" data-panel=\"stock\">\r\n        <div class=\"card\">\r\n          <div id=\"stockTable\"></div>\r\n        </div>\r\n      </section>\r\n\r\n      <section class=\"tab-panel\" data-panel=\"moves\">\r\n        <div class=\"card\">\r\n          <div id=\"movesTable\"></div>\r\n        </div>\r\n      </section>\r\n\r\n      <section class=\"tab-panel\" data-panel=\"stagnant\">\r\n        <div class=\"notice notice--warning mb-2\">\r\n          <span id=\"stagnantNotice\"></span>\r\n        </div>\r\n        <div class=\"card\">\r\n          <div id=\"stagnantTable\"></div>\r\n        </div>\r\n      </section>\r\n\r\n      <section class=\"tab-panel\" data-panel=\"restock\">\r\n        <div class=\"notice notice--info mb-2\" id=\"restockNotice\"></div>\r\n        <div class=\"card\">\r\n          <div id=\"restockTable\"></div>\r\n        </div>\r\n      </section>";

export default function InventoryPage() {
  useEffect(() => {
    let alive = true;
    (async () => {
      
      if (!alive) return;
      await initInventory();
    })();
    return () => { alive = false; };
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: HTML }} />;
}
