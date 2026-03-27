import React, { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { BudgetExpense, BudgetCategory, GymBudgetConfig } from '../../../types';
import { formatCurrency } from '../utils';

interface GymHealthData {
    name: string;
    annualBudget: number;
    ytdSpend: number;
    remaining: number;
    pctBurned: number;
    paceStatus: 'on-track' | 'ahead' | 'over';
}

interface RegionalSnapshotProps {
    gymNames: string[];
    configs: Record<string, GymBudgetConfig>;
    expenses: BudgetExpense[];
    selectedYear: number;
    categories: BudgetCategory[];
    pctYearElapsed: number;
}

export const RegionalSnapshot: React.FC<RegionalSnapshotProps> = ({
    gymNames,
    configs,
    expenses,
    selectedYear,
    categories,
    pctYearElapsed
}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const gymData: GymHealthData[] = gymNames.map(name => {
        const cfg = configs[name] || { annualBudget: 0, categoryLimits: {} };
        const annualBudget = cfg.annualBudget || categories.reduce((sum, cat) => sum + (cfg.categoryLimits[cat.id] || 0), 0);
        const ytdSpend = expenses
            .filter(e => e.location === name && parseInt(e.date.split('-')[0], 10) === selectedYear)
            .reduce((sum, e) => sum + e.amount, 0);
        const remaining = annualBudget - ytdSpend;
        const pctBurned = annualBudget > 0 ? (ytdSpend / annualBudget) * 100 : 0;

        let paceStatus: 'on-track' | 'ahead' | 'over' = 'on-track';
        if (annualBudget > 0) {
            const burnRatio = pctBurned / pctYearElapsed;
            if (burnRatio > 1.15) paceStatus = 'over';
            else if (burnRatio < 0.85) paceStatus = 'ahead';
        }

        return { name, annualBudget, ytdSpend, remaining, pctBurned, paceStatus };
    }).filter(g => g.annualBudget > 0 || g.ytdSpend > 0);

    if (gymData.length === 0) return null;

    // Regional totals
    const totalBudget = gymData.reduce((s, g) => s + g.annualBudget, 0);
    const totalSpend = gymData.reduce((s, g) => s + g.ytdSpend, 0);
    const totalRemaining = totalBudget - totalSpend;
    const totalPctBurned = totalBudget > 0 ? (totalSpend / totalBudget) * 100 : 0;

    const getPaceIcon = (status: string) => {
        switch (status) {
            case 'ahead': return <TrendingDown size={14} className="text-sky-500" />;
            case 'over': return <TrendingUp size={14} className="text-rose-500" />;
            default: return <CheckCircle size={14} className="text-emerald-500" />;
        }
    };

    const getPaceLabel = (status: string) => {
        switch (status) {
            case 'ahead': return 'Under Pace';
            case 'over': return 'Over Pace';
            default: return 'On Track';
        }
    };

    const getBarColor = (pct: number) => {
        if (pct > 100) return 'bg-rose-500';
        if (pct > pctYearElapsed * 1.1) return 'bg-amber-500';
        return 'bg-emerald-500';
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-[#00205B]/5 to-transparent hover:from-[#00205B]/8 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <h3 className="text-sm font-black text-[#00205B] uppercase tracking-widest">Regional Gym Snapshot</h3>
                    <span className="text-xs font-bold text-slate-400">{gymData.length} gyms</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-6 text-xs font-bold text-slate-500">
                        <span>Budget: <span className="text-[#00205B]">{formatCurrency(totalBudget)}</span></span>
                        <span>Spent: <span className="text-[#00205B]">{formatCurrency(totalSpend)}</span></span>
                        <span className={totalRemaining >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                            Remaining: {formatCurrency(totalRemaining)}
                        </span>
                    </div>
                    {isCollapsed ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronUp size={18} className="text-slate-400" />}
                </div>
            </button>

            {/* Grid */}
            {!isCollapsed && (
                <div className="p-4 grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {gymData.map(gym => (
                        <div
                            key={gym.name}
                            className="rounded-xl border border-slate-100 p-4 hover:border-slate-200 hover:shadow-sm transition-all bg-slate-50/50"
                        >
                            {/* Gym Name + Pace */}
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-black text-[#00205B] tracking-tight">{gym.name}</h4>
                                <div className="flex items-center gap-1.5 text-xs font-bold">
                                    {getPaceIcon(gym.paceStatus)}
                                    <span className={
                                        gym.paceStatus === 'over' ? 'text-rose-600' :
                                        gym.paceStatus === 'ahead' ? 'text-sky-600' : 'text-emerald-600'
                                    }>{getPaceLabel(gym.paceStatus)}</span>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="space-y-1.5 text-xs mb-3">
                                <div className="flex justify-between">
                                    <span className="text-slate-400 font-medium">Budget</span>
                                    <span className="font-bold text-slate-600">{formatCurrency(gym.annualBudget)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400 font-medium">YTD Spend</span>
                                    <span className="font-bold text-[#00205B]">{formatCurrency(gym.ytdSpend)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400 font-medium">Remaining</span>
                                    <span className={`font-black ${gym.remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {formatCurrency(gym.remaining)}
                                    </span>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden relative">
                                {/* Year elapsed marker */}
                                <div
                                    className="absolute top-0 bottom-0 w-px bg-slate-400 z-10"
                                    style={{ left: `${Math.min(pctYearElapsed, 100)}%` }}
                                    title={`${pctYearElapsed.toFixed(0)}% of year elapsed`}
                                />
                                <div
                                    className={`h-2 rounded-full transition-all duration-500 ${getBarColor(gym.pctBurned)}`}
                                    style={{ width: `${Math.min(gym.pctBurned, 100)}%` }}
                                />
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1.5 font-medium text-right">
                                {gym.pctBurned.toFixed(1)}% spent
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
