import React, { useState } from 'react';
import { cn } from '../../utils/cn';

const TabsContext = React.createContext();

export const Tabs = ({ children, defaultValue, className }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn("w-full", className)}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ children, className }) => {
  return (
    <div className={cn("flex w-full items-center justify-start border-b border-border mb-4 overflow-x-auto hide-scrollbar", className)} role="tablist">
      {children}
    </div>
  );
};

export const TabsTrigger = ({ value, children, className }) => {
  const { activeTab, setActiveTab } = React.useContext(TabsContext);
  const isActive = activeTab === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => setActiveTab(value)}
      className={cn(
        "px-4 py-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap",
        isActive
          ? "border-primary-500 text-primary-600"
          : "border-transparent text-text-secondary hover:text-text-primary hover:border-border",
        className
      )}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, children, className }) => {
  const { activeTab } = React.useContext(TabsContext);

  if (activeTab !== value) return null;

  return (
    <div role="tabpanel" className={cn("py-2 focus:outline-none", className)} tabIndex={0}>
      {children}
    </div>
  );
};
