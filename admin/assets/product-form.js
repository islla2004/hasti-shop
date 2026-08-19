    (function () {
      "use strict";

      var SIZE_OPTIONS = ['یک‌سایز', 'S', 'M', 'L', 'XL'];
      var LENGTH_OPTIONS = [130, 135, 140, 145, 155, 160, 165, 170];

      var state = {
        id: null,
        sizes: [],
        lengths: [],
        colors: [],
        collections: [],
        images: [],
        variants: [],
        features: [],
        care: []
      };

      var categories = [], collections = [], fabrics = [], colorPresets = [], allProducts = [];
      var form = document.getElementById('productForm');
      var isEdit = false;

      (async function init() {
        await Admin.shell('products');

        var res = await Promise.all([
          dataService.getCategories(),
          dataService.getCollections(),
          dataService.getFabrics(),
          dataService.getProducts()
        ]);
        categories = res[0];
        collections = res[1];
        fabrics = res[2];
        allProducts = res[3];
        colorPresets = HASTI_MOCK.COLOR_PRESETS;

        fillSelects();
        renderChips();
        bindEvents();

        var id = Admin.param('id');
        if (id) {
          var product = await dataService.getProduct(id);
          if (product) {
            isEdit = true;
            fillForm(product);
          } else {
            Admin.toast('محصول یافت نشد', 'error');
          }
        }
        renderHeadActions();
        renderImages();
        renderVariants();
        renderFeatureList();
        renderCareList();
        updatePriceCalc();
        updateRelatedHint();
      })();

      /* ============================ پر کردن گزینه‌ها ===================== */
      function fillSelects() {
        document.getElementById('category').innerHTML =
          '<option value="">انتخاب کنید…</option>' +
          categories.map(function (c) {
            return '<option value="' + c.id + '">' + Admin.escapeHtml(c.name) + '</option>';
          }).join('');

        document.getElementById('fabricList').innerHTML =
          fabrics.map(function (f) { return '<option value="' + Admin.escapeHtml(f.name) + '">'; }).join('');

        document.getElementById('relatedSelect').innerHTML =
          allProducts.map(function (p) {
            return '<option value="' + p.id + '">' + Admin.escapeHtml(p.name) + '</option>';
          }).join('');
      }

      /* ============================== چیپ‌ها ============================ */
      function renderChips() {
        renderChipGroup('sizeChips', SIZE_OPTIONS, state.sizes, function (v) { return v; });
        renderChipGroup('lengthChips', LENGTH_OPTIONS, state.lengths, function (v) { return Admin.fa(v); });
        renderChipGroup('collectionChips', collections.map(function (c) { return c.id; }), state.collections,
          function (id) {
            var c = collections.filter(function (x) { return x.id === id; })[0];
            return c ? c.name : id;
          });
        renderColorChips();
      }

      function renderChipGroup(mountId, options, selected, labelFn) {
        var mount = document.getElementById(mountId);
        mount.innerHTML = options.map(function (opt) {
          var active = selected.indexOf(opt) !== -1;
          return '<button type="button" class="chip' + (active ? ' chip--active' : '') + '" ' +
            'data-value="' + Admin.escapeHtml(String(opt)) + '" aria-pressed="' + active + '">' +
            (active ? Admin.icon('check') : '') + Admin.escapeHtml(labelFn(opt)) + '</button>';
        }).join('');

        mount.querySelectorAll('.chip').forEach(function (chip) {
          chip.addEventListener('click', function () {
            var raw = chip.getAttribute('data-value');
            var value = mountId === 'lengthChips' ? Number(raw) : raw;
            var idx = selected.indexOf(value);
            if (idx === -1) selected.push(value);
            else selected.splice(idx, 1);
            renderChipGroup(mountId, options, selected, labelFn);
            markDirty();
          });
        });
      }

      function renderColorChips() {
        var mount = document.getElementById('colorChips');
        mount.innerHTML = colorPresets.map(function (c) {
          var active = state.colors.some(function (x) { return x.name === c.name; });
          return '<button type="button" class="chip' + (active ? ' chip--active' : '') + '" ' +
            'data-color="' + Admin.escapeHtml(c.name) + '" aria-pressed="' + active + '">' +
            '<span class="swatch swatch--sm" style="background:' + c.hex + '"></span>' +
            Admin.escapeHtml(c.name) + '</button>';
        }).join('');

        mount.querySelectorAll('.chip').forEach(function (chip) {
          chip.addEventListener('click', function () {
            var name = chip.getAttribute('data-color');
            var preset = colorPresets.filter(function (c) { return c.name === name; })[0];
            var idx = state.colors.findIndex(function (c) { return c.name === name; });
            if (idx === -1) state.colors.push({ name: preset.name, hex: preset.hex, images: [] });
            else state.colors.splice(idx, 1);
            renderColorChips();
            markDirty();
          });
        });
      }

      /* ========================= جدول تنوع و موجودی ===================== */
      function buildVariantCombinations() {
        var sizes = state.sizes.length ? state.sizes : ['یک‌سایز'];
        var lengths = state.lengths.length ? state.lengths : [null];
        var colors = state.colors.length ? state.colors.map(function (c) { return c.name; }) : ['مشکی'];
        var out = [];

        sizes.forEach(function (size) {
          lengths.forEach(function (length) {
            colors.forEach(function (color) {
              /* حفظ موجودی و بارکد قبلی در صورت وجود همان ترکیب */
              var existing = state.variants.filter(function (v) {
                return v.size === size && v.length === length && v.color === color;
              })[0];
              out.push({
                size: size, length: length, color: color,
                stock: existing ? existing.stock : 0,
                barcode: existing ? existing.barcode : ''
              });
            });
          });
        });
        return out;
      }

      function renderVariants() {
        var tbody = document.querySelector('#variantTable tbody');
        var emptyBox = document.getElementById('variantEmpty');
        emptyBox.innerHTML = '';

        if (!state.variants.length) {
          document.getElementById('variantTable').hidden = true;
          emptyBox.appendChild(Admin.emptyState({
            icon: 'boxOpen',
            title: 'هنوز تنوعی تعریف نشده است',
            desc: 'ابتدا سایز، قد و رنگ را انتخاب کنید و سپس جدول موجودی را بسازید.',
            actionLabel: 'ساخت جدول تنوع',
            actionIcon: 'refresh',
            onAction: function () {
              state.variants = buildVariantCombinations();
              renderVariants();
              markDirty();
            }
          }));
          return;
        }

        document.getElementById('variantTable').hidden = false;
        tbody.innerHTML = state.variants.map(function (v, i) {
          return '<tr>' +
            '<td data-label="سایز">' + Admin.escapeHtml(v.size) + '</td>' +
            '<td data-label="قد">' + (v.length ? Admin.fa(v.length) : '—') + '</td>' +
            '<td data-label="رنگ"><span class="row row--tight">' +
            '<span class="swatch swatch--sm" style="background:' + colorHex(v.color) + '"></span>' +
            Admin.escapeHtml(v.color) + '</span></td>' +
            '<td data-label="موجودی"><input class="input num" type="number" min="0" value="' + v.stock +
            '" data-variant-stock="' + i + '" style="min-height:38px;padding:6px 10px;max-width:100px" ' +
            'aria-label="موجودی تنوع ' + Admin.escapeHtml(v.size + ' ' + v.color) + '"></td>' +
            '<td data-label="بارکد"><input class="input ltr" type="text" value="' + Admin.escapeHtml(v.barcode) +
            '" data-variant-barcode="' + i + '" style="min-height:38px;padding:6px 10px;max-width:170px" ' +
            'placeholder="بارکد" aria-label="بارکد تنوع"></td>' +
            '<td class="col-actions"><button class="act-btn act-btn--danger" type="button" ' +
            'data-variant-remove="' + i + '" aria-label="حذف تنوع">' + Admin.icon('trash') + '</button></td>' +
            '</tr>';
        }).join('');

        tbody.querySelectorAll('[data-variant-stock]').forEach(function (input) {
          input.addEventListener('change', function () {
            state.variants[Number(input.getAttribute('data-variant-stock'))].stock =
              Math.max(0, Number(Admin.toEn(input.value)) || 0);
            markDirty();
          });
        });

        tbody.querySelectorAll('[data-variant-barcode]').forEach(function (input) {
          input.addEventListener('change', function () {
            state.variants[Number(input.getAttribute('data-variant-barcode'))].barcode = input.value.trim();
            markDirty();
          });
        });

        tbody.querySelectorAll('[data-variant-remove]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            state.variants.splice(Number(btn.getAttribute('data-variant-remove')), 1);
            renderVariants();
            markDirty();
          });
        });
      }

      function colorHex(name) {
        var preset = colorPresets.filter(function (c) { return c.name === name; })[0];
        return preset ? preset.hex : '#cccccc';
      }

      /* ============================== تصاویر =========================== */
      function renderImages() {
        var mount = document.getElementById('imageList');
        if (!state.images.length) {
          mount.innerHTML = '<div class="empty" style="margin:0;grid-column:1/-1;padding:36px 20px">' +
            Admin.icon('image') + '<h3>تصویری افزوده نشده</h3>' +
            '<p>حداقل یک تصویر برای نمایش محصول لازم است.</p></div>';
          return;
        }

        mount.innerHTML = state.images.map(function (src, i) {
          return '<div class="card" draggable="true" data-image-index="' + i + '" ' +
            'style="overflow:hidden;box-shadow:var(--shadow-sm);cursor:grab;position:relative">' +
            '<img src="' + Admin.escapeHtml(src) + '" alt="تصویر ' + Admin.fa(i + 1) + ' محصول" loading="lazy" ' +
            'style="width:100%;aspect-ratio:1;object-fit:cover">' +
            '<div class="row row--between" style="padding:7px 9px">' +
            '<span class="badge badge--' + (i === 0 ? 'gold' : (i === 1 ? 'info' : 'neutral')) + '">' +
            (i === 0 ? 'اصلی' : (i === 1 ? 'هاور' : Admin.fa(i + 1))) + '</span>' +
            '<button class="act-btn act-btn--danger" type="button" data-image-remove="' + i + '" ' +
            'aria-label="حذف تصویر ' + Admin.fa(i + 1) + '">' + Admin.icon('trash') + '</button>' +
            '</div></div>';
        }).join('');

        mount.querySelectorAll('[data-image-remove]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            state.images.splice(Number(btn.getAttribute('data-image-remove')), 1);
            renderImages();
            markDirty();
          });
        });

        /* کشیدن و رها کردن برای تغییر ترتیب */
        var dragIndex = null;
        mount.querySelectorAll('[data-image-index]').forEach(function (card) {
          card.addEventListener('dragstart', function () {
            dragIndex = Number(card.getAttribute('data-image-index'));
            card.style.opacity = '.4';
          });
          card.addEventListener('dragend', function () { card.style.opacity = '1'; });
          card.addEventListener('dragover', function (e) { e.preventDefault(); });
          card.addEventListener('drop', function (e) {
            e.preventDefault();
            var dropIndex = Number(card.getAttribute('data-image-index'));
            if (dragIndex === null || dragIndex === dropIndex) return;
            var moved = state.images.splice(dragIndex, 1)[0];
            state.images.splice(dropIndex, 0, moved);
            renderImages();
            markDirty();
          });
        });
      }

      /* ==================== فهرست ویژگی‌ها و نگهداری ==================== */
      function renderListField(mountId, arr, placeholder) {
        var mount = document.getElementById(mountId);
        mount.innerHTML = arr.map(function (text, i) {
          return '<div class="row row--tight">' +
            '<input class="input" type="text" value="' + Admin.escapeHtml(text) + '" data-list-item="' + i + '" ' +
            'placeholder="' + placeholder + '" style="flex:1">' +
            '<button class="act-btn act-btn--danger" type="button" data-list-remove="' + i + '" ' +
            'aria-label="حذف مورد ' + Admin.fa(i + 1) + '">' + Admin.icon('trash') + '</button>' +
            '</div>';
        }).join('');

        mount.querySelectorAll('[data-list-item]').forEach(function (input) {
          input.addEventListener('change', function () {
            arr[Number(input.getAttribute('data-list-item'))] = input.value;
            markDirty();
          });
        });
        mount.querySelectorAll('[data-list-remove]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            arr.splice(Number(btn.getAttribute('data-list-remove')), 1);
            renderListField(mountId, arr, placeholder);
            markDirty();
          });
        });
      }

      function renderFeatureList() {
        renderListField('featureList', state.features, 'مثال: دوخت کاملاً دست‌ساز');
      }

      function renderCareList() {
        renderListField('careList', state.care, 'مثال: شست‌وشو با دست و آب سرد');
      }

      /* ====================== محاسبه خودکار قیمت ======================= */
      function updatePriceCalc() {
        var oldPrice = parseMoney(document.getElementById('oldPrice').value);
        var discount = Number(Admin.toEn(document.getElementById('discount').value)) || 0;
        var cost = parseMoney(document.getElementById('costPrice').value);

        /* همان فرمول موجود در کد فعلی storefront */
        var finalPrice = Math.round(oldPrice - (oldPrice * discount / 100));
        var profit = finalPrice - cost;
        var margin = finalPrice ? Math.round(profit / finalPrice * 100) : 0;

        document.getElementById('priceCalc').innerHTML =
          Admin.icon('banknote') +
          '<span><b>قیمت نهایی برای مشتری: ' + Admin.money(finalPrice) + '</b>' +
          (cost ? 'سود هر فروش: ' + Admin.money(profit) + ' — حاشیه سود ' + Admin.percent(margin)
            : 'برای محاسبه سود، بهای تمام‌شده را وارد کنید.') +
          '</span>';
      }

      function parseMoney(value) {
        return Number(Admin.toEn(String(value || '')).replace(/[^\d]/g, '')) || 0;
      }

      /* جداکننده هزارگان زنده روی ورودی‌های مبلغ */
      function bindMoneyInput(input) {
        input.addEventListener('input', function () {
          var raw = parseMoney(input.value);
          input.value = raw ? Admin.fa(Admin.price(raw)) : '';
          updatePriceCalc();
          markDirty();
        });
      }

      /* ============================== رویدادها ========================= */
      function bindEvents() {
        bindMoneyInput(document.getElementById('oldPrice'));
        bindMoneyInput(document.getElementById('costPrice'));
        document.getElementById('discount').addEventListener('input', function () {
          updatePriceCalc();
          markDirty();
        });

        /* تولید خودکار اسلاگ از نام */
        var nameInput = document.getElementById('name');
        var slugInput = document.getElementById('slug');
        nameInput.addEventListener('input', function () {
          if (!isEdit && !slugInput.dataset.touched) {
            slugInput.value = slugify(nameInput.value);
          }
          if (!document.getElementById('seoTitle').dataset.touched) {
            document.getElementById('seoTitle').value = nameInput.value ? nameInput.value + ' | هستی' : '';
          }
          markDirty();
        });
        slugInput.addEventListener('input', function () { slugInput.dataset.touched = '1'; markDirty(); });
        document.getElementById('seoTitle').addEventListener('input', function () {
          this.dataset.touched = '1';
          updateCharCount();
        });
        document.getElementById('seoDescription').addEventListener('input', updateCharCount);

        /* بارکد */
        document.getElementById('genBarcode').addEventListener('click', function () {
          document.getElementById('barcode').value = '89' + String(Date.now()).slice(-11);
          markDirty();
        });
        document.getElementById('printBarcode').addEventListener('click', printBarcode);

        /* بازسازی جدول تنوع */
        document.getElementById('rebuildVariants').addEventListener('click', function () {
          state.variants = buildVariantCombinations();
          renderVariants();
          markDirty();
          Admin.toast(Admin.fa(state.variants.length) + ' تنوع ساخته شد');
        });

        /* افزودن تصویر */
        document.getElementById('addImage').addEventListener('click', addImageDialog);

        /* افزودن ویژگی و نکته نگهداری */
        document.getElementById('addFeature').addEventListener('click', function () {
          state.features.push('');
          renderFeatureList();
          var inputs = document.querySelectorAll('#featureList input');
          if (inputs.length) inputs[inputs.length - 1].focus();
        });
        document.getElementById('addCare').addEventListener('click', function () {
          state.care.push('');
          renderCareList();
          var inputs = document.querySelectorAll('#careList input');
          if (inputs.length) inputs[inputs.length - 1].focus();
        });

        /* محصولات مرتبط */
        document.getElementById('autoRelated').addEventListener('change', function () {
          document.getElementById('relatedManual').hidden = this.checked;
          updateRelatedHint();
        });
        document.getElementById('category').addEventListener('change', function () {
          updateRelatedHint();
          markDirty();
        });

        /* اعتبارسنجی روی blur */
        ['name', 'slug', 'code', 'oldPrice'].forEach(function (id) {
          var field = document.getElementById(id);
          field.addEventListener('blur', function () {
            if (!field.value.trim()) {
              Admin.setFieldError(field, 'این فیلد الزامی است.');
            } else {
              Admin.clearFieldError(field);
            }
          });
        });

        form.addEventListener('submit', function (e) {
          e.preventDefault();
          save(document.getElementById('status').value);
        });

        document.getElementById('saveDraft').addEventListener('click', function () {
          document.getElementById('status').value = 'draft';
          save('draft');
        });

        /* هشدار خروج با تغییرات ذخیره‌نشده */
        window.addEventListener('beforeunload', function (e) {
          if (form.dataset.dirty === '1') {
            e.preventDefault();
            e.returnValue = '';
          }
        });
      }

      function slugify(text) {
        var map = { 'ا': 'a', 'آ': 'a', 'ب': 'b', 'پ': 'p', 'ت': 't', 'ث': 's', 'ج': 'j', 'چ': 'ch', 'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'z', 'ر': 'r', 'ز': 'z', 'ژ': 'zh', 'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'z', 'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'gh', 'ک': 'k', 'گ': 'g', 'ل': 'l', 'م': 'm', 'ن': 'n', 'و': 'v', 'ه': 'h', 'ی': 'y' };
        return String(text).trim().split('').map(function (ch) {
          if (map[ch]) return map[ch];
          if (/[a-zA-Z0-9]/.test(ch)) return ch.toLowerCase();
          if (/\s/.test(ch)) return '-';
          return '';
        }).join('').replace(/-+/g, '-').replace(/^-|-$/g, '');
      }

      function updateCharCount() {
        var title = document.getElementById('seoTitle');
        var desc = document.getElementById('seoDescription');
        document.getElementById('seoTitleCount').textContent =
          Admin.fa(title.value.length) + ' از ۷۰ کاراکتر';
        document.getElementById('seoDescCount').textContent =
          Admin.fa(desc.value.length) + ' از ۱۶۰ کاراکتر';
      }

      function updateRelatedHint() {
        var auto = document.getElementById('autoRelated').checked;
        var catId = document.getElementById('category').value;
        var cat = categories.filter(function (c) { return c.id === catId; })[0];
        document.getElementById('relatedHint').textContent = auto
          ? (cat ? 'محصولات هم‌دسته «' + cat.name + '» به‌صورت خودکار نمایش داده می‌شوند.'
            : 'ابتدا دسته‌بندی را انتخاب کنید.')
          : 'محصولات انتخاب‌شده جایگزین انتخاب خودکار می‌شوند.';
      }

      function addImageDialog() {
        var available = Object.keys(HASTI_MOCK.IMG).map(function (k) { return HASTI_MOCK.IMG[k]; });
        Admin.modal({
          title: 'افزودن تصویر',
          icon: 'image',
          wide: true,
          body:
            '<div class="notice notice--info mb-2">' + Admin.icon('info') +
            '<span><b>نیازمند بک‌اند</b>بارگذاری فایل نیازمند سرویس ذخیره‌سازی سمت سرور است. ' +
            'در این فاز می‌توانید از تصاویر موجود پروژه انتخاب کنید یا آدرس تصویر را وارد کنید.</span></div>' +
            '<div class="field mb-2"><label class="label" for="imgUrl">آدرس تصویر</label>' +
            '<input class="input ltr" type="text" id="imgUrl" placeholder="../04.webp"></div>' +
            '<span class="label">یا از تصاویر موجود انتخاب کنید</span>' +
            '<div class="grid mt-1" style="grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:10px">' +
            available.map(function (src) {
              return '<button type="button" data-pick="' + Admin.escapeHtml(src) + '" ' +
                'style="border:2px solid transparent;border-radius:var(--r-sm);overflow:hidden;padding:0" ' +
                'aria-label="انتخاب تصویر">' +
                '<img src="' + src + '" alt="" loading="lazy" style="width:100%;aspect-ratio:1;object-fit:cover">' +
                '</button>';
            }).join('') +
            '</div>',
          actions: [
            { label: 'انصراف', variant: 'btn--ghost', onClick: function (m) { m.close(); } },
            {
              label: 'افزودن از آدرس', variant: 'btn--primary', onClick: function (m) {
                var url = document.getElementById('imgUrl').value.trim();
                if (!url) { Admin.toast('آدرس تصویر را وارد کنید', 'error'); return; }
                state.images.push(url);
                renderImages();
                markDirty();
                m.close();
              }
            }
          ]
        });

        setTimeout(function () {
          document.querySelectorAll('[data-pick]').forEach(function (btn) {
            btn.addEventListener('click', function () {
              state.images.push(btn.getAttribute('data-pick'));
              renderImages();
              markDirty();
              btn.style.borderColor = 'var(--c-tan)';
              Admin.toast('تصویر افزوده شد');
            });
          });
        }, 150);
      }

      function printBarcode() {
        var code = document.getElementById('barcode').value.trim();
        var name = document.getElementById('name').value.trim();
        if (!code) { Admin.toast('ابتدا بارکد را وارد یا تولید کنید', 'error'); return; }

        /* بارکد تصویری ساده با میله‌های SVG بر اساس ارقام */
        var bars = code.split('').map(function (digit, i) {
          var w = (Number(digit) % 3) + 1;
          return '<rect x="' + (i * 7) + '" y="0" width="' + w + '" height="52" fill="#000"/>';
        }).join('');

        var win = window.open('', '_blank', 'width=420,height=320');
        if (!win) {
          Admin.toast('پنجره چاپ مسدود شد. پاپ‌آپ مرورگر را مجاز کنید', 'error');
          return;
        }
        var doc = win.document;
        doc.open();
        doc.write('<!DOCTYPE html><html lang="fa" dir="rtl"><head><meta charset="utf-8">');
        doc.write('<title>چاپ بارکد</title>');
        doc.write('<style type="text/css">');
        doc.write('body{font-family:Tahoma,sans-serif;text-align:center;padding:24px}');
        doc.write('b{display:block;font-size:13px;margin-bottom:10px}');
        doc.write('span{display:block;font-size:12px;letter-spacing:3px;margin-top:6px;direction:ltr}');
        doc.write('<' + '/style><' + '/head><body>');
        doc.write('<b>' + Admin.escapeHtml(name) + '</b>');
        doc.write('<svg width="' + (code.length * 7) + '" height="52" viewBox="0 0 ' + (code.length * 7) + ' 52">' + bars + '<' + '/svg>');
        doc.write('<span>' + Admin.escapeHtml(code) + '<' + '/span><' + '/body><' + '/html>');
        doc.close();
        win.focus();
        win.print();
      }

      /* ========================== پر کردن فرم (ویرایش) ================== */
      function fillForm(p) {
        state.id = p.id;
        state.sizes = p.sizes || [];
        state.lengths = p.lengths || [];
        state.colors = p.colors || [];
        state.collections = p.collections || [];
        state.images = p.images || [];
        state.variants = p.variants || [];
        state.features = p.features || [];
        state.care = p.care || [];

        document.getElementById('name').value = p.name;
        document.getElementById('slug').value = p.id;
        document.getElementById('slug').dataset.touched = '1';
        document.getElementById('code').value = p.code;
        document.getElementById('barcode').value = p.barcode || '';
        document.getElementById('category').value = p.category;
        document.getElementById('fabric').value = p.fabric || '';
        document.getElementById('oldPrice').value = Admin.fa(Admin.price(p.oldPrice));
        document.getElementById('discount').value = p.discount;
        document.getElementById('costPrice').value = p.costPrice ? Admin.fa(Admin.price(p.costPrice)) : '';
        document.getElementById('description').value = p.description || '';
        document.getElementById('status').value = p.status;
        document.getElementById('featuredHome').checked = !!p.featuredHome;
        document.getElementById('lowStockThreshold').value = p.lowStockThreshold || 5;
        document.getElementById('seoTitle').value = (p.seo && p.seo.title) || '';
        document.getElementById('seoTitle').dataset.touched = '1';
        document.getElementById('seoDescription').value = (p.seo && p.seo.description) || '';

        document.getElementById('formTitle').textContent = 'ویرایش: ' + p.name;
        document.getElementById('crumbCurrent').textContent = p.name;
        document.getElementById('formSub').textContent =
          'آخرین ویرایش ' + Admin.jDate(p.updatedAt) + ' · کد کالا ' + p.code;
        document.title = 'ویرایش ' + p.name + ' | پنل مدیریت هستی';

        renderChips();
        updateCharCount();
        renderProductStats(p);
      }

      function renderProductStats(p) {
        document.getElementById('statsCard').hidden = false;
        document.getElementById('productStats').innerHTML =
          row('بازدید صفحه', Admin.fa(p.views)) +
          row('تعداد فروش', Admin.fa(p.salesCount) + ' عدد') +
          row('میانگین امتیاز', p.rating ? Admin.fa(p.rating) + ' از ۵' : 'بدون نظر') +
          row('موجودی کل', Admin.fa(p.totalStock) + ' عدد') +
          row('درآمد تجمعی', Admin.money(p.salesCount * p.currentPrice)) +
          row('تاریخ ثبت', Admin.jDate(p.createdAt));

        function row(dt, dd) {
          return '<div class="dl__row"><dt>' + dt + '</dt><dd>' + dd + '</dd></div>';
        }
      }

      function renderHeadActions() {
        if (!isEdit) return;
        document.getElementById('headActions').innerHTML =
          '<a class="btn btn--ghost btn--sm" href="../product.html?id=' + encodeURIComponent(state.id) +
          '" target="_blank" rel="noopener">' + Admin.icon('eye') + '<span>مشاهده در سایت</span></a>' +
          '<button class="btn btn--ghost btn--sm" type="button" id="dupBtn">' +
          Admin.icon('copy') + '<span>تکثیر</span></button>' +
          '<button class="btn btn--danger-ghost btn--sm" type="button" id="delBtn">' +
          Admin.icon('trash') + '<span>حذف</span></button>';

        document.getElementById('dupBtn').addEventListener('click', async function () {
          var copy = await dataService.duplicateProduct(state.id);
          Admin.toast('نسخه جدید ساخته شد');
          setTimeout(function () {
            window.location.href = 'product-form.html?id=' + encodeURIComponent(copy.id);
          }, 700);
        });

        document.getElementById('delBtn').addEventListener('click', async function () {
          var ok = await Admin.confirm({
            title: 'حذف محصول',
            danger: true, icon: 'trash',
            message: 'محصول «<b>' + Admin.escapeHtml(document.getElementById('name').value) + '</b>» حذف شود؟',
            confirmLabel: 'حذف محصول'
          });
          if (!ok) return;
          await dataService.deleteProduct(state.id);
          form.dataset.dirty = '0';
          Admin.toast('محصول حذف شد');
          setTimeout(function () { window.location.href = 'products.html'; }, 700);
        });
      }

      /* ============================== ذخیره =========================== */
      function markDirty() {
        form.dataset.dirty = '1';
        document.getElementById('stickyNote').textContent = 'تغییرات ذخیره نشده است';
        document.getElementById('stickyNote').style.color = 'var(--c-danger)';
      }

      async function save(status) {
        var valid = Admin.validateForm(form, {
          name: Admin.required('نام محصول'),
          slug: function (v) {
            if (!String(v).trim()) return 'وارد کردن شناسه یکتا الزامی است.';
            if (!/^[a-z0-9-]+$/.test(v)) return 'شناسه فقط می‌تواند شامل حروف انگلیسی کوچک، عدد و خط تیره باشد.';
            var duplicate = allProducts.some(function (p) { return p.id === v && p.id !== state.id; });
            if (duplicate) return 'این شناسه قبلاً برای محصول دیگری استفاده شده است.';
            return null;
          },
          code: Admin.required('کد کالا'),
          category: function (v) { return v ? null : 'انتخاب دسته‌بندی الزامی است.'; },
          oldPrice: function (v) {
            var n = parseMoney(v);
            if (!n) return 'وارد کردن قیمت الزامی است.';
            return null;
          },
          discount: function (v) {
            var n = Number(Admin.toEn(v));
            if (isNaN(n) || n < 0 || n > 100) return 'درصد تخفیف باید بین ۰ تا ۱۰۰ باشد.';
            return null;
          }
        });

        if (!valid) {
          Admin.toast('لطفاً خطاهای فرم را برطرف کنید', 'error');
          return;
        }

        if (!state.images.length) {
          Admin.toast('حداقل یک تصویر برای محصول لازم است', 'error');
          document.getElementById('addImage').focus();
          return;
        }

        var saveBtn = document.getElementById('saveBtn');
        saveBtn.classList.add('btn--loading');

        var oldPrice = parseMoney(document.getElementById('oldPrice').value);
        var payload = {
          id: document.getElementById('slug').value.trim(),
          code: document.getElementById('code').value.trim(),
          barcode: document.getElementById('barcode').value.trim(),
          name: document.getElementById('name').value.trim(),
          category: document.getElementById('category').value,
          collections: state.collections.slice(),
          fabric: document.getElementById('fabric').value.trim(),
          sizes: state.sizes.length ? state.sizes.slice() : ['یک‌سایز'],
          lengths: state.lengths.slice(),
          colors: state.colors.slice(),
          variants: state.variants.slice(),
          oldPrice: oldPrice,
          discount: Number(Admin.toEn(document.getElementById('discount').value)) || 0,
          costPrice: parseMoney(document.getElementById('costPrice').value),
          lowStockThreshold: Number(Admin.toEn(document.getElementById('lowStockThreshold').value)) || 5,
          images: state.images.slice(),
          description: document.getElementById('description').value.trim(),
          features: state.features.filter(function (f) { return f.trim(); }),
          care: state.care.filter(function (c) { return c.trim(); }),
          status: status,
          featuredHome: document.getElementById('featuredHome').checked,
          seo: {
            title: document.getElementById('seoTitle').value.trim(),
            description: document.getElementById('seoDescription').value.trim()
          }
        };

        /* اگر شناسه تغییر کرده، رکورد قبلی حذف می‌شود تا نسخه تکراری نماند */
        if (isEdit && state.id && state.id !== payload.id) {
          await dataService.deleteProduct(state.id);
        }

        await dataService.saveProduct(payload);

        saveBtn.classList.remove('btn--loading');
        form.dataset.dirty = '0';
        document.getElementById('stickyNote').textContent = 'همه تغییرات ذخیره شد';
        document.getElementById('stickyNote').style.color = 'var(--c-success)';
        Admin.toast(isEdit ? 'محصول با موفقیت به‌روزرسانی شد' : 'محصول جدید ثبت شد');

        setTimeout(function () { window.location.href = 'products.html'; }, 900);
      }
    })();
