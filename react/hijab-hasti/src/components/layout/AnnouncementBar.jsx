import { ANNOUNCEMENT_ITEMS, SOCIAL_LINKS } from '../../data/siteData';
import { SocialIcon } from '../icons/SocialIcons';

function AnnouncementDot() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

export default function AnnouncementBar() {
  const items = [...ANNOUNCEMENT_ITEMS, ...ANNOUNCEMENT_ITEMS];

  return (
    <div className="announcement" role="region" aria-label="Store announcements">
      <div className="announcement__social">
        {SOCIAL_LINKS.map((link) => (
          <a key={link.id} href={link.href} target="_blank" rel="noreferrer" aria-label={link.label}>
            <SocialIcon type={link.id} />
          </a>
        ))}
      </div>

      <div className="announcement__ticker">
        <div className="announcement__track" aria-hidden="false">
          {items.map((text, index) => (
            <span
              key={`${text}-${index}`}
              className="announcement__item"
              aria-hidden={index >= ANNOUNCEMENT_ITEMS.length}
            >
              <AnnouncementDot />
              {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
