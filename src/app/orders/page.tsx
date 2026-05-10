'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { formatDate, formatPrice, ORDER_STATUS } from '@/lib/utils';
import type { Order } from '@/types';

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (!loading && !user) router.replace('/auth/login?redirect=/orders');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    supabase.from('orders').select('*, items:order_items(*)').eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setOrders((data as Order[]) || []); setFetching(false); });
  }, [user, supabase]);

  if (loading || !user) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <>
      <Link href="/" className="nav-home" title="Home" aria-label="Home">
        <img src="/assets/images/home.png" alt="Home" onError={(e) => { (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/1946/1946488.png'; }} />
      </Link>
      <div style={{ background: 'linear-gradient(135deg,#6b4c8a,#9b6dbd)', padding: '5rem 2rem 3rem', textAlign: 'center', color: '#fff' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.8rem', marginBottom: '.4rem' }}>📦 My Orders</h1>
        <p style={{ opacity: .85 }}>{orders.length} {orders.length === 1 ? 'order' : 'orders'} total</p>
      </div>

      {/* Quick links */}
      <div style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,.07)', padding: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <Link href="/cart" className="btn btn-ghost btn-sm">🛒 Cart</Link>
        <Link href="/orders" className="btn btn-sm">📦 Orders</Link>
      </div>

      <div className="page-container">
        {fetching ? (
          <div className="page-loader"><div className="spinner" /></div>
        ) : orders.length === 0 ? (
          <div className="section-card" style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', marginBottom: '.5rem' }}>No orders yet</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>Place your first custom order with us!</p>
            <Link href="/contact" className="btn">Place an Order</Link>
          </div>
        ) : (
          orders.map((order) => {
            const st = ORDER_STATUS[order.status];
            const isOpen = expanded === order.id;
            return (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div>
                    <div className="order-number">Order #{order.order_number}</div>
                    <div className="order-date">{formatDate(order.created_at)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="status-badge" style={{ background: st.color + '20', color: st.color }}>{st.label}</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.1rem' }}>{formatPrice(order.total_amount)}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1rem', fontSize: '.9rem', color: 'var(--muted)', marginBottom: '1rem' }}>
                  <div><span style={{ fontWeight: 600, color: 'var(--text)' }}>Advance paid:</span> {formatPrice(order.advance_paid)}</div>
                  <div><span style={{ fontWeight: 600, color: 'var(--text)' }}>Balance:</span> {formatPrice(order.total_amount - order.advance_paid)}</div>
                  {order.payment_id && <div><span style={{ fontWeight: 600, color: 'var(--text)' }}>Payment ID:</span> {order.payment_id}</div>}
                </div>

                {order.notes && (
                  <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-sm)', padding: '1rem', fontSize: '.9rem', color: 'var(--muted)', marginBottom: '1rem', whiteSpace: 'pre-line' }}>
                    {order.notes}
                  </div>
                )}

                <button className="btn btn-ghost btn-sm" onClick={() => setExpanded(isOpen ? null : order.id)}>
                  {isOpen ? 'Hide Details ▲' : 'View Details ▼'}
                </button>

                {isOpen && (
                  <div style={{ marginTop: '1.2rem', borderTop: '1px solid rgba(0,0,0,.07)', paddingTop: '1.2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '.8rem', fontSize: '.88rem' }}>
                      <div><strong>Name:</strong> {order.shipping_name}</div>
                      <div><strong>Phone:</strong> {order.shipping_phone}</div>
                      {order.shipping_address && <div style={{ gridColumn: '1/-1' }}><strong>Address:</strong> {order.shipping_address}</div>}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>


    </>
  );
}
