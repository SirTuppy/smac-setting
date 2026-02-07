import React from 'react';
import { Award } from 'lucide-react';
import { SetterProduction } from '../../types';
import { GYM_COLORS, TYPE_COLORS } from '../../constants/colors';

interface SetterGridProps {
    setterData: SetterProduction[];
}

const SetterProductionGrid: React.FC<SetterGridProps> = ({ setterData }) => (
    <div className="bg-white rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden mt-8">
        <div className="px-8 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
                <h3 className="text-xl font-black text-[#00205B] uppercase tracking-tight">Routesetter Production</h3>
            </div>
            <Award className="text-[#009CA6]/20" size={28} />
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {setterData.map((setter) => (
                <div key={setter.name} className="flex items-center p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/50 transition-colors gap-2">
                    <div className="flex-[2] min-w-0 pr-2">
                        <p className="font-black text-[#00205B] text-xs leading-tight mb-1 truncate">{setter.name}</p>
                        <div className="flex flex-wrap gap-1">
                            {setter.gymCodes.split(', ').map((code) => (
                                <span key={code} className="px-2 py-0.5 rounded-[10px] text-white text-[10px] font-black uppercase" style={{ backgroundColor: GYM_COLORS[code] || '#64748b' }}>
                                    {code}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="w-px h-8 bg-slate-300 shrink-0" />
                    <div className="flex-1 flex items-center justify-center gap-2 px-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Shifts</span>
                        <span className="text-[11px] font-black text-[#00205B]">{setter.shifts}</span>
                    </div>
                    <div className="w-px h-8 bg-slate-300 shrink-0" />
                    <div className="flex-[3] flex items-center justify-center px-4">
                        <span className="text-[12px] font-bold text-[#00205B] whitespace-nowrap">
                            Routes: <span style={{ color: TYPE_COLORS.routes }} className="font-black">{setter.routes}</span>
                            <span className="text-slate-300 mx-3">|</span>
                            Boulders: <span style={{ color: TYPE_COLORS.boulders }} className="font-black">{setter.boulders}</span>
                        </span>
                    </div>
                    <div className="w-px h-8 bg-slate-300 shrink-0" />
                    <div className="w-12 flex flex-col items-center gap-0.5 shrink-0 ml-1">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                        <div className="w-8 h-7 flex items-center justify-center rounded-lg text-white font-black text-xs shadow-sm" style={{ backgroundColor: TYPE_COLORS.routes }}>
                            {setter.total}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default SetterProductionGrid;
