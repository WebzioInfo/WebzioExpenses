'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { showToast } = useToast();
  const [entries, setEntries] = useState([]);
  const [people, setPeople] = useState([]);
  const [projects, setProjects] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [entriesRes, peopleRes, projectsRes, accountsRes, categoriesRes] = await Promise.all([
        fetch('/api/transactions').then(r => r.json()),
        fetch('/api/people').then(r => r.json()),
        fetch('/api/projects').then(r => r.json()),
        fetch('/api/accounts').then(r => r.json()),
        fetch('/api/categories').then(r => r.json()),
      ]);
      setEntries(Array.isArray(entriesRes) ? entriesRes : []);
      setPeople(Array.isArray(peopleRes) ? peopleRes : []);
      setProjects(Array.isArray(projectsRes) ? projectsRes : []);
      setAccounts(Array.isArray(accountsRes) ? accountsRes : []);
      setCategories(Array.isArray(categoriesRes) ? categoriesRes : []);
    } catch (err) {
      console.error('Failed to load data:', err);
      showToast('Could not connect to database.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ─── ENTRY ACTIONS ─────────────────────────────────────────────────

  const addEntry = async (data) => {
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      showToast('Entry saved.', 'success');
      await fetchAll();
    } catch {
      showToast('Could not save entry. Please try again.', 'error');
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
      await fetchAll();
    } catch {
      showToast('Could not update entry.', 'error');
    }
  };

  const deleteEntry = async (id) => {
    try {
      const res = await fetch(`/api/transactions?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showToast('Entry removed.', 'success');
      await fetchAll();
    } catch {
      showToast('Could not remove entry.', 'error');
    }
  };

  // ─── STAFF ACTIONS ─────────────────────────────────────────────────

  const addPerson = async (data) => {
    try {
      const res = await fetch('/api/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      showToast(`${data.name} added to staff.`, 'success');
      await fetchAll();
    } catch {
      showToast('Could not add staff member.', 'error');
    }
  };

  const updatePerson = async (id, data) => {
    try {
      const res = await fetch('/api/people', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });
      if (!res.ok) throw new Error();
      showToast('Staff updated.', 'success');
      await fetchAll();
    } catch {
      showToast('Could not update staff.', 'error');
    }
  };

  const deletePerson = async (id) => {
    try {
      const res = await fetch(`/api/people?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showToast('Staff member removed.', 'success');
      await fetchAll();
    } catch {
      showToast('Could not remove staff member.', 'error');
    }
  };

  // ─── PROJECT ACTIONS ────────────────────────────────────────────────

  const addProject = async (data) => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      showToast(`Project "${data.name}" created.`, 'success');
      await fetchAll();
    } catch {
      showToast('Could not create project.', 'error');
    }
  };

  const updateProject = async (id, data) => {
    try {
      const res = await fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });
      if (!res.ok) throw new Error();
      showToast('Project updated.', 'success');
      await fetchAll();
    } catch {
      showToast('Could not update project.', 'error');
    }
  };

  const deleteProject = async (id) => {
    try {
      const res = await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showToast('Project removed.', 'success');
      await fetchAll();
    } catch {
      showToast('Could not remove project.', 'error');
    }
  };

  // ─── CATEGORY ACTIONS ──────────────────────────────────────────────

  const addCategory = async (data) => {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      showToast(`Category "${data.name}" created.`, 'success');
      await fetchAll();
    } catch {
      showToast('Could not create category.', 'error');
    }
  };

  const updateCategory = async (id, data) => {
    try {
      const res = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });
      if (!res.ok) throw new Error();
      showToast('Category updated.', 'success');
      await fetchAll();
    } catch {
      showToast('Could not update category.', 'error');
    }
  };

  const deleteCategory = async (id) => {
    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showToast('Category removed.', 'success');
      await fetchAll();
    } catch {
      showToast('Could not remove category.', 'error');
    }
  };

  const exportData = () => {
    const data = { entries, people, projects, accounts, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `webzio_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Backup downloaded.', 'success');
  };

  const exportCSV = (list = entries, name = 'transactions') => {
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
    const csvContent = [headers.join(','), ...rows].join('\\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `webzio_${name}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('CSV Exported.', 'success');
  };

  // ─── COMPUTED STATS ────────────────────────────────────────────────

  const computeStats = (txList = entries) => {
    const paidOnly = txList.filter(t => t.status === 'Paid');
    const toNum = (arr) => arr.reduce((s, t) => s + parseFloat(t.amount || 0), 0);

    const moneyIn = toNum(paidOnly.filter(t => t.type === 'Money In'));
    const moneyOut = toNum(paidOnly.filter(t => t.type === 'Money Out'));
    const addedMoney = toNum(paidOnly.filter(t => t.type === 'Added Money'));
    const salary = toNum(paidOnly.filter(t => t.type === 'Salary'));
    
    // Pending amounts (Money In vs Money Out)
    const pendingList = txList.filter(t => t.status === 'Pending');
    const pendingIn = toNum(pendingList.filter(t => t.type === 'Money In' || t.type === 'Added Money'));
    const pendingOut = toNum(pendingList.filter(t => t.type === 'Money Out' || t.type === 'Salary'));
    
    const balance = moneyIn + addedMoney - moneyOut - salary;

    return { moneyIn, moneyOut, addedMoney, salary, pendingIn, pendingOut, pending: pendingIn - pendingOut, balance };
  };

  // ─── CONTEXT VALUE ─────────────────────────────────────────────────

  return (
    <AppContext.Provider value={{
      // Data
      entries,
      transactions: entries, // backward compat
      people,
      projects,
      accounts,
      categories,
      loading,
      // Entry actions
      addEntry,
      addTransaction: addEntry, // backward compat
      updateEntry,
      updateTransaction: updateEntry,
      deleteEntry,
      deleteTransaction: deleteEntry,
      // Staff actions
      addPerson,
      updatePerson,
      deletePerson,
      // Project actions
      addProject,
      updateProject,
      deleteProject,
      // Category actions
      addCategory,
      updateCategory,
      deleteCategory,
      // Utils
      exportData,
      exportCSV,
      computeStats,
      fetchAll,
    }}>
      {children}
    </AppContext.Provider>
  );
};

// Exports
export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};

export const useExpenses = useApp;
export const ExpenseProvider = AppProvider;
