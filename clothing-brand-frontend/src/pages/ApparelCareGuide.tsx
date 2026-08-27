import React from 'react';
import { useSEO } from '../utils/useSEO';
import { Sparkles, Archive, Droplets, Info, Wind, MessageCircle } from 'lucide-react';

const ApparelCareGuide = () => {
  useSEO({
    title: 'Garment Care Guide - RANG AND CRAFT',
    description: 'Expert tips on preserving the life and beauty of your luxury handcrafted ethnic wear.',
    keywords: 'garment care, clothing maintenance, silk care, embroidery care, RANG AND CRAFT guide',
    url: 'https://rangandcraft.store/apparel-care-guide',
    type: 'website'
  });

  const sections = [
    {
      icon: <Droplets size={30} />,
      title: "PROFESSIONAL CLEANING",
      text: "Most of our ethnic wear, especially those with Zari, Gotta Patti, or Zardosi work, requires professional dry cleaning. Avoid machine washing or hand washing at home for silk sarees and heavy embroidered suits.",
      note: "Important: Always inform your dry cleaner about the specific material and embroidery type."
    },
    {
      icon: <Archive size={30} />,
      title: "PERFECT STORAGE",
      text: "Store your precious sarees and lehengas in breathable muslin or cotton bags. Avoid plastic covers as they can cause yellowing. Change folds every few months to prevent fabric stress at the creases."
    },
    {
      icon: <Wind size={30} />,
      title: "IRONING & STEAMING",
      text: "Always iron on the reverse side of the garment using a low-to-medium heat setting. Steam ironing is preferred for removing wrinkles from delicate silks and georgettes, but avoid direct contact with embroidery."
    },
    {
      icon: <Sparkles size={30} />,
      title: "USAGE & MAINTENANCE",
      text: "Avoid spraying perfumes or deodorants directly onto your clothes, as chemicals can stain the fabric and darken metal threads. Apply perfumes and jewelry before putting on your garment."
    },
    {
      icon: <Info size={30} />,
      title: "SPECIFIC CARE",
      text: "If a thread comes loose, never pull it. Instead, carefully snip it with small scissors. For heavy lehengas, we recommend storing them flat if possible to prevent the weight from stretching the fabric."
    }
  ];

  return (
    <div className="policy-page-v2" style={{ 
      backgroundColor: '#fff', 
      color: '#295454', 
      minHeight: '100vh', 
      padding: '80px 20px',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 className="font-serif" style={{ fontSize: '3.5rem', fontWeight: '700', marginBottom: '15px', color: '#295454' }}>Garment Care Guide</h1>
          <div style={{ width: '60px', height: '2px', backgroundColor: '#c48f56', margin: '0 auto 20px' }}></div>
          <p style={{ fontSize: '1.1rem', color: '#666' }}>Preserve the beauty and longevity of your handcrafted ethnic wear with these expert tips.</p>
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '60px' }}>
          {sections.map((section, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              gap: '30px', 
              padding: '30px', 
              backgroundColor: '#fff', 
              borderRadius: '20px', 
              boxShadow: '0 5px 25px rgba(0,0,0,0.03)',
              border: '1px solid #f8f8f8',
              alignItems: 'flex-start'
            }}>
              <div style={{ 
                width: '70px', 
                height: '70px', 
                borderRadius: '50%', 
                backgroundColor: '#FDF7F2', 
                color: '#295454', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {section.icon}
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', letterSpacing: '1px', marginBottom: '12px', color: '#295454' }}>{section.title}</h3>
                <p style={{ color: '#555', lineHeight: '1.7', fontSize: '0.95rem' }}>{section.text}</p>
                {section.note && (
                  <p style={{ color: '#777', fontStyle: 'italic', fontSize: '0.85rem', marginTop: '10px' }}>{section.note}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Raise a Request */}
        <div style={{ 
          backgroundColor: '#F9F6FF', 
          borderRadius: '24px', 
          padding: '60px 40px', 
          textAlign: 'center'
        }}>
          <h2 className="font-serif" style={{ fontSize: '2.5rem', marginBottom: '15px', color: '#295454' }}>NEED ADVICE?</h2>
          <div style={{ width: '40px', height: '2px', backgroundColor: '#c48f56', margin: '0 auto 20px' }}></div>
          <p style={{ color: '#666', marginBottom: '40px' }}>Our styling experts are here to help you preserve your heirloom pieces:</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>
            <ContactCard 
              icon={<MessageCircle size={24} />} 
              label="WHATSAPP CONCIERGE" 
              value="+91 93513 25459" 
              href="https://wa.me/919351325459"
            />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .policy-page-v2 h1 { font-size: 2.5rem !important; }
          .policy-page-v2 h2 { font-size: 2rem !important; }
          .policy-page-v2 > div > div:nth-child(2) > div { flex-direction: column; align-items: center; text-align: center; }
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

export default ApparelCareGuide;
