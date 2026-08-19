import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'f:/hijab-hasti';
const ADMIN_SRC = path.join(ROOT, 'admin');
const OUT = path.join(ROOT, 'react/hijab-hasti/src/admin');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function rewriteHrefs(text) {
  const pairs = [
    ['customer-detail.html?id=', '/admin/customers/'],
    ['order-detail.html?id=', '/admin/orders/'],
    ['product-form.html?id=', '/admin/products/'],
    ['blog-form.html?id=', '/admin/blog/'],
    ['product-form.html', '/admin/products/new'],
    ['blog-form.html', '/admin/blog/new'],
    ['customer-detail.html', '/admin/customers'],
    ['order-detail.html', '/admin/orders'],
    ['login.html', '/admin/login'],
    ['index.html', '/admin'],
    ['orders.html', '/admin/orders'],
    ['products.html', '/admin/products'],
    ['categories.html', '/admin/categories'],
    ['inventory.html', '/admin/inventory'],
    ['customers.html', '/admin/customers'],
    ['discounts.html', '/admin/discounts'],
    ['blog.html', '/admin/blog'],
    ['reviews.html', '/admin/reviews'],
    ['messages.html', '/admin/messages'],
    ['reports.html', '/admin/reports'],
    ['settings.html', '/admin/settings'],
    ['users.html', '/admin/users'],
    ['../test.html', '/'],
    ['../logo-transparent.png', '/assets/logo-transparent.png'],
    ['../logo.png', '/assets/logo.png'],
  ];
  let out = text;
  for (const [from, to] of pairs) out = out.split(from).join(to);
  return out;
}

function rewriteImages(text) {
  return text
    .replace(/\.\.\/(\d[\w .()-]*\.(webp|png|jpg|jpeg))/g, '/assets/$1')
    .replace(/\.\.\/([A-Za-z][\w .()-]*\.(webp|png|jpg|jpeg))/g, '/assets/$1');
}

ensureDir(path.join(OUT, 'data'));
ensureDir(path.join(OUT, 'inits'));
ensureDir(path.join(OUT, 'pages'));

let mock = fs.readFileSync(path.join(ADMIN_SRC, 'assets/data/mock-data.js'), 'utf8');
mock = mock.replace(/\(function \(global\) \{\s*"use strict";/, '');
mock = mock.replace(/\.\.\/([\w .()-]+\.(webp|png|jpg|jpeg))/g, '/assets/$1');
mock = mock.replace(/global\.HASTI_MOCK =/, 'export const HASTI_MOCK =');
mock = mock.replace(/\}\)\(window\);\s*$/, '');
fs.writeFileSync(path.join(OUT, 'data/mockData.js'), mock);

let ds = fs.readFileSync(path.join(ADMIN_SRC, 'assets/data/dataService.js'), 'utf8');
ds = ds.replace(/\(function \(global\) \{\s*"use strict";/, "import { HASTI_MOCK } from './mockData.js';\n");
ds = ds.replace(/var DB = global\.HASTI_MOCK;/, 'var DB = HASTI_MOCK;');
ds = ds.replace(/global\.dataService =/, 'export const dataService =');
ds = ds.replace(/\}\)\(window\);\s*$/, '');
fs.writeFileSync(path.join(OUT, 'data/dataService.js'), ds);

let shared = fs.readFileSync(path.join(ADMIN_SRC, 'assets/admin-shared.js'), 'utf8');
shared = shared.replace(/\(function \(global\) \{\s*"use strict";/, "import { dataService } from './data/dataService.js';\n");
shared = shared.replace(/global\.dataService/g, 'dataService');
shared = rewriteHrefs(shared);
shared = shared.replace(
  'if (!guardSession()) return new Promise(function () { });',
  `if (!guardSession()) return new Promise(function () { });
        if (document.getElementById('adminSidebar')) {
            loadNotifications && loadNotifications();
            return;
        }`,
);
shared = shared.replace(
  "location.replace('login.html?next=' + encodeURIComponent(next));",
  "location.replace('/admin/login?next=' + encodeURIComponent(next));",
);
shared = shared.replace(
  "var next = location.pathname.split('/').pop() + location.search;",
  "var next = location.pathname.replace(/^\\/admin\\/?/, '') + location.search;",
);
shared = shared.replace(/function param\(name\) \{\s*return new URLSearchParams\(global\.location\.search\)\.get\(name\);\s*\}/,
  `function param(name) {
        var q = new URLSearchParams(window.location.search).get(name);
        if (q) return q;
        var parts = window.location.pathname.split('/').filter(Boolean);
        var last = parts[parts.length - 1];
        if ((name === 'id' || name === 'next') && last && !['admin','login','orders','products','customers','blog','new'].includes(last)) {
            return decodeURIComponent(last);
        }
        return q;
    }`);
shared = shared.replace(/global\.Admin = Admin;\s*\}\)\(window\);\s*$/, 'export { Admin };\n');
shared = shared.replace(/global\.location/g, 'window.location');
shared = shared.replace(/global\./g, 'window.');
fs.writeFileSync(path.join(OUT, 'adminShared.js'), shared);

