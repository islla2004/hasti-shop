/* ============================================================================
   پنل مدیریت هستی — داده نمایشی (Mock Data)
   ----------------------------------------------------------------------------
   ساختار این داده‌ها عیناً مطابق «بخش ۸ | پیشنهاد ساختار داده» پرامپت است و
   با مدل داده فعلی storefront (آرایه PRODUCTS در product.html و
   CHADOR_PRODUCTS در chador.html) هم‌خوان است.

   TODO(backend): این فایل صرفاً برای فاز UI است. پس از آماده شدن بک‌اند،
   این ماژول حذف و توابع dataService.js به fetch() واقعی وصل می‌شوند.
   داده‌های تجاری حساس (سفارش، پرداخت، موجودی) هرگز نباید در سمت کلاینت
   به‌عنوان منبع حقیقت (source of truth) باقی بمانند.
   ========================================================================== */

(function (global) {
    "use strict";

    /* مسیر تصاویر — فایل‌های موجود در ریشه پروژه (یک سطح بالاتر از /admin) */
    var IMG = {
        abaya1: '../01.webp',
        abaya1b: '../01-2.webp',
        abaya2: '../02.webp',
        abaya2b: '../02-2.webp',
        shomiz: '../03.webp',
        shomiz2: '../03-1.webp',
        chador: '../04.webp',
        chador2: '../04 (1).webp',
        chadorItem: '../chadorItem.webp',
        shall: '../ShallItem.webp',
        kiff: '../kiff.webp',
        set: '../set.webp',
        shumizFull: '../shumiz.webp',
        abbaItem: '../AbbaItrm.webp',
        mazon: '../mazon.webp'
    };

    /* ============================ دسته‌بندی محصول =========================== */
    /* ستون اول مگامنوی storefront */
    var CATEGORIES = [
        { id: 'chador', name: 'چادر مجلسی', slug: 'chador', image: IMG.chadorItem, order: 1, productCount: 5, seo: { title: 'چادر مجلسی هستی', description: 'خرید چادر مجلسی با پارچه درجه یک و دوخت دست‌ساز' } },
        { id: 'abaya', name: 'عبا', slug: 'abaya', image: IMG.abbaItem, order: 2, productCount: 3, seo: { title: 'عبای مجلسی و روزمره', description: 'عبای سبک و افتاده با دوخت دست‌ساز' } },
        { id: 'shall', name: 'شال و روسری', slug: 'shall-rousari', image: IMG.shall, order: 3, productCount: 2, seo: { title: 'شال و روسری', description: 'شال و روسری با طرح‌های اختصاصی هستی' } },
        { id: 'kiff', name: 'کیف جواهردوزی', slug: 'kiff-javaherdoozi', image: IMG.kiff, order: 4, productCount: 2, seo: { title: 'کیف جواهردوزی دست‌ساز', description: 'کیف مجلسی جواهردوزی‌شده با سنگ‌های دست‌چین' } },
        { id: 'shomiz', name: 'شومیز', slug: 'shomiz', image: IMG.shumizFull, order: 5, productCount: 1, seo: { title: 'شومیز پوشیده', description: 'شومیز آزاد و پوشیده مناسب محیط کار' } },
        { id: 'palto', name: 'پالتو', slug: 'palto', image: IMG.mazon, order: 6, productCount: 1, seo: { title: 'پالتو زنانه پوشیده', description: 'پالتو گرم و پوشیده برای فصل سرد' } }
    ];

    /* ================================ کالکشن ============================== */
    /* ستون دوم مگامنو — کمپین‌های فصلی/مناسبتی */
    var COLLECTIONS = [
        { id: 'arbaeen', name: 'کالکشن اربعین', banner: IMG.chador, startDate: '1403-05-01', endDate: '1403-06-15', featuredHome: true, active: true, productCount: 4, seo: { title: 'کالکشن اربعین هستی', description: 'پوشش مناسب سفر اربعین' } },
        { id: 'winter', name: 'کالکشن زمستانی', banner: IMG.mazon, startDate: '1403-09-01', endDate: '1403-12-29', featuredHome: true, active: true, productCount: 3, seo: { title: 'کالکشن زمستانی', description: 'پارچه‌های گرم و ضخیم زمستانی' } },
        { id: 'sets', name: 'ست‌های پیشنهادی هستی', banner: IMG.set, startDate: '1403-01-01', endDate: '1404-12-29', featuredHome: true, active: true, productCount: 3, seo: { title: 'ست‌های پیشنهادی', description: 'ست‌های هماهنگ انتخاب‌شده توسط هستی' } },
        { id: 'eco', name: 'کالکشن اقتصادی', banner: IMG.abaya2, startDate: '1403-01-01', endDate: '1404-12-29', featuredHome: false, active: true, productCount: 4, seo: { title: 'کالکشن اقتصادی', description: 'کیفیت هستی با قیمت مناسب' } },
        { id: 'luxe', name: 'کالکشن فاخر', banner: IMG.chador2, startDate: '1403-02-01', endDate: '1404-06-30', featuredHome: false, active: false, productCount: 3, seo: { title: 'کالکشن فاخر', description: 'محصولات دست‌دوز ویژه مراسم رسمی' } }
    ];

    /* =========================== تاکسونومی جنس پارچه ======================= */
    var FABRICS = [
        { id: 'krep-harir', name: 'کرپ حریر', productCount: 3 },
        { id: 'krep-kristal', name: 'کرپ کریستال', productCount: 3 },
        { id: 'nasim', name: 'نسیم مشکی', productCount: 2 },
        { id: 'jerse', name: 'ژرسه سنگین', productCount: 2 },
        { id: 'satan', name: 'ساتن مشکی', productCount: 2 },
        { id: 'krep-espandex', name: 'کرپ اسپاندکس', productCount: 2 }
    ];

    /* ============================== رنگ‌های پایه ========================== */
    var COLOR_PRESETS = [
        { name: 'مشکی', hex: '#111111' },
        { name: 'سرمه‌ای', hex: '#22333b' },
        { name: 'کرم', hex: '#eae0d5' },
        { name: 'بژ طلایی', hex: '#c6ac8f' },
        { name: 'قهوه‌ای', hex: '#5e503f' },
        { name: 'اناری', hex: '#8c2b3d' }
    ];

    /* ================================ محصولات ============================= */
    /* ساختار مطابق بخش ۸ پرامپت. قیمت نهایی در dataService محاسبه می‌شود. */
    var PRODUCTS = [
        {
            id: 'chador-negin-baran', code: 'HJ-CHD-001', barcode: '8901234567890',
            name: 'چادر فاخر نگین باران', category: 'chador', collections: ['arbaeen', 'luxe'],
            fabric: 'کرپ حریر', sizes: ['یک‌سایز'], lengths: [155, 160, 165, 170],
            colors: [{ name: 'مشکی', hex: '#111111', images: [IMG.chador, IMG.chador2] }],
            variants: [
                { size: 'یک‌سایز', length: 155, color: 'مشکی', stock: 0, barcode: '8901234567891' },
                { size: 'یک‌سایز', length: 160, color: 'مشکی', stock: 0, barcode: '8901234567892' },
                { size: 'یک‌سایز', length: 165, color: 'مشکی', stock: 0, barcode: '8901234567893' },
                { size: 'یک‌سایز', length: 170, color: 'مشکی', stock: 0, barcode: '8901234567894' }
            ],
            oldPrice: 10000000, discount: 26, costPrice: 4200000, lowStockThreshold: 4,
            images: [IMG.chador, IMG.chador2],
            description: 'چادر فاخر نگین باران با کارشده‌های ظریف و پارچه‌ای درجه یک، برای مراسم‌های مجلسی و مذهبی طراحی شده است.',
            features: ['پارچه کرپ حریر درجه یک', 'نگین‌کاری دست‌ساز روی حاشیه', 'دوخت تمام‌دست', 'سبک و بدون سنگینی روی شانه'],
            care: ['شست‌وشو با دست و آب سرد', 'عدم استفاده از سفیدکننده', 'اتو با حرارت ملایم', 'خشک کردن آویزان در سایه'],
            status: 'out_of_stock', featuredHome: true, views: 980, rating: 4.8, salesCount: 34,
            seo: { title: 'چادر فاخر نگین باران | هستی', description: 'خرید چادر فاخر نگین باران با پارچه کرپ حریر و نگین‌کاری دست‌ساز' },
            createdAt: '1403-04-02', updatedAt: '1403-06-01'
        },
        {
            id: 'chador-malake-mashhad', code: 'HJ-CHD-002', barcode: '8901234567900',
            name: 'چادر ملکه مشهد', category: 'chador', collections: ['arbaeen', 'eco'],
            fabric: 'کرپ کریستال', sizes: ['یک‌سایز'], lengths: [155, 160, 165],
            colors: [{ name: 'مشکی', hex: '#111111', images: [IMG.chadorItem] }],
            variants: [
                { size: 'یک‌سایز', length: 155, color: 'مشکی', stock: 8, barcode: '8901234567901' },
                { size: 'یک‌سایز', length: 160, color: 'مشکی', stock: 14, barcode: '8901234567902' },
                { size: 'یک‌سایز', length: 165, color: 'مشکی', stock: 3, barcode: '8901234567903' }
            ],
            oldPrice: 8500000, discount: 15, costPrice: 3600000, lowStockThreshold: 5,
            images: [IMG.chadorItem, IMG.chador],
            description: 'چادر ملکه مشهد با پارچه کرپ کریستال مات و فرم‌گیری عالی، انتخابی همیشگی برای زیارت و مراسم.',
            features: ['کرپ کریستال مات و بدون براقی', 'فرم‌گیری عالی روی سر', 'مقاوم در برابر چروک', 'مناسب استفاده روزمره'],
            care: ['شست‌وشوی ماشینی با دور کم', 'اتو با حرارت ملایم', 'خشک کردن در سایه'],
            status: 'published', featuredHome: true, views: 1450, rating: 4.9, salesCount: 61,
            seo: { title: 'چادر ملکه مشهد | هستی', description: 'چادر کرپ کریستال با فرم‌گیری عالی' },
            createdAt: '1403-03-18', updatedAt: '1403-06-12'
        },
        {
            id: 'chador-golbarg-anari', code: 'HJ-CHD-003', barcode: '8901234567910',
            name: 'چادر گلبرگ اناری', category: 'chador', collections: ['luxe'],
            fabric: 'ژرسه سنگین', sizes: ['یک‌سایز'], lengths: [160, 165, 170],
            colors: [{ name: 'مشکی', hex: '#111111', images: [IMG.chador] }, { name: 'اناری', hex: '#8c2b3d', images: [IMG.chador2] }],
            variants: [
                { size: 'یک‌سایز', length: 160, color: 'مشکی', stock: 6, barcode: '8901234567911' },
                { size: 'یک‌سایز', length: 165, color: 'مشکی', stock: 9, barcode: '8901234567912' },
                { size: 'یک‌سایز', length: 170, color: 'اناری', stock: 2, barcode: '8901234567913' }
            ],
            oldPrice: 9800000, discount: 20, costPrice: 4050000, lowStockThreshold: 4,
            images: [IMG.chador2, IMG.chador],
            description: 'چادر گلبرگ اناری با ژرسه سنگین و افتادگی بی‌نظیر، مناسب مجالس رسمی.',
            features: ['ژرسه سنگین با افتادگی زیبا', 'حاشیه‌دوزی گلبرگ', 'دو رنگ‌بندی اختصاصی'],
            care: ['خشک‌شویی توصیه می‌شود', 'اتو از پشت پارچه'],
            status: 'published', featuredHome: false, views: 2100, rating: 4.7, salesCount: 47,
            seo: { title: 'چادر گلبرگ اناری | هستی', description: 'چادر ژرسه سنگین با حاشیه‌دوزی گلبرگ' },
            createdAt: '1403-05-11', updatedAt: '1403-06-20'
        },
        {
            id: 'chador-shab-yalda', code: 'HJ-CHD-004', barcode: '8901234567920',
            name: 'چادر شب یلدا', category: 'chador', collections: ['winter', 'luxe'],
            fabric: 'کرپ حریر', sizes: ['یک‌سایز'], lengths: [165, 170],
            colors: [{ name: 'مشکی', hex: '#111111', images: [IMG.chador] }],
            variants: [
                { size: 'یک‌سایز', length: 165, color: 'مشکی', stock: 11, barcode: '8901234567921' },
                { size: 'یک‌سایز', length: 170, color: 'مشکی', stock: 7, barcode: '8901234567922' }
            ],
            oldPrice: 11200000, discount: 30, costPrice: 4600000, lowStockThreshold: 4,
            images: [IMG.chador, IMG.chadorItem],
            description: 'چادر شب یلدا، فاخرترین طرح کالکشن زمستانی هستی با پارچه کرپ حریر ضخیم.',
            features: ['کرپ حریر ضخیم زمستانی', 'دوخت تقویت‌شده', 'مناسب هوای سرد'],
            care: ['شست‌وشو با دست', 'دور از نور مستقیم آفتاب'],
            status: 'published', featuredHome: true, views: 3050, rating: 4.9, salesCount: 78,
            seo: { title: 'چادر شب یلدا | هستی', description: 'چادر زمستانی کرپ حریر ضخیم' },
            createdAt: '1403-05-28', updatedAt: '1403-06-25'
        },
        {
            id: 'chador-niloofar', code: 'HJ-CHD-005', barcode: '8901234567930',
            name: 'چادر نیلوفر', category: 'chador', collections: ['eco'],
            fabric: 'ساتن مشکی', sizes: ['یک‌سایز'], lengths: [155, 160],
            colors: [{ name: 'مشکی', hex: '#111111', images: [IMG.chadorItem] }],
            variants: [
                { size: 'یک‌سایز', length: 155, color: 'مشکی', stock: 1, barcode: '8901234567931' },
                { size: 'یک‌سایز', length: 160, color: 'مشکی', stock: 0, barcode: '8901234567932' }
            ],
            oldPrice: 6500000, discount: 10, costPrice: 2700000, lowStockThreshold: 5,
            images: [IMG.chadorItem],
            description: 'چادر نیلوفر با ساتن مشکی سبک، گزینه‌ای اقتصادی و باکیفیت برای استفاده روزمره.',
            features: ['ساتن سبک و خنک', 'قیمت اقتصادی', 'مناسب چهارفصل'],
            care: ['شست‌وشوی ملایم', 'اتو با حرارت کم'],
            status: 'published', featuredHome: false, views: 430, rating: 4.4, salesCount: 22,
            seo: { title: 'چادر نیلوفر | هستی', description: 'چادر ساتن اقتصادی' },
            createdAt: '1403-02-14', updatedAt: '1403-06-02'
        },
        {
            id: 'abaya-janan', code: 'HJ-ABA-001', barcode: '8901234568000',
            name: 'عبای جانان', category: 'abaya', collections: ['sets', 'arbaeen'],
            fabric: 'کرپ حریر', sizes: ['S', 'M', 'L', 'XL'], lengths: [130, 135, 140, 145],
            colors: [{ name: 'مشکی', hex: '#111111', images: [IMG.abaya1, IMG.abaya1b] }],
            variants: [
                { size: 'S', length: 130, color: 'مشکی', stock: 5, barcode: '8901234568001' },
                { size: 'M', length: 135, color: 'مشکی', stock: 12, barcode: '8901234568002' },
                { size: 'L', length: 140, color: 'مشکی', stock: 9, barcode: '8901234568003' },
                { size: 'XL', length: 145, color: 'مشکی', stock: 4, barcode: '8901234568004' }
            ],
            oldPrice: 15000000, discount: 26, costPrice: 6300000, lowStockThreshold: 4,
            images: [IMG.abaya1, IMG.abaya1b],
            description: 'عبای جانان با پارچه کرپ حریر سبک و افتاده، دوخت دست‌ساز و طراحی ساده و شیک، انتخابی مناسب برای مراسم‌های رسمی و روزمره است.',
            features: ['دوخت کاملاً دست‌ساز', 'پارچه ضد چروک و سبک', 'رنگ ثابت پس از شست‌وشو', 'آستین راحت و بلند استاندارد'],
            care: ['شست‌وشو با دست و آب سرد', 'عدم استفاده از سفیدکننده', 'اتو با حرارت ملایم روی پارچه', 'خشک کردن به‌صورت آویزان در سایه'],
            status: 'published', featuredHome: true, views: 2450, rating: 4.9, salesCount: 92,
            seo: { title: 'عبای جانان | هستی', description: 'عبای کرپ حریر با دوخت دست‌ساز' },
            createdAt: '1403-01-20', updatedAt: '1403-06-28'
        },
        {
            id: 'abaya-aurora', code: 'HJ-ABA-002', barcode: '8901234568010',
            name: 'عبای آرورا', category: 'abaya', collections: ['sets', 'eco'],
            fabric: 'کرپ کریستال', sizes: ['S', 'M', 'L', 'XL'], lengths: [130, 135, 140, 145],
            colors: [{ name: 'مشکی', hex: '#111111', images: [IMG.abaya2, IMG.abaya2b] }, { name: 'سرمه‌ای', hex: '#22333b', images: [IMG.abaya2b] }],
            variants: [
                { size: 'S', length: 130, color: 'مشکی', stock: 7, barcode: '8901234568011' },
                { size: 'M', length: 135, color: 'مشکی', stock: 15, barcode: '8901234568012' },
                { size: 'L', length: 140, color: 'سرمه‌ای', stock: 6, barcode: '8901234568013' },
                { size: 'XL', length: 145, color: 'سرمه‌ای', stock: 2, barcode: '8901234568014' }
            ],
            oldPrice: 12500000, discount: 30, costPrice: 5200000, lowStockThreshold: 4,
            images: [IMG.abaya2, IMG.abaya2b],
            description: 'عبای آرورا با ترکیب رنگی خاص و طراحی مدرن، حس ظرافت و اعتمادبه‌نفس را در کنار رعایت کامل حجاب به شما هدیه می‌دهد.',
            features: ['طراحی مدرن و خاص', 'پارچه سبک و خنک', 'مناسب چهارفصل', 'دوخت مقاوم و بادوام'],
            care: ['شست‌وشوی ملایم با دست', 'پرهیز از حرارت زیاد در اتو', 'خشک‌شویی توصیه می‌شود', 'دور از نور مستقیم آفتاب خشک شود'],
            status: 'published', featuredHome: true, views: 1890, rating: 4.7, salesCount: 68,
            seo: { title: 'عبای آرورا | هستی', description: 'عبای کرپ کریستال با طراحی مدرن' },
            createdAt: '1403-02-05', updatedAt: '1403-06-18'
        },
        {
            id: 'abaya-parnian', code: 'HJ-ABA-003', barcode: '8901234568020',
            name: 'عبای پرنیان', category: 'abaya', collections: ['luxe'],
            fabric: 'ژرسه سنگین', sizes: ['M', 'L', 'XL'], lengths: [135, 140, 145],
            colors: [{ name: 'مشکی', hex: '#111111', images: [IMG.abbaItem] }],
            variants: [
                { size: 'M', length: 135, color: 'مشکی', stock: 3, barcode: '8901234568021' },
                { size: 'L', length: 140, color: 'مشکی', stock: 5, barcode: '8901234568022' },
                { size: 'XL', length: 145, color: 'مشکی', stock: 0, barcode: '8901234568023' }
            ],
            oldPrice: 13800000, discount: 0, costPrice: 5900000, lowStockThreshold: 3,
            images: [IMG.abbaItem, IMG.abaya1],
            description: 'عبای پرنیان با ژرسه سنگین و آستین گیپوردوزی، ویژه مجالس رسمی.',
            features: ['گیپوردوزی دست‌ساز روی آستین', 'ژرسه سنگین درجه یک', 'دوخت اختصاصی هستی'],
            care: ['فقط خشک‌شویی', 'نگهداری روی چوب‌لباسی پهن'],
            status: 'published', featuredHome: false, views: 760, rating: 5.0, salesCount: 18,
            seo: { title: 'عبای پرنیان | هستی', description: 'عبای مجلسی با گیپوردوزی دست‌ساز' },
            createdAt: '1403-04-22', updatedAt: '1403-06-10'
        },
        {
            id: 'shall-noor', code: 'HJ-SHL-001', barcode: '8901234568100',
            name: 'شال نور', category: 'shall', collections: ['sets', 'eco'],
            fabric: 'نسیم مشکی', sizes: ['یک‌سایز'], lengths: [],
            colors: [{ name: 'مشکی', hex: '#111111', images: [IMG.shall] }, { name: 'کرم', hex: '#eae0d5', images: [IMG.shall] }, { name: 'بژ طلایی', hex: '#c6ac8f', images: [IMG.shall] }],
            variants: [
                { size: 'یک‌سایز', length: null, color: 'مشکی', stock: 24, barcode: '8901234568101' },
                { size: 'یک‌سایز', length: null, color: 'کرم', stock: 18, barcode: '8901234568102' },
                { size: 'یک‌سایز', length: null, color: 'بژ طلایی', stock: 3, barcode: '8901234568103' }
            ],
            oldPrice: 2400000, discount: 12, costPrice: 950000, lowStockThreshold: 6,
            images: [IMG.shall],
            description: 'شال نور با پارچه نسیم لطیف و لبه‌دوزی ظریف، در سه رنگ‌بندی هماهنگ با ست‌های هستی.',
            features: ['پارچه نسیم لطیف', 'لبه‌دوزی ماشینی ظریف', 'سه رنگ‌بندی هماهنگ'],
            care: ['شست‌وشوی دستی', 'اتو با حرارت کم'],
            status: 'published', featuredHome: true, views: 1320, rating: 4.6, salesCount: 145,
            seo: { title: 'شال نور | هستی', description: 'شال نسیم با لبه‌دوزی ظریف' },
            createdAt: '1403-03-02', updatedAt: '1403-06-22'
        },
        {
            id: 'rousari-hasti', code: 'HJ-SHL-002', barcode: '8901234568110',
            name: 'روسری نخی هستی', category: 'shall', collections: ['eco'],
            fabric: 'کرپ اسپاندکس', sizes: ['یک‌سایز'], lengths: [],
            colors: [{ name: 'سرمه‌ای', hex: '#22333b', images: [IMG.shall] }, { name: 'قهوه‌ای', hex: '#5e503f', images: [IMG.shall] }],
            variants: [
                { size: 'یک‌سایز', length: null, color: 'سرمه‌ای', stock: 31, barcode: '8901234568111' },
                { size: 'یک‌سایز', length: null, color: 'قهوه‌ای', stock: 27, barcode: '8901234568112' }
            ],
            oldPrice: 1650000, discount: 0, costPrice: 620000, lowStockThreshold: 8,
            images: [IMG.shall],
            description: 'روسری نخی هستی با جنس خنک و مناسب استفاده روزمره و محیط کار.',
            features: ['جنس نخی خنک', 'عدم سرخوردگی روی سر', 'مناسب چهارفصل'],
            care: ['قابل شست‌وشو با ماشین', 'اتو با حرارت متوسط'],
            status: 'published', featuredHome: false, views: 640, rating: 4.5, salesCount: 98,
            seo: { title: 'روسری نخی هستی', description: 'روسری نخی خنک و راحت' },
            createdAt: '1403-02-28', updatedAt: '1403-05-30'
        },
        {
            id: 'kiff-shabnam', code: 'HJ-KIF-001', barcode: '8901234568200',
            name: 'کیف جواهردوزی شبنم', category: 'kiff', collections: ['sets', 'luxe'],
            fabric: 'ساتن مشکی', sizes: ['یک‌سایز'], lengths: [],
            colors: [{ name: 'مشکی', hex: '#111111', images: [IMG.kiff] }, { name: 'بژ طلایی', hex: '#c6ac8f', images: [IMG.kiff] }],
            variants: [
                { size: 'یک‌سایز', length: null, color: 'مشکی', stock: 6, barcode: '8901234568201' },
                { size: 'یک‌سایز', length: null, color: 'بژ طلایی', stock: 2, barcode: '8901234568202' }
            ],
            oldPrice: 4200000, discount: 18, costPrice: 1700000, lowStockThreshold: 3,
            images: [IMG.kiff, IMG.set],
            description: 'کیف جواهردوزی شبنم با سنگ‌های دست‌چین و دوخت کاملاً دستی، مکمل ست‌های مجلسی هستی.',
            features: ['جواهردوزی کاملاً دست‌ساز', 'سنگ‌های دست‌چین', 'آستر ساتن مقاوم', 'بند قابل تنظیم'],
            care: ['تمیز کردن با پارچه نرم خشک', 'دور از رطوبت نگهداری شود'],
            status: 'published', featuredHome: true, views: 1560, rating: 4.8, salesCount: 41,
            seo: { title: 'کیف جواهردوزی شبنم | هستی', description: 'کیف مجلسی جواهردوزی دست‌ساز' },
            createdAt: '1403-04-09', updatedAt: '1403-06-15'
        },
        {
            id: 'kiff-mahtab', code: 'HJ-KIF-002', barcode: '8901234568210',
            name: 'کیف مجلسی مهتاب', category: 'kiff', collections: ['eco'],
            fabric: 'ساتن مشکی', sizes: ['یک‌سایز'], lengths: [],
            colors: [{ name: 'مشکی', hex: '#111111', images: [IMG.kiff] }],
            variants: [
                { size: 'یک‌سایز', length: null, color: 'مشکی', stock: 14, barcode: '8901234568211' }
            ],
            oldPrice: 2800000, discount: 0, costPrice: 1150000, lowStockThreshold: 4,
            images: [IMG.kiff],
            description: 'کیف مجلسی مهتاب با طراحی ساده و کاربردی، مناسب استفاده روزمره و مجالس.',
            features: ['طراحی مینیمال', 'جادار و سبک', 'زیپ فلزی مقاوم'],
            care: ['تمیز کردن با پارچه نرم'],
            status: 'draft', featuredHome: false, views: 210, rating: 0, salesCount: 0,
            seo: { title: 'کیف مجلسی مهتاب', description: 'کیف مجلسی ساده و کاربردی' },
            createdAt: '1403-06-18', updatedAt: '1403-06-26'
        },
        {
            id: 'shomiz-baran', code: 'HJ-SHM-001', barcode: '8901234568300',
            name: 'شومیز باران', category: 'shomiz', collections: ['sets'],
            fabric: 'کرپ اسپاندکس', sizes: ['S', 'M', 'L', 'XL'], lengths: [],
            colors: [{ name: 'کرم', hex: '#eae0d5', images: [IMG.shomiz, IMG.shomiz2] }, { name: 'سرمه‌ای', hex: '#22333b', images: [IMG.shumizFull] }],
            variants: [
                { size: 'S', length: null, color: 'کرم', stock: 9, barcode: '8901234568301' },
                { size: 'M', length: null, color: 'کرم', stock: 13, barcode: '8901234568302' },
                { size: 'L', length: null, color: 'سرمه‌ای', stock: 8, barcode: '8901234568303' },
                { size: 'XL', length: null, color: 'سرمه‌ای', stock: 1, barcode: '8901234568304' }
            ],
            oldPrice: 5600000, discount: 15, costPrice: 2250000, lowStockThreshold: 4,
            images: [IMG.shomiz, IMG.shomiz2],
            description: 'شومیز باران با برش آزاد و پوشیده، مناسب محیط کار و استفاده روزمره.',
            features: ['برش آزاد و پوشیده', 'پارچه کرپ اسپاندکس کشی', 'دکمه‌های مخفی', 'مناسب محیط کار'],
            care: ['شست‌وشوی ماشینی دور کم', 'اتو با حرارت متوسط'],
            status: 'published', featuredHome: true, views: 1120, rating: 4.6, salesCount: 57,
            seo: { title: 'شومیز باران | هستی', description: 'شومیز پوشیده مناسب محیط کار' },
            createdAt: '1403-03-25', updatedAt: '1403-06-21'
        },
        {
            id: 'palto-zomorod', code: 'HJ-PAL-001', barcode: '8901234568400',
            name: 'پالتو زمرد', category: 'palto', collections: ['winter'],
            fabric: 'ژرسه سنگین', sizes: ['M', 'L', 'XL'], lengths: [],
            colors: [{ name: 'قهوه‌ای', hex: '#5e503f', images: [IMG.mazon] }, { name: 'مشکی', hex: '#111111', images: [IMG.mazon] }],
            variants: [
                { size: 'M', length: null, color: 'قهوه‌ای', stock: 4, barcode: '8901234568401' },
                { size: 'L', length: null, color: 'قهوه‌ای', stock: 6, barcode: '8901234568402' },
                { size: 'XL', length: null, color: 'مشکی', stock: 3, barcode: '8901234568403' }
            ],
            oldPrice: 18500000, discount: 20, costPrice: 7800000, lowStockThreshold: 3,
            images: [IMG.mazon],
            description: 'پالتو زمرد با آستر گرم و برش بلند پوشیده، ویژه کالکشن زمستانی هستی.',
            features: ['آستر گرم کوئیلت', 'برش بلند و پوشیده', 'دکمه‌های چوبی دست‌ساز', 'جیب‌های داخلی'],
            care: ['فقط خشک‌شویی', 'نگهداری در کاور پارچه‌ای'],
            status: 'published', featuredHome: false, views: 890, rating: 4.9, salesCount: 26,
            seo: { title: 'پالتو زمرد | هستی', description: 'پالتو زمستانی بلند و پوشیده' },
            createdAt: '1403-06-05', updatedAt: '1403-06-27'
        }
    ];

    /* ================================ مشتریان ============================= */
    var CUSTOMERS = [
        { id: 'c_1029', name: 'فاطمه رضایی', phone: '09151234567', email: 'f.rezaei@example.com', city: 'مشهد', address: 'مشهد، بلوار وکیل‌آباد، خیابان هفتم، پلاک ۲۲', totalOrders: 4, totalSpent: 28500000, loyaltyPoints: 285, loyaltyTier: 'silver', wishlist: ['chador-negin-baran', 'abaya-janan'], tags: ['مشتری ویژه'], notes: 'ترجیح می‌دهد ارسال روزهای زوج انجام شود.', joinDate: '1402-11-03' },
        { id: 'c_1030', name: 'زهرا موسوی', phone: '09361112233', email: 'z.mousavi@example.com', city: 'تهران', address: 'تهران، سعادت‌آباد، بلوار دریا، کوچه ۱۴، پلاک ۹', totalOrders: 7, totalSpent: 62400000, loyaltyPoints: 624, loyaltyTier: 'gold', wishlist: ['abaya-parnian'], tags: ['مشتری ویژه', 'خریدار عمده'], notes: '', joinDate: '1402-08-19' },
        { id: 'c_1031', name: 'مریم احمدی', phone: '09121234000', email: 'maryam.a@example.com', city: 'اصفهان', address: 'اصفهان، خیابان چهارباغ بالا، کوچه گلستان، پلاک ۵', totalOrders: 2, totalSpent: 11200000, loyaltyPoints: 112, loyaltyTier: 'bronze', wishlist: [], tags: [], notes: '', joinDate: '1403-02-14' },
        { id: 'c_1032', name: 'سکینه کریمی', phone: '09155559988', email: '', city: 'مشهد', address: 'تحویل حضوری در فروشگاه', totalOrders: 5, totalSpent: 34800000, loyaltyPoints: 348, loyaltyTier: 'silver', wishlist: ['kiff-shabnam'], tags: ['خرید حضوری'], notes: 'همیشه حضوری خرید می‌کند.', joinDate: '1402-12-08' },
        { id: 'c_1033', name: 'نرگس حسینی', phone: '09193334455', email: 'narges.h@example.com', city: 'شیراز', address: 'شیراز، بلوار زند، کوچه ۸، پلاک ۳', totalOrders: 3, totalSpent: 19700000, loyaltyPoints: 197, loyaltyTier: 'bronze', wishlist: ['shall-noor'], tags: ['معوق پرداخت'], notes: 'قسط دوم سفارش HST-10251 معوق شده است.', joinDate: '1403-01-22' },
        { id: 'c_1034', name: 'اعظم صادقی', phone: '09141112200', email: 'azam.s@example.com', city: 'تبریز', address: 'تبریز، خیابان آبرسان، کوچه شهید کاظمی، پلاک ۱۱', totalOrders: 1, totalSpent: 5040000, loyaltyPoints: 50, loyaltyTier: 'bronze', wishlist: [], tags: [], notes: '', joinDate: '1403-05-30' },
        { id: 'c_1035', name: 'راضیه نوری', phone: '09157778899', email: 'razieh.n@example.com', city: 'مشهد', address: 'مشهد، بلوار جانباز، مجتمع پاژ، طبقه ۵', totalOrders: 6, totalSpent: 48900000, loyaltyPoints: 489, loyaltyTier: 'gold', wishlist: ['chador-shab-yalda', 'palto-zomorod'], tags: ['مشتری ویژه'], notes: '', joinDate: '1402-09-11' },
        { id: 'c_1036', name: 'صدیقه پورمند', phone: '09188887766', email: '', city: 'کرج', address: 'کرج، عظیمیه، میدان مهران، پلاک ۴۴', totalOrders: 2, totalSpent: 9800000, loyaltyPoints: 98, loyaltyTier: 'bronze', wishlist: [], tags: [], notes: '', joinDate: '1403-03-17' },
        { id: 'c_1037', name: 'طاهره جعفری', phone: '09305556677', email: 'tahereh.j@example.com', city: 'قم', address: 'قم، خیابان صفائیه، کوچه ۱۲، پلاک ۷', totalOrders: 4, totalSpent: 26300000, loyaltyPoints: 263, loyaltyTier: 'silver', wishlist: ['abaya-aurora'], tags: [], notes: '', joinDate: '1402-10-25' },
        { id: 'c_1038', name: 'مهدیه اکبری', phone: '09169990011', email: 'mahdieh.a@example.com', city: 'اهواز', address: 'اهواز، کیانپارس، خیابان ۱۰ شرقی، پلاک ۲', totalOrders: 1, totalSpent: 7400000, loyaltyPoints: 74, loyaltyTier: 'bronze', wishlist: [], tags: [], notes: '', joinDate: '1403-06-02' },
        { id: 'c_1039', name: 'فرشته عباسی', phone: '09153332211', email: 'fereshteh.ab@example.com', city: 'مشهد', address: 'مشهد، احمدآباد، خیابان پاستور، پلاک ۱۹', totalOrders: 8, totalSpent: 71500000, loyaltyPoints: 715, loyaltyTier: 'gold', wishlist: ['abaya-janan', 'kiff-shabnam', 'shall-noor'], tags: ['مشتری ویژه', 'خریدار عمده'], notes: 'مشتری قدیمی و وفادار. تخفیف ویژه اعمال شود.', joinDate: '1402-06-14' },
        { id: 'c_1040', name: 'حمیده شریفی', phone: '09122223344', email: '', city: 'تهران', address: 'تهران، نارمک، میدان ۷۲، پلاک ۳۱', totalOrders: 2, totalSpent: 13600000, loyaltyPoints: 136, loyaltyTier: 'bronze', wishlist: ['shomiz-baran'], tags: [], notes: '', joinDate: '1403-04-08' }
    ];

    /* ================================ سفارش‌ها ============================ */
    /* ترکیبی از پرداخت کامل، دو‌مرحله‌ای و قسطی — مطابق مدل کسب‌وکار هستی */
    var ORDERS = [
        {
            orderNumber: 'HST-10245', customerId: 'c_1029',
            items: [{ productId: 'abaya-janan', size: 'M', length: 135, color: 'مشکی', qty: 1, unitPrice: 11100000 }],
            shipping: { type: 'post', cost: 0, carrier: 'پست پیشتاز', address: 'مشهد، بلوار وکیل‌آباد، خیابان هفتم، پلاک ۲۲' },
            discountCode: null, discountAmount: 0,
            paymentPlan: {
                type: 'two_stage', totalAmount: 11100000,
                installments: [
                    { index: 1, amount: 5550000, dueDate: '1403-06-20', status: 'paid', paidAt: '1403-06-20', label: 'مرحله اول (۵۰٪)' },
                    { index: 2, amount: 5550000, dueDate: '1403-07-12', status: 'pending', paidAt: null, label: 'مرحله دوم (۵۰٪)' }
                ]
            },
            orderStatus: 'delivered', trackingCode: '1234567890123456', source: 'online',
            internalNote: 'مشتری خواسته بسته‌بندی هدیه انجام شود.',
            history: [
                { status: 'pending', at: '1403-06-20', by: 'سیستم' },
                { status: 'processing', at: '1403-06-21', by: 'مریم (مدیر سفارش‌ها)' },
                { status: 'shipped', at: '1403-06-22', by: 'مریم (مدیر سفارش‌ها)' },
                { status: 'delivered', at: '1403-06-27', by: 'سیستم' }
            ],
            createdAt: '1403-06-20'
        },
        {
            orderNumber: 'HST-10246', customerId: 'c_1030',
            items: [
                { productId: 'chador-shab-yalda', size: 'یک‌سایز', length: 170, color: 'مشکی', qty: 1, unitPrice: 7840000 },
                { productId: 'shall-noor', size: 'یک‌سایز', length: null, color: 'کرم', qty: 2, unitPrice: 2112000 }
            ],
            shipping: { type: 'post', cost: 0, carrier: 'تیپاکس', address: 'تهران، سعادت‌آباد، بلوار دریا، کوچه ۱۴، پلاک ۹' },
            discountCode: 'HASTI20', discountAmount: 1200000,
            paymentPlan: {
                type: 'full', totalAmount: 10864000,
                installments: [{ index: 1, amount: 10864000, dueDate: '1403-06-22', status: 'paid', paidAt: '1403-06-22', label: 'پرداخت کامل', method: 'درگاه بانکی' }]
            },
            orderStatus: 'delivered', trackingCode: '9876543210987654', source: 'online',
            internalNote: '',
            history: [
                { status: 'pending', at: '1403-06-22', by: 'سیستم' },
                { status: 'processing', at: '1403-06-22', by: 'مریم (مدیر سفارش‌ها)' },
                { status: 'shipped', at: '1403-06-23', by: 'مریم (مدیر سفارش‌ها)' },
                { status: 'delivered', at: '1403-06-26', by: 'سیستم' }
            ],
            createdAt: '1403-06-22'
        },
        {
            orderNumber: 'HST-10247', customerId: 'c_1039',
            items: [
                { productId: 'abaya-parnian', size: 'L', length: 140, color: 'مشکی', qty: 1, unitPrice: 13800000 },
                { productId: 'kiff-shabnam', size: 'یک‌سایز', length: null, color: 'مشکی', qty: 1, unitPrice: 3444000 }
            ],
            shipping: { type: 'post', cost: 0, carrier: 'پست پیشتاز', address: 'مشهد، احمدآباد، خیابان پاستور، پلاک ۱۹' },
            discountCode: null, discountAmount: 0,
            paymentPlan: {
                type: 'installment', totalAmount: 17244000, downPayment: 5173200,
                installments: [
                    { index: 0, amount: 5173200, dueDate: '1403-06-24', status: 'paid', paidAt: '1403-06-24', label: 'پیش‌پرداخت (۳۰٪)' },
                    { index: 1, amount: 4023600, dueDate: '1403-07-24', status: 'paid', paidAt: '1403-07-22', label: 'قسط اول' },
                    { index: 2, amount: 4023600, dueDate: '1403-08-24', status: 'pending', paidAt: null, label: 'قسط دوم' },
                    { index: 3, amount: 4023600, dueDate: '1403-09-24', status: 'pending', paidAt: null, label: 'قسط سوم' }
                ]
            },
            orderStatus: 'delivered', trackingCode: '5556667778889990', source: 'online',
            internalNote: 'زمان‌بندی اقساط از طریق واتساپ با مشتری هماهنگ شد.',
            history: [
                { status: 'pending', at: '1403-06-24', by: 'سیستم' },
                { status: 'processing', at: '1403-06-25', by: 'زهرا (مدیر کل)' },
                { status: 'shipped', at: '1403-06-26', by: 'مریم (مدیر سفارش‌ها)' },
                { status: 'delivered', at: '1403-06-30', by: 'سیستم' }
            ],
            createdAt: '1403-06-24'
        },
        {
            orderNumber: 'HST-10248', customerId: 'c_1032',
            items: [{ productId: 'chador-malake-mashhad', size: 'یک‌سایز', length: 160, color: 'مشکی', qty: 1, unitPrice: 7225000 }],
            shipping: { type: 'pickup', cost: 0, carrier: null, address: 'تحویل حضوری — فروشگاه مشهد' },
            discountCode: null, discountAmount: 0,
            paymentPlan: {
                type: 'full', totalAmount: 7225000,
                installments: [{ index: 1, amount: 7225000, dueDate: '1403-06-25', status: 'paid', paidAt: '1403-06-25', label: 'پرداخت کامل', method: 'کارت‌خوان فروشگاه' }]
            },
            orderStatus: 'delivered', trackingCode: null, source: 'in_store',
            internalNote: 'خرید حضوری در فروشگاه.',
            history: [
                { status: 'pending', at: '1403-06-25', by: 'سیستم' },
                { status: 'delivered', at: '1403-06-25', by: 'سکینه (پشتیبانی)' }
            ],
            createdAt: '1403-06-25'
        },
        {
            orderNumber: 'HST-10249', customerId: 'c_1035',
            items: [{ productId: 'palto-zomorod', size: 'L', length: null, color: 'قهوه‌ای', qty: 1, unitPrice: 14800000 }],
            shipping: { type: 'post', cost: 0, carrier: 'پست پیشتاز', address: 'مشهد، بلوار جانباز، مجتمع پاژ، طبقه ۵' },
            discountCode: null, discountAmount: 0,
            paymentPlan: {
                type: 'two_stage', totalAmount: 14800000,
                installments: [
                    { index: 1, amount: 7400000, dueDate: '1403-06-28', status: 'paid', paidAt: '1403-06-28', label: 'مرحله اول (۵۰٪)' },
                    { index: 2, amount: 7400000, dueDate: '1403-07-18', status: 'pending', paidAt: null, label: 'مرحله دوم (۵۰٪)' }
                ]
            },
            orderStatus: 'shipped', trackingCode: '4443332221110009', source: 'online',
            internalNote: '',
            history: [
                { status: 'pending', at: '1403-06-28', by: 'سیستم' },
                { status: 'processing', at: '1403-06-29', by: 'مریم (مدیر سفارش‌ها)' },
                { status: 'shipped', at: '1403-06-30', by: 'مریم (مدیر سفارش‌ها)' }
            ],
            createdAt: '1403-06-28'
        },
        {
            orderNumber: 'HST-10250', customerId: 'c_1031',
            items: [{ productId: 'abaya-aurora', size: 'M', length: 135, color: 'مشکی', qty: 1, unitPrice: 8750000 }],
            shipping: { type: 'post', cost: 450000, carrier: 'پست پیشتاز', address: 'اصفهان، خیابان چهارباغ بالا، کوچه گلستان، پلاک ۵' },
            discountCode: null, discountAmount: 0,
            paymentPlan: {
                type: 'full', totalAmount: 9200000,
                installments: [{ index: 1, amount: 9200000, dueDate: '1403-07-01', status: 'pending', paidAt: null, label: 'پرداخت کامل', method: 'درگاه بانکی' }]
            },
            orderStatus: 'pending', trackingCode: null, source: 'online',
            internalNote: '',
            history: [{ status: 'pending', at: '1403-07-01', by: 'سیستم' }],
            createdAt: '1403-07-01'
        },
        {
            orderNumber: 'HST-10251', customerId: 'c_1033',
            items: [
                { productId: 'chador-golbarg-anari', size: 'یک‌سایز', length: 165, color: 'مشکی', qty: 1, unitPrice: 7840000 },
                { productId: 'shall-noor', size: 'یک‌سایز', length: null, color: 'مشکی', qty: 1, unitPrice: 2112000 }
            ],
            shipping: { type: 'post', cost: 450000, carrier: 'تیپاکس', address: 'شیراز، بلوار زند، کوچه ۸، پلاک ۳' },
            discountCode: null, discountAmount: 0,
            paymentPlan: {
                type: 'installment', totalAmount: 10402000, downPayment: 3120600,
                installments: [
                    { index: 0, amount: 3120600, dueDate: '1403-05-15', status: 'paid', paidAt: '1403-05-15', label: 'پیش‌پرداخت (۳۰٪)' },
                    { index: 1, amount: 3640700, dueDate: '1403-06-15', status: 'paid', paidAt: '1403-06-14', label: 'قسط اول' },
                    { index: 2, amount: 3640700, dueDate: '1403-06-25', status: 'overdue', paidAt: null, label: 'قسط دوم' }
                ]
            },
            orderStatus: 'delivered', trackingCode: '7778889990001112', source: 'online',
            internalNote: 'قسط دوم معوق است — دو بار یادآوری واتساپی ارسال شده.',
            history: [
                { status: 'pending', at: '1403-05-15', by: 'سیستم' },
                { status: 'processing', at: '1403-05-16', by: 'مریم (مدیر سفارش‌ها)' },
                { status: 'shipped', at: '1403-05-17', by: 'مریم (مدیر سفارش‌ها)' },
                { status: 'delivered', at: '1403-05-22', by: 'سیستم' }
            ],
            createdAt: '1403-05-15'
        },
        {
            orderNumber: 'HST-10252', customerId: 'c_1037',
            items: [{ productId: 'shomiz-baran', size: 'L', length: null, color: 'سرمه‌ای', qty: 2, unitPrice: 4760000 }],
            shipping: { type: 'post', cost: 450000, carrier: 'پست پیشتاز', address: 'قم، خیابان صفائیه، کوچه ۱۲، پلاک ۷' },
            discountCode: 'WELCOME10', discountAmount: 952000,
            paymentPlan: {
                type: 'full', totalAmount: 9018000,
                installments: [{ index: 1, amount: 9018000, dueDate: '1403-07-02', status: 'paid', paidAt: '1403-07-02', label: 'پرداخت کامل', method: 'درگاه بانکی' }]
            },
            orderStatus: 'processing', trackingCode: null, source: 'online',
            internalNote: '',
            history: [
                { status: 'pending', at: '1403-07-02', by: 'سیستم' },
                { status: 'processing', at: '1403-07-03', by: 'مریم (مدیر سفارش‌ها)' }
            ],
            createdAt: '1403-07-02'
        },
        {
            orderNumber: 'HST-10253', customerId: 'c_1034',
            items: [{ productId: 'rousari-hasti', size: 'یک‌سایز', length: null, color: 'سرمه‌ای', qty: 2, unitPrice: 1650000 }],
            shipping: { type: 'post', cost: 450000, carrier: 'پست پیشتاز', address: 'تبریز، خیابان آبرسان، کوچه شهید کاظمی، پلاک ۱۱' },
            discountCode: null, discountAmount: 0,
            paymentPlan: {
                type: 'full', totalAmount: 3750000,
                installments: [{ index: 1, amount: 3750000, dueDate: '1403-07-03', status: 'paid', paidAt: '1403-07-03', label: 'پرداخت کامل', method: 'درگاه بانکی' }]
            },
            orderStatus: 'shipped', trackingCode: '3332221110009998', source: 'online',
            internalNote: '',
            history: [
                { status: 'pending', at: '1403-07-03', by: 'سیستم' },
                { status: 'processing', at: '1403-07-03', by: 'مریم (مدیر سفارش‌ها)' },
                { status: 'shipped', at: '1403-07-04', by: 'مریم (مدیر سفارش‌ها)' }
            ],
            createdAt: '1403-07-03'
        },
        {
            orderNumber: 'HST-10254', customerId: 'c_1039',
            items: [
                { productId: 'chador-shab-yalda', size: 'یک‌سایز', length: 165, color: 'مشکی', qty: 1, unitPrice: 7840000 },
                { productId: 'abaya-janan', size: 'L', length: 140, color: 'مشکی', qty: 1, unitPrice: 11100000 }
            ],
            shipping: { type: 'post', cost: 0, carrier: 'پست پیشتاز', address: 'مشهد، احمدآباد، خیابان پاستور، پلاک ۱۹' },
            discountCode: null, discountAmount: 0,
            paymentPlan: {
                type: 'two_stage', totalAmount: 18940000,
                installments: [
                    { index: 1, amount: 9470000, dueDate: '1403-07-05', status: 'paid', paidAt: '1403-07-05', label: 'مرحله اول (۵۰٪)' },
                    { index: 2, amount: 9470000, dueDate: '1403-07-25', status: 'pending', paidAt: null, label: 'مرحله دوم (۵۰٪)' }
                ]
            },
            orderStatus: 'processing', trackingCode: null, source: 'online',
            internalNote: 'مشتری وفادار — اولویت آماده‌سازی.',
            history: [
                { status: 'pending', at: '1403-07-05', by: 'سیستم' },
                { status: 'processing', at: '1403-07-06', by: 'زهرا (مدیر کل)' }
            ],
            createdAt: '1403-07-05'
        },
        {
            orderNumber: 'HST-10255', customerId: 'c_1036',
            items: [{ productId: 'kiff-shabnam', size: 'یک‌سایز', length: null, color: 'بژ طلایی', qty: 1, unitPrice: 3444000 }],
            shipping: { type: 'post', cost: 450000, carrier: 'پست پیشتاز', address: 'کرج، عظیمیه، میدان مهران، پلاک ۴۴' },
            discountCode: null, discountAmount: 0,
            paymentPlan: {
                type: 'full', totalAmount: 3894000,
                installments: [{ index: 1, amount: 3894000, dueDate: '1403-07-06', status: 'pending', paidAt: null, label: 'پرداخت کامل', method: 'درگاه بانکی' }]
            },
            orderStatus: 'pending', trackingCode: null, source: 'online',
            internalNote: '',
            history: [{ status: 'pending', at: '1403-07-06', by: 'سیستم' }],
            createdAt: '1403-07-06'
        },
        {
            orderNumber: 'HST-10256', customerId: 'c_1040',
            items: [{ productId: 'shomiz-baran', size: 'M', length: null, color: 'کرم', qty: 1, unitPrice: 4760000 }],
            shipping: { type: 'post', cost: 450000, carrier: 'تیپاکس', address: 'تهران، نارمک، میدان ۷۲، پلاک ۳۱' },
            discountCode: null, discountAmount: 0,
            paymentPlan: {
                type: 'full', totalAmount: 5210000,
                installments: [{ index: 1, amount: 5210000, dueDate: '1403-07-07', status: 'paid', paidAt: '1403-07-07', label: 'پرداخت کامل', method: 'درگاه بانکی' }]
            },
            orderStatus: 'cancelled', trackingCode: null, source: 'online',
            internalNote: 'مشتری درخواست لغو داد — مبلغ بازگردانده شد.',
            history: [
                { status: 'pending', at: '1403-07-07', by: 'سیستم' },
                { status: 'cancelled', at: '1403-07-08', by: 'سکینه (پشتیبانی)' }
            ],
            createdAt: '1403-07-07'
        },
        {
            orderNumber: 'HST-10257', customerId: 'c_1030',
            items: [{ productId: 'palto-zomorod', size: 'XL', length: null, color: 'مشکی', qty: 1, unitPrice: 14800000 }],
            shipping: { type: 'post', cost: 0, carrier: 'پست پیشتاز', address: 'تهران، سعادت‌آباد، بلوار دریا، کوچه ۱۴، پلاک ۹' },
            discountCode: null, discountAmount: 0,
            paymentPlan: {
                type: 'installment', totalAmount: 14800000, downPayment: 4440000,
                installments: [
                    { index: 0, amount: 4440000, dueDate: '1403-07-08', status: 'paid', paidAt: '1403-07-08', label: 'پیش‌پرداخت (۳۰٪)' },
                    { index: 1, amount: 5180000, dueDate: '1403-08-08', status: 'pending', paidAt: null, label: 'قسط اول' },
                    { index: 2, amount: 5180000, dueDate: '1403-09-08', status: 'pending', paidAt: null, label: 'قسط دوم' }
                ]
            },
            orderStatus: 'processing', trackingCode: null, source: 'online',
            internalNote: '',
            history: [
                { status: 'pending', at: '1403-07-08', by: 'سیستم' },
                { status: 'processing', at: '1403-07-09', by: 'مریم (مدیر سفارش‌ها)' }
            ],
            createdAt: '1403-07-08'
        },
        {
            orderNumber: 'HST-10258', customerId: 'c_1032',
            items: [{ productId: 'shall-noor', size: 'یک‌سایز', length: null, color: 'بژ طلایی', qty: 3, unitPrice: 2112000 }],
            shipping: { type: 'pickup', cost: 0, carrier: null, address: 'تحویل حضوری — فروشگاه مشهد' },
            discountCode: null, discountAmount: 0,
            paymentPlan: {
                type: 'full', totalAmount: 6336000,
                installments: [{ index: 1, amount: 6336000, dueDate: '1403-07-09', status: 'paid', paidAt: '1403-07-09', label: 'پرداخت کامل', method: 'کارت‌خوان فروشگاه' }]
            },
            orderStatus: 'delivered', trackingCode: null, source: 'in_store',
            internalNote: '',
            history: [
                { status: 'pending', at: '1403-07-09', by: 'سیستم' },
                { status: 'delivered', at: '1403-07-09', by: 'سکینه (پشتیبانی)' }
            ],
            createdAt: '1403-07-09'
        },
        {
            orderNumber: 'HST-10259', customerId: 'c_1038',
            items: [{ productId: 'chador-golbarg-anari', size: 'یک‌سایز', length: 160, color: 'مشکی', qty: 1, unitPrice: 7840000 }],
            shipping: { type: 'post', cost: 450000, carrier: 'پست پیشتاز', address: 'اهواز، کیانپارس، خیابان ۱۰ شرقی، پلاک ۲' },
            discountCode: null, discountAmount: 0,
            paymentPlan: {
                type: 'full', totalAmount: 8290000,
                installments: [{ index: 1, amount: 8290000, dueDate: '1403-07-10', status: 'paid', paidAt: '1403-07-10', label: 'پرداخت کامل', method: 'درگاه بانکی' }]
            },
            orderStatus: 'returned', trackingCode: '1112223334445556', source: 'online',
            internalNote: 'مرجوعی به دلیل عدم تناسب قد — کالا سالم به انبار برگشت.',
            history: [
                { status: 'pending', at: '1403-07-10', by: 'سیستم' },
                { status: 'processing', at: '1403-07-10', by: 'مریم (مدیر سفارش‌ها)' },
                { status: 'shipped', at: '1403-07-11', by: 'مریم (مدیر سفارش‌ها)' },
                { status: 'delivered', at: '1403-07-15', by: 'سیستم' },
                { status: 'returned', at: '1403-07-19', by: 'سکینه (پشتیبانی)' }
            ],
            createdAt: '1403-07-10'
        },
        {
            orderNumber: 'HST-10260', customerId: 'c_1035',
            items: [
                { productId: 'abaya-aurora', size: 'L', length: 140, color: 'سرمه‌ای', qty: 1, unitPrice: 8750000 },
                { productId: 'kiff-mahtab', size: 'یک‌سایز', length: null, color: 'مشکی', qty: 1, unitPrice: 2800000 }
            ],
            shipping: { type: 'post', cost: 450000, carrier: 'پست پیشتاز', address: 'مشهد، بلوار جانباز، مجتمع پاژ، طبقه ۵' },
            discountCode: null, discountAmount: 0,
            paymentPlan: {
                type: 'full', totalAmount: 12000000,
                installments: [{ index: 1, amount: 12000000, dueDate: '1403-07-11', status: 'pending', paidAt: null, label: 'پرداخت کامل', method: 'درگاه بانکی' }]
            },
            orderStatus: 'pending', trackingCode: null, source: 'online',
            internalNote: '',
            history: [{ status: 'pending', at: '1403-07-11', by: 'سیستم' }],
            createdAt: '1403-07-11'
        },
        {
            orderNumber: 'HST-10261', customerId: 'c_1029',
            items: [{ productId: 'chador-malake-mashhad', size: 'یک‌سایز', length: 155, color: 'مشکی', qty: 1, unitPrice: 7225000 }],
            shipping: { type: 'post', cost: 450000, carrier: 'پست پیشتاز', address: 'مشهد، بلوار وکیل‌آباد، خیابان هفتم، پلاک ۲۲' },
            discountCode: null, discountAmount: 0,
            paymentPlan: {
                type: 'full', totalAmount: 7675000,
                installments: [{ index: 1, amount: 7675000, dueDate: '1403-07-12', status: 'paid', paidAt: '1403-07-12', label: 'پرداخت کامل', method: 'درگاه بانکی' }]
            },
            orderStatus: 'processing', trackingCode: null, source: 'online',
            internalNote: '',
            history: [
                { status: 'pending', at: '1403-07-12', by: 'سیستم' },
                { status: 'processing', at: '1403-07-12', by: 'مریم (مدیر سفارش‌ها)' }
            ],
            createdAt: '1403-07-12'
        },
        {
            orderNumber: 'HST-10262', customerId: 'c_1037',
            items: [{ productId: 'abaya-parnian', size: 'M', length: 135, color: 'مشکی', qty: 1, unitPrice: 13800000 }],
            shipping: { type: 'post', cost: 0, carrier: 'پست پیشتاز', address: 'قم، خیابان صفائیه، کوچه ۱۲، پلاک ۷' },
            discountCode: null, discountAmount: 0,
            paymentPlan: {
                type: 'two_stage', totalAmount: 13800000,
                installments: [
                    { index: 1, amount: 6900000, dueDate: '1403-07-13', status: 'paid', paidAt: '1403-07-13', label: 'مرحله اول (۵۰٪)' },
                    { index: 2, amount: 6900000, dueDate: '1403-07-16', status: 'pending', paidAt: null, label: 'مرحله دوم (۵۰٪)' }
                ]
            },
            orderStatus: 'delivered', trackingCode: '6665554443332221', source: 'online',
            internalNote: 'سررسید مرحله دوم نزدیک است.',
            history: [
                { status: 'pending', at: '1403-07-13', by: 'سیستم' },
                { status: 'processing', at: '1403-07-13', by: 'مریم (مدیر سفارش‌ها)' },
                { status: 'shipped', at: '1403-07-14', by: 'مریم (مدیر سفارش‌ها)' },
                { status: 'delivered', at: '1403-07-16', by: 'سیستم' }
            ],
            createdAt: '1403-07-13'
        }
    ];

    /* =========================== تراکنش‌های انبار ========================== */
    var INVENTORY_MOVES = [
        { id: 'inv_001', productId: 'abaya-janan', variant: 'M / ۱۳۵ / مشکی', type: 'in', qty: 20, reason: 'ورود از تولید داخلی', invoiceNo: 'PUR-1403-041', date: '1403-06-15', by: 'زهرا (مدیر کل)' },
        { id: 'inv_002', productId: 'abaya-janan', variant: 'M / ۱۳۵ / مشکی', type: 'out', qty: 8, reason: 'فروش آنلاین', invoiceNo: null, date: '1403-06-20', by: 'سیستم' },
        { id: 'inv_003', productId: 'chador-malake-mashhad', variant: 'یک‌سایز / ۱۶۰ / مشکی', type: 'in', qty: 25, reason: 'ورود از تامین‌کننده', invoiceNo: 'PUR-1403-042', date: '1403-06-18', by: 'زهرا (مدیر کل)' },
        { id: 'inv_004', productId: 'chador-malake-mashhad', variant: 'یک‌سایز / ۱۶۰ / مشکی', type: 'out', qty: 11, reason: 'فروش آنلاین', invoiceNo: null, date: '1403-06-25', by: 'سیستم' },
        { id: 'inv_005', productId: 'chador-niloofar', variant: 'یک‌سایز / ۱۶۰ / مشکی', type: 'out', qty: 5, reason: 'فروش حضوری', invoiceNo: null, date: '1403-06-26', by: 'سکینه (پشتیبانی)' },
        { id: 'inv_006', productId: 'shall-noor', variant: 'یک‌سایز / — / کرم', type: 'in', qty: 40, reason: 'ورود از تولید داخلی', invoiceNo: 'PUR-1403-043', date: '1403-06-20', by: 'زهرا (مدیر کل)' },
        { id: 'inv_007', productId: 'shall-noor', variant: 'یک‌سایز / — / بژ طلایی', type: 'out', qty: 3, reason: 'نمونه فروشگاهی', invoiceNo: null, date: '1403-06-28', by: 'سکینه (پشتیبانی)' },
        { id: 'inv_008', productId: 'kiff-shabnam', variant: 'یک‌سایز / — / مشکی', type: 'in', qty: 12, reason: 'ورود از تولید داخلی', invoiceNo: 'PUR-1403-044', date: '1403-06-22', by: 'زهرا (مدیر کل)' },
        { id: 'inv_009', productId: 'palto-zomorod', variant: 'L / — / قهوه‌ای', type: 'in', qty: 10, reason: 'ورود از تامین‌کننده', invoiceNo: 'PUR-1403-045', date: '1403-07-01', by: 'زهرا (مدیر کل)' },
        { id: 'inv_010', productId: 'chador-negin-baran', variant: 'یک‌سایز / ۱۶۰ / مشکی', type: 'out', qty: 6, reason: 'فروش آنلاین', invoiceNo: null, date: '1403-07-02', by: 'سیستم' },
        { id: 'inv_011', productId: 'shomiz-baran', variant: 'XL / — / سرمه‌ای', type: 'out', qty: 4, reason: 'آسیب‌دیدگی در انبار', invoiceNo: null, date: '1403-07-04', by: 'زهرا (مدیر کل)' },
        { id: 'inv_012', productId: 'abaya-aurora', variant: 'M / ۱۳۵ / مشکی', type: 'in', qty: 18, reason: 'ورود از تولید داخلی', invoiceNo: 'PUR-1403-046', date: '1403-07-05', by: 'زهرا (مدیر کل)' },
        { id: 'inv_013', productId: 'chador-golbarg-anari', variant: 'یک‌سایز / ۱۶۰ / مشکی', type: 'in', qty: 1, reason: 'مرجوعی سفارش HST-10259', invoiceNo: null, date: '1403-07-19', by: 'سکینه (پشتیبانی)' },
        { id: 'inv_014', productId: 'rousari-hasti', variant: 'یک‌سایز / — / سرمه‌ای', type: 'in', qty: 35, reason: 'ورود از تامین‌کننده', invoiceNo: 'PUR-1403-047', date: '1403-07-06', by: 'زهرا (مدیر کل)' }
    ];

    /* ============================== کد تخفیف ============================== */
    var DISCOUNTS = [
        { id: 'd_01', code: 'HASTI20', type: 'percent', value: 20, minOrder: 5000000, maxUses: 100, usedCount: 43, perCustomer: 1, appliesTo: 'all', targetIds: [], startDate: '1403-06-01', endDate: '1403-07-30', status: 'active', totalDiscountGiven: 52400000 },
        { id: 'd_02', code: 'WELCOME10', type: 'percent', value: 10, minOrder: 2000000, maxUses: 500, usedCount: 187, perCustomer: 1, appliesTo: 'all', targetIds: [], startDate: '1403-01-01', endDate: '1404-12-29', status: 'active', totalDiscountGiven: 96300000 },
        { id: 'd_03', code: 'ARBAEEN30', type: 'percent', value: 30, minOrder: 8000000, maxUses: 60, usedCount: 60, perCustomer: 1, appliesTo: 'collection', targetIds: ['arbaeen'], startDate: '1403-05-01', endDate: '1403-06-15', status: 'expired', totalDiscountGiven: 141000000 },
        { id: 'd_04', code: 'CHADOR500', type: 'fixed', value: 500000, minOrder: 6000000, maxUses: 200, usedCount: 78, perCustomer: 2, appliesTo: 'category', targetIds: ['chador'], startDate: '1403-06-10', endDate: '1403-08-10', status: 'active', totalDiscountGiven: 39000000 },
        { id: 'd_05', code: 'WINTER25', type: 'percent', value: 25, minOrder: 10000000, maxUses: 80, usedCount: 0, perCustomer: 1, appliesTo: 'collection', targetIds: ['winter'], startDate: '1403-09-01', endDate: '1403-11-30', status: 'scheduled', totalDiscountGiven: 0 },
        { id: 'd_06', code: 'VIPGOLD', type: 'percent', value: 15, minOrder: 3000000, maxUses: 50, usedCount: 12, perCustomer: 3, appliesTo: 'all', targetIds: [], startDate: '1403-04-01', endDate: '1403-12-29', status: 'inactive', totalDiscountGiven: 18900000 }
    ];

    /* ============================ کمپین مناسبتی ========================== */
    var CAMPAIGNS = [
        { id: 'camp_01', name: 'تخفیف کالکشن اربعین', collectionId: 'arbaeen', discount: 20, startDate: '1403-05-01', endDate: '1403-06-15', status: 'expired', revenue: 284000000 },
        { id: 'camp_02', name: 'جشنواره پایان تابستان', collectionId: 'eco', discount: 15, startDate: '1403-06-15', endDate: '1403-07-15', status: 'active', revenue: 96500000 },
        { id: 'camp_03', name: 'کمپین زمستانه', collectionId: 'winter', discount: 25, startDate: '1403-09-01', endDate: '1403-11-30', status: 'scheduled', revenue: 0 }
    ];

    /* ============================== دسته مقالات ========================== */
    var BLOG_CATEGORIES = [
        { id: 'bc_01', name: 'راهنمای خرید', slug: 'buying-guide', postCount: 3 },
        { id: 'bc_02', name: 'نگهداری و شست‌وشو', slug: 'care', postCount: 2 },
        { id: 'bc_03', name: 'سبک و ست کردن', slug: 'styling', postCount: 1 },
        { id: 'bc_04', name: 'اخبار هستی', slug: 'news', postCount: 0 }
    ];

    /* ================================ مقالات ============================== */
    var BLOG_POSTS = [
        { id: 'bp_01', title: 'راهنمای انتخاب قد مناسب چادر', slug: 'chador-length-guide', categoryId: 'bc_01', cover: IMG.chador, author: 'زهرا احمدی', publishDate: '1403-06-10', status: 'published', views: 2340, tags: ['چادر', 'راهنمای خرید', 'قد'], excerpt: 'انتخاب قد مناسب چادر یکی از مهم‌ترین عوامل راحتی و زیبایی پوشش است. در این مقاله روش اندازه‌گیری دقیق را می‌آموزید.', content: '<p>برای انتخاب قد مناسب چادر، ابتدا باید فاصله از بالای سر تا نقطه‌ای که می‌خواهید چادر به آن برسد را اندازه بگیرید.</p><ul><li>قد ۱۵۵: مناسب افراد تا ۱۶۰ سانتی‌متر</li><li>قد ۱۶۰: مناسب افراد ۱۶۰ تا ۱۶۵ سانتی‌متر</li><li>قد ۱۶۵ و ۱۷۰: مناسب افراد بلندقد</li></ul>', seo: { title: 'راهنمای انتخاب قد چادر | هستی', description: 'چطور قد مناسب چادر را انتخاب کنیم؟', ogImage: IMG.chador, canonical: '' } },
        { id: 'bp_02', title: 'تفاوت کرپ حریر و کرپ کریستال چیست؟', slug: 'krep-harir-vs-kristal', categoryId: 'bc_01', cover: IMG.chadorItem, author: 'زهرا احمدی', publishDate: '1403-06-18', status: 'published', views: 1780, tags: ['پارچه', 'کرپ حریر', 'کرپ کریستال'], excerpt: 'دو پارچه پرطرفدار چادر را از نظر جنس، افتادگی، دوام و قیمت مقایسه می‌کنیم.', content: '<p>کرپ حریر سبک‌تر و لطیف‌تر است، در حالی که کرپ کریستال فرم‌گیری بهتری دارد و مات‌تر است.</p>', seo: { title: 'کرپ حریر یا کرپ کریستال؟', description: 'مقایسه کامل دو پارچه محبوب چادر', ogImage: IMG.chadorItem, canonical: '' } },
        { id: 'bp_03', title: 'چگونه چادر خود را سال‌ها نو نگه داریم', slug: 'chador-care-tips', categoryId: 'bc_02', cover: IMG.chador2, author: 'مریم کاظمی', publishDate: '1403-06-25', status: 'published', views: 1120, tags: ['نگهداری', 'شست‌وشو'], excerpt: 'هفت نکته کلیدی برای شست‌وشو و نگهداری صحیح چادر که عمر آن را چند برابر می‌کند.', content: '<p>هرگز از سفیدکننده استفاده نکنید و چادر را همیشه در سایه خشک کنید.</p>', seo: { title: 'نگهداری صحیح چادر', description: 'نکات شست‌وشو و نگهداری چادر', ogImage: IMG.chador2, canonical: '' } },
        { id: 'bp_04', title: 'ست کردن عبا با کیف و شال', slug: 'abaya-styling', categoryId: 'bc_03', cover: IMG.set, author: 'مریم کاظمی', publishDate: '1403-07-02', status: 'published', views: 890, tags: ['ست', 'عبا', 'استایل'], excerpt: 'سه ترکیب پیشنهادی هستی برای ست کردن عبا با کیف جواهردوزی و شال هماهنگ.', content: '<p>ست کردن رنگ کیف با حاشیه عبا، ظرافت پوشش شما را چند برابر می‌کند.</p>', seo: { title: 'ست کردن عبا | هستی', description: 'ترکیب‌های پیشنهادی ست عبا', ogImage: IMG.set, canonical: '' } },
        { id: 'bp_05', title: 'راهنمای کامل خرید قسطی از هستی', slug: 'installment-guide', categoryId: 'bc_01', cover: IMG.abaya1, author: 'زهرا احمدی', publishDate: '1403-07-08', status: 'published', views: 3210, tags: ['خرید قسطی', 'پرداخت'], excerpt: 'همه‌چیز درباره شرایط خرید قسطی و پرداخت دو‌مرحله‌ای در فروشگاه هستی.', content: '<p>خرید قسطی برای سفارش‌های بالای ۳ میلیون تومان فعال است. پیش‌پرداخت حداقل ۳۰٪ و باقی‌مانده در ۲ تا ۴ قسط ماهانه.</p>', seo: { title: 'خرید قسطی از هستی', description: 'شرایط کامل خرید قسطی و دو‌مرحله‌ای', ogImage: IMG.abaya1, canonical: '' } },
        { id: 'bp_06', title: 'پارچه‌های مناسب فصل سرد', slug: 'winter-fabrics', categoryId: 'bc_02', cover: IMG.mazon, author: 'مریم کاظمی', publishDate: '1403-09-01', status: 'scheduled', views: 0, tags: ['زمستان', 'پارچه'], excerpt: 'کدام پارچه‌ها برای زمستان مناسب‌ترند؟ راهنمای انتخاب پوشش گرم و شیک.', content: '<p>ژرسه سنگین و کرپ حریر ضخیم بهترین گزینه‌های فصل سرد هستند.</p>', seo: { title: 'پارچه‌های زمستانی', description: 'راهنمای پارچه مناسب فصل سرد', ogImage: IMG.mazon, canonical: '' } }
    ];

    /* ================================ نظرات ============================== */
    var REVIEWS = [
        { id: 'r_01', productId: 'abaya-janan', customerId: 'c_1029', author: 'فاطمه رضایی', rating: 5, text: 'کیفیت پارچه فوق‌العاده بود. دوخت بسیار تمیز و اندازه دقیقاً مطابق راهنما.', date: '1403-06-28', status: 'approved', reply: 'سپاس از انتخاب شما. خوشحالیم که راضی بودید.', replyDate: '1403-06-29', reported: false },
        { id: 'r_02', productId: 'abaya-janan', customerId: 'c_1039', author: 'فرشته عباسی', rating: 5, text: 'چندمین خریدم از هستیه و همیشه راضی بودم.', date: '1403-07-01', status: 'approved', reply: '', replyDate: null, reported: false },
        { id: 'r_03', productId: 'chador-malake-mashhad', customerId: 'c_1032', author: 'سکینه کریمی', rating: 5, text: 'حضوری خریدم و از نزدیک دیدم. فرم‌گیری چادر عالیه.', date: '1403-06-26', status: 'approved', reply: '', replyDate: null, reported: false },
        { id: 'r_04', productId: 'chador-shab-yalda', customerId: 'c_1035', author: 'راضیه نوری', rating: 4, text: 'پارچه‌اش خیلی خوبه ولی کمی سنگین‌تر از تصورم بود.', date: '1403-06-30', status: 'approved', reply: 'ممنون از بازخورد شما. این مدل عمداً برای فصل سرد ضخیم‌تر طراحی شده.', replyDate: '1403-07-01', reported: false },
        { id: 'r_05', productId: 'shall-noor', customerId: 'c_1030', author: 'زهرا موسوی', rating: 5, text: 'رنگ کرمش دقیقاً مثل عکس بود. سه رنگ دیگه هم سفارش دادم.', date: '1403-06-27', status: 'approved', reply: '', replyDate: null, reported: false },
        { id: 'r_06', productId: 'abaya-aurora', customerId: 'c_1031', author: 'مریم احمدی', rating: 4, text: 'ارسال کمی طول کشید اما محصول خوب بود.', date: '1403-07-05', status: 'pending', reply: '', replyDate: null, reported: false },
        { id: 'r_07', productId: 'kiff-shabnam', customerId: 'c_1039', author: 'فرشته عباسی', rating: 5, text: 'جواهردوزی‌اش واقعاً دست‌سازه و خیلی ظریف کار شده.', date: '1403-07-03', status: 'approved', reply: '', replyDate: null, reported: false },
        { id: 'r_08', productId: 'shomiz-baran', customerId: 'c_1037', author: 'طاهره جعفری', rating: 5, text: 'برای محیط کار عالیه. کاملاً پوشیده و راحت.', date: '1403-07-06', status: 'pending', reply: '', replyDate: null, reported: false },
        { id: 'r_09', productId: 'chador-niloofar', customerId: 'c_1036', author: 'صدیقه پورمند', rating: 3, text: 'نسبت به قیمتش خوبه ولی پارچه‌اش نازک‌تر از انتظارم بود.', date: '1403-07-04', status: 'pending', reply: '', replyDate: null, reported: false },
        { id: 'r_10', productId: 'palto-zomorod', customerId: 'c_1035', author: 'راضیه نوری', rating: 5, text: 'آسترش خیلی گرمه. برای مشهد سرد عالیه.', date: '1403-07-07', status: 'approved', reply: '', replyDate: null, reported: false },
        { id: 'r_11', productId: 'chador-golbarg-anari', customerId: 'c_1038', author: 'مهدیه اکبری', rating: 2, text: 'قدش برای من مناسب نبود و مجبور شدم مرجوع کنم.', date: '1403-07-19', status: 'approved', reply: 'متاسفیم. برای انتخاب قد می‌توانید از راهنمای سایز در صفحه محصول استفاده کنید.', replyDate: '1403-07-20', reported: false },
        { id: 'r_12', productId: 'rousari-hasti', customerId: 'c_1034', author: 'اعظم صادقی', rating: 4, text: 'جنسش خنک و راحته.', date: '1403-07-08', status: 'approved', reply: '', replyDate: null, reported: false },
        { id: 'r_13', productId: 'abaya-parnian', customerId: 'c_1037', author: 'طاهره جعفری', rating: 5, text: 'گیپوردوزی آستینش محشره. ارزش قیمتش رو داره.', date: '1403-07-17', status: 'pending', reply: '', replyDate: null, reported: false },
        { id: 'r_14', productId: 'shall-noor', customerId: null, author: 'کاربر ناشناس', rating: 1, text: 'لینک فروشگاه ارزان‌تر: example-spam-site.com', date: '1403-07-09', status: 'rejected', reply: '', replyDate: null, reported: true }
    ];

    /* ============================ تیکت پشتیبانی ========================== */
    var TICKETS = [
        { id: 't_01', subject: 'سوال درباره زمان ارسال سفارش', customerId: 'c_1031', priority: 'normal', status: 'open', assignedTo: 'سکینه (پشتیبانی)', createdAt: '1403-07-02', messages: [{ from: 'customer', text: 'سلام، سفارش من چه زمانی ارسال می‌شود؟', at: '1403-07-02' }] },
        { id: 't_02', subject: 'درخواست تغییر سایز عبا', customerId: 'c_1037', priority: 'high', status: 'in_progress', assignedTo: 'سکینه (پشتیبانی)', createdAt: '1403-07-04', messages: [{ from: 'customer', text: 'سایز L برایم بزرگ بود، امکان تغییر به M هست؟', at: '1403-07-04' }, { from: 'admin', text: 'بله، لطفاً کالا را با بسته‌بندی اصلی ارسال کنید.', at: '1403-07-04' }] },
        { id: 't_03', subject: 'هماهنگی زمان‌بندی اقساط', customerId: 'c_1030', priority: 'high', status: 'in_progress', assignedTo: 'زهرا (مدیر کل)', createdAt: '1403-07-08', messages: [{ from: 'customer', text: 'می‌خواهم قسط اول را دو هفته دیرتر پرداخت کنم.', at: '1403-07-08' }] },
        { id: 't_04', subject: 'مشکل در پرداخت آنلاین', customerId: 'c_1040', priority: 'urgent', status: 'open', assignedTo: null, createdAt: '1403-07-10', messages: [{ from: 'customer', text: 'مبلغ از حسابم کم شد ولی سفارش ثبت نشد.', at: '1403-07-10' }] },
        { id: 't_05', subject: 'تشکر از کیفیت محصول', customerId: 'c_1039', priority: 'low', status: 'closed', assignedTo: 'سکینه (پشتیبانی)', createdAt: '1403-06-29', messages: [{ from: 'customer', text: 'فقط خواستم تشکر کنم، کیفیت عالی بود.', at: '1403-06-29' }, { from: 'admin', text: 'سپاس از لطف شما.', at: '1403-06-29' }] },
        { id: 't_06', subject: 'استعلام موجودی پالتو سایز XL', customerId: 'c_1033', priority: 'normal', status: 'open', assignedTo: null, createdAt: '1403-07-11', messages: [{ from: 'customer', text: 'پالتو زمرد سایز XL رنگ مشکی موجود می‌شود؟', at: '1403-07-11' }] },
        { id: 't_07', subject: 'درخواست فاکتور رسمی', customerId: 'c_1030', priority: 'normal', status: 'closed', assignedTo: 'زهرا (مدیر کل)', createdAt: '1403-06-23', messages: [{ from: 'customer', text: 'فاکتور رسمی برای سفارش HST-10246 نیاز دارم.', at: '1403-06-23' }, { from: 'admin', text: 'فاکتور ایمیل شد.', at: '1403-06-24' }] }
    ];

    /* ======================= درخواست اطلاع از موجود شدن =================== */
    /* از فرم pdpNotifyForm در product.html */
    var RESTOCK_REQUESTS = [
        { id: 'rs_01', productId: 'chador-negin-baran', variant: 'یک‌سایز / ۱۶۰ / مشکی', contact: '09151234567', channel: 'sms', date: '1403-07-01', notified: false },
        { id: 'rs_02', productId: 'chador-negin-baran', variant: 'یک‌سایز / ۱۶۵ / مشکی', contact: 'z.mousavi@example.com', channel: 'email', date: '1403-07-02', notified: false },
        { id: 'rs_03', productId: 'chador-negin-baran', variant: 'یک‌سایز / ۱۵۵ / مشکی', contact: '09361112233', channel: 'sms', date: '1403-07-03', notified: false },
        { id: 'rs_04', productId: 'chador-niloofar', variant: 'یک‌سایز / ۱۶۰ / مشکی', contact: '09193334455', channel: 'sms', date: '1403-07-04', notified: false },
        { id: 'rs_05', productId: 'chador-niloofar', variant: 'یک‌سایز / ۱۶۰ / مشکی', contact: 'maryam.a@example.com', channel: 'email', date: '1403-07-05', notified: false },
        { id: 'rs_06', productId: 'abaya-parnian', variant: 'XL / ۱۴۵ / مشکی', contact: '09157778899', channel: 'sms', date: '1403-07-06', notified: false },
        { id: 'rs_07', productId: 'abaya-parnian', variant: 'XL / ۱۴۵ / مشکی', contact: 'narges.h@example.com', channel: 'email', date: '1403-07-07', notified: false },
        { id: 'rs_08', productId: 'palto-zomorod', variant: 'XL / — / مشکی', contact: '09122223344', channel: 'sms', date: '1403-07-10', notified: false },
        { id: 'rs_09', productId: 'shall-noor', variant: 'یک‌سایز / — / بژ طلایی', contact: '09153332211', channel: 'sms', date: '1403-06-30', notified: true }
    ];

    /* =========================== مشترکین خبرنامه ========================= */
    /* از فرم خبرنامه در فوتر همه صفحات storefront */
    var NEWSLETTER = [
        { id: 'n_01', email: 'f.rezaei@example.com', date: '1402-11-03', source: 'فوتر سایت', active: true },
        { id: 'n_02', email: 'z.mousavi@example.com', date: '1402-08-19', source: 'فوتر سایت', active: true },
        { id: 'n_03', email: 'maryam.a@example.com', date: '1403-02-14', source: 'فوتر سایت', active: true },
        { id: 'n_04', email: 'narges.h@example.com', date: '1403-01-22', source: 'فوتر سایت', active: true },
        { id: 'n_05', email: 'azam.s@example.com', date: '1403-05-30', source: 'فوتر سایت', active: true },
        { id: 'n_06', email: 'razieh.n@example.com', date: '1402-09-11', source: 'فوتر سایت', active: true },
        { id: 'n_07', email: 'tahereh.j@example.com', date: '1402-10-25', source: 'فوتر سایت', active: false },
        { id: 'n_08', email: 'mahdieh.a@example.com', date: '1403-06-02', source: 'فوتر سایت', active: true },
        { id: 'n_09', email: 'fereshteh.ab@example.com', date: '1402-06-14', source: 'فوتر سایت', active: true },
        { id: 'n_10', email: 'sara.mohammadi@example.com', date: '1403-07-05', source: 'صفحه محصول', active: true }
    ];

    /* ============================ پیام تماس با ما ======================== */
    /* پیش‌نیاز: افزودن فرم تماس به storefront (بخش ۷.۹ پرامپت) */
    var CONTACT_MESSAGES = [
        { id: 'cm_01', name: 'سارا محمدی', phone: '09121110099', email: 'sara.mohammadi@example.com', subject: 'همکاری در فروش', message: 'سلام، امکان همکاری به‌عنوان نمایندگی فروش در شیراز وجود دارد؟', date: '1403-07-05', read: false },
        { id: 'cm_02', name: 'الهام رستمی', phone: '09355550011', email: 'elham.r@example.com', subject: 'سوال درباره دوخت سفارشی', message: 'آیا امکان دوخت عبا با اندازه‌های سفارشی وجود دارد؟', date: '1403-07-07', read: false },
        { id: 'cm_03', name: 'کبری داوودی', phone: '09151112200', email: '', subject: 'آدرس فروشگاه', message: 'ساعت کاری روز جمعه چطور است؟', date: '1403-07-08', read: true },
        { id: 'cm_04', name: 'نسرین قاسمی', phone: '09189998877', email: 'nasrin.gh@example.com', subject: 'پیشنهاد محصول', message: 'لطفاً مقنعه هم به محصولات اضافه کنید.', date: '1403-07-09', read: true },
        { id: 'cm_05', name: 'زینب طاهری', phone: '09163334455', email: 'zeinab.t@example.com', subject: 'تشکر', message: 'از پشتیبانی خوبتان سپاسگزارم.', date: '1403-07-11', read: false }
    ];

    /* =========================== تنظیمات فروشگاه ========================= */
    var SETTINGS = {
        general: {
            storeName: 'فروشگاه هستی',
            logo: '../logo.png',
            phone: '09152500553',
            whatsapp: '09152500553',
            email: 'info@hijabhasti.ir',
            address: 'مشهد، بلوار جانباز، مجتمع اداری پاژ شماره ۲، طبقه سوم، واحد ۳۰۸',
            workHours: 'شنبه تا پنج‌شنبه ۱۰:۳۰ تا ۱۳:۳۰ و ۱۷ تا ۲۱ — جمعه عصر متغیر',
            instagram: 'https://instagram.com/hijab.hasti',
            threads: 'https://threads.net/@hijab.hasti',
            whatsappLink: 'https://wa.me/989152500553'
        },
        shipping: {
            freeShippingThreshold: 15000000,
            defaultCost: 450000,
            zones: [
                { name: 'مشهد', cost: 250000 },
                { name: 'سایر شهرها', cost: 450000 },
                { name: 'مناطق دورافتاده', cost: 650000 }
            ]
        },
        payment: {
            installmentEnabled: true,
            twoStageEnabled: true,
            minOrderAmount: 3000000,
            downPaymentPercent: 30,
            minInstallments: 2,
            maxInstallments: 4,
            twoStageSplit: 50,
            secondStageDeadlineDays: 15
        },
        ticker: {
            announceText: 'ارسال رایگان برای سفارش‌های بالای ۱۵ میلیون تومان',
            tickerItems: [
                'خرید قسطی و پرداخت دو‌مرحله‌ای برای سفارش‌های بالای ۳ میلیون تومان',
                'دوخت دست‌ساز با پارچه درجه یک',
                'امکان خرید حضوری در فروشگاه مشهد'
            ]
        },
        homepage: {
            heroSlides: [
                { image: '../banner1replace.webp', title: 'کالکشن اربعین هستی', subtitle: 'پوششی شایسته برای سفر دل', link: 'chador.html' },
                { image: '../banner2.webp', title: 'عبای دست‌دوز هستی', subtitle: 'ظرافت در هر دوخت', link: 'product.html?id=abaya-janan' },
                { image: '../banner3.webp', title: 'ست‌های پیشنهادی', subtitle: 'هماهنگی کامل از سر تا کیف', link: 'chador.html' }
            ],
            authenticityBanner: { image: '../AbbaItrm.webp', title: 'امضای اصالت هستی', text: 'هر محصول هستی با پارچه درجه یک و دوخت دست‌ساز تولید می‌شود.' },
            aboutText: 'هستی از سال ۱۳۹۵ با هدف ارائه پوشش باکیفیت و شایسته بانوان ایرانی فعالیت خود را آغاز کرد.'
        },
        loyalty: {
            pointsPer100k: 1,
            tiers: [
                { id: 'bronze', name: 'برنزی', minSpent: 0 },
                { id: 'silver', name: 'نقره‌ای', minSpent: 20000000 },
                { id: 'gold', name: 'طلایی', minSpent: 40000000 }
            ],
            pointToTomanRate: 10000
        }
    };

    /* ========================== کاربران ادمین و نقش‌ها ==================== */
    var ROLES = [
        { id: 'super', name: 'مدیر کل', description: 'دسترسی کامل به تمام ماژول‌ها' },
        { id: 'products', name: 'مدیر محصولات', description: 'مدیریت محصولات، دسته‌بندی، انبار' },
        { id: 'orders', name: 'مدیر سفارش‌ها', description: 'مدیریت سفارش‌ها، پرداخت و ارسال' },
        { id: 'support', name: 'پشتیبانی', description: 'تیکت‌ها، نظرات و پیام‌ها' }
    ];

    var MODULES = [
        { id: 'products', name: 'محصولات' },
        { id: 'categories', name: 'دسته‌بندی و کالکشن' },
        { id: 'orders', name: 'سفارش‌ها' },
        { id: 'customers', name: 'مشتریان' },
        { id: 'inventory', name: 'انبار' },
        { id: 'discounts', name: 'تخفیف‌ها' },
        { id: 'blog', name: 'بلاگ' },
        { id: 'reviews', name: 'نظرات' },
        { id: 'messages', name: 'پیام‌ها' },
        { id: 'reports', name: 'گزارش‌ها' },
        { id: 'settings', name: 'تنظیمات' },
        { id: 'users', name: 'کاربران ادمین' }
    ];

    /* دسترسی: write | read | none */
    var ROLE_PERMISSIONS = {
        super: { products: 'write', categories: 'write', orders: 'write', customers: 'write', inventory: 'write', discounts: 'write', blog: 'write', reviews: 'write', messages: 'write', reports: 'write', settings: 'write', users: 'write' },
        products: { products: 'write', categories: 'write', orders: 'read', customers: 'none', inventory: 'write', discounts: 'read', blog: 'write', reviews: 'read', messages: 'none', reports: 'read', settings: 'none', users: 'none' },
        orders: { products: 'read', categories: 'none', orders: 'write', customers: 'write', inventory: 'read', discounts: 'read', blog: 'none', reviews: 'none', messages: 'read', reports: 'read', settings: 'none', users: 'none' },
        support: { products: 'read', categories: 'none', orders: 'read', customers: 'read', inventory: 'none', discounts: 'none', blog: 'none', reviews: 'write', messages: 'write', reports: 'none', settings: 'none', users: 'none' }
    };

    var ADMIN_USERS = [
        { id: 'u_01', name: 'زهرا احمدی', phone: '09152500553', email: 'zahra@hijabhasti.ir', role: 'super', active: true, lastLogin: '1403-07-13', createdAt: '1402-05-01' },
        { id: 'u_02', name: 'مریم کاظمی', phone: '09151112233', email: 'maryam@hijabhasti.ir', role: 'orders', active: true, lastLogin: '1403-07-13', createdAt: '1402-08-14' },
        { id: 'u_03', name: 'سکینه رحیمی', phone: '09153334455', email: 'sakineh@hijabhasti.ir', role: 'support', active: true, lastLogin: '1403-07-12', createdAt: '1402-11-20' },
        { id: 'u_04', name: 'فاطمه نیک‌پور', phone: '09155556677', email: 'fatemeh@hijabhasti.ir', role: 'products', active: true, lastLogin: '1403-07-11', createdAt: '1403-02-03' },
        { id: 'u_05', name: 'حسین مرادی', phone: '09157778800', email: 'hossein@hijabhasti.ir', role: 'orders', active: false, lastLogin: '1403-04-28', createdAt: '1403-01-15' }
    ];

    /* ============================ گزارش فعالیت =========================== */
    var ACTIVITY_LOG = [
        { id: 'a_01', user: 'زهرا احمدی', action: 'ویرایش محصول', target: 'پالتو زمرد', module: 'products', at: '1403-07-13 ۱۴:۲۲' },
        { id: 'a_02', user: 'مریم کاظمی', action: 'تغییر وضعیت سفارش به «در حال آماده‌سازی»', target: 'HST-10261', module: 'orders', at: '1403-07-12 ۱۱:۰۵' },
        { id: 'a_03', user: 'سکینه رحیمی', action: 'تایید نظر', target: 'نظر روی پالتو زمرد', module: 'reviews', at: '1403-07-12 ۱۰:۱۸' },
        { id: 'a_04', user: 'زهرا احمدی', action: 'ایجاد کد تخفیف', target: 'WINTER25', module: 'discounts', at: '1403-07-11 ۱۶:۴۰' },
        { id: 'a_05', user: 'فاطمه نیک‌پور', action: 'ثبت ورود انبار', target: 'روسری نخی هستی — ۳۵ عدد', module: 'inventory', at: '1403-07-11 ۰۹:۳۰' },
        { id: 'a_06', user: 'مریم کاظمی', action: 'ثبت کد رهگیری', target: 'HST-10253', module: 'orders', at: '1403-07-10 ۱۵:۱۲' },
        { id: 'a_07', user: 'سکینه رحیمی', action: 'بستن تیکت', target: 'درخواست فاکتور رسمی', module: 'messages', at: '1403-07-09 ۱۳:۵۵' },
        { id: 'a_08', user: 'زهرا احمدی', action: 'تغییر تنظیمات ارسال', target: 'آستانه ارسال رایگان', module: 'settings', at: '1403-07-08 ۱۸:۲۰' },
        { id: 'a_09', user: 'فاطمه نیک‌پور', action: 'افزودن محصول', target: 'کیف مجلسی مهتاب', module: 'products', at: '1403-07-07 ۱۲:۰۰' },
        { id: 'a_10', user: 'مریم کاظمی', action: 'لغو سفارش', target: 'HST-10256', module: 'orders', at: '1403-07-08 ۱۰:۴۵' }
    ];

    /* =========================== سری‌های زمانی فروش ====================== */
    /* برای نمودارهای داشبورد و گزارش‌ها */
    var SALES_SERIES = {
        daily: {
            labels: ['۶ مهر', '۷ مهر', '۸ مهر', '۹ مهر', '۱۰ مهر', '۱۱ مهر', '۱۲ مهر', '۱۳ مهر'],
            revenue: [12400000, 18900000, 9200000, 24600000, 31200000, 15800000, 27400000, 21600000],
            orders: [2, 3, 1, 4, 5, 2, 4, 3]
        },
        weekly: {
            labels: ['هفته ۱', 'هفته ۲', 'هفته ۳', 'هفته ۴', 'هفته ۵', 'هفته ۶'],
            revenue: [86000000, 112000000, 94500000, 138000000, 121000000, 161100000],
            orders: [14, 19, 16, 23, 20, 27]
        },
        monthly: {
            labels: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر'],
            revenue: [284000000, 312000000, 268000000, 341000000, 456000000, 398000000, 161100000],
            orders: [46, 52, 44, 57, 78, 66, 27]
        },
        /* دوره قبل برای مقایسه */
        previous: {
            daily: [10800000, 14200000, 11600000, 19800000, 26400000, 18200000, 22100000, 17900000],
            weekly: [72000000, 98000000, 88000000, 118000000, 104000000, 132000000],
            monthly: [241000000, 276000000, 289000000, 302000000, 388000000, 356000000, 142000000]
        }
    };

    /* درآمد به تفکیک دسته‌بندی — نمودار حلقه‌ای داشبورد */
    var REVENUE_BY_CATEGORY = [
        { categoryId: 'chador', revenue: 486000000, orders: 96 },
        { categoryId: 'abaya', revenue: 612000000, orders: 78 },
        { categoryId: 'shall', revenue: 118000000, orders: 243 },
        { categoryId: 'kiff', revenue: 94000000, orders: 41 },
        { categoryId: 'shomiz', revenue: 138000000, orders: 57 },
        { categoryId: 'palto', revenue: 186000000, orders: 26 }
    ];

    /* هدف فروش ماهانه */
    var MONTHLY_GOAL = { target: 400000000, achieved: 161100000, month: 'مهر ۱۴۰۳' };

    /* ============================== اعلان‌ها ============================= */
    var NOTIFICATIONS = [
        { id: 'nt_01', type: 'order', title: 'سفارش جدید ثبت شد', desc: 'سفارش HST-10260 به مبلغ ۱۲,۰۰۰,۰۰۰ تومان', at: 'چند لحظه پیش', link: 'order-detail.html?id=HST-10260', read: false },
        { id: 'nt_02', type: 'stock', title: 'هشدار اتمام موجودی', desc: 'چادر نیلوفر — قد ۱۵۵ تنها ۱ عدد باقی مانده', at: '۲ ساعت پیش', link: 'inventory.html', read: false },
        { id: 'nt_03', type: 'payment', title: 'قسط معوق', desc: 'قسط دوم سفارش HST-10251 سررسید شده است', at: '۵ ساعت پیش', link: 'order-detail.html?id=HST-10251', read: false },
        { id: 'nt_04', type: 'review', title: 'نظر جدید در انتظار تایید', desc: '۴ نظر در انتظار بررسی هستند', at: 'دیروز', link: 'reviews.html', read: false },
        { id: 'nt_05', type: 'ticket', title: 'تیکت فوری', desc: 'مشکل در پرداخت آنلاین — اولویت فوری', at: 'دیروز', link: 'messages.html', read: true },
        { id: 'nt_06', type: 'restock', title: 'درخواست اطلاع از موجودی', desc: '۳ درخواست برای چادر نگین باران', at: '۲ روز پیش', link: 'messages.html', read: true }
    ];

    /* مدیر وارد‌شده — TODO(backend): از سرویس احراز هویت واقعی خوانده شود */
    var CURRENT_USER = { id: 'u_01', name: 'زهرا احمدی', role: 'super', roleName: 'مدیر کل', initials: 'زا' };

    /* ============================== خروجی ماژول ========================== */
    global.HASTI_MOCK = {
        IMG: IMG,
        CATEGORIES: CATEGORIES,
        COLLECTIONS: COLLECTIONS,
        FABRICS: FABRICS,
        COLOR_PRESETS: COLOR_PRESETS,
        PRODUCTS: PRODUCTS,
        CUSTOMERS: CUSTOMERS,
        ORDERS: ORDERS,
        INVENTORY_MOVES: INVENTORY_MOVES,
        DISCOUNTS: DISCOUNTS,
        CAMPAIGNS: CAMPAIGNS,
        BLOG_CATEGORIES: BLOG_CATEGORIES,
        BLOG_POSTS: BLOG_POSTS,
        REVIEWS: REVIEWS,
        TICKETS: TICKETS,
        RESTOCK_REQUESTS: RESTOCK_REQUESTS,
        NEWSLETTER: NEWSLETTER,
        CONTACT_MESSAGES: CONTACT_MESSAGES,
        SETTINGS: SETTINGS,
        ROLES: ROLES,
        MODULES: MODULES,
        ROLE_PERMISSIONS: ROLE_PERMISSIONS,
        ADMIN_USERS: ADMIN_USERS,
        ACTIVITY_LOG: ACTIVITY_LOG,
        SALES_SERIES: SALES_SERIES,
        REVENUE_BY_CATEGORY: REVENUE_BY_CATEGORY,
        MONTHLY_GOAL: MONTHLY_GOAL,
        NOTIFICATIONS: NOTIFICATIONS,
        CURRENT_USER: CURRENT_USER
    };
})(window);
