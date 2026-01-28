# SMaC Regional Dashboard - TODO List

## 🚀 Priority Refinements
- [x] **Vector Export Migration**: Evaluated snapshot engine. Currently optimized via high-quality JPEG (4x -> 2x) to fix the 94MB file size issue.
- [x] **Top Bar Standardization**: Sync the Analytics and Production page headers. Implement the same date presets (Last 7 Days, Last 30 Days, etc.) across both views for a unified experience.
- [x] **Export UI Polish**: Move the "Export PDF" button to a more permanent/intuitive home in the standardized top bar.

## 📊 Production Report Enhancements
- [x] **Weekday Totals**: Add total volume columns/rows to the "Weekday Distribution" chart so directors can see aggregate weekly output at a glance.
- [x] **Setter Production Finish**: Refined quadrant layout with full "Routes/Boulders" labels and total climb badges.
- [x] **Interactive Tutorial**: Added a guided tour for first-time users to explain all major features.

## 🗺️ Map Generation & Data
- [x] **Unified Map Generation**: Integrate the "Route Mapper" functionality. Allow users to upload CSVs directly within this dashboard to generate maps.

## 🛠️ Technical Debt
- [x] **Type Safety**: Refine `any` types in `ProductionReportView.tsx` and `ProductionReport.tsx` with strict interfaces.
- [x] **Animation Polishing**: Ensure all dashboard transitions are smooth (700ms standard).

---
*Last updated: 2026-01-27*
- [ ] **Automation**: Explore automated report generation and delivery.
- [ ] **Stretch Goal**: Automated comparative reports (Period-over-period, Year-over-year, etc.).