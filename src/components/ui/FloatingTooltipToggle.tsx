import React from 'react';
import { useTranslation } from 'react-i18next';

interface FloatingTooltipToggleProps {
  showTooltips: boolean;
  setShowTooltips: (value: boolean) => void;
}

const FloatingTooltipToggle: React.FC<FloatingTooltipToggleProps> = ({ showTooltips, setShowTooltips }) => {
  const { t } = useTranslation(['heatmaps']);
  return (
    <div className="mb-4 flex items-center">
    <label className="flex items-center cursor-pointer">
        <span className="mr-2 text-sm text-gray-700">{t('heatmaps:todayTomorrow.showTooltips')}</span>
        <div className="relative">
        <input
            type="checkbox"
            checked={showTooltips}
            onChange={(e) => setShowTooltips(e.target.checked)}
            className="sr-only"
        />
        <div className={`block w-11 h-6 rounded-full ${showTooltips ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${showTooltips ? 'transform translate-x-5' : ''}`}></div>
        </div>
    </label>
    </div>
  );
};

export default FloatingTooltipToggle;