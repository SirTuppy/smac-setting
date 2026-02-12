import React, { useMemo, useState } from 'react';
import { useDashboardStore } from '../store/useDashboardStore';
import { calculateRotationForecast, calculateYearlyOutlook } from '../utils/varianceAnalyzer';
import { calculateHistoricalMetrics } from '../utils/setterVelocity';
import RotationSpeedometer from './RotationSpeedometer';
import SimulatorCalendar from './SimulatorCalendar';
import SetterProfileManager from './SetterProfileManager';
import FutureHeatmap from './FutureHeatmap';
import SimulatorTimeline from './SimulatorTimeline';
import { Users, Calendar, BarChart3, Settings2, Activity, Mountain } from 'lucide-react';

const SimulatorView: React.FC = () => {
    const {
        climbData,
        gymSchedules,
        selectedGyms,
        simulatorSetters,
        setSimulatorSetter,
        simulatorOverrides,
        simulatorVarianceBuffer,
        setSimulatorVarianceBuffer,
        orbitTargets,
        setActiveView
    } = useDashboardStore();

    const [activeTab, setActiveTab] = useState<'plan' | 'team'>('plan');

    const activeGymCode = useMemo(() => {
        if (selectedGyms.includes("Regional Overview") || selectedGyms.length === 0) return 'DSN'; // Default to DSN if regional
        return selectedGyms[0];
    }, [selectedGyms]);

    const activeGymOrbits = useMemo(() => orbitTargets[activeGymCode] || [], [orbitTargets, activeGymCode]);

    // Calculate historical baselines if they don't exist
    const historicalSetters = useMemo(() => {
        if (!climbData) return {};
        return calculateHistoricalMetrics(climbData, gymSchedules);
    }, [climbData, gymSchedules]);

    // Merge historical with user overrides
    const settersInUse = useMemo(() => {
        const merged = { ...historicalSetters };
        Object.keys(simulatorSetters).forEach(name => {
            merged[name] = { ...merged[name], ...simulatorSetters[name] };
        });
        return merged;
    }, [historicalSetters, simulatorSetters]);

    const forecast = useMemo(() => {
        return calculateRotationForecast(
            activeGymCode,
            settersInUse,
            simulatorOverrides,
            simulatorVarianceBuffer,
            activeGymOrbits
        );
    }, [activeGymCode, settersInUse, simulatorOverrides, simulatorVarianceBuffer, activeGymOrbits]);

    const yearlyOutlook = useMemo(() => {
        return calculateYearlyOutlook(
            activeGymCode,
            settersInUse,
            simulatorVarianceBuffer,
            activeGymOrbits
        );
    }, [activeGymCode, settersInUse, simulatorVarianceBuffer, activeGymOrbits]);

    if (!climbData) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 p-12">
                <BarChart3 size={64} className="text-slate-200 mb-6" />
                <h2 className="text-2xl font-black text-[#00205B] uppercase tracking-tight mb-2">No Data Loaded</h2>
                <p className="text-slate-400 text-sm max-w-md text-center">
                    The Rotation Simulator requires historical production data. Please upload a Kaya CSV to get started.
                </p>
                <button
                    onClick={() => setActiveView('analytics')}
                    className="mt-8 px-8 py-4 bg-[#009CA6] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-[#009CA6]/20 hover:scale-[1.05] transition-all"
                >
                    Go to Data Upload
                </button>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
            {/* Header Area */}
            <header className="bg-white border-b border-slate-100 p-8 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-[#00205B] uppercase tracking-tighter mb-1">Rotation Simulator</h1>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">Strategic Capacity Planning • {activeGymCode}</p>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-2xl">
                    <button
                        onClick={() => setActiveTab('plan')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${activeTab === 'plan' ? 'bg-white shadow-lg text-[#00205B]' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <Calendar size={18} />
                        <span className="text-xs font-black uppercase tracking-widest">Simulator Plan</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('team')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${activeTab === 'team' ? 'bg-white shadow-lg text-[#00205B]' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <Users size={18} />
                        <span className="text-xs font-black uppercase tracking-widest">Team Profiles</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                <div className="max-w-7xl mx-auto space-y-12">

                    {/* Top Row: KPIs & Speedometer */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-white rounded-[2rem] p-10 shadow-2xl shadow-slate-200 border border-slate-100 flex items-center gap-12">
                            <RotationSpeedometer
                                currentWeeks={forecast.projectedWeeks}
                                targetWeeks={forecast.targetWeeks}
                                status={forecast.status}
                            />
                            <div className="flex-1 space-y-6">
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[#00205B]/40 mb-2">Gym Health Summary</h3>
                                    <p className="text-slate-600 text-sm font-medium leading-relaxed">
                                        At your current predicted horsepower of <span className="text-[#00205B] font-black">{forecast.weeklyHorsepower} climbs/week</span>,
                                        you will turn over the gym's <span className="text-[#00205B] font-black">{forecast.weeklyDebt} total climbs</span> every <span className="text-[#009CA6] font-black">{forecast.projectedWeeks} weeks</span>.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Pace</p>
                                        <p className="text-xl font-black text-[#00205B]">{forecast.targetWeeks} Weeks</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Weekly Goal</p>
                                        <p className="text-xl font-black text-[#00205B]">{Math.ceil(forecast.weeklyDebt / (forecast.targetWeeks || 1))} Climbs</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Variance Controls */}
                        <div className="bg-[#00205B] rounded-[2rem] p-10 text-white shadow-2xl space-y-8">
                            <div className="flex items-center gap-3">
                                <Settings2 className="text-[#EDE04B]" />
                                <h3 className="text-xs font-black uppercase tracking-widest">Attendance Buffer</h3>
                            </div>

                            <div className="space-y-6">
                                <p className="text-white/50 text-[11px] font-medium leading-relaxed">
                                    Apply a global variance buffer to account for unforeseen sickness, injuries, or administrative drag.
                                </p>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-black uppercase tracking-widest">Global Variance</span>
                                        <span className="text-3xl font-black text-[#EDE04B]">{simulatorVarianceBuffer}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="50"
                                        step="1"
                                        value={simulatorVarianceBuffer}
                                        onChange={(e) => setSimulatorVarianceBuffer(Number(e.target.value))}
                                        className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#EDE04B]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Discipline Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 font-sans">Bouldering Rotation</h3>
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-4xl font-black text-[#00205B]">{forecast.byDiscipline.Boulders.projected} <span className="text-sm font-bold text-slate-300">Wks</span></p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#009CA6] mt-2">Target: {forecast.byDiscipline.Boulders.target} Wks</p>
                                </div>
                                <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${forecast.byDiscipline.Boulders.status === 'on-track' ? 'bg-emerald-50 text-emerald-600' :
                                    forecast.byDiscipline.Boulders.status === 'lagging' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                                    }`}>
                                    {forecast.byDiscipline.Boulders.status}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 font-sans">Routes Rotation</h3>
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-4xl font-black text-[#00205B]">{forecast.byDiscipline.Routes.projected} <span className="text-sm font-bold text-slate-300">Wks</span></p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#009CA6] mt-2">Target: {forecast.byDiscipline.Routes.target} Wks</p>
                                </div>
                                <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${forecast.byDiscipline.Routes.status === 'on-track' ? 'bg-emerald-50 text-emerald-600' :
                                    forecast.byDiscipline.Routes.status === 'lagging' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                                    }`}>
                                    {forecast.byDiscipline.Routes.status}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Areas */}
                    {activeTab === 'plan' ? (
                        <>
                            <SimulatorCalendar
                                gymCode={activeGymCode}
                                setters={settersInUse}
                                overrides={simulatorOverrides}
                            />
                            <FutureHeatmap
                                gymCode={activeGymCode}
                                orbitForecasts={forecast.byOrbit}
                            />
                            <SimulatorTimeline
                                data={yearlyOutlook}
                                targetWeeks={forecast.targetWeeks}
                            />
                        </>
                    ) : (
                        <SetterProfileManager
                            setters={settersInUse}
                            onUpdateSetter={setSimulatorSetter}
                        />
                    )}

                </div>
            </main>
        </div>
    );
};

export default SimulatorView;
