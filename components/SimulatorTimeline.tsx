import React from 'react';
import { YearlyDataPoint } from '../utils/varianceAnalyzer';

interface Props {
    data: YearlyDataPoint[];
    targetWeeks: number;
}

const SimulatorTimeline: React.FC<Props> = ({ data, targetWeeks }) => {
    if (data.length === 0) return null;

    const maxVal = Math.max(...data.map(d => d.projectedRotation), targetWeeks + 2);
    const minVal = 0;
    const height = 100;
    const width = 800;

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d.projectedRotation - minVal) / (maxVal - minVal)) * height;
        return `${x},${y}`;
    }).join(' ');

    const targetY = height - ((targetWeeks - minVal) / (maxVal - minVal)) * height;

    return (
        <div className="bg-white rounded-[2rem] p-10 shadow-2xl shadow-slate-200 border border-slate-100">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-black text-[#00205B] uppercase tracking-tight">Yearly Outlook</h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Predicted turnover cycles for the next 52 weeks</p>
                </div>
            </div>

            <div className="relative pt-4 pb-8">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40 overflow-visible">
                    {/* Target Line */}
                    <line
                        x1="0" y1={targetY} x2={width} y2={targetY}
                        stroke="#009CA6" strokeWidth="2" strokeDasharray="4 4" opacity="0.4"
                    />
                    <text x={width + 10} y={targetY} className="text-[10px] font-black fill-[#009CA6] uppercase">Target</text>

                    {/* The Curve */}
                    <polyline
                        fill="none"
                        stroke="#00205B"
                        strokeWidth="3"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        points={points}
                        className="transition-all duration-1000"
                    />

                    {/* Area fill */}
                    <path
                        d={`M 0,${height} ${points} V ${height} Z`}
                        fill="url(#gradient)"
                        opacity="0.1"
                    />

                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#00205B" />
                            <stop offset="100%" stopColor="white" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* X-Axis Labels */}
                <div className="flex justify-between mt-4 px-2">
                    <span className="text-[9px] font-black text-slate-300 uppercase">Now</span>
                    <span className="text-[9px] font-black text-slate-300 uppercase">3 Months</span>
                    <span className="text-[9px] font-black text-slate-300 uppercase">6 Months</span>
                    <span className="text-[9px] font-black text-slate-300 uppercase">9 Months</span>
                    <span className="text-[9px] font-black text-slate-300 uppercase">1 Year</span>
                </div>
            </div>

            <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 italic text-[11px] text-slate-500 text-center">
                Reflected spikes indicate periods of reduced capacity (PTO, Holidays, Events).
            </div>
        </div>
    );
};

export default SimulatorTimeline;
