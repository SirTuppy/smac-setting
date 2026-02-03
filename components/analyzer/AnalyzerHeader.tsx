import React from 'react';
import { Zap, Calendar, Filter } from 'lucide-react';
import { getGymDisplayName } from '../../constants/gyms';
import { Climb } from '../../types';

interface AnalyzerHeaderProps {
    dateRange: { start: Date, end: Date };
    setDateRange: React.Dispatch<React.SetStateAction<{ start: Date, end: Date }>>;
    selectedGym: string;
    setSelectedGym: (gym: string) => void;
    data: Record<string, Climb[]>;
}

const AnalyzerHeader: React.FC<AnalyzerHeaderProps> = ({
    dateRange, setDateRange, selectedGym, setSelectedGym, data
}) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <h1 className="text-4xl font-black text-[#00205B] tracking-tight flex items-center gap-3">
                    <Zap className="text-[#009CA6]" size={36} />
                    SHIFT ANALYZER
                </h1>
                <p className="text-slate-500 font-medium mt-1">Deep-dive crew dynamics & efficiency benchmarks</p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                    <Calendar size={18} className="text-slate-400 ml-2" />
                    <input
                        type="date"
                        value={dateRange.start.toISOString().split('T')[0]}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: new Date(e.target.value) }))}
                        className="bg-transparent border-none text-xs font-bold text-slate-700 focus:ring-0"
                    />
                    <span className="text-slate-300">→</span>
                    <input
                        type="date"
                        value={dateRange.end.toISOString().split('T')[0]}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: new Date(e.target.value) }))}
                        className="bg-transparent border-none text-xs font-bold text-slate-700 focus:ring-0"
                    />
                </div>

                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                    <Filter size={18} className="text-slate-400 ml-2" />
                    <select
                        value={selectedGym}
                        onChange={(e) => setSelectedGym(e.target.value)}
                        className="bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 cursor-pointer pr-10"
                    >
                        <option value="all">All Gyms (Regional Overview)</option>
                        {Object.keys(data).map(code => (
                            <option key={code} value={code}>{getGymDisplayName(code)}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default AnalyzerHeader;
