import React, { useState, useMemo, useEffect } from 'react';
import { Climb, SetterStats } from '../types';
import SetterCard from './SetterCard';
import DataExplorer from './DataExplorer';
import GymComparison from './GymComparison';
import { GYM_COLORS, TYPE_COLORS } from '../constants/colors';
import { Calendar, Sparkles, BarChart3, Layers } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { generateRegionalSummary } from '../services/reports';
import { getGymCode, GYM_DISPLAY_NAMES } from '../constants/mapTemplates';
import UnifiedHeader, { RangeOption } from './UnifiedHeader';

import { useDashboardStore } from '../store/useDashboardStore';

const REGIONAL_GREY = "#475569";

const Dashboard: React.FC = () => {
  const {
    climbData: gymData,
    selectedGyms,
    isCompareMode,
    dateRange,
    rangeOption,
    setRangeOption,
    setDateRange
  } = useDashboardStore();

  const [visibleSetters, setVisibleSetters] = useState(12);

  if (!gymData) return null;

  const gymNames = ["Regional Overview", ...Object.keys(gymData)];

  // Helper for single vs multi view
  const activeGym = selectedGyms.length === 1 ? selectedGyms[0] : "Comparison";

  // Get data for selected gyms
  const data = useMemo(() => {
    if (selectedGyms.includes("Regional Overview")) {
      return Object.values(gymData).flat();
    }
    return selectedGyms.flatMap(gym => gymData[gym] || []);
  }, [gymData, selectedGyms]);

  // Filtered Climbs for the period
  const filteredClimbs = useMemo<Climb[]>(() => {
    return data.filter(c =>
      c.dateSet >= dateRange.start && c.dateSet <= dateRange.end
    );
  }, [data, dateRange]);

  // Basic production stats
  const globalStats = useMemo(() => {
    let routes = 0;
    let boulders = 0;
    filteredClimbs.forEach(c => {
      const typeLower = c.climbType?.toLowerCase() || '';
      const gradeLower = c.grade?.toLowerCase() || '';
      let isRoute = typeLower.includes('route') || gradeLower.startsWith('5.');
      if (isRoute) routes++; else boulders++;
    });
    return { routes, boulders, total: routes + boulders };
  }, [filteredClimbs]);

  const setterStats: SetterStats[] = useMemo(() => {
    const stats: Record<string, SetterStats & { shiftKeys: Set<string> }> = {};

    filteredClimbs.forEach(c => {
      const setterNames = String(c.setter).split(',').map(s => s.trim());
      const dateKey = c.dateSet.toDateString();
      const gymKey = c.gym || "Unknown";
      const shiftId = `${dateKey}|${gymKey}`;

      setterNames.forEach(name => {
        if (!stats[name]) {
          stats[name] = {
            name, totalClimbs: 0, routes: 0, boulders: 0, shifts: 0,
            shiftKeys: new Set(),
            gradeDistribution: {}, stewardshipHours: 0, settingHours: 40
          };
        }

        stats[name].totalClimbs++;
        if (c.isRoute) stats[name].routes++; else stats[name].boulders++;

        // Track unique shifts
        stats[name].shiftKeys.add(shiftId);
        stats[name].shifts = stats[name].shiftKeys.size;

        const g = c.normalizedGrade;
        stats[name].gradeDistribution[g] = (stats[name].gradeDistribution[g] || 0) + 1;
      });
    });

    return Object.values(stats).sort((a, b) => b.totalClimbs - a.totalClimbs);
  }, [filteredClimbs]);

  // Regional Capacity (Total Shifts)
  const totalShifts = useMemo(() => {
    return setterStats.reduce((acc, s) => acc + s.shifts, 0);
  }, [setterStats]);

  // Chart Data Structure
  const chartGyms = Object.keys(gymData);
  const weekdayChartData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const base = days.map(d => ({
      day: d,
      total: 0,
      ...Object.fromEntries(chartGyms.map(g => [g, 0]))
    }));

    filteredClimbs.forEach(c => {
      const dayIdx = c.dateSet.getDay();
      const rawGym = c.gym || "Unknown";
      // Find the key in gymData that matches this rawGym or its code
      const gymCode = Object.keys(gymData).find(k => rawGym.includes(k) || rawGym.includes(GYM_DISPLAY_NAMES[k])) || rawGym;

      base[dayIdx].total++;
      if (gymCode in base[dayIdx]) {
        (base[dayIdx] as any)[gymCode]++;
      }
    });
    return base;
  }, [filteredClimbs, chartGyms]);


  return (
    <div className="flex flex-col min-h-screen bg-slate-100/80 text-[#00205B] relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#00205B 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

      {/* Global Header */}
      <UnifiedHeader
        title={selectedGyms.length > 1 ? "Comparison Overview" : (selectedGyms[0] || "Regional Overview")}
        subtitle={`${filteredClimbs.length} Total Records`}
        dateRange={dateRange}
        rangeOption={rangeOption}
        onRangeOptionChange={setRangeOption}
        onCustomDateChange={(start, end) => {
          setRangeOption('custom');
          setDateRange({ start, end });
        }}
      />

      <main className="flex-1 p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {selectedGyms.length > 1 ? (
          <GymComparison gymData={gymData} selectedGyms={selectedGyms} dateRange={dateRange} />
        ) : (
          <>
            {/* KPI Row */}
            <div id="tour-kpi-row" className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                <p className="text-slate-600 text-[9px] font-black uppercase tracking-widest mb-2">Volume</p>
                <div className="flex gap-4 items-end">
                  <p className="text-3xl font-black text-[#00205B]">{globalStats.total}</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                <p className="text-slate-600 text-[9px] font-black uppercase tracking-widest mb-2">Ropes / Boulders</p>
                <div className="flex gap-4">
                  <div><p className="text-xl font-bold" style={{ color: TYPE_COLORS.routes }}>{globalStats.routes}</p></div>
                  <div className="w-px bg-slate-100 h-6"></div>
                  <div><p className="text-xl font-bold" style={{ color: TYPE_COLORS.boulders }}>{globalStats.boulders}</p></div>
                </div>
              </div>

              <div className="bg-indigo-50/30 border border-indigo-100 p-4 rounded-xl shadow-sm">
                <p className="text-indigo-900/60 text-[9px] font-black uppercase tracking-widest mb-2 font-mono">Regional Capacity</p>
                <div className="text-xl font-bold text-indigo-900">
                  {totalShifts} <span className="text-[10px] text-indigo-900/40 font-black">Shifts Logged</span>
                </div>
              </div>

              <div className="bg-emerald-50/30 border border-emerald-100 p-4 rounded-xl shadow-sm">
                <p className="text-emerald-900/60 text-[9px] font-black uppercase tracking-widest mb-2 font-mono">Workload Rhythm</p>
                <div className="text-xl font-bold text-emerald-900">
                  {(globalStats.total / (totalShifts || 1)).toFixed(1)} <span className="text-[10px] text-emerald-900/40 font-black">Climbs/Shift</span>
                </div>
              </div>
            </div>


            <div id="tour-weekday-chart" className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div><h3 className="text-sm font-black text-[#00205B] uppercase tracking-widest flex items-center gap-2"><BarChart3 size={18} className="text-[#009CA6]" />Weekday Production</h3></div>
                <div className="flex gap-4 items-center">
                  {selectedGyms.includes("Regional Overview") && (
                    <div className="flex gap-3 mr-4 border-r border-slate-100 pr-4">
                      {chartGyms.map(g => (
                        <div key={g} className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: GYM_COLORS[g] || REGIONAL_GREY }}></div><span className="text-[9px] text-slate-400 uppercase font-black tracking-tighter">{g}</span></div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weekdayChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: '11px', fontWeight: 600 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: '9px' }} />
                    <Tooltip cursor={{ fill: '#f1f5f9', opacity: 0.6 }} content={({ active, payload }) => {
                      if (active && payload?.length) {
                        return (
                          <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-xl">
                            <p className="text-[10px] font-black text-[#00205B] uppercase tracking-widest mb-2">{payload[0].payload.day}</p>
                            <div className="space-y-1">
                              {payload.map((entry, i) => (
                                <div key={i} className="flex justify-between gap-6 text-[10px]">
                                  <span className="text-slate-500 font-bold flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }}></div>{entry.name}</span>
                                  <span className="text-[#00205B] font-black">{entry.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }} />
                    {selectedGyms.includes("Regional Overview") ? chartGyms.map(g => <Bar key={g} dataKey={g} stackId="a" fill={GYM_COLORS[g] || REGIONAL_GREY} barSize={35} />) : <Bar dataKey="total" fill={GYM_COLORS[activeGym] || TYPE_COLORS.routes} radius={[4, 4, 0, 0]} barSize={35} />}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div id="tour-setter-cards" className="space-y-6">
              <div className="flex justify-between items-center px-1">
                <h2 className="text-xs font-black text-[#00205B] uppercase tracking-[0.2em]">Setter Performance</h2>
                {setterStats.length > visibleSetters && (
                  <button
                    onClick={() => setVisibleSetters(setterStats.length)}
                    className="text-[10px] font-black text-[#009CA6] uppercase tracking-widest hover:underline"
                  >
                    View All {setterStats.length} Setters
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-4">
                {setterStats.slice(0, visibleSetters).map(setter => <SetterCard key={setter.name} stats={setter} />)}
              </div>
            </div>

            <div id="tour-production-details" className="space-y-4 pt-4 border-t border-slate-200">
              <h2 className="text-lg font-black text-[#00205B] uppercase tracking-widest">Production Details</h2>
              <DataExplorer climbs={filteredClimbs} />
            </div>
          </>
        )}
      </main >
    </div >
  );
};

export default Dashboard;