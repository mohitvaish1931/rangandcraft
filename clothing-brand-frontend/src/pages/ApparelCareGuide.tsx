import { Archive, Droplets, Scissors, Sparkles, Sun, Wind } from 'lucide-react';
import Seo from '../components/Seo';
import { HelpBand, InfoHero, PolicyList } from '../components/InfoPage';

const ApparelCareGuide = () => (
  <>
    <Seo title="Garment Care Guide" description="How to wash, dry, iron and store your printed cotton kurtas and shirts so they last for years." path="/care-guide" />
    <InfoHero
      eyebrow="Made to last"
      title={<>The care <em>guide</em></>}
      intro="A few small habits keep your prints bright and your cotton soft, wash after wash."
    />

    <section className="rc-section">
      <div className="rc-container rc-info-body">
        <div className="rc-highlights" data-reveal="up">
          <div className="rc-highlight"><strong>Cold</strong><span>hand wash, mild detergent</span></div>
          <div className="rc-highlight"><strong>Shade</strong><span>dry inside out</span></div>
          <div className="rc-highlight"><strong>Reverse</strong><span>iron on low–medium</span></div>
        </div>

        <PolicyList
          items={[
            {
              icon: <Droplets size={22} strokeWidth={1.5} />,
              title: 'Washing',
              body: (
                <>
                  <p>Hand wash printed cotton kurtas and shirts <strong>separately in cold water</strong> with a mild detergent for the first few washes, as natural dyes can bleed slightly. Don’t soak, scrub or bleach prints.</p>
                  <p>Pieces with embroidery or zari work should be <strong>dry cleaned only</strong>.</p>
                  <p className="rc-policy__note">Tell your dry cleaner about the fabric and any embroidery so they can choose the right treatment.</p>
                </>
              ),
            },
            {
              icon: <Sun size={22} strokeWidth={1.5} />,
              title: 'Drying',
              body: <p>Turn garments inside out and dry them in the shade. Strong direct sunlight fades prints over time. Avoid wringing; gently press out the water instead.</p>,
            },
            {
              icon: <Wind size={22} strokeWidth={1.5} />,
              title: 'Ironing & steaming',
              body: <p>Iron on the reverse side on a low-to-medium heat. Steam works beautifully on cotton and linen blends; just keep the iron away from embroidery and buttons.</p>,
            },
            {
              icon: <Archive size={22} strokeWidth={1.5} />,
              title: 'Storing',
              body: <p>Keep your pieces in breathable cotton garment bags or on wide hangers, away from direct sunlight. Avoid plastic covers, which trap moisture and can cause yellowing. Fold heavier festive pieces flat rather than hanging them for long periods.</p>,
            },
            {
              icon: <Sparkles size={22} strokeWidth={1.5} />,
              title: 'Everyday wear',
              body: <p>Spray perfume or deodorant before you dress and let it dry fully. Chemicals can stain cotton and darken prints.</p>,
            },
            {
              icon: <Scissors size={22} strokeWidth={1.5} />,
              title: 'Loose threads',
              body: <p>Never pull a loose thread. Snip it carefully with small scissors, close to the fabric.</p>,
            },
          ]}
        />

        <HelpBand title="Not sure how to care for a piece?" text="Send us a photo of the label on WhatsApp and we’ll tell you exactly what to do." message="Hi Rang and Craft! I have a question about caring for my garment." />
      </div>
    </section>
  </>
);

export default ApparelCareGuide;
