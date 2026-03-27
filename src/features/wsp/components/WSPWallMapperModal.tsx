import React, { useState } from 'react';
import { X, Building2, Trash2, Plus, Check } from 'lucide-react';

const GYMS = [
    { code: 'DD', name: 'Design District' },
    { code: 'GV', name: 'Grapevine' },
    { code: 'PL', name: 'Plano' },
    { code: 'TH', name: 'The Hill' },
    { code: 'FW', name: 'Fort Worth' },
    { code: 'DN', name: 'Denton' }
];

interface WSPWallMapperModalProps {
    setShowWallMapper: (show: false) => void;
    hasPendingUnrecognized: boolean;
    setPendingUnrecognized: (pending: Record<string, string[]>) => void;
    wallMapperEntries: Record<string, Record<string, 'rope' | 'boulder' | 'ignored'>>;
    updateWallMapperEntry: (gymCode: string, wallName: string, mapping: 'rope' | 'boulder' | 'ignored') => void;
    deleteWallMapperEntry: (gymCode: string, wallName: string) => void;
    addWallMapperEntry: (gymCode: string, wallName: string, mapping: 'rope' | 'boulder' | 'ignored') => void;
    handleApplyWallMappings: () => void;
}

export const WSPWallMapperModal: React.FC<WSPWallMapperModalProps> = ({
    setShowWallMapper,
    hasPendingUnrecognized,
    setPendingUnrecognized,
    wallMapperEntries,
    updateWallMapperEntry,
    deleteWallMapperEntry,
    addWallMapperEntry,
    handleApplyWallMappings
}) => {
    const [newZoneGym, setNewZoneGym] = useState('');
    const [newZoneName, setNewZoneName] = useState('');
    const [newZoneType, setNewZoneType] = useState<'rope' | 'boulder' | 'ignored'>('boulder');

    const getGymNameFromCode = (code: string) => {
        const gym = GYMS.find(g => g.code === code || g.name === code);
        return gym ? gym.name : code;
    };

    const addNewZone = () => {
        if (!newZoneGym || !newZoneName.trim()) return;
        addWallMapperEntry(newZoneGym, newZoneName.trim(), newZoneType);
        setNewZoneName('');
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-start justify-center pt-12 overflow-y-auto" onClick={() => { setShowWallMapper(false); setPendingUnrecognized({}); }}>
            <div className="bg-white rounded-2xl shadow-2xl w-[650px] max-w-[90vw] p-8 mb-12 animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-bold text-[#00205B]">
                        {hasPendingUnrecognized ? 'New Zones Detected' : 'Global Zone Mapper'}
                    </h2>
                    <button onClick={() => { setShowWallMapper(false); setPendingUnrecognized({}); }} className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <p className="text-sm text-slate-500 mb-6">
                    {hasPendingUnrecognized
                        ? 'Please define whether the following detected zones are for Ropes, Boulders, or should be Ignored.'
                        : 'View and manage wall/zone mappings for all gyms. These mappings help the parser correctly categorize shift titles.'
                    }
                </p>

                {/* Zone entries */}
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 mb-6 custom-scrollbar">
                    {Object.entries(wallMapperEntries).map(([gymCode, walls]) => (
                        <div key={gymCode} className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                            <div className="text-sm font-bold text-[#00205B] mb-3 flex items-center gap-2">
                                <Building2 size={14} />
                                {getGymNameFromCode(gymCode)} ({gymCode})
                            </div>
                            <div className="space-y-2">
                                {Object.entries(walls).map(([wallName, type]) => (
                                    <div key={wallName} className="flex items-center gap-3 bg-white rounded-md px-3 py-2 border border-slate-200">
                                        <span className="text-sm font-medium text-slate-700 flex-1 uppercase">{wallName}</span>
                                        <select
                                            value={type}
                                            onChange={(e) => updateWallMapperEntry(gymCode, wallName, e.target.value as 'rope' | 'boulder' | 'ignored')}
                                            className="text-xs px-2 py-1 border border-slate-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-[#008C95]"
                                        >
                                            <option value="boulder">Boulder</option>
                                            <option value="rope">Rope</option>
                                            <option value="ignored">Ignored</option>
                                        </select>
                                        {!hasPendingUnrecognized && (
                                            <button
                                                onClick={() => deleteWallMapperEntry(gymCode, wallName)}
                                                className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {Object.keys(wallMapperEntries).length === 0 && !hasPendingUnrecognized && (
                        <div className="text-center py-8 text-slate-400 text-sm">
                            No custom zone mappings yet. Add one below.
                        </div>
                    )}
                </div>

                {/* Add new zone (only in global mode) */}
                {!hasPendingUnrecognized && (
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 mb-6">
                        <div className="text-xs font-semibold text-slate-600 mb-2">Add New Zone</div>
                        <div className="flex gap-2 items-end">
                            <div className="flex-1">
                                <label className="block text-xs text-slate-500 mb-1">Gym</label>
                                <select
                                    value={newZoneGym}
                                    onChange={(e) => setNewZoneGym(e.target.value)}
                                    className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#008C95]"
                                >
                                    <option value="">Select gym...</option>
                                    {GYMS.map(g => (
                                        <option key={g.code} value={g.name}>{g.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs text-slate-500 mb-1">Zone Name</label>
                                <input
                                    value={newZoneName}
                                    onChange={(e) => setNewZoneName(e.target.value)}
                                    placeholder="e.g. spray wall"
                                    className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#008C95]"
                                    onKeyDown={(e) => { if (e.key === 'Enter') addNewZone(); }}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Type</label>
                                <select
                                    value={newZoneType}
                                    onChange={(e) => setNewZoneType(e.target.value as 'rope' | 'boulder' | 'ignored')}
                                    className="px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#008C95]"
                                >
                                    <option value="boulder">Boulder</option>
                                    <option value="rope">Rope</option>
                                    <option value="ignored">Ignored</option>
                                </select>
                            </div>
                            <button
                                onClick={addNewZone}
                                disabled={!newZoneGym || !newZoneName.trim()}
                                className="px-3 py-1.5 text-xs font-medium text-white bg-[#008C95] rounded hover:bg-[#007A82] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                                <Plus size={12} /> Add
                            </button>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button onClick={() => { setShowWallMapper(false); setPendingUnrecognized({}); }} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleApplyWallMappings} className="px-4 py-2 text-sm font-medium text-white bg-[#008C95] rounded-lg hover:bg-[#007A82] transition-colors flex items-center gap-2">
                        <Check size={16} /> Save Mappings
                    </button>
                </div>
            </div>
        </div>
    );
};
