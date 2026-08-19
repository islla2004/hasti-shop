import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Admin } from '../adminShared.js';
import { dataService } from '../data/dataService.js';
import '../../styles/admin-shared.css';

const DEMO_PHONE = '09152500553';
const DEMO_PASSWORD = 'hasti1403';

export default function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [security, setSecurity] = useState('');
  const [challenge, setChallenge] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ products: '—', orders: '—', customers: '—' });

  const refreshCode = () => {
    setChallenge(String(Math.floor(10000 + Math.random() * 90000)));
    setSecurity('');
  };

  useEffect(() => {
    document.title = 'ورود به پنل مدیریت | هستی';
    document.documentElement.lang = 'fa';
    document.documentElement.dir = 'rtl';
    document.body.classList.add('login-page');
    refreshCode();
    if (localStorage.getItem('hasti_admin_remember') === '1') setPhone(DEMO_PHONE);
    if (params.get('next')) setError('برای دسترسی به آن صفحه ابتدا وارد حساب خود شوید.');
    dataService.getProducts().then(async (products) => {
      const orders = await dataService.getOrders();
      const customers = await dataService.getCustomers();
      setStats({
        products: Admin.fa(products.filter((p) => p.status === 'published').length),
        orders: Admin.fa(orders.length),
        customers: Admin.fa(customers.length),
      });
    });
    return () => document.body.classList.remove('login-page');
  }, [params]);

  const onSubmit = (e) => {
    e.preventDefault();
    const normalized = Admin.toEn(phone).replace(/\D/g, '');
    if (!/^09\d{9}$/.test(normalized)) { setError('شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.'); return; }
    if (password.length < 6) { setError('رمز عبور باید حداقل ۶ کاراکتر باشد.'); return; }
    if (Admin.toEn(security).replace(/\D/g, '') !== challenge) { setError('کد امنیتی واردشده صحیح نیست.'); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (normalized === DEMO_PHONE && password === DEMO_PASSWORD) {
        if (remember) localStorage.setItem('hasti_admin_remember', '1');
        sessionStorage.setItem('hasti_admin_session', 'demo');
        const next = params.get('next');
        navigate(next && next.startsWith('/') ? next : next ? `/admin/${next.replace(/^\//, '')}` : '/admin', { replace: true });
      } else {
        setError('شماره موبایل یا رمز عبور نادرست است. لطفاً دوباره تلاش کنید.');
        setPassword('');
        refreshCode();
      }
    }, 500);
  };

  return (
    <div className="login-page">
      <aside className="login-aside">
        <p>محصولات فعال: {stats.products}</p>
        <p>سفارش‌ها: {stats.orders}</p>
        <p>مشتریان: {stats.customers}</p>
      </aside>
      <main className="login-main">
        <div className="login-card">
          <div className="login-card__brand">
            <img src="/assets/logo-transparent.png" alt="برند هستی" className="login-card__logo" width="220" height="154" />
            <span>دسترسی اختصاصی مدیریت</span>
          </div>
          <h2>ورود به پنل</h2>
          <p>برای دسترسی به پنل مدیریت، شماره موبایل و رمز عبور خود را وارد کنید.</p>
          <form onSubmit={onSubmit} noValidate>
            <div className="field">
              <label className="label" htmlFor="phone">شماره موبایل</label>
              <input className="input ltr" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09151234567" />
            </div>
            <div className="field">
              <label className="label" htmlFor="password">رمز عبور</label>
              <div className="pw-wrap">
                <input className="input" id="password" type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} />
                <button className="pw-toggle" type="button" onClick={() => setShowPass((v) => !v)} aria-label="نمایش رمز عبور" />
              </div>
            </div>
            <div className="field security-field">
              <label className="label" htmlFor="securityCode">کد امنیتی</label>
              <div className="security-wrap">
                <input className="input ltr" id="securityCode" value={security} onChange={(e) => setSecurity(e.target.value)} maxLength={5} />
                <button className="security-challenge" type="button" onClick={refreshCode}>
                  <span>{Admin.fa(challenge)}</span>
                </button>
              </div>
            </div>
            <div className="login-row">
              <label className="check">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                <span className="check__box" />
                <span>مرا به خاطر بسپار</span>
              </label>
            </div>
            {error ? <div className="notice notice--danger mb-2" role="alert">{error}</div> : null}
            <button className={`btn btn--primary btn--block${loading ? ' btn--loading' : ''}`} type="submit" disabled={loading}>
              <span>ورود به پنل مدیریت</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
