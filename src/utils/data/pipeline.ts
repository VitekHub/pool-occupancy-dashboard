import { OccupancyRecord, CapacityRecord } from '@/utils/types/poolData';
import { PoolConfig } from '@/utils/types/poolConfig';
import { PoolType } from '@/utils/types/poolTypes';
import { DataIndexer } from './indexer';
import { DataAggregator } from './aggregator';
import { DataFormatter } from './formatter';
import { WeekStats, OverallStats, HeatmapData, ChartData, TableData, CurrentOccupancyData } from './types';

/**
 * Main data transformation pipeline - fast, readable, and composable
 */
export class DataPipeline {
  private indexer: DataIndexer;
  private aggregator: DataAggregator;
  private formatter: DataFormatter;

  // Cache for expensive operations
  private weekStatsCache = new Map<string, WeekStats>();
  private overallStatsCache: OverallStats | null = null;

  constructor(
    occupancyData: OccupancyRecord[],
    capacityData: CapacityRecord[],
    selectedPool: PoolConfig,
    selectedPoolType: PoolType,
    heatmapHighThreshold: number = 60,
    language: string = 'cs'
  ) {
    // Build indexes once
    this.indexer = new DataIndexer(occupancyData, capacityData);
    this.aggregator = new DataAggregator(this.indexer, selectedPool, selectedPoolType);
    this.formatter = new DataFormatter(heatmapHighThreshold, language);
  }

  // Week-specific data
  getWeekStats(weekId: string): WeekStats {
    if (!this.weekStatsCache.has(weekId)) {
      const stats = this.aggregator.aggregateWeekStats(weekId);
      this.weekStatsCache.set(weekId, stats);
    }
    return this.weekStatsCache.get(weekId)!;
  }

  // Overall patterns across all weeks
  getOverallStats(): OverallStats {
    if (!this.overallStatsCache) {
      this.overallStatsCache = this.aggregator.aggregateOverallStats();
    }
    return this.overallStatsCache;
  }

  // Available weeks
  getAvailableWeeks() {
    return this.aggregator.getAvailableWeeks();
  }

  // Current occupancy
  getCurrentOccupancy(): CurrentOccupancyData | null {
    return this.aggregator.getCurrentOccupancy();
  }

  // Formatted data for components
  getHeatmapData(weekId: string, tooltipTemplate: (day: string, hour: number, utilization: number) => string): HeatmapData {
    const weekStats = this.getWeekStats(weekId);
    return this.formatter.formatHeatmapData(weekStats, tooltipTemplate);
  }

  getOverallHeatmapData(tooltipTemplate: (day: string, hour: number, utilization: number) => string): HeatmapData {
    const overallStats = this.getOverallStats();
    return this.formatter.formatOverallHeatmapData(overallStats, tooltipTemplate);
  }

  getChartData(weekId: string, selectedDay: string): ChartData {
    const weekStats = this.getWeekStats(weekId);
    return this.formatter.formatChartData(weekStats, selectedDay);
  }

  getWeekComparisonData(weekIds: string[], selectedDay: string, hours: number[]) {
    const allWeekStats = new Map<string, WeekStats>();
    for (const weekId of weekIds) {
      allWeekStats.set(weekId, this.getWeekStats(weekId));
    }
    return this.formatter.formatWeekComparisonData(allWeekStats, selectedDay, hours);
  }

  getTableData(weekId: string, selectedDay: string): TableData {
    const weekStats = this.getWeekStats(weekId);
    return this.formatter.formatTableData(weekStats, selectedDay);
  }

  // Raw stats access for advanced use cases
  getRawWeekStats(weekId: string): WeekStats {
    return this.getWeekStats(weekId);
  }

  getRawOverallStats(): OverallStats {
    return this.getOverallStats();
  }

  // Cache management
  clearCache(): void {
    this.weekStatsCache.clear();
    this.overallStatsCache = null;
  }

  // Update pipeline settings
  updateSettings(heatmapHighThreshold: number, language: string): void {
    this.formatter = new DataFormatter(heatmapHighThreshold, language);
    // Clear format-dependent cache
    this.clearCache();
  }
}