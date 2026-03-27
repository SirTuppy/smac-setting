import React from 'react';
import { X, CheckCircle2, Star, Zap, Info } from 'lucide-react';
import { CHANGELOG, APP_VERSION } from '../../constants/version';
import { useDashboardStore } from '../../store/useDashboardStore';

interface ChangelogModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ChangelogModal: React.FC<ChangelogModalProps> = ({ isOpen, onClose }) => {
    const { isDarkMode } = useDashboardStore();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            
            <div className={`relative w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-3xl shadow-2xl border animate-in zoom-in duration-300 ${
                isDarkMode ? 'bg-[#1a1d27] border-white/10' : 'bg-white border-slate-200'
            }`}>
                {/* Header */}
                <div className={`p-6 border-b flex items-center justify-between ${
                    isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-slate-50'
                }`}>
                    <div className="flex items-center gap-3">
                        <div className="bg-[#009CA6] p-2 rounded-xl text-white">
                            <Star size={20} fill="currentColor" />
                        </div>
                        <div>
                            <h2 className={`text-xl font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-[#00205B]'}`}>
                                What's New in SMaC
                            </h2>
                            <p className="text-xs font-bold text-[#009CA6] uppercase tracking-widest">
                                Version {APP_VERSION}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className={`p-2 rounded-full transition-colors ${
                            isDarkMode ? 'hover:bg-white/10 text-white/40' : 'hover:bg-slate-200 text-slate-400'
                        }`}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-6 max-h-[calc(80vh-140px)] custom-scrollbar">
                    <div className="space-y-10">
                        {CHANGELOG.map((entry, idx) => (
                            <div key={entry.version} className="relative">
                                {idx !== CHANGELOG.length - 1 && (
                                    <div className={`absolute left-[15px] top-8 bottom-[-40px] w-0.5 ${
                                        isDarkMode ? 'bg-white/5' : 'bg-slate-100'
                                    }`} />
                                )}
                                
                                <div className="flex gap-6">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
                                        idx === 0 
                                            ? 'bg-[#009CA6] text-white shadow-lg' 
                                            : isDarkMode ? 'bg-white/10 text-white/40' : 'bg-slate-100 text-slate-400'
                                    }`}>
                                        <div className="text-[10px] font-black">{entry.version}</div>
                                    </div>
                                    
                                    <div className="flex-1 pb-4">
                                        <div className="flex items-baseline justify-between mb-4">
                                            <h3 className={`font-black uppercase tracking-wide ${isDarkMode ? 'text-white' : 'text-[#00205B]'}`}>
                                                {entry.title}
                                            </h3>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                {entry.date}
                                            </span>
                                        </div>

                                        <div className="space-y-4">
                                            {entry.features.length > 0 && (
                                                <div>
                                                    <h4 className="text-[10px] font-black text-[#009CA6] uppercase tracking-[0.2em] mb-3">New Features</h4>
                                                    <ul className="space-y-2">
                                                        {entry.features.map((feature, i) => (
                                                            <li key={i} className="flex gap-2 text-sm leading-relaxed">
                                                                <Zap size={14} className="mt-1 shrink-0 text-[#009CA6]" />
                                                                <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>{feature}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {entry.fixes && entry.fixes.length > 0 && (
                                                <div>
                                                    <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-3">Improvements & Fixes</h4>
                                                    <ul className="space-y-2">
                                                        {entry.fixes.map((fix, i) => (
                                                            <li key={i} className="flex gap-2 text-sm">
                                                                <CheckCircle2 size={14} className="mt-1 shrink-0 text-emerald-500" />
                                                                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>{fix}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className={`p-4 border-t flex justify-center ${
                    isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-slate-50'
                }`}>
                    <button
                        onClick={onClose}
                        className="bg-[#009CA6] hover:bg-[#007C85] text-white px-8 py-2.5 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg hover:translate-y-[-1px]"
                    >
                        Got it, Chief!
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChangelogModal;
