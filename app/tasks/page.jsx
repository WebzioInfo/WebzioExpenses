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
  Search,
  Trash2,
  Edit2,
  Target,
  Zap,
  Users,
  LayoutGrid,
  Info,
  Link2,
  FileCheck2,
  AlertOctagon,
  MessageSquareQuote
} from 'lucide-react';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import Input from '@/src/components/ui/Input';
import Select from '@/src/components/ui/Select';

const PRIORITY_STYLES = {
  High: 'bg-red-50 text-red-700 border-red-100 shadow-sm',
  Medium: 'bg-amber-50 text-amber-700 border-amber-100 shadow-sm',
  Low: 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm',
};

const STATUS_ICONS = {
  'Approved': { icon: FileCheck2, color: 'text-emerald-500', bg: 'bg-emerald-50/50' },
  'Needs Revision': { icon: AlertOctagon, color: 'text-rose-500', bg: 'bg-rose-50/50' },
  'Completed': { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  'In Progress': { icon: Zap, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  'Not Started': { icon: Clock, color: 'text-secondary-text/30', bg: 'bg-accounting-bg/40' },
  'Delayed': { icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
};

export default function TasksPage() {
  const { tasks = [], staff = [], projects = [], addTask, updateTask, deleteTask, loading } = useApp();
  const { user, isManagement, isFounder } = useAuth();

  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
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
    dueDate: '',
    fileUrl: '',
    reviewStatus: 'Pending',
    reviewNotes: ''
  });
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setEditId(null);
    setForm({ title: '', description: '', assignedTo: '', projectId: '', status: 'Not Started', priority: 'Medium', dueDate: '' });
    setModal(true);
  };

  const openEdit = (task) => {
    setEditId(task.id);
    setForm({
      title: task.title || '',
      description: task.description || '',
      assignedTo: task.assignedTo || '',
      projectId: task.projectId || '',
      status: task.status || 'Not Started',
      priority: task.priority || 'Medium',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      fileUrl: task.fileUrl || '',
      reviewStatus: task.reviewStatus || 'Pending',
      reviewNotes: task.reviewNotes || ''
    });
    setModal(true);
  };

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

    const [founderView, setFounderView] = useState('Company'); // 'Company' or 'Personal'

    const filteredTasks = useMemo(() => {
    let result = [...tasks];
    const today = new Date().toISOString().split('T')[0];

    // RBAC: Staff only see their own tasks
    if (!isManagement) {
      const staffRecord = staff.find(s => s.email === user?.email);
      if (staffRecord) {
        result = result.filter(t => t.assignedTo === staffRecord.id);
      } else {
        result = [];
      }
    }

    // Founder Personal Portal
    if (isFounder && founderView === 'Personal') {
       const staffRecord = staff.find(s => s.email === user?.email);
       if (staffRecord) {
         result = result.filter(t => t.assignedTo === staffRecord.id);
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
    if (filterStaff !== 'All') result = result.filter(t => t.assignedTo === parseInt(filterStaff));
    if (filterPriority !== 'All') result = result.filter(t => t.priority === filterPriority);

    return result;
  }, [tasks, search, filterStatus, filterStaff, filterPriority, user, staff, isFounder, founderView, isManagement]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const assignedTo = isManagement ? form.assignedTo : (staff.find(s => s.email === user.email)?.id || '');
    const taskData = { ...form, assignedTo, assignedBy: user.id };

    if (editId) await updateTask(editId, taskData);
    else await addTask(taskData);

    setSaving(false);
    setModal(false);
  };

  const updateStatus = async (task, newStatus) => {
    await updateTask(task.id, { ...task, status: newStatus });
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-12 h-12 border-4 border-accounting-text/10 border-t-accounting-text rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div>
          <h1 className="text-4xl font-black text-accounting-text tracking-tighter leading-none">Objective Matrix</h1>
          <p className="text-[10px] font-black text-secondary-text uppercase tracking-widest mt-2">{filteredTasks.length} assigned strategic goals</p>
        </div>
        <Button onClick={openAdd} icon={Plus}>Provision Objective</Button>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard label="Total Goals" value={stats.total} variant="accounting-text" />
        <StatCard label="Directives Finalized" value={stats.completed} variant="emerald-600" />
        <StatCard label="Active Implementation" value={stats.inProgress} variant="blue-600" />
        <StatCard label="Backlog / New" value={stats.pending} variant="amber-600" />
        <StatCard label="Critical Overdue" value={stats.delayed} variant="red-500" />
      </div>

      {/* Filter Workspace */}
      <Card className="p-8 border border-accounting-text/5 shadow-2xl space-y-8">
        <div className="flex flex-col xl:flex-row gap-6">
          <div className="flex-1">
            <Input
              icon={Search}
              label={isFounder ? "Operational Search" : "Goal Search"}
              placeholder="Search objective matrix..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex p-1 bg-accounting-bg/40 rounded-2xl -inner border border-white/50">
            {isFounder ? (
                ['Company', 'Personal'].map(m => (
                  <button
                    key={m}
                    onClick={() => setFounderView(m)}
                    className={cn(
                      "px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                      founderView === m ? "bg-accounting-text text-white shadow-lg" : "text-secondary-text/60 hover:text-accounting-text"
                    )}
                  >
                    {m} Portal
                  </button>
                ))
            ) : (
              <>
                <button 
                  onClick={() => setViewMode('daily')}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                    viewMode === 'daily' ? "bg-white text-accounting-text shadow-sm" : "text-secondary-text/60 hover:text-accounting-text"
                  )}
                >
                  <ListFilter size={14} strokeWidth={3} /> Daily
                </button>
                <button 
                  onClick={() => setViewMode('matrix')}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                    viewMode === 'matrix' ? "bg-white text-accounting-text shadow-sm" : "text-secondary-text/60 hover:text-accounting-text"
                  )}
                >
                  <LayoutGrid size={14} strokeWidth={3} /> Matrix
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-accounting-bg">
          <Select label="Deployment Status" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="All">All Operational Statuses</option>
            <option value="Not Started">New / Backlog</option>
            <option value="In Progress">Active Progress</option>
            <option value="Completed">Finalized</option>
            <option value="Delayed">Critical / Overdue</option>
          </Select>
          <Select label="Personnel Focus" value={filterStaff} onChange={e => setFilterStaff(e.target.value)}>
            <option value="All">System Wide Personnel</option>
            {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
          <Select label="Priority Protocol" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
            <option value="All">Normal Execution Priority</option>
            <option value="High">Urgent / High Protocol</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority / Background</option>
          </Select>
        </div>
      </Card>

      {/* Directive Registry */}
      <div className="space-y-6">
        {filteredTasks.length === 0 ? (
          <Card className="py-32 flex flex-col items-center justify-center text-center space-y-5 border-2 border-dashed border-accounting-text/5 bg-transparent opacity-40">
            <div className="w-20 h-20 rounded-[2.5rem] bg-accounting-bg/40 flex items-center justify-center -inner border border-white">
              <CheckCircle2 size={36} strokeWidth={1} />
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-black uppercase tracking-widest leading-none italic">Task Matrix Clear</p>
              <p className="text-[9px] font-bold text-secondary-text/50 uppercase tracking-widest max-w-[240px]">All assigned operational objectives have been finalized or the registry is null.</p>
            </div>
          </Card>
        ) : (
          filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              user={user}
              staff={staff}
              isFounder={isFounder}
              isManagement={isManagement}
              onStatusUpdate={updateStatus}
              onEdit={() => openEdit(task)}
              onDelete={() => { if (confirm('Abort Strategic Objective?')) deleteTask(task.id); }}
            />
          ))
        )}
      </div>

      {/* Add / Edit Interaction */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editId ? "Modify Tactical Objective" : "Provision Directive"}>
        <form onSubmit={handleSubmit} className="space-y-8">
          <Input
            label="Objective Identified Purpose"
            required
            placeholder="e.g. Audit Q3 Systemic Overheads"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
          />

          <div className="space-y-2">
            <label className="text-[10px] font-black text-secondary-text uppercase tracking-widest px-1">Functional Description & Context</label>
            <textarea
              className="clay-input w-full min-h-[120px] resize-none text-[13px] leading-relaxed placeholder:text-secondary-text/20"
              placeholder="Record strategic requirements or internal references..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Select label="Personnel Assignment" disabled={!isManagement} value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })}>
              {isManagement ? (
                <>
                  <option value="">Pool / Unassigned</option>
                  {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </>
              ) : (
                <option value={staff.find(s => s.email === user.email)?.id}>{user.name} (Identity Self)</option>
              )}
            </Select>
            <Select label="Initiative / Project Allocation" value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })}>
              <option value="">General Systems / Internal</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Select label="Execution Priority Matrix" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Focus</option>
              <option value="High">Urgent Protocol</option>
            </Select>
            <Input label="Hard Execution Deadline" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
          </div>

          <Input 
            icon={Link2} 
            label="Tactical Asset Link (Code/Design/Video)" 
            placeholder="https://github.com/... or https://figma.com/..." 
            value={form.fileUrl} 
            onChange={e => setForm({ ...form, fileUrl: e.target.value })} 
          />

          {isManagement && (
            <div className="pt-8 border-t border-accounting-bg space-y-4">
               <label className="text-[10px] font-black text-secondary-text uppercase tracking-widest px-1">Tactical Review Protocol</label>
               <Select value={form.reviewStatus} onChange={e => setForm({ ...form, reviewStatus: e.target.value })}>
                  <option value="Pending">Awaiting Submission</option>
                  <option value="Under Review">Active Manual Audit</option>
                  <option value="Needs Revision">Revision Required</option>
                  <option value="Approved">Mission Success / Approved</option>
               </Select>
               <textarea
                className="clay-input w-full min-h-[80px] resize-none text-[12px] leading-relaxed placeholder:text-secondary-text/20"
                placeholder="Add critical feedback or revision directives..."
                value={form.reviewNotes}
                onChange={e => setForm({ ...form, reviewNotes: e.target.value })}
              />
            </div>
          )}

          <div className="flex gap-4 pt-6 border-t border-accounting-bg">
            <Button type="submit" isLoading={saving} fullWidth className="h-14">
              {editId ? 'Authorize commit' : 'Initialize Objective'}
            </Button>
            <Button variant="secondary" onClick={() => setModal(false)} className="h-14 px-10">Abort</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

