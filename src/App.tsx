import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Activity, Table, Calendar, Users } from 'lucide-react';
import TabButton from '@/components/ui/TabButton';
import ContentCard from '@/components/ui/ContentCard';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import PoolOccupancyChart from '@/components/charts/PoolOccupancyChart';
import PoolOccupancyTable from '@/components/tables/PoolOccupancyTable';
import OccupancyHeatmap from '@/components/heatmaps/OccupancyHeatmap';
import RawHeatmap from '@/components/heatmaps/RawHeatmap';

type TabType = 'chart' | 'table' | 'heatmap' | 'absolute';

const TAB_CONFIG = [
  {
    id: 'heatmap' as TabType,
    icon: Calendar,
    labelKey: 'dashboard:tabs.heatmap',
    component: OccupancyHeatmap,
    titleKey: 'heatmaps:occupancy.title',
    descriptionKey: 'heatmaps:occupancy.description'
  },
  {
    id: 'absolute' as TabType,
    icon: Users,
    labelKey: 'dashboard:tabs.absolute',
    component: RawHeatmap,
    titleKey: 'heatmaps:raw.title',
    descriptionKey: 'heatmaps:raw.description'
  },
  {
    id: 'chart' as TabType,
    icon: BarChart,
    labelKey: 'dashboard:tabs.chart',
    component: PoolOccupancyChart,
    titleKey: 'charts:title',
    descriptionKey: 'charts:description'
  },
  {
    id: 'table' as TabType,
    icon: Table,
    labelKey: 'dashboard:tabs.table',
    component: PoolOccupancyTable,
    titleKey: 'tables:title',
    descriptionKey: 'tables:description'
  }
];

function App() {
  const { t } = useTranslation(['dashboard', 'common']);
  const [activeTab, setActiveTab] = useState<TabType>('heatmap');
  const activeConfig = TAB_CONFIG.find(tab => tab.id === activeTab)!;
  const TabComponent = activeConfig.component;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">{t('dashboard:title')}</h1>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {/* Tab navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          {TAB_CONFIG.map(tab => (
            <TabButton
              key={tab.id}
              icon={tab.icon}
              label={t(tab.labelKey)}
              isActive={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </div>
        
        {/* Content based on active tab */}
        <div className="mt-6">
          <ContentCard
            icon={activeConfig.icon}
            title={t(activeConfig.titleKey)}
            description={t(activeConfig.descriptionKey)}
          >
            <TabComponent />
          </ContentCard>
        </div>
      </main>
      
      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-400">
            {t('common:footer.text')}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;