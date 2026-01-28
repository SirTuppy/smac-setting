import React, { useState, useMemo, useEffect } from 'react';
import { Climb } from '../types';
import { Calendar, User, FileText, ChevronRight, ChevronDown, BarChart3, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface DataExplorerProps {
    climbs: Climb[];
}

type ViewMode = 'date' | 'setter' | 'weekday';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
    key: keyof Climb | 'setter' | 'dateSet';
    direction: SortDirection;
}

const ITEMS_PER_PAGE = 50;
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const DataExplorer: React.FC<DataExplorerProps> = ({ climbs }) => {
    const [viewMode, setViewMode] = useState<ViewMode>('date');
    const [selectedKey, setSelectedKey] = useState<string | null>(null);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'setter', direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

    // Type Filters
    const [showBoulders, setShowBoulders] = useState(true);
    const [showRopes, setShowRopes] = useState(true);

    // Grouping Logic
    const groupedData = useMemo(() => {
        const groups: Record<string, Climb[]> = {};

        // Pre-filter by type
        const filtered = climbs.filter(c => {
            if (c.isRoute && !showRopes) return false;
            if (!c.isRoute && !showBoulders) return false;
            return true;
        });

        filtered.forEach(climb => {
            let key = "";
            if (viewMode === 'date') {
                key = climb.dateSet.toLocaleDateString();
                if (!groups[key]) groups[key] = [];
                groups[key].push(climb);
            } else if (viewMode === 'setter') {
                const setterNames = String(climb.setter).split(',').map(s => s.trim());
                setterNames.forEach(name => {
                    if (!groups[name]) groups[name] = [];
                    groups[name].push(climb);
                });
            } else {
                // Weekday
                key = WEEKDAYS[climb.dateSet.getDay()];
                if (!groups[key]) groups[key] = [];
                groups[key].push(climb);
            }
        });

        // Sort keys
        const keys = Object.keys(groups).sort((a, b) => {
            if (viewMode === 'date') return new Date(b).getTime() - new Date(a).getTime();
            if (viewMode === 'weekday') return WEEKDAYS.indexOf(a) - WEEKDAYS.indexOf(b);
            return a.localeCompare(b);
        });

        return { groups, keys };
    }, [climbs, viewMode, showBoulders, showRopes]);

    // Handle Selection default logic
    useEffect(() => {
        if (!selectedKey || !groupedData.keys.includes(selectedKey)) {
            setSelectedKey(groupedData.keys.length > 0 ? groupedData.keys[0] : null);
            setCurrentPage(1);
        }
    }, [groupedData.keys, selectedKey]);

    // Sidebar grouping for Workdays
    const sidebarGroups = useMemo<Record<string, string[]> | null>(() => {
        if (viewMode !== 'date') return null;
        const groups: Record<string, string[]> = {};
        groupedData.keys.forEach(key => {
            const date = new Date(key);
            const groupKey = date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
            if (!groups[groupKey]) groups[groupKey] = [];
            groups[groupKey].push(key);
        });
        return groups;
    }, [groupedData.keys, viewMode]);

    // Auto-expand group for selected key
    useEffect(() => {
        if (viewMode === 'date' && selectedKey) {
            const date = new Date(selectedKey);
            const groupKey = date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
            setExpandedGroups(prev => ({ ...prev, [groupKey]: true }));
        }
    }, [selectedKey, viewMode]);

    const handleSort = (key: SortConfig['key']) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
        setCurrentPage(1);
    };

    const sortedClimbs = useMemo(() => {
        const data = selectedKey ? [...(groupedData.groups[selectedKey] || [])] : [];
        return data.sort((a, b) => {
            let valA: any = a[sortConfig.key as keyof Climb];
            let valB: any = b[sortConfig.key as keyof Climb];

            if (sortConfig.key === 'grade') {
                valA = a.gradeScore;
                valB = b.gradeScore;
            } else if (sortConfig.key === 'dateSet') {
                valA = a.dateSet.getTime();
                valB = b.dateSet.getTime();
            }

            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [selectedKey, groupedData, sortConfig]);

    const activeClimbs = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedClimbs.slice(start, start + ITEMS_PER_PAGE);
    }, [sortedClimbs, currentPage]);

    const totalPages = Math.ceil(sortedClimbs.length / ITEMS_PER_PAGE);

    // Stats for the active view
    const stats = useMemo(() => {
        const data = selectedKey ? (groupedData.groups[selectedKey] || []) : [];
        const routes = data.filter(c => c.isRoute).length;
        return { routes, boulders: data.length - routes, total: data.length };
    }, [selectedKey, groupedData]);

    const SortIcon = ({ column }: { column: SortConfig['key'] }) => {
        if (sortConfig.key !== column) return <ArrowUpDown size={14} className="opacity-20 group-hover:opacity-100" />;
        return sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-[#009CA6]" /> : <ArrowDown size={14} className="text-[#009CA6]" />;
    };

    const toggleGroup = (groupKey: string) => {
        setExpandedGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }));
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col md:flex-row min-h-[600px] shadow-sm">
            {/* Sidebar / List */}
            <div className="w-full md:w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
                <div className="p-4 border-b border-slate-200 space-y-4">
                    <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => {
                                setViewMode('date');
                                setSelectedKey(null);
                                setSortConfig({ key: 'setter', direction: 'asc' });
                            }}
                            className={`flex flex-col items-center justify-center gap-1 py-2 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'date' ? 'bg-[#00205B] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Calendar size={14} /> Workdays
                        </button>
                        <button
                            onClick={() => {
                                setViewMode('setter');
                                setSelectedKey(null);
                                setSortConfig({ key: 'dateSet', direction: 'desc' });
                            }}
                            className={`flex flex-col items-center justify-center gap-1 py-2 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'setter' ? 'bg-[#00205B] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <User size={14} /> Setters
                        </button>
                        <button
                            onClick={() => {
                                setViewMode('weekday');
                                setSelectedKey(null);
                                setSortConfig({ key: 'dateSet', direction: 'desc' });
                            }}
                            className={`flex flex-col items-center justify-center gap-1 py-2 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'weekday' ? 'bg-[#00205B] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <BarChart3 size={14} /> Trends
                        </button>
                    </div>

                    <div className="flex gap-4 px-1">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={showBoulders}
                                onChange={(e) => setShowBoulders(e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 bg-white text-[#00205B] focus:ring-[#00205B]"
                            />
                            <span className={`text-[10px] font-black uppercase tracking-widest ${showBoulders ? 'text-[#00205B]' : 'text-slate-400'}`}>Boulders</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={showRopes}
                                onChange={(e) => setShowRopes(e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 bg-white text-[#009CA6] focus:ring-[#009CA6]"
                            />
                            <span className={`text-[10px] font-black uppercase tracking-widest ${showRopes ? 'text-[#009CA6]' : 'text-slate-400'}`}>Ropes</span>
                        </label>
                    </div>
                </div>

                <div className="overflow-y-auto flex-1 p-2 space-y-1 custom-scrollbar">
                    {groupedData.keys.length === 0 && (
                        <div className="p-4 text-center text-xs text-slate-500">No data found for this period.</div>
                    )}

                    {viewMode === 'date' && sidebarGroups ? (
                        Object.entries(sidebarGroups as Record<string, string[]>).map(([groupKey, dates]) => (
                            <div key={groupKey} className="mb-2">
                                <button
                                    onClick={() => toggleGroup(groupKey)}
                                    className="w-full text-left px-2 py-1.5 flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 hover:text-[#00205B] transition-colors"
                                >
                                    {expandedGroups[groupKey] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                    {groupKey}
                                </button>
                                {expandedGroups[groupKey] && (
                                    <div className="mt-1 space-y-0.5 pl-2 border-l border-slate-200 ml-3">
                                        {dates.map(date => (
                                            <button
                                                key={date}
                                                onClick={() => setSelectedKey(date)}
                                                className={`w-full text-left px-3 py-2 rounded-lg flex justify-between items-center transition-all group ${selectedKey === date
                                                    ? 'bg-white border border-slate-200 shadow-sm'
                                                    : 'hover:bg-slate-100 border border-transparent'
                                                    }`}
                                            >
                                                <span className={`text-xs font-bold ${selectedKey === date ? 'text-[#00205B]' : 'text-slate-500 group-hover:text-[#00205B]'}`}>
                                                    {date.split('/')[0]}/{date.split('/')[1]}
                                                </span>
                                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${selectedKey === date ? 'bg-[#009CA6] text-white' : 'bg-slate-200 text-slate-500'}`}>
                                                    {groupedData.groups[date].length}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        groupedData.keys.map(key => (
                            <button
                                key={key}
                                onClick={() => setSelectedKey(key)}
                                className={`w-full text-left px-4 py-3 rounded-lg flex justify-between items-center transition-all group ${selectedKey === key
                                    ? 'bg-white border border-slate-200 shadow-sm'
                                    : 'hover:bg-slate-100 border border-transparent'
                                    }`}
                            >
                                <span className={`text-xs font-bold uppercase tracking-widest ${selectedKey === key ? 'text-[#00205B]' : 'text-slate-500 group-hover:text-[#00205B]'}`}>
                                    {key}
                                </span>
                                <span className={`text-[10px] font-black px-2 py-1 rounded-full ${selectedKey === key ? 'bg-[#009CA6] text-white' : 'bg-slate-200 text-slate-500'
                                    }`}>
                                    {groupedData.groups[key].length}
                                </span>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Main Content / Table */}
            <div className="flex-1 flex flex-col bg-white min-w-0">
                {selectedKey && (
                    <>
                        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                            <div>
                                <h3 className="text-xl font-black text-[#00205B] uppercase tracking-[0.1em] mb-1 flex items-center gap-2">
                                    {viewMode === 'date' && <Calendar size={20} className="text-[#009CA6]" />}
                                    {viewMode === 'setter' && <User size={20} className="text-[#00205B]" />}
                                    {viewMode === 'weekday' && <BarChart3 size={20} className="text-amber-500" />}
                                    {selectedKey}
                                </h3>
                                <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#009CA6]"></div> {stats.routes} Ropes</span>
                                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#00205B]"></div> {stats.boulders} Boulders</span>
                                </div>
                            </div>
                            <div className="text-right hidden sm:block">
                                <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black">Daily Volume</span>
                                <p className="text-2xl font-black text-[#00205B]">{stats.total}</p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-x-auto min-h-0 relative">
                            <table className="w-full text-left text-xs text-slate-500">
                                <thead className="bg-slate-50/80 text-[#00205B] border-b border-slate-200 sticky top-0 backdrop-blur-sm z-10 transition-colors">
                                    <tr className="uppercase tracking-[0.1em] font-black">
                                        <th className="p-4 cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => handleSort('grade')}>
                                            <div className="flex items-center gap-2">Grade <SortIcon column="grade" /></div>
                                        </th>
                                        <th className="p-4 cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => handleSort('climbType')}>
                                            <div className="flex items-center gap-2">Type <SortIcon column="climbType" /></div>
                                        </th>
                                        <th className="p-4 cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => handleSort('wall')}>
                                            <div className="flex items-center gap-2">Wall <SortIcon column="wall" /></div>
                                        </th>
                                        <th className="p-4 cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => handleSort(viewMode === 'date' ? 'setter' : 'dateSet')}>
                                            <div className="flex items-center gap-2">
                                                {viewMode === 'date' ? 'Setter' : 'Date Set'}
                                                <SortIcon column={viewMode === 'date' ? 'setter' : 'dateSet'} />
                                            </div>
                                        </th>
                                        <th className="p-4 cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => handleSort('gym')}>
                                            <div className="flex items-center gap-2">Gym <SortIcon column="gym" /></div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {activeClimbs.map(climb => (
                                        <tr key={climb.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest ${!climb.isRoute
                                                    ? 'bg-[#00205B]/5 text-[#00205B] border border-[#00205B]/10'
                                                    : 'bg-[#009CA6]/5 text-[#009CA6] border border-[#009CA6]/10'
                                                    }`}>
                                                    {climb.grade}
                                                </span>
                                            </td>
                                            <td className="p-4 opacity-80 font-medium italic">{climb.climbType}</td>
                                            <td className="p-4 opacity-80 font-medium">{climb.wall}</td>
                                            <td className="p-4 opacity-80 font-semibold text-[#00205B]">
                                                {viewMode === 'date' ? climb.setter : climb.dateSet.toLocaleDateString()}
                                            </td>
                                            <td className="p-4 font-black text-[10px] uppercase tracking-tighter text-slate-400">
                                                {climb.gym?.replace('Movement ', '') || '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Page <span className="text-[#00205B]">{currentPage}</span> of <span className="text-[#00205B]">{totalPages}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => prev - 1)}
                                        className="px-4 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-slate-50 transition-all active:scale-95"
                                    >
                                        Prev
                                    </button>
                                    <button
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                        className="px-4 py-1.5 rounded-lg border border-slate-200 bg-white text-[#00205B] text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-slate-50 transition-all active:scale-95"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
                {!selectedKey && (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-8">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-200">
                            <FileText size={32} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Select a category to begin analysis</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DataExplorer;