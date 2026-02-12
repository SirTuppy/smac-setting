import React from 'react';
import { useDashboardStore } from '../store/useDashboardStore';
import { OrbitTarget } from '../types';
import { OrbitForecast } from '../utils/varianceAnalyzer';

interface Props {
    gymCode: string;
    orbitForecasts: OrbitForecast[];
}

const FutureHeatmap: React.FC<Props> = ({ gymCode, orbitForecasts }) => {
    const { orbitTargets } = useDashboardStore();
    const orbits = orbitTargets[gymCode] || [];

    // Helper to get color based on projected vs target
    const getWallStatusColor = (projected: number, target: number) => {
        const ratio = projected / target;
        if (ratio > 1.25) return 'bg-rose-500 shadow-rose-200';
        if (ratio > 1.0) return 'bg-amber-500 shadow-amber-200';
        return 'bg-emerald-500 shadow-emerald-200';
    };

    return (
        <div className="bg-white rounded-[2rem] p-10 shadow-2xl shadow-slate-200 border border-slate-100">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h2 className="text-2xl font-black text-[#00205B] uppercase tracking-tight">Future Heatmap</h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Predicted wall age based on current capacity</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {orbits.map((orbit: OrbitTarget) => {
                    const forecast = orbitForecasts.find(f => f.orbitName === orbit.orbitName);
                    const projected = forecast?.projectedWeeks || 0;
                    const target = forecast?.targetWeeks || 1;

                    return (
                        <div
                            key={orbit.id}
                            className="bg-slate-50 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all hover:scale-105"
                        >
                            <div className={`w-3 h-3 rounded-full mb-3 shadow-lg ${getWallStatusColor(projected, target)}`}></div>
                            <span className="text-[10px] font-black text-[#00205B] uppercase truncate w-full">{orbit.orbitName}</span>
                            <div className="mt-2 flex items-baseline gap-1">
                                <span className="text-lg font-black text-[#00205B]">{projected}</span>
                                <span className="text-[8px] font-bold text-slate-300 uppercase">Wks</span>
                            </div>
                        </div>
                    );
                })}

                {orbits.length === 0 && (
                    <div className="col-span-full py-12 text-center">
                        <p className="text-slate-300 text-xs font-bold uppercase tracking-[0.2em]">No Orbits defined for this gym</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FutureHeatmap;
