import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';
import { OccupancyRecord, CapacityRecord } from '@/utils/processData';

interface CurrentOccupancyProps {
  currentOccupancy: OccupancyRecord | null;
  capacityData: CapacityRecord[];
}

const CurrentOccupancy: React.FC<CurrentOccupancyProps> = ({ currentOccupancy, capacityData }) => {
  const { t } = useTranslation(['common']);

  if (!currentOccupancy) {
    return null;
  }

  // Find the maximum occupancy for the current hour
  const currentMaxOccupancy = capacityData.find(
    record => 
      record.day === currentOccupancy.day && 
      parseInt(record.hour) === currentOccupancy.hour
  )?.maximumOccupancy || 135; // Default to 135 if not found

  // Calculate utilization percentage
  const utilizationRate = Math.round((currentOccupancy.occupancy / currentMaxOccupancy) * 100);

  return (
    <div className="flex items-center bg-blue-700 px-4 py-2 rounded-lg">
      <Users className="w-5 h-5 mr-2" />
      <div>
        <div className="text-sm opacity-90">{t('currentOccupancy')}</div>
        <div className="font-bold">
          {currentOccupancy.time} • {currentOccupancy.occupancy}/{currentMaxOccupancy} {t('people')} • {utilizationRate}%
        </div>
      </div>
    </div>
  );
};

export default CurrentOccupancy;