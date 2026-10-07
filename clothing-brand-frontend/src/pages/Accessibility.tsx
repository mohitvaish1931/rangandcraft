import { Eye, Globe, Headphones, Keyboard, Users } from 'lucide-react';
import Seo from '../components/Seo';
import { HelpBand, InfoHero, PolicyList } from '../components/InfoPage';

const Accessibility = () => (
  <>
    <Seo title="Accessibility" description="Our commitment to making Rang and Craft easy to use for everyone." path="/accessibility" />
    <InfoHero
      eyebrow="For everyone"
      title={<>Accessibility <em>statement</em></>}
      intro="Shopping with us should be easy for everyone, whatever device or assistive technology you use."
      policyNav
    />

    <section className="rc-section">
      <div className="rc-container rc-info-body">
        <PolicyList
          items={[
            {
              icon: <Users size={22} strokeWidth={1.5} />,
              title: 'Our commitment',
              body: <p>We want our website to be usable by the widest possible audience, regardless of technology or ability, and we keep improving it as we grow.</p>,
            },
            {
              icon: <Globe size={22} strokeWidth={1.5} />,
              title: 'Standards we follow',
              body: <p>We aim to meet the W3C Web Content Accessibility Guidelines (WCAG) 2.1 at level AA, and we check new pages with automated audits and manual testing.</p>,
            },
            {
              icon: <Keyboard size={22} strokeWidth={1.5} />,
              title: 'What we’ve built in',
              body: (
                <ul>
                  <li>Every page can be used with a keyboard, with visible focus and a “Skip to content” link.</li>
                  <li>Text and buttons meet AA colour-contrast ratios.</li>
                  <li>Images have text descriptions, and form fields have clear labels and error messages.</li>
                  <li>Animations are switched off when your device asks for reduced motion.</li>
                </ul>
              ),
            },
            {
              icon: <Eye size={22} strokeWidth={1.5} />,
              title: 'Known limitations',
              body: <p>Some product photos and older reviews may have limited descriptions. If anything gets in your way, tell us and we’ll help you complete your order directly.</p>,
            },
            {
              icon: <Headphones size={22} strokeWidth={1.5} />,
              title: 'Feedback',
              body: <p>We welcome your feedback. If you run into a barrier or have a suggestion, please reach out by WhatsApp, email or phone.</p>,
            },
          ]}
        />

        <HelpBand title="Having trouble using the site?" text="Tell us what happened and we’ll help you right away." message="Hi Rang and Craft! I had trouble using your website." />
      </div>
    </section>
  </>
);

export default Accessibility;
