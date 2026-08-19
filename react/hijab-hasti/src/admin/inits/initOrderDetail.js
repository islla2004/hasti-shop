import { Admin } from '../adminShared.js';
import { dataService } from '../data/dataService.js';
import { HASTI_MOCK } from '../data/mockData.js';

export async function initOrderDetail() {


      var order = null;
      var customer = null;
      var orderNumber = Admin.param('id');

      (async function init() {
        await Admin.shell("orders");

        if (!orderNumber) {
          showNotFound('شماره سفارش در آدرس صفحه مشخص نشده است.');
          return;
        }

        order = await dataService.getOrder(orderNumber);
        if (!order) {
          showNotFound('سفارشی با شماره ' + orderNumber + ' یافت نشد.');
          return;
        }
        customer = await dataService.getCustomer(order.customerId);

        renderAll();
        bindNote();
      })();

      function showNotFound(message) {
        var main = document.getElementById('main');
        main.innerHTML = '';
        main.appendChild(Admin.emptyState({
          icon: 'search',
          title: 'سفارش یافت نشد',
          desc: message,
          actionLabel: 'بازگشت به فهرست سفارش‌ها',
          actionIcon: 'arrowLeft',
          onAction: function () { window.location.href = '/admin/orders'; }
        }));
      }

      function renderAll() {
        renderHead();
        renderStepper();
        renderItems();
        renderSummary();
        renderPayment();
        renderTimeline();
        renderCustomer();
        renderShipping();
        renderQuickActions();
      }

      /* ============================== سرصفحه ============================ */
      function renderHead() {
        document.getElementById('crumbOrder').textContent = order.orderNumber;
        document.title = 'سفارش ' + order.orderNumber + ' | پنل مدیریت هستی';

        document.getElementById('orderTitle').innerHTML =
          'سفارش <span class="ltr">' + Admin.escapeHtml(order.orderNumber) + '</span>';

        document.getElementById('orderSub').innerHTML =
          'ثبت‌شده در ' + Admin.jDate(order.createdAt) + ' · ' +
          Admin.orderStatus(order.orderStatus) + ' ' +
          Admin.paymentStatus(order.payment.status) + ' ' +
          Admin.planType(order.paymentPlan.type);

        document.getElementById('itemsCount').textContent =
          Admin.fa(order.items.length) + ' قلم کالا · ' + Admin.fa(order.itemsCount) + ' عدد';

        document.getElementById('orderActions').innerHTML =
          '<button class="btn btn--ghost btn--sm" type="button" id="printBtn">' +
          Admin.icon('printer') + '<span>چاپ فاکتور</span></button>' +
          '<a class="btn btn--ghost btn--sm" target="_blank" rel="noopener" href="' +
          Admin.whatsappLink(order.customerPhone, 'سلام ' + order.customerName +
            ' عزیز، درباره سفارش ' + order.orderNumber + ' در فروشگاه هستی…') + '">' +
          Admin.icon('whatsapp') + '<span>واتساپ</span></a>' +
          '<button class="btn btn--gold btn--sm" type="button" id="statusBtn">' +
          Admin.icon('refresh') + '<span>تغییر وضعیت</span></button>';

        document.getElementById('printBtn').addEventListener('click', printInvoice);
        document.getElementById('statusBtn').addEventListener('click', statusDialog);
      }

      /* ============================ مراحل سفارش ========================= */
      function renderStepper() {
        var flow = ['pending', 'processing', 'shipped', 'delivered'];
        var currentIndex = flow.indexOf(order.orderStatus);
        var cancelled = order.orderStatus === 'cancelled' || order.orderStatus === 'returned';

        var html = flow.map(function (key, i) {
          var s = Admin.ORDER_STATUS[key];
          var done = !cancelled && currentIndex > i;
          var current = !cancelled && currentIndex === i;
          var record = order.history.filter(function (h) { return h.status === key; })[0];

          return '<div class="step' + (done ? ' step--done' : '') + (current ? ' step--current' : '') + '">' +
            '<span class="step__dot">' + (done ? Admin.icon('check') : Admin.icon(s.icon)) + '</span>' +
            '<span>' + s.label +
            (record ? '<br><small class="text-soft">' + Admin.jShort(record.at) + '</small>' : '') +
            '</span></div>';
        }).join('');

        if (cancelled) {
          var s = Admin.ORDER_STATUS[order.orderStatus];
          html += '<div class="step step--cancelled"><span class="step__dot">' + Admin.icon(s.icon) +
            '</span><span>' + s.label + '</span></div>';
        }

        document.getElementById('orderStepper').innerHTML = html;
      }

      /* ============================ اقلام سفارش ========================= */
      function renderItems() {
        var head = '<thead><tr><th>کالا</th><th>مشخصات</th><th>تعداد</th>' +
          '<th>قیمت واحد</th><th>مبلغ کل</th></tr></thead>';

        var body = '<tbody>' + order.items.map(function (it) {
          return '<tr>' +
            '<td data-label="کالا"><div class="cell-product">' +
            '<img class="thumb" src="' + it.productImage + '" alt="' + Admin.escapeHtml(it.productName) +
            '" loading="lazy" width="46" height="46">' +
            '<div><b><a href="/admin/products/' + encodeURIComponent(it.productId) + '" ' +
            'style="color:var(--c-jet)">' + Admin.escapeHtml(it.productName) + '</a></b>' +
            '<small class="ltr">' + Admin.escapeHtml(it.productCode) + '</small></div></div></td>' +
            '<td data-label="مشخصات">' +
            '<span class="badge badge--neutral">' + Admin.escapeHtml(it.color) + '</span> ' +
            '<span class="badge badge--neutral">سایز ' + Admin.escapeHtml(it.size) + '</span>' +
            (it.length ? ' <span class="badge badge--neutral">قد ' + Admin.fa(it.length) + '</span>' : '') +
            '</td>' +
            '<td data-label="تعداد" class="num">' + Admin.fa(it.qty) + '</td>' +
            '<td data-label="قیمت واحد" class="num">' + Admin.money(it.unitPrice) + '</td>' +
            '<td data-label="مبلغ کل" class="num"><b>' + Admin.money(it.lineTotal) + '</b></td>' +
            '</tr>';
        }).join('') + '</tbody>';

        document.getElementById('itemsTable').innerHTML = head + body;
      }

      function renderSummary() {
        var shippingCost = order.shipping.cost;
        document.getElementById('orderSummary').innerHTML =
          '<div class="summary__row"><span>جمع اقلام</span><b>' + Admin.money(order.itemsTotal) + '</b></div>' +
          (order.discountAmount
            ? '<div class="summary__row summary__row--discount"><span>تخفیف' +
            (order.discountCode ? ' (' + Admin.escapeHtml(order.discountCode) + ')' : '') +
            '</span><b>− ' + Admin.money(order.discountAmount) + '</b></div>' : '') +
          '<div class="summary__row' + (shippingCost ? '' : ' summary__row--free') + '">' +
          '<span>هزینه ارسال</span><b>' + (shippingCost ? Admin.money(shippingCost) : 'رایگان') + '</b></div>' +
          '<div class="summary__total"><span>مبلغ نهایی</span><b>' + Admin.money(order.finalAmount) + '</b></div>';
      }

      /* ========================= مدیریت پرداخت ========================== */
      function renderPayment() {
        var plan = order.paymentPlan;
        var pay = order.payment;

        var labels = {
          full: 'پرداخت کامل در یک مرحله',
          two_stage: 'پرداخت دو‌مرحله‌ای (۵۰٪ هنگام ثبت سفارش، ۵۰٪ پیش از ارسال)',
          installment: 'پرداخت اقساطی با پیش‌پرداخت و اقساط ماهانه'
        };
        document.getElementById('paymentSub').textContent = labels[plan.type] || '';

        /* نمای کلی وضعیت پرداخت */
        document.getElementById('paymentOverview').innerHTML =
          '<div class="grid grid--3" style="gap:12px">' +
          box('مبلغ کل', Admin.money(plan.totalAmount), 'info', 'banknote') +
          box('پرداخت‌شده', Admin.money(pay.paid), 'success', 'checkCircle') +
          box(pay.overdue > 0 ? 'معوق' : 'مانده',
            Admin.money(pay.overdue > 0 ? pay.overdue : pay.remaining),
            pay.overdue > 0 ? 'danger' : 'warning', pay.overdue > 0 ? 'alert' : 'clock') +
          '</div>' +
          '<div class="mt-2">' +
          '<div class="row row--between mb-1">' +
          '<span class="text-sm text-muted">پیشرفت پرداخت</span>' +
          '<b class="text-sm">' + Admin.percent(pay.progress) + '</b></div>' +
          '<span class="bar" style="height:10px"><span class="bar__fill' +
          (pay.overdue > 0 ? ' bar__fill--danger' : (pay.progress === 100 ? ' bar__fill--success' : '')) +
          '" style="width:' + pay.progress + '%"></span></span>' +
          '</div>' +
          (plan.downPayment
            ? '<p class="hint mt-2">پیش‌پرداخت این سفارش ' + Admin.money(plan.downPayment) + ' بوده است.</p>'
            : '');

        /* دکمه ارسال یادآوری گروهی برای اقساط باز */
        var openInstallments = plan.installments.filter(function (i) { return i.effectiveStatus !== 'paid'; });
        document.getElementById('paymentHeadActions').innerHTML = openInstallments.length
          ? '<a class="btn btn--soft btn--sm" target="_blank" rel="noopener" href="' +
          Admin.whatsappLink(order.customerPhone, reminderText(openInstallments[0])) + '">' +
          Admin.icon('whatsapp') + '<span>یادآوری سررسید</span></a>'
          : '<span class="badge badge--success">' + Admin.icon('checkCircle') + 'تسویه کامل</span>';

        /* جدول اقساط / مراحل */
        var head = '<thead><tr><th>عنوان</th><th>مبلغ</th><th>سررسید</th><th>وضعیت</th>' +
          '<th>تاریخ پرداخت</th><th class="col-actions">اقدام</th></tr></thead>';

        var body = '<tbody>' + plan.installments.map(function (ins) {
          var isPaid = ins.effectiveStatus === 'paid';
          var isOverdue = ins.effectiveStatus === 'overdue';

          return '<tr>' +
            '<td data-label="عنوان"><b>' + Admin.escapeHtml(ins.label) + '</b>' +
            (ins.method ? '<span class="cell-sub">' + Admin.escapeHtml(ins.method) + '</span>' : '') + '</td>' +
            '<td data-label="مبلغ" class="num"><b>' + Admin.money(ins.amount) + '</b></td>' +
            '<td data-label="سررسید">' + Admin.jDate(ins.dueDate) +
            (!isPaid ? '<span class="cell-sub' + (isOverdue ? ' text-danger' : '') + '">' +
              Admin.dueLabel(ins.dueDate) + '</span>' : '') + '</td>' +
            '<td data-label="وضعیت">' + Admin.paymentStatus(isPaid ? 'paid' : (isOverdue ? 'overdue' : 'pending')) + '</td>' +
            '<td data-label="تاریخ پرداخت">' + (ins.paidAt ? Admin.jDate(ins.paidAt) : '<span class="text-soft">—</span>') + '</td>' +
            '<td class="col-actions"><div class="cell-actions">' +
            (isPaid
              ? '<button class="act-btn" type="button" data-unpay="' + ins.index + '" ' +
              'title="لغو تایید پرداخت" aria-label="لغو تایید پرداخت">' + Admin.icon('undo') + '</button>'
              : '<button class="act-btn" type="button" data-pay="' + ins.index + '" ' +
              'title="ثبت پرداخت" aria-label="ثبت پرداخت ' + Admin.escapeHtml(ins.label) + '">' +
              Admin.icon('checkCircle') + '</button>' +
              '<button class="act-btn" type="button" data-editdue="' + ins.index + '" ' +
              'title="تغییر سررسید" aria-label="تغییر تاریخ سررسید">' + Admin.icon('calendar') + '</button>' +
              '<a class="act-btn" target="_blank" rel="noopener" title="یادآوری واتساپ" ' +
              'aria-label="ارسال یادآوری واتساپ" href="' + Admin.whatsappLink(order.customerPhone, reminderText(ins)) +
              '">' + Admin.icon('whatsapp') + '</a>') +
            '</div></td></tr>';
        }).join('') + '</tbody>';

        document.getElementById('installmentTable').innerHTML = head + body;
        bindInstallmentActions();
      }

      function box(label, value, tone, iconName) {
        return '<div style="display:flex;gap:12px;align-items:center;padding:14px;border-radius:var(--r-md);' +
          'background:var(--surface-2);border:1px solid var(--border)">' +
          '<span class="kpi__icon kpi__icon--' + tone + '">' + Admin.icon(iconName) + '</span>' +
          '<div><div class="text-xs text-muted">' + label + '</div>' +
          '<div class="fw-bold num" style="font-size:15px;color:var(--c-jet)">' + value + '</div></div></div>';
      }

      function reminderText(ins) {
        return 'سلام ' + order.customerName + ' عزیز، یادآوری می‌کنیم ' + ins.label +
          ' سفارش ' + order.orderNumber + ' به مبلغ ' + Admin.money(ins.amount) +
          ' در تاریخ ' + Admin.jDate(ins.dueDate) + ' سررسید دارد. با تشکر — فروشگاه هستی';
      }

      function bindInstallmentActions() {
        var table = document.getElementById('installmentTable');

        table.querySelectorAll('[data-pay]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            payDialog(Number(btn.getAttribute('data-pay')));
          });
        });

        table.querySelectorAll('[data-unpay]').forEach(function (btn) {
          btn.addEventListener('click', async function () {
            var index = Number(btn.getAttribute('data-unpay'));
            var ok = await Admin.confirm({
              title: 'لغو تایید پرداخت',
              danger: true, icon: 'undo',
              message: 'تایید پرداخت این قسط لغو شود؟ وضعیت آن به «در انتظار پرداخت» بازمی‌گردد.',
              confirmLabel: 'لغو تایید'
            });
            if (!ok) return;
            await dataService.updateInstallment(order.orderNumber, index, { status: 'pending', paidAt: null });
            await reload();
            Admin.toast('تایید پرداخت لغو شد', 'warning');
          });
        });

        table.querySelectorAll('[data-editdue]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            dueDateDialog(Number(btn.getAttribute('data-editdue')));
          });
        });
      }

      function payDialog(index) {
        var ins = order.paymentPlan.installments.filter(function (i) { return i.index === index; })[0];

        Admin.modal({
          title: 'ثبت پرداخت — ' + ins.label,
          subtitle: 'سفارش ' + order.orderNumber + ' · ' + order.customerName,
          icon: 'banknote',
          body:
            '<div class="summary mb-2">' +
            '<div class="summary__row"><span>مبلغ قسط</span><b>' + Admin.money(ins.amount) + '</b></div>' +
            '<div class="summary__row"><span>تاریخ سررسید</span><b>' + Admin.jDate(ins.dueDate) + '</b></div>' +
            '<div class="summary__row"><span>مانده کل سفارش پس از این پرداخت</span><b>' +
            Admin.money(order.payment.remaining - ins.amount) + '</b></div>' +
            '</div>' +
            '<div class="form-grid">' +
            '<div class="field"><label class="label" for="payDate">تاریخ پرداخت</label>' +
            '<input class="input ltr" id="payDate" value="' + dataService.today() + '" placeholder="1403-07-14">' +
            '<span class="hint">تاریخ شمسی با قالب ۱۴۰۳-۰۷-۱۴</span></div>' +
            '<div class="field"><label class="label" for="payMethod">روش پرداخت</label>' +
            '<select class="select" id="payMethod">' +
            '<option>درگاه بانکی</option><option>کارت به کارت</option>' +
            '<option>کارت‌خوان فروشگاه</option><option>نقدی</option>' +
            '</select></div></div>',
          actions: [
            { label: 'انصراف', variant: 'btn--ghost', onClick: function (m) { m.close(); } },
            {
              label: 'تایید پرداخت', variant: 'btn--success', onClick: async function (m) {
                var date = Admin.toEn(document.getElementById('payDate').value.trim());
                if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                  Admin.toast('تاریخ پرداخت باید با قالب ۱۴۰۳-۰۷-۱۴ وارد شود', 'error');
                  return;
                }
                await dataService.updateInstallment(order.orderNumber, index, {
                  status: 'paid', paidAt: date,
                  method: document.getElementById('payMethod').value
                });
                m.close();
                await reload();
                Admin.toast('پرداخت ' + ins.label + ' ثبت شد');
              }
            }
          ]
        });
      }

      function dueDateDialog(index) {
        var ins = order.paymentPlan.installments.filter(function (i) { return i.index === index; })[0];

        Admin.modal({
          title: 'تغییر تاریخ سررسید',
          subtitle: ins.label + ' — ' + Admin.money(ins.amount),
          icon: 'calendar',
          body:
            '<div class="field"><label class="label" for="newDue">تاریخ سررسید جدید</label>' +
            '<input class="input ltr" id="newDue" value="' + ins.dueDate + '" placeholder="1403-08-24"></div>' +
            '<div class="notice notice--info mt-2">' + Admin.icon('info') +
            '<span><b>هماهنگی با مشتری</b>تغییر سررسید باید با مشتری هماهنگ شود؛ ' +
            'پس از ثبت می‌توانید پیام واتساپ اطلاع‌رسانی ارسال کنید.</span></div>',
          actions: [
            { label: 'انصراف', variant: 'btn--ghost', onClick: function (m) { m.close(); } },
            {
              label: 'ذخیره سررسید', variant: 'btn--primary', onClick: async function (m) {
                var date = Admin.toEn(document.getElementById('newDue').value.trim());
                if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                  Admin.toast('تاریخ باید با قالب ۱۴۰۳-۰۸-۲۴ وارد شود', 'error');
                  return;
                }
                await dataService.updateInstallment(order.orderNumber, index, { dueDate: date });
                m.close();
                await reload();
                Admin.toast('سررسید به ' + Admin.jDate(date) + ' تغییر یافت');
              }
            }
          ]
        });
      }

      /* ============================== تاریخچه =========================== */
      function renderTimeline() {
        document.getElementById('orderTimeline').innerHTML = order.history.slice().reverse().map(function (h, i) {
          var s = Admin.ORDER_STATUS[h.status] || { label: h.status };
          var cls = i === 0 ? ' timeline__item--current' : ' timeline__item--done';
          if (h.status === 'cancelled' || h.status === 'returned') cls = ' timeline__item--danger';
          return '<div class="timeline__item' + cls + '">' +
            '<b>' + s.label + '</b>' +
            '<small>' + Admin.jDate(h.at) + ' · توسط ' + Admin.escapeHtml(h.by) + '</small>' +
            '</div>';
        }).join('');
      }

      /* ============================== مشتری ============================= */
      function renderCustomer() {
        if (!customer) {
          document.getElementById('customerBox').innerHTML =
            '<p class="text-soft text-sm">اطلاعات مشتری در دسترس نیست.</p>';
          return;
        }

        document.getElementById('customerBox').innerHTML =
          '<div class="row mb-2">' +
          '<span class="avatar avatar--lg">' + Admin.escapeHtml(initials(customer.name)) + '</span>' +
          '<div><b style="display:block;color:var(--c-jet)">' + Admin.escapeHtml(customer.name) + '</b>' +
          '<span class="tier tier--' + customer.loyaltyTier + '">' + Admin.icon('crown') +
          Admin.escapeHtml(customer.tierName) + '</span></div></div>' +
          '<dl class="dl">' +
          '<div class="dl__row"><dt>موبایل</dt><dd class="ltr">' + Admin.fa(customer.phone) + '</dd></div>' +
          '<div class="dl__row"><dt>تعداد سفارش</dt><dd>' + Admin.fa(customer.orderCount) + ' سفارش</dd></div>' +
          '<div class="dl__row"><dt>مجموع خرید</dt><dd>' + Admin.money(customer.totalSpent) + '</dd></div>' +
          '<div class="dl__row"><dt>امتیاز وفاداری</dt><dd>' + Admin.fa(customer.loyaltyPoints) + ' امتیاز</dd></div>' +
          '<div class="dl__row"><dt>عضویت</dt><dd>' + Admin.jDate(customer.joinDate) + '</dd></div>' +
          '</dl>' +
          '<a class="btn btn--ghost btn--sm btn--block mt-2" href="/admin/customers/' +
          encodeURIComponent(customer.id) + '">' + Admin.icon('user') + '<span>پرونده مشتری</span></a>';
      }

      function initials(name) {
        return String(name || '').trim().split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join('');
      }

      /* ============================ ارسال و تحویل ======================= */
      function renderShipping() {
        var s = order.shipping;
        document.getElementById('shippingBox').innerHTML =
          '<dl class="dl">' +
          '<div class="dl__row"><dt>نحوه تحویل</dt><dd>' +
          (s.type === 'pickup' ? 'تحویل حضوری' : 'ارسال پستی') + '</dd></div>' +
          (s.carrier ? '<div class="dl__row"><dt>سرویس ارسال</dt><dd>' + Admin.escapeHtml(s.carrier) + '</dd></div>' : '') +
          '<div class="dl__row"><dt>هزینه ارسال</dt><dd>' +
          (s.cost ? Admin.money(s.cost) : '<span class="text-success fw-bold">رایگان</span>') + '</dd></div>' +
          '<div class="dl__row"><dt>کد رهگیری</dt><dd class="ltr">' +
          (order.trackingCode ? Admin.fa(order.trackingCode) : '<span class="text-soft">ثبت نشده</span>') + '</dd></div>' +
          '</dl>' +
          '<div class="notice notice--info mt-2">' + Admin.icon('pin') +
          '<span><b>نشانی تحویل</b>' + Admin.escapeHtml(s.address) + '</span></div>' +
          '<button class="btn btn--ghost btn--sm btn--block mt-2" type="button" id="trackingBtn">' +
          Admin.icon('truck') + '<span>' + (order.trackingCode ? 'ویرایش' : 'ثبت') + ' کد رهگیری</span></button>';

        document.getElementById('trackingBtn').addEventListener('click', trackingDialog);
      }

      function trackingDialog() {
        Admin.modal({
          title: 'کد رهگیری مرسوله',
          icon: 'truck',
          body:
            '<div class="form-grid">' +
            '<div class="field field--full"><label class="label" for="tracking">کد رهگیری</label>' +
            '<input class="input ltr" id="tracking" value="' + Admin.escapeHtml(order.trackingCode || '') + '" ' +
            'placeholder="24 رقم" inputmode="numeric"></div>' +
            '<div class="field field--full"><label class="label" for="carrier">سرویس ارسال</label>' +
            '<select class="select" id="carrier">' +
            ['پست پیشتاز', 'تیپاکس', 'چاپار', 'پیک موتوری'].map(function (c) {
              return '<option' + (order.shipping.carrier === c ? ' selected' : '') + '>' + c + '</option>';
            }).join('') + '</select></div></div>',
          actions: [
            { label: 'انصراف', variant: 'btn--ghost', onClick: function (m) { m.close(); } },
            {
              label: 'ذخیره', variant: 'btn--primary', onClick: async function (m) {
                var code = Admin.toEn(document.getElementById('tracking').value.trim());
                if (!code) { Admin.toast('کد رهگیری را وارد کنید', 'error'); return; }
                await dataService.updateOrderTracking(order.orderNumber, code,
                  document.getElementById('carrier').value);
                m.close();
                await reload();
                Admin.toast('کد رهگیری ثبت شد');
              }
            }
          ]
        });
      }

      /* =========================== اقدام‌های سریع ======================= */
      function renderQuickActions() {
        var actions = [
          { label: 'چاپ فاکتور رسمی', icon: 'printer', onClick: printInvoice },
          { label: 'چاپ برچسب ارسال', icon: 'tag', onClick: printLabel },
          { label: 'تغییر وضعیت سفارش', icon: 'refresh', onClick: statusDialog }
        ];

        if (order.orderStatus !== 'cancelled' && order.orderStatus !== 'returned') {
          actions.push({
            label: 'لغو سفارش', icon: 'xCircle', danger: true, onClick: async function () {
              var ok = await Admin.confirm({
                title: 'لغو سفارش', danger: true, icon: 'xCircle',
                message: 'سفارش <b class="ltr">' + order.orderNumber + '</b> لغو شود؟ ' +
                  'موجودی کالاها به انبار بازگردانده می‌شود و پرداخت‌های انجام‌شده باید دستی بازگردانده شوند.',
                confirmLabel: 'لغو سفارش'
              });
              if (!ok) return;
              await dataService.updateOrderStatus(order.orderNumber, 'cancelled');
              await reload();
              Admin.toast('سفارش لغو شد', 'warning');
            }
          });
        }

        var box = document.getElementById('quickActions');
        box.innerHTML = '';
        actions.forEach(function (a) {
          var btn = Admin.el('<button type="button" class="btn ' +
            (a.danger ? 'btn--danger-ghost' : 'btn--ghost') + ' btn--sm btn--block">' +
            Admin.icon(a.icon) + '<span>' + a.label + '</span></button>');
          btn.addEventListener('click', a.onClick);
          box.appendChild(btn);
        });
      }

      /* ============================ تغییر وضعیت ========================= */
      function statusDialog() {
        Admin.modal({
          title: 'تغییر وضعیت سفارش',
          subtitle: order.orderNumber + ' — ' + order.customerName,
          icon: 'refresh',
          body:
            '<div class="field"><label class="label" for="newStatus">وضعیت جدید</label>' +
            '<select class="select" id="newStatus">' +
            Object.keys(Admin.ORDER_STATUS).map(function (k) {
              return '<option value="' + k + '"' + (k === order.orderStatus ? ' selected' : '') + '>' +
                Admin.ORDER_STATUS[k].label + '</option>';
            }).join('') + '</select></div>' +
            (order.payment.remaining > 0
              ? '<div class="notice notice--warning mt-2">' + Admin.icon('alert') +
              '<span><b>مانده پرداخت</b>این سفارش ' + Admin.money(order.payment.remaining) +
              ' مانده دارد. در پرداخت دو‌مرحله‌ای، ارسال معمولاً پس از تسویه مرحله دوم انجام می‌شود.</span></div>'
              : ''),
          actions: [
            { label: 'انصراف', variant: 'btn--ghost', onClick: function (m) { m.close(); } },
            {
              label: 'ثبت تغییر', variant: 'btn--primary', onClick: async function (m) {
                var status = document.getElementById('newStatus').value;
                await dataService.updateOrderStatus(order.orderNumber, status);
                m.close();
                await reload();
                Admin.toast('وضعیت سفارش به «' + Admin.ORDER_STATUS[status].label + '» تغییر یافت');
              }
            }
          ]
        });
      }

      /* ============================ یادداشت داخلی ======================= */
      function bindNote() {
        document.getElementById('internalNote').value = order.internalNote || '';
        document.getElementById('saveNote').addEventListener('click', async function () {
          await dataService.updateOrderNote(order.orderNumber,
            document.getElementById('internalNote').value.trim());
          Admin.toast('یادداشت ذخیره شد');
        });
      }

      async function reload() {
        order = await dataService.getOrder(orderNumber);
        renderAll();
        document.getElementById('internalNote').value = order.internalNote || '';
      }

      /* ============================== چاپ ============================== */
      function printInvoice() {
        var rows = order.items.map(function (it) {
          return '<tr><td>' + it.productName + '</td>' +
            '<td>' + it.color + ' / ' + it.size + (it.length ? ' / قد ' + Admin.fa(it.length) : '') + '</td>' +
            '<td>' + Admin.fa(it.qty) + '</td>' +
            '<td>' + Admin.money(it.unitPrice) + '</td>' +
            '<td>' + Admin.money(it.lineTotal) + '</td></tr>';
        }).join('');

        var installments = order.paymentPlan.installments.map(function (ins) {
          return '<tr><td>' + ins.label + '</td><td>' + Admin.money(ins.amount) + '</td>' +
            '<td>' + Admin.jDate(ins.dueDate) + '</td>' +
            '<td>' + (ins.effectiveStatus === 'paid' ? 'پرداخت شده' :
              (ins.effectiveStatus === 'overdue' ? 'معوق' : 'در انتظار پرداخت')) + '</td></tr>';
        }).join('');

        openPrint('فاکتور ' + order.orderNumber,
          '<section class="invoice">' +
          '<header><h1>فروشگاه هستی</h1>' +
          '<div>فاکتور فروش — شماره سفارش <b dir="ltr">' + order.orderNumber + '</b></div>' +
          '<div>تاریخ: ' + Admin.jDate(order.createdAt) + '</div></header>' +
          '<div class="meta"><div><b>مشتری:</b> ' + order.customerName + ' — ' + Admin.fa(order.customerPhone) + '</div>' +
          '<div><b>نشانی:</b> ' + order.shipping.address + '</div>' +
          '<div><b>نوع پرداخت:</b> ' + (Admin.PLAN_TYPE[order.paymentPlan.type] || {}).label + '</div>' +
          (order.trackingCode ? '<div><b>کد رهگیری:</b> ' + Admin.fa(order.trackingCode) + '</div>' : '') +
          '</div>' +
          '<table><thead><tr><th>کالا</th><th>مشخصات</th><th>تعداد</th><th>قیمت واحد</th><th>مبلغ</th></tr></thead>' +
          '<tbody>' + rows + '</tbody></table>' +
          '<div class="totals">' +
          '<div>جمع اقلام: <b>' + Admin.money(order.itemsTotal) + '</b></div>' +
          (order.discountAmount ? '<div>تخفیف: <b>' + Admin.money(order.discountAmount) + '</b></div>' : '') +
          '<div>هزینه ارسال: <b>' + (order.shipping.cost ? Admin.money(order.shipping.cost) : 'رایگان') + '</b></div>' +
          '<div class="grand">مبلغ نهایی: <b>' + Admin.money(order.finalAmount) + '</b></div></div>' +
          '<h2 style="font-size:14px;margin:18px 0 8px">برنامه پرداخت</h2>' +
          '<table><thead><tr><th>عنوان</th><th>مبلغ</th><th>سررسید</th><th>وضعیت</th></tr></thead>' +
          '<tbody>' + installments + '</tbody></table>' +
          '<footer>با تشکر از خرید شما — هستی، پوشش باوقار ایرانی · واتساپ ۰۹۱۵۲۵۰۰۵۵۳</footer>' +
          '</section>');
      }

      function printLabel() {
        openPrint('برچسب ارسال',
          '<section class="invoice" style="max-width:420px">' +
          '<header><h1>برچسب ارسال — هستی</h1>' +
          '<div dir="ltr"><b>' + order.orderNumber + '</b></div></header>' +
          '<div class="meta" style="line-height:2.2">' +
          '<div><b>گیرنده:</b> ' + order.customerName + '</div>' +
          '<div><b>موبایل:</b> ' + Admin.fa(order.customerPhone) + '</div>' +
          '<div><b>نشانی:</b> ' + order.shipping.address + '</div>' +
          '<div><b>سرویس:</b> ' + (order.shipping.carrier || 'تحویل حضوری') + '</div>' +
          '<div><b>تعداد اقلام:</b> ' + Admin.fa(order.itemsCount) + ' عدد</div>' +
          (order.payment.remaining > 0
            ? '<div style="color:#a8503f"><b>توجه:</b> مانده پرداخت ' + Admin.money(order.payment.remaining) + '</div>'
            : '<div style="color:#2f7a4f"><b>تسویه کامل شده</b></div>') +
          '</div>' +
          '<footer>فرستنده: فروشگاه هستی — مشهد · ۰۹۱۵۲۵۰۰۵۵۳</footer></section>');
      }

      function openPrint(title, content) {
        var win = window.open('', '_blank');
        win.document.write(
          '<!DOCTYPE html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>' + title + '</title>' +
          '<style>' +
          '@font-face{font-family:Sahel;src:url("../Sahel.woff2") format("woff2");font-display:swap}' +
          'body{font-family:Sahel,Tahoma,sans-serif;color:#0a0908;padding:24px;font-size:12px}' +
          '.invoice{max-width:760px;margin:0 auto}' +
          'header{border-bottom:2px solid #c6ac8f;padding-bottom:12px;margin-bottom:14px}' +
          'h1{font-size:19px;margin:0 0 6px;color:#22333b}' +
          '.meta{background:#faf7f2;padding:12px;border-radius:8px;margin-bottom:14px;line-height:2}' +
          'table{width:100%;border-collapse:collapse;margin-bottom:12px}' +
          'th,td{border:1px solid #e6ddd0;padding:8px;text-align:right}' +
          'th{background:#f4efe7;font-weight:700}' +
          '.totals{line-height:2.1;text-align:left}' +
          '.totals .grand{font-size:14px;color:#22333b;border-top:1px dashed #c6ac8f;padding-top:6px;margin-top:6px}' +
          'footer{margin-top:18px;padding-top:10px;border-top:1px dashed #c6ac8f;text-align:center;color:#5e503f}' +
          '@media print{body{padding:0}}' +
          '</style></head><body>' + content + '</body></html>'
        );
        win.document.close();
        win.focus();
        win.print();
      }
    
}
