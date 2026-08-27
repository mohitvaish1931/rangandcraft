import React, { useState } from 'react';
import { 
  Mail, Phone, MapPin, Send, MessageCircle, 
  Calendar, Star, Sun, Truck, ShieldCheck, 
  RefreshCcw, Globe, ExternalLink
} from 'lucide-react';
import { useSEO } from '../utils/useSEO';
import './Contact.css';

const Contact = () => {
  useSEO({
    title: 'Contact Us - RANG AND CRAFT Jaipur',
    description: 'Get in touch with RANG AND CRAFT for custom tailoring, styling guidance, and luxury ethnic wear inquiries.',
    keywords: 'contact rang and craft, jaipur boutique, ethnic wear contact, custom tailoring jaipur',
    url: 'https://rangandcraft.store/contact',
    type: 'website'
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Thank you! Your style consultation request has been received.');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="container">
          <div className="contact-hero-grid">
            <div className="contact-hero-content animate-fade-in">
              <span className="hero-tag">WE'D LOVE TO HEAR FROM YOU</span>
              <h1 className="hero-title font-serif">
                Let's Create Something <br />
                <i>Beautiful Together</i>
              </h1>
              <p className="hero-desc">
                From custom tailoring to styling guidance — we're here for you.
              </p>
              <div className="hero-btns">
                <button className="btn-book">
                  <Calendar size={18} />
                  BOOK CONSULTATION
                </button>
                <button className="btn-whatsapp-outline">
                  <MessageCircle size={18} />
                  CHAT ON WHATSAPP
                </button>
              </div>
            </div>
            <div className="contact-hero-img-wrap animate-fade-in" style={{animationDelay: '0.2s'}}>
              <img 
                src="/images/clothing_rack_hero.png" 
                alt="Rang and Craft Atelier" 
                className="contact-hero-img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Form Section */}
      <section className="contact-main-section container">
        <div className="contact-main-card">
          {/* Left: Get in Touch */}
          <div className="contact-info-side">
            <div className="section-title-wrap">
              <h2 className="font-serif">Get in Touch</h2>
              <div className="gold-divider"></div>
            </div>

            <div className="contact-items-list">
              <div className="contact-item-box">
                <div className="item-icon-circle"><Mail size={20} /></div>
                <div className="item-content">
                  <h3>EMAIL</h3>
                  <p>rangandcraft.fashion.jaipur@gmail.com</p>
                  <p className="sub-info">We reply within 24 hours</p>
                </div>
              </div>

              <div className="contact-item-box">
                <div className="item-icon-circle"><Phone size={20} /></div>
                <div className="item-content">
                  <h3>CALL US</h3>
                  <p>+91 93513 25459</p>
                  <p className="sub-info">Mon – Sat | 10AM – 7PM</p>
                </div>
              </div>

              <div className="contact-item-box">
                <div className="item-icon-circle"><MapPin size={20} /></div>
                <div className="item-content">
                  <h3>OUR STUDIO</h3>
                  <p>455, Mandhi Khatikan, Pahadiya Chowk, Jaipur - 302002, Rajasthan, India</p>
                  <p className="sub-info">Mon – Sat | 10AM – 7PM</p>
                </div>
              </div>

              <div className="contact-item-box">
                <div className="item-icon-circle"><MessageCircle size={20} /></div>
                <div className="item-content">
                  <h3>WHATSAPP</h3>
                  <p>Instant styling support available.</p>
                  <a href="https://wa.me/919351325459" className="chat-link">
                    Chat Now <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            </div>

            <div className="availability-banner">
              <div className="icon"><Sun size={20} /></div>
              <p>Available Mon – Sat | 10 AM – 7 PM <br /> <span style={{opacity: 0.6, fontSize: '0.75rem'}}>We're closed on Sundays</span></p>
            </div>
          </div>

          {/* Right: Form */}
          <div className="contact-form-side">
            <div className="section-title-wrap">
              <h2 className="font-serif">Send us a Message</h2>
              <div className="gold-divider"></div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="contact-form-grid">
                <div className="form-group">
                  <label>YOUR NAME <span>*</span></label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="E.g. Anjali Sharma" 
                    className="form-input" 
                    required
                  />
                </div>
                <div className="form-group">
                  <label>EMAIL ADDRESS <span>*</span></label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="email@example.com" 
                    className="form-input" 
                    required
                  />
                </div>
                <div className="form-group full">
                  <label>PHONE NUMBER <span>*</span></label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="E.g. +91 98765 43210" 
                    className="form-input" 
                    required
                  />
                </div>
                <div className="form-group full">
                  <label>SUBJECT <span>*</span></label>
                  <select 
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="form-select" 
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="custom">Custom Tailoring Inquiry</option>
                    <option value="order">Order Tracking / Issues</option>
                    <option value="styling">Virtual Styling Consultation</option>
                    <option value="wholesale">Wholesale / Business Inquiry</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group full">
                  <label>YOUR MESSAGE <span>*</span></label>
                  <textarea 
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us about your requirements or any questions you have..." 
                    className="form-textarea" 
                    rows={5}
                    required
                  ></textarea>
                </div>
              </div>

              <button type="submit" className="btn-submit-consult">
                <Send size={18} />
                START YOUR STYLE CONSULTATION
              </button>
            </form>

            <div className="quick-help-wrap">
              <h4>Need quick help?</h4>
              <div className="quick-help-btns">
                <button className="btn-quick"><Phone size={14} /> CALL NOW</button>
                <button className="btn-quick"><MessageCircle size={14} /> WHATSAPP</button>
                <button className="btn-quick"><MapPin size={14} /> VISIT STUDIO</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="contact-map-section container">
        <div className="map-card">
          <div className="map-iframe-wrap">
            {/* Using a placeholder for map, in production use Google Maps iframe */}
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3557.518683501712!2d75.8364!3d26.9175!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396db6fd7a44f77b%3A0xe74e797c558c4f0!2sJaipur!5e0!3m2!1sen!2sin!4v1650000000000!5m2!1sen!2sin" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy"
              title="Rang and Craft Studio Location"
            ></iframe>
          </div>
          <div className="map-content">
            <span className="map-tag">VISIT OUR STUDIO</span>
            <h2 className="map-title font-serif">Experience Our Collections <br /> in Person</h2>
            <p className="map-desc">
              Step into our Jaipur studio and explore our exclusive ethnic wear collections. Get personalized styling, custom fittings, and a truly memorable experience.
            </p>
            <button className="btn-directions">
              <ExternalLink size={18} />
              GET DIRECTIONS
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="contact-testimonials container">
        <div className="section-title-wrap">
          <h2 className="font-serif">Loved by 1000+ Customers</h2>
          <div className="gold-divider"></div>
        </div>

        <div className="testimonials-grid">
          {[
            { name: 'Neha Sharma', text: 'Amazing collection and perfect fitting. The staff is so friendly and helpful!' },
            { name: 'Priya Aggarwal', text: 'Best ethnic wear in Jaipur. Highly recommended for wedding shopping!' },
            { name: 'Riya Kapoor', text: 'Loved the custom stitching. Exactly what I wanted for my sister\'s wedding!' }
          ].map((test, idx) => (
            <div key={idx} className="test-card">
              <div className="stars">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="var(--gold-primary)" />)}
              </div>
              <p className="test-text">"{test.text}"</p>
              <h5 className="test-author">— {test.name}</h5>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Bar */}
      <section className="trust-bar">
        <div className="container trust-grid">
          <div className="trust-item">
            <ShieldCheck className="trust-icon" size={32} />
            <div className="trust-content">
              <h5>PREMIUM QUALITY</h5>
              <p>Finest fabrics & craftsmanship</p>
            </div>
          </div>
          <div className="trust-item">
            <Truck className="trust-icon" size={32} />
            <div className="trust-content">
              <h5>SECURE PAYMENTS</h5>
              <p>100% secure & trusted</p>
            </div>
          </div>
          <div className="trust-item">
            <RefreshCcw className="trust-icon" size={32} />
            <div className="trust-content">
              <h5>EASY RETURNS</h5>
              <p>Hassle-free returns</p>
            </div>
          </div>
          <div className="trust-item">
            <Globe className="trust-icon" size={32} />
            <div className="trust-content">
              <h5>WORLDWIDE SHIPPING</h5>
              <p>Delivering worldwide</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;

const ArrowRight = ({ size, className }: { size?: number, className?: string }) => (
  <svg 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);
