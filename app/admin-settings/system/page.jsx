'use client';

import React, { useState } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { 
  Download, 
  Upload, 
  Trash2, 
  AlertCircle, 
  Database, 
  ShieldAlert,
  Save,
  RefreshCw,
  Info
} from 'lucide-react';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import Modal from '@/src/components/ui/Modal';

export default function SystemControlPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [resetType, setResetType] = useState(null); // 'transactions' | 'full'
  const [importData, setImportData] = useState(null);

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/system');
      if (!res.ok) throw new Error();
      const backup = await res.json();
      
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `webzio_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to export system data.');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);
        setImportData(data);
        setModal(true);
        setResetType('import');
      } catch (err) {
        alert('Invalid backup file.');
      }
    };
    reader.readAsText(file);
  };

  const executeReset = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: resetType === 'import' ? 'import' : (resetType === 'full' ? 'full_reset' : 'reset_transactions'),
          data: resetType === 'import' ? importData : null
        })
      });
      
      if (!res.ok) throw new Error();
      const result = await res.json();
      alert(result.message);
      window.location.reload();
    } catch (error) {
      alert('Action failed.');
    } finally {
      setLoading(false);
      setModal(false);
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-xl font-black text-accounting-text tracking-tighter uppercase">System Control</h2>
        <p className="text-[10px] font-black text-secondary-text uppercase tracking-widest mt-1">Data backup and recovery tools</p>
      </div>

      {/* Backup Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col items-center text-center p-10 space-y-4 border border-accounting-text/5">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center -inner border border-emerald-100 mb-2">
            <Download size={28} strokeWidth={2.5} />
          </div>
          <div className="space-y-1">
             <h3 className="text-sm font-black text-accounting-text uppercase tracking-tight leading-none">System Backup</h3>
             <p className="text-[10px] font-bold text-secondary-text uppercase tracking-widest group-hover:text-accounting-text transition-colors">Export all system data to JSON</p>
          </div>
          <Button onClick={handleExport} isLoading={loading} icon={Save} className="mt-4 px-10">Generate Backup</Button>
        </Card>

        <Card className="flex flex-col items-center text-center p-10 space-y-4 border border-accounting-text/5">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center -inner border border-blue-100 mb-2">
            <Upload size={28} strokeWidth={2.5} />
          </div>
          <div className="space-y-1">
             <h3 className="text-sm font-black text-accounting-text uppercase tracking-tight leading-none">Data Restoration</h3>
             <p className="text-[10px] font-bold text-secondary-text uppercase tracking-widest group-hover:text-accounting-text transition-colors">Restore system from a JSON file</p>
          </div>
          <div className="relative mt-4">
            <input 
              type="file" 
              accept=".json" 
              onChange={handleImport}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
            />
            <Button variant="secondary" icon={Database} className="px-10">Import Backup</Button>
          </div>
        </Card>
      </div>

      {/* Danger Zone */}
      <div className="space-y-4 pt-10 border-t border-accounting-bg">
        <div className="flex items-center gap-3">
          <ShieldAlert size={20} className="text-red-500" strokeWidth={3} />
          <h3 className="text-xs font-black text-red-500 uppercase tracking-widest leading-none">Danger Zone</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-red-50/30 border border-red-100 rounded-3xl flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-red-700 uppercase tracking-widest leading-tight">Clear Transactions Only</p>
              <p className="text-[9px] font-bold text-red-900/40 uppercase tracking-widest mt-1">resets balances but keeps staff/users/projects</p>
            </div>
            <Button 
                variant="danger" 
                size="sm" 
                icon={Trash2} 
                onClick={() => { setResetType('transactions'); setModal(true); }}
                className="px-6"
            />
          </div>

          <div className="p-6 bg-red-50/50 border-2 border-red-200/50 rounded-3xl flex items-center justify-between shadow-lg">
            <div>
              <p className="text-[10px] font-black text-red-700 uppercase tracking-widest leading-tight">FULL SYSTEM WIPE</p>
              <p className="text-[9px] font-bold text-red-900/60 uppercase tracking-widest mt-1">Factory reset (Deletes everything but admins)</p>
            </div>
            <Button 
                variant="danger" 
                size="sm" 
                icon={RefreshCw} 
                onClick={() => { setResetType('full'); setModal(true); }}
                className="px-8 shadow-red-200 shadow-xl"
            />
          </div>
        </div>
      </div>

      <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl flex gap-4 -inner opacity-80">
        <Info size={24} className="text-blue-400 shrink-0 mt-0.5" strokeWidth={3} />
        <div className="space-y-1">
          <p className="text-[11px] font-black text-blue-700 uppercase tracking-widest">Recommended Workflow</p>
          <p className="text-[11px] font-bold text-blue-600 leading-relaxed tracking-tight italic">
            Always perform a Full Backup before initiating a system reset or importing new data. Webzio International is not responsible for data lost due to unauthorized resets.
          </p>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal 
        isOpen={modal} 
        onClose={() => setModal(false)} 
        title={resetType === 'import' ? 'Confirm Restore' : 'Security Confirmation'}
      >
        <div className="space-y-6 text-center">
            <div className="w-20 h-20 rounded-full bg-red-50 text-red-500 mx-auto flex items-center justify-center -inner border-2 border-red-100 shadow-xl animate-pulse">
                <AlertCircle size={40} strokeWidth={3} />
            </div>
            
            <div className="space-y-2">
                <h3 className="text-lg font-black text-accounting-text tracking-tight leading-none uppercase">Irreversible Action</h3>
                <p className="text-[10px] font-bold text-secondary-text uppercase tracking-widest px-10 leading-relaxed">
                   {resetType === 'import' 
                    ? 'Restoring will overwrite all current system data with the backup file. This cannot be undone.' 
                    : (resetType === 'full' 
                       ? 'You are about to wipe the entire system (Staff, Projects, Finance). Only user accounts will be preserved.' 
                       : 'All financial activities and account balances will be permanently deleted.')}
                </p>
            </div>

            <div className="flex flex-col gap-3 py-2">
               <Button variant="danger" isLoading={loading} fullWidth onClick={executeReset}>
                  {resetType === 'import' ? 'Confirm & Restore Now' : 'I Understand, Proceed'}
               </Button>
               <Button variant="secondary" fullWidth onClick={() => setModal(false)}>Cancel & Return</Button>
            </div>
        </div>
      </Modal>
    </div>
  );
}
