import React, { useState } from 'react';
import { Sparkles, Zap } from 'lucide-react';
import { ShiftAnalysisResult } from '../../utils/analyticsEngine';

interface LaborSimulatorProps {
    analysisData: ShiftAnalysisResult;
}

const LaborSimulator: React.FC<LaborSimulatorProps> = ({ analysisData }) => {
    const [modelerCrewSize, setModelerCrewSize] = useState<number>(4);
    const [modelerMode, setModelerMode] = useState<'boulder' | 'rope' | 'split'>('split');

    const getPrediction = () => {
        let ropes = 0, boulders = 0, eff = 0;

        if (modelerMode === 'boulder') {
            eff = analysisData.predictors.boulder(modelerCrewSize);
            boulders = eff * modelerCrewSize;
        } else if (modelerMode === 'rope') {
            eff = analysisData.predictors.rope(modelerCrewSize);
            ropes = eff * modelerCrewSize;
        } else {
            eff = analysisData.predictors.split(modelerCrewSize);
            const total = eff * modelerCrewSize;
            ropes = total * 0.4;
            boulders = total * 0.6;
        }
        return { total: ropes + boulders, ropes, boulders, eff };
    };

    const prediction = getPrediction();

    return (
        <div className="bg-[#00205B] p-10 rounded-[3rem] shadow-2xl border border-white/10 col-span-1 lg:col-span-2 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                <Sparkles size={160} className="text-[#009CA6]" />
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-center">
                <div className="flex-1 space-y-8">
                    <div>
                        <span className="bg-[#009CA6]/20 text-[#009CA6] text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-[#009CA6]/20">Predictive Intelligence</span>
                        <h2 className="text-3xl font-black text-white mt-4 tracking-tight">Labor Planning Simulator</h2>
                        <p className="text-slate-400 font-medium mt-2 max-w-md">Forecast production capacity based on historical {modelerMode} shift performance.</p>
                    </div>

                    <div className="flex bg-white/5 p-1 rounded-2xl w-fit border border-white/10">
                        {(['boulder', 'rope', 'split'] as const).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setModelerMode(mode)}
                                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${modelerMode === mode
                                    ? 'bg-[#009CA6] text-white shadow-lg'
                                    : 'text-white/40 hover:text-white'
                                    }`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-bold text-slate-300 block">Proposed Crew Size</label>
                        <div className="flex items-center gap-6">
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={modelerCrewSize}
                                onChange={(e) => setModelerCrewSize(parseInt(e.target.value))}
                                className="flex-1 accent-[#009CA6] h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-4xl font-black text-white w-12 text-center">{modelerCrewSize}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 w-full lg:w-96">
                    <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm relative overflow-hidden group/card shadow-xl">
                        <div className="flex justify-between items-end relative z-10">
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Expected Output</p>
                                <p className="text-5xl font-black text-white">{prediction.total.toFixed(modelerMode === 'rope' ? 1 : 0)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Efficiency</p>
                                <p className="text-xl font-black text-[#009CA6]">{prediction.eff.toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="mt-4 flex gap-2 relative z-10">
                            {prediction.boulders > 0 && (
                                <div className="flex-1 bg-blue-500/20 rounded-xl p-3 border border-blue-500/30">
                                    <p className="text-[9px] font-black text-blue-400 uppercase">Boulders</p>
                                    <p className="text-lg font-black text-white">{prediction.boulders.toFixed(0)}</p>
                                </div>
                            )}
                            {prediction.ropes > 0 && (
                                <div className="flex-1 bg-rose-500/20 rounded-xl p-3 border border-rose-500/30">
                                    <p className="text-[9px] font-black text-rose-400 uppercase">Ropes</p>
                                    <p className="text-lg font-black text-white">{prediction.ropes.toFixed(1)}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <p className="px-4 text-[10px] text-slate-500 italic font-medium">
                        * Forecast based on {analysisData.totalShifts} clean historical shifts.
                        {modelerMode === 'split' && " Simulated split weight: 60% Boulder / 40% Rope."}
                    </p>
                </div>
            </div>

            <div className="mt-12 flex items-center gap-2 text-white/30 text-[10px] font-bold uppercase tracking-widest border-t border-white/5 pt-6">
                <Zap size={14} className="text-[#009CA6]" />
                Statistical model verified against {analysisData.totalShifts} regional data points
            </div>
        </div>
    );
};

export default LaborSimulator;
