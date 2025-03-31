# Swimming Pool Occupancy Dashboard - React.js Application

## Overview
Create a modern, responsive React application that visualizes swimming pool occupancy data for the Kraví hora swimming pool. The application helps users identify optimal swimming times by displaying occupancy patterns throughout the week. The app supports both Czech (default) and English languages through comprehensive i18n implementation.

## Technical Requirements
- React 18+ with TypeScript
- Vite as the build tool
- Tailwind CSS for styling
- Recharts for data visualizations
- Lucide React for icons
- i18n support for Czech (default) and English languages
- Responsive design for mobile, tablet, and desktop

## Data Structure
The application works with two types of CSV data:

1. **Pool Occupancy Data** (`pool_occupancy.csv`):
```
Day,Time,Occupancy
```

2. **Maximum Capacity Data** (`capacity.csv`):
```
Day,Hour,Maximum Occupancy
```

## Core Features

### 1. Multi-Tab Interface
A tabbed interface with the following views:
- **Weekly Heatmap**: Color-coded visualization of pool utilization percentages throughout the week
- **Weekly Raw**: Numeric representation of actual occupancy numbers
- **Occupancy Chart**: Bar chart showing hourly occupancy compared to maximum capacity for a selected day
- **Data Table**: Detailed tabular view of occupancy data with CSV download options

### 2. Data Processing
Utilities to:
- Parse CSV data
- Calculate average occupancy per hour
- Determine utilization rates (occupancy/maximum capacity)
- Process min/max occupancy values for each time slot

### 3. Internationalization (i18n)
- Support Czech (default) and English languages
- Translate all UI elements, labels, buttons, and tooltips
- Include language switching capability
- Format dates, times, and numbers according to locale conventions

### 4. UI/UX Elements
- Clean, modern UI with blue as the primary color theme
- Responsive navigation with tab interface
- Informative cards with explanatory text for each visualization
- Clear legends for all visualizations
- Loading states and error handling for data fetching

## Project Structure
```
/src
  /components
    /charts
    /heatmaps
    /tables
    /ui
    /shared
  /constants
  /i18n
    /locales
      /cs
      /en
  /utils
```

### Internationalization Setup
- Uses i18next and react-i18next for translation management
- Language detection and switching functionality
- Separate locale files for Czech and English
- Namespaced translations for better organization:
  - common
  - dashboard
  - charts
  - tables
  - heatmaps

### Data Visualization Requirements
- **Charts**: Include labels, tooltips, and appropriate color coding
- **Tables**: Support sorting, clear headers, and responsive design
- **Heatmaps**: Color gradient to represent occupancy levels with a clear legend

### User Experience
- Intuitive navigation between different views
- Helpful descriptions for each visualization
- Smooth transitions between views
- Responsive design that works well on all device sizes

## Design Guidelines
- Clean, professional design suitable for a swimming facility
- Primary color: Blue (#3B82F6)
- Secondary colors: White, light grays for background, darker blues for accents
- Clear typography hierarchy
- Consistent spacing and padding
- Responsive layout that adjusts gracefully across device sizes

## Data Collection
- Data is based on one week of data collection
- Operating hours:
  - Weekdays: 6:00 to 21:00
  - Weekends: 8:00 to 20:00

## Additional Features
- Language switcher between Czech and English
- CSV data download capabilities
- Responsive design for all screen sizes
- Comprehensive error handling and loading states