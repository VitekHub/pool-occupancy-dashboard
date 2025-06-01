import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';
import type { OccupancyRecord, CapacityRecord } from '@/utils/types/poolData';
import { TOTAL_MAX_OCCUPANCY, UTILIZATION_THRESHOLDS } from '@/constants/pool';
import { PROGRESS_COLORS } from '@/constants/colors';

interface CurrentOccupancyProps {
  currentOccupancy: OccupancyRecord | null;
  capacityData: CapacityRecord[] | undefined;
}

const getUtilizationColor = (rate: number): string => {
  if (rate < UTILIZATION_THRESHOLDS.LOW) return PROGRESS_COLORS.LOW;
  if (rate < UTILIZATION_THRESHOLDS.HIGH) return PROGRESS_COLORS.MEDIUM;
  return PROGRESS_COLORS.HIGH;
};

const CurrentOccupancy: React.FC<CurrentOccupancyProps> = ({ currentOccupancy, capacityData }) => {
  const { t } = useTranslation(['common']);

  if (!currentOccupancy || !capacityData?.length) {
    return null;
  }

  // Find the maximum occupancy for the current hour
  const currentMaxOccupancy = capacityData.find(
    record =>
      record.date.getTime() === currentOccupancy.date.getTime() &&
      record.day === currentOccupancy.day &&
      parseInt(record.hour) === currentOccupancy.hour
  )?.maximumOccupancy || TOTAL_MAX_OCCUPANCY;

  // Calculate utilization percentage
  const utilizationRate = Math.round((currentOccupancy.occupancy / currentMaxOccupancy) * 100);
  const utilizationColor = getUtilizationColor(utilizationRate);

  return (
    <div className="flex items-center bg-blue-700 px-4 py-2 rounded-lg">
      <div className="flex items-center gap-4">
        <Users className="w-5 h-5" />
        <div>
          <div className="text-sm opacity-90">{t('currentOccupancy')}</div>
          <div className="flex items-center gap-2">
            <span className="font-bold">
              {currentOccupancy.time} • {currentOccupancy.occupancy}/{currentMaxOccupancy} {t('people')}
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
        </div>
      </div>
    </div>
  );
};

export default CurrentOccupancy;