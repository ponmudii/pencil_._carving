'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import GlitterTrail from '@/components/GlitterTrail';

const BG_IMAGES = [
  '/assets/b.loop/5.png',
  '/assets/b.loop/1.avif',
  '/assets/b.loop/3.jpg',
  '/assets/b.loop/2.avif',
  '/assets/b.loop/6.avif',
  '/assets/b.loop/7.avif',
  '/assets/b.loop/4.avif',
  '/assets/b.loop/8.jpg',
];

const CATEGORIES = [
  { id: 'pencil_carving', title: 'Pencil Carving', img: '/assets/images/pencilcarving.png', desc: 'Names, quotes & microscopic art intricately carved on graphite.' },
  { id: 'portraits', title: 'Portraits', img: '/assets/images/portrait.jpg', desc: 'Stunning, detailed handcrafted portraits bringing subjects to life.' },
  { id: 'hampers', title: 'Gift Hampers', img: '/assets/images/hamper.png', desc: 'A curated sea of premium gifts made specially for your chosen one.' },
  { id: 'chocolates', title: 'Custom Chocolates', img: '/assets/images/chocolate.jpg', desc: 'Delicious treats re-wrapped with your personal message or design.' },
  { id: 'frames', title: 'Custom Frames', img: '/assets/images/frame.jpg', desc: 'Combine photos, quotes, and carvings beautifully framed forever.' },
];

