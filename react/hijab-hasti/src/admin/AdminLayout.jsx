import { useLayoutEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import '../styles/admin-shared.css';

export default function AdminLayout() {
  const location = useLocation();
  const hasSession = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('hasti_admin_session');

  useLayoutEffect(() => {
    document.documentElement.lang = 'fa';
    document.documentElement.dir = 'rtl';
    document.body.classList.add('admin-app');
    return () => {
      document.body.classList.remove('admin-app');
    };
  }, []);

  if (!hasSession) {
    const next = location.pathname.replace(/^\/admin\/?/, '') + location.search;
    return <Navigate to={`/admin/login?next=${encodeURIComponent(next)}`} replace />;
  }

  return (
    <>
      <a href="#main" className="skip-link">پرش به محتوای اصلی</a>
      <main className="admin-main">
        <div className="admin-body" id="main">
          <Outlet />
        </div>
      </main>
    </>
  );
}
