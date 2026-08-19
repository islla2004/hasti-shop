import { Link } from 'react-router-dom';

export default function SmartLink({ href, to, children, className, ...rest }) {
  const target = to || href || '/';
  const isExternal = /^https?:\/\//.test(target) || target.startsWith('mailto:') || target.startsWith('tel:');

  if (isExternal) {
    return (
      <a href={target} className={className} target="_blank" rel="noreferrer" {...rest}>
        {children}
      </a>
    );
  }

  return (
    <Link to={target} className={className} {...rest}>
      {children}
    </Link>
  );
}
