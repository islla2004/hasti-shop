import { Admin } from '../adminShared.js';
import { dataService } from '../data/dataService.js';
import { HASTI_MOCK } from '../data/mockData.js';

export async function initDashboard() {


      var stats = null;
      var salesChart = null;
      var categoryChart = null;

      (async function init() {
        await Admin.shell("dashboard");
        Admin.initCharts();
        stats = await dataService.getDashboardStats();

        renderGreeting();
        renderKpis();
        renderTrend('daily');
        renderGoal();
        renderPaymentHealth();
        renderTopProducts();
        renderCategoryChart();
        renderAlerts();
        renderLowStock();
        bindRangeSwitch();
      })();

      /* ============================== سرصفحه ============================= */
      function renderGreeting() {
        var user = dataService.getCurrentUser();
        document.getElementById('greeting').innerHTML =
          'خوش آمدید، ' + Admin.escapeHtml(user.name.split(' ')[0]);
        document.getElementById('todayLine').textContent =
          'امروز ' + Admin.jDate(dataService.today()) + ' — ' +
          Admin.fa(stats.pendingOrderCount) + ' سفارش در انتظار تایید و ' +
          Admin.fa(stats.overdueCount) + ' قسط معوق دارید.';
      }

      /* ============================ کارت‌های KPI ========================= */
      function renderKpis() {
        var cards = [
          {
            label: 'فروش امروز', value: Admin.money(stats.todayRevenue), icon: 'banknote',
            tone: 'success', delta: stats.todayDelta, note: 'نسبت به دیروز',
            spark: stats.sparkline
          },
          {
            label: 'فروش این ماه', value: Admin.money(stats.monthRevenue), icon: 'trendUp',
            tone: '', delta: stats.monthDelta, note: 'نسبت به ماه قبل',
            spark: stats.series.monthly.revenue
          },
          {
            label: 'سفارش در انتظار تایید', value: Admin.fa(stats.pendingOrderCount), unit: 'سفارش',
            icon: 'cart', tone: 'warning',
            note: 'از مجموع ' + Admin.fa(stats.totalOrderCount) + ' سفارش',
            link: '/admin/orders?status=pending', linkLabel: 'بررسی سفارش‌ها'
          },
          {
            label: 'مطالبات معوق و سررسید نزدیک', value: Admin.money(stats.receivables),
            icon: 'wallet', tone: 'danger',
            note: Admin.fa(stats.overdueCount) + ' قسط معوق · ' + Admin.fa(stats.dueSoonCount) + ' سررسید نزدیک',
            link: '#paymentHealthTitle', linkLabel: 'پیگیری اقساط'
          }
        ];

        document.getElementById('kpiGrid').innerHTML = cards.map(function (c, i) {
          return '<article class="kpi reveal" style="animation-delay:' + (i * 60) + 'ms">' +
            '<div class="kpi__top">' +
            '<span class="kpi__label">' + Admin.escapeHtml(c.label) + '</span>' +
            '<span class="kpi__icon' + (c.tone ? ' kpi__icon--' + c.tone : '') + '">' + Admin.icon(c.icon) + '</span>' +
            '</div>' +
            '<div class="kpi__value">' + c.value + (c.unit ? '<small>' + c.unit + '</small>' : '') + '</div>' +
            '<div class="kpi__foot">' +
            (c.delta !== undefined ? Admin.deltaBadge(c.delta) : '') +
            '<span>' + Admin.escapeHtml(c.note) + '</span>' +
            (c.link ? '<a href="' + c.link + '" class="text-xs fw-bold" style="margin-inline-start:auto;color:var(--c-brown);text-decoration:underline">' +
              Admin.escapeHtml(c.linkLabel) + '</a>' : '') +
            '</div>' +
            (c.spark ? '<div class="kpi__spark">' + Admin.sparkline(c.spark) + '</div>' : '') +
            '</article>';
        }).join('');
      }

      /* =========================== نمودار روند فروش ====================== */
      function bindRangeSwitch() {
        Admin.$$('[data-range]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            Admin.$$('[data-range]').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
            btn.setAttribute('aria-pressed', 'true');
            renderTrend(btn.getAttribute('data-range'));
          });
        });
      }

      function renderTrend(range) {
        var series = stats.series[range];
        var previous = stats.series.previous[range];
        var titles = { daily: 'روند فروش روزانه', weekly: 'روند فروش هفتگی', monthly: 'روند فروش ماهانه' };
        document.getElementById('trendTitle').textContent = titles[range];

        var canvas = document.getElementById('salesChart');
        if (salesChart) salesChart.destroy();

        salesChart = new Chart(canvas, {
          type: 'bar',
          data: {
            labels: series.labels,
            datasets: [
              {
                label: 'فروش دوره جاری',
                data: series.revenue,
                backgroundColor: function (ctx) {
                  var chart = ctx.chart;
                  if (!chart.chartArea) return 'rgba(198,172,143,.7)';
                  return Admin.goldGradient(chart.ctx, chart.chartArea, 0.95, 0.25);
                },
                borderRadius: 8,
                borderSkipped: false,
                maxBarThickness: 42,
                order: 2
              },
              {
                label: 'دوره قبل',
                type: 'line',
                data: previous,
                borderColor: '#22333b',
                borderWidth: 2,
                borderDash: [5, 4],
                pointRadius: 3,
                pointBackgroundColor: '#22333b',
                tension: 0.35,
                fill: false,
                order: 1
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
              legend: {
                display: true,
                position: 'bottom',
                labels: {
                  usePointStyle: true, pointStyle: 'circle', boxWidth: 8, padding: 16,
                  font: { family: 'Sahel', size: 11.5 }
                }
              },
              tooltip: {
                callbacks: {
                  label: function (item) {
                    return item.dataset.label + ': ' + Admin.money(item.parsed.y);
                  }
                }
              }
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: { font: { family: 'Sahel' } },
                reverse: true /* RTL: محور زمان از راست به چپ */
              },
              y: {
                border: { display: false },
                grid: { color: 'rgba(94,80,63,.1)' },
                ticks: {
                  padding: 8,
                  callback: function (value) { return Admin.moneyShort(value); },
                  font: { family: 'Sahel' }
                }
              }
            }
          }
        });

        renderTrendTable(series, previous);
      }

      /* جدول جایگزین نمودار — نمودار تنها برای صفحه‌خوان کافی نیست */
      function renderTrendTable(series, previous) {
        var html = '<thead><tr><th>بازه</th><th>فروش دوره جاری</th><th>دوره قبل</th><th>تغییر</th></tr></thead><tbody>';
        series.labels.forEach(function (label, i) {
          var now = series.revenue[i], before = previous[i];
          var change = before ? Math.round((now - before) / before * 100) : 0;
          html += '<tr><td>' + Admin.escapeHtml(label) + '</td>' +
            '<td class="num">' + Admin.money(now) + '</td>' +
            '<td class="num">' + Admin.money(before) + '</td>' +
            '<td>' + Admin.deltaBadge(change) + '</td></tr>';
        });
        html += '</tbody>';
        document.getElementById('trendTable').innerHTML = html;
      }

      /* ========================== هدف فروش ماهانه ======================= */
      function renderGoal() {
        var goal = stats.goal;
        var pct = Math.round(goal.achieved / goal.target * 100);
        var remaining = Math.max(0, goal.target - goal.achieved);

        document.getElementById('goalBox').innerHTML =
          Admin.gaugeSvg(pct, 172, 15) +
          '<div class="mt-2">' +
          '<div class="text-sm text-muted mb-1">' + Admin.escapeHtml(goal.month) + '</div>' +
          '<div class="summary" style="text-align:right">' +
          '<div class="summary__row"><span>هدف ماه</span><b>' + Admin.money(goal.target) + '</b></div>' +
          '<div class="summary__row"><span>محقق‌شده</span><b class="text-success">' + Admin.money(goal.achieved) + '</b></div>' +
          '<div class="summary__row"><span>باقی‌مانده</span><b>' + Admin.money(remaining) + '</b></div>' +
          '</div>' +
          '</div>';
      }

      /* ==================== سلامت پرداخت اقساطی/دومرحله‌ای ============== */
      function renderPaymentHealth() {
        document.getElementById('paymentHealthStats').innerHTML =
          '<div class="grid grid--3" style="gap:12px">' +
          statBox('مجموع مطالبات معوق', Admin.money(stats.overdueTotal),
            Admin.fa(stats.overdueCount) + ' قسط', 'danger', 'alert') +
          statBox('سررسید ۷ روز آینده', Admin.money(stats.dueSoonTotal),
            Admin.fa(stats.dueSoonCount) + ' قسط', 'warning', 'clock') +
          statBox('مجموع مطالبات', Admin.money(stats.receivables),
            Admin.fa(stats.overdueCount + stats.dueSoonCount) + ' مورد', 'info', 'wallet') +
          '</div>';

        var rows = stats.paymentRows;
        if (!rows.length) {
          document.getElementById('paymentHealthTable').appendChild(Admin.emptyState({
            icon: 'checkCircle',
            title: 'هیچ قسط معوق یا نزدیک به سررسیدی وجود ندارد',
            desc: 'همه پرداخت‌های اقساطی و دو‌مرحله‌ای به‌روز هستند.'
          }));
          return;
        }

        Admin.table({
          mount: '#paymentHealthTable',
          rows: rows.map(function (r, i) { return Object.assign({ id: 'ph_' + i }, r); }),
          rowKey: 'id',
          pageSize: 5,
          cards: true,
          columns: [
            {
              key: 'orderNumber', label: 'شماره سفارش', sortable: true,
              render: function (r) {
                return '<a class="fw-bold ltr" style="color:var(--c-jet);text-decoration:underline" ' +
                  'href="/admin/orders/' + encodeURIComponent(r.orderNumber) + '">' +
                  Admin.escapeHtml(r.orderNumber) + '</a>' +
                  '<span class="cell-sub">' + Admin.planType(r.planType) + '</span>';
              }
            },
            {
              key: 'customerName', label: 'مشتری', sortable: true,
              render: function (r) {
                return '<b>' + Admin.escapeHtml(r.customerName) + '</b>' +
                  '<span class="cell-sub ltr">' + Admin.fa(r.customerPhone) + '</span>';
              }
            },
            { key: 'label', label: 'قسط / مرحله', render: function (r) { return Admin.escapeHtml(r.label); } },
            {
              key: 'amount', label: 'مبلغ', sortable: true, className: 'num',
              render: function (r) { return '<b>' + Admin.money(r.amount) + '</b>'; }
            },
            {
              key: 'dueDate', label: 'سررسید', sortable: true,
              render: function (r) {
                return Admin.jDate(r.dueDate) +
                  '<span class="cell-sub">' + Admin.dueLabel(r.dueDate) + '</span>';
              }
            },
            {
              key: 'state', label: 'وضعیت',
              render: function (r) {
                return r.state === 'overdue'
                  ? Admin.badge('معوق', 'danger', 'alert')
                  : Admin.badge('سررسید نزدیک', 'warning', 'clock');
              }
            },
            {
              key: 'actions', label: 'اقدام', className: 'col-actions',
              render: function (r) {
                var text = 'سلام ' + r.customerName + ' عزیز، یادآوری می‌کنیم ' + r.label +
                  ' سفارش ' + r.orderNumber + ' به مبلغ ' + Admin.money(r.amount) +
                  ' در تاریخ ' + Admin.jDate(r.dueDate) + ' سررسید دارد. با تشکر — فروشگاه هستی';
                return '<div class="cell-actions">' +
                  '<a class="act-btn" title="ارسال یادآوری واتساپ" aria-label="ارسال یادآوری واتساپ به ' +
                  Admin.escapeHtml(r.customerName) + '" target="_blank" rel="noopener" href="' +
                  Admin.whatsappLink(r.customerPhone, text) + '">' + Admin.icon('whatsapp') + '</a>' +
                  '<a class="act-btn" title="مشاهده سفارش" aria-label="مشاهده سفارش" href="/admin/orders/' +
                  encodeURIComponent(r.orderNumber) + '">' + Admin.icon('eye') + '</a>' +
                  '</div>';
              }
            }
          ]
        });
      }

      function statBox(label, value, sub, tone, iconName) {
        return '<div style="display:flex;gap:12px;align-items:center;padding:14px;border-radius:var(--r-md);' +
          'background:var(--surface-2);border:1px solid var(--border)">' +
          '<span class="kpi__icon kpi__icon--' + tone + '">' + Admin.icon(iconName) + '</span>' +
          '<div><div class="text-xs text-muted">' + Admin.escapeHtml(label) + '</div>' +
          '<div class="fw-bold num" style="font-size:16px;color:var(--c-jet)">' + value + '</div>' +
          '<div class="text-xs text-soft">' + Admin.escapeHtml(sub) + '</div></div>' +
          '</div>';
      }

      /* ======================== پرفروش‌ترین محصولات ===================== */
      function renderTopProducts() {
        document.getElementById('topProducts').innerHTML = stats.topProducts.map(function (p, i) {
          return '<a class="rank-item" href="/admin/products/' + encodeURIComponent(p.id) + '">' +
            '<span class="rank-item__no">' + Admin.fa(i + 1) + '</span>' +
            '<img class="thumb" src="' + p.image + '" alt="' + Admin.escapeHtml(p.name) + '" loading="lazy" width="46" height="46">' +
            '<span class="rank-item__main"><b>' + Admin.escapeHtml(p.name) + '</b>' +
            '<small>' + Admin.escapeHtml(p.categoryName) + '</small></span>' +
            '<span class="rank-item__val"><b>' + Admin.moneyShort(p.revenue) + '</b>' +
            '<small>' + Admin.fa(p.salesCount) + ' فروش</small></span>' +
            '</a>';
        }).join('');
      }

      /* ==================== درآمد به تفکیک دسته‌بندی ==================== */
      function renderCategoryChart() {
        var data = stats.byCategory;
        var total = data.reduce(function (s, d) { return s + d.revenue; }, 0);

        categoryChart = new Chart(document.getElementById('categoryChart'), {
          type: 'doughnut',
          data: {
            labels: data.map(function (d) { return d.name; }),
            datasets: [{
              data: data.map(function (d) { return d.revenue; }),
              backgroundColor: Admin.CHART_COLORS,
              borderColor: '#fffdfa',
              borderWidth: 3,
              hoverOffset: 8
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '64%',
            plugins: {
              tooltip: {
                callbacks: {
                  label: function (item) {
                    var pct = Math.round(item.parsed / total * 100);
                    return item.label + ': ' + Admin.money(item.parsed) + ' (' + Admin.percent(pct) + ')';
                  }
                }
              }
            }
          }
        });

        /* راهنمای تعاملی — کلیک برای نمایش/مخفی کردن هر بخش */
        document.getElementById('categoryLegend').innerHTML = data.map(function (d, i) {
          var pct = Math.round(d.revenue / total * 100);
          return '<button type="button" class="legend__item" data-index="' + i + '" aria-pressed="true">' +
            '<span class="legend__dot" style="background:' + Admin.CHART_COLORS[i] + '"></span>' +
            '<span>' + Admin.escapeHtml(d.name) + '</span>' +
            '<b>' + Admin.moneyShort(d.revenue) + ' · ' + Admin.percent(pct) + '</b>' +
            '</button>';
        }).join('');

        Admin.$$('#categoryLegend .legend__item').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var idx = Number(btn.getAttribute('data-index'));
            var meta = categoryChart.getDatasetMeta(0);
            meta.data[idx].hidden = !meta.data[idx].hidden;
            btn.setAttribute('aria-pressed', meta.data[idx].hidden ? 'false' : 'true');
            categoryChart.update();
          });
        });
      }

      /* ========================== هشدارها و اقدام‌ها ==================== */
      function renderAlerts() {
        var items = [
          {
            tone: 'warning', icon: 'cart',
            title: Admin.fa(stats.pendingOrderCount) + ' سفارش در انتظار تایید پرداخت',
            desc: 'بررسی و تایید کنید تا آماده‌سازی آغاز شود.',
            href: '/admin/orders?status=pending', label: 'بررسی'
          },
          {
            tone: 'danger', icon: 'warehouse',
            title: Admin.fa(stats.lowStock.length) + ' محصول رو به اتمام یا ناموجود',
            desc: 'موجودی را پیش از از‌دست‌رفتن فروش تکمیل کنید.',
            href: '/admin/inventory', label: 'مدیریت انبار'
          },
          {
            tone: '', icon: 'star',
            title: Admin.fa(stats.pendingReviews) + ' نظر در انتظار تایید',
            desc: 'نظرات تاییدشده در صفحه محصول نمایش داده می‌شوند.',
            href: '/admin/reviews?status=pending', label: 'بررسی نظرات'
          },
          {
            tone: 'info', icon: 'message',
            title: Admin.fa(stats.openTickets) + ' تیکت پشتیبانی باز',
            desc: 'پاسخ سریع، رضایت مشتری را افزایش می‌دهد.',
            href: '/admin/messages', label: 'پاسخ‌دهی'
          }
        ];

        /* درخواست‌های اطلاع‌رسانی آماده ارسال — اقدام گروهی مهم */
        if (stats.readyRestock.length) {
          items.push({
            tone: 'success', icon: 'bell',
            title: Admin.fa(stats.readyRestock.length) + ' درخواست اطلاع از موجودی آماده ارسال',
            desc: 'محصولات این درخواست‌ها موجود شده‌اند؛ اطلاع‌رسانی گروهی ارسال کنید.',
            href: '/admin/messages#restock', label: 'ارسال اطلاع‌رسانی'
          });
        }

        document.getElementById('alertList').innerHTML = items.map(function (a) {
          return '<a class="alert-item' + (a.tone ? ' alert-item--' + a.tone : '') + '" href="' + a.href + '">' +
            '<span class="alert-item__icon">' + Admin.icon(a.icon) + '</span>' +
            '<span class="alert-item__main"><b>' + Admin.escapeHtml(a.title) + '</b>' +
            '<small>' + Admin.escapeHtml(a.desc) + '</small></span>' +
            '<span class="btn btn--xs btn--soft">' + Admin.escapeHtml(a.label) + '</span>' +
            '</a>';
        }).join('');
      }

      /* ======================== محصولات رو به اتمام ===================== */
      function renderLowStock() {
        var list = stats.lowStock.slice(0, 6);
        var box = document.getElementById('lowStockList');

        if (!list.length) {
          box.appendChild(Admin.emptyState({
            icon: 'checkCircle',
            title: 'موجودی همه محصولات مناسب است',
            desc: 'هیچ محصولی به آستانه هشدار موجودی نرسیده است.'
          }));
          return;
        }

        box.innerHTML = '<div class="rank-list">' + list.map(function (p) {
          var isOut = p.totalStock === 0;
          return '<a class="rank-item" href="/admin/inventory?product=' + encodeURIComponent(p.id) + '">' +
            '<img class="thumb" src="' + p.images[0] + '" alt="' + Admin.escapeHtml(p.name) + '" loading="lazy" width="46" height="46">' +
            '<span class="rank-item__main"><b>' + Admin.escapeHtml(p.name) + '</b>' +
            '<small>' + Admin.escapeHtml(p.categoryName) + ' · آستانه ' + Admin.fa(p.lowStockThreshold) + ' عدد</small></span>' +
            '<span class="rank-item__val">' +
            (isOut ? Admin.badge('ناموجود', 'danger', 'alert')
              : Admin.badge(Admin.fa(p.totalStock) + ' عدد', 'warning', 'clock')) +
            '</span></a>';
        }).join('') + '</div>';
      }
    
}
