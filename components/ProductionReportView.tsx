import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend, LabelList } from 'recharts';
import { FileText, Users, Award, Printer, BarChart2, LayoutDashboard } from 'lucide-react';
import { GYM_DISPLAY_NAMES } from '../constants/mapTemplates';
import { GYM_COLORS, TYPE_COLORS } from '../constants/colors';
import { ProductionStats, SetterProduction } from '../types';

interface ProductionReportViewProps {
    stats: ProductionStats;
    dateRange: { start: Date; end: Date };
    reportTitle: string;
    isPrintMode?: boolean;
    reportRef?: React.RefObject<HTMLDivElement | null>;
}

const ProductionReportView: React.FC<ProductionReportViewProps> = ({
    stats,
    dateRange,
    reportTitle,
    isPrintMode = false,
    reportRef
}) => {
    return (
        <div
            ref={reportRef}
            className={`mx-auto p-10 space-y-6 ${!isPrintMode ? 'max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-700' : 'bg-white'}`}
            style={isPrintMode ? { width: '1200px', margin: '0' } : {}}
        >
            {/* Header / Meta */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-4 relative">
                <div>
                    <h1 className="text-4xl font-black text-[#00205B] uppercase tracking-tighter">{reportTitle}</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">
                        {dateRange.start.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })} — {dateRange.end.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-3">
                        <p className="text-[10px] font-black text-[#009CA6] uppercase tracking-[0.2em]">SMaC Departmental Asset</p>
                        <div className="bg-[#00205B] p-2 rounded-lg">
                            <FileText className="text-white" size={18} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid: Executive Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Consolidated Production Summary */}
                <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Production Summary</p>
                        <h3 className="text-5xl font-black text-[#00205B] tracking-tighter">{stats.total}</h3>
                        <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider mb-4">Total Climbs Set</p>

                        <div className="space-y-3 pt-4 border-t border-slate-50">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rope Routes</span>
                                <span className="text-sm font-black" style={{ color: TYPE_COLORS.routes }}>{stats.routes}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Boulders</span>
                                <span className="text-sm font-black" style={{ color: TYPE_COLORS.boulders }}>{stats.boulders}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Shifts Card */}
                <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Team Shifts</p>
                    <div className="flex items-baseline gap-2 mb-4">
                        <h3 className="text-5xl font-black text-[#00205B] tracking-tighter">{stats.totalShifts}</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Shifts</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-50 p-2 rounded-xl text-center">
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Rope</p>
                            <p className="text-xs font-black" style={{ color: TYPE_COLORS.routes }}>{stats.ropeShifts}</p>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl text-center">
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Boulder</p>
                            <p className="text-xs font-black" style={{ color: TYPE_COLORS.boulders }}>{stats.boulderShifts}</p>
                        </div>
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-4">1 Shift = Unique (Setter / Date / Gym)</p>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden flex flex-col justify-between">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Team Insights</p>

                        <div className="space-y-4">
                            {/* Top Producer */}
                            {stats.setterData.length > 0 && (
                                <div className="flex items-center gap-3">
                                    <div className="bg-amber-50 p-2 rounded-xl">
                                        <Award className="text-amber-500" size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Top Producer</p>
                                        <p className="text-xs font-black text-[#00205B]">
                                            {stats.setterData[0].name} <span className="text-[#009CA6] ml-1">({stats.setterData[0].total})</span>
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Regional Efficiency */}
                            <div className="flex items-center gap-3">
                                <div className="bg-emerald-50 p-2 rounded-xl">
                                    <BarChart2 className="text-emerald-500" size={18} />
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Regional Efficiency</p>
                                    <p className="text-xs font-black text-[#00205B]">
                                        {(stats.total / (stats.totalShifts || 1)).toFixed(1)} <span className="text-slate-400 font-bold ml-1 text-[10px]">AVG CLIMBS / SHIFT</span>
                                    </p>
                                </div>
                            </div>

                            {/* Active Network */}
                            <div className="flex items-center gap-3">
                                <div className="bg-indigo-50 p-2 rounded-xl">
                                    <LayoutDashboard className="text-indigo-500" size={18} />
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Active Network</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs font-black text-[#00205B]">
                                            {stats.activeGymCodes.length} <span className="text-slate-400 font-bold ml-1 text-[10px]">LOCATIONS</span>
                                        </p>
                                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                                        <p className="text-xs font-black text-[#00205B]">
                                            {stats.setterData.length} <span className="text-slate-400 font-bold ml-1 text-[10px]">SETTERS</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tiny Gym Badge Strip */}
                    <div className="mt-4 flex flex-wrap gap-1 opacity-60">
                        {stats.activeGymCodes.map((code: string) => (
                            <span key={code} className="px-1.5 py-0.5 rounded-md text-[7px] font-black text-white uppercase tracking-tighter" style={{ backgroundColor: GYM_COLORS[code] || '#64748b' }}>
                                {code}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Daily Production Chart */}
                <div className="bg-white p-6 rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-black text-[#00205B] uppercase tracking-tight">Daily Production</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Output per gym across defined period</p>
                        </div>
                        <BarChart2 className="text-slate-200" size={32} />
                    </div>
                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.dailyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="dateKey"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                    label={{ value: 'Climbs', angle: -90, position: 'insideLeft', offset: 0, fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                />
                                <Legend
                                    verticalAlign="top"
                                    align="right"
                                    iconType="circle"
                                    wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}
                                />
                                {stats.activeGymCodes.map((code: string) => (
                                    <Bar
                                        key={code}
                                        dataKey={code}
                                        name={GYM_DISPLAY_NAMES[code] || code}
                                        stackId="gym"
                                        fill={GYM_COLORS[code] || '#64748b'}
                                        radius={[2, 2, 2, 2]}
                                        barSize={24}
                                        isAnimationActive={!isPrintMode}
                                    />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Weekday Breakdown */}
                <div className="bg-white p-6 rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-black text-[#00205B] uppercase tracking-tight">Weekday Distribution</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Output split by climb type</p>
                        </div>
                        <LayoutDashboard className="text-slate-200" size={32} />
                    </div>
                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.weekdayData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                <YAxis
                                    dataKey="day"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#1e293b', fontSize: 11, fontWeight: 800 }}
                                    width={40}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '10px 0 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend
                                    verticalAlign="top"
                                    align="right"
                                    iconType="circle"
                                    wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}
                                />
                                <Bar dataKey="routes" name="Routes" stackId="type" fill={TYPE_COLORS.routes} radius={[0, 0, 0, 0]} isAnimationActive={!isPrintMode}>
                                    {stats.weekdayData.map((entry: any, index: number) => (
                                        <Cell key={`cell-r-${index}`} fill={TYPE_COLORS.routes} label={entry.routes > 0 ? { position: 'inside', fill: 'white', fontSize: 9, fontWeight: 900, formatter: (val: number) => `${val}R` } : false} />
                                    ))}
                                </Bar>
                                <Bar dataKey="boulders" name="Boulders" stackId="type" fill={TYPE_COLORS.boulders} radius={[0, 4, 4, 0]} isAnimationActive={!isPrintMode}>
                                    {stats.weekdayData.map((entry: any, index: number) => (
                                        <Cell key={`cell-b-${index}`} fill={TYPE_COLORS.boulders} label={entry.boulders > 0 ? { position: 'inside', fill: 'white', fontSize: 9, fontWeight: 900, formatter: (val: number) => `${val}B` } : false} />
                                    ))}
                                    <LabelList dataKey="total" position="right" style={{ fill: '#00205B', fontSize: 10, fontWeight: 900 }} formatter={(val: number) => val > 0 ? `${val} Total` : ''} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Setter Production Section */}
            <div className="bg-white rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="px-8 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-[#00205B] uppercase tracking-tight">Routesetter Production</h3>
                    </div>
                    <Award className="text-[#009CA6]/20" size={28} />
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stats.setterData.map((setter: SetterProduction) => (
                        <div key={setter.name} className="flex items-center p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/50 transition-colors gap-2">
                            {/* 1. Setter Info */}
                            <div className="flex-[2] min-w-0 pr-2">
                                <p className="font-black text-[#00205B] text-xs leading-tight mb-1 truncate">{setter.name}</p>
                                <div className="flex flex-wrap gap-1">
                                    {setter.gymCodes.split(', ').map((code: string) => (
                                        <span key={code} className="px-2 py-0.5 rounded-[10px] text-white text-[10px] font-black uppercase" style={{ backgroundColor: GYM_COLORS[code] || '#64748b' }}>
                                            {code}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="w-px h-8 bg-slate-300 shrink-0" />

                            {/* 2. Shifts */}
                            <div className="flex-1 flex items-center justify-center gap-2 px-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Shifts</span>
                                <span className="text-[11px] font-black text-[#00205B]">{setter.shifts}</span>
                            </div>

                            {/* Divider */}
                            <div className="w-px h-8 bg-slate-300 shrink-0" />

                            {/* 3. Boulders / Routes - Horizontal */}
                            <div className="flex-[3] flex items-center justify-center px-4">
                                <span className="text-[12px] font-bold text-[#00205B] whitespace-nowrap">
                                    Routes: <span style={{ color: TYPE_COLORS.routes }} className="font-black">{setter.routes}</span>
                                    <span className="text-slate-300 mx-3">|</span>
                                    Boulders: <span style={{ color: TYPE_COLORS.boulders }} className="font-black">{setter.boulders}</span>
                                </span>
                            </div>

                            {/* Divider */}
                            <div className="w-px h-8 bg-slate-300 shrink-0" />

                            {/* 4. Total Badge */}
                            <div className="w-12 flex flex-col items-center gap-0.5 shrink-0 ml-1">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                                <div className="w-8 h-7 flex items-center justify-center rounded-lg text-white font-black text-xs shadow-sm" style={{ backgroundColor: TYPE_COLORS.routes }}>
                                    {setter.total}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {isPrintMode && (
                <div className="text-center pt-8">
                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em]">Generated by SMaC Regional Dashboard</p>
                </div>
            )}
        </div>
    );
};

export default ProductionReportView;
