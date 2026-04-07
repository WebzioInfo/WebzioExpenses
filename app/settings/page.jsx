'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { User, Camera, Lock, CheckCircle, AlertCircle, Loader2, ArrowLeft, LogOut, ShieldCheck, Mail, Key } from 'lucide-react';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import Input from '@/src/components/ui/Input';
import { useRouter } from 'next/navigation';
import { cn } from '@/src/lib/utils';
import { CldUploadWidget } from 'next-cloudinary';

export default function SettingsPage() {
  const { user, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState({ name: '', profile_pic: '' });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '', otp: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user/profile');
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setProfile({ name: data.name, profile_pic: data.profile_pic || '' });
      } catch (err) {
        setMessage({ type: 'error', text: 'Identity sync failed' });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profile.name, profile_pic: profile.profile_pic })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      await refreshUser();
      setMessage({ type: 'success', text: 'Identity updated successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleSendOtp = async () => {
    setSendingOtp(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'OTP dispatch failed');
      setOtpSent(true);
      setMessage({ type: 'success', text: 'Security OTP dispatched' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setMessage({ type: 'error', text: 'Security mismatch: Passwords do not align' });
      return;
    }
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwords.new, otp: passwords.otp })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessage({ type: 'success', text: 'Vault updated: New password active' });
      setPasswords({ current: '', new: '', confirm: '', otp: '' });
      setOtpSent(false);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32">
       <div className="w-10 h-10 border-4 border-accounting-text/10 border-t-accounting-text rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-10">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-6">
          <Button variant="secondary" onClick={() => router.back()} className="w-12 h-12 p-0 rounded-2xl group">
             <ArrowLeft size={18} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" />
          </Button>
          <div>
            <h1 className="text-3xl font-black text-accounting-text tracking-tighter leading-none">Security & Self</h1>
            <p className="text-[10px] font-black text-secondary-text uppercase tracking-widest mt-2">Manage your systemic identity</p>
          </div>
        </div>
        <Button variant="secondary" onClick={logout} icon={LogOut} className="text-red-500 hover:text-red-600">Terminate Session</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="flex flex-col items-center text-center p-10 space-y-6 border border-accounting-text/5 shadow-xl">
             <div className="relative">
               <div className="w-32 h-32 rounded-[2.5rem] bg-accounting-bg flex items-center justify-center -inner overflow-hidden border-2 border-white shadow-lg">
                  {profile.profile_pic ? (
                    <img src={profile.profile_pic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={48} className="text-accounting-text/10" strokeWidth={3} />
                  )}
               </div>

               <CldUploadWidget
                  uploadPreset="ml_default"
                  onSuccess={(result) => {
                    setProfile(prev => ({ ...prev, profile_pic: result.info.secure_url }));
                    setTimeout(() => handleUpdateProfile(), 500);
                  }}
                >
                  {({ open }) => (
                    <button
                      onClick={() => open()}
                      className="absolute -bottom-2 -right-2 w-11 h-11 bg-accounting-text text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all -outer"
                    >
                      <Camera size={18} strokeWidth={3} />
                    </button>
                  )}
                </CldUploadWidget>
             </div>

             <div>
                <h2 className="text-lg font-black text-accounting-text uppercase tracking-tighter leading-none">{profile.name}</h2>
                <div className="flex items-center justify-center gap-2 mt-3">
                   <span className="px-2.5 py-0.5 rounded-lg bg-accounting-bg text-secondary-text text-[8px] font-black uppercase tracking-widest border border-white -inner">
                      {user?.role}
                   </span>
                </div>
                <p className="text-[9px] font-bold text-secondary-text/40 uppercase tracking-widest mt-4 italic">{user?.email}</p>
             </div>
          </Card>

          {message.text && (
            <div className={cn(
              "p-5 rounded-3xl flex items-center gap-4 animate-in slide-in-from-top-4 duration-300",
              message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
            )}>
              {message.type === 'success' ? <ShieldCheck size={20} strokeWidth={3} /> : <AlertCircle size={20} strokeWidth={3} />}
              <p className="text-[10px] font-black uppercase tracking-widest leading-tight">{message.text}</p>
            </div>
          )}
        </div>

        {/* Configuration Forms */}
        <div className="lg:col-span-8 space-y-8">
           <Card className="p-10 space-y-10 border border-accounting-text/5">
              <div className="flex items-center gap-3">
                 <User size={18} className="text-accounting-text" strokeWidth={3} />
                 <h3 className="text-[10px] font-black text-secondary-text uppercase tracking-widest leading-none">Identity Control</h3>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                 <Input 
                   label="Preferred Display Name" 
                   required 
                   icon={User}
                   value={profile.name} 
                   onChange={e => setProfile({ ...profile, name: e.target.value })} 
                 />

                 <div className="flex justify-start">
                    <Button type="submit" isLoading={saving} className="px-10">Commit Profile Updates</Button>
                 </div>
              </form>
           </Card>

           <Card className="p-10 space-y-10 border border-accounting-text/5">
              <div className="flex items-center gap-3">
                 <Lock size={18} className="text-accounting-text" strokeWidth={3} />
                 <h3 className="text-[10px] font-black text-secondary-text uppercase tracking-widest leading-none">Access Security</h3>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input 
                       label="New Security Credentials" 
                       type="password" 
                       required 
                       icon={Key}
                       placeholder="••••••••" 
                       value={passwords.new} 
                       onChange={e => setPasswords({ ...passwords, new: e.target.value })} 
                    />
                    <Input 
                       label="Confirm Alignment" 
                       type="password" 
                       required 
                       icon={ShieldCheck}
                       placeholder="••••••••" 
                       value={passwords.confirm} 
                       onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} 
                    />
                 </div>

                 {otpSent ? (
                   <div className="space-y-4 animate-in slide-in-from-top-2">
                      <Input 
                        label="Enter 6-Digit OTP" 
                        required 
                        maxLength={6} 
                        className="text-center text-xl tracking-[0.5em] font-black"
                        placeholder="000000" 
                        value={passwords.otp} 
                        onChange={e => setPasswords({ ...passwords, otp: e.target.value })} 
                      />
                      <p className="text-[9px] font-bold text-secondary-text/50 uppercase tracking-widest text-center italic">A security code has been dispatched to your registered vault (email).</p>
                      <Button type="submit" isLoading={saving} fullWidth className="h-14">Authorize Password Reset</Button>
                   </div>
                 ) : (
                   <div className="flex justify-start">
                      <Button variant="secondary" onClick={handleSendOtp} isLoading={sendingOtp} icon={Mail} className="px-10">
                        Dispatch Identity OTP
                      </Button>
                   </div>
                 )}
              </form>
           </Card>
        </div>
      </div>
    </div>
  );
}
