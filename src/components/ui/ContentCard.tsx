import { LucideIcon } from 'lucide-react';

interface ContentCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  weekSelector?: React.ReactNode;
  children: React.ReactNode;
}

const ContentCard: React.FC<ContentCardProps> = ({ icon: Icon, title, description, weekSelector, children }) => {
  return (
    <div className="grid mx-auto grid-cols-1 gap-6">
      <div className="bg-white mx-auto p-4 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Icon className="h-6 w-6 text-purple-500 mr-2" />
            <h2 className="text-lg font-medium">{title}</h2>
          </div>
          <div className="flex-1 flex justify-center mx-4">
            {weekSelector}
          </div>
          <div className="w-[200px]"></div>
        </div>
        <p className="text-gray-600 mb-2 break-words max-w-[900px]">{description}</p>
        {children}
      </div>
    </div>
  );
}

export default ContentCard;