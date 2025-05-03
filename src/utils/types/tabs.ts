import { DivideIcon as LucideIcon } from 'lucide-react';

export type TabType = 'chart' | 'table' | 'heatmap' | 'absolute' | 'overall' | 'todayTomorrow';

export interface TabConfig {
  id: TabType;
  icon: LucideIcon;
  labelKey: string;
  component: React.ComponentType<any>;
  titleKey: string;
  descriptionKey: string;
  showWeekSelector: boolean;
}