import React, { useState } from 'react';
import { useSEO } from '../utils/useSEO';
import { ChevronDown, Headphones, ChevronRight, ShieldCheck, Lock, RefreshCcw, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const FAQ = () => {
  useSEO({
    title: 'FAQs - RANG AND CRAFT',
    description: 'Find answers to common questions about our products and services.',
    keywords: 'faq, questions, help, RANG AND CRAFT',
    url: 'https://rangandcraft.store/faq',
    type: 'website'
  });

  const faqs = [
    {
      question: "How do I care for my RANG AND CRAFT clothing?",
      answer: "Most of our ethnic wear requires professional dry cleaning to maintain the fabric and embroidery quality. Please refer to our Garment Care Guide for detailed instructions on storage and maintenance."
    },
    {
      question: "What are the shipping charges?",
      answer: "We offer free shipping on all orders above ₹1999 across India. For orders below this amount, a flat shipping fee of ₹99 applies."
    },
    {
      question: "How long will it take to receive my order?",
      answer: "Orders are typically dispatched within 3-5 working days as many of our pieces are handcrafted. Once shipped, delivery takes approximately 4-8 working days."
    },
    {
      question: "Do you offer international shipping?",
      answer: "Currently, we only ship within India. We are working on bringing Rang and Craft to our international customers very soon."
    },
    {
      question: "Can I return or exchange a product?",
      answer: "We accept size exchanges for unworn garments with original tags within 7 days of delivery. For returns, we only accept damaged products with mandatory unboxing video proof."
    },
    {
      question: "Is your clothing authentic?",
      answer: "Yes, all our garments are crafted using premium fabrics and authentic hand-embroidery techniques. Each piece goes through rigorous quality checks."
    }
  ];

  return (
    <div className="faq-page-v2" style={{ 
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
          <span style={{ color: '#c48f56', letterSpacing: '4px', fontWeight: '800', fontSize: '0.7rem', textTransform: 'uppercase', display: 'block', marginBottom: '20px' }}>SUPPORT</span>
          <h1 className="font-serif" style={{ fontSize: '3.5rem', fontWeight: '700', marginBottom: '15px', color: '#295454' }}>FAQs</h1>
          <div style={{ width: '40px', height: '1.5px', backgroundColor: '#c48f56', margin: '0 auto 20px' }}></div>
          <p style={{ fontSize: '1.1rem', color: '#666' }}>Find answers to common questions about our products and services.</p>
        </div>

        {/* FAQ Accordion */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '80px', maxWidth: '800px', margin: '0 auto 80px' }}>
          {faqs.map((faq, index) => (
            <AccordionItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>

        {/* Footer CTA */}
        <div style={{ 
          backgroundColor: '#F9F6FF', 
          borderRadius: '24px', 
          padding: '40px 60px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          gap: '40px',
          flexWrap: 'wrap',
          marginBottom: '80px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
             <div style={{ 
               width: '80px', 
               height: '80px', 
               backgroundColor: '#fff', 
               borderRadius: '50%', 
               display: 'flex', 
               alignItems: 'center', 
               justifyContent: 'center',
               boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
               border: '1px solid rgba(45,10,78,0.05)'
             }}>
                <Headphones size={32} color="#295454" strokeWidth={1.5} />
             </div>
             <div>
                <h2 className="font-serif" style={{ fontSize: '1.8rem', marginBottom: '5px', color: '#295454' }}>Still have questions?</h2>
                <div style={{ width: '30px', height: '1.5px', backgroundColor: '#c48f56', marginBottom: '10px' }}></div>
                <p style={{ color: '#666', fontSize: '0.9rem', maxWidth: '400px' }}>Our luxury consultants are available to assist you with any inquiries you may have.</p>
             </div>
          </div>
          
          <Link to="/contact" style={{ 
            backgroundColor: '#295454', 
            color: '#fff', 
            padding: '18px 40px', 
            borderRadius: '12px', 
            textDecoration: 'none', 
            fontWeight: '700', 
            fontSize: '0.85rem',
            letterSpacing: '1px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 10px 30px rgba(45,10,78,0.1)'
          }}>
             CONTACT CUSTOMER CARE <ChevronRight size={18} />
          </Link>
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
          .faq-page-v2 h1 { font-size: 2.5rem !important; }
          .faq-page-v2 h2 { font-size: 1.5rem !important; }
          .faq-page-v2 > div > div:nth-child(3) { flex-direction: column; text-align: center; padding: 40px 20px; }
          .faq-page-v2 > div > div:nth-child(3) > div { flex-direction: column; }
        }
      `}</style>
    </div>
  );
};

const AccordionItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ 
      backgroundColor: '#fff', 
      borderRadius: '20px', 
      boxShadow: '0 5px 25px rgba(0,0,0,0.02)',
      border: '1px solid #f8f8f8',
      overflow: 'hidden'
    }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          width: '100%', 
          padding: '25px 35px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '25px', 
          background: 'none', 
          border: 'none', 
          cursor: 'pointer',
          textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flexShrink: 0 }}>
           <div style={{ width: '26px', height: '26px', backgroundColor: '#295454', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '800' }}>Q</div>
           <div style={{ width: '26px', height: '26px', backgroundColor: '#c48f56', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '800' }}>A</div>
        </div>
        <span style={{ flex: 1, fontSize: '1rem', fontWeight: '700', color: '#295454' }}>{question}</span>
        <ChevronDown 
          size={20} 
          color="#295454" 
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} 
        />
      </button>
      <div style={{ 
        maxHeight: isOpen ? '500px' : '0', 
        overflow: 'hidden', 
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        padding: isOpen ? '0 35px 30px 88px' : '0 35px 0 88px'
      }}>
        <p style={{ color: '#666', lineHeight: '1.8', fontSize: '0.95rem' }}>{answer}</p>
      </div>
    </div>
  );
};

const TrustItem = ({ icon, title, sub }: { icon: React.ReactNode, title: string, sub: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
    <div style={{ color: '#295454', opacity: 0.8 }}>{icon}</div>
    <div style={{ textAlign: 'left' }}>
      <h5 style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '1px', color: '#295454', marginBottom: '2px' }}>{title}</h5>
      <p style={{ fontSize: '0.65rem', color: '#888' }}>{sub}</p>
    </div>
  </div>
);

export default FAQ;
