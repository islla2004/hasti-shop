import { Admin } from '../adminShared.js';
import { dataService } from '../data/dataService.js';
import { HASTI_MOCK } from '../data/mockData.js';

export async function initReports() {


      var stats = null, profit = null, inventory = null, health = null, customers = [];
      var trendChart = null, categoryChart = null;

      (async function init() {
        await Admin.shell("reports");
        Admin.initCharts();

        var res = await Promise.all([
          dataService.getDashboardStats(),
          dataService.getProfitReport(),
          dataService.getInventoryReport(),
          dataService.getPaymentHealth(),
          dataService.getTopCustomers()
        ]);
        stats = res[0];
        profit = res[1];
        inventory = res[2];
        health = res[3];
        customers = res[4];

        renderSub();
        renderKpis();
        renderTrend('monthly');
        bindRange();
        renderProfitSummary();
        renderProfitTable();
        renderCategoryChart();
        renderTopProducts();
        renderCustomerTable();
        renderInventoryBox();
        renderPayments();
        renderStagnant();

        document.getElementById('printBtn').addEventListener('click', function () { window.print(); });
        document.getElementById('exportProfitBtn').addEventListener('click', exportProfit);
        document.getElementById('exportCustomersBtn').addEventListener('click', exportCustomers);
        document.getElementById('exportPaymentsBtn').addEventListener('click', exportPayments);
      })();

      function renderSub() {
        document.getElementById('reportSub').textContent =
          'گزارش تا تاریخ ' + Admin.jDate(dataService.today()) + ' — حاشیه سود کل ' +
          Admin.percent(profit.totalRevenue
            ? Math.round(profit.totalProfit / profit.totalRevenue * 100) : 0) +
          ' و مطالبات باز ' + Admin.money(health.overdueTotal + health.dueSoonTotal) + '.';
      }

      /* ============================== KPI ها ============================ */
      function renderKpis() {
        var margin = profit.totalRevenue
          ? Math.round(profit.totalProfit / profit.totalRevenue * 100) : 0;

        var cards = [
          {
            label: 'درآمد این ماه', value: Admin.money(stats.monthRevenue),
            icon: 'banknote', tone: 'success', delta: stats.monthDelta,
            note: 'نسبت به ماه قبل', spark: stats.series.monthly.revenue
          },
          {
            label: 'سود ناخالص کل', value: Admin.money(profit.totalProfit),
            icon: 'trendUp', tone: '', note: 'حاشیه سود ' + Admin.percent(margin)
          },
          {
            label: 'ارزش موجودی انبار', value: Admin.money(inventory.totalValue),
            icon: 'warehouse', tone: 'info',
            note: Admin.fa(inventory.totalUnits) + ' عدد کالا در انبار'
          },
          {
            label: 'مطالبات باز', value: Admin.money(health.overdueTotal + health.dueSoonTotal),
            icon: 'wallet', tone: health.overdueTotal ? 'danger' : 'warning',
            note: Admin.fa(health.overdueCount) + ' معوق · ' + Admin.fa(health.dueSoonCount) + ' سررسید نزدیک',
            link: '#payments', linkLabel: 'مشاهده جزئیات'
          }
        ];

        document.getElementById('reportKpis').innerHTML = cards.map(function (c, i) {
          return '<article class="kpi reveal" style="animation-delay:' + (i * 60) + 'ms">' +
            '<div class="kpi__top"><span class="kpi__label">' + Admin.escapeHtml(c.label) + '</span>' +
            '<span class="kpi__icon' + (c.tone ? ' kpi__icon--' + c.tone : '') + '">' + Admin.icon(c.icon) + '</span></div>' +
            '<div class="kpi__value">' + c.value + '</div>' +
            '<div class="kpi__foot">' +
            (c.delta !== undefined ? Admin.deltaBadge(c.delta) : '') +
            '<span>' + Admin.escapeHtml(c.note) + '</span>' +
            (c.link ? '<a href="' + c.link + '" class="text-xs fw-bold" ' +
              'style="margin-inline-start:auto;color:var(--c-brown);text-decoration:underline">' +
              Admin.escapeHtml(c.linkLabel) + '</a>' : '') +
            '</div>' +
            (c.spark ? '<div class="kpi__spark">' + Admin.sparkline(c.spark) + '</div>' : '') +
            '</article>';
        }).join('');
      }

      /* =========================== نمودار روند ========================= */
      function bindRange() {
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

        if (trendChart) trendChart.destroy();

        trendChart = new Chart(document.getElementById('trendChart'), {
          type: 'bar',
          data: {
            labels: series.labels,
            datasets: [
              {
                type: 'bar',
                label: 'درآمد',
                data: series.revenue,
                backgroundColor: function (ctx) {
                  var chart = ctx.chart;
                  if (!chart.chartArea) return 'rgba(198,172,143,.7)';
                  return Admin.goldGradient(chart.ctx, chart.chartArea, 0.95, 0.25);
                },
                borderRadius: 8,
                borderSkipped: false,
                maxBarThickness: 46,
                yAxisID: 'y',
                order: 3
              },
              {
                type: 'line',
                label: 'درآمد دوره قبل',
                data: previous,
                borderColor: '#22333b',
                borderWidth: 2,
                borderDash: [5, 4],
                pointRadius: 3,
                pointBackgroundColor: '#22333b',
                tension: 0.35,
                fill: false,
                yAxisID: 'y',
                order: 2
              },
              {
                type: 'line',
                label: 'تعداد سفارش',
                data: series.orders,
                borderColor: '#5e503f',
                backgroundColor: '#5e503f',
                borderWidth: 2,
                pointRadius: 3,
                tension: 0.35,
                fill: false,
                yAxisID: 'y1',
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
                display: true, position: 'bottom',
                labels: {
                  usePointStyle: true, pointStyle: 'circle', boxWidth: 8, padding: 16,
                  font: { family: 'Sahel', size: 11.5 }
                }
              },
              tooltip: {
                callbacks: {
                  label: function (item) {
                    return item.dataset.yAxisID === 'y1'
                      ? item.dataset.label + ': ' + Admin.fa(item.parsed.y) + ' سفارش'
                      : item.dataset.label + ': ' + Admin.money(item.parsed.y);
                  }
                }
              }
            },
            scales: {
              y: {
                position: 'right',
                ticks: {
                  callback: function (v) { return Admin.moneyShort(v); },
                  font: { family: 'Sahel', size: 11 }
                }
              },
              y1: {
                position: 'left',
                grid: { drawOnChartArea: false },
                ticks: {
                  callback: function (v) { return Admin.fa(v); },
                  font: { family: 'Sahel', size: 11 }
                }
              }
            }
          }
        });

        renderTrendTable(series, previous);
      }

      function renderTrendTable(series, previous) {
        var head = '<thead><tr><th>بازه</th><th class="num">درآمد</th>' +
          '<th class="num">دوره قبل</th><th class="num">تعداد سفارش</th></tr></thead>';
        var body = '<tbody>' + series.labels.map(function (l, i) {
          return '<tr><td data-label="بازه">' + Admin.escapeHtml(l) + '</td>' +
            '<td class="num" data-label="درآمد">' + Admin.money(series.revenue[i]) + '</td>' +
            '<td class="num" data-label="دوره قبل">' + Admin.money(previous[i] || 0) + '</td>' +
            '<td class="num" data-label="تعداد سفارش">' + Admin.fa(series.orders[i]) + '</td></tr>';
        }).join('') + '</tbody>';
        document.getElementById('trendTable').innerHTML = head + body;
      }

      /* ============================ سود محصولات ======================== */
      function renderProfitSummary() {
        var margin = profit.totalRevenue
          ? Math.round(profit.totalProfit / profit.totalRevenue * 100) : 0;

        document.getElementById('profitSummary').innerHTML =
          '<div class="summary__row"><span>درآمد کل</span><b>' + Admin.money(profit.totalRevenue) + '</b></div>' +
          '<div class="summary__row"><span>بهای تمام‌شده</span><b>' + Admin.money(profit.totalCost) + '</b></div>' +
          '<div class="summary__total"><span>سود ناخالص</span><b>' + Admin.money(profit.totalProfit) + '</b></div>' +
          '<div class="summary__row"><span>حاشیه سود</span><b class="text-success">' +
          Admin.percent(margin) + '</b></div>';
      }

      function renderProfitTable() {
        Admin.table({
          mount: '#profitTable',
          rows: profit.rows,
          rowKey: 'id',
          pageSize: 8,
          searchKeys: ['name', 'categoryName'],
          searchPlaceholder: 'جست‌وجو در محصولات…',
          defaultSort: { key: 'profit', dir: 'desc' },
          filters: [
            {
              key: 'categoryName', label: 'دسته‌بندی',
              options: uniqueCategories()
            },
            {
              key: 'margin', label: 'حاشیه سود',
              options: [
                { value: 'high', label: 'بالای ۵۰٪' },
                { value: 'mid', label: '۳۰٪ تا ۵۰٪' },
                { value: 'low', label: 'کمتر از ۳۰٪' }
              ],
              match: function (r, v) {
                if (v === 'high') return r.margin > 50;
                if (v === 'mid') return r.margin >= 30 && r.margin <= 50;
                return r.margin < 30;
              }
            }
          ],
          empty: { icon: 'chart', title: 'داده‌ای برای گزارش سود نیست' },
          columns: [
            {
              key: 'name', label: 'محصول', sortable: true,
              render: function (r) {
                return '<a class="cell-product" href="/admin/products/' + encodeURIComponent(r.id) + '">' +
                  '<img class="thumb" src="' + r.image + '" alt="" loading="lazy" width="46" height="46">' +
                  '<div><b>' + Admin.escapeHtml(r.name) + '</b>' +
                  '<small>' + Admin.escapeHtml(r.categoryName) + '</small></div></a>';
              }
            },
            {
              key: 'salesCount', label: 'فروش', sortable: true, className: 'num',
              render: function (r) { return Admin.fa(r.salesCount) + ' عدد'; }
            },
            {
              key: 'revenue', label: 'درآمد', sortable: true, className: 'num',
              render: function (r) { return Admin.money(r.revenue); }
            },
            {
              key: 'cost', label: 'بهای تمام‌شده', sortable: true, className: 'num',
              render: function (r) { return '<span class="text-soft">' + Admin.money(r.cost) + '</span>'; }
            },
            {
              key: 'profit', label: 'سود', sortable: true, className: 'num',
              render: function (r) { return '<b class="text-success">' + Admin.money(r.profit) + '</b>'; }
            },
            {
              key: 'margin', label: 'حاشیه سود', sortable: true,
              render: function (r) {
                var tone = r.margin >= 50 ? '' : (r.margin >= 30 ? ' bar__fill--warning' : ' bar__fill--danger');
                return '<div style="min-width:112px"><div class="bar"><span class="bar__fill' + tone +
                  '" style="width:' + Math.min(100, r.margin) + '%"></span></div>' +
                  '<span class="cell-sub">' + Admin.percent(r.margin) + '</span></div>';
              }
            }
          ]
        });
      }

      function uniqueCategories() {
        var seen = {};
        profit.rows.forEach(function (r) { seen[r.categoryName] = true; });
        return Object.keys(seen).map(function (c) { return { value: c, label: c }; });
      }

      /* ========================= نمودار دسته‌بندی ====================== */
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

        document.getElementById('categoryLegend').innerHTML = data.map(function (d, i) {
          var pct = Math.round(d.revenue / total * 100);
          return '<button type="button" class="legend__item" data-index="' + i + '" aria-pressed="true">' +
            '<span class="legend__dot" style="background:' + Admin.CHART_COLORS[i] + '"></span>' +
            '<span>' + Admin.escapeHtml(d.name) + '</span>' +
            '<b>' + Admin.moneyShort(d.revenue) + ' · ' + Admin.percent(pct) + '</b></button>';
        }).join('');

        Admin.$$('#categoryLegend .legend__item').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var idx = Number(btn.getAttribute('data-index'));
            var on = btn.getAttribute('aria-pressed') === 'true';
            btn.setAttribute('aria-pressed', String(!on));
            categoryChart.toggleDataVisibility(idx);
            categoryChart.update();
          });
        });
      }

      /* ======================== پرفروش‌ترین محصولات ==================== */
      function renderTopProducts() {
        document.getElementById('topProducts').innerHTML = stats.topProducts.map(function (p, i) {
          return '<a class="rank-item" href="/admin/products/' + encodeURIComponent(p.id) + '">' +
            '<span class="rank-item__no">' + Admin.fa(i + 1) + '</span>' +
            '<span class="rank-item__main"><b>' + Admin.escapeHtml(p.name) + '</b>' +
            '<small>' + Admin.escapeHtml(p.categoryName) + ' · ' + Admin.fa(p.salesCount) + ' فروش</small></span>' +
            '<span class="rank-item__val"><b>' + Admin.moneyShort(p.revenue) + '</b><small>تومان</small></span></a>';
        }).join('');
      }

      /* =========================== مشتریان برتر ======================== */
      function renderCustomerTable() {
        Admin.table({
          mount: '#customerTable',
          rows: customers,
          rowKey: 'id',
          pageSize: 6,
          columns: [
            {
              key: 'name', label: 'مشتری', sortable: true,
              render: function (c) {
                return '<a href="/admin/customers/' + encodeURIComponent(c.id) + '">' +
                  '<b class="text-sm">' + Admin.escapeHtml(c.name) + '</b></a>' +
                  '<div class="cell-sub ltr">' + Admin.fa(c.phone) + '</div>';
              }
            },
            {
              key: 'loyaltyTier', label: 'سطح',
              render: function (c) {
                var map = { gold: 'tier--gold', silver: 'tier--silver', bronze: 'tier--bronze' };
                return '<span class="tier ' + (map[c.loyaltyTier] || 'tier--bronze') + '">' +
                  Admin.icon('crown') + Admin.escapeHtml(c.tierName || '—') + '</span>';
              }
            },
            {
              key: 'totalOrders', label: 'سفارش', sortable: true, className: 'num',
              render: function (c) { return Admin.fa(c.totalOrders); }
            },
            {
              key: 'totalSpent', label: 'مجموع خرید', sortable: true, className: 'num',
              render: function (c) { return '<b>' + Admin.money(c.totalSpent) + '</b>'; }
            }
          ],
          empty: { icon: 'users', title: 'مشتری‌ای ثبت نشده است' }
        });
      }

      /* ========================= ارزش‌گذاری انبار ===================== */
      function renderInventoryBox() {
        var box = document.getElementById('inventoryBox');
        var okCount = inventory.rows.length - inventory.lowCount - inventory.outCount;
        var total = inventory.rows.length || 1;

        box.innerHTML =
          '<div class="summary mb-3">' +
          '<div class="summary__row"><span>ارزش کل موجودی (بهای تمام‌شده)</span><b>' +
          Admin.money(inventory.totalValue) + '</b></div>' +
          '<div class="summary__row"><span>تعداد کل کالا</span><b>' +
          Admin.fa(inventory.totalUnits) + ' عدد</b></div>' +
          '<div class="summary__row"><span>تنوع‌های ثبت‌شده</span><b>' +
          Admin.fa(inventory.rows.length) + ' تنوع</b></div>' +
          '</div>' +
          barRow('موجودی سالم', okCount, total, '') +
          barRow('کم‌موجود', inventory.lowCount, total, ' bar__fill--warning') +
          barRow('ناموجود', inventory.outCount, total, ' bar__fill--danger') +
          '<div class="row row--tight mt-3">' +
          Admin.badge(Admin.fa(inventory.stagnant.length) + ' کالای راکد', 'warning', 'clock') +
          Admin.badge(Admin.fa(inventory.outCount) + ' تنوع ناموجود', 'danger', 'alert') +
          '</div>';
      }

      function barRow(label, count, total, tone) {
        var pct = Math.round(count / total * 100);
        return '<div class="row row--tight" style="margin-bottom:10px">' +
          '<span class="text-sm" style="min-width:96px">' + label + '</span>' +
          '<div class="bar" style="flex:1"><span class="bar__fill' + tone +
          '" style="width:' + pct + '%"></span></div>' +
          '<span class="text-xs text-soft" style="min-width:74px;text-align:left">' +
          Admin.fa(count) + ' · ' + Admin.percent(pct) + '</span></div>';
      }

      /* ============================ مطالبات =========================== */
      function renderPayments() {
        var receivables = health.overdueTotal + health.dueSoonTotal;

        document.getElementById('paymentStats').innerHTML =
          '<div class="grid grid--3" style="gap:12px">' +
          statBox('مطالبات معوق', Admin.money(health.overdueTotal),
            Admin.fa(health.overdueCount) + ' قسط', 'danger', 'alert') +
          statBox('سررسید ۷ روز آینده', Admin.money(health.dueSoonTotal),
            Admin.fa(health.dueSoonCount) + ' قسط', 'warning', 'clock') +
          statBox('مجموع مطالبات باز', Admin.money(receivables),
            Admin.fa(health.overdueCount + health.dueSoonCount) + ' مورد', 'info', 'wallet') +
          '</div>';

        if (!health.rows.length) {
          document.getElementById('paymentTable').appendChild(Admin.emptyState({
            icon: 'checkCircle',
            title: 'مطالبه بازی وجود ندارد',
            desc: 'همه اقساط و پرداخت‌های دو‌مرحله‌ای به‌روز هستند.'
          }));
          return;
        }

        Admin.table({
          mount: '#paymentTable',
          rows: health.rows.map(function (r, i) { return Object.assign({ id: 'pay_' + i }, r); }),
          rowKey: 'id',
          pageSize: 8,
          searchKeys: ['orderNumber', 'customerName', 'customerPhone'],
          searchPlaceholder: 'جست‌وجو با شماره سفارش یا نام مشتری…',
          defaultSort: { key: 'dueDate', dir: 'asc' },
          filters: [
            {
              key: 'state', label: 'وضعیت',
              options: [
                { value: 'overdue', label: 'معوق' },
                { value: 'due_soon', label: 'سررسید نزدیک' }
              ]
            },
            {
              key: 'planType', label: 'نوع پرداخت',
              options: [
                { value: 'two_stage', label: 'دو‌مرحله‌ای' },
                { value: 'installment', label: 'قسطی' }
              ]
            }
          ],
          columns: [
            {
              key: 'orderNumber', label: 'سفارش', sortable: true,
              render: function (r) {
                return '<a href="/admin/orders/' + encodeURIComponent(r.orderNumber) + '" ' +
                  'class="ltr fw-bold">' + Admin.escapeHtml(r.orderNumber) + '</a>' +
                  '<div class="cell-sub">' + Admin.planType(r.planType) + '</div>';
              }
            },
            {
              key: 'customerName', label: 'مشتری', sortable: true,
              render: function (r) {
                return '<div><b class="text-sm">' + Admin.escapeHtml(r.customerName) + '</b>' +
                  '<div class="cell-sub ltr">' + Admin.fa(r.customerPhone) + '</div></div>';
              }
            },
            { key: 'label', label: 'عنوان پرداخت' },
            {
              key: 'amount', label: 'مبلغ', sortable: true, className: 'num',
              render: function (r) { return '<b>' + Admin.money(r.amount) + '</b>'; }
            },
            {
              key: 'dueDate', label: 'سررسید', sortable: true,
              render: function (r) {
                return Admin.jShort(r.dueDate) +
                  '<div class="cell-sub">' + Admin.dueLabel(r.dueDate) + '</div>';
              }
            },
            {
              key: 'state', label: 'وضعیت', sortable: true,
              render: function (r) {
                return r.state === 'overdue'
                  ? Admin.badge('معوق', 'danger', 'alert')
                  : Admin.badge('سررسید نزدیک', 'warning', 'clock');
              }
            },
            {
              key: 'actions', label: 'عملیات', className: 'col-actions',
              render: function (r) {
                return '<div class="cell-actions">' +
                  '<a class="act-btn" href="/admin/orders/' + encodeURIComponent(r.orderNumber) + '" ' +
                  'title="مدیریت سفارش" aria-label="مدیریت سفارش">' + Admin.icon('eye') + '</a>' +
                  '<a class="act-btn" href="' + Admin.whatsappLink(r.customerPhone,
                    'سلام ' + r.customerName + '، یادآوری ' + r.label + ' سفارش ' + r.orderNumber +
                    ' به مبلغ ' + Admin.money(r.amount)) +
                  '" target="_blank" rel="noopener" title="یادآوری واتساپ" ' +
                  'aria-label="یادآوری در واتساپ">' + Admin.icon('whatsapp') + '</a></div>';
              }
            }
          ]
        });
      }

      function statBox(label, value, note, tone, iconName) {
        return '<div class="alert-item alert-item--' + tone + '">' +
          '<span class="alert-item__icon">' + Admin.icon(iconName) + '</span>' +
          '<span class="alert-item__main"><b>' + value + '</b>' +
          '<small>' + Admin.escapeHtml(label) + ' · ' + Admin.escapeHtml(note) + '</small></span></div>';
      }

      /* ========================== کالاهای راکد ======================== */
      function renderStagnant() {
        if (!inventory.stagnant.length) {
          document.getElementById('stagnantTable').appendChild(Admin.emptyState({
            icon: 'checkCircle',
            title: 'کالای راکدی وجود ندارد',
            desc: 'گردش موجودی همه محصولات در وضعیت مطلوب است.'
          }));
          return;
        }

        Admin.table({
          mount: '#stagnantTable',
          rows: inventory.stagnant,
          rowKey: 'id',
          pageSize: 6,
          searchKeys: ['name', 'categoryName'],
          searchPlaceholder: 'جست‌وجو در کالاهای راکد…',
          defaultSort: { key: 'salesCount', dir: 'asc' },
          columns: [
            {
              key: 'name', label: 'محصول', sortable: true,
              render: function (p) {
                return '<a class="cell-product" href="/admin/products/' + encodeURIComponent(p.id) + '">' +
                  '<img class="thumb" src="' + p.images[0] + '" alt="" loading="lazy" width="46" height="46">' +
                  '<div><b>' + Admin.escapeHtml(p.name) + '</b>' +
                  '<small>' + Admin.escapeHtml(p.categoryName) + '</small></div></a>';
              }
            },
            {
              key: 'salesCount', label: 'فروش کل', sortable: true, className: 'num',
              render: function (p) { return Admin.fa(p.salesCount) + ' عدد'; }
            },
            {
              key: 'totalStock', label: 'موجودی', sortable: true, className: 'num',
              render: function (p) { return '<b>' + Admin.fa(p.totalStock) + '</b> عدد'; }
            },
            {
              key: 'stockValue', label: 'سرمایه راکد', className: 'num',
              sortable: true,
              sortValue: function (p) { return p.totalStock * (p.costPrice || 0); },
              render: function (p) {
                return '<b class="text-warning">' + Admin.money(p.totalStock * (p.costPrice || 0)) + '</b>';
              }
            },
            {
              key: 'currentPrice', label: 'قیمت فعلی', sortable: true, className: 'num',
              render: function (p) { return Admin.money(p.currentPrice); }
            },
            {
              key: 'actions', label: 'عملیات', className: 'col-actions',
              render: function (p) {
                return '<div class="cell-actions">' +
                  '<a class="act-btn" href="/admin/products/' + encodeURIComponent(p.id) + '" ' +
                  'title="ویرایش" aria-label="ویرایش محصول">' + Admin.icon('edit') + '</a>' +
                  '<a class="act-btn" href="/admin/discounts" title="ساخت تخفیف" ' +
                  'aria-label="ساخت کد تخفیف">' + Admin.icon('percent') + '</a></div>';
              }
            }
          ]
        });
      }

      /* ============================ برون‌بری ========================== */
      function exportProfit() {
        Admin.exportCsv('hasti-profit-report.csv', [
          { label: 'محصول', key: 'name' },
          { label: 'دسته‌بندی', key: 'categoryName' },
          { label: 'تعداد فروش', key: 'salesCount' },
          { label: 'درآمد', key: 'revenue' },
          { label: 'بهای تمام‌شده', key: 'cost' },
          { label: 'سود', key: 'profit' },
          { label: 'حاشیه سود (٪)', key: 'margin' }
        ], profit.rows);
      }

      function exportCustomers() {
        Admin.exportCsv('hasti-top-customers.csv', [
          { label: 'نام', key: 'name' },
          { label: 'شماره تماس', key: 'phone' },
          { label: 'سطح وفاداری', key: 'tierName' },
          { label: 'تعداد سفارش', key: 'totalOrders' },
          { label: 'مجموع خرید', key: 'totalSpent' }
        ], customers);
      }

      function exportPayments() {
        Admin.exportCsv('hasti-receivables.csv', [
          { label: 'شماره سفارش', key: 'orderNumber' },
          { label: 'مشتری', key: 'customerName' },
          { label: 'شماره تماس', key: 'customerPhone' },
          { label: 'عنوان پرداخت', key: 'label' },
          { label: 'مبلغ', key: 'amount' },
          { label: 'سررسید', key: 'dueDate' },
          { label: 'وضعیت', value: function (r) { return r.state === 'overdue' ? 'معوق' : 'سررسید نزدیک'; } }
        ], health.rows);
      }
    
}
