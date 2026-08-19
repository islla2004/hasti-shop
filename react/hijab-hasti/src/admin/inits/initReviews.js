import { Admin } from '../adminShared.js';
import { dataService } from '../data/dataService.js';
import { HASTI_MOCK } from '../data/mockData.js';

export async function initReviews() {


      var reviews = [], ratings = {};
      var tableApi = null;
      var activeStatus = '';

      var STATUS_LABEL = { approved: 'تایید‌شده', pending: 'در انتظار تایید', rejected: 'رد‌شده' };

      (async function init() {
        await Admin.shell("reviews");
        Admin.tableSkeleton('#reviewTable', 6);

        var res = await Promise.all([
          dataService.getReviews(),
          dataService.getProductRatings()
        ]);
        reviews = res[0];
        ratings = res[1];

        renderKpis();
        renderTabs();
        buildTable();
        renderDistribution();
        renderTopRated();
        renderAttention();

        document.getElementById('approveAllBtn').addEventListener('click', approveAllPending);
        document.getElementById('exportBtn').addEventListener('click', exportRows);
      })();

      /* ============================== KPI ها ============================ */
      function renderKpis() {
        var approved = reviews.filter(function (r) { return r.status === 'approved'; });
        var pending = reviews.filter(function (r) { return r.status === 'pending'; });
        var replied = reviews.filter(function (r) { return r.reply; });
        var avg = approved.length
          ? Math.round(approved.reduce(function (s, r) { return s + r.rating; }, 0) / approved.length * 10) / 10
          : 0;
        var low = approved.filter(function (r) { return r.rating <= 2; }).length;

        var cards = [
          {
            label: 'میانگین امتیاز فروشگاه', value: Admin.fa(avg), unit: 'از ۵',
            icon: 'star', tone: 'warning',
            note: Admin.fa(approved.length) + ' نظر تایید‌شده'
          },
          {
            label: 'در انتظار تایید', value: Admin.fa(pending.length), unit: 'نظر',
            icon: 'clock', tone: pending.length ? 'warning' : 'success',
            note: pending.length ? 'بررسی کنید' : 'صف بررسی خالی است'
          },
          {
            label: 'نرخ پاسخ‌دهی', value: Admin.fa(reviews.length ? Math.round(replied.length / reviews.length * 100) : 0),
            unit: '٪', icon: 'message', tone: 'info',
            note: Admin.fa(replied.length) + ' نظر پاسخ داده شده'
          },
          {
            label: 'نظرهای انتقادی', value: Admin.fa(low), unit: 'نظر',
            icon: 'alert', tone: low ? 'danger' : 'success',
            note: 'امتیاز ۱ و ۲ ستاره'
          }
        ];

        document.getElementById('reviewKpis').innerHTML = cards.map(function (c, i) {
          return '<article class="kpi reveal" style="animation-delay:' + (i * 50) + 'ms">' +
            '<div class="kpi__top"><span class="kpi__label">' + Admin.escapeHtml(c.label) + '</span>' +
            '<span class="kpi__icon' + (c.tone ? ' kpi__icon--' + c.tone : '') + '">' + Admin.icon(c.icon) + '</span></div>' +
            '<div class="kpi__value">' + c.value + '<small>' + c.unit + '</small></div>' +
            '<div class="kpi__foot"><span>' + Admin.escapeHtml(c.note) + '</span></div>' +
            '</article>';
        }).join('');
      }

      /* ============================ تب وضعیت =========================== */
      function renderTabs() {
        var counts = {
          '': reviews.length,
          pending: reviews.filter(function (r) { return r.status === 'pending'; }).length,
          approved: reviews.filter(function (r) { return r.status === 'approved'; }).length,
          rejected: reviews.filter(function (r) { return r.status === 'rejected'; }).length
        };

        var defs = [
          { key: '', label: 'همه نظرها' },
          { key: 'pending', label: 'در انتظار تایید' },
          { key: 'approved', label: 'تایید‌شده' },
          { key: 'rejected', label: 'رد‌شده' }
        ];

        var box = document.getElementById('statusTabs');
        box.innerHTML = defs.map(function (d) {
          return '<button class="tab' + (activeStatus === d.key ? ' tab--active' : '') + '" type="button" ' +
            'data-status="' + d.key + '" aria-pressed="' + (activeStatus === d.key) + '">' +
            Admin.escapeHtml(d.label) +
            '<span class="tab__count">' + Admin.fa(counts[d.key] || 0) + '</span></button>';
        }).join('');

        box.querySelectorAll('[data-status]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            activeStatus = btn.getAttribute('data-status');
            renderTabs();
            tableApi.setRows(visibleRows());
          });
        });
      }

      function visibleRows() {
        if (!activeStatus) return reviews;
        return reviews.filter(function (r) { return r.status === activeStatus; });
      }

      /* =============================== جدول ============================ */
      function buildTable() {
        tableApi = Admin.table({
          mount: '#reviewTable',
          rows: visibleRows(),
          rowKey: 'id',
          pageSize: 8,
          selectable: true,
          searchKeys: ['author', 'text', 'productName'],
          searchPlaceholder: 'جست‌وجو در متن نظر، نام مشتری یا محصول…',
          defaultSort: { key: 'date', dir: 'desc' },
          filters: [
            {
              key: 'rating', label: 'امتیاز',
              options: [5, 4, 3, 2, 1].map(function (n) {
                return { value: String(n), label: Admin.fa(n) + ' ستاره' };
              })
            },
            {
              key: 'reply', label: 'وضعیت پاسخ',
              options: [
                { value: 'yes', label: 'پاسخ داده شده' },
                { value: 'no', label: 'بدون پاسخ' }
              ],
              match: function (r, v) { return v === 'yes' ? !!r.reply : !r.reply; }
            },
            {
              key: 'reported', label: 'گزارش تخلف',
              options: [{ value: 'yes', label: 'گزارش‌شده' }],
              match: function (r) { return !!r.reported; }
            }
          ],
          bulkActions: [
            { label: 'تایید', icon: 'checkCircle', variant: 'btn--soft', onClick: function (ids) { bulkStatus(ids, 'approved'); } },
            { label: 'رد', icon: 'xCircle', variant: 'btn--ghost', onClick: function (ids) { bulkStatus(ids, 'rejected'); } },
            { label: 'حذف', icon: 'trash', variant: 'btn--danger-ghost', onClick: bulkDelete }
          ],
          empty: {
            icon: 'star',
            title: 'نظری در این وضعیت نیست',
            desc: 'نظرهای ثبت‌شده در صفحه محصول، پس از تایید در فروشگاه نمایش داده می‌شوند.'
          },
          columns: [
            {
              key: 'productName', label: 'محصول', sortable: true,
              render: function (r) {
                return '<a class="cell-product" href="/admin/products/' + encodeURIComponent(r.productId) + '">' +
                  '<img class="thumb" src="' + r.productImage + '" alt="" loading="lazy" width="46" height="46">' +
                  '<div><b>' + Admin.escapeHtml(r.productName) + '</b>' +
                  '<small>' + (ratings[r.productId]
                    ? 'میانگین ' + Admin.fa(ratings[r.productId].average) + ' از ' + Admin.fa(ratings[r.productId].count) + ' نظر'
                    : 'بدون میانگین') + '</small></div></a>';
              }
            },
            {
              key: 'author', label: 'مشتری', sortable: true,
              render: function (r) {
                return '<div><b class="text-sm">' + Admin.escapeHtml(r.author) + '</b>' +
                  '<div class="cell-sub">' + (r.customerId
                    ? '<a href="/admin/customers/' + encodeURIComponent(r.customerId) + '">پروفایل مشتری</a>'
                    : 'مهمان') + '</div></div>';
              }
            },
            {
              key: 'rating', label: 'امتیاز', sortable: true, className: 'num',
              render: function (r) {
                return '<div style="display:flex;flex-direction:column;gap:3px;align-items:flex-start">' +
                  Admin.stars(r.rating) +
                  (r.reported ? Admin.badge('گزارش تخلف', 'danger', 'alert') : '') + '</div>';
              }
            },
            {
              key: 'text', label: 'متن نظر',
              render: function (r) {
                var short = r.text.length > 90 ? r.text.slice(0, 90) + '…' : r.text;
                return '<div style="max-width:320px"><span class="text-sm">' + Admin.escapeHtml(short) + '</span>' +
                  (r.reply ? '<div class="cell-sub">' + Admin.icon('message') + ' پاسخ داده شده</div>' : '') +
                  '</div>';
              }
            },
            {
              key: 'date', label: 'تاریخ', sortable: true,
              render: function (r) { return Admin.jShort(r.date); }
            },
            {
              key: 'status', label: 'وضعیت', sortable: true,
              render: function (r) {
                var tone = { approved: 'success', pending: 'warning', rejected: 'danger' };
                var ic = { approved: 'checkCircle', pending: 'clock', rejected: 'xCircle' };
                return Admin.badge(STATUS_LABEL[r.status] || r.status, tone[r.status], ic[r.status]);
              }
            },
            {
              key: 'actions', label: 'عملیات', className: 'col-actions',
              render: function (r) {
                var out = '<div class="cell-actions">';
                out += '<button class="act-btn" type="button" data-view="' + r.id + '" ' +
                  'title="مشاهده کامل" aria-label="مشاهده کامل نظر">' + Admin.icon('eye') + '</button>';
                out += '<button class="act-btn" type="button" data-reply="' + r.id + '" ' +
                  'title="پاسخ" aria-label="پاسخ به نظر">' + Admin.icon('message') + '</button>';
                if (r.status !== 'approved') {
                  out += '<button class="act-btn" type="button" data-approve="' + r.id + '" ' +
                    'title="تایید" aria-label="تایید نظر">' + Admin.icon('checkCircle') + '</button>';
                }
                if (r.status !== 'rejected') {
                  out += '<button class="act-btn" type="button" data-reject="' + r.id + '" ' +
                    'title="رد" aria-label="رد نظر">' + Admin.icon('xCircle') + '</button>';
                }
                out += '<button class="act-btn act-btn--danger" type="button" data-delete="' + r.id + '" ' +
                  'title="حذف" aria-label="حذف نظر">' + Admin.icon('trash') + '</button>';
                return out + '</div>';
              }
            }
          ]
        });

        document.getElementById('reviewTable').addEventListener('click', async function (e) {
          var view = e.target.closest('[data-view]');
          var reply = e.target.closest('[data-reply]');
          var approve = e.target.closest('[data-approve]');
          var reject = e.target.closest('[data-reject]');
          var del = e.target.closest('[data-delete]');

          if (view) viewDialog(find(view.getAttribute('data-view')));
          if (reply) replyDialog(find(reply.getAttribute('data-reply')));

          if (approve) {
            await dataService.setReviewStatus(approve.getAttribute('data-approve'), 'approved');
            await reload();
            Admin.toast('نظر تایید و در فروشگاه منتشر شد');
          }

          if (reject) {
            await dataService.setReviewStatus(reject.getAttribute('data-reject'), 'rejected');
            await reload();
            Admin.toast('نظر رد شد', 'warning');
          }

          if (del) {
            var target = find(del.getAttribute('data-delete'));
            var ok = await Admin.confirm({
              title: 'حذف نظر', danger: true, icon: 'trash',
              message: 'نظر «<b>' + Admin.escapeHtml(target.author) + '</b>» روی محصول ' +
                Admin.escapeHtml(target.productName) + ' حذف شود؟ این عمل بازگشت‌پذیر نیست.',
              confirmLabel: 'حذف نظر'
            });
            if (!ok) return;
            await dataService.deleteReview(target.id);
            await reload();
            Admin.toast('نظر حذف شد');
          }
        });
      }

      function find(id) {
        return reviews.filter(function (r) { return r.id === id; })[0];
      }

      /* ============================ دیالوگ‌ها ========================== */
      function viewDialog(r) {
        Admin.modal({
          title: 'نظر ' + r.author,
          subtitle: r.productName + ' · ' + Admin.jDate(r.date),
          icon: 'star',
          body:
            '<div class="row row--between mb-2">' + Admin.stars(r.rating) +
            Admin.badge(STATUS_LABEL[r.status] || r.status,
              r.status === 'approved' ? 'success' : (r.status === 'pending' ? 'warning' : 'danger')) + '</div>' +
            '<p class="text-sm" style="line-height:2.1">' + Admin.escapeHtml(r.text) + '</p>' +
            (r.reply
              ? '<div class="notice notice--info mt-2">' + Admin.icon('message') +
              '<div><b>پاسخ فروشگاه (' + Admin.jShort(r.replyDate) + ')</b>' +
              '<div class="text-sm">' + Admin.escapeHtml(r.reply) + '</div></div></div>'
              : '<div class="notice notice--warning mt-2">' + Admin.icon('alert') +
              '<div><b>بدون پاسخ</b><div class="text-sm">پاسخ‌دادن به نظرها اعتماد مشتری را بالا می‌برد.</div></div></div>') +
            (r.reported
              ? '<div class="notice notice--danger mt-2">' + Admin.icon('alert') +
              '<div><b>گزارش تخلف</b><div class="text-sm">این نظر توسط کاربران گزارش شده است.</div></div></div>'
              : ''),
          actions: [
            {
              label: 'پاسخ به نظر', variant: 'btn--primary',
              onClick: function (m) { m.close(); replyDialog(r); }
            },
            { label: 'بستن', variant: 'btn--ghost', onClick: function (m) { m.close(); } }
          ]
        });
      }

      function replyDialog(r) {
        Admin.modal({
          title: 'پاسخ به نظر',
          subtitle: r.author + ' · ' + r.productName,
          icon: 'message',
          body:
            '<div class="notice notice--gold mb-2">' + Admin.icon('star') +
            '<div><b>' + Admin.escapeHtml(r.author) + '</b>' +
            '<div class="text-sm">' + Admin.escapeHtml(r.text) + '</div></div></div>' +
            '<div class="field"><label class="label" for="rvReply">متن پاسخ <span class="req">*</span></label>' +
            '<textarea class="textarea" id="rvReply" rows="4" ' +
            'placeholder="سپاس از انتخاب شما…">' + Admin.escapeHtml(r.reply || '') + '</textarea>' +
            '<span class="hint">پاسخ شما زیر نظر مشتری در صفحه محصول نمایش داده می‌شود.</span></div>',
          actions: [
            { label: 'انصراف', variant: 'btn--ghost', onClick: function (m) { m.close(); } },
            {
              label: 'ثبت پاسخ', variant: 'btn--primary',
              onClick: async function (m) {
                var text = document.getElementById('rvReply').value.trim();
                if (!text) { Admin.toast('متن پاسخ را وارد کنید', 'error'); return; }
                await dataService.replyToReview(r.id, text);
                if (r.status === 'pending') await dataService.setReviewStatus(r.id, 'approved');
                m.close();
                await reload();
                Admin.toast('پاسخ ثبت شد');
              }
            }
          ]
        });
      }

      /* ========================== عملیات گروهی ========================= */
      async function bulkStatus(ids, status) {
        await Promise.all(ids.map(function (id) {
          return dataService.setReviewStatus(id, status);
        }));
        await reload();
        Admin.toast(Admin.fa(ids.length) + ' نظر ' + (status === 'approved' ? 'تایید' : 'رد') + ' شد');
      }

      async function bulkDelete(ids) {
        var ok = await Admin.confirm({
          title: 'حذف گروهی نظرها', danger: true, icon: 'trash',
          message: '<b>' + Admin.fa(ids.length) + '</b> نظر انتخاب‌شده حذف شوند؟',
          confirmLabel: 'حذف'
        });
        if (!ok) return;
        await Promise.all(ids.map(function (id) {
          return dataService.deleteReview(id);
        }));
        await reload();
        Admin.toast(Admin.fa(ids.length) + ' نظر حذف شد');
      }

      async function approveAllPending() {
        var ids = reviews.filter(function (r) { return r.status === 'pending'; })
          .map(function (r) { return r.id; });
        if (!ids.length) { Admin.toast('نظری در انتظار تایید نیست', 'info'); return; }

        var ok = await Admin.confirm({
          title: 'تایید گروهی', icon: 'checkCircle',
          message: '<b>' + Admin.fa(ids.length) + '</b> نظر در انتظار تایید شوند؟ ' +
            'پیشنهاد می‌شود پیش از تایید گروهی، متن نظرها را مرور کنید.',
          confirmLabel: 'تایید همه'
        });
        if (!ok) return;
        await bulkStatus(ids, 'approved');
      }

      function exportRows() {
        Admin.exportCsv('hasti-reviews.csv', [
          { label: 'محصول', key: 'productName' },
          { label: 'مشتری', key: 'author' },
          { label: 'امتیاز', value: function (r) { return r.rating; } },
          { label: 'متن نظر', key: 'text' },
          { label: 'تاریخ', value: function (r) { return r.date; } },
          { label: 'وضعیت', value: function (r) { return STATUS_LABEL[r.status] || r.status; } },
          { label: 'پاسخ فروشگاه', value: function (r) { return r.reply || ''; } }
        ], tableApi.getFiltered());
      }

      async function reload() {
        reviews = await dataService.getReviews();
        ratings = await dataService.getProductRatings();
        renderKpis();
        renderTabs();
        tableApi.setRows(visibleRows());
        renderDistribution();
        renderTopRated();
        renderAttention();
      }

      /* ========================= توزیع امتیازها ======================== */
      function renderDistribution() {
        var approved = reviews.filter(function (r) { return r.status === 'approved'; });
        var total = approved.length || 1;
        var box = document.getElementById('ratingDist');

        var html = '';
        [5, 4, 3, 2, 1].forEach(function (n) {
          var count = approved.filter(function (r) { return r.rating === n; }).length;
          var pct = Math.round(count / total * 100);
          var tone = n >= 4 ? '' : (n === 3 ? ' bar__fill--warning' : ' bar__fill--danger');
          html += '<div class="row row--tight" style="margin-bottom:10px">' +
            '<span class="text-sm fw-bold" style="min-width:52px">' + Admin.fa(n) + ' ' +
            Admin.icon('star') + '</span>' +
            '<div class="bar" style="flex:1"><span class="bar__fill' + tone +
            '" style="width:' + pct + '%"></span></div>' +
            '<span class="text-xs text-soft" style="min-width:64px;text-align:left">' +
            Admin.fa(count) + ' نظر</span></div>';
        });

        box.innerHTML = html;
      }

      /* ===================== محصولات با بالاترین امتیاز ================= */
      function renderTopRated() {
        var rows = Object.keys(ratings).map(function (pid) {
          var sample = reviews.filter(function (r) { return r.productId === pid; })[0];
          return {
            id: pid,
            name: sample ? sample.productName : pid,
            average: ratings[pid].average,
            count: ratings[pid].count
          };
        }).sort(function (a, b) {
          return b.average - a.average || b.count - a.count;
        }).slice(0, 5);

        document.getElementById('topRated').innerHTML = rows.length
          ? rows.map(function (p, i) {
            return '<a class="rank-item" href="/admin/products/' + encodeURIComponent(p.id) + '">' +
              '<span class="rank-item__no">' + Admin.fa(i + 1) + '</span>' +
              '<span class="rank-item__main"><b>' + Admin.escapeHtml(p.name) + '</b>' +
              '<small>' + Admin.fa(p.count) + ' نظر تایید‌شده</small></span>' +
              '<span class="rank-item__val"><b>' + Admin.fa(p.average) + '</b><small>از ۵</small></span></a>';
          }).join('')
          : '<div class="card__body"><p class="text-sm text-soft">هنوز نظر تایید‌شده‌ای ثبت نشده است.</p></div>';
      }

      /* =========================== نیازمند توجه ======================== */
      function renderAttention() {
        var items = [];

        var reported = reviews.filter(function (r) { return r.reported; });
        if (reported.length) {
          items.push({
            tone: 'danger', icon: 'alert',
            title: Admin.fa(reported.length) + ' نظر گزارش‌شده',
            desc: 'احتمال محتوای تبلیغاتی یا نامناسب'
          });
        }

        var critical = reviews.filter(function (r) { return r.rating <= 2 && !r.reply; });
        if (critical.length) {
          items.push({
            tone: 'warning', icon: 'message',
            title: Admin.fa(critical.length) + ' نظر انتقادی بی‌پاسخ',
            desc: 'پاسخ سریع، اثر منفی نظر را کم می‌کند'
          });
        }

        var pending = reviews.filter(function (r) { return r.status === 'pending'; });
        if (pending.length) {
          items.push({
            tone: 'info', icon: 'clock',
            title: Admin.fa(pending.length) + ' نظر در انتظار تایید',
            desc: 'قدیمی‌ترین: ' + Admin.jShort(pending.map(function (r) { return r.date; }).sort()[0])
          });
        }

        var box = document.getElementById('attentionList');
        box.innerHTML = items.length
          ? items.map(function (a) {
            return '<div class="alert-item alert-item--' + a.tone + '">' +
              '<span class="alert-item__icon">' + Admin.icon(a.icon) + '</span>' +
              '<span class="alert-item__main"><b>' + Admin.escapeHtml(a.title) + '</b>' +
              '<small>' + Admin.escapeHtml(a.desc) + '</small></span></div>';
          }).join('')
          : '<div class="alert-item alert-item--success">' +
          '<span class="alert-item__icon">' + Admin.icon('checkCircle') + '</span>' +
          '<span class="alert-item__main"><b>همه‌چیز مرتب است</b>' +
          '<small>نظر گزارش‌شده یا بی‌پاسخی وجود ندارد</small></span></div>';
      }
    
}
