import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Calendar, FileText, BarChart2, Map, X } from 'lucide-react';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import MapGenerator, { MapGeneratorHandle } from './components/MapGenerator';
import RouteMapper from './components/RouteMapper';
import ProductionReport from './components/ProductionReport';
import Sidebar from './components/Sidebar';
import BaselineModal from './components/BaselineModal';
import CommentModal from './components/CommentModal';
import { Climb, GymSchedule, EmailSettings, AppView, MOCK_CSV_DATA, MOCK_HUMANITY_DATA, BaselineSettings } from './types';

const DEFAULT_EMAIL_SETTINGS: EmailSettings = {
  to: '',
  cc: '',
  subject: '[GYM_NAME] Setting Schedule: [DATE_RANGE]',
  body: 'Hi Team,\n\nPlease find the setting schedule for [GYM_NAME] for the weeks of [DATE_RANGE].\n\n(Please remember to attach the schedule image to this email before sending.)\n\nThanks!'
};

const DEFAULT_BASELINE_SETTINGS: BaselineSettings = {
  boulderTargetPerShift: 4.0,
  ropeTargetPerShift: 1.5,
  shiftsPerWeek: 15,
  totalVolumePerWeek: 150,
  routesPerWeek: 40,
  bouldersPerWeek: 110,
  settingDays: [1, 2, 3, 4], // Mon, Tue, Wed, Thu
  idealDailySplit: [
    { day: 0, routes: 0, boulders: 0 },   // Sun
    { day: 1, routes: 10, boulders: 28 }, // Mon
    { day: 2, routes: 10, boulders: 28 }, // Tue
    { day: 3, routes: 10, boulders: 27 }, // Wed
    { day: 4, routes: 10, boulders: 27 }, // Thu
    { day: 5, routes: 0, boulders: 0 },   // Fri
    { day: 6, routes: 0, boulders: 0 }    // Sat
  ],
  showBaselines: true,
  showSummary: true,
  showReferencePage: true,
  reportComments: ''
};

import TutorialGuide, { TutorialStep } from './components/TutorialGuide';
import { getGymCode, GYM_DISPLAY_NAMES } from './constants/mapTemplates';
import { TYPE_COLORS } from './constants/colors';
import { parseKayaCSV, parseHumanityCSV } from './utils/csvParser';

