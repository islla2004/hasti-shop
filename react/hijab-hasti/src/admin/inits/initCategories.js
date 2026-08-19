import { Admin } from '../adminShared.js';
import { dataService } from '../data/dataService.js';
import { HASTI_MOCK } from '../data/mockData.js';

export async function initCategories() {


      var categories = [], collections = [], fabrics = [];
      var activeTab = 'categories';

      (async function init() {
        await Admin.shell("categories");
        await loadAll();
        bindTabs();
        document.getElementById('addBtn').addEventListener('click', function () {
          if (activeTab === 'categories') categoryDialog();
          else if (activeTab === 'collections') collectionDialog();
          else fabricDialog();
        });
        renderNotices();
      })();

      async function loadAll() {
        var res = await Promise.all([
          dataService.getCategories(),
          dataService.getCollections(),
          dataService.getFabrics()
        ]);
        categories = res[0].sort(function (a, b) { return a.order - b.order; });
        collections = res[1];
        fabrics = res[2];

        document.getElementById('countCategories').textContent = Admin.fa(categories.length);
        document.getElementById('countCollections').textContent = Admin.fa(collections.length);
        document.getElementById('countFabrics').textContent = Admin.fa(fabrics.length);

        renderCategories();
        renderCollections();
        renderFabrics();
      }

      function renderNotices() {
        document.getElementById('categoryNotice').innerHTML = Admin.icon('info') +
          '<span><b>کاربرد دسته‌بندی</b>تصویر هر دسته‌بندی در کارت‌های دایره‌ای صفحه اصلی و ' +
          'ترتیب آن در مگامنوی سایت استفاده می‌شود.</span>';
        document.getElementById('collectionNotice').innerHTML = Admin.icon('sparkle') +
          '<span><b>کاربرد کالکشن</b>کالکشن‌ها برای کمپین‌های فصلی و مناسبتی هستند و بازه تاریخ فعال‌بودن دارند؛ ' +
          'مثلاً «کالکشن اربعین» فقط در بازه مشخص در سایت دیده می‌شود.</span>';
        document.getElementById('fabricNotice').innerHTML = Admin.icon('info') +
          '<span><b>تاکسونومی پارچه</b>این مقادیر هم در فرم محصول و هم به‌عنوان فیلتر در صفحه دسته‌بندی ' +
          'فروشگاه استفاده می‌شوند.</span>';
      }

      /* =============================== تب‌ها =========================== */
      function bindTabs() {
        Admin.$$('[data-tab]').forEach(function (tab) {
          tab.addEventListener('click', function () {
            activeTab = tab.getAttribute('data-tab');
            Admin.$$('[data-tab]').forEach(function (t) {
              t.classList.toggle('tab--active', t === tab);
              t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
            });
            Admin.$$('[data-panel]').forEach(function (panel) {
              panel.classList.toggle('tab-panel--active', panel.getAttribute('data-panel') === activeTab);
            });
          });
        });
      }

      /* ========================= کارت‌های دسته‌بندی ===================== */
      function renderCategories() {
        var grid = document.getElementById('categoryGrid');
        if (!categories.length) {
          grid.innerHTML = '';
          grid.appendChild(Admin.emptyState({
            icon: 'layers',
            title: 'دسته‌بندی‌ای وجود ندارد',
            desc: 'برای سازمان‌دهی محصولات، اولین دسته‌بندی را بسازید.',
            actionLabel: 'افزودن دسته‌بندی',
            onAction: function () { categoryDialog(); }
          }));
          return;
        }

        grid.innerHTML = categories.map(function (c, i) {
          return '<article class="card reveal" style="animation-delay:' + (i * 40) + 'ms">' +
            '<div style="position:relative">' +
            '<img src="' + c.image + '" alt="' + Admin.escapeHtml(c.name) + '" loading="lazy" ' +
            'style="width:100%;aspect-ratio:16/10;object-fit:cover;border-radius:var(--r-lg) var(--r-lg) 0 0">' +
            '<span class="badge badge--jet" style="position:absolute;top:10px;inset-inline-end:10px">' +
            'ترتیب ' + Admin.fa(c.order) + '</span>' +
            '</div>' +
            '<div class="card__body" style="padding:16px">' +
            '<div class="row row--between mb-1">' +
            '<b style="font-size:14.5px;color:var(--c-jet)">' + Admin.escapeHtml(c.name) + '</b>' +
            Admin.badge(Admin.fa(c.productCount) + ' محصول', 'gold', 'box') +
            '</div>' +
            '<small class="text-soft ltr" style="display:block;margin-bottom:10px">' +
            Admin.escapeHtml(c.slug) + '</small>' +
            '<p class="text-xs text-muted" style="min-height:34px">' +
            Admin.escapeHtml((c.seo && c.seo.description) || 'توضیح متا تنظیم نشده است.') + '</p>' +
            '<div class="row row--tight mt-1">' +
            '<button class="btn btn--ghost btn--sm" type="button" data-edit-cat="' + c.id + '" style="flex:1">' +
            Admin.icon('edit') + '<span>ویرایش</span></button>' +
            '<button class="act-btn" type="button" data-up-cat="' + c.id + '" aria-label="انتقال به بالا"' +
            (i === 0 ? ' disabled' : '') + '>' + Admin.icon('arrowRight') + '</button>' +
            '<button class="act-btn" type="button" data-down-cat="' + c.id + '" aria-label="انتقال به پایین"' +
            (i === categories.length - 1 ? ' disabled' : '') + '>' + Admin.icon('arrowLeft') + '</button>' +
            '<button class="act-btn act-btn--danger" type="button" data-del-cat="' + c.id + '" ' +
            'aria-label="حذف ' + Admin.escapeHtml(c.name) + '">' + Admin.icon('trash') + '</button>' +
            '</div></div></article>';
        }).join('');

        grid.querySelectorAll('[data-edit-cat]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var cat = categories.filter(function (c) { return c.id === btn.getAttribute('data-edit-cat'); })[0];
            categoryDialog(cat);
          });
        });

        grid.querySelectorAll('[data-del-cat]').forEach(function (btn) {
          btn.addEventListener('click', async function () {
            var cat = categories.filter(function (c) { return c.id === btn.getAttribute('data-del-cat'); })[0];
            if (cat.productCount > 0) {
              Admin.modal({
                title: 'حذف امکان‌پذیر نیست',
                icon: 'alert', danger: true,
                body: '<p>دسته‌بندی «<b>' + Admin.escapeHtml(cat.name) + '</b>» شامل ' +
                  Admin.fa(cat.productCount) + ' محصول است. ابتدا محصولات را به دسته‌بندی دیگری منتقل کنید.</p>',
                actions: [{ label: 'متوجه شدم', variant: 'btn--primary', onClick: function (m) { m.close(); } }]
              });
              return;
            }
            var ok = await Admin.confirm({
              title: 'حذف دسته‌بندی', danger: true, icon: 'trash',
              message: 'دسته‌بندی «<b>' + Admin.escapeHtml(cat.name) + '</b>» حذف شود؟',
              confirmLabel: 'حذف'
            });
            if (!ok) return;
            await dataService.deleteCategory(cat.id);
            await loadAll();
            Admin.toast('دسته‌بندی حذف شد');
          });
        });

        /* تغییر ترتیب نمایش در منو */
        grid.querySelectorAll('[data-up-cat]').forEach(function (btn) {
          btn.addEventListener('click', function () { moveCategory(btn.getAttribute('data-up-cat'), -1); });
        });
        grid.querySelectorAll('[data-down-cat]').forEach(function (btn) {
          btn.addEventListener('click', function () { moveCategory(btn.getAttribute('data-down-cat'), 1); });
        });
      }

      async function moveCategory(id, direction) {
        var index = categories.findIndex(function (c) { return c.id === id; });
        var target = index + direction;
        if (target < 0 || target >= categories.length) return;
        var a = categories[index], b = categories[target];
        var tmp = a.order;
        a.order = b.order;
        b.order = tmp;
        await dataService.saveCategory(a);
        await dataService.saveCategory(b);
        await loadAll();
        Admin.toast('ترتیب نمایش در منو به‌روز شد');
      }

      function categoryDialog(cat) {
        var isEdit = !!cat;
        var data = cat || { id: '', name: '', slug: '', image: HASTI_MOCK.IMG.chadorItem, order: categories.length + 1, seo: {} };

        var m = Admin.modal({
          title: isEdit ? 'ویرایش دسته‌بندی' : 'افزودن دسته‌بندی',
          icon: 'layers',
          body:
            '<div class="form-grid">' +
            '<div class="field field--full"><label class="label" for="catName">نام دسته‌بندی <span class="req">*</span></label>' +
            '<input class="input" id="catName" value="' + Admin.escapeHtml(data.name) + '" placeholder="مثال: چادر مجلسی"></div>' +
            '<div class="field"><label class="label" for="catSlug">اسلاگ <span class="req">*</span></label>' +
            '<input class="input ltr" id="catSlug" value="' + Admin.escapeHtml(data.slug) + '" placeholder="chador"></div>' +
            '<div class="field"><label class="label" for="catOrder">ترتیب در منو</label>' +
            '<input class="input num" type="number" id="catOrder" min="1" value="' + data.order + '"></div>' +
            '<div class="field field--full"><label class="label" for="catImage">آدرس تصویر</label>' +
            '<input class="input ltr" id="catImage" value="' + Admin.escapeHtml(data.image) + '">' +
            '<span class="hint">در کارت‌های دایره‌ای صفحه اصلی نمایش داده می‌شود.</span></div>' +
            '<div class="field field--full"><label class="label" for="catSeoTitle">عنوان متا</label>' +
            '<input class="input" id="catSeoTitle" value="' + Admin.escapeHtml(data.seo.title || '') + '"></div>' +
            '<div class="field field--full"><label class="label" for="catSeoDesc">توضیح متا</label>' +
            '<textarea class="textarea" id="catSeoDesc" rows="2">' + Admin.escapeHtml(data.seo.description || '') + '</textarea></div>' +
            '</div>',
          actions: [
            { label: 'انصراف', variant: 'btn--ghost', onClick: function (mm) { mm.close(); } },
            {
              label: isEdit ? 'ذخیره تغییرات' : 'افزودن', variant: 'btn--primary',
              onClick: async function (mm) {
                var name = document.getElementById('catName').value.trim();
                var slug = document.getElementById('catSlug').value.trim();
                if (!name || !slug) { Admin.toast('نام و اسلاگ الزامی هستند', 'error'); return; }
                if (!/^[a-z0-9-]+$/.test(slug)) {
                  Admin.toast('اسلاگ فقط می‌تواند حروف انگلیسی کوچک، عدد و خط تیره باشد', 'error');
                  return;
                }
                await dataService.saveCategory({
                  id: isEdit ? data.id : slug,
                  name: name, slug: slug,
                  image: document.getElementById('catImage').value.trim(),
                  order: Number(Admin.toEn(document.getElementById('catOrder').value)) || 1,
                  seo: {
                    title: document.getElementById('catSeoTitle').value.trim(),
                    description: document.getElementById('catSeoDesc').value.trim()
                  }
                });
                mm.close();
                await loadAll();
                Admin.toast(isEdit ? 'دسته‌بندی به‌روزرسانی شد' : 'دسته‌بندی افزوده شد');
              }
            }
          ]
        });

        /* تولید خودکار اسلاگ هنگام افزودن */
        if (!isEdit) {
          setTimeout(function () {
            var nameEl = document.getElementById('catName');
            var slugEl = document.getElementById('catSlug');
            nameEl.addEventListener('input', function () {
              if (!slugEl.dataset.touched) slugEl.value = latinize(nameEl.value);
            });
            slugEl.addEventListener('input', function () { slugEl.dataset.touched = '1'; });
          }, 120);
        }
      }

      /* ============================ کالکشن‌ها ========================== */
      function renderCollections() {
        Admin.table({
          mount: '#collectionTable',
          rows: collections,
          rowKey: 'id',
          pageSize: 8,
          searchKeys: ['name'],
          searchPlaceholder: 'جست‌وجوی کالکشن…',
          filters: [{
            key: 'active', label: 'وضعیت',
            options: [{ value: 'yes', label: 'فعال' }, { value: 'no', label: 'غیرفعال' }],
            match: function (row, v) { return v === 'yes' ? row.active : !row.active; }
          }],
          actions: [{
            label: 'افزودن کالکشن', icon: 'plus', variant: 'btn--soft',
            onClick: function () { collectionDialog(); }
          }],
          empty: {
            icon: 'sparkle',
            title: 'کالکشنی ثبت نشده است',
            desc: 'کالکشن‌ها برای کمپین‌های فصلی و مناسبتی استفاده می‌شوند.',
            actionLabel: 'افزودن کالکشن',
            onAction: function () { collectionDialog(); }
          },
          columns: [
            {
              key: 'name', label: 'کالکشن', sortable: true,
              render: function (c) {
                return '<div class="cell-product">' +
                  '<img class="thumb" src="' + c.banner + '" alt="' + Admin.escapeHtml(c.name) + '" loading="lazy" width="46" height="46">' +
                  '<div><b>' + Admin.escapeHtml(c.name) + '</b>' +
                  (c.featuredHome ? '<span class="badge badge--gold" style="margin-top:3px">' +
                    Admin.icon('home') + 'صفحه اصلی</span>' : '') + '</div></div>';
              }
            },
            {
              key: 'productCount', label: 'تعداد محصول', sortable: true, className: 'num',
              render: function (c) { return Admin.badge(Admin.fa(c.productCount) + ' محصول', 'neutral', 'box'); }
            },
            {
              key: 'startDate', label: 'بازه فعال‌بودن', sortable: true,
              render: function (c) {
                return '<span class="num">' + Admin.jShort(c.startDate) + ' تا ' + Admin.jShort(c.endDate) + '</span>' +
                  '<span class="cell-sub">' + rangeState(c) + '</span>';
              }
            },
            {
              key: 'active', label: 'وضعیت', sortable: true,
              render: function (c) {
                return c.active ? Admin.badge('فعال', 'success', 'checkCircle') : Admin.badge('غیرفعال', 'neutral', 'xCircle');
              }
            },
            {
              key: 'actions', label: 'عملیات', className: 'col-actions',
              render: function (c) {
                return '<div class="cell-actions">' +
                  '<button class="act-btn" type="button" data-edit-col="' + c.id + '" aria-label="ویرایش">' +
                  Admin.icon('edit') + '</button>' +
                  '<button class="act-btn act-btn--danger" type="button" data-del-col="' + c.id + '" aria-label="حذف">' +
                  Admin.icon('trash') + '</button></div>';
              }
            }
          ]
        });

        document.getElementById('collectionTable').addEventListener('click', async function (e) {
          var edit = e.target.closest('[data-edit-col]');
          var del = e.target.closest('[data-del-col]');
          if (edit) {
            collectionDialog(collections.filter(function (c) { return c.id === edit.getAttribute('data-edit-col'); })[0]);
          }
          if (del) {
            var col = collections.filter(function (c) { return c.id === del.getAttribute('data-del-col'); })[0];
            var ok = await Admin.confirm({
              title: 'حذف کالکشن', danger: true, icon: 'trash',
              message: 'کالکشن «<b>' + Admin.escapeHtml(col.name) + '</b>» حذف شود؟ محصولات حذف نمی‌شوند و فقط از این کالکشن خارج می‌گردند.',
              confirmLabel: 'حذف کالکشن'
            });
            if (!ok) return;
            await dataService.deleteCollection(col.id);
            await loadAll();
            Admin.toast('کالکشن حذف شد');
          }
        });
      }

      function rangeState(c) {
        var today = dataService.today();
        if (today < c.startDate) return 'شروع نشده';
        if (today > c.endDate) return 'به پایان رسیده';
        return 'در بازه فعال';
      }

      function collectionDialog(col) {
        var isEdit = !!col;
        var data = col || {
          id: '', name: '', banner: HASTI_MOCK.IMG.set,
          startDate: dataService.today(), endDate: '1404-12-29',
          featuredHome: false, active: true, seo: {}
        };

        Admin.modal({
          title: isEdit ? 'ویرایش کالکشن' : 'افزودن کالکشن',
          icon: 'sparkle',
          body:
            '<div class="form-grid">' +
            '<div class="field field--full"><label class="label" for="colName">نام کالکشن <span class="req">*</span></label>' +
            '<input class="input" id="colName" value="' + Admin.escapeHtml(data.name) + '" placeholder="مثال: کالکشن اربعین"></div>' +
            '<div class="field"><label class="label" for="colStart">تاریخ شروع</label>' +
            '<input class="input ltr" id="colStart" value="' + data.startDate + '" placeholder="1403-05-01">' +
            '<span class="hint">تاریخ شمسی با قالب ۱۴۰۳-۰۵-۰۱</span></div>' +
            '<div class="field"><label class="label" for="colEnd">تاریخ پایان</label>' +
            '<input class="input ltr" id="colEnd" value="' + data.endDate + '" placeholder="1403-06-15"></div>' +
            '<div class="field field--full"><label class="label" for="colBanner">آدرس تصویر بنر</label>' +
            '<input class="input ltr" id="colBanner" value="' + Admin.escapeHtml(data.banner) + '"></div>' +
            '<div class="field field--full"><label class="label" for="colSeoTitle">عنوان متا</label>' +
            '<input class="input" id="colSeoTitle" value="' + Admin.escapeHtml(data.seo.title || '') + '"></div>' +
            '<div class="field field--full">' +
            '<label class="switch mb-1"><input type="checkbox" id="colFeatured"' + (data.featuredHome ? ' checked' : '') + '>' +
            '<span class="switch__track"></span><span>نمایش در صفحه اصلی</span></label>' +
            '<label class="switch"><input type="checkbox" id="colActive"' + (data.active ? ' checked' : '') + '>' +
            '<span class="switch__track"></span><span>کالکشن فعال است</span></label>' +
            '</div>' +
            '</div>',
          actions: [
            { label: 'انصراف', variant: 'btn--ghost', onClick: function (m) { m.close(); } },
            {
              label: isEdit ? 'ذخیره تغییرات' : 'افزودن', variant: 'btn--primary',
              onClick: async function (m) {
                var name = document.getElementById('colName').value.trim();
                var start = Admin.toEn(document.getElementById('colStart').value.trim());
                var end = Admin.toEn(document.getElementById('colEnd').value.trim());
                if (!name) { Admin.toast('نام کالکشن الزامی است', 'error'); return; }
                if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) {
                  Admin.toast('تاریخ‌ها باید با قالب ۱۴۰۳-۰۵-۰۱ وارد شوند', 'error');
                  return;
                }
                if (end < start) { Admin.toast('تاریخ پایان نباید پیش از تاریخ شروع باشد', 'error'); return; }

                await dataService.saveCollection({
                  id: isEdit ? data.id : latinize(name) || ('col-' + Date.now()),
                  name: name,
                  banner: document.getElementById('colBanner').value.trim(),
                  startDate: start, endDate: end,
                  featuredHome: document.getElementById('colFeatured').checked,
                  active: document.getElementById('colActive').checked,
                  seo: { title: document.getElementById('colSeoTitle').value.trim(), description: data.seo.description || '' }
                });
                m.close();
                await loadAll();
                Admin.toast(isEdit ? 'کالکشن به‌روزرسانی شد' : 'کالکشن افزوده شد');
              }
            }
          ]
        });
      }

      /* ============================= جنس پارچه ========================= */
      function renderFabrics() {
        var mount = document.getElementById('fabricChips');
        mount.innerHTML = fabrics.map(function (f) {
          return '<span class="chip chip--removable">' + Admin.icon('ruler') +
            Admin.escapeHtml(f.name) +
            '<span class="text-xs" style="opacity:.7">(' + Admin.fa(f.productCount) + ')</span>' +
            '</span>';
        }).join('') +
          '<button class="chip" type="button" id="addFabricChip">' + Admin.icon('plus') + 'افزودن پارچه</button>';

        document.getElementById('addFabricChip').addEventListener('click', fabricDialog);
      }

      function fabricDialog() {
        Admin.modal({
          title: 'افزودن جنس پارچه',
          icon: 'ruler',
          body:
            '<div class="field"><label class="label" for="fabricName">نام پارچه <span class="req">*</span></label>' +
            '<input class="input" id="fabricName" placeholder="مثال: کرپ حریر">' +
            '<span class="hint">این مقدار در فرم محصول و فیلترهای فروشگاه قابل استفاده خواهد بود.</span></div>' +
            '<div class="notice notice--warning mt-2">' + Admin.icon('alert') +
            '<span><b>نیازمند بک‌اند</b>افزودن دائمی تاکسونومی نیازمند ذخیره‌سازی سمت سرور است.</span></div>',
          actions: [
            { label: 'انصراف', variant: 'btn--ghost', onClick: function (m) { m.close(); } },
            {
              label: 'افزودن', variant: 'btn--primary', onClick: function (m) {
                var name = document.getElementById('fabricName').value.trim();
                if (!name) { Admin.toast('نام پارچه الزامی است', 'error'); return; }
                HASTI_MOCK.FABRICS.push({ id: latinize(name), name: name, productCount: 0 });
                m.close();
                loadAll();
                Admin.toast('پارچه «' + name + '» افزوده شد');
              }
            }
          ]
        });
      }

      /* تبدیل نام فارسی به اسلاگ لاتین */
      function latinize(text) {
        var map = { 'ا': 'a', 'آ': 'a', 'ب': 'b', 'پ': 'p', 'ت': 't', 'ث': 's', 'ج': 'j', 'چ': 'ch', 'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'z', 'ر': 'r', 'ز': 'z', 'ژ': 'zh', 'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'z', 'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'gh', 'ک': 'k', 'گ': 'g', 'ل': 'l', 'م': 'm', 'ن': 'n', 'و': 'v', 'ه': 'h', 'ی': 'y' };
        return String(text).trim().split('').map(function (ch) {
          if (map[ch]) return map[ch];
          if (/[a-zA-Z0-9]/.test(ch)) return ch.toLowerCase();
          if (/\s/.test(ch)) return '-';
          return '';
        }).join('').replace(/-+/g, '-').replace(/^-|-$/g, '');
      }
    
}
