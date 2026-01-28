import React from 'react';
import { FileText, Edit3, Sparkles, LayoutDashboard, Database, LogOut, Layers, ChevronRight, Map, BarChart2, Save, RotateCcw, Mail, Download, Printer, Plus, Target, MessageSquare, ClipboardList, Zap } from 'lucide-react';
import { AppView, BaselineSettings } from '../types';
import { GYM_DISPLAY_NAMES } from '../constants/mapTemplates';
import { GYM_COLORS, TYPE_COLORS } from '../constants/colors';

interface SidebarProps {
    gymNames: string[];
    selectedGyms: string[];
    onSelectGym: (name: string) => void;
    isCompareMode: boolean;
    onToggleCompare: (val: boolean) => void;
    onReset: () => void;
    activeView: AppView;
    onViewChange: (view: AppView) => void;
    hasGeneratorData: boolean;
    hasAnalyticsData: boolean;
    onSaveGenerator?: () => void;
    onLoadGenerator?: () => void;
    onEmailGenerator?: () => void;
    onDownloadGenerator?: () => void;
    onPrintGenerator?: () => void;
    onOpenGeneratorSettings?: () => void;
    onOpenGeneratorInstructions?: () => void;
    onOpenBaselineSettings?: () => void;
    onOpenCommentModal?: () => void;
    baselineSettings: BaselineSettings;
    onUpdateBaselineSettings: (settings: BaselineSettings) => void;
    onUploadMore?: () => void;
    onStartTutorial?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    gymNames,
    selectedGyms,
    onSelectGym,
    isCompareMode,
    onToggleCompare,
    onReset,
    activeView,
    onViewChange,
    hasGeneratorData,
    hasAnalyticsData,
    onSaveGenerator,
    onLoadGenerator,
    onEmailGenerator,
    onDownloadGenerator,
    onPrintGenerator,
    onOpenGeneratorSettings,
    onOpenGeneratorInstructions,
    onOpenBaselineSettings,
    onOpenCommentModal,
    baselineSettings,
    onUpdateBaselineSettings,
    onUploadMore,
    onStartTutorial
}) => {
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

                {/* Mode Switcher */}
                <div>
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4 px-2">Dashboard Tools</p>
                    <div className="grid grid-cols-1 gap-2">
                        <button
                            id="nav-analytics"
                            onClick={() => onViewChange('analytics')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeView === 'analytics'
                                ? 'bg-white/10 text-white shadow-inner border border-white/10'
                                : 'text-white/40 hover:bg-white/5 hover:text-white/60'
                                }`}
                        >
                            <BarChart2 size={18} style={{ color: activeView === 'analytics' ? TYPE_COLORS.routes : undefined }} />
                            <span className="text-xs font-black uppercase tracking-widest">Analytics</span>
                        </button>

                        <button
                            id="nav-report"
                            onClick={() => onViewChange('report')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeView === 'report'
                                ? 'bg-white/10 text-white shadow-inner border border-white/10'
                                : 'text-white/40 hover:bg-white/5 hover:text-white/60'
                                }`}
                        >
                            <FileText size={18} style={{ color: activeView === 'report' ? TYPE_COLORS.routes : undefined }} />
                            <span className="text-xs font-black uppercase tracking-widest">Production Report</span>
                        </button>

                        <button
                            id="nav-generator"
                            onClick={() => onViewChange('generator')}
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
                            onClick={() => onViewChange('mapper')}
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

                {/* Selection Navigation - Analytics & Report */}
                {(activeView === 'analytics' || activeView === 'report') && (
                    <div>
                        <div className="flex items-center justify-between px-2 mb-4">
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
                                                onChange={(e) => canCompare && onToggleCompare(e.target.checked)}
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
                                        onClick={() => onSelectGym(name)}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group ${isSelected
                                            ? 'text-white shadow-lg'
                                            : 'text-white/60 hover:bg-white/5 hover:text-white'
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
                                            <span className="text-xs font-bold truncate max-w-[160px]">
                                                {displayName}
                                            </span>
                                        </div>
                                        <ChevronRight size={14} className={`transition-transform ${isSelected ? 'opacity-100 rotate-90' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Generator Navigation - Shared Actions */}
                {activeView === 'generator' && (
                    <div id="tour-generator-sidebar" className="space-y-6">
                        <div>
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4 px-2">Export Maps</p>
                            <div className="space-y-1">
                                <button
                                    onClick={onDownloadGenerator}
                                    disabled={!hasGeneratorData}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${!hasGeneratorData ? 'opacity-30 cursor-not-allowed text-white/20' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
                                    <Download size={16} className={`transition-colors ${!hasGeneratorData ? '' : 'text-white/20 group-hover:text-[#009CA6]'}`} />
                                    <span className="text-xs font-bold">Download PNGs</span>
                                </button>
                                <button
                                    onClick={onPrintGenerator}
                                    disabled={!hasGeneratorData}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${!hasGeneratorData ? 'opacity-30 cursor-not-allowed text-white/20' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
                                    <Printer size={16} className={`transition-colors ${!hasGeneratorData ? '' : 'text-white/20 group-hover:text-[#009CA6]'}`} />
                                    <span className="text-xs font-bold">Print to PDF</span>
                                </button>
                                <button
                                    onClick={onEmailGenerator}
                                    disabled={!hasGeneratorData}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${!hasGeneratorData ? 'opacity-30 cursor-not-allowed text-white/20' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
                                    <Mail size={16} className={`transition-colors ${!hasGeneratorData ? '' : 'text-white/20 group-hover:text-[#009CA6]'}`} />
                                    <span className="text-xs font-bold">Email Schedule</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4 px-2">Memory & Data</p>
                            <div className="space-y-1">
                                <button
                                    id="nav-upload-more"
                                    onClick={onUploadMore}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:bg-[#009CA6]/20 hover:text-[#009CA6] transition-all group">
                                    <Plus size={16} className="text-[#009CA6]" />
                                    <span className="text-xs font-bold">Upload More Data</span>
                                </button>
                                <button
                                    onClick={onSaveGenerator}
                                    disabled={!hasGeneratorData}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${!hasGeneratorData ? 'opacity-30 cursor-not-allowed text-white/20' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
                                    <Save size={16} className={`transition-colors ${!hasGeneratorData ? '' : 'text-white/20 group-hover:text-[#009CA6]'}`} />
                                    <span className="text-xs font-bold">Save Latest</span>
                                </button>
                                <button
                                    onClick={onLoadGenerator}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:bg-white/5 hover:text-white transition-all group">
                                    <RotateCcw size={16} className="text-white/20 group-hover:text-[#009CA6]" />
                                    <span className="text-xs font-bold">Load Saved</span>
                                </button>
                                <button
                                    onClick={onReset}
                                    disabled={!hasGeneratorData}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group border border-transparent ${!hasGeneratorData ? 'opacity-30 cursor-not-allowed text-rose-300/20' : 'text-rose-300/60 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20'}`}>
                                    <RotateCcw size={16} className={`transition-colors ${!hasGeneratorData ? '' : 'text-rose-500/30 group-hover:text-rose-500'}`} />
                                    <span className="text-xs font-bold">Clear Session</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Production Report Actions */}
                {activeView === 'report' && (
                    <div className="space-y-6">
                        <div>
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4 px-2">Report Actions</p>
                            <div className="space-y-1">
                                <button
                                    onClick={onEmailGenerator}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:bg-white/5 hover:text-white transition-all group">
                                    <Mail size={16} className="text-white/20 group-hover:text-[#009CA6]" />
                                    <span className="text-xs font-bold">Email to Leadership</span>
                                </button>
                                <button
                                    id="tour-baseline-settings"
                                    onClick={onOpenBaselineSettings}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:bg-white/5 hover:text-white transition-all group">
                                    <Target size={16} className="text-white/20 group-hover:text-[#009CA6]" />
                                    <span className="text-xs font-bold">Baseline Benchmarks</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-4 px-2">
                                <p id="tour-report-summary-label" className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Report Summary</p>
                                <div
                                    onClick={() => onUpdateBaselineSettings({ ...baselineSettings, showSummary: !baselineSettings.showSummary })}
                                    className={`w-8 h-4 rounded-full relative transition-colors cursor-pointer ${baselineSettings.showSummary ? 'bg-[#009CA6]' : 'bg-white/10'}`}>
                                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all shadow-sm ${baselineSettings.showSummary ? 'left-4.5' : 'left-0.5'}`} style={{ left: baselineSettings.showSummary ? '1.125rem' : '0.125rem' }}></div>
                                </div>
                            </div>

                            {baselineSettings.showSummary && (
                                <div className="px-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <textarea
                                        id="tour-report-summary-input"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-[#009CA6]/50 transition-colors placeholder:text-white/20 min-h-[120px] resize-none"
                                        placeholder="Add context for leadership (e.g. Competition prep, staffing changes...)"
                                        value={baselineSettings.reportComments}
                                        onChange={(e) => onUpdateBaselineSettings({ ...baselineSettings, reportComments: e.target.value })}
                                    />
                                </div>
                            )}
                        </div>

                        <div>
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4 px-2">Analysis Toggles</p>
                            <div className="space-y-3 px-2">
                                <label className="flex items-center justify-between cursor-pointer group">
                                    <div className="flex items-center gap-2">
                                        <Zap size={14} className={baselineSettings.showBaselines ? "text-amber-500" : "text-white/20"} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Show Benchmarks</span>
                                    </div>
                                    <div className={`w-8 h-4 rounded-full relative transition-colors ${baselineSettings.showBaselines ? 'bg-[#009CA6]' : 'bg-white/10'}`}>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={baselineSettings.showBaselines}
                                            onChange={(e) => onUpdateBaselineSettings({ ...baselineSettings, showBaselines: e.target.checked })}
                                        />
                                        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all shadow-sm ${baselineSettings.showBaselines ? 'left-4.5' : 'left-0.5'}`} style={{ left: baselineSettings.showBaselines ? '1.125rem' : '0.125rem' }}></div>
                                    </div>
                                </label>

                                {/* Removed Show Summary from here as it moved to header */}

                                <label className="flex items-center justify-between cursor-pointer group">
                                    <div className="flex items-center gap-2">
                                        <ClipboardList size={14} className={baselineSettings.showReferencePage ? "text-[#009CA6]" : "text-white/20"} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Reference Page</span>
                                    </div>
                                    <div className={`w-8 h-4 rounded-full relative transition-colors ${baselineSettings.showReferencePage ? 'bg-[#009CA6]' : 'bg-white/10'}`}>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={baselineSettings.showReferencePage}
                                            onChange={(e) => onUpdateBaselineSettings({ ...baselineSettings, showReferencePage: e.target.checked })}
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
                    <div className="pt-2">
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4 px-2">Config</p>
                        <div className="space-y-1">
                            <button
                                onClick={onOpenGeneratorSettings}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:bg-white/5 hover:text-white transition-all group">
                                <LayoutDashboard size={16} className="text-white/20 group-hover:text-[#009CA6]" />
                                <span className="text-xs font-bold">Email Settings</span>
                            </button>
                            <button
                                id="tour-generator-instructions"
                                onClick={onOpenGeneratorInstructions}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:bg-white/5 hover:text-white transition-all group">
                                <Sparkles size={16} className="text-white/20 group-hover:text-[#009CA6]" />
                                <span className="text-xs font-bold">Generator Instructions</span>
                            </button>
                        </div>
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
                    onClick={onReset}
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
