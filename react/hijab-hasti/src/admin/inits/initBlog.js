import { Admin } from '../adminShared.js';
import { dataService } from '../data/dataService.js';
import { HASTI_MOCK } from '../data/mockData.js';

export async function initBlog() {


      var posts = [], blogCategories = [];
      var tableApi = null;

      (async function init() {
        await Admin.shell("blog");
        Admin.tableSkeleton('#postTable', 6);

        var res = await Promise.all([
          dataService.getBlogPosts(),
          dataService.getBlogCategories()
        ]);
        posts = res[0];
        blogCategories = res[1];

        renderKpis();
        buildTable();
        renderCategories();
        renderTopPosts();

        document.getElementById('addCategoryBtn').addEventListener('click', function () {
          categoryDialog();
        });
      })();

      /* ============================== KPI ها ============================ */
      function renderKpis() {
        var published = posts.filter(function (p) { return p.status === 'published'; }).length;
        var scheduled = posts.filter(function (p) { return p.status === 'scheduled'; }).length;
        var totalViews = posts.reduce(function (s, p) { return s + p.views; }, 0);
        var best = posts.slice().sort(function (a, b) { return b.views - a.views; })[0];

        var cards = [
          { label: 'مقالات منتشرشده', value: Admin.fa(published), unit: 'مقاله', icon: 'article', tone: 'success', note: Admin.fa(scheduled) + ' مقاله زمان‌بندی‌شده' },
          { label: 'مجموع بازدید', value: Admin.fa(totalViews), unit: 'بازدید', icon: 'eye', tone: 'info' },
          { label: 'میانگین بازدید هر مقاله', value: Admin.fa(Math.round(totalViews / posts.length)), unit: 'بازدید', icon: 'chart', tone: '' },
          { label: 'پربازدیدترین', value: best ? Admin.fa(best.views) : '۰', unit: 'بازدید', icon: 'trendUp', tone: 'warning', note: best ? best.title : '' }
        ];

        document.getElementById('blogKpis').innerHTML = cards.map(function (c, i) {
          return '<article class="kpi reveal" style="animation-delay:' + (i * 50) + 'ms">' +
            '<div class="kpi__top"><span class="kpi__label">' + Admin.escapeHtml(c.label) + '</span>' +
            '<span class="kpi__icon' + (c.tone ? ' kpi__icon--' + c.tone : '') + '">' + Admin.icon(c.icon) + '</span></div>' +
            '<div class="kpi__value">' + c.value + '<small>' + c.unit + '</small></div>' +
            (c.note ? '<div class="kpi__foot"><span>' + Admin.escapeHtml(c.note) + '</span></div>' : '') +
            '</article>';
        }).join('');
      }

      /* =============================== جدول ============================ */
      function buildTable() {
        tableApi = Admin.table({
          mount: '#postTable',
          rows: posts,
          rowKey: 'id',
          pageSize: 8,
          selectable: true,
          searchKeys: ['title', 'slug', 'author'],
          searchPlaceholder: 'جست‌وجو با عنوان، اسلاگ یا نویسنده…',
          defaultSort: { key: 'publishDate', dir: 'desc' },
          filters: [
            {
              key: 'categoryId', label: 'دسته مقاله',
              options: blogCategories.map(function (c) { return { value: c.id, label: c.name }; })
            },
            {
              key: 'status', label: 'وضعیت',
              options: [
                { value: 'published', label: 'منتشرشده' },
                { value: 'draft', label: 'پیش‌نویس' },
                { value: 'scheduled', label: 'زمان‌بندی‌شده' }
              ]
            },
            {
              key: 'author', label: 'نویسنده',
              options: uniqueAuthors()
            }
          ],
          bulkActions: [
            { label: 'انتشار', icon: 'checkCircle', variant: 'btn--soft', onClick: function (ids) { bulkStatus(ids, 'published'); } },
            { label: 'پیش‌نویس', icon: 'edit', variant: 'btn--soft', onClick: function (ids) { bulkStatus(ids, 'draft'); } },
            { label: 'حذف', icon: 'trash', variant: 'btn--danger-ghost', onClick: bulkDelete }
          ],
          empty: {
            icon: 'article',
            title: 'مقاله‌ای ثبت نشده است',
            desc: 'با نوشتن مقالات راهنمای خرید، ترافیک ارگانیک فروشگاه را افزایش دهید.',
            actionLabel: 'نوشتن مقاله',
            onAction: function () { window.location.href = '/admin/blog/new'; }
          },
          columns: [
            {
              key: 'title', label: 'مقاله', sortable: true,
              render: function (p) {
                return '<div class="cell-product">' +
                  '<img class="thumb" src="' + p.cover + '" alt="' + Admin.escapeHtml(p.title) +
                  '" loading="lazy" width="46" height="46">' +
                  '<div><b>' + Admin.escapeHtml(p.title) + '</b>' +
                  '<small class="ltr">' + Admin.escapeHtml(p.slug) + '</small></div></div>';
              }
            },
            { key: 'categoryName', label: 'دسته', sortable: true },
            { key: 'author', label: 'نویسنده', sortable: true },
            {
              key: 'publishDate', label: 'تاریخ انتشار', sortable: true,
              render: function (p) { return Admin.jShort(p.publishDate); }
            },
            {
              key: 'views', label: 'بازدید', sortable: true, className: 'num',
              render: function (p) { return '<b>' + Admin.fa(p.views) + '</b>'; }
            },
            {
              key: 'tags', label: 'برچسب‌ها',
              render: function (p) {
                if (!p.tags.length) return '<span class="text-soft">—</span>';
                return p.tags.slice(0, 2).map(function (t) {
                  return '<span class="badge badge--neutral" style="margin:1px">' + Admin.escapeHtml(t) + '</span>';
                }).join('') + (p.tags.length > 2 ? '<span class="cell-sub">+' +
                  Admin.fa(p.tags.length - 2) + '</span>' : '');
              }
            },
            {
              key: 'status', label: 'وضعیت', sortable: true,
              render: function (p) {
                var map = { published: 'approved', draft: 'inactive', scheduled: 'scheduled' };
                var labels = { published: 'منتشرشده', draft: 'پیش‌نویس', scheduled: 'زمان‌بندی‌شده' };
                var tone = { published: 'success', draft: 'neutral', scheduled: 'info' };
                var icons = { published: 'checkCircle', draft: 'edit', scheduled: 'calendar' };
                return Admin.badge(labels[p.status] || p.status, tone[p.status], icons[p.status]);
              }
            },
            {
              key: 'actions', label: 'عملیات', className: 'col-actions',
              render: function (p) {
                return '<div class="cell-actions">' +
                  '<a class="act-btn" href="/admin/blog/' + encodeURIComponent(p.id) + '" ' +
                  'title="ویرایش" aria-label="ویرایش ' + Admin.escapeHtml(p.title) + '">' + Admin.icon('edit') + '</a>' +
                  '<button class="act-btn" type="button" data-preview="' + p.id + '" ' +
                  'title="پیش‌نمایش" aria-label="پیش‌نمایش مقاله">' + Admin.icon('eye') + '</button>' +
                  '<button class="act-btn act-btn--danger" type="button" data-delete="' + p.id + '" ' +
                  'title="حذف" aria-label="حذف مقاله">' + Admin.icon('trash') + '</button></div>';
              }
            }
          ]
        });

        document.getElementById('postTable').addEventListener('click', async function (e) {
          var preview = e.target.closest('[data-preview]');
          var del = e.target.closest('[data-delete]');

          if (preview) {
            var post = find(preview.getAttribute('data-preview'));
            Admin.modal({
              title: post.title,
              subtitle: post.categoryName + ' · ' + Admin.jDate(post.publishDate) + ' · ' + post.author,
              wide: true,
              body: '<img src="' + post.cover + '" alt="" loading="lazy" ' +
                'style="width:100%;border-radius:var(--r-md);margin-bottom:14px">' +
                '<p class="text-sm" style="font-weight:700;margin-bottom:10px">' +
                Admin.escapeHtml(post.excerpt) + '</p>' +
                '<div class="text-sm">' + post.content + '</div>',
              actions: [
                {
                  label: 'ویرایش مقاله', variant: 'btn--primary', onClick: function () {
                    window.location.href = '/admin/blog/' + encodeURIComponent(post.id);
                  }
                },
                { label: 'بستن', variant: 'btn--ghost', onClick: function (m) { m.close(); } }
              ]
            });
          }

          if (del) {
            var target = find(del.getAttribute('data-delete'));
            var ok = await Admin.confirm({
              title: 'حذف مقاله', danger: true, icon: 'trash',
              message: 'مقاله «<b>' + Admin.escapeHtml(target.title) + '</b>» حذف شود؟',
              confirmLabel: 'حذف مقاله'
            });
            if (!ok) return;
            await dataService.deleteBlogPost(target.id);
            await reload();
            Admin.toast('مقاله حذف شد');
          }
        });
      }

      function find(id) {
        return posts.filter(function (p) { return p.id === id; })[0];
      }

      function uniqueAuthors() {
        var seen = {};
        posts.forEach(function (p) { seen[p.author] = true; });
        return Object.keys(seen).map(function (a) { return { value: a, label: a }; });
      }

      async function bulkStatus(ids, status) {
        await Promise.all(ids.map(function (id) {
          return dataService.saveBlogPost({ id: id, status: status });
        }));
        await reload();
        Admin.toast('وضعیت ' + Admin.fa(ids.length) + ' مقاله به‌روزرسانی شد');
      }

      async function bulkDelete(ids) {
        var ok = await Admin.confirm({
          title: 'حذف گروهی مقالات', danger: true, icon: 'trash',
          message: '<b>' + Admin.fa(ids.length) + '</b> مقاله انتخاب‌شده حذف شوند؟',
          confirmLabel: 'حذف'
        });
        if (!ok) return;
        await Promise.all(ids.map(function (id) {
          return dataService.deleteBlogPost(id);
        }));
        await reload();
        Admin.toast(Admin.fa(ids.length) + ' مقاله حذف شد');
      }

      async function reload() {
        posts = await dataService.getBlogPosts();
        blogCategories = await dataService.getBlogCategories();
        renderKpis();
        tableApi.setRows(posts);
        renderCategories();
        renderTopPosts();
      }

      /* =========================== دسته‌بندی مقالات ===================== */
      function renderCategories() {
        var box = document.getElementById('categoryList');
        var counts = {};
        posts.forEach(function (p) {
          counts[p.categoryId] = (counts[p.categoryId] || 0) + 1;
        });

        box.innerHTML = blogCategories.map(function (c) {
          return '<div class="row row--between" style="padding:9px 0;border-bottom:1px solid var(--border)">' +
            '<div><b class="text-sm">' + Admin.escapeHtml(c.name) + '</b>' +
            '<div class="text-xs text-soft ltr">' + Admin.escapeHtml(c.slug) + '</div></div>' +
            '<div class="row row--tight">' +
            Admin.badge(Admin.fa(counts[c.id] || 0) + ' مقاله', 'neutral', 'article') +
            '<button class="act-btn" type="button" data-edit-cat="' + c.id + '" aria-label="ویرایش دسته">' +
            Admin.icon('edit') + '</button></div></div>';
        }).join('');

        box.querySelectorAll('[data-edit-cat]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            categoryDialog(blogCategories.filter(function (c) {
              return c.id === btn.getAttribute('data-edit-cat');
            })[0]);
          });
        });
      }

      function categoryDialog(cat) {
        var isEdit = !!cat;
        var data = cat || { id: '', name: '', slug: '' };

        Admin.modal({
          title: isEdit ? 'ویرایش دسته مقاله' : 'افزودن دسته مقاله',
          icon: 'layers',
          body:
            '<div class="field mb-2"><label class="label" for="bcName">نام دسته <span class="req">*</span></label>' +
            '<input class="input" id="bcName" value="' + Admin.escapeHtml(data.name) + '" ' +
            'placeholder="مثال: راهنمای خرید"></div>' +
            '<div class="field"><label class="label" for="bcSlug">اسلاگ <span class="req">*</span></label>' +
            '<input class="input ltr" id="bcSlug" value="' + Admin.escapeHtml(data.slug) + '" ' +
            'placeholder="buying-guide"></div>',
          actions: [
            { label: 'انصراف', variant: 'btn--ghost', onClick: function (m) { m.close(); } },
            {
              label: isEdit ? 'ذخیره' : 'افزودن', variant: 'btn--primary',
              onClick: async function (m) {
                var name = document.getElementById('bcName').value.trim();
                var slug = document.getElementById('bcSlug').value.trim();
                if (!name || !slug) { Admin.toast('نام و اسلاگ الزامی هستند', 'error'); return; }
                if (!/^[a-z0-9-]+$/.test(slug)) {
                  Admin.toast('اسلاگ فقط می‌تواند حروف انگلیسی کوچک، عدد و خط تیره باشد', 'error');
                  return;
                }
                await dataService.saveBlogCategory({
                  id: data.id || undefined, name: name, slug: slug
                });
                m.close();
                await reload();
                Admin.toast(isEdit ? 'دسته به‌روزرسانی شد' : 'دسته افزوده شد');
              }
            }
          ]
        });
      }

      /* ========================== پربازدیدترین‌ها ====================== */
      function renderTopPosts() {
        var top = posts.slice().sort(function (a, b) { return b.views - a.views; }).slice(0, 5);
        document.getElementById('topPosts').innerHTML = top.map(function (p, i) {
          return '<a class="rank-item" href="/admin/blog/' + encodeURIComponent(p.id) + '">' +
            '<span class="rank-item__no">' + Admin.fa(i + 1) + '</span>' +
            '<span class="rank-item__main"><b>' + Admin.escapeHtml(p.title) + '</b>' +
            '<small>' + Admin.escapeHtml(p.categoryName) + '</small></span>' +
            '<span class="rank-item__val"><b>' + Admin.fa(p.views) + '</b><small>بازدید</small></span></a>';
        }).join('');
      }
    
}
