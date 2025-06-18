import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import CurrentOccupancy from '@/components/ui/CurrentOccupancy';
import PoolSelector from '@/components/ui/PoolSelector';
import { usePoolSelector } from '@/contexts/PoolSelectorContext';
import { POOL_TYPES } from '@/utils/types/poolTypes';

const Header: React.FC = () => {
  const { t } = useTranslation(['dashboard']);
  const { selectedPool, selectedPoolType } = usePoolSelector();
  const websiteLink = selectedPoolType === POOL_TYPES.OUTSIDE ? selectedPool.outsidePool?.url : selectedPool.insidePool?.url

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold">
              <a
              href={websiteLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-inherit hover:underline"
              >
              {selectedPool.name} - {t('dashboard:titleSuffix')}
              </a>
            </h1>
          </div>
          <div className="flex items-center gap-8">
            <PoolSelector />
            <CurrentOccupancy />
          </div>
          <div className="flex items-center gap-4">
            <div>
              <a 
                href={websiteLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-100 hover:text-white transition-colors text-sm mt-1 block underline"
              >
                {t('dashboard:website')}
              </a>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;