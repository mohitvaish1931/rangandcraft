import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import Seo from '../components/Seo';
import { HelpBand, InfoHero } from '../components/InfoPage';
import { formatPrice } from '../lib/format';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '../lib/offers';

interface Faq {
  q: string;
  a: string;
  link?: { to: string; label: string };
}

const FREE = formatPrice(FREE_SHIPPING_THRESHOLD);

const GROUPS: { title: string; items: Faq[] }[] = [
  {
    title: 'Orders & shipping',
    items: [
      {
        q: 'What are the shipping charges?',
        a: `Shipping is free on all orders of ${FREE} and above across India. Orders below ${FREE} have a flat shipping fee of ${formatPrice(SHIPPING_FEE)}, shown in your bag before you pay.`,
        link: { to: '/shipping-policy', label: 'Read the shipping policy' },
      },
      {
        q: 'How long will it take to receive my order?',
        a: 'Orders are usually dispatched within 2–3 working days. Once shipped, delivery takes 4–8 working days depending on your location.',
      },
      {
        q: 'How do I track my order?',
        a: 'Once your order ships you’ll get the courier name and tracking number. You can check the status any time with your order number and email.',
        link: { to: '/track-order', label: 'Track your order' },
      },
      {
        q: 'Do I need an account to order?',
        a: 'No. You can check out as a guest. Creating an account lets you save your wishlist and see all your orders in one place.',
      },
      {
        q: 'Do you ship internationally?',
        a: 'Right now we ship only within India. We’re working on bringing Rang and Craft to customers abroad soon.',
      },
    ],
  },
  {
    title: 'Offers & payments',
    items: [
      {
        q: 'How do the “any 2 @ ₹1499” offers work?',
        a: 'Add any 2 short kurtas, or any 2 half sleeve shirts, to your bag and the pair is automatically priced at ₹1499 at checkout. Add 4 and you get the offer twice. Coupons can’t be combined with the bundle offer on the same items.',
        link: { to: '/shop', label: 'Shop the collection' },
      },
      {
        q: 'Which payment methods do you accept?',
        a: 'We accept UPI, debit and credit cards, net banking and popular wallets, processed securely by Razorpay. Cash on delivery isn’t available at the moment.',
      },
      {
        q: 'Are prices inclusive of taxes?',
        a: 'Yes. All prices include taxes. The only possible extra is shipping on orders below ' + FREE + ', and that’s always shown before you pay.',
      },
    ],
  },
  {
    title: 'Exchanges & returns',
    items: [
      {
        q: 'Can I exchange a product for another size?',
        a: 'Yes. You can exchange unworn, unwashed pieces with their original tags within 7 days of delivery, subject to availability of the size you need.',
        link: { to: '/refund-policy', label: 'Read the exchange & refund policy' },
      },
      {
        q: 'What if my product arrives damaged?',
        a: 'We’ll send a replacement or give you a full refund. Please record an unboxing video when you open your parcel. It’s required to process damage requests.',
      },
      {
        q: 'Do you accept returns?',
        a: 'We accept returns only for damaged or incorrect items. If the fit isn’t right, the 7-day size exchange is the quickest way to get the right piece.',
      },
    ],
  },
  {
    title: 'Products & care',
    items: [
      {
        q: 'How do I find my size?',
        a: 'Every product page has a size guide with the chest measurement for every size. If you’re between sizes, message us on WhatsApp and we’ll help you choose.',
      },
      {
        q: 'How do I care for my Rang and Craft clothing?',
        a: 'Hand wash printed cotton pieces separately in cold water with a mild detergent for the first few washes, and dry them inside out in the shade. Pieces with embroidery or zari work should be dry cleaned.',
        link: { to: '/care-guide', label: 'See the full care guide' },
      },
      {
        q: 'Will the colours look exactly like the photos?',
        a: 'We photograph every piece in natural light, but prints are made in small batches and screens differ, so slight variations in shade are part of their character.',
      },
    ],
  },
];

const FAQ = () => {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  const groups = useMemo(
    () => GROUPS
      .map((g) => ({ ...g, items: g.items.filter((f) => !q || `${f.q} ${f.a}`.toLowerCase().includes(q)) }))
      .filter((g) => g.items.length),
    [q],
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: GROUPS.flatMap((g) => g.items).map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <>
      <Seo title="FAQs" description="Answers about shipping, offers, payments, exchanges, sizing and garment care at Rang and Craft." path="/faq" jsonLd={jsonLd} />
      <InfoHero eyebrow="Help centre" title={<>Questions, <em>answered</em></>} intro="Shipping, offers, exchanges and care. Everything you might want to know before you order." />

      <section className="rc-section rc-faq">
        <div className="rc-container rc-info-body">
          <div className="rc-faq-search" role="search">
            <Search size={18} aria-hidden />
            <label htmlFor="faq-search" className="rc-sr-only">Search questions</label>
            <input
              id="faq-search"
              className="rc-input"
              type="search"
              placeholder="Search e.g. exchange, shipping, size"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <p className="rc-sr-only" aria-live="polite">
            {q ? `${groups.reduce((n, g) => n + g.items.length, 0)} questions found` : ''}
          </p>

          {groups.length === 0 && (
            <div className="rc-empty" style={{ padding: '24px 0' }}>
              <p>No answers match “{query}”. Try another word, or ask us directly below.</p>
            </div>
          )}

          {groups.map((g) => (
            <div className="rc-faq-group" key={g.title}>
              <h2 className="rc-faq-group__title">{g.title}</h2>
              <div className="rc-accordion">
                {g.items.map((f) => (
                  <details key={f.q} open={Boolean(q)}>
                    <summary>{f.q}<Plus size={18} aria-hidden /></summary>
                    <div className="rc-accordion__body">
                      <p>{f.a}</p>
                      {f.link && <p style={{ marginTop: 10 }}><Link to={f.link.to}>{f.link.label}</Link></p>}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}

          <HelpBand title="Still have a question?" text="Our team is on WhatsApp, email and phone Monday to Saturday, 10 AM – 7 PM." />
        </div>
      </section>
    </>
  );
};

export default FAQ;
