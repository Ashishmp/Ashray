import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="tabs-header" role="tablist">
      {tabs.map(tab => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              style={{
                marginLeft: '8px',
                padding: '1px 6px',
                borderRadius: '9999px',
                fontSize: '11px',
                backgroundColor: activeTab === tab.id ? 'var(--primary-100)' : 'var(--slate-100)',
                color: activeTab === tab.id ? 'var(--primary-700)' : 'var(--slate-600)'
              }}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};
