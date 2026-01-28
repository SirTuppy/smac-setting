import React, { useMemo, useRef, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { FileText, Users, Calendar, Award, Printer, Mail, BarChart2, LayoutDashboard } from 'lucide-react';
import { GYM_COLORS, TYPE_COLORS } from '../constants/colors';
import { Climb, ProductionStats } from '../types';
import { GYM_DISPLAY_NAMES } from '../constants/mapTemplates';

interface ProductionReportProps {
    data: Record<string, Climb[]>;
    selectedGyms: string[];
    dateRange: { start: Date; end: Date };
    onDateRangeChange: (range: { start: Date; end: Date }) => void;
    baselineSettings: BaselineSettings;
}

import { BaselineSettings } from '../types';



import ProductionReportView from './ProductionReportView';
import { exportToPDF } from '../utils/ModernPDFExport';
import UnifiedHeader, { RangeOption } from './UnifiedHeader';

const ProductionReport: React.FC<ProductionReportProps> = ({ data, selectedGyms, dateRange, onDateRangeChange, baselineSettings }) => {
    const [rangeOption, setRangeOption] = useState<RangeOption>('14d');
    // 1. Filter and Flat data
    const filteredClimbs = useMemo(() => {
        const gymsToProcess = selectedGyms.includes("Regional Overview")
            ? Object.keys(data)
            : selectedGyms;

        return gymsToProcess.flatMap(gym => {
            const gClimbs = data[gym] || [];
            return gClimbs.map(c => ({
                ...c,
                gymCode: gym,
                localDate: new Date(c.dateSet) // Use this for filtering
            }));
        }).filter(climb => {
            // Create date boundaries without time for fair comparison
            const start = new Date(dateRange.start);
            start.setHours(0, 0, 0, 0);
            const end = new Date(dateRange.end);
            end.setHours(23, 59, 59, 999);

            return climb.localDate >= start && climb.localDate <= end;
        });
    }, [data, selectedGyms, dateRange]);

    // 2. Aggregate Stats
    const stats: ProductionStats = useMemo(() => {
        const total = filteredClimbs.length;
        const routes = filteredClimbs.filter(c => c.isRoute).length;
        const boulders = total - routes;

        // Shift & Setter Tracking
        const setterMap: Record<string, { total: number; routes: number; boulders: number; gyms: Set<string>; shifts: number }> = {};

        // Track unique shifts: setter_date_gym
        const shiftMap: Record<string, { type: 'rope' | 'boulder' | 'split' }> = {};

        filteredClimbs.forEach(c => {
            const d = c.localDate;
            const dateKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            const names = c.setter.split(',').map(s => s.trim());

            names.forEach(name => {
                if (!setterMap[name]) setterMap[name] = { total: 0, routes: 0, boulders: 0, gyms: new Set(), shifts: 0 };
                setterMap[name].total++;
                setterMap[name].gyms.add(c.gymCode);
                if (c.isRoute) setterMap[name].routes++;
                else setterMap[name].boulders++;

                // Detailed Shift Tracking
                const shiftKey = `${name}_${dateKey}_${c.gymCode}`;
                if (!shiftMap[shiftKey]) {
                    shiftMap[shiftKey] = { type: c.isRoute ? 'rope' : 'boulder' };
                    setterMap[name].shifts++;
                } else {
                    const currentType = shiftMap[shiftKey].type;
                    if ((currentType === 'rope' && !c.isRoute) || (currentType === 'boulder' && c.isRoute)) {
                        shiftMap[shiftKey].type = 'split';
                    }
                }
            });
        });

        const setterData = Object.entries(setterMap)
            .map(([name, s]) => ({ name, ...s, gymCodes: Array.from(s.gyms).join(', ') }))
            .sort((a, b) => b.total - a.total);

        // Global Shift Stats
        const totalShifts = Object.keys(shiftMap).length;
        const ropeShifts = Object.values(shiftMap).filter(s => s.type === 'rope').length;
        const boulderShifts = Object.values(shiftMap).filter(s => s.type === 'boulder').length;
        const splitShifts = Object.values(shiftMap).filter(s => s.type === 'split').length;

        // Daily Production (Gym Breakdown) chronologically
        const dailyMap: Record<string, { date: Date, dateKey: string, [gymCode: string]: Date | string | number }> = {};
        const weekdayMap: Record<string, { day: string, routes: number, boulders: number, total: number }> = {
            'Mon': { day: 'Mon', routes: 0, boulders: 0, total: 0 },
            'Tue': { day: 'Tue', routes: 0, boulders: 0, total: 0 },
            'Wed': { day: 'Wed', routes: 0, boulders: 0, total: 0 },
            'Thu': { day: 'Thu', routes: 0, boulders: 0, total: 0 },
            'Fri': { day: 'Fri', routes: 0, boulders: 0, total: 0 },
            'Sat': { day: 'Sat', routes: 0, boulders: 0, total: 0 },
            'Sun': { day: 'Sun', routes: 0, boulders: 0, total: 0 }
        };

        filteredClimbs.forEach(c => {
            const d = c.localDate;
            const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const dispKey = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            const weekKey = d.toLocaleDateString(undefined, { weekday: 'short' });

            if (!dailyMap[dateKey]) {
                dailyMap[dateKey] = { date: d, dateKey: dispKey };
            }
            dailyMap[dateKey][c.gymCode] = ((dailyMap[dateKey][c.gymCode] as number) || 0) + 1;

            weekdayMap[weekKey].total++;
            if (c.isRoute) weekdayMap[weekKey].routes++;
            else weekdayMap[weekKey].boulders++;
        });

        const dailyData = Object.values(dailyMap).sort((a, b) => a.date.getTime() - b.date.getTime());
        const weekdayData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => weekdayMap[day]);

        return {
            total, routes, boulders,
            totalShifts, ropeShifts, boulderShifts, splitShifts,
            setterData, dailyData, weekdayData,
            activeGymCodes: Array.from(new Set(filteredClimbs.map(c => c.gymCode)))
        };
    }, [filteredClimbs]);

    // 3. Range Sync
    const { minDate, maxDate } = useMemo(() => {
        const allClimbs = Object.values(data).flat() as Climb[];
        if (allClimbs.length === 0) return { minDate: new Date(), maxDate: new Date() };
        const dates = allClimbs.map(c => new Date(c.dateSet).getTime());
        return {
            minDate: new Date(Math.min(...dates)),
            maxDate: new Date(Math.max(...dates))
        };
    }, [data]);

    useEffect(() => {
        if (rangeOption === 'custom') return;

        const end = new Date(maxDate);
        let start = new Date(maxDate);

        switch (rangeOption) {
            case '7d': start.setDate(maxDate.getDate() - 7); break;
            case '14d': start.setDate(maxDate.getDate() - 14); break;
            case '30d': start.setDate(maxDate.getDate() - 30); break;
            case '90d': start.setDate(maxDate.getDate() - 90); break;
            case '180d': start.setDate(maxDate.getDate() - 180); break;
            case 'ytd': start = new Date(maxDate.getFullYear(), 0, 1); break;
            case '1y': start.setFullYear(maxDate.getFullYear() - 1); break;
            case 'all': start = new Date(minDate); break;
        }

        onDateRangeChange({ start, end });
    }, [rangeOption, minDate, maxDate]);

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



    if (filteredClimbs.length === 0) {
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
                subtitle={`${filteredClimbs.length} Production Records`}
                dateRange={dateRange}
                rangeOption={rangeOption}
                onRangeOptionChange={setRangeOption}
                onCustomDateChange={(start, end) => {
                    setRangeOption('custom');
                    onDateRangeChange({ start, end });
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
