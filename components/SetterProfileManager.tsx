import React from 'react';
import { SimulatorSetter } from '../types';
import { Activity, Clock, Trash2, CheckCircle2, Circle } from 'lucide-react';

interface Props {
    setters: Record<string, SimulatorSetter>;
    onUpdateSetter: (setter: SimulatorSetter) => void;
}

const SetterProfileManager: React.FC<Props> = ({ setters, onUpdateSetter }) => {
    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const toggleDay = (setter: SimulatorSetter, dayIdx: number) => {
        const schedule = [...setter.baseSchedule];
        const idx = schedule.indexOf(dayIdx);
        if (idx > -1) schedule.splice(idx, 1);
        else schedule.push(dayIdx);
        onUpdateSetter({ ...setter, baseSchedule: schedule.sort() });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-[2rem] p-10 shadow-2xl shadow-slate-200 border border-slate-100">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h2 className="text-2xl font-black text-[#00205B] uppercase tracking-tight">Setter Horsepower</h2>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Adjust individual velocity & standard shifts</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(Object.values(setters) as SimulatorSetter[]).map(setter => (
                        <div key={setter.name} className={`group bg-slate-50 border-2 rounded-3xl p-6 transition-all ${setter.active ? 'border-transparent hover:border-[#009CA6]/30' : 'opacity-50 grayscale border-transparent'}`}>
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center text-[#00205B] font-black">
                                        {setter.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-[#00205B] text-lg">{setter.name}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${setter.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                                                {setter.active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onUpdateSetter({ ...setter, active: !setter.active })}
                                    className={`p-2 rounded-xl transition-all ${setter.active ? 'text-slate-300 hover:text-rose-500' : 'text-emerald-500 hover:scale-110'}`}
                                >
                                    {setter.active ? <Trash2 size={20} /> : <CheckCircle2 size={24} />}
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-white rounded-2xl p-4 shadow-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Activity size={14} className="text-[#009CA6]" />
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Velocity</span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <input
                                            type="number"
                                            value={setter.avgWeeklyOutput}
                                            onChange={(e) => onUpdateSetter({ ...setter, avgWeeklyOutput: Number(e.target.value) })}
                                            className="w-16 font-black text-xl text-[#00205B] outline-none bg-transparent"
                                        />
                                        <span className="text-[10px] font-bold text-slate-300 uppercase">Climbs/Shift</span>
                                    </div>
                                </div>
                                <div className="bg-white rounded-2xl p-4 shadow-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock size={14} className="text-[#009CA6]" />
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Attendance</span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="font-black text-xl text-[#00205B]">{setter.attendanceVariance >= 0 ? '+' : ''}{setter.attendanceVariance}%</span>
                                        <span className="text-[10px] font-bold text-slate-300 uppercase">vs Sched</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <span className="text-[9px] font-black text-[#00205B]/30 uppercase tracking-[0.2em] px-1">Base Weekly Schedule</span>
                                <div className="flex gap-1 justify-between">
                                    {DAYS.map((day, i) => (
                                        <button
                                            key={day}
                                            onClick={() => toggleDay(setter, i)}
                                            className={`w-9 h-9 rounded-xl text-[10px] font-black transition-all ${setter.baseSchedule.includes(i)
                                                ? 'bg-[#00205B] text-white shadow-lg'
                                                : 'bg-white text-slate-300 hover:bg-slate-100'}`}
                                        >
                                            {day.charAt(0)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SetterProfileManager;
