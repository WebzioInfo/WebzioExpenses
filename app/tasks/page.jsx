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
  Info,
  Link2,
  FileCheck2,
  AlertOctagon,
  MessageSquareQuote,
  Target,
  Zap,
  Users,
  LayoutGrid
} from 'lucide-react';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import Input from '@/src/components/ui/Input';
import Select from '@/src/components/ui/Select';
import { TASK_STATUS, TASK_PRIORITY } from '@/src/lib/constants';

const PRIORITY_COLORS = {
  High: 'text-rose-600 bg-rose-50 border-rose-100',
  Medium: 'text-amber-600 bg-amber-50 border-amber-100',
  Low: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  Urgent: 'text-red-700 bg-red-100 border-red-200'
};

const STATUS_CONFIG = {
  'Not Started': { icon: Clock, color: 'text-secondary-text/40', bg: 'bg-accounting-bg/50' },
  'In Progress': { icon: Zap, color: 'text-blue-500', bg: 'bg-blue-50' },
  'Completed': { icon: CheckCircle2, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  'Approved': { icon: FileCheck2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  'Needs Revision': { icon: AlertOctagon, color: 'text-rose-500', bg: 'bg-rose-50' },
  'Delayed': { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
};

export default function WorkPage() {
  const { tasks = [], staff = [], projects = [], addTask, updateTask, deleteTask, loading } = useApp();
  const { user, isManagement, isSuperAdmin, isHR, isStaff, isFreelancer } = useAuth();

  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
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
    reviewNotes: '',
    notes: ''
  });

  const [saving, setSaving] = useState(false);

  // Performance Metrics
  const metrics = useMemo(() => {
    const relevant = tasks.filter(t => t.isActive);
    const total = relevant.length;
    const completed = relevant.filter(t => t.status === 'Completed' || t.status === 'Approved').length;
    const delayed = relevant.filter(t => t.status === 'Delayed').length;
    const rejected = relevant.filter(t => t.status === 'Needs Revision').length;
    
    return {
      total,
      completionRate: total ? Math.round((completed / total) * 100) : 0,
      delayRate: total ? Math.round((delayed / total) * 100) : 0,
      qualityScore: total ? Math.round(((completed - rejected) / total) * 100) : 0,
      active: relevant.filter(t => t.status === 'In Progress').length
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    let result = tasks.filter(t => t.isActive);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q));
    }
    if (filterStatus !== 'All') result = result.filter(t => t.status === filterStatus);
    if (filterPriority !== 'All') result = result.filter(t => t.priority === filterPriority);
    return result;
  }, [tasks, search, filterStatus, filterPriority]);

  const openAdd = () => {
    setEditId(null);
    setForm({ title: '', description: '', assignedTo: '', projectId: '', status: 'Not Started', priority: 'Medium', dueDate: '', fileUrl: '', reviewStatus: 'Pending', reviewNotes: '', notes: '' });
    setModal(true);
  };

  const openEdit = (task) => {
    setEditId(task.id);
    setForm({
      ...task,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
    });
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) await updateTask(editId, form);
      else await addTask({ ...form, assignedBy: user.id });
      setModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-20 text-center font-black animate-pulse uppercase tracking-widest text-secondary-text/20">Accessing Mission Log...</div>;

  return (
    <div className="space-y-10 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-accounting-text">Work Module</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-text/40 mt-3">Strategic Objective Registry</p>
        </div>
        {isManagement && (
          <Button onClick={openAdd} icon={Plus} className="h-14 px-8 shadow-2xl">Create Task</Button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <MetricCard label="Completion Rate" value={`${metrics.completionRate}%`} sub="Total Success" />
        <MetricCard label="Delay Magnitude" value={`${metrics.delayRate}%`} sub="Time Variance" />
        <MetricCard label="Quality Index" value={`${metrics.qualityScore}%`} sub="Approval Ratio" />
        <MetricCard label="Active Objectives" value={metrics.active} sub="In Progress" />
      </div>

      {/* View Controls */}
      <Card className="p-8 flex flex-col md:flex-row gap-6 items-center shadow-xl">
        <div className="flex-1 w-full">
          <Input 
            icon={Search} 
            placeholder="Search objectives..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="min-w-[160px]">
            <option value="All">All Status</option>
            {Object.keys(TASK_STATUS).map(s => <option key={s} value={TASK_STATUS[s]}>{TASK_STATUS[s]}</option>)}
          </Select>
          <Select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="min-w-[140px]">
            <option value="All">All Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </Select>
        </div>
      </Card>

      {/* Task List */}
      <div className="space-y-6">
        {filteredTasks.length === 0 ? (
          <div className="py-20 text-center opacity-20 font-black uppercase tracking-widest text-[11px]">No active objectives identified</div>
        ) : (
          filteredTasks.map(task => (
            <TaskEntry 
              key={task.id} 
              task={task} 
              isManagement={isManagement} 
              onEdit={() => openEdit(task)}
              onStatusUpdate={(s) => updateTask(task.id, { ...task, status: s })}
            />
          ))
        )}
      </div>

      {/* Task Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editId ? "Update Task" : "New Task Allocation"}>
        <form onSubmit={handleSubmit} className="space-y-8 p-1">
          <div className="space-y-6">
            <Input 
              label="Objective Title" 
              required 
              value={form.title} 
              onChange={e => setForm({...form, title: e.target.value})} 
            />
            <div className="space-y-2">
              <label className="field-label">Description & Context</label>
              <textarea 
                className="clay-input w-full min-h-[100px] resize-none" 
                value={form.description} 
                onChange={e => setForm({...form, description: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select label="Assign To" value={form.assignedTo} onChange={e => setForm({...form, assignedTo: e.target.value})} disabled={!isManagement}>
                <option value="">Unassigned</option>
                {staff.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
              </Select>
              <Select label="Project" value={form.projectId} onChange={e => setForm({...form, projectId: e.target.value})}>
                <option value="">General</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select label="Priority" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </Select>
              <Input label="Due Date" type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} />
            </div>

            <Input 
              icon={Link2} 
              label="Work Asset URL (Upload Link)" 
              placeholder="e.g. GitHub, Drive, Figma" 
              value={form.fileUrl} 
              onChange={e => setForm({...form, fileUrl: e.target.value})} 
            />

            {isManagement && editId && (
              <div className="pt-6 border-t border-accounting-bg space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-secondary-text/40">Management Review Protocol</h4>
                <Select label="Review Status" value={form.reviewStatus} onChange={e => setForm({...form, reviewStatus: e.target.value})}>
                  <option value="Pending">Pending Audit</option>
                  <option value="Approved">Approved</option>
                  <option value="Needs Revision">Needs Revision</option>
                </Select>
                <textarea 
                  className="clay-input w-full min-h-[80px] resize-none" 
                  placeholder="Review feedback..."
                  value={form.reviewNotes} 
                  onChange={e => setForm({...form, reviewNotes: e.target.value})}
                />
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-6">
            <Button type="submit" isLoading={saving} fullWidth className="h-14">{editId ? 'Authorize Update' : 'Initialize Task'}</Button>
            <Button variant="secondary" onClick={() => setModal(false)} className="h-14 px-10">Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function MetricCard({ label, value, sub }) {
  return (
    <Card className="p-6 text-center space-y-1 shadow-lg border border-accounting-text/5">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-secondary-text/40 leading-none">{label}</p>
      <p className="text-3xl font-black tracking-tighter text-accounting-text">{value}</p>
      <p className="text-[8px] font-bold text-secondary-text/20 uppercase tracking-widest">{sub}</p>
    </Card>
  );
}

function TaskEntry({ task, isManagement, onEdit, onStatusUpdate }) {
  const config = STATUS_CONFIG[task.status] || STATUS_CONFIG['Not Started'];
  const Icon = config.icon;
  const overdue = task.status !== 'Completed' && task.status !== 'Approved' && task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <Card className="p-6 hover:shadow-2xl transition-all duration-300 border border-transparent hover:border-accounting-text/5">
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        <div className={cn("w-14 h-14 rounded-3xl flex items-center justify-center -inner border border-white shrink-0", config.bg)}>
          <Icon size={22} className={cn("stroke-[3px]", config.color)} />
        </div>
        
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-3">
            <h3 className="font-extrabold text-accounting-text tracking-tight uppercase text-[15px] truncate">{task.title}</h3>
            <span className={cn("px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border", PRIORITY_COLORS[task.priority])}>
              {task.priority}
            </span>
            {overdue && <span className="text-[8px] font-black text-rose-600 uppercase tracking-widest animate-pulse">Critical Overdue</span>}
          </div>
          <div className="flex items-center gap-4 text-[10px] font-bold text-secondary-text/40 uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><Users size={12} strokeWidth={3}/> {task.assignedToName || 'Unassigned'}</span>
            <span className="flex items-center gap-1.5"><Target size={12} strokeWidth={3}/> {task.projectName || 'General'}</span>
            {task.dueDate && <span className="flex items-center gap-1.5"><Calendar size={12} strokeWidth={3}/> {formatDate(task.dueDate)}</span>}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex p-1 bg-accounting-bg/40 rounded-2xl border border-white -inner">
            {['Not Started', 'In Progress', 'Completed'].map(s => (
              <button 
                key={s}
                onClick={() => onStatusUpdate(s)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                  task.status === s ? "bg-accounting-text text-white shadow-xl" : "text-secondary-text/20 hover:text-accounting-text"
                )}
              >
                {s === 'Not Started' ? 'New' : s === 'In Progress' ? 'Work' : 'Done'}
              </button>
            ))}
          </div>
          <Button variant="ghost" icon={Edit2} onClick={onEdit} className="w-10 h-10 p-0 text-secondary-text/40 hover:text-accounting-text" />
        </div>
      </div>
      
      {(task.description || task.fileUrl || task.reviewNotes) && (
        <div className="mt-6 pt-6 border-t border-accounting-bg/50 grid grid-cols-1 md:grid-cols-2 gap-6">
          {task.description && (
            <div className="flex gap-3">
              <Info size={14} className="text-secondary-text/20 mt-0.5 shrink-0" />
              <p className="text-[11px] text-secondary-text/60 italic leading-relaxed">{task.description}</p>
            </div>
          )}
          {task.fileUrl && (
            <a href={task.fileUrl} target="_blank" rel="noopener" className="flex items-center gap-3 p-3 bg-accounting-bg/30 rounded-xl border border-white -inner hover:bg-accounting-bg/50 transition-colors">
              <Link2 size={14} className="text-blue-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-[8px] font-black text-secondary-text/20 uppercase tracking-widest">Asset submission</p>
                <p className="text-[10px] font-bold text-blue-600 truncate">{task.fileUrl}</p>
              </div>
            </a>
          )}
          {task.reviewNotes && (
            <div className="col-span-1 md:col-span-2 flex gap-3 p-4 bg-rose-50/50 rounded-xl border border-rose-100">
              <MessageSquareQuote size={14} className="text-rose-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-[8px] font-black text-rose-800 uppercase tracking-widest">Management Directive</p>
                <p className="text-[11px] text-rose-950/70 italic leading-relaxed font-medium">{task.reviewNotes}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