const TUTORIAL_STEPS: TutorialStep[] = [
  { targetId: 'center', title: 'Welcome Chief!', description: 'Let’s take a quick instructional tour of your new Setting Dashboard.', position: 'center' },
  { targetId: 'tour-upload', title: 'Phase 1: Your Data', description: 'Everything starts here. You’ll need two types of CSV files to unlock the full power of the Dashboard.', position: 'bottom' },
  { targetId: 'tour-upload', title: 'Getting Kaya Data', description: 'In Plastick, go to your Gym’s main page and click the download icon in the top right corner. Unselect "Current Set Only" and define a date range. For maximum versatility, download EVERYTHING and use the date selectors within this app. This powers your Analytics and Reports.', position: 'bottom' },
  { targetId: 'tour-upload', title: 'Getting Humanity Data', description: 'In Humanity, go to Shift Planning and select the gym(s) you want to pull data from. Set the view to 2 weeks. In the top right, go to Tools → Export Schedule and export as CSV. This powers the Yellow Map Engine.', position: 'bottom' },

  // Analytics Tour
  { targetId: 'nav-analytics', title: 'Phase 2: Analytics', description: 'Let\'s dive into your regional performance. We\'ve loaded some sample data for this tour.', position: 'right' },
  { targetId: 'tour-date-selector', title: 'Define your Scope', description: 'Use the date selector to focus on specific set cycles or months. All charts will update instantly.', position: 'bottom' },
  { targetId: 'tour-kpi-row', title: 'High-Level KPIs', description: 'Instantly track total volume, route-to-boulder ratios, and setter efficiency across the region.', position: 'bottom' },
  { targetId: 'tour-weekday-chart', title: 'Production Rhythm', description: 'See which days your crew is most productive.', position: 'top' },
  { targetId: 'tour-setter-cards', title: 'Setter Leaderboard', description: 'Individual performance breakdowns. See exactly who is crushing the volume and where they are spending their shifts.', position: 'top' },
  { targetId: 'tour-production-details', title: 'Raw Data Explorer', description: 'Deep-dive into individual setting day and setters. Need to view a specific day or setter? Use this table to sort, filter, and search through every recorded entry.', position: 'top' },

  // Report Tour
  { targetId: 'nav-report', title: 'Phase 3: Production Reports', description: 'Need something clean for the next meeting? The Report view creates presentation-ready summaries.', position: 'right' },
  { targetId: 'tour-date-display', title: 'Sync & Verify', description: 'Your date filters stay in sync here. Verify the range before you export.', position: 'bottom' },
  { targetId: 'tour-report-export', title: 'High-Res Export', description: 'Click here to generate a high-resolution, perfectly formatted PDF. It’s ready to be printed or emailed to leadership.', position: 'bottom' },
  { targetId: 'tour-baseline-settings', title: 'Set Your Standards', description: 'Defined your regional baselines once, and they’ll apply to every report you generate. Set targets for volume, shifts, and daily splits here.', position: 'right' },
  { targetId: 'tour-comparison-pill', title: 'Live Benchmarking', description: 'See exactly how current production stacks up against your defined baselines. Green pills mean you’re ahead; red means you’re behind.', position: 'bottom' },
  { targetId: 'tour-report-summary-label', title: 'Executive Context', description: 'Add your custom summary here. It will appear at the top of the report to give leadership necessary context (like upcoming comps or staffing changes).', position: 'right' },
  { targetId: 'tour-baseline-reference', title: 'Transparency Page', description: 'Every report can include a Baseline Reference page. This shows leadership exactly what our "perfect world" looks like and how we measure success.', position: 'top' },

  // Generator Tour
  { targetId: 'nav-generator', title: 'Phase 4: Map Engine', description: 'The Yellow Map tedium removed. Use this tool to turn Humanity schedules into physical maps automatically.', position: 'right' },
  { targetId: 'tour-generator-sidebar', title: 'Global Config', description: 'Adjust your email templates and global settings here. These stick with you every time you use the Dashboard.', position: 'right' },
  { targetId: 'tour-generator-card', title: 'Live Map Editing', description: 'Click directly on any gym map to edit locations, setter counts, or climb types. It’s a live canvas.', position: 'right' },
  { targetId: 'tour-generator-instructions', title: 'Technical Guide', description: 'Need help with the Map Generator workflow? This guide covers saving, loading, and email integration in detail.', position: 'right' },

  // Mapper Tour
  { targetId: 'nav-mapper', title: 'Phase 5: Route Mapper', description: 'For precise competition scoring. Use this to overlay scoring markers on high-res wall photos.', position: 'right' },
  { targetId: 'tour-mapper-upload', title: 'Drop & Map', description: 'Simply drop a photo of a wall, click to add hold markers, and drag labels to clear paths for judges to read.', position: 'bottom' },

  { targetId: 'center', title: 'Dashboard Synchronized', description: 'You’re all set! If you ever need another tour, just click "Tutorial Tour" at the bottom of the sidebar. Happy setting!', position: 'center' },
];

