import React, { useState } from 'react';
import { Upload, Database, LayoutDashboard, Sparkles, ChevronRight, Activity, Map } from 'lucide-react';
import { parseKayaCSV, parseHumanityCSV } from '../utils/csvParser';
import { Climb, MOCK_CSV_DATA, MOCK_HUMANITY_DATA, GymSchedule } from '../types';

interface FileUploadProps {
  onDataLoaded: (data: { analytics?: Record<string, Climb[]>, generator?: Record<string, GymSchedule> }) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const [isHovering, setIsHovering] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    let combinedKayaData: Record<string, Climb[]> = {};
    let combinedHumanityData: Record<string, GymSchedule> = {};

    const loadFile = (file: File): Promise<void> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          const firstLine = text.trim().split('\n')[0].toLowerCase();

          try {
            if (firstLine.includes('start date') && firstLine.includes('location')) {
              // Priority: Humanity Schedule
              const data = parseHumanityCSV(text);
              combinedHumanityData = { ...combinedHumanityData, ...data };
            } else {
              // Default: Kaya Performance
              const gymName = file.name.split('-climbs')[0].trim() || "General";
              const data = parseKayaCSV(text, gymName);
              // Clean up gym name if it has .csv
              const cleanName = gymName.replace('.csv', '');
              combinedKayaData[cleanName] = data;
            }
            resolve();
          } catch (err) {
            console.error("Failed to parse", file.name, err);
            resolve();
          }
        };
        reader.readAsText(file);
      });
    };

    await Promise.all(Array.from(files).map(loadFile));

    const result: { analytics?: Record<string, Climb[]>, generator?: Record<string, GymSchedule> } = {};
    if (Object.keys(combinedKayaData).length > 0) result.analytics = combinedKayaData;
    if (Object.keys(combinedHumanityData).length > 0) result.generator = combinedHumanityData;

    onDataLoaded(result);
  };

  const loadMockKaya = () => {
    const data = parseKayaCSV(MOCK_CSV_DATA, "Movement Design District");
    onDataLoaded({ analytics: { "Movement Design District": data } });
  };

  const loadMockHumanity = () => {
    const data = parseHumanityCSV(MOCK_HUMANITY_DATA);
    onDataLoaded({ generator: data });
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-50 flex flex-col items-center justify-center p-6 overflow-hidden">

      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Hero Image Background */}
        <div
          className="absolute inset-0 z-[-1] opacity-40 scale-105"
          style={{
            backgroundImage: `url("${import.meta.env.BASE_URL}assets/smac-bg.png")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(3px) saturate(1.5)'
          }}
        ></div>

        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#009CA6]/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#00205B]/10 rounded-full blur-[140px]"></div>
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(#00205B 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>

      <main className="relative z-10 w-full max-w-5xl flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700">

        {/* Brand Header */}
        <div className="flex flex-col items-center mb-16 text-center">
          <div className="mb-6 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#00205B] to-[#009CA6] rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white p-4 rounded-2xl shadow-xl flex items-center justify-center">
              <LayoutDashboard size={48} className="text-[#00205B]" />
            </div>
          </div>

          <h1 className="text-6xl font-black text-[#00205B] uppercase tracking-tighter leading-tight">
            SMaC <span className="text-[#009CA6]">Setting</span>
          </h1>
          <p className="mt-4 text-slate-400 font-bold uppercase tracking-[0.3em] text-sm">
            Regional Performance Dashboard
          </p>
        </div>

        {/* Main Actions Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">

          {/* Upload Card */}
          <label
            id="tour-upload"
            onMouseEnter={() => setIsHovering('upload')}
            onMouseLeave={() => setIsHovering(null)}
            className="group relative bg-white rounded-3xl p-10 shadow-2xl shadow-slate-200/50 cursor-pointer border-2 border-transparent hover:border-[#009CA6]/40 hover:scale-[1.01] hover:shadow-[#009CA6]/10 active:scale-[0.98] transition-all duration-500 overflow-hidden"
          >
            <input type="file" accept=".csv" multiple onChange={handleFileUpload} className="hidden" />

            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Upload size={120} className="text-[#00205B]" />
            </div>

            <div className="relative z-20 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#009CA6]/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <Upload size={32} className="text-[#009CA6]" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-[#00205B] uppercase tracking-tight">Import Data</h2>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Select or Drop CSV Files</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors duration-500">
                  <div className="flex items-center gap-3 mb-2">
                    <Activity size={18} className="text-[#00205B]" />
                    <span className="font-black text-xs uppercase tracking-widest">Kaya Performance (Analytics)</span>
                  </div>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed">
                    Upload your <strong>"-climbs.csv"</strong> export to view KPIs, grade distributions, and the automated Production Report.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors duration-500">
                  <div className="flex items-center gap-3 mb-2">
                    <Map size={18} className="text-[#009CA6]" />
                    <span className="font-black text-xs uppercase tracking-widest">Humanity Schedule (Yellow Maps)</span>
                  </div>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed">
                    Upload your <strong>"Schedule.csv"</strong> to automatically generate and edit gym map templates.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-[#009CA6] font-black text-xs uppercase tracking-[0.2em] pt-4 group-hover:scale-105 transition-transform duration-300">
                <span>Start Regional Sync</span>
                <ChevronRight size={16} />
              </div>
            </div>
          </label>

          {/* Demo Card */}
          <div className="grid grid-rows-2 gap-4">
            <button
              onClick={loadMockKaya}
              onMouseEnter={() => setIsHovering('demo-kaya')}
              onMouseLeave={() => setIsHovering(null)}
              className="group relative bg-[#00205B] rounded-3xl p-8 shadow-2xl shadow-[#00205B]/20 overflow-hidden border-2 border-transparent hover:border-[#009CA6]/50 hover:scale-[1.02] active:scale-[0.96] transition-all duration-500 text-left"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Activity size={80} className="text-white" />
              </div>
              <div className="relative z-20">
                <h3 className="text-lg font-black text-white uppercase tracking-tight">Analytics/Production Report Demo</h3>
                <p className="text-white/60 text-xs font-medium mt-1">Explore regional performance metrics.</p>
              </div>
            </button>

            <button
              onClick={loadMockHumanity}
              onMouseEnter={() => setIsHovering('demo-humanity')}
              onMouseLeave={() => setIsHovering(null)}
              className="group relative bg-[#009CA6] rounded-3xl p-8 shadow-2xl shadow-[#009CA6]/20 overflow-hidden border-2 border-transparent hover:border-[#00205B]/50 hover:scale-[1.02] active:scale-[0.96] transition-all duration-500 text-left"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Map size={80} className="text-white" />
              </div>
              <div className="relative z-20">
                <h3 className="text-lg font-black text-white uppercase tracking-tight">Yellow Map Generator Demo</h3>
                <p className="text-white/60 text-xs font-medium mt-1">Generate gym maps from Humanity schedule.</p>
              </div>
            </button>
          </div>

        </div>
      </main>

      {/* Styles for consistent animations */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default FileUpload;
