import React from 'react';
import { useSEO } from '../utils/useSEO';
import { ShieldCheck, Eye, Lock, FileText, Globe, Mail, RefreshCcw } from 'lucide-react';

const PrivacyPolicy = () => {
  useSEO({
    title: 'Privacy Policy - RANG AND CRAFT',
    description: 'How we collect, use, and protect your personal information.',
    keywords: 'privacy policy, data protection, security, RANG AND CRAFT',
    url: 'https://rangandcraft.store/privacy-policy',
    type: 'website'
  });

  const sections = [
    {
      icon: <FileText size={30} />,
      title: "DATA COLLECTION",
      text: "We collect information such as your name, email, and address when you place an order or interact with our site. This is used solely to provide a seamless shopping experience and fulfill your requests."
    },
    {
      icon: <Lock size={30} />,
      title: "SECURITY MEASURES",
      text: "Your data is protected by industry-standard encryption and security protocols. We never share your personal details with third parties for marketing purposes."
    },
    {
      icon: <Eye size={30} />,
      title: "TRANSPARENCY",
      text: "We are transparent about our data practices. You have the right to request access to or deletion of your personal information at any time by contacting our privacy team."
    }
  ];

  return (
    <div className="policy-page-v2" style={{ 
      backgroundColor: '#f9fafa', 
      color: '#295454', 
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
          <span style={{ color: '#c48f56', letterSpacing: '4px', fontWeight: '800', fontSize: '0.7rem', textTransform: 'uppercase', display: 'block', marginBottom: '20px' }}>PROTECTION</span>
          <h1 className="font-serif" style={{ fontSize: '3.5rem', fontWeight: '700', marginBottom: '15px', color: '#295454' }}>Privacy Policy</h1>
          <div style={{ width: '40px', height: '1.5px', backgroundColor: '#c48f56', margin: '0 auto 20px' }}></div>
          <p style={{ fontSize: '1.1rem', color: '#666' }}>How we collect, use, and protect your personal information.</p>
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
                backgroundColor: '#F9F6FF', 
                color: '#295454', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {section.icon}
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', letterSpacing: '1px', marginBottom: '12px', color: '#295454' }}>{section.title}</h3>
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
          <h2 className="font-serif" style={{ fontSize: '2.2rem', marginBottom: '10px', color: '#295454' }}>PRIVACY CONCERNS?</h2>
          <div style={{ width: '40px', height: '1.5px', backgroundColor: '#c48f56', margin: '0 auto 20px' }}></div>
          <p style={{ color: '#666', marginBottom: '40px' }}>If you have any questions about your privacy, please contact us:</p>
          
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
    color: '#295454',
    boxShadow: '0 10px 20px rgba(0,0,0,0.02)',
    minWidth: '320px',
    border: '1px solid #f0f0f0'
  }}>
    <div style={{ color: '#295454', backgroundColor: '#F9F6FF', padding: '12px', borderRadius: '12px' }}>{icon}</div>
    <div style={{ textAlign: 'left' }}>
      <span style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '1px', color: '#999', display: 'block' }}>{label}</span>
      <span style={{ fontSize: '1rem', fontWeight: '700' }}>{value}</span>
    </div>
  </a>
);

const TrustItem = ({ icon, title, sub }: { icon: React.ReactNode, title: string, sub: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
    <div style={{ color: '#295454', opacity: 0.8 }}>{icon}</div>
    <div style={{ textAlign: 'left' }}>
      <h5 style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '1px', color: '#295454', marginBottom: '2px' }}>{title}</h5>
      <p style={{ fontSize: '0.65rem', color: '#888' }}>{sub}</p>
    </div>
  </div>
);

export default PrivacyPolicy;