export default function Home() {
  const [current, setCurrent] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [section, setSection] = useState<'home' | 'about'>('home');
  const { user, profile, signOut } = useAuth();
  const { itemCount } = useCart();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout>();

  // Slideshow
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % BG_IMAGES.length);
    }, 2500);
    return () => clearInterval(timerRef.current);
  }, []);

  // Scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } }),
      { threshold: 0.15 }
    );
    document.querySelectorAll('.fade-in-up').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [section]);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <>
      {/* Home / Menu Button */}
      <div ref={menuRef}>
        <button
          className={`nav-home ${section === 'about' ? '' : 'with-bg'}`}
          onClick={() => section === 'about' ? setSection('home') : setMenuOpen((o) => !o)}
          title={section === 'about' ? 'Back to Home' : 'Menu'}
          aria-label={section === 'about' ? 'Back to Home' : 'Menu'}
        >
          {section === 'about' ? (
            // Home image when on About page
            <img src="/assets/images/home.png" alt="Home" onError={(e) => { (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/1946/1946488.png'; }} />
          ) : (
            // Hamburger when on Home
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="12" x2="20" y2="12"></line>
              <line x1="4" y1="6" x2="20" y2="6"></line>
              <line x1="4" y1="18" x2="20" y2="18"></line>
            </svg>
          )}
        </button>

        {menuOpen && (
          <nav className="nav-menu">
            <a onClick={() => { setSection('about'); setMenuOpen(false); }} style={{ cursor: 'pointer' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              About
            </a>
            {user ? (
              <>
                <Link href="/profile" onClick={() => setMenuOpen(false)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  Profile
                </Link>
                <Link href="/cart" onClick={() => setMenuOpen(false)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                  Cart {itemCount > 0 && `(${itemCount})`}
                </Link>
                <Link href="/wishlist" onClick={() => setMenuOpen(false)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                  Wishlist
                </Link>
                <Link href="/orders" onClick={() => setMenuOpen(false)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                  My Orders
                </Link>
                <div className="menu-sep" />
                <Link href="/contact" onClick={() => setMenuOpen(false)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  Place Order
                </Link>
                <button onClick={async () => { setMenuOpen(false); await signOut(); router.push('/'); }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setMenuOpen(false)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
                  Sign In
                </Link>
                <Link href="/auth/signup" onClick={() => setMenuOpen(false)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                  Sign Up
                </Link>
                <div className="menu-sep" />
                <Link href="/contact" onClick={() => setMenuOpen(false)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  Place Order
                </Link>
              </>
            )}
          </nav>
        )}
      </div>

      {/* Right nav */}
      <div className="nav-right">
        <Link href="/cart" className="nav-pill" title="My Cart">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
          <span className="nav-label">Cart</span>
          {itemCount > 0 && <span className="badge">{itemCount}</span>}
        </Link>
        {user ? (
          <Link href="/profile" className="nav-pill" title="My Account">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span className="nav-label">{profile?.full_name?.split(' ')[0] || user.user_metadata?.full_name?.split(' ')[0] || 'Profile'}</span>
          </Link>
        ) : (
          <Link href="/auth/login?redirect=/" className="nav-pill" title="Login">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
            <span className="nav-label">Login</span>
          </Link>
        )}
      </div>

      {/* HOME SECTION */}
      {section === 'home' && (
        <div>
          {/* Hero */}
          <header className="header">
            {BG_IMAGES.map((src, i) => (
              <div key={src} className={`bg-slide${i === current ? ' active' : ''}`} style={{ backgroundImage: `url('${src}')` }} />
            ))}
            <div className="fade-in-up visible">
              <h1 className="site-title">Graphite Gallery</h1>
              <span className="accent-text">by Ponmudi</span>
              <p>Turn your beautiful everyday moments into treasured, handcrafted memories.</p>
              <Link href="/contact" className="btn btn-lg">Place an Order</Link>
            </div>
          </header>

          {/* Services */}
          <section className="services">
            <h2 className="fade-in-up">Our Masterpieces</h2>
            <p className="fade-in-up delay-1">Handcrafted specially for you</p>
            <div className="cards">
              {CATEGORIES.map((cat, i) => (
                <div key={cat.id} className={`card fade-in-up delay-${Math.min(i, 3)}`} onClick={() => router.push(`/gallery/${cat.id}`)}>
                  <div className="card-img-wrapper">
                    <img src={cat.img} alt={cat.title} onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=400'; }} />
                  </div>
                  <h3>{cat.title}</h3>
                  <p>{cat.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="cta" style={{ background: '#000', overflow: 'hidden' }}>
            <video 
              className="cta-video" 
              autoPlay 
              loop 
              muted 
              playsInline
              style={{ opacity: 0.8 }}
            >
              <source src="/assets/vid/v3.mp4" type="video/mp4" />
            </video>
            <div className="cta-overlay" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6))', zIndex: 1 }} />
            <GlitterTrail />
            <div style={{ position: 'relative', zIndex: 5, padding: '0 1rem' }}>
              <h2 style={{ opacity: 1, visibility: 'visible', transform: 'none' }}>Make Their Day Special</h2>
              <p style={{ opacity: 1, visibility: 'visible', transform: 'none' }}>Delivered securely across India with absolute love and creativity 💝</p>
              <a href={`https://wa.me/916381263884?text=hi+may+i+know+more+about+your+gift+ideas`} className="btn" target="_blank" rel="noopener noreferrer">
                Contact via WhatsApp
              </a>
            </div>
          </section>

          <footer>
            <p>Crafting memories, one gift at a time.</p>
          </footer>
        </div>
      )}

      {/* ABOUT SECTION */}
      {section === 'about' && (
        <div>
          <div className="about-header">
            <h1 className="fade-in-up">The Story Below</h1>
          </div>
          <div className="about-container fade-in-up delay-1">
            <section className="about-section">
              <h2>Who I Am</h2>
              <p>Hi! I&apos;m a young entrepreneur and creative soul who believes in turning everyday moments into treasured memories. What started as a hobby has blossomed into my true passion — creating handmade, personalized gifts that touch hearts and last forever.</p>
            </section>
            <section className="about-section" style={{ background: 'transparent', boxShadow: 'none', padding: 0 }}>
              <h2 style={{ marginLeft: 20 }}>Our Mission &amp; Vision</h2>
              <div className="mission-box">
                <div className="mission-item">
                  <h3>Our Mission</h3>
                  <p>To create highly affordable, exceptional quality, personalized gifts that make people feel deeply valued and remembered long after the moment passes.</p>
                </div>
                <div className="mission-item">
                  <h3>Our Vision</h3>
                  <p>To be the premier go-to destination across India for anyone looking for that heartfelt, unique gift that truly, profoundly says &quot;I care.&quot;</p>
                </div>
              </div>
            </section>
            <section className="about-section" style={{ textAlign: 'center', background: 'linear-gradient(135deg,rgba(196,95,101,.1),rgba(255,255,255,0))', border: 'none', boxShadow: 'none' }}>
              <h2>Let&apos;s Create Magic Together</h2>
              <p>Whether it&apos;s for your best friend, your soulmate, your parent, or yourself – we&apos;re ready to make it unforgettable.</p>
              <Link href="/contact" className="btn" style={{ marginTop: '1.5rem' }}>Start Your Custom Order Now</Link>
            </section>
          </div>
          <footer>
            <p>Crafting memories, one gift at a time.</p>
          </footer>
        </div>
      )}
    </>
  );
}
