import { 
    CapacityRecord, 
    HourlyOccupancySummaryWithLanes, 
    OccupancyRecord, 
    WeeklyCapacityMap, 
    WeeklyOccupancyMap,
    OverallOccupancyMap
} from '@/utils/types/poolData';
import { getWeekId } from '@/utils/date/dateUtils';
import { PoolConfig } from '@/utils/types/poolConfig';
import { isInsidePool, PoolType } from '@/utils/types/poolTypes';

export default class CoolDataProcessor {
  constructor(
    private capacityData: CapacityRecord[],
    private occupancyData: OccupancyRecord[],
    private selectedPool: PoolConfig,
    private selectedPoolType: PoolType
  ) {}

  private formatNumber(value: number) : number {
    if (value < 1) {
      return Number(value.toFixed(1));
    }
    return Math.round(value);
  }

  private getMaxCapacityByPoolType(hourlyMaxCapacity: number | undefined): number {
    return isInsidePool(this.selectedPoolType) 
      ? hourlyMaxCapacity || this.selectedPool.insidePool?.maximumCapacity || 0 
      : this.selectedPool.outsidePool?.maximumCapacity || 0;
  }

  private preProcessAllCapacityData(): WeeklyCapacityMap {
    const weeklyCapacityMap: WeeklyCapacityMap = {};
    this.capacityData.forEach(record => {
      const weekId = getWeekId(record.date);
      if (!weeklyCapacityMap[weekId]) {
        weeklyCapacityMap[weekId] = {};
      }
      if (!weeklyCapacityMap[weekId][record.day]) {
        weeklyCapacityMap[weekId][record.day] = {};
      }
      weeklyCapacityMap[weekId][record.day][parseInt(record.hour)] = record.maximumCapacity;
    });
    return weeklyCapacityMap;
  }

  public preProcessAllOccupancyData(): { 
    weeklyOccupancyMap: WeeklyOccupancyMap; 
    overallOccupancyMap: OverallOccupancyMap;
  } {
    const weeklyOccupancyMap: WeeklyOccupancyMap = {};
    const overallMap: Record<string, Record<number, { sum: number; count: number }>> = {};
    let weeklyCapacityMap: WeeklyCapacityMap = {};

    if (isInsidePool(this.selectedPoolType)) {
      weeklyCapacityMap = this.preProcessAllCapacityData();
    }

    this.occupancyData.forEach(occupancyRecord => {
      const { date, day, hour, occupancy } = occupancyRecord;
      const weekId = getWeekId(date);
      const maximumCapacity = this.getMaxCapacityByPoolType(weeklyCapacityMap[weekId]?.[day]?.[hour]) || 0;
      if (!weeklyOccupancyMap[weekId]) {
        weeklyOccupancyMap[weekId] = {};
      }
      if (!weeklyOccupancyMap[weekId][day]) {
        weeklyOccupancyMap[weekId][day] = { maxDayValues: { utilizationRate: 0, maxOccupancy: 0 } };
      }
      if (!weeklyOccupancyMap[weekId][day][hour]) {
        weeklyOccupancyMap[weekId][day][hour] = {
          date,
          day,
          hour
        } as HourlyOccupancySummaryWithLanes;
      }

      const hourlyOccupancySummary = weeklyOccupancyMap[weekId][day][hour];
      const minOccupancy = Math.min(occupancy, hourlyOccupancySummary.minOccupancy || occupancy);
      const maxOccupancy = Math.max(occupancy, hourlyOccupancySummary.maxOccupancy || occupancy);
      const averageOccupancy = this.formatNumber((minOccupancy + maxOccupancy) / 2);
      const utilizationRate = this.formatNumber((averageOccupancy / maximumCapacity) * 100);
      const remainingCapacity = maximumCapacity - averageOccupancy;

      weeklyOccupancyMap[weekId][day][hour] = {
        ...hourlyOccupancySummary,
        minOccupancy,
        maxOccupancy,
        averageOccupancy,
        maximumCapacity,
        utilizationRate,
        remainingCapacity,
      } as HourlyOccupancySummaryWithLanes;

      const weeklyMaxDayValues = weeklyOccupancyMap[weekId][day].maxDayValues;
      weeklyMaxDayValues.utilizationRate = Math.max(weeklyMaxDayValues.utilizationRate, utilizationRate);
      weeklyMaxDayValues.maxOccupancy = Math.max(weeklyMaxDayValues.maxOccupancy, maxOccupancy);

      if (utilizationRate > 0) {
        if (!overallMap[day]) {
          overallMap[day] = {};
        }
        if (!overallMap[day][hour]) {
          overallMap[day][hour] = { sum: 0, count: 0 };
        }
        overallMap[day][hour].sum += utilizationRate;
        overallMap[day][hour].count += 1;
      }
    });

    const overallOccupancyMap: OverallOccupancyMap = {};
    for (const day in overallMap) {
      overallOccupancyMap[day] = { maxDayValues: { averageUtilizationRate: 0 } };
      for (const hour in overallMap[day]) {
        const { sum, count } = overallMap[day][hour];
        const averageUtilizationRate = this.formatNumber(count > 0 ? sum / count : 0);
        overallOccupancyMap[day][hour] = {
          averageUtilizationRate
        };
        const overallMaxDayValues = overallOccupancyMap[day].maxDayValues;
        overallMaxDayValues.averageUtilizationRate = Math.max(overallMaxDayValues.averageUtilizationRate, averageUtilizationRate);
      }
      
    }

    return { weeklyOccupancyMap, overallOccupancyMap };
  }
}