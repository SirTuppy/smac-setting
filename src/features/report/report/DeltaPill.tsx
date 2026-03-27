import React from 'react';

interface DeltaPillProps {
    current: number;
    previous: number | undefined;
    mode: 'pop' | 'yoy' | 'none';
    reverse?: boolean; // If true, decrease is "good" (e.g. shifts)
}

const DeltaPill: React.FC<DeltaPillProps> = ({
    current,
    previous,
    mode,
    reverse = false
}) => {
    if (mode === 'none' || previous === undefined || previous === null) return null;

    const diff = current - previous;
    const percent = previous === 0 ? (current > 0 ? 100 : 0) : Math.round((diff / previous) * 100);
    const isPositive = diff >= 0;
    const isGood = reverse ? !isPositive : isPositive;
    const isNeutral = diff === 0;

    const bgColor = isNeutral ? 'bg-slate-100' : isGood ? 'bg-emerald-50' : 'bg-rose-50';
    const textColor = isNeutral ? 'text-slate-500' : isGood ? 'text-emerald-600' : 'text-rose-600';
    const symbol = isPositive ? '+' : '';
    const label = mode === 'pop' ? 'vs last period' : 'vs last year';

    return (
        <div className={`w-fit flex items-center gap-1.5 px-2 py-0.5 rounded-full ${bgColor} ${textColor} text-[10px] font-black uppercase tracking-tight shadow-sm border border-black/[0.03]`}>
            <span>{symbol}{percent}%</span>
            <span className="opacity-60 font-bold">{label}</span>
        </div>
    );
};

export default DeltaPill;
