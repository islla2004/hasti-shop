import { Admin } from '../adminShared.js';
import { dataService } from '../data/dataService.js';
import { HASTI_MOCK } from '../data/mockData.js';

export async function initSettings() {


      var settings = null, customers = [];

      (async function init() {
        await Admin.shell("settings");

        var res = await Promise.all([
          dataService.getSettings(),
          dataService.getCustomers()
        ]);
        settings = res[0];
        customers = res[1];

        bindTabs();
        fillGeneral();
        fillShipping();
        fillPayment();
        fillTicker();
        fillHomepage();
        fillLoyalty();
      })();

      function bindTabs() {
        var tabs = document.querySelectorAll('#settingsTabs .tab');
        tabs.forEach(function (tab) {
          tab.addEventListener('click', function () {
            var key = tab.getAttribute('data-panel');
            tabs.forEach(function (t) {
              var on = t === tab;
              t.classList.toggle('tab--active', on);
              t.setAttribute('aria-pressed', String(on));
            });
            document.querySelectorAll('.tab-panel').forEach(function (p) {
              p.classList.toggle('tab-panel--active', p.getAttribute('data-panel') === key);
            });
          });
        });
      }

      function num(id) {
        return Number(Admin.toEn(document.getElementById(id).value).replace(/[^\d]/g, '')) || 0;
      }

      function setNum(id, value) {
        document.getElementById(id).value = Admin.fa(value);
      }

      /* ========================= اطلاعات فروشگاه ======================= */
      function generalValues() {
        var g = settings.general;

        ['storeName', 'email', 'address', 'workHours',
          'instagram', 'threads', 'whatsappLink', 'logo'].forEach(function (k) {
            var f = document.getElementById(k);
            if (f) f.value = g[k] || '';
          });

        document.getElementById('phone').value = Admin.fa(g.phone);
        document.getElementById('whatsapp').value = Admin.fa(g.whatsapp);
        document.getElementById('logoPreview').src = g.logo;
      }

      function fillGeneral() {
        var form = document.getElementById('generalForm');
        generalValues();

        document.getElementById('logo').addEventListener('input', function () {
          document.getElementById('logoPreview').src = this.value || '/assets/logo.png';
        });

        form.addEventListener('input', function () {
          document.getElementById('generalNote').textContent = 'تغییرات ذخیره نشده دارید';
        });

        form.addEventListener('reset', function () {
          setTimeout(function () {
            generalValues();
            document.getElementById('generalNote').textContent = 'تغییری ثبت نشده است';
          }, 0);
        });

        form.addEventListener('submit', async function (e) {
          e.preventDefault();

          var ok = Admin.validateForm(form, {
            storeName: Admin.required('نام فروشگاه'),
            phone: function (v) {
              var d = Admin.toEn(v).replace(/\D/g, '');
              return /^09\d{9}$/.test(d) ? null : 'شماره تلفن باید ۱۱ رقم و با ۰۹ شروع شود.';
            },
            whatsapp: function (v) {
              var d = Admin.toEn(v).replace(/\D/g, '');
              return /^09\d{9}$/.test(d) ? null : 'شماره واتساپ باید ۱۱ رقم و با ۰۹ شروع شود.';
            },
            address: Admin.required('نشانی فروشگاه'),
            email: function (v) {
              if (!String(v).trim()) return null;
              return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'ایمیل وارد‌شده معتبر نیست.';
            }
          });
          if (!ok) { Admin.toast('لطفاً خطاهای فرم را برطرف کنید', 'error'); return; }

          settings = await dataService.saveSettings('general', {
            storeName: document.getElementById('storeName').value.trim(),
            logo: document.getElementById('logo').value.trim(),
            phone: Admin.toEn(document.getElementById('phone').value).replace(/\D/g, ''),
            whatsapp: Admin.toEn(document.getElementById('whatsapp').value).replace(/\D/g, ''),
            email: document.getElementById('email').value.trim(),
            address: document.getElementById('address').value.trim(),
            workHours: document.getElementById('workHours').value.trim(),
            instagram: document.getElementById('instagram').value.trim(),
            threads: document.getElementById('threads').value.trim(),
            whatsappLink: document.getElementById('whatsappLink').value.trim()
          });

          document.getElementById('generalNote').textContent = 'آخرین ذخیره: ' + Admin.jDate(dataService.today());
          Admin.toast('اطلاعات فروشگاه ذخیره شد');
        });
      }

      /* ============================== ارسال =========================== */
      function fillShipping() {
        var s = settings.shipping;
        setNum('freeShippingThreshold', s.freeShippingThreshold);
        setNum('defaultCost', s.defaultCost);

        renderZones(s.zones.slice());
        updateShippingPreview();

        document.getElementById('addZoneBtn').addEventListener('click', function () {
          var list = readZones();
          list.push({ name: '', cost: settings.shipping.defaultCost });
          renderZones(list);
        });

        var form = document.getElementById('shippingForm');
        form.addEventListener('input', updateShippingPreview);

        form.addEventListener('submit', async function (e) {
          e.preventDefault();

          var threshold = num('freeShippingThreshold');
          var defaultCost = num('defaultCost');
          if (!threshold || !defaultCost) {
            Admin.toast('آستانه ارسال رایگان و هزینه پیش‌فرض الزامی هستند', 'error');
            return;
          }

          var zones = readZones().filter(function (z) { return z.name; });
          settings = await dataService.saveSettings('shipping', {
            freeShippingThreshold: threshold,
            defaultCost: defaultCost,
            zones: zones
          });
          renderZones(settings.shipping.zones.slice());
          Admin.toast('تنظیمات ارسال ذخیره شد');
        });
      }

      function renderZones(zones) {
        var box = document.getElementById('zoneList');
        box.innerHTML = zones.map(function (z, i) {
          return '<div class="row row--tight" data-zone-row>' +
            '<input class="input" data-zone-name placeholder="نام منطقه" ' +
            'value="' + Admin.escapeHtml(z.name) + '" aria-label="نام منطقه ' + Admin.fa(i + 1) + '">' +
            '<div class="input-group" style="max-width:200px">' +
            '<input class="input num" data-zone-cost inputmode="numeric" ' +
            'value="' + Admin.fa(z.cost) + '" aria-label="هزینه ارسال منطقه ' + Admin.fa(i + 1) + '">' +
            '<span class="input-group__affix">تومان</span></div>' +
            '<button class="act-btn act-btn--danger" type="button" data-zone-remove ' +
            'aria-label="حذف منطقه">' + Admin.icon('trash') + '</button></div>';
        }).join('');

        box.querySelectorAll('[data-zone-remove]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var rows = readZones();
            var idx = Array.prototype.indexOf.call(
              box.querySelectorAll('[data-zone-remove]'), btn);
            rows.splice(idx, 1);
            renderZones(rows);
            updateShippingPreview();
          });
        });
      }

      function readZones() {
        return Admin.$$('#zoneList [data-zone-row]').map(function (row) {
          return {
            name: row.querySelector('[data-zone-name]').value.trim(),
            cost: Number(Admin.toEn(row.querySelector('[data-zone-cost]').value).replace(/[^\d]/g, '')) || 0
          };
        });
      }

      function updateShippingPreview() {
        var threshold = num('freeShippingThreshold');
        var zones = readZones().filter(function (z) { return z.name; });
        document.getElementById('shippingPreview').innerHTML =
          Admin.icon('truck') +
          '<div><b>ارسال رایگان برای سفارش‌های بالای ' + Admin.money(threshold) + '</b>' +
          '<div class="text-sm">' +
          (zones.length
            ? zones.map(function (z) {
              return Admin.escapeHtml(z.name) + ': ' + Admin.money(z.cost);
            }).join(' · ')
            : 'منطقه‌ای تعریف نشده است — هزینه پیش‌فرض ' + Admin.money(num('defaultCost'))) +
          '</div></div>';
      }

      /* ========================= پرداخت و اقساط ======================= */
      function fillPayment() {
        var p = settings.payment;
        document.getElementById('twoStageEnabled').checked = !!p.twoStageEnabled;
        document.getElementById('installmentEnabled').checked = !!p.installmentEnabled;
        setNum('minOrderAmount', p.minOrderAmount);
        setNum('downPaymentPercent', p.downPaymentPercent);
        setNum('minInstallments', p.minInstallments);
        setNum('maxInstallments', p.maxInstallments);
        setNum('twoStageSplit', p.twoStageSplit);
        setNum('secondStageDeadlineDays', p.secondStageDeadlineDays);

        var form = document.getElementById('paymentForm');
        form.addEventListener('input', renderCalc);
        document.getElementById('calcAmount').addEventListener('input', renderCalc);
        renderCalc();

        form.addEventListener('submit', async function (e) {
          e.preventDefault();

          var down = num('downPaymentPercent');
          var split = num('twoStageSplit');
          var minI = num('minInstallments');
          var maxI = num('maxInstallments');

          if (down < 10 || down > 90) { Admin.toast('درصد پیش‌پرداخت باید بین ۱۰ تا ۹۰ باشد', 'error'); return; }
          if (split < 10 || split > 90) { Admin.toast('سهم مرحله اول باید بین ۱۰ تا ۹۰ باشد', 'error'); return; }
          if (minI < 2 || maxI < minI) { Admin.toast('بازه تعداد اقساط معتبر نیست', 'error'); return; }
          if (!num('minOrderAmount')) { Admin.toast('حداقل مبلغ سفارش الزامی است', 'error'); return; }

          settings = await dataService.saveSettings('payment', {
            twoStageEnabled: document.getElementById('twoStageEnabled').checked,
            installmentEnabled: document.getElementById('installmentEnabled').checked,
            minOrderAmount: num('minOrderAmount'),
            downPaymentPercent: down,
            minInstallments: minI,
            maxInstallments: maxI,
            twoStageSplit: split,
            secondStageDeadlineDays: num('secondStageDeadlineDays')
          });
          Admin.toast('قواعد پرداخت ذخیره شد');
          renderCalc();
        });
      }

      function renderCalc() {
        var amount = Number(Admin.toEn(document.getElementById('calcAmount').value).replace(/[^\d]/g, '')) || 0;
        var minOrder = num('minOrderAmount');
        var down = num('downPaymentPercent');
        var split = num('twoStageSplit');
        var count = num('maxInstallments');

        var downAmount = Math.round(amount * down / 100);
        var rest = amount - downAmount;
        var perInstallment = count ? Math.round(rest / count) : 0;
        var firstStage = Math.round(amount * split / 100);

        document.getElementById('calcResult').innerHTML =
          '<div class="summary__row"><span>مبلغ سفارش</span><b>' + Admin.money(amount) + '</b></div>' +
          '<div class="summary__row"><span>پیش‌پرداخت قسطی (' + Admin.percent(down) + ')</span><b>' +
          Admin.money(downAmount) + '</b></div>' +
          '<div class="summary__row"><span>' + Admin.fa(count) + ' قسط ماهانه</span><b>' +
          Admin.money(perInstallment) + '</b></div>' +
          '<div class="summary__total"><span>مرحله اول دو‌مرحله‌ای (' + Admin.percent(split) + ')</span><b>' +
          Admin.money(firstStage) + '</b></div>';

        var eligible = amount >= minOrder;
        document.getElementById('calcEligibility').innerHTML = eligible
          ? 'این مبلغ واجد شرایط خرید قسطی و دو‌مرحله‌ای است (حداقل ' + Admin.money(minOrder) + ').'
          : 'این مبلغ کمتر از حداقل ' + Admin.money(minOrder) + ' است و فقط پرداخت کامل دارد.';
      }

      /* ============================ نوار اعلان ======================== */
      function fillTicker() {
        var t = settings.ticker;
        document.getElementById('announceText').value = t.announceText;
        renderTickerItems(t.tickerItems.slice());
        updateTickerPreview();

        document.getElementById('addTickerBtn').addEventListener('click', function () {
          var list = readTickerItems();
          list.push('');
          renderTickerItems(list);
        });

        var form = document.getElementById('tickerForm');
        form.addEventListener('input', updateTickerPreview);

        form.addEventListener('submit', async function (e) {
          e.preventDefault();
          var announce = document.getElementById('announceText').value.trim();
          if (!announce) { Admin.toast('متن اعلان اصلی الزامی است', 'error'); return; }

          settings = await dataService.saveSettings('ticker', {
            announceText: announce,
            tickerItems: readTickerItems().filter(function (x) { return x; })
          });
          renderTickerItems(settings.ticker.tickerItems.slice());
          updateTickerPreview();
          Admin.toast('نوار اعلان ذخیره شد');
        });
      }

      function renderTickerItems(items) {
        var box = document.getElementById('tickerList');
        box.innerHTML = items.map(function (text, i) {
          return '<div class="row row--tight" data-ticker-row>' +
            '<input class="input" data-ticker-text value="' + Admin.escapeHtml(text) + '" ' +
            'placeholder="متن آیتم" aria-label="آیتم ' + Admin.fa(i + 1) + '">' +
            '<button class="act-btn act-btn--danger" type="button" data-ticker-remove ' +
            'aria-label="حذف آیتم">' + Admin.icon('trash') + '</button></div>';
        }).join('');

        box.querySelectorAll('[data-ticker-remove]').forEach(function (btn, i) {
          btn.addEventListener('click', function () {
            var list = readTickerItems();
            list.splice(i, 1);
            renderTickerItems(list);
            updateTickerPreview();
          });
        });
      }

      function readTickerItems() {
        return Admin.$$('#tickerList [data-ticker-text]').map(function (input) {
          return input.value.trim();
        });
      }

      function updateTickerPreview() {
        var announce = document.getElementById('announceText').value.trim();
        var items = readTickerItems().filter(function (x) { return x; });
        document.getElementById('tickerPreview').innerHTML =
          '<b style="color:var(--c-tan)">' + Admin.escapeHtml(announce) + '</b>' +
          (items.length
            ? '<div style="margin-top:8px;opacity:.85">' + items.map(function (x) {
              return '◆ ' + Admin.escapeHtml(x);
            }).join('<br>') + '</div>'
            : '');
      }

      /* =========================== صفحه اصلی ========================== */
      function fillHomepage() {
        var h = settings.homepage;
        renderSlides(h.heroSlides.slice());

        document.getElementById('authTitle').value = h.authenticityBanner.title;
        document.getElementById('authText').value = h.authenticityBanner.text;
        document.getElementById('authImage').value = h.authenticityBanner.image;
        document.getElementById('aboutText').value = h.aboutText;

        document.getElementById('addSlideBtn').addEventListener('click', function () {
          var list = readSlides();
          list.push({ image: '', title: '', subtitle: '', link: '' });
          renderSlides(list);
        });

        document.getElementById('homepageForm').addEventListener('submit', async function (e) {
          e.preventDefault();
          var slides = readSlides().filter(function (s) { return s.title; });
          if (!slides.length) { Admin.toast('حداقل یک اسلاید با عنوان لازم است', 'error'); return; }

          settings = await dataService.saveSettings('homepage', {
            heroSlides: slides,
            authenticityBanner: {
              image: document.getElementById('authImage').value.trim(),
              title: document.getElementById('authTitle').value.trim(),
              text: document.getElementById('authText').value.trim()
            },
            aboutText: document.getElementById('aboutText').value.trim()
          });
          renderSlides(settings.homepage.heroSlides.slice());
          Admin.toast('تنظیمات صفحه اصلی ذخیره شد');
        });
      }

      function renderSlides(slides) {
        var box = document.getElementById('slideList');
        box.innerHTML = slides.map(function (s, i) {
          return '<article class="card card--pad" data-slide-row style="box-shadow:none">' +
            '<div class="row row--between mb-2">' +
            '<b class="text-sm">اسلاید ' + Admin.fa(i + 1) + '</b>' +
            '<button class="act-btn act-btn--danger" type="button" data-slide-remove ' +
            'aria-label="حذف اسلاید">' + Admin.icon('trash') + '</button></div>' +
            '<div class="form-grid">' +
            '<div class="field"><label class="label">عنوان</label>' +
            '<input class="input" data-slide-title value="' + Admin.escapeHtml(s.title) + '"></div>' +
            '<div class="field"><label class="label">زیرعنوان</label>' +
            '<input class="input" data-slide-subtitle value="' + Admin.escapeHtml(s.subtitle) + '"></div>' +
            '<div class="field"><label class="label">تصویر</label>' +
            '<input class="input ltr" data-slide-image value="' + Admin.escapeHtml(s.image) + '"></div>' +
            '<div class="field"><label class="label">لینک</label>' +
            '<input class="input ltr" data-slide-link value="' + Admin.escapeHtml(s.link) + '"></div>' +
            '</div></article>';
        }).join('');

        box.querySelectorAll('[data-slide-remove]').forEach(function (btn, i) {
          btn.addEventListener('click', function () {
            var list = readSlides();
            list.splice(i, 1);
            renderSlides(list);
          });
        });
      }

      function readSlides() {
        return Admin.$$('#slideList [data-slide-row]').map(function (row) {
          return {
            title: row.querySelector('[data-slide-title]').value.trim(),
            subtitle: row.querySelector('[data-slide-subtitle]').value.trim(),
            image: row.querySelector('[data-slide-image]').value.trim(),
            link: row.querySelector('[data-slide-link]').value.trim()
          };
        });
      }

      /* ========================= باشگاه مشتریان ======================= */
      function fillLoyalty() {
        var l = settings.loyalty;
        setNum('pointsPer100k', l.pointsPer100k);
        setNum('pointToTomanRate', l.pointToTomanRate);
        renderTiers(l.tiers.slice());
        renderTierStats();

        document.getElementById('loyaltyForm').addEventListener('submit', async function (e) {
          e.preventDefault();
          var tiers = readTiers();
          var sorted = tiers.slice().sort(function (a, b) { return a.minSpent - b.minSpent; });

          settings = await dataService.saveSettings('loyalty', {
            pointsPer100k: num('pointsPer100k'),
            pointToTomanRate: num('pointToTomanRate'),
            tiers: sorted
          });
          renderTiers(settings.loyalty.tiers.slice());
          renderTierStats();
          Admin.toast('تنظیمات باشگاه مشتریان ذخیره شد');
        });
      }

      function renderTiers(tiers) {
        var classMap = { gold: 'tier--gold', silver: 'tier--silver', bronze: 'tier--bronze' };
        document.getElementById('tierList').innerHTML = tiers.map(function (t) {
          return '<div class="row row--tight" data-tier-row data-tier-id="' + Admin.escapeHtml(t.id) + '">' +
            '<span class="tier ' + (classMap[t.id] || 'tier--bronze') + '" style="min-width:96px">' +
            Admin.icon('crown') + Admin.escapeHtml(t.name) + '</span>' +
            '<input class="input" data-tier-name value="' + Admin.escapeHtml(t.name) + '" ' +
            'aria-label="نام سطح ' + Admin.escapeHtml(t.name) + '">' +
            '<div class="input-group" style="max-width:230px">' +
            '<input class="input num" data-tier-min inputmode="numeric" value="' + Admin.fa(t.minSpent) + '" ' +
            'aria-label="حداقل خرید سطح ' + Admin.escapeHtml(t.name) + '">' +
            '<span class="input-group__affix">تومان</span></div></div>';
        }).join('');
      }

      function readTiers() {
        return Admin.$$('#tierList [data-tier-row]').map(function (row) {
          return {
            id: row.getAttribute('data-tier-id'),
            name: row.querySelector('[data-tier-name]').value.trim(),
            minSpent: Number(Admin.toEn(row.querySelector('[data-tier-min]').value).replace(/[^\d]/g, '')) || 0
          };
        });
      }

      function renderTierStats() {
        var total = customers.length || 1;
        var classMap = {
          gold: 'bar__fill', silver: 'bar__fill bar__fill--warning', bronze: 'bar__fill bar__fill--danger'
        };

        document.getElementById('tierStats').innerHTML = settings.loyalty.tiers
          .slice().reverse().map(function (t) {
            var list = customers.filter(function (c) { return c.loyaltyTier === t.id; });
            var spent = list.reduce(function (s, c) { return s + c.totalSpent; }, 0);
            var pct = Math.round(list.length / total * 100);
            return '<div style="margin-bottom:16px">' +
              '<div class="row row--between mb-1">' +
              '<b class="text-sm">' + Admin.escapeHtml(t.name) + '</b>' +
              '<span class="text-xs text-soft">' + Admin.fa(list.length) + ' مشتری · ' +
              Admin.money(spent) + '</span></div>' +
              '<div class="bar"><span class="' + (classMap[t.id] || 'bar__fill') +
              '" style="width:' + pct + '%"></span></div>' +
              '<span class="hint">حداقل خرید ' + Admin.money(t.minSpent) + ' — ' +
              Admin.percent(pct) + ' مشتریان</span></div>';
          }).join('');
      }
    
}
