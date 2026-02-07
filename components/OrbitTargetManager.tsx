import React, { useState } from 'react';
import { Target, Save, Trash2, Plus, Info } from 'lucide-react';
import { useDashboardStore } from '../store/useDashboardStore';
import { OrbitTarget } from '../types';
import { GYMS } from '../constants/gyms';

const OrbitTargetManager: React.FC = () => {
    const { orbitTargets, setOrbitTargets, selectedGyms } = useDashboardStore();
    const [manualGymCode, setManualGymCode] = useState<string>('');

    const activeGymCode = selectedGyms[0] === 'Regional Overview' ? manualGymCode : selectedGyms[0];
    const activeGym = GYMS.find(g => g.code === activeGymCode);

    const currentTargets = activeGymCode ? (orbitTargets[activeGymCode] || []) : [];

    const handleAddTarget = () => {
        if (!activeGymCode) return;
        const newTarget: OrbitTarget = {
            id: crypto.randomUUID(),
            gymCode: activeGymCode,
            region: activeGym?.region || '',
            orbitName: 'New Orbit',
            discipline: 'Boulders',
            totalClimbs: 50,
            rps: 4.0,
            shiftDuration: 8,
            rotationTarget: 6.5,
            weeklyProductionGoal: 0,
            weeklyShiftGoal: 0,
            payPeriodHoursGoal: 0,
            hoursPerClimbGoal: 0
        };
        // Calculate derived fields
        calculateDerivedFields(newTarget);
        setOrbitTargets(activeGymCode, [...currentTargets, newTarget]);
    };

    const calculateDerivedFields = (t: OrbitTarget) => {
        // weeklyProductionGoal = totalClimbs / rotationTarget
        t.weeklyProductionGoal = Number((t.totalClimbs / t.rotationTarget).toFixed(1));

        // weeklyShiftGoal = weeklyProductionGoal / rps
        t.weeklyShiftGoal = Number((t.weeklyProductionGoal / t.rps).toFixed(1));

        // payPeriodHoursGoal = (weeklyShiftGoal * shiftDuration) * 2 (bi-weekly)
        t.payPeriodHoursGoal = Number((t.weeklyShiftGoal * t.shiftDuration * 2).toFixed(1));

        // hoursPerClimbGoal = shiftDuration / rps
        t.hoursPerClimbGoal = Number((t.shiftDuration / t.rps).toFixed(1));
    };

    const updateTarget = (id: string, updates: Partial<OrbitTarget>) => {
        const updated = currentTargets.map(t => {
            if (t.id === id) {
                const newT = { ...t, ...updates };
                calculateDerivedFields(newT);
                return newT;
            }
            return t;
        });
        setOrbitTargets(activeGymCode, updated);
    };

    const removeTarget = (id: string) => {
        setOrbitTargets(activeGymCode, currentTargets.filter(t => t.id !== id));
    };

    if (!activeGymCode) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border-2 border-dashed border-slate-200 text-slate-400">
                <Target size={48} className="mb-4 opacity-20" />
                <p className="text-lg font-medium text-[#00205B]">Manage Orbit Targets</p>
                <p className="text-sm mb-6">Select a gym to define your All Orbits Log</p>

                <select
                    value={manualGymCode}
                    onChange={(e) => setManualGymCode(e.target.value)}
                    className="w-64 p-3 rounded-xl border border-slate-200 text-slate-600 font-bold focus:ring-[#00205B] focus:border-[#00205B]"
                >
                    <option value="">-- Choose a Gym --</option>
                    {GYMS.map(g => (
                        <option key={g.code} value={g.code}>{g.name}</option>
                    ))}
                </select>
                <p className="text-[10px] mt-8 uppercase tracking-widest font-black opacity-40">Regional targets cannot be managed in aggregate.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-[#00205B] flex items-center gap-2">
                        <Target className="text-brand-yellow" strokeWidth={2.5} />
                        All Orbits Log: {activeGym?.name}
                    </h2>
                    <p className="text-slate-500">Define production targets and rotations for each orbit/area.</p>
                </div>
                <button
                    onClick={handleAddTarget}
                    className="flex items-center gap-2 bg-[#00205B] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all font-semibold shadow-sm"
                >
                    <Plus size={20} />
                    Add Orbit
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-bottom border-slate-200">
                            <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-500">Orbit Name</th>
                            <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-500">Discipline</th>
                            <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-500 text-center">Total Climbs</th>
                            <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-500 text-center">RPS</th>
                            <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-500 text-center">Shift Hrs</th>
                            <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-500 text-center">Rot. Weeks</th>
                            <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-500 text-right bg-brand-yellow/5">Hrs / Climb</th>
                            <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {currentTargets.map((target) => (
                            <tr key={target.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="p-4">
                                    <input
                                        type="text"
                                        value={target.orbitName}
                                        onChange={(e) => updateTarget(target.id, { orbitName: e.target.value })}
                                        className="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#00205B] focus:ring-0 w-full font-medium"
                                    />
                                </td>
                                <td className="p-4">
                                    <select
                                        value={target.discipline}
                                        onChange={(e) => updateTarget(target.id, { discipline: e.target.value as 'Boulders' | 'Routes' })}
                                        className="bg-transparent border-none p-0 focus:ring-0 font-medium"
                                    >
                                        <option value="Boulders">Boulders</option>
                                        <option value="Routes">Routes</option>
                                    </select>
                                </td>
                                <td className="p-4 text-center">
                                    <input
                                        type="number"
                                        value={target.totalClimbs}
                                        onChange={(e) => updateTarget(target.id, { totalClimbs: Number(e.target.value) })}
                                        className="w-16 bg-slate-100 border-none rounded p-1 text-center font-semibold"
                                    />
                                </td>
                                <td className="p-4 text-center">
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={target.rps}
                                        onChange={(e) => updateTarget(target.id, { rps: Number(e.target.value) })}
                                        className="w-16 bg-slate-100 border-none rounded p-1 text-center font-semibold"
                                    />
                                </td>
                                <td className="p-4 text-center text-slate-400">
                                    <input
                                        type="number"
                                        value={target.shiftDuration}
                                        onChange={(e) => updateTarget(target.id, { shiftDuration: Number(e.target.value) })}
                                        className="w-12 bg-transparent text-center focus:ring-0 border-none"
                                    />
                                </td>
                                <td className="p-4 text-center">
                                    <input
                                        type="number"
                                        step="0.5"
                                        value={target.rotationTarget}
                                        onChange={(e) => updateTarget(target.id, { rotationTarget: Number(e.target.value) })}
                                        className="w-16 bg-slate-100 border-none rounded p-1 text-center font-semibold"
                                    />
                                </td>
                                <td className="p-4 text-right bg-brand-yellow/5 font-mono font-bold text-brand-blue">
                                    {target.hoursPerClimbGoal.toFixed(1)}h
                                </td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => removeTarget(target.id)}
                                        className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {currentTargets.length === 0 && (
                            <tr>
                                <td colSpan={8} className="p-12 text-center text-slate-400 italic">
                                    No orbits defined. Click "Add Orbit" to start building your target log.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 text-slate-500">
                        <Info size={18} />
                        <h3 className="font-bold uppercase text-xs tracking-widest">Target Hours Produced</h3>
                    </div>
                    <p className="text-3xl font-black text-[#00205B]">
                        {currentTargets.reduce((sum, t) => sum + (t.totalClimbs * t.hoursPerClimbGoal), 0).toFixed(0)}h
                    </p>
                    <p className="text-sm text-slate-400 mt-1">Total "Units of Work" in rotation</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 text-slate-500">
                        <Info size={18} />
                        <h3 className="font-bold uppercase text-xs tracking-widest">Avg Efficiency Target</h3>
                    </div>
                    <p className="text-3xl font-black text-brand-yellow">
                        {(currentTargets.reduce((sum, t) => sum + t.rps, 0) / (currentTargets.length || 1)).toFixed(1)}
                    </p>
                    <p className="text-sm text-slate-400 mt-1">Weighted climbs per shift</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 text-slate-500">
                        <Info size={18} />
                        <h3 className="font-bold uppercase text-xs tracking-widest">Bi-Weekly Labor Goal</h3>
                    </div>
                    <p className="text-3xl font-black text-[#00205B]">
                        {currentTargets.reduce((sum, t) => sum + t.payPeriodHoursGoal, 0).toFixed(0)}h
                    </p>
                    <p className="text-sm text-slate-400 mt-1">Clocked hours required to hit rotation</p>
                </div>
            </div>
        </div>
    );
};

export default OrbitTargetManager;
