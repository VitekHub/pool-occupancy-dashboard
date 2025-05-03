import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';
import type { OccupancyRecord, CapacityRecord } from '@/utils/types/poolData';

interface CurrentOccupancyProps {
  currentOccupancy: OccupancyRecord | null;
  capacityData: CapacityRecord[];
}

const getUtilizationColor = (rate: number): string => {
  if (rate < 33) return 'bg-green-500';
  if (rate < 52) return 'bg-yellow-500';
  return 'bg-red-500';
};

const CurrentOccupancy: React.FC<CurrentOccupancyProps> = ({ currentOccupancy, capacityData }) => {
  const { t } = useTranslation(['common']);

  if (!currentOccupancy) {
    return null;
  }

  // Find the maximum occupancy for the current hour
  const currentMaxOccupancy = capacityData.find(
    record => 
      record.date.getTime() === currentOccupancy.date.getTime() &&
      record.day === currentOccupancy.day && 
      parseInt(record.hour) === currentOccupancy.hour
  )?.maximumOccupancy || 135; // Default to 135 if not found

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
              <div className="w-16 bg-blue-800 rounded-full h-2">
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