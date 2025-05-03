import React from 'react';
import { useTranslation } from 'react-i18next';
import TabButton from '@/components/ui/TabButton';
import { TAB_CONFIG } from '@/constants/tabs';
import type { TabType } from '@/utils/types/tabs';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation(['dashboard']);

  return (
    <div className="flex overflow-x-auto border-b border-gray-200 mb-6">
      {TAB_CONFIG.map(tab => (
        <TabButton
          key={tab.id}
          icon={tab.icon}
          label={t(tab.labelKey)}
          isActive={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
        />
      ))}
    </div>
  );
};

export default TabNavigation;