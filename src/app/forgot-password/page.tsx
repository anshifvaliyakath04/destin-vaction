'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1: Send OTP
  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
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
      setMessage('OTP sent to your email. Please check your inbox.');
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP only
  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid or expired OTP');
        return;
      }
      setMessage('OTP verified! Now set your new password.');
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password
  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
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
      setStep(4);
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = ['Enter Email', 'Verify OTP', 'New Password'];

  return (
    <>
      <Navbar />
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f2418 0%, #173D2F 60%, #1a4a38 100%)',
          padding: '2rem 1rem',
          paddingTop: '90px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '460px',
            background: 'rgba(255,255,255,0.97)',
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #173D2F, #2d6a4f)',
              padding: '2rem 2rem 1.5rem',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                fontSize: '1.6rem',
              }}
            >
              🔐
            </div>
            <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
              Reset Password
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', marginTop: '0.4rem', fontSize: '0.9rem' }}>
              {step === 1 && 'Enter your registered email to receive an OTP'}
              {step === 2 && `OTP sent to ${email}`}
              {step === 3 && 'Create a strong new password'}
              {step === 4 && 'Your password has been reset!'}
            </p>
          </div>

          {/* Step Progress Bar (only for steps 1-3) */}
          {step <= 3 && (
            <div style={{ padding: '1.5rem 2rem 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                {stepLabels.map((label, idx) => {
                  const stepNum = idx + 1;
                  const isCompleted = step > stepNum;
                  const isActive = step === stepNum;
                  return (
                    <div key={stepNum} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                      {/* Connector line before (skip for first) */}
                      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        {idx > 0 && (
                          <div
                            style={{
                              flex: 1,
                              height: '2px',
                              background: isCompleted || isActive ? '#2d6a4f' : '#e0e0e0',
                              transition: 'background 0.3s',
                            }}
                          />
                        )}
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            background: isCompleted ? '#2d6a4f' : isActive ? '#173D2F' : '#e0e0e0',
                            color: isCompleted || isActive ? '#fff' : '#999',
                            transition: 'all 0.3s',
                            flexShrink: 0,
                          }}
                        >
                          {isCompleted ? '✓' : stepNum}
                        </div>
                        {idx < stepLabels.length - 1 && (
                          <div
                            style={{
                              flex: 1,
                              height: '2px',
                              background: isCompleted ? '#2d6a4f' : '#e0e0e0',
                              transition: 'background 0.3s',
                            }}
                          />
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          marginTop: '0.4rem',
                          color: isActive ? '#173D2F' : isCompleted ? '#2d6a4f' : '#aaa',
                          fontWeight: isActive ? 700 : 400,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Body */}
          <div style={{ padding: '1.5rem 2rem 2rem' }}>
            {/* Messages */}
            {message && (
              <div
                style={{
                  background: '#e8f5e9',
                  border: '1px solid #a5d6a7',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  color: '#2e7d32',
                  fontSize: '0.875rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                ✅ {message}
              </div>
            )}
            {error && (
              <div
                style={{
                  background: '#fdecea',
                  border: '1px solid #f5c6cb',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  color: '#c0392b',
                  fontSize: '0.875rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                ⚠️ {error}
              </div>
            )}

            {/* ───── STEP 1: Enter Email ───── */}
            {step === 1 && (
              <form onSubmit={sendOtp}>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label style={{ fontWeight: 600, color: '#333', display: 'block', marginBottom: '0.5rem' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', opacity: loading ? 0.7 : 1 }}
                  disabled={loading}
                >
                  {loading ? 'Sending OTP...' : 'Send OTP →'}
                </button>
              </form>
            )}

            {/* ───── STEP 2: Verify OTP ───── */}
            {step === 2 && (
              <form onSubmit={verifyOtp}>
                <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1.25rem', textAlign: 'center' }}>
                  Enter the 6-digit OTP sent to <strong style={{ color: '#173D2F' }}>{email}</strong>
                </p>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontWeight: 600, color: '#333', display: 'block', marginBottom: '0.5rem' }}>
                    One-Time Password (OTP)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    required
                    disabled={loading}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      letterSpacing: '0.3rem',
                      fontSize: '1.3rem',
                      textAlign: 'center',
                      fontWeight: 700,
                    }}
                  />
                  <p style={{ fontSize: '0.78rem', color: '#999', marginTop: '0.5rem', textAlign: 'center' }}>
                    OTP is valid for 10 minutes
                  </p>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', marginBottom: '0.75rem', opacity: loading ? 0.7 : 1 }}
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Verify OTP →'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                  onClick={() => { setStep(1); setOtp(''); setError(''); setMessage(''); }}
                >
                  ← Change Email
                </button>
              </form>
            )}

            {/* ───── STEP 3: New Password ───── */}
            {step === 3 && (
              <form onSubmit={resetPassword}>
                {/* New Password */}
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label style={{ fontWeight: 600, color: '#333', display: 'block', marginBottom: '0.5rem' }}>
                    New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      className="form-control"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                      disabled={loading}
                      style={{ width: '100%', boxSizing: 'border-box', paddingRight: '3rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(v => !v)}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        color: '#888',
                        padding: '0',
                        lineHeight: 1,
                      }}
                      tabIndex={-1}
                      title={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      marginTop: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      color: '#666',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={showNewPassword}
                      onChange={e => setShowNewPassword(e.target.checked)}
                      style={{ cursor: 'pointer', accentColor: '#173D2F' }}
                    />
                    Show password
                  </label>
                </div>

                {/* Confirm Password */}
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontWeight: 600, color: '#333', display: 'block', marginBottom: '0.5rem' }}>
                    Confirm Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="form-control"
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                      style={{ width: '100%', boxSizing: 'border-box', paddingRight: '3rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(v => !v)}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        color: '#888',
                        padding: '0',
                        lineHeight: 1,
                      }}
                      tabIndex={-1}
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      marginTop: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      color: '#666',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={showConfirmPassword}
                      onChange={e => setShowConfirmPassword(e.target.checked)}
                      style={{ cursor: 'pointer', accentColor: '#173D2F' }}
                    />
                    Show password
                  </label>
                  {/* Match indicator */}
                  {confirmPassword && (
                    <p
                      style={{
                        marginTop: '0.35rem',
                        fontSize: '0.78rem',
                        color: newPassword === confirmPassword ? '#2e7d32' : '#c0392b',
                      }}
                    >
                      {newPassword === confirmPassword ? '✅ Passwords match' : '❌ Passwords do not match'}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-gold"
                  style={{ width: '100%', opacity: loading ? 0.7 : 1 }}
                  disabled={loading || newPassword !== confirmPassword}
                >
                  {loading ? 'Resetting...' : '🔒 Reset Password'}
                </button>
              </form>
            )}

            {/* ───── STEP 4: Success ───── */}
            {step === 4 && (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
                <h3 style={{ color: '#173D2F', marginBottom: '0.5rem' }}>Password Reset!</h3>
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Your password has been updated successfully. You can now log in with your new password.
                </p>
                <Link href="/login" className="btn btn-primary" style={{ display: 'block', width: '100%', textAlign: 'center' }}>
                  Go to Login →
                </Link>
              </div>
            )}

            {/* Footer Link */}
            {step <= 3 && (
              <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#888' }}>
                Remember your password?{' '}
                <Link href="/login" style={{ color: '#173D2F', fontWeight: 600 }}>
                  Login
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
