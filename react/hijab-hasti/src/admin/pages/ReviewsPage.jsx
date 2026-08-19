import { useEffect } from 'react';
import { initReviews } from '../inits/initReviews.js';

const HTML = "<div class=\"page-head\">\r\n        <div>\r\n          <nav class=\"breadcrumb\" aria-label=\"مسیر صفحه\">\r\n            <a href=\"/admin\">داشبورد</a>\r\n            <span aria-hidden=\"true\">/</span>\r\n            <span>نظرات</span>\r\n          </nav>\r\n          <h1 class=\"page-title\">نظرات مشتریان</h1>\r\n          <p class=\"page-sub\">\r\n            امتیاز واقعی محصولات از همین نظرها ساخته می‌شود — نظرهای در انتظار را زودتر بررسی کنید.\r\n          </p>\r\n        </div>\r\n        <div class=\"page-head__actions\">\r\n          <button class=\"btn btn--ghost btn--sm\" type=\"button\" id=\"exportBtn\">\r\n            برون‌بری CSV\r\n          </button>\r\n          <button class=\"btn btn--gold btn--sm\" type=\"button\" id=\"approveAllBtn\">\r\n            تایید همه نظرهای در انتظار\r\n          </button>\r\n        </div>\r\n      </div>\r\n\r\n      <div class=\"grid grid--kpi mb-3\" id=\"reviewKpis\"></div>\r\n\r\n      <div class=\"grid grid--main\">\r\n        <div class=\"stack\">\r\n          <div class=\"tabs\" id=\"statusTabs\"></div>\r\n          <section class=\"card\">\r\n            <div id=\"reviewTable\"></div>\r\n          </section>\r\n        </div>\r\n\r\n        <div class=\"stack\">\r\n          <section class=\"card\">\r\n            <div class=\"card__head\">\r\n              <h2 class=\"card__title\">توزیع امتیازها</h2>\r\n            </div>\r\n            <div class=\"card__body\" id=\"ratingDist\"></div>\r\n          </section>\r\n\r\n          <section class=\"card\">\r\n            <div class=\"card__head\">\r\n              <h2 class=\"card__title\">محصولات با بالاترین امتیاز</h2>\r\n              <span class=\"card__sub\">میانگین امتیاز نظرهای تایید‌شده</span>\r\n            </div>\r\n            <div class=\"rank-list\" id=\"topRated\"></div>\r\n          </section>\r\n\r\n          <section class=\"card\">\r\n            <div class=\"card__head\">\r\n              <h2 class=\"card__title\">نیازمند توجه</h2>\r\n            </div>\r\n            <div class=\"alert-list\" id=\"attentionList\"></div>\r\n          </section>\r\n        </div>\r\n      </div>";

export default function ReviewsPage() {
  useEffect(() => {
    let alive = true;
    (async () => {
      
      if (!alive) return;
      await initReviews();
    })();
    return () => { alive = false; };
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: HTML }} />;
}
