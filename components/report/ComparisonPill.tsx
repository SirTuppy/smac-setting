import React from 'react';

interface ComparisonPillProps {
    current: number;
    target: number;
    label?: string;
    reverse?: boolean;
    hide?: boolean;
    showBaselines: boolean;
}

const ComparisonPill: React.FC<ComparisonPillProps> = ({
    current,
    target,
    label = "",
    reverse = false,
    hide = false,
    showBaselines
}) => {
    if (!target || !showBaselines || hide) return null;

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

export default ComparisonPill;
