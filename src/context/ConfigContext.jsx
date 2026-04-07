'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';

const ConfigContext = createContext();

export const ConfigProvider = ({ children }) => {
  const { showToast } = useToast();
  const [staff, setStaff] = useState([]);
  const [systemUsers, setSystemUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [leads, setLeads] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const [staffRes, systemUsersRes, projectsRes, accountsRes, categoriesRes, tasksRes, leadsRes, clientsRes] = await Promise.all([
        fetch('/api/staff').then(r => r.ok ? r.json() : []),
        fetch('/api/users').then(r => r.ok ? r.json() : []),
        fetch('/api/projects').then(r => r.ok ? r.json() : []),
        fetch('/api/accounts').then(r => r.ok ? r.json() : []),
        fetch('/api/categories').then(r => r.ok ? r.json() : []),
        fetch('/api/tasks').then(r => r.ok ? r.json() : []),
        fetch('/api/leads').then(r => r.ok ? r.json() : []),
        fetch('/api/clients').then(r => r.ok ? r.json() : []),
      ]);
      setStaff(Array.isArray(staffRes) ? staffRes : []);
      setSystemUsers(Array.isArray(systemUsersRes) ? systemUsersRes : []);
      setProjects(Array.isArray(projectsRes) ? projectsRes : []);
      setAccounts(Array.isArray(accountsRes) ? accountsRes : []);
      setCategories(Array.isArray(categoriesRes) ? categoriesRes : []);
      setTasks(Array.isArray(tasksRes) ? tasksRes : []);
      setLeads(Array.isArray(leadsRes) ? leadsRes : []);
      setClients(Array.isArray(clientsRes) ? clientsRes : []);
    } catch (err) {
      console.error('Failed to load config:', err);
      showToast('Could not load application settings.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  // CRM: Leads
  const addLead = async (data) => {
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      showToast('Lead captured successfully.', 'success');
      await fetchConfig();
    } catch {
      showToast('Could not add lead.', 'error');
    }
  };

  const updateLead = async (id, data) => {
    try {
      const res = await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });
      if (!res.ok) throw new Error();
      showToast('Lead updated.', 'success');
      await fetchConfig();
    } catch {
      showToast('Could not update lead.', 'error');
    }
  };

  const deleteLead = async (id) => {
    try {
      const res = await fetch(`/api/leads?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showToast('Lead removed.', 'success');
      await fetchConfig();
    } catch {
      showToast('Could not remove lead.', 'error');
    }
  };

  // CRM: Clients
  const addClient = async (data) => {
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      showToast('Client added.', 'success');
      await fetchConfig();
    } catch {
      showToast('Could not add client.', 'error');
    }
  };

  const updateClient = async (id, data) => {
    try {
      const res = await fetch('/api/clients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });
      if (!res.ok) throw new Error();
      showToast('Client updated.', 'success');
      await fetchConfig();
    } catch {
      showToast('Could not update client.', 'error');
    }
  };

  const deleteClient = async (id) => {
    try {
      const res = await fetch(`/api/clients?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showToast('Client removed.', 'success');
      await fetchConfig();
    } catch {
      showToast('Could not remove client.', 'error');
    }
  };

  // Staff (Transaction Contacts) management
  const addStaff = async (data) => {
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      showToast(`${data.name} added to staff.`, 'success');
      await fetchConfig();
    } catch {
      showToast('Could not add staff member.', 'error');
    }
  };

  const updateStaff = async (id, data) => {
    try {
      const res = await fetch('/api/staff', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });
      if (!res.ok) throw new Error();
      showToast('Staff profile updated.', 'success');
      await fetchConfig();
    } catch {
      showToast('Could not update staff profile.', 'error');
    }
  };

  const deleteStaff = async (id) => {
    try {
      const res = await fetch(`/api/staff?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showToast('Staff member removed.', 'success');
      await fetchConfig();
    } catch {
      showToast('Could not remove staff member.', 'error');
    }
  };

  // System Users (Login Accounts) management
  const addSystemUser = async (data) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      showToast(`User account for ${data.name} created.`, 'success');
      await fetchConfig();
    } catch {
      showToast('Could not create user account.', 'error');
    }
  };

  const updateSystemUser = async (id, data) => {
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });
      if (!res.ok) throw new Error();
      showToast('User account updated.', 'success');
      await fetchConfig();
    } catch {
      showToast('Could not update user account.', 'error');
    }
  };

  // Task management
  const addTask = async (data) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      showToast('Task created successfully.', 'success');
      await fetchConfig();
    } catch {
      showToast('Could not create task.', 'error');
    }
  };

  const updateTask = async (id, data) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });
      if (!res.ok) throw new Error();
      showToast('Task updated.', 'success');
      await fetchConfig();
    } catch {
      showToast('Could not update task.', 'error');
    }
  };

  const deleteTask = async (id) => {
    try {
      const res = await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showToast('Task deleted.', 'success');
      await fetchConfig();
    } catch {
      showToast('Could not delete task.', 'error');
    }
  };


  const addProject = async (data) => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      showToast(`Project "${data.name}" created.`, 'success');
      await fetchConfig();
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
      await fetchConfig();
    } catch {
      showToast('Could not update project.', 'error');
    }
  };

  const deleteProject = async (id) => {
    try {
      const res = await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showToast('Project removed.', 'success');
      await fetchConfig();
    } catch {
      showToast('Could not remove project.', 'error');
    }
  };

  const addCategory = async (data) => {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      showToast(`Category "${data.name}" created.`, 'success');
      await fetchConfig();
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
      await fetchConfig();
    } catch {
      showToast('Could not update category.', 'error');
    }
  };

  const deleteCategory = async (id) => {
    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showToast('Category removed.', 'success');
      await fetchConfig();
    } catch {
      showToast('Could not remove category.', 'error');
    }
  };

  // Account management
  const addAccount = async (data) => {
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      showToast(`Account "${data.name}" created.`, 'success');
      await fetchConfig();
    } catch {
      showToast('Could not create account.', 'error');
    }
  };

  const updateAccount = async (id, data) => {
    try {
      const res = await fetch('/api/accounts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });
      if (!res.ok) throw new Error();
      showToast('Account updated.', 'success');
      await fetchConfig();
    } catch {
      showToast('Could not update account.', 'error');
    }
  };

  const deleteAccount = async (id) => {
    try {
      const res = await fetch(`/api/accounts?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showToast('Account disabled.', 'success');
      await fetchConfig();
    } catch {
      showToast('Could not disable account.', 'error');
    }
  };

  const updateSystemUserPermissions = async (userId, data) => {
    try {
      const res = await fetch('/api/settings/permissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...data }),
      });
      if (!res.ok) throw new Error();
      showToast('Permissions updated.', 'success');
      await fetchConfig();
    } catch {
      showToast('Could not update permissions.', 'error');
    }
  };

  return (
    <ConfigContext.Provider value={{
      staff, systemUsers, projects, accounts, categories, tasks, leads, clients, loading,
      addStaff, updateStaff, deleteStaff,
      addSystemUser, updateSystemUser, updateSystemUserPermissions,
      addProject, updateProject, deleteProject,
      addCategory, updateCategory, deleteCategory,
      addAccount, updateAccount, deleteAccount,
      addTask, updateTask, deleteTask,
      addLead, updateLead, deleteLead,
      addClient, updateClient, deleteClient,
      refreshConfig: fetchConfig
    }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useConfig must be used inside ConfigProvider');
  return ctx;
};
