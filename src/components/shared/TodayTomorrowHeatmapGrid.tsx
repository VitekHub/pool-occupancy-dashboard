import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isCzechHoliday } from '@/utils/date/czechHolidays';
import HolidayWarning from './HolidayWarning';
import FloatingTooltip from '@/components/ui/FloatingTooltip';
import GroupedBarChart from '@/components/charts/GroupedBarChart';
import { useDataPipeline } from '@/contexts/DataPipelineContext';
import type { ChartDataItem } from '@/utils/types/poolData';
import { usePoolSelector } from '@/contexts/PoolSelectorContext';
import { isInsidePool } from '@/utils/types/poolTypes';

interface ExtendedHeatmapGridProps {
  days: string[];
  hours: number[];
  getCellData: (day: string, hour: number) => any;
  dayLabels?: Record<string, string>;
  showTooltips?: boolean;
}

const TodayTomorrowHeatmapGrid: React.FC<ExtendedHeatmapGridProps> = ({ 
  days, 
  hours, 
  getCellData, 
  dayLabels,
  showTooltips = true
}) => {
  const { t, i18n } = useTranslation('common');
  const { pipeline, availableWeeks } = useDataPipeline();
  const { selectedPoolType } = usePoolSelector();
  
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
    const weekComparisonData = pipeline?.getWeekComparisonData(
      relevantWeeks.map(w => w.id), 
      day, 
      [hour]
    ) || [];

    const chartData: ChartDataItem[] = weekComparisonData.map(hourData => {
      const item: any = { hour: hourData.hour };
      hourData.weeks.forEach((week, weekIndex) => {
        item[`week${weekIndex}`] = week.utilization;
        item[`minOccupancy${weekIndex}`] = week.occupancy.min;
        item[`maxOccupancy${weekIndex}`] = week.occupancy.max;
        item[`openedLanes${weekIndex}`] = week.lanes || 0;
        item[`dayLabel${weekIndex}`] = week.weekLabel;
      });
      return item as ChartDataItem;
    });
    
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
            <div key={hour} className="w-14 text-center text-xs font-medium text-gray-600">
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
              const cellData = getCellData(day, hour);
              const {
                color,
                colorFillRatio, 
                displayText, 
                title, 
                openedLanes, 
                rawOccupancy
              } = cellData;
              
              const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
                const rect = event.currentTarget.getBoundingClientRect();
                handleCellHover(day, hour, rect);
              };
              
              return (
                <div key={`${day}-${hour}`} className="w-14">
                  { days.indexOf(day) > 0 && 
                    (<div className="w-14 text-center text-xs font-medium text-gray-600">
                      {hour}:00
                    </div>)
                  }
                  <div
                    className={`h-12 border border-gray-200 relative hover:opacity-80 transition-opacity flex items-center justify-center`}
                    title={title}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleCellLeave}
                  >
                    <div 
                      className={`absolute bottom-0 ${color}`}
                      style={{ height: `${colorFillRatio}%`, width: '100%' }}
                    />
                    <span className="text-xs font-medium text-gray-700 z-10">{displayText}</span>
                  </div>
                  {isInsidePool(selectedPoolType) && openedLanes && (
                    <div className="h-12 border bg-blue-200 red-dotted-background border-gray-200 relative flex items-center justify-center">
                      <div className="h-12 border bg-purple-200 red-dotted-background border-gray-200 relative flex items-center justify-center">
                        <div 
                          className={`absolute top-0 ${openedLanes.color}`}
                          style={{ 
                            height: `${openedLanes.colorFillRatio * 100}%`,
                            width: '100%'
                          }}
                        />
                        <span className="text-xs font-medium text-gray-700 z-10">{openedLanes.displayText}</span>
                      </div>
                    </div>
                  )}
                  {days.indexOf(day) === 0 && rawOccupancy && (
                    <div
                      className={`h-12 border border-gray-200 relative hover:opacity-80 transition-opacity flex items-center justify-center`}
                    >
                      <div 
                        className={`absolute bottom-0 ${rawOccupancy.color}`}
                        style={{ height: `${rawOccupancy.colorFillRatio}%`, width: '100%' }}
                      />
                      <span className="text-xs font-medium text-center text-gray-700 z-10">{rawOccupancy.displayText}</span>
                    </div>
                  )}
                  <div className="mb-6"></div>
                </div>
              );
            })}
            <div className="w-58 flex-shrink-0 font-normal text-gray-500 pl-4 mt-2">
              <div className="h-12 flex items-center">{subtitles[0]}</div>
              {isInsidePool(selectedPoolType) && <div className="h-12 flex items-center">{subtitles[1]}</div>}
              {days.indexOf(day) === 0 && (
                <div className="h-12 flex items-center">{subtitles[2]}</div>
              )}
            </div>
          </div>
        ))}
        
        {/* Floating tooltip with hover chart */}
        {showTooltips && isHoverChartVisible && hoveredChartData && relevantWeeks && hoveredDay && hoveredHour !== null && (
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