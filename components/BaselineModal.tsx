import React from 'react';
import { X, Target, Activity, Zap, Layers } from 'lucide-react';
import { BaselineSettings } from '../types';

interface BaselineModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: BaselineSettings;
    onUpdateSettings: (settings: BaselineSettings) => void;
}

const BaselineModal: React.FC<BaselineModalProps> = ({ isOpen, onClose, settings, onUpdateSettings }) => {
    if (!isOpen) return null;

    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const handleChange = (field: keyof BaselineSettings, value: any) => {
        onUpdateSettings({ ...settings, [field]: value });
    };

    const toggleDay = (dayIndex: number) => {
        const newDays = settings.settingDays.includes(dayIndex)
            ? settings.settingDays.filter(d => d !== dayIndex)
            : [...settings.settingDays, dayIndex].sort();

        // When a day is toggled off, zero out its split
        const newSplit = settings.idealDailySplit.map(s =>
            s.day === dayIndex && settings.settingDays.includes(dayIndex) ? { ...s, routes: 0, boulders: 0 } : s
        );

        onUpdateSettings({ ...settings, settingDays: newDays, idealDailySplit: newSplit });
    };

    const updateDailySplit = (dayIndex: number, field: 'routes' | 'boulders', value: string) => {
        const numValue = parseInt(value) || 0;
        const newSplit = settings.idealDailySplit.map(s =>
            s.day === dayIndex ? { ...s, [field]: numValue } : s
        );

        // Auto-calculate weekly totals
        const totalRoutes = newSplit.reduce((sum, s) => sum + s.routes, 0);
        const totalBoulders = newSplit.reduce((sum, s) => sum + s.boulders, 0);

        onUpdateSettings({
            ...settings,
            idealDailySplit: newSplit,
            routesPerWeek: totalRoutes,
            bouldersPerWeek: totalBoulders,
            totalVolumePerWeek: totalRoutes + totalBoulders
        });
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
            <style>
                {`
                input::-webkit-outer-spin-button,
                input::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                input[type=number] {
                    -moz-appearance: textfield;
                }
                `}
            </style>
            <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl p-10 relative overflow-hidden max-h-[90vh] overflow-y-auto">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#009CA6]/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>

                <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-rose-500 transition-colors z-20">
                    <X size={24} />
                </button>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-[#00205B] p-2 rounded-xl shadow-lg">
                            <Target className="text-white" size={20} />
                        </div>
                        <h2 className="text-3xl font-black text-[#00205B] uppercase tracking-tight">Baseline Config</h2>
                    </div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8 ml-11">Define production benchmarks</p>

                    <div className="space-y-8">
                        {/* 1. Setting Days Selection */}
                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#00205B]/60">
                                <Activity size={12} className="text-[#009CA6]" /> Performance Days (Setting Schedule)
                            </label>
                            <div className="flex justify-between gap-2">
                                {DAYS.map((day, i) => {
                                    const isActive = settings.settingDays.includes(i);
                                    return (
                                        <button
                                            key={day}
                                            onClick={() => toggleDay(i)}
                                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${isActive
                                                    ? 'bg-[#00205B] border-[#00205B] text-white shadow-lg scale-105'
                                                    : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'
                                                }`}
                                        >
                                            {day}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 2. Ideal Daily Output (Granular) */}
                        {settings.settingDays.length > 0 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#00205B]/60">
                                    <Layers size={12} className="text-indigo-500" /> Daily Target Split
                                </label>
                                <div className="grid grid-cols-1 gap-3">
                                    {settings.settingDays.map(dayIdx => {
                                        const split = settings.idealDailySplit.find(s => s.day === dayIdx) || { day: dayIdx, routes: 0, boulders: 0 };
                                        return (
                                            <div key={dayIdx} className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border-2 border-slate-100">
                                                <div className="w-16 font-black text-[#00205B] uppercase text-xs">{DAYS[dayIdx]}</div>
                                                <div className="flex-1 flex gap-3">
                                                    <div className="relative flex-1">
                                                        <input
                                                            type="number"
                                                            className="w-full bg-white border border-slate-200 rounded-lg p-2 pl-3 text-xs font-bold text-[#00205B] outline-none focus:border-[#009CA6]"
                                                            placeholder="Routes"
                                                            value={split.routes || ''}
                                                            onChange={e => updateDailySplit(dayIdx, 'routes', e.target.value)}
                                                        />
                                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-black text-indigo-400 uppercase">Ropes</span>
                                                    </div>
                                                    <div className="relative flex-1">
                                                        <input
                                                            type="number"
                                                            className="w-full bg-white border border-slate-200 rounded-lg p-2 pl-3 text-xs font-bold text-[#00205B] outline-none focus:border-[#009CA6]"
                                                            placeholder="Boulders"
                                                            value={split.boulders || ''}
                                                            onChange={e => updateDailySplit(dayIdx, 'boulders', e.target.value)}
                                                        />
                                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-black text-amber-500 uppercase">Bolds</span>
                                                    </div>
                                                </div>
                                                <div className="w-12 text-right">
                                                    <div className="text-[10px] font-black text-[#00205B]">{split.routes + split.boulders}</div>
                                                    <div className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter">Total</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* 3. Efficiency & Summary (Derived/Auto-Updated) */}
                        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#00205B]/40">Weekly Summary</label>
                                <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <div className="text-2xl font-black text-[#00205B] leading-none">{settings.totalVolumePerWeek}</div>
                                            <div className="text-[8px] font-black text-slate-400 uppercase mt-1 tracking-widest">Total Climbs</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-black text-slate-500">{settings.routesPerWeek}R / {settings.bouldersPerWeek}B</div>
                                            <div className="text-[7px] font-bold text-slate-400 uppercase mt-0.5">Type split</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#00205B]/40">Target Efficiency</label>
                                <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <div className="text-2xl font-black text-[#009CA6] leading-none">{(settings.totalVolumePerWeek / (settings.shiftsPerWeek || 1)).toFixed(1)}</div>
                                            <div className="text-[8px] font-black text-slate-400 uppercase mt-1 tracking-widest">Avg Clb/Shift</div>
                                        </div>
                                        <div className="relative w-16">
                                            <input
                                                type="number"
                                                className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-[10px] font-black text-[#00205B] outline-none text-center"
                                                value={settings.shiftsPerWeek}
                                                onChange={e => handleChange('shiftsPerWeek', e.target.value)}
                                            />
                                            <div className="text-[7px] font-bold text-slate-400 uppercase mt-0.5 text-center">Set Shifts</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 4. Efficiency Baseline Constants */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#00205B]/60">
                                    <Zap size={12} className="text-amber-500" /> Boulders / Shift
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.1"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 pl-4 text-sm font-bold text-[#00205B] outline-none focus:border-[#009CA6] transition-colors"
                                        value={settings.boulderTargetPerShift}
                                        onChange={e => onUpdateSettings({ ...settings, boulderTargetPerShift: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#00205B]/60">
                                    <Zap size={12} className="text-indigo-500" /> Ropes / Shift
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.1"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 pl-4 text-sm font-bold text-[#00205B] outline-none focus:border-[#009CA6] transition-colors"
                                        value={settings.ropeTargetPerShift}
                                        onChange={e => onUpdateSettings({ ...settings, ropeTargetPerShift: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={onClose}
                                className="w-full bg-[#00205B] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-[#00205B]/20 hover:scale-[1.02] transition-all active:scale-[0.98]"
                            >
                                Save Benchmarks
                            </button>
                            <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-4">
                                These values will be used as indicators on the Production Report.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BaselineModal;
