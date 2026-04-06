'use client';

import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['accounting-text', '#4A2B3A', '#7C444F', '#9E5D67', '#C27B7F', '#E49B99'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="clay-card p-4 border-none shadow-clay-outer">
        <p className="text-[10px] font-black text-accounting-text/40 uppercase tracking-widest mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm font-black" style={{ color: p.color }}>
            {p.name}: ₹{p.value.toLocaleString('en-IN')}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const MonthlyBarChart = ({ data }) => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="accounting-text10" />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 9, fontWeight: 900, fill: 'accounting-text60', letterSpacing: '0.1em' }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 9, fontWeight: 900, fill: 'accounting-text60' }}
            tickFormatter={(v) => `₹${v >= 1000 ? (v/1000).toFixed(0) + 'k' : v}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'accounting-text05' }} />
          <Bar 
            dataKey="income" 
            name="Inflow" 
            fill="#10b981" 
            radius={[6, 6, 0, 0]} 
            barSize={20}
          />
          <Bar 
            dataKey="expense" 
            name="Outflow" 
            fill="#ef4444" 
            radius={[6, 6, 0, 0]} 
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const CategoryPieChart = ({ data }) => {
  const chartData = Object.entries(data).map(([name, value]) => ({ name, value }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value) => <span className="text-[9px] font-black uppercase text-accounting-text/40 tracking-widest">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
