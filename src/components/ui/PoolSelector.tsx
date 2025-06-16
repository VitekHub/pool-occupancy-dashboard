import React from 'react';
import { useTranslation } from 'react-i18next';
import { Waves, Building } from 'lucide-react';
import { usePoolSelector } from '@/contexts/PoolSelectorContext';
import { PoolType, POOL_TYPES } from '@/utils/types/poolTypes';

const PoolSelector: React.FC = () => {
  const { t } = useTranslation(['dashboard']);
  const { selectedPool, setSelectedPool } = usePoolSelector();

  const handlePoolChange = (pool: PoolType) => {
    setSelectedPool(pool);
  };

  const getButtonClass = (pool: PoolType) =>
    `flex items-center px-4 py-2 text-sm font-medium transition-colors ${
      selectedPool === pool
        ? 'bg-white text-blue-600'
        : 'text-blue-100 hover:text-white hover:bg-blue-600'
    }`;

  return (
    <div className="flex items-center bg-blue-700 rounded-lg overflow-hidden">
      <button
        onClick={() => handlePoolChange(POOL_TYPES.INSIDE)}
        className={getButtonClass(POOL_TYPES.INSIDE)}
      >
        <Building className="w-4 h-4 mr-2" />
        {t('poolSelector.inside')}
      </button>
      <button
        onClick={() => handlePoolChange(POOL_TYPES.OUTSIDE)}
        className={getButtonClass(POOL_TYPES.OUTSIDE)}
      >
        <Waves className="w-4 h-4 mr-2" />
        {t('poolSelector.outside')}
      </button>
    </div>
  );
};

export default PoolSelector;