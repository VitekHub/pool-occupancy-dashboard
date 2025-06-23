import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';
import { usePoolDataContext } from '@/contexts/PoolDataContext';
import { UTILIZATION_THRESHOLDS } from '@/constants/pool';
import { PROGRESS_COLORS } from '@/constants/colors';
import { isInsidePool } from '@/utils/types/poolTypes';
import { usePoolSelector } from '@/contexts/PoolSelectorContext';

const getUtilizationColor = (rate: number) => {
  if (rate < UTILIZATION_THRESHOLDS.LOW) return PROGRESS_COLORS.LOW;
  if (rate < UTILIZATION_THRESHOLDS.MEDIUM) return PROGRESS_COLORS.MEDIUM;
  return PROGRESS_COLORS.HIGH;
};

const CurrentOccupancy: React.FC = () => {
  const { t } = useTranslation(['common']);
  const { currentOccupancy, capacityData } = usePoolDataContext();
  const { selectedPoolType, selectedPool } = usePoolSelector();
  let currentMaxCapacity = 0;
  let utilizationRate = 0;
  let utilizationColor = '';

  if (currentOccupancy) {
    if (isInsidePool(selectedPoolType) && capacityData?.length) {
      // Find the maximum capacity for the current hour
      currentMaxCapacity = capacityData.find(
        record =>
          record.date.getTime() === currentOccupancy.date.getTime() &&
          record.day === currentOccupancy.day &&
          parseInt(record.hour) === currentOccupancy.hour
      )?.maximumCapacity || selectedPool.insidePool?.maximumCapacity || 0;
    } else {
      currentMaxCapacity = selectedPool.outsidePool?.maximumCapacity || 0;
    }
    // Calculate utilization percentage
    utilizationRate = Math.round((currentOccupancy.occupancy / currentMaxCapacity) * 100);
    utilizationColor = getUtilizationColor(utilizationRate);
  }

  return (
    <div className="flex items-center bg-blue-700 px-4 py-2 rounded-lg">
      <div className="flex items-center gap-4">
        <Users className="w-5 h-5" />
        <div>
          <div className="text-sm opacity-90">{t('currentOccupancy')}</div>
          {!currentOccupancy && (
            <span className="text-sm opacity-90">N/A</span>
          )}
          {currentOccupancy && (
            <div className="flex items-center gap-2">
              <span className="font-bold">
                {currentOccupancy.time} • {currentOccupancy.occupancy}/{currentMaxCapacity} {t('people')}
              </span>
              <div className="flex items-center gap-1">
                <div className={`w-16 ${PROGRESS_COLORS.BACKGROUND} rounded-full h-2`}>
                  <div
                    className={`${utilizationColor} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${utilizationRate}%` }}
                  />
                </div>
                <span className="font-bold">{utilizationRate}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CurrentOccupancy;