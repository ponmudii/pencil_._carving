'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchGalleryProducts, galleryCategories } from '@/lib/github';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/context/ToastContext';
import type { GalleryProduct } from '@/types';

export default function GalleryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.category as string;
  const cat = galleryCategories[categoryId];

  const [products, setProducts] = useState<GalleryProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToast } = useToast();

  useEffect(() => {
    if (!cat) { router.replace('/'); return; }
    setLoading(true);
    fetchGalleryProducts(categoryId).then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, [categoryId, cat, router]);

  // Scroll fade-in
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { (e.target as HTMLElement).style.opacity = '1'; observer.unobserve(e.target); } }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.gallery-wrapper').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [products]);

  const handleAddToCart = async (p: GalleryProduct) => {
    if (!user) { addToast('info', 'Sign in to add items to your cart'); router.push('/auth/login'); return; }
    await addToCart({ product_title: p.title, product_image: p.path, product_price: p.priceNum, product_category: categoryId, quantity: 1, custom_text: null });
    addToast('success', `${p.title} added to cart!`);
  };

  const handleWishlist = async (p: GalleryProduct) => {
    if (!user) { addToast('info', 'Sign in to save items'); router.push('/auth/login'); return; }
    await toggleWishlist({ product_title: p.title, product_image: p.path, product_price: p.priceNum, product_category: categoryId });
    const inList = isInWishlist(p.title, categoryId);
    addToast('success', inList ? 'Removed from wishlist' : 'Added to wishlist ❤️');
  };

  if (!cat) return null;

  return (
    <>
      <div className="about-header" style={{ height: '35vh', background: 'var(--primary)' }}>
        <h1 className="fade-in-up visible" style={{ WebkitTextFillColor: 'white', background: 'none' }}>{cat.title}</h1>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <Link href="/" className="btn" style={{ background: 'var(--primary)' }}>← Back to Masterpieces</Link>
          {user && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link href="/cart" className="btn btn-ghost btn-sm">🛒 Cart</Link>
              <Link href="/wishlist" className="btn btn-ghost btn-sm">❤️ Wishlist</Link>
            </div>
          )}
        </div>

        {loading ? (
          <div className="page-loader">
            <div className="spinner" />
            <p style={{ color: 'var(--muted)' }}>Loading masterpieces…</p>
          </div>
        ) : products.length === 0 ? (
          <div className="page-loader"><p style={{ color: 'var(--muted)', fontSize: '1.2rem' }}>No images found yet in this gallery.</p></div>
        ) : (
          <div className="masonry-grid">
            {products.map((item, index) => (
              <GalleryCard
                key={item.path}
                item={item}
                index={index}
                inWishlist={isInWishlist(item.title, categoryId)}
                onAddToCart={() => handleAddToCart(item)}
                onWishlist={() => handleWishlist(item)}
                showActions={!!user}
              />
            ))}
          </div>
        )}
      </div>


    </>
  );
}

function GalleryCard({ item, index, inWishlist, onAddToCart, onWishlist, showActions }: {
  item: GalleryProduct; index: number; inWishlist: boolean;
  onAddToCart: () => void; onWishlist: () => void; showActions: boolean;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mainImgRef = useRef<HTMLImageElement>(null);
  const hoverRefs = useRef<HTMLImageElement[]>([]);
  const intervalRef = useRef<NodeJS.Timeout>();
  const hoverIndexRef = useRef(0);
  const [actionsVisible, setActionsVisible] = useState(false);

  const onEnter = () => {
    setActionsVisible(true);
    if (!wrapperRef.current) return;
    wrapperRef.current.style.transform = 'translateY(-10px) scale(1.02)';
    wrapperRef.current.style.boxShadow = '0 15px 35px rgba(0,0,0,.15)';

    if (hoverRefs.current.length > 0) {
      hoverIndexRef.current = 0;
      hoverRefs.current.forEach((img, i) => { img.style.opacity = i === 0 ? '1' : '0'; img.style.transform = i === 0 ? 'scale(1.15)' : 'scale(1)'; });
      if (mainImgRef.current) mainImgRef.current.style.opacity = '0';
      intervalRef.current = setInterval(() => {
        hoverIndexRef.current = (hoverIndexRef.current + 1) % hoverRefs.current.length;
        hoverRefs.current.forEach((img, i) => { img.style.opacity = i === hoverIndexRef.current ? '1' : '0'; img.style.transform = i === hoverIndexRef.current ? 'scale(1.15)' : 'scale(1)'; });
      }, 1000);
    } else if (mainImgRef.current) {
      mainImgRef.current.style.transform = 'scale(1.15)';
    }
  };

  const onLeave = () => {
    setActionsVisible(false);
    clearInterval(intervalRef.current);
    if (!wrapperRef.current) return;
    wrapperRef.current.style.transform = 'none';
    wrapperRef.current.style.boxShadow = '0 8px 25px rgba(0,0,0,.08)';
    hoverRefs.current.forEach((img) => { img.style.opacity = '0'; img.style.transform = 'scale(1)'; });
    if (mainImgRef.current) { mainImgRef.current.style.opacity = '1'; mainImgRef.current.style.transform = 'scale(1)'; }
  };

  return (
    <div
      ref={wrapperRef}
      className="gallery-wrapper"
      style={{ animationDelay: `${index * 0.05}s`, position: 'relative' }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div className="gallery-img-wrap">
        {/* Gloss sweep layer */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none', overflow: 'hidden' }}>
          <div className="gloss-sweep" />
        </div>

        <img ref={mainImgRef} src={item.path} alt={item.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, transition: 'opacity .5s ease,transform .8s cubic-bezier(.25,1,.5,1)' }}
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=400'; }}
        />
        {item.hovers.map((src, i) => (
          <img key={src} ref={(el) => { if (el) hoverRefs.current[i] = el; }} src={src} alt={`${item.title} view ${i + 1}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, opacity: 0, transition: 'opacity .5s ease,transform .8s cubic-bezier(.25,1,.5,1)' }}
          />
        ))}

        {/* Quick actions overlay */}
        {showActions && actionsVisible && (
          <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={(e) => { e.stopPropagation(); onWishlist(); }}
              style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,.92)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,.15)', transition: 'transform .2s' }}
              title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              {inWishlist ? '❤️' : '🤍'}
            </button>
            <button onClick={(e) => { e.stopPropagation(); onAddToCart(); }}
              style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'var(--primary)', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(196,95,101,.4)', color: '#fff' }}
              title="Add to cart"
            >
              🛒
            </button>
          </div>
        )}
      </div>

      {/* Details */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0 5px 8px' }}>
        <div style={{ flex: 1, paddingRight: 10 }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, marginBottom: 2, color: 'var(--text)' }}>{item.title}</h3>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '.88rem', color: 'var(--muted)', margin: 0 }}>{item.subtitle}</p>
        </div>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap', flexShrink: 0 }}>{item.price}</span>
      </div>
    </div>
  );
}
