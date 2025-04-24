import React from 'react';
import { useTranslation } from 'react-i18next';
import { BaseHeatmapGridProps } from '@/utils/types/heatmapTypes';

const HeatmapGrid: React.FC<BaseHeatmapGridProps> = ({ 
  days, 
  hours, 
  getCellData, 
  dayLabels
}) => {
  const { t } = useTranslation('common');

  return (
    <div className="overflow-x-auto">
      <div className="min-w-max">
        {/* Hours header row */}
        <div className="flex">
          <div className="w-24 flex-shrink-0" />
          {hours.map(hour => (
            <div key={hour} className="w-12 text-center text-xs font-medium text-gray-600">
              {hour}:00
            </div>
          ))}
        </div>

        {/* Days rows */}
        {days.map((day) => (
          <div key={day} className={`flex`}>
            <div className="w-24 py-2 flex-shrink-0 font-medium text-gray-700">
              <div>{t(`days.${day.toLowerCase()}`)}</div>
              {dayLabels && <div className="text-xs text-gray-500">{dayLabels[day]}</div>}
            </div>
            {hours.map(hour => {
              const { color, displayText, title } = getCellData(day, hour);
              return (
                <div key={`${day}-${hour}`} className="w-12">
                  <div
                    className={`h-12 border border-gray-200 ${color} hover:opacity-80 transition-opacity flex items-center justify-center`}
                    title={title}
                  >
                    <span className="text-xs font-medium text-gray-700">{displayText}</span>
                  </div>
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