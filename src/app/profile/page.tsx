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
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '2rem 1rem 4rem' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', padding: '2rem 0 2rem', borderBottom: '1px solid rgba(0,0,0,0.07)', marginBottom: '2rem' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700, margin: '0 auto 1rem', fontFamily: 'var(--font-heading)' }}>
            {firstName[0].toUpperCase()}
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--primary)', marginBottom: '0.3rem' }}>
            {getGreeting()}, {firstName}!
          </h1>
          <p style={{ opacity: 0.6, fontSize: '0.88rem' }}>Member since {formatDate(profile?.created_at || user.created_at)}</p>
          <p style={{ opacity: 0.5, fontSize: '0.82rem', marginTop: '0.2rem' }}>{user.email}</p>
        </div>

        {/* Form */}
        <div style={{ background: 'var(--surface)', borderRadius: '20px', padding: '2rem', boxShadow: 'var(--shadow)' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', marginBottom: '1.5rem' }}>Personal Information</h2>
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

            <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: '1.5rem', padding: '0.8rem 1rem', background: 'rgba(196,95,101,0.05)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--primary)', fontStyle: 'italic' }}>
              Your data is strictly confidential and never shared.
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
