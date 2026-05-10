'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { isValidEmail } from '@/lib/utils';

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { signUp, user } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  useEffect(() => { if (user) router.replace('/profile'); }, [user, router]);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    else if (form.name.trim().length < 2) e.name = 'Name is too short';
    if (!form.email) e.email = 'Email is required';
    else if (!isValidEmail(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Must be at least 8 characters';
    else if (!/[A-Z]/.test(form.password)) e.password = 'Include at least one uppercase letter';
    else if (!/[0-9]/.test(form.password)) e.password = 'Include at least one number';
    if (!form.confirm) e.confirm = 'Please confirm your password';
    else if (form.confirm !== form.password) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const strength = () => {
    let s = 0;
    if (form.password.length >= 8) s++;
    if (/[A-Z]/.test(form.password)) s++;
    if (/[0-9]/.test(form.password)) s++;
    if (/[^a-zA-Z0-9]/.test(form.password)) s++;
    return s;
  };
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    const { error } = await signUp(form.email.trim().toLowerCase(), form.password, form.name.trim());
    setLoading(false);
    if (error) {
      if (error.includes('already registered') || error.includes('already been used')) {
        setErrors({ form: 'An account with this email already exists. Try signing in.' });
      } else {
        setErrors({ form: error });
      }
    } else {
      setDone(true);
      addToast('success', 'Account created! Check your email to verify.');
    }
  };

  if (done) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>📬</div>
          <h2 className="auth-title">Check your email</h2>
          <p className="auth-sub">
            We&apos;ve sent a verification link to <strong>{form.email}</strong>.<br />
            Click the link to activate your account.
          </p>
          <Link href="/auth/login" className="btn btn-full" style={{ marginTop: '2rem' }}>Go to Sign In</Link>
          <p style={{ marginTop: '1.5rem' }}>
            <Link href="/" style={{ color: 'var(--muted)', fontSize: '.85rem', textDecoration: 'none' }}>← Back to Gallery</Link>
          </p>
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
        <h2 className="auth-title">Create account</h2>
        <p className="auth-sub">Join us and start saving your wishlist & orders</p>

        {errors.form && <div className="alert alert-error">⚠ {errors.form}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input id="name" type="text" className={`form-input${errors.name ? ' error' : ''}`} placeholder="Your full name" value={form.name} onChange={(e) => set('name', e.target.value)} disabled={loading} />
            {errors.name && <p className="form-error">⚠ {errors.name}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email address</label>
            <input id="email" type="email" className={`form-input${errors.email ? ' error' : ''}`} placeholder="hello@example.com" value={form.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" disabled={loading} />
            {errors.email && <p className="form-error">⚠ {errors.email}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input id="password" type="password" className={`form-input${errors.password ? ' error' : ''}`} placeholder="Min 8 chars, 1 uppercase, 1 number" value={form.password} onChange={(e) => set('password', e.target.value)} autoComplete="new-password" disabled={loading} />
            {form.password && (
              <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: '#eee', overflow: 'hidden' }}>
                  <div style={{ width: `${strength() * 25}%`, height: '100%', background: strengthColor[strength()], transition: 'all .3s' }} />
                </div>
                <span style={{ fontSize: '.78rem', color: strengthColor[strength()], fontWeight: 600 }}>{strengthLabel[strength()]}</span>
              </div>
            )}
            {errors.password && <p className="form-error">⚠ {errors.password}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirm">Confirm Password</label>
            <input id="confirm" type="password" className={`form-input${errors.confirm ? ' error' : ''}`} placeholder="Repeat password" value={form.confirm} onChange={(e) => set('confirm', e.target.value)} autoComplete="new-password" disabled={loading} />
            {errors.confirm && <p className="form-error">⚠ {errors.confirm}</p>}
          </div>

          <button type="submit" className={`btn btn-full${loading ? ' btn-loading' : ''}`} disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <div className="divider">or</div>
        <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '.93rem' }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link href="/" style={{ color: 'var(--muted)', fontSize: '.85rem', textDecoration: 'none' }}>← Back to Gallery</Link>
        </p>
      </div>
    </div>
  );
}
