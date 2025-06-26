import { format } from 'date-fns';
import { cs, enUS } from 'date-fns/locale';
import type { ChartDataItem, WeekInfo, HourlyOccupancySummary, CapacityRecord } from '@/utils/types/poolData';
import { PoolConfig } from '@/utils/types/poolConfig';

export const prepareChartDataForHour = (
  day: string,
  hour: number,
  relevantWeeks: WeekInfo[],
  weeklySummaries: Record<string, HourlyOccupancySummary[]>,
  capacityData: CapacityRecord[] | undefined,
  language: string,
  selectedPool: PoolConfig
): ChartDataItem => {
  const dateLocale = language === 'cs' ? cs : enUS;
  const hourData: Partial<ChartDataItem> = {
    hour: `${hour}:00`,
  };

  relevantWeeks.forEach((week, index) => {
    const weekSummary = weeklySummaries[week.id] || [];
    const weekData = weekSummary.find(
      summary => summary.hour === hour && summary.day === day
    );

    // Calculate the specific day's date by adding days based on the day of the week
    const dayIndex = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(day);
    const dayDate = new Date(week.startDate);
    dayDate.setDate(dayDate.getDate() + dayIndex);

    const foundHourlyCapacity = capacityData?.find(
      cap =>
        cap.day === day &&
        parseInt(cap.hour) === hour &&
        cap.date.getTime() === dayDate.getTime()
    );

    const weekLabel = format(dayDate, 'd.M.', { locale: dateLocale });
    const dayLabel = weekLabel;
    const maxCapacity = selectedPool.insidePool?.maximumCapacity || 0;
    const totalLanes = selectedPool.insidePool?.totalLanes || 0;

    hourData[`week${index}`] = weekData?.utilizationRate || 0;
    hourData[`minOccupancy${index}`] = weekData?.minOccupancy || 0;
    hourData[`maxOccupancy${index}`] = weekData?.maxOccupancy || 0;
    hourData[`openedLanes${index}`] = foundHourlyCapacity ?
      Math.round(foundHourlyCapacity.maximumCapacity / (maxCapacity / totalLanes)) :
      0;
    hourData[`dayLabel${index}`] = dayLabel;
  });

  return hourData as ChartDataItem;
};