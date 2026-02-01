import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend, LabelList } from 'recharts';
import { ProductionStats } from '../../types';
import { TYPE_COLORS, GYM_COLORS } from '../../constants/colors';
import ComparisonPill from './ComparisonPill';

interface ChartProps {
    data: ProductionStats;
    isBaseline?: boolean;
    baseline: any;
    weekScalar: number;
    isPrintMode?: boolean;
}

export const DailyProductionChart: React.FC<ChartProps> = ({ data, isBaseline, baseline, isPrintMode }) => {
    const activeDays = data.dailyData.filter(d =>
        Object.keys(d).some(k => k !== 'date' && k !== 'dateKey' && typeof d[k] === 'number' && d[k] > 0)
    ).length || 1;

    const avgDailyVolume = data.total / activeDays;

    return (
        <div className="bg-white p-6 rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="flex items-start justify-between mb-8">
                <div className="flex-1">
                    <h3 className="text-xl font-black text-[#00205B] uppercase tracking-tight">Daily Production</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Output per gym across defined period</p>
                </div>
                {!isBaseline && baseline.showBaselines && (
                    <div className="text-right flex flex-col items-end">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Daily Volume</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-sm font-black text-[#00205B]">
                                {avgDailyVolume.toFixed(1)}
                            </span>
                            <ComparisonPill
                                current={avgDailyVolume}
                                target={baseline.totalVolumePerWeek / (baseline.settingDays?.length || 5)}
                                showBaselines={baseline.showBaselines}
                            />
                        </div>
                    </div>
                )}
            </div>
            <div className="h-[300px] min-h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.dailyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="dateKey"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: '10px', fontWeight: 700 }}
                            dy={8}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: '10px', fontWeight: 700 }}
                            label={{ value: 'Climbs', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: '12px', fontWeight: 700 }}
                        />
                        <Tooltip
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                        />
                        <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.06em' }} />
                        {data.activeGymCodes.map((gymCode) => (
                            <Bar
                                key={gymCode}
                                dataKey={gymCode}
                                stackId="a"
                                barSize={30}
                                fill={gymCode === 'TARGET' ? '#009CA6' : (GYM_COLORS[gymCode] || '#64748b')}
                                radius={[4, 4, 4, 4]}
                                isAnimationActive={!isPrintMode}
                            />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export const WeekdayDistributionChart: React.FC<ChartProps> = ({ data, isBaseline, baseline, weekScalar, isPrintMode }) => (
    <div className="bg-white p-6 rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="flex items-start justify-between mb-8">
            <div className="flex-1">
                <h3 className="text-xl font-black text-[#00205B] uppercase tracking-tight">Weekday Distribution</h3>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Route vs Boulder production</p>
            </div>
            {!isBaseline && baseline.showBaselines && (
                <div className="text-right flex flex-col items-end">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Volume Variance</p>
                    <div className="flex gap-2">
                        <ComparisonPill
                            current={data.routes}
                            target={baseline.routesPerWeek * weekScalar}
                            label="Routes"
                            showBaselines={baseline.showBaselines}
                        />
                        <ComparisonPill
                            current={data.boulders}
                            target={baseline.bouldersPerWeek * weekScalar}
                            label="Boulders"
                            showBaselines={baseline.showBaselines}
                        />
                    </div>
                </div>
            )}
        </div>
        <div className="h-[280px] min-h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.weekdayData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#c8c9caff" />
                    <XAxis
                        type="number"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                    />
                    <YAxis
                        dataKey="day"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                        width={40}
                    />
                    <Tooltip
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.06em' }} />
                    <Bar dataKey="routes" name="Routes" stackId="type" fill={TYPE_COLORS.routes} radius={[4, 0, 0, 4]} isAnimationActive={!isPrintMode}>
                        {data.weekdayData.map((entry: any, index: number) => (
                            <Cell key={`cell-r-${index}`} fill={TYPE_COLORS.routes} label={entry.routes > 0 ? { position: 'inside', fill: 'white', fontSize: 9, fontWeight: 900, formatter: (val: number) => `${val}R` } : false} />
                        ))}
                    </Bar>
                    <Bar dataKey="boulders" name="Boulders" stackId="type" fill={TYPE_COLORS.boulders} radius={[0, 4, 4, 0]} isAnimationActive={!isPrintMode}>
                        {data.weekdayData.map((entry: any, index: number) => (
                            <Cell key={`cell-b-${index}`} fill={TYPE_COLORS.boulders} label={entry.boulders > 0 ? { position: 'inside', fill: 'white', fontSize: 9, fontWeight: 900, formatter: (val: number) => `${val}B` } : false} />
                        ))}
                        <LabelList dataKey="total" position="right" style={{ fill: '#00205B', fontSize: '10px', fontWeight: 900 }} formatter={(val: number) => val > 0 ? `${val} Total` : ''} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
);
