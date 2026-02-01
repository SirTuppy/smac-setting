import React, { useMemo, useRef, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { FileText, Users, Calendar, Award, Printer, Mail, BarChart2, LayoutDashboard } from 'lucide-react';
import { GYM_COLORS, TYPE_COLORS } from '../constants/colors';
import { Climb, ProductionStats, BaselineSettings } from '../types';
import { GYM_DISPLAY_NAMES } from '../constants/mapTemplates';
import { calculateProductionStats } from '../utils/analyticsEngine';

import { useDashboardStore } from '../store/useDashboardStore';
import ProductionReportView from './ProductionReportView';
import { exportToPDF } from '../utils/ModernPDFExport';
import UnifiedHeader from './UnifiedHeader';

const ProductionReport: React.FC = () => {
    const {
        climbData: data,
        selectedGyms,
        dateRange,
        setDateRange,
        rangeOption,
        setRangeOption,
        baselineSettings
    } = useDashboardStore();

    if (!data) return null;

    // 1. Core Analytics Logic
    const stats: ProductionStats = useMemo(() => {
        return calculateProductionStats(data, selectedGyms, dateRange);
    }, [data, selectedGyms, dateRange]);

    // For the subtitle count
    const totalClimbsCount = stats.total;

    const reportTitle = useMemo(() => {
        if (selectedGyms.includes("Regional Overview")) {
            return "Regional Production Report";
        }
        if (selectedGyms.length === 1) {
            const gymName = GYM_DISPLAY_NAMES[selectedGyms[0]] || selectedGyms[0];
            return `${gymName} Production Report`;
        }
        if (selectedGyms.length > 1) {
            return "Consolidated Production Report";
        }
        return "Production Report";
    }, [selectedGyms]);

    const reportRef = useRef<HTMLDivElement>(null);
    const [isSnapshotting, setIsSnapshotting] = useState(false);

    const handleModernExport = async () => {
        setIsSnapshotting(true);
        // Delay to allow Recharts to re-render without animations
        setTimeout(async () => {
            const exportIds = ['report-main-section'];
            if (baselineSettings.showReferencePage) {
                exportIds.push('report-baseline-section');
            }

            await exportToPDF(exportIds, `Production_Report_${new Date().toISOString().split('T')[0]}`);
            setIsSnapshotting(false);
        }, 100);
    };



    if (totalClimbsCount === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-20 animate-in fade-in duration-700">
                <div className="bg-white p-12 rounded-3xl shadow-2xl shadow-slate-200 flex flex-col items-center text-center max-w-md border border-slate-100">
                    <div className="bg-slate-50 p-4 rounded-2xl mb-6">
                        <Calendar size={48} className="text-slate-400" />
                    </div>
                    <h3 className="text-2xl font-black text-[#00205B] uppercase tracking-tight mb-3">No Production Data</h3>
                    <p className="text-slate-500 font-medium text-sm mb-8 leading-relaxed">
                        There are no climbs recorded for the selected date range and gyms. Try adjusting your filters.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-50 relative">
            <UnifiedHeader
                title={reportTitle}
                subtitle={`${totalClimbsCount} Production Records`}
                dateRange={dateRange}
                rangeOption={rangeOption}
                onRangeOptionChange={setRangeOption}
                onCustomDateChange={(start, end) => {
                    setRangeOption('custom');
                    setDateRange({ start, end });
                }}
                actions={
                    <button
                        id="tour-report-export"
                        onClick={handleModernExport}
                        disabled={isSnapshotting}
                        className="flex items-center gap-2 px-4 py-2 bg-[#009CA6] text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#007C85] transition-all shadow-md active:scale-95 disabled:opacity-50"
                    >
                        {isSnapshotting ? 'Generating...' : 'Export High-Res PDF'}
                    </button>
                }
            />

            <div className="flex-1 overflow-y-auto">
                <div id="production-report-content" className="p-4">
                    <ProductionReportView
                        stats={stats}
                        dateRange={dateRange}
                        reportTitle={reportTitle}
                        isPrintMode={isSnapshotting}
                        reportRef={reportRef}
                        baseline={baselineSettings}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProductionReport;
