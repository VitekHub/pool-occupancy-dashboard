import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useDataPipeline } from '@/contexts/DataPipelineContext';
import DaySelector from '@/components/ui/DaySelector';

const PoolOccupancyChart: React.FC = () => {
  const { t } = useTranslation(['charts', 'common']);
  const { pipeline, loading, error, selectedWeekId } = useDataPipeline();
  const [selectedDay, setSelectedDay] = useState<string>('Monday');

  if (loading) {
    return <div className="flex justify-center items-center h-64">{t('common:loading')}</div>;
  }

  if (error?.message) {
    return <div className="text-red-500">{t('common:error', { message: error.message })}</div>;
  }

  const chartData = pipeline?.getChartData(selectedWeekId, selectedDay);
  const hourlyData = chartData?.hourlyData || [];

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      
      {/* Day selector */}
      <DaySelector
        selectedDay={selectedDay}
        onChange={setSelectedDay}
      />
      
      {/* Chart */}
      <div className="mt-8 h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={hourlyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="hour" 
              label={{ value: t('charts:axis.hour'), position: 'bottom', offset: -8 }}
            />
            <YAxis 
              label={{ value: t('charts:axis.occupancy'), angle: -90, position: 'insideLeft' }}
            />
            <Tooltip />
            <Legend />
            <Bar dataKey="maximum" name={t('charts:legend.maximum')} fill="#9CA3AF" />
            <Bar dataKey="average" name={t('charts:legend.average')} fill="#9333EA" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Summary statistics */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {hourlyData.map((item, index) => (
          <div key={index} className="p-4 border rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg">{item.hour}</h3>
            <div className="mt-2 space-y-1">
              <p className="text-sm">{t('charts:stats.averageOccupancy')}: <span className="font-medium">{item.average}</span></p>
              <p className="text-sm">{t('charts:stats.maximumCapacity')}: <span className="font-medium">{item.maximum}</span></p>
              <p className="text-sm">{t('charts:stats.utilizationRate')}: <span className="font-medium">{item.utilization}%</span></p>
              <p className="text-sm">{t('charts:stats.availableSpots')}: <span className="font-medium">{item.remaining}</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PoolOccupancyChart;