import { usePoolSelector } from '@/contexts/PoolSelectorContext';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface LegendItem {
  color: string;
  label: string;
}

interface HeatmapLegendProps {
  title: string;
  items: LegendItem[];
}

const HeatmapLegend: React.FC<HeatmapLegendProps> = ({ title, items }) => {
  const { t } = useTranslation(['heatmaps']);
    const { heatmapHighThreshold, setHeatmapHighThreshold } = usePoolSelector();

  const explanations = [
    `🎨 ${t('heatmaps:common.legend.colorExplanation')}`,
    `📏 ${t('heatmaps:common.legend.heightExplanation')}`
  ];
  return (
    <div className="mt-6">
      <h3 className="text-sm font-medium text-gray-700 mb-3">{title}</h3>
      <div className="flex flex-wrap gap-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-center min-w-[55px]">
            <div className={`w-4 h-4 ${item.color} mr-2 flex-shrink-0`}></div>
            <span className="text-xs">{item.label}</span>
          </div>
        ))}
        <div className="flex items-center min-w-[40px]">
          <input
            type="range"
            min="10"
            max="90"
            value={heatmapHighThreshold}
            onChange={e => setHeatmapHighThreshold(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs ml-2">{ heatmapHighThreshold }</span>
        </div>
      </div>
      
      {/* Color and height explanations */}
      <div className="mt-4 space-y-3">
        {explanations.map((explanation, index) => (
          <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong className="font-medium">{explanation}</strong>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeatmapLegend;