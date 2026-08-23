'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Signup() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', whatsapp: '', address: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Signup failed');
        setLoading(false);
        return;
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/');
    } catch (err) {
      console.error('Signup submit error:', err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p className="auth-subtitle">Join Destin Vacations and start planning your dream trip</p>
        {error && <p style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}
        <form onSubmit={submit}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Full Name</label>
            <input type="text" className="form-control" placeholder="Enter your full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} disabled={loading} required />
          </div>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Email Address</label>
            <input type="email" className="form-control" placeholder="Enter your email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} disabled={loading} required />
          </div>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Password</label>
            <input type="password" className="form-control" placeholder="Create a password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} disabled={loading} required />
          </div>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Phone Number</label>
            <input type="tel" className="form-control" placeholder="Enter your phone number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} disabled={loading} />
          </div>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>WhatsApp Number</label>
            <input type="tel" className="form-control" placeholder="Enter your WhatsApp number" value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} disabled={loading} />
          </div>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Address</label>
            <input type="text" className="form-control" placeholder="Enter your address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} disabled={loading} />
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
                Creating Account...
              </>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>
        <div className="auth-footer">
          <p>Already have an account? <Link href="/login">Login</Link></p>
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