const StatCard = ({ label, value, variant }) => {
  return (
    <Card className="text-center p-6 space-y-2 group hover:border-accounting-text/10 border border-transparent shadow-xl transition-all duration-300">
      <p className="text-[9px] font-black text-secondary-text/40 uppercase tracking-widest leading-none">{label}</p>
      <p className={cn('text-3xl font-black tracking-tighter leading-none', `text-${variant}`)}>{value}</p>
    </Card>
  );
};

const TaskCard = ({ task, user, staff, isFounder, isManagement, onStatusUpdate, onEdit, onDelete }) => {
  const isDelayed = task.status !== 'Completed' && task.dueDate && task.dueDate < new Date().toISOString().split('T')[0];
  const statusKey = isDelayed ? 'Delayed' : (task.status || 'Not Started');
  const status = STATUS_ICONS[statusKey] || STATUS_ICONS['Not Started'];
  const Icon = status.icon;

  return (
    <Card className="p-7 group border border-transparent hover:border-accounting-text/5 shadow-none hover:shadow-2xl transition-all duration-300">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex items-start gap-6 flex-1 min-w-0">
          <div className={cn('w-14 h-14 rounded-3xl flex items-center justify-center shrink-0 -inner border border-white shadow-lg shadow-accounting-text/5', status.bg)}>
            <Icon size={24} strokeWidth={3} className={status.color} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="font-black text-accounting-text text-lg tracking-tight leading-none group-hover:translate-x-1 transition-transform">{task.title}</h3>
              <span className={cn('px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest border -inner', PRIORITY_STYLES[task.priority])}>
                {task.priority}
              </span>
              {isDelayed && (
                <span className="px-3 py-1 rounded-xl text-[8px] font-black bg-red-600 text-white uppercase tracking-widest shadow-xl shadow-red-200/20 animate-pulse border border-white/20">
                  Critical Overdue
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-[10px] font-black uppercase tracking-widest text-secondary-text/30">
              <span className="flex items-center gap-2 px-3 py-1 bg-accounting-bg/40 rounded-xl border border-white -inner">
                <Users size={14} strokeWidth={3} /> {task.assignedToName || 'System Pool'}
              </span>
              <span className="flex items-center gap-2 px-3 py-1 bg-accounting-bg/40 rounded-xl border border-white -inner">
                <LayoutGrid size={14} strokeWidth={3} /> {task.projectName || 'General Ops'}
              </span>
              {task.dueDate && (
                <span className={cn('flex items-center gap-2 px-3 py-1 rounded-xl border -inner', isDelayed ? 'bg-red-50 text-red-500 border-red-100' : 'bg-accounting-bg/40 border-white')}>
                  <Calendar size={14} strokeWidth={3} /> {formatDate(task.dueDate)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 shrink-0">
          <div className="flex flex-col gap-3">
             <div className="flex items-center p-1.5 bg-accounting-bg/60 rounded-3xl -inner border border-white shadow-sm">
               {['Not Started', 'In Progress', 'Completed'].map(s => (
                 <button
                   key={s}
                   onClick={() => onStatusUpdate(task, s)}
                   className={cn(
                     'px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all duration-300',
                     task.status === s
                       ? "bg-accounting-text text-white shadow-xl shadow-accounting-text/20"
                       : "text-secondary-text/20 hover:text-accounting-text"
                   )}
                 >
                   {s === 'Not Started' ? 'New' : s === 'In Progress' ? 'Doing' : 'Done'}
                 </button>
               ))}
             </div>
             
             {task.status === 'Completed' && task.reviewStatus !== 'Approved' && !isManagement && (
                <div className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-200">
                   <Clock size={12} strokeWidth={3} /> Awaiting Audit
                </div>
             )}
          </div>

          {(isManagement || (user?.email === staff?.find(s => s.id === task.assignedTo)?.email)) && (
            <div className="flex items-center gap-2 pl-4 border-l border-accounting-bg">
              <Button variant="ghost" size="sm" icon={Edit2} onClick={onEdit} className="w-10 h-10 p-0 text-secondary-text bg-white shadow-sm border border-accounting-text/5 hover:text-accounting-text" />
              {isManagement && (
                <Button variant="ghost" size="sm" icon={Trash2} onClick={onDelete} className="w-10 h-10 p-0 text-rose-300 hover:text-rose-500 bg-white shadow-sm border border-accounting-text/5" />
              )}
            </div>
          )}
        </div>
      </div>

      {(task.description || task.fileUrl || task.reviewNotes) && (
        <div className="mt-8 pt-8 border-t border-accounting-bg/50 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {task.description && (
              <div className="flex gap-4">
                <Info size={16} strokeWidth={3} className="text-secondary-text/30 mt-0.5" />
                <p className="text-[11px] text-secondary-text/60 italic leading-relaxed">
                  {task.description}
                </p>
              </div>
            )}
            
            {task.fileUrl && (
               <div className="flex items-center gap-4 p-4 bg-accounting-bg/40 rounded-2xl border border-white -inner">
                  <Link2 size={16} strokeWidth={3} className="text-indigo-600" />
                  <div className="flex-1 min-w-0">
                     <p className="text-[9px] font-black text-secondary-text/40 uppercase tracking-widest leading-none">Task Asset / Submission</p>
                     <a href={task.fileUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] font-black text-indigo-600 hover:underline truncate block mt-1">
                        {task.fileUrl}
                     </a>
                  </div>
               </div>
            )}
          </div>

          {task.reviewNotes && (
             <div className="flex gap-4 p-5 bg-rose-50 rounded-2xl border border-rose-100 shadow-sm">
                <MessageSquareQuote size={16} strokeWidth={3} className="text-rose-500 shrink-0" />
                <div>
                   <p className="text-[9px] font-black text-rose-800 uppercase tracking-widest leading-none mb-1.5">Review Feedback Directive</p>
                   <p className="text-[12px] text-rose-950/70 font-medium leading-relaxed italic">{task.reviewNotes}</p>
                </div>
             </div>
          )}
        </div>
      )}
    </Card>
  );
};
