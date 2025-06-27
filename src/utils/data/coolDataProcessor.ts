import { 
    CapacityRecord, 
    HourlyOccupancySummaryWithLanes, 
    OccupancyRecord, 
    WeeklyCapacityMap, 
    WeeklyMaxValuesPerDayMap, 
    WeeklyOccupancyMap 
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

   public preProcessAllOccupancyData(): { weeklyOccupancyMap: WeeklyOccupancyMap; weeklyMaxValuesPerDayMap: WeeklyMaxValuesPerDayMap } {
    const weeklyOccupancyMap: WeeklyOccupancyMap = {};
    const weeklyMaxValuesPerDayMap: WeeklyMaxValuesPerDayMap = {};
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
        weeklyMaxValuesPerDayMap[weekId] = {};
      }
      if (!weeklyOccupancyMap[weekId][day]) {
        weeklyOccupancyMap[weekId][day] = {};
        weeklyMaxValuesPerDayMap[weekId][day] = { utilizationRate: 0, maxOccupancy: 0 };
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

      const weeklyMaxValues = weeklyMaxValuesPerDayMap[weekId][day];
      weeklyMaxValues.utilizationRate = Math.max(weeklyMaxValues.utilizationRate, utilizationRate);
      weeklyMaxValues.maxOccupancy = Math.max(weeklyMaxValues.maxOccupancy, maxOccupancy);
    });

    return { weeklyOccupancyMap, weeklyMaxValuesPerDayMap };
  }
}