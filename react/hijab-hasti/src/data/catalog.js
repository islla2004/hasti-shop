const A = '/assets';

export function currentPrice(product) {
  return Math.round(product.oldPrice - (product.oldPrice * (product.discount || 0) / 100));
}

const DEFAULT_SIZES = ['یک‌سایز'];
const DEFAULT_FEATURES = ['دوخت دست‌ساز', 'پارچه درجه یک', 'رنگ ثابت', 'حاشیه‌دوزی ظریف'];
const DEFAULT_CARE = ['شست‌وشوی ملایم', 'عدم استفاده از سفیدکننده', 'اتو با حرارت ملایم', 'خشک کردن در سایه'];

export const CATALOG_PRODUCTS = [
  {
    id: 'abaya-janan',
    name: 'عبای جانان',
    code: 'HJ-ABA-001',
    category: 'عبا',
    fabric: 'کرپ حریر درجه یک',
    oldPrice: 15000000,
    discount: 26,
    images: [`${A}/01.webp`, `${A}/01-2.webp`],
    sizes: ['S', 'M', 'L', 'XL'],
    lengths: [130, 135, 140, 145],
    inStock: true,
    desc: 'عبای جانان با پارچه کرپ حریر سبک و افتاده، دوخت دست‌ساز و طراحی ساده و شیک، انتخابی مناسب برای مراسم‌های رسمی و روزمره است.',
    features: ['دوخت کاملاً دست‌ساز', 'پارچه ضد چروک و سبک', 'رنگ ثابت پس از شست‌وشو', 'آستین راحت و بلند استاندارد'],
    care: ['شست‌وشو با دست و آب سرد', 'عدم استفاده از سفیدکننده', 'اتو با حرارت ملایم روی پارچه', 'خشک کردن به‌صورت آویزان در سایه'],
  },
  {
    id: 'abaya-aurora',
    name: 'عبای آرورا',
    code: 'HJ-ABA-002',
    category: 'عبا',
    fabric: 'کرپ کریستال',
    oldPrice: 12500000,
    discount: 30,
    images: [`${A}/02.webp`, `${A}/02-2.webp`],
    sizes: ['S', 'M', 'L', 'XL'],
    lengths: [130, 135, 140, 145],
    inStock: true,
    desc: 'عبای آرورا با ترکیب رنگی خاص و طراحی مدرن، حس ظرافت و اعتمادبه‌نفس را در کنار رعایت کامل حجاب به شما هدیه می‌دهد.',
    features: ['طراحی مدرن و خاص', 'پارچه سبک و خنک', 'مناسب چهارفصل', 'دوخت مقاوم و بادوام'],
    care: ['شست‌وشوی ملایم با دست', 'پرهیز از حرارت زیاد در اتو', 'خشک‌شویی توصیه می‌شود', 'دور از نور مستقیم آفتاب خشک شود'],
  },
  {
    id: 'chador-negin-baran',
    name: 'چادر فاخر نگین باران',
    code: 'HJ-CHD-001',
    category: 'چادر',
    fabric: 'کرپ حریر',
    length: 160,
    oldPrice: 10000000,
    discount: 26,
    views: 980,
    dateIndex: 3,
    images: [`${A}/04.webp`, `${A}/04 (1).webp`],
    sizes: DEFAULT_SIZES,
    lengths: [140, 145, 150],
    inStock: false,
    hue: 0,
    desc: 'چادر فاخر نگین باران با کارشده‌های ظریف و پارچه‌ای درجه یک، برای مراسم‌های مجلسی و مذهبی طراحی شده است.',
    features: ['کارشده نگین دست‌دوز', 'پارچه افتاده و بدون شفافیت', 'دوخت مقاوم در برابر پارگی', 'حاشیه‌دوزی ظریف'],
    care: ['فقط خشک‌شویی مجاز', 'اتو با بخار از پشت پارچه', 'خودداری از آویزان کردن طولانی‌مدت', 'نگهداری در کاور مخصوص پارچه'],
  },
  {
    id: 'abaya-banoo',
    name: 'عبای بانو',
    code: 'HJ-ABA-003',
    category: 'عبا',
    fabric: 'کرپ اسپاندکس',
    oldPrice: 15000000,
    discount: 5,
    images: [`${A}/03.webp`, `${A}/03-1.webp`],
    sizes: ['S', 'M', 'L', 'XL'],
    lengths: [130, 135, 140, 145],
    inStock: true,
    desc: 'عبای بانو با پارچه کرپ اسپاندکس با کشسانی مناسب، راحتی حرکت را برای استفاده روزمره فراهم می‌کند.',
    features: ['کشسانی مناسب پارچه', 'راحت برای استفاده روزانه', 'دوخت تمیز و استاندارد', 'وزن سبک'],
    care: ['شست‌وشو با ماشین در دمای پایین', 'عدم استفاده از خشک‌کن', 'اتو با حرارت کم', 'شست‌وشو با رنگ‌های مشابه'],
  },
];

