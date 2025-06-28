import { DataIndexer } from './indexer';
import { TimeSlotStats, WeekStats, OverallStats, TimeSlot } from './types';
import { PoolConfig } from '@/utils/types/poolConfig';
import { PoolType, isInsidePool } from '@/utils/types/poolTypes';
import { DAYS, HOURS } from '@/constants/time';

/**
 * Efficient data aggregation with pre-calculated statistics
 */
export class DataAggregator {
  constructor(
    private indexer: DataIndexer,
    private selectedPool: PoolConfig,
    private selectedPoolType: PoolType
  ) {}

  private formatNumber(value: number): number {
    return value < 1 ? Number(value.toFixed(1)) : Math.round(value);
  }

  private getDefaultCapacity(): number {
    return isInsidePool(this.selectedPoolType) 
      ? this.selectedPool.insidePool?.maximumCapacity || 0
      : this.selectedPool.outsidePool?.maximumCapacity || 0;
  }

  private calculateLanesInfo(capacityPoint: any, day: string, hour: number): TimeSlotStats['lanes'] | undefined {
    if (!isInsidePool(this.selectedPoolType) || !this.selectedPool.insidePool?.totalLanes) {
      return undefined;
    }

    const maxCapacity = this.selectedPool.insidePool.maximumCapacity || 0;
    const totalLanes = this.selectedPool.insidePool.totalLanes;
    const currentCapacity = capacityPoint?.maximumCapacity || maxCapacity;
    
    return {
      current: totalLanes ? Math.round(currentCapacity / (maxCapacity / totalLanes)) : 0,
      total: totalLanes,
      fillRatio: maxCapacity ? currentCapacity / maxCapacity : 0
    };
  }

  // Calculate stats for a specific time slot
  calculateTimeSlotStats(day: string, hour: number, weekId?: string): TimeSlotStats | null {
    const occupancyPoints = weekId 
      ? this.indexer.getOccupancyPointsForWeek(day, hour, weekId)
      : this.indexer.getOccupancyPoints(day, hour);
    
    if (occupancyPoints.length === 0) {
      return null;
    }

    const capacityPoint = this.indexer.getCapacityPoint(day, hour);
    const values = occupancyPoints.map(p => p.occupancy);
    const activeValues = values.filter(v => v > 0);
    
    // Use representative date from first point
    const timeSlot: TimeSlot = {
      day,
      hour,
      date: occupancyPoints[0].timeSlot.date
    };

    if (activeValues.length === 0) {
      const maxCapacity = capacityPoint?.maximumCapacity || this.getDefaultCapacity();
      return {
        timeSlot,
        occupancy: {
          min: 0,
          max: 0,
          average: 0,
          values: [0]
        },
        capacity: {
          maximum: maxCapacity,
          utilization: 0,
          remaining: maxCapacity
        },
        lanes: this.calculateLanesInfo(capacityPoint, day, hour)
      };
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const average = this.formatNumber(activeValues.reduce((sum, v) => sum + v, 0) / activeValues.length);
    const maxCapacity = capacityPoint?.maximumCapacity || this.getDefaultCapacity();
    const utilization = this.formatNumber((average / maxCapacity) * 100);

    return {
      timeSlot,
      occupancy: {
        min,
        max,
        average,
        values
      },
      capacity: {
        maximum: maxCapacity,
        utilization,
        remaining: maxCapacity - average
      },
      lanes: this.calculateLanesInfo(capacityPoint, day, hour)
    };
  }

  // Aggregate data for a specific week
  aggregateWeekStats(weekId: string): WeekStats {
    const timeSlots = new Map<string, TimeSlotStats>();
    const weekTimeSlotKeys = this.indexer.getTimeSlotKeysForWeek(weekId);

    for (const key of weekTimeSlotKeys) {
      const [day, hourStr] = key.split('-');
      const hour = parseInt(hourStr);
      
      const stats = this.calculateTimeSlotStats(day, hour, weekId);
      if (stats) {
        timeSlots.set(key, stats);
      }
    }

    // Get week dates from first time slot
    const firstStats = timeSlots.values().next().value as TimeSlotStats | undefined;
    const startDate = firstStats?.timeSlot.date || new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    return {
      weekId,
      startDate,
      endDate,
      timeSlots
    };
  }

  // Aggregate overall patterns across all weeks
  aggregateOverallStats(): OverallStats {
    const allWeekIds = this.indexer.getAllWeekIds();
    const timeSlots = new Map<string, OverallStats['timeSlots'][string]>();

    // Process each day/hour combination
    for (const day of DAYS) {
      for (const hour of HOURS) {
        const key = `${day}-${hour}`;
        
        // Collect weekly data for this time slot
        const weeklyData = allWeekIds.map(weekId => ({
          weekId,
          stats: this.calculateTimeSlotStats(day, hour, weekId)
        }));

        // Calculate average utilization across weeks (excluding zeros)
        const utilizationRates = weeklyData
          .map(w => w.stats?.capacity.utilization || 0)
          .filter(rate => rate > 0);
        
        const averageUtilization = utilizationRates.length > 0
          ? this.formatNumber(utilizationRates.reduce((sum, rate) => sum + rate, 0) / utilizationRates.length)
          : 0;

        // Use most recent week's data as representative timeSlot
        const recentStats = weeklyData.find(w => w.stats)?.stats;
        const timeSlot: TimeSlot = recentStats?.timeSlot || { day, hour, date: new Date() };

        timeSlots.set(key, {
          timeSlot,
          averageUtilization,
          weeklyData
        });
      }
    }

    return { timeSlots };
  }

  // Get current occupancy (most recent data point)
  getCurrentOccupancy(): { timeSlot: TimeSlot; occupancy: number; capacity: number; utilization: number; time: string } | null {
    const latestPoint = this.indexer.getLatestOccupancyPoint();
    if (!latestPoint) return null;

    const { day, hour } = latestPoint.timeSlot;
    const capacityPoint = this.indexer.getCapacityPoint(day, hour);
    const capacity = capacityPoint?.maximumCapacity || this.getDefaultCapacity();
    const utilization = this.formatNumber((latestPoint.occupancy / capacity) * 100);

    return {
      timeSlot: latestPoint.timeSlot,
      occupancy: latestPoint.occupancy,
      capacity,
      utilization,
      time: latestPoint.time
    };
  }

  // Get all available week IDs sorted (newest first)
  getAvailableWeeks(): Array<{ id: string; startDate: Date; endDate: Date; displayText: string }> {
    const weekIds = this.indexer.getAllWeekIds();
    const today = new Date();
    
    return weekIds
      .map(weekId => {
        const stats = this.aggregateWeekStats(weekId);
        return {
          id: weekId,
          startDate: stats.startDate,
          endDate: stats.endDate,
          displayText: `${stats.startDate.toLocaleDateString()} - ${stats.endDate.toLocaleDateString()}`
        };
      })
      .filter(week => week.startDate <= today)
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  }
}