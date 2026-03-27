import React, { useState } from 'react';
import { Search, BookOpen, CheckCircle2, ChevronRight, Bookmark, Compass, Shield, Zap } from 'lucide-react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { SETTER_LIBRARY, LibrarySection } from '../../constants/setterLibrary';

const SetterLibrary: React.FC = () => {
  const { libraryProgress, toggleLibrarySection } = useDashboardStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<LibrarySection>(SETTER_LIBRARY[0]);

  const filteredLibrary = SETTER_LIBRARY.filter(section => 
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories: LibrarySection['category'][] = ['Foundations', 'Standards', 'Concepts', 'Deep Dives'];
  
  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Foundations': return <Compass size={16} className="text-indigo-500" />;
      case 'Standards': return <Shield size={16} className="text-teal-500" />;
      case 'Concepts': return <Zap size={16} className="text-amber-500" />;
      case 'Deep Dives': return <BookOpen size={16} className="text-rose-500" />;
      default: return <BookOpen size={16} />;
    }
  };

  return (
    <div className="flex h-[calc(100vh-280px)] bg-white/40 backdrop-blur-md rounded-3xl border border-white/40 shadow-2xl overflow-hidden">
      {/* Sidebar Index */}
      <div className="w-80 border-r border-slate-200/50 flex flex-col bg-slate-50/50">
        <div className="p-6 border-b border-slate-200/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search concepts..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#009CA6]/20 transition-all font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          {categories.map(cat => {
            const sections = filteredLibrary.filter(s => s.category === cat);
            if (sections.length === 0) return null;

            return (
              <div key={cat} className="space-y-1">
                <h4 className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                  {getCategoryIcon(cat)}
                  {cat}
                </h4>
                {sections.map(section => {
                  const isRead = libraryProgress.includes(section.id);
                  const isSelected = selectedSection.id === section.id;

                  return (
                    <button
                      key={section.id}
                      onClick={() => setSelectedSection(section)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-left ${
                        isSelected 
                        ? 'bg-[#009CA6] text-white shadow-lg shadow-[#009CA6]/20 scale-[1.02]' 
                        : 'hover:bg-white text-slate-600 hover:text-[#009CA6]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {isRead && <CheckCircle2 size={14} className={isSelected ? 'text-white' : 'text-emerald-500'} />}
                        <span className="text-xs font-bold truncate">{section.title}</span>
                      </div>
                      <ChevronRight size={14} className={isSelected ? 'text-white/60' : 'text-slate-300'} />
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content Pane */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black text-[#009CA6] uppercase tracking-widest mb-1">
              {getCategoryIcon(selectedSection.category)}
              {selectedSection.category}
            </div>
            <h2 className="text-3xl font-black text-[#00205B] tracking-tight">{selectedSection.title}</h2>
          </div>
          
          <button
            onClick={() => toggleLibrarySection(selectedSection.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              libraryProgress.includes(selectedSection.id)
              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {libraryProgress.includes(selectedSection.id) ? (
              <><CheckCircle2 size={16} /> Read & Understood</>
            ) : (
              <><Bookmark size={16} /> Mark as Read</>
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
          <div className="max-w-3xl mx-auto prose prose-slate">
            {selectedSection.content.split('\n\n').map((para, i) => {
              if (para.trim().startsWith('###')) {
                return <h3 key={i} className="text-xl font-black text-[#00205B] mt-8 mb-4">{para.replace('###', '').trim()}</h3>;
              }
              if (para.trim().startsWith('-')) {
                return (
                  <ul key={i} className="space-y-2 my-4">
                    {para.split('\n').map((li, j) => (
                      <li key={j} className="flex gap-3 text-slate-600 text-sm leading-relaxed">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#009CA6] mt-1.5 shrink-0" />
                        {li.replace('-', '').trim()}
                      </li>
                    ))}
                  </ul>
                );
              }
              return <p key={i} className="text-slate-600 leading-relaxed text-base mb-6">{para}</p>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetterLibrary;
