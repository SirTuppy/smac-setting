export const APP_VERSION = '0.3.0';

export interface ChangelogEntry {
    version: string;
    date: string;
    title: string;
    features: string[];
    fixes?: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
    {
        version: '0.3.0',
        date: '2026-03-27',
        title: 'The Architecture Overhaul',
        features: [
            'Full project restructuring: migrated to src/ directory with domain-driven feature folders',
            'Multi-gym budget architecture: location-specific budgets with regional snapshots',
            'Budget Health KPI Banner: at-a-glance pacing, burn rate, and remaining funds',
            'Regional Gym Snapshot: per-location budget health with visual indicators',
            'WSP Generator modular extraction: Settings, Wall Mapper, and Print components',
            'Local Tailwind CSS build via PostCSS for optimized performance',
            'Setter\'s Knowledge Hub: Library, Resources, and Roadmap tabs with progress tracking',
            'WSP data upload directly within the WSP Generator interface',
            'Mandatory gym selection for all expense entries',
        ],
        fixes: [
            'Normalized all location data to full gym names for consistent aggregation',
            'Improved Budget Tracker clarity with enhanced statistics bar',
            'Print layout restored to match legacy WSP tool design',
            'Removed deprecated shoe reimbursement feature',
        ]
    },
    {
        version: '0.2.0',
        date: '2026-03-25',
        title: 'The Mission Control Update',
        features: [
            'New "Mission Control" landing page with system-wide insights',
            'Per-Setter Production Pulse: Track setter volume and spot injuries/call-outs',
            'Persistent WSP Generator: Your plans now save automatically to your browser',
            'Visual Dark Mode: Premium dark theme for late-night setting sessions',
            'DVD Logo Easter Egg: Keep the Movement logo bouncing!',
            'Improved navigation and mobile responsiveness'
        ],
        fixes: [
            'Fixed WSP generator being lost on page refresh',
            'Resolved layout issues in Budget Tracker on smaller screens',
            'Unified color system across all modules'
        ]
    },
    {
        version: '0.1.0',
        date: '2026-03-01',
        title: 'Initial Release',
        features: [
            'Yellow Map Engine for automated route mapping',
            'Humanity & Kaya CSV integration',
            'WSP Generator with image export',
            'Budget Tracker with annual spend projections'
        ]
    }
];