const CHADOR_IMG = `${A}/chadorItem.webp`;

const CHADOR_EXTRA = [
  { id: 'chador-malake-mashhad', name: 'چادر ملکه مشهد', fabric: 'کرپ کریستال', length: 155, oldPrice: 8500000, discount: 15, views: 1450, dateIndex: 9, inStock: true, hue: 0 },
  { id: 'chador-erfan-sormei', name: 'چادر عرفان سرمه‌ای', fabric: 'نسیم مشکی', length: 165, oldPrice: 7200000, discount: 0, views: 610, dateIndex: 5, inStock: true, hue: 210 },
  { id: 'chador-golbarg-anari', name: 'چادر گلبرگ اناری', fabric: 'ژرسه سنگین', length: 170, oldPrice: 9800000, discount: 20, views: 2100, dateIndex: 11, inStock: true, hue: 330 },
  { id: 'chador-niloofar', name: 'چادر نیلوفر', fabric: 'ساتن مشکی', length: 160, oldPrice: 6500000, discount: 10, views: 430, dateIndex: 2, inStock: false, hue: 200 },
  { id: 'chador-bahar-narenj', name: 'چادر بهار نارنج', fabric: 'کرپ اسپاندکس', length: 155, oldPrice: 5900000, discount: 5, views: 720, dateIndex: 7, inStock: true, hue: 25 },
  { id: 'chador-shab-yalda', name: 'چادر شب یلدا', fabric: 'کرپ حریر', length: 170, oldPrice: 11200000, discount: 30, views: 3050, dateIndex: 12, inStock: true, hue: 260 },
  { id: 'chador-setare-kavir', name: 'چادر ستاره کویر', fabric: 'نسیم مشکی', length: 165, oldPrice: 7800000, discount: 0, views: 890, dateIndex: 4, inStock: true, hue: 45 },
  { id: 'chador-morjan', name: 'چادر مرجان', fabric: 'کرپ کریستال', length: 160, oldPrice: 8900000, discount: 12, views: 1200, dateIndex: 8, inStock: true, hue: 350 },
  { id: 'chador-aftab-madine', name: 'چادر آفتاب مدینه', fabric: 'ژرسه سنگین', length: 155, oldPrice: 6900000, discount: 8, views: 540, dateIndex: 1, inStock: false, hue: 190 },
  { id: 'chador-negar', name: 'چادر نگار', fabric: 'ساتن مشکی', length: 165, oldPrice: 7400000, discount: 18, views: 990, dateIndex: 10, inStock: true, hue: 205 },
  { id: 'chador-yasaman', name: 'چادر یاسمن', fabric: 'کرپ اسپاندکس', length: 170, oldPrice: 6200000, discount: 0, views: 300, dateIndex: 6, inStock: true, hue: 95 },
];

