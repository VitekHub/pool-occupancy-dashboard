import React from 'react';
import { useTranslation } from 'react-i18next';
import { BaseHeatmapGridProps } from '@/utils/types/heatmapTypes';
import { isCzechHoliday } from '@/utils/date/czechHolidays';
import HolidayWarning from './HolidayWarning';
import { usePoolSelector } from '@/contexts/PoolSelectorContext';
import { getBarHeight } from '@/utils/heatmaps/heatmapUtils';

const HeatmapGrid: React.FC<BaseHeatmapGridProps> = ({ 
  days, 
  hours, 
  getCellData, 
  dayLabels
}) => {
  const { t } = useTranslation('common');
  const { uniformHeatmapBarHeight } = usePoolSelector();

  return (
    <div className="overflow-x-auto">
      <div className="min-w-max">
        {/* Hours header row */}
        <div className="flex">
          <div className="w-24 flex-shrink-0" />
          {hours.map(hour => (
            <div key={hour} className="w-14 text-center text-xs font-medium text-gray-600">
              {hour}:00
            </div>
          ))}
        </div>

        {/* Days rows */}
        {days.map((day) => (
          <div key={day} className={`flex`}>
            <div className="w-24 py-2 flex-shrink-0 font-medium text-gray-700">
              <div>{t(`days.${day.toLowerCase()}`)}</div>
              {dayLabels && (
                <div className="flex items-center gap-1">
                  <div className="text-xs text-gray-500">{dayLabels[day]}</div>
                  <HolidayWarning 
                    isHoliday={isCzechHoliday(dayLabels[day]).isHoliday}
                    showBelow={days.indexOf(day) === 0}
                  />
                </div>
              )}
            </div>
            {hours.map(hour => {
              const { color, colorFillRatio, displayText, title } = getCellData(day, hour);
              return (
                <div key={`${day}-${hour}`} className="w-14">
                  <div
                    className={`h-12 border border-gray-200 relative hover:opacity-80 transition-opacity flex items-center justify-center`}
                    title={title}
                  >
                    <div 
                      className={`absolute bottom-0 ${color}`}
                      style={{ 
                        height: getBarHeight(colorFillRatio, uniformHeatmapBarHeight),
                        width: '100%'
                      }}
                    />
                    <span className="text-xs font-medium text-center text-gray-700 z-10">{displayText}</span>
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