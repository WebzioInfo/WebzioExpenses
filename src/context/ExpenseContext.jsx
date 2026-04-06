'use client';

import { useConfig } from './ConfigContext';
import { useTransactions } from './TransactionContext';
import { useStats } from '../hooks/useStats';

// Backward compatibility facade hook to prevent cascading refactoring costs across 10 pages.
export const useApp = () => {
  const config = useConfig();
  const trans = useTransactions();
  const stats = useStats(trans.transactions);

  return {
    // Data
    staff: config.staff,
    people: config.staff,
    projects: config.projects,
    accounts: config.accounts,
    categories: config.categories,
    tasks: config.tasks,
    leads: config.leads,
    clients: config.clients,
    systemUsers: config.systemUsers,
    loading: config.loading || trans.loading,

    // Actions (Mapped to new contexts)
    addEntry: trans.addTransaction,
    addTransaction: trans.addTransaction,
    updateEntry: trans.updateTransaction,
    updateTransaction: trans.updateTransaction,
    deleteEntry: trans.deleteTransaction,
    deleteTransaction: trans.deleteTransaction,

    // CRM Actions
    addLead: config.addLead,
    updateLead: config.updateLead,
    deleteLead: config.deleteLead,
    addClient: config.addClient,
    updateClient: config.updateClient,
    deleteClient: config.deleteClient,

    // Staff Actions
    addStaff: config.addStaff,
    updateStaff: config.updateStaff,
    deleteStaff: config.deleteStaff,
    addPerson: config.addStaff,    // backward compatibility
    updatePerson: config.updateStaff, // backward compatibility
    deletePerson: config.deleteStaff, // backward compatibility

    // Users & Permissions
    addSystemUser: config.addSystemUser,
    updateSystemUser: config.updateSystemUser,
    updateSystemUserPermissions: config.updateSystemUserPermissions,

    // Projects
    addProject: config.addProject,
    updateProject: config.updateProject,
    deleteProject: config.deleteProject,

    // Categories
    addCategory: config.addCategory,
    updateCategory: config.updateCategory,
    deleteCategory: config.deleteCategory,

    // Utils
    stats,
    exportData: trans.exportCSV,
    exportCSV: trans.exportCSV,
    fetchAll: async () => {
      await Promise.all([config.refreshConfig(), trans.refreshTransactions()]);
    },
  };
};

// Aliases
export const useExpenses = useApp;
