import { Link } from 'react-router-dom';
import { BadgePercent, Gavel, Image, Receipt, Scale, ShoppingBag, Truck } from 'lucide-react';
import Seo from '../components/Seo';
import { HelpBand, InfoHero, PolicyList } from '../components/InfoPage';

const TermsConditions = () => (
  <>
    <Seo title="Terms & Conditions" description="The terms that apply when you browse and shop at Rang and Craft." path="/terms-conditions" />
    <InfoHero
      eyebrow="The fine print"
      title={<>Terms <em>&amp;</em> conditions</>}
      intro="By using this website or placing an order, you agree to the terms below."
      policyNav
    />

    <section className="rc-section">
      <div className="rc-container rc-info-body">
        <PolicyList
          items={[
            {
              icon: <Scale size={22} strokeWidth={1.5} />,
              title: 'Using this website',
              body: <p>You must be at least 18 years old, or shopping with a parent or guardian’s permission, and use the site only for lawful purposes. Please keep your account password private; you’re responsible for activity on your account.</p>,
            },
            {
              icon: <ShoppingBag size={22} strokeWidth={1.5} />,
              title: 'Products & pricing',
              body: (
                <>
                  <p>Prices are in Indian Rupees and include all taxes. Our prints are made in small batches, so colours can vary slightly from what you see on screen.</p>
                  <p>Your order is confirmed once payment succeeds. If an item turns out to be unavailable or was listed with an obvious pricing error, we’ll contact you and refund the amount in full.</p>
                </>
              ),
            },
            {
              icon: <BadgePercent size={22} strokeWidth={1.5} />,
              title: 'Offers & coupons',
              body: <p>Bundle offers are applied automatically at checkout. A coupon can’t be combined with a bundle offer on the same items, and each coupon is subject to its own validity and usage limits. We may end or change an offer at any time; orders already placed keep the price you paid.</p>,
            },
            {
              icon: <Receipt size={22} strokeWidth={1.5} />,
              title: 'Payments',
              body: <p>Payments are processed securely by Razorpay using UPI, cards, net banking or wallets. We don’t store your payment details.</p>,
            },
            {
              icon: <Truck size={22} strokeWidth={1.5} />,
              title: 'Shipping, exchanges & refunds',
              body: <p>Delivery, exchange and refund terms are set out in our <Link to="/shipping-policy">Shipping policy</Link> and <Link to="/refund-policy">Exchange &amp; refund policy</Link>, which form part of these terms.</p>,
            },
            {
              icon: <Image size={22} strokeWidth={1.5} />,
              title: 'Intellectual property',
              body: <p>All designs, prints, photographs and content on this website belong to Rang and Craft. Please don’t copy or reuse them without our written permission.</p>,
            },
            {
              icon: <Gavel size={22} strokeWidth={1.5} />,
              title: 'Governing law',
              body: <p>These terms are governed by the laws of India. Any disputes are subject to the exclusive jurisdiction of the courts of Jaipur, Rajasthan.</p>,
            },
          ]}
        />

        <HelpBand title="Questions about these terms?" text="We’re happy to clarify anything before you order." />
      </div>
    </section>
  </>
);

export default TermsConditions;
