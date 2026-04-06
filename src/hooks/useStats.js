import { useMemo } from 'react';
import { ENTRY_TYPES, ENTRY_STATUS } from '@/src/lib/constants';
import { toNumber } from '@/src/lib/utils';

export const calculateStats = (entries = []) => {
  if (!entries || entries.length === 0) {
    return {
      moneyIn: 0,
      moneyOut: 0,
      addedMoney: 0,
      salary: 0,
      pendingIn: 0,
      pendingOut: 0,
      pending: 0,
      balance: 0,
      accountBalances: {},
    };
  }

  const paidOnly = entries.filter(t => t.status === ENTRY_STATUS.PAID);
  
  const sum = (arr) => arr.reduce((s, t) => s + toNumber(t.amount), 0);

  const moneyIn = sum(paidOnly.filter(t => t.type === ENTRY_TYPES.MONEY_IN));
  const moneyOut = sum(paidOnly.filter(t => t.type === ENTRY_TYPES.MONEY_OUT));
  const addedMoney = sum(paidOnly.filter(t => t.type === ENTRY_TYPES.ADDED_MONEY));
  const salary = sum(paidOnly.filter(t => t.type === ENTRY_TYPES.SALARY));
  
  // Pending amounts
  const pendingList = entries.filter(t => t.status === ENTRY_STATUS.PENDING);
  const pendingIn = sum(pendingList.filter(t => t.type === ENTRY_TYPES.MONEY_IN || t.type === ENTRY_TYPES.ADDED_MONEY));
  const pendingOut = sum(pendingList.filter(t => t.type === ENTRY_TYPES.MONEY_OUT || t.type === ENTRY_TYPES.SALARY));
  
  // Balance is (Inflow) - (Outflow). Transfers are neutral for total balance.
  const balance = (moneyIn + addedMoney) - (moneyOut + salary);

  // Account balances (PAID ONLY)
  const accountBalances = {};
  paidOnly.forEach(t => {
    const amt = toNumber(t.amount);
    
    if (t.type === ENTRY_TYPES.TRANSFER) {
      const fromAcc = t.account || 'Cash';
      const toAcc = t.notes?.startsWith('To: ') ? t.notes.substring(4) : null;
      
      accountBalances[fromAcc] = (accountBalances[fromAcc] || 0) - amt;
      if (toAcc) accountBalances[toAcc] = (accountBalances[toAcc] || 0) + amt;
    } else {
      const acc = t.account || 'Cash';
      if (t.type === ENTRY_TYPES.MONEY_IN || t.type === ENTRY_TYPES.ADDED_MONEY) {
        accountBalances[acc] = (accountBalances[acc] || 0) + amt;
      } else if (t.type === ENTRY_TYPES.MONEY_OUT || t.type === ENTRY_TYPES.SALARY) {
        accountBalances[acc] = (accountBalances[acc] || 0) - amt;
      }
    }
  });

  return { 
    moneyIn, 
    moneyOut, 
    addedMoney, 
    salary, 
    pendingIn, 
    pendingOut, 
    pending: pendingIn - pendingOut, 
    balance,
    accountBalances
  };
};

export const useStats = (entries = []) => {
  return useMemo(() => calculateStats(entries), [entries]);
};
