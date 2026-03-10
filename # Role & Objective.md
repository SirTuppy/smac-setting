# Role & Objective
Act as an expert React frontend developer and UI/UX engineer. We are building a stateless, frontend-only React web application called the "SMAC Reporting Tool". This application replaces a massive, manually updated Excel workbook used for tracking nationwide routesetting production.

It will ingest raw CSV exports via drag-and-drop, process the data in memory, calculate production metrics, and display them on a heavily styled dashboard. There is NO backend database.

---

# Part 1: Data Ingestion & State Management (The "Stateless" Pipeline)
The user will drop three types of files into a single dropzone component. The application must parse them (e.g., using PapaParse), deduplicate them, and hold them in memory.

1.  **fact_climbs (Plastick Export):** Contains individual climb data.
    * Key fields: `id`, `grade_name`, `color`, `setters`, `status`, `climb_type`, `gym_name`, `wall_name`, `date_set`, `date_stripped`.
    * *Rule:* The `id` column must be used to deduplicate records if overlapping CSVs are uploaded.
2.  **fact_payroll (Humanity/Dayforce Export):** Contains biweekly hours and wages.
    * Key fields: `Employee Name`, `Paycheck Date`, `Worked Hours (REG + OT)`, `Pay Period Wages`, `Gym`.
3.  **dim_constants (SharePoint Targets):** Contains static definitions for Gyms and Orbits.
    * Key variables: `Target HPB`, `Target HPR`, `Target Boulder Density`, `Target Route Density`, `Weekly Production Goal`, `Hours Per Climb Goal`.

**Data Cleaning Rules:**
* Map and normalize naming inconsistencies between the payroll `Gym` column and the Plastick `gym_name` column.
* Convert missing or null values in `Worked Hours` and `Pay Period Wages` to `0.0`.
* Convert empty setter names in `fact_climbs` to "Unassigned".

---

# Part 2: Global Filters (The "Slicers")
The UI must include global state filters that slice the raw data before calculations occur.
* **Gym Tier**: Multi-select dropdown.
* **Gym Name**: Multi-select dropdown.
* **Region**: Multi-select dropdown.
* **Paycheck Date**: Multi-select specific dates.
* **Date Range**: Start Date and End Date calendar inputs.
* **Collab Setter Handling**: A toggle determining how climbs with multiple setters are mathematically credited:
    * *Fractional*: 1 climb / N setters.
    * *Full Credit*: 1 climb = 1 full credit for all listed.
    * *Primary Only*: Strip secondary names entirely.

---

# Part 3: The Calculation Engine
All dashboard metrics must be calculated dynamically based on the filtered data. Ensure zero-division protection on all division operations. (Note: Replicate the Boulder logic exactly for Routes).

**Pre-requisite Aggregations:**
* `Total Pay Period Hours`: Sum of `Worked Hours` from `fact_payroll`.
* `Total Pay Period Wages`: Sum of `Pay Period Wages` from `fact_payroll`.
* `Total Boulders Set`: Count of `id` from `fact_climbs` where `climb_type` is Bouldering.
* `Total Weeks in Range`: Calculated from the Global Filter 'Date Range'.

**Core Metrics:**
* `Average Pay Period Hours`: Total Pay Period Hours / Count of Pay Periods.
* `Average Pay Period Wages`: Total Pay Period Wages / Count of Pay Periods.
* `Est. Production Hours`: (Total Boulders Set * Target HPB) + (Total Routes Set * Target HPR).
* `Avg. Production Contribution Ratio`: Est. Production Hours / Total Pay Period Hours.

**Boulder Metrics:**
* `Active Density`: Count of climbs where `date_set` <= Period End AND (`date_stripped` is empty OR `date_stripped` > Period End).
* `Avg. Boulder Density (+/-)`: Active Density - Target Boulder Density.
* `Avg. Weekly Boulder Output`: Total Boulders Set / Total Weeks in Range.
* `Avg. Weekly Boulder Output (+/-)`: Avg. Weekly Boulder Output - Weekly Production Goal.
* `Avg. Weekly Boulder Output Ratio`: Avg. Weekly Boulder Output / Weekly Production Goal.
* `Avg. Projected Boulder Rotation (Weeks)`: Target Boulder Density / Avg. Weekly Boulder Output.
* `Avg. Individual Hours / Boulder`: Total Pay Period Hours / Total Boulders Set.
* `Avg. Individual Boulder Cost`: Total Pay Period Wages / Total Boulders Set.
* `Standard Deviation - New Boulders`: Statistical standard deviation of weekly boulder output across the selected date range.

---

# Part 4: UI & Technical Style Guide
The application relies on a Tailwind CSS implementation with zero external UI libraries padding the layout. 

**1. Global App Container & Scrollbars:**
```html
<body class="bg-slate-50 text-[#00205B] antialiased">
  <div class="min-h-screen flex">
    </div>
</body>
/* Light Mode (Main Content Area) */
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: #f8fafc; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

/* Dark Mode (Sidebar custom-scrollbar class) */
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
```

**2. Color Palettes**
Primary Navy (Text & Sidebar): #00205B

    Brand Yellow (Accents & Highlights): #EDE04B

    Teal (Routes): #009CA6

    Deep Blue (Boulders): #00205B

    Categorical Accents: Pink (#D25B73), Green (#00BB7E), Orange (#FF7F41), Yellow (#EDE04B), Indigo (#6C5CE7), Lavender (#A29BFE).

    Status Positive: text-emerald-500 bg-emerald-50 border-emerald-100

    Status Warning: text-amber-600 bg-amber-50 border-amber-100

    Status Negative: text-rose-500 bg-rose-50 border-rose-100

3. Typography Rules:

    Page Titles: text-xl font-black text-[#00205B] uppercase tracking-tighter

    Section Subheadings (Technical Look): text-[9px] font-black text-slate-400 uppercase tracking-widest (use text-white/30 in sidebar).

    Data Points: text-4xl font-black text-[#00205B] (Large) or text-3xl font-black (Medium).

4. Structural Layout & Containers:

    Sidebar: <aside class="w-72 bg-[#00205B] text-white flex flex-col fixed inset-y-0 left-0 z-50 shadow-2xl">

    Main Area: <main class="flex-1 ml-72 overflow-y-auto min-h-screen bg-slate-50 relative">

    Background Pattern: Insert inside main content: <div class="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style="background-image: radial-gradient(#00205B 1px, transparent 1px); background-size: 24px 24px;"></div>

    Data Cards: <div class="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-sm border border-slate-200">

    Action Buttons (Outline): px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-black uppercase text-[10px] tracking-widest hover:border-[#00205B] hover:text-[#00205B] transition-all shadow-sm