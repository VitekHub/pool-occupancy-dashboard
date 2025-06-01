import { DivideIcon as LucideIcon } from 'lucide-react';

export type TabType = 'chart' | 'table' | 'heatmap' | 'absolute' | 'overall' | 'todayTomorrow' | 'grouped';

export interface TabConfig {
  id: TabType;
  icon: LucideIcon;
  labelKey: string;
  component: React.ComponentType<{ selectedWeekId?: string }>;
  titleKey: string;
  descriptionKey: string;
  showWeekSelector: boolean;
}