import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Calendar, FileText, BarChart2, Map, X } from 'lucide-react';
import FileUpload from './features/core/FileUpload';
import Dashboard from './features/analytics/Dashboard';
import RouteMapper from './features/mapper/RouteMapper';
import ProductionReport from './features/report/ProductionReport';
import ShiftAnalyzer from './features/analytics/ShiftAnalyzer';
import Sidebar from './features/core/Sidebar';
import BaselineModal from './features/core/BaselineModal';
import DiscoveryModal from './features/core/DiscoveryModal';
import CommentModal from './features/core/CommentModal';
import WSPGenerator from './features/wsp/WSPGenerator';
import BudgetTracker from './features/budget/BudgetTracker';
import SetterPath from './features/apprenticeship/SetterPath';
import { GYMS } from './constants/gyms';
import MissionControl from './features/analytics/MissionControl';
import ChangelogModal from './features/core/ChangelogModal';
import DvdLogo from './features/core/DvdLogo';
import { APP_VERSION } from './constants/version';
import { Climb, EmailSettings, AppView, BaselineSettings } from './types';
import { MOCK_CSV_DATA, MOCK_HUMANITY_DATA } from './constants/mockData';

import { useDashboardStore } from './store/useDashboardStore';
import TutorialGuide, { TutorialStep } from './features/core/TutorialGuide';
import { getGymCode } from './constants/mapTemplates';
import { parseKayaCSV } from './utils/csvParser';

const TUTORIAL_STEPS: TutorialStep[] = [
  // ... (keeping tutorial steps same)
  { targetId: 'center', title: 'Welcome Chief!', description: 'Let’s take a quick instructional tour of your new Setting Dashboard.', position: 'center' },
  { targetId: 'tour-upload', title: 'Phase 1: Your Data', description: 'Everything starts here. You’ll need two types of CSV files to unlock the full power of the Dashboard.', position: 'bottom' },
  { targetId: 'tour-upload', title: 'Getting Kaya Data', description: 'In Plastick, go to your Gym’s main page and click the download icon in the top right corner. Unselect "Current Set Only" and define a date range. For maximum versatility, download EVERYTHING and use the date selectors within this app. This powers your Analytics and Reports.', position: 'bottom' },
  { targetId: 'tour-upload', title: 'Getting Humanity Data', description: 'In Humanity, go to Shift Planning and select the gym(s) you want to pull data from. Set the view to 2 weeks. In the top right, go to Tools → Export Schedule and export as CSV. This powers the Yellow Map Engine.', position: 'bottom' },
  { targetId: 'nav-analytics', title: 'Phase 2: Analytics', description: 'Let\'s dive into your regional performance. We\'ve loaded some sample data for this tour.', position: 'right' },
  { targetId: 'tour-date-selector', title: 'Define your Scope', description: 'Use the date selector to focus on specific set cycles or months. All charts will update instantly.', position: 'bottom' },
  { targetId: 'tour-kpi-row', title: 'High-Level KPIs', description: 'Instantly track total volume, route-to-boulder ratios, and setter efficiency across the region.', position: 'bottom' },
  { targetId: 'tour-weekday-chart', title: 'Production Rhythm', description: 'See which days your crew is most productive.', position: 'top' },
  { targetId: 'tour-setter-cards', title: 'Setter Leaderboard', description: 'Individual performance breakdowns. See exactly who is crushing the volume and where they are spending their shifts.', position: 'top' },
  { targetId: 'tour-production-details', title: 'Raw Data Explorer', description: 'Deep-dive into individual setting days and setters. Need to view a specific day or setter? Use this table to sort, filter, and search through every recorded entry.', position: 'top' },
  { targetId: 'nav-report', title: 'Phase 3: Production Reports', description: 'Need something clean for the next meeting? The Report view creates presentation-ready summaries.', position: 'right' },
  { targetId: 'tour-date-display', title: 'Sync & Verify', description: 'Your date filters stay in sync here. Verify the range before you export.', position: 'bottom' },
  { targetId: 'tour-report-export', title: 'High-Res Export', description: 'Click here to generate a high-resolution, perfectly formatted PDF. It’s ready to be printed or emailed to leadership.', position: 'bottom' },
  { targetId: 'tour-baseline-settings', title: 'Set Your Standards', description: 'Define your regional baselines once, and they’ll apply to every report you generate. Set targets for volume, shifts, and daily splits here.', position: 'right' },
  { targetId: 'tour-comparison-pill', title: 'Live Benchmarking', description: 'See exactly how current production stacks up against your defined baselines. Green pills mean you’re ahead; red means you’re behind.', position: 'bottom' },
  { targetId: 'tour-report-summary-label', title: 'Executive Context', description: 'Add your custom summary here. It will appear at the top of the report to give leadership necessary context (like upcoming comps or staffing changes).', position: 'right' },
  { targetId: 'tour-baseline-reference', title: 'Transparency Page', description: 'Every report can include a Baseline Reference page. This shows leadership exactly what our "perfect world" looks like and how we measure success.', position: 'top' },
  { targetId: 'nav-mapper', title: 'Phase 4: Route Mapper', description: 'For precise competition scoring. Use this to overlay scoring markers on high-res wall photos.', position: 'right' },
  { targetId: 'tour-mapper-upload', title: 'Drop & Map', description: 'Simply drop a photo of a wall, click to add hold markers, and drag labels to clear paths for judges to read.', position: 'bottom' },
  { targetId: 'center', title: 'Mission Complete!', description: 'You’re all set to lead! If you ever need another tour, just click "Tutorial Tour" at the bottom of the sidebar. Happy setting!', position: 'center' },
];

