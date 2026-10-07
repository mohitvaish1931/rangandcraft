import { CreditCard, Database, Eye, FileText, HardDrive, Lock, UserCheck } from 'lucide-react';
import Seo from '../components/Seo';
import { HelpBand, InfoHero, PolicyList } from '../components/InfoPage';
import { SUPPORT_EMAIL } from '../lib/brand';

const PrivacyPolicy = () => (
  <>
    <Seo title="Privacy Policy" description="What personal information Rang and Craft collects, why we need it and how we keep it safe." path="/privacy-policy" />
    <InfoHero
      eyebrow="Your data"
      title={<>Privacy, <em>plainly</em></>}
      intro="We only collect what we need to make, ship and support your order, and we never sell it."
      policyNav
    />

    <section className="rc-section">
      <div className="rc-container rc-info-body">
        <PolicyList
          items={[
            {
              icon: <FileText size={22} strokeWidth={1.5} />,
              title: 'What we collect',
              body: (
                <ul>
                  <li><strong>Order details:</strong> your name, email, phone number and delivery address, plus the items you buy.</li>
                  <li><strong>Account details:</strong> if you create an account, your name, email and a securely hashed password, along with your wishlist and order history.</li>
                  <li><strong>Messages:</strong> whatever you share with us through the contact form, reviews or WhatsApp.</li>
                  <li><strong>Newsletter:</strong> your email, if you choose to subscribe.</li>
                </ul>
              ),
            },
            {
              icon: <Database size={22} strokeWidth={1.5} />,
              title: 'How we use it',
              body: (
                <p>To process and deliver your orders, send order and shipping updates, handle exchanges, answer your questions and, only if you’ve subscribed, tell you about new collections and offers. We share delivery details with our courier partners only so they can deliver your parcel.</p>
              ),
            },
            {
              icon: <CreditCard size={22} strokeWidth={1.5} />,
              title: 'Payments',
              body: (
                <p>Payments are processed securely by Razorpay. Your card, UPI and bank details go directly to them; we never see or store them.</p>
              ),
            },
            {
              icon: <HardDrive size={22} strokeWidth={1.5} />,
              title: 'Cookies & on-device storage',
              body: (
                <p>Your browser stores your bag, wishlist, sign-in session and last-used delivery address on your device so they’re ready next time. We use privacy-friendly, cookie-free analytics (Vercel Analytics) to understand overall site traffic and speed. We don’t use advertising trackers.</p>
              ),
            },
            {
              icon: <Lock size={22} strokeWidth={1.5} />,
              title: 'Keeping it safe',
              body: (
                <p>Data travels over encrypted HTTPS connections, passwords are hashed and access to order data is limited to our team. We never sell or rent your personal information.</p>
              ),
            },
            {
              icon: <UserCheck size={22} strokeWidth={1.5} />,
              title: 'Your choices',
              body: (
                <p>You can ask us at any time to stop sending you emails, or to show, correct or delete the personal information we hold about you by writing to <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. We keep order records only as long as needed for accounting and legal requirements.</p>
              ),
            },
            {
              icon: <Eye size={22} strokeWidth={1.5} />,
              title: 'Changes to this policy',
              body: <p>If we change how we handle your data, we’ll update this page. Significant changes will be highlighted on the site.</p>,
            },
          ]}
        />

        <HelpBand title="Questions about your data?" text="Write to us and we’ll respond personally." message="Hi Rang and Craft! I have a question about my personal data." />
      </div>
    </section>
  </>
);

export default PrivacyPolicy;
