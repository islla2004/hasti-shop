import { Admin } from '../adminShared.js';
import { dataService } from '../data/dataService.js';
import { HASTI_MOCK } from '../data/mockData.js';

export async function initProducts() {


      var products = [];
      var categories = [];
      var collections = [];
      var fabrics = [];
      var tableApi = null;

      (async function init() {
        await Admin.shell("products");
        Admin.tableSkeleton('#productTable', 7);

        var result = await Promise.all([
          dataService.getProducts(),
          dataService.getCategories(),
          dataService.getCollections(),
          dataService.getFabrics()
        ]);
        products = result[0];
        categories = result[1];
        collections = result[2];
        fabrics = result[3];

        renderSummary();
        buildTable();
        bindViewToggle();
        bindImport();
        applyUrlFilter();
      })();

      /* ============================ خلاصه کاتالوگ ======================== */
      function renderSummary() {
        var published = products.filter(function (p) { return p.status === 'published'; }).length;
        var draft = products.filter(function (p) { return p.status === 'draft'; }).length;
        var lowOrOut = products.filter(function (p) { return p.isLowStock || p.isOutOfStock; }).length;
        var stockValue = products.reduce(function (s, p) { return s + p.totalStock * (p.costPrice || 0); }, 0);

        var cards = [
          { label: 'کل محصولات', value: Admin.fa(products.length), unit: 'محصول', icon: 'box', tone: '' },
          { label: 'محصولات فعال', value: Admin.fa(published), unit: 'فعال', icon: 'checkCircle', tone: 'success', note: Admin.fa(draft) + ' پیش‌نویس' },
          { label: 'نیازمند تکمیل موجودی', value: Admin.fa(lowOrOut), unit: 'محصول', icon: 'alert', tone: 'danger' },
          { label: 'ارزش انبار (بهای تمام‌شده)', value: Admin.moneyShort(stockValue), unit: 'تومان', icon: 'wallet', tone: 'info' }
        ];

        document.getElementById('summaryGrid').innerHTML = cards.map(function (c, i) {
          return '<article class="kpi reveal" style="animation-delay:' + (i * 50) + 'ms">' +
            '<div class="kpi__top"><span class="kpi__label">' + Admin.escapeHtml(c.label) + '</span>' +
            '<span class="kpi__icon' + (c.tone ? ' kpi__icon--' + c.tone : '') + '">' + Admin.icon(c.icon) + '</span></div>' +
            '<div class="kpi__value">' + c.value + '<small>' + c.unit + '</small></div>' +
            (c.note ? '<div class="kpi__foot"><span>' + Admin.escapeHtml(c.note) + '</span></div>' : '') +
            '</article>';
        }).join('');
      }

      /* =============================== جدول ============================= */
      function buildTable() {
        tableApi = Admin.table({
          mount: '#productTable',
          rows: products,
          rowKey: 'id',
          pageSize: 8,
          selectable: true,
          searchKeys: ['name', 'code', 'barcode'],
          searchPlaceholder: 'جست‌وجو بر اساس نام، کد کالا یا بارکد…',
          defaultSort: { key: 'createdAt', dir: 'desc' },
          filters: [
            {
              key: 'category', label: 'همه دسته‌بندی‌ها',
              options: categories.map(function (c) { return { value: c.id, label: c.name }; })
            },
            {
              key: 'collection', label: 'همه کالکشن‌ها',
              options: collections.map(function (c) { return { value: c.id, label: c.name }; }),
              match: function (row, v) { return (row.collections || []).indexOf(v) !== -1; }
            },
            {
              key: 'fabric', label: 'همه پارچه‌ها',
              options: fabrics.map(function (f) { return { value: f.name, label: f.name }; })
            },
            {
              key: 'stockState', label: 'وضعیت موجودی',
              options: [
                { value: 'ok', label: 'موجود' },
                { value: 'low', label: 'رو به اتمام' },
                { value: 'out', label: 'ناموجود' }
              ],
              match: function (row, v) {
                if (v === 'out') return row.isOutOfStock;
                if (v === 'low') return row.isLowStock;
                return !row.isOutOfStock && !row.isLowStock;
              }
            },
            {
              key: 'status', label: 'همه وضعیت‌ها',
              options: Object.keys(Admin.PRODUCT_STATUS).map(function (k) {
                return { value: k, label: Admin.PRODUCT_STATUS[k].label };
              })
            },
            {
              key: 'priceRange', label: 'بازه قیمت',
              options: [
                { value: '0-3', label: 'تا ۳ میلیون' },
                { value: '3-8', label: '۳ تا ۸ میلیون' },
                { value: '8-15', label: '۸ تا ۱۵ میلیون' },
                { value: '15-999', label: 'بیش از ۱۵ میلیون' }
              ],
              match: function (row, v) {
                var parts = v.split('-');
                var price = row.currentPrice / 1000000;
                return price >= Number(parts[0]) && price < Number(parts[1]);
              }
            }
          ],
          actions: [
            { label: 'برون‌بری CSV', icon: 'download', variant: 'btn--ghost', onClick: exportProducts }
          ],
          bulkActions: [
            { label: 'فعال‌سازی', icon: 'checkCircle', variant: 'btn--soft', onClick: function (ids) { bulkStatus(ids, 'published'); } },
            { label: 'پیش‌نویس', icon: 'edit', variant: 'btn--soft', onClick: function (ids) { bulkStatus(ids, 'draft'); } },
            { label: 'اعمال تخفیف', icon: 'percent', variant: 'btn--soft', onClick: bulkDiscount },
            { label: 'حذف', icon: 'trash', variant: 'btn--danger-ghost', onClick: bulkDelete }
          ],
          empty: {
            icon: 'box',
            title: 'هنوز محصولی ثبت نشده است',
            desc: 'اولین محصول خود را اضافه کنید تا در فروشگاه نمایش داده شود.',
            actionLabel: 'افزودن محصول',
            onAction: function () { window.location.href = '/admin/products/new'; }
          },
          columns: [
            {
              key: 'name', label: 'محصول', sortable: true,
              render: function (p) {
                return '<div class="cell-product">' +
                  '<img class="thumb" src="' + p.images[0] + '" alt="' + Admin.escapeHtml(p.name) + '" loading="lazy" width="46" height="46">' +
                  '<div><b>' + Admin.escapeHtml(p.name) + '</b>' +
                  '<small class="ltr">' + Admin.escapeHtml(p.code) + '</small>' +
                  (p.featuredHome ? '<span class="badge badge--gold" style="margin-top:3px">' +
                    Admin.icon('home') + 'صفحه اصلی</span>' : '') +
                  '</div></div>';
              }
            },
            {
              key: 'categoryName', label: 'دسته‌بندی', sortable: true,
              render: function (p) {
                return Admin.escapeHtml(p.categoryName) +
                  '<span class="cell-sub">' + Admin.escapeHtml(p.fabric) + '</span>';
              }
            },
            {
              key: 'collections', label: 'کالکشن',
              render: function (p) {
                if (!p.collectionNames.length) return '<span class="text-soft">—</span>';
                return p.collectionNames.slice(0, 2).map(function (n) {
                  return '<span class="badge badge--neutral" style="margin:1px">' + Admin.escapeHtml(n) + '</span>';
                }).join('') +
                  (p.collectionNames.length > 2 ? '<span class="cell-sub">+' +
                    Admin.fa(p.collectionNames.length - 2) + ' مورد دیگر</span>' : '');
              }
            },
            {
              key: 'currentPrice', label: 'قیمت (تومان)', sortable: true, className: 'num',
              render: function (p) {
                return (p.discount > 0
                  ? '<span class="price-old">' + Admin.fa(Admin.price(p.oldPrice)) + '</span>' : '') +
                  '<span class="price-now">' + Admin.fa(Admin.price(p.currentPrice)) + '</span>' +
                  (p.discount > 0 ? '<span class="badge badge--danger" style="margin-top:3px">' +
                    Admin.fa(p.discount) + '٪ تخفیف</span>' : '');
              }
            },
            {
              key: 'totalStock', label: 'موجودی', sortable: true, className: 'num',
              render: function (p) {
                var tone = p.isOutOfStock ? 'danger' : (p.isLowStock ? 'warning' : 'success');
                var text = p.isOutOfStock ? 'ناموجود' : Admin.fa(p.totalStock) + ' عدد';
                return Admin.badge(text, tone, p.isOutOfStock ? 'alert' : (p.isLowStock ? 'clock' : 'checkCircle')) +
                  '<span class="cell-sub">' + Admin.fa(p.variants.length) + ' تنوع</span>';
              }
            },
            {
              key: 'status', label: 'وضعیت', sortable: true,
              render: function (p) { return Admin.productStatus(p.status); }
            },
            {
              key: 'views', label: 'بازدید', sortable: true, className: 'num',
              render: function (p) {
                return '<b>' + Admin.fa(p.views) + '</b>' +
                  '<span class="cell-sub">' + Admin.fa(p.salesCount) + ' فروش</span>';
              }
            },
            {
              key: 'createdAt', label: 'تاریخ ثبت', sortable: true,
              render: function (p) { return Admin.jShort(p.createdAt); }
            },
            {
              key: 'actions', label: 'عملیات', className: 'col-actions',
              render: function (p) {
                return '<div class="cell-actions">' +
                  '<a class="act-btn" href="/admin/products/' + encodeURIComponent(p.id) + '" ' +
                  'title="ویرایش" aria-label="ویرایش ' + Admin.escapeHtml(p.name) + '">' + Admin.icon('edit') + '</a>' +
                  '<a class="act-btn" href="/product/' + encodeURIComponent(p.id) + '" target="_blank" rel="noopener" ' +
                  'title="مشاهده در سایت" aria-label="مشاهده در سایت">' + Admin.icon('eye') + '</a>' +
                  '<button class="act-btn" type="button" data-duplicate="' + Admin.escapeHtml(p.id) + '" ' +
                  'title="تکثیر محصول" aria-label="تکثیر ' + Admin.escapeHtml(p.name) + '">' + Admin.icon('copy') + '</button>' +
                  '<button class="act-btn act-btn--danger" type="button" data-delete="' + Admin.escapeHtml(p.id) + '" ' +
                  'title="حذف" aria-label="حذف ' + Admin.escapeHtml(p.name) + '">' + Admin.icon('trash') + '</button>' +
                  '</div>';
              }
            }
          ]
        });

        bindRowActions();
      }

      /* رویدادهای سطرها روی خود جدول delegate می‌شوند تا بعد از هر رندر کار کنند */
      function bindRowActions() {
        document.getElementById('productTable').addEventListener('click', async function (e) {
          var dup = e.target.closest('[data-duplicate]');
          var del = e.target.closest('[data-delete]');

          if (dup) {
            var copy = await dataService.duplicateProduct(dup.getAttribute('data-duplicate'));
            products = await dataService.getProducts();
            tableApi.setRows(products);
            renderSummary();
            Admin.toast('محصول «' + copy.name + '» ایجاد شد');
          }

          if (del) {
            var id = del.getAttribute('data-delete');
            var product = products.filter(function (p) { return p.id === id; })[0];
            var ok = await Admin.confirm({
              title: 'حذف محصول',
              danger: true,
              icon: 'trash',
              message: 'محصول «<b>' + Admin.escapeHtml(product.name) + '</b>» حذف شود؟ ' +
                'این محصول از فروشگاه حذف می‌شود و در سفارش‌های گذشته فقط نام آن باقی می‌ماند.',
              confirmLabel: 'حذف محصول'
            });
            if (!ok) return;
            await dataService.deleteProduct(id);
            products = await dataService.getProducts();
            tableApi.setRows(products);
            renderSummary();
            if (!document.getElementById('productCards').hidden) renderCards();
            Admin.toast('محصول حذف شد', 'success');
          }
        });
      }

      /* ========================== عملیات گروهی ========================== */
      async function bulkStatus(ids, status) {
        await dataService.bulkUpdateProducts(ids, { status: status });
        products = await dataService.getProducts();
        tableApi.setRows(products);
        renderSummary();
        Admin.toast('وضعیت ' + Admin.fa(ids.length) + ' محصول به «' +
          Admin.PRODUCT_STATUS[status].label + '» تغییر یافت');
      }

      function bulkDiscount(ids) {
        var m = Admin.modal({
          title: 'اعمال تخفیف گروهی',
          subtitle: 'روی ' + Admin.fa(ids.length) + ' محصول انتخاب‌شده اعمال می‌شود',
          icon: 'percent',
          body:
            '<div class="field">' +
            '<label class="label" for="bulkDiscountValue">درصد تخفیف <span class="req">*</span></label>' +
            '<input class="input" type="number" id="bulkDiscountValue" min="0" max="100" value="10" inputmode="numeric">' +
            '<span class="hint">قیمت نهایی هر محصول به‌صورت خودکار محاسبه و در فروشگاه به‌روز می‌شود.</span>' +
            '</div>',
          actions: [
            { label: 'انصراف', variant: 'btn--ghost', onClick: function (mm) { mm.close(); } },
            {
              label: 'اعمال تخفیف', variant: 'btn--primary', onClick: async function (mm) {
                var value = Number(Admin.toEn(document.getElementById('bulkDiscountValue').value));
                if (isNaN(value) || value < 0 || value > 100) {
                  Admin.toast('درصد تخفیف باید عددی بین ۰ تا ۱۰۰ باشد', 'error');
                  return;
                }
                await dataService.bulkUpdateProducts(ids, { discount: value });
                products = await dataService.getProducts();
                tableApi.setRows(products);
                renderSummary();
                mm.close();
                Admin.toast('تخفیف ' + Admin.fa(value) + '٪ روی ' + Admin.fa(ids.length) + ' محصول اعمال شد');
              }
            }
          ]
        });
      }

      async function bulkDelete(ids) {
        var ok = await Admin.confirm({
          title: 'حذف گروهی محصولات',
          danger: true,
          icon: 'trash',
          message: '<b>' + Admin.fa(ids.length) + '</b> محصول انتخاب‌شده حذف شوند؟ این عملیات قابل بازگشت نیست.',
          confirmLabel: 'حذف ' + Admin.fa(ids.length) + ' محصول'
        });
        if (!ok) return;
        await Promise.all(ids.map(function (id) {
          return dataService.deleteProduct(id);
        }));
        products = await dataService.getProducts();
        tableApi.setRows(products);
        renderSummary();
        Admin.toast(Admin.fa(ids.length) + ' محصول حذف شد');
      }

      /* ============================ برون‌بری CSV ======================== */
      function exportProducts() {
        var rows = tableApi.getFiltered();
        Admin.exportCsv('hasti-products.csv', [
          { label: 'کد کالا', key: 'code' },
          { label: 'نام محصول', key: 'name' },
          { label: 'دسته‌بندی', key: 'categoryName' },
          { label: 'کالکشن', value: function (p) { return p.collectionNames.join(' | '); } },
          { label: 'جنس پارچه', key: 'fabric' },
          { label: 'قیمت قبل از تخفیف', key: 'oldPrice' },
          { label: 'درصد تخفیف', key: 'discount' },
          { label: 'قیمت نهایی', key: 'currentPrice' },
          { label: 'بهای تمام‌شده', key: 'costPrice' },
          { label: 'موجودی کل', key: 'totalStock' },
          { label: 'وضعیت', value: function (p) { return (Admin.PRODUCT_STATUS[p.status] || {}).label || p.status; } },
          { label: 'بازدید', key: 'views' },
          { label: 'تعداد فروش', key: 'salesCount' },
          { label: 'تاریخ ثبت', key: 'createdAt' }
        ], rows);
      }

      function bindImport() {
        document.getElementById('importBtn').addEventListener('click', function () {
          Admin.modal({
            title: 'درون‌ریزی محصولات از CSV',
            icon: 'upload',
            body:
              '<div class="notice notice--info mb-2">' + Admin.icon('info') +
              '<span><b>ساختار فایل</b>ستون‌ها باید مطابق فایل برون‌بری‌شده باشند: کد کالا، نام محصول، ' +
              'دسته‌بندی، جنس پارچه، قیمت، درصد تخفیف، موجودی.</span></div>' +
              '<div class="field"><label class="label" for="csvFile">انتخاب فایل CSV</label>' +
              '<input class="input" type="file" id="csvFile" accept=".csv">' +
              '<span class="hint">حداکثر حجم فایل ۲ مگابایت.</span></div>' +
              '<div class="notice notice--warning mt-2">' + Admin.icon('alert') +
              '<span><b>نیازمند بک‌اند</b>پردازش و اعتبارسنجی نهایی فایل باید در سرور انجام شود؛ ' +
              'در این فاز فقط رابط کاربری آماده شده است.</span></div>',
            actions: [
              { label: 'انصراف', variant: 'btn--ghost', onClick: function (m) { m.close(); } },
              {
                label: 'شروع درون‌ریزی', variant: 'btn--primary', onClick: function (m) {
                  var file = document.getElementById('csvFile').files[0];
                  if (!file) { Admin.toast('ابتدا یک فایل CSV انتخاب کنید', 'error'); return; }
                  m.close();
                  Admin.toast('فایل دریافت شد — پردازش نیازمند اتصال به سرور است', 'warning');
                }
              }
            ]
          });
        });
      }

      /* ========================= نمای کارتی محصولات ===================== */
      function bindViewToggle() {
        var tableBtn = document.getElementById('viewTable');
        var cardsBtn = document.getElementById('viewCards');
        tableBtn.innerHTML = Admin.icon('list');
        cardsBtn.innerHTML = Admin.icon('grid');

        tableBtn.addEventListener('click', function () {
          tableBtn.setAttribute('aria-pressed', 'true');
          cardsBtn.setAttribute('aria-pressed', 'false');
          document.getElementById('productTable').hidden = false;
          document.getElementById('productCards').hidden = true;
        });

        cardsBtn.addEventListener('click', function () {
          cardsBtn.setAttribute('aria-pressed', 'true');
          tableBtn.setAttribute('aria-pressed', 'false');
          document.getElementById('productTable').hidden = true;
          document.getElementById('productCards').hidden = false;
          renderCards();
        });
      }

      function renderCards() {
        var rows = tableApi.getFiltered();
        document.getElementById('productCards').innerHTML =
          '<div class="grid grid--3" style="padding:22px">' + rows.map(function (p, i) {
            return '<article class="card reveal" style="animation-delay:' + (i * 30) + 'ms;box-shadow:var(--shadow-sm)">' +
              '<img src="' + p.images[0] + '" alt="' + Admin.escapeHtml(p.name) + '" loading="lazy" ' +
              'style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:var(--r-lg) var(--r-lg) 0 0">' +
              '<div style="padding:14px">' +
              '<div class="row row--between mb-1">' + Admin.productStatus(p.status) +
              (p.discount > 0 ? Admin.badge(Admin.fa(p.discount) + '٪', 'danger') : '') + '</div>' +
              '<b style="display:block;color:var(--c-jet);font-size:13.5px">' + Admin.escapeHtml(p.name) + '</b>' +
              '<small class="text-soft ltr" style="display:block;margin-bottom:8px">' + Admin.escapeHtml(p.code) + '</small>' +
              '<div class="row row--between">' +
              '<span class="fw-bold num" style="color:var(--c-jet)">' + Admin.money(p.currentPrice) + '</span>' +
              '<span class="text-xs text-muted num">موجودی: ' + Admin.fa(p.totalStock) + '</span>' +
              '</div>' +
              '<a class="btn btn--ghost btn--sm btn--block mt-2" href="/admin/products/' +
              encodeURIComponent(p.id) + '">' + Admin.icon('edit') + '<span>ویرایش</span></a>' +
              '</div></article>';
          }).join('') + '</div>';
      }

      /* پیش‌فیلتر از طریق آدرس (مثلاً از داشبورد) */
      function applyUrlFilter() {
        var status = Admin.param('status');
        if (!status) return;
        var selects = Admin.$$('#productTable .toolbar select');
        selects.forEach(function (s) {
          if (Array.prototype.some.call(s.options, function (o) { return o.value === status; })) {
            s.value = status;
            s.dispatchEvent(new Event('change'));
          }
        });
      }
    
}
