import React, { useState, useMemo, useEffect } from 'react';
import { 
  Trophy, Star, ChevronRight, Lock, 
  Search, Edit3, CheckCircle2, 
  MessageSquare, Layers, Target, 
  Zap, Info, Plus, Library, Book
} from 'lucide-react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { 
  ApprenticeInstance, 
  MilestoneTemplate, 
  ApprenticeshipFramework,
  MilestoneStatus,
  MilestoneCategory,
  MilestoneProgress,
  AppView
} from '../../types';
import { GLOBAL_TEMPLATES } from '../../constants/apprenticeship';
import PathEditor from './PathEditor';
import SetterLibrary from './SetterLibrary';
import ResourceHub from './ResourceHub';

// ── Skills Tree Visual Constants ─────────────────────────────────────
const CATEGORY_COLORS: Record<MilestoneCategory, { bg: string; text: string; border: string; glow: string }> = {
  Movement: { bg: 'bg-indigo-500', text: 'text-indigo-500', border: 'border-indigo-500', glow: 'shadow-indigo-500/50' },
  Coordination: { bg: 'bg-violet-500', text: 'text-violet-500', border: 'border-violet-500', glow: 'shadow-violet-500/50' },
  Workflow: { bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500', glow: 'shadow-emerald-500/50' },
  Maintenance: { bg: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500', glow: 'shadow-amber-500/50' },
  Safety: { bg: 'bg-rose-500', text: 'text-rose-500', border: 'border-rose-500', glow: 'shadow-rose-500/50' },
  Aesthetics: { bg: 'bg-fuchsia-500', text: 'text-fuchsia-500', border: 'border-fuchsia-500', glow: 'shadow-fuchsia-500/50' },
  Speed: { bg: 'bg-cyan-500', text: 'text-cyan-500', border: 'border-cyan-500', glow: 'shadow-cyan-500/50' },
  Other: { bg: 'bg-slate-500', text: 'text-slate-500', border: 'border-slate-500', glow: 'shadow-slate-500/50' },
};

// ── Skill Tree Node Component ──────────────────────────────────────────
interface NodeProps {
  milestone: MilestoneTemplate;
  status: MilestoneStatus;
  isActive: boolean;
  onClick: (id: string) => void;
  isUnlocked: boolean;
}

const SkillTreeNode: React.FC<NodeProps> = ({ milestone, status, isActive, onClick, isUnlocked }) => {
  const colors = CATEGORY_COLORS[milestone.category];
  
  const getStatusIcon = () => {
    if (status === 'completed') return <CheckCircle2 size={16} className="text-white" />;
    if (status === 'review') return < Zap size={16} className="text-white animate-pulse" />;
    if (!isUnlocked) return <Lock size={16} className="text-white/40" />;
    return <Layers size={16} className="text-white" />;
  };

  return (
    <div className="flex flex-col items-center gap-2 group">
      <button
        onClick={() => onClick(milestone.id)}
        disabled={!isUnlocked && status !== 'completed'}
        className={`
          relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 transform
          ${isActive ? 'scale-110 rotate-3 z-10' : 'hover:scale-105'}
          ${status === 'completed' ? colors.bg : isUnlocked ? 'bg-slate-700' : 'bg-slate-800'}
          ${status === 'completed' ? `shadow-lg ${colors.glow}` : ''}
          ${isUnlocked && status !== 'completed' ? 'border-2 border-dashed border-slate-600' : 'border-2 border-transparent'}
          ${!isUnlocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {getStatusIcon()}
        
        {/* Progress Glow */}
        {status === 'available' && isUnlocked && (
          <div className={`absolute inset-0 rounded-2xl animate-ping opacity-20 ${colors.bg}`} />
        )}
      </button>
      <span className={`text-[9px] font-black uppercase tracking-tighter text-center max-w-[80px] leading-tight transition-colors ${isActive ? colors.text : 'text-slate-400'}`}>
        {milestone.title}
      </span>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────
const SetterPath: React.FC = () => {
  const { 
    apprenticeInstances, 
    updateApprenticeInstance, 
    updateMilestoneProgress,
    climbData,
    wspSettings
  } = useDashboardStore();

  const [selectedSetter, setSelectedSetter] = useState<string | null>(null);
  const [activeMilestoneId, setActiveMilestoneId] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [activeTab, setActiveTab] = useState<'Roadmap' | 'Library' | 'Resources'>('Roadmap');

  // Derived: List of all unique setters from climbData or instances
  const settersList = useMemo(() => {
    const names = new Set<string>();
    if (climbData) {
      Object.values(climbData).flat().forEach(c => names.add(c.setter));
    }
    Object.keys(apprenticeInstances).forEach(name => names.add(name));
    return Array.from(names).sort();
  }, [climbData, apprenticeInstances]);

  const currentInstance = selectedSetter ? apprenticeInstances[selectedSetter] : null;

  const currentFramework = useMemo(() => {
    if (!currentInstance) return null;
    return GLOBAL_TEMPLATES.find(f => f.id === currentInstance.frameworkId) || GLOBAL_TEMPLATES[0];
  }, [currentInstance]);

  // ── Auto-Initialization for a new setter ───────────────────────────
  const initializeSetter = (name: string, frameworkId: string) => {
    const framework = GLOBAL_TEMPLATES.find(f => f.id === frameworkId) || GLOBAL_TEMPLATES[0];
    const newInstance: ApprenticeInstance = {
      setterName: name,
      frameworkId,
      currentPhaseId: framework.phases[0].id,
      progress: {}
    };
    // Mark first phase's orphans as available
    framework.milestones.forEach(m => {
      if (m.prerequisites.length === 0 && framework.phases[0].milestoneIds.includes(m.id)) {
        newInstance.progress[m.id] = { milestoneId: m.id, status: 'available', tally: 0 };
      } else {
        newInstance.progress[m.id] = { milestoneId: m.id, status: 'locked', tally: 0 };
      }
    });
    updateApprenticeInstance(newInstance);
  };

  const activeMilestone = useMemo(() => {
    if (!currentFramework || !activeMilestoneId) return null;
    return currentFramework.milestones.find(m => m.id === activeMilestoneId);
  }, [currentFramework, activeMilestoneId]);

  const milestoneProgress = useMemo(() => {
    if (!currentInstance || !activeMilestoneId) return null;
    return currentInstance.progress[activeMilestoneId] || { milestoneId: activeMilestoneId, status: 'locked', tally: 0 };
  }, [currentInstance, activeMilestoneId]);

  const isUnlocked = (milestoneId: string) => {
    if (!currentInstance || !currentFramework) return false;
    const m = currentFramework.milestones.find(x => x.id === milestoneId);
    if (!m) return false;
    if (m.prerequisites.length === 0) return true;
    return m.prerequisites.every(preId => currentInstance.progress[preId]?.status === 'completed');
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-950/30">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#009CA6]/20 rounded-xl flex items-center justify-center border border-[#009CA6]/30">
            <Target className="text-[#009CA6]" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">The Setter's Path</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Apprenticeship Progression Framework</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <select
              value={selectedSetter || ''}
              onChange={(e) => setSelectedSetter(e.target.value)}
              className="appearance-none bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 pr-10 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#009CA6] transition-all"
            >
              <option value="">Select a Setter...</option>
              {settersList.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
          </div>

          <button 
            onClick={() => setShowEditor(!showEditor)}
            className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
            title="Edit Frameworks"
          >
            <Edit3 size={18} />
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex bg-slate-900 border-b border-white/5 px-6">
        {(['Roadmap', 'Library', 'Resources'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              px-6 py-4 text-xs font-black uppercase tracking-widest transition-all border-b-2
              ${activeTab === tab 
                ? 'border-[#009CA6] text-white' 
                : 'border-transparent text-slate-500 hover:text-slate-300'}
            `}
          >
            <div className="flex items-center gap-2">
              {tab === 'Roadmap' && <Target size={14} />}
              {tab === 'Library' && <Library size={14} />}
              {tab === 'Resources' && <Zap size={14} />}
              {tab}
            </div>
          </button>
        ))}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'Library' ? (
          <div className="flex-1 p-8 bg-slate-900">
            <SetterLibrary />
          </div>
        ) : activeTab === 'Resources' ? (
          <div className="flex-1 p-8 bg-slate-900">
            <ResourceHub />
          </div>
        ) : (
          /* Roadmap Tab Content */
          <>
            <div className="flex-1 relative overflow-auto p-12 custom-scrollbar bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]">
              {!selectedSetter ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <Search size={48} className="mb-4" />
                  <h3 className="text-xl font-black uppercase tracking-widest text-[#009CA6]">Select an Apprentice</h3>
                  <p className="text-xs font-bold max-w-xs mt-2">Pick a setter to visualize their progression and sign-off on new milestones.</p>
                </div>
              ) : !currentInstance ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <Layers size={48} className="mb-4 text-[#009CA6] animate-bounce" />
                  <h3 className="text-xl font-black uppercase tracking-widest">Setup {selectedSetter}</h3>
                  <p className="text-xs font-bold text-slate-400 max-w-xs mt-2 mb-6">Which path should they follow? This can be changed later.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg">
                    {GLOBAL_TEMPLATES.map(t => (
                      <button
                        key={t.id}
                        onClick={() => initializeSetter(selectedSetter, t.id)}
                        className="p-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-[#009CA6] transition-all text-left group"
                      >
                        <div className="font-black text-sm uppercase group-hover:text-[#009CA6]">{t.name}</div>
                        <div className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-wider">{t.author}</div>
                        <div className="text-[10px] text-slate-500 mt-3 normal-case leading-relaxed">{t.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-12 max-w-4xl mx-auto">
                  {currentFramework?.phases.map((phase, pIdx) => (
                    <div key={phase.id} className="relative">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-8 h-8 rounded-full bg-[#009CA6] text-slate-900 font-black flex items-center justify-center text-sm shadow-[0_0_15px_rgba(0,156,166,0.3)]">
                          {pIdx + 1}
                        </div>
                        <div>
                          <h3 className="font-black uppercase tracking-widest text-sm">{phase.name}</h3>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{phase.description}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 pl-12">
                        {phase.milestoneIds.map(mId => {
                          const m = currentFramework.milestones.find(x => x.id === mId);
                          const prog = currentInstance.progress[mId] || { milestoneId: mId, status: 'locked', tally: 0 };
                          if (!m) return null;
                          return (
                            <SkillTreeNode
                              key={mId}
                              milestone={m}
                              status={prog.status as MilestoneStatus}
                              isActive={activeMilestoneId === mId}
                              onClick={setActiveMilestoneId}
                              isUnlocked={isUnlocked(mId)}
                            />
                          );
                        })}
                      </div>
                      
                      {pIdx < currentFramework.phases.length - 1 && (
                        <div className="absolute left-4 top-8 bottom-[-48px] w-0.5 bg-slate-800 -z-10" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Info / Action Panel */}
            <div className={`
              w-96 bg-slate-950 border-l border-white/5 transition-all duration-300 transform p-6
              ${activeMilestoneId ? 'translate-x-0' : 'translate-x-full opacity-0 pointer-events-none'}
            `}>
              {activeMilestone && (
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-8">
                    <div className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-[0.2em] ${CATEGORY_COLORS[activeMilestone.category].bg} text-white`}>
                      {activeMilestone.category}
                    </div>
                    <button 
                      onClick={() => setActiveMilestoneId(null)}
                      className="text-slate-500 hover:text-white transition-colors"
                    >
                      <Plus size={20} className="rotate-45" />
                    </button>
                  </div>

                  <h4 className="text-lg font-black uppercase tracking-tight leading-tight mb-2">
                    {activeMilestone.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    {activeMilestone.description}
                  </p>

                  {activeMilestone.reflectionPrompt && (
                    <div className="bg-slate-900 rounded-xl p-4 border border-white/5 mb-6">
                      <div className="flex items-center gap-2 mb-2 text-[#009CA6]">
                        <MessageSquare size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Apprentice Reflection</span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-300 italic mb-4 leading-relaxed">
                        "{activeMilestone.reflectionPrompt}"
                      </p>
                      <textarea 
                        value={milestoneProgress?.notes || ''}
                        onChange={(e) => updateMilestoneProgress(selectedSetter!, activeMilestone.id, { notes: e.target.value })}
                        placeholder="Type notes and reflections here..."
                        className="w-full h-32 bg-black/30 border border-white/10 rounded-lg p-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#009CA6] text-slate-200"
                      />
                    </div>
                  )}

                  {activeMilestone.libraryId && (
                    <button
                      onClick={() => setActiveTab('Library')}
                      className="flex items-center justify-between w-full p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl group hover:bg-indigo-500/20 transition-all mb-4"
                    >
                      <div className="flex items-center gap-3">
                        <Book size={18} className="text-indigo-400" />
                        <div className="text-left">
                          <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Knowledge Base</div>
                          <div className="text-xs font-bold text-slate-300">Read Deep Dive</div>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-indigo-400 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}

                  <div className="mt-auto space-y-4">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <span>Current Status</span>
                      <span className={`
                        ${milestoneProgress?.status === 'completed' ? 'text-emerald-400' : 
                          milestoneProgress?.status === 'review' ? 'text-amber-400 animate-pulse' : 
                          milestoneProgress?.status === 'available' ? 'text-[#009CA6]' : 'text-slate-600'}
                      `}>
                        {milestoneProgress?.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        disabled={milestoneProgress?.status === 'completed' || milestoneProgress?.status === 'review' || milestoneProgress?.status === 'locked'}
                        onClick={() => updateMilestoneProgress(selectedSetter!, activeMilestone.id, { status: 'review' })}
                        className={`
                          py-3 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all
                          ${milestoneProgress?.status === 'available' 
                            ? 'bg-[#009CA6] text-white hover:bg-[#009CA6]/80' 
                            : 'bg-slate-800 text-slate-600 cursor-not-allowed'}
                        `}
                      >
                        Request Review
                      </button>
                      <button
                        onClick={() => {
                          const newStatus = milestoneProgress?.status === 'completed' ? 'available' : 'completed';
                          updateMilestoneProgress(selectedSetter!, activeMilestone.id, { 
                            status: newStatus,
                            signedOffBy: wspSettings.headSetterName || 'Head Setter',
                            completedAt: new Date().toISOString()
                          });
                        }}
                        className={`
                          py-3 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all
                          ${milestoneProgress?.status === 'completed' ? 'bg-slate-700 text-white' : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/20'}
                        `}
                      >
                        {milestoneProgress?.status === 'completed' ? 'Revoke Sign-off' : 'Sign Off'}
                      </button>
                    </div>
                    
                    {milestoneProgress?.status === 'completed' && (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-3">
                        <Trophy size={16} className="text-emerald-400" />
                        <div>
                          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-tight">Milestone Mastered</p>
                          <p className="text-[9px] text-emerald-400/60 font-medium">Signed by {milestoneProgress.signedOffBy}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {showEditor && (
        <PathEditor onClose={() => setShowEditor(false)} />
      )}
    </div>
  );
};

export default SetterPath;
