import React, { useState, useEffect, useMemo } from 'react';
import {
  Upload, FileText, Calendar, DollarSign, ChevronRight,
  BarChart2, Users, Clock, TrendingUp, Activity, Zap, Target
} from 'lucide-react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { FUN_MESSAGES, FunMessage } from '../../constants/messages';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

// ─── Time Helpers ──────────────────────────────────────────────────
const timeAgo = (isoString: string | null): string => {
  if (!isoString) return '';
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

// ─── Component ─────────────────────────────────────────────────────
const MissionControl: React.FC = () => {
  const {
    climbData,
    dateRange,
    budgetState,
    lastWspData,
    lastWspTimestamp,
    apprenticeInstances,
    setActiveView,
    setShowUploadOverlay,
  } = useDashboardStore();

  // Fun message
  const [currentMessage, setCurrentMessage] = useState<FunMessage>(FUN_MESSAGES[0]);
  const [showStory, setShowStory] = useState(false);
  const [isComputing, setIsComputing] = useState(true);

  useEffect(() => {
    const idx = Math.floor(Math.random() * FUN_MESSAGES.length);
    setCurrentMessage(FUN_MESSAGES[idx]);

    // Simulate "Computing Data" for polish
    const timer = setTimeout(() => setIsComputing(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // ── Per-Setter Pulse ────────────────────────────────────────────
  const setterPulse = useMemo(() => {
    if (!climbData) return null;

    const now = new Date();
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(now.getDate() - 14);

    const allClimbs = Object.values(climbData).flat();
    const recent = allClimbs.filter(c => c.dateSet >= twoWeeksAgo && c.dateSet <= now);

    const allTimeSetters = new Set<string>();
    allClimbs.forEach(c => {
      c.setter.split(',').map(s => s.trim()).filter(Boolean).forEach(s => allTimeSetters.add(s));
    });

    const stats: Record<string, { routes: number; boulders: number; total: number }> = {};
    allTimeSetters.forEach(name => { stats[name] = { routes: 0, boulders: 0, total: 0 }; });

    recent.forEach(c => {
      const names = c.setter.split(',').map(s => s.trim()).filter(Boolean);
      names.forEach(name => {
        if (!stats[name]) stats[name] = { routes: 0, boulders: 0, total: 0 };
        stats[name].total++;
        if (c.isRoute) stats[name].routes++;
        else stats[name].boulders++;
      });
    });

    const sorted = Object.entries(stats)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total);

    const maxOutput = Math.max(1, ...sorted.map(s => s.total));
    return { setters: sorted, maxOutput, totalRecent: recent.length };
  }, [climbData]);

  // ── Budget Summary ──────────────────────────────────────────────
  const budgetSummary = useMemo(() => {
    const { configs, expenses } = budgetState;
    if (!configs) return null;
    
    // Aggregate over all locations for Mission Control Regional View
    let annualBudget = 0;
    const currentYear = new Date().getFullYear();
    Object.values(configs).forEach((cfg: any) => {
        const yearConfig = cfg.yearlyLimits?.[currentYear];
        annualBudget += (yearConfig?.annualBudget || cfg.annualBudget || 0);
    });

    if (annualBudget === 0) return null;

    const yearExpenses = expenses.filter((e: any) => e.date.startsWith(String(currentYear)));
    const totalSpent = yearExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);
    const pctSpent = Math.min(100, (totalSpent / annualBudget) * 100);

    const dayOfYear = Math.floor((Date.now() - new Date(currentYear, 0, 1).getTime()) / 86400000);
    const expectedPct = (dayOfYear / 365) * 100;
    const paceStatus: 'under' | 'on' | 'over' =
      pctSpent < expectedPct - 5 ? 'under' : pctSpent > expectedPct + 5 ? 'over' : 'on';

    return {
      annualBudget,
      totalSpent,
      pctSpent,
      remaining: annualBudget - totalSpent,
      expenseCount: yearExpenses.length,
      paceStatus,
      chartData: [
        { name: 'Spent', value: totalSpent },
        { name: 'Remaining', value: Math.max(0, annualBudget - totalSpent) },
      ],
    };
  }, [budgetState]);

  // ── WSP Summary ─────────────────────────────────────────────────
  const wspSummary = useMemo(() => {
    if (!lastWspData) return null;
    const gymNames = Object.keys(lastWspData);
    const totalRows = Object.values(lastWspData).reduce((sum, g) => sum + g.rows.length, 0);
    const setterSet = new Set<string>();
    Object.values(lastWspData).forEach(g => {
      g.rows.forEach(r => {
        r.setters.split(',').map(s => s.trim()).filter(Boolean).forEach(s => setterSet.add(s));
      });
    });
    const dateRange = gymNames.length > 0 ? lastWspData[gymNames[0]].dateRange : '';
    return { gymNames, totalRows, setterCount: setterSet.size, dateRange };
  }, [lastWspData]);

  // ── Apprenticeship Summary ─────────────────────────────────────
  const apprenticeshipSummary = useMemo(() => {
    const instances = Object.values(apprenticeInstances);
    if (instances.length === 0) return null;

    const totalCompleted = instances.reduce((sum, inst) => 
      sum + Object.values(inst.progress).filter(p => p.status === 'completed').length, 0);
    
    const pendingReview = instances.reduce((sum, inst) => 
      sum + Object.values(inst.progress).filter(p => p.status === 'review').length, 0);

    return { 
      instanceCount: instances.length, 
      totalCompleted, 
      pendingReview,
      recentSetter: instances[instances.length - 1].setterName
    };
  }, [apprenticeInstances]);

  // ── Activity Feed ───────────────────────────────────────────────
  const activityItems = useMemo(() => {
    const items: { icon: React.ReactNode; text: string; color: string }[] = [];

    if (climbData) {
      const gymCount = Object.keys(climbData).length;
      const climbCount = Object.values(climbData).flat().length;
      items.push({
        icon: <Activity size={14} />,
        text: `Analytics: ${climbCount.toLocaleString()} records across ${gymCount} gym${gymCount > 1 ? 's' : ''}`,
        color: 'text-blue-500',
      });
    }

    if (budgetSummary) {
      items.push({
        icon: <DollarSign size={14} />,
        text: `Budget: ${budgetSummary.expenseCount} expenses logged ($${budgetSummary.totalSpent.toLocaleString()})`,
        color: 'text-emerald-500',
      });
    }

    if (wspSummary) {
      items.push({
        icon: <Calendar size={14} />,
        text: `WSP: ${wspSummary.gymNames.length} plan${wspSummary.gymNames.length > 1 ? 's' : ''} • ${timeAgo(lastWspTimestamp)}`,
        color: 'text-teal-500',
      });
    }

    if (apprenticeshipSummary) {
      items.push({
        icon: <Target size={14} />,
        text: `The Path: ${apprenticeshipSummary.totalCompleted} milestones mastered across ${apprenticeshipSummary.instanceCount} setters`,
        color: 'text-indigo-500',
      });
    }

    if (items.length === 0) {
      items.push({
        icon: <Zap size={14} />,
        text: 'No data loaded yet — use Quick Actions to get started',
        color: 'text-slate-400',
      });
    }

    return items;
  }, [climbData, budgetSummary, wspSummary, apprenticeshipSummary, lastWspTimestamp]);

  const paceColors = {
    under: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Under Budget' },
    on: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'On Pace' },
    over: { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Over Budget' },
  };

  const BUDGET_COLORS = ['#009CA6', '#e2e8f0'];

  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg animate-skeleton" />
        <div className="space-y-2">
          <div className="w-24 h-3 rounded animate-skeleton" />
          <div className="w-16 h-2 rounded animate-skeleton" />
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div className="w-full h-4 rounded animate-skeleton" />
        <div className="w-full h-4 rounded animate-skeleton" />
        <div className="w-2/3 h-4 rounded animate-skeleton" />
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen w-full bg-slate-50 flex flex-col overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 z-[-1] opacity-30 scale-105"
          style={{
            backgroundImage: `url("${import.meta.env.BASE_URL}assets/smac-bg.png")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(4px) saturate(1.4)',
          }}
        />
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#009CA6]/8 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#00205B]/8 rounded-full blur-[140px]" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#00205B 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      <div className="relative z-10 flex-1 p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
        <div className="flex flex-col items-center text-center mb-12">
          <img
            src={`${import.meta.env.BASE_URL}assets/logoLong.png`}
            className="h-20 object-contain mb-6"
            alt="SMaC Dashboard"
          />
          <div className="flex items-center gap-2 text-[#009CA6] font-black text-xs uppercase tracking-[0.2em]">
            {isComputing ? (
              <div className="flex items-center gap-2">
                <Clock size={14} className="animate-spin text-slate-400" />
                <span className="text-slate-400">Syncing regional records...</span>
              </div>
            ) : (
              <>
                <span>{currentMessage.text}</span>
                {currentMessage.isLongStory && (
                  <button
                    onClick={() => setShowStory(true)}
                    className="p-1 bg-[#009CA6]/10 rounded-full hover:bg-[#009CA6]/20 transition-colors"
                  >
                    <img src={`${import.meta.env.BASE_URL}assets/justLogo.png`} className="w-3 h-3 object-contain" alt="" />
                  </button>
                )}
                <ChevronRight size={14} />
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Import Data', sub: 'Kaya CSV', icon: <Upload size={22} className="text-[#009CA6]" />, bg: 'bg-[#009CA6]/10', action: () => setShowUploadOverlay(true) },
            { label: 'Generate Report', sub: 'Production PDF', icon: <FileText size={22} className="text-indigo-600" />, bg: 'bg-indigo-100', action: () => setActiveView('report') },
            { label: 'Create WSP', sub: 'Weekly Setting Plan', icon: <Calendar size={22} className="text-teal-600" />, bg: 'bg-teal-100', action: () => setActiveView('wsp-generator') }
          ].map((item, idx) => (
            <button key={idx} onClick={item.action} className="group relative bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border-2 border-transparent hover:border-[#009CA6]/40 hover:scale-[1.015] active:scale-[0.98] transition-all duration-300 transform">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>{item.icon}</div>
                <div>
                  <h3 className="text-lg font-black text-[#00205B] uppercase tracking-tight">{item.label}</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{item.sub}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isComputing ? (
            <><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
          ) : (
            <>
              {/* Setter Pulse */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"><Users size={16} className="text-blue-600" /></div>
                    <h3 className="text-sm font-black text-[#00205B] uppercase tracking-widest">Setter Pulse</h3>
                  </div>
                  <button onClick={() => setActiveView('analytics')} className="text-[10px] font-black text-[#009CA6] uppercase tracking-widest hover:underline">Full Analytics</button>
                </div>
                <div className="p-6">
                  {!setterPulse ? <p className="text-center py-8 text-slate-400 font-bold">No data loaded</p> : (
                    <div className="space-y-2 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                      {setterPulse.setters.map(setter => (
                        <div key={setter.name} className="flex items-center gap-3 py-1.5 focus-within:opacity-100">
                          <span className="text-xs font-bold w-28 truncate text-slate-700">{setter.name}</span>
                          <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#009CA6] to-[#00205B]" style={{ width: `${(setter.total / setterPulse.maxOutput) * 100}%` }}>
                              <span className="text-[9px] font-black text-white ml-2">{setter.total}</span>
                            </div>
                          </div>
                          <div className="flex gap-1 w-16 justify-end text-[9px] font-bold">
                            <span className="text-blue-400">{setter.routes}R</span>
                            <span className="text-emerald-400">{setter.boulders}B</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Budget Health */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center"><DollarSign size={16} className="text-emerald-600" /></div>
                    <h3 className="text-sm font-black text-[#00205B] uppercase tracking-widest">Budget Health</h3>
                  </div>
                  <button onClick={() => setActiveView('budget-tracker')} className="text-[10px] font-black text-[#009CA6] uppercase tracking-widest hover:underline">Full Tracker</button>
                </div>
                <div className="p-6">
                  {!budgetSummary ? <p className="text-center py-8 text-slate-400 font-bold">No budget configured</p> : (
                    <div className="flex items-center gap-8">
                      <div className="relative w-32 h-32">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={budgetSummary.chartData} cx="50%" cy="50%" innerRadius={38} outerRadius={55} paddingAngle={2} dataKey="value" startAngle={90} endAngle={-270} stroke="none">
                              {budgetSummary.chartData.map((_, index) => <Cell key={index} fill={BUDGET_COLORS[index]} />)}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-xl font-black text-[#00205B]">{Math.round(budgetSummary.pctSpent)}%</span>
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Budget</p><p className="text-lg font-black text-[#00205B]">${budgetSummary.annualBudget.toLocaleString()}</p></div>
                        <div className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${paceColors[budgetSummary.paceStatus].bg} ${paceColors[budgetSummary.paceStatus].text}`}>{paceColors[budgetSummary.paceStatus].label}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* WSP Status */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center"><Calendar size={16} className="text-teal-600" /></div>
                    <h3 className="text-sm font-black text-[#00205B] uppercase tracking-widest">WSP Status</h3>
                  </div>
                  <button onClick={() => setActiveView('wsp-generator')} className="text-[10px] font-black text-[#009CA6] uppercase tracking-widest hover:underline">Open WSP</button>
                </div>
                <div className="p-6">
                  {!wspSummary ? <p className="text-center py-8 text-slate-400 font-bold">No plan loaded</p> : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm font-bold text-[#00205B]"><Clock size={14} className="text-slate-400" /> {wspSummary.dateRange}</div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-slate-50 rounded-xl p-3 text-center"><p className="text-xl font-black">{wspSummary.gymNames.length}</p><p className="text-[9px] font-bold text-slate-400 uppercase">Gyms</p></div>
                        <div className="bg-slate-50 rounded-xl p-3 text-center"><p className="text-xl font-black">{wspSummary.totalRows}</p><p className="text-[9px] font-bold text-slate-400 uppercase">Shifts</p></div>
                        <div className="bg-slate-50 rounded-xl p-3 text-center"><p className="text-xl font-black">{wspSummary.setterCount}</p><p className="text-[9px] font-bold text-slate-400 uppercase">Setters</p></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* The Setter's Path */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center"><Target size={16} className="text-indigo-600" /></div>
                    <h3 className="text-sm font-black text-[#00205B] uppercase tracking-widest">The Setter's Path</h3>
                  </div>
                  <button onClick={() => setActiveView('setter-path')} className="text-[10px] font-black text-[#009CA6] uppercase tracking-widest hover:underline">View skill tree</button>
                </div>
                <div className="p-6">
                  {!apprenticeshipSummary ? <p className="text-center py-8 text-slate-400 font-bold">No apprentices registered</p> : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100"><p className="text-2xl font-black text-indigo-700">{apprenticeshipSummary.totalCompleted}</p><p className="text-[10px] font-black text-indigo-700/60 uppercase">Mastered Nodes</p></div>
                        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100"><p className="text-2xl font-black text-amber-600">{apprenticeshipSummary.pendingReview}</p><p className="text-[10px] font-black text-slate-400 uppercase">Pending Review</p></div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl text-xs">
                        <div className="w-8 h-8 rounded-full bg-[#00205B] text-white flex items-center justify-center font-black">{apprenticeshipSummary.recentSetter.charAt(0)}</div>
                        <div className="flex-1 font-bold text-[#00205B]">{apprenticeshipSummary.recentSetter} progressed on their path</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Activity Feed */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden lg:col-span-2">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center"><TrendingUp size={16} className="text-violet-600" /></div>
                  <h3 className="text-sm font-black text-[#00205B] uppercase tracking-widest">Activity Feed</h3>
                </div>
                <div className="px-6 py-4 flex flex-wrap gap-x-8 gap-y-4">
                  {activityItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <span className={item.color}>{item.icon}</span>
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {showStory && currentMessage.isLongStory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b flex items-center justify-between">
              <h3 className="text-2xl font-black text-[#00205B] uppercase tracking-tight">System Intel</h3>
              <button onClick={() => setShowStory(false)}><ChevronRight size={24} className="rotate-45" /></button>
            </div>
            <div className="p-8 overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap">{currentMessage.content}</div>
            <div className="p-6 bg-slate-50 text-right"><button onClick={() => setShowStory(false)} className="px-6 py-2 bg-[#00205B] text-white rounded-xl font-black text-xs uppercase hover:bg-[#009CA6]">Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MissionControl;
