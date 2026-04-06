'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';

const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
  const { showToast } = useToast();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/transactions');
      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load transactions:', err);
      showToast('Could not load entries data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = async (data) => {
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      showToast('Entry saved.', 'success');
      await fetchTransactions();
    } catch {
      showToast('Could not save entry. Please try again.', 'error');
    }
  };

  const updateTransaction = async (id, data) => {
    try {
      const res = await fetch('/api/transactions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });
      if (!res.ok) throw new Error();
      showToast('Entry updated.', 'success');
      await fetchTransactions();
    } catch {
      showToast('Could not update entry.', 'error');
    }
  };

  const deleteTransaction = async (id) => {
    try {
      const res = await fetch(`/api/transactions?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showToast('Entry removed.', 'success');
      await fetchTransactions();
    } catch {
      showToast('Could not remove entry.', 'error');
    }
  };

  const exportCSV = (list = transactions, name = 'transactions') => {
    if (!list || list.length === 0) {
      showToast('No data to export.', 'error');
      return;
    }
    const headers = ['Date', 'Title', 'Type', 'Account', 'Amount', 'Category', 'Person', 'Project', 'Status'];
    const rows = list.map(e => [
      e.date,
      `"${(e.title || '').replace(/"/g, '""')}"`,
      e.type,
      e.account,
      e.amount,
      `"${(e.category || '').replace(/"/g, '""')}"`,
      `"${(e.personName || '').replace(/"/g, '""')}"`,
      `"${(e.projectName || '').replace(/"/g, '""')}"`,
      e.status
    ].join(','));
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `webzio_${name}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('CSV Exported.', 'success');
  };

  return (
    <TransactionContext.Provider value={{
      transactions, loading,
      addTransaction, updateTransaction, deleteTransaction,
      refreshTransactions: fetchTransactions,
      exportCSV
    }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const ctx = useContext(TransactionContext);
  if (!ctx) throw new Error('useTransactions must be used inside TransactionProvider');
  return ctx;
};
