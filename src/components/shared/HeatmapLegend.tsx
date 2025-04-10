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
      <h3 className="text-sm font-medium text-gray-700 mb-3">{title}</h3>
      <div className="flex flex-wrap gap-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-center min-w-[40px]">
            <div className={`w-4 h-4 ${item.color} mr-2 flex-shrink-0`}></div>
            <span className="text-xs">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeatmapLegend;