import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend, LabelList, ReferenceLine } from 'recharts';
import { FileText, Users, Award, Printer, BarChart2, LayoutDashboard } from 'lucide-react';
import { GYM_DISPLAY_NAMES } from '../constants/mapTemplates';
import { GYM_COLORS, TYPE_COLORS } from '../constants/colors';
import { ProductionStats, SetterProduction, BaselineSettings } from '../types';

interface ProductionReportViewProps {
    stats: ProductionStats;
    dateRange: { start: Date; end: Date };
    reportTitle: string;
    isPrintMode?: boolean;
    reportRef?: React.RefObject<HTMLDivElement | null>;
    baseline: BaselineSettings;
}

const ProductionReportView: React.FC<ProductionReportViewProps> = ({
    stats,
    dateRange,
    reportTitle,
    isPrintMode = false,
    reportRef,
    baseline
}) => {
    // Calculate date range scalar (normalized to weeks)
    const daysCount = Math.max(1, Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)));
    const weekScalar = daysCount / 7;

    const getPeriodDetails = () => {
        if (daysCount <= 7) return { label: 'WEEKLY', model: 'Target Week' };
        if (daysCount <= 14) return { label: 'BIWEEKLY', model: 'Biweekly' };
        if (daysCount <= 31) return { label: 'MONTHLY', model: 'Monthly' };
        if (daysCount <= 95) return { label: '90-DAY', model: '90-Day' };
        if (daysCount <= 185) return { label: '6-MONTH', model: '6-Month' };

        const startOfYear = new Date(new Date().getFullYear(), 0, 1);
        // Check if start is start of current year (with some buffer for TZ/exactness)
        const isYTD = dateRange.start.getFullYear() === new Date().getFullYear() &&
            dateRange.start.getMonth() === 0 &&
            dateRange.start.getDate() === 1;

        if (isYTD) return { label: 'YTD', model: 'Year-to-Date' };
        if (daysCount > 366) return { label: 'ALL TIME', model: 'All Time' };
        return { label: 'ANNUAL', model: 'Annual' };
    };

    const period = getPeriodDetails();

    const ComparisonPill = ({ current, target, label = "", reverse = false, hide = false }: { current: number, target: number, label?: string, reverse?: boolean, hide?: boolean }) => {
        if (!target || !baseline.showBaselines || hide) return null;
        const diff = current - target;
        const percent = Math.round((diff / target) * 100);
        const isPositive = diff >= 0;
        const isGood = reverse ? !isPositive : isPositive;

        const bgColor = isGood ? 'bg-emerald-50' : 'bg-rose-50';
        const textColor = isGood ? 'text-emerald-600' : 'text-rose-600';
        const symbol = isPositive ? '+' : '';

        return (
            <div className={`w-fit flex items-center gap-1 px-1.5 py-0.5 rounded-full ${bgColor} ${textColor} text-[12px] font-bold uppercase tracking-tight mt-0.5`}>
                {symbol}{percent}% {label}
            </div>
        );
    };

    // EXACT MATCH REFACTOR: Reuseable layout function
    const renderReportLayout = (data: ProductionStats, isBaseline: boolean = false) => {
        return (
            <div className="space-y-6">
                {/* 3 Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* A. Production Summary */}
                    <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group transition-all duration-500">
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Production Summary</p>
                            <div className="flex items-center gap-3">
                                <h3 className="text-5xl font-black text-[#00205B] tracking-tighter">{data.total}</h3>
                                {!isBaseline && (
                                    <div id="tour-comparison-pill">
                                        <ComparisonPill current={data.total} target={baseline.totalVolumePerWeek * weekScalar} />
                                    </div>
                                )}
                            </div>
                            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider mb-4">Total Climbs Set</p>
                            <div className="space-y-3 pt-4 border-t border-slate-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Rope Routes</span>
                                        {!isBaseline && baseline.showBaselines && <ComparisonPill current={data.routes} target={baseline.routesPerWeek * weekScalar} />}
                                    </div>
                                    <span className="text-lg font-black" style={{ color: TYPE_COLORS.routes }}>{data.routes}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Boulders</span>
                                        {!isBaseline && baseline.showBaselines && <ComparisonPill current={data.boulders} target={baseline.bouldersPerWeek * weekScalar} />}
                                    </div>
                                    <span className="text-lg font-black" style={{ color: TYPE_COLORS.boulders }}>{data.boulders}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* B. Total Shifts */}
                    <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 transition-all duration-500">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Shift Summary</p>
                        <div className="flex items-center gap-3">
                            <h3 className="text-5xl font-black text-[#00205B] tracking-tighter">{data.totalShifts}</h3>
                            {!isBaseline && baseline.showBaselines && <ComparisonPill current={data.totalShifts} target={baseline.shiftsPerWeek * weekScalar} reverse />}
                        </div>
                        <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider mb-4">Total Shifts Worked</p>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100/50">
                                <p className="text-[11px] font-black text-slate-400 uppercase mb-1">Rope</p>
                                <p className="text-xl font-black" style={{ color: TYPE_COLORS.routes }}>{data.ropeShifts}</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100/50">
                                <p className="text-[11px] font-black text-slate-400 uppercase mb-1">Boulder</p>
                                <p className="text-xl font-black" style={{ color: TYPE_COLORS.boulders }}>{data.boulderShifts}</p>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-50">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">
                                1 Shift = Unique (Setter / Date / Gym)
                            </p>
                        </div>
                    </div>

                    {/* C. Team Insights */}
                    <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 transition-all duration-500">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Team Insights</p>
                        <div className="space-y-4">
                            {/* Top Producer */}
                            <div className="flex items-center gap-4">
                                <div className="bg-amber-50 p-3 rounded-2xl shrink-0">
                                    <Award className="text-amber-500" size={18} />
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Top Producer</p>
                                    <p className="text-sm font-black text-[#00205B]">
                                        {data.setterData[0]?.name || 'N/A'}
                                        {data.setterData[0] && <span className="text-[#009CA6] ml-2">({data.setterData[0].total})</span>}
                                    </p>
                                </div>
                            </div>

                            {/* Regional Efficiency */}
                            <div className="flex items-center gap-4">
                                <div className="bg-emerald-50 p-3 rounded-2xl shrink-0">
                                    <BarChart2 className="text-emerald-500" size={18} />
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Regional Efficiency</p>
                                    <p className="text-sm font-black text-[#00205B]">
                                        {(data.total / (data.totalShifts || 1)).toFixed(1)}
                                        <span className="text-[10px] text-slate-400 font-bold uppercase ml-2 tracking-widest">Avg Climbs / Shift</span>
                                        {!isBaseline && baseline.showBaselines && (
                                            <span className="inline-flex ml-2 align-middle">
                                                <ComparisonPill
                                                    current={Number((data.total / (data.totalShifts || 1)).toFixed(1))}
                                                    target={Number((baseline.totalVolumePerWeek / (baseline.shiftsPerWeek || 1)).toFixed(1))}
                                                />
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Active Network */}
                            <div className="flex items-center gap-4">
                                <div className="bg-indigo-50 p-3 rounded-2xl shrink-0">
                                    <LayoutDashboard className="text-indigo-500" size={18} />
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Active Network</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-black text-[#00205B]">{data.activeGymCodes.length} <span className="text-[8px] text-slate-400 font-black tracking-widest">LOCATIONS</span></p>
                                        <span className="text-slate-200">•</span>
                                        <p className="text-sm font-black text-[#00205B]">{data.setterData.length} <span className="text-[8px] text-slate-400 font-black tracking-widest">SETTERS</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Gym Bubbles */}
                        <div className="mt-6 flex flex-wrap gap-2">
                            {data.activeGymCodes.filter(c => c !== 'TARGET').map(code => (
                                <span key={code} className="px-3 py-1 rounded-full text-[8px] font-black uppercase text-white shadow-sm" style={{ backgroundColor: GYM_COLORS[code] || '#00205B' }}>
                                    {code}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 2 Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* A. Daily Total Breakdown */}
                    <div className="bg-white p-6 rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                        <div className="flex items-start justify-between mb-8">
                            <div className="flex-1">
                                <h3 className="text-xl font-black text-[#00205B] uppercase tracking-tight">Daily Production</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Output per gym across defined period</p>
                            </div>
                            {!isBaseline && baseline.showBaselines && (
                                <div className="text-right flex flex-col items-end">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Daily Volume</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-sm font-black text-[#00205B]">
                                            {(data.total / (data.dailyData.filter(d => Object.keys(d).some(k => k !== 'date' && k !== 'dateKey' && typeof d[k] === 'number' && d[k] > 0)).length || 1)).toFixed(1)}
                                        </span>
                                        <ComparisonPill
                                            current={data.total / (data.dailyData.filter(d => Object.keys(d).some(k => k !== 'date' && k !== 'dateKey' && typeof d[k] === 'number' && d[k] > 0)).length || 1)}
                                            target={baseline.totalVolumePerWeek / (baseline.settingDays?.length || 5)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.dailyData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="dateKey"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                        dy={8}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                        label={{ value: 'Climbs', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                    />
                                    <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }} />
                                    {data.activeGymCodes.map((gymCode, index) => (
                                        <Bar
                                            key={gymCode}
                                            dataKey={gymCode}
                                            stackId="a"
                                            barSize={30}
                                            fill={gymCode === 'TARGET' ? '#009CA6' : (GYM_COLORS[gymCode] || '#64748b')}
                                            radius={[4, 4, 4, 4]}
                                            isAnimationActive={!isPrintMode}
                                        />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* B. Weekday Type Distribution */}
                    <div className="bg-white p-6 rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                        <div className="flex items-start justify-between mb-8">
                            <div className="flex-1">
                                <h3 className="text-xl font-black text-[#00205B] uppercase tracking-tight">Weekday Distribution</h3>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Route vs Boulder production</p>
                            </div>
                            {!isBaseline && baseline.showBaselines && (
                                <div className="text-right flex flex-col items-end">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Volume Variance</p>
                                    <div className="flex gap-2">
                                        <ComparisonPill
                                            current={data.routes}
                                            target={baseline.routesPerWeek * weekScalar}
                                            label="Routes"
                                        />
                                        <ComparisonPill
                                            current={data.boulders}
                                            target={baseline.bouldersPerWeek * weekScalar}
                                            label="Boulders"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.weekdayData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#c8c9caff" />
                                    <XAxis
                                        type="number"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                                    />
                                    <YAxis
                                        dataKey="day"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                                        width={40}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }} />
                                    <Bar dataKey="routes" name="Routes" stackId="type" fill={TYPE_COLORS.routes} radius={[4, 0, 0, 4]} isAnimationActive={!isPrintMode}>
                                        {data.weekdayData.map((entry: any, index: number) => (
                                            <Cell key={`cell-r-${index}`} fill={TYPE_COLORS.routes} label={entry.routes > 0 ? { position: 'inside', fill: 'white', fontSize: 9, fontWeight: 900, formatter: (val: number) => `${val}R` } : false} />
                                        ))}
                                    </Bar>
                                    <Bar dataKey="boulders" name="Boulders" stackId="type" fill={TYPE_COLORS.boulders} radius={[0, 4, 4, 0]} isAnimationActive={!isPrintMode}>
                                        {data.weekdayData.map((entry: any, index: number) => (
                                            <Cell key={`cell-b-${index}`} fill={TYPE_COLORS.boulders} label={entry.boulders > 0 ? { position: 'inside', fill: 'white', fontSize: 9, fontWeight: 900, formatter: (val: number) => `${val}B` } : false} />
                                        ))}
                                        <LabelList dataKey="total" position="right" style={{ fill: '#00205B', fontSize: 10, fontWeight: 900 }} formatter={(val: number) => val > 0 ? `${val} Total` : ''} />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Ideal Stats for Baseline Reference
    const idealData: ProductionStats = {
        total: Math.round(baseline.totalVolumePerWeek * weekScalar),
        routes: Math.round(baseline.routesPerWeek * weekScalar),
        boulders: Math.round(baseline.bouldersPerWeek * weekScalar),
        totalShifts: Math.round(baseline.shiftsPerWeek * weekScalar),
        ropeShifts: Math.round((baseline.routesPerWeek / (baseline.totalVolumePerWeek || 1)) * (baseline.shiftsPerWeek * weekScalar)),
        boulderShifts: Math.round((baseline.bouldersPerWeek / (baseline.totalVolumePerWeek || 1)) * (baseline.shiftsPerWeek * weekScalar)),
        splitShifts: 0,
        setterData: [],
        dailyData: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => {
            const split = baseline.idealDailySplit?.find(s => s.day === i);
            const val = split ? (split.routes + split.boulders) * weekScalar : 0;
            return { dateKey: day, 'TARGET': Math.round(val) };
        }),
        weekdayData: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => {
            const split = baseline.idealDailySplit?.find(s => s.day === i);
            return {
                day,
                routes: split ? Math.round(split.routes * weekScalar) : 0,
                boulders: split ? Math.round(split.boulders * weekScalar) : 0,
                total: split ? Math.round((split.routes + split.boulders) * weekScalar) : 0
            };
        }),
        activeGymCodes: ['TARGET']
    };

    return (
        <div
            ref={reportRef}
            className={`mx-auto p-10 space-y-6 ${!isPrintMode ? 'max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-700' : 'bg-white'}`}
            style={isPrintMode ? { width: '1200px', margin: '0' } : {}}
        >
            <style>
                {`
                @media print {
                    .break-before-page {
                        break-before: page !important;
                        page-break-before: always !important;
                        display: block !important;
                        position: relative !important;
                        width: 100% !important;
                    }
                    .break-inside-avoid {
                        break-inside: avoid !important;
                        page-break-inside: avoid !important;
                    }
                }
                `}
            </style>

            <div id="report-main-section" className={isPrintMode ? 'bg-white p-[60px] w-[1200px]' : ''}>
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

                {/* Executive Summary / Head Setter Comments */}
                {baseline.reportComments && baseline.showSummary && (
                    <div id="tour-report-summary-view" className="bg-indigo-50/50 rounded-[32px] p-8 border-2 border-indigo-100/50 relative overflow-hidden mt-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-indigo-600 p-1.5 rounded-lg">
                                <FileText className="text-white" size={14} />
                            </div>
                            <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Head Setter Summary</h3>
                        </div>
                        <p className="text-sm font-bold text-[#00205B] leading-relaxed whitespace-pre-wrap relative z-10">
                            {baseline.reportComments}
                        </p>
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <FileText size={48} className="text-indigo-600" />
                        </div>
                    </div>
                )}

                {/* Main Stats and Charts */}
                <div className="mt-6">
                    {renderReportLayout(stats)}
                </div>

                {/* Setter Production Section */}
                <div className="bg-white rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden mt-8">
                    <div className="px-8 py-4 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-[#00205B] uppercase tracking-tight">Routesetter Production</h3>
                        </div>
                        <Award className="text-[#009CA6]/20" size={28} />
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {stats.setterData.map((setter: SetterProduction) => (
                            <div key={setter.name} className="flex items-center p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/50 transition-colors gap-2">
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
                                <div className="w-px h-8 bg-slate-300 shrink-0" />
                                <div className="flex-1 flex items-center justify-center gap-2 px-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Shifts</span>
                                    <span className="text-[11px] font-black text-[#00205B]">{setter.shifts}</span>
                                </div>
                                <div className="w-px h-8 bg-slate-300 shrink-0" />
                                <div className="flex-[3] flex items-center justify-center px-4">
                                    <span className="text-[12px] font-bold text-[#00205B] whitespace-nowrap">
                                        Routes: <span style={{ color: TYPE_COLORS.routes }} className="font-black">{setter.routes}</span>
                                        <span className="text-slate-300 mx-3">|</span>
                                        Boulders: <span style={{ color: TYPE_COLORS.boulders }} className="font-black">{setter.boulders}</span>
                                    </span>
                                </div>
                                <div className="w-px h-8 bg-slate-300 shrink-0" />
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
            </div>

            {/* Baseline Reference Section */}
            {baseline.showReferencePage && (
                <div id="report-baseline-section" className={`break-before-page pt-20 relative mt-20 ${isPrintMode ? 'bg-white p-[60px] w-[1200px]' : ''}`}>
                    {!isPrintMode && (
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                            <div className="bg-[#00205B] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                                End of Reported Data
                            </div>
                            <div className="w-0.5 h-10 bg-[#00205B]/10" />
                        </div>
                    )}

                    <div id="tour-baseline-reference" className="flex items-center gap-4 mb-12">
                        <div className="bg-emerald-600 p-4 rounded-[24px] shadow-xl">
                            <Award className="text-white" size={32} />
                        </div>
                        <div>
                            <h2 className="text-4xl font-black text-[#00205B] uppercase tracking-tighter italic">Baseline Reference</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">
                                The "{period.model}" Model
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {renderReportLayout(idealData, true)}
                    </div>

                    <div className="bg-[#00205B] rounded-[40px] p-10 mt-12 text-white relative overflow-hidden shadow-2xl">
                        <div className="relative z-10">
                            <h3 className="text-sm font-black uppercase tracking-[0.3em] mb-6 opacity-40">Benchmark Philosophy</h3>
                            <p className="text-xl font-bold leading-relaxed mb-8">
                                These baselines serve as an operational North Star. They represent a "perfect world" of no time off, sickness, holidays, or other unforeseen circumstances. They also represent a pure production-oriented view of our setting capacity. Realistically, "$#!t happens", and it's increasingly important for us to make space for community engagement, professional development, and other essential activities that contribute to our overall success.
                            </p>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Reference Period</p>
                                <p className="text-2xl font-black">{daysCount} DAYS ({period.label})</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isPrintMode && (
                <div className="text-center pt-8">
                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em]">Generated by SMaC Regional Dashboard</p>
                </div>
            )}
        </div>
    );
};

export default ProductionReportView;
