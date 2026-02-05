import React from 'react';
import { Target, Zap, Layers, ChevronRight } from 'lucide-react';
import { ShiftAnalysisResult } from '../../utils/analyticsEngine';
import { useDashboardStore } from '../../store/useDashboardStore';

interface WallPerformanceProps {
    analysisData: ShiftAnalysisResult;
}

const WallPerformance: React.FC<WallPerformanceProps> = ({ analysisData }) => {
    const { wallTargets, selectedGyms, climbData } = useDashboardStore();

    const activeGymCode = React.useMemo(() => {
        if (selectedGyms.includes("Regional Overview") || selectedGyms.length === 0) {
            return Object.keys(climbData || {})[0] || '';
        }
        return selectedGyms[0];
    }, [selectedGyms, climbData]);

    const targets = wallTargets[activeGymCode] || {};
    const wallStats = analysisData.wallStats;

    // Separate walls by type
    const groupedWalls = React.useMemo(() => {
        const ropes: string[] = [];
        const boulders: string[] = [];
        const allWalls = new Set([...Object.keys(targets), ...Object.keys(wallStats)]);

        Array.from(allWalls).forEach(wall => {
            const target = targets[wall];
            // If target exists, use its type. Otherwise, guess.
            const type = target?.type || (wall.toLowerCase().includes('boulder') ? 'boulder' : 'rope');
            if (type === 'rope') ropes.push(wall);
            else boulders.push(wall);
        });

        const sortFn = (a: string, b: string) => (wallStats[b]?.totalClimbs || 0) - (wallStats[a]?.totalClimbs || 0);
        return { ropes: ropes.sort(sortFn), boulders: boulders.sort(sortFn) };
    }, [targets, wallStats, activeGymCode]);

    if (groupedWalls.ropes.length === 0 && groupedWalls.boulders.length === 0) return null;

    const renderWallCard = (wall: string) => {
        const actual = wallStats[wall] || { totalClimbs: 0, avgEfficiency: 0 };
        const target = targets[wall] || { targetCount: 0, targetClimbsPerSetter: 4.0, type: wall.toLowerCase().includes('boulder') ? 'boulder' : 'rope' };

        const volPercent = target.targetCount > 0 ? (actual.totalClimbs / target.targetCount) * 100 : 0;
        const effPercent = target.targetClimbsPerSetter > 0 ? (actual.avgEfficiency / target.targetClimbsPerSetter) * 100 : 0;

        return (
            <div key={wall} className="group bg-slate-50/50 rounded-2xl p-5 border border-transparent hover:border-slate-200 hover:bg-white transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-black uppercase shadow-sm ${target.type === 'rope' ? 'bg-[#00205B]' : 'bg-[#009CA6]'}`}>
                            {wall.charAt(0)}
                        </div>
                        <span className="font-black uppercase tracking-tight text-sm text-[#00205B] truncate max-w-[150px]">{wall}</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                </div>

                <div className="space-y-4">
                    {/* Volume Progress */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-end">
                            <div className="flex items-center gap-1.5 text-slate-400">
                                <Layers size={10} />
                                <span className="text-[9px] font-black uppercase tracking-widest">Volume Status</span>
                            </div>
                            <span className="text-[11px] font-black text-[#00205B]">
                                {actual.totalClimbs} <span className="text-slate-300 text-[9px]">/ {target.targetCount || '—'}</span>
                            </span>
                        </div>
                        <div className="h-2 bg-slate-200/50 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#00205B] transition-all duration-1000 ease-out"
                                style={{ width: `${Math.min(100, volPercent)}%` }}
                            />
                        </div>
                    </div>

                    {/* Efficiency Progress */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-end">
                            <div className="flex items-center gap-1.5 text-slate-400">
                                <Zap size={10} />
                                <span className="text-[9px] font-black uppercase tracking-widest">Efficiency</span>
                            </div>
                            <span className="text-[11px] font-black text-[#009CA6]">
                                {actual.avgEfficiency.toFixed(1)} <span className="text-slate-200 text-[9px]">/ {target.targetClimbsPerSetter.toFixed(1)}</span>
                            </span>
                        </div>
                        <div className="h-1 bg-slate-200/50 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#009CA6] transition-all duration-1000 ease-out"
                                style={{ width: `${Math.min(100, effPercent)}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-[#00205B]/5 p-2 rounded-xl">
                        <Target size={20} className="text-[#00205B]" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-[#00205B] uppercase tracking-tighter">Wall Performance</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Actual vs. Target benchmarks</p>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                {groupedWalls.ropes.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <div className="w-1 h-3 bg-[#00205B] rounded-full" />
                            <p className="text-[10px] font-black text-[#00205B]/40 uppercase tracking-[0.2em]">Rope Walls</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {groupedWalls.ropes.map(renderWallCard)}
                        </div>
                    </div>
                )}

                {groupedWalls.boulders.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <div className="w-1 h-3 bg-[#009CA6] rounded-full" />
                            <p className="text-[10px] font-black text-[#009CA6]/40 uppercase tracking-[0.2em]">Bouldering Walls</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {groupedWalls.boulders.map(renderWallCard)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WallPerformance;
