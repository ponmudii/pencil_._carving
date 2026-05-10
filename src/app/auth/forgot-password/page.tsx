'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { isValidEmail } from '@/lib/utils';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Email is required'); return; }
    if (!isValidEmail(email)) { setError('Enter a valid email address'); return; }
    setLoading(true);
    setError('');
    const { error: err } = await resetPassword(email.trim().toLowerCase());
    setLoading(false);
    if (err) setError(err);
    else setSent(true);
  };

  if (sent) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>📧</div>
          <h2 className="auth-title">Check your inbox</h2>
          <p className="auth-sub">
            We sent a password reset link to <strong>{email}</strong>.<br />
            Click the link to set a new password.
          </p>
          <Link href="/auth/login" className="btn btn-full" style={{ marginTop: '2rem' }}>Back to Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>Graphite Gallery</h1>
          <p>by Ponmudi</p>
        </div>
        <h2 className="auth-title">Forgot password?</h2>
        <p className="auth-sub">Enter your email and we&apos;ll send a reset link.</p>
        {error && <div className="alert alert-error">⚠ {error}</div>}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email address</label>
            <input id="email" type="email" className={`form-input${error ? ' error' : ''}`} placeholder="hello@example.com" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} disabled={loading} />
          </div>
          <button type="submit" className={`btn btn-full${loading ? ' btn-loading' : ''}`} disabled={loading}>
            {loading ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link href="/auth/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', fontSize: '.9rem' }}>← Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}
