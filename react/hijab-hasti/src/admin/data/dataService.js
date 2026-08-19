import { HASTI_MOCK } from './mockData.js';


    var DB = HASTI_MOCK;


    var LATENCY = 0;

    function setLatency(ms) {
        LATENCY = Math.max(0, Number(ms) || 0);
        return LATENCY;
    }

    function delay(value) {
        /* بدون تاخیر، از میکروتسک استفاده می‌کنیم تا setTimeout بی‌جهت صف نشود */
        if (!LATENCY) return Promise.resolve(value);
        return new Promise(function (resolve) {
            setTimeout(function () { resolve(value); }, LATENCY);
        });
    }

    /* کپی سطحی برای جلوگیری از تغییر ناخواسته داده مرجع */
    function clone(v) {
        return JSON.parse(JSON.stringify(v));
    }

    
    var TODAY = '1403-07-14';

    function today() { return TODAY; }

    /* مقایسه دو تاریخ شمسی به‌صورت رشته‌ای (فرمت ثابت YYYY-MM-DD) */
    function compareJalali(a, b) {
        return a < b ? -1 : (a > b ? 1 : 0);
    }

    /* ======================= توابع محاسباتی مشترک ========================= */

    /* قیمت نهایی — همان فرمول موجود در storefront */
    function currentPrice(product) {
        return Math.round(product.oldPrice - (product.oldPrice * product.discount / 100));
    }

    function totalStock(product) {
        return (product.variants || []).reduce(function (sum, v) { return sum + (v.stock || 0); }, 0);
    }

    /* غنی‌سازی محصول با فیلدهای محاسبه‌شده */
    function decorateProduct(p) {
        var out = clone(p);
        out.currentPrice = currentPrice(p);
        out.totalStock = totalStock(p);
        out.profitPerUnit = out.currentPrice - (p.costPrice || 0);
        out.isLowStock = out.totalStock > 0 && out.totalStock <= (p.lowStockThreshold || 5);
        out.isOutOfStock = out.totalStock === 0;
        var cat = DB.CATEGORIES.filter(function (c) { return c.id === p.category; })[0];
        out.categoryName = cat ? cat.name : p.category;
        out.collectionNames = (p.collections || []).map(function (id) {
            var c = DB.COLLECTIONS.filter(function (x) { return x.id === id; })[0];
            return c ? c.name : id;
        });
        return out;
    }

    /* جمع اقلام سفارش */
    function itemsTotal(order) {
        return order.items.reduce(function (sum, it) { return sum + it.unitPrice * it.qty; }, 0);
    }

    /* وضعیت پرداخت سفارش بر اساس اقساط/مراحل */
    function paymentSummary(order) {
        var plan = order.paymentPlan;
        var list = plan.installments || [];
        var paid = 0, pending = 0, overdue = 0;

        list.forEach(function (ins) {
            /* یک قسط «در انتظار» که تاریخ سررسیدش گذشته، در واقع معوق است */
            var isOverdue = ins.status === 'overdue' ||
                (ins.status === 'pending' && compareJalali(ins.dueDate, today()) < 0);
            if (ins.status === 'paid') paid += ins.amount;
            else if (isOverdue) overdue += ins.amount;
            else pending += ins.amount;
            ins.effectiveStatus = ins.status === 'paid' ? 'paid' : (isOverdue ? 'overdue' : 'pending');
        });

        var total = plan.totalAmount;
        var status = 'pending';
        if (paid >= total) status = 'paid';
        else if (overdue > 0) status = 'overdue';
        else if (paid > 0) status = 'partial';

        return {
            paid: paid, pending: pending, overdue: overdue,
            remaining: total - paid,
            status: status,
            progress: total ? Math.round(paid / total * 100) : 0
        };
    }

    /* غنی‌سازی سفارش */
    function decorateOrder(o) {
        var out = clone(o);
        var customer = DB.CUSTOMERS.filter(function (c) { return c.id === o.customerId; })[0];
        out.customerName = customer ? customer.name : '—';
        out.customerPhone = customer ? customer.phone : '';
        out.itemsTotal = itemsTotal(o);
        out.itemsCount = o.items.reduce(function (s, i) { return s + i.qty; }, 0);
        out.finalAmount = o.paymentPlan.totalAmount;
        out.payment = paymentSummary(out);

        /* نام و تصویر محصول برای هر قلم */
        out.items = out.items.map(function (it) {
            var p = DB.PRODUCTS.filter(function (x) { return x.id === it.productId; })[0];
            it.productName = p ? p.name : it.productId;
            it.productImage = p ? p.images[0] : '';
            it.productCode = p ? p.code : '';
            it.lineTotal = it.unitPrice * it.qty;
            return it;
        });
        return out;
    }

    function decorateCustomer(c) {
        var out = clone(c);
        var orders = DB.ORDERS.filter(function (o) { return o.customerId === c.id; });
        out.orderCount = orders.length;
        var tier = DB.SETTINGS.loyalty.tiers.filter(function (t) { return t.id === c.loyaltyTier; })[0];
        out.tierName = tier ? tier.name : c.loyaltyTier;
        return out;
    }

    /* ============================== محصولات ============================== */
    async function getProducts() {
        return delay(DB.PRODUCTS.map(decorateProduct));
    }

    async function getProduct(id) {
        var p = DB.PRODUCTS.filter(function (x) { return x.id === id; })[0];
        return delay(p ? decorateProduct(p) : null);
    }

    async function saveProduct(product) {
        var idx = -1;
        DB.PRODUCTS.forEach(function (p, i) { if (p.id === product.id) idx = i; });
        if (idx >= 0) {
            DB.PRODUCTS[idx] = Object.assign({}, DB.PRODUCTS[idx], product, { updatedAt: today() });
        } else {
            DB.PRODUCTS.unshift(Object.assign({ views: 0, rating: 0, salesCount: 0, createdAt: today(), updatedAt: today() }, product));
        }
        return delay(decorateProduct(DB.PRODUCTS[idx >= 0 ? idx : 0]));
    }

    async function deleteProduct(id) {
        DB.PRODUCTS = DB.PRODUCTS.filter(function (p) { return p.id !== id; });
        HASTI_MOCK.PRODUCTS = DB.PRODUCTS;
        return delay(true);
    }

    /* تکثیر محصول — برای ساخت سریع تنوع رنگ/طرح جدید */
    async function duplicateProduct(id) {
        var p = DB.PRODUCTS.filter(function (x) { return x.id === id; })[0];
        if (!p) return delay(null);
        var copy = clone(p);
        copy.id = p.id + '-copy';
        copy.code = p.code + '-C';
        copy.name = p.name + ' (کپی)';
        copy.status = 'draft';
        copy.featuredHome = false;
        copy.views = 0;
        copy.salesCount = 0;
        copy.createdAt = today();
        copy.updatedAt = today();
        DB.PRODUCTS.unshift(copy);
        return delay(decorateProduct(copy));
    }

    async function bulkUpdateProducts(ids, changes) {
        DB.PRODUCTS.forEach(function (p) {
            if (ids.indexOf(p.id) !== -1) Object.assign(p, changes, { updatedAt: today() });
        });
        return delay(ids.length);
    }

    /* ===================== دسته‌بندی / کالکشن / پارچه ==================== */
    async function getCategories() { return delay(clone(DB.CATEGORIES)); }
    async function getCollections() { return delay(clone(DB.COLLECTIONS)); }
    async function getFabrics() { return delay(clone(DB.FABRICS)); }

    async function saveCategory(cat) {
        var idx = -1;
        DB.CATEGORIES.forEach(function (c, i) { if (c.id === cat.id) idx = i; });
        if (idx >= 0) Object.assign(DB.CATEGORIES[idx], cat);
        else DB.CATEGORIES.push(Object.assign({ productCount: 0, order: DB.CATEGORIES.length + 1 }, cat));
        return delay(true);
    }

    async function deleteCategory(id) {
        DB.CATEGORIES = DB.CATEGORIES.filter(function (c) { return c.id !== id; });
        HASTI_MOCK.CATEGORIES = DB.CATEGORIES;
        return delay(true);
    }

    async function saveCollection(col) {
        var idx = -1;
        DB.COLLECTIONS.forEach(function (c, i) { if (c.id === col.id) idx = i; });
        if (idx >= 0) Object.assign(DB.COLLECTIONS[idx], col);
        else DB.COLLECTIONS.push(Object.assign({ productCount: 0 }, col));
        return delay(true);
    }

    async function deleteCollection(id) {
        DB.COLLECTIONS = DB.COLLECTIONS.filter(function (c) { return c.id !== id; });
        HASTI_MOCK.COLLECTIONS = DB.COLLECTIONS;
        return delay(true);
    }

    /* =============================== سفارش‌ها ============================ */
    async function getOrders() {
        return delay(DB.ORDERS.map(decorateOrder));
    }

    async function getOrder(orderNumber) {
        var o = DB.ORDERS.filter(function (x) { return x.orderNumber === orderNumber; })[0];
        return delay(o ? decorateOrder(o) : null);
    }

    async function updateOrderStatus(orderNumber, status, by) {
        var o = DB.ORDERS.filter(function (x) { return x.orderNumber === orderNumber; })[0];
        if (!o) return delay(null);
        o.orderStatus = status;
        o.history.push({ status: status, at: today(), by: by || DB.CURRENT_USER.name });
        return delay(decorateOrder(o));
    }

    async function updateOrderTracking(orderNumber, trackingCode, carrier) {
        var o = DB.ORDERS.filter(function (x) { return x.orderNumber === orderNumber; })[0];
        if (!o) return delay(null);
        o.trackingCode = trackingCode;
        if (carrier) o.shipping.carrier = carrier;
        return delay(decorateOrder(o));
    }

    async function updateOrderNote(orderNumber, note) {
        var o = DB.ORDERS.filter(function (x) { return x.orderNumber === orderNumber; })[0];
        if (o) o.internalNote = note;
        return delay(true);
    }

    /* ثبت پرداخت یک قسط / مرحله */
    async function markInstallmentPaid(orderNumber, index) {
        var o = DB.ORDERS.filter(function (x) { return x.orderNumber === orderNumber; })[0];
        if (!o) return delay(null);
        o.paymentPlan.installments.forEach(function (ins) {
            if (ins.index === index) {
                ins.status = 'paid';
                ins.paidAt = today();
            }
        });
        return delay(decorateOrder(o));
    }

    /* ویرایش دستی زمان‌بندی قسط — چون هماهنگی با پشتیبانی انجام می‌شود */
    async function updateInstallment(orderNumber, index, changes) {
        var o = DB.ORDERS.filter(function (x) { return x.orderNumber === orderNumber; })[0];
        if (!o) return delay(null);
        o.paymentPlan.installments.forEach(function (ins) {
            if (ins.index === index) Object.assign(ins, changes);
        });
        return delay(decorateOrder(o));
    }

    /* اعتبارسنجی مجاز بودن پرداخت قسطی/دومرحله‌ای برای یک مبلغ */
    function isInstallmentEligible(amount) {
        var pay = DB.SETTINGS.payment;
        return pay.installmentEnabled && amount >= pay.minOrderAmount;
    }

    /* گزارش سلامت پرداخت‌های اقساطی/دومرحله‌ای */
    async function getPaymentHealth() {
        var overdueTotal = 0, overdueCount = 0, dueSoonTotal = 0, dueSoonCount = 0;
        var rows = [];

        DB.ORDERS.forEach(function (o) {
            if (o.paymentPlan.type === 'full') return;
            var dec = decorateOrder(o);
            dec.paymentPlan.installments.forEach(function (ins) {
                if (ins.effectiveStatus === 'overdue') {
                    overdueTotal += ins.amount;
                    overdueCount++;
                    rows.push({ orderNumber: o.orderNumber, customerName: dec.customerName, customerPhone: dec.customerPhone, label: ins.label, amount: ins.amount, dueDate: ins.dueDate, state: 'overdue', planType: o.paymentPlan.type });
                } else if (ins.effectiveStatus === 'pending' && daysBetween(today(), ins.dueDate) <= 7) {
                    dueSoonTotal += ins.amount;
                    dueSoonCount++;
                    rows.push({ orderNumber: o.orderNumber, customerName: dec.customerName, customerPhone: dec.customerPhone, label: ins.label, amount: ins.amount, dueDate: ins.dueDate, state: 'due_soon', planType: o.paymentPlan.type });
                }
            });
        });

        rows.sort(function (a, b) { return compareJalali(a.dueDate, b.dueDate); });
        return delay({
            overdueTotal: overdueTotal, overdueCount: overdueCount,
            dueSoonTotal: dueSoonTotal, dueSoonCount: dueSoonCount,
            rows: rows
        });
    }

    /* فاصله روز بین دو تاریخ شمسی (از طریق تبدیل به میلادی) */
    function daysBetween(fromJalali, toJalali) {
        var a = jalaliToDate(fromJalali), b = jalaliToDate(toJalali);
        return Math.round((b - a) / 86400000);
    }

    /* تبدیل تاریخ شمسی به آبجکت Date میلادی (الگوریتم استاندارد) */
    function jalaliToDate(str) {
        var parts = String(str).split('-').map(Number);
        var jy = parts[0], jm = parts[1], jd = parts[2];
        var gy = jy > 979 ? 1600 : 621;
        jy -= jy > 979 ? 979 : 0;
        var days = 365 * jy + Math.floor(jy / 33) * 8 + Math.floor(((jy % 33) + 3) / 4) + 78 + jd +
            (jm < 7 ? (jm - 1) * 31 : ((jm - 7) * 30) + 186);
        gy += 400 * Math.floor(days / 146097);
        days %= 146097;
        if (days > 36524) {
            gy += 100 * Math.floor(--days / 36524);
            days %= 36524;
            if (days >= 365) days++;
        }
        gy += 4 * Math.floor(days / 1461);
        days %= 1461;
        gy += Math.floor((days - 1) / 365);
        if (days > 365) days = (days - 1) % 365;
        var gd = days + 1;
        var sal_a = [0, 31, (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        var gm = 0;
        for (gm = 1; gm <= 12 && gd > sal_a[gm]; gm++) gd -= sal_a[gm];
        return new Date(gy, gm - 1, gd);
    }

    /* =============================== مشتریان ============================= */
    async function getCustomers() {
        return delay(DB.CUSTOMERS.map(decorateCustomer));
    }

    async function getCustomer(id) {
        var c = DB.CUSTOMERS.filter(function (x) { return x.id === id; })[0];
        return delay(c ? decorateCustomer(c) : null);
    }

    async function getCustomerOrders(id) {
        return delay(DB.ORDERS.filter(function (o) { return o.customerId === id; }).map(decorateOrder));
    }

    async function saveCustomer(customer) {
        var idx = -1;
        DB.CUSTOMERS.forEach(function (c, i) { if (c.id === customer.id) idx = i; });
        if (idx >= 0) Object.assign(DB.CUSTOMERS[idx], customer);
        return delay(true);
    }

    /* اصلاح دستی امتیاز باشگاه مشتریان توسط مدیر */
    async function adjustLoyaltyPoints(id, delta) {
        var c = DB.CUSTOMERS.filter(function (x) { return x.id === id; })[0];
        if (c) c.loyaltyPoints = Math.max(0, c.loyaltyPoints + delta);
        return delay(c ? c.loyaltyPoints : 0);
    }

    /* ================================ انبار ============================== */
    /* موجودی به تفکیک تنوع (سایز × قد × رنگ) برای همه محصولات */
    async function getInventory() {
        var rows = [];
        DB.PRODUCTS.forEach(function (p) {
            (p.variants || []).forEach(function (v, i) {
                rows.push({
                    id: p.id + '__' + i,
                    productId: p.id,
                    productName: p.name,
                    productCode: p.code,
                    productImage: p.images[0],
                    categoryName: (DB.CATEGORIES.filter(function (c) { return c.id === p.category; })[0] || {}).name || p.category,
                    variantLabel: v.size + ' / ' + (v.length ? v.length : '—') + ' / ' + v.color,
                    size: v.size, length: v.length, color: v.color,
                    stock: v.stock, barcode: v.barcode,
                    threshold: p.lowStockThreshold || 5,
                    costPrice: p.costPrice || 0,
                    stockValue: (v.stock || 0) * (p.costPrice || 0),
                    state: v.stock === 0 ? 'out' : (v.stock <= (p.lowStockThreshold || 5) ? 'low' : 'ok')
                });
            });
        });
        return delay(rows);
    }

    async function getInventoryMoves() {
        return delay(DB.INVENTORY_MOVES.map(function (m) {
            var out = clone(m);
            var p = DB.PRODUCTS.filter(function (x) { return x.id === m.productId; })[0];
            out.productName = p ? p.name : m.productId;
            out.productImage = p ? p.images[0] : '';
            return out;
        }));
    }

    async function addInventoryMove(move) {
        var record = Object.assign({ id: 'inv_' + Date.now(), date: today(), by: DB.CURRENT_USER.name }, move);
        DB.INVENTORY_MOVES.unshift(record);

        /* اعمال تغییر روی موجودی تنوع محصول */
        var p = DB.PRODUCTS.filter(function (x) { return x.id === move.productId; })[0];
        if (p) {
            (p.variants || []).forEach(function (v) {
                var label = v.size + ' / ' + (v.length ? v.length : '—') + ' / ' + v.color;
                if (label === move.variant) {
                    v.stock = Math.max(0, v.stock + (move.type === 'in' ? move.qty : -move.qty));
                }
            });
            /* هم‌گام‌سازی وضعیت محصول با موجودی */
            if (totalStock(p) === 0 && p.status === 'published') p.status = 'out_of_stock';
            if (totalStock(p) > 0 && p.status === 'out_of_stock') p.status = 'published';
        }
        return delay(record);
    }

    /* ارزش‌گذاری انبار و کالاهای راکد */
    async function getInventoryReport() {
        var rows = await getInventory();
        var totalValue = rows.reduce(function (s, r) { return s + r.stockValue; }, 0);
        var totalUnits = rows.reduce(function (s, r) { return s + r.stock; }, 0);
        var lowCount = rows.filter(function (r) { return r.state === 'low'; }).length;
        var outCount = rows.filter(function (r) { return r.state === 'out'; }).length;
        var stagnant = DB.PRODUCTS
            .filter(function (p) { return p.salesCount < 25 && totalStock(p) > 0; })
            .map(decorateProduct)
            .sort(function (a, b) { return a.salesCount - b.salesCount; });
        return { totalValue: totalValue, totalUnits: totalUnits, lowCount: lowCount, outCount: outCount, stagnant: stagnant, rows: rows };
    }

    /* ============================== تخفیف‌ها ============================= */
    async function getDiscounts() {
        return delay(DB.DISCOUNTS.map(function (d) {
            var out = clone(d);
            out.targetNames = (d.targetIds || []).map(function (id) {
                var col = DB.COLLECTIONS.filter(function (c) { return c.id === id; })[0];
                var cat = DB.CATEGORIES.filter(function (c) { return c.id === id; })[0];
                var pr = DB.PRODUCTS.filter(function (p) { return p.id === id; })[0];
                return (col || cat || pr || {}).name || id;
            });
            out.usageRate = d.maxUses ? Math.round(d.usedCount / d.maxUses * 100) : 0;
            return out;
        }));
    }

    async function saveDiscount(d) {
        var idx = -1;
        DB.DISCOUNTS.forEach(function (x, i) { if (x.id === d.id) idx = i; });
        if (idx >= 0) Object.assign(DB.DISCOUNTS[idx], d);
        else DB.DISCOUNTS.unshift(Object.assign({ id: 'd_' + Date.now(), usedCount: 0, totalDiscountGiven: 0 }, d));
        return delay(true);
    }

    async function deleteDiscount(id) {
        DB.DISCOUNTS = DB.DISCOUNTS.filter(function (d) { return d.id !== id; });
        HASTI_MOCK.DISCOUNTS = DB.DISCOUNTS;
        return delay(true);
    }

    async function getCampaigns() {
        return delay(DB.CAMPAIGNS.map(function (c) {
            var out = clone(c);
            var col = DB.COLLECTIONS.filter(function (x) { return x.id === c.collectionId; })[0];
            out.collectionName = col ? col.name : c.collectionId;
            return out;
        }));
    }

    async function saveCampaign(c) {
        var idx = -1;
        DB.CAMPAIGNS.forEach(function (x, i) { if (x.id === c.id) idx = i; });
        if (idx >= 0) Object.assign(DB.CAMPAIGNS[idx], c);
        else DB.CAMPAIGNS.unshift(Object.assign({ id: 'camp_' + Date.now(), revenue: 0 }, c));
        return delay(true);
    }

    /* ================================ بلاگ ============================== */
    async function getBlogPosts() {
        return delay(DB.BLOG_POSTS.map(function (p) {
            var out = clone(p);
            var cat = DB.BLOG_CATEGORIES.filter(function (c) { return c.id === p.categoryId; })[0];
            out.categoryName = cat ? cat.name : '—';
            return out;
        }));
    }

    async function getBlogPost(id) {
        var p = DB.BLOG_POSTS.filter(function (x) { return x.id === id; })[0];
        return delay(p ? clone(p) : null);
    }

    async function saveBlogPost(post) {
        var idx = -1;
        DB.BLOG_POSTS.forEach(function (p, i) { if (p.id === post.id) idx = i; });
        if (idx >= 0) Object.assign(DB.BLOG_POSTS[idx], post);
        else DB.BLOG_POSTS.unshift(Object.assign({ id: 'bp_' + Date.now(), views: 0 }, post));
        return delay(true);
    }

    async function deleteBlogPost(id) {
        DB.BLOG_POSTS = DB.BLOG_POSTS.filter(function (p) { return p.id !== id; });
        HASTI_MOCK.BLOG_POSTS = DB.BLOG_POSTS;
        return delay(true);
    }

    async function getBlogCategories() { return delay(clone(DB.BLOG_CATEGORIES)); }

    async function saveBlogCategory(cat) {
        var idx = -1;
        DB.BLOG_CATEGORIES.forEach(function (c, i) { if (c.id === cat.id) idx = i; });
        if (idx >= 0) Object.assign(DB.BLOG_CATEGORIES[idx], cat);
        else DB.BLOG_CATEGORIES.push(Object.assign({ id: 'bc_' + Date.now(), postCount: 0 }, cat));
        return delay(true);
    }

    /* =============================== نظرات ============================== */
    async function getReviews() {
        return delay(DB.REVIEWS.map(function (r) {
            var out = clone(r);
            var p = DB.PRODUCTS.filter(function (x) { return x.id === r.productId; })[0];
            out.productName = p ? p.name : r.productId;
            out.productImage = p ? p.images[0] : '';
            return out;
        }));
    }

    async function setReviewStatus(id, status) {
        var r = DB.REVIEWS.filter(function (x) { return x.id === id; })[0];
        if (r) r.status = status;
        return delay(true);
    }

    async function replyToReview(id, reply) {
        var r = DB.REVIEWS.filter(function (x) { return x.id === id; })[0];
        if (r) { r.reply = reply; r.replyDate = today(); }
        return delay(true);
    }

    async function deleteReview(id) {
        DB.REVIEWS = DB.REVIEWS.filter(function (r) { return r.id !== id; });
        HASTI_MOCK.REVIEWS = DB.REVIEWS;
        return delay(true);
    }

    /* میانگین امتیاز واقعی هر محصول — جایگزین امتیاز ثابت ۴.۹ در صفحه اصلی */
    async function getProductRatings() {
        var map = {};
        DB.REVIEWS.forEach(function (r) {
            if (r.status !== 'approved') return;
            if (!map[r.productId]) map[r.productId] = { sum: 0, count: 0 };
            map[r.productId].sum += r.rating;
            map[r.productId].count++;
        });
        Object.keys(map).forEach(function (k) {
            map[k].average = Math.round(map[k].sum / map[k].count * 10) / 10;
        });
        return delay(map);
    }

    /* ==================== پیام‌ها، تیکت و اطلاع‌رسانی ==================== */
    async function getTickets() {
        return delay(DB.TICKETS.map(function (t) {
            var out = clone(t);
            var c = DB.CUSTOMERS.filter(function (x) { return x.id === t.customerId; })[0];
            out.customerName = c ? c.name : '—';
            out.customerPhone = c ? c.phone : '';
            return out;
        }));
    }

    async function updateTicket(id, changes) {
        var t = DB.TICKETS.filter(function (x) { return x.id === id; })[0];
        if (t) Object.assign(t, changes);
        return delay(true);
    }

    async function replyToTicket(id, text) {
        var t = DB.TICKETS.filter(function (x) { return x.id === id; })[0];
        if (t) {
            t.messages.push({ from: 'admin', text: text, at: today() });
            t.status = 'in_progress';
        }
        return delay(true);
    }

    async function getContactMessages() { return delay(clone(DB.CONTACT_MESSAGES)); }

    async function markMessageRead(id) {
        var m = DB.CONTACT_MESSAGES.filter(function (x) { return x.id === id; })[0];
        if (m) m.read = true;
        return delay(true);
    }

    async function getRestockRequests() {
        return delay(DB.RESTOCK_REQUESTS.map(function (r) {
            var out = clone(r);
            var p = DB.PRODUCTS.filter(function (x) { return x.id === r.productId; })[0];
            out.productName = p ? p.name : r.productId;
            out.productImage = p ? p.images[0] : '';
            out.inStockNow = p ? totalStock(p) > 0 : false;
            return out;
        }));
    }

    /* ارسال گروهی اطلاع‌رسانی موجود شدن یک محصول */
    async function notifyRestockGroup(productId) {
        var count = 0;
        DB.RESTOCK_REQUESTS.forEach(function (r) {
            if (r.productId === productId && !r.notified) { r.notified = true; count++; }
        });
        /* TODO(backend): ارسال واقعی پیامک/ایمیل نیازمند سرویس سمت سرور است. */
        return delay(count);
    }

    async function getNewsletter() { return delay(clone(DB.NEWSLETTER)); }

    /* ============================== تنظیمات ============================= */
    async function getSettings() { return delay(clone(DB.SETTINGS)); }

    async function saveSettings(section, values) {
        Object.assign(DB.SETTINGS[section], values);
        return delay(clone(DB.SETTINGS));
    }

    /* ========================= کاربران ادمین و نقش‌ها =================== */
    async function getAdminUsers() {
        return delay(DB.ADMIN_USERS.map(function (u) {
            var out = clone(u);
            var r = DB.ROLES.filter(function (x) { return x.id === u.role; })[0];
            out.roleName = r ? r.name : u.role;
            return out;
        }));
    }

    async function saveAdminUser(user) {
        var idx = -1;
        DB.ADMIN_USERS.forEach(function (u, i) { if (u.id === user.id) idx = i; });
        if (idx >= 0) Object.assign(DB.ADMIN_USERS[idx], user);
        else DB.ADMIN_USERS.push(Object.assign({ id: 'u_' + Date.now(), createdAt: today(), lastLogin: '—' }, user));
        return delay(true);
    }

    async function deleteAdminUser(id) {
        DB.ADMIN_USERS = DB.ADMIN_USERS.filter(function (u) { return u.id !== id; });
        HASTI_MOCK.ADMIN_USERS = DB.ADMIN_USERS;
        return delay(true);
    }

    async function getRoles() { return delay(clone(DB.ROLES)); }
    async function getModules() { return delay(clone(DB.MODULES)); }
    async function getRolePermissions() { return delay(clone(DB.ROLE_PERMISSIONS)); }

    async function saveRolePermissions(perms) {
        Object.assign(DB.ROLE_PERMISSIONS, perms);
        return delay(true);
    }

    async function getActivityLog() { return delay(clone(DB.ACTIVITY_LOG)); }

    /* ============================ داشبورد و آمار ======================== */
    async function getDashboardStats() {
        var orders = DB.ORDERS.map(decorateOrder);
        var series = DB.SALES_SERIES;

        var todayRevenue = series.daily.revenue[series.daily.revenue.length - 1];
        var yesterdayRevenue = series.daily.revenue[series.daily.revenue.length - 2];
        var weekRevenue = series.daily.revenue.reduce(function (s, v) { return s + v; }, 0);
        var prevWeekRevenue = series.previous.daily.reduce(function (s, v) { return s + v; }, 0);
        var monthRevenue = series.monthly.revenue[series.monthly.revenue.length - 1];
        var prevMonthRevenue = series.previous.monthly[series.previous.monthly.length - 1];

        var pendingOrders = orders.filter(function (o) { return o.orderStatus === 'pending'; });
        var health = await getPaymentHealth();

        var lowStock = DB.PRODUCTS.map(decorateProduct).filter(function (p) { return p.isLowStock || p.isOutOfStock; });
        var pendingReviews = DB.REVIEWS.filter(function (r) { return r.status === 'pending'; });
        var openTickets = DB.TICKETS.filter(function (t) { return t.status === 'open' || t.status === 'in_progress'; });
        var readyRestock = (await getRestockRequests()).filter(function (r) { return !r.notified && r.inStockNow; });

        /* پرفروش‌ترین محصولات */
        var topProducts = DB.PRODUCTS.map(decorateProduct)
            .sort(function (a, b) { return b.salesCount - a.salesCount; })
            .slice(0, 6)
            .map(function (p) {
                return { id: p.id, name: p.name, image: p.images[0], salesCount: p.salesCount, revenue: p.salesCount * p.currentPrice, categoryName: p.categoryName };
            });

        /* درآمد به تفکیک دسته‌بندی */
        var byCategory = DB.REVENUE_BY_CATEGORY.map(function (r) {
            var cat = DB.CATEGORIES.filter(function (c) { return c.id === r.categoryId; })[0];
            return { id: r.categoryId, name: cat ? cat.name : r.categoryId, revenue: r.revenue, orders: r.orders };
        }).sort(function (a, b) { return b.revenue - a.revenue; });

        /* نرخ بازگشت مشتری */
        var repeatCustomers = DB.CUSTOMERS.filter(function (c) { return c.totalOrders > 1; }).length;

        return {
            todayRevenue: todayRevenue,
            todayDelta: pct(todayRevenue, yesterdayRevenue),
            weekRevenue: weekRevenue,
            weekDelta: pct(weekRevenue, prevWeekRevenue),
            monthRevenue: monthRevenue,
            monthDelta: pct(monthRevenue, prevMonthRevenue),
            pendingOrderCount: pendingOrders.length,
            totalOrderCount: orders.length,
            customerCount: DB.CUSTOMERS.length,
            customerDelta: 12,
            repeatRate: Math.round(repeatCustomers / DB.CUSTOMERS.length * 100),
            receivables: health.overdueTotal + health.dueSoonTotal,
            overdueTotal: health.overdueTotal,
            overdueCount: health.overdueCount,
            dueSoonTotal: health.dueSoonTotal,
            dueSoonCount: health.dueSoonCount,
            paymentRows: health.rows,
            lowStock: lowStock,
            pendingReviews: pendingReviews.length,
            openTickets: openTickets.length,
            readyRestock: readyRestock,
            topProducts: topProducts,
            byCategory: byCategory,
            goal: clone(DB.MONTHLY_GOAL),
            series: clone(series),
            sparkline: series.daily.revenue.slice()
        };
    }

    function pct(now, before) {
        if (!before) return 0;
        return Math.round((now - before) / before * 100);
    }

    /* گزارش سود بر اساس بهای تمام‌شده */
    async function getProfitReport() {
        var rows = DB.PRODUCTS.map(decorateProduct).map(function (p) {
            var revenue = p.salesCount * p.currentPrice;
            var cost = p.salesCount * (p.costPrice || 0);
            return {
                id: p.id, name: p.name, image: p.images[0], categoryName: p.categoryName,
                salesCount: p.salesCount, revenue: revenue, cost: cost,
                profit: revenue - cost,
                margin: revenue ? Math.round((revenue - cost) / revenue * 100) : 0
            };
        }).sort(function (a, b) { return b.profit - a.profit; });

        return delay({
            rows: rows,
            totalRevenue: rows.reduce(function (s, r) { return s + r.revenue; }, 0),
            totalCost: rows.reduce(function (s, r) { return s + r.cost; }, 0),
            totalProfit: rows.reduce(function (s, r) { return s + r.profit; }, 0)
        });
    }

    /* مشتریان برتر بر اساس مبلغ خرید */
    async function getTopCustomers() {
        return delay(DB.CUSTOMERS.map(decorateCustomer)
            .sort(function (a, b) { return b.totalSpent - a.totalSpent; })
            .slice(0, 10));
    }

    /* اعلان‌های topbar */
    async function getNotifications() { return delay(clone(DB.NOTIFICATIONS)); }

    async function markAllNotificationsRead() {
        DB.NOTIFICATIONS.forEach(function (n) { n.read = true; });
        return delay(true);
    }

    /* جست‌وجوی سراسری در محصولات، سفارش‌ها و مشتریان */
    async function globalSearch(query) {
        var q = String(query || '').trim().toLowerCase();
        if (q.length < 2) return { products: [], orders: [], customers: [] };

        function match(text) {
            return String(text || '').toLowerCase().indexOf(q) !== -1;
        }

        return {
            products: DB.PRODUCTS.filter(function (p) { return match(p.name) || match(p.code) || match(p.barcode); }).slice(0, 5).map(decorateProduct),
            orders: DB.ORDERS.filter(function (o) {
                var c = DB.CUSTOMERS.filter(function (x) { return x.id === o.customerId; })[0];
                return match(o.orderNumber) || match(o.trackingCode) || (c && match(c.name));
            }).slice(0, 5).map(decorateOrder),
            customers: DB.CUSTOMERS.filter(function (c) { return match(c.name) || match(c.phone) || match(c.email); }).slice(0, 5).map(decorateCustomer)
        };
    }

    /* کاربر جاری */
    function getCurrentUser() { return clone(DB.CURRENT_USER); }

    function getPermissions() {
        return clone(DB.ROLE_PERMISSIONS[DB.CURRENT_USER.role] || {});
    }

    /* ============================== خروجی ماژول ========================= */
    export const dataService = {
        /* کمکی‌های محاسباتی */
        setLatency: setLatency,
        today: today,
        compareJalali: compareJalali,
        daysBetween: daysBetween,
        jalaliToDate: jalaliToDate,
        currentPrice: currentPrice,
        isInstallmentEligible: isInstallmentEligible,
        getCurrentUser: getCurrentUser,
        getPermissions: getPermissions,

        /* محصولات */
        getProducts: getProducts,
        getProduct: getProduct,
        saveProduct: saveProduct,
        deleteProduct: deleteProduct,
        duplicateProduct: duplicateProduct,
        bulkUpdateProducts: bulkUpdateProducts,

        /* تاکسونومی */
        getCategories: getCategories,
        getCollections: getCollections,
        getFabrics: getFabrics,
        saveCategory: saveCategory,
        deleteCategory: deleteCategory,
        saveCollection: saveCollection,
        deleteCollection: deleteCollection,

        /* سفارش‌ها */
        getOrders: getOrders,
        getOrder: getOrder,
        updateOrderStatus: updateOrderStatus,
        updateOrderTracking: updateOrderTracking,
        updateOrderNote: updateOrderNote,
        markInstallmentPaid: markInstallmentPaid,
        updateInstallment: updateInstallment,
        getPaymentHealth: getPaymentHealth,

        /* مشتریان */
        getCustomers: getCustomers,
        getCustomer: getCustomer,
        getCustomerOrders: getCustomerOrders,
        saveCustomer: saveCustomer,
        adjustLoyaltyPoints: adjustLoyaltyPoints,
        getTopCustomers: getTopCustomers,

        /* انبار */
        getInventory: getInventory,
        getInventoryMoves: getInventoryMoves,
        addInventoryMove: addInventoryMove,
        getInventoryReport: getInventoryReport,

        /* تخفیف */
        getDiscounts: getDiscounts,
        saveDiscount: saveDiscount,
        deleteDiscount: deleteDiscount,
        getCampaigns: getCampaigns,
        saveCampaign: saveCampaign,

        /* بلاگ */
        getBlogPosts: getBlogPosts,
        getBlogPost: getBlogPost,
        saveBlogPost: saveBlogPost,
        deleteBlogPost: deleteBlogPost,
        getBlogCategories: getBlogCategories,
        saveBlogCategory: saveBlogCategory,

        /* نظرات */
        getReviews: getReviews,
        setReviewStatus: setReviewStatus,
        replyToReview: replyToReview,
        deleteReview: deleteReview,
        getProductRatings: getProductRatings,

        /* پیام‌ها */
        getTickets: getTickets,
        updateTicket: updateTicket,
        replyToTicket: replyToTicket,
        getContactMessages: getContactMessages,
        markMessageRead: markMessageRead,
        getRestockRequests: getRestockRequests,
        notifyRestockGroup: notifyRestockGroup,
        getNewsletter: getNewsletter,

        /* تنظیمات و کاربران */
        getSettings: getSettings,
        saveSettings: saveSettings,
        getAdminUsers: getAdminUsers,
        saveAdminUser: saveAdminUser,
        deleteAdminUser: deleteAdminUser,
        getRoles: getRoles,
        getModules: getModules,
        getRolePermissions: getRolePermissions,
        saveRolePermissions: saveRolePermissions,
        getActivityLog: getActivityLog,

        /* داشبورد و گزارش */
        getDashboardStats: getDashboardStats,
        getProfitReport: getProfitReport,
        getNotifications: getNotifications,
        markAllNotificationsRead: markAllNotificationsRead,
        globalSearch: globalSearch
    };
