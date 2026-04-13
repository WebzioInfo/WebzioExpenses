import React from 'react';
import { Wallet, CreditCard, Smartphone, Landmark, Building2 } from 'lucide-react';
import { formatCurrency, cn } from '@/src/lib/utils';
import Card from '../ui/Card';

const ACCOUNT_ICONS = {
  'Cash': Wallet,
  'Bank': Building2,
  'UPI': Smartphone,
  'Petty Cash': Landmark,
};

export const AccountBalances = ({ accounts = {} }) => {
  const accountEntries = Object.entries(accounts);
  if (accountEntries.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <Landmark size={14} className="text-secondary-text" strokeWidth={3} />
        <h3 className="text-[10px] font-black text-secondary-text uppercase tracking-[0.2em] leading-none">Account Access Points</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {accountEntries.map(([name, balance]) => {
          const Icon = ACCOUNT_ICONS[name] || Wallet;
          const isNeg = parseFloat(balance) < 0;

          return (
            <Card key={name} className="p-6 group border border-transparent hover:border-accounting-text/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-accounting-bg/40 flex items-center justify-center -inner border border-white/50 group-hover:scale-110 transition-transform">
                  <Icon size={18} strokeWidth={3} className="text-accounting-text" />
                </div>
                <p className="text-[9px] font-black text-secondary-text uppercase tracking-widest">{name}</p>
              </div>
              <p className={cn(
                'text-2xl font-black tracking-tighter leading-none',
                isNeg ? 'text-red-600' : 'text-accounting-text'
              )}>
                {formatCurrency(balance)}
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
