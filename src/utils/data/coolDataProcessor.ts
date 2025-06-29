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

interface OccupancyAccumulator {
  prevHour: number;
  sum: number;
  count: number;
}

interface OverallOccupancyAccumulator {
  [day: string]: {
    [hour: number]: {
      sum: number;
      count: number;
    };
  };
}

const formatNumber = (value: number) : number => {
  if (value < 1) {
    return Number(value.toFixed(1));
  }
  return Math.round(value);
}

export function processAllOccupancyData(
  capacityData: CapacityRecord[],
  occupancyData: OccupancyRecord[],
  selectedPool: PoolConfig,
  selectedPoolType: PoolType
): { 
  weeklyOccupancyMap: WeeklyOccupancyMap; 
  overallOccupancyMap: OverallOccupancyMap;
} {
  const capacityDataProcessor = new CapacityDataProcessor(
    capacityData,
    selectedPool,
    selectedPoolType
  );
  
  const occupancyDataProcessor = new OccupancyDataProcessor();

  occupancyData.forEach(occupancyRecord => {
    const hourlyMaxCapacity = capacityDataProcessor.getHourlyMaxCapacity(occupancyRecord);
    occupancyDataProcessor.processRecord(occupancyRecord, hourlyMaxCapacity);
  });

  return {
    weeklyOccupancyMap: occupancyDataProcessor.getWeeklyOccupancyMap(),
    overallOccupancyMap: occupancyDataProcessor.getOverallOccupancyMap()
  };
}

class CapacityDataProcessor {
  private weeklyCapacityMap: WeeklyCapacityMap = {};

  constructor(
    private capacityData: CapacityRecord[],
    private selectedPool: PoolConfig,
    private selectedPoolType: PoolType
  ) {
    this.weeklyCapacityMap = this.preProcessAllCapacityData();
  }

  private preProcessAllCapacityData(): WeeklyCapacityMap {
    if (!isInsidePool(this.selectedPoolType)) {
      return {};
    }
    
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

  public getHourlyMaxCapacity(occupancyRecord: OccupancyRecord): number {
    const { date, day, hour } = occupancyRecord;
    const weekId = getWeekId(date);
    const hourlyMaxCapacity = this.weeklyCapacityMap[weekId]?.[day]?.[hour];
    
    return isInsidePool(this.selectedPoolType) 
      ? hourlyMaxCapacity || this.selectedPool.insidePool?.maximumCapacity || 0 
      : this.selectedPool.outsidePool?.maximumCapacity || 0;
  }
}

class OccupancyDataProcessor {
  private weeklyOccupancyMap: WeeklyOccupancyMap = {};
  private overallOccupancyMap: OverallOccupancyMap = {};
  private overallOccupancyAccumulator: OverallOccupancyAccumulator = {};
  private occupancyAccumulator: OccupancyAccumulator = { prevHour: 0, sum: 0, count: 0 };

  private initializeWeeklyOccupancyEntry(
    weekId: string,
    day: string,
    hour: number,
    date: Date
  ): void {
    if (!this.weeklyOccupancyMap[weekId]) {
      this.weeklyOccupancyMap[weekId] = {};
    }
    if (!this.weeklyOccupancyMap[weekId][day]) {
      this.weeklyOccupancyMap[weekId][day] = { maxDayValues: { utilizationRate: 0, maxOccupancy: 0 } };
    }
    if (!this.weeklyOccupancyMap[weekId][day][hour]) {
      this.weeklyOccupancyMap[weekId][day][hour] = {
        date,
        day,
        hour
      } as HourlyOccupancySummaryWithLanes;
    }
  }

  private initializeOverallOccupancyEntry(
    day: string,
    hour: number
  ): void {
    if (!this.overallOccupancyMap[day]) {
      this.overallOccupancyMap[day] = { maxDayValues: { averageUtilizationRate: 0 } };
      this.overallOccupancyAccumulator[day] = {};
    }
    if (!this.overallOccupancyMap[day][hour]) {
      this.overallOccupancyMap[day][hour] = { averageUtilizationRate: 0 };
      this.overallOccupancyAccumulator[day][hour] = { sum: 0, count: 0 };
    }
  }

  private resetAccumulatorIfNeeded(currentHour: number): void {
    if (currentHour !== this.occupancyAccumulator.prevHour) {
      this.occupancyAccumulator.sum = 0;
      this.occupancyAccumulator.count = 0;
      this.occupancyAccumulator.prevHour = currentHour;
    }
  }

