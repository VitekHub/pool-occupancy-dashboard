import { TimeSlotStats, WeekStats, OverallStats, HeatmapData, ChartData, TableData } from './types';
import { UTILIZATION_COLORS } from '@/constants/colors';
import { UTILIZATION_THRESHOLDS } from '@/constants/pool';
import { DAYS, HOURS, getValidHours } from '@/constants/time';
import { format } from 'date-fns';
import { cs, enUS } from 'date-fns/locale';

/**
 * Format aggregated data for UI components
 */
export class DataFormatter {
  constructor(
    private heatmapHighThreshold: number = 60,
    private language: string = 'cs'
  ) {}

  private adjustHeatmapThreshold(threshold: number): number {
    return Math.round(this.heatmapHighThreshold * (threshold / 100));
  }

  private getColorForUtilization(rate: number): string {
    const veryLowThreshold = this.adjustHeatmapThreshold(UTILIZATION_THRESHOLDS.VERY_LOW);
    const lowThreshold = this.adjustHeatmapThreshold(UTILIZATION_THRESHOLDS.LOW);
    const mediumThreshold = this.adjustHeatmapThreshold(UTILIZATION_THRESHOLDS.MEDIUM);

    if (rate === 0) return UTILIZATION_COLORS.EMPTY;
    if (rate < veryLowThreshold) return UTILIZATION_COLORS.VERY_LOW;
    if (rate < lowThreshold) return UTILIZATION_COLORS.LOW;
    if (rate < mediumThreshold) return UTILIZATION_COLORS.MEDIUM;
    if (rate < this.heatmapHighThreshold) return UTILIZATION_COLORS.HIGH;
    return UTILIZATION_COLORS.VERY_HIGH;
  }

  private getMaxValuesByDay(weekStats: WeekStats): { utilization: Map<string, number>; occupancy: Map<string, number> } {
    const utilizationByDay = new Map<string, number>();
    const occupancyByDay = new Map<string, number>();

    for (const [key, stats] of weekStats.timeSlots) {
      const [day] = key.split('-');
      
      const currentUtilization = utilizationByDay.get(day) || 0;
      const currentOccupancy = occupancyByDay.get(day) || 0;
      
      utilizationByDay.set(day, Math.max(currentUtilization, stats.capacity.utilization));
      occupancyByDay.set(day, Math.max(currentOccupancy, stats.occupancy.max));
    }

    return {
      utilization: utilizationByDay,
      occupancy: occupancyByDay
    };
  }

  // Format data for heatmap components
  formatHeatmapData(weekStats: WeekStats, tooltipTemplate: (day: string, hour: number, utilization: number) => string): HeatmapData {
    const maxValues = this.getMaxValuesByDay(weekStats);

    return {
      getCellData: (day: string, hour: number) => {
        const key = `${day}-${hour}`;
        const stats = weekStats.timeSlots.get(key);
        
        if (!stats) {
          return {
            utilization: 0,
            occupancy: { min: 0, max: 0, average: 0 },
            capacity: 0,
            color: UTILIZATION_COLORS.EMPTY,
            fillRatio: 0,
            tooltip: ''
          };
        }

        const maxDayUtilization = maxValues.utilization.get(day) || 0;
        const fillRatio = maxDayUtilization > 0 ? stats.capacity.utilization / maxDayUtilization : 0;

        return {
          utilization: stats.capacity.utilization,
          occupancy: stats.occupancy,
          capacity: stats.capacity.maximum,
          color: this.getColorForUtilization(stats.capacity.utilization),
          fillRatio,
          tooltip: tooltipTemplate(day, hour, stats.capacity.utilization)
        };
      },
      maxUtilizationByDay: maxValues.utilization,
      maxOccupancyByDay: maxValues.occupancy
    };
  }

