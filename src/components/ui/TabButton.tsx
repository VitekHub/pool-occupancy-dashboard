import { DivideIcon as LucideIcon } from 'lucide-react';

interface TabButtonProps {
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ icon: Icon, label, isActive, onClick }) => {
  return (
    <button
      className={`flex items-center py-3 px-6 border-b-2 font-medium text-sm ${
        isActive 
          ? 'border-blue-500 text-blue-600' 
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
      onClick={onClick}
    >
      <Icon className="mr-2 h-5 w-5" />
      {label}
    </button>
  );
}

export default TabButton;