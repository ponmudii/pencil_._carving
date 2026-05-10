'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { user, loading } = useAuth();
  const { items, itemCount, totalPrice, removeFromCart, updateQuantity, clearCart } = useCart();
  const { addToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/auth/login?redirect=/cart');
  }, [user, loading, router]);

  if (loading || !user) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <>
      <Link href="/" className="nav-home" title="Home" aria-label="Home">
        <img src="/assets/images/home.png" alt="Home" onError={(e) => { (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/1946/1946488.png'; }} />
      </Link>
      <div style={{ background: 'linear-gradient(135deg,var(--primary),#a8494f)', padding: '5rem 2rem 3rem', textAlign: 'center', color: '#fff' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.8rem', marginBottom: '.4rem' }}>🛒 My Cart</h1>
        <p style={{ opacity: .85 }}>{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
      </div>

      {/* Quick links */}
      <div style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,.07)', padding: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <Link href="/cart" className="btn btn-sm">🛒 Cart</Link>
        <Link href="/orders" className="btn btn-ghost btn-sm">📦 Orders</Link>
      </div>

      <div className="page-container">
        {items.length === 0 ? (
          <div className="section-card" style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', marginBottom: '.5rem' }}>Your cart is empty</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>Browse our gallery and add something special!</p>
            <Link href="/" className="btn">Explore Gallery</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2rem', alignItems: 'start' }}>
            <div className="section-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, borderBottom: 'none', padding: 0 }}>Cart Items</h2>
                <button className="btn btn-ghost btn-sm" style={{ color: '#ef4444', borderColor: '#ef4444' }}
                  onClick={async () => { await clearCart(); addToast('info', 'Cart cleared'); }}>
                  Clear All
                </button>
              </div>

              {items.map((item) => (
                <div key={item.id} className="item-row">
                  <img src={item.product_image} alt={item.product_title} className="item-img"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=80'; }} />
                  <div className="item-info">
                    <h4>{item.product_title}</h4>
                    <p style={{ textTransform: 'capitalize' }}>{item.product_category.replace(/_/g, ' ')}</p>
                    {item.custom_text && <p>📝 {item.custom_text}</p>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <span className="item-price">{formatPrice(item.product_price * item.quantity)}</span>
                    <div className="qty-control">
                      <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>−</button>
                      <span style={{ fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <button style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '.85rem', fontWeight: 600 }}
                      onClick={async () => { await removeFromCart(item.id); addToast('info', 'Item removed'); }}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="section-card" style={{ position: 'sticky', top: '100px', minWidth: '260px' }}>
              <h2>Order Summary</h2>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.8rem' }}>
                <span style={{ color: 'var(--muted)' }}>Subtotal ({itemCount} items)</span>
                <span style={{ fontWeight: 600 }}>{formatPrice(totalPrice)}</span>
              </div>
              <div style={{ height: '1px', background: 'rgba(0,0,0,.08)', margin: '1rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Total</span>
                <span style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--primary)' }}>{formatPrice(totalPrice)}</span>
              </div>
              <Link href="/contact" className="btn btn-full">Place Custom Order</Link>
              <p style={{ fontSize: '.82rem', color: 'var(--muted)', textAlign: 'center', marginTop: '.8rem' }}>
                Orders are placed via the contact form with Razorpay advance payment.
              </p>
            </div>
          </div>
        )}
      </div>


    </>
  );
}
