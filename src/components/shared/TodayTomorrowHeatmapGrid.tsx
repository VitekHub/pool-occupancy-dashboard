import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExtendedHeatmapGridProps, ExtendedCellData } from '@/utils/types/heatmapTypes';
import { isCzechHoliday } from '@/utils/date/czechHolidays';
import HolidayWarning from './HolidayWarning';
import FloatingTooltip from '@/components/ui/FloatingTooltip';
import GroupedBarChart from '@/components/charts/GroupedBarChart';
import { usePoolDataContext } from '@/contexts/PoolDataContext';
import { prepareChartDataForHour } from '@/utils/charts/chartDataUtils';
import type { ChartDataItem } from '@/utils/types/poolData';

const TodayTomorrowHeatmapGrid: React.FC<ExtendedHeatmapGridProps> = ({ 
  days, 
  hours, 
  getCellData, 
  dayLabels
}) => {
  const { t, i18n } = useTranslation('common');
  const { availableWeeks, weeklySummaries, capacityData } = usePoolDataContext();
  
  // Hover state
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);
  const [hoveredChartData, setHoveredChartData] = useState<ChartDataItem[]>([]);
  const [hoveredCellPosition, setHoveredCellPosition] = useState<DOMRect | null>(null);
  const [isHoverChartVisible, setIsHoverChartVisible] = useState(false);
  
  // Get the last 4 weeks including the current week
  const currentWeekIndex = availableWeeks.findIndex(week => {
    const now = new Date();
    return now >= week.startDate && now <= week.endDate;
  });
  const relevantWeeks = availableWeeks.slice(currentWeekIndex >= 0 ? currentWeekIndex : 0, (currentWeekIndex >= 0 ? currentWeekIndex : 0) + 4);
  
  const subtitles = [
    t('heatmaps:todayTomorrow.daySubtitle.occupancy'),
    t('heatmaps:todayTomorrow.daySubtitle.lanes'),
    t('heatmaps:todayTomorrow.daySubtitle.raw')
  ];
  
  // Handle cell hover
  const handleCellHover = (day: string, hour: number, rect: DOMRect) => {
    setHoveredDay(day);
    setHoveredHour(hour);
    setHoveredCellPosition(rect);
    
    // Prepare chart data for the hovered hour
    const chartData = prepareChartDataForHour(
      day,
      hour,
      relevantWeeks,
      weeklySummaries,
      capacityData,
      i18n.language
    );
    
    setHoveredChartData([chartData]);
    setIsHoverChartVisible(true);
  };
  
  // Handle cell leave
  const handleCellLeave = () => {
    setIsHoverChartVisible(false);
    setHoveredDay(null);
    setHoveredHour(null);
    setHoveredChartData([]);
    setHoveredCellPosition(null);
  };

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
          <div className="w-48 flex-shrink-0" />
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
              const cellData: ExtendedCellData = getCellData(day, hour);
              const { color, displayText, title, openedLanes, rawOccupancyDisplayText } = cellData;
              
              const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
                const rect = event.currentTarget.getBoundingClientRect();
                handleCellHover(day, hour, rect);
              };
              
              return (
                <div key={`${day}-${hour}`} className="w-12">
                  { days.indexOf(day) > 0 && 
                    (<div className="w-12 text-center text-xs font-medium text-gray-600">
                      {hour}:00
                    </div>
                  )}
                  <div
                    className={`h-12 border border-gray-200 ${color} hover:opacity-80 transition-opacity flex items-center justify-center`}
                    title={title}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleCellLeave}
                  >
                    <span className="text-xs font-medium text-gray-700">{displayText}</span>
                  </div>
                  {openedLanes && (
                    <div className="h-12 border border-gray-200 relative flex items-center justify-center">
                      <div 
                        className="absolute bottom-0 bg-blue-400"
                        style={{ 
                          height: `${openedLanes.fillRatio * 100}%`,
                          width: '100%'
                        }}
                      />
                      <span className="text-xs font-medium text-gray-700 z-10">{openedLanes.text}</span>
                    </div>
                  )}
                  {days.indexOf(day) === 0 && (
                    <div
                      className={`h-12 border border-gray-200 hover:opacity-80 transition-opacity flex items-center justify-center`}
                    >
                      <span className="text-xs font-medium text-gray-700">{rawOccupancyDisplayText}</span>
                    </div>
                  )}
                  <div className="mb-8"></div>
                </div>
              );
            })}
            <div className="w-58 flex-shrink-0 font-normal text-gray-500 pl-4 mt-2">
              <div className="h-12 flex items-center">{subtitles[0]}</div>
              <div className="h-12 flex items-center">{subtitles[1]}</div>
              {days.indexOf(day) === 0 && (
                <div className="h-12 flex items-center">{subtitles[2]}</div>
              )}
            </div>
          </div>
        ))}
        
        {/* Floating tooltip with hover chart */}
        {isHoverChartVisible && hoveredChartData && relevantWeeks && hoveredDay && hoveredHour !== null && (
          <FloatingTooltip
            isVisible={isHoverChartVisible}
            targetRect={hoveredCellPosition}
          >
            <GroupedBarChart
              chartData={hoveredChartData}
              relevantWeeks={relevantWeeks}
              selectedDay={hoveredDay}
              hideOccupancySquare={true}
            />
          </FloatingTooltip>
        )}
      </div>
    </div>
  );
};

export default TodayTomorrowHeatmapGrid;