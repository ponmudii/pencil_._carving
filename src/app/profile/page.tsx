'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { formatDate } from '@/lib/utils';

export default function ProfilePage() {
  const { user, profile, updateProfile, signOut, loading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const [form, setForm] = useState({ full_name: '', phone: '', address: '', city: '', state: '', pincode: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/auth/login?redirect=/profile');
  }, [user, loading, router]);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        pincode: profile.pincode || '',
      });
    }
  }, [profile]);



  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await updateProfile(form);
    setSaving(false);
    if (error) addToast('error', error);
    else addToast('success', 'Profile updated!');
  };

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  if (loading || !user) return <div className="page-loader"><div className="spinner" /></div>;

  const firstName = profile?.full_name?.split(' ')[0] || 'Guest';

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  return (
    <div 
      style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', padding: '1rem' }}
      onClick={() => router.back()}
    >
      <div 
        style={{ 
          background: 'var(--surface)', 
          width: '100%', 
          maxWidth: '700px', 
          maxHeight: '90vh', 
          overflowY: 'auto', 
          borderRadius: '24px', 
          boxShadow: 'var(--shadow-lg)', 
          position: 'relative',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
        onClick={(e) => e.stopPropagation()}
        className="profile-card"
      >
        <button onClick={() => router.back()} style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(0,0,0,0.03)', border: 'none', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--muted)', zIndex: 10, transition: 'all 0.3s ease' }} className="close-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <style jsx>{`
          .close-btn:hover {
            background: var(--primary);
            color: #fff;
            transform: rotate(90deg);
          }
          .profile-card::-webkit-scrollbar { display: none; }
        `}</style>
        
        <div style={{ padding: '3rem 2rem 1.5rem', textAlign: 'center', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
            Hi {firstName}, {getGreeting().toLowerCase()}!
          </h1>
          <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>Member since {formatDate(profile?.created_at || user.created_at)}</p>
        </div>

        <div style={{ padding: '2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '1.5rem' }}>Personal Information</h2>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1.2rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={form.full_name} onChange={(e) => set('full_name', e.target.value)} placeholder="Your full name" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone / WhatsApp</label>
                <input className="form-input" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+91 xxxxx xxxxx" />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Address</label>
                <input className="form-input" value={form.address || ''} onChange={(e) => set('address', e.target.value)} placeholder="Street address" />
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-input" value={form.city || ''} onChange={(e) => set('city', e.target.value)} placeholder="City" />
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <input className="form-input" value={form.state || ''} onChange={(e) => set('state', e.target.value)} placeholder="State" />
              </div>
              <div className="form-group">
                <label className="form-label">Pincode</label>
                <input className="form-input" value={form.pincode || ''} onChange={(e) => set('pincode', e.target.value)} placeholder="600001" />
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '1.5rem', padding: '1rem', background: 'rgba(196,95,101,0.05)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--primary)', fontStyle: 'italic' }}>
              Your data is strictly confidential and never shared. We only use it to streamline your checkout experience and provide personalized festival discounts.
            </p>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={async () => { await signOut(); router.push('/'); }}>Sign Out</button>
              <button type="submit" className={`btn${saving ? ' btn-loading' : ''}`} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
