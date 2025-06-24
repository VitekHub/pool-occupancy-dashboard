# Swimming Pool Occupancy Dashboard

React application that visualizes swimming pool occupancy data for multiple swimming pools in Brno. The dashboard helps users identify optimal swimming times by displaying occupancy patterns throughout the week across different pool facilities.

## Features

- 🏊 **Multi-Pool Support**
  - Support for multiple swimming pool facilities
  - Dynamic pool configuration via JSON

- 📊 **Multiple Visualization Types**
  - Today/Tomorrow view with current occupancy and opened lanes
  - Weekly heatmap showing utilization percentages with adjustable thresholds
  - Average occupancy patterns across weeks
  - Weekly comparison charts across multiple weeks

- 🎨 **Advanced Heatmap Features**
  - Color-coded occupancy rates with customizable thresholds
  - Dual-layer visualization (color for absolute occupancy, height for relative)

- 🌐 **Bilingual Support**
  - Czech (default) and English interfaces

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
- **Data Fetching**: SWR
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
    /layout       # Layout components (header, sidebar, footer)
  /constants      # Constants and configuration
  /contexts       # React contexts for state management
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
3. Configure your environment variables (see Configuration section below)
4. Install dependencies:
   ```bash
   npm install
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## Configuration

### Environment Variables

The application uses the following environment variables:

| Variable | Description |
|----------|-------------|
| `VITE_POOL_OCCUPANCY_CONFIG_URL` | URL to the pool configuration JSON file |
| `VITE_BASE_OCCUPANCY_CSV_URL` | Base URL for occupancy CSV data files |
| `VITE_MAX_CAPACITY_CSV_URL` | URL to the maximum capacity CSV data |
| `VITE_WEEK_CAPACITY_CSV_URL` | URL to the weekly capacity CSV data |

### Pool Configuration

The application loads pool configurations from a JSON file specified in `VITE_POOL_OCCUPANCY_CONFIG_URL`. Each pool can have both inside and outside facilities:

```json
[
  {
    "name": "Pool Name",
    "insidePool": {
      "customName": "Indoor Pool",
      "url": "https://pool-website.com",
      "pattern": "data-pattern",
      "csvFile": "indoor_occupancy.csv",
      "maximumCapacity": 50,
      "totalLanes": 6,
      "weekdaysOpeningHours": "6:00-21:00",
      "weekendOpeningHours": "8:00-20:00",
      "collectStats": true,
      "viewStats": true,
      "temporarilyClosed": "1.1.2024 - 15.1.2024"
    },
    "outsidePool": {
      "customName": "Outdoor Pool",
      "url": "https://pool-website.com",
      "pattern": "data-pattern",
      "csvFile": "outdoor_occupancy.csv",
      "maximumCapacity": 100,
      "weekdaysOpeningHours": "6:00-21:00",
      "weekendOpeningHours": "8:00-20:00",
      "collectStats": true,
      "viewStats": true
    }
  }
]
```

## Data Sources

The application works with three types of CSV data files:

1. **Pool Occupancy Data** (`pool_occupancy.csv`):
   ```
   Date,Day,Time,Occupancy
   01.01.2024,Monday,08:00:00,15
   ```

2. **Maximum Capacity Data** (`capacity.csv`):
   ```
   Date,Day,Hour,Maximum Occupancy
   01.01.2024,Monday,8,45
   ```

3. **Weekly Capacity Data** (`week_capacity.csv`):
   ```
   Date,Day,Hour,Maximum Occupancy
   01.01.2024,Monday,8,45
   ```

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