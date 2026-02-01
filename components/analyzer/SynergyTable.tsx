import React, { useState } from 'react';
import { Users2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ShiftAnalysisResult } from '../../utils/analyticsEngine';

interface SynergyTableProps {
    analysisData: ShiftAnalysisResult;
}

const SynergyTable: React.FC<SynergyTableProps> = ({ analysisData }) => {
    const [synergyType, setSynergyType] = useState<'all' | 'rope' | 'boulder'>('all');
    const [synergyMinShifts, setSynergyMinShifts] = useState<number>(2);

    const synergyData = analysisData.getSynergyData(synergyType, synergyMinShifts);

    return (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-3">
                    <Users2 className="text-rose-500" />
                    <h2 className="text-xl font-black text-[#00205B] uppercase tracking-tight">Synergy: Top-Performing Pairs</h2>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-2xl w-fit border border-slate-200">
                    {(['all', 'rope', 'boulder'] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => setSynergyType(type)}
                            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${synergyType === type
                                ? 'bg-white text-[#00205B] shadow-md'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            {type === 'all' ? 'Total' : type === 'rope' ? 'Ropes' : 'Boulders'}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Min Volume: <span className="text-[#00205B] font-black">{synergyMinShifts}+</span></span>
                    <input
                        type="range"
                        min="1"
                        max="20"
                        value={synergyMinShifts}
                        onChange={(e) => setSynergyMinShifts(parseInt(e.target.value))}
                        className="w-24 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00205B]"
                    />
                </div>
            </div>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={synergyData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                        <XAxis type="number" domain={[0, 'auto']} hide />
                        <YAxis
                            dataKey="pair"
                            type="category"
                            stroke="#94A3B8"
                            fontSize="10px"
                            fontWeight={700}
                            width={140}
                        />
                        <Tooltip
                            cursor={{ fill: '#F8FAFC' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const p = payload[0].payload;
                                    return (
                                        <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100">
                                            <p className="text-xs font-black text-slate-400 uppercase mb-1">{p.pair}</p>
                                            <p className="text-sm font-bold text-[#00205B]">{p.efficiency.toFixed(2)} climbs/setter avg</p>
                                            <p className="text-xs text-slate-500">{p.count} {(synergyType === 'all' ? 'shifts' : synergyType === 'rope' ? 'rope shifts' : 'boulder shifts')} shared</p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar dataKey="efficiency" name="Avg Output/Setter" radius={[0, 4, 4, 0]}>
                            {synergyData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index < 3 ? '#F43F5E' : '#FDA4AF'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <p className="mt-4 text-[10px] text-slate-400 uppercase font-bold text-center italic">Calculated as avg climbs per person when this pair is present.</p>
        </div>
    );
};

export default SynergyTable;
