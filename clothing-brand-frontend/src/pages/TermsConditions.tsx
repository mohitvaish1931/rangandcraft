import React from 'react';
import { useSEO } from '../utils/useSEO';
import { Scale, ShieldAlert, Gavel, Mail, ShieldCheck, Lock, RefreshCcw, Globe } from 'lucide-react';

const TermsConditions = () => {
  useSEO({
    title: 'Terms & Conditions - RANG AND CRAFT',
    description: 'Read our terms of service and business guidelines.',
    keywords: 'terms and conditions, service agreement, RANG AND CRAFT rules',
    url: 'https://rangandcraft.store/terms-conditions',
    type: 'website'
  });

  const sections = [
    {
      icon: <Gavel size={30} />,
      title: "GOVERNING LAW",
      text: "These terms and conditions are governed by and construed in accordance with the laws of India. Any disputes relating to these terms will be subject to the exclusive jurisdiction of the courts of Jaipur."
    },
    {
      icon: <Scale size={30} />,
      title: "USE OF WEBSITE",
      text: "By accessing this website, you warrant and represent that you are at least 18 years of age and will use the site only for lawful purposes in accordance with these terms."
    },
    {
      icon: <ShieldAlert size={30} />,
      title: "INTELLECTUAL PROPERTY",
      text: "All content, designs, and images on this website are the intellectual property of RANG AND CRAFT. Unauthorized use or reproduction is strictly prohibited and may lead to legal action."
    }
  ];

  return (
    <div className="policy-page-v2" style={{ 
      backgroundColor: '#fdfbff', 
      color: '#2d0a4e', 
      minHeight: '100vh', 
      fontFamily: "'Inter', sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Patterns */}
      <div style={{ position: 'absolute', top: '100px', left: '-50px', opacity: 0.05, pointerEvents: 'none' }}>
         <img src="/images/floral-pattern.png" alt="" style={{ width: '400px' }} />
      </div>
      <div style={{ position: 'absolute', top: '150px', right: '-50px', opacity: 0.05, pointerEvents: 'none' }}>
         <img src="/images/floral-pattern.png" alt="" style={{ width: '400px', transform: 'scaleX(-1)' }} />
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 20px', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <span style={{ color: '#D4AF37', letterSpacing: '4px', fontWeight: '800', fontSize: '0.7rem', textTransform: 'uppercase', display: 'block', marginBottom: '20px' }}>LEGAL</span>
          <h1 className="font-serif" style={{ fontSize: '3.5rem', fontWeight: '700', marginBottom: '15px', color: '#2d0a4e' }}>Terms & Conditions</h1>
          <div style={{ width: '40px', height: '1.5px', backgroundColor: '#D4AF37', margin: '0 auto 20px' }}></div>
          <p style={{ fontSize: '1.1rem', color: '#666' }}>Read our terms of service and business guidelines.</p>
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '80px', maxWidth: '800px', margin: '0 auto 80px' }}>
          {sections.map((section, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              gap: '30px', 
              padding: '30px', 
              backgroundColor: '#fff', 
              borderRadius: '20px', 
              boxShadow: '0 5px 25px rgba(0,0,0,0.02)',
              border: '1px solid #f8f8f8',
              alignItems: 'flex-start'
            }}>
              <div style={{ 
                width: '70px', 
                height: '70px', 
                borderRadius: '50%', 
                backgroundColor: '#FDF7F2', 
                color: '#2d0a4e', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {section.icon}
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', letterSpacing: '1px', marginBottom: '12px', color: '#2d0a4e' }}>{section.title}</h3>
                <p style={{ color: '#555', lineHeight: '1.7', fontSize: '0.95rem' }}>{section.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div style={{ 
          backgroundColor: '#F9F6FF', 
          borderRadius: '24px', 
          padding: '60px 40px', 
          textAlign: 'center',
          marginBottom: '80px'
        }}>
          <h2 className="font-serif" style={{ fontSize: '2.2rem', marginBottom: '10px', color: '#2d0a4e' }}>LEGAL QUESTIONS?</h2>
          <div style={{ width: '40px', height: '1.5px', backgroundColor: '#D4AF37', margin: '0 auto 20px' }}></div>
          <p style={{ color: '#666', marginBottom: '40px' }}>If you have any questions regarding our terms, please contact us:</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>
            <ContactCard 
              icon={<Mail size={24} />} 
              label="EMAIL" 
              value="rangandcraft.fashion.jaipur@gmail.com" 
              href="mailto:rangandcraft.fashion.jaipur@gmail.com"
            />
          </div>
        </div>

        {/* Trust Bar Footer */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px', borderTop: '1px solid #eee', paddingTop: '60px' }}>
            <TrustItem icon={<ShieldCheck size={28} />} title="PREMIUM QUALITY" sub="Finest fabrics & craftsmanship" />
            <TrustItem icon={<Lock size={28} />} title="SECURE PAYMENTS" sub="100% secure & trusted" />
            <TrustItem icon={<RefreshCcw size={28} />} title="EASY RETURNS" sub="Hassle-free returns" />
            <TrustItem icon={<Globe size={28} />} title="WORLDWIDE SHIPPING" sub="Delivered across the globe" />
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .policy-page-v2 h1 { font-size: 2.5rem !important; }
          .policy-page-v2 h2 { font-size: 1.8rem !important; }
          .policy-page-v2 > div > div:nth-child(3) { padding: 40px 20px !important; }
        }
      `}</style>
    </div>
  );
};

const ContactCard = ({ icon, label, value, href }: { icon: React.ReactNode, label: string, value: string, href: string }) => (
  <a href={href} style={{ 
    display: 'flex', 
    alignItems: 'center', 
    gap: '20px', 
    padding: '25px 40px', 
    backgroundColor: '#fff', 
    borderRadius: '16px', 
    textDecoration: 'none', 
    color: '#2d0a4e',
    boxShadow: '0 10px 20px rgba(0,0,0,0.02)',
    minWidth: '320px',
    border: '1px solid #f0f0f0'
  }}>
    <div style={{ color: '#2d0a4e', backgroundColor: '#F9F6FF', padding: '12px', borderRadius: '12px' }}>{icon}</div>
    <div style={{ textAlign: 'left' }}>
      <span style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '1px', color: '#999', display: 'block' }}>{label}</span>
      <span style={{ fontSize: '1rem', fontWeight: '700' }}>{value}</span>
    </div>
  </a>
);

const TrustItem = ({ icon, title, sub }: { icon: React.ReactNode, title: string, sub: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
    <div style={{ color: '#2D0A4E', opacity: 0.8 }}>{icon}</div>
    <div style={{ textAlign: 'left' }}>
      <h5 style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '1px', color: '#2D0A4E', marginBottom: '2px' }}>{title}</h5>
      <p style={{ fontSize: '0.65rem', color: '#888' }}>{sub}</p>
    </div>
  </div>
);

export default TermsConditions;
