import React from 'react';
import {
    FileText, Edit3, Sparkles, LayoutDashboard, Database, LogOut,
    ChevronRight, Map, BarChart2, Save, RotateCcw, Mail,
    Download, Printer, Plus, Target, ClipboardList, Zap
} from 'lucide-react';
import { useDashboardStore } from '../store/useDashboardStore';
import { GYM_DISPLAY_NAMES } from '../constants/mapTemplates';
import { GYM_COLORS, TYPE_COLORS } from '../constants/colors';

interface SidebarProps {
    gymNames: string[];
    hasGeneratorData: boolean;
    hasAnalyticsData: boolean;
    onSaveGenerator?: () => void;
    onLoadGenerator?: () => void;
    onEmailGenerator?: () => void;
    onDownloadGenerator?: () => void;
    onPrintGenerator?: () => void;
    onStartTutorial?: () => void;
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
    onStartTutorial
}) => {
    const {
        activeView, setActiveView,
        selectedGyms, toggleGymSelection,
        isCompareMode, setIsCompareMode,
        baselineSettings, setBaselineSettings,
        setShowSettings, setShowInstructions,
        setShowBaselineSettings, setShowCommentModal,
        setShowUploadOverlay,
        resetAll
    } = useDashboardStore();
    return (
        <aside className="w-72 bg-[#00205B] text-white flex flex-col fixed inset-y-0 left-0 z-50 shadow-2xl">
            {/* Brand Header */}
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3 mb-1" id="tour-brand">
                    <div className="p-2 rounded-lg shadow-lg" style={{ backgroundColor: TYPE_COLORS.routes }}>
                        <LayoutDashboard size={24} className="text-white" />
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
                            id="nav-generator"
                            onClick={() => setActiveView('generator')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeView === 'generator'
                                ? 'bg-[#EDE04B] text-[#00205B] shadow-lg shadow-[#EDE04B]/20'
                                : 'text-white/40 hover:bg-white/5 hover:text-white/60'
                                }`}
                        >
                            <Map size={18} />
                            <span className="text-xs font-black uppercase tracking-widest">Map Generator</span>
                        </button>

                        <button
                            id="nav-mapper"
                            onClick={() => setActiveView('mapper')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeView === 'mapper'
                                ? 'bg-white/10 text-white shadow-inner border border-white/10'
                                : 'text-white/40 hover:bg-white/5 hover:text-white/60'
                                }`}
                        >
                            <Edit3 size={18} style={{ color: activeView === 'mapper' ? TYPE_COLORS.routes : undefined }} />
                            <span className="text-xs font-black uppercase tracking-widest">Route Mapper</span>
                        </button>
                    </div>
                </div>

                {/* Dynamic Contextual Tools */}
                {(activeView === 'analytics' || activeView === 'report' || activeView === 'generator') && (
                    <div className="mx-auto w-[94%] p-4 bg-black/20 border border-white/5 rounded-2xl space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 shadow-xl">
                        <div className="flex items-center gap-2 mb-2 px-1">
                            <Sparkles size={16} className="text-[#009CA6]" />
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{activeView.replace('-', ' ')} Controls</p>
                        </div>

                        {/* Selection Navigation - Analytics & Report */}
                        {(activeView === 'analytics' || activeView === 'report') && (
                            <div className="space-y-6">
                                <div>
                                    <div className="flex items-center justify-between px-1 mb-4">
                                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Active Locations</p>
                                        {(() => {
                                            const canCompare = gymNames.filter(n => n !== "Regional Overview").length >= 2;
                                            return (
                                                <label className={`flex items-center gap-2 transition-all ${canCompare ? 'cursor-pointer group' : 'cursor-not-allowed opacity-40 grayscale-[0.5]'}`}>
                                                    <span className={`text-[9px] font-black uppercase transition-colors ${canCompare && isCompareMode ? 'text-[#009CA6]' : 'text-white/20'}`}>Compare</span>
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
                                    <div className="space-y-1">
                                        {gymNames.map(name => {
                                            const isSelected = selectedGyms.includes(name);
                                            const isRegional = name === "Regional Overview";
                                            const displayName = isRegional ? "Regional HQ" : (GYM_DISPLAY_NAMES[name] || name);

                                            return (
                                                <button
                                                    key={name}
                                                    onClick={() => toggleGymSelection(name)}
                                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group ${isSelected
                                                        ? 'text-white shadow-lg'
                                                        : 'text-white/50 hover:bg-white/5 hover:text-white/70'
                                                        }`}
                                                    style={{ backgroundColor: isSelected ? TYPE_COLORS.routes : undefined }}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {isRegional ? (
                                                            <Sparkles size={16} className={isSelected ? "text-amber-300" : ""} style={{ color: isSelected ? undefined : TYPE_COLORS.routes }} />
                                                        ) : (
                                                            <Database
                                                                size={16}
                                                                className={isSelected ? "text-white" : ""}
                                                                style={{ color: isSelected ? undefined : (GYM_COLORS[name] || 'rgba(255,255,255,0.2)') }}
                                                            />
                                                        )}
                                                        <span className="text-xs font-bold truncate max-w-[150px]">
                                                            {displayName}
                                                        </span>
                                                    </div>
                                                    <ChevronRight size={14} className={`transition-transform ${isSelected ? 'opacity-100 rotate-90' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Generator Navigation - Shared Actions */}
                        {activeView === 'generator' && (
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4 px-1">Actions</p>
                                    <div className="space-y-1">
                                        <button
                                            onClick={onDownloadGenerator}
                                            disabled={!hasGeneratorData}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${!hasGeneratorData ? 'opacity-30 cursor-not-allowed text-white/20' : 'text-white/50 hover:bg-white/5 hover:text-white/70'}`}>
                                            <Download size={16} className={`transition-colors ${!hasGeneratorData ? '' : 'text-white/20 group-hover:text-[#009CA6]'}`} />
                                            <span className="text-xs font-bold">Download PNGs</span>
                                        </button>
                                        <button
                                            onClick={onPrintGenerator}
                                            disabled={!hasGeneratorData}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${!hasGeneratorData ? 'opacity-30 cursor-not-allowed text-white/20' : 'text-white/50 hover:bg-white/5 hover:text-white/70'}`}>
                                            <Printer size={16} className={`transition-colors ${!hasGeneratorData ? '' : 'text-white/20 group-hover:text-[#009CA6]'}`} />
                                            <span className="text-xs font-bold">Print PDF</span>
                                        </button>
                                        <button
                                            onClick={onEmailGenerator}
                                            disabled={!hasGeneratorData}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${!hasGeneratorData ? 'opacity-30 cursor-not-allowed text-white/20' : 'text-white/50 hover:bg-white/5 hover:text-white/70'}`}>
                                            <Mail size={16} className={`transition-colors ${!hasGeneratorData ? '' : 'text-white/20 group-hover:text-[#009CA6]'}`} />
                                            <span className="text-xs font-bold">Email Schedule</span>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4 px-1">Memory</p>
                                    <div className="space-y-1">
                                        <button
                                            onClick={onSaveGenerator}
                                            disabled={!hasGeneratorData}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${!hasGeneratorData ? 'opacity-30 cursor-not-allowed text-white/20' : 'text-white/50 hover:bg-white/5 hover:text-white/70'}`}>
                                            <Save size={16} className={`transition-colors ${!hasGeneratorData ? '' : 'text-white/20 group-hover:text-[#009CA6]'}`} />
                                            <span className="text-xs font-bold">Save Session</span>
                                        </button>
                                        <button
                                            onClick={onLoadGenerator}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/50 hover:bg-white/5 hover:text-white/70 transition-all group">
                                            <RotateCcw size={16} className="text-white/20 group-hover:text-[#009CA6]" />
                                            <span className="text-xs font-bold">Restore Saved</span>
                                        </button>
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
                                            onClick={() => setShowBaselineSettings(true)}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/50 hover:bg-white/5 hover:text-white/70 transition-all group">
                                            <Target size={16} className="text-white/20 group-hover:text-[#009CA6]" />
                                            <span className="text-xs font-bold">Benchmarks</span>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-4 px-1">
                                        <p id="tour-report-summary-label" className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Summary</p>
                                        <div
                                            onClick={() => setBaselineSettings({ ...baselineSettings, showSummary: !baselineSettings.showSummary })}
                                            className={`w-8 h-4 rounded-full relative transition-colors cursor-pointer ${baselineSettings.showSummary ? 'bg-[#009CA6]' : 'bg-white/10'}`}>
                                            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all shadow-sm ${baselineSettings.showSummary ? 'left-4.5' : 'left-0.5'}`} style={{ left: baselineSettings.showSummary ? '1.125rem' : '0.125rem' }}></div>
                                        </div>
                                    </div>

                                    {baselineSettings.showSummary && (
                                        <div className="px-1 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <textarea
                                                id="tour-report-summary-input"
                                                className="w-full bg-black/20 border border-white/5 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-[#009CA6]/50 transition-colors placeholder:text-white/20 min-h-[120px] resize-none"
                                                placeholder="Add context..."
                                                value={baselineSettings.reportComments}
                                                onChange={(e) => setBaselineSettings({ ...baselineSettings, reportComments: e.target.value })}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4 px-1">Toggles</p>
                                    <div className="space-y-3 px-1">
                                        <label className="flex items-center justify-between cursor-pointer group">
                                            <div className="flex items-center gap-2">
                                                <Zap size={14} className={baselineSettings.showBaselines ? "text-amber-500" : "text-white/20"} />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Benchmarks</span>
                                            </div>
                                            <div className={`w-8 h-4 rounded-full relative transition-colors ${baselineSettings.showBaselines ? 'bg-[#009CA6]' : 'bg-white/10'}`}>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={baselineSettings.showBaselines}
                                                    onChange={(e) => setBaselineSettings({ ...baselineSettings, showBaselines: e.target.checked })}
                                                />
                                                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all shadow-sm ${baselineSettings.showBaselines ? 'left-4.5' : 'left-0.5'}`} style={{ left: baselineSettings.showBaselines ? '1.125rem' : '0.125rem' }}></div>
                                            </div>
                                        </label>

                                        <label id="tour-baseline-reference" className="flex items-center justify-between cursor-pointer group">
                                            <div className="flex items-center gap-2">
                                                <ClipboardList size={14} className={baselineSettings.showReferencePage ? "text-[#009CA6]" : "text-white/20"} />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Reference</span>
                                            </div>
                                            <div className={`w-8 h-4 rounded-full relative transition-colors ${baselineSettings.showReferencePage ? 'bg-[#009CA6]' : 'bg-white/10'}`}>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={baselineSettings.showReferencePage}
                                                    onChange={(e) => setBaselineSettings({ ...baselineSettings, showReferencePage: e.target.checked })}
                                                />
                                                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all shadow-sm ${baselineSettings.showReferencePage ? 'left-4.5' : 'left-0.5'}`} style={{ left: baselineSettings.showReferencePage ? '1.125rem' : '0.125rem' }}></div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Generator Config */}
                        {activeView === 'generator' && (
                            <div id="tour-generator-sidebar" className="pt-5">
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4 px-1">Config</p>
                                <div className="space-y-1">
                                    <button
                                        onClick={() => setShowSettings(true)}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/50 hover:bg-white/5 hover:text-white/70 transition-all group">
                                        <LayoutDashboard size={16} className="text-white/20 group-hover:text-[#009CA6]" />
                                        <span className="text-xs font-bold">Email Settings</span>
                                    </button>
                                    <button
                                        id="tour-generator-instructions"
                                        onClick={() => setShowInstructions(true)}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/50 hover:bg-white/5 hover:text-white/70 transition-all group">
                                        <Sparkles size={16} className="text-white/20 group-hover:text-[#009CA6]" />
                                        <span className="text-xs font-bold">Guide</span>
                                    </button>
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
                    <Sparkles size={16} />
                    <span>Tutorial Tour</span>
                </button>
                <button
                    onClick={resetAll}
                    className="w-full flex items-center gap-3 px-4 py-3 text-white/40 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all font-bold text-xs uppercase tracking-widest"
                >
                    <LogOut size={16} />
                    <span>Clear & Start Fresh</span>
                </button>
            </div >
        </aside >
    );
};

export default Sidebar;
