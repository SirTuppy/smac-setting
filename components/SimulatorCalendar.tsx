import React, { useMemo, useState } from 'react';
import { SimulatorSetter, SimulatorShift } from '../types';
import { useDashboardStore } from '../store/useDashboardStore';
import { ChevronLeft, ChevronRight, UserPlus, Umbrella, ZapOff, CheckCircle2 } from 'lucide-react';

interface Props {
    gymCode: string;
    setters: Record<string, SimulatorSetter>;
    overrides: Record<string, SimulatorShift>;
}

const SimulatorCalendar: React.FC<Props> = ({ gymCode, setters, overrides }) => {
    const { setSimulatorSetter } = useDashboardStore();
    const [viewDate, setViewDate] = useState(new Date());

    // Generate 4-5 weeks for the focused month
    const weeks = useMemo(() => {
        const result = [];
        const startOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
        const startOfCalendar = new Date(startOfMonth);
        const day = startOfCalendar.getDay();
        const diff = startOfCalendar.getDate() - day + (day === 0 ? -6 : 1); // Monday
        startOfCalendar.setDate(diff);

        for (let w = 0; w < 5; w++) {
            const days = [];
            for (let d = 0; d < 7; d++) {
                const date = new Date(startOfCalendar);
                date.setDate(date.getDate() + (w * 7) + d);
                days.push(date);
            }
            result.push(days);
        }
        return result;
    }, [viewDate]);

    const changeMonth = (offset: number) => {
        setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    const togglePTO = (date: Date, setterName: string) => {
        const dateKey = date.toISOString().split('T')[0];
        const setter = setters[setterName];
        if (!setter) return;

        const currentModifiers = setter.specialDateModifiers || {};
        const isCurrentlyPTO = currentModifiers[dateKey] === 'pto';

        const newSetter: SimulatorSetter = {
            ...setter,
            specialDateModifiers: {
                ...currentModifiers,
                [dateKey]: isCurrentlyPTO ? undefined : 'pto'
            } as any
        };

        // Remove key if undefined to keep state clean
        if (isCurrentlyPTO) {
            delete (newSetter.specialDateModifiers as any)[dateKey];
        }

        setSimulatorSetter(newSetter);
    };

    return (
        <div className="bg-white rounded-[2rem] p-10 shadow-2xl shadow-slate-200 border border-slate-100">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h2 className="text-2xl font-black text-[#00205B] uppercase tracking-tight">Active Calendar</h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Dials and Levers: Adjust upcoming capacity</p>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => changeMonth(-1)} className="p-2 text-slate-400 hover:text-[#00205B] transition-colors"><ChevronLeft size={20} /></button>
                    <span className="text-xs font-black uppercase tracking-widest text-[#00205B] min-w-[120px] text-center">
                        {viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={() => changeMonth(1)} className="p-2 text-slate-400 hover:text-[#00205B] transition-colors"><ChevronRight size={20} /></button>
                </div>
            </div>

            <div className="space-y-8">
                {weeks.map((week, wIdx) => (
                    <div key={wIdx} className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00205B]/30 px-2">
                            Week {wIdx + 1} • {week[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {week[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </h3>
                        <div className="grid grid-cols-7 gap-4">
                            {week.map((date, dIdx) => {
                                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                                const dateKey = date.toISOString().split('T')[0];

                                // Calculate who is scheduled by default
                                const scheduledSetters = (Object.values(setters) as SimulatorSetter[]).filter(s =>
                                    s.active && s.baseSchedule.includes(date.getDay())
                                );

                                return (
                                    <div key={dIdx} className={`rounded-3xl p-4 transition-all border-2 ${isWeekend ? 'bg-slate-50/50 border-transparent opacity-40' : 'bg-white border-slate-100 hover:border-[#009CA6]/30 shadow-sm'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-[10px] font-black text-slate-300 uppercase">{date.toLocaleDateString(undefined, { weekday: 'short' })}</span>
                                            <span className="text-sm font-black text-[#00205B]">{date.getDate()}</span>
                                        </div>

                                        <div className="space-y-2">
                                            {scheduledSetters.map(s => {
                                                const isPTO = s.specialDateModifiers?.[dateKey] === 'pto';
                                                return (
                                                    <div key={s.name} className={`flex items-center justify-between group/item ${isPTO ? 'opacity-40 grayscale' : ''}`}>
                                                        <span className="text-[10px] font-bold text-slate-600 truncate max-w-[60px]">{s.name.split(' ')[0]}</span>
                                                        <button
                                                            onClick={() => togglePTO(date, s.name)}
                                                            className={`transition-colors ${isPTO ? 'text-rose-500' : 'text-slate-200 hover:text-rose-500'}`}
                                                            title={isPTO ? "On PTO" : "Scheduled"}
                                                        >
                                                            <Umbrella size={12} />
                                                        </button>
                                                    </div>
                                                );
                                            })}

                                            {!isWeekend && (
                                                <button className="w-full py-1 border-2 border-dashed border-slate-100 rounded-lg text-slate-200 hover:text-[#009CA6] hover:border-[#009CA6]/30 transition-all mt-2 flex justify-center">
                                                    <UserPlus size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SimulatorCalendar;
