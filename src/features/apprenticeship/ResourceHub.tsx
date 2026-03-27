import React from 'react';
import { 
  ExternalLink, CheckSquare, Square, Clock, 
  FileText, Zap, DollarSign, Info, ShieldCheck, 
  MapPin, Settings, Mail
} from 'lucide-react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { RESOURCE_LINKS, ONBOARDING_CHECKLIST } from '../../constants/setterLibrary';

const ResourceHub: React.FC = () => {
  const { resourceChecklist, toggleResourceTask } = useDashboardStore();

  const getIcon = (name: string) => {
    switch (name) {
      case 'Clock': return <Clock size={20} className="text-blue-500" />;
      case 'FileText': return <FileText size={20} className="text-teal-500" />;
      case 'Zap': return <Zap size={20} className="text-amber-500" />;
      case 'DollarSign': return <DollarSign size={20} className="text-emerald-500" />;
      default: return <ExternalLink size={20} className="text-slate-400" />;
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Orientation': return <MapPin size={14} />;
      case 'Safety': return <ShieldCheck size={14} />;
      case 'Workplace': return <Settings size={14} />;
      case 'Admin': return <Mail size={14} />;
      default: return <Info size={14} />;
    }
  }

  const completedCount = resourceChecklist.length;
  const totalCount = ONBOARDING_CHECKLIST.length;
  const progress = (completedCount / totalCount) * 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-280px)] overflow-hidden">
      {/* External Tools Column */}
      <div className="flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
        <div className="bg-white/40 backdrop-blur-md p-8 rounded-3xl border border-white/40 shadow-xl">
          <h3 className="text-2xl font-black text-[#00205B] uppercase tracking-tight mb-2">The Toolbox</h3>
          <p className="text-slate-500 text-sm font-medium mb-8">Quick access to essential El Cap & Movement systems.</p>
          
          <div className="grid grid-cols-1 gap-4">
            {RESOURCE_LINKS.map(link => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 hover:border-[#009CA6]/40 hover:shadow-lg hover:shadow-[#009CA6]/5 transition-all"
              >
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  {getIcon(link.icon)}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-700">{link.label}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">External Portal</p>
                </div>
                <ExternalLink size={16} className="text-slate-300 group-hover:text-[#009CA6]" />
              </a>
            ))}
          </div>
        </div>

        <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200">
          <div className="flex items-center gap-3 mb-4">
            <Zap size={24} className="text-indigo-200" />
            <h3 className="text-xl font-black uppercase tracking-tight">Pro Tip</h3>
          </div>
          <p className="text-indigo-100 text-sm leading-relaxed font-medium">
            "Check your Movement email at least once a day. That's where HR updates, shoe stipend windows, and regional news land first."
          </p>
        </div>
      </div>

      {/* Onboarding Checklist Column */}
      <div className="bg-white/40 backdrop-blur-md p-8 rounded-3xl border border-white/40 shadow-xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-black text-[#00205B] uppercase tracking-tight mb-2">First 30 Days</h3>
            <p className="text-slate-500 text-sm font-medium">Core orientation tasks for new apprentices.</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-[#009CA6]">{completedCount}/{totalCount}</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tasks Done</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-slate-100 rounded-full mb-8 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#009CA6] to-indigo-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {ONBOARDING_CHECKLIST.map(task => {
            const isDone = resourceChecklist.includes(task.id);
            return (
              <button
                key={task.id}
                onClick={() => toggleResourceTask(task.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border ${
                  isDone 
                  ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800 shadow-sm' 
                  : 'bg-white border-slate-100 text-slate-600 hover:border-[#009CA6]/30'
                }`}
              >
                {isDone ? (
                  <CheckSquare size={22} className="text-emerald-500" />
                ) : (
                  <Square size={22} className="text-slate-300" />
                )}
                <div className="text-left flex-1">
                  <div className={`text-sm font-bold ${isDone ? 'line-through opacity-60' : ''}`}>
                    {task.label}
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest mt-1 opacity-60">
                    {getCategoryIcon(task.category)}
                    {task.category}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ResourceHub;
