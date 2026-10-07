import { Link } from 'react-router-dom';
import { Box, MapPin, RefreshCcw, Tag, Truck } from 'lucide-react';
import Seo from '../components/Seo';
import { HelpBand, InfoHero, PolicyList } from '../components/InfoPage';
import { formatPrice } from '../lib/format';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '../lib/offers';

const ShippingPolicy = () => (
  <>
    <Seo
      title="Shipping Policy"
      description={`Dispatch in 2–3 working days, delivery in 4–8 working days across India. Free shipping on orders of ${formatPrice(FREE_SHIPPING_THRESHOLD)} and above.`}
      path="/shipping-policy"
    />
    <InfoHero
      eyebrow="Customer care"
      title={<>Shipping, <em>simply</em></>}
      intro="Everything about how your order leaves our Jaipur studio and reaches your door."
      policyNav
    />

    <section className="rc-section">
      <div className="rc-container rc-info-body">
        <div className="rc-highlights" data-reveal="up">
          <div className="rc-highlight"><strong>2–3 days</strong><span>to dispatch</span></div>
          <div className="rc-highlight"><strong>4–8 days</strong><span>to deliver, pan-India</span></div>
          <div className="rc-highlight"><strong>Free</strong><span>on orders of {formatPrice(FREE_SHIPPING_THRESHOLD)}+</span></div>
        </div>

        <PolicyList
          items={[
            {
              icon: <Truck size={22} strokeWidth={1.5} />,
              title: 'Delivery time',
              body: (
                <>
                  <p>Orders are usually dispatched within <strong>2–3 working days</strong> unless stated otherwise. Once dispatched, delivery takes <strong>4–8 working days</strong> depending on your location.</p>
                  <p>Timelines can occasionally stretch because of stock shortages, weather, courier transit times or local restrictions. We’ll keep you posted if that happens.</p>
                </>
              ),
            },
            {
              icon: <Tag size={22} strokeWidth={1.5} />,
              title: 'Shipping cost',
              body: (
                <p>Shipping is <strong>free on every order of {formatPrice(FREE_SHIPPING_THRESHOLD)} and above</strong>. Orders below that carry a flat fee of {formatPrice(SHIPPING_FEE)}. The exact amount is always shown in your bag before you pay.</p>
              ),
            },
            {
              icon: <MapPin size={22} strokeWidth={1.5} />,
              title: 'Tracking your order',
              body: (
                <p>As soon as your parcel leaves our warehouse you’ll receive the courier name and tracking number. You can follow it any time on our <Link to="/track-order">Track order</Link> page with your order number and email.</p>
              ),
            },
            {
              icon: <RefreshCcw size={22} strokeWidth={1.5} />,
              title: 'Undelivered or returned (RTO) parcels',
              body: (
                <p>Please double-check your address and phone number at checkout. If a parcel is returned to us because of an incorrect address or because it couldn’t be delivered, the shipping charge for re-sending it will need to be paid again.</p>
              ),
            },
            {
              icon: <Box size={22} strokeWidth={1.5} />,
              title: 'Lost in transit',
              body: (
                <p>If your parcel is lost in transit, we’ll re-ship your order at no extra cost. If an item is no longer in stock, you can wait for the restock or receive a credit note for a future order.</p>
              ),
            },
          ]}
        />

        <HelpBand
          title="Need help with an order?"
          text="Share your order number on WhatsApp and our team will get back to you during working hours (Mon–Sat, 10 AM – 7 PM)."
          message="Hi Rang and Craft! I need help with my order."
        />
      </div>
    </section>
  </>
);

export default ShippingPolicy;
