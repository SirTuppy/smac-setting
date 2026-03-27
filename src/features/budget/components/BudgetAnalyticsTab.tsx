import React from 'react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts';
import { formatCurrency, CH_COLORS } from '../utils';

interface BudgetAnalyticsTabProps {
    catDonutData: any[];
    vendorPieData: any[];
    monthlyBurnData: any[];
    yoyBurnData: any[] | null;
    monthlyLimitToUse: number;
    selectedYear: number;
}

export const BudgetAnalyticsTab: React.FC<BudgetAnalyticsTabProps> = ({
    catDonutData,
    vendorPieData,
    monthlyBurnData,
    yoyBurnData,
    monthlyLimitToUse,
    selectedYear
}) => {
    return (
        <div className="animate-in fade-in duration-300 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Chart 1: Donut */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden shrink-0">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Category Spend YTD</h4>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsPie>
                                <Pie data={catDonutData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none" label={({ name, value }) => `${name}: ${formatCurrency(value)}`}>
                                    {catDonutData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={CH_COLORS[index % CH_COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                            </RechartsPie>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 2: Vendor Pie */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden shrink-0">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Top Vendors YTD</h4>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsPie>
                                <Pie data={vendorPieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" stroke="none" label={({ name, value }) => `${name}: ${formatCurrency(value)}`}>
                                    {vendorPieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={CH_COLORS[index % CH_COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                            </RechartsPie>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden flex flex-col h-[450px]">
                <h3 className="text-lg font-bold text-[#00205B] mb-4">Month-Over-Month Burn Strategy</h3>
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyBurnData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `$${val}`} />
                            <RechartsTooltip
                                formatter={(value: number) => formatCurrency(value)}
                                cursor={{ fill: '#f1f5f9' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend />
                            <ReferenceLine y={monthlyLimitToUse} stroke="#f43f5e" strokeDasharray="3 3" label={{ position: 'top', value: 'Monthly Avg Limit', fill: '#f43f5e', fontSize: 12, fontWeight: 'bold' }} />
                            <Bar dataKey="spend" name="Actual Spend" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {yoyBurnData && (
                <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden flex flex-col h-[450px]">
                    <h3 className="text-lg font-bold text-[#00205B] mb-1">Year-over-Year Comparison</h3>
                    <p className="text-xs text-slate-400 mb-4">{selectedYear} vs {selectedYear - 1}</p>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={yoyBurnData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `$${val}`} />
                                <RechartsTooltip
                                    formatter={(value: number) => formatCurrency(value)}
                                    cursor={{ fill: '#f1f5f9' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend />
                                <Bar dataKey="current" name={`${selectedYear}`} fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                <Bar dataKey="previous" name={`${selectedYear - 1}`} fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};
