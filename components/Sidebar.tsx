import React from 'react';
import {
    FileText, Edit3, Sparkles, LayoutDashboard, Database, LogOut,
    ChevronRight, Map, BarChart2, Save, RotateCcw, Mail, Calendar, DollarSign,
    Download, Printer, Plus, Target, ClipboardList, Zap, Compass, HelpCircle,
    TrendingUp, LineChart, Gauge
} from 'lucide-react';
import { useDashboardStore } from '../store/useDashboardStore';
import { GYM_COLORS, TYPE_COLORS } from '../constants/colors';
import { GYMS } from '../constants/gyms';

interface SidebarProps {
    gymNames: string[];
    gymDisplayNames: Record<string, string>;
    hasGeneratorData: boolean;
    hasAnalyticsData: boolean;
    onSaveGenerator?: () => void;
    onLoadGenerator?: () => void;
    onEmailGenerator?: () => void;
    onDownloadGenerator?: () => void;
    onPrintGenerator?: () => void;
    onStartTutorial?: () => void;
    onResetAllEdits?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    gymNames,
    hasGeneratorData,
    hasAnalyticsData,
    onSaveGenerator,
    onLoadGenerator,
    onEmailGenerator,
    onDownloadGenerator,
    onPrintGenerator,
    onStartTutorial,
    onResetAllEdits,
    gymDisplayNames
}) => {
    const {
        activeView, setActiveView,
        selectedGyms, toggleGymSelection, setSelectedGyms,
        isCompareMode, setIsCompareMode,
        getBaseline, setBaselineSettings,
        setShowSettings, setShowInstructions,
        setShowBaselineSettings, setShowCommentModal,
        setShowUploadOverlay, setShowDiscoveryModal,
        comparisonMode, setComparisonMode,
        resetAll,
        emailSettings,
        setEmailSettings,
        gymSettings,
        climbData,
    } = useDashboardStore();

    const activeBaselineGymCode = selectedGyms.length === 1 && selectedGyms[0] !== "Regional Overview" ? selectedGyms[0] : 'DEFAULT';
    const activeBaseline = getBaseline(activeBaselineGymCode);

    const gymsByRegion = React.useMemo<Record<string, string[]>>(() => {
        const grouped: Record<string, string[]> = {};
        gymNames.forEach(name => {
            if (name === "Regional Overview") {
                if (!grouped["System"]) grouped["System"] = [];
                grouped["System"].push(name);
                return;
            }
            const gym = GYMS.find(g => g.code === name || g.name === name);
            const region = gym?.region || "Other Locations";
            if (!grouped[region]) grouped[region] = [];
            grouped[region].push(name);
        });
        return grouped;
    }, [gymNames]);

    return (
        <aside className="w-72 bg-[#00205B] text-white flex flex-col fixed inset-y-0 left-0 z-50 shadow-2xl">
            {/* Brand Header */}
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3 mb-1" id="tour-brand">
                    <div className="flex items-center justify-center p-1">
                        <img
                            src={`${import.meta.env.BASE_URL}assets/justLogo.png`}
                            className="w-8 h-8 object-contain"
                            alt="Movement"
                        />
                    </div>
                    <div>
                        <h1 className="text-lg font-black uppercase tracking-tighter leading-none">SMaC</h1>
                        <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mt-1">Regional Hub</p>
                    </div>
                </div>
            </div>

            {/* Navigation Section */}
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 custom-scrollbar">

                {/* Analytics & Reporting */}
                <div>
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4 px-2">Analytics & Reporting</p>
                    <div className="grid grid-cols-1 gap-1">
                        <button
                            id="nav-analytics"
                            onClick={() => setActiveView('analytics')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeView === 'analytics'
                                ? 'bg-white/10 text-white shadow-inner border border-white/10'
                                : 'text-white/40 hover:bg-white/5 hover:text-white/60'
                                }`}
                        >
                            <BarChart2 size={18} style={{ color: activeView === 'analytics' ? TYPE_COLORS.routes : undefined }} />
                            <span className="text-xs font-black uppercase tracking-widest">Analytics</span>
                        </button>

                        <button
                            id="nav-shift-analyzer"
                            onClick={() => setActiveView('shift-analyzer')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeView === 'shift-analyzer'
                                ? 'bg-white/10 text-white shadow-inner border border-white/10'
                                : 'text-white/40 hover:bg-white/5 hover:text-white/60'
                                }`}
                        >
                            <Zap size={18} style={{ color: activeView === 'shift-analyzer' ? '#009CA6' : undefined }} />
                            <span className="text-xs font-black uppercase tracking-widest text-left">Shift Analyzer</span>
                        </button>

                        <button
                            id="nav-report"
                            onClick={() => setActiveView('report')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeView === 'report'
                                ? 'bg-white/10 text-white shadow-inner border border-white/10'
                                : 'text-white/40 hover:bg-white/5 hover:text-white/60'
                                }`}
                        >
                            <FileText size={18} style={{ color: activeView === 'report' ? TYPE_COLORS.routes : undefined }} />
                            <span className="text-xs font-black uppercase tracking-widest">Production Report</span>
                        </button>
                    </div>
                </div>

                {/* Logistics & Prep */}
                <div>
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4 px-2">Logistics & Prep</p>
                    <div className="grid grid-cols-1 gap-1">


                        <button
                            id="nav-mapper"
                            onClick={() => setActiveView('mapper')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeView === 'mapper'
                                ? 'bg-white/10 text-white shadow-inner border border-white/10'
                                : 'text-white/40 hover:bg-white/5 hover:text-white/60'
                                }`}
                        >
                            <Map size={18} style={{ color: activeView === 'mapper' ? TYPE_COLORS.routes : undefined }} />
                            <span className="text-xs font-black uppercase tracking-widest">Route Mapper</span>
                        </button>

                        <button
                            id="nav-wsp-generator"
                            onClick={() => setActiveView('wsp-generator')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeView === 'wsp-generator'
                                ? 'bg-white/10 text-white shadow-inner border border-white/10'
                                : 'text-white/40 hover:bg-white/5 hover:text-white/60'
                                }`}
                        >
                            <Calendar size={18} style={{ color: activeView === 'wsp-generator' ? '#008C95' : undefined }} />
                            <span className="text-xs font-black uppercase tracking-widest text-left">WSP Generator</span>
                        </button>

                        <button
                            id="nav-budget-tracker"
                            onClick={() => setActiveView('budget-tracker')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeView === 'budget-tracker'
                                ? 'bg-white/10 text-white shadow-inner border border-white/10'
                                : 'text-white/40 hover:bg-white/5 hover:text-white/60'
                                }`}
                        >
                            <DollarSign size={18} style={{ color: activeView === 'budget-tracker' ? '#10b981' : undefined }} />
                            <span className="text-xs font-black uppercase tracking-widest text-left">Budget Tracker</span>
                        </button>
                    </div>
                </div>

                {/* Executive Oversight */}
                <div>
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4 px-2">Executive Oversight</p>
                    <div className="grid grid-cols-1 gap-1">
                        {/* Hidden simulator, director view, orbit log */}
                    </div>
                </div>

                {/* Dynamic Contextual Tools */}
                {(activeView === 'analytics' || activeView === 'report') && (
                    <div className="mx-auto w-[94%] p-4 bg-black/20 border border-white/5 rounded-2xl space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 shadow-xl">
                        <div className="flex items-center gap-2 mb-2 px-1">
                            <img
                                src={`${import.meta.env.BASE_URL}assets/justLogo.png`}
                                className="w-4 h-4 object-contain"
                                alt=""
                            />
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{activeView.replace('-', ' ')} Controls</p>
                        </div>

                        {/* Selection Navigation - Analytics, Report */}
                        {(activeView === 'analytics' || activeView === 'report') && (
                            <div className="space-y-6">
                                <div>
                                    <div className="flex items-center justify-between px-1 mb-4">
                                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Active Locations</p>
                                        {(() => {
                                            const canCompare = gymNames.filter(n => n !== "Regional Overview").length >= 2;
                                            return (
                                                <label className={`flex items-center gap-2 transition-all ${canCompare ? 'cursor-pointer group' : 'cursor-not-allowed opacity-40 grayscale-[0.5]'}`}>
                                                    <span className={`text-[9px] font-black uppercase transition-colors ${canCompare && isCompareMode ? 'text-[#009CA6]' : 'text-white/20'}`}>
                                                        Compare
                                                    </span>
                                                    <div className={`w-7 h-4 rounded-full relative transition-colors ${canCompare && isCompareMode ? '' : 'bg-white/10'}`} style={{ backgroundColor: canCompare && isCompareMode ? TYPE_COLORS.routes : undefined }}>
                                                        <input
                                                            type="checkbox"
                                                            className="hidden"
                                                            checked={canCompare && isCompareMode}
                                                            onChange={(e) => canCompare && setIsCompareMode(e.target.checked)}
                                                            disabled={!canCompare}
                                                        />
                                                        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all shadow-sm ${canCompare && isCompareMode ? 'left-3.5' : 'left-0.5'}`}></div>
                                                    </div>
                                                </label>
                                            );
                                        })()}
                                    </div>
                                    <div className="space-y-4 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                                        {(Object.entries(gymsByRegion) as [string, string[]][]).map(([region, names]) => (
                                            <div key={region} className="space-y-1">
                                                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] px-2 mb-2">{region}</p>
                                                {names.map(name => {
                                                    const isSelected = selectedGyms.includes(name);
                                                    const isRegional = name === "Regional Overview";
                                                    return (
                                                        <button
                                                            key={name}
                                                            onClick={() => {
                                                                if (isRegional) {
                                                                    const allRelevant = gymNames.filter(n => n !== "Regional Overview");
                                                                    const allSelected = allRelevant.every(n => selectedGyms.includes(n));
                                                                    if (allSelected) {
                                                                        setSelectedGyms(["Regional Overview"]);
                                                                    } else {
                                                                        setSelectedGyms(gymNames);
                                                                    }
                                                                } else {
                                                                    // If not in compare/batch mode, handle as exclusive selection
                                                                    // (unless deselecting the only selected item)
                                                                    if (!isCompareMode && !isSelected) {
                                                                        setSelectedGyms([name]);
                                                                    } else {
                                                                        toggleGymSelection(name);
                                                                    }
                                                                }
                                                            }}
                                                            className={`flex items-center justify-between w-full px-3 py-1.5 rounded-lg transition-all group ${isSelected
                                                                ? 'bg-white/10 text-white shadow-inner border border-white/10'
                                                                : 'text-white/40 hover:bg-white/5 hover:text-white/60'
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isRegional ? TYPE_COLORS.routes : GYM_COLORS[name] }}></div>
                                                                <span className="text-[11px] font-bold truncate max-w-[140px]">
                                                                    {isRegional ? "Regional HQ" : (gymDisplayNames[name] || name)}
                                                                </span>
                                                            </div>
                                                            <ChevronRight size={12} className={`transition-transform ${isSelected ? 'opacity-100 rotate-90' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}



                        {/* Production Report Actions */}
                        {activeView === 'report' && (
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4 px-1">Actions</p>
                                    <div className="space-y-1">
                                        <button
                                            onClick={onEmailGenerator}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/50 hover:bg-white/5 hover:text-white/70 transition-all group">
                                            <Mail size={16} className="text-white/20 group-hover:text-[#009CA6]" />
                                            <span className="text-xs font-bold">Email Leadership</span>
                                        </button>
                                        <button
                                            id="tour-baseline-settings"
                                            onClick={() => setShowBaselineSettings(true, activeBaselineGymCode)}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/50 hover:bg-white/5 hover:text-white/70 transition-all group">
                                            <Target size={16} className="text-white/20 group-hover:text-[#009CA6]" />
                                            <span className="text-xs font-bold">Benchmarks</span>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4 px-1">Comparison Mode</p>
                                    <div className="flex bg-black/20 p-1 rounded-xl">
                                        {(['none', 'pop', 'yoy'] as const).map((mode) => (
                                            <button
                                                key={mode}
                                                onClick={() => setComparisonMode(mode)}
                                                className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${comparisonMode === mode
                                                    ? 'bg-[#009CA6] text-white shadow-lg'
                                                    : 'text-white/40 hover:bg-white/5 hover:text-white/60'
                                                    }`}
                                            >
                                                {mode === 'none' ? 'None' : mode === 'pop' ? 'PoP' : 'YoY'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-4 px-1">
                                        <p id="tour-report-summary-label" className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Summary</p>
                                        <div
                                            onClick={() => setBaselineSettings({ ...activeBaseline, showSummary: !activeBaseline.showSummary }, activeBaselineGymCode)}
                                            className={`w-8 h-4 rounded-full relative transition-colors cursor-pointer ${activeBaseline.showSummary ? 'bg-[#009CA6]' : 'bg-white/10'}`}>
                                            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all shadow-sm ${activeBaseline.showSummary ? 'left-4.5' : 'left-0.5'}`} style={{ left: activeBaseline.showSummary ? '1.125rem' : '0.125rem' }}></div>
                                        </div>
                                    </div>

                                    {activeBaseline.showSummary && (
                                        <div className="px-1 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <textarea
                                                id="tour-report-summary-input"
                                                className="w-full bg-black/20 border border-white/5 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-[#009CA6]/50 transition-colors placeholder:text-white/20 min-h-[120px] resize-none"
                                                placeholder="Add context..."
                                                value={activeBaseline.reportComments}
                                                onChange={(e) => setBaselineSettings({ ...activeBaseline, reportComments: e.target.value }, activeBaselineGymCode)}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4 px-1">Toggles</p>
                                    <div className="space-y-3 px-1">
                                        <label className="flex items-center justify-between cursor-pointer group">
                                            <div className="flex items-center gap-2">
                                                <Zap size={14} className={activeBaseline.showBaselines ? "text-amber-500" : "text-white/20"} />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Benchmarks</span>
                                            </div>
                                            <div className={`w-8 h-4 rounded-full relative transition-colors ${activeBaseline.showBaselines ? 'bg-[#009CA6]' : 'bg-white/10'}`}>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={activeBaseline.showBaselines}
                                                    onChange={(e) => setBaselineSettings({ ...activeBaseline, showBaselines: e.target.checked }, activeBaselineGymCode)}
                                                />
                                                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all shadow-sm ${activeBaseline.showBaselines ? 'left-4.5' : 'left-0.5'}`} style={{ left: activeBaseline.showBaselines ? '1.125rem' : '0.125rem' }}></div>
                                            </div>
                                        </label>

                                        <label id="tour-baseline-reference" className="flex items-center justify-between cursor-pointer group">
                                            <div className="flex items-center gap-2">
                                                <ClipboardList size={14} className={activeBaseline.showReferencePage ? "text-[#009CA6]" : "text-white/20"} />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Reference</span>
                                            </div>
                                            <div className={`w-8 h-4 rounded-full relative transition-colors ${activeBaseline.showReferencePage ? 'bg-[#009CA6]' : 'bg-white/10'}`}>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={activeBaseline.showReferencePage}
                                                    onChange={(e) => setBaselineSettings({ ...activeBaseline, showReferencePage: e.target.checked }, activeBaselineGymCode)}
                                                />
                                                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all shadow-sm ${activeBaseline.showReferencePage ? 'left-4.5' : 'left-0.5'}`} style={{ left: activeBaseline.showReferencePage ? '1.125rem' : '0.125rem' }}></div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer / Reset */}
            <div className="p-4 bg-black/20 border-t border-white/5">
                <button
                    onClick={onStartTutorial}
                    className="w-full flex items-center gap-3 px-4 py-3 text-white/40 hover:text-[#009CA6] hover:bg-[#009CA6]/10 rounded-xl transition-all font-bold text-xs uppercase tracking-widest mb-2"
                >
                    <img
                        src={`${import.meta.env.BASE_URL}assets/justLogo.png`}
                        className="w-4 h-4 object-contain brightness-0 invert opacity-40 group-hover:opacity-100"
                        alt=""
                    />
                    <span>Tutorial Tour</span>
                </button>
                <button
                    onClick={resetAll}
                    className="w-full flex items-center gap-3 px-4 py-3 text-white/40 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all font-bold text-xs uppercase tracking-widest"
                >
                    <LogOut size={16} />
                    <span>Clear & Start Fresh</span>
                </button>
                <div className="mt-4 text-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">version 0.1</span>
                </div>
            </div >
        </aside >
    );
};

export default Sidebar;
