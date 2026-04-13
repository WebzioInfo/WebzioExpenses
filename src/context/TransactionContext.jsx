'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';

const EntryContext = createContext();

export const EntryProvider = ({ children }) => {
  const { showToast } = useToast();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/transactions');
      const data = await res.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load entries:', err);
      showToast('Could not load financial entries.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const addEntry = async (data) => {
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      showToast('Entry saved.', 'success');
      await fetchEntries();
    } catch {
      showToast('Could not save entry.', 'error');
    }
  };

  const updateEntry = async (id, data) => {
    try {
      const res = await fetch('/api/transactions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });
      if (!res.ok) throw new Error();
      showToast('Entry updated.', 'success');
      await fetchEntries();
    } catch {
      showToast('Could not update entry.', 'error');
    }
  };

  const deleteEntry = async (id) => {
    try {
      const res = await fetch(`/api/transactions?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showToast('Entry removed.', 'success');
      await fetchEntries();
    } catch {
      showToast('Could not remove entry.', 'error');
    }
  };

  const exportCSV = (list = entries, name = 'entries') => {
    if (!list || list.length === 0) {
      showToast('No data to export.', 'error');
      return;
    }
    const headers = ['Date', 'Title', 'Type', 'Account', 'Amount', 'Category', 'Staff', 'Project', 'Status'];
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
    <EntryContext.Provider value={{
      entries, 
      transactions: entries, // Alias for backward compatibility
      loading,
      addEntry, 
      updateEntry, 
      deleteEntry,
      refreshEntries: fetchEntries,
      exportCSV
    }}>
      {children}
    </EntryContext.Provider>
  );
};

export const useEntries = () => {
  const ctx = useContext(EntryContext);
  if (!ctx) throw new Error('useEntries must be used inside EntryProvider');
  return ctx;
};

// Aliases for backward compatibility during transition
export const useTransactions = useEntries;
export const TransactionProvider = EntryProvider;
