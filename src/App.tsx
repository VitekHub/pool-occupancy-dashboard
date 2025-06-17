import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePoolDataContext } from '@/contexts/PoolDataContext';
import { usePoolSelector } from '@/contexts/PoolSelectorContext';
import { isInsidePool } from '@/utils/types/poolTypes';
import ContentCard from '@/components/ui/ContentCard';
import WeekNavigator from '@/components/ui/WeekNavigator';
import Header from '@/components/layout/Header';
import LeftSidebar from '@/components/layout/LeftSidebar';
import TabNavigation from '@/components/layout/TabNavigation';
import Footer from '@/components/layout/Footer';
import { TAB_CONFIG } from '@/constants/tabs';
import type { TabType } from '@/utils/types/tabs';

function App() {
  const { t } = useTranslation(['dashboard', 'common']);
  const [activeTab, setActiveTab] = useState<TabType>(TAB_CONFIG[0].id);
  const { loading } = usePoolDataContext();
  const { selectedPoolType } = usePoolSelector();
  
  const activeConfig = TAB_CONFIG.find(tab => tab.id === activeTab)!;
  const TabComponent = activeConfig.component;
  
  // Get pool-specific description
  const poolType = isInsidePool(selectedPoolType) ? 'inside' : 'outside';
  const descriptionKey = `${activeConfig.descriptionKey}.${poolType}`;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <LeftSidebar />
      <div className="flex-1 ml-16">
        <Header />
      
        <main className="container mx-auto px-4 py-8">
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        
          {/* Content based on active tab */}
          <div className="mt-6">
            <ContentCard
              icon={activeConfig.icon}
              title={t(activeConfig.titleKey)}
              description={t(descriptionKey)}
              weekSelector={
                activeConfig.showWeekSelector && !loading ? (
                  <WeekNavigator />
                ) : null
              }
            >
              {activeConfig.showWeekSelector ? (
                <TabComponent />
              ) : (
                <TabComponent />
              )}
            </ContentCard>
          </div>
        </main>
      
        <Footer />
      </div>
    </div>
  );
};

export default App;