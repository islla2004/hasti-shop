import { Admin } from '../adminShared.js';
import { dataService } from '../data/dataService.js';
import { HASTI_MOCK } from '../data/mockData.js';

export async function initInventory() {


      var report = null;
      var moves = [];
      var restock = [];
      var products = [];
      var stockApi = null, movesApi = null, restockApi = null;

      (async function init() {
        await Admin.shell("inventory");
        Admin.tableSkeleton('#stockTable', 7);

        var res = await Promise.all([
          dataService.getInventoryReport(),
          dataService.getInventoryMoves(),
          dataService.getRestockRequests(),
          dataService.getProducts()
        ]);
        report = res[0];
        moves = res[1];
        restock = res[2];
        products = res[3];

        renderKpis();
        buildStockTable();
        buildMovesTable();
        buildStagnantTable();
        buildRestockTable();
        bindTabs();
        bindActions();
        applyUrlFilter();
      })();

      /* ============================== KPI ها ============================ */
      function renderKpis() {
        var cards = [
          { label: 'ارزش کل انبار', value: Admin.moneyShort(report.totalValue), unit: 'تومان', icon: 'wallet', tone: 'info', note: 'بر اساس بهای تمام‌شده' },
          { label: 'تعداد کل کالا', value: Admin.fa(report.totalUnits), unit: 'عدد', icon: 'boxOpen', tone: '' },
          { label: 'تنوع‌های رو به اتمام', value: Admin.fa(report.lowCount), unit: 'مورد', icon: 'clock', tone: 'warning' },
          { label: 'تنوع‌های ناموجود', value: Admin.fa(report.outCount), unit: 'مورد', icon: 'alert', tone: 'danger' }
        ];

        document.getElementById('inventoryKpis').innerHTML = cards.map(function (c, i) {
          return '<article class="kpi reveal" style="animation-delay:' + (i * 50) + 'ms">' +
            '<div class="kpi__top"><span class="kpi__label">' + Admin.escapeHtml(c.label) + '</span>' +
            '<span class="kpi__icon' + (c.tone ? ' kpi__icon--' + c.tone : '') + '">' + Admin.icon(c.icon) + '</span></div>' +
            '<div class="kpi__value">' + c.value + '<small>' + c.unit + '</small></div>' +
            (c.note ? '<div class="kpi__foot"><span>' + Admin.escapeHtml(c.note) + '</span></div>' : '') +
            '</article>';
        }).join('');
      }

      /* ========================= جدول موجودی تنوع‌ها ==================== */
      function buildStockTable() {
        stockApi = Admin.table({
          mount: '#stockTable',
          rows: report.rows,
          rowKey: 'id',
          pageSize: 12,
          searchKeys: ['productName', 'productCode', 'barcode', 'variantLabel'],
          searchPlaceholder: 'جست‌وجو با نام محصول، کد کالا یا بارکد تنوع…',
          defaultSort: { key: 'stock', dir: 'asc' },
          filters: [
            {
              key: 'state', label: 'وضعیت موجودی',
              options: [
                { value: 'out', label: 'ناموجود' },
                { value: 'low', label: 'رو به اتمام' },
                { value: 'ok', label: 'موجودی مناسب' }
              ]
            },
            { key: 'categoryName', label: 'دسته‌بندی', options: unique('categoryName') },
            { key: 'color', label: 'رنگ', options: unique('color') },
            { key: 'size', label: 'سایز', options: unique('size') }
          ],
          actions: [
            { label: 'ثبت تراکنش', icon: 'plus', variant: 'btn--soft', onClick: function () { moveDialog(); } }
          ],
          empty: {
            icon: 'warehouse',
            title: 'موردی یافت نشد',
            desc: 'با تغییر فیلترها جست‌وجوی دیگری انجام دهید.'
          },
          columns: [
            {
              key: 'productName', label: 'محصول', sortable: true,
              render: function (r) {
                return '<div class="cell-product">' +
                  '<img class="thumb" src="' + r.productImage + '" alt="' + Admin.escapeHtml(r.productName) +
                  '" loading="lazy" width="46" height="46">' +
                  '<div><b>' + Admin.escapeHtml(r.productName) + '</b>' +
                  '<small class="ltr">' + Admin.escapeHtml(r.productCode) + '</small></div></div>';
              }
            },
            {
              key: 'variantLabel', label: 'تنوع', sortable: true,
              render: function (r) {
                return '<span class="badge badge--neutral">' + Admin.escapeHtml(r.size) + '</span> ' +
                  (r.length ? '<span class="badge badge--neutral">قد ' + Admin.fa(r.length) + '</span> ' : '') +
                  '<span class="badge badge--neutral">' + Admin.escapeHtml(r.color) + '</span>' +
                  (r.barcode ? '<span class="cell-sub ltr">' + Admin.escapeHtml(r.barcode) + '</span>' : '');
              }
            },
            { key: 'categoryName', label: 'دسته‌بندی', sortable: true },
            {
              key: 'stock', label: 'موجودی', sortable: true, className: 'num',
              render: function (r) {
                var tone = r.state === 'out' ? 'danger' : (r.state === 'low' ? 'warning' : 'success');
                var text = r.state === 'out' ? 'ناموجود' : Admin.fa(r.stock) + ' عدد';
                return Admin.badge(text, tone, r.state === 'ok' ? 'checkCircle' : (r.state === 'low' ? 'clock' : 'alert')) +
                  '<span class="cell-sub">آستانه ' + Admin.fa(r.threshold) + '</span>';
              }
            },
            {
              key: 'stockValue', label: 'ارزش موجودی', sortable: true, className: 'num',
              render: function (r) { return Admin.fa(Admin.price(r.stockValue)); }
            },
            {
              key: 'actions', label: 'عملیات', className: 'col-actions',
              render: function (r) {
                return '<div class="cell-actions">' +
                  '<button class="act-btn" type="button" data-in="' + Admin.escapeHtml(r.id) + '" ' +
                  'title="ثبت ورود" aria-label="ثبت ورود کالا">' + Admin.icon('plus') + '</button>' +
                  '<button class="act-btn" type="button" data-out="' + Admin.escapeHtml(r.id) + '" ' +
                  'title="ثبت خروج" aria-label="ثبت خروج کالا">' + Admin.icon('minus') + '</button>' +
                  '<a class="act-btn" href="/admin/products/' + encodeURIComponent(r.productId) + '" ' +
                  'title="ویرایش محصول" aria-label="ویرایش محصول">' + Admin.icon('edit') + '</a></div>';
              }
            }
          ]
        });

        document.getElementById('stockTable').addEventListener('click', function (e) {
          var inBtn = e.target.closest('[data-in]');
          var outBtn = e.target.closest('[data-out]');
          if (inBtn) moveDialog(findRow(inBtn.getAttribute('data-in')), 'in');
          if (outBtn) moveDialog(findRow(outBtn.getAttribute('data-out')), 'out');
        });
      }

      function findRow(id) {
        return report.rows.filter(function (r) { return r.id === id; })[0];
      }

      function unique(key) {
        var seen = {};
        report.rows.forEach(function (r) { if (r[key]) seen[r[key]] = true; });
        return Object.keys(seen).map(function (v) { return { value: v, label: v }; });
      }

      /* ========================= تراکنش‌های انبار ====================== */
      function buildMovesTable() {
        movesApi = Admin.table({
          mount: '#movesTable',
          rows: moves,
          rowKey: 'id',
          pageSize: 10,
          searchKeys: ['productName', 'variant', 'reason', 'invoiceNo', 'by'],
          searchPlaceholder: 'جست‌وجو در تراکنش‌ها…',
          defaultSort: { key: 'date', dir: 'desc' },
          filters: [
            {
              key: 'type', label: 'نوع تراکنش',
              options: [{ value: 'in', label: 'ورود' }, { value: 'out', label: 'خروج' }]
            }
          ],
          empty: {
            icon: 'activity',
            title: 'تراکنشی ثبت نشده است',
            desc: 'ورود و خروج کالا در این بخش ثبت و پیگیری می‌شود.'
          },
          columns: [
            {
              key: 'date', label: 'تاریخ', sortable: true,
              render: function (m) { return Admin.jDate(m.date); }
            },
            {
              key: 'productName', label: 'محصول', sortable: true,
              render: function (m) {
                return '<div class="cell-product">' +
                  '<img class="thumb" src="' + m.productImage + '" alt="' + Admin.escapeHtml(m.productName) +
                  '" loading="lazy" width="46" height="46">' +
                  '<div><b>' + Admin.escapeHtml(m.productName) + '</b>' +
                  '<small>' + Admin.escapeHtml(m.variant) + '</small></div></div>';
              }
            },
            {
              key: 'type', label: 'نوع', sortable: true,
              render: function (m) {
                return m.type === 'in'
                  ? Admin.badge('ورود', 'success', 'trendUp')
                  : Admin.badge('خروج', 'danger', 'trendDown');
              }
            },
            {
              key: 'qty', label: 'تعداد', sortable: true, className: 'num',
              render: function (m) {
                return '<b class="' + (m.type === 'in' ? 'text-success' : 'text-danger') + '">' +
                  (m.type === 'in' ? '+' : '−') + Admin.fa(m.qty) + '</b>';
              }
            },
            { key: 'reason', label: 'علت' },
            {
              key: 'invoiceNo', label: 'شماره فاکتور',
              render: function (m) {
                return m.invoiceNo
                  ? '<span class="ltr">' + Admin.escapeHtml(m.invoiceNo) + '</span>'
                  : '<span class="text-soft">—</span>';
              }
            },
            { key: 'by', label: 'ثبت‌کننده', sortable: true }
          ]
        });
      }

      /* =========================== کالاهای راکد ======================== */
      function buildStagnantTable() {
        document.getElementById('stagnantNotice').innerHTML = Admin.icon('clock') +
          '<span><b>کالاهای کم‌گردش</b>محصولاتی که موجودی دارند اما فروش کمی داشته‌اند. ' +
          'برای آزادسازی سرمایه، تخفیف یا معرفی در کمپین را در نظر بگیرید.</span>';

        Admin.table({
          mount: '#stagnantTable',
          rows: report.stagnant,
          rowKey: 'id',
          pageSize: 8,
          searchKeys: ['name', 'code'],
          searchPlaceholder: 'جست‌وجو در کالاهای راکد…',
          defaultSort: { key: 'salesCount', dir: 'asc' },
          empty: {
            icon: 'checkCircle',
            title: 'کالای راکدی وجود ندارد',
            desc: 'گردش موجودی همه محصولات در وضعیت مناسبی است.'
          },
          columns: [
            {
              key: 'name', label: 'محصول', sortable: true,
              render: function (p) {
                return '<div class="cell-product">' +
                  '<img class="thumb" src="' + p.images[0] + '" alt="' + Admin.escapeHtml(p.name) +
                  '" loading="lazy" width="46" height="46">' +
                  '<div><b>' + Admin.escapeHtml(p.name) + '</b>' +
                  '<small class="ltr">' + Admin.escapeHtml(p.code) + '</small></div></div>';
              }
            },
            { key: 'categoryName', label: 'دسته‌بندی', sortable: true },
            {
              key: 'totalStock', label: 'موجودی', sortable: true, className: 'num',
              render: function (p) { return Admin.fa(p.totalStock) + ' عدد'; }
            },
            {
              key: 'salesCount', label: 'تعداد فروش', sortable: true, className: 'num',
              render: function (p) { return Admin.badge(Admin.fa(p.salesCount) + ' فروش', 'warning', 'trendDown'); }
            },
            {
              key: 'stockValue', label: 'سرمایه درگیر', sortable: true, className: 'num',
              sortValue: function (p) { return p.totalStock * (p.costPrice || 0); },
              render: function (p) { return '<b>' + Admin.money(p.totalStock * (p.costPrice || 0)) + '</b>'; }
            },
            {
              key: 'actions', label: 'اقدام', className: 'col-actions',
              render: function (p) {
                return '<div class="cell-actions">' +
                  '<a class="act-btn" href="/admin/products/' + encodeURIComponent(p.id) + '" ' +
                  'title="اعمال تخفیف" aria-label="ویرایش و اعمال تخفیف">' + Admin.icon('percent') + '</a>' +
                  '<a class="act-btn" href="/admin/discounts" title="ساخت کمپین" aria-label="ساخت کمپین">' +
                  Admin.icon('sparkle') + '</a></div>';
              }
            }
          ]
        });
      }

      /* ================== درخواست اطلاع از موجود شدن =================== */
      function buildRestockTable() {
        var pending = restock.filter(function (r) { return !r.notified; });
        var ready = pending.filter(function (r) { return r.inStockNow; });

        document.getElementById('restockNotice').innerHTML = Admin.icon('bell') +
          '<span><b>' + Admin.fa(pending.length) + ' درخواست در انتظار</b>' +
          (ready.length
            ? Admin.fa(ready.length) + ' درخواست مربوط به محصولاتی است که الان موجود شده‌اند و آماده اطلاع‌رسانی هستند.'
            : 'هیچ‌یک از محصولات درخواستی هنوز موجود نشده است.') + '</span>';

        restockApi = Admin.table({
          mount: '#restockTable',
          rows: restock,
          rowKey: 'id',
          pageSize: 8,
          selectable: true,
          searchKeys: ['productName', 'contact', 'variant'],
          searchPlaceholder: 'جست‌وجو با نام محصول یا شماره تماس…',
          defaultSort: { key: 'date', dir: 'desc' },
          filters: [
            {
              key: 'notified', label: 'وضعیت اطلاع‌رسانی',
              options: [{ value: 'no', label: 'در انتظار' }, { value: 'yes', label: 'اطلاع داده شده' }],
              match: function (r, v) { return v === 'yes' ? r.notified : !r.notified; }
            },
            {
              key: 'inStockNow', label: 'موجودی فعلی',
              options: [{ value: 'yes', label: 'موجود شده' }, { value: 'no', label: 'هنوز ناموجود' }],
              match: function (r, v) { return v === 'yes' ? r.inStockNow : !r.inStockNow; }
            }
          ],
          bulkActions: [
            { label: 'ثبت اطلاع‌رسانی', icon: 'bell', variant: 'btn--soft', onClick: notifySelected }
          ],
          empty: {
            icon: 'bell',
            title: 'درخواستی ثبت نشده است',
            desc: 'درخواست‌های «اطلاع از موجود شدن» از صفحه محصول در این بخش ثبت می‌شوند.'
          },
          columns: [
            {
              key: 'productName', label: 'محصول', sortable: true,
              render: function (r) {
                return '<div class="cell-product">' +
                  '<img class="thumb" src="' + r.productImage + '" alt="' + Admin.escapeHtml(r.productName) +
                  '" loading="lazy" width="46" height="46">' +
                  '<div><b>' + Admin.escapeHtml(r.productName) + '</b>' +
                  '<small>' + Admin.escapeHtml(r.variant) + '</small></div></div>';
              }
            },
            {
              key: 'contact', label: 'راه ارتباطی',
              render: function (r) {
                return '<span class="ltr">' + Admin.escapeHtml(
                  r.channel === 'sms' ? Admin.fa(r.contact) : r.contact) + '</span>' +
                  '<span class="cell-sub">' + (r.channel === 'sms' ? 'پیامک' : 'ایمیل') + '</span>';
              }
            },
            {
              key: 'date', label: 'تاریخ درخواست', sortable: true,
              render: function (r) { return Admin.jShort(r.date); }
            },
            {
              key: 'inStockNow', label: 'موجودی فعلی', sortable: true,
              render: function (r) {
                return r.inStockNow
                  ? Admin.badge('موجود شده', 'success', 'checkCircle')
                  : Admin.badge('ناموجود', 'neutral', 'clock');
              }
            },
            {
              key: 'notified', label: 'اطلاع‌رسانی', sortable: true,
              render: function (r) {
                return r.notified
                  ? Admin.badge('انجام شد', 'success', 'check')
                  : Admin.badge('در انتظار', 'warning', 'clock');
              }
            },
            {
              key: 'actions', label: 'اقدام', className: 'col-actions',
              render: function (r) {
                if (r.notified) return '<span class="text-soft">—</span>';
                var actions = '<div class="cell-actions">';
                if (r.channel === 'sms') {
                  actions += '<a class="act-btn" target="_blank" rel="noopener" title="اطلاع‌رسانی واتساپ" ' +
                    'aria-label="اطلاع‌رسانی واتساپ" href="' +
                    Admin.whatsappLink(r.contact, 'سلام، محصول ' + r.productName + ' (' + r.variant +
                      ') در فروشگاه هستی موجود شد. برای خرید می‌توانید به سایت مراجعه کنید.') + '">' +
                    Admin.icon('whatsapp') + '</a>';
                }
                actions += '<button class="act-btn" type="button" data-notify="' + Admin.escapeHtml(r.productId) + '" ' +
                  'title="ثبت اطلاع‌رسانی گروهی این محصول" aria-label="ثبت اطلاع‌رسانی گروهی">' +
                  Admin.icon('bell') + '</button></div>';
                return actions;
              }
            }
          ]
        });

        document.getElementById('restockTable').addEventListener('click', async function (e) {
          var btn = e.target.closest('[data-notify]');
          if (!btn) return;
          var productId = btn.getAttribute('data-notify');
          var count = await dataService.notifyRestockGroup(productId);
          restock = await dataService.getRestockRequests();
          restockApi.setRows(restock);
          buildRestockNotice();
          Admin.toast(Admin.fa(count) + ' درخواست به‌عنوان «اطلاع داده شده» ثبت شد');
        });
      }

      function buildRestockNotice() {
        var pending = restock.filter(function (r) { return !r.notified; });
        var ready = pending.filter(function (r) { return r.inStockNow; });
        document.getElementById('restockNotice').innerHTML = Admin.icon('bell') +
          '<span><b>' + Admin.fa(pending.length) + ' درخواست در انتظار</b>' +
          (ready.length
            ? Admin.fa(ready.length) + ' درخواست آماده اطلاع‌رسانی است.'
            : 'هیچ‌یک از محصولات درخواستی هنوز موجود نشده است.') + '</span>';
      }

      async function notifySelected(ids) {
        var selected = restock.filter(function (r) { return ids.indexOf(r.id) !== -1; });
        var productIds = {};
        selected.forEach(function (r) { productIds[r.productId] = true; });

        var counts = await Promise.all(Object.keys(productIds).map(function (pid) {
          return dataService.notifyRestockGroup(pid);
        }));
        var total = counts.reduce(function (s, n) { return s + n; }, 0);

        restock = await dataService.getRestockRequests();
        restockApi.setRows(restock);
        buildRestockNotice();
        Admin.toast('اطلاع‌رسانی ' + Admin.fa(total) + ' درخواست ثبت شد');
      }

      /* =============================== تب‌ها =========================== */
      function bindTabs() {
        Admin.$$('[data-tab]').forEach(function (tab) {
          tab.addEventListener('click', function () {
            var key = tab.getAttribute('data-tab');
            Admin.$$('[data-tab]').forEach(function (t) {
              t.classList.toggle('tab--active', t === tab);
              t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
            });
            Admin.$$('[data-panel]').forEach(function (panel) {
              panel.classList.toggle('tab-panel--active', panel.getAttribute('data-panel') === key);
            });
          });
        });
      }

      /* ============================== اقدام‌ها ========================== */
      function bindActions() {
        document.getElementById('moveBtn').addEventListener('click', function () { moveDialog(); });

        document.getElementById('exportBtn').addEventListener('click', function () {
          Admin.exportCsv('hasti-inventory.csv', [
            { label: 'نام محصول', key: 'productName' },
            { label: 'کد کالا', key: 'productCode' },
            { label: 'دسته‌بندی', key: 'categoryName' },
            { label: 'سایز', key: 'size' },
            { label: 'قد', key: 'length' },
            { label: 'رنگ', key: 'color' },
            { label: 'بارکد', key: 'barcode' },
            { label: 'موجودی', key: 'stock' },
            { label: 'آستانه هشدار', key: 'threshold' },
            { label: 'بهای تمام‌شده', key: 'costPrice' },
            { label: 'ارزش موجودی', key: 'stockValue' }
          ], stockApi.getFiltered());
        });
      }

      /* ثبت ورود/خروج کالا — با انتخاب محصول و تنوع */
      function moveDialog(row, type) {
        var selectedProduct = row ? row.productId : products[0].id;

        Admin.modal({
          title: 'ثبت تراکنش انبار',
          subtitle: row ? row.productName + ' — ' + row.variantLabel : 'ورود یا خروج کالا',
          icon: 'warehouse',
          body:
            '<div class="form-grid">' +
            '<div class="field field--full"><label class="label" for="mvProduct">محصول</label>' +
            '<select class="select" id="mvProduct">' +
            products.map(function (p) {
              return '<option value="' + p.id + '"' + (p.id === selectedProduct ? ' selected' : '') + '>' +
                Admin.escapeHtml(p.name) + '</option>';
            }).join('') + '</select></div>' +
            '<div class="field field--full"><label class="label" for="mvVariant">تنوع</label>' +
            '<select class="select" id="mvVariant"></select></div>' +
            '<div class="field"><label class="label" for="mvType">نوع تراکنش</label>' +
            '<select class="select" id="mvType">' +
            '<option value="in"' + (type === 'in' ? ' selected' : '') + '>ورود کالا</option>' +
            '<option value="out"' + (type === 'out' ? ' selected' : '') + '>خروج کالا</option>' +
            '</select></div>' +
            '<div class="field"><label class="label" for="mvQty">تعداد <span class="req">*</span></label>' +
            '<input class="input num" type="number" id="mvQty" min="1" value="1"></div>' +
            '<div class="field field--full"><label class="label" for="mvReason">علت</label>' +
            '<input class="input" id="mvReason" list="reasonList" placeholder="مثال: ورود از تولید داخلی">' +
            '<datalist id="reasonList">' +
            ['ورود از تولید داخلی', 'ورود از تامین‌کننده', 'مرجوعی سفارش', 'فروش حضوری',
              'نمونه فروشگاهی', 'آسیب‌دیدگی در انبار', 'اصلاح شمارش انبار'].map(function (r) {
                return '<option value="' + r + '">';
              }).join('') + '</datalist></div>' +
            '<div class="field field--full"><label class="label" for="mvInvoice">شماره فاکتور خرید (اختیاری)</label>' +
            '<input class="input ltr" id="mvInvoice" placeholder="PUR-1403-048"></div>' +
            '</div>' +
            '<div class="notice notice--info mt-2" id="mvHint" aria-live="polite"></div>',
          actions: [
            { label: 'انصراف', variant: 'btn--ghost', onClick: function (m) { m.close(); } },
            {
              label: 'ثبت تراکنش', variant: 'btn--primary', onClick: async function (m) {
                var productId = document.getElementById('mvProduct').value;
                var variant = document.getElementById('mvVariant').value;
                var moveType = document.getElementById('mvType').value;
                var qty = Number(Admin.toEn(document.getElementById('mvQty').value)) || 0;
                var reason = document.getElementById('mvReason').value.trim();

                if (qty <= 0) { Admin.toast('تعداد باید بزرگ‌تر از صفر باشد', 'error'); return; }
                if (!reason) { Admin.toast('ثبت علت تراکنش الزامی است', 'error'); return; }

                /* بررسی کافی بودن موجودی برای خروج */
                if (moveType === 'out') {
                  var current = currentStock(productId, variant);
                  if (qty > current) {
                    Admin.toast('موجودی این تنوع ' + Admin.fa(current) + ' عدد است و کمتر از تعداد خروج است', 'error');
                    return;
                  }
                }

                await dataService.addInventoryMove({
                  productId: productId, variant: variant, type: moveType,
                  qty: qty, reason: reason,
                  invoiceNo: document.getElementById('mvInvoice').value.trim() || null
                });

                m.close();
                await reload();
                Admin.toast('تراکنش انبار ثبت و موجودی به‌روزرسانی شد');
              }
            }
          ]
        });

        setTimeout(function () {
          var productSelect = document.getElementById('mvProduct');
          var variantSelect = document.getElementById('mvVariant');

          function fillVariants() {
            var p = products.filter(function (x) { return x.id === productSelect.value; })[0];
            variantSelect.innerHTML = (p.variants || []).map(function (v) {
              var label = v.size + ' / ' + (v.length ? v.length : '—') + ' / ' + v.color;
              return '<option value="' + Admin.escapeHtml(label) + '">' +
                Admin.escapeHtml(label) + ' — موجودی ' + Admin.fa(v.stock) + '</option>';
            }).join('');
            if (row) variantSelect.value = row.variantLabel;
            updateHint();
          }

          function updateHint() {
            var current = currentStock(productSelect.value, variantSelect.value);
            document.getElementById('mvHint').innerHTML = Admin.icon('info') +
              '<span><b>موجودی فعلی این تنوع</b>' + Admin.fa(current) + ' عدد</span>';
          }

          productSelect.addEventListener('change', fillVariants);
          variantSelect.addEventListener('change', updateHint);
          fillVariants();
        }, 130);
      }

      function currentStock(productId, variantLabel) {
        var p = products.filter(function (x) { return x.id === productId; })[0];
        if (!p) return 0;
        var found = (p.variants || []).filter(function (v) {
          return (v.size + ' / ' + (v.length ? v.length : '—') + ' / ' + v.color) === variantLabel;
        })[0];
        return found ? found.stock : 0;
      }

      async function reload() {
        var res = await Promise.all([
          dataService.getInventoryReport(),
          dataService.getInventoryMoves(),
          dataService.getProducts()
        ]);
        report = res[0];
        moves = res[1];
        products = res[2];

        renderKpis();
        stockApi.setRows(report.rows);
        movesApi.setRows(moves);
      }

      /* پیش‌فیلتر محصول از طریق آدرس (مثلاً از داشبورد) */
      function applyUrlFilter() {
        var productId = Admin.param('product');
        if (!productId) return;
        var product = products.filter(function (p) { return p.id === productId; })[0];
        if (!product) return;
        var input = document.querySelector('#stockTable .toolbar__search input');
        if (input) {
          input.value = product.name;
          input.dispatchEvent(new Event('input'));
        }
      }
    
}
