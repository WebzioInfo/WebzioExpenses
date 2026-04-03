'use client';

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend
} from 'recharts';
import { cn } from '../utils/helpers';

const COLORS = ['#2D151F', '#4A2B3A', '#8E8D82', '#E8E7C8', '#D1D0C9', '#B4B3AA'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="clay-card p-6 bg-white shadow-clay-outer border-white text-left space-y-4 min-w-[180px] animate-in fade-in zoom-in-95 duration-200">
        <p className="text-[10px] font-black text-[#2D151F]/30 uppercase tracking-[0.3em] font-display">{label}</p>
        <div className="space-y-4">
           {payload.map((entry, index) => (
             <div key={index} className="flex flex-col gap-1.5">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
                  <span className="text-[10px] font-black text-[#2D151F]/40 uppercase tracking-widest leading-none">
                    {entry.name}
                  </span>
               </div>
               <span className={cn(
                 "text-xl font-black tracking-tighter font-display",
                 entry.name === 'Incoming' || entry.name === 'Investment' ? 'text-emerald-500' : 'text-[#2D151F]'
               )}>
                 ₹{entry.value.toLocaleString()}
               </span>
             </div>
           ))}
        </div>
      </div>
    );
  }
  return null;
};

export const CategoryPieChart = ({ data, title = "Flows" }) => {
  const chartData = Object.entries(data).map(([name, value]) => ({ name, value }));
  
  return (
    <div className="h-[420px] w-full relative group">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={95}
            outerRadius={135}
            paddingAngle={12}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                className="hover:opacity-90 transition-all cursor-pointer outline-none drop-shadow-lg"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={60} 
            iconType="circle"
            formatter={(value) => <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#2D151F]/30 px-3 hover:text-[#2D151F] transition-colors">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center Label Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-14">
         <div className="text-center space-y-2 animate-in fade-in zoom-in duration-700">
            <p className="text-[11px] font-black text-[#2D151F]/20 uppercase tracking-[0.5em]">{title}</p>
            <p className="text-3xl font-black text-[#2D151F] tracking-tighter uppercase font-display leading-none">Metrics</p>
         </div>
      </div>
    </div>
  );
};

export const MonthlyBarChart = ({ data }) => {
  return (
    <div className="h-[400px] w-full px-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="0" vertical={false} stroke="#2D151F08" />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 11, fill: '#2D151F30', fontWeight: 900 }} 
            dy={25}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 11, fill: '#2D151F30', fontWeight: 900 }} 
            width={70}
            tickFormatter={(value) => `₹${value/1000}k`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#2D151F04' }} />
          <Legend 
            verticalAlign="top" 
            align="right"
            height={60}
            iconType="circle"
            formatter={(value) => <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#2D151F]/30 px-4 hover:text-[#2D151F] transition-colors">{value}</span>}
          />
          <Bar 
            name="Incoming"
            dataKey="income" 
            fill="#10b981" 
            radius={[10, 10, 0, 0]}
            barSize={20}
            className="drop-shadow-sm"
          />
          <Bar 
            name="Outgoing"
            dataKey="expense" 
            fill="#2D151F" 
            radius={[10, 10, 0, 0]} 
            barSize={20}
            className="drop-shadow-sm"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
