'use client';

import { useConfig } from './ConfigContext';
import { useEntries } from './TransactionContext';
import { useStats } from '../hooks/useStats';
import { useAuth } from './AuthContext';

// The Main Application Data Context (Facade Pattern)
export const useApp = () => {
  const config = useConfig();
  const entryManager = useEntries();
  const { user, viewMode } = useAuth();
  
  const isPersonalView = viewMode === 'personal';
  
  // High-Performance Data Filtering
  const filteredEntries = isPersonalView 
    ? entryManager.entries.filter(e => e.personName === user?.name || e.personId === user?.staffId)
    : entryManager.entries;

  const filteredTasks = isPersonalView
    ? config.tasks.filter(t => t.assignedTo === user?.staffId)
    : config.tasks;

  const filteredLeads = isPersonalView
    ? config.leads.filter(l => l.assignedTo === user?.name)
    : config.leads;

  const stats = useStats(filteredEntries);

  return {
    // Data (Filtered)
    entries: filteredEntries,
    tasks: filteredTasks,
    leads: filteredLeads,
    staff: config.staff,
    projects: config.projects,
    accounts: config.accounts,
    categories: config.categories,
    clients: config.clients,
    loading: config.loading || entryManager.loading,

    // Entry Actions
    addEntry: entryManager.addEntry,
    updateEntry: entryManager.updateEntry,
    deleteEntry: entryManager.deleteEntry,

    // Lead & Client Actions
    addLead: config.addLead,
    updateLead: config.updateLead,
    deleteLead: config.deleteLead,
    addClient: config.addClient,
    updateClient: config.updateClient,
    deleteClient: config.deleteClient,

    // Team Actions
    addStaff: config.addStaff,
    updateStaff: config.updateStaff,
    deleteStaff: config.deleteStaff,

    // Project & Category Management
    addProject: config.addProject,
    updateProject: config.updateProject,
    deleteProject: config.deleteProject,
    addCategory: config.addCategory,
    updateCategory: config.updateCategory,
    deleteCategory: config.deleteCategory,

    // Task Management
    addTask: config.addTask,
    updateTask: config.updateTask,
    deleteTask: config.deleteTask,

    // System Utilities
    stats,
    exportCSV: entryManager.exportCSV,
    fetchAll: async () => {
      await Promise.all([config.refreshConfig(), entryManager.refreshEntries()]);
    },
  };
};

export const useExpenses = useApp;
