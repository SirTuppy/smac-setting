import React from 'react';
import { TrendingUp, DollarSign, Gauge, Target, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { formatCurrency } from '../utils';

interface BudgetHealthBannerProps {
    annualBudget: number;
    ytdSpend: number;
    monthsElapsed: number;
    pctYearElapsed: number;
    selectedYear: number;
    isCurrentYear: boolean;
}

export const BudgetHealthBanner: React.FC<BudgetHealthBannerProps> = ({
    annualBudget,
    ytdSpend,
    monthsElapsed,
    pctYearElapsed,
    selectedYear,
    isCurrentYear
}) => {
    const burnRate = monthsElapsed > 0 ? ytdSpend / monthsElapsed : 0;
    const projectedYearEnd = burnRate * 12;
    const remaining = annualBudget - ytdSpend;
    const pctSpent = annualBudget > 0 ? (ytdSpend / annualBudget) * 100 : 0;

    // Pace: compare % spent vs % of year elapsed
    const paceRatio = pctYearElapsed > 0 ? pctSpent / pctYearElapsed : 0;
    let paceStatus: 'under' | 'on-track' | 'over' = 'on-track';
    if (paceRatio > 1.1) paceStatus = 'over';
    else if (paceRatio < 0.9) paceStatus = 'under';

    const paceConfig = {
        'under': {
            label: 'Under Budget',
            color: 'text-sky-600',
            bg: 'bg-sky-50 border-sky-100',
            icon: <ArrowDownRight size={16} className="text-sky-500" />,
            ringColor: '#0ea5e9'
        },
        'on-track': {
            label: 'On Track',
            color: 'text-emerald-600',
            bg: 'bg-emerald-50 border-emerald-100',
            icon: <Minus size={16} className="text-emerald-500" />,
            ringColor: '#10b981'
        },
        'over': {
            label: 'Over Pace',
            color: 'text-rose-600',
            bg: 'bg-rose-50 border-rose-100',
            icon: <ArrowUpRight size={16} className="text-rose-500" />,
            ringColor: '#f43f5e'
        }
    };

    const pace = paceConfig[paceStatus];

    // Circular gauge for pace
    const gaugeRadius = 28;
    const gaugeCircumference = 2 * Math.PI * gaugeRadius;
    const gaugeFill = Math.min(pctSpent, 100);
    const gaugeOffset = gaugeCircumference - (gaugeFill / 100) * gaugeCircumference;

    // Projection variance
    const projVariance = annualBudget > 0 ? ((projectedYearEnd - annualBudget) / annualBudget) * 100 : 0;

    const cards = [
        {
            label: 'Monthly Burn Rate',
            value: formatCurrency(burnRate),
            sublabel: isCurrentYear ? `${monthsElapsed} months elapsed` : '12 months',
            icon: <Gauge size={18} className="text-[#00205B]" />,
            accent: 'border-l-[#00205B]'
        },
        {
            label: 'Projected Year-End',
            value: formatCurrency(projectedYearEnd),
            sublabel: annualBudget > 0
                ? `${projVariance >= 0 ? '+' : ''}${projVariance.toFixed(1)}% vs budget`
                : 'No budget set',
            icon: <TrendingUp size={18} className={projVariance > 10 ? 'text-rose-500' : projVariance < -10 ? 'text-sky-500' : 'text-emerald-500'} />,
            accent: projVariance > 10 ? 'border-l-rose-400' : projVariance < -10 ? 'border-l-sky-400' : 'border-l-emerald-400',
            highlight: projVariance > 10 ? 'text-rose-600' : projVariance < -10 ? 'text-sky-600' : ''
        },
        {
            label: 'Remaining Budget',
            value: formatCurrency(remaining),
            sublabel: annualBudget > 0
                ? `${(100 - pctSpent).toFixed(1)}% left`
                : 'No budget set',
            icon: <DollarSign size={18} className={remaining >= 0 ? 'text-emerald-500' : 'text-rose-500'} />,
            accent: remaining >= 0 ? 'border-l-emerald-400' : 'border-l-rose-400',
            highlight: remaining < 0 ? 'text-rose-600' : ''
        }
    ];

    if (annualBudget <= 0) return null;

    return (
        <div className="grid grid-cols-4 gap-4">
            {cards.map((card, i) => (
                <div
                    key={i}
                    className={`bg-white rounded-xl border border-slate-200 border-l-4 ${card.accent} p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.label}</span>
                        {card.icon}
                    </div>
                    <div className={`text-xl font-black text-[#00205B] ${card.highlight || ''}`}>
                        {card.value}
                    </div>
                    <div className="text-[11px] font-medium text-slate-400 mt-1">{card.sublabel}</div>
                </div>
            ))}

            {/* Pace Gauge Card */}
            <div className={`rounded-xl border ${pace.bg} p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow`}>
                <div className="relative flex-shrink-0">
                    <svg width="68" height="68" viewBox="0 0 68 68">
                        {/* Background ring */}
                        <circle
                            cx="34" cy="34" r={gaugeRadius}
                            fill="none"
                            stroke="#e2e8f0"
                            strokeWidth="5"
                        />
                        {/* Year elapsed marker ring */}
                        <circle
                            cx="34" cy="34" r={gaugeRadius}
                            fill="none"
                            stroke="#cbd5e1"
                            strokeWidth="5"
                            strokeDasharray={gaugeCircumference}
                            strokeDashoffset={gaugeCircumference - (Math.min(pctYearElapsed, 100) / 100) * gaugeCircumference}
                            strokeLinecap="round"
                            transform="rotate(-90 34 34)"
                            opacity="0.4"
                        />
                        {/* Spend progress ring */}
                        <circle
                            cx="34" cy="34" r={gaugeRadius}
                            fill="none"
                            stroke={pace.ringColor}
                            strokeWidth="5"
                            strokeDasharray={gaugeCircumference}
                            strokeDashoffset={gaugeOffset}
                            strokeLinecap="round"
                            transform="rotate(-90 34 34)"
                            className="transition-all duration-700"
                        />
                        <text x="34" y="32" textAnchor="middle" className="text-xs font-black fill-slate-700">
                            {pctSpent.toFixed(0)}%
                        </text>
                        <text x="34" y="42" textAnchor="middle" className="text-[8px] font-bold fill-slate-400">
                            spent
                        </text>
                    </svg>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Budget Pace</span>
                    <div className={`text-lg font-black ${pace.color} flex items-center gap-1.5`}>
                        {pace.icon}
                        {pace.label}
                    </div>
                    <div className="text-[11px] font-medium text-slate-400 mt-0.5">
                        {pctYearElapsed.toFixed(0)}% of year elapsed
                    </div>
                </div>
            </div>
        </div>
    );
};
