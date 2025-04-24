# Kraví hora Swimming Pool Occupancy Dashboard

A modern, responsive React application that visualizes swimming pool occupancy data for the Kraví hora swimming pool. The dashboard helps users identify optimal swimming times by displaying occupancy patterns throughout the week.

## Features

- 📊 **Multiple Visualization Types**
  - Today/Tomorrow view with current occupancy and opened lanes
  - Weekly heatmap showing utilization percentages
  - Raw occupancy numbers visualization
  - Daily occupancy charts with maximum capacity comparison
  - Detailed data tables with CSV export options
  - Average occupancy patterns across weeks

- 🌐 **Bilingual Support**
  - Czech (default) and English interfaces
  - Easy language switching
  - Fully translated UI elements and descriptions
  - Date and time formatting based on locale

- 📱 **Responsive Design**
  - Works seamlessly on mobile, tablet, and desktop
  - Optimized layouts for different screen sizes
  - Touch-friendly interface

- 🔄 **Real-time Updates**
  - Current occupancy display
  - Auto-refresh every 2 minutes
  - Historical data analysis
  - Week-by-week navigation

## Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Internationalization**: i18next with react-i18next
- **Date Handling**: date-fns
- **Data Format**: CSV

## Project Structure

```
/src
  /components
    /charts        # Chart visualizations
    /heatmaps      # Heatmap components
    /shared        # Shared components (grids, legends)
    /tables        # Data table components
    /ui           # Reusable UI components
  /constants      # Constants and configuration
  /i18n          # Internationalization setup
    /locales      # Translation files
      /cs         # Czech translations
      /en         # English translations
  /utils         # Utility functions
    /data        # Data processing utilities
    /date        # Date handling utilities
    /heatmaps    # Heatmap-specific utilities
    /hooks       # Custom React hooks
    /types       # TypeScript type definitions
```

## Getting Started

1. Clone the repository
2. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Data Sources

The application works with three CSV data files:

1. `pool_occupancy.csv`: Contains actual occupancy measurements
   ```
   Date,Day,Time,Occupancy
   ```

2. `capacity.csv`: Contains maximum capacity data
   ```
   Date,Day,Hour,Maximum Occupancy
   ```

3. `week_capacity.csv`: Contains weekly capacity data for lanes
   ```
   Date,Day,Hour,Maximum Occupancy
   ```

## Environment Variables

The application uses the following environment variables:

| Variable | Description |
|----------|-------------|
| `VITE_POOL_OCCUPANCY_CSV_URL` | URL to fetch pool occupancy CSV data |
| `VITE_MAX_CAPACITY_CSV_URL` | URL to fetch maximum capacity CSV data |
| `VITE_WEEK_CAPACITY_CSV_URL` | URL to fetch weekly capacity CSV data |

## Operating Hours

- **Weekdays**: 6:00 to 21:00
- **Weekends**: 8:00 to 20:00

## Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.