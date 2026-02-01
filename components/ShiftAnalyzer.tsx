import React, { useMemo, useState } from 'react';
import { Climb } from '../types';
import { processShiftAnalysis } from '../utils/analyticsEngine';

// Sub-components
import AnalyzerHeader from './analyzer/AnalyzerHeader';
import AnalyzerKPIs from './analyzer/AnalyzerKPIs';
import { BreakingPointChart, EfficiencyEvolutionChart, RhythmAnalyticsChart } from './analyzer/EfficiencyCharts';
import { CrewSizeDistribution, LaborProductionOverlay, ShiftTypeDistribution } from './analyzer/DistributionCharts';
import SynergyTable from './analyzer/SynergyTable';
import LaborSimulator from './analyzer/LaborSimulator';

import { useDashboardStore } from '../store/useDashboardStore';

const ShiftAnalyzer: React.FC = () => {
    const { climbData: data, dateRange, setDateRange } = useDashboardStore();
    const [selectedGym, setSelectedGym] = useState<string>('all');

    if (!data) return null;

    // 1. Process RAW data into Shift-Level Statistics
    const analysisData = useMemo(() => {
        return processShiftAnalysis(data, selectedGym, dateRange);
    }, [data, selectedGym, dateRange]);

    if (!analysisData || analysisData.totalShifts === 0) {
        return (
            <div className="h-full flex items-center justify-center p-20">
                <div className="text-center space-y-4">
                    <h3 className="text-2xl font-black text-[#00205B] uppercase tracking-tighter">Insufficient Data</h3>
                    <p className="text-slate-400 font-medium">Load more shifts or adjust filters to begin analysis.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
            <AnalyzerHeader
                data={data}
                dateRange={dateRange}
                setDateRange={setDateRange}
                selectedGym={selectedGym}
                setSelectedGym={setSelectedGym}
            />

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
        </div>
    );
};

export default ShiftAnalyzer;
