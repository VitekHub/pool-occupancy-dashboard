import React from 'react';
import { useTranslation } from 'react-i18next';
import { Waves, Building } from 'lucide-react';
import { usePoolSelector } from '@/contexts/PoolSelectorContext';
import { PoolType, POOL_TYPES } from '@/utils/types/poolTypes';

const PoolSelector: React.FC = () => {
  const { t } = useTranslation(['dashboard']);
  const { selectedPoolType, setSelectedPoolType, selectedPool } = usePoolSelector();
  
  // Determine which pool types are available and have viewStats enabled
  const hasInsidePool = selectedPool?.insidePool?.viewStats === true;
  const hasOutsidePool = selectedPool?.outsidePool?.viewStats === true;

  // If no pool is configured or no pool types are available, don't render
  if (!hasInsidePool && !hasOutsidePool) {
    return null;
  }

  const handlePoolChange = (pool: PoolType) => {
    setSelectedPoolType(pool);
  };

  const getButtonClass = (pool: PoolType) =>
    `flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors sm:w-auto ${
      selectedPoolType === pool
        ? 'bg-white text-blue-600'
        : 'text-blue-100 hover:text-white hover:bg-blue-500'
    }`;

  return (
    <div className="flex flex-col sm:flex-row items-center bg-blue-700 rounded-lg overflow-hidden">
      {hasOutsidePool && (
        <button
          onClick={() => handlePoolChange(POOL_TYPES.OUTSIDE)}
          className={getButtonClass(POOL_TYPES.OUTSIDE)}
        >
          <Waves className="w-4 h-4 mr-2" />
          {t('poolSelector.outside')}
        </button>
      )}
      {hasInsidePool && (
        <button
          onClick={() => handlePoolChange(POOL_TYPES.INSIDE)}
          className={getButtonClass(POOL_TYPES.INSIDE)}
        >
          <Building className="w-4 h-4 mr-2" />
          {t('poolSelector.inside')}
        </button>
      )}
    </div>
  );
};

export default PoolSelector;