import { Link } from 'react-router-dom';
import { CheckCircle, HelpCircle, RotateCcw, ShieldAlert, Wallet } from 'lucide-react';
import Seo from '../components/Seo';
import { HelpBand, InfoHero, PolicyList } from '../components/InfoPage';

const RefundPolicy = () => (
  <>
    <Seo
      title="Exchange & Refund Policy"
      description="Easy 7-day size exchange on unworn pieces with tags, and a full refund or replacement for damaged products."
      path="/refund-policy"
    />
    <InfoHero
      eyebrow="Customer care"
      title={<>Exchanges <em>&amp;</em> refunds</>}
      intro="Wrong size? Something not right? Here’s exactly how we make it right."
      policyNav
    />

    <section className="rc-section">
      <div className="rc-container rc-info-body">
        <div className="rc-highlights" data-reveal="up">
          <div className="rc-highlight"><strong>7 days</strong><span>for a size exchange</span></div>
          <div className="rc-highlight"><strong>Full refund</strong><span>or replacement if damaged</span></div>
          <div className="rc-highlight"><strong>1 message</strong><span>on WhatsApp to start</span></div>
        </div>

        <PolicyList
          items={[
            {
              icon: <RotateCcw size={22} strokeWidth={1.5} />,
              title: '7-day size exchange',
              body: (
                <>
                  <p>If the fit isn’t right, you can exchange your piece for another size within <strong>7 days of delivery</strong>. It must be unworn, unwashed and have its original tags attached.</p>
                  <p>Exchanges are subject to availability of the size you need. If it’s out of stock, we’ll offer another style or a credit note.</p>
                </>
              ),
            },
            {
              icon: <ShieldAlert size={22} strokeWidth={1.5} />,
              title: 'Damaged or wrong products',
              body: (
                <>
                  <p>In the rare case that you receive a damaged or incorrect item, we’ll send a replacement or issue a <strong>full refund</strong>.</p>
                  <p className="rc-policy__note">Please record a continuous unboxing video when you open your parcel. It’s required for us to process damage or wrong-item requests.</p>
                </>
              ),
            },
            {
              icon: <Wallet size={22} strokeWidth={1.5} />,
              title: 'Refunds',
              body: (
                <p>Approved refunds are made to your original payment method. We’ll confirm on WhatsApp or email when it’s been issued; how quickly it shows up then depends on your bank. Returns for reasons other than damage or a wrong item aren’t accepted; please use the size exchange instead.</p>
              ),
            },
            {
              icon: <HelpCircle size={22} strokeWidth={1.5} />,
              title: 'How to raise a request',
              body: (
                <ul>
                  <li>Message us on WhatsApp or email with your <strong>order number</strong> (you’ll find it in your confirmation and on <Link to="/track-order">Track order</Link>).</li>
                  <li>Tell us the size you need, or attach photos and the unboxing video for a damaged item.</li>
                  <li>We’ll confirm how to send the item back and ship out the replacement.</li>
                </ul>
              ),
            },
            {
              icon: <CheckCircle size={22} strokeWidth={1.5} />,
              title: 'Quality check',
              body: <p>Every piece is checked by hand before it leaves our Jaipur studio, so issues are rare. When they happen, we fix them quickly.</p>,
            },
          ]}
        />

        <HelpBand
          title="Start an exchange"
          text="Send us your order number and the size you need. We’ll take it from there."
          message="Hi Rang and Craft! I’d like to exchange an item. My order number is "
        />
      </div>
    </section>
  </>
);

export default RefundPolicy;
