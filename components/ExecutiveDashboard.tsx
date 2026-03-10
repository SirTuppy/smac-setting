import React, { useMemo } from 'react';
import { TrendingUp, DollarSign, Clock, Target, AlertCircle, Info, UploadCloud } from 'lucide-react';
import { useDashboardStore } from '../store/useDashboardStore';
import { GYMS } from '../constants/gyms';
import { aggregateProductionData, calculateStandardDeviation, getWeeklyCounts } from '../utils/productionStats';
import UnifiedHeader from './UnifiedHeader';
import { DataImportManager } from './DataImportManager';

const ExecutiveDashboard: React.FC = () => {
    const {
        climbData,
        financialRecords,
        orbitTargets,
        wallTargets,
        selectedGyms,
        dateRange,
        setDateRange,
        rangeOption,
        setRangeOption,
        execRegionFilter,
        execTierFilter,
        execPayPeriodFilter,
        setExecRegionFilter,
        setExecTierFilter,
        setExecPayPeriodFilter
    } = useDashboardStore();

    const handleExportMasterJSON = () => {
        const payload = { wallTargets, orbitTargets };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `master_national_targets_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    };

    const handleExportMasterCSV = () => {
        const headers = [
            "Gym", "Tier", "Avg Contrib. Ratio %", "Avg Density", "Density Var.",
            "Avg Weekly Prod.", "Prod. Var.", "Prod. Ratio %", "Proj. Rotation (w)",
            "Hrs. / Boulder", "Cost / Boulder ($)", "Std Dev"
        ];
        const rows = performanceData.map(d => [
            d.gymName,
            d.tier,
            d.contributionRatio.toFixed(0),
            d.targetDensity || '—',
            d.densityVariance.toFixed(1),
            d.avgWeeklyProduction.toFixed(1),
            d.productionVariance.toFixed(1),
            (d.productionRatio * 100).toFixed(0),
            d.rotation.toFixed(1),
            d.hoursPerClimbActual.toFixed(1),
            d.costPerClimb.toFixed(2),
            d.stdDevBoulders.toFixed(1)
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `national_production_master_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    // Calculate available filters from the data
    const availableRegions = useMemo(() => {
        const regions = new Set<string>();
        GYMS.forEach(g => { if (g.region) regions.add(g.region); });
        return Array.from(regions).sort();
    }, []);

    const availableTiers = useMemo(() => {
        const tiers = new Set<string>();
        GYMS.forEach(g => { if (g.tier) tiers.add(g.tier); });
        return Array.from(tiers).sort();
    }, []);

    const availablePayPeriods = useMemo(() => {
        if (!financialRecords.length) return [];
        const periods = new Set<string>();
        financialRecords.forEach(r => {
            if (r.payPeriodEnd) {
                // Format as short date like '2/6/2026'
                const d = new Date(r.payPeriodEnd);
                periods.add(`${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`);
            }
        });
        // Sort descending (newest first)
        return Array.from(periods).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    }, [financialRecords]);

    // 1. Filter performance data per gym
    const performanceData = useMemo(() => {
        if (!climbData) return [];

        const activeGyms = selectedGyms.includes('Regional Overview')
            ? Object.keys(climbData)
            : selectedGyms;

        // Apply global executive filters
        const filteredGyms = activeGyms.filter(gymCode => {
            const gymMeta = GYMS.find(g => g.code === gymCode);
            if (!gymMeta) return false;

            if (execRegionFilter !== 'All' && gymMeta.region !== execRegionFilter) return false;
            if (execTierFilter !== 'All' && gymMeta.tier !== execTierFilter) return false;
            return true;
        });

        return filteredGyms.map(gymCode => {
            const gymClimbs = climbData[gymCode] || [];

            // Filter climbs by current date range (The "Pay Period")
            const periodClimbs = gymClimbs.filter(c => {
                const date = new Date(c.dateSet);
                return date >= dateRange.start && date <= dateRange.end;
            });

            const stats = aggregateProductionData(periodClimbs);
            const boulderClimbs = periodClimbs.filter(c => !c.isRoute);
            const routeClimbs = periodClimbs.filter(c => c.isRoute);

            // Calculate "Setter-Shifts" for BPS (Boulders Per Setter-Shift)
            const setterShifts = new Set();
            boulderClimbs.forEach(c => {
                const dateKey = new Date(c.dateSet).toDateString();
                const names = c.setter.split(/[,&/]+/).map(s => s.trim());
                names.forEach(n => setterShifts.add(`${n}-${dateKey}`));
            });
            const bShiftCount = setterShifts.size || 1;
            const bps = stats.boulders / bShiftCount;

            // Find relevant financial record for this period
            const finance = financialRecords.find(r => r.gymCode === gymCode);

            // Find targets for Density and Rotation
            const targets = orbitTargets[gymCode] || [];
            const boulderTargets = targets.filter(t => t.discipline === 'Boulders');
            const routeTargets = targets.filter(t => t.discipline === 'Routes');

            const boulderClimbTarget = boulderTargets.reduce((sum, t) => sum + t.totalClimbs, 0);
            const routeClimbTarget = routeTargets.reduce((sum, t) => sum + t.totalClimbs, 0);

            // Rotation = Target / Weekly Production
            // Weekly Production = Period Production / (Days in Period / 7)
            const daysInPeriod = Math.max(1, (dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
            const weeksInPeriod = daysInPeriod / 7;

            const bRotation = boulderClimbTarget > 0 && stats.boulders > 0
                ? boulderClimbTarget / (stats.boulders / weeksInPeriod)
                : 0;

            const targetHoursPerClimb = targets.length > 0
                ? (targets.reduce((sum, t) => sum + (t.totalClimbs * t.hoursPerClimbGoal), 0) / targets.reduce((sum, t) => sum + t.totalClimbs, 0))
                : 2.0;

            const unitsProduced = stats.total * targetHoursPerClimb;
            const actualHours = finance?.totalHours || 0;
            const contributionRatio = actualHours > 0 ? (unitsProduced / actualHours) * 100 : 0;

            const hourlyRate = actualHours > 0 ? (finance?.totalWages || 0) / actualHours : 0;
            const targetHours = targets.reduce((sum, t) => sum + (t.payPeriodHoursGoal || 0), 0);
            const targetWages = targetHours * hourlyRate;

            const budgetVarHours = targetHours - actualHours;
            const budgetVarDollars = targetWages - (finance?.totalWages || 0);

            const gymMeta = GYMS.find(g => g.code === gymCode);

            // Replicating exact SHERLOCK final workbook rows
            // [G2] Average Weekly Production:
            const avgWeeklyProduction = stats.boulders / weeksInPeriod;

            // [H2] Production Variance:
            const weeklyBouldersTarget = boulderTargets.reduce((sum, t) => sum + (t.weeklyProductionGoal || 0), 0);
            const productionVariance = avgWeeklyProduction - weeklyBouldersTarget;

            // [I2] Production Ratio:
            const productionRatio = weeklyBouldersTarget > 0 ? avgWeeklyProduction / weeklyBouldersTarget : 0;

            // [M2] Standard Deviation:
            const stdDevBouldersRaw = getWeeklyCounts(boulderClimbs, dateRange.start, dateRange.end);
            const stdDevBoulders = calculateStandardDeviation(stdDevBouldersRaw);

            // [F2] Density Variance:
            // "The boulder average density minus target boulder density"
            // We approximate density from climbs set over time or use current snapshot, but here we can just pass the derived difference if we had starting snapshot.
            // For now, density = target + any accumulated variance? We'll log it as 0 if we don't have starting snapshots.
            const densityVariance = 0; // Requires Wall inventory snapshots

            return {
                gymCode,
                gymName: gymMeta?.name || gymCode,
                tier: gymMeta?.tier || '—',
                bouldersSet: stats.boulders,
                routesSet: stats.routes,
                bps,
                targetDensity: boulderClimbTarget,
                densityVariance,
                rotation: bRotation, // [J2] Projected Rotation
                totalClimbs: stats.total,
                actualHours,
                targetHours,
                actualWages: finance?.totalWages || 0,
                targetWages,
                budgetVarHours,
                budgetVarDollars,
                contributionRatio, // [B2]
                hoursPerClimbActual: stats.boulders > 0 ? actualHours / stats.boulders : 0, // [K2] Hrs/Boulder (using boulders per logic 'Hrs/Boulder')
                costPerClimb: stats.boulders > 0 ? (finance?.totalWages || 0) / stats.boulders : 0, // [L2] Cost/Boulder
                avgWeeklyProduction,
                productionVariance,
                productionRatio,
                stdDevBoulders
            };
        });
    }, [climbData, financialRecords, orbitTargets, selectedGyms, dateRange]);

    // 2. Calculate Comparison Data (Previous Period - PoP)
    const comparisonData = useMemo(() => {
        if (!climbData) return [];

        const duration = dateRange.end.getTime() - dateRange.start.getTime();
        const prevEnd = new Date(dateRange.start.getTime() - 1);
        const prevStart = new Date(prevEnd.getTime() - duration);

        const activeGyms = selectedGyms.includes('Regional Overview')
            ? Object.keys(climbData)
            : selectedGyms;

        // Apply global executive filters (identical to current data)
        const filteredGyms = activeGyms.filter(gymCode => {
            const gymMeta = GYMS.find(g => g.code === gymCode);
            if (!gymMeta) return false;

            if (execRegionFilter !== 'All' && gymMeta.region !== execRegionFilter) return false;
            if (execTierFilter !== 'All' && gymMeta.tier !== execTierFilter) return false;
            return true;
        });

        return filteredGyms.map(gymCode => {
            const gymClimbs = climbData[gymCode] || [];
            const periodClimbs = gymClimbs.filter(c => {
                const date = new Date(c.dateSet);
                return date >= prevStart && date <= prevEnd;
            });

            const stats = aggregateProductionData(periodClimbs);

            // Find financial records that fall within the previous period
            // This is an approximation if periods don't align perfectly
            const relevantFinancials = financialRecords.filter(r => {
                if (r.gymCode !== gymCode) return false;
                const rEnd = new Date(r.payPeriodEnd);
                const rStart = new Date(r.payPeriodStart);
                // Check for overlap or containment
                return rEnd >= prevStart && rStart <= prevEnd;
            });

            const totalHours = relevantFinancials.reduce((sum, r) => sum + r.totalHours, 0);
            const totalWages = relevantFinancials.reduce((sum, r) => sum + r.totalWages, 0);

            // Calculate metrics for previous period
            // Contribution needs target info, assuming targets haven't changed drastically
            // We use CURRENT targets as a proxy for past targets to see "Performance vs Current Standard"
            const targets = orbitTargets[gymCode] || [];
            const targetHoursPerClimb = targets.length > 0
                ? (targets.reduce((sum, t) => sum + (t.totalClimbs * t.hoursPerClimbGoal), 0) / targets.reduce((sum, t) => sum + t.totalClimbs, 0))
                : 2.0;

            const unitsProduced = stats.total * targetHoursPerClimb;
            const contributionRatio = totalHours > 0 ? (unitsProduced / totalHours) * 100 : 0;

            const hourlyRate = totalHours > 0 ? totalWages / totalHours : 0;
            const targetHours = targets.reduce((sum, t) => sum + (t.payPeriodHoursGoal || 0), 0);
            const targetWages = targetHours * hourlyRate;
            const budgetVarDollars = targetWages - totalWages;

            return {
                gymCode,
                totalClimbs: stats.total,
                actualHours: totalHours,
                actualWages: totalWages,
                budgetVarDollars,
                contributionRatio,
                hoursPerClimb: stats.total > 0 ? totalHours / stats.total : 0,
                costPerClimb: stats.total > 0 ? totalWages / stats.total : 0
            };
        });
    }, [climbData, selectedGyms, dateRange, financialRecords, orbitTargets]);

    const getTrend = (current: number, previous: number, inverse = false) => {
        if (previous === 0) return { val: '—', dir: 'neutral', pct: 0, isGood: true };
        const diff = current - previous;
        const pct = (diff / previous) * 100;
        const isPositive = inverse ? diff < 0 : diff > 0; // For Cost/Climb, lower is better (green)

        return {
            val: `${Math.abs(pct).toFixed(0)}%`,
            dir: diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral',
            isGood: isPositive,
            pct
        };
    };

    // Current Aggregates
    const curTotalHours = performanceData.reduce((sum, d) => sum + d.actualHours, 0);
    const curTotalClimbs = performanceData.reduce((sum, d) => sum + d.totalClimbs, 0);
    const curTotalWages = performanceData.reduce((sum, d) => sum + d.actualWages, 0);
    const curTotalBudgetVar = performanceData.reduce((sum, d) => sum + d.budgetVarDollars, 0);

    const curAvgContrib = performanceData.reduce((sum, d) => sum + (d.contributionRatio * d.actualHours), 0) / (curTotalHours || 1);
    const curEfficiency = curTotalHours / (curTotalClimbs || 1);
    const curCostPerClimb = curTotalWages / (curTotalClimbs || 1);

    // Previous Aggregates
    const prevTotalHours = comparisonData.reduce((sum, d) => sum + d.actualHours, 0);
    const prevTotalClimbs = comparisonData.reduce((sum, d) => sum + d.totalClimbs, 0);
    const prevTotalWages = comparisonData.reduce((sum, d) => sum + d.actualWages, 0);
    const prevTotalBudgetVar = comparisonData.reduce((sum, d) => sum + d.budgetVarDollars, 0);

    const prevAvgContrib = comparisonData.reduce((sum, d) => sum + (d.contributionRatio * d.actualHours), 0) / (prevTotalHours || 1);
    const prevEfficiency = prevTotalHours / (prevTotalClimbs || 1);
    const prevCostPerClimb = prevTotalWages / (prevTotalClimbs || 1);

    // Trends
    const trendContrib = getTrend(curAvgContrib, prevAvgContrib);
    const trendEff = getTrend(curEfficiency, prevEfficiency, true); // Lower is better
    const trendCost = getTrend(curCostPerClimb, prevCostPerClimb, true); // Lower is better
    const trendBudget = getTrend(curTotalBudgetVar, prevTotalBudgetVar);

    const renderTrend = (t: ReturnType<typeof getTrend>) => {
        if (t.dir === 'neutral') return null;

        // Colors: Good = Emerald, Bad = Rose, Neutral = Slate
        const colorClass = t.isGood ? 'text-emerald-500 bg-emerald-50' : 'text-rose-500 bg-rose-50';
        // Arrow rotation
        const rotation = t.dir === 'down' ? 'rotate-90' : '-rotate-90'; // Lucide TrendingUp points up-right by default. 
        // Let's use standard rotation. 0 is up-right. 
        // 45 deg? 
        // Actually, let's just use text colors and a simple arrow icon.

        return (
            <div className={`flex items-center gap-1 text-[10px] font-bold ${colorClass} px-2 py-1 rounded-full border border-black/5`}>
                <TrendingUp size={12} className={t.dir === 'down' ? 'rotate-90' : ''} />
                {t.val}
            </div>
        );
    };


    const getRatioColor = (ratio: number) => {
        if (ratio >= 75) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
        if (ratio >= 60) return 'text-amber-600 bg-amber-50 border-amber-100';
        return 'text-rose-600 bg-rose-50 border-rose-100';
    };

    const [showImporter, setShowImporter] = React.useState(false);

    // ... (keep existing handleExport functions)

    if (!climbData || showImporter) {
        return (
            <div className="flex flex-col h-full bg-slate-50 relative animate-in fade-in duration-500">
                <div className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200">
                    <h1 className="text-xl font-black text-[#00205B] uppercase tracking-tighter">
                        Data Aggregator
                    </h1>
                    {climbData && (
                        <button
                            onClick={() => setShowImporter(false)}
                            className="text-slate-400 hover:text-slate-600"
                        >
                            Cancel
                        </button>
                    )}
                </div>
                <div className="flex-1 p-12 flex flex-col items-center justify-center">
                    <div className="w-full max-w-4xl">
                        <DataImportManager onComplete={() => setShowImporter(false)} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-50 relative animate-in fade-in duration-1000">
            <div className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200">
                <UnifiedHeader
                    title="Executive Production Wage Dashboard"
                    subtitle={`${performanceData.length} Gyms | ${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`}
                    dateRange={dateRange}
                    rangeOption={rangeOption}
                    onRangeOptionChange={setRangeOption}
                    onCustomDateChange={(start, end) => {
                        setRangeOption('custom');
                        setDateRange({ start, end });
                    }}
                />
                <div id="tour-national-exports" className="flex items-center gap-2">
                    <button
                        onClick={() => setShowImporter(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-black uppercase text-[10px] tracking-widest hover:border-[#00205B] hover:text-[#00205B] transition-all shadow-sm"
                    >
                        <UploadCloud size={14} /> Import Data
                    </button>
                    <button
                        onClick={handleExportMasterCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-black uppercase text-[10px] tracking-widest hover:border-[#00205B] hover:text-[#00205B] transition-all shadow-sm"
                    >
                        <DollarSign size={14} /> Master CSV
                    </button>
                    <button
                        onClick={handleExportMasterJSON}
                        className="flex items-center gap-2 px-4 py-2 bg-[#00205B] text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-opacity-90 transition-all shadow-lg active:scale-95"
                    >
                        <Target size={14} /> Save Master Targets
                    </button>
                </div>
            </div>

            {/* Filter Bar / Slicers */}
            <div className="px-8 py-4 bg-white border-b border-slate-200 flex flex-wrap items-center gap-6 text-xs font-bold text-slate-600">
                <div className="flex flex-col gap-1.5">
                    <span className="uppercase text-[9px] tracking-widest text-slate-400">Gym Tier</span>
                    <div className="flex gap-1">
                        <button
                            onClick={() => setExecTierFilter('All')}
                            className={`px-3 py-1.5 rounded-lg border transition-all ${execTierFilter === 'All' ? 'bg-[#00205B] text-white border-[#00205B]' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'}`}
                        >
                            All
                        </button>
                        {availableTiers.map(t => (
                            <button
                                key={t}
                                onClick={() => setExecTierFilter(t)}
                                className={`px-3 py-1.5 rounded-lg border transition-all ${execTierFilter === t ? 'bg-[#00205B] text-white border-[#00205B]' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-10 w-px bg-slate-100 hidden md:block" />

                <div className="flex flex-col gap-1.5">
                    <span className="uppercase text-[9px] tracking-widest text-slate-400">Region</span>
                    <select
                        value={execRegionFilter}
                        onChange={(e) => setExecRegionFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none text-[#00205B] focus:border-[#00205B] transition-colors font-bold min-w-[140px]"
                    >
                        <option value="All">All Regions</option>
                        {availableRegions.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>

                <div className="h-10 w-px bg-slate-100 hidden md:block" />

                <div className="flex flex-col gap-1.5 flex-1 min-w-[300px]">
                    <span className="uppercase text-[9px] tracking-widest text-slate-400">Paycheck Date Selection</span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                        <button
                            onClick={() => setExecPayPeriodFilter('All')}
                            className={`shrink-0 px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${execPayPeriodFilter === 'All' ? 'bg-brand-yellow text-[#00205B] border-brand-yellow' : 'bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300'}`}
                        >
                            Manual Range
                        </button>
                        {availablePayPeriods.slice(0, 8).map(p => (
                            <button
                                key={p}
                                onClick={() => {
                                    setExecPayPeriodFilter(p);
                                    const endDate = new Date(p);
                                    endDate.setHours(23, 59, 59, 999);
                                    const startDate = new Date(endDate.getTime() - (13 * 24 * 60 * 60 * 1000));
                                    startDate.setHours(0, 0, 0, 0);
                                    setRangeOption('custom');
                                    setDateRange({ start: startDate, end: endDate });
                                }}
                                className={`shrink-0 px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${execPayPeriodFilter === p ? 'bg-brand-yellow text-[#00205B] border-brand-yellow' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-8 flex-1 overflow-y-auto space-y-8">

                {/* High Level Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-brand-yellow/10 rounded-lg text-brand-yellow">
                                <TrendingUp size={20} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-500 text-xs uppercase tracking-widest">Avg Contribution</h3>
                            </div>
                            {renderTrend(trendContrib)}
                        </div>
                        <p className="text-4xl font-black text-[#00205B]">
                            {(performanceData.reduce((sum, d) => sum + (d.contributionRatio * d.actualHours), 0) / (performanceData.reduce((sum, d) => sum + d.actualHours, 0) || 1)).toFixed(0)}%
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                <Clock size={20} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-500 text-xs uppercase tracking-widest">Efficiency (Hrs/Climb)</h3>
                            </div>
                            {renderTrend(trendEff)}
                        </div>
                        <p className="text-4xl font-black text-[#00205B]">
                            {(performanceData.reduce((sum, d) => sum + d.actualHours, 0) / (performanceData.reduce((sum, d) => sum + d.totalClimbs, 0) || 1)).toFixed(1)}
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                <DollarSign size={20} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-500 text-xs uppercase tracking-widest">Avg Cost/Climb</h3>
                            </div>
                            {renderTrend(trendCost)}
                        </div>
                        <p className="text-4xl font-black text-[#00205B]">
                            ${(performanceData.reduce((sum, d) => sum + d.actualWages, 0) / (performanceData.reduce((sum, d) => sum + d.totalClimbs, 0) || 1)).toFixed(0)}
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                <DollarSign size={20} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-500 text-xs uppercase tracking-widest">Budget Variance</h3>
                            </div>
                            {renderTrend(trendBudget)}
                        </div>
                        <p className={`text-4xl font-black ${curTotalBudgetVar >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {curTotalBudgetVar >= 0 ? '+' : '-'}${Math.abs(curTotalBudgetVar).toFixed(0)}
                        </p>
                    </div>
                </div>

                {/* Detail Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-200">
                                <th className="p-4 font-bold text-xs uppercase text-slate-400">Gym</th>
                                <th className="p-4 font-bold text-xs uppercase text-slate-400 text-center">Avg Contrib. Ratio</th>
                                <th className="p-4 font-bold text-xs uppercase text-slate-400 text-center">Avg Density</th>
                                <th className="p-4 font-bold text-xs uppercase text-slate-400 text-center">Density Var.</th>
                                <th className="p-4 font-bold text-xs uppercase text-slate-400 text-center">Avg Weekly Prod.</th>
                                <th className="p-4 font-bold text-xs uppercase text-slate-400 text-center">Prod. Var.</th>
                                <th className="p-4 font-bold text-xs uppercase text-slate-400 text-center">Prod. Ratio</th>
                                <th className="p-4 font-bold text-xs uppercase text-slate-400 text-center">Proj. Rotation</th>
                                <th className="p-4 font-bold text-xs uppercase text-slate-400 text-center">Hrs. / Boulder</th>
                                <th className="p-4 font-bold text-xs uppercase text-slate-400 text-center">Cost / Boulder</th>
                                <th className="p-4 font-bold text-xs uppercase text-slate-400 text-center">Std Dev</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {performanceData.map((data) => (
                                <tr key={data.gymCode} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-[#00205B]">{data.gymName}</div>
                                        <div className="text-xs text-slate-400 uppercase font-black tracking-widest">{data.tier}</div>
                                    </td>
                                    {/* Avg Contrib. Ratio */}
                                    <td className="p-4 text-center">
                                        <div className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-black ${getRatioColor(data.contributionRatio)}`}>
                                            {data.contributionRatio.toFixed(0)}%
                                        </div>
                                    </td>
                                    {/* Avg Density (Target) */}
                                    <td className="p-4 text-center font-medium">{data.targetDensity || '—'}</td>
                                    {/* Density Var */}
                                    <td className="p-4 text-center">
                                        <span className={`font-medium ${data.densityVariance > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {data.densityVariance === 0 ? '—' : (data.densityVariance > 0 ? '+' : '') + data.densityVariance}
                                        </span>
                                    </td>
                                    {/* Avg Weekly Prod */}
                                    <td className="p-4 text-center">
                                        <span className="font-bold text-[#00205B]">{data.avgWeeklyProduction.toFixed(1)}</span>
                                    </td>
                                    {/* Prod Var */}
                                    <td className="p-4 text-center">
                                        <span className={`font-bold ${data.productionVariance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {data.productionVariance >= 0 ? '+' : ''}{data.productionVariance.toFixed(1)}
                                        </span>
                                    </td>
                                    {/* Prod Ratio */}
                                    <td className="p-4 text-center">
                                        <span className="text-slate-500 font-medium">{(data.productionRatio * 100).toFixed(0)}%</span>
                                    </td>
                                    {/* Proj Rotation */}
                                    <td className="p-4 text-center">
                                        <span className="text-slate-500 font-medium">{data.rotation > 0 ? `${data.rotation.toFixed(1)}` : '—'}</span>
                                    </td>
                                    {/* Hrs / Boulder */}
                                    <td className="p-4 text-center">
                                        <span className="font-bold text-[#00205B]">{data.hoursPerClimbActual.toFixed(1)}</span>
                                    </td>
                                    {/* Cost / Boulder */}
                                    <td className="p-4 text-center">
                                        <span className="font-bold text-[#00205B]">${data.costPerClimb.toFixed(2)}</span>
                                    </td>
                                    {/* Std Dev */}
                                    <td className="p-4 text-center">
                                        <span className="text-slate-400 font-black tracking-widest text-xs">{data.stdDevBoulders > 0 ? data.stdDevBoulders.toFixed(1) : '—'}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Disclaimer */}
                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex gap-4">
                    <Info size={24} className="text-blue-500 shrink-0" />
                    <div className="text-sm text-blue-900 leading-relaxed">
                        <p className="font-bold mb-1">How is the Contribution Ratio calculated?</p>
                        The ratio measures the percentage of clocked payroll hours that resulted in "Units of Production."
                        Units are weighted using the targeted <strong>Hours Per Climb</strong> from the All Orbits Log.
                        A ratio &lt; 100% accounts for hold washing, forerunning, maintenance, and administrative tasks.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExecutiveDashboard;
