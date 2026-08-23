'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err) {
      console.error('Login submit error:', err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Login to your Destin Vacations account</p>
        {error && <p style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}
        <form onSubmit={submit}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Email Address</label>
            <input type="email" className="form-control" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} disabled={loading} required />
          </div>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Password</label>
            <input type={showPassword ? 'text' : 'password'} className="form-control" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} required />
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', cursor: 'pointer', fontSize: '0.88rem', color: '#444' }}>
              <input type="checkbox" checked={showPassword} onChange={e => setShowPassword(e.target.checked)} style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#173D2F' }} disabled={loading} />
              Show password
            </label>
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              width: '100%',
              marginBottom: '1rem',
              opacity: loading ? 0.75 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            {loading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
        <div className="auth-footer">
          <p>Don&apos;t have an account? <Link href="/signup">Sign up</Link></p>
          <p style={{ marginTop: '0.5rem' }}><Link href="/forgot-password">Forgot Password?</Link></p>
          <p style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '0.8rem' }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              <i className="fa-solid fa-arrow-left" style={{ fontSize: '0.8rem' }}></i> Back to Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