  private calculateOccupancyStatistics(
    hourlyOccupancy: number,
    hourlyOccupancySummary: HourlyOccupancySummaryWithLanes,
    hourlyMaxCapacity: number
  ): {
    minOccupancy: number;
    maxOccupancy: number;
    averageOccupancy: number;
    utilizationRate: number;
    remainingCapacity: number;
  } {
    const minOccupancy = Math.min(hourlyOccupancy, hourlyOccupancySummary.minOccupancy || hourlyOccupancy);
    const maxOccupancy = Math.max(hourlyOccupancy, hourlyOccupancySummary.maxOccupancy || hourlyOccupancy);
    
    if (hourlyOccupancy > 0) {
      this.occupancyAccumulator.sum += hourlyOccupancy;
      this.occupancyAccumulator.count += 1;
    }

    const averageOccupancy = formatNumber(this.occupancyAccumulator.count > 0 ? this.occupancyAccumulator.sum / this.occupancyAccumulator.count : 0);
    const utilizationRate = formatNumber((averageOccupancy / hourlyMaxCapacity) * 100);
    const remainingCapacity = hourlyMaxCapacity - averageOccupancy;

    return {
      minOccupancy,
      maxOccupancy,
      averageOccupancy,
      utilizationRate,
      remainingCapacity
    };
  }

  private updateWeeklyMaxDayValues(
    weekId: string,
    day: string,
    utilizationRate: number,
    maxOccupancy: number
  ): void {
    const weeklyMaxDayValues = this.weeklyOccupancyMap[weekId][day].maxDayValues;
    weeklyMaxDayValues.utilizationRate = Math.max(weeklyMaxDayValues.utilizationRate, utilizationRate);
    weeklyMaxDayValues.maxOccupancy = Math.max(weeklyMaxDayValues.maxOccupancy, maxOccupancy);
  }

  private updateOverallMaxDayValues(
    day: string,
    averageUtilizationRate: number
  ): void {
    const overallMaxDayValues = this.overallOccupancyMap[day].maxDayValues;
    overallMaxDayValues.averageUtilizationRate = Math.max(
      overallMaxDayValues.averageUtilizationRate,
      averageUtilizationRate
    );
  }

  private processOverallOccupancy(
    hourlyOccupancy: number,
    hourlyMaxCapacity: number,
    day: string,
    hour: number
  ): void {
    if (hourlyOccupancy > 0 && hourlyMaxCapacity > 0) {
      this.initializeOverallOccupancyEntry(day, hour);

      const recordUtilizationRate = hourlyOccupancy / hourlyMaxCapacity;
      const hourlyOverallOccupancy = this.overallOccupancyMap[day][hour];
      const hourlyOverallAccumulator = this.overallOccupancyAccumulator[day][hour];
      
      hourlyOverallAccumulator.sum += recordUtilizationRate;
      hourlyOverallAccumulator.count += 1;
      hourlyOverallOccupancy.averageUtilizationRate = formatNumber(
        (hourlyOverallAccumulator.sum / hourlyOverallAccumulator.count) * 100
      );

      this.updateOverallMaxDayValues(day, hourlyOverallOccupancy.averageUtilizationRate);
    }
  }

  public processRecord(occupancyRecord: OccupancyRecord, hourlyMaxCapacity: number): void {
    const { date, day, hour, occupancy: hourlyOccupancy } = occupancyRecord;
    const weekId = getWeekId(date);

    this.resetAccumulatorIfNeeded(hour);
    this.initializeWeeklyOccupancyEntry(weekId, day, hour, date);

    const hourlyOccupancySummary = this.weeklyOccupancyMap[weekId][day][hour];
    const occupancyStats = this.calculateOccupancyStatistics(
      hourlyOccupancy,
      hourlyOccupancySummary,
      hourlyMaxCapacity
    );

    this.weeklyOccupancyMap[weekId][day][hour] = {
      ...hourlyOccupancySummary,
      ...occupancyStats,
      maximumCapacity: hourlyMaxCapacity,
    } as HourlyOccupancySummaryWithLanes;

    this.updateWeeklyMaxDayValues(weekId, day, occupancyStats.utilizationRate, occupancyStats.maxOccupancy);
    this.processOverallOccupancy(hourlyOccupancy, hourlyMaxCapacity, day, hour);
  }

  public getWeeklyOccupancyMap(): WeeklyOccupancyMap {
    return this.weeklyOccupancyMap;
  }

  public getOverallOccupancyMap(): OverallOccupancyMap {
    return this.overallOccupancyMap;
  }
}