const ACCESSORY_PRODUCTS = [
  {
    id: 'abaya-parnian',
    name: 'عبای پرنیان',
    code: 'HJ-ABA-004',
    category: 'عبا',
    fabric: 'کرپ حریر',
    oldPrice: 13800000,
    discount: 0,
    images: [`${A}/AbbaItrm.webp`],
    sizes: ['S', 'M', 'L', 'XL'],
    lengths: [130, 135, 140, 145],
    inStock: true,
    desc: 'عبای پرنیان با برش کلاسیک و پارچه افتاده، انتخابی آرام و شیک برای پوشش روزمره است.',
    features: DEFAULT_FEATURES,
    care: DEFAULT_CARE,
  },
  {
    id: 'shall-noor',
    name: 'شال نور',
    code: 'HJ-SHL-001',
    category: 'شال و روسری',
    fabric: 'حریر سبک',
    oldPrice: 2400000,
    discount: 12,
    images: [`${A}/ShallItem.webp`],
    sizes: DEFAULT_SIZES,
    lengths: [],
    inStock: true,
    desc: 'شال نور با بافت لطیف و رنگ گرم، مکمل کالکشن‌های رسمی و روزمره هستی است.',
    features: DEFAULT_FEATURES,
    care: DEFAULT_CARE,
  },
  {
    id: 'kiff-shabnam',
    name: 'کیف جواهردوزی شبنم',
    code: 'HJ-BAG-001',
    category: 'کیف جواهردوزی',
    fabric: 'مخمل جواهردوزی',
    oldPrice: 4200000,
    discount: 18,
    images: [`${A}/kiff.webp`],
    sizes: DEFAULT_SIZES,
    lengths: [],
    inStock: true,
    desc: 'کیف جواهردوزی شبنم با کارشده‌های درخشان، همراه مناسب مجالس و پوشش رسمی است.',
    features: DEFAULT_FEATURES,
    care: DEFAULT_CARE,
  },
  {
    id: 'shomiz-baran',
    name: 'شومیز باران',
    code: 'HJ-SHM-001',
    category: 'شومیز',
    fabric: 'کرپ سبک',
    oldPrice: 5600000,
    discount: 15,
    images: [`${A}/shumiz.webp`],
    sizes: ['S', 'M', 'L', 'XL'],
    lengths: [],
    inStock: true,
    desc: 'شومیز باران با دوخت ظریف و فرم آراسته، برای مجالس و استفاده روزمره طراحی شده است.',
    features: DEFAULT_FEATURES,
    care: DEFAULT_CARE,
  },
  {
    id: 'palto-zomorod',
    name: 'پالتو زمرد',
    code: 'HJ-PLT-001',
    category: 'پالتو',
    fabric: 'فوتر مجلسی',
    oldPrice: 18500000,
    discount: 20,
    images: [`${A}/mazon.webp`],
    sizes: ['S', 'M', 'L', 'XL'],
    lengths: [],
    inStock: true,
    desc: 'پالتو زمرد با فرم مجلسی و پارچه سنگین، انتخاب فصل سرد در کالکشن زمستانه هستی است.',
    features: DEFAULT_FEATURES,
    care: DEFAULT_CARE,
  },
];

function decorateChador(item, index) {
  return {
    ...item,
    code: `HJ-CHD-${String(index + 2).padStart(3, '0')}`,
    category: 'چادر',
    images: [CHADOR_IMG, CHADOR_IMG],
    sizes: DEFAULT_SIZES,
    lengths: [item.length],
    desc: `${item.name} با پارچه ${item.fabric} و قد ${item.length} سانتی‌متر، انتخابی شیک برای پوشش کامل.`,
    features: DEFAULT_FEATURES,
    care: DEFAULT_CARE,
  };
}

export const ALL_PRODUCTS = [
  ...CATALOG_PRODUCTS,
  ...ACCESSORY_PRODUCTS,
  ...CHADOR_EXTRA.map(decorateChador),
];

export const CHADOR_PRODUCTS = ALL_PRODUCTS.filter((p) => p.category === 'چادر');

export const FEATURED_PRODUCTS = CATALOG_PRODUCTS;

export function getProductById(id) {
  return ALL_PRODUCTS.find((p) => p.id === id);
}

export function getRelatedProducts(product, limit = 3) {
  if (!product) return [];
  const sameCategory = ALL_PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id);
  if (sameCategory.length) return sameCategory.slice(0, limit);
  return ALL_PRODUCTS.filter((p) => p.id !== product.id).slice(0, limit);
}

export const LENGTH_OPTIONS = [155, 160, 165, 170];

export const FABRIC_OPTIONS = [...new Set(CHADOR_PRODUCTS.map((p) => p.fabric))];
