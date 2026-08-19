import SmartLink from '../components/SmartLink';

export default function NotFoundPage() {
  return (
    <main id="main">
      <section className="page-hero">
        <div className="container">
          <span className="page-hero__eyebrow fade-up">۴۰۴</span>
          <h1 className="page-hero__title fade-up">صفحه مورد نظر پیدا نشد</h1>
          <p className="page-hero__desc fade-up">
            این مسیر در فروشگاه هستی وجود ندارد. می‌توانید به صفحه اصلی برگردید یا محصولات را ببینید.
          </p>
          <div className="not-found-actions fade-up">
            <SmartLink href="/" className="btn btn--solid-light">بازگشت به خانه</SmartLink>
            <SmartLink href="/#products" className="btn btn--outline-light">مشاهده محصولات</SmartLink>
          </div>
        </div>
      </section>
    </main>
  );
}
