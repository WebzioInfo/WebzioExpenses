'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { useApp } from '@/src/context/ExpenseContext';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Coffee,
  Info,
  Users,
  LayoutGrid,
  ListFilter,
  Check,
  X
} from 'lucide-react';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import { cn } from '@/src/lib/utils';

const STATUS_CONFIG = {
  Present: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  Absent: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
  'Half Day': { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
  Leave: { icon: Coffee, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  Holiday: { icon: Info, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
};

export default function AttendancePage() {
  const { user, isFounder, isManagement } = useAuth();
  const { staff = [] } = useApp();
  
  const [date, setDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'matrix'
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const day = date.getDate();

  const fetchAttendance = async () => {
    setLoading(true);
    const res = await fetch(`/api/attendance?month=${month}&year=${year}`);
    if (res.ok) setAttendance(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchAttendance();
  }, [month, year]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getStatus = (staffId, targetDay) => {
    const dStr = `${year}-${String(month).padStart(2, '0')}-${String(targetDay || day).padStart(2, '0')}`;
    return attendance.find(a => a.staff_id === staffId && a.date.split('T')[0] === dStr);
  };

  const markAttendance = async (staffId, targetDay, status) => {
    if (!isManagement) return;
    setSaving(true);
    const dStr = `${year}-${String(month).padStart(2, '0')}-${String(targetDay || day).padStart(2, '0')}`;
    
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staff_id: staffId, date: dStr, status })
      });
      if (res.ok) await fetchAttendance();
    } catch (err) {
      console.error('Failed to mark attendance:', err);
    } finally {
      setSaving(false);
    }
  };

  const [founderView, setFounderView] = useState('Company'); // 'Company' or 'Personal'

  const filteredStaff = useMemo(() => {
    if (!isManagement) return staff.filter(s => s.email === user?.email);
    if (isFounder && founderView === 'Personal') return staff.filter(s => s.email === user?.email);
    return staff;
  }, [staff, isManagement, isFounder, founderView, user]);

  const stats = useMemo(() => {
    if (!attendance.length) return { present: 0, absent: 0, leave: 0 };
    return {
      present: attendance.filter(a => a.status === 'Present').length,
      absent: attendance.filter(a => a.status === 'Absent').length,
      leave: attendance.filter(a => a.status === 'Leave').length,
    };
  }, [attendance]);

  if (loading) return (
    <div className="flex items-center justify-center py-32">
       <div className="w-10 h-10 border-4 border-accounting-text/10 border-t-accounting-text rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-1">
        <div>
          <h1 className="text-4xl font-black text-accounting-text tracking-tighter leading-none">Attendance</h1>
          <p className="text-[10px] font-black text-secondary-text uppercase tracking-widest mt-2">
            {isManagement ? 'Systemic personnel presence management' : 'Personal activity registry (Verified by HR/Founder)'}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* View Toggle */}
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

          {/* Date Selector */}
          <div className="flex items-center gap-2 bg-accounting-bg/40 p-1 rounded-2xl -inner border border-white/50">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-9 h-9 p-0" 
              onClick={() => setDate(new Date(year, month - 1, viewMode === 'daily' ? day - 1 : 1))}
            >
              <ChevronLeft size={16} strokeWidth={3} className="text-accounting-text" />
            </Button>
            <div className="px-4 text-center min-w-[140px]">
              <p className="text-[10px] font-black text-accounting-text uppercase tracking-widest leading-none">
                {viewMode === 'daily' 
                  ? date.toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' })
                  : date.toLocaleString('default', { month: 'long', year: 'numeric' })
                }
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-9 h-9 p-0" 
              onClick={() => setDate(new Date(year, month - 1, viewMode === 'daily' ? day + 1 : daysInMonth + 1))}
            >
              <ChevronRight size={16} strokeWidth={3} className="text-accounting-text" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Spotlight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'System Presence', value: stats.present, color: 'text-emerald-600', icon: CheckCircle2, bg: 'bg-emerald-50' },
          { label: 'Total Absence', value: stats.absent, color: 'text-red-500', icon: XCircle, bg: 'bg-red-50' },
          { label: 'Leave Units', value: stats.leave, color: 'text-amber-600', icon: Coffee, bg: 'bg-amber-50' },
        ].map(s => (
          <Card key={s.label} className="p-6 flex items-center justify-between border border-accounting-text/5 group">
            <div className="flex items-center gap-4">
               <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center -inner border border-white", s.bg)}>
                  <s.icon size={20} strokeWidth={3} className={s.color} />
               </div>
               <p className="text-[10px] font-black text-secondary-text uppercase tracking-widest leading-none">{s.label}</p>
            </div>
            <p className={cn("text-4xl font-black tracking-tighter", s.color)}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Main Registry View */}
      <Card className="p-0 overflow-hidden border border-accounting-text/5 shadow-2xl min-h-[400px]">
        {viewMode === 'daily' ? (
          /* DAILY LIST VIEW */
          <div className="divide-y divide-accounting-bg">
            <div className="bg-accounting-bg/40 px-8 py-4 border-b border-accounting-text/5 flex items-center justify-between">
               <p className="text-[10px] font-black text-secondary-text uppercase tracking-widest">Personnel Identity</p>
               <p className="text-[10px] font-black text-secondary-text uppercase tracking-widest text-right">Status Authorization</p>
            </div>
            {filteredStaff.length === 0 ? (
               <div className="py-32 flex flex-col items-center justify-center text-secondary-text/30 space-y-4">
                  <AlertCircle size={40} strokeWidth={1} />
                  <p className="text-xs font-black uppercase tracking-widest">No personnel records found</p>
               </div>
            ) : filteredStaff.map((s) => {
              const record = getStatus(s.id);
              const config = record ? STATUS_CONFIG[record.status] : null;

              return (
                <div key={s.id} className="p-6 group hover:bg-accounting-bg/10 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-accounting-bg flex items-center justify-center -inner border border-white text-accounting-text text-sm font-black">
                      {s.name?.[0]}
                    </div>
                    <div>
                      <p className="text-base font-black text-accounting-text tracking-tight leading-none group-hover:translate-x-1 transition-transform">{s.name}</p>
                      <p className="text-[9px] font-black text-secondary-text/40 uppercase tracking-widest mt-2">{s.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isManagement ? (
                      <div className="flex gap-2 p-1 bg-accounting-bg/40 rounded-2xl -inner border border-white">
                        <Button 
                          variant={record?.status === 'Present' ? 'primary' : 'ghost'} 
                          size="sm" 
                          onClick={() => markAttendance(s.id, day, 'Present')}
                          className={cn("h-10 px-4", record?.status === 'Present' && "bg-emerald-600 shadow-emerald-600/20")}
                          icon={Check}
                        >
                          Present
                        </Button>
                        <Button 
                          variant={record?.status === 'Absent' ? 'danger' : 'ghost'} 
                          size="sm" 
                          onClick={() => markAttendance(s.id, day, 'Absent')}
                          className="h-10 px-4"
                          icon={X}
                        >
                          Absent
                        </Button>
                        <select
                          className="bg-transparent border-none text-[9px] font-black uppercase tracking-widest text-secondary-text px-3 focus:ring-0 cursor-pointer"
                          value={['Present', 'Absent'].includes(record?.status) ? '' : record?.status || ''}
                          onChange={(e) => markAttendance(s.id, day, e.target.value)}
                        >
                          <option value="">More...</option>
                          <option value="Half Day">Half Day</option>
                          <option value="Leave">Leave</option>
                          <option value="Holiday">Holiday</option>
                          <option value="">Reset</option>
                        </select>
                      </div>
                    ) : (
                      <div className={cn(
                        "px-6 py-2 rounded-2xl flex items-center gap-3 border shadow-sm -inner",
                        record ? `${config.bg} ${config.color} ${config.border}` : "bg-accounting-bg text-secondary-text/30 border-white"
                      )}>
                        {record ? (
                          <>
                             <config.icon size={16} strokeWidth={3} />
                             <span className="text-[10px] font-black uppercase tracking-widest">{record.status}</span>
                          </>
                        ) : (
                          <span className="text-[10px] font-black uppercase tracking-widest">No Record</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* MATRIX GRID VIEW */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-accounting-bg/40 border-b border-accounting-text/5">
                  <th className="p-6 sticky left-0 bg-white border-r border-accounting-bg z-10 w-48 min-w-48 shadow-xl shadow-accounting-text/5">
                    <p className="text-[10px] font-black text-secondary-text uppercase tracking-widest">Personnel</p>
                  </th>
                  {daysArray.map(d => (
                    <th key={d} className="p-4 text-center min-w-14 border-r border-accounting-bg last:border-0">
                      <p className={cn(
                        "text-[9px] font-black uppercase tracking-widest transition-colors",
                        d === day ? "text-accounting-text" : "text-secondary-text/30"
                      )}>{d}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-accounting-bg">
                {filteredStaff.map(s => (
                  <tr key={s.id} className="group hover:bg-accounting-bg/10 transition-colors">
                    <td className="p-6 sticky left-0 bg-white border-r border-accounting-bg z-10 group-hover:bg-accounting-bg/10 transition-all">
                      <p className="text-sm font-black text-accounting-text tracking-tight leading-none">{s.name}</p>
                      <p className="text-[8px] font-black text-secondary-text/30 uppercase tracking-widest mt-1.5">{s.role}</p>
                    </td>
                    {daysArray.map(d => {
                      const record = getStatus(s.id, d);
                      const config = record ? STATUS_CONFIG[record.status] : null;

                      return (
                        <td key={d} className={cn(
                          "p-2 text-center border-r border-accounting-bg last:border-0",
                          d === day && "bg-accounting-bg/20"
                        )}>
                          <div className={cn(
                            "w-11 h-11 rounded-2xl flex items-center justify-center mx-auto -inner transition-all",
                            record ? config.bg : "bg-accounting-bg/10",
                            d === day && !record && "ring-2 ring-accounting-text/5"
                          )}>
                            {record ? (
                              <config.icon size={16} strokeWidth={3} className={config.color} />
                            ) : (
                              <span className="text-[8px] font-black text-secondary-text/5">.</span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Legend & Utility */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 px-6 py-8 bg-white/50 rounded-3xl border border-accounting-text/5">
        <div className="flex flex-wrap gap-8 justify-center">
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <div key={key} className="flex items-center gap-3">
              <div className={cn("w-7 h-7 rounded-xl flex items-center justify-center border border-white -inner", config.bg)}>
                <config.icon size={14} strokeWidth={3} className={config.color} />
              </div>
              <span className="text-[10px] font-black text-secondary-text uppercase tracking-widest">{key}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 px-6 py-4 bg-accounting-text/5 border border-accounting-text/5 rounded-2xl -inner text-accounting-text/60">
          <Info size={18} strokeWidth={3} className="opacity-40" />
          <p className="text-[10px] font-bold uppercase tracking-tight italic">
            Audit codes: P=Present, A=Absent, HD=Half Day, L=Leave, H=Holiday. System automatically locks daily logs at midnight.
          </p>
        </div>
      </div>
    </div>
  );
}
