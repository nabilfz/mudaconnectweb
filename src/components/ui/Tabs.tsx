import React, { useRef } from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className = '' }) => {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const moveFocus = (index: number) => {
    const nextIndex = (index + tabs.length) % tabs.length;
    const nextTab = tabs[nextIndex];
    onChange(nextTab.id);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label="Pilihan tampilan"
      className={`flex items-center gap-1 border-b border-[#E2E8F0] overflow-x-auto no-scrollbar ${className}`}
    >
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            type="button"
            key={tab.id}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowRight') {
                event.preventDefault();
                moveFocus(index + 1);
              } else if (event.key === 'ArrowLeft') {
                event.preventDefault();
                moveFocus(index - 1);
              } else if (event.key === 'Home') {
                event.preventDefault();
                moveFocus(0);
              } else if (event.key === 'End') {
                event.preventDefault();
                moveFocus(tabs.length - 1);
              }
            }}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              isActive
                ? 'border-[#1D4E89] text-[#1D4E89]'
                : 'border-transparent text-[#64748B] hover:text-[#172033] hover:border-slate-300'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                  isActive ? 'bg-[#1D4E89]/10 text-[#1D4E89]' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
