'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { ShieldCheck, User, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import Button from '@/src/components/ui/Button';

export default function SetupPage() {
  const { setup, needsSetup, loading } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      await setup({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-accounting-bg flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent">
      <div className="clay-card w-full max-w-xl p-12 space-y-10 animate-in zoom-in-95 duration-500">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-accounting-bg rounded-3xl mx-auto flex items-center justify-center text-accounting-bg shadow-clay-outer relative">
            <ShieldCheck size={32} strokeWidth={2.5} />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-accounting-bg uppercase tracking-tighter">System Setup</h1>
            <p className="text-[10px] font-black text-accounting-bg/30 uppercase tracking-[0.3em]">Create Initial Administrator Account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 text-left">
              <label className="text-[9px] font-black uppercase text-accounting-bg/40 tracking-widest pl-2">Full Name</label>
              <div className="relative group">
                <User size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-accounting-bg/20 group-focus-within:text-accounting-bg transition-colors" />
                <input
                  required
                  className="clay-input w-full pl-14"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2 text-left">
              <label className="text-[9px] font-black uppercase text-accounting-bg/40 tracking-widest pl-2">Email Address</label>
              <div className="relative group">
                <Mail size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-accounting-bg/20 group-focus-within:text-accounting-bg transition-colors" />
                <input
                  type="email"
                  required
                  className="clay-input w-full pl-14"
                  placeholder="admin@webzio.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2 text-left">
              <label className="text-[9px] font-black uppercase text-accounting-bg/40 tracking-widest pl-2">Password</label>
              <div className="relative group">
                <Lock size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-accounting-bg/20 group-focus-within:text-accounting-bg transition-colors" />
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  className="clay-input w-full pl-14"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2 text-left">
              <label className="text-[9px] font-black uppercase text-accounting-bg/40 tracking-widest pl-2">Confirm Password</label>
              <div className="relative group">
                <Lock size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-accounting-bg/20 group-focus-within:text-accounting-bg transition-colors" />
                <input
                  type="password"
                  required
                  className="clay-input w-full pl-14"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
               <AlertCircle size={14} className="text-red-500" />
               <p className="text-[10px] font-black uppercase text-red-500 tracking-widest leading-relaxed">{error}</p>
            </div>
          )}

          <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl space-y-2">
            <p className="text-[9px] font-black text-amber-800 uppercase tracking-widest opacity-60">Security Note</p>
            <p className="text-[10px] font-black text-amber-900 leading-relaxed uppercase">
              As the first user, you will be granted full administrative privileges. 
              The system will use secure salt-based hashing for your password.
            </p>
          </div>

          <Button type="submit" disabled={submitting} className="w-full h-16 clay-btn-primary shadow-clay-outer group">
            <span className="text-[11px] font-black uppercase tracking-[0.3em] pl-2">{submitting ? 'Initializing...' : 'Initialize Ledger'}</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Button>
        </form>
      </div>
    </div>
  );
}