  // Format data for overall/average heatmaps
  formatOverallHeatmapData(overallStats: OverallStats, tooltipTemplate: (day: string, hour: number, utilization: number) => string): HeatmapData {
    // Calculate max utilization by day for overall stats
    const maxUtilizationByDay = new Map<string, number>();
    const maxOccupancyByDay = new Map<string, number>();

    for (const [key, data] of overallStats.timeSlots) {
      const [day] = key.split('-');
      const currentMax = maxUtilizationByDay.get(day) || 0;
      maxUtilizationByDay.set(day, Math.max(currentMax, data.averageUtilization));
      
      // For occupancy, use the most recent week's data
      const recentStats = data.weeklyData.find(w => w.stats)?.stats;
      if (recentStats) {
        const currentOccupancyMax = maxOccupancyByDay.get(day) || 0;
        maxOccupancyByDay.set(day, Math.max(currentOccupancyMax, recentStats.occupancy.max));
      }
    }

    return {
      getCellData: (day: string, hour: number) => {
        const key = `${day}-${hour}`;
        const data = overallStats.timeSlots.get(key);
        
        if (!data || data.averageUtilization === 0) {
          return {
            utilization: 0,
            occupancy: { min: 0, max: 0, average: 0 },
            capacity: 0,
            color: UTILIZATION_COLORS.EMPTY,
            fillRatio: 0,
            tooltip: ''
          };
        }

        const maxDayUtilization = maxUtilizationByDay.get(day) || 0;
        const fillRatio = maxDayUtilization > 0 ? data.averageUtilization / maxDayUtilization : 0;
        
        // Get occupancy from most recent week's data
        const recentStats = data.weeklyData.find(w => w.stats)?.stats;
        const occupancy = recentStats?.occupancy || { min: 0, max: 0, average: 0 };
        const capacity = recentStats?.capacity.maximum || 0;

        return {
          utilization: data.averageUtilization,
          occupancy,
          capacity,
          color: this.getColorForUtilization(data.averageUtilization),
          fillRatio,
          tooltip: tooltipTemplate(day, hour, data.averageUtilization)
        };
      },
      maxUtilizationByDay,
      maxOccupancyByDay
    };
  }

  // Format data for chart components
  formatChartData(weekStats: WeekStats, selectedDay: string): ChartData {
    const validHours = getValidHours(selectedDay);
    
    const hourlyData = validHours.map(hour => {
      const key = `${selectedDay}-${hour}`;
      const stats = weekStats.timeSlots.get(key);
      
      return {
        hour: `${hour}:00`,
        average: stats?.occupancy.average || 0,
        maximum: stats?.capacity.maximum || 0,
        utilization: stats?.capacity.utilization || 0,
        remaining: stats?.capacity.remaining || 0
      };
    });

    return {
      hourlyData,
      weekComparison: [] // Will be implemented when needed for week comparison
    };
  }

  // Format data for week comparison charts
  formatWeekComparisonData(
    allWeekStats: Map<string, WeekStats>, 
    selectedDay: string, 
    hours: number[]
  ): Array<{
    hour: string;
    weeks: Array<{
      weekLabel: string;
      utilization: number;
      occupancy: { min: number; max: number };
      lanes?: number;
    }>;
  }> {
    const dateLocale = this.language === 'cs' ? cs : enUS;
    
    return hours.map(hour => {
      const weeks = Array.from(allWeekStats.entries()).map(([weekId, weekStats]) => {
        const key = `${selectedDay}-${hour}`;
        const stats = weekStats.timeSlots.get(key);
        
        // Create week label from start date
        const weekLabel = format(weekStats.startDate, 'd.M.', { locale: dateLocale });
        
        return {
          weekLabel,
          utilization: stats?.capacity.utilization || 0,
          occupancy: {
            min: stats?.occupancy.min || 0,
            max: stats?.occupancy.max || 0
          },
          lanes: stats?.lanes?.current
        };
      });

      return {
        hour: `${hour}:00`,
        weeks
      };
    });
  }

  // Format data for table components
  formatTableData(weekStats: WeekStats, selectedDay: string): TableData {
    const validHours = getValidHours(selectedDay);
    
    const rows = validHours
      .map(hour => {
        const key = `${selectedDay}-${hour}`;
        const stats = weekStats.timeSlots.get(key);
        
        return {
          hour: `${hour}:00`,
          averageOccupancy: stats?.occupancy.average || 0,
          maximumCapacity: stats?.capacity.maximum || 0,
          utilizationRate: stats?.capacity.utilization || 0,
          remainingCapacity: stats?.capacity.remaining || 0
        };
      })
      .filter(row => row.averageOccupancy > 0 || row.maximumCapacity > 0); // Only show rows with data

    return { rows };
  }
}