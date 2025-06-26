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
  const websiteLink = selectedPoolType === POOL_TYPES.OUTSIDE ? selectedPool.outsidePool?.url : selectedPool.insidePool?.url;
  const temporarilyClosed = selectedPoolType === POOL_TYPES.OUTSIDE ? selectedPool.outsidePool?.temporarilyClosed : selectedPool.insidePool?.temporarilyClosed; 

  const isTemporarilyClosed = () => {
    if (!temporarilyClosed) return false;
    const [startDate, endDate] = temporarilyClosed.split(' - ').map(date => new Date(date.split('.').reverse().join('-')));
    const today = new Date();
    const twoWeeksBeforeStart = new Date(startDate);
    twoWeeksBeforeStart.setDate(startDate.getDate() - 14);
    return today >= twoWeeksBeforeStart && today <= endDate;
  }

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="mb-4 ml-2 md:mb-0">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {selectedPool.icon && <selectedPool.icon className="w-6 h-6 flex-shrink-0" />}
              <a
                href={websiteLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-inherit hover:underline"
              >
                {selectedPool.name} - {t('dashboard:titleSuffix')}
              </a>
            </h1>
            {isTemporarilyClosed() && (
                <span className="ml-2 font-bold text-yellow-400">
                {t('dashboard:temporarilyClosed', { date: temporarilyClosed })}
                </span>
            )}
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