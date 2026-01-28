import React from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

export type RangeOption = '7d' | '14d' | '30d' | '90d' | '180d' | 'ytd' | '1y' | 'all' | 'custom';

interface UnifiedHeaderProps {
    title: string;
    subtitle?: string;
    dateRange: { start: Date; end: Date };
    rangeOption: string;
    onRangeOptionChange: (option: RangeOption) => void;
    onCustomDateChange?: (start: Date, end: Date) => void;
    actions?: React.ReactNode;
}

const UnifiedHeader: React.FC<UnifiedHeaderProps> = ({
    title,
    subtitle,
    dateRange,
    rangeOption,
    onRangeOptionChange,
    onCustomDateChange,
    actions
}) => {
    return (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex flex-col md:flex-row justify-between items-center shadow-sm gap-4">
            <div className="flex items-center gap-4">
                <div className="flex flex-col">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#00205B] leading-none mb-1">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap justify-end">
                {/* Date Selection Group */}
                <div className="flex items-center gap-3">
                    <div id="tour-date-selector" className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
                        <Calendar className="text-[#009CA6] w-3.5 h-3.5 ml-2" />
                        <select
                            value={rangeOption}
                            onChange={(e) => onRangeOptionChange(e.target.value as RangeOption)}
                            className="bg-transparent border-none text-[#00205B] text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer pr-4 py-1"
                        >
                            <option value="7d">7 Days</option>
                            <option value="14d">14 Days</option>
                            <option value="30d">30 Days</option>
                            <option value="90d">90 Days</option>
                            <option value="180d">180 Days</option>
                            <option value="ytd">YTD</option>
                            <option value="all">All Time</option>
                            <option value="custom">Custom Range</option>
                        </select>
                    </div>

                    {rangeOption === 'custom' && onCustomDateChange ? (
                        <div id="tour-date-display" className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-sm animate-in fade-in slide-in-from-right-2 duration-300">
                            <input
                                type="date"
                                value={dateRange.start.toISOString().split('T')[0]}
                                onChange={(e) => onCustomDateChange(new Date(e.target.value), dateRange.end)}
                                className="bg-transparent border-none text-[10px] font-bold text-[#00205B] focus:outline-none w-24"
                            />
                            <span className="text-slate-300 text-[10px] font-bold">→</span>
                            <input
                                type="date"
                                value={dateRange.end.toISOString().split('T')[0]}
                                onChange={(e) => onCustomDateChange(dateRange.start, new Date(e.target.value))}
                                className="bg-transparent border-none text-[10px] font-bold text-[#00205B] focus:outline-none w-24"
                            />
                        </div>
                    ) : (
                        <div id="tour-date-display" className="text-[10px] font-black font-mono text-slate-400 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm whitespace-nowrap">
                            {dateRange.start.toLocaleDateString()} &mdash; {dateRange.end.toLocaleDateString()}
                        </div>
                    )}
                </div>

                {/* Actions Group (like PDF Export) */}
                {actions && (
                    <div className="flex items-center gap-2 border-l border-slate-200 pl-4 ml-2">
                        {actions}
                    </div>
                )}
            </div>
        </header>
    );
};

export default UnifiedHeader;
