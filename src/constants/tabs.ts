import { BarChart, Table, Calendar, Users, TrendingUp, Clock } from 'lucide-react';
import type { TabConfig } from '@/utils/types/tabs';
import TodayTomorrowHeatmap from '@/components/heatmaps/TodayTomorrowHeatmap';
import OverallOccupancyHeatmap from '@/components/heatmaps/OverallOccupancyHeatmap';
import OccupancyHeatmap from '@/components/heatmaps/OccupancyHeatmap';
import RawHeatmap from '@/components/heatmaps/RawHeatmap';
import PoolOccupancyChart from '@/components/charts/PoolOccupancyChart';
import GroupedBarChart from '@/components/charts/GroupedBarChart';
import PoolOccupancyTable from '@/components/tables/PoolOccupancyTable';

export const TAB_CONFIG: TabConfig[] = [
  {
    id: 'todayTomorrow',
    icon: Clock,
    labelKey: 'dashboard:tabs.todayTomorrow',
    component: TodayTomorrowHeatmap,
    titleKey: 'heatmaps:todayTomorrow.title',
    descriptionKey: 'heatmaps:todayTomorrow.description',
    showWeekSelector: false
  },
  {
    id: 'grouped',
    icon: BarChart,
    labelKey: 'dashboard:tabs.grouped',
    component: GroupedBarChart,
    titleKey: 'charts:groupedTitle',
    descriptionKey: 'charts:groupedDescription',
    showWeekSelector: true
  },
  {
    id: 'overall',
    icon: TrendingUp,
    labelKey: 'dashboard:tabs.overall',
    component: OverallOccupancyHeatmap,
    titleKey: 'heatmaps:overall.title',
    descriptionKey: 'heatmaps:overall.description',
    showWeekSelector: false
  },
  {
    id: 'heatmap',
    icon: Calendar,
    labelKey: 'dashboard:tabs.heatmap',
    component: OccupancyHeatmap,
    titleKey: 'heatmaps:occupancy.title',
    descriptionKey: 'heatmaps:occupancy.description',
    showWeekSelector: true
  },
  {
    id: 'absolute',
    icon: Users,
    labelKey: 'dashboard:tabs.absolute',
    component: RawHeatmap,
    titleKey: 'heatmaps:raw.title',
    descriptionKey: 'heatmaps:raw.description',
    showWeekSelector: true
  },
  {
    id: 'chart',
    icon: BarChart,
    labelKey: 'dashboard:tabs.chart',
    component: PoolOccupancyChart,
    titleKey: 'charts:title',
    descriptionKey: 'charts:description',
    showWeekSelector: true
  },
  {
    id: 'table',
    icon: Table,
    labelKey: 'dashboard:tabs.table',
    component: PoolOccupancyTable,
    titleKey: 'tables:title',
    descriptionKey: 'tables:description',
    showWeekSelector: true
  }
];