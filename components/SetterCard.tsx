import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SetterStats } from '../types';
import { Clock, TrendingUp } from 'lucide-react';

import { ALL_GRADES, normalizeGrade } from '../utils/gradeUtils';
import { TYPE_COLORS } from '../constants/colors';

// Define the indices for labelling
const X_AXIS_TICKS = ['V-Intro', 'V12', '5.6', '5.13d'];

interface SetterCardProps {
  stats: SetterStats;
}

const SetterCard: React.FC<SetterCardProps> = React.memo(({ stats }) => {

  // Prepare standardized data for chart (every grade included, even if count is 0)
  const chartData = useMemo(() => {
    return ALL_GRADES.map(grade => {
      const isBoulder = grade.startsWith('V');
      const count = stats.gradeDistribution[grade] || 0;
      return {
        grade,
        boulderCount: isBoulder ? count : 0,
        ropeCount: !isBoulder ? count : 0,
        // For tooltip clarity
        totalCount: count
      };
    });
  }, [stats.gradeDistribution]);

  // Calculate Velocity: Climbs / Shifts
  const shifts = stats.shifts || 1;
  const velocity = (stats.totalClimbs / shifts).toFixed(1);

  // Custom Tick renderer to keep it clean
  const renderCustomAxisTick = ({ x, y, payload }: any) => {
    if (!X_AXIS_TICKS.includes(payload.value)) return null;
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={12} textAnchor="middle" fill="#475569" fontSize="8px" fontWeight="bold" className="uppercase">
          {payload.value.replace('.Intro', '')}
        </text>
      </g>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-xl hover:scale-[102%] hover:border-[#009CA6]/40 hover:z-10 transition-all duration-300 flex flex-col h-full group">

      {/* Header */}
      <div className="flex justify-between items-start mb-3 px-1">
        <h3 className="text-base font-black text-[#00205B] uppercase tracking-widest truncate pr-2">{stats.name}</h3>
        <div className="flex flex-col items-end">
          <div className="flex items-center text-[#00205B] gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 text-sm">
            <Clock size={14} style={{ color: TYPE_COLORS.routes }} />
            <span className="font-black">{velocity}</span>
          </div>
          <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">Climbs/Shift</span>
        </div>
      </div>

      {/* Routes/Boulders Split */}
      <div className="flex gap-2 text-[10px] mb-4 px-1 font-black uppercase tracking-widest">
        <div className="bg-slate-50 text-[#00205B] px-2 py-2 rounded border border-slate-200 flex-1 text-center shadow-sm">
          <span style={{ color: TYPE_COLORS.boulders }}>{stats.boulders}</span> Boulders
        </div>
        <div className="bg-slate-50 text-[#00205B] px-2 py-2 rounded border border-slate-200 flex-1 text-center shadow-sm">
          <span style={{ color: TYPE_COLORS.routes }}>{stats.routes}</span> Ropes
        </div>
      </div>

      {/* Chart */}
      <div className="h-44 min-h-[176px] w-full mb-2 relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: -20, left: -25, bottom: 20 }}>
            <XAxis
              dataKey="grade"
              interval={0}
              tick={renderCustomAxisTick}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 8, fontWeight: 'bold' }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 8, fontWeight: 'bold' }}
            />
            <Tooltip
              cursor={{ fill: '#f8fafc', opacity: 0.8 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const grade = payload[0].payload.grade;
                  const count = payload[0].payload.totalCount;
                  return (
                    <div className="bg-white border border-slate-200 p-2 rounded shadow-lg">
                      <p className="text-[10px] font-black text-[#00205B] uppercase tracking-widest mb-1">{grade}</p>
                      <p className="text-[10px] text-slate-500 font-bold">Volume: <span style={{ color: TYPE_COLORS.routes }}>{count}</span></p>
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Boulders on Left Axis */}
            <Bar
              yAxisId="left"
              dataKey="boulderCount"
              stackId="a"
              radius={[1, 1, 0, 0]}
              fill={TYPE_COLORS.boulders}
              barSize={12}
            />
            {/* Ropes on Right Axis */}
            <Bar
              yAxisId="right"
              dataKey="ropeCount"
              stackId="a"
              radius={[1, 1, 0, 0]}
              fill={TYPE_COLORS.routes}
              barSize={12}
            />
          </BarChart>
        </ResponsiveContainer>

        {stats.totalClimbs === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-300 font-black uppercase tracking-widest bg-white/80">
            NO ACTIVITY
          </div>
        )}
      </div>
    </div>
  );
});

export default SetterCard;