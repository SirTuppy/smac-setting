# SMaC Regional Dashboard - Roadmap

---
*Last updated: 2026-02-01*

## 1. Comparative Analytics (Short Term)
- [ ] **Automated Comparative Reports** (PoP/YoY)
    - *Infrastructure*: Extract data aggregation into a standalone `productionStats.ts` utility.
    - *UI*: Implement "Ghost Bars" in daily production charts (Current vs. Greyed-out Previous).
    - *Metrics*: Add "DeltaPills" to summary cards showing % change vs. previous period or same dates last year.
    - *Controls*: Add comparison toggle in Sidebar (None | PoP | YoY).

## 2. Setter Wellness & Operations (Backburner)
- [ ] **Load/Injury Monitoring**
    - Alert system for high cumulative volume or excessive consecutive setting days.
    - *Strategic Note*: This would significantly benefit from a self-reporting (likely external) tool to capture qualitative data like fatigue or minor aches.

## 3. Tooling & UX (Medium Term)
- [ ] **Mobile/Tablet Optimization**: Responsive layouts for "on-the-wall" tablet reference during setting shifts.

## 4. Technical Debt & Quality (Long Term)
- [ ] **Automated Test Suite**: Focus on data parsing accuracy and stats calculation reliability.
- [ ] **Performance Optimization**: Efficient handling of multi-year datasets through selective processing.
