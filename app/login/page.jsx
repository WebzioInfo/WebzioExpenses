'use client';

import React, { useState } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { LogIn, Mail, Lock, ArrowRight } from 'lucide-react';
import Button from '@/src/components/ui/Button';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(formData.email, formData.password);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleForgotRequest = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoadingAction(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessage(data.message);
      setForgotStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleForgotReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoadingAction(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, otp, password: newPassword })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessage('Password reset successfully! You can now log in.');
      setTimeout(() => {
        setShowForgot(false);
        setForgotStep(1);
        setError('');
        setMessage('');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingAction(false);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-accounting-bg flex items-center justify-center p-6">
      <div className="clay-card w-full max-w-md p-14 space-y-12 animate-in zoom-in-95 duration-500">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-accounting-text rounded-3xl mx-auto flex items-center justify-center text-accounting-bg -outer relative after:absolute after:inset-0 after:rounded-3xl after:-inner">
            <LogIn size={32} strokeWidth={2.5} />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-accounting-text uppercase tracking-tighter">Webzio <span className="opacity-30">Accounts</span></h1>
            <p className="text-[10px] font-black text-accounting-text/30 uppercase tracking-[0.34em]">Secure Internal Financial Portal</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 text-left">
            <label className="text-[9px] font-black uppercase text-accounting-text/40 tracking-widest pl-2">Email Address</label>
            <div className="relative group">
              <Mail size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-accounting-text/20 group-focus-within:text-accounting-text transition-colors" />
              <input
                type="email"
                required
                className="clay-input w-full pl-14"
                placeholder="email@webzio.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2 text-left">
            <label className="text-[9px] font-black uppercase text-accounting-text/40 tracking-widest pl-2">Password</label>
            <div className="relative group">
              <Lock size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-accounting-text/20 group-focus-within:text-accounting-text transition-colors" />
              <input
                type="password"
                required
                className="clay-input w-full pl-14"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          {error && <p className="text-[10px] font-black uppercase text-red-500 text-center tracking-widest leading-relaxed">{error}</p>}

          <Button type="submit" className="w-full h-16 clay-btn-primary -outer group">
            <span className="text-[11px] font-black uppercase tracking-[0.3em] pl-2">Access Ledger</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Button>

          <Button
            variant="ghost"
            type="button"
            className="w-full text-[9px] font-black uppercase tracking-widest text-accounting-text/30 hover:text-accounting-text transition-colors"
            onClick={() => setShowForgot(true)}
          >
            Forgot Password?
          </Button>
        </form>

        {showForgot && (
          <div className="fixed inset-0 z-50 bg-accounting-bg/80 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="clay-card w-full max-w-sm p-10 space-y-8 animate-in zoom-in-95 duration-200">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-black text-accounting-text uppercase tracking-tighter">Reset Password</h2>
                <p className="text-[8px] font-black text-accounting-text/40 uppercase tracking-widest">
                  {forgotStep === 1 ? 'Enter your email to receive OTP' : 'Enter OTP and new password'}
                </p>
              </div>

              <form onSubmit={forgotStep === 1 ? handleForgotRequest : handleForgotReset} className="space-y-6">
                {forgotStep === 1 ? (
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase text-accounting-text/40 tracking-widest pl-2">Email Address</label>
                    <input
                      type="email"
                      required
                      className="clay-input w-full"
                      placeholder="email@webzio.com"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                    />
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[8px] font-black uppercase text-accounting-text/40 tracking-widest pl-2">6-Digit OTP</label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          className="clay-input w-full text-center tracking-[1em] text-lg font-black"
                          placeholder="000000"
                          value={otp}
                          onChange={e => setOtp(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] font-black uppercase text-accounting-text/40 tracking-widest pl-2">New Password</label>
                        <input
                          type="password"
                          required
                          className="clay-input w-full"
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}

                {error && <p className="text-[8px] font-black uppercase text-red-500 text-center tracking-widest">{error}</p>}
                {message && <p className="text-[8px] font-black uppercase text-emerald-500 text-center tracking-widest">{message}</p>}

                <div className="space-y-3">
                  <Button type="submit" disabled={loadingAction} className="w-full h-12 clay-btn-primary">
                    {loadingAction ? 'Processing...' : (forgotStep === 1 ? 'Send OTP' : 'Reset Password')}
                  </Button>
                  <Button
                    variant="ghost"
                    type="button"
                    className="w-full text-[8px] font-black uppercase tracking-widest text-accounting-text/20"
                    onClick={() => { setShowForgot(false); setForgotStep(1); setError(''); setMessage(''); }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
