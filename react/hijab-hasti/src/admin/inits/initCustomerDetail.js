import { Admin } from '../adminShared.js';
import { dataService } from '../data/dataService.js';
import { HASTI_MOCK } from '../data/mockData.js';

export async function initCustomerDetail() {


      var customer = null;
      var orders = [];
      var products = [];
      var customerId = Admin.param('id');

      (async function init() {
        await Admin.shell("customers");

        if (!customerId) return notFound('شناسه مشتری در آدرس صفحه مشخص نشده است.');
        customer = await dataService.getCustomer(customerId);
        if (!customer) return notFound('مشتری‌ای با این شناسه یافت نشد.');

        orders = await dataService.getCustomerOrders(customerId);
        products = await dataService.getProducts();

        renderAll();
        bindNote();
      })();

      function notFound(message) {
        var main = document.getElementById('main');
        main.innerHTML = '';
        main.appendChild(Admin.emptyState({
          icon: 'search',
          title: 'مشتری یافت نشد',
          desc: message,
          actionLabel: 'بازگشت به فهرست مشتریان',
          actionIcon: 'arrowLeft',
          onAction: function () { window.location.href = '/admin/customers'; }
        }));
      }

      function renderAll() {
        renderHead();
        renderKpis();
        renderOrders();
        renderOpenPayments();
        renderWishlist();
        renderContact();
        renderLoyalty();
        renderTags();
      }

      /* ============================== سرصفحه ============================ */
      function renderHead() {
        document.getElementById('crumbName').textContent = customer.name;
        document.getElementById('customerName').textContent = customer.name;
        document.title = customer.name + ' | پنل مدیریت هستی';

        document.getElementById('customerSub').innerHTML =
          'عضو از ' + Admin.jDate(customer.joinDate) + ' · ' +
          '<span class="tier tier--' + customer.loyaltyTier + '">' + Admin.icon('crown') +
          Admin.escapeHtml(customer.tierName) + '</span>' +
          (customer.tags.length
            ? ' ' + customer.tags.map(function (t) {
              return Admin.badge(t, t === 'معوق پرداخت' ? 'danger' : 'neutral');
            }).join(' ')
            : '');

        document.getElementById('headActions').innerHTML =
          '<a class="btn btn--ghost btn--sm" href="tel:' + Admin.escapeHtml(customer.phone) + '">' +
          Admin.icon('phone') + '<span>تماس</span></a>' +
          '<a class="btn btn--gold btn--sm" target="_blank" rel="noopener" href="' +
          Admin.whatsappLink(customer.phone, 'سلام ' + customer.name +
            ' عزیز، از فروشگاه هستی تماس می‌گیریم.') + '">' +
          Admin.icon('whatsapp') + '<span>پیام واتساپ</span></a>';
      }

      /* ============================== KPI ها ============================ */
      function renderKpis() {
        var receivable = orders.reduce(function (s, o) { return s + o.payment.remaining; }, 0);
        var average = customer.totalOrders ? Math.round(customer.totalSpent / customer.totalOrders) : 0;
        var lastOrder = orders.slice().sort(function (a, b) {
          return a.createdAt < b.createdAt ? 1 : -1;
        })[0];

        var cards = [
          { label: 'مجموع خرید', value: Admin.moneyShort(customer.totalSpent), unit: 'تومان', icon: 'wallet', tone: 'success' },
          { label: 'تعداد سفارش', value: Admin.fa(customer.totalOrders), unit: 'سفارش', icon: 'cart', tone: 'info' },
          { label: 'میانگین سبد خرید', value: Admin.moneyShort(average), unit: 'تومان', icon: 'chart', tone: '' },
          {
            label: 'مانده قابل دریافت', value: Admin.moneyShort(receivable), unit: 'تومان',
            icon: receivable ? 'alert' : 'checkCircle', tone: receivable ? 'danger' : 'success',
            note: lastOrder ? 'آخرین سفارش ' + Admin.jShort(lastOrder.createdAt) : ''
          }
        ];

        document.getElementById('customerKpis').innerHTML = cards.map(function (c, i) {
          return '<article class="kpi reveal" style="animation-delay:' + (i * 50) + 'ms">' +
            '<div class="kpi__top"><span class="kpi__label">' + Admin.escapeHtml(c.label) + '</span>' +
            '<span class="kpi__icon' + (c.tone ? ' kpi__icon--' + c.tone : '') + '">' + Admin.icon(c.icon) + '</span></div>' +
            '<div class="kpi__value">' + c.value + '<small>' + c.unit + '</small></div>' +
            (c.note ? '<div class="kpi__foot"><span>' + Admin.escapeHtml(c.note) + '</span></div>' : '') +
            '</article>';
        }).join('');
      }

      /* =========================== سابقه سفارش‌ها ======================= */
      function renderOrders() {
        document.getElementById('orderCountLabel').textContent =
          Admin.fa(orders.length) + ' سفارش ثبت‌شده';

        if (!orders.length) {
          document.getElementById('orderList').appendChild(Admin.emptyState({
            icon: 'cart',
            title: 'این مشتری هنوز سفارشی ثبت نکرده است',
            desc: 'با ارسال پیشنهاد ویژه از طریق واتساپ می‌توانید اولین خرید را تشویق کنید.'
          }));
          return;
        }

        Admin.table({
          mount: '#orderList',
          rows: orders,
          rowKey: 'orderNumber',
          pageSize: 6,
          defaultSort: { key: 'createdAt', dir: 'desc' },
          onRowClick: function (o) {
            window.location.href = '/admin/orders/' + encodeURIComponent(o.orderNumber);
          },
          columns: [
            {
              key: 'orderNumber', label: 'شماره سفارش', sortable: true,
              render: function (o) {
                return '<a class="fw-bold ltr" style="color:var(--c-jet);text-decoration:underline" ' +
                  'href="/admin/orders/' + encodeURIComponent(o.orderNumber) + '">' +
                  Admin.escapeHtml(o.orderNumber) + '</a>' +
                  '<span class="cell-sub">' + Admin.jShort(o.createdAt) + '</span>';
              }
            },
            {
              key: 'itemsCount', label: 'اقلام', sortable: true, className: 'num',
              render: function (o) {
                return Admin.fa(o.itemsCount) + ' عدد' +
                  '<span class="cell-sub">' + Admin.escapeHtml(o.items[0].productName) +
                  (o.items.length > 1 ? ' و ' + Admin.fa(o.items.length - 1) + ' قلم دیگر' : '') + '</span>';
              }
            },
            {
              key: 'finalAmount', label: 'مبلغ', sortable: true, className: 'num',
              render: function (o) { return '<b>' + Admin.money(o.finalAmount) + '</b>'; }
            },
            {
              key: 'planType', label: 'پرداخت',
              render: function (o) {
                return Admin.planType(o.paymentPlan.type) + ' ' + Admin.paymentStatus(o.payment.status);
              }
            },
            {
              key: 'orderStatus', label: 'وضعیت سفارش', sortable: true,
              render: function (o) { return Admin.orderStatus(o.orderStatus); }
            }
          ]
        });
      }

      /* ========================== پرداخت‌های باز ======================== */
      function renderOpenPayments() {
        var rows = [];
        orders.forEach(function (o) {
          o.paymentPlan.installments.forEach(function (ins) {
            if (ins.effectiveStatus === 'paid') return;
            rows.push({
              id: o.orderNumber + '_' + ins.index,
              orderNumber: o.orderNumber,
              label: ins.label,
              amount: ins.amount,
              dueDate: ins.dueDate,
              state: ins.effectiveStatus
            });
          });
        });

        var box = document.getElementById('openPayments');
        if (!rows.length) {
          box.appendChild(Admin.emptyState({
            icon: 'checkCircle',
            title: 'همه پرداخت‌ها تسویه شده است',
            desc: 'این مشتری هیچ قسط یا مرحله پرداخت‌نشده‌ای ندارد.'
          }));
          return;
        }

        Admin.table({
          mount: '#openPayments',
          rows: rows,
          rowKey: 'id',
          pageSize: 5,
          columns: [
            {
              key: 'orderNumber', label: 'سفارش',
              render: function (r) {
                return '<a class="ltr fw-bold" style="color:var(--c-jet)" href="/admin/orders/' +
                  encodeURIComponent(r.orderNumber) + '">' + Admin.escapeHtml(r.orderNumber) + '</a>';
              }
            },
            { key: 'label', label: 'عنوان', render: function (r) { return Admin.escapeHtml(r.label); } },
            {
              key: 'amount', label: 'مبلغ', sortable: true, className: 'num',
              render: function (r) { return '<b>' + Admin.money(r.amount) + '</b>'; }
            },
            {
              key: 'dueDate', label: 'سررسید', sortable: true,
              render: function (r) {
                return Admin.jDate(r.dueDate) + '<span class="cell-sub">' + Admin.dueLabel(r.dueDate) + '</span>';
              }
            },
            {
              key: 'state', label: 'وضعیت',
              render: function (r) {
                return r.state === 'overdue'
                  ? Admin.badge('معوق', 'danger', 'alert')
                  : Admin.badge('در انتظار پرداخت', 'warning', 'clock');
              }
            },
            {
              key: 'actions', label: 'اقدام', className: 'col-actions',
              render: function (r) {
                var text = 'سلام ' + customer.name + ' عزیز، یادآوری می‌کنیم ' + r.label +
                  ' سفارش ' + r.orderNumber + ' به مبلغ ' + Admin.money(r.amount) +
                  ' در تاریخ ' + Admin.jDate(r.dueDate) + ' سررسید دارد. با تشکر — فروشگاه هستی';
                return '<div class="cell-actions">' +
                  '<a class="act-btn" target="_blank" rel="noopener" title="یادآوری واتساپ" ' +
                  'aria-label="ارسال یادآوری" href="' + Admin.whatsappLink(customer.phone, text) + '">' +
                  Admin.icon('whatsapp') + '</a>' +
                  '<a class="act-btn" title="مدیریت پرداخت" aria-label="مدیریت پرداخت" href="/admin/orders/' +
                  encodeURIComponent(r.orderNumber) + '">' + Admin.icon('wallet') + '</a></div>';
              }
            }
          ]
        });
      }

      /* ============================ علاقه‌مندی‌ها ======================= */
      function renderWishlist() {
        var items = (customer.wishlist || []).map(function (id) {
          return products.filter(function (p) { return p.id === id; })[0];
        }).filter(Boolean);

        var box = document.getElementById('wishlistBox');
        if (!items.length) {
          box.innerHTML = '<p class="text-soft text-sm">این مشتری محصولی را به علاقه‌مندی‌ها اضافه نکرده است.</p>';
          return;
        }

        box.innerHTML = '<div class="rank-list">' + items.map(function (p) {
          return '<div class="rank-item">' +
            '<img class="thumb" src="' + p.images[0] + '" alt="' + Admin.escapeHtml(p.name) +
            '" loading="lazy" width="46" height="46">' +
            '<span class="rank-item__main"><b>' + Admin.escapeHtml(p.name) + '</b>' +
            '<small>' + Admin.escapeHtml(p.categoryName) + ' · ' + Admin.money(p.currentPrice) + '</small></span>' +
            '<span class="rank-item__val">' +
            (p.isOutOfStock ? Admin.badge('ناموجود', 'danger', 'alert') : Admin.badge('موجود', 'success', 'checkCircle')) +
            '</span></div>';
        }).join('') + '</div>' +
          '<a class="btn btn--soft btn--sm mt-2" target="_blank" rel="noopener" href="' +
          Admin.whatsappLink(customer.phone,
            'سلام ' + customer.name + ' عزیز، محصولات ذخیره‌شده شما در فروشگاه هستی موجود هستند: ' +
            items.map(function (p) { return p.name; }).join('، ')) + '">' +
          Admin.icon('whatsapp') + '<span>اطلاع‌رسانی موجودی علاقه‌مندی‌ها</span></a>';
      }

      /* ============================ اطلاعات تماس ======================== */
      function renderContact() {
        document.getElementById('contactBox').innerHTML =
          '<div class="row mb-2">' +
          '<span class="avatar avatar--lg">' + Admin.escapeHtml(initials(customer.name)) + '</span>' +
          '<div><b style="display:block;color:var(--c-jet)">' + Admin.escapeHtml(customer.name) + '</b>' +
          '<small class="text-soft">' + Admin.escapeHtml(customer.city) + '</small></div></div>' +
          '<dl class="dl">' +
          '<div class="dl__row"><dt>موبایل</dt><dd class="ltr">' + Admin.fa(customer.phone) + '</dd></div>' +
          '<div class="dl__row"><dt>ایمیل</dt><dd class="ltr">' +
          (customer.email ? Admin.escapeHtml(customer.email) : '<span class="text-soft">ثبت نشده</span>') + '</dd></div>' +
          '<div class="dl__row"><dt>عضویت</dt><dd>' + Admin.jDate(customer.joinDate) + '</dd></div>' +
          '</dl>' +
          '<div class="notice notice--info mt-2">' + Admin.icon('pin') +
          '<span><b>نشانی تحویل</b>' + Admin.escapeHtml(customer.address) + '</span></div>';
      }

      function initials(name) {
        return String(name || '').trim().split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join('');
      }

      /* =========================== باشگاه وفاداری ======================= */
      function renderLoyalty() {
        var tiers = HASTI_MOCK.SETTINGS.loyalty.tiers;
        var rate = HASTI_MOCK.SETTINGS.loyalty.pointToTomanRate;
        var currentIndex = tiers.findIndex(function (t) { return t.id === customer.loyaltyTier; });
        var next = tiers[currentIndex + 1];
        var progress = next
          ? Math.min(100, Math.round(customer.totalSpent / next.minSpent * 100))
          : 100;

        document.getElementById('loyaltyBox').innerHTML =
          '<div class="text-center mb-2">' +
          '<span class="tier tier--' + customer.loyaltyTier + '" style="font-size:13px;padding:7px 14px">' +
          Admin.icon('crown') + Admin.escapeHtml(customer.tierName) + '</span></div>' +
          '<dl class="dl mb-2">' +
          '<div class="dl__row"><dt>امتیاز فعلی</dt><dd>' + Admin.fa(customer.loyaltyPoints) + ' امتیاز</dd></div>' +
          '<div class="dl__row"><dt>ارزش ریالی امتیاز</dt><dd>' +
          Admin.money(customer.loyaltyPoints * rate) + '</dd></div>' +
          '</dl>' +
          (next
            ? '<div class="mb-1"><div class="row row--between mb-1">' +
            '<span class="text-xs text-muted">تا سطح ' + next.name + '</span>' +
            '<b class="text-xs">' + Admin.percent(progress) + '</b></div>' +
            '<span class="bar"><span class="bar__fill" style="width:' + progress + '%"></span></span>' +
            '<p class="hint mt-1">' + Admin.money(Math.max(0, next.minSpent - customer.totalSpent)) +
            ' خرید دیگر تا ارتقا به سطح ' + next.name + '</p></div>'
            : '<p class="hint">این مشتری در بالاترین سطح باشگاه وفاداری قرار دارد.</p>') +
          '<div class="row row--tight mt-2">' +
          '<button class="btn btn--soft btn--sm" type="button" id="addPoints" style="flex:1">افزودن امتیاز</button>' +
          '<button class="btn btn--ghost btn--sm" type="button" id="subPoints" style="flex:1">کسر امتیاز</button>' +
          '</div>';

        document.getElementById('addPoints').addEventListener('click', function () { pointsDialog(1); });
        document.getElementById('subPoints').addEventListener('click', function () { pointsDialog(-1); });
      }

      function pointsDialog(sign) {
        Admin.modal({
          title: sign > 0 ? 'افزودن امتیاز وفاداری' : 'کسر امتیاز وفاداری',
          subtitle: customer.name + ' — امتیاز فعلی ' + Admin.fa(customer.loyaltyPoints),
          icon: 'gift',
          body:
            '<div class="field"><label class="label" for="pointsValue">تعداد امتیاز</label>' +
            '<input class="input num" type="number" id="pointsValue" min="1" value="10"></div>' +
            '<div class="field mt-2"><label class="label" for="pointsReason">دلیل</label>' +
            '<input class="input" id="pointsReason" placeholder="مثال: جبران تاخیر در ارسال"></div>',
          actions: [
            { label: 'انصراف', variant: 'btn--ghost', onClick: function (m) { m.close(); } },
            {
              label: 'ثبت', variant: 'btn--primary', onClick: async function (m) {
                var value = Number(Admin.toEn(document.getElementById('pointsValue').value)) || 0;
                if (value <= 0) { Admin.toast('تعداد امتیاز باید بزرگ‌تر از صفر باشد', 'error'); return; }
                await dataService.adjustLoyaltyPoints(customer.id, sign * value);
                customer = await dataService.getCustomer(customerId);
                m.close();
                renderLoyalty();
                renderKpis();
                Admin.toast((sign > 0 ? 'افزودن ' : 'کسر ') + Admin.fa(value) + ' امتیاز انجام شد');
              }
            }
          ]
        });
      }

      /* ============================ برچسب و یادداشت ===================== */
      function renderTags() {
        var presets = ['مشتری ویژه', 'خریدار عمده', 'خرید حضوری', 'معوق پرداخت'];
        var box = document.getElementById('tagChips');

        box.innerHTML = presets.map(function (t) {
          var active = customer.tags.indexOf(t) !== -1;
          return '<button type="button" class="chip' + (active ? ' chip--active' : '') + '" ' +
            'data-tag="' + Admin.escapeHtml(t) + '" aria-pressed="' + active + '">' +
            (active ? Admin.icon('check') : Admin.icon('tag')) + Admin.escapeHtml(t) + '</button>';
        }).join('');

        box.querySelectorAll('[data-tag]').forEach(function (chip) {
          chip.addEventListener('click', async function () {
            var tag = chip.getAttribute('data-tag');
            var idx = customer.tags.indexOf(tag);
            if (idx === -1) customer.tags.push(tag);
            else customer.tags.splice(idx, 1);
            await dataService.saveCustomer({ id: customer.id, tags: customer.tags });
            renderTags();
            renderHead();
            Admin.toast('برچسب‌ها به‌روزرسانی شد');
          });
        });
      }

      function bindNote() {
        document.getElementById('customerNote').value = customer.notes || '';
        document.getElementById('saveNote').addEventListener('click', async function () {
          var note = document.getElementById('customerNote').value.trim();
          await dataService.saveCustomer({ id: customer.id, notes: note });
          customer.notes = note;
          Admin.toast('یادداشت ذخیره شد');
        });
      }
    
}
