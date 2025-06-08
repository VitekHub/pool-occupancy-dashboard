import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import GroupedBarChart from './GroupedBarChart';
import { usePoolDataContext } from '@/contexts/PoolDataContext';
import DaySelector from '@/components/ui/DaySelector';
import { getValidHours } from '@/constants/time';
import { prepareChartDataForHour } from '@/utils/charts/chartDataUtils';
import type { ChartDataItem } from '@/utils/types/poolData';

const WeeklyComparisonChart: React.FC = () => {
  const { t, i18n } = useTranslation(['charts', 'common']);
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [startHourIndex, setStartHourIndex] = useState(0);
  const {
    availableWeeks,
    weeklySummaries,
    capacityData,
    loading,
    error,
    selectedWeekId
  } = usePoolDataContext();

  // Get the last 4 weeks including the selected week
  const selectedWeekIndex = availableWeeks.findIndex(week => week.id === selectedWeekId);
  const relevantWeeks = availableWeeks.slice(selectedWeekIndex, selectedWeekIndex + 4);

  if (loading) {
    return <div className="flex justify-center items-center h-64">{t('common:loading')}</div>;
  }

  if (error?.message) {
    return <div className="text-red-500">{t('common:error', { message: error.message })}</div>;
  }

  const validHours = getValidHours(selectedDay);

  // Get the visible hours (3 at a time)
  const visibleHours = validHours.slice(startHourIndex, startHourIndex + 3);

  // Prepare data for the chart
  const chartData: ChartDataItem[] = visibleHours.map(hour =>
    prepareChartDataForHour(
      selectedDay,
      hour,
      relevantWeeks,
      weeklySummaries,
      capacityData,
      i18n.language
    )
  );

  const handlePrevious = () => {
    setStartHourIndex(Math.max(0, startHourIndex - 1));
  };

  const handleNext = () => {
    setStartHourIndex(Math.min(validHours.length - 3, startHourIndex + 1));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <DaySelector
        selectedDay={selectedDay}
        onChange={setSelectedDay}
      />

      <div className="mt-8 flex items-center">
        <button
          onClick={handlePrevious}
          disabled={startHourIndex === 0}
          className={`p-2 rounded-lg ${startHourIndex === 0
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:bg-gray-100'
            }`}
          aria-label={t('common:previous')}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="flex-1 h-[500px]">
          <GroupedBarChart
            chartData={chartData}
            relevantWeeks={relevantWeeks}
            selectedDay={selectedDay}
          />
        </div>

        <button
          onClick={handleNext}
          disabled={startHourIndex >= validHours.length - 3}
          className={`p-2 rounded-lg ${startHourIndex >= validHours.length - 3
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:bg-gray-100'
            }`}
          aria-label={t('common:next')}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div className="mt-4 flex justify-center items-center text-sm text-gray-500">
        {t('charts:weeklyComparison.showingHours', {
          start: visibleHours[0],
          end: visibleHours[visibleHours.length - 1]
        })}
      </div>
    </div>
  );
};

export default WeeklyComparisonChart;