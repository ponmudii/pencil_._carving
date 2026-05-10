'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/context/ToastContext';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (password.length < 8) errs.password = 'Must be at least 8 characters';
    if (!/[A-Z]/.test(password)) errs.password = 'Include at least one uppercase letter';
    if (confirm !== password) errs.confirm = 'Passwords do not match';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setErrors({ form: error.message });
    } else {
      addToast('success', 'Password updated successfully!');
      router.push('/profile');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo"><h1>Graphite Gallery</h1><p>by Ponmudi</p></div>
        <h2 className="auth-title">Set new password</h2>
        <p className="auth-sub">Choose a strong new password for your account.</p>
        {errors.form && <div className="alert alert-error">⚠ {errors.form}</div>}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="password">New Password</label>
            <input id="password" type="password" className={`form-input${errors.password ? ' error' : ''}`} placeholder="Min 8 chars, 1 uppercase" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
            {errors.password && <p className="form-error">⚠ {errors.password}</p>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="confirm">Confirm Password</label>
            <input id="confirm" type="password" className={`form-input${errors.confirm ? ' error' : ''}`} placeholder="Repeat password" value={confirm} onChange={(e) => setConfirm(e.target.value)} disabled={loading} />
            {errors.confirm && <p className="form-error">⚠ {errors.confirm}</p>}
          </div>
          <button type="submit" className={`btn btn-full${loading ? ' btn-loading' : ''}`} disabled={loading}>
            {loading ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
