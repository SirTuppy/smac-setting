import React from 'react';
import { FileText, Award } from 'lucide-react';
import { ProductionStats, BaselineSettings } from '../types';
import { ProductionSummaryCard, ShiftSummaryCard, TeamInsightsCard } from './report/KPICards';
import { DailyProductionChart, WeekdayDistributionChart } from './report/ProductionCharts';
import SetterProductionGrid from './report/SetterProductionGrid';
import SummarySection from './report/SummarySection';

interface ProductionReportViewProps {
    stats: ProductionStats;
    previousStats?: ProductionStats | null;
    comparisonMode?: 'none' | 'pop' | 'yoy';
    dateRange: { start: Date; end: Date };
    reportTitle: string;
    isPrintMode?: boolean;
    reportRef?: React.RefObject<HTMLDivElement | null>;
    baseline: BaselineSettings;
}

const ProductionReportView: React.FC<ProductionReportViewProps> = ({
    stats,
    previousStats,
    comparisonMode = 'none',
    dateRange,
    reportTitle,
    isPrintMode = false,
    reportRef,
    baseline
}) => {
    // Calculate date range scalar (normalized to weeks)
    const daysCount = Math.max(1, Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)));
    const weekScalar = daysCount / 7;

    const getPeriodDetails = () => {
        if (daysCount <= 7) return { label: 'WEEKLY', model: 'Target Week' };
        if (daysCount <= 14) return { label: 'BIWEEKLY', model: 'Biweekly' };
        if (daysCount <= 31) return { label: 'MONTHLY', model: 'Monthly' };
        if (daysCount <= 95) return { label: '90-DAY', model: '90-Day' };
        if (daysCount <= 185) return { label: '6-MONTH', model: '6-Month' };

        const isYTD = dateRange.start.getFullYear() === new Date().getFullYear() &&
            dateRange.start.getMonth() === 0 &&
            dateRange.start.getDate() === 1;

        if (isYTD) return { label: 'YTD', model: 'Year-to-Date' };
        if (daysCount > 366) return { label: 'ALL TIME', model: 'All Time' };
        return { label: 'ANNUAL', model: 'Annual' };
    };

    const period = getPeriodDetails();

    const renderReportLayout = (data: ProductionStats, isBaseline: boolean = false) => {
        // Only show comparison data on the main report, not the baseline reference page
        const compProps = (!isBaseline && comparisonMode !== 'none') ? {
            previousData: previousStats,
            comparisonMode
        } : {};

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ProductionSummaryCard data={data} isBaseline={isBaseline} baseline={baseline} weekScalar={weekScalar} {...compProps} />
                    <ShiftSummaryCard data={data} isBaseline={isBaseline} baseline={baseline} weekScalar={weekScalar} {...compProps} />
                    <TeamInsightsCard data={data} isBaseline={isBaseline} baseline={baseline} weekScalar={weekScalar} {...compProps} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <DailyProductionChart data={data} isBaseline={isBaseline} baseline={baseline} weekScalar={weekScalar} isPrintMode={isPrintMode} {...compProps} />
                    <WeekdayDistributionChart data={data} isBaseline={isBaseline} baseline={baseline} weekScalar={weekScalar} isPrintMode={isPrintMode} {...compProps} />
                </div>
            </div>
        );
    };

    const idealData: ProductionStats = {
        total: Math.round(baseline.totalVolumePerWeek * weekScalar),
        routes: Math.round(baseline.routesPerWeek * weekScalar),
        boulders: Math.round(baseline.bouldersPerWeek * weekScalar),
        totalShifts: Math.round(baseline.shiftsPerWeek * weekScalar),
        ropeShifts: Math.round((baseline.routesPerWeek / (baseline.totalVolumePerWeek || 1)) * (baseline.shiftsPerWeek * weekScalar)),
        boulderShifts: Math.round((baseline.bouldersPerWeek / (baseline.totalVolumePerWeek || 1)) * (baseline.shiftsPerWeek * weekScalar)),
        splitShifts: 0,
        setterData: [],
        dailyData: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => {
            const split = baseline.idealDailySplit?.find(s => s.day === i);
            const val = split ? (split.routes + split.boulders) * weekScalar : 0;
            return { dateKey: day, 'TARGET': Math.round(val) };
        }),
        weekdayData: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => {
            const split = baseline.idealDailySplit?.find(s => s.day === i);
            return {
                day,
                routes: split ? Math.round(split.routes * weekScalar) : 0,
                boulders: split ? Math.round(split.boulders * weekScalar) : 0,
                total: split ? Math.round((split.routes + split.boulders) * weekScalar) : 0
            };
        }),
        activeGymCodes: ['TARGET']
    };

    return (
        <div
            ref={reportRef}
            className={`mx-auto p-10 space-y-6 ${!isPrintMode ? 'max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-700' : 'bg-white'}`}
            style={isPrintMode ? { width: '1200px', margin: '0' } : {}}
        >
            <style>
                {`
                @media print {
                    .break-before-page {
                        break-before: page !important;
                        page-break-before: always !important;
                        display: block !important;
                        position: relative !important;
                        width: 100% !important;
                    }
                    .break-inside-avoid {
                        break-inside: avoid !important;
                        page-break-inside: avoid !important;
                    }
                }
                `}
            </style>

            <div id="report-main-section" className={isPrintMode ? 'bg-white p-[60px] w-[1200px]' : ''}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-4 relative">
                    <div>
                        <h1 className="text-4xl font-black text-[#00205B] uppercase tracking-tighter">{reportTitle}</h1>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">
                            {dateRange.start.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })} — {dateRange.end.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>

                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-3">
                            <p className="text-[14px] font-black text-[#009CA6] uppercase tracking-[0.2em]">SMaC Departmental Asset</p>
                            <div className="flex items-center justify-center p-1 bg-white/50 rounded-lg">
                                <img
                                    src={`${import.meta.env.BASE_URL}assets/justLogo.png`}
                                    className="w-12 h-12 object-contain"
                                    alt="Movement"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <SummarySection comments={baseline.reportComments} showSummary={baseline.showSummary} />

                <div className="mt-6">
                    {renderReportLayout(stats)}
                </div>

                <SetterProductionGrid setterData={stats.setterData} />
            </div>

            {baseline.showReferencePage && (
                <div id="report-baseline-section" className={`break-before-page pt-20 relative mt-20 ${isPrintMode ? 'bg-white p-[60px] w-[1200px]' : ''}`}>
                    {!isPrintMode && (
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                            <div className="bg-[#00205B] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                                End of Reported Data
                            </div>
                            <div className="w-0.5 h-10 bg-[#00205B]/10" />
                        </div>
                    )}

                    <div id="tour-baseline-reference" className="flex items-center gap-4 mb-12">
                        <div className="flex items-center justify-center p-2 bg-slate-50 rounded-2xl">
                            <img
                                src={`${import.meta.env.BASE_URL}assets/justLogo.png`}
                                className="w-12 h-12 object-contain"
                                alt="Movement"
                            />
                        </div>
                        <div>
                            <h2 className="text-4xl font-black text-[#00205B] uppercase tracking-tighter italic">Baseline Reference</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">
                                The "{period.model}" Model
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {renderReportLayout(idealData, true)}
                    </div>

                    <div className="bg-[#00205B] rounded-[40px] p-10 mt-12 text-white relative overflow-hidden shadow-2xl">
                        <div className="relative z-10">
                            <h3 className="text-sm font-black uppercase tracking-[0.3em] mb-6 opacity-40">Benchmark Philosophy</h3>
                            <p className="text-xl font-bold leading-relaxed mb-8">
                                These baselines serve as an operational North Star. They represent a "perfect world" of no time off, sickness, holidays, or other unforeseen circumstances. They also represent a pure production-oriented view of our setting capacity. Realistically, "$#!t happens", and it's increasingly important for us to make space for community engagement, professional development, and other essential activities that contribute to our overall success.
                            </p>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Reference Period</p>
                                <p className="text-2xl font-black">{daysCount} DAYS ({period.label})</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
            }

            {
                isPrintMode && (
                    <div className="text-center pt-8">
                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em]">SMaC Regional Dashboard</p>
                    </div>
                )
            }
        </div >
    );
};

export default ProductionReportView;