function App() {
  const {
    climbData, setClimbData,
    selectedGyms, setSelectedGyms,
    toggleGymSelection,
    isCompareMode, setIsCompareMode,
    activeView, setActiveView,
    dateRange, setDateRange,
    getBaseline, setBaselineSettings,
    selectedBaselineGym,
    emailSettings, setEmailSettings,
    showSettings, setShowSettings,
    showInstructions, setShowInstructions,
    showUploadOverlay, setShowUploadOverlay,
    showBaselineSettings, setShowBaselineSettings,
    showCommentModal, setShowCommentModal,
    showDiscoveryModal, setShowDiscoveryModal,
    unrecognizedWalls, setUnrecognizedWalls, clearUnrecognizedWalls,
    setGymDisplayName, gymDisplayNames,
    userWallMappings,
    isDarkMode,
    lastSeenVersion,
    setLastSeenVersion,
    resetAll
  } = useDashboardStore();


  const [showTutorial, setShowTutorial] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const [showDvd, setShowDvd] = useState(false);

  // Auto-show changelog on version bump
  useEffect(() => {
    if (lastSeenVersion !== APP_VERSION) {
      setTimeout(() => setShowChangelog(true), 2000); // Slight delay for impact
      setLastSeenVersion(APP_VERSION);
    }
  }, [lastSeenVersion, setLastSeenVersion]);

  // Auto-start tutorial on first load
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('has_seen_tutorial');
    if (!hasSeenTutorial) {
      setTimeout(() => setShowTutorial(true), 1500);
      localStorage.setItem('has_seen_tutorial', 'true');
    }
  }, []);

  // Apply dark mode class on initial load
  useEffect(() => {
    document.documentElement.classList.toggle('dark-mode', isDarkMode);
  }, [isDarkMode]);

  const handleTutorialStepChange = React.useCallback((index: number) => {
    const activeBaseline = getBaseline();
    if (index >= 0 && index <= 9) setActiveView('analytics');
    else if (index >= 10 && index <= 16) {
      setActiveView('report');
      if (!activeBaseline.showSummary || !activeBaseline.reportComments) {
        setBaselineSettings({
          ...activeBaseline,
          showSummary: true,
          reportComments: activeBaseline.reportComments || 'This dashboard is synchronized with our regional production metrics. We are currently tracking ahead of schedule for the upcoming season.'
        });
      }
    }
    else if (index >= 17 && index <= 18) setActiveView('mapper');
    else if (index >= 19) setActiveView('analytics'); // Final step, can go back to analytics or stay on current view

    const needsAnalyticsData = index >= 4 && index <= 16;

    if (needsAnalyticsData && !climbData) {
      const data = parseKayaCSV(MOCK_CSV_DATA, "Movement Design District");
      setClimbData({ "Movement Design District": data });
    }
  }, [setActiveView, getBaseline, setBaselineSettings, climbData, setClimbData]);

  const gymNames = useMemo(() => {
    let codes: string[] = [];
    codes = Object.keys(climbData || {});
    if (codes.length === 0) return [];
    return ["Regional Overview", ...codes.sort()];
  }, [climbData, activeView]);

  // Sync selection when data first loads
  useEffect(() => {
    if (gymNames.length > 0 && selectedGyms.length === 0) {
      const code = getGymCode(gymNames[0]) || gymNames[0];
      setSelectedGyms([code]);
    }
  }, [gymNames, selectedGyms, setSelectedGyms]);

  const handleDataLoaded = (result: {
    analytics?: Record<string, Climb[]>,
    unrecognized?: Record<string, string[]>,
    newGyms?: Record<string, string>
  }) => {
    if (result.analytics) {
      const currentClimbData = { ...(climbData || {}) };

      Object.entries(result.analytics).forEach(([name, data]) => {
        const code = getGymCode(name) || name;
        if (currentClimbData[code]) {
          // Merge and potentially deduplicate if needed (though IDs should handle it)
          currentClimbData[code] = [...currentClimbData[code], ...data];
        } else {
          currentClimbData[code] = data;
        }
      });

      setClimbData(currentClimbData);
      if (!climbData) setActiveView('analytics');
    }

    if (result.unrecognized) {
      setUnrecognizedWalls(result.unrecognized);
    }

    if (result.newGyms) {
      Object.entries(result.newGyms).forEach(([code, name]) => {
        setGymDisplayName(code, name);
      });
    }

    setShowUploadOverlay(false);
  };

  const handleEmail = () => {
    if (activeView === 'report') {
      const activeBaseline = getBaseline();
      const subject = encodeURIComponent(`Production Report: ${selectedGyms.join(', ')}`);
      const body = encodeURIComponent(`Hi Team,\n\nThe production report for ${selectedGyms.join(', ')} is ready. You can view the full dashboard and benchmarks here: ${window.location.href}\n\nSummary Context: ${activeBaseline.reportComments || 'No additional comments.'}`);
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }
  };

  const handleTutorialClose = () => {
    setShowTutorial(false);
    resetAll();
  };


  return (
    <div className="min-h-screen bg-slate-50 text-[#00205B] flex">
      <Sidebar
        gymNames={gymNames}
        gymDisplayNames={gymDisplayNames}
        hasAnalyticsData={!!climbData}
        hasGeneratorData={false}
        onEmailGenerator={handleEmail}
        onStartTutorial={() => setShowTutorial(true)}
        onShowChangelog={() => setShowChangelog(true)}
        onShowDvd={() => setShowDvd(true)}
      />

      <ChangelogModal
        isOpen={showChangelog}
        onClose={() => setShowChangelog(false)}
      />

      <DvdLogo
        isOpen={showDvd}
        onClose={() => setShowDvd(false)}
      />

      <main className="flex-1 ml-72 overflow-y-auto min-h-screen">
        {activeView === 'mission-control' && (
          <div className="h-full animate-in fade-in duration-700">
            <MissionControl />
          </div>
        )}

        {activeView === 'analytics' && (
          climbData ? (
            <Dashboard />
          ) : (
            <FileUpload onDataLoaded={handleDataLoaded} />
          )
        )}

        {activeView === 'report' && (
          climbData ? (
            <ProductionReport />
          ) : (
            <FileUpload onDataLoaded={handleDataLoaded} />
          )
        )}



        {activeView === 'mapper' && (
          <div className="h-full animate-in fade-in duration-700">
            <RouteMapper />
          </div>
        )}

        {activeView === 'shift-analyzer' && (
          climbData ? (
            <ShiftAnalyzer />
          ) : (
            <FileUpload onDataLoaded={handleDataLoaded} />
          )
        )}

        {activeView === 'wsp-generator' && (
          <div className="h-full animate-in fade-in duration-700">
            <WSPGenerator />
          </div>
        )}

        {activeView === 'budget-tracker' && <BudgetTracker />}
        {activeView === 'setter-path' && <SetterPath />}

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

      <BaselineModal
        isOpen={showBaselineSettings}
        onClose={() => setShowBaselineSettings(false)}
      />

      <DiscoveryModal
        isOpen={showDiscoveryModal || Object.keys(unrecognizedWalls).length > 0}
        onClose={() => {
          setShowDiscoveryModal(false);
          clearUnrecognizedWalls();
        }}
      />

      {/* Comment Modal */}
      <CommentModal
        isOpen={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        initialComment={getBaseline(selectedBaselineGym).reportComments}
        onSave={(comment) => setBaselineSettings({ ...getBaseline(selectedBaselineGym), reportComments: comment }, selectedBaselineGym)}
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
