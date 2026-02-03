import React from 'react';
import { Award, BarChart2, LayoutDashboard } from 'lucide-react';
import { ProductionStats } from '../../types';
import { TYPE_COLORS, GYM_COLORS } from '../../constants/colors';
import ComparisonPill from './ComparisonPill';
import DeltaPill from './DeltaPill';

interface KPICardProps {
    data: ProductionStats;
    previousData?: ProductionStats | null;
    comparisonMode?: 'none' | 'pop' | 'yoy';
    isBaseline?: boolean;
    baseline: any;
    weekScalar: number;
}

export const ProductionSummaryCard: React.FC<KPICardProps> = ({ data, previousData, comparisonMode, isBaseline, baseline, weekScalar }) => (
    <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group transition-all duration-500">
        <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Production Summary</p>
            <div className="flex items-center gap-3">
                <h3 className="text-5xl font-black text-[#00205B] tracking-tighter">{data.total}</h3>
                {!isBaseline && (
                    <div id="tour-comparison-pill">
                        <ComparisonPill
                            current={data.total}
                            target={baseline.totalVolumePerWeek * weekScalar}
                            showBaselines={baseline.showBaselines}
                        />
                    </div>
                )}
                {!isBaseline && comparisonMode !== 'none' && (
                    <DeltaPill
                        current={data.total}
                        previous={previousData?.total}
                        mode={comparisonMode!}
                    />
                )}
            </div>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider mb-4">Total Climbs Set</p>
            <div className="space-y-3 pt-4 border-t border-slate-50">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Rope Routes</span>
                        {!isBaseline && baseline.showBaselines && (
                            <ComparisonPill
                                current={data.routes}
                                target={baseline.routesPerWeek * weekScalar}
                                showBaselines={baseline.showBaselines}
                            />
                        )}
                        {!isBaseline && comparisonMode !== 'none' && (
                            <DeltaPill
                                current={data.routes}
                                previous={previousData?.routes}
                                mode={comparisonMode!}
                            />
                        )}
                    </div>
                    <span className="text-lg font-black" style={{ color: TYPE_COLORS.routes }}>{data.routes}</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Boulders</span>
                        {!isBaseline && baseline.showBaselines && (
                            <ComparisonPill
                                current={data.boulders}
                                target={baseline.bouldersPerWeek * weekScalar}
                                showBaselines={baseline.showBaselines}
                            />
                        )}
                        {!isBaseline && comparisonMode !== 'none' && (
                            <DeltaPill
                                current={data.boulders}
                                previous={previousData?.boulders}
                                mode={comparisonMode!}
                            />
                        )}
                    </div>
                    <span className="text-lg font-black" style={{ color: TYPE_COLORS.boulders }}>{data.boulders}</span>
                </div>
            </div>
        </div>
    </div>
);

export const ShiftSummaryCard: React.FC<KPICardProps> = ({ data, previousData, comparisonMode, isBaseline, baseline, weekScalar }) => (
    <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 transition-all duration-500">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Shift Summary</p>
        <div className="flex items-center gap-3">
            <h3 className="text-5xl font-black text-[#00205B] tracking-tighter">{data.totalShifts}</h3>
            {!isBaseline && baseline.showBaselines && (
                <ComparisonPill
                    current={data.totalShifts}
                    target={baseline.shiftsPerWeek * weekScalar}
                    reverse
                    showBaselines={baseline.showBaselines}
                />
            )}
            {!isBaseline && comparisonMode !== 'none' && (
                <DeltaPill
                    current={data.totalShifts}
                    previous={previousData?.totalShifts}
                    mode={comparisonMode!}
                    reverse
                />
            )}
        </div>
        <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider mb-4">Total Shifts Worked</p>
        <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100/50">
                <p className="text-[11px] font-black text-slate-400 uppercase mb-1">Rope</p>
                <p className="text-xl font-black" style={{ color: TYPE_COLORS.routes }}>{data.ropeShifts}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100/50">
                <p className="text-[11px] font-black text-slate-400 uppercase mb-1">Boulder</p>
                <p className="text-xl font-black" style={{ color: TYPE_COLORS.boulders }}>{data.boulderShifts}</p>
            </div>
        </div>
        <div className="mt-6 pt-4 border-t border-slate-50">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">
                1 Shift = Unique (Setter / Date / Gym)
            </p>
        </div>
    </div>
);

export const TeamInsightsCard: React.FC<KPICardProps> = ({ data, previousData, comparisonMode, isBaseline, baseline }) => (
    <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 transition-all duration-500">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Team Insights</p>
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="bg-amber-50 p-3 rounded-2xl shrink-0">
                    <Award className="text-amber-500" size={18} />
                </div>
                <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Top Producer</p>
                    <p className="text-sm font-black text-[#00205B]">
                        {data.setterData[0]?.name || 'N/A'}
                        {data.setterData[0] && <span className="text-[#009CA6] ml-2">({data.setterData[0].total})</span>}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="bg-emerald-50 p-3 rounded-2xl shrink-0">
                    <BarChart2 className="text-emerald-500" size={18} />
                </div>
                <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Regional Efficiency</p>
                    <p className="text-sm font-black text-[#00205B]">
                        {(data.total / (data.totalShifts || 1)).toFixed(1)}
                        <span className="text-[10px] text-slate-400 font-bold uppercase ml-2 tracking-widest">Avg Climbs / Shift</span>
                        {!isBaseline && baseline.showBaselines && (
                            <span className="inline-flex ml-2 align-middle">
                                <ComparisonPill
                                    current={Number((data.total / (data.totalShifts || 1)).toFixed(1))}
                                    target={Number((baseline.totalVolumePerWeek / (baseline.shiftsPerWeek || 1)).toFixed(1))}
                                    showBaselines={baseline.showBaselines}
                                />
                            </span>
                        )}
                        {!isBaseline && comparisonMode !== 'none' && (
                            <span className="inline-flex ml-2 align-middle">
                                <DeltaPill
                                    current={Number((data.total / (data.totalShifts || 1)).toFixed(1))}
                                    previous={previousData ? Number((previousData.total / (previousData.totalShifts || 1)).toFixed(1)) : undefined}
                                    mode={comparisonMode!}
                                />
                            </span>
                        )}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="bg-indigo-50 p-3 rounded-2xl shrink-0">
                    <LayoutDashboard className="text-indigo-500" size={18} />
                </div>
                <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Active Network</p>
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-black text-[#00205B]">{data.activeGymCodes.length} <span className="text-[8px] text-slate-400 font-black tracking-widest">LOCATIONS</span></p>
                        <span className="text-slate-200">•</span>
                        <p className="text-sm font-black text-[#00205B]">{data.setterData.length} <span className="text-[8px] text-slate-400 font-black tracking-widest">SETTERS</span></p>
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
            {data.activeGymCodes.filter(c => c !== 'TARGET').map(code => (
                <span key={code} className="px-3 py-1 rounded-full text-[8px] font-black uppercase text-white shadow-sm" style={{ backgroundColor: GYM_COLORS[code] || '#00205B' }}>
                    {code}
                </span>
            ))}
        </div>
    </div>
);
