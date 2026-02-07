import React, { useMemo, useState } from 'react';
import { Target, Download, Upload, Trash2, RefreshCw, Layers, Zap, Compass, Building2, LayoutGrid, List, Check, Plus, Edit2, X } from 'lucide-react';
import { useDashboardStore } from '../store/useDashboardStore';
import UnifiedHeader from './UnifiedHeader';
import { WallTarget } from '../types';

const WallTypeToggle: React.FC<{
    type: 'rope' | 'boulder';
    onChange: (type: 'rope' | 'boulder') => void;
}> = ({ type, onChange }) => (
    <div className="flex bg-slate-100 p-0.5 rounded-lg w-24">
        <button
            onClick={() => onChange('rope')}
            className={`flex-1 py-1 rounded-md text-[9px] font-black uppercase tracking-tight transition-all ${type === 'rope' ? 'bg-[#00205B] text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
        >
            Rope
        </button>
        <button
            onClick={() => onChange('boulder')}
            className={`flex-1 py-1 rounded-md text-[9px] font-black uppercase tracking-tight transition-all ${type === 'boulder' ? 'bg-[#009CA6] text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
        >
            Bld
        </button>
    </div>
);

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
    const [editingWall, setEditingWall] = useState<{ gym: string, wall: string } | null>(null);
    const [tempDisplayName, setTempDisplayName] = useState("");

    const activeGymCodes = useMemo(() => {
        if (selectedGyms.includes("Regional Overview") || selectedGyms.length === 0) {
            return Object.keys(climbData || {});
        }
        return selectedGyms;
    }, [selectedGyms, climbData]);

    const gymWalls = useMemo(() => {
        const result: Record<string, string[]> = {};
        activeGymCodes.forEach(gymCode => {
            const walls = new Set<string>();

            // 1. Discover from data
            if (climbData && climbData[gymCode]) {
                climbData[gymCode].forEach(climb => {
                    if (climb.wall) walls.add(climb.wall.toLowerCase().trim());
                });
            }

            // 2. Discover from existing targets (includes manual ones)
            if (wallTargets[gymCode]) {
                Object.keys(wallTargets[gymCode]).forEach(w => walls.add(w));
            }

            result[gymCode] = Array.from(walls).sort();
        });
        return result;
    }, [climbData, activeGymCodes, wallTargets]);

    const handleExport = () => {
        const dataToExport: Record<string, Record<string, WallTarget>> = {};
        activeGymCodes.forEach(code => {
            dataToExport[code] = wallTargets[code] || {};
        });
        const dataStr = JSON.stringify(dataToExport, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', 'wall_targets.json');
        linkElement.click();
    };

    const handleExportCSV = () => {
        const headers = ["Gym", "Wall ID", "Display Name", "Type", "Target Volume", "Efficiency"];
        const rows: string[][] = [];

        activeGymCodes.forEach(gymCode => {
            const targets = wallTargets[gymCode] || {};
            Object.entries(targets).forEach(([wallName, target]) => {
                rows.push([
                    gymCode,
                    wallName,
                    target.displayName || wallName,
                    target.type,
                    (target.targetCount || 0).toString(),
                    (target.targetClimbsPerSetter || 0).toString()
                ]);
            });
        });

        const csvContent = [
            headers.join(","),
            ...rows.map(r => r.map(cell => `"${cell.replace(/"/g, '""')}"`).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "wall_targets_summary.csv");
        link.click();
    };

    const handleCopySyncCode = () => {
        const dataToExport: Record<string, Record<string, WallTarget>> = {};
        activeGymCodes.forEach(code => {
            dataToExport[code] = wallTargets[code] || {};
        });
        navigator.clipboard.writeText(JSON.stringify(dataToExport));
        alert("Sync Code copied to clipboard! Send this to your Director.");
    };

    const handlePasteSyncCode = async () => {
        const code = window.prompt("Paste the Sync Code from your Head Setter:");
        if (!code) return;
        try {
            const json = JSON.parse(code);
            Object.entries(json).forEach(([gymCode, targets]) => {
                Object.entries(targets as Record<string, WallTarget>).forEach(([wallName, target]) => {
                    setWallTarget(gymCode, wallName, target);
                });
            });
            alert("Merge successful!");
        } catch (err) {
            setImportError("Invalid Sync Code. Make sure you copied the whole block.");
        }
    };

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
        let ropeVol = 0, boulderVol = 0;
        Object.values(targets).forEach(t => {
            if (t.type === 'rope') ropeVol += t.targetCount || 0;
            else boulderVol += t.targetCount || 0;
        });
        return { ropeVol, boulderVol };
    };

    const handleAddWall = (gymCode: string) => {
        const wallName = window.prompt("Enter new wall name:");
        if (wallName) {
            const normalizedName = wallName.toLowerCase().trim();
            setWallTarget(gymCode, normalizedName, {
                isManual: true,
                displayName: wallName,
                type: normalizedName.includes('boulder') ? 'boulder' : 'rope'
            });
        }
    };

    const handleDeleteWall = (gymCode: string, wallName: string) => {
        if (window.confirm(`Delete targets for ${wallName}?`)) {
            // We don't have a specific "delete" action in store yet, 
            // but setting targets to 0 and removing it from local storage usually works.
            // Let's implement a 'deleteWallTarget' in store? 
            // Actually, if we just set it to null in the store update it might work if the store handles it.
            // For now, let's just reset it to default.
            setWallTarget(gymCode, wallName, { targetCount: 0 });

            // To truly "delete" it from the view if it's manual, we need it to NOT be in wallTargets anymore.
            // I'll add a deleteWallTarget to the store in the next step.
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#F8FAFC] text-[#00205B]">
            <UnifiedHeader
                title="Wall Target Manager"
                subtitle="High-density benchmark management"
                dateRange={dateRange}
                rangeOption={rangeOption}
                onRangeOptionChange={setRangeOption}
                onCustomDateChange={() => { }}
                actions={
                    <div className="flex items-center gap-2">
                        <button onClick={handleExport} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-[#00205B] hover:shadow-md transition-all">
                            <Download size={12} />
                            JSON
                        </button>
                        <button onClick={handleCopySyncCode} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-[#00205B] hover:shadow-md transition-all" title="Copy targets to clipboard to send to Director">
                            <Check size={12} />
                            Copy Code
                        </button>
                        <button onClick={handlePasteSyncCode} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-[#00205B] hover:shadow-md transition-all" title="Paste a Sync Code from a Head Setter to merge their changes">
                            <Plus size={12} />
                            Merge Paste
                        </button>
                        <button onClick={handleExportCSV} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-[#00205B] hover:shadow-md transition-all">
                            <List size={12} />
                            CSV
                        </button>
                        <label className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-[#00205B] hover:shadow-md transition-all cursor-pointer">
                            <Upload size={12} />
                            Import
                            <input type="file" className="hidden" accept=".json" onChange={handleImport} />
                        </label>
                    </div>
                }
            />

            <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-8">
                {/* Compact Master Sync */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-4">
                    <div className="flex items-center gap-3 min-w-fit">
                        <div className="bg-[#00205B]/5 p-2 rounded-lg">
                            <RefreshCw size={16} className="text-[#00205B]" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-tight">Master Sync URL</span>
                    </div>
                    <input
                        type="text"
                        placeholder="Raw Gist URL..."
                        className="flex-1 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#009CA6] transition-all"
                        value={remoteTargetUrl || ''}
                        onChange={(e) => setRemoteTargetUrl(e.target.value)}
                    />
                    <button onClick={() => fetchRemoteTargets()} className="bg-[#00205B] hover:bg-[#00205B]/90 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg whitespace-nowrap">
                        Sync Now
                    </button>
                </div>

                {importError && (
                    <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl text-rose-500 text-[10px] font-bold uppercase tracking-widest text-center animate-bounce">
                        {importError}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    {activeGymCodes.map(gymCode => {
                        const summary = getGymSummary(gymCode);
                        const walls = gymWalls[gymCode] || [];
                        const currentTargets = wallTargets[gymCode] || {};

                        return (
                            <div key={gymCode} className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden animate-in fade-in duration-500">
                                <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Building2 size={16} className="text-[#00205B]" />
                                        <h2 className="font-black uppercase tracking-tight text-[#00205B]">{gymCode}</h2>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex gap-2">
                                            <div className="bg-white px-3 py-1 rounded-lg border border-slate-200 flex gap-2 items-center">
                                                <span className="text-[9px] font-black text-slate-500 uppercase">Rope</span>
                                                <span className="text-xs font-black text-[#00205B]">{summary.ropeVol}</span>
                                            </div>
                                            <div className="bg-white px-3 py-1 rounded-lg border border-slate-200 flex gap-2 items-center">
                                                <span className="text-[9px] font-black text-slate-500 uppercase">Bld</span>
                                                <span className="text-xs font-black text-[#009CA6]">{summary.boulderVol}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleAddWall(gymCode)}
                                            className="p-1.5 bg-[#00205B] text-white rounded-lg hover:bg-[#00205B]/90 transition-all shadow-sm"
                                            title="Add Custom Wall"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-0 max-h-[500px] overflow-y-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="sticky top-0 bg-white z-10 shadow-[0_1px_0_rgba(0,0,0,0.05)]">
                                            <tr>
                                                <th className="py-2.5 px-4 text-[9px] font-black uppercase text-slate-500 tracking-widest">Wall Name</th>
                                                <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-500 tracking-widest text-center">Type</th>
                                                <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-500 tracking-widest text-center" title="Target total number of climbs for this wall">Volume</th>
                                                <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-500 tracking-widest text-center" title="Target efficiency (Climbs per Setter per Shift)">Efficiency</th>
                                                <th className="py-2.5 px-4 w-8"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {walls.map(wall => {
                                                const target = currentTargets[wall] || {
                                                    targetCount: 0,
                                                    targetClimbsPerSetter: wall.toLowerCase().includes('boulder') ? 4.0 : 1.0,
                                                    type: wall.toLowerCase().includes('boulder') ? 'boulder' : 'rope',
                                                    displayName: wall
                                                };

                                                const isEditing = editingWall?.gym === gymCode && editingWall?.wall === wall;

                                                return (
                                                    <tr key={wall} className="group hover:bg-slate-50 transition-colors">
                                                        <td className="py-2 px-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-2 group/name">
                                                                <div className={`w-2 h-2 rounded-full ${target.type === 'rope' ? 'bg-[#00205B]' : 'bg-[#009CA6]'}`} />
                                                                {isEditing ? (
                                                                    <div className="flex items-center gap-1">
                                                                        <input
                                                                            autoFocus
                                                                            type="text"
                                                                            className="text-[11px] font-bold tracking-tight text-slate-900 bg-white border border-[#009CA6] rounded px-1 outline-none w-32"
                                                                            value={tempDisplayName}
                                                                            onChange={(e) => setTempDisplayName(e.target.value)}
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === 'Enter') {
                                                                                    setWallTarget(gymCode, wall, { displayName: tempDisplayName });
                                                                                    setEditingWall(null);
                                                                                }
                                                                                if (e.key === 'Escape') setEditingWall(null);
                                                                            }}
                                                                        />
                                                                        <button onClick={() => {
                                                                            setWallTarget(gymCode, wall, { displayName: tempDisplayName });
                                                                            setEditingWall(null);
                                                                        }} className="text-[#009CA6] hover:text-[#009CA6]/80">
                                                                            <Check size={12} />
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[11px] font-bold tracking-tight text-slate-900 truncate max-w-[120px]">
                                                                            {target.displayName || wall}
                                                                        </span>
                                                                        <button
                                                                            onClick={() => {
                                                                                setEditingWall({ gym: gymCode, wall });
                                                                                setTempDisplayName(target.displayName || wall);
                                                                            }}
                                                                            className="opacity-0 group-hover/name:opacity-100 p-1 text-slate-300 hover:text-[#00205B] transition-all"
                                                                        >
                                                                            <Edit2 size={10} />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-2 px-2 text-center">
                                                            <div className="flex justify-center">
                                                                <WallTypeToggle
                                                                    type={target.type}
                                                                    onChange={(t) => setWallTarget(gymCode, wall, { type: t })}
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="py-2 px-2">
                                                            <input
                                                                type="number"
                                                                className="w-12 mx-auto block bg-white border border-slate-200 rounded px-1.5 py-1 text-[11px] font-black text-center focus:ring-1 focus:ring-[#009CA6] outline-none"
                                                                value={target.targetCount || ''}
                                                                onChange={(e) => setWallTarget(gymCode, wall, { targetCount: parseInt(e.target.value) || 0 })}
                                                            />
                                                        </td>
                                                        <td className="py-2 px-2">
                                                            <input
                                                                type="number"
                                                                step="0.1"
                                                                className="w-12 mx-auto block bg-white border border-slate-200 rounded px-1.5 py-1 text-[11px] font-black text-center text-[#009CA6] focus:ring-1 focus:ring-[#009CA6] outline-none"
                                                                value={target.targetClimbsPerSetter || ''}
                                                                onChange={(e) => setWallTarget(gymCode, wall, { targetClimbsPerSetter: parseFloat(e.target.value) || 0 })}
                                                            />
                                                        </td>
                                                        <td className="py-2 px-4 text-right">
                                                            <button
                                                                onClick={() => {
                                                                    if (window.confirm(`Remove targets and visibility for ${wall}?`)) {
                                                                        const { deleteWallTarget } = useDashboardStore.getState();
                                                                        deleteWallTarget(gymCode, wall);
                                                                    }
                                                                }}
                                                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500 transition-all"
                                                                title="Delete/Hide"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-center pt-8">
                    <button
                        onClick={() => {
                            if (window.confirm("Nuclear Option: Reset ALL targets for ALL selected gyms?")) {
                                activeGymCodes.forEach(code => resetWallTargets(code));
                            }
                        }}
                        className="flex items-center gap-2 px-6 py-2.5 bg-rose-50 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all shadow-sm"
                    >
                        <Trash2 size={14} />
                        Reset All Selected Data
                    </button>
                </div>
            </main>
        </div>
    );
};

export default WallTargetManager;
