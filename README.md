# Kraví hora Swimming Pool Occupancy Dashboard

A modern, responsive React application that visualizes swimming pool occupancy data for the Kraví hora swimming pool. The dashboard helps users identify optimal swimming times by displaying occupancy patterns throughout the week.

## Features

- 📊 **Multiple Visualization Types**
  - Weekly heatmap showing utilization percentages
  - Raw occupancy numbers visualization
  - Daily occupancy charts with maximum capacity comparison
  - Detailed data tables with CSV export options

- 🌐 **Bilingual Support**
  - Czech (default) and English interfaces
  - Easy language switching
  - Fully translated UI elements and descriptions

- 📱 **Responsive Design**
  - Works seamlessly on mobile, tablet, and desktop
  - Optimized layouts for different screen sizes
  - Touch-friendly interface

## Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Internationalization**: i18next with react-i18next
- **Data Format**: CSV

## Project Structure

```
/src
  /components
    /charts        # Chart components
    /heatmaps      # Heatmap visualizations
    /tables        # Table components
    /ui           # Reusable UI components
    /shared       # Shared components
  /constants      # Constants and configuration
  /i18n          # Internationalization setup
    /locales      # Translation files
      /cs         # Czech translations
      /en         # English translations
  /utils         # Utility functions
```

## Getting Started

1. Clone the repository
2. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Data Sources

The application works with two CSV data files:

1. `pool_occupancy.csv`: Contains actual occupancy measurements
   ```
   Day,Time,Occupancy
   ```

2. `capacity.csv`: Contains maximum capacity data
   ```
   Day,Hour,Maximum Occupancy
   ```

The data is continuously updated with real-time measurements.

## Environment Variables

The application uses the following environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_POOL_OCCUPANCY_CSV_URL` | URL to fetch pool occupancy CSV data | `https://raw.githubusercontent.com/VitekBrno/kravihora-brno/main/data/pool_occupancy.csv` |

Create a `.env` file in the project root and configure these variables before starting the application.

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