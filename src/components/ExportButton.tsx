'use client';

import { Download } from 'lucide-react';

export default function ExportButton({ weekStart }: { weekStart: string }) {
  const handleExport = () => {
    window.open(`/api/export?week=${weekStart}`, '_blank');
  };

  return (
    <button
      onClick={handleExport}
      className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 font-medium py-2.5 px-4 rounded-lg hover:bg-gray-200 transition-colors"
    >
      <Download className="w-4 h-4" />
      Download Weekly CSV
    </button>
  );
}
