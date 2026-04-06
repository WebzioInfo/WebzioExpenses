'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/src/context/ExpenseContext';
import { useAuth } from '@/src/context/AuthContext';
import { cn, formatDate } from '@/src/lib/utils';
import Modal from '@/src/components/ui/Modal';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  Calendar, 
  User, 
  Briefcase,
  ChevronRight,
  Filter,
  Search,
  MoreVertical,
  Trash2
} from 'lucide-react';
import Button from '@/src/components/ui/Button';

const PRIORITY_STYLES = {
  High:   'bg-red-50 text-red-600 border-red-200',
  Medium: 'bg-amber-50 text-amber-600 border-amber-200',
  Low:    'bg-emerald-50 text-emerald-600 border-emerald-200',
};

const STATUS_ICONS = {
  'Completed':   { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  'In Progress': { icon: Clock,        color: 'text-blue-500',    bg: 'bg-blue-50' },
  'Not Started': { icon: AlertCircle, color: 'text-accounting-text/40', bg: 'bg-accounting-bg' },
  'Delayed':     { icon: AlertCircle, color: 'text-red-500',     bg: 'bg-red-50' },
};

import { CardSkeleton } from '@/src/components/ui/Skeleton';

export default function TasksPage() {
  const { tasks, staff, projects, addTask, updateTask, deleteTask, loading } = useApp();
  const { user, isAdmin, hasPermission } = useAuth();
  
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterStaff, setFilterStaff] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [form, setForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    projectId: '',
    status: 'Not Started',
    priority: 'Medium',
    dueDate: ''
  });
  const [saving, setSaving] = useState(false);

  // Stats Logic
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const active = tasks.filter(t => t.isActive);
    return {
      total: active.length,
      completed: active.filter(t => t.status === 'Completed').length,
      inProgress: active.filter(t => t.status === 'In Progress').length,
      delayed: active.filter(t => t.status !== 'Completed' && t.dueDate && t.dueDate < today).length,
      pending: active.filter(t => t.status === 'Not Started').length,
    };
  }, [tasks]);

  // Filter Logic
  const filteredTasks = useMemo(() => {
    let result = [...tasks];
    const today = new Date().toISOString().split('T')[0];
    
    // Filter by User Role (Staff only see their own if not admin)
    if (!isAdmin) {
      const staffRecord = staff.find(s => s.email === user?.email);
      if (staffRecord) {
        result = result.filter(t => t.assignedTo === staffRecord.id);
      } else {
        result = [];
      }
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q));
    }
    if (filterStatus !== 'All') {
      if (filterStatus === 'Delayed') {
        result = result.filter(t => t.status !== 'Completed' && t.dueDate && t.dueDate < today);
      } else {
        result = result.filter(t => t.status === filterStatus);
      }
    }
    if (filterStaff !== 'All') result = result.filter(t => t.assignedTo === filterStaff);
    if (filterPriority !== 'All') result = result.filter(t => t.priority === filterPriority);
    
    return result;
  }, [tasks, search, filterStatus, filterStaff, filterPriority, isAdmin, user, staff]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await addTask({ ...form, assignedBy: user.id });
    setSaving(false);
    setModal(false);
    setForm({ title: '', description: '', assignedTo: '', projectId: '', status: 'Not Started', priority: 'Medium', dueDate: '' });
  };

  const updateStatus = async (task, newStatus) => {
    await updateTask(task.id, { ...task, status: newStatus });
  };

  if (loading) return (
    <div className="space-y-8 py-6">
      <div className="h-10 w-48 bg-accounting-text/5 animate-pulse rounded-xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-white rounded-3xl animate-pulse shadow-clay-inner" />)}
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div>
          <h1 className="text-3xl font-black text-accounting-text tracking-tighter leading-none">Tasks</h1>
          <p className="text-[9px] font-black text-accounting-text/60 uppercase tracking-[0.3em] mt-1">
            {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setModal(true)} icon={Plus}>Add Task</Button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Total" value={stats.total} color="text-accounting-text" />
        <StatCard label="Completed" value={stats.completed} color="text-emerald-600" />
        <StatCard label="In Progress" value={stats.inProgress} color="text-blue-600" />
        <StatCard label="Pending" value={stats.pending} color="text-amber-600" />
        <StatCard label="Delayed" value={stats.delayed} color="text-red-500" />
      </div>

      {/* Filters Hero */}
      <div className="clay-card p-6 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <div className="space-y-1.5 md:col-span-2">
          <label className="field-label">Search Tasks</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-accounting-text/30" size={16} />
            <input 
              className="clay-input w-full pl-11 h-11"
              placeholder="Find tasks..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="field-label">Status</label>
          <select 
            className="clay-input w-full h-11 appearance-none"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Not Started">New</option>
            <option value="In Progress">Doing</option>
            <option value="Completed">Done</option>
            <option value="Delayed">Delayed</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="field-label">Staff</label>
          <select 
            className="clay-input w-full h-11 appearance-none"
            value={filterStaff}
            onChange={e => setFilterStaff(e.target.value)}
          >
            <option value="All">Everyone</option>
            {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="field-label">Priority</label>
          <select 
            className="clay-input w-full h-11 appearance-none"
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
          >
            <option value="All">Any Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4 pb-10">
        {filteredTasks.length === 0 ? (
          <div className="clay-card p-20 flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-accounting-bg flex items-center justify-center shadow-clay-inner mb-2">
              <CheckCircle2 size={24} strokeWidth={1.5} className="text-accounting-text/20" />
            </div>
            <p className="text-base font-black text-accounting-text/40 uppercase tracking-tighter">No tasks yet</p>
            <p className="text-[9px] font-black text-accounting-text/20 uppercase tracking-widest leading-loose max-w-[200px]">
              Everything looks clear. Check back later or add a task to get started.
            </p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              isAdmin={isAdmin} 
              onStatusUpdate={updateStatus}
              onDelete={() => { if(confirm('Delete task?')) deleteTask(task.id); }}
            />
          ))
        )}
      </div>

      {/* Add Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Create Task" subtitle="Assign work to staff">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="field-label">What needs to be done? <span className="text-red-400">*</span></label>
            <input 
              required
              className="clay-input w-full"
              placeholder="Task title..."
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
            />
          </div>
          <div className="space-y-1.5">
            <label className="field-label">Description</label>
            <textarea 
              className="clay-input w-full min-h-[100px] py-3 text-sm"
              placeholder="Optional details..."
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="field-label">Assigned To</label>
              <select 
                className="clay-input w-full"
                value={form.assignedTo}
                onChange={e => setForm({...form, assignedTo: e.target.value})}
              >
                <option value="">Unassigned</option>
                {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="field-label">Project</label>
              <select 
                className="clay-input w-full"
                value={form.projectId}
                onChange={e => setForm({...form, projectId: e.target.value})}
              >
                <option value="">None / Internal</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="field-label">Priority</label>
              <select 
                className="clay-input w-full"
                value={form.priority}
                onChange={e => setForm({...form, priority: e.target.value})}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="field-label">Due Date</label>
              <input 
                type="date"
                className="clay-input w-full"
                value={form.dueDate}
                onChange={e => setForm({...form, dueDate: e.target.value})}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" isLoading={saving} className="flex-1 h-12">Create Task</Button>
            <Button variant="outline" type="button" onClick={() => setModal(false)} className="h-12 px-6 text-[#2D151F]">Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

const StatCard = ({ label, value, color }) => (
  <div className="clay-card p-5 flex flex-col items-center justify-center text-center space-y-1">
    <p className="text-[8px] font-black text-accounting-text/40 uppercase tracking-widest">{label}</p>
    <p className={cn('text-2xl font-black tracking-tighter', color)}>{value}</p>
  </div>
);

const TaskCard = ({ task, isAdmin, onStatusUpdate, onDelete }) => {
  const isDelayed = task.status !== 'Completed' && task.dueDate && task.dueDate < new Date().toISOString().split('T')[0];
  const statusKey = isDelayed ? 'Delayed' : (task.status || 'Not Started');
  const status = STATUS_ICONS[statusKey] || STATUS_ICONS['Not Started'];
  const Icon = status.icon;

  return (
    <div className="clay-card p-6 group transition-all duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-clay-inner', status.bg)}>
            <Icon size={20} strokeWidth={2.5} className={status.color} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-black text-accounting-text text-lg tracking-tight leading-tight">{task.title}</h3>
              <span className={cn('px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-widest border shadow-clay-inner', PRIORITY_STYLES[task.priority])}>
                {task.priority}
              </span>
              {isDelayed && (
                <span className="px-2 py-0.5 rounded-lg text-[7px] font-black bg-red-500 text-white uppercase tracking-widest shadow-clay-outer animate-pulse">
                  Delayed
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[9px] font-black uppercase tracking-widest text-accounting-text/40">
              <span className="flex items-center gap-1.5"><User size={10} strokeWidth={3} /> {task.assignedToName || 'Unassigned'}</span>
              <span className="flex items-center gap-1.5"><Briefcase size={10} strokeWidth={3} /> {task.projectName || 'Internal'}</span>
              {task.dueDate && <span className={cn('flex items-center gap-1.5', isDelayed ? 'text-red-500' : 'text-accounting-text/40')}><Calendar size={10} strokeWidth={3} /> Due {formatDate(task.dueDate)}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center bg-accounting-bg p-1 rounded-xl shadow-clay-inner border border-white/50">
            {['Not Started', 'In Progress', 'Completed'].map(s => (
              <Button
                key={s}
                size="sm"
                variant={task.status === s ? 'primary' : 'ghost'}
                onClick={() => onStatusUpdate(task, s)}
                className={cn('px-3 py-1.5 h-auto text-[7px]', task.status !== s && 'text-accounting-text/30 hover:text-accounting-text')}
              >
                {s === 'Not Started' ? 'New' : s === 'In Progress' ? 'Doing' : 'Done'}
              </Button>
            ))}
          </div>

          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              icon={Trash2}
              iconSize={16}
              onClick={onDelete}
              className="w-10 h-10 p-0 text-red-100 hover:text-red-500 hover:bg-red-50"
            />
          )}
        </div>
      </div>

      {task.description && (
        <div className="mt-5 pt-5 border-t border-accounting-text/5">
          <p className="text-[11px] text-accounting-text/60 leading-relaxed italic">
            {task.description}
          </p>
        </div>
      )}
    </div>
  );
};

