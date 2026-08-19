import { useEffect, useMemo, useRef, useState } from 'react';
import { ALL_PRODUCTS, currentPrice } from '../data/catalog';
import { getWishlist, setWishlist } from '../utils/storage';
import { formatPrice, toPersianNumber } from '../utils/priceUtils';
import SmartLink from '../components/SmartLink';
import '../styles/profile.css';

const USER_KEY = 'hh_user';
const PROVINCES = [
  'تهران', 'خراسان رضوی', 'اصفهان', 'فارس', 'آذربایجان شرقی', 'آذربایجان غربی',
  'مازندران', 'گیلان', 'البرز', 'کرمان', 'خوزستان', 'سیستان و بلوچستان',
  'هرمزگان', 'کرمانشاه', 'گلستان', 'همدان', 'مرکزی', 'سمنان', 'لرستان',
  'قم', 'قزوین', 'زنجان', 'کردستان', 'چهارمحال و بختیاری', 'بوشهر', 'ایلام',
  'خراسان شمالی', 'خراسان جنوبی', 'اردبیل', 'یزد',
];

const TABS = [
  { id: 'info', label: 'اطلاعات', icon: 'user' },
  { id: 'edit', label: 'ویرایش', icon: 'edit' },
  { id: 'orders', label: 'سفارش‌ها', icon: 'bag' },
  { id: 'loyalty', label: 'باشگاه', icon: 'star' },
  { id: 'wishlist', label: 'علاقه‌مندی‌ها', icon: 'heart' },
  { id: 'security', label: 'امنیت', icon: 'lock' },
];

const DEMO_ORDERS = [
  { name: 'چادر مجلسی طرح هندسی', meta: 'کد سفارش: #HH-۱۰۰۳  ·  ۲۵ مرداد ۱۴۰۳', status: 'delivered', statusLabel: 'تحویل شد', price: '۲٬۴۵۰٬۰۰۰ ت' },
  { name: 'شال و روسری لاکچری', meta: 'کد سفارش: #HH-۱۰۰۸  ·  ۵ شهریور ۱۴۰۳', status: 'processing', statusLabel: 'در حال ارسال', price: '۱٬۲۰۰٬۰۰۰ ت' },
  { name: 'کیف جواهردوزی دست‌دوز', meta: 'کد سفارش: #HH-۱۰۱۵  ·  ۱۲ شهریور ۱۴۰۳', status: 'pending', statusLabel: 'در انتظار پرداخت', price: '۱٬۲۰۰٬۰۰۰ ت' },
];

const OTP_LABELS = ['رقم اول', 'رقم دوم', 'رقم سوم', 'رقم چهارم', 'رقم پنجم', 'رقم ششم'];
const STEP_LABELS = ['مرحله ۱: احراز هویت', 'مرحله ۲: تأیید کد', 'مرحله ۳: تکمیل پروفایل'];

const toEn = (s) => String(s)
  .replace(/[۰-۹]/g, (c) => String(c.charCodeAt(0) - 1776))
  .replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 1632));

const emptyUser = {
  phone: '', nid: '', firstName: '', lastName: '', username: '', password: '',
  email: '', province: '', city: '', postal: '', address: '', avatarSrc: '',
};

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function PhoneIcon({ strokeWidth = 1.8 }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6 6l.94-.94a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function IdIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <line x1="8" y1="9" x2="16" y2="9" />
      <line x1="8" y1="13" x2="14" y2="13" />
    </svg>
  );
}

function EyeIcon({ off }) {
  if (off) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function TabIcon({ name, strokeWidth = 1.8 }) {
  if (name === 'user') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c1.6-4 5-6 8-6s6.4 2 8 6" />
      </svg>
    );
  }
  if (name === 'edit') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    );
  }
  if (name === 'bag') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round">
        <path d="M6 8h12l-1 12H7L6 8Z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </svg>
    );
  }
  if (name === 'star') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    );
  }
  if (name === 'heart') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function FieldError({ show, message }) {
  return (
    <div className={`field__error${show ? ' visible' : ''}`} role="alert">
      <AlertIcon />
      <span>{message}</span>
    </div>
  );
}

function InfoVal({ value, ltr, address }) {
  const empty = !value;
  return (
    <span
      className={`info-row__val${empty ? ' info-row__val--empty' : ''}`}
      style={address ? { textAlign: 'right', maxWidth: 160, fontSize: 12, lineHeight: 1.5 } : (ltr ? { direction: 'ltr', textAlign: 'left' } : undefined)}
    >
      {empty ? 'وارد نشده' : value}
    </span>
  );
}

function stripSecrets(user) {
  if (!user || typeof user !== 'object') return user;
  const { password, passwordConfirm, ...safe } = user;
  return safe;
}

function loadUser() {
  try {
    const raw = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    if (!raw) return null;
    const safe = stripSecrets(raw);
    if (raw.password || raw.passwordConfirm) {
      localStorage.setItem(USER_KEY, JSON.stringify(safe));
    }
    return safe;
  } catch {
    return null;
  }
}

