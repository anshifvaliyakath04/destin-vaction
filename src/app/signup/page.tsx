'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Signup() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', whatsapp: '', address: '' });
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Signup failed');
      return;
    }
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    router.push('/');
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
            <input type="text" className="form-control" placeholder="Enter your full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Email Address</label>
            <input type="email" className="form-control" placeholder="Enter your email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Password</label>
            <input type="password" className="form-control" placeholder="Create a password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Phone Number</label>
            <input type="tel" className="form-control" placeholder="Enter your phone number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>WhatsApp Number</label>
            <input type="tel" className="form-control" placeholder="Enter your WhatsApp number" value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} />
          </div>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Address</label>
            <input type="text" className="form-control" placeholder="Enter your address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }}>Sign Up</button>
        </form>
        <div className="auth-footer">
          <p>Already have an account? <Link href="/login">Login</Link></p>
        </div>
      </div>
    </div>
  );
}
