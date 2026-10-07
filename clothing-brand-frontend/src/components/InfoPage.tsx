import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mail, Phone } from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { SUPPORT_EMAIL, SUPPORT_PHONE, whatsappLink } from '../lib/brand';

const POLICY_LINKS = [
  { to: '/shipping-policy', label: 'Shipping' },
  { to: '/refund-policy', label: 'Exchanges & refunds' },
  { to: '/privacy-policy', label: 'Privacy' },
  { to: '/terms-conditions', label: 'Terms' },
  { to: '/accessibility', label: 'Accessibility' },
];

interface InfoHeroProps {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  meta?: string;
  /** Show the row of sibling policy links. */
  policyNav?: boolean;
  children?: ReactNode;
}

export const InfoHero = ({ eyebrow, title, intro, meta, policyNav, children }: InfoHeroProps) => {
  const { pathname } = useLocation();
  return (
    <header className="rc-info-hero">
      <div className="rc-container">
        <span className="rc-eyebrow">{eyebrow}</span>
        <h1 className="rc-info-hero__title">{title}</h1>
        {intro && <p className="rc-lead">{intro}</p>}
        {meta && <p className="rc-info-hero__meta">{meta}</p>}
        {children}
        {policyNav && (
          <nav className="rc-info-nav" aria-label="Store policies">
            {POLICY_LINKS.map((l) => (
              <Link key={l.to} to={l.to} aria-current={pathname === l.to ? 'page' : undefined}>{l.label}</Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};

export interface PolicyItem {
  icon?: ReactNode;
  title: string;
  body: ReactNode;
}

export const PolicyList = ({ items }: { items: PolicyItem[] }) => (
  <ol className="rc-policy">
    {items.map((item) => (
      <li className="rc-policy__item" key={item.title} data-reveal="up">
        <span className="rc-policy__num" aria-hidden />
        <div>
          <h2 className="rc-policy__title">{item.icon}{item.title}</h2>
          <div className="rc-policy__body">{item.body}</div>
        </div>
      </li>
    ))}
  </ol>
);

interface HelpBandProps {
  eyebrow?: string;
  title: string;
  text: string;
  message?: string;
}

export const HelpBand = ({ eyebrow = 'We’re here to help', title, text, message = 'Hi Rang and Craft! I need some help.' }: HelpBandProps) => (
  <section className="rc-help" aria-labelledby="rc-help-title">
    <div className="rc-band" data-reveal="up">
      <div>
        <span className="rc-eyebrow">{eyebrow}</span>
        <h2 className="rc-h2" id="rc-help-title" style={{ marginTop: 10 }}>{title}</h2>
        <p>{text}</p>
      </div>
      <div className="rc-help__actions">
        <a className="rc-btn rc-btn--light" href={whatsappLink(message)} target="_blank" rel="noreferrer">
          <WhatsAppIcon width={18} height={18} /> WhatsApp us
        </a>
        <a className="rc-btn rc-btn--ghost-light" href={`mailto:${SUPPORT_EMAIL}`}><Mail size={16} /> Email</a>
        <a className="rc-btn rc-btn--ghost-light" href={`tel:${SUPPORT_PHONE.replace(/\s/g, '')}`}><Phone size={16} /> Call</a>
      </div>
    </div>
  </section>
);