export default function ProfilePage() {
  const stored = loadUser();
  const [user, setUser] = useState(stored && stored.firstName ? stored : null);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ ...emptyUser, ...(stored || {}) });
  const [captcha, setCaptcha] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpCode, setOtpCode] = useState('');
  const [timer, setTimer] = useState(0);
  const [tab, setTab] = useState('info');
  const [toasts, setToasts] = useState([]);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState('');
  const [showPass, setShowPass] = useState({ pw: false, confirm: false, current: false });
  const [loading, setLoading] = useState('');
  const [passForm, setPassForm] = useState({ current: '', next: '', confirm: '' });
  const [wishTick, setWishTick] = useState(0);
  const otpRefs = useRef([]);
  const toastId = useRef(0);

  const refreshCaptcha = () => {
    setCaptcha(String(Math.floor(10000 + Math.random() * 90000)));
    setCaptchaInput('');
  };

  useEffect(() => {
    document.title = 'حساب کاربری | حجاب هستی';
    document.body.classList.add('page-profile');
    document.documentElement.classList.add('page-profile');
    refreshCaptcha();
    return () => {
      document.body.classList.remove('page-profile');
      document.documentElement.classList.remove('page-profile');
    };
  }, []);

  useEffect(() => {
    if (step === 3) document.getElementById('firstName')?.focus();
  }, [step]);

  useEffect(() => {
    if (timer <= 0) return undefined;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const showToast = (msg, type = 'success') => {
    const id = ++toastId.current;
    setToasts((list) => [...list, { id, msg, type }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3200);
  };

  const persist = (next) => {
    const safe = stripSecrets(next);
    localStorage.setItem(USER_KEY, JSON.stringify(safe));
    setUser(safe);
    setForm((f) => ({ ...f, ...safe, password: '', passwordConfirm: '' }));
  };

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const onStep1 = (e) => {
    e.preventDefault();
    const phone = toEn(form.phone).replace(/\D/g, '');
    const nid = toEn(form.nid).replace(/\D/g, '');
    const nextErr = {};
    if (!phone) nextErr.phone = 'شماره موبایل الزامی است';
    else if (!/^09\d{9}$/.test(phone)) nextErr.phone = 'شماره باید ۱۱ رقم و با ۰۹ شروع شود';
    if (!nid) nextErr.nid = 'کد ملی الزامی است';
    else if (nid.length !== 10) nextErr.nid = 'کد ملی باید ۱۰ رقم باشد';
    const cap = toEn(captchaInput).replace(/\D/g, '');
    if (!cap) nextErr.captcha = 'کد امنیتی الزامی است';
    else if (cap !== captcha) nextErr.captcha = 'کد امنیتی نادرست است';
    setErrors(nextErr);
    setNotice('');
    if (Object.keys(nextErr).length) return;
    setForm((f) => ({ ...f, phone, nid }));
    setLoading('step1');
    window.setTimeout(() => {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      setOtpCode(code);
      setOtp(['', '', '', '', '', '']);
      setStep(2);
      setTimer(120);
      setLoading('');
      otpRefs.current[0]?.focus();
    }, 900);
  };

  const onVerify = () => {
    const entered = otp.map(toEn).join('');
    if (entered.length < 6) { setNotice('لطفاً کد ۶ رقمی را کامل وارد کنید'); return; }
    if (entered !== otpCode) {
      setNotice('کد وارد شده نادرست است. لطفاً دوباره تلاش کنید');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
      return;
    }
    setNotice('');
    setLoading('otp');
    setTimer(0);
    window.setTimeout(() => {
      setLoading('');
      setStep(3);
    }, 600);
  };

  const onComplete = (e) => {
    e.preventDefault();
    const nextErr = {};
    if (!form.firstName.trim()) nextErr.firstName = 'نام الزامی است';
    if (!form.lastName.trim()) nextErr.lastName = 'نام خانوادگی الزامی است';
    if (!form.username.trim()) nextErr.username = 'نام کاربری الزامی است';
    else if (!/^[a-zA-Z0-9_]{3,}$/.test(form.username.trim())) nextErr.username = 'نام کاربری: فقط لاتین، عدد، _ — حداقل ۳ کاراکتر';
    if (!form.password) nextErr.password = 'رمز عبور الزامی است';
    else if (form.password.length < 8) nextErr.password = 'رمز عبور حداقل ۸ کاراکتر باشد';
    if (!form.passwordConfirm) nextErr.passwordConfirm = 'تکرار رمز الزامی است';
    else if (form.passwordConfirm !== form.password) nextErr.passwordConfirm = 'رمزهای وارد شده یکسان نیستند';
    setErrors(nextErr);
    setNotice('');
    if (Object.keys(nextErr).length) return;
    setLoading('step3');
    window.setTimeout(() => {
      persist({
        ...form,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        username: form.username.trim(),
      });
      setLoading('');
      showToast('ثبت‌نام با موفقیت انجام شد!', 'success');
    }, 800);
  };

  const logout = () => {
    if (!window.confirm('آیا از حساب کاربری خارج می‌شوید؟')) return;
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setForm({ ...emptyUser });
    setStep(1);
    setTab('info');
    refreshCaptcha();
    showToast('با موفقیت خارج شدید', 'success');
  };

  const saveProfile = (e) => {
    e.preventDefault();
    persist({
      ...user,
      firstName: form.firstName.trim() || user.firstName,
      lastName: form.lastName.trim() || user.lastName,
      username: form.username.trim() || user.username,
      email: form.email.trim(),
      province: form.province,
      city: form.city.trim(),
      postal: form.postal.trim(),
      address: form.address.trim(),
    });
    showToast('اطلاعات با موفقیت ذخیره شد', 'success');
    setTab('info');
  };

  const changePassword = (e) => {
    e.preventDefault();
    if (!passForm.current || !passForm.next || !passForm.confirm) { showToast('تمام فیلدها را پر کنید', 'error'); return; }
    if (passForm.next.length < 8) { showToast('رمز جدید حداقل ۸ کاراکتر باشد', 'error'); return; }
    if (passForm.next !== passForm.confirm) { showToast('رمزهای جدید یکسان نیستند', 'error'); return; }
    persist(user);
    setPassForm({ current: '', next: '', confirm: '' });
    showToast('رمز عبور با موفقیت تغییر کرد', 'success');
  };

  const onAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast('حجم فایل نباید از ۵ مگابایت بیشتر باشد', 'error'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      persist({ ...(user || form), avatarSrc: ev.target.result });
      showToast('تصویر پروفایل به‌روزرسانی شد', 'success');
    };
    reader.readAsDataURL(file);
  };

  const wishItems = useMemo(
    () => getWishlist().map((id) => ALL_PRODUCTS.find((p) => p.id === id)).filter(Boolean),
    [wishTick],
  );

  const dropWish = (id) => {
    setWishlist(getWishlist().filter((x) => x !== id));
    setWishTick((n) => n + 1);
    showToast('از علاقه‌مندی‌ها حذف شد', 'success');
  };

  const onOtpChange = (index, raw) => {
    const val = toEn(raw).replace(/\D/g, '').slice(0, 1);
    const next = [...otp];
    next[index] = val;
    setOtp(next);
    if (val && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const onOtpKey = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const onOtpPaste = (e) => {
    e.preventDefault();
    const digits = toEn(e.clipboardData.getData('text')).replace(/\D/g, '').slice(0, 6).split('');
    const next = ['', '', '', '', '', ''];
    digits.forEach((d, i) => { next[i] = d; });
    setOtp(next);
    otpRefs.current[Math.min(digits.length, 5)]?.focus();
  };

  const timerLabel = timer > 0
    ? toPersianNumber(`${String(Math.floor(timer / 60)).padStart(2, '0')}:${String(timer % 60).padStart(2, '0')}`)
    : '';

  const display = user || form;
  const loggedIn = Boolean(user?.firstName);

  return (
    <>
      <div className="page-bg" aria-hidden="true">
        <div className="page-bg__orb page-bg__orb--1" />
        <div className="page-bg__orb page-bg__orb--2" />
        <div className="page-bg__orb page-bg__orb--3" />
      </div>
      <input type="file" id="avatarInput" accept="image/*" aria-label="انتخاب تصویر پروفایل" onChange={onAvatar} hidden />
      <div className="toast-wrap" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.type}`}>
            {t.type === 'error' ? <AlertIcon /> : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            )}
            <span>{t.msg}</span>
          </div>
        ))}
      </div>

      <div className="page-wrap">
        <main className="auth-area" id="main">
          {!loggedIn ? (
            <div className="auth-container">
              <div className="step-indicator" role="list">
                {[1, 2, 3].flatMap((n) => {
                  const dot = (
                    <div className="step-indicator__item" role="listitem" key={`dot-${n}`}>
                      <div
                        className={`step-indicator__dot${step === n ? ' active' : ''}${step > n ? ' done' : ''}`}
                        aria-label={STEP_LABELS[n - 1]}
                      >
                        <span>{toPersianNumber(n)}</span>
                      </div>
                    </div>
                  );
                  if (n === 3) return [dot];
                  return [
                    dot,
                    <div key={`line-${n}`} className={`step-indicator__line${step > n ? ' done' : ''}`} />,
                  ];
                })}
              </div>

              <div className={`step${step === 1 ? ' active' : ''}`}>
                <div className="auth-card">
                  <div className="auth-card__ornament" />
                  <div className="auth-card__head">
                    <span className="auth-card__eyebrow">ورود / ثبت‌نام</span>
                    <h1 className="auth-card__title">خوش آمدید</h1>
                    <p className="auth-card__subtitle">برای ورود یا ثبت‌نام شماره موبایل و کد ملی خود را وارد کنید</p>
                  </div>
                  <div className="notice notice--error" hidden={!notice || step !== 1} role="alert">
                    <AlertIcon /><span>{notice}</span>
                  </div>
                  <form onSubmit={onStep1} noValidate>
                    <div className="field field--icon">
                      <label className="field__label" htmlFor="phone">شماره موبایل <span className="req">*</span></label>
                      <div className="field--icon">
                        <input
                          className={`field__input ltr${errors.phone ? ' field__input--error' : ''}`}
                          type="tel"
                          id="phone"
                          name="phone"
                          inputMode="tel"
                          autoComplete="tel"
                          placeholder="09xxxxxxxxx"
                          maxLength={11}
                          value={form.phone}
                          onChange={(e) => { setField('phone', e.target.value); setErrors((er) => ({ ...er, phone: '' })); }}
                          onBlur={(e) => {
                            const v = toEn(e.target.value).replace(/\D/g, '');
                            if (v && !/^09\d{9}$/.test(v)) setErrors((er) => ({ ...er, phone: 'شماره باید ۱۱ رقم و با ۰۹ شروع شود' }));
                            else setErrors((er) => ({ ...er, phone: '' }));
                          }}
                          required
                        />
                        <span className="field__ico"><PhoneIcon /></span>
                      </div>
                      <FieldError show={Boolean(errors.phone)} message={errors.phone} />
                    </div>
                    <div className="field field--icon">
                      <label className="field__label" htmlFor="nid">کد ملی <span className="req">*</span></label>
                      <div className="field--icon">
                        <input
                          className={`field__input ltr${errors.nid ? ' field__input--error' : ''}`}
                          type="text"
                          id="nid"
                          name="nid"
                          inputMode="numeric"
                          autoComplete="off"
                          placeholder="0000000000"
                          maxLength={10}
                          value={form.nid}
                          onChange={(e) => { setField('nid', e.target.value); setErrors((er) => ({ ...er, nid: '' })); }}
                          onBlur={() => {
                            const v = toEn(form.nid).replace(/\D/g, '');
                            if (v && v.length !== 10) setErrors((er) => ({ ...er, nid: 'کد ملی باید ۱۰ رقم باشد' }));
                            else setErrors((er) => ({ ...er, nid: '' }));
                          }}
                          required
                        />
                        <span className="field__ico"><IdIcon /></span>
                      </div>
                      <FieldError show={Boolean(errors.nid)} message={errors.nid} />
                    </div>
                    <div className="field">
                      <label className="field__label" htmlFor="captchaInput">کد امنیتی <span className="req">*</span></label>
                      <div className="captcha-wrap">
                        <input className={`field__input ltr${errors.captcha ? ' field__input--error' : ''}`} type="text" id="captchaInput" name="captcha" inputMode="numeric" autoComplete="off" placeholder="کد را وارد کنید" maxLength={5} value={captchaInput} onChange={(e) => { setCaptchaInput(e.target.value); setErrors((er) => ({ ...er, captcha: '' })); }} required />
                        <button className="captcha-box" type="button" onClick={() => { refreshCaptcha(); document.getElementById('captchaInput')?.focus(); }} title="کلیک برای بارگذاری مجدد" aria-label="کد امنیتی - کلیک برای تغییر">
                          <span className="captcha-code">{toPersianNumber(captcha)}</span>
                          <span className="captcha-refresh" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 7v5h-5" /><path d="M4 17v-5h5" /><path d="M7.5 7.5A7 7 0 0 1 19 10l1 2" /><path d="M16.5 16.5A7 7 0 0 1 5 14l-1-2" /></svg>
                          </span>
                        </button>
                      </div>
                      <FieldError show={Boolean(errors.captcha)} message={errors.captcha} />
                      <p className="field__hint">کد نمایش داده شده را عیناً وارد کنید</p>
                    </div>
                    <button className={`btn btn--primary btn--block${loading === 'step1' ? ' btn--loading' : ''}`} type="submit" disabled={loading === 'step1'}>
                      <PhoneIcon strokeWidth={2} />
                      <span className="btn-label">ارسال کد تأیید</span>
                    </button>
                    <p style={{ fontSize: 11, color: 'var(--text-4)', textAlign: 'center', marginTop: 16, lineHeight: 1.7 }}>
                      با ادامه، <a href="#" style={{ color: 'var(--c-brown)' }}>شرایط استفاده</a> و <a href="#" style={{ color: 'var(--c-brown)' }}>حریم خصوصی</a> هستی را می‌پذیرید
                    </p>
                  </form>
                </div>
              </div>

              <div className={`step${step === 2 ? ' active' : ''}`}>
                <div className="auth-card">
                  <div className="auth-card__ornament" />
                  <div className="auth-card__head">
                    <span className="auth-card__eyebrow">تأیید هویت</span>
                    <h1 className="auth-card__title">کد تأیید را وارد کنید</h1>
                  </div>
                  <p className="otp-info">کد ۶ رقمی برای شماره <strong>{toPersianNumber(form.phone)}</strong> ارسال شد</p>
                  <div className="notice notice--error" hidden={!notice || step !== 2} role="alert">
                    <AlertIcon /><span>{notice}</span>
                  </div>
                  <div className="otp-wrap" aria-label="کد تأیید ۶ رقمی">
                    {otp.map((d, i) => (
                      <input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el; }}
                        className={`otp-input${d ? ' filled' : ''}`}
                        type="tel"
                        maxLength={1}
                        inputMode="numeric"
                        autoComplete={i === 0 ? 'one-time-code' : 'off'}
                        aria-label={OTP_LABELS[i]}
                        value={d ? toPersianNumber(d) : ''}
                        onChange={(e) => onOtpChange(i, e.target.value)}
                        onKeyDown={(e) => onOtpKey(i, e)}
                        onPaste={onOtpPaste}
                      />
                    ))}
                  </div>
                  <div className="otp-actions">
                    <span>کد دریافت نکردید؟</span>
                    <button
                      className="otp-resend"
                      type="button"
                      disabled={timer > 0}
                      onClick={() => {
                        const code = String(Math.floor(100000 + Math.random() * 900000));
                        setOtpCode(code);
                        setOtp(['', '', '', '', '', '']);
                        setTimer(120);
                        showToast('کد جدید ارسال شد', 'success');
                      }}
                    >
                      ارسال مجدد
                    </button>
                    <span className="otp-timer">{timerLabel}</span>
                  </div>
                  <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
                    <button className="btn btn--ghost" type="button" onClick={() => { setTimer(0); setNotice(''); setStep(1); }} style={{ flex: '0 0 auto', padding: '0 20px' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>
                    <button className={`btn btn--primary${loading === 'otp' ? ' btn--loading' : ''}`} type="button" onClick={onVerify} style={{ flex: 1 }} disabled={loading === 'otp'}>
                      <span className="btn-label">تأیید کد</span>
                    </button>
                  </div>
                  <p style={{ fontSize: 11, color: 'rgba(198,172,143,.3)', textAlign: 'center', marginTop: 16 }}>
                    کد نمایشی: <span style={{ color: 'var(--c-tan)', fontWeight: 700, letterSpacing: 4 }}>{toPersianNumber(otpCode)}</span>
                  </p>
                </div>
              </div>

              <div className={`step${step === 3 ? ' active' : ''}`}>
                <div className="auth-card">
                  <div className="auth-card__ornament" />
                  <div className="auth-card__head">
                    <span className="auth-card__eyebrow">تکمیل ثبت‌نام</span>
                    <h1 className="auth-card__title">اطلاعات خود را وارد کنید</h1>
                    <p className="auth-card__subtitle">یک بار این مرحله را تکمیل کنید تا دسترسی کامل داشته باشید</p>
                  </div>
                  <div className="notice notice--error" hidden={!notice || step !== 3} role="alert">
                    <AlertIcon /><span>{notice}</span>
                  </div>
                  <form onSubmit={onComplete} noValidate>
                    <div className="field-row">
                      <div className="field">
                        <label className="field__label" htmlFor="firstName">نام <span className="req">*</span></label>
                        <input className={`field__input${errors.firstName ? ' field__input--error' : ''}`} type="text" id="firstName" name="firstName" autoComplete="given-name" value={form.firstName} onChange={(e) => setField('firstName', e.target.value)} placeholder="نام خود را وارد کنید" required />
                        <FieldError show={Boolean(errors.firstName)} message={errors.firstName} />
                      </div>
                      <div className="field">
                        <label className="field__label" htmlFor="lastName">نام خانوادگی <span className="req">*</span></label>
                        <input className={`field__input${errors.lastName ? ' field__input--error' : ''}`} type="text" id="lastName" name="lastName" autoComplete="family-name" value={form.lastName} onChange={(e) => setField('lastName', e.target.value)} placeholder="نام خانوادگی" required />
                        <FieldError show={Boolean(errors.lastName)} message={errors.lastName} />
                      </div>
                    </div>
                    <div className="field">
                      <label className="field__label" htmlFor="username">نام کاربری <span className="req">*</span></label>
                      <input className={`field__input ltr${errors.username ? ' field__input--error' : ''}`} type="text" id="username" name="username" autoComplete="username" value={form.username} onChange={(e) => setField('username', e.target.value)} placeholder="username" required />
                      <FieldError show={Boolean(errors.username)} message={errors.username} />
                      <p className="field__hint">فقط حروف انگلیسی، اعداد و underscore — حداقل ۳ کاراکتر</p>
                    </div>
                    <div className="field">
                      <label className="field__label" htmlFor="password">رمز عبور <span className="req">*</span></label>
                      <div className="pw-wrap">
                        <input className={`field__input${errors.password ? ' field__input--error' : ''}`} type={showPass.pw ? 'text' : 'password'} id="password" name="password" autoComplete="new-password" value={form.password} onChange={(e) => setField('password', e.target.value)} placeholder="حداقل ۸ کاراکتر" required />
                        <button className="pw-toggle" type="button" onClick={() => setShowPass((s) => ({ ...s, pw: !s.pw }))} aria-label={showPass.pw ? 'مخفی کردن رمز عبور' : 'نمایش رمز عبور'}><EyeIcon off={showPass.pw} /></button>
                      </div>
                      <FieldError show={Boolean(errors.password)} message={errors.password} />
                    </div>
                    <div className="field">
                      <label className="field__label" htmlFor="passwordConfirm">تکرار رمز عبور <span className="req">*</span></label>
                      <div className="pw-wrap">
                        <input className={`field__input${errors.passwordConfirm ? ' field__input--error' : ''}`} type={showPass.confirm ? 'text' : 'password'} id="passwordConfirm" name="passwordConfirm" autoComplete="new-password" value={form.passwordConfirm || ''} onChange={(e) => setField('passwordConfirm', e.target.value)} placeholder="رمز عبور را تکرار کنید" required />
                        <button className="pw-toggle" type="button" onClick={() => setShowPass((s) => ({ ...s, confirm: !s.confirm }))} aria-label={showPass.confirm ? 'مخفی کردن رمز عبور' : 'نمایش تکرار رمز عبور'}><EyeIcon off={showPass.confirm} /></button>
                      </div>
                      <FieldError show={Boolean(errors.passwordConfirm)} message={errors.passwordConfirm} />
                    </div>
                    <button className={`btn btn--primary btn--block${loading === 'step3' ? ' btn--loading' : ''}`} type="submit" disabled={loading === 'step3'}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
                      <span className="btn-label">تکمیل ثبت‌نام</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <div className="profile-wrap">
              <div className="profile-hero">
                <div className="profile-hero__banner"><div className="profile-hero__banner-pattern" /></div>
                <div className="profile-hero__body">
                  <div className="profile-avatar-wrap">
                    <div className="profile-avatar">
                      {display.avatarSrc ? <img src={display.avatarSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : <TabIcon name="user" strokeWidth={1.5} />}
                    </div>
                    <label className="profile-avatar-btn" htmlFor="avatarInput" title="تغییر تصویر پروفایل">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                    </label>
                  </div>
                  <div className="profile-hero__info">
                    <div className="profile-hero__name">{`${display.firstName || ''} ${display.lastName || ''}`.trim() || '—'}</div>
                    <div className="profile-hero__username">@{display.username || '—'}</div>
                    <div className="profile-hero__badges">
                      <span className="badge badge--gold">
                        <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                        عضو طلایی
                      </span>
                      <span className="badge badge--tan">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
                        حساب تأیید شده
                      </span>
                    </div>
                  </div>
                  <div style={{ marginRight: 'auto', flexShrink: 0 }}>
                    <button className="btn btn--ghost" type="button" onClick={logout} style={{ height: 40, padding: '0 18px', fontSize: 13 }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                      خروج
                    </button>
                  </div>
                </div>
              </div>

              <div className="stats-row">
                <div className="stat-box"><div className="stat-box__val">{toPersianNumber(0)}</div><div className="stat-box__key">سفارش</div></div>
                <div className="stat-box"><div className="stat-box__val">{toPersianNumber(wishItems.length)}</div><div className="stat-box__key">علاقه‌مندی</div></div>
                <div className="stat-box"><div className="stat-box__val">۱٬۲۵۰</div><div className="stat-box__key">امتیاز</div></div>
              </div>

              <div className="profile-tabs" role="tablist">
                {TABS.map((item) => (
                  <button key={item.id} className={`profile-tab${tab === item.id ? ' active' : ''}`} role="tab" aria-selected={tab === item.id} type="button" onClick={() => setTab(item.id)}>
                    <TabIcon name={item.icon} />
                    {item.label}
                  </button>
                ))}
              </div>

              {tab === 'info' && (
                <div className="tab-panel active">
                  <div className="info-grid">
                    <div className="info-card">
                      <div className="info-card__head">
                        <div className="info-card__title"><TabIcon name="user" />مشخصات شخصی</div>
                        <button className="info-card__edit" type="button" onClick={() => setTab('edit')}><TabIcon name="edit" strokeWidth={2} />ویرایش</button>
                      </div>
                      <div className="info-row"><span className="info-row__key">نام</span><span className="info-row__val">{display.firstName || '—'}</span></div>
                      <div className="info-row"><span className="info-row__key">نام خانوادگی</span><span className="info-row__val">{display.lastName || '—'}</span></div>
                      <div className="info-row"><span className="info-row__key">نام کاربری</span><span className="info-row__val" style={{ direction: 'ltr', textAlign: 'left' }}>{display.username || '—'}</span></div>
                      <div className="info-row"><span className="info-row__key">موبایل</span><span className="info-row__val" style={{ direction: 'ltr', textAlign: 'left' }}>{toPersianNumber(display.phone || '—')}</span></div>
                      <div className="info-row"><span className="info-row__key">کد ملی</span><span className="info-row__val" style={{ direction: 'ltr', textAlign: 'left' }}>{toPersianNumber(display.nid || '—')}</span></div>
                    </div>
                    <div className="info-card">
                      <div className="info-card__head">
                        <div className="info-card__title">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                          آدرس و تماس
                        </div>
                        <button className="info-card__edit" type="button" onClick={() => setTab('edit')}><TabIcon name="edit" strokeWidth={2} />ویرایش</button>
                      </div>
                      <div className="info-row"><span className="info-row__key">ایمیل</span><InfoVal value={display.email} /></div>
                      <div className="info-row"><span className="info-row__key">استان</span><InfoVal value={display.province} /></div>
                      <div className="info-row"><span className="info-row__key">شهر</span><InfoVal value={display.city} /></div>
                      <div className="info-row"><span className="info-row__key">کد پستی</span><InfoVal value={display.postal} /></div>
                      <div className="info-row"><span className="info-row__key">آدرس</span><InfoVal value={display.address} address /></div>
                    </div>
                  </div>
                </div>
              )}

              {tab === 'edit' && (
                <div className="tab-panel active">
                  <div className="avatar-upload">
                    <label className="avatar-big" htmlFor="avatarInput" aria-label="تغییر تصویر پروفایل">
                      {display.avatarSrc ? (
                        <img src={display.avatarSrc} alt="پروفایل" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                      )}
                    </label>
                    <div className="avatar-upload__info">
                      <div className="avatar-upload__title">تصویر پروفایل</div>
                      <div className="avatar-upload__desc">فرمت JPG، PNG یا WebP<br />حداکثر ۵ مگابایت</div>
                    </div>
                  </div>
                  <form onSubmit={saveProfile} noValidate>
                    <div className="profile-form-section">
                      <div className="profile-form-section__title">مشخصات شخصی</div>
                      <div className="field-row">
                        <div className="field">
                          <label className="field__label">نام</label>
                          <input className="field__input" value={form.firstName} onChange={(e) => setField('firstName', e.target.value)} placeholder="نام" />
                        </div>
                        <div className="field">
                          <label className="field__label">نام خانوادگی</label>
                          <input className="field__input" value={form.lastName} onChange={(e) => setField('lastName', e.target.value)} placeholder="نام خانوادگی" />
                        </div>
                      </div>
                      <div className="field">
                        <label className="field__label">نام کاربری</label>
                        <input className="field__input ltr" value={form.username} onChange={(e) => setField('username', e.target.value)} placeholder="username" />
                      </div>
                      <div className="field">
                        <label className="field__label">ایمیل</label>
                        <input className="field__input ltr" type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} placeholder="example@mail.com" />
                      </div>
                    </div>
                    <div className="profile-form-section">
                      <div className="profile-form-section__title">آدرس و موقعیت</div>
                      <div className="field-row">
                        <div className="field">
                          <label className="field__label">استان</label>
                          <select className="field__select" value={form.province} onChange={(e) => setField('province', e.target.value)}>
                            <option value="">انتخاب استان</option>
                            {PROVINCES.map((p) => <option key={p}>{p}</option>)}
                          </select>
                        </div>
                        <div className="field">
                          <label className="field__label">شهر</label>
                          <input className="field__input" value={form.city} onChange={(e) => setField('city', e.target.value)} placeholder="شهر" />
                        </div>
                      </div>
                      <div className="field">
                        <label className="field__label">کد پستی</label>
                        <input className="field__input ltr" inputMode="numeric" maxLength={10} value={form.postal} onChange={(e) => setField('postal', e.target.value)} placeholder="0000000000" />
                      </div>
                      <div className="field">
                        <label className="field__label">آدرس دقیق</label>
                        <textarea className="field__textarea" rows={3} value={form.address} onChange={(e) => setField('address', e.target.value)} placeholder="خیابان، کوچه، پلاک و واحد" />
                      </div>
                    </div>
                    <div className="form-actions">
                      <button className="btn btn--primary" type="submit" style={{ minWidth: 160 }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
                        <span className="btn-label">ذخیره تغییرات</span>
                      </button>
                      <button className="btn btn--ghost" type="button" onClick={() => setTab('info')} style={{ minWidth: 100 }}>انصراف</button>
                    </div>
                  </form>
                </div>
              )}

              {tab === 'orders' && (
                <div className="tab-panel active">
                  <div className="stats-row" style={{ marginBottom: 20 }}>
                    <div className="stat-box"><div className="stat-box__val">{toPersianNumber(3)}</div><div className="stat-box__key">کل سفارش‌ها</div></div>
                    <div className="stat-box"><div className="stat-box__val">{toPersianNumber(1)}</div><div className="stat-box__key">در حال پردازش</div></div>
                    <div className="stat-box" style={{ direction: 'ltr' }}><div className="stat-box__val" style={{ fontSize: 18 }}>۴٬۸۵۰٬۰۰۰</div><div className="stat-box__key" style={{ direction: 'rtl' }}>مجموع خرید (ت)</div></div>
                  </div>
                  <div className="orders-list">
                    {DEMO_ORDERS.map((order) => (
                      <div className="order-item" key={order.meta}>
                        <div className="order-item__img"><TabIcon name="bag" strokeWidth={1.5} /></div>
                        <div className="order-item__info">
                          <div className="order-item__name">{order.name}</div>
                          <div className="order-item__meta">{order.meta}</div>
                        </div>
                        <span className={`order-item__status order-item__status--${order.status}`}>{order.statusLabel}</span>
                        <span className="order-item__price">{order.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === 'loyalty' && (
                <div className="tab-panel active">
                  <div className="loyalty-card" style={{ marginBottom: 20 }}>
                    <div className="loyalty-card__tier">
                      <div className="loyalty-card__tier-icon">
                        <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                      </div>
                      <div>
                        <div className="loyalty-card__tier-name">عضو طلایی</div>
                        <div className="loyalty-card__tier-sub">هستی گلد کاردر</div>
                      </div>
                    </div>
                    <div className="loyalty-progress-wrap">
                      <div className="loyalty-progress-label">
                        <span>۱٬۲۵۰ امتیاز کسب شده</span>
                        <span>۵٬۰۰۰ امتیاز برای الماس</span>
                      </div>
                      <div className="loyalty-progress-bar"><div className="loyalty-progress-fill" style={{ width: '25%' }} /></div>
                    </div>
                    <div className="loyalty-points">
                      <div className="loyalty-point"><div className="loyalty-point__val">۱٬۲۵۰</div><div className="loyalty-point__key">امتیاز کل</div></div>
                      <div className="loyalty-point"><div className="loyalty-point__val">۳۲۰</div><div className="loyalty-point__key">قابل استفاده</div></div>
                      <div className="loyalty-point"><div className="loyalty-point__val">{toPersianNumber(3)}</div><div className="loyalty-point__key">سطح</div></div>
                    </div>
                  </div>
                  <div className="info-grid">
                    <div className="info-card">
                      <div className="info-card__head"><div className="info-card__title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>تاریخچه امتیاز</div></div>
                      <div className="info-row"><span className="info-row__key">خرید #HH-۱۰۰۳</span><span className="info-row__val" style={{ color: 'var(--c-gold)' }}>+۲۴۵ امتیاز</span></div>
                      <div className="info-row"><span className="info-row__key">خرید #HH-۱۰۰۸</span><span className="info-row__val" style={{ color: 'var(--c-gold)' }}>+۱۲۰ امتیاز</span></div>
                      <div className="info-row"><span className="info-row__key">ثبت‌نام</span><span className="info-row__val" style={{ color: 'var(--c-gold)' }}>+۱۰۰ امتیاز</span></div>
                      <div className="info-row"><span className="info-row__key">تکمیل پروفایل</span><span className="info-row__val" style={{ color: 'var(--c-gold)' }}>+۵۰ امتیاز</span></div>
                    </div>
                    <div className="info-card">
                      <div className="info-card__head"><div className="info-card__title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20 12V22H4V12" /><path d="M22 7H2v5h20V7z" /><path d="M12 22V7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" /></svg>مزایای عضویت</div></div>
                      <div className="info-row"><span className="info-row__key">تخفیف خرید بعدی</span><span className="info-row__val" style={{ color: 'var(--c-tan)' }}>%۵</span></div>
                      <div className="info-row"><span className="info-row__key">ارسال رایگان از</span><span className="info-row__val" style={{ color: 'var(--c-tan)' }}>۱۰ میلیون</span></div>
                      <div className="info-row"><span className="info-row__key">اولویت پشتیبانی</span><span className="info-row__val" style={{ color: '#1e7e3e' }}>فعال</span></div>
                      <div className="info-row"><span className="info-row__key">دسترسی پیش‌فروش</span><span className="info-row__val" style={{ color: '#1e7e3e' }}>فعال</span></div>
                    </div>
                  </div>
                </div>
              )}

              {tab === 'security' && (
                <div className="tab-panel active">
                  <div className="info-grid">
                    <div className="info-card info-card--full">
                      <div className="info-card__head"><div className="info-card__title"><TabIcon name="lock" />امنیت حساب</div></div>
                      <div className="info-row"><span className="info-row__key">موبایل</span><span className="info-row__val" style={{ direction: 'ltr', textAlign: 'left' }}>{toPersianNumber(display.phone || '—')}</span></div>
                      <div className="info-row"><span className="info-row__key">آخرین ورود</span><span className="info-row__val">همین الان</span></div>
                      <div className="info-row"><span className="info-row__key">وضعیت احراز هویت</span><span className="info-row__val" style={{ color: '#1e7e3e' }}>تأیید شده</span></div>
                    </div>
                    <div className="info-card info-card--full">
                      <div className="info-card__head"><div className="info-card__title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>تغییر رمز عبور</div></div>
                      <form onSubmit={changePassword} noValidate style={{ marginTop: 4 }}>
                        <div className="field">
                          <label className="field__label">رمز عبور فعلی</label>
                          <div className="pw-wrap">
                            <input className="field__input" type={showPass.current ? 'text' : 'password'} value={passForm.current} onChange={(e) => setPassForm((p) => ({ ...p, current: e.target.value }))} placeholder="رمز عبور فعلی" />
                            <button className="pw-toggle" type="button" onClick={() => setShowPass((s) => ({ ...s, current: !s.current }))} aria-label="نمایش"><EyeIcon off={showPass.current} /></button>
                          </div>
                        </div>
                        <div className="field-row">
                          <div className="field">
                            <label className="field__label">رمز عبور جدید</label>
                            <input className="field__input" type="password" value={passForm.next} onChange={(e) => setPassForm((p) => ({ ...p, next: e.target.value }))} placeholder="رمز جدید" />
                          </div>
                          <div className="field">
                            <label className="field__label">تکرار رمز جدید</label>
                            <input className="field__input" type="password" value={passForm.confirm} onChange={(e) => setPassForm((p) => ({ ...p, confirm: e.target.value }))} placeholder="تکرار رمز جدید" />
                          </div>
                        </div>
                        <div className="form-actions">
                          <button className="btn btn--primary" type="submit" style={{ minWidth: 160 }}><span className="btn-label">تغییر رمز عبور</span></button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {tab === 'wishlist' && (
                <div className="tab-panel active">
                  {!wishItems.length ? (
                    <div className="wishlist-empty">
                      <div className="wishlist-empty__icon"><TabIcon name="heart" strokeWidth={1.2} /></div>
                      <div className="wishlist-empty__title">هنوز محصولی اضافه نکردید</div>
                      <div className="wishlist-empty__desc">محصولات موردعلاقه‌تان را با کلیک روی آیکون قلب ذخیره کنید</div>
                      <SmartLink href="/#products" className="btn btn--primary" style={{ display: 'inline-flex', minWidth: 180, marginTop: 8 }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
                        <span>مشاهده محصولات</span>
                      </SmartLink>
                    </div>
                  ) : (
                    <div className="wishlist-grid">
                      {wishItems.map((p) => (
                        <div className="wishlist-card" key={p.id}>
                          <div className="wishlist-card__img">
                            <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div className="wishlist-card__body">
                            <SmartLink href={`/product/${p.id}`} className="wishlist-card__name">{p.name}</SmartLink>
                            <div className="wishlist-card__price">{toPersianNumber(formatPrice(currentPrice(p)))} تومان</div>
                          </div>
                          <button className="wishlist-card__remove" type="button" title="حذف از علاقه‌مندی‌ها" onClick={() => dropWish(p.id)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
