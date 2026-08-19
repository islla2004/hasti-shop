/* ============================================================================
   پنل مدیریت هستی — ماژول مشترک (Shell + Utilities + Components)
   ----------------------------------------------------------------------------
   شامل:
     • توابع فارسی‌سازی اعداد و قیمت (هم‌رفتار با storefront)
     • تاریخ شمسی (جلالی)
     • آیکون‌های SVG (بدون emoji، هم‌سبک Lucide)
     • renderAdminShell: سایدبار + نوار بالا (به‌جای کپی در هر صفحه)
     • Toast / Modal / Confirm
     • AdminTable: جدول با مرتب‌سازی، فیلتر، جست‌وجو، صفحه‌بندی و عملیات گروهی
     • تنظیمات پیش‌فرض نمودار (Chart.js)
   ========================================================================== */

(function (global) {
    "use strict";

    var Admin = {};

    /* ======================== فارسی‌سازی اعداد و قیمت ==================== */
    /* عیناً هم‌رفتار با توابع موجود در test.html / chador.html / product.html */

    function toPersianNumber(num) {
        var d = '۰۱۲۳۴۵۶۷۸۹';
        return String(num === null || num === undefined ? '' : num).replace(/\d/g, function (x) { return d[x]; });
    }

    function toEnglishNumber(str) {
        var p = '۰۱۲۳۴۵۶۷۸۹';
        return String(str === null || str === undefined ? '' : str).replace(/[۰-۹]/g, function (digit) {
            return String(p.indexOf(digit));
        });
    }

    function formatPrice(price) {
        return String(Math.round(Number(price) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    /* «۱۰,۰۰۰,۰۰۰ تومان» */
    function money(price) {
        return toPersianNumber(formatPrice(price)) + ' تومان';
    }

    /* بدون واحد — برای ستون‌های جدول که واحد در سرستون آمده */
    function moneyPlain(price) {
        return toPersianNumber(formatPrice(price));
    }

    /* خلاصه‌سازی مبالغ بزرگ در نمودار/KPI: ۱۲.۴ میلیون */
    function moneyShort(price) {
        var n = Number(price) || 0;
        if (n >= 1000000000) return toPersianNumber((n / 1000000000).toFixed(1).replace(/\.0$/, '')) + ' میلیارد';
        if (n >= 1000000) return toPersianNumber((n / 1000000).toFixed(1).replace(/\.0$/, '')) + ' میلیون';
        if (n >= 1000) return toPersianNumber(formatPrice(n));
        return toPersianNumber(n);
    }

    function percent(n) {
        return toPersianNumber(n) + '٪';
    }

    /* ============================== تاریخ شمسی ========================== */
    var JMONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
        'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];

    /* «۱۴۰۳-۰۶-۲۰» → «۲۰ شهریور ۱۴۰۳» */
    function jDate(str) {
        if (!str) return '—';
        var parts = String(str).split(' ')[0].split('-');
        if (parts.length !== 3) return toPersianNumber(str);
        var m = parseInt(parts[1], 10);
        return toPersianNumber(parseInt(parts[2], 10)) + ' ' + (JMONTHS[m - 1] || '') + ' ' + toPersianNumber(parts[0]);
    }

    /* «۱۴۰۳-۰۶-۲۰» → «۱۴۰۳/۰۶/۲۰» */
    function jShort(str) {
        if (!str) return '—';
        var parts = String(str).split(' ')[0].split('-');
        if (parts.length !== 3) return toPersianNumber(str);
        return toPersianNumber(parts[0] + '/' + parts[1] + '/' + parts[2]);
    }

    /* تاریخ جاری واقعی سیستم با همان API استفاده‌شده در بخش نظرات product.html */
    function todayFormatted() {
        return new Intl.DateTimeFormat('fa-IR').format(new Date());
    }

    /* چند روز تا سررسید مانده — منفی یعنی گذشته */
    function daysUntil(jalaliDate) {
        return global.dataService.daysBetween(global.dataService.today(), jalaliDate);
    }

    /* «۳ روز مانده» / «۵ روز گذشته» */
    function dueLabel(jalaliDate) {
        var d = daysUntil(jalaliDate);
        if (d === 0) return 'امروز';
        if (d > 0) return toPersianNumber(d) + ' روز مانده';
        return toPersianNumber(Math.abs(d)) + ' روز گذشته';
    }

    /* ============================ آیکون‌های SVG ========================= */
    /* بدون emoji — مطابق قاعده no-emoji-icons. همه در viewBox 24 و stroke-based */
    var ICONS = {
        dashboard: '<path d="M3 3h7v7H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 14h7v7H3z"/>',
        box: '<path d="M21 8v8a2 2 0 0 1-1 1.7l-7 4a2 2 0 0 1-2 0l-7-4A2 2 0 0 1 3 16V8a2 2 0 0 1 1-1.7l7-4a2 2 0 0 1 2 0l7 4A2 2 0 0 1 21 8z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>',
        tag: '<path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.2 8.2a2 2 0 0 0 2.8 0l7.2-7.2a2 2 0 0 0 0-2.8z"/><circle cx="7.5" cy="7.5" r="1.3"/>',
        layers: '<path d="m12 2 9 5-9 5-9-5z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/>',
        cart: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/>',
        users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
        user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
        warehouse: '<path d="M22 8.4a2 2 0 0 0-1.2-1.8l-7.9-3.2a2 2 0 0 0-1.8 0L3.2 6.6A2 2 0 0 0 2 8.4V21h20z"/><path d="M6 18h12v3H6zM6 14h12M6 10h12"/>',
        percent: '<path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
        article: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><path d="M14 2v5h6M8 13h8M8 17h5"/>',
        star: '<path d="m12 2.5 3 6.1 6.7 1-4.9 4.7 1.2 6.7L12 17.8 6 21l1.2-6.7L2.3 9.6l6.7-1z"/>',
        mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2.5 6 9.5 7 9.5-7"/>',
        chart: '<path d="M3 3v18h18"/><path d="M7 15v3M12 9v9M17 5v13"/>',
        pie: '<path d="M21.2 15.9A10 10 0 1 1 8.1 2.8"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>',
        settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7.5 19l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3.6 14H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 5 7.5l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 10 3.6V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1.3z"/>',
        shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
        search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
        bell: '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
        chevronDown: '<path d="m6 9 6 6 6-6"/>',
        chevronLeft: '<path d="m15 18-6-6 6-6"/>',
        chevronRight: '<path d="m9 18 6-6-6-6"/>',
        chevronsLeft: '<path d="m11 17-5-5 5-5M18 17l-5-5 5-5"/>',
        plus: '<path d="M12 5v14M5 12h14"/>',
        minus: '<path d="M5 12h14"/>',
        edit: '<path d="M17 3a2.8 2.8 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5z"/><path d="m15 5 4 4"/>',
        trash: '<path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6"/>',
        eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
        download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/>',
        upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 8 5-5 5 5M12 3v12"/>',
        printer: '<path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
        whatsapp: '<path d="M21 11.5a8.4 8.4 0 0 1-12.6 7.3L3 21l2.3-5.3A8.4 8.4 0 1 1 21 11.5z"/><path d="M8.8 8.4c.3-.6 1.3-.4 1.5.1l.5 1.2c.1.3 0 .6-.2.8l-.4.4c.5 1 1.3 1.8 2.3 2.3l.4-.4c.2-.2.5-.3.8-.2l1.2.5c.5.2.7 1.2.1 1.5-1.9 1-4.6-.5-5.7-1.7-1.2-1.2-2.6-3.9-1.5-5.6"/>',
        check: '<path d="M20 6 9 17l-5-5"/>',
        checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
        x: '<path d="M18 6 6 18M6 6l12 12"/>',
        xCircle: '<circle cx="12" cy="12" r="9"/><path d="m15 9-6 6M9 9l6 6"/>',
        alert: '<path d="M10.3 3.4 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.4a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h0"/>',
        info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h0"/>',
        clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
        truck: '<path d="M14 17V5a1 1 0 0 0-1-1H2v13h12z"/><path d="M14 8h4l4 4v5h-8"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
        store: '<path d="M3 9V6l2-3h14l2 3v3"/><path d="M4 9v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9"/><path d="M3 9h18M9 21v-6h6v6"/>',
        copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
        filter: '<path d="M3 4h18l-7 8.5V21l-4-2v-6.5z"/>',
        sort: '<path d="M8 4v16M4 8l4-4 4 4M16 20V4M12 16l4 4 4-4"/>',
        menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
        logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
        image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
        calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 11h18"/>',
        card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
        banknote: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
        trendUp: '<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
        trendDown: '<path d="m3 7 6 6 4-4 8 8"/><path d="M15 17h6v-6"/>',
        sparkle: '<path d="M12 3l1.8 4.9L19 9.7l-5.2 1.8L12 16.4l-1.8-4.9L5 9.7l5.2-1.8z"/><path d="M19 15l.9 2.4 2.1.7-2.1.7-.9 2.4-.9-2.4-2.1-.7 2.1-.7z"/>',
        barcode: '<path d="M3 5v14M6.5 5v14M10 5v10M13.5 5v14M17 5v10M20.5 5v14"/>',
        gift: '<rect x="3" y="8" width="18" height="13" rx="1"/><path d="M12 8v13M3 13h18"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
        ticket: '<path d="M3 9V6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v3a3 3 0 0 0 0 6v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a3 3 0 0 0 0-6z"/><path d="M12 5v14"/>',
        message: '<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.6 9.6 0 0 1-2.8-.4L3 21l1.9-5A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z"/>',
        inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1z"/>',
        activity: '<path d="M22 12h-4l-3 8-4-16-3 8H2"/>',
        target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
        list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
        grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
        arrowRight: '<path d="M5 12h14M12 5l7 7-7 7"/>',
        arrowLeft: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
        phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
        pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
        save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
        refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
        more: '<circle cx="12" cy="5" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="19" r="1.4"/>',
        external: '<path d="M15 3h6v6"/><path d="M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
        undo: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
        key: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m11 12 8.5-8.5M17 6l3 3M14 9l3 3"/>',
        lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
        palette: '<path d="M12 21a9 9 0 1 1 9-9c0 2-1.5 3-3 3h-1.5a2 2 0 0 0-1.2 3.6c.4.4.2 1.1-.3 1.3a9 9 0 0 1-3 1.1z"/><circle cx="8" cy="10" r="1.2"/><circle cx="12" cy="7.5" r="1.2"/><circle cx="16" cy="10" r="1.2"/>',
        home: '<path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22v-8h6v8"/>',
        scale: '<path d="M12 3v18M7 7h10"/><path d="m5 7-3 7h6zM19 7l-3 7h6z"/>',
        wallet: '<path d="M20 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h15a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6"/><path d="M17 13h.01"/>',
        boxOpen: '<path d="m3 7 9-4 9 4-9 4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/>',
        ruler: '<path d="M15.5 2.5 21.5 8.5a2 2 0 0 1 0 2.8L11.3 21.5a2 2 0 0 1-2.8 0L2.5 15.5a2 2 0 0 1 0-2.8L12.7 2.5a2 2 0 0 1 2.8 0z"/><path d="m7 11 2 2M10 8l2 2M13 5l2 2"/>',
        crown: '<path d="m3 18 1.5-11 4.5 4L12 4l3 7 4.5-4L21 18z"/><path d="M3 18h18v3H3z"/>',
        bookmark: '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>'
    };

    /* تولید رشته SVG آیکون */
    function icon(name, cls) {
        var body = ICONS[name] || ICONS.info;
        return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
            'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
            body + '</svg>';
    }

    /* آیکون ستاره پر برای امتیاز */
    function starFilled() {
        return '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">' + ICONS.star + '</svg>';
    }

    /* نمایش امتیاز ستاره‌ای */
    function stars(rating) {
        var out = '<span class="row row--tight" style="gap:2px;color:var(--c-warning)" aria-label="امتیاز ' + toPersianNumber(rating) + ' از ۵">';
        for (var i = 1; i <= 5; i++) {
            out += '<span style="width:14px;height:14px;display:block;opacity:' + (i <= Math.round(rating) ? '1' : '.25') + '">' + starFilled() + '</span>';
        }
        out += '<b class="text-xs text-muted" style="margin-inline-start:4px">' + (rating ? toPersianNumber(rating) : '—') + '</b></span>';
        return out;
    }

    /* =========================== کمکی‌های DOM =========================== */
    function el(html) {
        var t = document.createElement('template');
        t.innerHTML = html.trim();
        return t.content.firstElementChild;
    }

    function $(sel, root) { return (root || document).querySelector(sel); }
    function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

    function escapeHtml(str) {
        return String(str === null || str === undefined ? '' : str)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function param(name) {
        return new URLSearchParams(global.location.search).get(name);
    }

    function debounce(fn, wait) {
        var timer;
        return function () {
            var args = arguments, ctx = this;
            clearTimeout(timer);
            timer = setTimeout(function () { fn.apply(ctx, args); }, wait || 250);
        };
    }

    /* ============================ ساختار منو ========================== */
    var NAV = [
        {
            group: 'مرور کلی', items: [
                { key: 'dashboard', label: 'داشبورد', href: 'index.html', icon: 'dashboard' }
            ]
        },
        {
            group: 'فروش', items: [
                { key: 'orders', label: 'سفارش‌ها', href: 'orders.html', icon: 'cart', badge: 'pendingOrders' },
                { key: 'customers', label: 'مشتریان', href: 'customers.html', icon: 'users' },
                { key: 'discounts', label: 'تخفیف و کمپین', href: 'discounts.html', icon: 'percent' }
            ]
        },
        {
            group: 'کاتالوگ', items: [
                { key: 'products', label: 'محصولات', href: 'products.html', icon: 'box' },
                { key: 'categories', label: 'دسته‌بندی و کالکشن', href: 'categories.html', icon: 'layers' },
                { key: 'inventory', label: 'انبار', href: 'inventory.html', icon: 'warehouse', badge: 'lowStock' }
            ]
        },
        {
            group: 'محتوا و ارتباط', items: [
                { key: 'blog', label: 'بلاگ', href: 'blog.html', icon: 'article' },
                { key: 'reviews', label: 'نظرات', href: 'reviews.html', icon: 'star', badge: 'pendingReviews' },
                { key: 'messages', label: 'پیام‌ها و تیکت', href: 'messages.html', icon: 'inbox', badge: 'openTickets' }
            ]
        },
        {
            group: 'مدیریت', items: [
                { key: 'reports', label: 'گزارش‌ها', href: 'reports.html', icon: 'chart' },
                { key: 'settings', label: 'تنظیمات فروشگاه', href: 'settings.html', icon: 'settings' },
                { key: 'users', label: 'کاربران و دسترسی', href: 'users.html', icon: 'shield' }
            ]
        }
    ];

    /* ===================== renderAdminShell (سایدبار + topbar) ========== */
    /*
      به‌جای کپی‌کردن هدر/سایدبار در هر یک از ۱۷ صفحه (الگوی storefront)،
      این تابع یک‌بار نوشته شده و در همه صفحات فراخوانی می‌شود.
      صفحه فقط باید شامل <main class="admin-main"><div class="admin-body">…</div></main> باشد.
    */
    var SIDEBAR_KEY = 'hasti_admin_sidebar';
    var SESSION_KEY = 'hasti_admin_session';

    /* --------------------------------------------------------------------------
       نگهبان نشست. همه صفحات داخلی renderAdminShell را صدا می‌زنند، پس بررسی
       دسترسی همین‌جا یک‌بار انجام می‌شود و نیازی به تکرار در ۱۷ صفحه نیست.

       TODO(backend): این بررسی سمت کلاینت است و ارزش امنیتی ندارد؛ کنترل نهایی
       باید با کوکی HttpOnly و بررسی سرور روی هر درخواست انجام شود.
       -------------------------------------------------------------------------- */
    function hasSession() {
        try {
            return sessionStorage.getItem(SESSION_KEY) !== null;
        } catch (e) {
            return false;
        }
    }

    function endSession() {
        try {
            sessionStorage.removeItem(SESSION_KEY);
        } catch (e) { /* حالت مسدود بودن storage */ }
    }

    function guardSession() {
        if (hasSession()) return true;

        /* باز کردن مستقیم فایل از دیسک = پیش‌نمایش طراحی؛ ریدایرکت بی‌معنا است */
        if (location.protocol === 'file:') {
            var firstTime = true;
            try {
                firstTime = localStorage.getItem('hasti_admin_preview_note') !== '1';
                sessionStorage.setItem(SESSION_KEY, 'preview');
                localStorage.setItem('hasti_admin_preview_note', '1');
            } catch (e) { }
            if (firstTime) {
                setTimeout(function () {
                    toast('حالت پیش‌نمایش محلی — برای جریان واقعی ورود، پنل را روی سرور اجرا کنید', 'info');
                }, 500);
            }
            return true;
        }

        var next = location.pathname.split('/').pop() + location.search;
        location.replace('login.html?next=' + encodeURIComponent(next));
        return false;
    }

    async function renderAdminShell(activeKey) {
        /* در حال ریدایرکت، اجرای بقیه کد صفحه متوقف می‌شود */
        if (!guardSession()) return new Promise(function () { });

        var user = global.dataService.getCurrentUser();
        var main = $('.admin-main');

        /* --- وضعیت جمع‌شدگی سایدبار از localStorage (ترجیح مدیر) --- */
        if (localStorage.getItem(SIDEBAR_KEY) === 'collapsed') {
            document.body.setAttribute('data-sidebar', 'collapsed');
        }

        /* ------------------------------- سایدبار ------------------------------- */
        var navHtml = '';
        NAV.forEach(function (section) {
            navHtml += '<div class="sidebar__group">' + escapeHtml(section.group) + '</div>';
            section.items.forEach(function (item) {
                var isActive = item.key === activeKey;
                navHtml += '<a class="sidebar__link' + (isActive ? ' sidebar__link--active' : '') + '" href="' + item.href + '"' +
                    (isActive ? ' aria-current="page"' : '') + '>' +
                    icon(item.icon) +
                    '<span>' + escapeHtml(item.label) + '</span>' +
                    (item.badge ? '<span class="sidebar__badge" data-badge="' + item.badge + '" hidden></span>' : '') +
                    '</a>';
            });
        });

        var sidebar = el(
            '<aside class="admin-sidebar" id="adminSidebar">' +
            '<div class="sidebar__brand">' +
            '<span class="sidebar__mark">هـ</span>' +
            '<span class="sidebar__title"><b>هستی</b><span>پنل مدیریت</span></span>' +
            '</div>' +
            '<nav class="sidebar__nav" aria-label="منوی اصلی پنل">' + navHtml + '</nav>' +
            '<div class="sidebar__foot">' +
            '<button class="sidebar__collapse" id="sidebarCollapse" type="button" aria-label="جمع کردن منو">' +
            icon('chevronsLeft') + '<span>جمع کردن منو</span>' +
            '</button>' +
            '</div>' +
            '</aside>'
        );

        var scrim = el('<div class="drawer-scrim" id="drawerScrim"></div>');
        document.body.insertBefore(sidebar, main);
        document.body.insertBefore(scrim, main);

        /* ------------------------------- نوار بالا ----------------------------- */
        var topbar = el(
            '<header class="admin-topbar">' +
            '<button class="topbar__burger" id="topbarBurger" type="button" aria-label="نمایش منو" aria-expanded="false">' + icon('menu') + '</button>' +

            '<div class="topbar__search">' +
            icon('search') +
            '<input type="search" id="globalSearch" placeholder="جست‌وجو در محصولات، سفارش‌ها و مشتریان…" ' +
            'aria-label="جست‌وجوی سراسری" autocomplete="off">' +
            '<div class="search-results" id="searchResults" role="listbox" aria-label="نتایج جست‌وجو"></div>' +
            '</div>' +

            '<div class="topbar__spacer"></div>' +

            '<div class="topbar__actions">' +
            '<a class="icon-btn" href="../test.html" target="_blank" rel="noopener" title="مشاهده سایت" aria-label="مشاهده سایت فروشگاه">' + icon('external') + '</a>' +

            '<div class="dropdown" id="notifDropdown">' +
            '<button class="icon-btn" id="notifBtn" type="button" aria-label="اعلان‌ها" aria-expanded="false">' +
            icon('bell') + '<span class="icon-btn__dot" id="notifCount" hidden></span>' +
            '</button>' +
            '<div class="dropdown__panel" id="notifPanel">' +
            '<div class="dropdown__head"><span>اعلان‌ها</span>' +
            '<button type="button" class="btn btn--xs btn--soft" id="notifReadAll">خواندن همه</button></div>' +
            '<div id="notifList"></div>' +
            '</div>' +
            '</div>' +

            '<div class="dropdown" id="userDropdown">' +
            '<button class="topbar__user" id="userBtn" type="button" aria-label="منوی کاربر" aria-expanded="false">' +
            '<span class="avatar">' + escapeHtml(user.initials) + '</span>' +
            '<span><b>' + escapeHtml(user.name) + '</b><small>' + escapeHtml(user.roleName) + '</small></span>' +
            icon('chevronDown') +
            '</button>' +
            '<div class="dropdown__panel" id="userPanel" style="min-width:230px">' +
            '<button class="dropdown__item" type="button">' + icon('user') + '<span>پروفایل من</span></button>' +
            '<a class="dropdown__item" href="users.html">' + icon('shield') + '<span>کاربران و دسترسی‌ها</span></a>' +
            '<a class="dropdown__item" href="settings.html">' + icon('settings') + '<span>تنظیمات فروشگاه</span></a>' +
            '<div class="dropdown__sep"></div>' +
            '<a class="dropdown__item dropdown__item--danger" href="login.html" id="logoutLink">' + icon('logout') + '<span>خروج از حساب</span></a>' +
            '</div>' +
            '</div>' +

            '</div>' +
            '</header>'
        );
        main.insertBefore(topbar, main.firstChild);

        /* --------------------------- Toast مشترک ----------------------------- */
        if (!$('#adminToast')) {
            document.body.appendChild(el(
                '<div class="toast" id="adminToast" role="status" aria-live="polite">' +
                '<span id="adminToastIcon">' + icon('check') + '</span>' +
                '<span id="adminToastText">انجام شد</span>' +
                '</div>'
            ));
        }

        bindShellEvents();
        loadNotifications();
        loadSidebarBadges();
    }

    function bindShellEvents() {
        /* خروج از حساب — پاک‌کردن نشست پیش از رفتن به صفحه ورود */
        var logoutLink = $('#logoutLink');
        if (logoutLink) {
            logoutLink.addEventListener('click', function () { endSession(); });
        }

        /* جمع/باز کردن سایدبار (دسکتاپ) — ترجیح در localStorage ذخیره می‌شود */
        var collapseBtn = $('#sidebarCollapse');
        if (collapseBtn) {
            collapseBtn.addEventListener('click', function () {
                var collapsed = document.body.getAttribute('data-sidebar') === 'collapsed';
                if (collapsed) {
                    document.body.removeAttribute('data-sidebar');
                    localStorage.setItem(SIDEBAR_KEY, 'expanded');
                } else {
                    document.body.setAttribute('data-sidebar', 'collapsed');
                    localStorage.setItem(SIDEBAR_KEY, 'collapsed');
                }
            });
        }

        /* Drawer موبایل */
        var burger = $('#topbarBurger');
        var scrim = $('#drawerScrim');
        function closeDrawer() {
            document.body.removeAttribute('data-drawer');
            if (burger) burger.setAttribute('aria-expanded', 'false');
        }
        if (burger) {
            burger.addEventListener('click', function () {
                var open = document.body.getAttribute('data-drawer') === 'open';
                if (open) closeDrawer();
                else {
                    document.body.setAttribute('data-drawer', 'open');
                    burger.setAttribute('aria-expanded', 'true');
                }
            });
        }
        if (scrim) scrim.addEventListener('click', closeDrawer);

        /* بستن با کلید Escape — مسیر فرار همیشه موجود باشد */
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                closeDrawer();
                closeAllDropdowns();
                var res = $('#searchResults');
                if (res) res.classList.remove('search-results--open');
            }
        });

        /* منوهای کشویی */
        $$('.dropdown').forEach(function (dd) {
            var btn = dd.querySelector('button');
            if (!btn) return;
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                var isOpen = dd.classList.contains('dropdown--open');
                closeAllDropdowns();
                if (!isOpen) {
                    dd.classList.add('dropdown--open');
                    btn.setAttribute('aria-expanded', 'true');
                }
            });
        });
        document.addEventListener('click', function () { closeAllDropdowns(); });

        /* جست‌وجوی سراسری با debounce */
        var input = $('#globalSearch');
        var results = $('#searchResults');
        if (input && results) {
            input.addEventListener('input', debounce(async function () {
                var q = input.value.trim();
                if (q.length < 2) {
                    results.classList.remove('search-results--open');
                    return;
                }
                var data = await global.dataService.globalSearch(q);
                results.innerHTML = renderSearchResults(data);
                results.classList.add('search-results--open');
            }, 260));
            input.addEventListener('click', function (e) { e.stopPropagation(); });
            results.addEventListener('click', function (e) { e.stopPropagation(); });
        }

        /* خواندن همه اعلان‌ها */
        var readAll = $('#notifReadAll');
        if (readAll) {
            readAll.addEventListener('click', async function (e) {
                e.stopPropagation();
                await global.dataService.markAllNotificationsRead();
                loadNotifications();
                toast('همه اعلان‌ها خوانده شد');
            });
        }
    }

    function closeAllDropdowns() {
        $$('.dropdown--open').forEach(function (dd) {
            dd.classList.remove('dropdown--open');
            var b = dd.querySelector('button');
            if (b) b.setAttribute('aria-expanded', 'false');
        });
    }

    function renderSearchResults(data) {
        var html = '';
        if (data.products.length) {
            html += '<div class="search-results__group">محصولات</div>';
            data.products.forEach(function (p) {
                html += '<a href="product-form.html?id=' + encodeURIComponent(p.id) + '">' + icon('box') +
                    '<span>' + escapeHtml(p.name) + '</span><small class="ltr">' + escapeHtml(p.code) + '</small></a>';
            });
        }
        if (data.orders.length) {
            html += '<div class="search-results__group">سفارش‌ها</div>';
            data.orders.forEach(function (o) {
                html += '<a href="order-detail.html?id=' + encodeURIComponent(o.orderNumber) + '">' + icon('cart') +
                    '<span>' + escapeHtml(o.orderNumber) + ' — ' + escapeHtml(o.customerName) + '</span>' +
                    '<small>' + moneyShort(o.finalAmount) + '</small></a>';
            });
        }
        if (data.customers.length) {
            html += '<div class="search-results__group">مشتریان</div>';
            data.customers.forEach(function (c) {
                html += '<a href="customer-detail.html?id=' + encodeURIComponent(c.id) + '">' + icon('user') +
                    '<span>' + escapeHtml(c.name) + '</span><small class="ltr">' + escapeHtml(c.phone) + '</small></a>';
            });
        }
        if (!html) {
            html = '<div style="padding:22px;text-align:center;color:var(--text-3);font-size:12.5px">نتیجه‌ای یافت نشد</div>';
        }
        return html;
    }

    async function loadNotifications() {
        var list = $('#notifList');
        var countEl = $('#notifCount');
        if (!list) return;
        var items = await global.dataService.getNotifications();
        var unread = items.filter(function (n) { return !n.read; }).length;

        if (countEl) {
            countEl.hidden = unread === 0;
            countEl.textContent = toPersianNumber(unread);
        }

        var iconFor = { order: 'cart', stock: 'warehouse', payment: 'banknote', review: 'star', ticket: 'message', restock: 'bell' };
        list.innerHTML = items.map(function (n) {
            return '<a class="dropdown__item" href="' + n.link + '" style="' + (n.read ? 'opacity:.6' : '') + '">' +
                icon(iconFor[n.type] || 'info') +
                '<span><b style="font-size:12.5px">' + escapeHtml(n.title) + '</b>' +
                '<small>' + escapeHtml(n.desc) + '</small>' +
                '<small style="color:var(--c-tan)">' + escapeHtml(n.at) + '</small></span>' +
                '</a>';
        }).join('') || '<div style="padding:20px;text-align:center;color:var(--text-3);font-size:12.5px">اعلانی وجود ندارد</div>';
    }

    /* نشان‌های عددی روی آیتم‌های منو */
    async function loadSidebarBadges() {
        var stats = await global.dataService.getDashboardStats();
        var map = {
            pendingOrders: stats.pendingOrderCount,
            lowStock: stats.lowStock.length,
            pendingReviews: stats.pendingReviews,
            openTickets: stats.openTickets
        };
        $$('[data-badge]').forEach(function (badge) {
            var value = map[badge.getAttribute('data-badge')];
            if (value) {
                badge.textContent = toPersianNumber(value);
                badge.hidden = false;
            }
        });
    }

    /* ================================ Toast ============================ */
    /* هم‌رفتار با showToast در storefront */
    var toastTimer;
    function toast(msg, type, undoFn) {
        var box = $('#adminToast');
        if (!box) return;
        var iconWrap = $('#adminToastIcon');
        var text = $('#adminToastText');

        var iconName = type === 'error' ? 'alert' : (type === 'warning' ? 'info' : 'check');
        iconWrap.innerHTML = icon(iconName);
        text.textContent = msg;

        box.className = 'toast toast--show' + (type ? ' toast--' + type : ' toast--success');

        /* امکان بازگرداندن اقدام حذف/گروهی — undo-support */
        var old = box.querySelector('.toast__undo');
        if (old) old.remove();
        if (undoFn) {
            var undoBtn = el('<button type="button" class="toast__undo">بازگرداندن</button>');
            undoBtn.addEventListener('click', function () {
                undoFn();
                box.classList.remove('toast--show');
            });
            box.appendChild(undoBtn);
        }

        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { box.classList.remove('toast--show'); }, undoFn ? 6000 : 2800);
    }

    /* ============================ Modal / Confirm ====================== */
    function modal(opts) {
        var o = opts || {};
        var overlay = el(
            '<div class="overlay" role="dialog" aria-modal="true" aria-label="' + escapeHtml(o.title || 'پنجره') + '">' +
            '<div class="modal' + (o.wide ? ' modal--wide' : '') + '">' +
            '<div class="modal__head">' +
            (o.icon ? '<div class="modal__icon' + (o.danger ? ' modal__icon--danger' : '') + '">' + icon(o.icon) + '</div>' : '') +
            '<h3>' + escapeHtml(o.title || '') + (o.subtitle ? '<p>' + escapeHtml(o.subtitle) + '</p>' : '') + '</h3>' +
            '<button class="act-btn" type="button" data-close aria-label="بستن">' + icon('x') + '</button>' +
            '</div>' +
            '<div class="modal__body">' + (o.body || '') + '</div>' +
            '<div class="modal__foot"></div>' +
            '</div>' +
            '</div>'
        );

        var foot = overlay.querySelector('.modal__foot');
        (o.actions || []).forEach(function (a) {
            var btn = el('<button type="button" class="btn ' + (a.variant || 'btn--ghost') + '">' +
                (a.icon ? icon(a.icon) : '') + '<span>' + escapeHtml(a.label) + '</span></button>');
            btn.addEventListener('click', function () { a.onClick(api, btn); });
            foot.appendChild(btn);
        });

        document.body.appendChild(overlay);
        requestAnimationFrame(function () { overlay.classList.add('overlay--open'); });

        function close() {
            overlay.classList.remove('overlay--open');
            setTimeout(function () { overlay.remove(); }, 300);
        }

        overlay.querySelectorAll('[data-close]').forEach(function (b) {
            b.addEventListener('click', close);
        });
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) close();
        });
        document.addEventListener('keydown', function onKey(e) {
            if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); }
        });

        /* فوکوس روی اولین عنصر تعاملی داخل مودال */
        setTimeout(function () {
            var f = overlay.querySelector('input,select,textarea,button.btn');
            if (f) f.focus();
        }, 120);

        var api = { close: close, root: overlay, body: overlay.querySelector('.modal__body') };
        return api;
    }

    /* تایید قبل از اقدامات مخرب — confirmation-dialogs */
    function confirmDialog(opts) {
        var o = opts || {};
        return new Promise(function (resolve) {
            modal({
                title: o.title || 'تایید عملیات',
                subtitle: o.subtitle || '',
                icon: o.icon || (o.danger ? 'alert' : 'info'),
                danger: o.danger,
                body: '<p>' + (o.message || 'آیا مطمئن هستید؟') + '</p>',
                actions: [
                    { label: o.cancelLabel || 'انصراف', variant: 'btn--ghost', onClick: function (m) { m.close(); resolve(false); } },
                    {
                        label: o.confirmLabel || 'تایید', variant: o.danger ? 'btn--danger' : 'btn--primary',
                        onClick: function (m) { m.close(); resolve(true); }
                    }
                ]
            });
        });
    }

    /* =========================== بج‌های وضعیت ========================== */
    var ORDER_STATUS = {
        pending: { label: 'در انتظار تایید', tone: 'warning', icon: 'clock' },
        processing: { label: 'در حال آماده‌سازی', tone: 'info', icon: 'box' },
        shipped: { label: 'ارسال شده', tone: 'gold', icon: 'truck' },
        delivered: { label: 'تحویل داده شده', tone: 'success', icon: 'checkCircle' },
        cancelled: { label: 'لغو شده', tone: 'danger', icon: 'xCircle' },
        returned: { label: 'مرجوعی', tone: 'neutral', icon: 'undo' }
    };

    var PAYMENT_STATUS = {
        paid: { label: 'پرداخت شده', tone: 'success', icon: 'checkCircle' },
        partial: { label: 'پرداخت جزئی', tone: 'info', icon: 'clock' },
        pending: { label: 'در انتظار پرداخت', tone: 'warning', icon: 'clock' },
        overdue: { label: 'معوق', tone: 'danger', icon: 'alert' }
    };

    var PLAN_TYPE = {
        full: { label: 'پرداخت کامل', tone: 'neutral', icon: 'card' },
        two_stage: { label: 'دو‌مرحله‌ای', tone: 'info', icon: 'scale' },
        installment: { label: 'قسطی', tone: 'gold', icon: 'wallet' }
    };

    var PRODUCT_STATUS = {
        published: { label: 'فعال', tone: 'success', icon: 'checkCircle' },
        draft: { label: 'پیش‌نویس', tone: 'neutral', icon: 'edit' },
        out_of_stock: { label: 'ناموجود', tone: 'danger', icon: 'alert' },
        discontinued: { label: 'متوقف‌شده', tone: 'neutral', icon: 'xCircle' }
    };

    var GENERIC_STATUS = {
        active: { label: 'فعال', tone: 'success', icon: 'checkCircle' },
        inactive: { label: 'غیرفعال', tone: 'neutral', icon: 'xCircle' },
        scheduled: { label: 'زمان‌بندی‌شده', tone: 'info', icon: 'calendar' },
        expired: { label: 'منقضی‌شده', tone: 'neutral', icon: 'clock' },
        approved: { label: 'تایید‌شده', tone: 'success', icon: 'checkCircle' },
        rejected: { label: 'رد‌شده', tone: 'danger', icon: 'xCircle' },
        published_post: { label: 'منتشر‌شده', tone: 'success', icon: 'checkCircle' },
        open: { label: 'باز', tone: 'warning', icon: 'clock' },
        in_progress: { label: 'در حال بررسی', tone: 'info', icon: 'refresh' },
        closed: { label: 'بسته', tone: 'neutral', icon: 'checkCircle' }
    };

    /* رنگ تنها حامل معنا نیست — همیشه آیکون + متن همراه است */
    function badge(text, tone, iconName) {
        return '<span class="badge badge--' + (tone || 'neutral') + '">' +
            (iconName ? icon(iconName) : '') + escapeHtml(text) + '</span>';
    }

    function statusBadge(map, key) {
        var s = map[key] || { label: key || '—', tone: 'neutral', icon: null };
        return badge(s.label, s.tone, s.icon);
    }

    function deltaBadge(value) {
        var dir = value > 0 ? 'up' : (value < 0 ? 'down' : 'flat');
        var iconName = value > 0 ? 'trendUp' : (value < 0 ? 'trendDown' : 'minus');
        return '<span class="delta delta--' + dir + '">' + icon(iconName) +
            toPersianNumber(Math.abs(value)) + '٪</span>';
    }

    /* ============================= حالت خالی ========================== */
    function emptyState(o) {
        var opts = o || {};
        var node = el(
            '<div class="empty">' +
            icon(opts.icon || 'inbox') +
            '<h3>' + escapeHtml(opts.title || 'موردی یافت نشد') + '</h3>' +
            '<p>' + escapeHtml(opts.desc || '') + '</p>' +
            (opts.actionLabel ? '<button type="button" class="btn btn--primary">' +
                icon(opts.actionIcon || 'plus') + '<span>' + escapeHtml(opts.actionLabel) + '</span></button>' : '') +
            '</div>'
        );
        var btn = node.querySelector('button');
        if (btn && opts.onAction) btn.addEventListener('click', opts.onAction);
        return node;
    }

    /* ============================== AdminTable ========================= */
    /*
      جدول داده با قابلیت مرتب‌سازی، جست‌وجو، فیلتر، صفحه‌بندی و انتخاب گروهی.
      صفحه‌بندی و مرتب‌سازی سمت کلاینت است (چون داده فعلاً محلی است) اما ساختار
      طوری است که با تغییر fetchPage به سرور، بقیه کد ثابت می‌ماند.
    */
    function table(config) {
        var cfg = Object.assign({
            pageSize: 10,
            selectable: false,
            cards: true,
            columns: [],
            rows: [],
            rowKey: 'id',
            searchKeys: [],
            filters: [],
            actions: [],
            bulkActions: [],
            empty: {},
            defaultSort: null
        }, config);

        var mount = typeof cfg.mount === 'string' ? $(cfg.mount) : cfg.mount;
        if (!mount) return null;

        var state = {
            page: 1,
            sortKey: cfg.defaultSort ? cfg.defaultSort.key : null,
            sortDir: cfg.defaultSort ? cfg.defaultSort.dir : 'asc',
            query: '',
            filters: {},
            selected: []
        };

        /* --- ساخت اسکلت --- */
        mount.innerHTML = '';
        var hasToolbar = cfg.searchKeys.length || cfg.filters.length || cfg.actions.length;

        var toolbar = null;
        if (hasToolbar) {
            toolbar = el('<div class="toolbar"></div>');
            if (cfg.searchKeys.length) {
                var searchBox = el('<div class="toolbar__search">' + icon('search') +
                    '<input type="search" placeholder="' + escapeHtml(cfg.searchPlaceholder || 'جست‌وجو…') + '" aria-label="جست‌وجو در جدول"></div>');
                var searchInput = searchBox.querySelector('input');
                searchInput.addEventListener('input', debounce(function () {
                    state.query = searchInput.value.trim();
                    state.page = 1;
                    render();
                }, 240));
                toolbar.appendChild(searchBox);
            }

            cfg.filters.forEach(function (f) {
                var sel = el('<select class="select" style="min-height:40px;max-width:190px;font-size:12.5px" aria-label="' + escapeHtml(f.label) + '">' +
                    '<option value="">' + escapeHtml(f.label) + '</option>' +
                    f.options.map(function (op) {
                        return '<option value="' + escapeHtml(op.value) + '">' + escapeHtml(op.label) + '</option>';
                    }).join('') + '</select>');
                sel.addEventListener('change', function () {
                    state.filters[f.key] = sel.value;
                    state.page = 1;
                    render();
                });
                toolbar.appendChild(sel);
            });

            toolbar.appendChild(el('<div class="toolbar__spacer"></div>'));
            toolbar.appendChild(el('<span class="toolbar__count" data-count></span>'));

            cfg.actions.forEach(function (a) {
                var btn = el('<button type="button" class="btn btn--sm ' + (a.variant || 'btn--ghost') + '">' +
                    (a.icon ? icon(a.icon) : '') + '<span>' + escapeHtml(a.label) + '</span></button>');
                btn.addEventListener('click', function () { a.onClick(api, btn); });
                toolbar.appendChild(btn);
            });
            mount.appendChild(toolbar);
        }

        /* نوار عملیات گروهی */
        var bulkbar = null;
        if (cfg.selectable && cfg.bulkActions.length) {
            bulkbar = el('<div class="bulkbar"><b data-bulk-count></b>' +
                '<div class="toolbar__spacer"></div></div>');
            cfg.bulkActions.forEach(function (a) {
                var btn = el('<button type="button" class="btn btn--sm ' + (a.variant || 'btn--ghost') + '">' +
                    (a.icon ? icon(a.icon) : '') + '<span>' + escapeHtml(a.label) + '</span></button>');
                btn.addEventListener('click', function () { a.onClick(state.selected.slice(), api); });
                bulkbar.appendChild(btn);
            });
            var clearBtn = el('<button type="button" class="act-btn" aria-label="لغو انتخاب">' + icon('x') + '</button>');
            clearBtn.addEventListener('click', function () { state.selected = []; render(); });
            bulkbar.appendChild(clearBtn);
            mount.appendChild(bulkbar);
        }

        var wrap = el('<div class="table-wrap"></div>');
        /* پیش‌فرض: در موبایل هر ردیف به کارت تبدیل می‌شود (همه سلول‌ها data-label دارند).
           برای جدول‌های خیلی باریک می‌توان با cards: false غیرفعالش کرد. */
        var asCards = cfg.cards !== false;
        var tableEl = el('<table class="table' + (asCards ? ' table--cards' : '') + '"><thead></thead><tbody></tbody></table>');
        wrap.appendChild(tableEl);
        mount.appendChild(wrap);

        var pager = el('<div class="pagination">' +
            '<span class="pagination__info" data-info></span>' +
            '<div class="pagination__pages" data-pages></div>' +
            '</div>');
        mount.appendChild(pager);

        /* --- منطق داده --- */
        function filteredRows() {
            var rows = cfg.rows.slice();

            if (state.query && cfg.searchKeys.length) {
                var q = toEnglishNumber(state.query).toLowerCase();
                rows = rows.filter(function (r) {
                    return cfg.searchKeys.some(function (k) {
                        return toEnglishNumber(String(r[k] === undefined || r[k] === null ? '' : r[k])).toLowerCase().indexOf(q) !== -1;
                    });
                });
            }

            cfg.filters.forEach(function (f) {
                var v = state.filters[f.key];
                if (!v) return;
                rows = rows.filter(function (r) {
                    return f.match ? f.match(r, v) : String(r[f.key]) === v;
                });
            });

            if (state.sortKey) {
                var col = cfg.columns.filter(function (c) { return c.key === state.sortKey; })[0];
                rows.sort(function (a, b) {
                    var va = col && col.sortValue ? col.sortValue(a) : a[state.sortKey];
                    var vb = col && col.sortValue ? col.sortValue(b) : b[state.sortKey];
                    if (typeof va === 'number' && typeof vb === 'number') return state.sortDir === 'asc' ? va - vb : vb - va;
                    va = String(va === undefined || va === null ? '' : va);
                    vb = String(vb === undefined || vb === null ? '' : vb);
                    return state.sortDir === 'asc' ? va.localeCompare(vb, 'fa') : vb.localeCompare(va, 'fa');
                });
            }
            return rows;
        }

        function render() {
            var rows = filteredRows();
            var totalPages = Math.max(1, Math.ceil(rows.length / cfg.pageSize));
            if (state.page > totalPages) state.page = totalPages;
            var start = (state.page - 1) * cfg.pageSize;
            var pageRows = rows.slice(start, start + cfg.pageSize);

            /* --- سرستون --- */
            var thead = tableEl.querySelector('thead');
            var headHtml = '<tr>';
            if (cfg.selectable) {
                headHtml += '<th class="col-check"><label class="check"><input type="checkbox" data-check-all aria-label="انتخاب همه"><span class="check__box">' + icon('check') + '</span></label></th>';
            }
            cfg.columns.forEach(function (c) {
                var sortAttr = '';
                if (c.sortable) {
                    sortAttr = state.sortKey === c.key
                        ? ' aria-sort="' + (state.sortDir === 'asc' ? 'ascending' : 'descending') + '"'
                        : ' aria-sort="none"';
                }
                headHtml += '<th class="' + (c.sortable ? 'is-sortable ' : '') + (c.className || '') + '"' +
                    (c.width ? ' style="width:' + c.width + '"' : '') + sortAttr +
                    (c.sortable ? ' data-sort="' + c.key + '" tabindex="0" role="button"' : '') + '>' +
                    '<span class="th-inner">' + escapeHtml(c.label) + (c.sortable ? icon('sort') : '') + '</span></th>';
            });
            headHtml += '</tr>';
            thead.innerHTML = headHtml;

            thead.querySelectorAll('[data-sort]').forEach(function (th) {
                function doSort() {
                    var key = th.getAttribute('data-sort');
                    if (state.sortKey === key) state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
                    else { state.sortKey = key; state.sortDir = 'asc'; }
                    render();
                }
                th.addEventListener('click', doSort);
                th.addEventListener('keydown', function (e) {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); doSort(); }
                });
            });

            var checkAll = thead.querySelector('[data-check-all]');
            if (checkAll) {
                var pageIds = pageRows.map(function (r) { return r[cfg.rowKey]; });
                var selectedOnPage = pageIds.filter(function (id) { return state.selected.indexOf(id) !== -1; });
                checkAll.checked = pageIds.length > 0 && selectedOnPage.length === pageIds.length;
                checkAll.indeterminate = selectedOnPage.length > 0 && selectedOnPage.length < pageIds.length;
                checkAll.addEventListener('change', function () {
                    if (checkAll.checked) {
                        pageIds.forEach(function (id) {
                            if (state.selected.indexOf(id) === -1) state.selected.push(id);
                        });
                    } else {
                        state.selected = state.selected.filter(function (id) { return pageIds.indexOf(id) === -1; });
                    }
                    render();
                });
            }

            /* --- بدنه --- */
            var tbody = tableEl.querySelector('tbody');
            tbody.innerHTML = '';

            if (!pageRows.length) {
                wrap.style.display = 'none';
                pager.style.display = 'none';
                var existing = mount.querySelector('.empty');
                if (existing) existing.remove();
                mount.appendChild(emptyState({
                    icon: cfg.empty.icon,
                    title: (state.query || Object.keys(state.filters).some(function (k) { return state.filters[k]; }))
                        ? 'نتیجه‌ای برای این جست‌وجو یافت نشد' : cfg.empty.title,
                    desc: cfg.empty.desc,
                    actionLabel: cfg.empty.actionLabel,
                    actionIcon: cfg.empty.actionIcon,
                    onAction: cfg.empty.onAction
                }));
            } else {
                var oldEmpty = mount.querySelector('.empty');
                if (oldEmpty) oldEmpty.remove();
                wrap.style.display = '';
                pager.style.display = '';

                pageRows.forEach(function (row, i) {
                    var id = row[cfg.rowKey];
                    var tr = document.createElement('tr');
                    if (state.selected.indexOf(id) !== -1) tr.classList.add('is-selected');
                    if (cfg.onRowClick) tr.classList.add('is-clickable');
                    tr.style.animationDelay = (i * 22) + 'ms';
                    tr.classList.add('reveal');

                    var html = '';
                    if (cfg.selectable) {
                        html += '<td class="col-check"><label class="check"><input type="checkbox" data-row-check' +
                            (state.selected.indexOf(id) !== -1 ? ' checked' : '') +
                            ' aria-label="انتخاب سطر"><span class="check__box">' + icon('check') + '</span></label></td>';
                    }
                    cfg.columns.forEach(function (c) {
                        var content = c.render ? c.render(row) : escapeHtml(row[c.key]);
                        html += '<td class="' + (c.className || '') + '" data-label="' + escapeHtml(c.label) + '">' + content + '</td>';
                    });
                    tr.innerHTML = html;

                    var rowCheck = tr.querySelector('[data-row-check]');
                    if (rowCheck) {
                        rowCheck.addEventListener('click', function (e) { e.stopPropagation(); });
                        rowCheck.addEventListener('change', function () {
                            if (rowCheck.checked) state.selected.push(id);
                            else state.selected = state.selected.filter(function (x) { return x !== id; });
                            render();
                        });
                    }

                    if (cfg.onRowClick) {
                        tr.addEventListener('click', function (e) {
                            if (e.target.closest('button,a,input,label,select')) return;
                            cfg.onRowClick(row);
                        });
                    }
                    tbody.appendChild(tr);
                });
            }

            /* --- شمارنده و صفحه‌بندی --- */
            var countEl = toolbar && toolbar.querySelector('[data-count]');
            if (countEl) countEl.textContent = toPersianNumber(rows.length) + ' مورد';

            if (bulkbar) {
                bulkbar.classList.toggle('bulkbar--show', state.selected.length > 0);
                var bc = bulkbar.querySelector('[data-bulk-count]');
                if (bc) bc.textContent = toPersianNumber(state.selected.length) + ' مورد انتخاب شده';
            }

            var info = pager.querySelector('[data-info]');
            if (info) {
                info.textContent = rows.length
                    ? 'نمایش ' + toPersianNumber(start + 1) + ' تا ' + toPersianNumber(Math.min(start + cfg.pageSize, rows.length)) +
                    ' از ' + toPersianNumber(rows.length) + ' مورد'
                    : '';
            }

            var pagesWrap = pager.querySelector('[data-pages]');
            pagesWrap.innerHTML = '';
            if (totalPages > 1) {
                pagesWrap.appendChild(pageButton(icon('chevronRight'), state.page - 1, state.page === 1, 'صفحه قبل'));
                pageNumbers(state.page, totalPages).forEach(function (p) {
                    if (p === '…') {
                        pagesWrap.appendChild(el('<span class="page-btn" aria-hidden="true">…</span>'));
                    } else {
                        var b = pageButton(toPersianNumber(p), p, false, 'صفحه ' + toPersianNumber(p));
                        if (p === state.page) {
                            b.classList.add('page-btn--active');
                            b.setAttribute('aria-current', 'page');
                        }
                        pagesWrap.appendChild(b);
                    }
                });
                pagesWrap.appendChild(pageButton(icon('chevronLeft'), state.page + 1, state.page === totalPages, 'صفحه بعد'));
            }
        }

        function pageButton(label, target, disabled, aria) {
            var b = el('<button type="button" class="page-btn" aria-label="' + escapeHtml(aria) + '">' + label + '</button>');
            b.disabled = !!disabled;
            b.addEventListener('click', function () {
                state.page = target;
                render();
                mount.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            });
            return b;
        }

        function pageNumbers(current, total) {
            var out = [];
            for (var i = 1; i <= total; i++) {
                if (i === 1 || i === total || Math.abs(i - current) <= 1) out.push(i);
                else if (out[out.length - 1] !== '…') out.push('…');
            }
            return out;
        }

        var api = {
            render: render,
            setRows: function (rows) { cfg.rows = rows; state.selected = []; render(); },
            getRows: function () { return cfg.rows; },
            getFiltered: filteredRows,
            getSelected: function () { return state.selected.slice(); },
            clearSelection: function () { state.selected = []; render(); },
            state: state
        };

        render();
        return api;
    }

    /* ============================ اسکلتون جدول ========================= */
    function tableSkeleton(mount, rows) {
        var node = typeof mount === 'string' ? $(mount) : mount;
        if (!node) return;
        var html = '<div style="padding:16px 22px"><div class="skeleton skeleton--text" style="width:180px;height:16px"></div></div>';
        for (var i = 0; i < (rows || 6); i++) {
            html += '<div class="skeleton skeleton--row" style="opacity:' + (1 - i * 0.1) + '"></div>';
        }
        node.innerHTML = html;
    }

    /* ============================= خروجی CSV ========================== */
    /* برون‌بری برای کمپین‌های بازاریابی و گزارش‌ها */
    function exportCsv(filename, columns, rows) {
        var head = columns.map(function (c) { return '"' + String(c.label).replace(/"/g, '""') + '"'; }).join(',');
        var body = rows.map(function (r) {
            return columns.map(function (c) {
                var v = c.value ? c.value(r) : r[c.key];
                return '"' + String(v === undefined || v === null ? '' : v).replace(/"/g, '""') + '"';
            }).join(',');
        }).join('\n');

        /* BOM برای نمایش صحیح فارسی در Excel */
        var blob = new Blob(['\uFEFF' + head + '\n' + body], { type: 'text/csv;charset=utf-8;' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        toast('فایل ' + filename + ' آماده دانلود شد');
    }

    /* ======================= لینک واتساپ با پیش‌متن ==================== */
    /* واتساپ کانال اصلی ارتباطی هستی است (۰۹۱۵۲۵۰۰۵۵۳) */
    function whatsappLink(phone, text) {
        var normalized = toEnglishNumber(String(phone || '')).replace(/\D/g, '');
        if (normalized.indexOf('0') === 0) normalized = '98' + normalized.slice(1);
        return 'https://wa.me/' + normalized + (text ? '?text=' + encodeURIComponent(text) : '');
    }

    /* ========================== اعتبارسنجی فرم ======================== */
    /* پیام خطای فارسی و واضح، زیر همان فیلد — الگوی pdpHint در PDP */
    function setFieldError(field, message) {
        var wrap = field.closest('.field');
        if (!wrap) return;
        wrap.classList.add('field--error');
        var msg = wrap.querySelector('.error-msg');
        if (!msg) {
            msg = el('<span class="error-msg">' + icon('alert') + '<span></span></span>');
            wrap.appendChild(msg);
        }
        msg.querySelector('span').textContent = message;
        field.setAttribute('aria-invalid', 'true');
    }

    function clearFieldError(field) {
        var wrap = field.closest('.field');
        if (!wrap) return;
        wrap.classList.remove('field--error');
        field.removeAttribute('aria-invalid');
    }

    /* اعتبارسنجی روی blur (نه هر کلید) و فوکوس روی اولین فیلد نامعتبر */
    function validateForm(form, rules) {
        var firstInvalid = null;
        var valid = true;

        Object.keys(rules).forEach(function (name) {
            var field = form.querySelector('[name="' + name + '"]');
            if (!field) return;
            clearFieldError(field);
            var error = rules[name](field.value, field);
            if (error) {
                setFieldError(field, error);
                valid = false;
                if (!firstInvalid) firstInvalid = field;
            }
        });

        if (firstInvalid) {
            firstInvalid.focus();
            firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return valid;
    }

    function required(label) {
        return function (v) {
            return String(v || '').trim() ? null : 'وارد کردن ' + label + ' الزامی است.';
        };
    }

    /* ==================== تنظیمات پیش‌فرض نمودار (Chart.js) ============ */
    var CHART_COLORS = ['#c6ac8f', '#22333b', '#5e503f', '#2f7a4f', '#a8503f', '#c9902e', '#5b7c99', '#8d8070'];

    function initCharts() {
        if (!global.Chart) return false;
        var C = global.Chart;
        C.defaults.font.family = 'Sahel, system-ui, sans-serif';
        C.defaults.font.size = 11.5;
        C.defaults.color = '#5e503f';
        C.defaults.plugins.legend.display = false;
        C.defaults.plugins.tooltip.backgroundColor = '#22333b';
        C.defaults.plugins.tooltip.titleFont = { family: 'Sahel', size: 12 };
        C.defaults.plugins.tooltip.bodyFont = { family: 'Sahel', size: 12 };
        C.defaults.plugins.tooltip.padding = 11;
        C.defaults.plugins.tooltip.cornerRadius = 10;
        C.defaults.plugins.tooltip.displayColors = false;
        C.defaults.plugins.tooltip.rtl = true;
        C.defaults.plugins.tooltip.textDirection = 'rtl';
        /* احترام به prefers-reduced-motion */
        if (global.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            C.defaults.animation = false;
        }
        return true;
    }

    /* گرادیان طلایی عمودی برای نمودار ستونی/سطحی */
    function goldGradient(ctx, area, alphaTop, alphaBottom) {
        var g = ctx.createLinearGradient(0, area.top, 0, area.bottom);
        g.addColorStop(0, 'rgba(198,172,143,' + (alphaTop === undefined ? 0.95 : alphaTop) + ')');
        g.addColorStop(1, 'rgba(198,172,143,' + (alphaBottom === undefined ? 0.12 : alphaBottom) + ')');
        return g;
    }

    /* حلقه پیشرفت هدف با SVG خام + گرادیان طلایی */
    function gaugeSvg(percentValue, size, stroke) {
        var s = size || 170;
        var w = stroke || 14;
        var r = (s - w) / 2;
        var c = 2 * Math.PI * r;
        var offset = c - (c * Math.min(100, percentValue) / 100);
        return '<div class="gauge">' +
            '<svg width="' + s + '" height="' + s + '" viewBox="0 0 ' + s + ' ' + s + '" role="img" ' +
            'aria-label="پیشرفت ' + toPersianNumber(percentValue) + ' درصد">' +
            '<defs><linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">' +
            '<stop offset="0%" stop-color="#c6ac8f"/><stop offset="55%" stop-color="#e2d0b6"/><stop offset="100%" stop-color="#b89a76"/>' +
            '</linearGradient></defs>' +
            '<circle class="gauge__track" cx="' + s / 2 + '" cy="' + s / 2 + '" r="' + r + '" stroke-width="' + w + '"/>' +
            '<circle class="gauge__fill" cx="' + s / 2 + '" cy="' + s / 2 + '" r="' + r + '" stroke-width="' + w + '" ' +
            'stroke-dasharray="' + c + '" stroke-dashoffset="' + offset + '"/>' +
            '</svg>' +
            '<div class="gauge__center"><b>' + toPersianNumber(percentValue) + '٪</b><span>از هدف</span></div>' +
            '</div>';
    }

    /* اسپارک‌لاین SVG خام برای کارت‌های KPI */
    function sparkline(values, color) {
        if (!values || values.length < 2) return '';
        var w = 100, h = 34;
        var max = Math.max.apply(null, values);
        var min = Math.min.apply(null, values);
        var range = max - min || 1;
        var pts = values.map(function (v, i) {
            return [(i / (values.length - 1)) * w, h - ((v - min) / range) * (h - 4) - 2];
        });
        var line = pts.map(function (p, i) {
            return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1);
        }).join(' ');
        var area = line + ' L' + w + ' ' + h + ' L0 ' + h + ' Z';
        var id = 'sp' + Math.random().toString(36).slice(2, 7);
        var stroke = color || '#c6ac8f';
        return '<svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" aria-hidden="true">' +
            '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0%" stop-color="' + stroke + '" stop-opacity=".38"/>' +
            '<stop offset="100%" stop-color="' + stroke + '" stop-opacity="0"/>' +
            '</linearGradient></defs>' +
            '<path d="' + area + '" fill="url(#' + id + ')"/>' +
            '<path d="' + line + '" fill="none" stroke="' + stroke + '" stroke-width="1.8" ' +
            'stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>' +
            '</svg>';
    }

    /* =============================== خروجی ============================ */
    Object.assign(Admin, {
        /* اعداد و قیمت */
        fa: toPersianNumber,
        toEn: toEnglishNumber,
        price: formatPrice,
        money: money,
        moneyPlain: moneyPlain,
        moneyShort: moneyShort,
        percent: percent,

        /* تاریخ */
        jDate: jDate,
        jShort: jShort,
        jMonths: JMONTHS,
        todayFormatted: todayFormatted,
        daysUntil: daysUntil,
        dueLabel: dueLabel,

        /* آیکون و DOM */
        icon: icon,
        stars: stars,
        el: el,
        $: $,
        $$: $$,
        escapeHtml: escapeHtml,
        param: param,
        debounce: debounce,

        /* Shell */
        shell: renderAdminShell,
        NAV: NAV,

        /* بازخورد */
        toast: toast,
        modal: modal,
        confirm: confirmDialog,

        /* بج و وضعیت */
        badge: badge,
        statusBadge: statusBadge,
        deltaBadge: deltaBadge,
        ORDER_STATUS: ORDER_STATUS,
        PAYMENT_STATUS: PAYMENT_STATUS,
        PLAN_TYPE: PLAN_TYPE,
        PRODUCT_STATUS: PRODUCT_STATUS,
        GENERIC_STATUS: GENERIC_STATUS,
        orderStatus: function (k) { return statusBadge(ORDER_STATUS, k); },
        paymentStatus: function (k) { return statusBadge(PAYMENT_STATUS, k); },
        planType: function (k) { return statusBadge(PLAN_TYPE, k); },
        productStatus: function (k) { return statusBadge(PRODUCT_STATUS, k); },
        genericStatus: function (k) { return statusBadge(GENERIC_STATUS, k); },

        /* کامپوننت‌ها */
        emptyState: emptyState,
        table: table,
        tableSkeleton: tableSkeleton,
        exportCsv: exportCsv,
        whatsappLink: whatsappLink,

        /* فرم */
        setFieldError: setFieldError,
        clearFieldError: clearFieldError,
        validateForm: validateForm,
        required: required,

        /* نمودار */
        initCharts: initCharts,
        CHART_COLORS: CHART_COLORS,
        goldGradient: goldGradient,
        gaugeSvg: gaugeSvg,
        sparkline: sparkline
    });

    global.Admin = Admin;
})(window);
