// 'use client';

// import React, { useState } from 'react';
// import { useAuth } from '@/src/context/AuthContext';
// import { Shield, Mail, Lock, User, ArrowRight } from 'lucide-react';
// import Button from '@/src/components/ui/Button';

// export default function SetupPage() {
//   const { setup, loading } = useAuth();
//   const [formData, setFormData] = useState({ name: '', email: '', password: '' });
//   const [error, setError] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     try {
//       await setup(formData);
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   if (loading) return null;

//   return (
//     <div className="min-h-screen bg-accounting-bg flex items-center justify-center p-6">
//       <div className="clay-card w-full max-w-md p-12 space-y-10 animate-in zoom-in-95 duration-500">
//         <div className="text-center space-y-4">
//           <div className="w-20 h-20 bg-accounting-text rounded-3xl mx-auto flex items-center justify-center text-accounting-bg shadow-clay-outer relative after:absolute after:inset-0 after:rounded-3xl after:shadow-clay-inner">
//             <Shield size={32} strokeWidth={2.5} />
//           </div>
//           <div className="space-y-1">
//             <h1 className="text-3xl font-black text-accounting-text uppercase tracking-tighter">System <span className="opacity-30">Setup</span></h1>
//             <p className="text-[10px] font-black text-accounting-text/30 uppercase tracking-[0.3em]">Initialize Webzio Administrative Account.</p>
//           </div>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="space-y-2 text-left">
//             <label className="text-[9px] font-black uppercase text-accounting-text/40 tracking-widest pl-2">Full Name</label>
//             <div className="relative group">
//               <User size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-accounting-text/20 group-focus-within:text-accounting-text transition-colors" />
//               <input
//                 required
//                 className="clay-input w-full pl-14"
//                 placeholder="e.g. Administrator"
//                 value={formData.name}
//                 onChange={e => setFormData({ ...formData, name: e.target.value })}
//               />
//             </div>
//           </div>

//           <div className="space-y-2 text-left">
//             <label className="text-[9px] font-black uppercase text-accounting-text/40 tracking-widest pl-2">Email Address</label>
//             <div className="relative group">
//               <Mail size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-accounting-text/20 group-focus-within:text-accounting-text transition-colors" />
//               <input
//                 type="email"
//                 required
//                 className="clay-input w-full pl-14"
//                 placeholder="admin@webzio.com"
//                 value={formData.email}
//                 onChange={e => setFormData({ ...formData, email: e.target.value })}
//               />
//             </div>
//           </div>

//           <div className="space-y-2 text-left">
//             <label className="text-[9px] font-black uppercase text-accounting-text/40 tracking-widest pl-2">Secure Password</label>
//             <div className="relative group">
//               <Lock size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-accounting-text/20 group-focus-within:text-accounting-text transition-colors" />
//               <input
//                 type="password"
//                 required
//                 className="clay-input w-full pl-14"
//                 placeholder="••••••••"
//                 value={formData.password}
//                 onChange={e => setFormData({ ...formData, password: e.target.value })}
//               />
//             </div>
//           </div>

//           {error && <p className="text-[10px] font-black uppercase text-red-500 text-center tracking-widest">{error}</p>}

//           <Button type="submit" className="w-full h-16 clay-btn-primary shadow-clay-outer group">
//             <span className="text-[11px] font-black uppercase tracking-[0.2em]">Activate System</span>
//             <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
//           </Button>
//         </form>
//       </div>
//     </div>
//   );
// }
