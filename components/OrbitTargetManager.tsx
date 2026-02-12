import React, { useState, useMemo } from 'react';
import { Target, Save, Trash2, Plus, Info, Layers, ChevronRight, ChevronDown, ChevronUp, Mountain, Compass, RefreshCw, X } from 'lucide-react';
import { useDashboardStore } from '../store/useDashboardStore';
import { OrbitTarget, WallTarget } from '../types';
import { GYMS } from '../constants/gyms';
import { getGymCode } from '../constants/mapTemplates';

const ANGLE_OPTS: WallTarget['angle'][] = ['slab', 'vert', 'overhang', 'steep'];

const OrbitTargetManager: React.FC = () => {
    const {
        orbitTargets,
        setOrbitTargets,
        selectedGyms,
        climbData,
        wallTargets,
        setWallTarget,
        resetWallTargets,
        remoteTargetUrl,
        setRemoteTargetUrl,
        fetchRemoteTargets,
        assignWallToOrbit,
        removeWallFromOrbit,
        setWallCharacteristic,
        reorderOrbit,
        updateOrbit: updateStoreOrbit,
        activeOrbitGym,
        setActiveOrbitGym
    } = useDashboardStore();

    const [expandedOrbit, setExpandedOrbit] = useState<string | null>(null);
    const [importError, setImportError] = useState<string | null>(null);

    const activeGymCode = useMemo(() => {
        const primary = selectedGyms[0];
        if (primary && primary !== 'Regional Overview') {
            return getGymCode(primary) || primary;
        }
        return activeOrbitGym;
    }, [selectedGyms, activeOrbitGym]);

    const activeGym = GYMS.find(g => g.code === activeGymCode);
    const currentOrbits = activeGymCode ? (orbitTargets[activeGymCode] || []) : [];

    // Get all walls for this gym (from data or targets)
    const gymWalls = useMemo(() => {
        if (!activeGymCode) return [];
        const walls = new Set<string>();

        if (climbData && climbData[activeGymCode]) {
            climbData[activeGymCode].forEach(c => {
                if (c.wall) walls.add(c.wall.toLowerCase().trim());
            });
        }

        const targets = wallTargets[activeGymCode] || {};
        Object.keys(targets).forEach(w => walls.add(w.toLowerCase().trim()));

        return Array.from(walls).sort();
    }, [climbData, activeGymCode, wallTargets]);

    const unassignedWalls = useMemo(() => {
        const assigned = new Set(currentOrbits.flatMap(o => o.assignedWalls || []));
        return gymWalls.filter(w => !assigned.has(w));
    }, [gymWalls, currentOrbits]);

    const handleAddOrbit = () => {
        if (!activeGymCode) return;
        const newOrbit: OrbitTarget = {
            id: crypto.randomUUID(),
            gymCode: activeGymCode,
            region: activeGym?.region || '',
            orbitName: 'New Orbit',
            discipline: 'Boulders',
            totalClimbs: 0,
            assignedWalls: [],
            rps: 4.0,
            shiftDuration: 8,
            rotationTarget: 6.5,
            weeklyProductionGoal: 0,
            weeklyShiftGoal: 0,
            payPeriodHoursGoal: 0,
            hoursPerClimbGoal: 2.0,
            rationale: ''
        };
        setOrbitTargets(activeGymCode, [...currentOrbits, newOrbit]);
    };

    const updateOrbit = (id: string, updates: Partial<OrbitTarget>) => {
        updateStoreOrbit(activeGymCode, id, updates);
    };

    const removeOrbit = (id: string) => {
        if (window.confirm("Are you sure you want to delete this orbit? This will unassign all its walls.")) {
            setOrbitTargets(activeGymCode, currentOrbits.filter(o => o.id !== id));
        }
    };

    const handleAddWall = () => {
        if (!activeGymCode) return;
        const name = window.prompt("Enter new wall name:");
        if (name) {
            const normalized = name.toLowerCase().trim();
            setWallTarget(activeGymCode, normalized, {
                displayName: name,
                type: normalized.includes('boulder') || normalized.includes('cave') ? 'boulder' : 'rope',
                targetCount: 0
            });
        }
    };

    const handleCopySyncCode = () => {
        const payload = {
            wallTargets: activeGymCode ? { [activeGymCode]: wallTargets[activeGymCode] } : wallTargets,
            orbitTargets: activeGymCode ? { [activeGymCode]: orbitTargets[activeGymCode] } : orbitTargets
        };
        navigator.clipboard.writeText(JSON.stringify(payload));
        alert("Gym Setup Code copied! You can now share this with the National Director or import it into another session.");
    };

    const handlePasteSyncCode = async () => {
        const code = window.prompt("Paste Gym Setup Code:");
        if (!code) return;
        try {
            const json = JSON.parse(code);
            if (json.wallTargets) {
                Object.entries(json.wallTargets).forEach(([gc, targets]: [string, any]) => {
                    Object.entries(targets).forEach(([w, t]: [string, any]) => setWallTarget(gc, w, t));
                });
            }
            if (json.orbitTargets) {
                Object.entries(json.orbitTargets).forEach(([gc, orbits]: [string, any]) => {
                    setOrbitTargets(gc, orbits);
                });
            }
            alert("Merge successful!");
        } catch (e) {
            setImportError("Invalid Sync Code");
        }
    };

    const handleExportJSON = () => {
        const payload = { wallTargets, orbitTargets };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `production_settings_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    };

    if (!activeGymCode) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border-2 border-dashed border-slate-200 text-slate-400">
                <Target size={48} className="mb-4 opacity-20" />
                <p className="text-lg font-medium text-[#00205B]">Manage All Orbits Log</p>
                <p className="text-sm mb-6">Select a gym to define your rotation targets</p>

                <select
                    value={activeOrbitGym || ''}
                    onChange={(e) => setActiveOrbitGym(e.target.value)}
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
        <div className="space-y-6 animate-in fade-in duration-700 max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-[#00205B] flex items-center gap-3">
                        <Compass className="text-brand-yellow" size={32} strokeWidth={3} />
                        All Orbits Log: {activeGym?.name}
                    </h2>
                    <p className="text-slate-500 font-medium whitespace-nowrap">Aggregate walls into orbits to define bi-weekly production requirements.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button id="tour-share-setup" onClick={handleCopySyncCode} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-[#00205B] hover:border-[#00205B] transition-all" title="Share Gym Setup Code">
                        <Layers size={18} />
                    </button>
                    <button id="tour-merge-gym" onClick={handlePasteSyncCode} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-[#00205B] hover:border-[#00205B] transition-all" title="Import/Merge Gym Setup">
                        <Plus size={18} />
                    </button>
                    <button onClick={handleExportJSON} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-[#00205B] hover:border-[#00205B] transition-all" title="Export JSON Master">
                        <Save size={18} />
                    </button>
                    <button
                        onClick={handleAddOrbit}
                        className="flex items-center gap-2 bg-[#00205B] text-white px-6 py-3 rounded-xl hover:bg-opacity-90 transition-all font-black uppercase tracking-widest shadow-xl active:scale-95 ml-2"
                    >
                        <Plus size={20} />
                        Add Orbit
                    </button>
                </div>
            </div>

            {/* Sync Alert / Bar */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-4">
                <div className="flex items-center gap-3 min-w-fit">
                    <div className="bg-[#00205B]/5 p-2 rounded-lg">
                        <RefreshCw size={16} className="text-[#00205B]" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-tight">Master Cloud Sync</span>
                </div>
                <input
                    type="text"
                    placeholder="Enter Master Gist/Cloud URL..."
                    className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#009CA6] transition-all"
                    value={remoteTargetUrl || ''}
                    onChange={(e) => setRemoteTargetUrl(e.target.value)}
                />
                <button
                    onClick={() => fetchRemoteTargets().then(() => alert('Successfully updated from cloud!'))}
                    className="bg-[#00205B] hover:bg-[#00205B]/90 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg whitespace-nowrap"
                >
                    Refresh from Cloud
                </button>
            </div>

            {importError && (
                <div className="p-3 bg-rose-50 text-rose-500 rounded-xl text-xs font-bold text-center animate-pulse">
                    {importError}
                </div>
            )}

            {/* Orbit List */}
            <div className="space-y-4">
                {currentOrbits.map((orbit) => (
                    <div key={orbit.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:border-[#00205B]/30">
                        {/* Orbit Header */}
                        <div className="p-5 flex items-center gap-4 bg-slate-50/50">
                            <div className="flex flex-col gap-1 pr-2 border-r border-slate-200">
                                <button onClick={() => reorderOrbit(activeGymCode, orbit.id, 'up')} className="p-1 text-slate-300 hover:text-[#00205B] transition-colors"><ChevronUp size={14} /></button>
                                <button onClick={() => reorderOrbit(activeGymCode, orbit.id, 'down')} className="p-1 text-slate-300 hover:text-[#00205B] transition-colors"><ChevronDown size={14} /></button>
                            </div>

                            <button onClick={() => setExpandedOrbit(expandedOrbit === orbit.id ? null : orbit.id)} className="text-slate-400 hover:text-[#00205B] ml-2">
                                {expandedOrbit === orbit.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                            </button>

                            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                                <input
                                    type="text"
                                    value={orbit.orbitName}
                                    onChange={(e) => updateOrbit(orbit.id, { orbitName: e.target.value })}
                                    className="bg-transparent border-none p-0 text-lg font-black text-[#00205B] focus:ring-0 placeholder:text-slate-300"
                                    placeholder="Orbit Name (e.g. Interior Walls)"
                                />

                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Total Climbs</span>
                                    <span className="text-xl font-black text-brand-blue">{orbit.totalClimbs}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">RPS Target</span>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={orbit.rps}
                                        onChange={(e) => updateOrbit(orbit.id, { rps: Number(e.target.value) })}
                                        className="w-16 bg-white border border-slate-200 rounded px-2 py-1 text-sm font-bold text-brand-yellow"
                                    />
                                </div>

                                <div className="flex items-center gap-2 justify-end">
                                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Labor Goal</span>
                                    <span className="text-xl font-black text-[#00205B]">{orbit.payPeriodHoursGoal.toFixed(0)}h</span>
                                </div>
                            </div>

                            <button onClick={() => removeOrbit(orbit.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors ml-2">
                                <Trash2 size={20} />
                            </button>
                        </div>

                        {/* Expanded Wall Management */}
                        {expandedOrbit === orbit.id && (
                            <div className="p-6 border-t border-slate-100 bg-white grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-top-2 duration-300">
                                <div>
                                    <div className="flex items-center justify-between mb-4 px-1">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                            <Layers size={12} /> Assigned Walls
                                        </h3>
                                        <div className="flex items-center gap-6 text-center mr-1">
                                            <span className="w-8 text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-tight">Target<br />Climbs</span>
                                            <span className="w-12 text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-tight">RPS</span>
                                            <div className="w-[120px]" /> {/* Spacer for Angle/Action */}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {orbit.assignedWalls?.map(wallName => {
                                            const target = wallTargets[activeGymCode]?.[wallName];
                                            return (
                                                <div key={wallName} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className={`w-2 h-2 shrink-0 rounded-full ${target?.type === 'rope' ? 'bg-[#00205B]' : 'bg-[#009CA6]'}`} />
                                                        <span className="font-bold text-sm text-slate-700 capitalize truncate">{target?.displayName || wallName}</span>
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-4">
                                                            <input
                                                                type="number"
                                                                className="w-12 h-8 text-[11px] font-black text-center text-[#00205B] bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#00205B] transition-all shadow-sm"
                                                                value={target?.targetCount || 0}
                                                                onChange={(e) => {
                                                                    setWallTarget(activeGymCode, wallName, { targetCount: parseInt(e.target.value) || 0 });
                                                                    updateOrbit(orbit.id, {}); // Trigger recalc
                                                                }}
                                                            />
                                                            <input
                                                                type="number"
                                                                step="0.1"
                                                                className="w-12 h-8 text-[11px] font-black text-center text-[#009CA6] bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#009CA6] transition-all shadow-sm"
                                                                value={target?.targetClimbsPerSetter || 0}
                                                                onChange={(e) => setWallTarget(activeGymCode, wallName, { targetClimbsPerSetter: parseFloat(e.target.value) || 0 })}
                                                            />
                                                        </div>

                                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                            <div className="relative">
                                                                <select
                                                                    value={target?.angle || 'none'}
                                                                    onChange={(e) => setWallCharacteristic(activeGymCode, wallName, e.target.value as WallTarget['angle'])}
                                                                    className="appearance-none text-[9px] font-black uppercase tracking-wider py-1.5 pl-2.5 pr-6 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#00205B] focus:border-[#00205B] cursor-pointer hover:border-slate-300 transition-all shadow-sm min-w-[70px]"
                                                                >
                                                                    <option value="none">ANGLE</option>
                                                                    {ANGLE_OPTS.map(opt => <option key={opt} value={opt}>{opt.toUpperCase()}</option>)}
                                                                </select>
                                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                                    <ChevronDown size={10} />
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => removeWallFromOrbit(activeGymCode, orbit.id, wallName)}
                                                                className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                                title="Remove wall"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {(orbit.assignedWalls?.length === 0) && (
                                            <p className="text-xs text-slate-400 italic p-4 text-center border-2 border-dashed border-slate-100 rounded-xl">No walls assigned to this orbit.</p>
                                        )}
                                    </div>

                                    <div className="mt-8">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Rationale & Turnaround Strategy</h3>
                                        <textarea
                                            value={orbit.rationale || ''}
                                            onChange={(e) => updateOrbit(orbit.id, { rationale: e.target.value })}
                                            placeholder="Define the 'Why' behind this orbit's rotation targets..."
                                            className="w-full h-24 p-3 text-sm bg-slate-50 border-slate-200 rounded-xl focus:ring-[#00205B] focus:border-[#00205B] transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-[#00205B]">Available Walls</h3>
                                        <button onClick={handleAddWall} className="text-[10px] font-black uppercase text-[#009CA6] flex items-center gap-1 hover:underline">
                                            <Plus size={12} /> New Wall
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 h-fit max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {unassignedWalls.map(wall => (
                                            <button
                                                key={wall}
                                                onClick={() => assignWallToOrbit(activeGymCode, orbit.id, wall)}
                                                className="flex flex-col text-left p-2 bg-white border border-slate-100 rounded-lg hover:border-[#00205B] hover:shadow-sm transition-all group"
                                            >
                                                <span className="text-[11px] font-bold text-slate-600 truncate w-full capitalize">{(wallTargets[activeGymCode]?.[wall]?.displayName || wall)}</span>
                                                <span className="text-[9px] font-black text-slate-300 group-hover:text-[#00205B]">Vol: {wallTargets[activeGymCode]?.[wall]?.targetCount || 0}</span>
                                            </button>
                                        ))}
                                        {unassignedWalls.length === 0 && (
                                            <p className="col-span-2 text-xs text-slate-400 italic p-8 text-center bg-slate-50 rounded-xl">All detected walls are assigned.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-slate-200">
                <div className="bg-[#00205B] p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <Target size={120} />
                    </div>
                    <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Total Production Units</h3>
                    <p className="text-5xl font-black text-white leading-none">
                        {currentOrbits.reduce((sum, o) => sum + o.totalClimbs, 0)}
                    </p>
                    <p className="text-sky-400 font-bold text-sm mt-4">Active dataset for {activeGymCode}</p>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Avg Rotation Window</h3>
                    <p className="text-5xl font-black text-[#00205B] leading-none">
                        {(currentOrbits.reduce((sum, o) => sum + o.rotationTarget, 0) / (currentOrbits.length || 1)).toFixed(1)}
                    </p>
                    <p className="text-brand-yellow font-bold text-sm mt-4">Weeks per orbit</p>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute -bottom-4 -right-4 bg-[#00205B]/5 p-8 rounded-full">
                        <Mountain size={64} className="text-[#00205B]/10" />
                    </div>
                    <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Bi-Weekly Hours Required</h3>
                    <p className="text-5xl font-black text-[#00205B] leading-none">
                        {currentOrbits.reduce((sum, o) => sum + o.payPeriodHoursGoal, 0).toFixed(0)}h
                    </p>
                    <p className="text-slate-400 font-bold text-sm mt-4 italic">Clocked labor to hit targets</p>
                </div>
            </div>
        </div>
    );
};

export default OrbitTargetManager;
