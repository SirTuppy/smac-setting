import React from 'react';
import { WallStats } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface WallHealthProps {
  wallStats: WallStats[];
}

const COLORS = ['#0f766e', '#0d9488', '#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4', '#ccfbf1'];
const NEGLECTED_COLOR = '#ef4444';

const WallHealth: React.FC<WallHealthProps> = ({ wallStats }) => {
  
  // Sort by activity
  const sortedStats = [...wallStats].sort((a, b) => b.totalClimbs - a.totalClimbs);
  
  // Identify neglected walls (arbitrary threshold: bottom 20% or 0 climbs)
  const neglectedWalls = wallStats.filter(w => w.totalClimbs === 0 || w.totalClimbs < 2);

  const data = sortedStats.slice(0, 8).map(w => ({ name: w.name, value: w.totalClimbs }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm h-full">
      <h2 className="text-lg font-bold text-white mb-4">Wall Health Distribution</h2>
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                itemStyle={{ color: '#cbd5e1' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 space-y-3">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Potentially Neglected</h3>
        {neglectedWalls.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
                {neglectedWalls.map(w => (
                    <div key={w.name} className="flex items-center gap-2 bg-slate-800/50 p-2 rounded border border-red-900/30">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span className="text-sm text-slate-300">{w.name}</span>
                    </div>
                ))}
            </div>
        ) : (
            <p className="text-sm text-teal-500">All walls have recent activity!</p>
        )}
      </div>
    </div>
  );
};

export default WallHealth;
