import React, { useState } from 'react';
import { Users, Layers } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, AreaChart, Area, Line, Legend
} from 'recharts';
import { ShiftAnalysisResult } from '../../utils/analyticsEngine';

interface DistributionChartsProps {
    analysisData: ShiftAnalysisResult;
}

export const CrewSizeDistribution: React.FC<DistributionChartsProps> = ({ analysisData }) => {
    return (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-8">
                <Users className="text-emerald-500" />
                <h2 className="text-xl font-black text-[#00205B] uppercase tracking-tight">Crew Size Distribution</h2>
            </div>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analysisData.distData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis
                            dataKey="size"
                            stroke="#94A3B8"
                            fontSize="12px"
                            fontWeight={700}
                            label={{ value: 'Setters per Shift', position: 'insideBottom', offset: -10, fontSize: '10px', fontWeight: 800, fill: '#94A3B8' }}
                        />
                        <YAxis stroke="#94A3B8" fontSize="12px" fontWeight={700} />
                        <Tooltip
                            cursor={{ fill: '#F8FAFC' }}
                            contentStyle={{ backgroundColor: '#fff', borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="count" fill="#10B981" radius={[8, 8, 0, 0]} name="Shifts" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export const LaborProductionOverlay: React.FC<DistributionChartsProps> = ({ analysisData }) => {
    const [overlayType, setOverlayType] = useState<'all' | 'rope' | 'boulder'>('all');

    return (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-3">
                    <Layers className="text-indigo-500" />
                    <h2 className="text-xl font-black text-[#00205B] uppercase tracking-tight">Labor vs. Production Overlay</h2>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-2xl w-fit border border-slate-200">
                    {(['all', 'rope', 'boulder'] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => setOverlayType(type)}
                            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${overlayType === type
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
                            <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#009CA6" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#009CA6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="display" stroke="#94A3B8" fontSize="10px" fontWeight={700} />
                        <YAxis yAxisId="left" stroke="#6366F1" fontSize="10px" fontWeight={800} label={{ value: 'Setters', angle: -90, position: 'insideLeft', fontSize: '10px', fill: '#6366F1' }} />
                        <YAxis yAxisId="right" orientation="right" stroke="#009CA6" fontSize="10px" fontWeight={800} label={{ value: 'Total Climbs', angle: 90, position: 'insideRight', fontSize: '10px', fill: '#009CA6' }} />
                        <Tooltip
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area
                            yAxisId="right"
                            type="monotone"
                            dataKey={overlayType === 'all' ? 'totalOutput' : overlayType === 'rope' ? 'ropeCount' : 'boulderCount'}
                            stroke="#009CA6"
                            fill="url(#colorOutput)"
                            strokeWidth={2}
                            name={overlayType === 'all' ? 'Total Production' : overlayType === 'rope' ? 'Rope Production' : 'Boulder Production'}
                        />
                        <Line yAxisId="left" type="monotone" dataKey="avgCrew" stroke="#6366F1" strokeWidth={3} dot={{ r: 4 }} name="Avg Crew Size" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            <p className="mt-4 text-[10px] text-slate-400 uppercase font-bold text-center italic">Direct comparison of monthly labor force vs actual climb output.</p>
        </div>
    );
};

export const ShiftTypeDistribution: React.FC<DistributionChartsProps> = ({ analysisData }) => {
    return (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 col-span-1 lg:col-span-2">
            <div className="flex items-center gap-3 mb-8">
                <Layers className="text-amber-500" />
                <h2 className="text-xl font-black text-[#00205B] uppercase tracking-tight">Shift Type Distribution</h2>
            </div>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analysisData.refinedMonthlyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="display" stroke="#94A3B8" fontSize="10px" fontWeight={700} />
                        <YAxis stroke="#94A3B8" fontSize="10px" fontWeight={700} />
                        <Tooltip />
                        <Legend iconType="circle" />
                        <Area type="monotone" dataKey="ropeCount" stackId="1" stroke="#F43F5E" fill="#FFE4E6" name="Pure Rope Shifts" />
                        <Area type="monotone" dataKey="boulderCount" stackId="1" stroke="#3B82F6" fill="#DBEAFE" name="Pure Boulder Shifts" />
                        <Area type="monotone" dataKey="splitCount" stackId="1" stroke="#F59E0B" fill="#FEF3C7" name="Split Shifts" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
