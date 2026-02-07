import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend, LabelList } from 'recharts';
import { ProductionStats } from '../../types';
import { TYPE_COLORS, GYM_COLORS } from '../../constants/colors';
import ComparisonPill from './ComparisonPill';

interface ChartProps {
    data: ProductionStats;
    previousData?: ProductionStats | null;
    comparisonMode?: 'none' | 'pop' | 'yoy';
    isBaseline?: boolean;
    baseline: any;
    weekScalar: number;
    isPrintMode?: boolean;
}

export const DailyProductionChart: React.FC<ChartProps> = ({ data, previousData, comparisonMode, isBaseline, baseline, isPrintMode }) => {
    const activeDays = data.dailyData.filter(d =>
        Object.keys(d).some(k => k !== 'date' && k !== 'dateKey' && typeof d[k] === 'number' && d[k] > 0)
    ).length || 1;

    const avgDailyVolume = data.total / activeDays;

    // Prepare merged data for comparison
    const chartData = React.useMemo(() => {
        if (!previousData || comparisonMode === 'none') return data.dailyData;

        // Map previous data by index to show side-by-side
        return data.dailyData.map((d, i) => {
            const prevD = previousData.dailyData[i];
            const prevTotal = prevD ? Object.keys(prevD)
                .filter(k => k !== 'date' && k !== 'dateKey')
                .reduce((sum, k) => sum + (prevD[k] || 0), 0) : 0;

            return {
                ...d,
                PREVIOUS_TOTAL: prevTotal
            };
        });
    }, [data.dailyData, previousData, comparisonMode]);

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
                    <BarChart data={chartData}>
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
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-white p-4 rounded-2xl shadow-2xl border border-slate-100">
                                            <p className="text-[10px] font-black text-[#00205B] uppercase tracking-widest mb-3 border-b border-slate-50 pb-2">{label}</p>
                                            <div className="space-y-2">
                                                {payload.map((p: any) => (
                                                    <div key={p.dataKey} className="flex items-center justify-between gap-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                                                            <span className="text-[10px] font-bold text-slate-500 uppercase">{p.name === 'PREVIOUS_TOTAL' ? 'Last Period' : p.name}</span>
                                                        </div>
                                                        <span className="text-xs font-black text-[#00205B]">{p.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.06em' }} />
                        {comparisonMode !== 'none' && (
                            <Bar
                                dataKey="PREVIOUS_TOTAL"
                                name="Last Period"
                                fill="#94a3b8"
                                fillOpacity={0.2}
                                stroke="#94a3b8"
                                strokeDasharray="4 4"
                                barSize={30}
                                radius={[4, 4, 4, 4]}
                                isAnimationActive={false}
                            />
                        )}
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
