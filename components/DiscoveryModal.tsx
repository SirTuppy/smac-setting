import React, { useState, useMemo } from 'react';
import { X, Compass, Zap, Target, ArrowRight, CheckCircle2, Settings, Layout, Type } from 'lucide-react';
import { useDashboardStore } from '../store/useDashboardStore';

interface DiscoveryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CombinedPreview: React.FC<{ displayMode: 'merged' | 'separate', climbTypeDisplay: 'type' | 'steepness' }> = ({ displayMode, climbTypeDisplay }) => {
    return (
        <div className="bg-slate-900 rounded-xl p-4 overflow-hidden shadow-inner border border-slate-800">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Live Generator Preview</span>
            </div>

            <div className="bg-white rounded-lg p-3 font-mono text-[11px] text-slate-600 border border-slate-200">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100 italic">
                            <td className="w-12 py-1">Date</td>
                            <td className="py-1">Location</td>
                            <td className="w-20 py-1">Type</td>
                            <td className="w-10 py-1 text-right">#</td>
                        </tr>
                    </thead>
                    <tbody>
                        {displayMode === 'separate' ? (
                            <>
                                <tr className="text-[#00205B] font-bold">
                                    <td className="py-1 border-b border-slate-50">1/14</td>
                                    <td className="py-1 border-b border-slate-50">Slab Scary</td>
                                    <td className="py-1 border-b border-slate-50">{climbTypeDisplay === 'type' ? 'Sport' : 'Slab'}</td>
                                    <td className="py-1 border-b border-slate-50 text-right">2</td>
                                </tr>
                                <tr className="text-[#00205B] font-bold">
                                    <td className="py-1"></td>
                                    <td className="py-1">B1 / B2</td>
                                    <td className="py-1 text-emerald-600">{climbTypeDisplay === 'type' ? 'Boulder' : 'Vert'}</td>
                                    <td className="py-1 text-right">1</td>
                                </tr>
                            </>
                        ) : (
                            <tr className="text-[#00205B] font-bold">
                                <td className="py-1">1/14</td>
                                <td className="py-1">Slab Scary, B1, B2</td>
                                <td className="py-1 text-purple-600">{climbTypeDisplay === 'type' ? 'Both' : 'Mixed'}</td>
                                <td className="py-1 text-right">3</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const DiscoveryModal: React.FC<DiscoveryModalProps> = ({ isOpen, onClose }) => {
    const {
        unrecognizedWalls,
        addUserWallMapping,
        clearUnrecognizedWalls,
        gymSettings,
        updateGymSettings,
        gymSchedules,
        gymDisplayNames,
        setGymDisplayName
    } = useDashboardStore();

    const [activeTab, setActiveTab] = useState<'walls' | 'settings'>('walls');
    const [localMappings, setLocalMappings] = useState<Record<string, Record<string, 'rope' | 'boulder' | 'ignored' | null>>>({});

    const activeGymsFromSchedule = useMemo(() =>
        gymSchedules ? Object.keys(gymSchedules) : [],
        [gymSchedules]
    );

    const hasUnrecognized = Object.keys(unrecognizedWalls).length > 0;

    // Use unrecognized gyms or all active gyms from schedules
    const targetGyms = useMemo(() => {
        const gyms = new Set<string>();
        Object.keys(unrecognizedWalls).forEach(g => gyms.add(g));
        activeGymsFromSchedule.forEach(g => gyms.add(g));
        return Array.from(gyms);
    }, [unrecognizedWalls, activeGymsFromSchedule]);

    if (!isOpen) return null;

    const handleAction = (gymCode: string, wall: string, type: 'rope' | 'boulder' | 'ignored') => {
        setLocalMappings(prev => ({
            ...prev,
            [gymCode]: {
                ...(prev[gymCode] || {}),
                [wall]: type
            }
        }));
    };

    const handleSave = () => {
        Object.entries(localMappings).forEach(([gymCode, walls]) => {
            Object.entries(walls).forEach(([wallName, type]) => {
                if (type) {
                    addUserWallMapping(gymCode, wallName, type);
                }
            });
        });
        clearUnrecognizedWalls();
        onClose();
    };

    const totalWalls = (Object.values(unrecognizedWalls) as string[][]).reduce((acc: number, curr: string[]) => acc + curr.length, 0);
    const mappedCount = (Object.values(localMappings) as Record<string, 'rope' | 'boulder' | 'ignored' | null>[]).reduce((acc: number, curr: Record<string, 'rope' | 'boulder' | 'ignored' | null>) =>
        acc + Object.values(curr).filter(v => v !== null).length, 0
    );

    const progressPercentage = totalWalls > 0 ? (mappedCount / totalWalls) * 100 : 100;

    return (
        <div className="fixed inset-0 z-[150] bg-[#00205B]/80 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-[40px] w-full max-w-5xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-500">
                {/* Header */}
                <div className="p-10 pb-6 border-b border-slate-100 flex items-start justify-between">
                    <div className="flex gap-6">
                        <div className="w-16 h-16 bg-[#009CA6]/10 rounded-2xl flex items-center justify-center text-[#009CA6]">
                            <Compass size={32} />
                        </div>
                        <div>
                            <h2 className="text-4xl font-black text-[#00205B] uppercase tracking-tighter">Gym Customization</h2>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">
                                {hasUnrecognized
                                    ? `We found ${totalWalls} unrecognized labels. Map them to categorization types below.`
                                    : "Fine-tune how your schedules are generated per-gym."}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
                        <button
                            onClick={() => setActiveTab('walls')}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'walls' ? 'bg-[#00205B] text-white shadow-lg' : 'text-slate-400 hover:text-[#00205B]'}`}
                        >
                            Wall Mapping
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-[#00205B] text-white shadow-lg' : 'text-slate-400 hover:text-[#00205B]'}`}
                        >
                            Local Settings
                        </button>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Progress Bar (Only for Walls) */}
                {activeTab === 'walls' && hasUnrecognized && (
                    <div className="h-1.5 w-full bg-slate-50 relative">
                        <div
                            className="h-full bg-emerald-500 transition-all duration-700 ease-out"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar">
                    {activeTab === 'walls' ? (
                        hasUnrecognized ? (
                            Object.keys(unrecognizedWalls).map(gymCode => (
                                <div key={gymCode} className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500">
                                            {gymCode}
                                        </div>
                                        <h3 className="text-lg font-black text-[#00205B] uppercase tracking-tight">
                                            {gymDisplayNames[gymCode] || gymCode}
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {unrecognizedWalls[gymCode].map(wall => {
                                            const selection = localMappings[gymCode]?.[wall];
                                            return (
                                                <div key={wall} className="bg-slate-50 rounded-2xl p-6 flex flex-col gap-4 border border-slate-100 transition-all hover:shadow-lg hover:shadow-slate-200/50">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-bold text-[#00205B] truncate pr-4">{wall}</span>
                                                        {selection && <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />}
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleAction(gymCode, wall, 'rope')}
                                                            className={`flex-1 py-3 px-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border-2 ${selection === 'rope' ? 'bg-[#009CA6] border-[#009CA6] text-white shadow-lg' : 'bg-white border-slate-200 text-slate-400 hover:border-[#009CA6]/30'}`}
                                                        >
                                                            <Target size={12} />
                                                            Rope
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(gymCode, wall, 'boulder')}
                                                            className={`flex-1 py-3 px-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border-2 ${selection === 'boulder' ? 'bg-[#00205B] border-[#00205B] text-white shadow-lg' : 'bg-white border-slate-200 text-slate-400 hover:border-[#00205B]/30'}`}
                                                        >
                                                            <Zap size={12} />
                                                            Boulder
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(gymCode, wall, 'ignored')}
                                                            className={`flex-1 py-3 px-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border-2 ${selection === 'ignored' ? 'bg-slate-500 border-slate-500 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}
                                                        >
                                                            Neither
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-20 space-y-6">
                                <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center animate-bounce">
                                    <CheckCircle2 size={48} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-[#00205B] uppercase tracking-tight">All Walls Mapped</h3>
                                    <p className="text-slate-400 font-medium text-sm mt-2">No unrecognized labels were found in your recent uploads.</p>
                                </div>
                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className="px-8 py-4 bg-[#00205B] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-[#00205B]/20 hover:scale-105 transition-all"
                                >
                                    View Gym Settings
                                </button>
                            </div>
                        )
                    ) : (
                        <div className="space-y-12">
                            {targetGyms.map(gymCode => {
                                const settings = gymSettings[gymCode] || { displayMode: 'separate', climbTypeDisplay: 'type' };
                                return (
                                    <div key={gymCode} className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-slate-50/50 rounded-[32px] p-8 border border-slate-100">
                                        <div className="space-y-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center text-[#00205B] font-black">
                                                    {gymCode}
                                                </div>
                                                <div className="flex-1">
                                                    <input
                                                        type="text"
                                                        value={gymDisplayNames[gymCode] || gymCode}
                                                        onChange={(e) => setGymDisplayName(gymCode, e.target.value)}
                                                        className="text-xl font-black text-[#00205B] uppercase tracking-tight bg-transparent border-b-2 border-transparent focus:border-[#009CA6] outline-none w-full"
                                                        placeholder="Enter gym name..."
                                                    />
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Regional Settings</p>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="space-y-3">
                                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#00205B]/40">
                                                        <Layout size={12} />
                                                        Daily Display Mode
                                                    </label>
                                                    <div className="flex gap-2">
                                                        {[
                                                            { id: 'separate', label: 'Split Days', desc: 'Separate rows for Rope/Boulder' },
                                                            { id: 'merged', label: 'Consolidated', desc: 'Combined single row per day' }
                                                        ].map(mode => (
                                                            <button
                                                                key={mode.id}
                                                                onClick={() => updateGymSettings(gymCode, { displayMode: mode.id as any })}
                                                                className={`flex-1 p-4 rounded-2xl border-2 transition-all text-left ${settings.displayMode === mode.id
                                                                    ? 'bg-white border-[#009CA6] shadow-md'
                                                                    : 'bg-transparent border-slate-100 hover:border-slate-200 opacity-60'}`}
                                                            >
                                                                <div className={`text-[10px] font-black uppercase tracking-widest ${settings.displayMode === mode.id ? 'text-[#009CA6]' : 'text-slate-400'}`}>
                                                                    {mode.label}
                                                                </div>
                                                                <div className="text-[9px] font-bold text-slate-400 mt-1">{mode.desc}</div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#00205B]/40">
                                                        <Type size={12} />
                                                        Climb Type Column
                                                    </label>
                                                    <div className="flex gap-2">
                                                        {[
                                                            { id: 'type', label: 'Rope/Boulder', desc: 'Shows "Sport", "Boulder" or "Both"' },
                                                            { id: 'steepness', label: 'Wall Steepness', desc: 'Shows "Slab", "Overhang", etc.' }
                                                        ].map(type => (
                                                            <button
                                                                key={type.id}
                                                                onClick={() => updateGymSettings(gymCode, { climbTypeDisplay: type.id as any })}
                                                                className={`flex-1 p-4 rounded-2xl border-2 transition-all text-left ${settings.climbTypeDisplay === type.id
                                                                    ? 'bg-white border-[#00205B] shadow-md'
                                                                    : 'bg-transparent border-slate-100 hover:border-slate-200 opacity-60'}`}
                                                            >
                                                                <div className={`text-[10px] font-black uppercase tracking-widest ${settings.climbTypeDisplay === type.id ? 'text-[#00205B]' : 'text-slate-400'}`}>
                                                                    {type.label}
                                                                </div>
                                                                <div className="text-[9px] font-bold text-slate-400 mt-1">{type.desc}</div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col justify-center">
                                            <CombinedPreview
                                                displayMode={settings.displayMode}
                                                climbTypeDisplay={settings.climbTypeDisplay}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                    }
                </div>

                {/* Footer */}
                <div className="p-10 pt-6 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {activeTab === 'walls' && hasUnrecognized
                                ? `${totalWalls - mappedCount} walls remaining to be mapped`
                                : "Settings are saved automatically to local storage"}
                        </p>
                        <div className="flex gap-4">
                            {activeTab === 'walls' && hasUnrecognized ? (
                                <button
                                    onClick={handleSave}
                                    disabled={mappedCount === 0}
                                    className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl ${mappedCount > 0
                                        ? 'bg-[#00205B] text-white hover:scale-105 active:scale-95 shadow-[#00205B]/20'
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                        }`}
                                >
                                    Save Mappings
                                    <ArrowRight size={16} />
                                </button>
                            ) : (
                                <button
                                    onClick={onClose}
                                    className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#00205B] text-white font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-[#00205B]/20 hover:scale-105 active:scale-95"
                                >
                                    Finish Setup
                                    <ArrowRight size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiscoveryModal;
