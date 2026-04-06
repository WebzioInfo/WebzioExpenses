import React from 'react';
import { Wallet, CreditCard, Smartphone, Banknote } from 'lucide-react';
import { formatCurrency, cn } from '@/src/lib/utils';
import { Card, CardTitle } from '../ui/Card';

const ACCOUNT_ICONS = {
  'Cash': Wallet,
  'Bank': Banknote,
  'UPI': Smartphone,
  'Petty Cash': CreditCard,
};

export const AccountBalances = ({ accounts = {} }) => {
  const accountEntries = Object.entries(accounts);
  if (accountEntries.length === 0) return null;

  return (
    <div className="mt-10">
      <CardTitle>Account Balances</CardTitle>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {accountEntries.map(([name, balance]) => {
          const Icon = ACCOUNT_ICONS[name] || Wallet;
          return (
            <Card key={name} className="p-5 text-left">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-accounting-bg flex items-center justify-center shadow-clay-inner">
                  <Icon size={16} strokeWidth={2} className="text-accounting-text/40" />
                </div>
                <p className="text-[9px] font-black text-accounting-text/40 uppercase tracking-widest">{name}</p>
              </div>
              <p className={cn('text-2xl font-black tracking-tighter', balance >= 0 ? 'text-accounting-text' : 'text-red-500')}>
                {formatCurrency(balance)}
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
