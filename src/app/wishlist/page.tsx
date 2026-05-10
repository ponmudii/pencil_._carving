'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { formatPrice, formatDate } from '@/lib/utils';

export default function WishlistPage() {
  const { user, loading } = useAuth();
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/auth/login?redirect=/wishlist');
  }, [user, loading, router]);

  if (loading || !user) return <div className="page-loader"><div className="spinner" /></div>;

  const handleMoveToCart = async (item: typeof items[0]) => {
    await addToCart({ product_title: item.product_title, product_image: item.product_image, product_price: item.product_price, product_category: item.product_category, quantity: 1, custom_text: null });
    await removeFromWishlist(item.id);
    addToast('success', 'Moved to cart!');
  };

  return (
    <>
      <Link href="/" className="nav-home" title="Home" aria-label="Home">
        <img src="/assets/images/home.png" alt="Home" onError={(e) => { (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/1946/1946488.png'; }} />
      </Link>
      <div style={{ background: 'linear-gradient(135deg,#e8a0a5,var(--primary))', padding: '5rem 2rem 3rem', textAlign: 'center', color: '#fff' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.8rem', marginBottom: '.4rem' }}>❤️ My Wishlist</h1>
        <p style={{ opacity: .85 }}>{items.length} saved {items.length === 1 ? 'item' : 'items'}</p>
      </div>

      <div className="page-container">
        {items.length === 0 ? (
          <div className="section-card" style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🤍</div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', marginBottom: '.5rem' }}>No saved items</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>Hover over gallery items and tap ❤️ to save them here.</p>
            <Link href="/" className="btn">Explore Gallery</Link>
          </div>
        ) : (
          <div className="section-card">
            <h2>Saved Items</h2>
            {items.map((item) => (
              <div key={item.id} className="item-row">
                <img src={item.product_image} alt={item.product_title} className="item-img"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=80'; }} />
                <div className="item-info">
                  <h4>{item.product_title}</h4>
                  <p style={{ textTransform: 'capitalize' }}>{item.product_category.replace(/_/g, ' ')}</p>
                  <p style={{ fontSize: '.8rem', opacity: .7 }}>Saved {formatDate(item.created_at)}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <span className="item-price">{formatPrice(item.product_price)}</span>
                  <button className="btn btn-sm" onClick={() => handleMoveToCart(item)}>Add to Cart</button>
                  <button style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '.85rem', fontWeight: 600 }}
                    onClick={async () => { await removeFromWishlist(item.id); addToast('info', 'Removed from wishlist'); }}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


    </>
  );
}
