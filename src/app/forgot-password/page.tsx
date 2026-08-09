'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Failed to send OTP');
      return;
    }
    setMessage('OTP sent to your email');
    setStep(2);
  };

  const verifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Failed to reset password');
      return;
    }
    setMessage('Password reset successfully! You can now login.');
    setStep(3);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Reset Password</h2>
        <p className="auth-subtitle">Recover your account via OTP verification</p>
        {message && <p style={{ color: 'green', marginBottom: '1rem', textAlign: 'center' }}>{message}</p>}
        {error && <p style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}

        {step === 1 && (
          <form onSubmit={sendOtp}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Email Address</label>
              <input type="email" className="form-control" placeholder="Enter your registered email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Send OTP</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={verifyAndReset}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>OTP</label>
              <input type="text" className="form-control" placeholder="Enter OTP" value={otp} onChange={e => setOtp(e.target.value)} required />
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>New Password</label>
              <input type="password" className="form-control" placeholder="Enter new password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }}>Reset Password</button>
          </form>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center' }}>
            <Link href="/login" className="btn btn-primary" style={{ width: '100%' }}>Go to Login</Link>
          </div>
        )}

        <div className="auth-footer">
          <p>Remember your password? <Link href="/login">Login</Link></p>
        </div>
      </div>
    </div>
  );
}
