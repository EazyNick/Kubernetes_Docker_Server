# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **mockup dashboard** for container monitoring visualization in Docker and Kubernetes environments. The project is a static HTML/CSS/JavaScript implementation designed for UI/UX design presentation and requirements validation before actual implementation.

## Architecture

### Frontend Structure
- **Single-page application**: Pure HTML with embedded CSS and JavaScript
- **Static dashboard**: No backend connectivity, uses simulated data
- **Responsive design**: Bootstrap 5-based grid system supporting desktop, tablet, and mobile
- **Real-time simulation**: Client-side data updates every 5 seconds

### Key Components
- **Statistics cards**: Container counts, running status, Docker/K8s distribution
- **Host information panel**: Node details, CPU/memory usage
- **Interactive charts**: 7 different chart types using Chart.js
- **Container list**: Detailed view with progress bars and status indicators

### Technology Stack
- **HTML5**: Semantic markup structure
- **CSS3**: Custom properties, Flexbox, Grid, animations
- **JavaScript ES6**: Chart initialization and data simulation
- **Bootstrap 5**: Responsive framework (CDN)
- **Chart.js**: Visualization library (CDN)
- **Font Awesome**: Icon library (CDN)

## Development Commands

### Running the Dashboard
```bash
# Method 1: Direct browser access
open index.html

# Method 2: Python local server (recommended)
python -m http.server 8000

# Method 3: Node.js http-server
npx http-server -p 8000
```

### Accessing the Application
- Local server: `http://localhost:8000`
- Direct file: Open `index.html` in browser

## Chart Configuration

### Chart Types and Data
- **Line charts**: CPU/Memory usage trends, Network traffic (time-series data)
- **Bar charts**: Container-specific CPU/Memory usage (categorical data)
- **Doughnut chart**: Node distribution (proportional data)
- **Pie chart**: Engine distribution (Docker vs Kubernetes)

### Chart.js Integration
- All charts use responsive configuration with `maintainAspectRatio: false`
- Color scheme defined in CSS custom properties and JavaScript colors object
- Mock data generation uses `Math.random()` for realistic simulation

## Styling Architecture

### CSS Organization
- **CSS Custom Properties**: Centralized color scheme in `:root`
- **Component-based styling**: Modular CSS classes (.stat-card, .chart-card, .container-item)
- **Responsive breakpoints**: 
  - Desktop: 1200px+
  - Tablet: 768px-1199px  
  - Mobile: <768px

### Design System
- **Gradient backgrounds**: Linear gradients for cards and overall layout
- **Hover effects**: Transform and shadow transitions
- **Animation**: Pulse effect for real-time indicator
- **Typography**: Segoe UI font family

## Data Simulation

### Mock Data Patterns
- **Container counts**: 20-30 total containers
- **CPU usage**: 20-50% range with realistic fluctuation
- **Memory usage**: 50-70% range 
- **Network traffic**: 100-150 MB/s simulation
- **Update frequency**: 5-second intervals for statistics

### Real-time Features
- Statistics cards auto-update
- Real-time indicator color changes
- Simulated data generation for time-series charts

## File Structure Context

```
dashboard/
├── index.html          # Complete dashboard implementation
├── README.md          # Comprehensive documentation
└── CLAUDE.md          # This file
```

This is a **mockup/prototype** project intended for design validation and presentation purposes, not a production system with real monitoring capabilities.