interface LegendItem {
  color: string;
  label: string;
}

interface HeatmapLegendProps {
  title: string;
  items: LegendItem[];
}

const HeatmapLegend: React.FC<HeatmapLegendProps> = ({ title, items }) => {
  return (
    <div className="mt-6">
      <h3 className="text-sm font-medium text-gray-700 mb-2">{title}</h3>
      <div className="flex items-center space-x-4">
        {items.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className={`w-4 h-4 ${item.color} mr-1`}></div>
            <span className="text-xs">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeatmapLegend;