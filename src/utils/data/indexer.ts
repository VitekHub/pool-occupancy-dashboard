import { OccupancyRecord, CapacityRecord } from '@/utils/types/poolData';
import { OccupancyPoint, CapacityPoint, TimeSlot } from './types';
import { getWeekId } from '@/utils/date/dateUtils';

/**
 * Fast data indexing utilities for O(1) lookups
 */
export class DataIndexer {
  private occupancyIndex = new Map<string, OccupancyPoint[]>();
  private capacityIndex = new Map<string, CapacityPoint>();
  private weekIndex = new Map<string, Set<string>>(); // weekId -> timeSlot keys
  private dayIndex = new Map<string, Set<string>>(); // day -> timeSlot keys

  constructor(
    occupancyData: OccupancyRecord[],
    capacityData: CapacityRecord[]
  ) {
    this.indexOccupancyData(occupancyData);
    this.indexCapacityData(capacityData);
    this.buildSecondaryIndexes();
  }

  private createTimeSlotKey(day: string, hour: number): string {
    return `${day}-${hour}`;
  }

  private createTimeSlot(day: string, hour: number, date: Date): TimeSlot {
    return { day, hour, date };
  }

  private indexOccupancyData(data: OccupancyRecord[]): void {
    for (const record of data) {
      const timeSlot = this.createTimeSlot(record.day, record.hour, record.date);
      const key = this.createTimeSlotKey(record.day, record.hour);
      
      const point: OccupancyPoint = {
        timeSlot,
        occupancy: record.occupancy,
        time: record.time
      };

      if (!this.occupancyIndex.has(key)) {
        this.occupancyIndex.set(key, []);
      }
      this.occupancyIndex.get(key)!.push(point);
    }
  }

  private indexCapacityData(data: CapacityRecord[]): void {
    for (const record of data) {
      const timeSlot = this.createTimeSlot(record.day, parseInt(record.hour), record.date);
      const key = this.createTimeSlotKey(record.day, parseInt(record.hour));
      
      const point: CapacityPoint = {
        timeSlot,
        maximumCapacity: record.maximumCapacity
      };

      this.capacityIndex.set(key, point);
    }
  }

  private buildSecondaryIndexes(): void {
    // Build week and day indexes for fast filtering
    for (const [key, points] of this.occupancyIndex) {
      const [day] = key.split('-');
      
      // Day index
      if (!this.dayIndex.has(day)) {
        this.dayIndex.set(day, new Set());
      }
      this.dayIndex.get(day)!.add(key);

      // Week index
      for (const point of points) {
        const weekId = getWeekId(point.timeSlot.date);
        if (!this.weekIndex.has(weekId)) {
          this.weekIndex.set(weekId, new Set());
        }
        this.weekIndex.get(weekId)!.add(key);
      }
    }
  }

  // Fast lookup methods
  getOccupancyPoints(day: string, hour: number): OccupancyPoint[] {
    const key = this.createTimeSlotKey(day, hour);
    return this.occupancyIndex.get(key) || [];
  }

  getCapacityPoint(day: string, hour: number): CapacityPoint | null {
    const key = this.createTimeSlotKey(day, hour);
    return this.capacityIndex.get(key) || null;
  }

  getTimeSlotKeysForWeek(weekId: string): Set<string> {
    return this.weekIndex.get(weekId) || new Set();
  }

  getTimeSlotKeysForDay(day: string): Set<string> {
    return this.dayIndex.get(day) || new Set();
  }

  getAllWeekIds(): string[] {
    return Array.from(this.weekIndex.keys());
  }

  getAllDays(): string[] {
    return Array.from(this.dayIndex.keys());
  }

  getAllTimeSlotKeys(): string[] {
    return Array.from(this.occupancyIndex.keys());
  }

  // Get occupancy points filtered by week
  getOccupancyPointsForWeek(day: string, hour: number, weekId: string): OccupancyPoint[] {
    const points = this.getOccupancyPoints(day, hour);
    return points.filter(point => getWeekId(point.timeSlot.date) === weekId);
  }

  // Get the most recent occupancy point (for current occupancy)
  getLatestOccupancyPoint(): OccupancyPoint | null {
    let latest: OccupancyPoint | null = null;
    
    for (const points of this.occupancyIndex.values()) {
      for (const point of points) {
        if (!latest || point.timeSlot.date > latest.timeSlot.date) {
          latest = point;
        }
      }
    }
    
    return latest;
  }
}