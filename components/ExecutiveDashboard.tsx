import React, { useMemo } from 'react';
import { TrendingUp, DollarSign, Clock, Target, AlertCircle, Info } from 'lucide-react';
import { useDashboardStore } from '../store/useDashboardStore';
import { GYMS } from '../constants/gyms';
import { aggregateProductionData } from '../utils/productionStats';

const ExecutiveDashboard: React.FC = () => {
    const {
        climbData,
        financialRecords,
        orbitTargets,
        selectedGyms,
        dateRange
    } = useDashboardStore();

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

            // Find relevant financial record for this period
            const finance = financialRecords.find(r => r.gymCode === gymCode);

            // Find targets
            const targets = orbitTargets[gymCode] || [];
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
        <div className="p-8 space-y-8 animate-in fade-in duration-1000">
            <div>
                <h1 className="text-3xl font-black text-[#00205B] tracking-tight">Executive Production Wage Dashboard</h1>
                <p className="text-slate-500 mt-1">Measuring the intersection of production output and payroll cost.</p>
            </div>

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
                        {(performanceData.reduce((sum, d) => sum + d.contributionRatio, 0) / (performanceData.length || 1)).toFixed(0)}%
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
                        {(performanceData.reduce((sum, d) => sum + d.hoursPerClimbActual, 0) / (performanceData.length || 1)).toFixed(1)}
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
                        ${(performanceData.reduce((sum, d) => sum + d.costPerClimb, 0) / (performanceData.length || 1)).toFixed(0)}
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
                            <th className="p-4 font-bold text-xs uppercase text-slate-400 text-center">Routes</th>
                            <th className="p-4 font-bold text-xs uppercase text-slate-400 text-center">Labor Hours</th>
                            <th className="p-4 font-bold text-xs uppercase text-slate-400 text-right">Payroll</th>
                            <th className="p-4 font-bold text-xs uppercase text-slate-400 text-center">Cost / Climb</th>
                            <th className="p-4 font-bold text-xs uppercase text-slate-400 text-center">Hrs / Climb</th>
                            <th className="p-4 font-bold text-xs uppercase text-slate-400 text-center">Contrib. Ratio</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {performanceData.map((data) => (
                            <tr key={data.gymCode} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-4 font-bold text-[#00205B]">{data.gymName}</td>
                                <td className="p-4 text-center font-medium">{data.bouldersSet}</td>
                                <td className="p-4 text-center font-medium">{data.routesSet}</td>
                                <td className="p-4 text-center font-medium">{data.actualHours.toFixed(0)}h</td>
                                <td className="p-4 text-right font-medium text-slate-500">${data.actualWages.toLocaleString()}</td>
                                <td className="p-4 text-center">
                                    <span className="font-bold text-[#00205B]">${data.costPerClimb.toFixed(0)}</span>
                                </td>
                                <td className="p-4 text-center">
                                    <span className="font-bold text-[#00205B]">{data.hoursPerClimbActual.toFixed(1)}h</span>
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
    );
};

export default ExecutiveDashboard;
