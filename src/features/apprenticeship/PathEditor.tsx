import React, { useState } from 'react';
import { 
  X, Plus, Save, Trash2, 
  ChevronDown, ChevronUp, Link, 
  Settings2, Layout, BookOpen,
  Layers, Target
} from 'lucide-react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { 
  ApprenticeshipFramework, 
  PhaseTemplate, 
  MilestoneTemplate, 
  MilestoneCategory 
} from '../../types';
import { GLOBAL_TEMPLATES } from '../../constants/apprenticeship';

interface PathEditorProps {
  onClose: () => void;
}

const CATEGORIES: MilestoneCategory[] = ['Movement', 'Coordination', 'Workflow', 'Maintenance', 'Safety', 'Aesthetics', 'Speed', 'Other'];

const PathEditor: React.FC<PathEditorProps> = ({ onClose }) => {
  const { apprenticeshipFrameworks, setApprenticeshipFrameworks } = useDashboardStore();
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<string | null>(null);
  const [editingFramework, setEditingFramework] = useState<ApprenticeshipFramework | null>(null);

  const handleSelectFramework = (id: string) => {
    setSelectedFrameworkId(id);
    const framework = apprenticeshipFrameworks.find(f => f.id === id);
    if (framework) {
      setEditingFramework(JSON.parse(JSON.stringify(framework))); // Deep clone
    }
  };

  const handleCreateNew = () => {
    const newId = `custom-${Date.now()}`;
    const newFramework: ApprenticeshipFramework = {
      id: newId,
      name: 'New Custom Framework',
      author: 'Head Setter',
      description: 'Custom path for specific gym needs.',
      phases: [],
      milestones: []
    };
    setEditingFramework(newFramework);
    setSelectedFrameworkId(newId);
  };

  const handleSave = () => {
    if (!editingFramework) return;
    const updated = apprenticeshipFrameworks.filter(f => f.id !== editingFramework.id);
    setApprenticeshipFrameworks([...updated, editingFramework]);
    alert('Framework Saved Successfully!');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this framework? This cannot be undone.')) {
      setApprenticeshipFrameworks(apprenticeshipFrameworks.filter(f => f.id !== id));
      if (selectedFrameworkId === id) {
        setEditingFramework(null);
        setSelectedFrameworkId(null);
      }
    }
  };

  const addPhase = () => {
    if (!editingFramework) return;
    const newPhase: PhaseTemplate = {
      id: `p-${Date.now()}`,
      name: 'New Phase',
      description: 'Phase objectives...',
      milestoneIds: [],
      exitCriteriaDescriptions: []
    };
    setEditingFramework({
      ...editingFramework,
      phases: [...editingFramework.phases, newPhase]
    });
  };

  const addMilestone = () => {
    if (!editingFramework) return;
    const newMilestone: MilestoneTemplate = {
      id: `m-${Date.now()}`,
      category: 'Movement',
      title: 'New Milestone',
      description: 'What needs to be done?',
      prerequisites: []
    };
    setEditingFramework({
      ...editingFramework,
      milestones: [...editingFramework.milestones, newMilestone]
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 w-full max-w-6xl h-full max-h-[90vh] rounded-3xl border border-white/10 shadow-2xl flex overflow-hidden">
        
        {/* Sidebar: Framework List */}
        <div className="w-80 border-r border-white/5 bg-slate-950/50 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#009CA6]">Frameworks</h3>
            <button onClick={handleCreateNew} className="p-1.5 bg-[#009CA6]/10 text-[#009CA6] rounded-lg hover:bg-[#009CA6]/20 transition-all">
              <Plus size={18} />
            </button>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
            {apprenticeshipFrameworks.map(f => (
              <div 
                key={f.id}
                className={`
                  p-4 rounded-xl border transition-all cursor-pointer group
                  ${selectedFrameworkId === f.id ? 'bg-[#009CA6]/10 border-[#009CA6]/50 shadow-lg' : 'bg-slate-800/50 border-white/5 hover:border-white/20'}
                `}
                onClick={() => handleSelectFramework(f.id)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[140px]">{f.name}</span>
                  {!GLOBAL_TEMPLATES.some(gt => gt.id === f.id) && (
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(f.id); }} className="opacity-0 group-hover:opacity-100 p-1 text-rose-500 hover:bg-rose-500/10 rounded transition-all">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                <div className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">{f.author} • {f.phases.length} Phases</div>
              </div>
            ))}
          </div>
          
          <button 
            onClick={onClose}
            className="mt-6 flex items-center justify-center gap-2 py-3 bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all border border-white/5"
          >
            <X size={14} /> Close Editor
          </button>
        </div>

        {/* Main: Content Editor */}
        <div className="flex-1 flex flex-col bg-slate-900">
          {!editingFramework ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
              <Layout size={64} className="mb-4 text-[#009CA6]" />
              <h2 className="text-2xl font-black uppercase tracking-widest">Select to Edit</h2>
              <p className="text-xs font-bold mt-2">Pick a framework to customize nodes, edges, and phases.</p>
            </div>
          ) : (
            <>
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-950/20">
                <div className="flex-1 max-w-xl">
                  <input 
                    value={editingFramework.name}
                    onChange={(e) => setEditingFramework({ ...editingFramework, name: e.target.value })}
                    className="bg-transparent text-2xl font-black uppercase tracking-tight focus:outline-none w-full"
                    placeholder="Framework Name..."
                  />
                  <input 
                    value={editingFramework.description}
                    onChange={(e) => setEditingFramework({ ...editingFramework, description: e.target.value })}
                    className="bg-transparent text-[10px] font-bold text-slate-500 uppercase tracking-widest w-full focus:outline-none"
                    placeholder="Brief description..."
                  />
                </div>
                <button 
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-[#009CA6] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#009CA6]/80 transition-all shadow-lg shadow-[#009CA6]/20"
                >
                  <Save size={16} /> Save Changes
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-12 custom-scrollbar">
                
                {/* Phases Section */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Layers size={20} className="text-[#009CA6]" />
                      <h3 className="text-lg font-black uppercase tracking-widest">Phases</h3>
                    </div>
                    <button onClick={addPhase} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all">
                      <Plus size={14} /> Add Phase
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {editingFramework.phases.map((phase, idx) => (
                      <div key={phase.id} className="bg-slate-800/50 border border-white/5 rounded-2xl p-6 relative group">
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 bg-[#009CA6] rounded-full flex items-center justify-center font-black text-slate-900 shrink-0">{idx + 1}</div>
                          <div className="flex-1 grid grid-cols-2 gap-6">
                            <div>
                              <label className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 block mb-1">Phase Title</label>
                              <input 
                                value={phase.name}
                                onChange={(e) => {
                                  const phases = [...editingFramework.phases];
                                  phases[idx].name = e.target.value;
                                  setEditingFramework({ ...editingFramework, phases });
                                }}
                                className="w-full bg-slate-950/50 border border-white/5 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 block mb-1">Assigned Milestones</label>
                              <div className="flex flex-wrap gap-2">
                                {editingFramework.milestones.map(m => (
                                  <button
                                    key={m.id}
                                    onClick={() => {
                                      const phases = [...editingFramework.phases];
                                      const current = phases[idx].milestoneIds;
                                      phases[idx].milestoneIds = current.includes(m.id) 
                                        ? current.filter(id => id !== m.id)
                                        : [...current, m.id];
                                      setEditingFramework({ ...editingFramework, phases });
                                    }}
                                    className={`px-2 py-1 rounded text-[8px] font-black uppercase transition-all ${phase.milestoneIds.includes(m.id) ? 'bg-[#009CA6] text-white' : 'bg-slate-700 text-slate-400'}`}
                                  >
                                    {m.title}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              const phases = editingFramework.phases.filter((_, i) => i !== idx);
                              setEditingFramework({ ...editingFramework, phases });
                            }}
                            className="p-1 text-rose-500 hover:bg-rose-500/10 rounded transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Milestones Section */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Target size={20} className="text-[#009CA6]" />
                      <h3 className="text-lg font-black uppercase tracking-widest">Milestones (Skill Nodes)</h3>
                    </div>
                    <button onClick={addMilestone} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all">
                      <Plus size={14} /> Add Milestone
                    </button>
                  </div>
                  <div className="space-y-4">
                    {editingFramework.milestones.map((m, idx) => (
                      <div key={m.id} className="bg-slate-800/50 border border-white/5 rounded-2xl p-6">
                        <div className="grid grid-cols-4 gap-6 items-start">
                          <div className="col-span-1">
                            <label className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 block mb-1">Title</label>
                            <input 
                              value={m.title}
                              onChange={(e) => {
                                const milestones = [...editingFramework.milestones];
                                milestones[idx].title = e.target.value;
                                setEditingFramework({ ...editingFramework, milestones });
                              }}
                              className="w-full bg-slate-950/50 border border-white/5 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none"
                            />
                            <div className="mt-4">
                              <label className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 block mb-1">Category</label>
                              <select 
                                value={m.category}
                                onChange={(e) => {
                                  const milestones = [...editingFramework.milestones];
                                  milestones[idx].category = e.target.value as MilestoneCategory;
                                  setEditingFramework({ ...editingFramework, milestones });
                                }}
                                className="w-full bg-slate-950/50 border border-white/5 rounded-lg px-3 py-2 text-[10px] font-black uppercase focus:outline-none"
                              >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <label className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 block mb-1">Description & Reflection Prompt</label>
                            <textarea 
                              value={m.description}
                              onChange={(e) => {
                                const milestones = [...editingFramework.milestones];
                                milestones[idx].description = e.target.value;
                                setEditingFramework({ ...editingFramework, milestones });
                              }}
                              className="w-full bg-slate-950/50 border border-white/5 rounded-lg px-3 py-2 text-xs focus:outline-none mb-2 h-20"
                              placeholder="Description..."
                            />
                            <input 
                              value={m.reflectionPrompt || ''}
                              onChange={(e) => {
                                const milestones = [...editingFramework.milestones];
                                milestones[idx].reflectionPrompt = e.target.value;
                                setEditingFramework({ ...editingFramework, milestones });
                              }}
                              className="w-full bg-slate-950/50 border border-white/5 rounded-lg px-3 py-2 text-[10px] italic focus:outline-none"
                              placeholder="Reflection prompt (empty to disable)..."
                            />
                          </div>
                          <div className="col-span-1 border-l border-white/5 pl-6">
                            <label className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 block mb-1">Prerequisites (Edges)</label>
                            <div className="space-y-1">
                              {editingFramework.milestones.filter(other => other.id !== m.id).map(other => (
                                <button
                                  key={other.id}
                                  onClick={() => {
                                    const milestones = [...editingFramework.milestones];
                                    const current = milestones[idx].prerequisites;
                                    milestones[idx].prerequisites = current.includes(other.id)
                                      ? current.filter(id => id !== other.id)
                                      : [...current, other.id];
                                    setEditingFramework({ ...editingFramework, milestones });
                                  }}
                                  className={`flex items-center gap-2 w-full px-2 py-1 rounded transition-all ${m.prerequisites.includes(other.id) ? 'bg-[#009CA6]/20 text-[#009CA6]' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                  <Link size={10} />
                                  <span className="text-[9px] font-bold uppercase truncate">{other.title}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PathEditor;
