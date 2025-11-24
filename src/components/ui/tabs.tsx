import React from 'react';

interface TabsProps {
  children: React.ReactNode;
  className?: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ 
  children, 
  className = '', 
  defaultValue,
  value,
  onValueChange 
}) => {
  const [activeTab, setActiveTab] = React.useState(value || defaultValue || '');
  
  const handleTabChange = (newValue: string) => {
    setActiveTab(newValue);
    onValueChange?.(newValue);
  };

  return (
    <div className={`w-full ${className}`}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            activeTab,
            onTabChange: handleTabChange
          } as any);
        }
        return child;
      })}
    </div>
  );
};

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
  activeTab?: string;
  onTabChange?: (value: string) => void;
}

export const TabsList: React.FC<TabsListProps> = ({ 
  children, 
  className = '',
  activeTab,
  onTabChange
}) => {
  return (
    <div className={`flex space-x-1 border-b ${className}`}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            activeTab,
            onTabChange
          } as any);
        }
        return child;
      })}
    </div>
  );
};

interface TabsTriggerProps {
  children: React.ReactNode;
  value: string;
  className?: string;
  activeTab?: string;
  onTabChange?: (value: string) => void;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ 
  children, 
  value,
  className = '',
  activeTab,
  onTabChange
}) => {
  const isActive = activeTab === value;
  
  return (
    <button
      onClick={() => onTabChange?.(value)}
      className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${
        isActive 
          ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700' 
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
      } ${className}`}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  children: React.ReactNode;
  value: string;
  className?: string;
  activeTab?: string;
}

export const TabsContent: React.FC<TabsContentProps> = ({ 
  children, 
  value,
  className = '',
  activeTab
}) => {
  if (activeTab !== value) return null;
  
  return (
    <div className={`mt-4 ${className}`}>
      {children}
    </div>
  );
};