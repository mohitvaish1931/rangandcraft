import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Clock, Mail, MapPin, Phone, Send } from 'lucide-react';
import Seo from '../components/Seo';
import WhatsAppIcon from '../components/WhatsAppIcon';
import { API_ENDPOINTS, postJSON } from '../utils/api';
import { errorMessage } from '../lib/format';
import { useToast } from '../lib/toast';
import { SUPPORT_EMAIL, SUPPORT_PHONE, whatsappLink } from '../lib/brand';

const STUDIO_ADDRESS = '455, Mandhi Khatikan, Pahadiya Chowk, Jaipur - 302002, Rajasthan, India';
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(STUDIO_ADDRESS)}`;

const SUBJECTS = [
  { value: 'order', label: 'Order, delivery or exchange' },
  { value: 'sizing', label: 'Sizing & styling help' },
  { value: 'wholesale', label: 'Wholesale / franchise' },
  { value: 'custom', label: 'Custom or bulk orders' },
  { value: 'other', label: 'Something else' },
];

const Contact = () => {
  const toast = useToast();
  const [params] = useSearchParams();
  const initialSubject = SUBJECTS.some((s) => s.value === params.get('subject')) ? params.get('subject')! : '';
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: initialSubject, message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');

  const set = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatus('sending');
    try {
      await postJSON(API_ENDPOINTS.CONTACT, form);
      setStatus('sent');
      toast.success('Message sent — we’ll get back to you soon.');
    } catch (err) {
      setStatus('idle');
      setError(errorMessage(err));
    }
  };

  const cards = [
    { icon: <WhatsAppIcon width={22} height={22} />, title: 'WhatsApp', text: 'Fastest replies for orders & sizing', action: 'Chat now', href: whatsappLink('Hi Rang and Craft!'), external: true },
    { icon: <Phone size={22} strokeWidth={1.4} />, title: 'Call us', text: SUPPORT_PHONE, action: 'Call now', href: `tel:${SUPPORT_PHONE.replace(/\s/g, '')}` },
    { icon: <Mail size={22} strokeWidth={1.4} />, title: 'Email', text: SUPPORT_EMAIL, action: 'Send email', href: `mailto:${SUPPORT_EMAIL}` },
    { icon: <MapPin size={22} strokeWidth={1.4} />, title: 'Studio', text: 'Pahadiya Chowk, Jaipur', action: 'Get directions', href: MAPS_URL, external: true },
  ];

  return (
    <>
      <Seo title="Contact Us" description="Get in touch with Rang and Craft, Jaipur — WhatsApp, phone, email or visit our studio." path="/contact" />
      <header className="rc-page-head">
        <div className="rc-container">
          <span className="rc-eyebrow">We’d love to hear from you</span>
          <h1 className="rc-h1">Contact us</h1>
          <p className="rc-lead">Questions about an order, sizing, or wholesale? Our team in Jaipur is here to help.</p>
        </div>
      </header>

      <div className="rc-container rc-section" style={{ paddingTop: 40 }}>
        <div className="rc-grid" style={{ marginBottom: 48 }}>
          {cards.map((c) => (
            <a key={c.title} href={c.href} {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="rc-panel" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ color: 'var(--rc-gold)' }}>{c.icon}</span>
              <strong style={{ fontWeight: 500, fontSize: 17 }}>{c.title}</strong>
              <span className="rc-muted" style={{ fontSize: 14, wordBreak: 'break-word' }}>{c.text}</span>
              <span className="rc-link" style={{ marginTop: 'auto', alignSelf: 'flex-start', fontSize: 12 }}>{c.action}</span>
            </a>
          ))}
        </div>

        <div className="rc-checkout">
          <section className="rc-panel">
            <h2 className="rc-panel__title">Send us a message</h2>
            {status === 'sent' ? (
              <div className="rc-alert rc-alert--success" style={{ flexDirection: 'column' }}>
                <strong>Thank you, {form.name.split(' ')[0]}!</strong>
                <span>Your message has reached our team. We usually reply within 24 hours (Mon–Sat). For anything urgent, <a href={whatsappLink('Hi! I just sent a message on your website.')} target="_blank" rel="noopener noreferrer">WhatsApp us</a>.</span>
              </div>
            ) : (
              <form onSubmit={submit} className="rc-form-grid">
                {error && <div className="rc-alert rc-alert--error rc-span-2" role="alert">{error}</div>}
                <div className="rc-field">
                  <label className="rc-label" htmlFor="ct-name">Name</label>
                  <input id="ct-name" name="name" className="rc-input" required autoComplete="name" value={form.name} onChange={set} />
                </div>
                <div className="rc-field">
                  <label className="rc-label" htmlFor="ct-email">Email</label>
                  <input id="ct-email" name="email" type="email" className="rc-input" required autoComplete="email" value={form.email} onChange={set} />
                </div>
                <div className="rc-field">
                  <label className="rc-label" htmlFor="ct-phone">Phone <span className="rc-muted">(optional)</span></label>
                  <input id="ct-phone" name="phone" type="tel" className="rc-input" autoComplete="tel" value={form.phone} onChange={set} />
                </div>
                <div className="rc-field">
                  <label className="rc-label" htmlFor="ct-subject">Topic</label>
                  <select id="ct-subject" name="subject" className="rc-select" required value={form.subject} onChange={set}>
                    <option value="" disabled>Select a topic</option>
                    {SUBJECTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div className="rc-field rc-span-2">
                  <label className="rc-label" htmlFor="ct-message">Message</label>
                  <textarea id="ct-message" name="message" className="rc-textarea" required minLength={5} maxLength={3000} value={form.message} onChange={set} placeholder={form.subject === 'order' ? 'Please include your order number' : 'How can we help?'} />
                </div>
                <div className="rc-span-2">
                  <button type="submit" className="rc-btn rc-btn--lg" disabled={status === 'sending'}>
                    {status === 'sending' ? <span className="rc-spinner" /> : <><Send size={16} /> Send message</>}
                  </button>
                </div>
              </form>
            )}
          </section>

          <aside className="rc-panel" style={{ display: 'grid', gap: 20, alignContent: 'start' }}>
            <div>
              <span className="rc-eyebrow"><Clock size={14} /> Hours</span>
              <p style={{ marginTop: 8 }}>Monday – Saturday, 10 AM – 7 PM<br /><span className="rc-muted">Closed on Sundays</span></p>
            </div>
            <div>
              <span className="rc-eyebrow">Studio</span>
              <p style={{ marginTop: 8 }}>{STUDIO_ADDRESS}</p>
              <a className="rc-link" href={MAPS_URL} target="_blank" rel="noopener noreferrer" style={{ marginTop: 10 }}>Open in Google Maps</a>
            </div>
            <div>
              <span className="rc-eyebrow">Quick help</span>
              <ul className="rc-bullets" style={{ marginTop: 10 }}>
                <li><Link to="/track-order">Track your order</Link></li>
                <li><Link to="/refund-policy">Exchanges & refunds</Link></li>
                <li><Link to="/shipping-policy">Shipping times</Link></li>
                <li><Link to="/faq">FAQs</Link></li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};

export default Contact;
