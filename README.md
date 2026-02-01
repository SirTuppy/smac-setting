# SMaC Routesetting Dashboard

A client-side intelligence platform designed for modern climbing gym routesetting management. Turn raw data from Plastick and Humanity into actionable regional insights, professional reports, and automated floor maps.

![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

## Key Modules

### 1. Regional Analytics
*   **Production Rhythm**: Visualize weekly output across multiple locations.
*   **KPI Tracking**: Monitor total volume, route-to-boulder ratios, and setter efficiency.
*   **Setter Leaderboards**: Deep-dive into individual performance and drift analysis.

### 2. Executive Production Reports
*   **Live Benchmarking**: Compare real-time data against regional baselines with color-coded "DeltaPills."
*   **Professional PDF Export**: Generate high-resolution, presentation-ready reports for leadership in one click.
*   **Executive Context**: Add custom summaries to give strategic context to the raw numbers.

### 3. Yellow Map Map Engine
*   **Humanity Integration**: Automatically convert CSV schedule exports into physical gym floor maps.
*   **Live Canvas**: Edit setter counts and climb locations directly on the map interface.
*   **Email Templates**: Streamlined workflow for sending generated schedules to teams.

### 4. Interactive Route Mapper
*   **Overlay Tech**: Add scoring markers and labels directly onto high-resolution wall photos.
*   **Comp-Ready**: Perfect for competition scoring charts and judge guides.

## Tech Stack
*   **Framework**: React 19 + TypeScript
*   **Build Tool**: Vite
*   **Styling**: Tailwind CSS
*   **Charts**: Recharts
*   **Export Engine**: jsPDF + html-to-image
*   **Icons**: Lucide React

## Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) (Latest LTS recommended)

### Installation & Development
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Deployment
This project is configured for easy deployment to GitHub Pages:
```bash
npm run deploy
```

## Data Privacy
**Zero Server Persistence.** This application is entirely client-side. Your Kaya and Humanity CSV data is processed locally in your browser and is never uploaded to a server or stored externally.