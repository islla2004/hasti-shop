import { Admin } from '../adminShared.js';
import { dataService } from '../data/dataService.js';
import { HASTI_MOCK } from '../data/mockData.js';

export async function initCustomers() {


      var customers = [];
      var tiers = [];
      var tableApi = null;

      (async function init() {
        await Admin.shell("customers");
        Admin.tableSkeleton('#customerTable', 6);

        var res = await Promise.all([
          dataService.getCustomers(),
          dataService.getSettings(),
          dataService.getTopCustomers()
        ]);
        customers = res[0];
        tiers = res[1].loyalty.tiers;

        renderKpis();
        buildTable();
        renderTopCustomers(res[2]);
        bindActions();
      })();

      /* ============================== KPI ها ============================ */
      function renderKpis() {
        var totalSpent = customers.reduce(function (s, c) { return s + c.totalSpent; }, 0);
        var repeat = customers.filter(function (c) { return c.totalOrders > 1; }).length;
        var gold = customers.filter(function (c) { return c.loyaltyTier === 'gold'; }).length;

        var cards = [
          { label: 'کل مشتریان', value: Admin.fa(customers.length), unit: 'نفر', icon: 'users', tone: 'info' },
          {
            label: 'نرخ خرید تکراری', value: Admin.percent(Math.round(repeat / customers.length * 100)),
            unit: '', icon: 'refresh', tone: 'success',
            note: Admin.fa(repeat) + ' مشتری بیش از یک خرید داشته‌اند'
          },
          {
            label: 'میانگین ارزش مشتری', value: Admin.moneyShort(Math.round(totalSpent / customers.length)),
            unit: 'تومان', icon: 'wallet', tone: ''
          },
          { label: 'مشتریان طلایی', value: Admin.fa(gold), unit: 'نفر', icon: 'crown', tone: 'warning' }
        ];

        document.getElementById('customerKpis').innerHTML = cards.map(function (c, i) {
          return '<article class="kpi reveal" style="animation-delay:' + (i * 50) + 'ms">' +
            '<div class="kpi__top"><span class="kpi__label">' + Admin.escapeHtml(c.label) + '</span>' +
            '<span class="kpi__icon' + (c.tone ? ' kpi__icon--' + c.tone : '') + '">' + Admin.icon(c.icon) + '</span></div>' +
            '<div class="kpi__value">' + c.value + (c.unit ? '<small>' + c.unit + '</small>' : '') + '</div>' +
            (c.note ? '<div class="kpi__foot"><span>' + Admin.escapeHtml(c.note) + '</span></div>' : '') +
            '</article>';
        }).join('');
      }

      /* =============================== جدول ============================ */
      function buildTable() {
        tableApi = Admin.table({
          mount: '#customerTable',
          rows: customers,
          rowKey: 'id',
          pageSize: 8,
          selectable: true,
          searchKeys: ['name', 'phone', 'email', 'city'],
          searchPlaceholder: 'جست‌وجو با نام، موبایل، ایمیل یا شهر…',
          defaultSort: { key: 'totalSpent', dir: 'desc' },
          onRowClick: function (c) {
            window.location.href = '/admin/customers/' + encodeURIComponent(c.id);
          },
          filters: [
            {
              key: 'loyaltyTier', label: 'سطح وفاداری',
              options: [
                { value: 'gold', label: 'طلایی' },
                { value: 'silver', label: 'نقره‌ای' },
                { value: 'bronze', label: 'برنزی' }
              ]
            },
            { key: 'city', label: 'شهر', options: uniqueCities() },
            {
              key: 'behavior', label: 'رفتار خرید',
              options: [
                { value: 'repeat', label: 'خرید تکراری' },
                { value: 'once', label: 'تک‌خرید' },
                { value: 'wishlist', label: 'دارای علاقه‌مندی' },
                { value: 'overdue', label: 'دارای پرداخت معوق' }
              ],
              match: function (c, v) {
                if (v === 'repeat') return c.totalOrders > 1;
                if (v === 'once') return c.totalOrders === 1;
                if (v === 'wishlist') return (c.wishlist || []).length > 0;
                return (c.tags || []).indexOf('معوق پرداخت') !== -1;
              }
            }
          ],
          bulkActions: [
            { label: 'ساخت لیست بازاریابی', icon: 'download', variant: 'btn--soft', onClick: exportSelected },
            { label: 'افزودن برچسب', icon: 'tag', variant: 'btn--soft', onClick: bulkTag }
          ],
          empty: {
            icon: 'users',
            title: 'مشتری‌ای یافت نشد',
            desc: 'با تغییر فیلترها جست‌وجوی دیگری انجام دهید.'
          },
          columns: [
            {
              key: 'name', label: 'مشتری', sortable: true,
              render: function (c) {
                return '<div class="cell-product">' +
                  '<span class="avatar">' + Admin.escapeHtml(initials(c.name)) + '</span>' +
                  '<div><b>' + Admin.escapeHtml(c.name) + '</b>' +
                  '<small class="ltr">' + Admin.fa(c.phone) + '</small></div></div>';
              }
            },
            {
              key: 'city', label: 'شهر', sortable: true,
              render: function (c) {
                return Admin.escapeHtml(c.city) +
                  (c.email ? '<span class="cell-sub ltr">' + Admin.escapeHtml(c.email) + '</span>' : '');
              }
            },
            {
              key: 'totalOrders', label: 'تعداد سفارش', sortable: true, className: 'num',
              render: function (c) {
                return '<b>' + Admin.fa(c.totalOrders) + '</b>' +
                  '<span class="cell-sub">' + (c.totalOrders > 1 ? 'خرید تکراری' : 'تک‌خرید') + '</span>';
              }
            },
            {
              key: 'totalSpent', label: 'مجموع خرید', sortable: true, className: 'num',
              render: function (c) {
                return '<b>' + Admin.fa(Admin.price(c.totalSpent)) + '</b>' +
                  '<span class="cell-sub">میانگین ' +
                  Admin.moneyShort(Math.round(c.totalSpent / Math.max(1, c.totalOrders))) + '</span>';
              }
            },
            {
              key: 'loyaltyTier', label: 'باشگاه وفاداری', sortable: true,
              render: function (c) {
                return '<span class="tier tier--' + c.loyaltyTier + '">' + Admin.icon('crown') +
                  Admin.escapeHtml(c.tierName) + '</span>' +
                  '<span class="cell-sub">' + Admin.fa(c.loyaltyPoints) + ' امتیاز</span>';
              }
            },
            {
              key: 'tags', label: 'برچسب‌ها',
              render: function (c) {
                if (!c.tags.length) return '<span class="text-soft">—</span>';
                return c.tags.map(function (t) {
                  var tone = t === 'معوق پرداخت' ? 'danger' : (t === 'مشتری ویژه' ? 'gold' : 'neutral');
                  return '<span class="badge badge--' + tone + '" style="margin:1px">' + Admin.escapeHtml(t) + '</span>';
                }).join('');
              }
            },
            {
              key: 'joinDate', label: 'تاریخ عضویت', sortable: true,
              render: function (c) { return Admin.jShort(c.joinDate); }
            },
            {
              key: 'actions', label: 'عملیات', className: 'col-actions',
              render: function (c) {
                return '<div class="cell-actions">' +
                  '<a class="act-btn" href="/admin/customers/' + encodeURIComponent(c.id) + '" ' +
                  'title="پرونده مشتری" aria-label="پرونده ' + Admin.escapeHtml(c.name) + '">' + Admin.icon('eye') + '</a>' +
                  '<a class="act-btn" target="_blank" rel="noopener" title="واتساپ" aria-label="ارسال پیام واتساپ" href="' +
                  Admin.whatsappLink(c.phone, 'سلام ' + c.name + ' عزیز، از فروشگاه هستی تماس می‌گیریم.') + '">' +
                  Admin.icon('whatsapp') + '</a>' +
                  '<a class="act-btn" href="tel:' + Admin.escapeHtml(c.phone) + '" title="تماس" aria-label="تماس تلفنی">' +
                  Admin.icon('phone') + '</a></div>';
              }
            }
          ]
        });
      }

      function uniqueCities() {
        var seen = {};
        customers.forEach(function (c) { seen[c.city] = true; });
        return Object.keys(seen).map(function (c) { return { value: c, label: c }; });
      }

      function initials(name) {
        return String(name || '').trim().split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join('');
      }

      /* =========================== مشتریان برتر ======================== */
      function renderTopCustomers(list) {
        document.getElementById('topCustomers').innerHTML = list.slice(0, 8).map(function (c, i) {
          return '<a class="rank-item" href="/admin/customers/' + encodeURIComponent(c.id) + '">' +
            '<span class="rank-item__no">' + Admin.fa(i + 1) + '</span>' +
            '<span class="rank-item__main"><b>' + Admin.escapeHtml(c.name) + '</b>' +
            '<small>' + Admin.escapeHtml(c.city) + ' · ' + Admin.fa(c.totalOrders) + ' سفارش</small></span>' +
            '<span class="rank-item__val"><b>' + Admin.moneyShort(c.totalSpent) + '</b>' +
            '<small>' + Admin.escapeHtml(c.tierName) + '</small></span></a>';
        }).join('');
      }

      /* ============================== اقدام‌ها ========================== */
      function bindActions() {
        document.getElementById('exportBtn').addEventListener('click', function () {
          exportRows(tableApi.getFiltered(), 'hasti-customers.csv');
        });

        document.getElementById('segmentBtn').addEventListener('click', segmentDialog);
      }

      function exportSelected(ids) {
        var rows = customers.filter(function (c) { return ids.indexOf(c.id) !== -1; });
        exportRows(rows, 'hasti-marketing-list.csv');
      }

      function exportRows(rows, filename) {
        Admin.exportCsv(filename, [
          { label: 'نام', key: 'name' },
          { label: 'موبایل', key: 'phone' },
          { label: 'ایمیل', key: 'email' },
          { label: 'شهر', key: 'city' },
          { label: 'نشانی', key: 'address' },
          { label: 'تعداد سفارش', key: 'totalOrders' },
          { label: 'مجموع خرید', key: 'totalSpent' },
          { label: 'امتیاز وفاداری', key: 'loyaltyPoints' },
          { label: 'سطح باشگاه', key: 'tierName' },
          { label: 'برچسب‌ها', value: function (c) { return (c.tags || []).join(' | '); } },
          { label: 'تاریخ عضویت', key: 'joinDate' }
        ], rows);
      }

      /* ساخت لیست هدفمند برای کمپین — یکی از کاربردهای اصلی این صفحه */
      function segmentDialog() {
        Admin.modal({
          title: 'ساخت لیست بازاریابی',
          subtitle: 'مشتریان هدف را بر اساس معیار انتخاب کنید',
          icon: 'target',
          body:
            '<div class="form-grid">' +
            '<div class="field"><label class="label" for="segTier">سطح باشگاه</label>' +
            '<select class="select" id="segTier"><option value="">همه سطوح</option>' +
            tiers.map(function (t) { return '<option value="' + t.id + '">' + t.name + '</option>'; }).join('') +
            '</select></div>' +
            '<div class="field"><label class="label" for="segMinSpent">حداقل مجموع خرید</label>' +
            '<div class="input-group"><input class="input num" id="segMinSpent" value="0" inputmode="numeric">' +
            '<span class="input-group__affix">تومان</span></div></div>' +
            '<div class="field"><label class="label" for="segMinOrders">حداقل تعداد سفارش</label>' +
            '<input class="input num" type="number" id="segMinOrders" min="0" value="1"></div>' +
            '<div class="field"><label class="label" for="segCity">شهر</label>' +
            '<select class="select" id="segCity"><option value="">همه شهرها</option>' +
            uniqueCities().map(function (c) { return '<option value="' + c.value + '">' + c.label + '</option>'; }).join('') +
            '</select></div>' +
            '</div>' +
            '<div class="notice notice--info mt-2" id="segCount" aria-live="polite">' + Admin.icon('info') +
            '<span><b>تعداد مشتریان هدف</b>معیارها را تنظیم کنید.</span></div>',
          actions: [
            { label: 'انصراف', variant: 'btn--ghost', onClick: function (m) { m.close(); } },
            {
              label: 'دریافت لیست', variant: 'btn--primary', onClick: function (m) {
                var rows = filterSegment();
                if (!rows.length) { Admin.toast('هیچ مشتری‌ای با این معیارها یافت نشد', 'error'); return; }
                exportRows(rows, 'hasti-segment.csv');
                m.close();
              }
            }
          ]
        });

        setTimeout(function () {
          ['segTier', 'segMinSpent', 'segMinOrders', 'segCity'].forEach(function (id) {
            var field = document.getElementById(id);
            field.addEventListener('input', updateCount);
            field.addEventListener('change', updateCount);
          });
          updateCount();
        }, 130);
      }

      function filterSegment() {
        var tier = document.getElementById('segTier').value;
        var minSpent = Number(Admin.toEn(document.getElementById('segMinSpent').value).replace(/[^\d]/g, '')) || 0;
        var minOrders = Number(Admin.toEn(document.getElementById('segMinOrders').value)) || 0;
        var city = document.getElementById('segCity').value;

        return customers.filter(function (c) {
          if (tier && c.loyaltyTier !== tier) return false;
          if (c.totalSpent < minSpent) return false;
          if (c.totalOrders < minOrders) return false;
          if (city && c.city !== city) return false;
          return true;
        });
      }

      function updateCount() {
        var rows = filterSegment();
        document.getElementById('segCount').innerHTML = Admin.icon('users') +
          '<span><b>' + Admin.fa(rows.length) + ' مشتری هدف</b>' +
          'مجموع خرید این گروه: ' +
          Admin.money(rows.reduce(function (s, c) { return s + c.totalSpent; }, 0)) + '</span>';
      }

      function bulkTag(ids) {
        Admin.modal({
          title: 'افزودن برچسب گروهی',
          subtitle: 'روی ' + Admin.fa(ids.length) + ' مشتری اعمال می‌شود',
          icon: 'tag',
          body:
            '<div class="field"><label class="label" for="tagValue">برچسب</label>' +
            '<input class="input" id="tagValue" list="tagOptions" placeholder="مثال: مشتری ویژه">' +
            '<datalist id="tagOptions">' +
            ['مشتری ویژه', 'خریدار عمده', 'خرید حضوری', 'معوق پرداخت', 'کمپین زمستانه'].map(function (t) {
              return '<option value="' + t + '">';
            }).join('') + '</datalist></div>',
          actions: [
            { label: 'انصراف', variant: 'btn--ghost', onClick: function (m) { m.close(); } },
            {
              label: 'افزودن برچسب', variant: 'btn--primary', onClick: async function (m) {
                var tag = document.getElementById('tagValue').value.trim();
                if (!tag) { Admin.toast('برچسب را وارد کنید', 'error'); return; }
                await Promise.all(ids.map(function (id) {
                  var c = customers.filter(function (x) { return x.id === id; })[0];
                  if (!c || c.tags.indexOf(tag) !== -1) return null;
                  c.tags.push(tag);
                  return dataService.saveCustomer({ id: c.id, tags: c.tags });
                }));
                m.close();
                customers = await dataService.getCustomers();
                tableApi.setRows(customers);
                Admin.toast('برچسب «' + tag + '» به ' + Admin.fa(ids.length) + ' مشتری اضافه شد');
              }
            }
          ]
        });
      }
    
}
