import React from 'react';

interface CellData {
  color: string;
  displayText: string;
  title: string;
}

interface HeatmapGridProps {
  days: string[];
  hours: number[];
  getCellData: (day: string, hour: number) => CellData;
}

const HeatmapGrid: React.FC<HeatmapGridProps> = ({ days, hours, getCellData }) => {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-max">
        {/* Hours header row */}
        <div className="flex">
          <div className="w-24 flex-shrink-0"></div>
          {hours.map(hour => (
            <div key={hour} className="w-12 text-center text-xs font-medium text-gray-600">
              {hour}:00
            </div>
          ))}
        </div>
        
        {/* Days rows */}
        {days.map(day => (
          <div key={day} className="flex">
            <div className="w-24 py-2 flex-shrink-0 font-medium text-gray-700">{day}</div>
            {hours.map(hour => {
              const { color, displayText, title } = getCellData(day, hour);
              return (
                <div 
                  key={`${day}-${hour}`} 
                  className={`w-12 h-12 border border-gray-200 ${color} hover:opacity-80 transition-opacity flex items-center justify-center`}
                  title={title}
                >
                  <span className="text-xs font-medium text-gray-700">{displayText}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeatmapGrid;