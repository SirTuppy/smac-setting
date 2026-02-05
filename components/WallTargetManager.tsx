import React, { useMemo, useState } from 'react';
import { Target, Download, Upload, Trash2, RefreshCw, Layers, Zap, Compass, Building2, LayoutGrid, List } from 'lucide-react';
import { useDashboardStore } from '../store/useDashboardStore';
import UnifiedHeader from './UnifiedHeader';
import { WallTarget } from '../types';

const WallTargetManager: React.FC = () => {
    const {
        climbData,
        selectedGyms,
        wallTargets,
        setWallTarget,
        resetWallTargets,
        remoteTargetUrl,
        setRemoteTargetUrl,
        fetchRemoteTargets,
        dateRange,
        rangeOption,
        setRangeOption
    } = useDashboardStore();

    const [importError, setImportError] = useState<string | null>(null);

    // 1. Determine active gyms
    const activeGymCodes = useMemo(() => {
        if (selectedGyms.includes("Regional Overview") || selectedGyms.length === 0) {
            return Object.keys(climbData || {});
        }
        return selectedGyms;
    }, [selectedGyms, climbData]);

    // 2. Discover walls per gym
    const gymWalls = useMemo(() => {
        const result: Record<string, string[]> = {};
        activeGymCodes.forEach(gymCode => {
            if (!climbData || !climbData[gymCode]) {
                result[gymCode] = [];
                return;
            }
            const walls = new Set<string>();
            climbData[gymCode].forEach(climb => {
                if (climb.wall) walls.add(climb.wall.toLowerCase().trim());
            });
            result[gymCode] = Array.from(walls).sort();
        });
        return result;
    }, [climbData, activeGymCodes]);

    // 3. Export to JSON
    const handleExport = () => {
        const dataToExport: Record<string, Record<string, WallTarget>> = {};
        activeGymCodes.forEach(code => {
            dataToExport[code] = wallTargets[code] || {};
        });
        const dataStr = JSON.stringify(dataToExport, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = activeGymCodes.length === 1 ? `${activeGymCodes[0]}_wall_targets.json` : `regional_wall_targets.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    // 4. Import from File
    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                Object.entries(json).forEach(([gymCode, targets]) => {
                    Object.entries(targets as Record<string, WallTarget>).forEach(([wallName, target]) => {
                        setWallTarget(gymCode, wallName, target);
                    });
                });
                setImportError(null);
            } catch (err) {
                setImportError("Invalid JSON file.");
            }
        };
        reader.readAsText(file);
    };

    const getGymSummary = (gymCode: string) => {
        const targets = wallTargets[gymCode] || {};
        let ropeVol = 0;
        let boulderVol = 0;
        Object.values(targets).forEach(t => {
            if (t.type === 'rope') ropeVol += t.targetCount || 0;
            else boulderVol += t.targetCount || 0;
        });
        return { ropeVol, boulderVol };
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 text-[#00205B]">
            <UnifiedHeader
                title="Wall Target Manager"
                subtitle="Manage volume & efficiency benchmarks per gym and wall"
                dateRange={dateRange}
                rangeOption={rangeOption}
                onRangeOptionChange={setRangeOption}
                onCustomDateChange={() => { }}
                actions={
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                        >
                            <Download size={12} />
                            Export JSON
                        </button>
                        <label className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm cursor-pointer">
                            <Upload size={12} />
                            Import JSON
                            <input type="file" className="hidden" accept=".json" onChange={handleImport} />
                        </label>
                    </div>
                }
            />

            <main className="flex-1 p-8 max-w-6xl mx-auto w-full space-y-12 animate-in fade-in duration-700">
                {/* Master Sync Section */}
                <div className="bg-[#00205B] rounded-2xl p-6 shadow-xl text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/10 p-2 rounded-xl">
                                <RefreshCw size={20} className="text-[#009CA6]" />
                            </div>
                            <div>
                                <h3 className="font-black uppercase tracking-tight">Master Sync (Director)</h3>
                                <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Pull shared targets from a GitHub Gist</p>
                            </div>
                        </div>
                        <button
                            onClick={async () => {
                                try {
                                    setImportError(null);
                                    await fetchRemoteTargets();
                                    alert("Sync successful!");
                                } catch (err) {
                                    setImportError("Sync failed: Check your URL or internet connection (CORS).");
                                }
                            }}
                            className="bg-[#009CA6] hover:bg-[#009CA6]/80 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg"
                        >
                            Sync Now
                        </button>
                    </div>
                    <input
                        type="text"
                        placeholder="Director's Gist Raw URL..."
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#009CA6]/50 outline-none transition-all placeholder:text-white/20"
                        value={remoteTargetUrl || ''}
                        onChange={(e) => setRemoteTargetUrl(e.target.value)}
                    />
                </div>

                {importError && (
                    <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-rose-500 text-xs font-bold uppercase tracking-widest text-center">
                        {importError}
                    </div>
                )}

                {activeGymCodes.length === 0 ? (
                    <div className="p-20 text-center space-y-4">
                        <Building2 size={48} className="mx-auto text-slate-200" />
                        <p className="text-slate-400 font-black uppercase tracking-widest">No gyms selected or data available.</p>
                        <p className="text-slate-300 text-xs">Select gyms in the sidebar to begin.</p>
                    </div>
                ) : (
                    activeGymCodes.map(gymCode => {
                        const summary = getGymSummary(gymCode);
                        const walls = gymWalls[gymCode] || [];
                        const currentTargets = wallTargets[gymCode] || {};

                        return (
                            <section key={gymCode} className="space-y-6">
                                {/* Gym Header & Summary Cards */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-[#00205B] flex items-center justify-center text-white shadow-lg">
                                            <Building2 size={20} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black uppercase tracking-tighter text-[#00205B]">{gymCode}</h2>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Target Configuration</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center min-w-[100px]">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Rope Target</span>
                                            <span className="text-lg font-black text-[#00205B]">{summary.ropeVol}</span>
                                        </div>
                                        <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center min-w-[100px]">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Boulder Target</span>
                                            <span className="text-lg font-black text-[#009CA6]">{summary.boulderVol}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Wall Grid */}
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="grid grid-cols-12 px-6 mb-2">
                                        <div className="col-span-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Wall Name</div>
                                        <div className="col-span-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</div>
                                        <div className="col-span-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Vol</div>
                                        <div className="col-span-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Efficiency</div>
                                    </div>

                                    {walls.length === 0 ? (
                                        <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-10 text-center">
                                            <p className="text-slate-300 text-xs font-bold uppercase">No walls found for {gymCode}. Upload data to discover.</p>
                                        </div>
                                    ) : (
                                        walls.map(wall => {
                                            const target = currentTargets[wall] || {
                                                targetCount: 0,
                                                targetClimbsPerSetter: 4.0,
                                                type: wall.toLowerCase().includes('boulder') ? 'boulder' : 'rope'
                                            };

                                            return (
                                                <div key={wall} className="grid grid-cols-12 items-center bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                                                    <div className="col-span-4 flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-[10px] uppercase shadow-sm ${target.type === 'rope' ? 'bg-[#00205B]' : 'bg-[#009CA6]'}`}>
                                                            {target.type === 'rope' ? 'R' : 'B'}
                                                        </div>
                                                        <span className="font-black uppercase tracking-tight text-sm text-[#00205B] truncate pr-2">{wall}</span>
                                                    </div>

                                                    <div className="col-span-2">
                                                        <select
                                                            className="bg-slate-50 border-none rounded-lg px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#00205B] focus:ring-1 focus:ring-[#009CA6] cursor-pointer"
                                                            value={target.type}
                                                            onChange={(e) => setWallTarget(gymCode, wall, { type: e.target.value as 'rope' | 'boulder' })}
                                                        >
                                                            <option value="rope">Rope</option>
                                                            <option value="boulder">Boulder</option>
                                                        </select>
                                                    </div>

                                                    <div className="col-span-3">
                                                        <div className="flex items-center gap-2">
                                                            <Layers size={14} className="text-slate-300" />
                                                            <input
                                                                type="number"
                                                                className="w-20 bg-slate-50 border-none rounded-lg px-2 py-1.5 text-xs font-black focus:ring-1 focus:ring-[#009CA6] transition-all"
                                                                value={target.targetCount || ''}
                                                                onChange={(e) => setWallTarget(gymCode, wall, { targetCount: parseInt(e.target.value) || 0 })}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="col-span-3 flex items-center justify-end gap-4">
                                                        <div className="flex items-center gap-2">
                                                            <Zap size={14} className="text-[#009CA6]/40" />
                                                            <input
                                                                type="number"
                                                                step="0.1"
                                                                className="w-16 bg-slate-50 border-none rounded-lg px-2 py-1.5 text-xs font-black focus:ring-1 focus:ring-[#009CA6] transition-all"
                                                                value={target.targetClimbsPerSetter || ''}
                                                                onChange={(e) => setWallTarget(gymCode, wall, { targetClimbsPerSetter: parseFloat(e.target.value) || 0 })}
                                                            />
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                if (window.confirm(`Delete targets for ${wall}?`)) {
                                                                    setWallTarget(gymCode, wall, { targetCount: 0, targetClimbsPerSetter: 4.0 });
                                                                }
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 p-2 text-slate-200 hover:text-rose-400 transition-all"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                                <div className="border-b border-slate-100 pb-12 last:border-none" />
                            </section>
                        );
                    })
                )}

                <div className="flex justify-end pt-8">
                    <button
                        onClick={() => {
                            if (window.confirm("Nuclear Option: Reset ALL targets for ALL selected gyms?")) {
                                activeGymCodes.forEach(code => resetWallTargets(code));
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-3 bg-rose-50 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all font-bold"
                    >
                        <Trash2 size={16} />
                        Reset All Selected Gyms
                    </button>
                </div>
            </main>
        </div>
    );
};

export default WallTargetManager;
