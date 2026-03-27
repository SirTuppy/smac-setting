import React from 'react';

interface SpeedometerProps {
    currentWeeks: number;
    targetWeeks: number;
    status: 'on-track' | 'lagging' | 'critical';
}

const RotationSpeedometer: React.FC<SpeedometerProps> = ({ currentWeeks, targetWeeks, status }) => {
    // Calculate rotation for SVG dial
    // range: 4 weeks to 12 weeks. 4 = -90deg, 12 = +90deg
    const minWeeks = 4;
    const maxWeeks = 12;
    const clampedWeeks = Math.max(minWeeks, Math.min(maxWeeks, currentWeeks));
    const percentage = (clampedWeeks - minWeeks) / (maxWeeks - minWeeks);
    const rotation = (percentage * 180) - 90;

    const getColor = () => {
        if (status === 'critical') return '#F43F5E'; // rose-500
        if (status === 'lagging') return '#F59E0B'; // amber-500
        return '#10B981'; // emerald-500
    };

    return (
        <div className="relative flex flex-col items-center">
            <svg width="200" height="120" viewBox="0 0 200 120">
                {/* Background Track */}
                <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke="#F1F5F9"
                    strokeWidth="15"
                    strokeLinecap="round"
                />

                {/* Status Sections */}
                <path d="M 20 100 A 80 80 0 0 1 80 35" fill="none" stroke="#10B981" strokeWidth="15" strokeLinecap="butt" opacity="0.1" />
                <path d="M 80 35 A 80 80 0 0 1 140 45" fill="none" stroke="#F59E0B" strokeWidth="15" strokeLinecap="butt" opacity="0.1" />
                <path d="M 140 45 A 80 80 0 0 1 180 100" fill="none" stroke="#F43F5E" strokeWidth="15" strokeLinecap="butt" opacity="0.1" />

                {/* Needle */}
                <g style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '100px 100px', transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                    <line x1="100" y1="100" x2="100" y2="40" stroke={getColor()} strokeWidth="4" strokeLinecap="round" />
                    <circle cx="100" cy="100" r="8" fill={getColor()} />
                    <circle cx="100" cy="100" r="4" fill="white" />
                </g>

                {/* Center text */}
                <text x="100" y="95" textAnchor="middle" className="text-3xl font-black fill-[#00205B] font-sans">
                    {currentWeeks === Infinity ? '∞' : currentWeeks}
                </text>
                <text x="100" y="112" textAnchor="middle" className="text-[10px] font-black fill-slate-400 uppercase tracking-widest font-sans">
                    Weeks
                </text>
            </svg>

            <div className="mt-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getColor() }}></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {status === 'on-track' ? 'Optimal Pace' : status === 'lagging' ? 'Slipping Behind' : 'Critical Delay'}
                </span>
            </div>
        </div>
    );
};

export default RotationSpeedometer;