let pf = fs.readFileSync(path.join(ADMIN_SRC, 'assets/product-form.js'), 'utf8');
pf = pf.replace(/\(function \(\) \{\s*"use strict";/, `import { Admin } from './adminShared.js';
import { dataService } from './data/dataService.js';
import { HASTI_MOCK } from './data/mockData.js';
export async function initProductForm() {`);
pf = pf.replace(/\}\)\(\);\s*$/, '}\n');
pf = rewriteHrefs(pf);
fs.writeFileSync(path.join(OUT, 'productForm.js'), pf);

const pages = {
  'index.html': { file: 'DashboardPage', key: 'dashboard', init: 'initDashboard' },
  'orders.html': { file: 'OrdersPage', key: 'orders', init: 'initOrders' },
  'order-detail.html': { file: 'OrderDetailPage', key: 'orders', init: 'initOrderDetail' },
  'products.html': { file: 'ProductsPage', key: 'products', init: 'initProducts' },
  'product-form.html': { file: 'ProductFormPage', key: 'products', init: 'initProductFormPage' },
  'categories.html': { file: 'CategoriesPage', key: 'categories', init: 'initCategories' },
  'inventory.html': { file: 'InventoryPage', key: 'inventory', init: 'initInventory' },
  'customers.html': { file: 'CustomersPage', key: 'customers', init: 'initCustomers' },
  'customer-detail.html': { file: 'CustomerDetailPage', key: 'customers', init: 'initCustomerDetail' },
  'discounts.html': { file: 'DiscountsPage', key: 'discounts', init: 'initDiscounts' },
  'blog.html': { file: 'BlogPage', key: 'blog', init: 'initBlog' },
  'blog-form.html': { file: 'BlogFormPage', key: 'blog', init: 'initBlogForm' },
  'reviews.html': { file: 'ReviewsPage', key: 'reviews', init: 'initReviews' },
  'messages.html': { file: 'MessagesPage', key: 'messages', init: 'initMessages' },
  'reports.html': { file: 'ReportsPage', key: 'reports', init: 'initReports' },
  'settings.html': { file: 'SettingsPage', key: 'settings', init: 'initSettings' },
  'users.html': { file: 'UsersPage', key: 'users', init: 'initUsers' },
};

const loginHtml = fs.readFileSync(path.join(ADMIN_SRC, 'login.html'), 'utf8');
const loginMain = (loginHtml.match(/<main[\s\S]*<\/main>/) || [''])[0]
  .replace(/class=/g, 'className=')
  .replace(/\sfor=/g, ' htmlFor=')
  .replace(/stroke-width/g, 'strokeWidth')
  .replace(/stroke-linecap/g, 'strokeLinecap')
  .replace(/stroke-linejoin/g, 'strokeLinejoin')
  .replace(/autocomplete=/g, 'autoComplete=')
  .replace(/inputmode=/g, 'inputMode=')
  .replace(/maxlength=/g, 'maxLength=')
  .replace(/novalidate/g, 'noValidate');

for (const [htmlFile, meta] of Object.entries(pages)) {
  const raw = fs.readFileSync(path.join(ADMIN_SRC, htmlFile), 'utf8');
  const bodyMatch = raw.match(/<div class="admin-body" id="main">([\s\S]*?)<\/div>\s*<\/main>/);
  let body = bodyMatch ? bodyMatch[1].trim() : '';
  body = rewriteHrefs(body);
  body = rewriteImages(body);

  const scriptMatch = raw.match(/<script>\s*([\s\S]*?)<\/script>\s*<\/body>/);
  let script = scriptMatch ? scriptMatch[1].trim() : '';
  script = script.replace(/\(function \(\) \{\s*"use strict";/, '');
  script = script.replace(/\}\)\(\);\s*$/, '');
  script = rewriteHrefs(script);
  script = rewriteImages(script);
  script = script.replace(/await Admin\.shell\([^)]*\);?/g, 'await Admin.shell("' + meta.key + '");');

  const initSrc = `import { Admin } from '../adminShared.js';
import { dataService } from '../data/dataService.js';
import { HASTI_MOCK } from '../data/mockData.js';

export async function ${meta.init}() {
${script}
}
`;
  fs.writeFileSync(path.join(OUT, 'inits', `${meta.init}.js`), initSrc);

  const needsChart = htmlFile === 'index.html' || htmlFile === 'reports.html';
  const extraInit = htmlFile === 'product-form.html'
    ? `import { initProductForm } from '../productForm.js';\n`
    : '';
  const callExtra = htmlFile === 'product-form.html' ? '\n    await initProductForm();' : '';

  const pageSrc = `import { useEffect } from 'react';
import { ${meta.init} } from '../inits/${meta.init}.js';
${extraInit}${needsChart ? `function loadChart() {
  if (window.Chart) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = '/assets/chart.umd.min.js';
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}
` : ''}
const HTML = ${JSON.stringify(body)};

export default function ${meta.file}() {
  useEffect(() => {
    let alive = true;
    (async () => {
      ${needsChart ? 'await loadChart();' : ''}
      if (!alive) return;
      await ${meta.init}();${callExtra}
    })();
    return () => { alive = false; };
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: HTML }} />;
}
`;
  fs.writeFileSync(path.join(OUT, 'pages', `${meta.file}.jsx`), pageSrc);
}

console.log('admin conversion written');
