import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';
import { useDataPipeline } from '@/contexts/DataPipelineContext';
import { UTILIZATION_THRESHOLDS } from '@/constants/pool';
import { PROGRESS_COLORS } from '@/constants/colors';

const getUtilizationColor = (rate: number) => {
  if (rate < UTILIZATION_THRESHOLDS.LOW) return PROGRESS_COLORS.LOW;
  if (rate < UTILIZATION_THRESHOLDS.MEDIUM) return PROGRESS_COLORS.MEDIUM;
  return PROGRESS_COLORS.HIGH;
};

const CurrentOccupancy: React.FC = () => {
  const { t } = useTranslation(['common']);
  const { currentOccupancy } = useDataPipeline();
  
  const utilizationColor = currentOccupancy ? getUtilizationColor(currentOccupancy.utilization) : '';

  return (
    <div className="flex items-center bg-purple-700 px-4 py-2 rounded-lg">
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
                {currentOccupancy.time} • {currentOccupancy.occupancy}/{currentOccupancy.capacity} {t('people')}
              </span>
              <div className="flex items-center gap-1">
                <div className={`w-16 bg-purple-800 rounded-full h-2`}>
                  <div
                    className={`${utilizationColor} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${currentOccupancy.utilization}%` }}
                  />
                </div>
                <span className="font-bold">{currentOccupancy.utilization}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CurrentOccupancy;