function App() {
  const [climbData, setClimbData] = useState<Record<string, Climb[]> | null>(null);
  const [gymSchedules, setGymSchedules] = useState<Record<string, GymSchedule> | null>(null);
  const [selectedGyms, setSelectedGyms] = useState<string[]>([]);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [activeView, setActiveView] = useState<AppView>('analytics');
  const [reportRange, setReportRange] = useState<{ start: Date, end: Date }>(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 14);
    return { start, end };
  });

  const generatorRef = useRef<MapGeneratorHandle>(null);

  // Modal states
  const [showInstructions, setShowInstructions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showBaselineSettings, setShowBaselineSettings] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showUploadOverlay, setShowUploadOverlay] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // Auto-start tutorial on first load
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('has_seen_tutorial');
    if (!hasSeenTutorial) {
      setTimeout(() => setShowTutorial(true), 1500);
      localStorage.setItem('has_seen_tutorial', 'true');
    }
  }, []);

  const handleTutorialStepChange = (index: number) => {
    // 1. Deterministic Navigation based on step index
    // Step 0-9: Analytics
    // Step 10-16: Reports
    // Step 17-20: Generator
    // Step 21-22: Mapper
    // Step 23: Close (Analytics)

    if (index >= 0 && index <= 9) setActiveView('analytics');
    else if (index >= 10 && index <= 16) {
      setActiveView('report');
      // Ensure summary is visible for the tour
      if (!baselineSettings.showSummary || !baselineSettings.reportComments) {
        setBaselineSettings(prev => ({
          ...prev,
          showSummary: true,
          reportComments: prev.reportComments || 'This dashboard is synchronized with our regional production metrics. We are currently tracking ahead of schedule for the upcoming season.'
        }));
      }
    }
    else if (index >= 17 && index <= 20) setActiveView('generator');
    else if (index >= 21 && index <= 22) setActiveView('mapper');
    else if (index === 23) setActiveView('analytics');

    // 2. Inject demo data for feature steps if no real data is present
    const needsAnalyticsData = index >= 4 && index <= 16;
    const needsGeneratorData = index >= 17 && index <= 22;

    if (needsAnalyticsData && !climbData) {
      const data = parseKayaCSV(MOCK_CSV_DATA, "Movement Design District");
      setClimbData({ "Movement Design District": data });
    }

    if (needsGeneratorData && !gymSchedules) {
      const schedules = parseHumanityCSV(MOCK_HUMANITY_DATA);
      setGymSchedules(schedules);
    }
  };

  const handleTutorialClose = () => {
    setShowTutorial(false);
    handleReset();
  };
  const [emailSettings, setEmailSettings] = useState<EmailSettings>(() => {
    const saved = localStorage.getItem('email_settings');
    return saved ? JSON.parse(saved) : DEFAULT_EMAIL_SETTINGS;
  });

  const [baselineSettings, setBaselineSettings] = useState<BaselineSettings>(() => {
    const saved = localStorage.getItem('baseline_settings');
    if (!saved) return DEFAULT_BASELINE_SETTINGS;

    try {
      const parsed = JSON.parse(saved);
      // Merge saved settings with defaults to ensure new properties (like idealDailySplit) exist
      return {
        ...DEFAULT_BASELINE_SETTINGS,
        ...parsed
      };
    } catch (e) {
      console.error("Failed to parse baseline settings", e);
      return DEFAULT_BASELINE_SETTINGS;
    }
  });

  const gymNames = useMemo(() => {
    // We use the 3-letter codes as the source of truth for IDs
    const codes = new Set([
      ...(climbData ? Object.keys(climbData) : []),
      ...(gymSchedules ? Object.keys(gymSchedules) : [])
    ]);
    if (codes.size === 0) return [];
    return ["Regional Overview", ...Array.from(codes).sort()];
  }, [climbData, gymSchedules]);

  useEffect(() => {
    localStorage.setItem('email_settings', JSON.stringify(emailSettings));
  }, [emailSettings]);

  useEffect(() => {
    localStorage.setItem('baseline_settings', JSON.stringify(baselineSettings));
  }, [baselineSettings]);

  // Sync selection when data first loads
  React.useEffect(() => {
    if (gymNames.length > 0 && selectedGyms.length === 0) {
      setSelectedGyms([gymNames[0]]);
    }
  }, [gymNames, selectedGyms]);

  const handleDataLoaded = (result: { analytics?: Record<string, Climb[]>, generator?: Record<string, GymSchedule> }) => {
    if (result.analytics) {
      const normalizedAnalytics: Record<string, Climb[]> = {};
      Object.entries(result.analytics).forEach(([name, data]) => {
        const code = getGymCode(name) || name;
        normalizedAnalytics[code] = data;
      });
      setClimbData(prev => ({ ...prev, ...normalizedAnalytics }));
      if (!climbData) setActiveView('analytics');
    }

    if (result.generator) {
      setGymSchedules(prev => ({ ...prev, ...result.generator }));
      if (!gymSchedules) setActiveView('generator');
    }

    setShowUploadOverlay(false);
  };

  const toggleGymSelection = (name: string) => {
    if (!isCompareMode || name === "Regional Overview") {
      setSelectedGyms([name]);
      return;
    }

    setSelectedGyms(prev => {
      if (prev.includes("Regional Overview")) return [name];
      if (prev.includes(name)) {
        return prev.length > 1 ? prev.filter(g => g !== name) : prev;
      }
      return [...prev, name];
    });
  };

  const handleEmailSchedule = () => {
    if (!gymSchedules) return;
    const activeGyms = Object.keys(gymSchedules);
    if (!activeGyms.length) return;

    const gymCode = activeGyms[0];
    const gymName = gymCode; // Should ideally map if needed, but gymCode is usually the acronym
    const dateRange = gymSchedules[gymCode].dateRange;

    const subject = emailSettings.subject
      .replace(/\[GYM_NAME\]/g, gymName)
      .replace(/\[DATE_RANGE\]/g, dateRange);

    const body = emailSettings.body
      .replace(/\[GYM_NAME\]/g, gymName)
      .replace(/\[DATE_RANGE\]/g, dateRange);

    const mailto = `mailto:${emailSettings.to}?cc=${emailSettings.cc}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto);
  };

  const handleReset = () => {
    setClimbData(null);
    setGymSchedules(null);
    setSelectedGyms([]);
    setIsCompareMode(false);
    setActiveView('analytics');
  };

  const handleEmail = () => {
    if (activeView === 'report') {
      const subject = encodeURIComponent(`Production Report: ${selectedGyms.join(', ')}`);
      const body = encodeURIComponent(`Hi Team,\n\nThe production report for ${selectedGyms.join(', ')} is ready. You can view the full dashboard and benchmarks here: ${window.location.href}\n\nSummary Context: ${baselineSettings.reportComments || 'No additional comments.'}`);
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    } else {
      handleEmailSchedule();
    }
  };

  const handleOpenBaselineSettings = () => setShowBaselineSettings(true);
  const handleOpenCommentModal = () => setShowCommentModal(true);

  const handleUpdateBaselineSettings = (newSettings: BaselineSettings) => {
    setBaselineSettings(newSettings);
  };

  const hasData = climbData || gymSchedules;

  return (
    <div className="min-h-screen bg-slate-50 text-[#00205B] flex">
      <Sidebar
        gymNames={gymNames}
        selectedGyms={selectedGyms}
        onSelectGym={toggleGymSelection}
        isCompareMode={isCompareMode}
        onToggleCompare={(val) => {
          setIsCompareMode(val);
          if (!val && selectedGyms.length > 1) {
            setSelectedGyms([selectedGyms[0]]);
          }
        }}
        onReset={handleReset}
        activeView={activeView}
        onViewChange={setActiveView}
        hasGeneratorData={!!gymSchedules}
        hasAnalyticsData={!!climbData}
        onSaveGenerator={() => {
          if (gymSchedules) {
            localStorage.setItem('saved_schedules', JSON.stringify(gymSchedules));
            alert('Schedules saved to local storage!');
          }
        }}
        onLoadGenerator={() => {
          const saved = localStorage.getItem('saved_schedules');
          if (saved) {
            setGymSchedules(JSON.parse(saved));
            setActiveView('generator');
            alert('Schedules loaded!');
          } else {
            alert('No saved schedules found.');
          }
        }}
        onEmailGenerator={handleEmail}
        onDownloadGenerator={() => generatorRef.current?.downloadAll()}
        onPrintGenerator={() => window.print()}
        onOpenGeneratorSettings={() => setShowSettings(true)}
        onOpenGeneratorInstructions={() => setShowInstructions(true)}
        onOpenBaselineSettings={handleOpenBaselineSettings}
        onOpenCommentModal={handleOpenCommentModal}
        baselineSettings={baselineSettings}
        onUpdateBaselineSettings={handleUpdateBaselineSettings}
        onUploadMore={() => setShowUploadOverlay(true)}
        onStartTutorial={() => setShowTutorial(true)}
      />

      <main className="flex-1 ml-72 overflow-y-auto min-h-screen">
        {activeView === 'analytics' && (
          climbData ? (
            <Dashboard
              gymData={climbData}
              selectedGyms={selectedGyms}
              isCompareMode={isCompareMode}
            />
          ) : (
            <FileUpload onDataLoaded={handleDataLoaded} />
          )
        )}

        {activeView === 'report' && (
          climbData ? (
            <ProductionReport
              data={climbData}
              selectedGyms={selectedGyms}
              dateRange={reportRange}
              onDateRangeChange={setReportRange}
              baselineSettings={baselineSettings}
            />
          ) : (
            <FileUpload onDataLoaded={handleDataLoaded} />
          )
        )}

        {activeView === 'generator' && (
          gymSchedules ? (
            <MapGenerator
              ref={generatorRef}
              schedules={gymSchedules}
              onUpdateSchedule={(gymCode, update) => {
                setGymSchedules(prev => ({ ...prev!, [gymCode]: update }));
              }}
              onClearAll={handleReset}
              showInstructions={showInstructions}
              onCloseInstructions={() => setShowInstructions(false)}
              showSettings={showSettings}
              onCloseSettings={() => setShowSettings(false)}
              emailSettings={emailSettings}
              onUpdateEmailSettings={setEmailSettings}
              onEmailSchedule={handleEmailSchedule}
            />
          ) : (
            <FileUpload onDataLoaded={handleDataLoaded} />
          )
        )}

        {activeView === 'mapper' && (
          <div className="h-full animate-in fade-in duration-700">
            <RouteMapper />
          </div>
        )}
      </main>

      {/* Upload Overlay Modal */}
      {showUploadOverlay && (
        <div className="fixed inset-0 z-[100] bg-slate-50 flex items-center justify-center animate-in fade-in duration-700">
          <button
            onClick={() => setShowUploadOverlay(false)}
            className="absolute top-10 right-10 z-[110] bg-white p-3 rounded-full shadow-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-all border border-slate-100"
          >
            <X size={32} />
          </button>
          <div className="w-full h-full p-10 overflow-y-auto">
            <FileUpload onDataLoaded={handleDataLoaded} />
          </div>
        </div>
      )}

      {/* Baseline Settings Modal */}
      <BaselineModal
        isOpen={showBaselineSettings}
        onClose={() => setShowBaselineSettings(false)}
        settings={baselineSettings}
        onUpdateSettings={handleUpdateBaselineSettings}
      />

      {/* Comment Modal */}
      <CommentModal
        isOpen={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        initialComment={baselineSettings.reportComments}
        onSave={(comment) => handleUpdateBaselineSettings({ ...baselineSettings, reportComments: comment })}
      />

      {/* Tutorial System */}
      <TutorialGuide
        steps={TUTORIAL_STEPS}
        isOpen={showTutorial}
        onStepChange={handleTutorialStepChange}
        onClose={handleTutorialClose}
      />
    </div>
  );
}

export default App;
