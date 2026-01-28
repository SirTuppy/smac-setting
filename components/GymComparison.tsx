import React, { useMemo } from 'react';
import { Climb } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, Box, Zap } from 'lucide-react';
import { GYM_COLORS, TYPE_COLORS } from '../constants/colors';

interface GymComparisonProps {
    gymData: Record<string, Climb[]>;
    selectedGyms: string[];
    dateRange: { start: Date; end: Date };
}

const GymComparison: React.FC<GymComparisonProps> = ({ gymData, selectedGyms, dateRange }) => {
    const comparisonData = useMemo(() => {
        return selectedGyms.map(gymName => {
            const climbs = (gymData[gymName] || []).filter(c =>
                c.dateSet >= dateRange.start && c.dateSet <= dateRange.end
            );

            const routes = climbs.filter(c => c.isRoute).length;
            const boulders = climbs.length - routes;

            // Calculate efficiency (unique setters involved)
            const uniqueSetters = new Set<string>();
            climbs.forEach(c => {
                String(c.setter).split(',').forEach(s => uniqueSetters.add(s.trim()));
            });

            const efficiency = climbs.length / (uniqueSetters.size || 1);

            // Average Grade Score
            const avgGrade = climbs.length > 0
                ? climbs.reduce((acc, c) => acc + (c.gradeScore || 0), 0) / climbs.length
                : 0;

            return {
                name: gymName,
                shortName: gymName.split(' ').pop(),
                total: climbs.length,
                routes,
                boulders,
                setters: uniqueSetters.size,
                efficiency,
                avgGrade
            };
        });
    }, [gymData, selectedGyms, dateRange]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Comparison Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {comparisonData.map(gym => (
                    <div key={gym.name} className="bg-white border border-slate-200 p-5 rounded-xl flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1 truncate" title={gym.name}>{gym.name}</p>
                            <h4 className="text-2xl font-black text-[#00205B] mb-4">{gym.total} <span className="text-[10px] text-slate-400 font-black uppercase ml-1">Volume</span></h4>

                            <div className="grid grid-cols-3 gap-2">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-1"><Box size={10} style={{ color: TYPE_COLORS.routes }} /> Ropes</span>
                                    <span className="text-lg font-black" style={{ color: TYPE_COLORS.routes }}>{gym.routes}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-1"><Zap size={10} style={{ color: TYPE_COLORS.boulders }} /> Boulders</span>
                                    <span className="text-lg font-black" style={{ color: TYPE_COLORS.boulders }}>{gym.boulders}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-1"><Users size={10} className="text-amber-500" /> Setters</span>
                                    <span className="text-lg font-black text-amber-500">{gym.setters}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-end">
                            <div>
                                <p className="text-[9px] font-black uppercase text-slate-400">Efficiency</p>
                                <p className="text-base font-black text-[#00205B]">{gym.efficiency.toFixed(1)} <span className="text-[10px] font-normal text-slate-400">c/s</span></p>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-black uppercase text-slate-400">Avg Grade</p>
                                <p className="text-base font-black text-[#009CA6]">{gym.avgGrade.toFixed(1)}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Parallel Volume Comparison Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
                    <h3 className="text-sm font-black text-[#00205B] uppercase tracking-widest mb-6">Cross-Gym Volume Breakdown</h3>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <XAxis dataKey="shortName" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc', opacity: 0.8 }}
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#00205B', fontSize: '10px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                                />
                                <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '20px', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                                <Bar dataKey="routes" name="Ropes" fill={TYPE_COLORS.routes} radius={[0, 0, 0, 0]} barSize={40} />
                                <Bar dataKey="boulders" name="Boulders" fill={TYPE_COLORS.boulders} radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex flex-col">
                    <h3 className="text-sm font-black text-[#00205B] uppercase tracking-widest mb-6">Productivity ranking</h3>
                    <div className="space-y-4 flex-1">
                        {[...comparisonData].sort((a, b) => b.efficiency - a.efficiency).map(gym => (
                            <div key={gym.name} className="space-y-2">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-slate-400">{gym.name.split(' ').pop()}</span>
                                    <span className="text-[#00205B]">{gym.efficiency.toFixed(1)}</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000"
                                        style={{ width: `${Math.min(100, (gym.efficiency / 10) * 100)}%`, backgroundColor: GYM_COLORS[gym.name] || TYPE_COLORS.routes }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="text-[9px] text-slate-400 mt-6 leading-relaxed italic font-medium uppercase tracking-tighter">
                        * Efficiency = Climbs set / unique setters active.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default GymComparison;
