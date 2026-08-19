import { useEffect } from 'react';
import { initOrders } from '../inits/initOrders.js';

const HTML = "<div class=\"page-head\">\r\n        <div>\r\n          <nav class=\"breadcrumb\" aria-label=\"مسیر صفحه\">\r\n            <a href=\"/admin\">داشبورد</a>\r\n            <span aria-hidden=\"true\">/</span>\r\n            <span>سفارش‌ها</span>\r\n          </nav>\r\n          <h1 class=\"page-title\">سفارش‌ها</h1>\r\n          <p class=\"page-sub\">\r\n            پیگیری وضعیت سفارش، تایید پرداخت، ثبت کد رهگیری و مدیریت پرداخت‌های دو‌مرحله‌ای و اقساطی.\r\n          </p>\r\n        </div>\r\n        <div class=\"page-head__actions\">\r\n          <button class=\"btn btn--ghost btn--sm\" type=\"button\" id=\"printListBtn\">چاپ فهرست</button>\r\n          <button class=\"btn btn--ghost btn--sm\" type=\"button\" id=\"exportBtn\">برون‌بری CSV</button>\r\n        </div>\r\n      </div>\r\n\r\n      <!-- وضعیت سفارش‌ها در یک نگاه -->\r\n      <div class=\"grid grid--kpi mb-3\" id=\"orderKpis\"></div>\r\n\r\n      <!-- میان‌بُر فیلتر بر اساس وضعیت -->\r\n      <div class=\"tabs mb-2\" role=\"tablist\" aria-label=\"فیلتر سریع بر اساس وضعیت سفارش\" id=\"statusTabs\"></div>\r\n\r\n      <section class=\"card\">\r\n        <div id=\"orderTable\"></div>\r\n      </section>";

export default function OrdersPage() {
  useEffect(() => {
    let alive = true;
    (async () => {
      
      if (!alive) return;
      await initOrders();
    })();
    return () => { alive = false; };
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: HTML }} />;
}
