'use client';

import { useState, type ReactNode } from 'react';
import { Clock, BarChart3, User } from 'lucide-react';

interface TabSwitcherProps {
  recentReviews: ReactNode;
  weeklyReport: ReactNode;
  technicianReport: ReactNode;
}

type Tab = 'recent' | 'weekly' | 'technician';

const TABS: { key: Tab; label: string; icon: typeof Clock }[] = [
  { key: 'recent', label: 'Recent', icon: Clock },
  { key: 'weekly', label: 'Weekly Report', icon: BarChart3 },
  { key: 'technician', label: 'By Technician', icon: User },
];

export default function TabSwitcher({ recentReviews, weeklyReport, technicianReport }: TabSwitcherProps) {
  const [activeTab, setActiveTab] = useState<Tab>('recent');

  return (
    <div>
      <div className="flex gap-1 mb-5 bg-gray-100 rounded-lg p-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'recent' && recentReviews}
      {activeTab === 'weekly' && weeklyReport}
      {activeTab === 'technician' && technicianReport}
    </div>
  );
}
