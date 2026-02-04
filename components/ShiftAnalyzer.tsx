import React, { useMemo } from 'react';
import { processShiftAnalysis } from '../utils/analyticsEngine';

// Sub-components
import UnifiedHeader from './UnifiedHeader';
import AnalyzerKPIs from './analyzer/AnalyzerKPIs';
import { BreakingPointChart, EfficiencyEvolutionChart, RhythmAnalyticsChart } from './analyzer/EfficiencyCharts';
import { CrewSizeDistribution, LaborProductionOverlay, ShiftTypeDistribution } from './analyzer/DistributionCharts';
import SynergyTable from './analyzer/SynergyTable';
import LaborSimulator from './analyzer/LaborSimulator';
import { getGymDisplayName } from '../constants/gyms';
import { Filter } from 'lucide-react';

import { useDashboardStore } from '../store/useDashboardStore';

const ShiftAnalyzer: React.FC = () => {
    const {
        climbData: data,
        selectedGyms,
        setSelectedGyms,
        dateRange,
        setDateRange,
        rangeOption,
        setRangeOption
    } = useDashboardStore();

    if (!data) return null;

    // Determine the active gym code for analysis
    const activeGymCode = useMemo(() => {
        if (selectedGyms.includes("Regional Overview") || selectedGyms.length === 0) {
            return 'all';
        }
        return selectedGyms[0]; // For now, Shift Analyzer focuses on one gym at a time or all
    }, [selectedGyms]);

    // 1. Process RAW data into Shift-Level Statistics
    const analysisData = useMemo(() => {
        return processShiftAnalysis(data, activeGymCode, dateRange);
    }, [data, activeGymCode, dateRange]);

    const reportTitle = useMemo(() => {
        if (activeGymCode === 'all') return "Regional Shift Analysis";
        return `${getGymDisplayName(activeGymCode)} Shift Analysis`;
    }, [activeGymCode]);

    if (!analysisData || analysisData.totalShifts === 0) {
        return (
            <div className="flex flex-col h-full bg-slate-100/80">
                <UnifiedHeader
                    title={reportTitle}
                    subtitle="Shift Analyzer"
                    dateRange={dateRange}
                    rangeOption={rangeOption}
                    onRangeOptionChange={setRangeOption}
                    onCustomDateChange={(start, end) => {
                        setRangeOption('custom');
                        setDateRange({ start, end });
                    }}
                />
                <div className="flex-1 flex items-center justify-center p-20">
                    <div className="text-center space-y-4">
                        <h3 className="text-2xl font-black text-[#00205B] uppercase tracking-tighter">Insufficient Data</h3>
                        <p className="text-slate-400 font-medium">Load more shifts or adjust filters to begin analysis.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-100/80 text-[#00205B] relative overflow-hidden">
            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#00205B 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

            <UnifiedHeader
                title={reportTitle}
                subtitle={`${analysisData.totalShifts} Shifts Analyzed`}
                dateRange={dateRange}
                rangeOption={rangeOption}
                onRangeOptionChange={setRangeOption}
                onCustomDateChange={(start, end) => {
                    setRangeOption('custom');
                    setDateRange({ start, end });
                }}
                actions={
                    <div className="flex items-center gap-3 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                        <Filter size={14} className="text-slate-400 ml-2" />
                        <select
                            value={activeGymCode}
                            onChange={(e) => setSelectedGyms([e.target.value === 'all' ? "Regional Overview" : e.target.value])}
                            className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-slate-700 focus:ring-0 cursor-pointer pr-8 py-1.5"
                        >
                            <option value="all">Regional Overview</option>
                            {Object.keys(data).map(code => (
                                <option key={code} value={code}>{getGymDisplayName(code)}</option>
                            ))}
                        </select>
                    </div>
                }
            />

            <main className="flex-1 p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 relative z-10 w-full">
                <AnalyzerKPIs analysisData={analysisData} />

                <BreakingPointChart analysisData={analysisData} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <CrewSizeDistribution analysisData={analysisData} />
                    <LaborProductionOverlay analysisData={analysisData} />
                    <SynergyTable analysisData={analysisData} />
                    <EfficiencyEvolutionChart analysisData={analysisData} />
                    <ShiftTypeDistribution analysisData={analysisData} />
                    <RhythmAnalyticsChart analysisData={analysisData} />
                    <LaborSimulator analysisData={analysisData} />
                </div>
            </main>
        </div>
    );
};

export default ShiftAnalyzer;
