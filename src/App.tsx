import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ContentCard from '@/components/ui/ContentCard';
import WeekNavigator from '@/components/ui/WeekNavigator';
import Header from '@/components/layout/Header';
import TabNavigation from '@/components/layout/TabNavigation';
import Footer from '@/components/layout/Footer';
import { usePoolData } from '@/utils/hooks/usePoolDataHook';
import { TAB_CONFIG } from '@/constants/tabs';
import type { TabType } from '@/utils/types/tabs';

function App() {
  const { t } = useTranslation(['dashboard', 'common']);
  const [activeTab, setActiveTab] = useState<TabType>(TAB_CONFIG[0].id);
  const [selectedWeekId, setSelectedWeekId] = useState<string>('');
  
  const { availableWeeks, loading, currentOccupancy, capacityData } = usePoolData(selectedWeekId);
  
  // Set initial week when available
  useEffect(() => {
    if (availableWeeks.length > 0 && !selectedWeekId) {
      setSelectedWeekId(availableWeeks[0].id);
    }
  }, [availableWeeks, selectedWeekId]);
  
  const activeConfig = TAB_CONFIG.find(tab => tab.id === activeTab)!;
  const TabComponent = activeConfig.component;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header currentOccupancy={currentOccupancy} capacityData={capacityData} />
      
      <main className="container mx-auto px-4 py-8">
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        
        {/* Content based on active tab */}
        <div className="mt-6">
          <ContentCard
            icon={activeConfig.icon}
            title={t(activeConfig.titleKey)}
            description={t(activeConfig.descriptionKey)}
            weekSelector={
              activeConfig.showWeekSelector && !loading ? (
                <WeekNavigator 
                  weeks={availableWeeks}
                  selectedWeekId={selectedWeekId}
                  onWeekChange={setSelectedWeekId}
                />
              ) : null
            }
          >
            {activeConfig.showWeekSelector ? (
              <TabComponent selectedWeekId={selectedWeekId} />
            ) : (
              <TabComponent />
            )}
          </ContentCard>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;