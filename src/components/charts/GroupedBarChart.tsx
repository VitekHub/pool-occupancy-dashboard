import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePoolDataContext } from '@/contexts/PoolDataContext';
import { TOTAL_MAX_OCCUPANCY, TOTAL_LANES } from '@/constants/pool';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from 'recharts';
import CustomBar from './CustomBar';
import DaySelector from '@/components/ui/DaySelector';
import { getValidHours } from '@/constants/time';
import { format } from 'date-fns';
import { cs, enUS } from 'date-fns/locale';
import type { ChartDataItem } from '@/utils/types/poolData';

const GroupedBarChart: React.FC = () => {
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
  const dateLocale = i18n.language === 'cs' ? cs : enUS;

  // Get the visible hours (3 at a time)
  const visibleHours = validHours.slice(startHourIndex, startHourIndex + 3);

  // Prepare data for the chart
  const chartData: ChartDataItem[] = visibleHours.map(hour => {
    const hourData: any = {
      hour: `${hour}:00`,
    };

    relevantWeeks.forEach((week, index) => {
      const weekSummary = weeklySummaries[week.id] || [];
      const weekData = weekSummary.find(
        summary => summary.hour === hour &&
          summary.day === selectedDay
      );

      // Calculate the specific day's date by adding days based on the day of the week
      const dayIndex = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(selectedDay);
      const dayDate = new Date(week.startDate);
      dayDate.setDate(dayDate.getDate() + dayIndex);

      const foundHourlyCapacity = capacityData?.find(
        cap =>
          cap.day === selectedDay &&
          parseInt(cap.hour) === hour &&
          cap.date.getTime() === dayDate.getTime()
      );

      const weekLabel = format(dayDate, 'd.M.', { locale: dateLocale });
      const dayLabel = weekLabel;

      hourData[`week${index}`] = weekData?.utilizationRate || 0;
      hourData[`minOccupancy${index}`] = weekData?.minOccupancy || 0;
      hourData[`maxOccupancy${index}`] = weekData?.maxOccupancy || 0;
      hourData[`openedLanes${index}`] = foundHourlyCapacity ?
        Math.round(foundHourlyCapacity.maximumOccupancy / (TOTAL_MAX_OCCUPANCY / TOTAL_LANES)) :
        0;
      hourData[`dayLabel${index}`] = dayLabel;
    });

    return hourData;
  });

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
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 40, right: 30, left: 20, bottom: 60 }}
              barSize={65}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="hour"
                interval={0}
                tick={({ x, y, payload }) => (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      x={0}
                      y={0}
                      dy={30}
                      textAnchor="middle"
                      fill="#374151"
                      fontSize="16"
                    >
                      {t(`common:days.${selectedDay.toLowerCase()}`)}
                      {` ${payload.value}`}
                    </text>
                  </g>
                )}
              >
                <Label value={t('charts:axis.hour')} position="bottom" offset={60} />
              </XAxis>
              <YAxis domain={[0, 100]}>
                <Label
                  value={t('charts:grouped.utilizationRate')}
                  angle={-90}
                  position="insideLeft"
                  offset={0}
                />
              </YAxis>
              <Tooltip
                formatter={function (value: number, name: string, props: { payload: ChartDataItem }) {
                  const weekIndex = parseInt(name.replace('week', ''));
                  const payload = props.payload;
                  const minOccupancy = payload[`minOccupancy${weekIndex}`];
                  const maxOccupancy = payload[`maxOccupancy${weekIndex}`];
                  const openedLanes = payload[`openedLanes${weekIndex}`];
                  const dayLabel = payload[`dayLabel${weekIndex}`];
                  const occupancyText = minOccupancy === maxOccupancy ?
                    `${maxOccupancy}` :
                    `${minOccupancy}-${maxOccupancy}`;
                  return [
                    `${t(`common:days.${selectedDay.toLowerCase()}`)} ${dayLabel} - ${value}% (${occupancyText} ${t('common:people')}, ${openedLanes} ${t('charts:grouped.lanes')})`
                  ];
                }}
              />
              {relevantWeeks.map((_, index) => (
                <Bar
                  key={index}
                  dataKey={`week${relevantWeeks.length - 1 - index}`}
                  isAnimationActive={false}
                  fill={`hsl(${200 + index * 30}, 80%, ${50 - index * 5}%)`}
                  shape={
                    <CustomBar
                      minOccupancy={(data: CustomBarPayload) => data[`minOccupancy${relevantWeeks.length - 1 - index}`] as number}
                      maxOccupancy={(data: CustomBarPayload) => data[`maxOccupancy${relevantWeeks.length - 1 - index}`] as number}
                      openedLanes={(data: CustomBarPayload) => data[`openedLanes${relevantWeeks.length - 1 - index}`] as number}
                      dayLabel={(data: CustomBarPayload) => data[`dayLabel${relevantWeeks.length - 1 - index}`] as string}
                    />
                  }
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
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
        {t('charts:grouped.showingHours', {
          start: visibleHours[0],
          end: visibleHours[visibleHours.length - 1]
        })}
      </div>
    </div>
  );
};

export default GroupedBarChart;