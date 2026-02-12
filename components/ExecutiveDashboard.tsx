import React, { useMemo } from 'react';
import { TrendingUp, DollarSign, Clock, Target, AlertCircle, Info } from 'lucide-react';
import { useDashboardStore } from '../store/useDashboardStore';
import { GYMS } from '../constants/gyms';
import { aggregateProductionData } from '../utils/productionStats';
import UnifiedHeader from './UnifiedHeader';

const ExecutiveDashboard: React.FC = () => {
    const {
        climbData,
        financialRecords,
        orbitTargets,
        wallTargets,
        selectedGyms,
        dateRange,
        setDateRange,
        rangeOption,
        setRangeOption
    } = useDashboardStore();

    const handleExportMasterJSON = () => {
        const payload = { wallTargets, orbitTargets };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `master_national_targets_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    };

    const handleExportMasterCSV = () => {
        const headers = ["Gym", "Boulders Produced", "BPS", "Rotation (w)", "Density (Total Climbs)", "Routes Produced", "Cost/Climb ($)", "Contribution Ratio %"];
        const rows = performanceData.map(d => [
            d.gymName,
            d.bouldersSet,
            d.bps.toFixed(2),
            d.rotation.toFixed(1),
            d.density,
            d.routesSet,
            d.costPerClimb.toFixed(2),
            d.contributionRatio.toFixed(0)
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `national_production_master_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    // 1. Filter performance data per gym
    const performanceData = useMemo(() => {
        if (!climbData) return [];

        const activeGyms = selectedGyms.includes('Regional Overview')
            ? Object.keys(climbData)
            : selectedGyms;

        return activeGyms.map(gymCode => {
            const gymClimbs = climbData[gymCode] || [];

            // Filter climbs by current date range (The "Pay Period")
            const periodClimbs = gymClimbs.filter(c => {
                const date = new Date(c.dateSet);
                return date >= dateRange.start && date <= dateRange.end;
            });

            const stats = aggregateProductionData(periodClimbs);
            const boulderClimbs = periodClimbs.filter(c => !c.isRoute);
            const routeClimbs = periodClimbs.filter(c => c.isRoute);

            // Calculate "Setter-Shifts" for BPS (Boulders Per Setter-Shift)
            const setterShifts = new Set();
            boulderClimbs.forEach(c => {
                const dateKey = new Date(c.dateSet).toDateString();
                const names = c.setter.split(/[,&/]+/).map(s => s.trim());
                names.forEach(n => setterShifts.add(`${n}-${dateKey}`));
            });
            const bShiftCount = setterShifts.size || 1;
            const bps = stats.boulders / bShiftCount;

            // Find relevant financial record for this period
            const finance = financialRecords.find(r => r.gymCode === gymCode);

            // Find targets for Density and Rotation
            const targets = orbitTargets[gymCode] || [];
            const boulderTargets = targets.filter(t => t.discipline === 'Boulders');
            const routeTargets = targets.filter(t => t.discipline === 'Routes');

            const boulderClimbTarget = boulderTargets.reduce((sum, t) => sum + t.totalClimbs, 0);
            const routeClimbTarget = routeTargets.reduce((sum, t) => sum + t.totalClimbs, 0);

            // Rotation = Target / Weekly Production
            // Weekly Production = Period Production / (Days in Period / 7)
            const daysInPeriod = Math.max(1, (dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
            const weeksInPeriod = daysInPeriod / 7;

            const bRotation = boulderClimbTarget > 0 && stats.boulders > 0
                ? boulderClimbTarget / (stats.boulders / weeksInPeriod)
                : 0;

            const targetHoursPerClimb = targets.length > 0
                ? (targets.reduce((sum, t) => sum + (t.totalClimbs * t.hoursPerClimbGoal), 0) / targets.reduce((sum, t) => sum + t.totalClimbs, 0))
                : 2.0;

            const unitsProduced = stats.total * targetHoursPerClimb;
            const actualHours = finance?.totalHours || 0;
            const contributionRatio = actualHours > 0 ? (unitsProduced / actualHours) * 100 : 0;

            const gymMeta = GYMS.find(g => g.code === gymCode);

            return {
                gymCode,
                gymName: gymMeta?.name || gymCode,
                bouldersSet: stats.boulders,
                routesSet: stats.routes,
                bps,
                density: boulderClimbTarget,
                rotation: bRotation,
                totalClimbs: stats.total,
                actualHours,
                actualWages: finance?.totalWages || 0,
                contributionRatio,
                hoursPerClimbActual: stats.total > 0 ? actualHours / stats.total : 0,
                costPerClimb: stats.total > 0 ? (finance?.totalWages || 0) / stats.total : 0,
            };
        });
    }, [climbData, financialRecords, orbitTargets, selectedGyms, dateRange]);

    const getRatioColor = (ratio: number) => {
        if (ratio >= 75) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
        if (ratio >= 60) return 'text-amber-600 bg-amber-50 border-amber-100';
        return 'text-rose-600 bg-rose-50 border-rose-100';
    };

    if (!climbData) {
        return (
            <div className="flex flex-col items-center justify-center p-24 text-slate-400">
                <AlertCircle size={48} className="mb-4 opacity-20" />
                <p className="text-xl font-medium">Upload Kaya Data to view Executive Dashboard</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-50 relative animate-in fade-in duration-1000">
            <div className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200">
                <UnifiedHeader
                    title="Executive Production Wage Dashboard"
                    subtitle={`${performanceData.length} Gyms | ${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`}
                    dateRange={dateRange}
                    rangeOption={rangeOption}
                    onRangeOptionChange={setRangeOption}
                    onCustomDateChange={(start, end) => {
                        setRangeOption('custom');
                        setDateRange({ start, end });
                    }}
                />
                <div id="tour-national-exports" className="flex items-center gap-2">
                    <button
                        onClick={handleExportMasterCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-black uppercase text-[10px] tracking-widest hover:border-[#00205B] hover:text-[#00205B] transition-all shadow-sm"
                    >
                        <DollarSign size={14} /> Master CSV
                    </button>
                    <button
                        onClick={handleExportMasterJSON}
                        className="flex items-center gap-2 px-4 py-2 bg-[#00205B] text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-opacity-90 transition-all shadow-lg active:scale-95"
                    >
                        <Target size={14} /> Save Master Targets
                    </button>
                </div>
            </div>

            <div className="p-8 flex-1 overflow-y-auto space-y-8">

                {/* High Level Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-brand-yellow/10 rounded-lg text-brand-yellow">
                                <TrendingUp size={20} />
                            </div>
                            <h3 className="font-bold text-slate-500 text-xs uppercase tracking-widest">Avg Contribution</h3>
                        </div>
                        <p className="text-4xl font-black text-[#00205B]">
                            {(performanceData.reduce((sum, d) => sum + (d.contributionRatio * d.actualHours), 0) / (performanceData.reduce((sum, d) => sum + d.actualHours, 0) || 1)).toFixed(0)}%
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                <Clock size={20} />
                            </div>
                            <h3 className="font-bold text-slate-500 text-xs uppercase tracking-widest">Efficiency (Hrs/Climb)</h3>
                        </div>
                        <p className="text-4xl font-black text-[#00205B]">
                            {(performanceData.reduce((sum, d) => sum + d.actualHours, 0) / (performanceData.reduce((sum, d) => sum + d.totalClimbs, 0) || 1)).toFixed(1)}
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                <DollarSign size={20} />
                            </div>
                            <h3 className="font-bold text-slate-500 text-xs uppercase tracking-widest">Avg Cost/Climb</h3>
                        </div>
                        <p className="text-4xl font-black text-[#00205B]">
                            ${(performanceData.reduce((sum, d) => sum + d.actualWages, 0) / (performanceData.reduce((sum, d) => sum + d.totalClimbs, 0) || 1)).toFixed(0)}
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-slate-50 rounded-lg text-slate-600">
                                <Target size={20} />
                            </div>
                            <h3 className="font-bold text-slate-500 text-xs uppercase tracking-widest">Active Orbits</h3>
                        </div>
                        <p className="text-4xl font-black text-[#00205B]">
                            {Object.values(orbitTargets).flat().length}
                        </p>
                    </div>
                </div>

                {/* Detail Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-200">
                                <th className="p-4 font-bold text-xs uppercase text-slate-400">Gym</th>
                                <th className="p-4 font-bold text-xs uppercase text-slate-400 text-center">Boulders</th>
                                <th className="p-4 font-bold text-xs uppercase text-slate-400 text-center">BPS</th>
                                <th className="p-4 font-bold text-xs uppercase text-slate-400 text-center">Rotation</th>
                                <th className="p-4 font-bold text-xs uppercase text-slate-400 text-center">Total Climbs</th>
                                <th className="p-4 font-bold text-xs uppercase text-slate-400 text-center">Routes</th>
                                <th className="p-4 font-bold text-xs uppercase text-slate-400 text-center">Cost / Climb</th>
                                <th className="p-4 font-bold text-xs uppercase text-slate-400 text-center">Contrib. Ratio</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {performanceData.map((data) => (
                                <tr key={data.gymCode} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4 font-bold text-[#00205B]">{data.gymName}</td>
                                    <td className="p-4 text-center font-medium">{data.bouldersSet}</td>
                                    <td className="p-4 text-center">
                                        <span className="font-bold text-[#00205B]">{data.bps.toFixed(1)}</span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="text-slate-500 font-medium">{data.rotation > 0 ? `${data.rotation.toFixed(1)}w` : '—'}</span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="text-slate-500 font-medium">{data.density || '—'}</span>
                                    </td>
                                    <td className="p-4 text-center font-medium">{data.routesSet}</td>
                                    <td className="p-4 text-center">
                                        <span className="font-bold text-[#00205B]">${data.costPerClimb.toFixed(0)}</span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-black ${getRatioColor(data.contributionRatio)}`}>
                                            {data.contributionRatio.toFixed(0)}%
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Disclaimer */}
                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex gap-4">
                    <Info size={24} className="text-blue-500 shrink-0" />
                    <div className="text-sm text-blue-900 leading-relaxed">
                        <p className="font-bold mb-1">How is the Contribution Ratio calculated?</p>
                        The ratio measures the percentage of clocked payroll hours that resulted in "Units of Production."
                        Units are weighted using the targeted <strong>Hours Per Climb</strong> from the All Orbits Log.
                        A ratio &lt; 100% accounts for hold washing, forerunning, maintenance, and administrative tasks.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExecutiveDashboard;
