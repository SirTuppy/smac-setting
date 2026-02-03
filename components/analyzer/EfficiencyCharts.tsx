import React, { useState } from 'react';
import { Sparkles, TrendingUp } from 'lucide-react';
import {
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, AreaChart, Area, BarChart, Bar
} from 'recharts';
import { ShiftAnalysisResult } from '../../utils/analyticsEngine';

interface EfficiencyChartsProps {
    analysisData: ShiftAnalysisResult;
}

export const BreakingPointChart: React.FC<EfficiencyChartsProps> = ({ analysisData }) => {
    const [correlationType, setCorrelationType] = useState<'all' | 'rope' | 'boulder'>('all');

    return (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-3">
                    <img
                        src={`${import.meta.env.BASE_URL}assets/justLogo.png`}
                        className="w-5 h-5 object-contain"
                        alt=""
                    />
                    <h2 className="text-xl font-black text-[#00205B] uppercase tracking-tight">Crew Size vs. Efficiency</h2>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-2xl w-fit border border-slate-200">
                    {(['all', 'rope', 'boulder'] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => setCorrelationType(type)}
                            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${correlationType === type
                                ? 'bg-white text-[#00205B] shadow-md'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            {type === 'all' ? 'Total' : type === 'rope' ? 'Ropes' : 'Boulders'}
                        </button>
                    ))}
                </div>
            </div>
            <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis
                            type="number"
                            dataKey="crewSize"
                            name="Crew Size"
                            unit=" Setters"
                            domain={[0, 'auto']}
                            stroke="#94A3B8"
                            fontSize="12px"
                            fontWeight={700}
                        />
                        <YAxis
                            type="number"
                            dataKey={correlationType === 'all' ? 'outputPerSetter' : correlationType === 'rope' ? 'ropeOutputPerSetter' : 'boulderOutputPerSetter'}
                            name="Output"
                            unit=" Climbs"
                            stroke="#94A3B8"
                            fontSize="12px"
                            fontWeight={700}
                        />
                        <Tooltip
                            cursor={{ strokeDasharray: '3 3' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <div className="bg-[#00205B] p-4 rounded-2xl shadow-xl border border-white/10 text-white">
                                            <p className="text-xs font-black text-white/50 uppercase tracking-widest mb-1">{data.date} • {data.gym}</p>
                                            <p className="text-lg font-black">{data.crewSize} Setters</p>
                                            <p className="text-emerald-400 font-bold">
                                                {correlationType === 'all'
                                                    ? `${data.outputPerSetter.toFixed(1)} Total Climbs / Setter`
                                                    : correlationType === 'rope'
                                                        ? `${data.ropeOutputPerSetter.toFixed(1)} Ropes / Setter`
                                                        : `${data.boulderOutputPerSetter.toFixed(1)} Boulders / Setter`
                                                }
                                            </p>
                                            <p className="text-white/70 text-sm mt-1">
                                                Total Shift Output: {data.totalOutput} ({data.ropeOutput}R / {data.boulderOutput}B)
                                            </p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Scatter
                            name="Efficiency"
                            data={analysisData.efficiencyData.filter(d => {
                                if (correlationType === 'rope') return d.ropeOutput > 0;
                                if (correlationType === 'boulder') return d.boulderOutput > 0;
                                return true;
                            })}
                            fill="#009CA6"
                            opacity={0.6}
                        >
                            {analysisData.efficiencyData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.crewSize > 5 ? '#00205B' : '#009CA6'} />
                            ))}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <p className="text-sm text-slate-500 font-medium italic">
                    <strong>Insight:</strong> Darker points indicate crews larger than 5 setters. Historically, smaller crews often show higher per-setter efficiency due to reduced overhead and clearer zone division.
                </p>
                <div className="text-right">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                        {correlationType === 'all' ? 'Total' : correlationType === 'rope' ? 'Rope' : 'Boulder'} Correlation (R)
                    </span>
                    <span className={`text-xl font-black ${analysisData.correlations[correlationType] < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {analysisData.correlations[correlationType].toFixed(3)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export const EfficiencyEvolutionChart: React.FC<EfficiencyChartsProps> = ({ analysisData }) => {
    const [evolutionType, setEvolutionType] = useState<'all' | 'rope' | 'boulder'>('all');

    return (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 col-span-1 lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-3">
                    <TrendingUp className="text-emerald-500" />
                    <h2 className="text-xl font-black text-[#00205B] uppercase tracking-tight">Efficiency Evolution (Monthly Avg)</h2>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-2xl w-fit border border-slate-200">
                    {(['all', 'rope', 'boulder'] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => setEvolutionType(type)}
                            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${evolutionType === type
                                ? 'bg-white text-[#00205B] shadow-md'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            {type === 'all' ? 'Total' : type === 'rope' ? 'Ropes' : 'Boulders'}
                        </button>
                    ))}
                </div>
            </div>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analysisData.refinedMonthlyData}>
                        <defs>
                            <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="display" stroke="#94A3B8" fontSize="10px" fontWeight={700} />
                        <YAxis stroke="#94A3B8" fontSize="10px" fontWeight={700} />
                        <Tooltip
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                            formatter={(val: number) => [`${val.toFixed(2)} Climbs / Setter`, 'Efficiency']}
                        />
                        <Area
                            type="monotone"
                            dataKey={evolutionType === 'all' ? 'avgEfficiency' : evolutionType === 'rope' ? 'avgRopeEfficiency' : 'avgBoulderEfficiency'}
                            stroke="#10B981"
                            fill="url(#colorEff)"
                            strokeWidth={3}
                            name="Output / Setter"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export const RhythmAnalyticsChart: React.FC<EfficiencyChartsProps> = ({ analysisData }) => {
    const [rhythmType, setRhythmType] = useState<'all' | 'rope' | 'boulder'>('all');
    const dowData = analysisData.getDowData(rhythmType);

    return (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-3">
                    <TrendingUp className="text-[#009CA6]" />
                    <h2 className="text-xl font-black text-[#00205B] uppercase tracking-tight">Best Setting Days</h2>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-2xl w-fit border border-slate-200">
                    {(['all', 'rope', 'boulder'] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => setRhythmType(type)}
                            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${rhythmType === type
                                ? 'bg-white text-[#00205B] shadow-md'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            {type === 'all' ? 'Total' : type === 'rope' ? 'Ropes' : 'Boulders'}
                        </button>
                    ))}
                </div>
            </div>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dowData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="day" stroke="#94A3B8" fontSize="12px" fontWeight={800} />
                        <YAxis stroke="#94A3B8" fontSize="12px" fontWeight={700} />
                        <Tooltip />
                        <Bar dataKey="efficiency" radius={[8, 8, 0, 0]}>
                            {dowData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.efficiency === Math.max(...dowData.map(d => d.efficiency)) ? '#009CA6' : '#E2E8F0'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
